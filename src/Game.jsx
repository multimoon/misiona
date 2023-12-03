import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import './Game.css';

const Game = ({ userPoints }) => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const challengesRef = collection(db, "challenges");
    const q = query(challengesRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const challengesArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChallenges(challengesArray);
    });

    return () => unsubscribe(); 
  }, []);


  const handleChallengeClick = (challenge) => {
    navigate('/play', { state: { challenge } });
  };

  const handleAddChallenge = () => {
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profil');
  };

  return (
    <div className="game-container">
      <div className="yellow-circle" onClick={goToProfile}></div>
      <div className='userpoints'>Dina poäng: {userPoints}</div>
      <div className="plus-icon" onClick={handleAddChallenge}>+</div>
      {challenges.map((challenge) => (
        <div 
          key={challenge.id} 
          className="game-challenge-item" 
          style={{ 
            '--start-top': `${Math.random() * 100}vh`,
            '--animation-delay': `${-10 + Math.random() * 10}s`,
          }}
          onClick={() => handleChallengeClick(challenge)}
        >
          <div className="game-circle"></div>
          <div className="game-challenge-info">
            <p className="game-challenge-description">{challenge.description}</p>
            <p className="game-challenge-points">+ {challenge.points} poäng</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Game;
