import React, { useState, useCallback, memo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { PointsProvider } from './hooks/PointsContext';
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

const GameButton = memo(() => {
  let navigate = useNavigate();
  const navigateToGame = useCallback(() => {
    navigate('/game');
  }, [navigate]);

  return (
    <div className="center-container">
      <button className="game-button" onClick={navigateToGame}>
        Gå till Game
      </button>
    </div>
  );
});

const PrivateRoute = memo(({ children, user }) => (
  user ? children : <Navigate to="/loginregister" />
));

function App() {
  const [missions, setMissions] = useState([]);
  const { user } = useAuth();

  const handleMissionSubmit = useCallback((missionData) => {
    const newMission = { ...missionData, id: missions.length + 1 };
    setMissions(prevMissions => [...prevMissions, newMission]);
  }, [missions]);

  return (
    <Router>
      <PointsProvider>
        <div className="App">
          <NavigationBar user={user} />
          <Routes>
            <Route path="/" element={<GameButton />} />
            <Route path="/game" element={<Game missions={missions} />} />
            <Route path="/create" element={<Create onSubmit={handleMissionSubmit} />} />
            <Route path="/play" element={<Play />} />
            <Route path="/loginregister" element={<LoginRegister />} />
            <Route path="/profil" element={<PrivateRoute user={user}><Profil missions={missions} /></PrivateRoute>} />
            <Route path="/UserProfile/:userId" element={<UserProfile />} />
            <Route path="/chat" element={<PrivateRoute user={user}><Chat /></PrivateRoute>} />
            <Route path="/chat/:otherUserId" element={<PrivateRoute user={user}><Chat /></PrivateRoute>} />
          </Routes>
        </div>
      </PointsProvider>
    </Router>
  );
}

export default App;
