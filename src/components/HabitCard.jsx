import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleHabitCompletion, deleteHabit } from '../store/habitSlice';
import { getToday } from '../utils/dateUtils';

const HabitCard = ({ habit, onEdit }) => {
  const dispatch = useDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const today = getToday();
  const isCompletedToday = habit.completedToday;

  const handleToggleCompletion = () => {
    dispatch(toggleHabitCompletion({ habitId: habit._id, date: today }));
  };

  const handleDelete = () => {
    dispatch(deleteHabit(habit._id));
    setShowDeleteConfirm(false);
  };

  const getHabitStats = (habit) => {
    // Use streak data from the API
    const currentStreak = habit.streak?.current || 0;
    const longestStreak = habit.streak?.longest || 0;
    const completionRate = 0; // This will be calculated by the backend

    return {
      totalCompletions: 0, // This will come from progress data
      currentStreak,
      longestStreak,
      completionRate,
    };
  };

  const stats = getHabitStats(habit);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
            <p className="text-sm text-gray-500">{habit.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-gray-600 text-sm mb-4">{habit.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600">{stats.longestStreak}</div>
          <div className="text-xs text-gray-500">Longest Streak</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(stats.completionRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Target: {habit.target} {habit.unit} {habit.frequency}
        </div>
        
        <button
          onClick={handleToggleCompletion}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isCompletedToday
              ? 'bg-success-100 text-success-700 hover:bg-success-200'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
        >
          {isCompletedToday ? 'Completed' : 'Mark Complete'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Habit
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{habit.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
