import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where, collection, getFirestore, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'; // Lägg till import av updateDoc
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
      // Sätt användarnamn
      setUsername(auth.currentUser.displayName || 'Anonym');
      // Hämta användarens information från Firestore
      const db = getFirestore();
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          // Använd profilbild från Firestore om den finns, annars använd den från auth.currentUser
          const firestoreProfileImgUrl = docSnap.data().profileImageUrl;
          setProfileImageUrl(firestoreProfileImgUrl || auth.currentUser.photoURL);
        }
      });
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchUserMissions = async () => {
      if (auth.currentUser) {
        const db = getFirestore();
        const q = query(collection(db, "missions"), where("createdBy", "==", auth.currentUser.uid));
        try {
          const querySnapshot = await getDocs(q);
          const missions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserMissions(missions);
        } catch (error) {
          console.error("Fel vid hämtning av uppdrag: ", error);
        }
      }
    };
    fetchUserMissions();
  }, [auth.currentUser]);
  
  


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
    <div>
    <div className="profil-container">
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
      <p className="mission-item" key={index} onClick={() => navigateToMission(mission)}>{mission.titles}</p> // Lägg till onClick event här
    ))}
      <hr className='profile-hr'/>
      <p className="category">ONGOING</p>
      <hr className='profile-hr'/>
<p className="category">IN QUE</p>

<hr className='profile-hr'/>

      <p className="category">DONE</p>
      <div className='scroll-list'>
          <button className="edit" onClick={() => setEditMode(true)}>Edit</button>
         <button className="edit-profile-name" onClick={() => setEditMode(true)}>Redigera användarnamn</button>
          <button className="log-out-button" onClick={handleSignOut} >Logga Ut</button>
      </div>
    </div>
    </div>
  );
};

export default Profil;
