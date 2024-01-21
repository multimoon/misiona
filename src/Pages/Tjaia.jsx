import React, { useEffect, useState } from 'react';
import './Tjaia.css'; // Antag att din CSS är i denna fil

const Tjaia = ({ motivations }) => {
  const [displayMotivations, setDisplayMotivations] = useState([]);

  useEffect(() => {
    let newDisplayMotivations = [...motivations];
    setDisplayMotivations(newDisplayMotivations);
  }, [motivations]);

  return (
    <div className="tjaia-container">
      {displayMotivations.map((motivation, index) => (
        <p key={index} className="slow-falling" style={{ top: `${index * 50}px` }}>
          {motivation.text}
        </p>
      ))}
    </div>
  );
};

export default Tjaia;
