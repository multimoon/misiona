import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationBar.css';
import { usePoints } from './hooks/PointsContext';

const NavigationBar = ({ user }) => {
  const { userPoints } = usePoints();
  const [previousPoints, setPreviousPoints] = useState(userPoints);
  const navigate = useNavigate();
  const location = useLocation(); // Använd useLocation för att hämta den nuvarande sökvägen


  const NavBarBack = () => {
    if (location.pathname === '/') {
      navigate('/create'); // Navigera till create.jsx om användaren är på game.jsx
    } else {
      navigate(-1); // Annars navigera ett steg tillbaka
    }
  };

  useEffect(() => {
    // Denna effekt behöver bara köras en gång vid montering
    setPreviousPoints(userPoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tomt beroendearray, ignorerar ESLint-varning

  useEffect(() => {
    if (userPoints !== previousPoints) {
      setTimeout(() => setPreviousPoints(userPoints), 5000);
    }
  }, [userPoints, previousPoints]);

  const pointsDifference = userPoints - previousPoints;
  const pointsDiffStyle = pointsDifference >= 0 ? { color: 'green' } : { color: 'red' };
  const pointsDiffDisplay = pointsDifference !== 0 ? `${pointsDifference > 0 ? '+' : ''}${pointsDifference}` : '';

  const goToProfile = () => {
    navigate('/profil');
  };

  return (
    <>
    <div className="nav-bar-back" onClick={NavBarBack}>+</div>
    <div className="navigation">
      <div className="points-difference" style={pointsDiffStyle}>{pointsDiffDisplay}</div>
      <div className="navigation-points">{userPoints} p</div>
      <div className="navigation-profile" style={{ backgroundImage: `url(${user?.profileImageUrl})` }} onClick={goToProfile}></div>
    </div>
    </>
  );
};

export default NavigationBar;
