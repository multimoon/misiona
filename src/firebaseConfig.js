import { initializeApp } from 'firebase/app';
import 'firebase/auth';    // Om du använder Firebase Authentication
import 'firebase/firestore';  // Om du använder Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCs2HBSsBoP2_rJCQkDR0KTUx4N5PdZS0c",
    authDomain: "misiona-d1330.firebaseapp.com",
    projectId: "misiona-d1330",
    storageBucket: "misiona-d1330.appspot.com",
    messagingSenderId: "1017785257706",
    appId: "1:1017785257706:web:4d5acd6c23954bd4231193",
    measurementId: "G-BW5PNEV0DV"
  };

// Initiera Firebase
const app = initializeApp(firebaseConfig);

export default app;
