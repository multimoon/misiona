import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Importera för att hämta data
import './Profil.css';

const Profil = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [editMode, setEditMode] = useState(false); // State för att hantera redigeringsläge
  const [newUsername, setNewUsername] = useState(''); // State för det nya användarnamnet
  const [username, setUsername] = useState('Username'); // Ersätt med faktiskt användarnamn
  const fileInputRef = useRef(null); // Referens för filinput
  const [profileImageUrl, setProfileImageUrl] = useState(''); // State för att hantera profilbilden

  const [userMissions, setUserMissions] = useState([]); // State för att lagra användarens uppdrag


  useEffect(() => {
    if (auth.currentUser) {
      // Sätt användarnamn och profilbild
      setUsername(auth.currentUser.displayName || 'Anonym');
      if (auth.currentUser.photoURL) {
        setProfileImageUrl(auth.currentUser.photoURL);
      }

      // Hämta användarens uppdrag från Firestore
      const db = getFirestore();
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserMissions(docSnap.data().missions || []);
        }
      });
    }
  }, [auth.currentUser]);


  const handleBack = () => {
    navigate(-1);
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      // Framgångsrik utloggning, omdirigera till inloggningssidan eller startsidan
      navigate('/login');
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
        console.log('Storage-instans:', storage);
  
        const userUID = auth.currentUser ? auth.currentUser.uid : null;
        console.log('Användarens UID:', userUID);
  
        if (userUID) {
          const storageRef = ref(storage, 'profileImages/' + userUID);
          await uploadBytes(storageRef, file);
  
          const downloadURL = await getDownloadURL(storageRef);
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
          setProfileImageUrl(downloadURL);
        } else {
          console.log('Ingen giltig användare inloggad.');
        }
      } catch (error) {
        console.error('Fel vid uppladdning av profilbild:', error);
      }
    }
  };
  


  const navigateToChat = () => {
    navigate('/chat'); // Ändra '/chat' till den faktiska sökvägen till din chatt-sida
  };

  return (
    <div className="profil-container">
      <button onClick={handleBack} className="back-button">+</button>
      <button onClick={handleSignOut} className="log-out-button">Logga Ut</button>
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
            type="text" 
            value={newUsername} 
            onChange={(e) => setNewUsername(e.target.value)} 
            placeholder="Nytt användarnamn"
          />
          <button onClick={handleUsernameChange}>Spara användarnamn</button>
        </>
      ) : (
        <>
          <p className="usernamea">{username}</p>
          <button onClick={() => setEditMode(true)}>Redigera användarnamn</button>
        </>
      )}
      <div className="ratings-container">
        <div className="small-circle1"></div><span className="rating-number">170</span>
        <div className="small-circle2"></div><span className="rating-number">210</span>
        <div className="small-circle3"></div><span className="rating-number">11</span>
      </div>
      <p className="chat" onClick={navigateToChat}>CHAT</p> {/* Lägg till onClick-event här */}
      <p className="betyg-label">+ 10p</p>
      <hr className='profile-hr'/>
      <p className="category">YOUR MISSIONS</p>
        {userMissions.map((mission, index) => (
        <p key={index}>{mission}</p> // Visa varje uppdrag
        ))}
      <hr className='profile-hr'/>
      <p className="category">ONGOING</p>
      <hr className='profile-hr'/>
      <p className="category">IN QUE</p>
      <hr className='profile-hr'/>
      <p className="category">DONE</p>
    </div>
  );
};

export default Profil;
