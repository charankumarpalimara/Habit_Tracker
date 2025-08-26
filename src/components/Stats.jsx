import React from 'react';
import { useSelector } from 'react-redux';
import { getToday } from '../utils/dateUtils';

const Stats = () => {
  const { habits } = useSelector(state => state.habits);
  const today = getToday();

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => 
    habit.completedToday
  ).length;
  
  const totalCompletions = 0; // This will come from progress data in the future
  
  const averageStreak = habits.length > 0 
    ? Math.round(habits.reduce((sum, habit) => sum + (habit.streak?.current || 0), 0) / habits.length)
    : 0;
  
  const longestStreak = habits.length > 0
    ? Math.max(...habits.map(habit => habit.streak?.longest || 0))
    : 0;

  const completionRate = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100)
    : 0;

  const getTopHabits = () => {
    return habits
      .sort((a, b) => (b.streak?.current || 0) - (a.streak?.current || 0))
      .slice(0, 3);
  };

  const getCategoryStats = () => {
    const categories = habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getWeeklyProgress = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    return weekDays.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      // For now, only show completions for today
      // In the future, this will be populated from progress data
      const completions = dateStr === today ? completedToday : 0;
      
      return {
        day,
        completions,
        isToday: date.toDateString() === today.toDateString()
      };
    });
  };

  const topHabits = getTopHabits();
  const categoryStats = getCategoryStats();
  const weeklyProgress = getWeeklyProgress();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{totalHabits}</div>
          <div className="text-sm text-gray-600">Total Habits</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-success-600">{completedToday}</div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{averageStreak}</div>
          <div className="text-sm text-gray-600">Avg. Streak</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-success-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        
        {totalHabits > 0 && (
          <div className="text-sm text-gray-600">
            {completedToday} of {totalHabits} habits completed today
          </div>
        )}
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyProgress.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">{day.day}</div>
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  day.isToday ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                style={{ 
                  height: `${Math.max((day.completions / Math.max(...weeklyProgress.map(d => d.completions), 1)) * 80, 8)}px` 
                }}
              />
              <div className="text-xs text-gray-600 mt-1">{day.completions}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Habits */}
      {topHabits.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Habits</h3>
          <div className="space-y-3">
            {topHabits.map((habit, index) => (
              <div key={habit._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ backgroundColor: habit.color }}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{habit.title}</div>
                    <div className="text-sm text-gray-500">{habit.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-600">{habit.streak?.current || 0} days</div>
                  <div className="text-xs text-gray-500">current streak</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habits by Category</h3>
          <div className="space-y-3">
            {categoryStats.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="font-medium text-gray-900">{category}</span>
                </div>
                <div className="text-sm text-gray-600">{count} habits</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Completions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{totalCompletions}</div>
            <div className="text-sm text-gray-600">Total Completions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {totalHabits > 0 ? Math.round(totalCompletions / totalHabits) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg. Completions per Habit</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
