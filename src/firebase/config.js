import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBF1Vu6AlNsrzWasjhRFOtM3S8F9SnzHcs",
  // На сайті вхід Google іде через його ж домен (vercel.json проксіює /__/auth на firebaseapp.com):
  // інакше Safari, телефони й встановлений застосунок гублять результат входу і повертають на сторінку входу.
  authDomain: typeof window !== 'undefined' && window.location.hostname === 'easy-nmt.vercel.app' ? 'easy-nmt.vercel.app' : 'easy-nmt.firebaseapp.com',
  projectId: "easy-nmt",
  storageBucket: "easy-nmt.firebasestorage.app",
  messagingSenderId: "186875076363",
  appId: "1:186875076363:web:9181813de1bed887e68c0e",
  measurementId: "G-KQXK4ZVY07"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
