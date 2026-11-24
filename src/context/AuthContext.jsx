import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { setFullAccess } from '../utils/course150';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

function formatError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ця електронна пошта вже зареєстрована. Спробуйте увійти.';
    case 'auth/invalid-email':
      return 'Неправильний формат електронної пошти.';
    case 'auth/invalid-credential':
      return 'Неправильний email або пароль.';
    case 'auth/weak-password':
      return 'Пароль надто короткий. Використайте мінімум 6 символів.';
    case 'auth/user-not-found':
      return 'Користувача з таким email не знайдено.';
    case 'auth/wrong-password':
      return 'Неправильний пароль.';
    case 'auth/popup-closed-by-user':
      return 'Вікно авторизації закрите.';
    case 'auth/too-many-requests':
      return 'Забагато спроб. Зачекайте кілька хвилин і спробуйте ще раз.';
    case 'auth/missing-email':
      return 'Вкажіть електронну пошту.';
    case 'auth/cancelled-popup-request':
      return 'Запит авторизації скасовано.';
    default:
      return err?.message || 'Сталася помилка. Спробуйте ще раз.';
  }
}

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Redirect result is handled by onAuthStateChanged
        }
      } catch (err) {
        setError(formatError(err));
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullAccess(userData.full_access);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || userData.name || currentUser.email,
            photoURL: currentUser.photoURL,
            ...userData,
            metadata: currentUser.metadata
          });
        } else {
          setFullAccess(false);
          await setDoc(userDocRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            total_points: 0,
            completed_tests: [],
            completed_modules: [],
            createdAt: serverTimestamp()
          });
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            photoURL: currentUser.photoURL,
            total_points: 0,
            completed_tests: [],
            completed_modules: [],
            metadata: currentUser.metadata
          });
        }
      } else {
        setFullAccess(false);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      // Popup скрізь: redirect через easy-nmt.firebaseapp.com ламається в Chrome/Safari
      // (розділене стороннє сховище) — користувач повертається неавторизованим.
      // Redirect лишаємо лише як запасний варіант, коли браузер блокує спливне вікно.
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (popupErr) {
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, provider);
          return null;
        }
        throw popupErr;
      }
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') return null;
      setError(formatError(err));
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const signUp = async (name, email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const userDocRef = doc(db, 'users', result.user.uid);
      const userData = {
        name,
        email,
        total_points: 0,
        completed_tests: [],
        completed_modules: []
      };
      await setDoc(userDocRef, userData);

      setUser({
        uid: result.user.uid,
        email,
        displayName: name,
        photoURL: result.user.photoURL,
        ...userData
      });

      return result.user;
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const checkModuleCompletion = async (moduleId, topicIds) => {
    if (!user) return false;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTests = userData.completed_tests || [];
        const completedModules = userData.completed_modules || [];
        
        // Check if module is already completed
        if (completedModules.includes(moduleId)) {
          return false;
        }
        
        // Check if all topics in the module are completed
        const allTopicsCompleted = topicIds.every(topicId => 
          completedTests.some(testId => testId.startsWith(topicId))
        );
        
        if (allTopicsCompleted) {
          // Award module completion bonus
          const bonusPoints = 50; // 50 points for completing a module
          await updateDoc(userDocRef, {
            total_points: (userData.total_points || 0) + bonusPoints,
            completed_modules: arrayUnion(moduleId)
          });
          setUser({
            ...user,
            total_points: (userData.total_points || 0) + bonusPoints,
            completed_modules: [...completedModules, moduleId]
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const addPoints = async (points, testId, moduleId = null, topicIds = []) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTests = userData.completed_tests || [];
        
        if (!completedTests.includes(testId)) {
          await updateDoc(userDocRef, {
            total_points: (userData.total_points || 0) + points,
            completed_tests: arrayUnion(testId)
          });
          setUser({
            ...user,
            total_points: (userData.total_points || 0) + points,
            completed_tests: [...completedTests, testId]
          });
          
          // Check for module completion if moduleId is provided
          if (moduleId && topicIds.length > 0) {
            await checkModuleCompletion(moduleId, topicIds);
          }
          
          return true;
        }
      }
      return false;
    } catch (err) {
      setError(formatError(err));
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signIn,
    signUp,
    resetPassword,
    clearError: () => setError(null),
    logout,
    addPoints,
    checkModuleCompletion
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
