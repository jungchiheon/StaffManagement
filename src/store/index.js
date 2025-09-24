import { configureStore } from '@reduxjs/toolkit';

// 임시 리듀서
const tempReducer = (state = {}, action) => state;

export const store = configureStore({
  reducer: {
    auth: tempReducer,
    user: tempReducer,
    schedule: tempReducer,
    attendance: tempReducer,
    store: tempReducer,
  },
});