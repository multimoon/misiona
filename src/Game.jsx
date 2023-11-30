import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

const Game = ({ challenges }) => {
  const navigate = useNavigate();
  

  const handleChallengeClick = (challenge) => {
    navigate('/play', { state: { challenge } });
  };

  const handleAddChallenge = () => {
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profil'); // Navigera till Profil-sidan
  };

  return (
    <div className="game-container">
      <div className="yellow-circle" onClick={goToProfile}></div> {/* Grön cirkel */}

      <div className="plus-icon" onClick={handleAddChallenge}>+</div>
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} // Using unique challenge id instead of array index
            className="game-challenge-item" 
            style={{ 
              '--start-top': `${Math.random() * 100}vh`,
              '--animation-delay': `${-10 + Math.random() * 10}s`, // Negative start for some items
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
