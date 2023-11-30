import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profil.css'; // Make sure to create and import a CSS file for Profil

const Profil = () => {
  const navigate = useNavigate();
  const username = "Username"; // Replace with actual username

  const handleBack = () => {
    navigate(-1);
  };

  const navigateToChat = () => {
    navigate('/chat'); // Ändra '/chat' till den faktiska sökvägen till din chatt-sida
  };

  return (
    <div className="profil-container">

      <button onClick={handleBack} className="back-button">+</button>
      <div className="profile-circle"></div>
      <p className="usernamea">{username}</p>
      <div className="ratings-container">
        <div className="small-circle1"></div><span className="rating-number">170</span>
        <div className="small-circle2"></div><span className="rating-number">210</span>
        <div className="small-circle3"></div><span className="rating-number">11</span>
      </div>
      <p className="chat" onClick={navigateToChat}>CHAT</p> {/* Lägg till onClick-event här */}
      <p className="betyg-label">+ 10p</p>
      <hr className='profile-hr'/>
      <p className="category">Project</p>
      <hr className='profile-hr'/>
      <p className="category">Project</p>

    </div>
  );
};

export default Profil;
