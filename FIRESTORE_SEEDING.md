# Firestore Seeding Instructions

This guide explains how to quickly seed your Firestore database with sample data for the NMT Preparation platform.

## Prerequisites

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in your Firebase console
3. Enable Authentication and set up Google Sign-In provider
4. Update `src/firebase/config.js` with your Firebase credentials

## Method 1: Using Firebase Console (Quickest)

### Step 1: Create a Sample Topic

1. Go to Firebase Console → Firestore Database
2. Click "Start collection" and name it `topics`
3. Click "Add document" and use the following data:

**Document ID:** `topic_1`

**Fields:**
```json
{
  "title": "Mathematics: Algebra Basics",
  "content": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In algebra, letters represent numbers and operations.\n\nKey Concepts:\n\n1. Variables: Symbols (like x, y, z) that represent unknown values\n2. Equations: Mathematical statements that show two expressions are equal\n3. Functions: Relationships where each input has exactly one output\n\nBasic Operations:\n- Addition: x + y\n- Subtraction: x - y\n- Multiplication: x × y or xy\n- Division: x ÷ y or x/y\n\nExample Problem:\nSolve for x: 2x + 5 = 15\n\nSolution:\n2x = 15 - 5\n2x = 10\nx = 5",
  "order": 1
}
```

### Step 2: Create a Sample Test

1. Go back to the main Firestore view
2. Click "Start collection" and name it `tests`
3. Click "Add document" and use the following data:

**Document ID:** `test_1`

**Fields:**
```json
{
  "topic_id": "topic_1",
  "questions": [
    {
      "question_text": "What is the value of x in the equation: 2x + 5 = 15?",
      "options": [
        "x = 3",
        "x = 5",
        "x = 7",
        "x = 10",
        "x = 2"
      ],
      "correct_option": 1,
      "points_reward": 10
    },
    {
      "question_text": "Simplify: 3(x + 4) - 2x",
      "options": [
        "x + 12",
        "x + 4",
        "5x + 12",
        "x - 12",
        "3x + 12"
      ],
      "correct_option": 0,
      "points_reward": 10
    },
    {
      "question_text": "What is the slope of the line y = 2x + 3?",
      "options": [
        "3",
        "2",
        "1",
        "0",
        "-2"
      ],
      "correct_option": 1,
      "points_reward": 10
    }
  ]
}
```

## Method 2: Using Firebase SDK (Programmatic)

Create a temporary script file `seed-firestore.js` in your project root:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  try {
    // Add sample topic
    await setDoc(doc(db, 'topics', 'topic_1'), {
      title: 'Mathematics: Algebra Basics',
      content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In algebra, letters represent numbers and operations.\n\nKey Concepts:\n\n1. Variables: Symbols (like x, y, z) that represent unknown values\n2. Equations: Mathematical statements that show two expressions are equal\n3. Functions: Relationships where each input has exactly one output\n\nBasic Operations:\n- Addition: x + y\n- Subtraction: x - y\n- Multiplication: x × y or xy\n- Division: x ÷ y or x/y\n\nExample Problem:\nSolve for x: 2x + 5 = 15\n\nSolution:\n2x = 15 - 5\n2x = 10\nx = 5',
      order: 1
    });

    // Add sample test
    await setDoc(doc(db, 'tests', 'test_1'), {
      topic_id: 'topic_1',
      questions: [
        {
          question_text: 'What is the value of x in the equation: 2x + 5 = 15?',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 10', 'x = 2'],
          correct_option: 1,
          points_reward: 10
        },
        {
          question_text: 'Simplify: 3(x + 4) - 2x',
          options: ['x + 12', 'x + 4', '5x + 12', 'x - 12', '3x + 12'],
          correct_option: 0,
          points_reward: 10
        },
        {
          question_text: 'What is the slope of the line y = 2x + 3?',
          options: ['3', '2', '1', '0', '-2'],
          correct_option: 1,
          points_reward: 10
        }
      ]
    });

    console.log('Firestore seeded successfully!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
}

seedFirestore();
```

Run the script:
```bash
node seed-firestore.js
```

## Database Structure Reference

### users/{uid}
```json
{
  "name": "User Display Name",
  "email": "user@example.com",
  "total_points": 0,
  "completed_tests": []
}
```

### topics/{topicId}
```json
{
  "title": "Topic Title",
  "content": "Topic theory content (supports markdown-style formatting)",
  "order": 1
}
```

### tests/{testId}
```json
{
  "topic_id": "topic_1",
  "questions": [
    {
      "question_text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correct_option": 0,
      "points_reward": 10
    }
  ]
}
```

## Important Notes

- `correct_option` is a 0-based index (0 = first option, 1 = second option, etc.)
- Options are displayed in Cyrillic: А, Б, В, Г, Д in the UI
- `completed_tests` array in user document stores test IDs to prevent duplicate point awards
- `order` field in topics determines the display order on the dashboard
- User documents are automatically created on first sign-in via Google Auth

## Security Rules (Recommended)

For development, you can use test mode. For production, add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false;
    }
    match /tests/{testId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

This ensures:
- Users can only read/write their own user documents
- Topics and tests are publicly readable but not writable by clients
- Admin updates to topics/tests should be done through Firebase Console or admin SDK
