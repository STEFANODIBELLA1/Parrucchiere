// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
// Aggiunto: Importa le funzioni necessarie per Cloud Storage
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

// 🚨 SOSTITUISCI QUESTO OGGETTO con la tua configurazione copiata da Firebase Console!
// ASSICURATI CHE SIA RACCHIUSO TRA PARENTESI GRAFFE {} E CHE CI SIANO LE VIRGOLE TRA I CAMPI.
const firebaseConfig = {
  apiKey: "AIzaSyBOYMbY0w6m_SYWQdMrrErM_yvDi_SRIGY", // La tua chiave API
  authDomain: "parrucchiere-94cc1.firebaseapp.com",
  projectId: "parrucchiere-94cc1",
  storageBucket: "parrucchiere-94cc1.appspot.com", // 🚨 MOLTO IMPORTANTE: Assicurati che questo sia il tuo storageBucket dalla configurazione Firebase!
  messagingSenderId: "750803917836",
  appId: "1:750803917836:web:0c87f5ac3fd5ae9591a229"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Inizializza Cloud Storage

// Esporta le funzioni necessarie per Firestore E Cloud Storage
export { db, doc, getDoc, setDoc, storage, ref, uploadString, getDownloadURL, deleteObject };