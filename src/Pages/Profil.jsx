import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';
import './Profil.css';

const Profil = () => {
  const { user } = useAuth();
  const [userMissions, setUserMissions] = useState([]);
  const [userMotivations, setUserMotivations] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [username, setUsername] = useState('Username');
  const fileInputRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [visibleMissionsCount, setVisibleMissionsCount] = useState(3);


  // Uppdatera profilbilden och användarnamnet baserat på inloggad användare
  useEffect(() => {
    if (user) {
      setProfileImageUrl(user.profileImageUrl || '');
      setUsername(user.displayName || 'Anonym');
    }
  }, [user]);



  useEffect(() => {
    if (user) {
      // Hämta missions från Firestore
      const fetchUserMissions = async () => {
        const db = getFirestore();
        const missionsQuery = query(collection(db, "missions"), where("createdBy", "==", user.uid));
        try {
          const querySnapshot = await getDocs(missionsQuery);
          const fetchedMissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserMissions(fetchedMissions);
        } catch (error) {
          console.error("Fel vid hämtning av missions: ", error);
        }
      };

      fetchUserMissions();
    // Hämta motivationer från Firestore
    const fetchUserMotivations = async () => {
      const db = getFirestore();
      const motivationsQuery = query(collection(db, "motiveringar"), where("userId", "==", user.uid));
      try {
        const querySnapshot = await getDocs(motivationsQuery);
        const fetchedMotivations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserMotivations(fetchedMotivations);
      } catch (error) {
        console.error("Fel vid hämtning av motivationer: ", error);
      }
    };
    fetchUserMotivations();
  }
}, [user]);
  
  
  


  
  const showMoreMissions = () => {
    setVisibleMissionsCount(prevCount => prevCount + 5);
  };


  const handleSignOut = () => {
    signOut(auth).then(() => {
      // Framgångsrik utloggning, omdirigera till inloggningssidan eller startsidan
      navigate('/LoginRegister');
    }).catch((error) => {
      // Hantera eventuella fel här
      console.error("Utloggningsfel: ", error);
    });
  };

  const handleUsernameChange = async () => {
    await updateProfile(auth.currentUser, { displayName: newUsername });
    setUsername(newUsername);
    setEditMode(false);
  };


  const triggerFileInput = () => {
    fileInputRef.current.click(); // Öppna filbläddraren
  };


  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log('Uppladdning av fil:', file.name);

        try {
            const storage = getStorage();
            const userUID = auth.currentUser ? auth.currentUser.uid : null;

            if (userUID) {
                const storageRef = ref(storage, 'profileImages/' + userUID);
                await uploadBytes(storageRef, file);

                const downloadURL = await getDownloadURL(storageRef);

                // Uppdatera användarens profilbild i Firebase Authentication
                await updateProfile(auth.currentUser, { photoURL: downloadURL });

                // Spara även URL:en i Firestore
                const db = getFirestore();
                const userRef = doc(db, "users", userUID);
                await updateDoc(userRef, { profileImageUrl: downloadURL }); // Använder updateDoc för att uppdatera dokumentet

                setProfileImageUrl(downloadURL);
                console.log('Profilbild uppdaterad i Firestore och Firebase Auth');
            } else {
                console.log('Ingen giltig användare inloggad.');
            }
        } catch (error) {
            console.error('Fel vid uppladdning av profilbild:', error);
        }
    }
};

const navigateToMission = (mission) => {
  console.log("Navigating with mission:", mission);
  navigate('/play', { state: { mission } });
};



  const navigateToChat = () => {
    navigate('/chat'); // Ändra '/chat' till den faktiska sökvägen till din chatt-sida
  };

  return (
    <div className='pro-biga'>
    <div className="profil-container">
    <p className="chat" onClick={navigateToChat}>CHAT</p>
    <div className='toptop'>
      <div 
        className="profile-circle" 
        onClick={triggerFileInput} 
        style={{ backgroundImage: `url(${profileImageUrl})` }}
      ></div>      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleProfileImageChange} 
      />
        {editMode ? (
        <>
          <input 
            className="edit-user"
            type="username" 
            value={newUsername} 
            onChange={(e) => setNewUsername(e.target.value)} 
            placeholder="Nytt användarnamn"
          />
          <button className='edit-name-input' onClick={handleUsernameChange}>Spara användarnamn</button>
        </>
      ) : (
        <>
          <p className="usernamea">{username}</p>
        </>
      )}
      <div className="ratings-container">
        <div className="small-circle1"></div><span className="rating-number">170</span>
        <div className="small-circle2"></div><span className="rating-number">210</span>
        <div className="small-circle3"></div><span className="rating-number">11</span>
      </div>

    </div>
    <p className="category">YOUR MISSIONS</p>

    <hr className='profile-hr'/>


      {userMissions.slice(0, visibleMissionsCount).map((mission, index) => (
        <p className="mission-item" key={index} onClick={() => navigateToMission(mission)}>
          {mission.titles}
        </p>
      ))}
      {visibleMissionsCount < userMissions.length && (
        <button className='show-more' onClick={showMoreMissions}>+</button>
      )}
      <hr className='profile-hr'/>




      <p className="category">IN QUE</p>

      <div className='flex-list'>
        {userMotivations.filter(motivation => motivation.status === 'in-que').map((motivation, index) => (
        <p className="motiveringar" key={index}> {motivation.text} av {motivation.username} för {motivation.missionTitle}</p>
        ))}
    </div>


    <p className="category">ONGOING</p>

      <div className='flex-list'>

       {userMotivations.filter(motivation => motivation.status === 'accepted').map((motivation, index) => (
      <p className="motiveringar" key={index}> {motivation.text} av {motivation.username} för {motivation.missionTitle}</p>
      ))}
          </div>

      <p className="category">REWARDED</p>

      <div className='flex-list'>
  {userMotivations.filter(motivation => motivation.status === 'rewarded').map((motivation, index) => (
    <p className="motiveringar" key={index}> {motivation.text} av {motivation.username} för {motivation.missionTitle}</p>
  ))}
</div>

<hr className='profile-hr'/>


      <div className="scroll-list">
         <button className="edit-profile-name" onClick={() => setEditMode(true)}>Edit Username</button>
          <button className="log-out-button" onClick={handleSignOut} >Log out</button>
      </div>
    </div>
</div>
  );
};

export default Profil;
