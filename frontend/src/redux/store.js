import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';  // ← import the reducer

const store = configureStore({
  reducer: {
    auth: authReducer,   // ← use the imported reducer here
    // jobs: jobsReducer, // add later when you create it
  },
});

export default store;