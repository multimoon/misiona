import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [userMissions, setUserMissions] = useState([]);

  // Funktion för att hämta användarinformation och uppdrag
  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();

      // Hämta användarinformation
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserInfo(userSnap.data());
      }

      // Hämta användarens uppdrag
      const missionsRef = collection(db, "missions");
      const missionsQuery = query(missionsRef, where("createdBy", "==", userId));
      const missionsSnapshot = await getDocs(missionsQuery);
      const missionsData = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserMissions(missionsData);
    };

    fetchData();
  }, [userId]);

  // Hantera navigering till uppdrag
  const handleMissionClick = mission => {
    navigate('/play', { state: { mission } });
  };

  // Visa laddningsskärm om användarinformation inte är tillgänglig
  if (!userInfo) {
    return <div>Laddar användarinformation...</div>;
  }

  return (
    <div className="user-profil-container">
      <div className="user-profile-circle" style={{ backgroundImage: `url(${userInfo.profileImageUrl})` }}></div>
      <p className="user-username">{userInfo.username}</p>
      <div className="user-ratings-container">
        {/* Plats för ratings eller annan info */}
      </div>
      <p className="user-chat" onClick={() => navigate(`/chat/${userId}`)}>CHAT</p>
      <hr className='user-profile-hr'/>
      <p className="user-category">MISSIONS</p>
      {userMissions.map((mission, index) => (
        <p key={index} className="user-mission-item" onClick={() => handleMissionClick(mission)}>
          {mission.titles}
        </p>
      ))}
    </div>
  );
};

export default UserProfile;
