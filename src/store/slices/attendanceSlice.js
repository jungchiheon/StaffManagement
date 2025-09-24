import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/attendanceService';

// 출근 체크
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async ({ userId, storeId }) => {
    const response = await attendanceService.checkIn(userId, storeId);
    return response;
  }
);

// 퇴근 체크
export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async ({ attendanceId }) => {
    const response = await attendanceService.checkOut(attendanceId);
    return response;
  }
);

// 출퇴근 기록 조회
export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchHistory',
  async ({ userId, startDate, endDate }) => {
    const response = await attendanceService.getAttendanceHistory(
      userId,
      startDate,
      endDate
    );
    return response;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    currentAttendance: null,
    history: [],
    todayStatus: null, // 'notStarted' | 'working' | 'completed'
    loading: false,
    error: null,
  },
  reducers: {
    setTodayStatus: (state, action) => {
      state.todayStatus = action.payload;
    },
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 출근
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.todayStatus = 'working';
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 퇴근
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.todayStatus = 'completed';
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 기록 조회
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { setTodayStatus, clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;