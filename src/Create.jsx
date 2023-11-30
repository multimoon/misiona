import React, { useState, useRef } from 'react';
import './Create.css';
import { useNavigate } from 'react-router-dom';

const Create = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [conditions, setConditions] = useState('');
  const [automaticApproval, setAutomaticApproval] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const [milestoneText, setMilestoneText] = useState(''); // Ny state-variabel för delmåltext
  const [points, setPoints] = useState(100);
  const [users, setUsers] = useState(100);

  // Refs för textarea-elementen
  const descriptionRef = useRef(null);
  const detailsRef = useRef(null);
  const conditionsRef = useRef(null);

  const [minutesCount, setMinutesCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);

  const handleBackToGame = () => {
    navigate('/game'); // Navigera tillbaka till Game
  };

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


  const handleSubmit = (e) => {
    e.preventDefault();
    const challengeData = {
      description,
      details,
      conditions,
      points,
      users,
      time: `${daysCount}d ${hoursCount}h ${minutesCount}m` // Spara tiden i önskat format
    };
    onSubmit(challengeData); 
    navigate('/game'); // Navigera till Game-komponenten
  };


  const goToProfile = () => {
    navigate('/profil'); // Navigera till Profil-sidan
  };


  return (
    <div className="create-challenge-container">
      <div className="blue-circle" onClick={goToProfile}></div> {/* Grön cirkel */}
      <div className="create-x" onClick={handleBackToGame}>+</div>
      <form onSubmit={handleSubmit}>
        <label className='uppdrag'>Uppdrag</label>
        <textarea className='create-textarea1'
          ref={descriptionRef}
          placeholder="Gå en promenad"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            autoGrow(descriptionRef);
          }}
          rows={1}
        />

        <label htmlFor="details">Beskrivning</label>
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



        <label htmlFor="conditions">Villkor</label>
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
        <div className="checkbox-container-auto">

          <input
            type="checkbox"
            id="automaticApproval"
            checked={automaticApproval}
            onChange={(e) => setAutomaticApproval(e.target.checked)}
          />
          
          <label className="checkboxtext">Automatiskt godkännande</label>
          </div>


            
          <div className="checkbox-container-part">
          <input
            type="checkbox"
            id="milestone"
            checked={milestone}
            onChange={(e) => setMilestone(e.target.checked)}
          />
          <label className="checkboxtext">Delmål</label>
        </div>

        {/* Konditionell rendering för extra textareas */}
        {milestone && (
          <>
            <textarea
              value={milestoneText}
              onChange={(e) => setMilestoneText(e.target.value)}
              placeholder="Beskriv delmålet här"
            />
            <p className="static-text">
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
                <button className="tid" type="button" onClick={() => handleButtonClick('dagar')}>Dagar</button>
                <button className="tid" type="button" onClick={() => handleButtonClick('timmar')}>Timmar</button>
                <button className="tid" type="button" onClick={() => handleButtonClick('minuter')}>Minuter</button>
                <button className="close" type="button" onClick={() => handleButtonClick('nollställ')}>X</button>

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
