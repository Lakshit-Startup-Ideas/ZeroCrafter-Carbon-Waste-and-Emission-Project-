// Shared utilities and constants for ZeroCraftr
// This module contains common functionality used across frontend and backend

// Emission Factors (kg CO2e per unit)
// These are placeholder values - replace with actual emission factors for your region
const EMISSION_FACTORS = {
  // Energy Sources
  electricity: {
    grid: 0.82, // kg CO2e per kWh (grid average)
    renewable: 0.0, // kg CO2e per kWh (renewable)
  },
  fuel: {
    diesel: 2.68, // kg CO2e per liter
    petrol: 2.31, // kg CO2e per liter
    naturalGas: 2.02, // kg CO2e per cubic meter
    lpg: 1.51, // kg CO2e per liter
  },
  waste: {
    recyclable: -0.5, // kg CO2e per kg (negative = emission reduction)
    hazardous: 0.1, // kg CO2e per kg
    landfill: 0.8, // kg CO2e per kg
  },
};

// JWT Helper Functions
const jwtHelpers = {
  // Generate JWT token
  generateToken: (payload, secret, expiresIn = '24h') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, { expiresIn });
  },

  // Verify JWT token
  verifyToken: (token, secret) => {
    const jwt = require('jsonwebtoken');
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Extract token from Authorization header
  extractToken: (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  },
};

// Error Helper Functions
const errorHelpers = {
  // Create standardized error response
  createError: (message, statusCode = 500, code = 'INTERNAL_ERROR') => ({
    error: {
      message,
      statusCode,
      code,
      timestamp: new Date().toISOString(),
    },
  }),

  // Validation error
  validationError: (field, message) => ({
    error: {
      message: `Validation failed: ${message}`,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      field,
      timestamp: new Date().toISOString(),
    },
  }),

  // Authentication error
  authError: (message = 'Authentication required') => ({
    error: {
      message,
      statusCode: 401,
      code: 'AUTH_ERROR',
      timestamp: new Date().toISOString(),
    },
  }),

  // Not found error
  notFoundError: (resource = 'Resource') => ({
    error: {
      message: `${resource} not found`,
      statusCode: 404,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    },
  }),
};

// Emissions Calculation Functions
const emissionsCalculator = {
  // Calculate Scope 1 emissions (direct fuel combustion)
  calculateScope1: (fuelData) => {
    let scope1 = 0;
    
    if (fuelData.diesel) {
      scope1 += fuelData.diesel * EMISSION_FACTORS.fuel.diesel;
    }
    if (fuelData.petrol) {
      scope1 += fuelData.petrol * EMISSION_FACTORS.fuel.petrol;
    }
    if (fuelData.naturalGas) {
      scope1 += fuelData.naturalGas * EMISSION_FACTORS.fuel.naturalGas;
    }
    if (fuelData.lpg) {
      scope1 += fuelData.lpg * EMISSION_FACTORS.fuel.lpg;
    }
    
    return scope1;
  },

  // Calculate Scope 2 emissions (purchased electricity)
  calculateScope2: (electricityData) => {
    let scope2 = 0;
    
    if (electricityData.grid) {
      scope2 += electricityData.grid * EMISSION_FACTORS.electricity.grid;
    }
    if (electricityData.renewable) {
      scope2 += electricityData.renewable * EMISSION_FACTORS.electricity.renewable;
    }
    
    return scope2;
  },

  // Calculate waste emissions
  calculateWasteEmissions: (wasteData) => {
    let wasteEmissions = 0;
    
    if (wasteData.recyclable) {
      wasteEmissions += wasteData.recyclable * EMISSION_FACTORS.waste.recyclable;
    }
    if (wasteData.hazardous) {
      wasteEmissions += wasteData.hazardous * EMISSION_FACTORS.waste.hazardous;
    }
    if (wasteData.landfill) {
      wasteEmissions += wasteData.landfill * EMISSION_FACTORS.waste.landfill;
    }
    
    return wasteEmissions;
  },

  // Calculate total emissions
  calculateTotal: (energyData, wasteData) => {
    const scope1 = emissionsCalculator.calculateScope1(energyData);
    const scope2 = emissionsCalculator.calculateScope2(energyData);
    const wasteEmissions = emissionsCalculator.calculateWasteEmissions(wasteData);
    
    return {
      scope1,
      scope2,
      waste: wasteEmissions,
      total: scope1 + scope2 + wasteEmissions,
    };
  },
};

// Shared Configuration
const config = {
  // API endpoints
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      resetPassword: '/api/auth/reset-password',
    },
    emissions: {
      list: '/api/emissions',
      create: '/api/emissions',
      update: (id) => `/api/emissions/${id}`,
      delete: (id) => `/api/emissions/${id}`,
    },
    reports: {
      pdf: '/api/reports/pdf',
      csv: '/api/reports/csv',
    },
    ai: {
      suggestions: '/api/ai/suggestions',
    },
  },

  // Validation rules
  validation: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    companyName: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  },

  // Chart colors for dashboard
  chartColors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    light: '#F3F4F6',
    dark: '#1F2937',
  },
};

// Export all utilities
module.exports = {
  EMISSION_FACTORS,
  jwtHelpers,
  errorHelpers,
  emissionsCalculator,
  config,
}; 