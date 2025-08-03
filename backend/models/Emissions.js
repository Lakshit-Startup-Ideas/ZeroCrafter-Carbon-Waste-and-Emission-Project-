const mongoose = require('mongoose');

const emissionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  energyData: {
    electricity: {
      grid: {
        type: Number,
        default: 0,
        min: [0, 'Electricity consumption cannot be negative'],
      },
      renewable: {
        type: Number,
        default: 0,
        min: [0, 'Renewable electricity consumption cannot be negative'],
      },
    },
    fuel: {
      diesel: {
        type: Number,
        default: 0,
        min: [0, 'Diesel consumption cannot be negative'],
      },
      petrol: {
        type: Number,
        default: 0,
        min: [0, 'Petrol consumption cannot be negative'],
      },
      naturalGas: {
        type: Number,
        default: 0,
        min: [0, 'Natural gas consumption cannot be negative'],
      },
      lpg: {
        type: Number,
        default: 0,
        min: [0, 'LPG consumption cannot be negative'],
      },
    },
  },
  wasteData: {
    recyclable: {
      type: Number,
      default: 0,
      min: [0, 'Recyclable waste cannot be negative'],
    },
    hazardous: {
      type: Number,
      default: 0,
      min: [0, 'Hazardous waste cannot be negative'],
    },
    landfill: {
      type: Number,
      default: 0,
      min: [0, 'Landfill waste cannot be negative'],
    },
  },
  calculatedEmissions: {
    scope1: {
      type: Number,
      default: 0,
    },
    scope2: {
      type: Number,
      default: 0,
    },
    waste: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
emissionsSchema.index({ userId: 1, date: -1 });
emissionsSchema.index({ date: 1 });
emissionsSchema.index({ 'calculatedEmissions.total': -1 });

// Calculate emissions before saving
emissionsSchema.pre('save', function(next) {
  const { emissionsCalculator } = require('shared');
  
  // Extract energy data for calculation
  const energyData = {
    ...this.energyData.electricity,
    ...this.energyData.fuel,
  };
  
  // Calculate emissions
  const calculated = emissionsCalculator.calculateTotal(energyData, this.wasteData);
  
  this.calculatedEmissions = calculated;
  next();
});

// Virtual for total energy consumption
emissionsSchema.virtual('totalEnergyConsumption').get(function() {
  const electricity = (this.energyData.electricity.grid || 0) + (this.energyData.electricity.renewable || 0);
  const fuel = (this.energyData.fuel.diesel || 0) + (this.energyData.fuel.petrol || 0) + 
               (this.energyData.fuel.naturalGas || 0) + (this.energyData.fuel.lpg || 0);
  return electricity + fuel;
});

// Virtual for total waste
emissionsSchema.virtual('totalWaste').get(function() {
  return (this.wasteData.recyclable || 0) + (this.wasteData.hazardous || 0) + (this.wasteData.landfill || 0);
});

// Method to get emission summary
emissionsSchema.methods.getSummary = function() {
  return {
    id: this._id,
    date: this.date,
    totalEnergyConsumption: this.totalEnergyConsumption,
    totalWaste: this.totalWaste,
    emissions: this.calculatedEmissions,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

// Static method to get user's emission summary
emissionsSchema.statics.getUserSummary = async function(userId) {
  const emissions = await this.find({ userId }).sort({ date: -1 });
  
  const totalEmissions = emissions.reduce((sum, emission) => {
    return sum + emission.calculatedEmissions.total;
  }, 0);
  
  const averageEmissions = emissions.length > 0 ? totalEmissions / emissions.length : 0;
  
  return {
    totalRecords: emissions.length,
    totalEmissions,
    averageEmissions,
    lastUpdated: emissions.length > 0 ? emissions[0].date : null,
  };
};

module.exports = mongoose.model('Emissions', emissionsSchema); 