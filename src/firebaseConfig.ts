// src/firebaseConfig.ts
// Importa le funzioni necessarie dagli SDK di Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";   // Per Firestore Database
import { getStorage } from "firebase/storage";     // Per Firebase Storage
// Importa getAnalytics se hai abilitato Google Analytics nel tuo progetto
// import { getAnalytics } from "firebase/analytics";

// La tua configurazione Firebase (questi sono i tuoi placeholder forniti)
const firebaseConfig = {
  apiKey: "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0",
  authDomain: "salonewebapp.firebaseapp.com",
  projectId: "salonewebapp",
  storageBucket: "salonewebapp.firebasestorage.app",
  messagingSenderId: "891309004121",
  appId: "1:891309004121:web:56bee49f679ed876c6a848"
  // Se hai un measurementId da Analytics, aggiungilo qui:
  // measurementId: "YOUR_MEASUREMENT_ID"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta le istanze dei servizi Firebase che utilizzerai
export const db = getFirestore(app);
export const storage = getStorage(app);
// Esporta analytics se hai abilitato Google Analytics
// export const analytics = getAnalytics(app);
