const express = require('express');
const { query, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const Emissions = require('../models/Emissions');
const User = require('../models/User');
const { errorHelpers } = require('shared');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireStaff);

// Validation middleware
const validateReportParams = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
  query('format')
    .optional()
    .isIn(['pdf', 'csv'])
    .withMessage('Format must be pdf or csv'),
];

// GET /api/reports/pdf - Generate PDF report
router.get('/pdf', validateReportParams, async (req, res) => {
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

    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorHelpers.notFoundError('User'));
    }

    // Get emissions data for the date range
    const emissions = await Emissions.find({
      userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });

    // Calculate summary statistics
    const totalEmissions = emissions.reduce((sum, emission) => {
      return sum + emission.calculatedEmissions.total;
    }, 0);

    const averageEmissions =
      emissions.length > 0 ? totalEmissions / emissions.length : 0;

    // Implement PDF generation using pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="emissions-report-${Date.now()}.pdf"`
      );
      res.send(pdfBuffer);
    });

    doc.fontSize(20).text('ZeroCraftr Emissions Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Company: ${user.companyName}`);
    doc.text(`Period: ${startDate} to ${endDate}`);
    doc.text(`Total Emissions: ${totalEmissions.toFixed(2)} kg CO2e`);
    doc.text(`Average Emissions: ${averageEmissions.toFixed(2)} kg CO2e`);
    doc.moveDown();
    doc.text('Emissions Records:', { underline: true });
    emissions.forEach(emission => {
      doc.text(
        `Date: ${emission.date.toISOString().split('T')[0]}, Total: ${emission.calculatedEmissions.total} kg, Scope1: ${emission.calculatedEmissions.scope1}, Scope2: ${emission.calculatedEmissions.scope2}, Waste: ${emission.calculatedEmissions.waste}`
      );
    });
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res
      .status(500)
      .json(errorHelpers.createError('Failed to generate PDF report'));
  }
});

// GET /api/reports/csv - Generate CSV report
router.get('/csv', validateReportParams, async (req, res) => {
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

    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorHelpers.notFoundError('User'));
    }

    // Get emissions data for the date range
    const emissions = await Emissions.find({
      userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });

    // TODO: Implement actual CSV generation using csv-writer
    // For now, return a placeholder response
    res.json({
      message: 'CSV report generation is not yet implemented',
      reportData: {
        user: user.companyName,
        period: {
          start: startDate,
          end: endDate,
        },
        totalRecords: emissions.length,
        emissions: emissions.map(emission => ({
          date: emission.date,
          electricityGrid: emission.energyData.electricity.grid,
          electricityRenewable: emission.energyData.electricity.renewable,
          fuelDiesel: emission.energyData.fuel.diesel,
          fuelPetrol: emission.energyData.fuel.petrol,
          fuelNaturalGas: emission.energyData.fuel.naturalGas,
          fuelLpg: emission.energyData.fuel.lpg,
          wasteRecyclable: emission.wasteData.recyclable,
          wasteHazardous: emission.wasteData.hazardous,
          wasteLandfill: emission.wasteData.landfill,
          scope1: emission.calculatedEmissions.scope1,
          scope2: emission.calculatedEmissions.scope2,
          wasteEmissions: emission.calculatedEmissions.waste,
          totalEmissions: emission.calculatedEmissions.total,
        })),
      },
    });

    // TODO: Implement actual CSV generation
    // const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    //
    // const csvWriter = createCsvWriter({
    //   path: path.join(__dirname, '../uploads', `emissions-${Date.now()}.csv`),
    //   header: [
    //     { id: 'date', title: 'Date' },
    //     { id: 'electricityGrid', title: 'Grid Electricity (kWh)' },
    //     { id: 'electricityRenewable', title: 'Renewable Electricity (kWh)' },
    //     { id: 'fuelDiesel', title: 'Diesel (L)' },
    //     { id: 'fuelPetrol', title: 'Petrol (L)' },
    //     { id: 'fuelNaturalGas', title: 'Natural Gas (m³)' },
    //     { id: 'fuelLpg', title: 'LPG (L)' },
    //     { id: 'wasteRecyclable', title: 'Recyclable Waste (kg)' },
    //     { id: 'wasteHazardous', title: 'Hazardous Waste (kg)' },
    //     { id: 'wasteLandfill', title: 'Landfill Waste (kg)' },
    //     { id: 'scope1', title: 'Scope 1 Emissions (kg CO2e)' },
    //     { id: 'scope2', title: 'Scope 2 Emissions (kg CO2e)' },
    //     { id: 'wasteEmissions', title: 'Waste Emissions (kg CO2e)' },
    //     { id: 'totalEmissions', title: 'Total Emissions (kg CO2e)' },
    //   ],
    // });
    //
    // const records = emissions.map(emission => ({
    //   date: emission.date.toISOString().split('T')[0],
    //   electricityGrid: emission.energyData.electricity.grid,
    //   electricityRenewable: emission.energyData.electricity.renewable,
    //   fuelDiesel: emission.energyData.fuel.diesel,
    //   fuelPetrol: emission.energyData.fuel.petrol,
    //   fuelNaturalGas: emission.energyData.fuel.naturalGas,
    //   fuelLpg: emission.energyData.fuel.lpg,
    //   wasteRecyclable: emission.wasteData.recyclable,
    //   wasteHazardous: emission.wasteData.hazardous,
    //   wasteLandfill: emission.wasteData.landfill,
    //   scope1: emission.calculatedEmissions.scope1,
    //   scope2: emission.calculatedEmissions.scope2,
    //   wasteEmissions: emission.calculatedEmissions.waste,
    //   totalEmissions: emission.calculatedEmissions.total,
    // }));
    //
    // await csvWriter.writeRecords(records);
    //
    // const fileName = `emissions-${Date.now()}.csv`;
    // const filePath = path.join(__dirname, '../uploads', fileName);
    //
    // res.download(filePath, fileName, (err) => {
    //   if (err) {
    //     console.error('CSV download error:', err);
    //   }
    //   // Clean up file after download
    //   setTimeout(() => {
    //     fs.unlink(filePath, (unlinkErr) => {
    //       if (unlinkErr) console.error('File cleanup error:', unlinkErr);
    //     });
    //   }, 5000);
    // });
  } catch (error) {
    console.error('CSV generation error:', error);
    res
      .status(500)
      .json(errorHelpers.createError('Failed to generate CSV report'));
  }
});

module.exports = router;
