// src/utils/constants.ts

// Informazioni sul salone
export const SALON_INFO = {
  name: "L'Angolo dell'Hair Stylist",
  address: "Via della Moda, 12, Milano",
  phone: "+39 02 12345678", // Nuovo: Numero di telefono di default
  logoUrl: 'https://placehold.co/150x150/1a1a1a/ffffff?text=Logo', // URL del logo del salone
};

// Trattamenti iniziali di default (usati per popolare Firestore se vuoto)
export const INITIAL_TREATMENTS = [
  { id: '1', name: 'Taglio Uomo', price: 25, duration: 30 },
  { id: '2', name: 'Taglio e Piega Donna', price: 50, duration: 60 },
  { id: '3', name: 'Colore', price: 70, duration: 90 },
  { id: '4', name: 'Barba', price: 15, duration: 20 },
  { id: '5', name: 'Trattamento Ristrutturante', price: 35, duration: 45 },
];

// Premi iniziali di default per il Gratta e Vinci (usati per popolare Firestore se vuoto)
export const INITIAL_PRIZES = [
    { id: 'prize1', text: '10% Sconto sul prossimo trattamento!', limits: { daily: 5, weekly: 20, monthly: 50 }, dispensed: {} },
    { id: 'prize2', text: 'Trattamento omaggio!', limits: { daily: 1, weekly: 5, monthly: 15 }, dispensed: {} },
    { id: 'prize3', text: 'Ritenta, sarai più fortunato!', limits: { daily: 999, weekly: 9999, monthly: 99999 }, dispensed: {} } // Premio "Non vinto" con limiti alti
];

// Fasce orarie disponibili per le prenotazioni
export const AVAILABLE_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Percentuale di commissione per appuntamento (se applicabile)
export const COMMISSION_FEE = 0.50;

// Sequenza di tasti per accedere al pannello Super Admin (es. freccia su, freccia su, freccia giù, freccia giù, f, c)
export const SUPER_ADMIN_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'f', 'c'];
