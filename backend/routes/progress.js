const express = require('express');
const { body, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getProgress,
  markCompleted,
  removeCompletion,
  getStats
} = require('../controllers/progressController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Validation middleware
const progressValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'okay', 'bad', 'terrible'])
    .withMessage('Mood must be excellent, good, okay, bad, or terrible')
];

const queryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('habitId')
    .optional()
    .isMongoId()
    .withMessage('Habit ID must be a valid MongoDB ObjectId'),
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Period must be between 1 and 365 days')
];

// Routes
router.get('/', queryValidation, getProgress);
router.get('/stats', queryValidation, getStats);
router.post('/:habitId', progressValidation, markCompleted);
router.delete('/:habitId/:date', removeCompletion);

module.exports = router;
