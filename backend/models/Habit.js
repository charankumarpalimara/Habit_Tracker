const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a habit title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  target: {
    type: Number,
    required: [true, 'Please provide a target'],
    min: [1, 'Target must be at least 1']
  },
  unit: {
    type: String,
    required: [true, 'Please provide a unit'],
    trim: true,
    maxlength: [20, 'Unit cannot be more than 20 characters']
  },
  color: {
    type: String,
    required: [true, 'Please provide a color'],
    default: '#3b82f6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    time: {
      type: String,
      default: '09:00'
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
habitSchema.index({ user: 1, createdAt: -1 });
habitSchema.index({ user: 1, category: 1 });
habitSchema.index({ user: 1, isActive: 1 });

// Virtual for completion rate
habitSchema.virtual('completionRate').get(function() {
  // This will be calculated in the controller
  return 0;
});

// Ensure virtual fields are serialized
habitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);
