import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';

export const attendanceService = {
  // 출근 체크
  async checkIn(userId, storeId) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const attendanceId = `${userId}_${today}`;
      
      // 이미 출근했는지 확인
      const existingDoc = await getDoc(doc(db, 'attendance', attendanceId));
      if (existingDoc.exists()) {
        throw new Error('이미 출근 처리되었습니다.');
      }
      
      const attendanceData = {
        id: attendanceId,
        userId,
        storeId,
        date: today,
        checkIn: new Date().toISOString(),
        checkOut: null,
        totalHours: 0,
        status: 'working',
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'attendance', attendanceId), attendanceData);
      
      return attendanceData;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  },
  
  // 퇴근 체크
  async checkOut(attendanceId) {
    try {
      const attendanceRef = doc(db, 'attendance', attendanceId);
      const attendanceDoc = await getDoc(attendanceRef);
      
      if (!attendanceDoc.exists()) {
        throw new Error('출근 기록을 찾을 수 없습니다.');
      }
      
      const attendanceData = attendanceDoc.data();
      const checkOutTime = new Date();
      const checkInTime = new Date(attendanceData.checkIn);
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      
      const updateData = {
        checkOut: checkOutTime.toISOString(),
        totalHours: Math.round(totalHours * 10) / 10,
        status: 'completed',
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(attendanceRef, updateData);
      
      return { ...attendanceData, ...updateData };
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  },
  
  // 출퇴근 기록 조회
  async getAttendanceHistory(userId, startDate, endDate) {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach((doc) => {
        history.push(doc.data());
      });
      
      return history;
    } catch (error) {
      console.error('Get attendance history error:', error);
      throw error;
    }
  },
};