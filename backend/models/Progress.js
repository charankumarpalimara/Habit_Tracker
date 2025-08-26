const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    validate: {
      validator: function(date) {
        // Prevent future dates
        return date <= new Date();
      },
      message: 'Cannot mark progress for future dates'
    }
  },
  completed: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
    default: 'good'
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress entry per habit per date per user
progressSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

// Index for efficient queries
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ habit: 1, date: -1 });

// Pre-save middleware to format date to start of day
progressSchema.pre('save', function(next) {
  if (this.date) {
    this.date = new Date(this.date.setHours(0, 0, 0, 0));
  }
  next();
});

// Static method to get progress for a date range
progressSchema.statics.getProgressForDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('habit', 'title category color');
};

// Static method to get streak for a habit
progressSchema.statics.getStreakForHabit = function(userId, habitId) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        habit: mongoose.Types.ObjectId(habitId),
        completed: true
      }
    },
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: null,
        dates: { $push: '$date' }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);
