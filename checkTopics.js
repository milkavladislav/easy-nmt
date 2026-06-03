import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

async function checkTopics() {
  try {
    console.log('Перевірка тем...');
    const topicsSnapshot = await getDocs(collection(db, 'topics'));
    console.log(`Знайдено тем: ${topicsSnapshot.size}`);
    
    if (topicsSnapshot.size === 0) {
      console.log('Тем не знайдено.');
    } else {
      let countWithModuleId = 0;
      topicsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.module_id) {
          countWithModuleId++;
          console.log(`Тема: ${data.title}, module_id: ${data.module_id}`);
        } else {
          console.log(`Тема: ${data.title}, module_id: ВІДСУТНІЙ`);
        }
      });
      console.log(`Тем з module_id: ${countWithModuleId}/${topicsSnapshot.size}`);
    }
  } catch (error) {
    console.error('Помилка при перевірці тем:', error);
  }
}

checkTopics();
