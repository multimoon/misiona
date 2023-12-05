import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import './Play.css';


const Play = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state.challenge;
  const [creatorInfo, setCreatorInfo] = useState({ username: 'Laddar...', profileImageUrl: '' });
  const motiveringRef = useRef(null); // Skapa en ref för textarean
  const [motiveringar, setMotiveringar] = useState([]); // Array för att spara motiveringstexter med ID
  const [isImageAttached, setIsImageAttached] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null); // State för att hålla den uppladdade bilden

  const auth = getAuth();
  const [loggedInUser, setLoggedInUser] = useState({ username: 'Laddar...', profileImageUrl: '' });

  const [viewMode, setViewMode] = useState('all'); // 'all', 'accepted', 'rewarded'


  const [showCommentBox, setShowCommentBox] = useState({}); // State för att visa kommentarsruta
  const [responses, setResponses] = useState({}); // State för att lagra svar på kommentarer

  const commentInputRefs = useRef({}); // En referens för varje unik kommentarsinmatning

  const [acceptedMotiverings, setAcceptedMotiverings] = useState({}); // Ny state för att hålla reda på accepterade motiveringar

  const [rewardedMotiverings, setRewardedMotiverings] = useState({});

  const goToProfile = () => {
    navigate('/profil'); // Lägg till navigering till Profil-sidan
  };

  const handleBackToGame = () => {
    navigate('/game');
  };

  console.log("Challenge:", challenge);


  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (challenge && challenge.createdBy) {
        const db = getFirestore();
        const userRef = doc(db, "users", challenge.createdBy);

        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setCreatorInfo({
              username: docSnap.data().username || 'Anonym',
              profileImageUrl: docSnap.data().profileImageUrl || '' // Antag att det finns ett fält 'profileImageUrl'
            });
          }
        } catch (error) {
          console.error("Fel vid hämtning av användarinformation: ", error);
        }
      }
    };

    fetchCreatorInfo();
  }, [challenge]);

  console.log("Creator Info:", creatorInfo);

  useEffect(() => {
    if (auth.currentUser) {
      setLoggedInUser({
        username: auth.currentUser.displayName || 'Anonym',
        profileImageUrl: auth.currentUser.photoURL || ''
      });
    }
  }, [auth.currentUser]);


  useEffect(() => {
    const loadMotiveringar = async () => {
      const db = getFirestore();
      const challengeRef = doc(db, "challenges", challenge.id);
      const motiveringCollectionRef = collection(challengeRef, "motiveringar");
  
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
                const commentsRef = collection(challengeRef, "motiveringar", motiveringId, "comments");
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
            console.error("Error loading motivations and comments: ", error);
          }
        };
      
        loadMotiveringar();
      }, [challenge.id]);



  const autoGrow = () => {
    motiveringRef.current.style.height = "10px";
    motiveringRef.current.style.height = `${motiveringRef.current.scrollHeight}px`;
  };

  if (!challenge) {
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
        text: motiveringRef.current.value,
        image: uploadedImage,
        username: loggedInUser.username,  // Här antar vi att loggedInUser innehåller den inloggade användarens information
        userImage: loggedInUser.profileImageUrl,
        userId: auth.currentUser.uid,  // Lägg till användarens unika ID här
        createdAt: new Date()  // Lägg till tidsstämpel
    };
  
    const db = getFirestore();
    const challengeRef = doc(db, "challenges", challenge.id);
    const motiveringCollectionRef = collection(challengeRef, "motiveringar");
  
    try {
      const docRef = await addDoc(motiveringCollectionRef, nyMotivering);
      
      // Lägg till den nya motiveringen i det lokala statet
      setMotiveringar(prevMotiveringar => [
          { ...nyMotivering, id: docRef.id, createdAt: nyMotivering.createdAt },
          ...prevMotiveringar
      ]);
  
    } catch (error) {
      console.error("Error saving motivation: ", error);
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
    const commentsRef = collection(db, "challenges", challenge.id, "motiveringar", motiveringId, "comments");

    try {
        const docRef = await addDoc(commentsRef, newComment);

        // Uppdatera lokala state med den nya kommentaren
        setResponses(prevState => ({
            ...prevState,
            [motiveringId]: [{ ...newComment, id: docRef.id, createdAt: new Date() }, ...(prevState[motiveringId] || [])]
        }));
    } catch (error) {
        console.error("Error saving comment: ", error);
    }

    commentInputRefs.current[motiveringId].value = ''; // Rensa textarean
};


const countTotalApprovedMotiverings = () => {
  const allApprovedIds = new Set([...Object.keys(acceptedMotiverings), ...Object.keys(rewardedMotiverings)]);
  return allApprovedIds.size;
};



const handleAccept = async (motiveringId) => {
  const db = getFirestore();
  const challengeRef = doc(db, "challenges", challenge.id);
  const motiveringRef = doc(challengeRef, "motiveringar", motiveringId);

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
    console.error("Error updating accept status: ", error);
  }
};

const handleReward = async (motiveringId) => {
  const db = getFirestore();
  const challengeRef = doc(db, "challenges", challenge.id);
  const motiveringRef = doc(challengeRef, "motiveringar", motiveringId);

  try {
    // Uppdatera status till "rewarded"
    const motiveringDoc = await getDoc(motiveringRef);
    if (motiveringDoc.exists()) {
      const motiveringData = motiveringDoc.data();
      await updateDoc(motiveringRef, {
        status: "rewarded"
      });

      // Hämta användarens nuvarande poäng och uppdatera dem
      const userRef = doc(db, "users", motiveringData.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPoints = Number(userData.points) || 0; // Se till att 'points' är en siffra
        const challengePoints = Number(challenge.points) || 0; // Se till att 'challenge.points' är en siffra
        const newPoints = currentPoints + challengePoints; // Utför numerisk addition
        await updateDoc(userRef, {
          points: newPoints
        });
      }

      // Uppdatera lokal state för att reflektera den nya statusen
      setRewardedMotiverings(prevState => ({
        ...prevState,
        [motiveringId]: true
      }));
    }
  } catch (error) {
    console.error("Error updating reward status or user points: ", error);
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
      <div className="green-circle" onClick={goToProfile}></div> {/* Lägg till grön cirkel */}
        <div className="back-to-game" onClick={handleBackToGame}>+</div>
        <div className="circle" style={{ backgroundImage: `url(${creatorInfo.profileImageUrl})` }}>
          {console.log("Profile Image URL:", creatorInfo.profileImageUrl)}
        </div>
        <div className="challenge-info">
          <p className="challenge-points">+ {challenge.points} poäng</p>
        </div>

        <div className="username-rating-container">
        <p className="username">{creatorInfo.username}</p>
            <p className="rating">Betyg</p>
        </div>
        <p className="challenge-description">{challenge.description}</p>
        <p className="challenge-details">{challenge.details}</p>
        <div className="villkor-time-container">
            <p className="villkor-title">Villkor</p>
            <p className="time-display">{challenge.time}</p>
        </div>
        <p className='user-villkor'>{challenge.conditions}</p>
        <div className='box-title-motivering'></div>
        <p1 className='title-motivering'>Motivering</p1>
        <textarea
            className='motivering'
            placeholder="Skriv något här..."
            ref={motiveringRef} // Använd ref här
            onChange={autoGrow} // Använd onChange för att autoGrow
                
        rows={0}

           />   
        <p className="challenge-users">Godkända motiveringar: {countTotalApprovedMotiverings()}/{challenge.users}</p>
 
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
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="play-checkbox-container">
          <input type="checkbox" id="checkbox" />
          <label className="godkann"htmlFor="checkbox">Godkänn villkor</label>
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
        {console.log("Motivering ID:", motivering.id)}

        {/* Visa användarens profilbild och användarnamn */}
        <div className="red-circle" style={{ backgroundImage: `url(${motivering.userImage})` }}></div>
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
                   {console.log("Comment ID for Motivering", motivering.id, ":", response.id)}

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
