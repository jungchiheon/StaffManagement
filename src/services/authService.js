import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
  // 회원가입
  async register(userData) {
    try {
      // 중복 아이디 체크
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '==', userData.username)
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        throw new Error('이미 사용중인 아이디입니다.');
      }

      // Firebase Auth로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email, // username@staffapp.com 형식
        userData.password
      );
      
      const user = userCredential.user;
      
      // 프로필 업데이트 (닉네임 저장)
      await updateProfile(user, {
        displayName: userData.nickname,
      });
      
      // Firestore에 사용자 정보 저장
      const userDoc = {
        uid: user.uid,
        username: userData.username,
        nickname: userData.nickname,
        role: userData.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      return {
        user: userDoc,
        token: await user.getIdToken(),
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // 로그인
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Firestore에서 사용자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('비활성화된 계정입니다. 관리자에게 문의하세요.');
      }
      
      return {
        user: userData,
        token: await user.getIdToken(),
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // 로그아웃
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};