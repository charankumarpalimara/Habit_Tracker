const Progress = require('../models/Progress');
const Habit = require('../models/Habit');

// @desc    Get progress for all habits
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const { startDate, endDate, habitId } = req.query;

    let query = { user: req.user.id };

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Habit filter
    if (habitId) {
      query.habit = habitId;
    }

    const progress = await Progress.find(query)
      .populate('habit', 'title category color')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Mark habit as completed for a date
// @route   POST /api/progress/:habitId
// @access  Private
const markCompleted = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { date, notes, mood } = req.body;

    // Check if habit exists and user owns it
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this habit'
      });
    }

    // Validate date
    const completionDate = date ? new Date(date) : new Date();
    
    // Prevent future dates
    if (completionDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark progress for future dates'
      });
    }

    // Set time to start of day
    completionDate.setHours(0, 0, 0, 0);

    // Check if progress already exists for this date
    let progress = await Progress.findOne({
      user: req.user.id,
      habit: habitId,
      date: completionDate
    });

    if (progress) {
      // Update existing progress
      progress.completed = true;
      if (notes !== undefined) progress.notes = notes;
      if (mood !== undefined) progress.mood = mood;
      await progress.save();
    } else {
      // Create new progress
      progress = await Progress.create({
        user: req.user.id,
        habit: habitId,
        date: completionDate,
        completed: true,
        notes,
        mood
      });
    }

    // Update habit streak
    await updateHabitStreak(habitId);

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking habit as completed',
      error: error.message
    });
  }
};

// @desc    Remove completion for a date
// @route   DELETE /api/progress/:habitId/:date
// @access  Private
const removeCompletion = async (req, res) => {
  try {
    const { habitId, date } = req.params;

    // Check if habit exists and user owns it
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this habit'
      });
    }

    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    const progress = await Progress.findOneAndDelete({
      user: req.user.id,
      habit: habitId,
      date: completionDate
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Update habit streak
    await updateHabitStreak(habitId);

    res.status(200).json({
      success: true,
      message: 'Progress removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing progress',
      error: error.message
    });
  }
};

// @desc    Get statistics and analytics
// @route   GET /api/progress/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all habits for user
    const habits = await Habit.find({ user: req.user.id, isActive: true });

    // Get progress for the period
    const progress = await Progress.find({
      user: req.user.id,
      date: { $gte: startDate },
      completed: true
    });

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProgress = progress.filter(p => 
      p.date.getTime() === today.getTime()
    );

    const stats = {
      totalHabits: habits.length,
      completedToday: todayProgress.length,
      completionRate: habits.length > 0 ? Math.round((todayProgress.length / habits.length) * 100) : 0,
      totalCompletions: progress.length,
      averageCompletionsPerHabit: habits.length > 0 ? Math.round(progress.length / habits.length) : 0,
      period: days
    };

    // Calculate streak statistics
    const streakStats = await calculateStreakStats(req.user.id, habits);

    // Get category distribution
    const categoryStats = await calculateCategoryStats(req.user.id);

    // Get weekly progress
    const weeklyProgress = await calculateWeeklyProgress(req.user.id, startDate);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        streakStats,
        categoryStats,
        weeklyProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Helper function to update habit streak
const updateHabitStreak = async (habitId) => {
  try {
    const progress = await Progress.find({
      habit: habitId,
      completed: true
    }).sort({ date: -1 });

    if (progress.length === 0) {
      await Habit.findByIdAndUpdate(habitId, {
        'streak.current': 0,
        'streak.longest': 0,
        'streak.lastUpdated': new Date()
      });
      return;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < progress.length; i++) {
      const currentDate = progress[i].date;
      const nextDate = i < progress.length - 1 ? progress[i + 1].date : null;

      if (i === 0) {
        // Check if first entry is today or yesterday
        const diffDays = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          tempStreak = 1;
          currentStreak = 1;
        }
      } else {
        // Check if dates are consecutive
        const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (i === 0 || Math.floor((today - currentDate) / (1000 * 60 * 60 * 24)) <= 1) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    await Habit.findByIdAndUpdate(habitId, {
      'streak.current': currentStreak,
      'streak.longest': longestStreak,
      'streak.lastUpdated': new Date()
    });
  } catch (error) {
    console.error('Error updating habit streak:', error);
  }
};

// Helper function to calculate streak statistics
const calculateStreakStats = async (userId, habits) => {
  const streaks = habits.map(habit => ({
    habitId: habit._id,
    title: habit.title,
    currentStreak: habit.streak.current,
    longestStreak: habit.streak.longest
  }));

  const averageStreak = streaks.length > 0 
    ? Math.round(streaks.reduce((sum, s) => sum + s.currentStreak, 0) / streaks.length)
    : 0;

  const longestStreak = streaks.length > 0
    ? Math.max(...streaks.map(s => s.longestStreak))
    : 0;

  return {
    averageStreak,
    longestStreak,
    topHabits: streaks
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5)
  };
};

// Helper function to calculate category statistics
const calculateCategoryStats = async (userId) => {
  const habits = await Habit.find({ user: userId, isActive: true });
  
  const categoryCount = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to calculate weekly progress
const calculateWeeklyProgress = async (userId, startDate) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const completions = await Progress.countDocuments({
      user: userId,
      date: { $gte: dayStart, $lte: dayEnd },
      completed: true
    });

    weeklyData.push({
      day: weekDays[date.getDay()],
      date: dayStart,
      completions,
      isToday: date.toDateString() === new Date().toDateString()
    });
  }

  return weeklyData;
};

module.exports = {
  getProgress,
  markCompleted,
  removeCompletion,
  getStats
};
