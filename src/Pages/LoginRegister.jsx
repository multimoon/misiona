import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import './LoginRegister.css';

function LoginRegister() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [savedEmail, setSavedEmail] = useState(''); // Ny state för sparad e-postadress
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setSavedEmail(storedEmail); // Sätt sparad e-postadress i savedEmail state
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/game');
      }
    });
  }, [navigate, auth]);

  const handleBack = () => {
    navigate('/');
  };

  const toggleRegistering = () => {
    setIsRegistering(!isRegistering);
    setUsername('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        localStorage.setItem('email', email); // Spara e-postadressen för framtida förslag
        navigate('/game');
      })
      .catch((error) => {
        console.error("Inloggningsfel: ", error);
      });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await updateProfile(userCredential.user, { displayName: username });
        const userRef = doc(db, "users", userCredential.user.uid);
        setDoc(userRef, { points: 1000, username: username })
          .then(() => {
            localStorage.setItem('email', email); // Spara e-postadressen
            navigate('/game');
          })
          .catch((error) => {
            console.error("Fel vid skapande av användardokument: ", error);
          });
      })
      .catch((error) => {
        console.error("Registreringsfel: ", error);
      });
  };

  return (
  <div className="logreg">
    <div className="container">
      <form className="reg-form" onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="E-mail"
          list="email-suggestions" 
        />
        <datalist id="email-suggestions">
          <option value={savedEmail} />
        </datalist>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>

        {isRegistering && (
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Användarnamn" 
          />
        )}

        <button className="login-button" type="submit">{isRegistering ? 'Registrera' : 'Logga In'}</button>
        <button className='login-button1' type="button" onClick={toggleRegistering}>
          {isRegistering ? 'Har redan ett konto? Logga in' : 'Inget konto? Registrera dig'}
        </button>
        <button className='tillbaka-button' onClick={handleBack}>Tillbaka</button>
      </form>
    </div>
    </div>
  );
}

export default LoginRegister;
