import React, { useCallback, useState, useRef, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import './Play.css';
import { usePoints } from '../hooks/PointsContext'; // Använda PointsContext

const Play = () => {
  const { userPoints, updateUserPoints } = usePoints(); // Använda userPoints och updateUserPoints från PointsContext
  const navigate = useNavigate();
  const location = useLocation();
  const mission = location.state.mission; // Ta emot mission från navigeringen

  console.log("Received mission in Play:", mission); // Lägg till denna rad

  const [creatorInfo, setCreatorInfo] = useState({ username: 'Laddar...', profileImageUrl: '' });
  const motiveringRef = useRef(null); // Skapa en ref för textarean
  const [motiveringar, setMotiveringar] = useState([]); // Array för att spara motiveringstexter med ID
  const [isImageAttached, setIsImageAttached] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null); // State för att hålla den uppladdade bilden

  const auth = getAuth();
  const loggedInUserId = auth.currentUser?.uid; // Hämta nuvarande inloggade användarens ID
  const [loggedInUser, setLoggedInUser] = useState({ username: 'Laddar...', profileImageUrl: '' });
  const db = getFirestore();


  const [viewMode, setViewMode] = useState('all'); // 'all', 'accepted', 'rewarded'


  const [showCommentBox, setShowCommentBox] = useState({}); // State för att visa kommentarsruta
  const [responses, setResponses] = useState({}); // State för att lagra svar på kommentarer

  const commentInputRefs = useRef({}); // En referens för varje unik kommentarsinmatning

  const [acceptedMotiverings, setAcceptedMotiverings] = useState({}); // Ny state för att hålla reda på accepterade motiveringar

  const [rewardedMotiverings, setRewardedMotiverings] = useState({});





  console.log("Mission:", mission);

// Funktion för att navigera till en användares profil
const goToUserProfile = (userId) => {
  if (userId === loggedInUserId) {
    navigate('/profil'); // Navigera till den inloggade användarens profil
  } else {
    navigate(`/userprofile/${userId}`); // Navigera till en annan användares profil
  }
};



  const loadMotiveringar = useCallback(async () => {
    const db = getFirestore();
    const missionRef = doc(db, "missions", mission.id);
    const motiveringCollectionRef = collection(missionRef, "motiveringar");

    try {
      const querySnapshot = await getDocs(motiveringCollectionRef);
      let loadedMotiveringar = [];
      const loadedResponses = {};
      let updatedAcceptedMotiverings = {};
      let updatedRewardedMotiverings = {};

      for (let doc of querySnapshot.docs) {
        const motiveringId = doc.id;
        const motiveringData = { id: motiveringId, ...doc.data(), createdAt: doc.data().createdAt.toDate() };

        // Lägg till status i motiveringData
        motiveringData.status = doc.data().status;

        // Uppdatera state baserat på status
        if (motiveringData.status === 'accepted') {
          updatedAcceptedMotiverings[motiveringId] = true;
        } else if (motiveringData.status === 'rewarded') {
          updatedRewardedMotiverings[motiveringId] = true;
        }

        loadedMotiveringar.push(motiveringData);

              // Hämta kommentarer för varje motivering
              const commentsRef = collection(missionRef, "motiveringar", motiveringId, "comments");
              const commentsSnapshot = await getDocs(commentsRef);
              const comments = [];
              commentsSnapshot.forEach((commentDoc) => {
                  comments.push({ id: commentDoc.id, ...commentDoc.data(), createdAt: commentDoc.data().createdAt.toDate() });
              });

              // Lagra kommentarer i loadedResponses
              loadedResponses[motiveringId] = comments;
          }

          // Sortera motiveringarna i omvänd kronologisk ordning
          loadedMotiveringar = loadedMotiveringar.sort((a, b) => b.createdAt - a.createdAt);
          setMotiveringar(loadedMotiveringar);
          setResponses(loadedResponses);
          setAcceptedMotiverings(updatedAcceptedMotiverings);
          setRewardedMotiverings(updatedRewardedMotiverings);
        } catch (error) {
        }
      }, [mission.id]);  // Lägg till beroenden som påverkar loadMotiveringar här. Om det inte finns några, lämna listan tom.





        
      useEffect(() => {
        if (mission && mission.id) {
          loadMotiveringar();
        }
      }, [mission, loadMotiveringar]);
    

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (mission && mission.createdBy) {
        const db = getFirestore();
        const userRef = doc(db, "users", mission.createdBy);

        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setCreatorInfo({
              username: docSnap.data().username || 'Anonym',
              profileImageUrl: docSnap.data().profileImageUrl || '' // Antag att det finns ett fält 'profileImageUrl'
            });
          }
        } catch (error) {
        }
      }
    };

    fetchCreatorInfo();
  }, [mission]);


  useEffect(() => {
    if (mission && mission.id) {
      loadMotiveringar();
    }
  }, [mission, loadMotiveringar]);
  

  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        // Sätt användarinformationen
        setLoggedInUser({
          username: user.displayName || 'Anonym',
          profileImageUrl: user.photoURL || ''
        });
  
        // Hämta och sätt användarens poäng
        const userRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            updateUserPoints(userDoc.data().points);
          }
        } catch (error) {
        }
      }
    });
  
    return () => unsubscribe(); // Städa upp lyssnaren när komponenten avmonteras
  }, [auth, db, updateUserPoints]);
  



  const autoGrow = () => {
    motiveringRef.current.style.height = "10px";
    motiveringRef.current.style.height = `${motiveringRef.current.scrollHeight}px`;
  };

  if (!mission) {
    return <div>Laddar...</div>;
  }

  const handleImageCheckboxChange = (event) => {
    if (event.target.checked) {
      fileInputRef.current.click(); // Öppna filväljaren
    } else {
      setUploadedFileName(""); // Rensa filnamnet
    }
    setIsImageAttached(event.target.checked);
  };

  // Uppdaterad handleFileChange för att hantera bilduppladdning
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result); // Spara bilden som en data URL
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkickaIn = async () => {
    const nyMotivering = {
      missionId: mission.id, // Lägg till uppdrags-ID
      text: motiveringRef.current.value,
      image: uploadedImage,
      username: loggedInUser.username,
      userImage: loggedInUser.profileImageUrl,
      userId: auth.currentUser.uid,  // Inkludera användarens ID här
      createdAt: new Date()
  };
  
    const db = getFirestore();
    const missionRef = doc(db, "missions", mission.id);
    const motiveringCollectionRef = collection(missionRef, "motiveringar");
  
    try {
      const docRef = await addDoc(motiveringCollectionRef, nyMotivering);
      
      // Lägg till den nya motiveringen i det lokala statet
      setMotiveringar(prevMotiveringar => [
          { ...nyMotivering, id: docRef.id, createdAt: nyMotivering.createdAt },
          ...prevMotiveringar
      ]);

    } catch (error) {
    }
  
    setUploadedImage(null);
    setUploadedFileName("");
    motiveringRef.current.value = ""; // Clear the textarea
};


const formatTimeSince = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'nu';
  if (minutes < 60) return `${minutes} min.`;
  if (hours < 24) return `${hours} tim.`;
  if (days < 7) return `${days} dagar`;
  if (weeks < 52) return `${weeks} veckor`;
  return `${years} år`;
};

  




  const showAll = () => setViewMode('all');
  const showAccepted = () => setViewMode('accepted');
  const showRewarded = () => setViewMode('rewarded');

  // Funktionen för att avgöra vilka motiveringar som ska visas
  const visibleMotiverings = () => {
    switch (viewMode) {
      case 'accepted':
        // Visa endast motiveringar som är accepterade men inte belönade
        return motiveringar.filter(motivering => acceptedMotiverings[motivering.id] && !rewardedMotiverings[motivering.id]);
      case 'rewarded':
        // Visa endast motiveringar som är belönade
        return motiveringar.filter(motivering => rewardedMotiverings[motivering.id]);
      default:
        // Visa endast motiveringar som inte är accepterade och inte belönade
        return motiveringar.filter(motivering => !acceptedMotiverings[motivering.id] && !rewardedMotiverings[motivering.id]);
    }
  };
  

  

  const toggleCommentBox = (id) => {
    setShowCommentBox(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };
  

  const handleCommentSubmit = async (motiveringId) => {
    const commentText = commentInputRefs.current[motiveringId].value;
    const newComment = {
        text: commentText,
        userImage: loggedInUser.profileImageUrl, // Lägg till den inloggade användarens profilbild
        createdAt: new Date() // Lägg till tidsstämpel
    };

    const db = getFirestore();
    const commentsRef = collection(db, "missions", mission.id, "motiveringar", motiveringId, "comments");

    try {
        const docRef = await addDoc(commentsRef, newComment);

        // Uppdatera lokala state med den nya kommentaren
        setResponses(prevState => ({
            ...prevState,
            [motiveringId]: [{ ...newComment, id: docRef.id, createdAt: new Date() }, ...(prevState[motiveringId] || [])]
        }));
    } catch (error) {
    }

    commentInputRefs.current[motiveringId].value = ''; // Rensa textarean
};


const countTotalApprovedMotiverings = () => {
  const allApprovedIds = new Set([...Object.keys(acceptedMotiverings), ...Object.keys(rewardedMotiverings)]);
  return allApprovedIds.size;
};



const handleAccept = async (motiveringId) => {
  const db = getFirestore();
  const missionRef = doc(db, "missions", mission.id);
  const motiveringRef = doc(missionRef, "motiveringar", motiveringId);

  try {
    await updateDoc(motiveringRef, {
      status: "accepted" // Uppdatera status till "accepted"
    });

    // Uppdatera lokal state
    setAcceptedMotiverings(prevState => ({
      ...prevState,
      [motiveringId]: true
    }));
  } catch (error) {
  }
};

const handleReward = async (motiveringId) => {
  const db = getFirestore();
  const missionRef = doc(db, "missions", mission.id);
  const motiveringRef = doc(missionRef, "motiveringar", motiveringId);

  try {
    const motiveringDoc = await getDoc(motiveringRef);
    if (motiveringDoc.exists()) {
      const motivering = motiveringDoc.data();

      if (Number(userPoints) >= Number(mission.points)) {
        const loggedInUserRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(loggedInUserRef, {
          points: Number(userPoints) - Number(mission.points)
        });

        // Använd userId från motiveringen för att identifiera den belönade användaren
        if (motivering.userId) {
          const rewardedUserRef = doc(db, "users", motivering.userId);
          const rewardedUserDoc = await getDoc(rewardedUserRef);
          if (rewardedUserDoc.exists()) {
            const rewardedUserPoints = Number(rewardedUserDoc.data().points);
            await updateDoc(rewardedUserRef, {
              points: rewardedUserPoints + Number(mission.points)
            });
          }
        }

        await updateDoc(motiveringRef, {
          status: "rewarded"
        });

        setRewardedMotiverings(prevState => ({
          ...prevState,
          [motiveringId]: true
        }));

        updateUserPoints(Number(userPoints) - Number(mission.points));
      } else {
      }
    }
  } catch (error) {
  }
};




const countWaitingMotiverings = () => {
  return motiveringar.filter(motivering => !acceptedMotiverings[motivering.id] && !rewardedMotiverings[motivering.id]).length;
};

const countAcceptedNotRewardedMotiverings = () => {
  return motiveringar.filter(motivering => acceptedMotiverings[motivering.id] && !rewardedMotiverings[motivering.id]).length;
};

const countRewardedMotiverings = () => {
  return motiveringar.filter(motivering => rewardedMotiverings[motivering.id]).length;
};





  return (
    <div className="play-wrapper">

      <div className="play-container">
        <div className="circle" style={{ backgroundImage: `url(${creatorInfo.profileImageUrl})` }} onClick={() => goToUserProfile(mission.createdBy)}></div>
        <div className="mission-info">
          <p className="mission-points">+ {mission.points} poäng</p>
        </div>


        <div className="username-rating-container">
        <p className="username">{creatorInfo.username}</p>
            <p className="rating">Betyg</p>
        </div>
        <p className="mission-title">{mission.titles}</p>
        <p className="mission-details">{mission.details}</p>
        <div className="villkor-time-container">
            <p className="villkor-title">Villkor</p>
            <p className="time-display">{mission.time}</p>
        </div>
        <p className='user-villkor'>{mission.conditions}</p>
        <div className='box-title-motivering'></div>
        <p className='title-motivering'>Motivering</p>
        <textarea
            className='motivering'
            placeholder="Skriv något här..."
            ref={motiveringRef} // Använd ref här
            onChange={autoGrow} // Använd onChange för att autoGrow
                
        rows={0}

           />   
 
        <div className="play-checkbox-container-picture">
          <input
            type="checkbox"
            id="attachImageCheckbox"
            checked={isImageAttached}
            onChange={handleImageCheckboxChange}
          />
          <label className='bifoga-bild' htmlFor="attachImageCheckbox">Bifoga bild</label>
          {uploadedFileName && <span className="uploaded-file-name">{uploadedFileName}</span>}
        </div>
        <p className="total-users"> {countTotalApprovedMotiverings()}/{mission.users}</p>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="play-checkbox-container">
          <input type="checkbox" id="checkbox" />
          <label className="godkann" htmlFor="checkbox">Godkänn villkor</label>
        </div>

        <div className="status-submit">
          <p>Status</p>
          <button className="skicka-in" onClick={handleSkickaIn}>SKICKA IN ▶</button>
        </div>
        <hr className="custom-hr" />

        {/* VÄNTAR DELTAR FÄRDIGA */}


        <div className="status-info">
            <p className='väntar' onClick={showAll}>{countWaitingMotiverings()} Väntar</p>
            <p onClick={showAccepted}>{countAcceptedNotRewardedMotiverings()} Deltar</p>
            <p className='klara' onClick={showRewarded}>{countRewardedMotiverings()} Klara</p>
        </div>

      <hr className="play-hr" />

      {visibleMotiverings().map(motivering => (
          <div key={motivering.id} className="motivering-item">


        {/* Visa användarens profilbild och användarnamn */}
        <div className="red-circle" style={{ backgroundImage: `url(${motivering.userImage})` }} onClick={() => goToUserProfile(motivering.userId)}></div>
        <div className="motivering-content">
          <div className="motivering-header">
            <p className="anvandare">{motivering.username}</p>
              <p className="betyg">Betyg</p>
              <p className="motivering-time">{formatTimeSince(motivering.createdAt)}</p>

              <div className="ellipsis">...</div> {/* Tre punkter */}
            </div>
            {motivering.image && <img src={motivering.image} alt="Bifogad bild" className="uploaded-image" />}
            <p className="motivering-text">{motivering.text}</p>
            <div className="motivering-footer">
            <span onClick={() => toggleCommentBox(motivering.id)}>
            {responses[motivering.id] ? `${responses[motivering.id].length} kommentarer` : '0 kommentarer'}
      </span>
      {!acceptedMotiverings[motivering.id] && viewMode === 'all' && (
        <span className="acceptera" onClick={() => handleAccept(motivering.id)}>
          Acceptera
        </span>
      )}
      {acceptedMotiverings[motivering.id] && !rewardedMotiverings[motivering.id] && viewMode !== 'rewarded' && (
        <span className="belona" onClick={() => handleReward(motivering.id)}>
          Belöna
        </span>
      )}
      {rewardedMotiverings[motivering.id] && (
        <span className={viewMode === 'rewarded' ? "klar" : "belonad"}>
          {viewMode === 'rewarded' ? 'Klar' : 'Belönad'}
        </span>
      )}

                
              
            </div>
      <hr className="comment-hr" />
      {showCommentBox[motivering.id] && (
            <>
              <textarea 
                placeholder="Skriv ditt svar här..." 
                className="comment-input"
                ref={el => commentInputRefs.current[motivering.id] = el} // Referens till denna specifika kommentarsruta
              />
              <button className='send-svar' onClick={() => handleCommentSubmit(motivering.id)}>➤</button>
              {responses[motivering.id] && responses[motivering.id].map((response, index) => (
                <div key={index} className="response-item">

                  <div className="red-circle2" style={{ backgroundImage: `url(${response.userImage})` }}></div>
                  <p className='svaret'>{response.text}</p>
                  <p className='response-time'>{formatTimeSince(response.createdAt)}</p>
                </div>
              ))}

          <hr className='end-hr' />
        </>
      )}
    </div>
  </div>
))}



        </div>
    </div>
  );
};

export default Play;
