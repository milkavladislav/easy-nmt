import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            ...userDoc.data()
          });
        } else {
          await setDoc(userDocRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            total_points: 0,
            completed_tests: [],
            completed_modules: []
          });
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            total_points: 0,
            completed_tests: [],
            completed_modules: []
          });
        }
      } else {
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
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
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
