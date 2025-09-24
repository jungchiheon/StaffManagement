import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0aXSQ9FESPwu_7lCIWyIydjoqFaeC0qY",
  authDomain: "codecraft-475f0.firebaseapp.com",
  projectId: "codecraft-475f0",
  storageBucket: "codecraft-475f0.firebasestorage.app",
  messagingSenderId: "1051400287369",
  appId: "1:1051400287369:web:233069ae6082f127574258"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);