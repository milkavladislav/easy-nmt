import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { modulesData } from './src/data/modulesData.js';

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

async function addModuleData() {
  try {
    console.log('Додавання модулів та тем...');

    // Додавання модулів
    const moduleIds = {};
    for (const module of modulesData) {
      const docRef = await addDoc(collection(db, 'modules'), {
        title: module.title,
        description: module.description,
        order: module.order,
        color: module.color,
        icon: module.icon
      });
      moduleIds[module.id] = docRef.id;
      console.log(`Додано модуль: ${module.title} з ID: ${docRef.id}`);
    }

    // Додавання тем для кожного модуля
    for (const module of modulesData) {
      const moduleId = moduleIds[module.id];
      
      for (const topic of module.topics) {
        const topicRef = await addDoc(collection(db, 'topics'), {
          title: topic.title,
          content: topic.content,
          order: topic.order,
          module_id: moduleId,
          module_title: module.title
        });
        console.log(`Додано тему: ${topic.title} з ID: ${topicRef.id}`);
      }
    }

    console.log('Модулі та теми успішно додано!');
  } catch (error) {
    console.error('Помилка при додаванні даних:', error);
  }
}

addModuleData();
