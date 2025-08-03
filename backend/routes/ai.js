const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const Emissions = require('../models/Emissions');
const { errorHelpers } = require('../shared');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireStaff);

// Validation middleware
const validateSuggestionRequest = [
  body('timeframe').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Timeframe must be week, month, quarter, or year'),
  body('focus').optional().isIn(['energy', 'waste', 'overall']).withMessage('Focus must be energy, waste, or overall'),
];

// POST /api/ai/suggestions - Get AI-powered sustainability suggestions
router.post('/suggestions', validateSuggestionRequest, async (req, res) => {
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

    const { timeframe = 'month', focus = 'overall' } = req.body;
    const userId = req.user.userId;

    // Get user's emission data for analysis
    const endDate = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get emissions data
    const emissions = await Emissions.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    if (emissions.length === 0) {
      return res.json({
        message: 'No emission data available for analysis',
        suggestions: [],
        timeframe,
        focus,
      });
    }

    // Calculate summary statistics
    const totalEmissions = emissions.reduce((sum, emission) => {
      return sum + emission.calculatedEmissions.total;
    }, 0);

    const averageEmissions = totalEmissions / emissions.length;

    const energyBreakdown = emissions.reduce((acc, emission) => {
      acc.electricity += (emission.energyData.electricity.grid || 0) + (emission.energyData.electricity.renewable || 0);
      acc.fuel += (emission.energyData.fuel.diesel || 0) + (emission.energyData.fuel.petrol || 0) + 
                  (emission.energyData.fuel.naturalGas || 0) + (emission.energyData.fuel.lpg || 0);
      return acc;
    }, { electricity: 0, fuel: 0 });

    const wasteBreakdown = emissions.reduce((acc, emission) => {
      acc.recyclable += emission.wasteData.recyclable || 0;
      acc.hazardous += emission.wasteData.hazardous || 0;
      acc.landfill += emission.wasteData.landfill || 0;
      return acc;
    }, { recyclable: 0, hazardous: 0, landfill: 0 });

    // Generate suggestions based on data analysis
    const suggestions = generatePlaceholderSuggestions(
      totalEmissions,
      averageEmissions,
      energyBreakdown,
      wasteBreakdown,
      focus
    );

    res.json({
      message: 'AI suggestions generated successfully',
      suggestions,
      analysis: {
        timeframe,
        focus,
        totalEmissions: totalEmissions.toFixed(2),
        averageEmissions: averageEmissions.toFixed(2),
        energyBreakdown,
        wasteBreakdown,
        dataPoints: emissions.length,
      },
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json(errorHelpers.createError('Failed to generate AI suggestions'));
  }
});

// POST /api/ai/chat - Chat with ZeroCraftr AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: {
          message: 'Message is required',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get user's recent emission data for context
    const recentEmissions = await Emissions.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Create context from user's emission data
    let context = '';
    if (recentEmissions.length > 0) {
      const totalEmissions = recentEmissions.reduce((sum, emission) => {
        return sum + emission.calculatedEmissions.total;
      }, 0);
      
      context = `User's recent emission data: Total emissions: ${totalEmissions.toFixed(2)} kg CO₂e from ${recentEmissions.length} records. `;
    }

    // Call Groq API for AI response
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are ZeroCraftr AI Assistant, a specialized AI for emission tracking and sustainability. You help manufacturers track their carbon footprint, understand emission calculations, and provide sustainability advice. You have expertise in:

- Emission tracking and carbon footprint calculation
- Energy consumption analysis (electricity, fuel, gas)
- Waste management and disposal tracking
- Sustainability best practices for manufacturing
- Regulatory compliance for environmental reporting
- Green technology recommendations

Always provide practical, actionable advice for small manufacturers looking to reduce their environmental impact. Be concise, professional, and focus on ZeroCraftr's mission of helping manufacturers become more sustainable.

Build By Lakshit Mathur, Trained By Lakshit Mathur for ZeroCraftr

${context}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
    });

    const aiResponse = response.data.choices[0].message.content;

    res.json({
      message: 'AI response generated successfully',
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json(errorHelpers.createError('Failed to generate AI response'));
  }
});

// Helper function to generate placeholder suggestions
function generatePlaceholderSuggestions(totalEmissions, averageEmissions, energyBreakdown, wasteBreakdown, focus) {
  const suggestions = [];

  if (focus === 'energy' || focus === 'overall') {
    if (energyBreakdown.electricity > energyBreakdown.fuel * 2) {
      suggestions.push({
        category: 'energy',
        priority: 'high',
        title: 'Optimize Electricity Usage',
        description: 'Your electricity consumption is significantly higher than fuel usage. Consider implementing energy-efficient practices.',
        actions: [
          'Switch to LED lighting throughout your facility',
          'Implement smart energy monitoring systems',
          'Consider renewable energy sources like solar panels',
          'Optimize HVAC systems for better efficiency',
        ],
        potentialSavings: '15-25% reduction in electricity costs',
      });
    }

    if (energyBreakdown.fuel > 0) {
      suggestions.push({
        category: 'energy',
        priority: 'medium',
        title: 'Reduce Fuel Consumption',
        description: 'Consider transitioning to more efficient fuel sources or electric alternatives.',
        actions: [
          'Maintain vehicles and equipment regularly',
          'Implement fuel-efficient driving practices',
          'Consider electric or hybrid vehicle options',
          'Optimize delivery routes to reduce fuel usage',
        ],
        potentialSavings: '10-20% reduction in fuel costs',
      });
    }
  }

  if (focus === 'waste' || focus === 'overall') {
    if (wasteBreakdown.landfill > wasteBreakdown.recyclable) {
      suggestions.push({
        category: 'waste',
        priority: 'high',
        title: 'Improve Waste Management',
        description: 'Your landfill waste exceeds recyclable waste. Implement better waste segregation and recycling programs.',
        actions: [
          'Set up comprehensive recycling bins throughout the facility',
          'Train staff on proper waste segregation',
          'Partner with local recycling facilities',
          'Implement waste audit procedures',
        ],
        potentialSavings: '20-30% reduction in waste disposal costs',
      });
    }

    if (wasteBreakdown.hazardous > 0) {
      suggestions.push({
        category: 'waste',
        priority: 'high',
        title: 'Optimize Hazardous Waste Handling',
        description: 'Implement better hazardous waste management practices to reduce environmental impact.',
        actions: [
          'Use less hazardous alternatives where possible',
          'Implement proper hazardous waste storage procedures',
          'Train staff on hazardous waste handling',
          'Regularly audit hazardous waste generation',
        ],
        potentialSavings: 'Reduced compliance risks and disposal costs',
      });
    }
  }

  if (averageEmissions > 1000) {
    suggestions.push({
      category: 'overall',
      priority: 'high',
      title: 'High Emissions Alert',
      description: 'Your average emissions are above recommended levels. Consider implementing comprehensive sustainability measures.',
      actions: [
        'Conduct a comprehensive energy audit',
        'Set up emission reduction targets',
        'Implement regular monitoring and reporting',
        'Consider carbon offset programs',
      ],
      potentialSavings: 'Significant long-term cost savings and compliance benefits',
    });
  }

  return suggestions;
}

module.exports = router; 