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

// Parrucchieri iniziali di default (usati per popolare Firestore se vuoto)
export const INITIAL_HAIRDRESSERS = [
  { id: 'hd1', name: 'Mario Rossi', workingHours: { //
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: null, // Riposo
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: { start: '09:00', end: '13:00' },
    sunday: null,
  }, absentDates: [] },
  { id: 'hd2', name: 'Giulia Bianchi', workingHours: { //
    monday: { start: '09:00', end: '13:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '14:30', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: null, // Riposo
    sunday: null,
  }, absentDates: [] },
  { id: 'hd3', name: 'Luca Verdi', workingHours: { //
    monday: { start: '14:00', end: '18:00' },
    tuesday: null, // Riposo
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: { start: '09:00', end: '13:00' },
    sunday: null,
  }, absentDates: [] },
];

// Fasce orarie disponibili per le prenotazioni (ora dinamiche in App.tsx)
export const AVAILABLE_SLOTS: string[] = []; // Lasciamo vuoto, sarà calcolato dinamicamente

// Percentuale di commissione per appuntamento (se applicabile)
export const COMMISSION_FEE = 0.50; // Valore di default, ora modificabile da Super Admin

// Tariffa per la generazione di immagini promozionali (lato Super Admin)
export const PROMOTION_GENERATION_FEE = 2.00; // Esempio: 2 euro per immagine generata

// Sequenza di tasti per accedere al pannello Super Admin (es. freccia su, freccia su, freccia giù, freccia giù, f, c)
export const SUPER_ADMIN_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'f', 'c'];

// Costanti per il programma fedeltà
export const LOYALTY_SETTINGS = {
  pointsPerEuro: 1, // 1 punto per ogni euro speso
  pointsPerAppointment: 10, // Punti fissi per appuntamento (alternativa o aggiunta a pointsPerEuro)
  thresholds: [ // Soglie e sconti associati
    { points: 100, discount: 10, description: '10€ di sconto' },
    { points: 200, discount: 25, description: '25€ di sconto' },
    { points: 300, discount: 50, description: 'Trattamento omaggio fino a 50€' },
  ]
};