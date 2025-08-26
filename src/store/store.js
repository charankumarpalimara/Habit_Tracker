import { configureStore } from '@reduxjs/toolkit';
import habitReducer from './habitSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    habits: habitReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
