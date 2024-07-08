import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Configuración de Firebase obtenida de la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw0F1dhdVXXsi4oQ61NX48F6yUlkNF35k",
  authDomain: "dam-angel1.firebaseapp.com",
  projectId: "dam-angel1",
  storageBucket: "dam-angel1.appspot.com",
  messagingSenderId: "404514331628",
  appId: "1:404514331628:web:cff58af3227158ec9b7ec9",
  measurementId: "G-8KX7KJ38W0"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app); // Inicializa Firestore

export { storage, auth, db };