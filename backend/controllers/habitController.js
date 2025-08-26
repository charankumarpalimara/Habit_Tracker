const Habit = require('../models/Habit');
const Progress = require('../models/Progress');

// @desc    Get all habits for user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const { category, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = { user: req.user.id };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const habits = await Habit.find(query).sort(sort);

    // Get completion data for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProgress = await Progress.find({
      user: req.user.id,
      date: today,
      completed: true
    });

    const completedHabitIds = todayProgress.map(p => p.habit.toString());

    // Add completion status and stats to habits
    const habitsWithStats = habits.map(habit => {
      const habitObj = habit.toObject();
      habitObj.completedToday = completedHabitIds.includes(habit._id.toString());
      
      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return habitObj;
    });

    res.status(200).json({
      success: true,
      count: habitsWithStats.length,
      data: habitsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habits',
      error: error.message
    });
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Make sure user owns habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this habit'
      });
    }

    // Get progress data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progress = await Progress.find({
      user: req.user.id,
      habit: habit._id,
      date: { $gte: thirtyDaysAgo },
      completed: true
    }).sort({ date: 1 });

    const habitData = habit.toObject();
    habitData.progress = progress;

    res.status(200).json({
      success: true,
      data: habitData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habit',
      error: error.message
    });
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  try {
    const { title, description, category, frequency, target, unit, color, reminder } = req.body;

    // Validate required fields
    if (!title || !category || !target || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, target, and unit'
      });
    }

    // Validate habit name is not empty
    if (!title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Habit title cannot be empty'
      });
    }

    const habit = await Habit.create({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim(),
      category: category.trim(),
      frequency,
      target,
      unit: unit.trim(),
      color,
      reminder
    });

    res.status(201).json({
      success: true,
      data: habit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating habit',
      error: error.message
    });
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res) => {
  try {
    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Make sure user owns habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this habit'
      });
    }

    // Validate habit name is not empty if provided
    if (req.body.title && !req.body.title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Habit title cannot be empty'
      });
    }

    habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating habit',
      error: error.message
    });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Make sure user owns habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this habit'
      });
    }

    // Delete associated progress records
    await Progress.deleteMany({ habit: req.params.id });

    // Delete the habit
    await habit.remove();

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting habit',
      error: error.message
    });
  }
};

// @desc    Get habit categories
// @route   GET /api/habits/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Habit.distinct('category', { user: req.user.id });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

module.exports = {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  getCategories
};
