import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getDaysInMonth, getMonthName, isToday, formatDate, getToday } from '../utils/dateUtils';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const { habits } = useSelector(state => state.habits);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const days = getDaysInMonth(currentMonth.year, currentMonth.month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        if (prev.month === 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { ...prev, month: prev.month - 1 };
      } else {
        if (prev.month === 11) {
          return { year: prev.year + 1, month: 0 };
        }
        return { ...prev, month: prev.month + 1 };
      }
    });
  };

  const getCompletionsForDate = (date) => {
    const dateStr = formatDate(date);
    const today = getToday();
    
    // For now, only show completions for today
    // In the future, this will be populated from the progress API
    if (dateStr === today) {
      return habits
        .filter(habit => habit.completedToday)
        .map(habit => habit.title);
    }
    return [];
  };

  const getCalendarDays = () => {
    return days.map(date => ({
      date: formatDate(date),
      isToday: isToday(date),
      isSelected: formatDate(date) === selectedDate,
      isInCurrentMonth: date.getMonth() === currentMonth.month,
      completions: getCompletionsForDate(date),
    }));
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {getMonthName(currentMonth.month)} {currentMonth.year}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day.date)}
            className={`relative p-2 text-sm rounded-md transition-colors ${
              day.isSelected
                ? 'bg-primary-600 text-white'
                : day.isToday
                ? 'bg-primary-100 text-primary-700'
                : day.isInCurrentMonth
                ? 'text-gray-900 hover:bg-gray-100'
                : 'text-gray-400'
            }`}
          >
            <span className="block">{new Date(day.date).getDate()}</span>
            
            {/* Completion indicators */}
            {day.completions.length > 0 && (
              <div className="flex justify-center gap-1 mt-1">
                {day.completions.slice(0, 3).map((habitTitle, idx) => {
                  const habit = habits.find(h => h.title === habitTitle);
                  return (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: habit?.color || '#3b82f6' }}
                    />
                  );
                })}
                {day.completions.length > 3 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary-600" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary-100" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
