import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

  const handleSkickaIn = () => {
    const nyMotivering = {
      id: motiveringar.length + 1,
      text: motiveringRef.current.value,
      image: uploadedImage // Lägg till bilden
    };

    setMotiveringar([nyMotivering, ...motiveringar]);
    setUploadedImage(null); // Rensa uppladdad bild efter inskickning
    setUploadedFileName("");
  };



  const showAll = () => setViewMode('all');
  const showAccepted = () => setViewMode('accepted');
  const showRewarded = () => setViewMode('rewarded');

  const visibleMotiverings = () => {
    switch (viewMode) {
      case 'accepted':
        return motiveringar.filter(motivering => acceptedMotiverings[motivering.id]);
      case 'rewarded':
        return motiveringar.filter(motivering => rewardedMotiverings[motivering.id]);
      default:
        return motiveringar;
    }
  };

  

  const toggleCommentBox = (id) => {
    setShowCommentBox(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };
  

  const handleCommentSubmit = (id) => {
    const commentText = commentInputRefs.current[id].value;
    const newComment = {
      id: responses[id] ? responses[id].length + 1 : 1,
      text: commentText
    };

    setResponses(prevState => ({
      ...prevState,
      [id]: [...(prevState[id] || []), newComment]
    }));

    // Rensa textarean
    commentInputRefs.current[id].value = '';
  };

  const handleAccept = (id) => {
    setAcceptedMotiverings(prevState => ({
      ...prevState,
      [id]: true
    }));
  };

  const countAcceptedMotiverings = () => {
    return Object.values(acceptedMotiverings).filter(value => value).length;
  };

  const countWaitingMotiverings = () => {
    return motiveringar.length - countAcceptedMotiverings();
  };



    // Hantera belöningar
    const handleReward = (id) => {
      setRewardedMotiverings(prevState => ({
        ...prevState,
        [id]: !prevState[id]
      }));
    };
  
    const countRewardedMotiverings = () => {
      return Object.values(rewardedMotiverings).filter(value => value).length;
    };
  
    const countAcceptedNotRewardedMotiverings = () => {
      // Räkna motiveringar som är accepterade men inte belönade
      return Object.keys(acceptedMotiverings).filter(id => acceptedMotiverings[id] && !rewardedMotiverings[id]).length;
    };



  return (
    <div className="play-wrapper">
      <div className="play-container">
      <div className="green-circle" onClick={goToProfile}></div> {/* Lägg till grön cirkel */}
        <div className="back-to-game" onClick={handleBackToGame}>+</div>
        <div className="circle" style={{ backgroundImage: `url(${creatorInfo.profileImageUrl})` }}>
          {console.log("Profile Image URL:", creatorInfo.profileImageUrl)}
        </div>
        <div className="challenge-points">+ {challenge.points} poäng</div>
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

        {/* Använd visibleMotiverings för att loopa igenom och visa motiveringstexter */}
        {visibleMotiverings().map(motivering => (
        <div key={motivering.id} className="motivering-item">
          <div className="red-circle"></div>
          <div className="motivering-content">
            <div className="motivering-header">
              <p className="anvandare">Username</p>
              <p className="betyg">Betyg</p>
              <div className="ellipsis">...</div> {/* Tre punkter */}
            </div>
            {motivering.image && <img src={motivering.image} alt="Bifogad bild" className="uploaded-image" />}
            <p className="motivering-text">{motivering.text}</p>
            <div className="motivering-footer">
              <span onClick={() => toggleCommentBox(motivering.id)}>Comments</span>
              {viewMode === 'accepted' && acceptedMotiverings[motivering.id] ?
                (<span 
                    className={`belona ${rewardedMotiverings[motivering.id] ? 'belonad' : ''}`} 
                    onClick={() => handleReward(motivering.id)}
                  >
                  {rewardedMotiverings[motivering.id] ? 'Belönad' : 'Belöna'}
                </span>) : 
                (viewMode === 'rewarded' && rewardedMotiverings[motivering.id] ? 
                (<span className="uppdatera">Befodra</span>) :
                (<span 
                    className={`acceptera ${acceptedMotiverings[motivering.id] ? 'accepted' : ''}`}
                    onClick={() => handleAccept(motivering.id)}
                  >
                    {acceptedMotiverings[motivering.id] ? 'Accepterad' : 'Acceptera'}
                  </span>)
                )
              }
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
                  <div className="red-circle2"></div>
                  <p className='svaret'>{response.text}</p>
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
