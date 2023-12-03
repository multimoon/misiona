import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './firebaseConfig'; // Importera din Firebase-konfiguration
import Create from './Create';
import Game from './Game';
import Play from './Play';
import Profil from './Profil';
import Chat from './Chat';
import Login from './Login'; // Antaget att du har en inloggningskomponent
import Register from './Register'; // Antaget att du har en registreringskomponent

function App() {
  const [challenges, setChallenges] = useState([]);
  const [user, setUser] = useState(null); // Lägg till användarstatus
  const [userPoints, setUserPoints] = useState(1000); // Initialisera userPoints

  const updatePoints = (newPoints) => {
    setUserPoints(newPoints);
  };

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points); // Uppdatera poäng från databas
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleChallengeSubmit = (challengeData) => {
    const newChallenge = { ...challengeData, id: challenges.length + 1 };
    setChallenges(prevChallenges => [...prevChallenges, newChallenge]);
  };

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Create onSubmit={handleChallengeSubmit} updatePoints={updatePoints} />} />
          <Route path="/game" element={<Game challenges={challenges} userPoints={userPoints} />} />
          <Route path="/play" element={<Play challenge={challenges[0]} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
