import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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

const topics = [
  {
    title: "Математика",
    content: `Математика - це наука про числа, структури, простори та зміни.

Основні теми НМТ з математики:

1. Алгебра:
   - Дії з дробами
   - Рівняння та нерівності
   - Функції та графіки
   - Прогресії

2. Геометрія:
   - Плоскі фігури
   - Об'ємні тіла
   - Тригонометрія

3. Аналіз:
   - Похідні
   - Інтеграли
   - Границі

Підготовка до НМТ з математики вимагає систематичного вивчення теорії та розв'язання багатьох практичних завдань.`,
    order: 1
  },
  {
    title: "Українська мова",
    content: `Українська мова - державна мова України, яка належить до слов'янської групи мов.

Основні теми НМТ з української мови:

1. Орфографія:
   - Правопис коренів слів
   - Префікси та суфікси
   - Закінчення
   - Складні випадки правопису

2. Морфологія:
   - Частини мови
   - Граматичні категорії
   - Правопис частин мови

3. Синтаксис:
   - Словосполучення
   - Речення
   - Складне речення

4. Стилістика:
   - Функціональні стилі
   - Лексичні норми
   - Граматичні норми`,
    order: 2
  },
  {
    title: "Історія України",
    content: `Історія України - це історія українського народу від давніх часів до сьогодення.

Основні періоди для НМТ:

1. Давня історія:
   - Київська Русь (IX-XIII ст.)
   - Галицько-Волинське князівство
   - Монгольська навала

2. Козацька доба:
   - Запорозька Січ
   - Національно-визвольні рухи
   - Богдан Хмельницький

3. XIX - початок XX ст.:
   - Українське національне відродження
   - Революційні події 1917-1921 рр.

4. Радянський період:
   - УРСР
   - Друга світова війна
   - Повоєнний період

5. Незалежна Україна:
   - 1991 рік - проголошення незалежності
   - Сучасний розвиток`,
    order: 3
  }
];

const tests = [
  {
    topic_id: "math",
    title: "Тест з алгебри",
    questions: [
      {
        question_text: "Яке значення виразу 2x + 5 при x = 3?",
        options: ["6", "11", "8", "13"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "Яке є коренем рівняння x² - 9 = 0?",
        options: ["3", "-3", "3 та -3", "0"],
        correct_option: 2,
        points_reward: 10
      },
      {
        question_text: "Обчисліть: 15% від 200",
        options: ["15", "30", "45", "20"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "Яке значення 2³?",
        options: ["6", "8", "9", "4"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "Розв'яжіть: 3x = 15",
        options: ["3", "5", "45", "12"],
        correct_option: 1,
        points_reward: 10
      }
    ]
  },
  {
    topic_id: "ukrainian",
    title: "Тест з орфографії",
    questions: [
      {
        question_text: "Яке слово написано правильно?",
        options: ["Під'їхав", "Підїхав", "Під'їзжав", "Підїзжав"],
        correct_option: 0,
        points_reward: 10
      },
      {
        question_text: "У якому слові пишеться буква 'и'?",
        options: ["Ц...рк", "Л...сиця", "М...шень", "Ц...ган"],
        correct_option: 3,
        points_reward: 10
      },
      {
        question_text: "Який розділовий знак потрібен у реченні: 'Мама поклала на стіл хліб і масло'?",
        options: ["Крапка", "Кома", "Крапка з комою", "Жодного"],
        correct_option: 3,
        points_reward: 10
      },
      {
        question_text: "У якому слові неправильно вжито апостроф?",
        options: ["З'явився", "Під'їхав", "Роз'яснити", "П'ятиріччя"],
        correct_option: 3,
        points_reward: 10
      },
      {
        question_text: "Яка частина мови слово 'швидко'?",
        options: ["Іменник", "Прикметник", "Прислівник", "Дієслово"],
        correct_option: 2,
        points_reward: 10
      }
    ]
  },
  {
    topic_id: "history",
    title: "Тест з історії України",
    questions: [
      {
        question_text: "У якому році було проголошено незалежність України?",
        options: ["1989", "1990", "1991", "1992"],
        correct_option: 2,
        points_reward: 10
      },
      {
        question_text: "Хто був гетьманом України під час Національно-визвольної боротьби XVII ст.?",
        options: ["Іван Мазепа", "Богдан Хмельницький", "Петро Сагайдачний", "Павло Полуботок"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "У якому році відбулася битва під Грюнвальдом?",
        options: ["1385", "1410", "1444", "1456"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "Яка подія відбулася у 1648 році?",
        options: ["Битва під Берестечком", "Початок повстання Хмельницького", "Переяславська рада", "Битва під Жовтими Водами"],
        correct_option: 1,
        points_reward: 10
      },
      {
        question_text: "Хто був першим Президентом незалежної України?",
        options: ["Леонід Кравчук", "Леонід Кучма", "Віктор Ющенко", "Петро Порошенко"],
        correct_option: 0,
        points_reward: 10
      }
    ]
  }
];

async function addTestData() {
  try {
    console.log('Додавання тестових даних...');

    // Додавання тем
    const topicIds = {};
    for (const topic of topics) {
      const docRef = await addDoc(collection(db, 'topics'), topic);
      topicIds[topic.title] = docRef.id;
      console.log(`Додано тему: ${topic.title} з ID: ${docRef.id}`);
    }

    // Додавання тестів з правильними topic_id
    for (const test of tests) {
      let topicId;
      if (test.topic_id === 'math') {
        topicId = topicIds['Математика'];
      } else if (test.topic_id === 'ukrainian') {
        topicId = topicIds['Українська мова'];
      } else if (test.topic_id === 'history') {
        topicId = topicIds['Історія України'];
      }

      const testWithTopicId = {
        ...test,
        topic_id: topicId
      };
      
      const docRef = await addDoc(collection(db, 'tests'), testWithTopicId);
      console.log(`Додано тест: ${test.title} з ID: ${docRef.id}`);
    }

    console.log('Тестові дані успішно додано!');
  } catch (error) {
    console.error('Помилка при додаванні даних:', error);
  }
}

addTestData();
