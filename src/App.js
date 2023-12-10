import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './firebaseConfig';
import { PointsProvider } from './hooks/PointsContext'; // Importera PointsProvider
import NavigationBar from './NavigationBar';
import Create from './Pages/Create';
import Game from './Pages/Game';
import Play from './Pages/Play';
import Profil from './Pages/Profil';
import UserProfile from './Pages/UserProfile';
import Chat from './Pages/Chat';
import LoginRegister from './Pages/LoginRegister';
import useAuth from './hooks/useAuth';
import './App.css';

function App() {
  const [missions, setMissions] = useState([]);
  const { user } = useAuth(); // Använd hook för att hantera autentisering


  const handleMissionSubmit = (missionData) => {
    const newMission = { ...missionData, id: missions.length + 1 };
    setMissions(prevMissions => [...prevMissions, newMission]);
  };

  const PrivateRoute = ({ children }) => (
    user ? children : <Navigate to="/loginregister" />
  );

  return (
    <Router>
      <PointsProvider>
        <div className="App">
          <NavigationBar user={user} /> 
          <Routes>
            <Route path="/" element={<Game missions={missions} />} />
            <Route path="/create" element={<Create onSubmit={handleMissionSubmit} />} />
            <Route path="/play" element={<Play />} />
            <Route path="/loginregister" element={<LoginRegister />} />
            <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
                <Route path="/UserProfile/:userId" element={<UserProfile />} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/chat/:otherUserId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          </Routes>
        </div>
      </PointsProvider>
    </Router>
  );
}

export default App;
