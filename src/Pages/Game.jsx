import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import './Game.css';

const Game = ({ userPoints }) => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const missionsRef = collection(db, "missions");
    const q = query(missionsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const missionsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMissions(missionsArray);
    });

    return () => unsubscribe(); 
  }, []);


  const handleMissionClick = (mission) => {
    navigate('/play', { state: { mission } });
  };






  return (
    <div className="game-container">
      <div className="userpoint-game">{userPoints}</div>
      {missions.map((mission) => (
        <div 
          key={mission.id} 
          className="game-mission-item" 
          style={{ 
            '--start-top': `${Math.random() * 100}vh`,
            '--animation-delay': `${-10 + Math.random() * 10}s`,
          }}
          onClick={() => handleMissionClick(mission)}
        >
          <div className="game-circle"></div>
          <div className="game-mission-info">
            <p className="game-mission-title">{mission.titles}</p>
            <p className="game-mission-points">+ {mission.points} poäng</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Game;
