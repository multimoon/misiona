import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Create from './Create';
import Game from './Game';
import Play from './Play';
import Profil from './Profil'; // Importera Profil-komponenten
import Chat from './Chat'; // Importera Chat-komponenten här



function App() {
  const [challenges, setChallenges] = useState([]); // Array för att lagra utmaningar

  const handleChallengeSubmit = (challengeData) => {
    // Lägg till ett unikt ID till varje ny utmaning
    const newChallenge = { ...challengeData, id: challenges.length + 1 };
    setChallenges(prevChallenges => [...prevChallenges, newChallenge]);
    // Navigering hanteras i Create-komponenten
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Create onSubmit={handleChallengeSubmit} />} />
          <Route path="/game" element={<Game challenges={challenges} />} />
          {/* Du kan behöva skicka mer specifik data till Play beroende på hur den är uppbyggd */}
          <Route path="/play" element={<Play challenge={challenges[0]} />} />
          <Route path="/profil" element={<Profil />} /> {/* Lägg till routen för Profil */}
          <Route path="/chat" element={<Chat />} /> {/* Lägg till Route för Chat */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;
