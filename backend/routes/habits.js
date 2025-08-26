const express = require('express');
const { body, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  getCategories
} = require('../controllers/habitController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Validation middleware
const habitValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  body('target')
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('unit')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('reminder.enabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  body('reminder.time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder time must be in HH:MM format'),
  body('reminder.days')
    .optional()
    .isArray()
    .withMessage('Reminder days must be an array')
];

const queryValidation = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('status')
    .optional()
    .isIn(['all', 'active', 'inactive'])
    .withMessage('Status must be all, active, or inactive'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('sortBy')
    .optional()
    .isIn(['title', 'category', 'createdAt', 'streak'])
    .withMessage('Sort by must be title, category, createdAt, or streak'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.get('/', queryValidation, getHabits);
router.get('/categories', getCategories);
router.get('/:id', getHabit);
router.post('/', habitValidation, createHabit);
router.put('/:id', habitValidation, updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
