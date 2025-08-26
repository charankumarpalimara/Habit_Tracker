import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHabits, setFilter, setSort, clearFilters } from './store/habitSlice';
import { getCurrentUser } from './store/authSlice';
import Header from './components/Header';
import HabitForm from './components/HabitForm';
import HabitCard from './components/HabitCard';
import Calendar from './components/Calendar';
import Stats from './components/Stats';
import Login from './components/Login';
import { getToday } from './utils/dateUtils';

const App = () => {
  const dispatch = useDispatch();
  const { habits, filters, sortBy, sortOrder, loading } = useSelector(state => state.habits);
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [currentView, setCurrentView] = useState('habits');
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchHabits());
    }
  }, [dispatch, isAuthenticated]);

  const handleAddHabit = () => {
    setEditingHabit(null);
    setShowForm(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleFormSubmit = (habitData) => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  // Don't render the main app if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <span className="text-primary-600">Habits</span> Tracker
          </h1>
          <p className="text-gray-600 mb-8">Track your daily habits and build a better routine</p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Get Started
          </button>
        </div>
        {showLogin && <Login onClose={handleLoginClose} />}
      </div>
    );
  }

  const getCompletedHabitsForDate = (date) => {
    return habits.filter(habit => habit.completedToday);
  };

  const getFilteredAndSortedHabits = () => {
    let filteredHabits = [...habits];

    // Apply search filter
    if (filters.search) {
      filteredHabits = filteredHabits.filter(habit =>
        habit.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        habit.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        habit.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filteredHabits = filteredHabits.filter(habit => habit.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      if (filters.status === 'completed') {
        filteredHabits = filteredHabits.filter(habit => habit.completedToday);
      } else if (filters.status === 'pending') {
        filteredHabits = filteredHabits.filter(habit => !habit.completedToday);
      }
    }

    // Apply sorting
    filteredHabits.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'streak':
          aValue = a.streak;
          bValue = b.streak;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredHabits;
  };

  const getCategories = () => {
    const categories = [...new Set(habits.map(habit => habit.category))];
    return categories;
  };

  const filteredHabits = getFilteredAndSortedHabits();
  const completedToday = getCompletedHabitsForDate(selectedDate);
  const categories = getCategories();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddHabit={handleAddHabit} onLogin={handleLogin} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('habits')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'habits'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Habits
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'stats'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Filters and Sorting - Only show in habits view */}
        {currentView === 'habits' && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search habits..."
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed Today</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    dispatch(setSort({ sortBy: newSortBy, sortOrder: newSortOrder }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="category-desc">Category (Z-A)</option>
                  <option value="streak-desc">Streak (High-Low)</option>
                  <option value="streak-asc">Streak (Low-High)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
              <div className="mt-4">
                <button
                  onClick={() => dispatch(clearFilters())}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {currentView === 'habits' && (
          <div className="space-y-6">
            {filteredHabits.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {habits.length === 0 ? 'No habits yet' : 'No habits match your filters'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {habits.length === 0 
                    ? 'Start building better habits by adding your first one.'
                    : 'Try adjusting your search or filters.'
                  }
                </p>
                {habits.length === 0 && (
                  <button
                    onClick={handleAddHabit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Habit
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabits.map(habit => (
                  <HabitCard
                    key={habit._id}
                    habit={habit}
                    onEdit={handleEditHabit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Habits for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                {completedToday.length > 0 ? (
                  <div className="space-y-2">
                    {completedToday.map(habit => (
                      <div key={habit._id} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm text-gray-700">{habit.title}</span>
                        <span className="text-xs text-success-600 font-medium">✓</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No habits completed on this date.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'stats' && <Stats />}
      </main>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          habit={editingHabit}
          isEditing={!!editingHabit}
        />
      )}

      {/* Login Modal */}
      {showLogin && <Login onClose={handleLoginClose} />}
    </div>
  );
};

export default App;
