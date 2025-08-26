import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Async thunks for API operations
export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/habits');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addHabit = createAsyncThunk(
  'habits/addHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/habits', {
        method: 'POST',
        body: JSON.stringify(habitData),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/habits/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleHabitCompletion = createAsyncThunk(
  'habits/toggleHabitCompletion',
  async ({ habitId, date }, { rejectWithValue }) => {
    try {
      await apiRequest(`/progress/${habitId}`, {
        method: 'POST',
        body: JSON.stringify({ date }),
      });
      return { habitId, date, completed: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProgress = createAsyncThunk(
  'habits/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/progress');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStats = createAsyncThunk(
  'habits/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/progress/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const habitSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    progress: [],
    stats: null,
    loading: false,
    error: null,
    filters: {
      category: 'all',
      status: 'all',
      search: ''
    },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  reducers: {
    setFilter: (state, action) => {
      const { filter, value } = action.payload;
      state.filters[filter] = value;
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    clearFilters: (state) => {
      state.filters = {
        category: 'all',
        status: 'all',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch habits
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add habit
      .addCase(addHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload);
      })
      .addCase(addHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update habit
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(habit => habit._id === action.payload._id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(updateHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete habit
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(habit => habit._id !== action.payload);
      })
      .addCase(deleteHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Toggle completion
      .addCase(toggleHabitCompletion.fulfilled, (state, action) => {
        // Update the habit's completion status
        const habit = state.habits.find(h => h._id === action.payload.habitId);
        if (habit) {
          habit.completedToday = action.payload.completed;
        }
      })
      .addCase(toggleHabitCompletion.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch progress
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { setFilter, setSort, clearFilters, clearError } = habitSlice.actions;
export default habitSlice.reducer;
