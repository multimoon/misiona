import React, { createContext, useState, useContext, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Skapa context
const PointsContext = createContext();

export const usePoints = () => useContext(PointsContext);

export const PointsProvider = ({ children }) => {
    const [userPoints, setUserPoints] = useState(0);
    const auth = getAuth();
    const db = getFirestore();
  
    const updateUserPoints = async (newPoints) => {
      setUserPoints(newPoints);
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { points: newPoints });
      }
    };
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserPoints(userDoc.data().points);
          }
        } else {
          setUserPoints(0);
        }
      });
  
      return () => unsubscribe();
    }, [auth, db]);
  
    return (
      <PointsContext.Provider value={{ userPoints, updateUserPoints }}>
        {children}
      </PointsContext.Provider>
    );
  };
  