import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Se till att updateProfile är importerad
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Importera Firestore-funktioner

function Register() {
  const [username, setUsername] = useState(''); // Nytt state för användarnamn
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // Initialisera Firestore

  const handleBack = () => {
    navigate('/'); // Eller en annan relevant sida
  };


  const handleRegister = async (e) => {
    e.preventDefault();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Uppdatera användarprofilen med användarnamnet
        await updateProfile(userCredential.user, { displayName: username });
  
        // Skapa ett dokument i Firestore för användaren med startpoäng
        const userRef = doc(db, "users", userCredential.user.uid);
        setDoc(userRef, { points: 1000, username: username }) // Lägg till användarnamnet här också
          .then(() => {
            navigate('/game'); // Navigera till Game efter att dokumentet är skapat
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
    <form onSubmit={handleRegister}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Användarnamn" 
      />
      <button type="submit">Registrera</button>
      <button onClick={handleBack}>Tillbaka</button>
    </form>
  );
}

export default Register;
