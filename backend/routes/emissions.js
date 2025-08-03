const express = require('express');
const { body, validationResult, query } = require('express-validator');

const Emissions = require('../models/Emissions');
const { errorHelpers } = require('../shared');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateEmissionData = [
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('energyData.electricity.grid').optional().isFloat({ min: 0 }).withMessage('Grid electricity must be a non-negative number'),
  body('energyData.electricity.renewable').optional().isFloat({ min: 0 }).withMessage('Renewable electricity must be a non-negative number'),
  body('energyData.fuel.diesel').optional().isFloat({ min: 0 }).withMessage('Diesel consumption must be a non-negative number'),
  body('energyData.fuel.petrol').optional().isFloat({ min: 0 }).withMessage('Petrol consumption must be a non-negative number'),
  body('energyData.fuel.naturalGas').optional().isFloat({ min: 0 }).withMessage('Natural gas consumption must be a non-negative number'),
  body('energyData.fuel.lpg').optional().isFloat({ min: 0 }).withMessage('LPG consumption must be a non-negative number'),
  body('wasteData.recyclable').optional().isFloat({ min: 0 }).withMessage('Recyclable waste must be a non-negative number'),
  body('wasteData.hazardous').optional().isFloat({ min: 0 }).withMessage('Hazardous waste must be a non-negative number'),
  body('wasteData.landfill').optional().isFloat({ min: 0 }).withMessage('Landfill waste must be a non-negative number'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/emissions - Get user's emissions with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get emissions with pagination
    const emissions = await Emissions.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Emissions.countDocuments(query);

    // Get summary statistics
    const summary = await Emissions.getUserSummary(userId);

    res.json({
      emissions: emissions.map(emission => ({
        id: emission._id,
        date: emission.date,
        energyData: emission.energyData,
        wasteData: emission.wasteData,
        calculatedEmissions: emission.calculatedEmissions,
        notes: emission.notes,
        isVerified: emission.isVerified,
        createdAt: emission.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      summary,
    });
  } catch (error) {
    console.error('Get emissions error:', error);
    res.status(500).json(errorHelpers.createError('Failed to fetch emissions'));
  }
});

// POST /api/emissions - Create new emission record
router.post('/', validateEmissionData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const userId = req.user.userId;
    const { date, energyData, wasteData, notes } = req.body;

    // Check if emission record already exists for this date
    const existingEmission = await Emissions.findOne({
      userId,
      date: new Date(date || Date.now()),
    });

    if (existingEmission) {
      return res.status(400).json({
        error: {
          message: 'Emission record already exists for this date',
          statusCode: 400,
          code: 'DUPLICATE_ERROR',
          field: 'date',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Create new emission record
    const emission = new Emissions({
      userId,
      date: date ? new Date(date) : new Date(),
      energyData: energyData || {
        electricity: { grid: 0, renewable: 0 },
        fuel: { diesel: 0, petrol: 0, naturalGas: 0, lpg: 0 },
      },
      wasteData: wasteData || {
        recyclable: 0,
        hazardous: 0,
        landfill: 0,
      },
      notes,
    });

    await emission.save();

    res.status(201).json({
      message: 'Emission record created successfully',
      emission: {
        id: emission._id,
        date: emission.date,
        energyData: emission.energyData,
        wasteData: emission.wasteData,
        calculatedEmissions: emission.calculatedEmissions,
        notes: emission.notes,
        isVerified: emission.isVerified,
        createdAt: emission.createdAt,
      },
    });
  } catch (error) {
    console.error('Create emission error:', error);
    res.status(500).json(errorHelpers.createError('Failed to create emission record'));
  }
});

// PUT /api/emissions/:id - Update emission record
router.put('/:id', validateEmissionData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { date, energyData, wasteData, notes } = req.body;

    // Find emission record
    const emission = await Emissions.findOne({ _id: id, userId });
    if (!emission) {
      return res.status(404).json(errorHelpers.notFoundError('Emission record'));
    }

    // Update emission record
    if (date) emission.date = new Date(date);
    if (energyData) emission.energyData = energyData;
    if (wasteData) emission.wasteData = wasteData;
    if (notes !== undefined) emission.notes = notes;

    await emission.save();

    res.json({
      message: 'Emission record updated successfully',
      emission: {
        id: emission._id,
        date: emission.date,
        energyData: emission.energyData,
        wasteData: emission.wasteData,
        calculatedEmissions: emission.calculatedEmissions,
        notes: emission.notes,
        isVerified: emission.isVerified,
        updatedAt: emission.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update emission error:', error);
    res.status(500).json(errorHelpers.createError('Failed to update emission record'));
  }
});

// DELETE /api/emissions/:id - Delete emission record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find and delete emission record
    const emission = await Emissions.findOneAndDelete({ _id: id, userId });
    if (!emission) {
      return res.status(404).json(errorHelpers.notFoundError('Emission record'));
    }

    res.json({
      message: 'Emission record deleted successfully',
    });
  } catch (error) {
    console.error('Delete emission error:', error);
    res.status(500).json(errorHelpers.createError('Failed to delete emission record'));
  }
});

// GET /api/emissions/:id - Get specific emission record
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find emission record
    const emission = await Emissions.findOne({ _id: id, userId });
    if (!emission) {
      return res.status(404).json(errorHelpers.notFoundError('Emission record'));
    }

    res.json({
      emission: {
        id: emission._id,
        date: emission.date,
        energyData: emission.energyData,
        wasteData: emission.wasteData,
        calculatedEmissions: emission.calculatedEmissions,
        notes: emission.notes,
        isVerified: emission.isVerified,
        createdAt: emission.createdAt,
        updatedAt: emission.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get emission error:', error);
    res.status(500).json(errorHelpers.createError('Failed to fetch emission record'));
  }
});

module.exports = router; 