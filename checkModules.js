import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBF1Vu6AlNsrzWasjhRFOtM3S8F9SnzHcs",
  authDomain: "easy-nmt.firebaseapp.com",
  projectId: "easy-nmt",
  storageBucket: "easy-nmt.firebasestorage.app",
  messagingSenderId: "186875076363",
  appId: "1:186875076363:web:9181813de1bed887e68c0e",
  measurementId: "G-KQXK4ZVY07"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkModules() {
  try {
    console.log('Перевірка модулів...');
    const modulesSnapshot = await getDocs(collection(db, 'modules'));
    console.log(`Знайдено модулів: ${modulesSnapshot.size}`);
    
    if (modulesSnapshot.size === 0) {
      console.log('Модулів не знайдено. Потрібно додати модулі.');
    } else {
      modulesSnapshot.forEach(doc => {
        console.log(`Модуль: ${doc.data().title}, ID: ${doc.id}`);
      });
    }
  } catch (error) {
    console.error('Помилка при перевірці модулів:', error);
  }
}

checkModules();
