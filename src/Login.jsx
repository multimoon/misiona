import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/'); // Eller en annan relevant sida
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      navigate('/game'); // Omdirigera till game.jsx efter framgångsrik inloggning
    })
    .catch((error) => {
      console.error("Inloggningsfel: ", error);
      // Här kan du hantera fel, t.ex. visa ett felmeddelande för användaren
    });
};

  const handleGoToRegister = () => {
    navigate('/register'); // Navigera till registreringssidan
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
      <button type="submit">Logga In</button>
      <button type="button" onClick={handleGoToRegister}>Registrera</button>
      {/* Lägg till en knapp för att gå till registreringssidan */}
      <button onClick={handleBack}>Tillbaka</button>

    </form>
  );
}

export default Login;
