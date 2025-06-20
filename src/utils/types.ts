// src/utils/types.ts

// Definizione dell'interfaccia per un Trattamento
export interface Treatment {
  id: string;
  name: string;
  price: number;
  duration: number; // Durata in minuti
}

// Definizione dell'interfaccia per un Premio Gratta e Vinci
export interface Prize {
  id: string;
  text: string; // Testo del premio (es: "10% Sconto", "Ritenta")
  limits: {
    daily: number; // Limite di erogazione giornaliero
    weekly: number; // Limite di erogazione settimanale
    monthly: number; // Limite di erogazione mensile
  };
  dispensed: {
    daily?: { count: number; date: string }; // Contatore giornaliero con data
    weekly?: { count: number; week: string }; // Contatore settimanale con numero settimana
    monthly?: { count: number; month: string }; // Contatore mensile con mese e anno
  };
}

// Definizione dell'interfaccia per un Dipendente/Parrucchiere
export interface Hairdresser {
  id: string;
  name: string;
  // Potremmo aggiungere in futuro: specializzazioni, orari di lavoro, etc.
}

// Definizione dell'interfaccia per un Appuntamento
export interface Appointment {
  id: string; // ID univoco dell'appuntamento (generato da Firestore)
  clientName: string; // Nome del cliente
  clientPhone: string; // Nuovo: Numero di telefono del cliente
  date: string; // Data dell'appuntamento (formato YYYY-MM-DD)
  time: string; // Ora dell'appuntamento (formato HH:MM)
  treatments: Treatment[]; // Array dei trattamenti selezionati
  total: number; // Costo totale dell'appuntamento
  prize: string; // Premio assegnato a questo appuntamento (se presente)
  hairdresserId: string; // ID del parrucchiere assegnato (NON più null)
}

// Definizione dell'interfaccia per una Chiusura Contabile Archiviata
export interface ArchivedClosure {
    id: string; // ID univoco della chiusura (generato da Firestore)
    date: string; // Data e ora della chiusura (ISO string)
    appointmentCount: number; // Numero di appuntamenti inclusi in questa chiusura
    amountPaid: number; // Importo totale delle commissioni pagate
    appointments: Appointment[]; // Dettaglio degli appuntamenti archiviati
}