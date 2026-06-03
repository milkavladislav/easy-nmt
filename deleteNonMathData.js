import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteNonMathData() {
  try {
    console.log('Видалення даних з інших предметів...');

    // Отримуємо всі теми
    const topicsSnapshot = await getDocs(collection(db, 'topics'));
    const topicsToDelete = [];
    
    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.data();
      if (topic.title !== 'Математика') {
        topicsToDelete.push({ id: topicDoc.id, title: topic.title });
      }
    }

    // Видаляємо теми
    for (const topic of topicsToDelete) {
      await deleteDoc(doc(db, 'topics', topic.id));
      console.log(`Видалено тему: ${topic.title} (ID: ${topic.id})`);
    }

    // Отримуємо всі тести
    const testsSnapshot = await getDocs(collection(db, 'tests'));
    const testsToDelete = [];
    
    for (const testDoc of testsSnapshot.docs) {
      const test = testDoc.data();
      if (test.title !== 'Тест з алгебри') {
        testsToDelete.push({ id: testDoc.id, title: test.title });
      }
    }

    // Видаляємо тести
    for (const test of testsToDelete) {
      await deleteDoc(doc(db, 'tests', test.id));
      console.log(`Видалено тест: ${test.title} (ID: ${test.id})`);
    }

    console.log('Дані успішно видалено!');
  } catch (error) {
    console.error('Помилка при видаленні даних:', error);
  }
}

deleteNonMathData();
