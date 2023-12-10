import React, { useState, useRef } from 'react';
import './Create.css';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import useAuth from '../hooks/useAuth'; // Importera useAuth
import { usePoints } from '../hooks/PointsContext';


const Create = ({ updatePoints }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateUserPoints } = usePoints(); // Lägg till detta
  const [titles, setTitles] = useState('');
  const [details, setDetails] = useState('');
  const [conditions, setConditions] = useState('');
  const [automaticApproval, setAutomaticApproval] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const [milestoneText, setMilestoneText] = useState('');
  const [points, setPoints] = useState(1);
  const [users, setUsers] = useState(10);


  const titlesRef = useRef(null);
  const detailsRef = useRef(null);
  const conditionsRef = useRef(null);

  const [minutesCount, setMinutesCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);


  const autoGrow = (element) => {
    element.current.style.height = "10px";
    element.current.style.height = (element.current.scrollHeight) + "px";
  };

  const handleButtonClick = (unit) => {
    switch (unit) {
      case 'minuter':
        setMinutesCount(prevCount => prevCount + 1);
        break;
      case 'timmar':
        setHoursCount(prevCount => prevCount + 1);
        break;
      case 'dagar':
        setDaysCount(prevCount => prevCount + 1);
        break;
      case 'nollställ':
        setMinutesCount(0);
        setHoursCount(0);
        setDaysCount(0);
        break;
      default:
        break;
    }
  };

  const resultString = daysCount === 0 && hoursCount === 0 && minutesCount === 0 
    ? 'Tid' 
    : `${daysCount > 0 ? `${daysCount} dagar ` : ''}${hoursCount > 0 ? `${hoursCount} timmar ` : ''}${minutesCount > 0 ? `${minutesCount} minuter` : ''}`;


    const handleSubmit = async (e) => {
      e.preventDefault();
      const totalCost = points * users;
    
      const missionData = {
        titles,
        details,
        conditions,
        points,
        users,
        time: `${daysCount}d ${hoursCount}h ${minutesCount}m`,
        createdBy: user ? user.uid : null, // Använd user från useAuth
      };
    
      const db = getFirestore();
      if (user) {
        const userRef = doc(db, "users", user.uid); // Använd user.uid från useAuth
    
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const currentUserPoints = docSnap.data().points;
            if (currentUserPoints >= totalCost) {
              await updateDoc(userRef, { points: currentUserPoints - totalCost });
              const missionsRef = collection(db, "missions");
              await addDoc(missionsRef, missionData);
        
              updateUserPoints(currentUserPoints - totalCost); // Uppdatera poäng direkt här
              navigate('/');
            } else {
              alert('Du har inte tillräckligt med poäng för att skapa denna utmaning.');
            
            }
          } else {
            console.log("Användardokumentet finns inte");
          }
        } catch (error) {
          console.error("Fel vid uppdatering av användarpoäng: ", error);
        }
      } else {
        console.log("Ingen användare är inloggad.");
      }
    };







  return (
    <div className="create-mission-container">

      <form className='form-form' onSubmit={handleSubmit}>

        <label className='uppdrag'>MISSION</label>
        <textarea className='create-textarea1'
          ref={titlesRef}
          placeholder="Gå en promenad"
          value={titles}
          onChange={(e) => {
            setTitles(e.target.value);
            autoGrow(titlesRef);
          }}
          rows={1}
        />

        <label htmlFor="details">DESCRIPTION</label>
        <textarea className='create-textarea'
          ref={detailsRef}
          placeholder="Gå en 30 minuters promenad"
          value={details}
          onChange={(e) => {
            setDetails(e.target.value);
            autoGrow(detailsRef);
          }}
          rows={1}
        />


<hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}



        <label htmlFor="conditions">CONDITIONS</label>
        <textarea className='create-textarea'
          ref={conditionsRef}
          placeholder="Skriv om din promenad när du är klar"
          value={conditions}
          onChange={(e) => {
            setConditions(e.target.value);
            autoGrow(conditionsRef);
          }}
          rows={0}
        />
        <br></br>
        <div className="checkbox-container">

          <input
            type="checkbox"
            id="automaticApproval"
            checked={automaticApproval}
            onChange={(e) => setAutomaticApproval(e.target.checked)}
          />
          
          <label className="checkboxtext">Automatiskt godkännande</label>
          </div>


            
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="milestone"
            checked={milestone}
            onChange={(e) => setMilestone(e.target.checked)}
          />
          <label className="checkboxtext">Delmål</label>
        </div>

        {milestone && (
          <>
            <textarea
              className='delmål'
              value={milestoneText}
              onChange={(e) => setMilestoneText(e.target.value)}
              placeholder="Beskriv delmålet här"
              
            />
            <p className="static-delmål">
              *Skriv en uppgift som måste uppfyllas och godkännas innan slutresultatet kan skickas in.
            </p>
          </>
        )}

        <hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}

        <div className='tids-resultat'>
          {resultString && <p>{resultString}</p>}
        </div>

        
        <div> 
          <div className='timethree'>
                <button type="button" className="tid" onClick={() => handleButtonClick('dagar')}>Dagar</button>
                <button type="button" className="tid" onClick={() => handleButtonClick('timmar')}>Timmar</button>
                <button type="button" className="tid" onClick={() => handleButtonClick('minuter')}>Minuter</button>
                <button type="button" className="close" onClick={() => handleButtonClick('nollställ')}>X</button>

          </div>
        </div> 


        <hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}


        <div className="slider-container"> {/* Wrapper för slider och label */}
          <label className="yellow-text">GE</label> {/* Klass för att ändra färg */}
          <input
            type="range"
            min="1"
            max="10000"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <label>{points} Poäng</label>
        </div>

        <hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}

        <div className="slider-container"> {/* Liknande wrapper för den andra slidern */}
          <label className="yellow-text">TILL</label> {/* Klass för att ändra färg */}
          <input
            type="range"
            min="1"
            max="500"
            value={users}
            onChange={(e) => setUsers(e.target.value)}
          />
          <label>{users} Användare</label>
        </div>

        <hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}


        <label className='totalkostnad'>Total kostnad: {points * users} p</label>
        <label className='sek-cost'>{(points * users / 100).toFixed(2)} KR</label>

        <hr className='create-hr' /> {/* Linje mellan "GE" och "TILL" */}



        <button className='starta' type="submit">STARTA</button>
      </form>
    </div>
  );
};

export default Create;
