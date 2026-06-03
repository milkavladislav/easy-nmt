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

async function testQuery() {
  try {
    console.log('Тестування запиту...');
    
    // First, get a module ID
    const modulesSnapshot = await getDocs(collection(db, 'modules'));
    const firstModule = modulesSnapshot.docs[0];
    const moduleId = firstModule.id;
    console.log(`Використовуємо module_id: ${moduleId}`);
    
    // Test the query with where and orderBy
    const topicsQuery = query(
      collection(db, 'topics'),
      where('module_id', '==', moduleId),
      orderBy('order', 'asc')
    );
    
    const topicsSnapshot = await getDocs(topicsQuery);
    console.log(`Знайдено тем для модуля: ${topicsSnapshot.size}`);
    
    topicsSnapshot.forEach(doc => {
      console.log(`Тема: ${doc.data().title}, order: ${doc.data().order}`);
    });
  } catch (error) {
    console.error('Помилка запиту:', error);
    console.error('Код помилки:', error.code);
    console.error('Повідомлення:', error.message);
  }
}

testQuery();
