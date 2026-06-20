import React, { useState, useMemo, type CSSProperties } from 'react';
// AGGIORNATO: Importiamo il contesto e i nuovi tipi/componenti
import { useAppContext } from '../contexts/AppContext';
import { Appointment, Employee } from '../utils/types'; // 'Hairdresser' diventa 'Employee'
import Spinner from '../components/ui/Spinner'; // Assicurati che il percorso sia corretto

// Stili (incollati dalla tua versione)
const styles: { [key: string]: CSSProperties } = {
  page: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: '"Helvetica Neue", sans-serif',
  },
  appointmentClient: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#e6c300',
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
  },
   smallButton: {
    backgroundColor: '#444',
    color: '#e6c300',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    marginTop: '10px',
  },
  // Aggiungi qui gli altri stili che potrebbero mancare
  sectionTitle: {
    color: '#e6c300',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  archiveSection: {
    marginTop: '40px',
  },
  appointmentCard: {
    backgroundColor: '#2c2c2c',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    borderLeft: '4px solid #e6c300',
  },
  appointmentServices: {
    color: '#ccc',
  },
  appointmentTotal: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noAppointmentsText: {
    color: '#888',
  },
};


// Interfaccia Props (invariata)
interface AdminScreenProps {
  setScreen: (screen: string) => void;
  setPaymentModalVisible: (visible: boolean) => void;
  setReminderModalVisible: (visible: boolean) => void;
  setSelectedAppointmentForReminder: (app: Appointment | null) => void;
  setIsPaymentSetupModalVisible: (visible: boolean) => void;
}

const AdminScreen = ({
    setIsPaymentSetupModalVisible,
    setPaymentModalVisible,
}: AdminScreenProps) => {

  // --- HOOK DEL CONTESTO REFACTURED ---
  // Ora accediamo al profilo completo del salone e alla lista dei dipendenti
  const {
    appointments,
    archivedClosures,
    hairdresserProfile, // NUOVO: Oggetto centrale con tutte le impostazioni
    employees, // NUOVO: La lista dei dipendenti (ex 'hairdressers')
    showAlert: contextShowAlert, // Rinominiamo per evitare conflitti se passato come prop
  } = useAppContext();

  const [promoDescription, setPromoDescription] = useState('');
  const [promoSubject, setPromoSubject] = useState<'woman' | 'man' | 'couple' | 'scenario' | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  // --- STATO DI CARICAMENTO ---
  // Fondamentale: mostra uno spinner finché il profilo del salone non è caricato
  if (!hairdresserProfile) {
    return <Spinner />;
  }

  // --- LOGICA AGGIORNATA ---
  // I calcoli ora usano i valori dall'oggetto 'hairdresserProfile'
  const commissionFee = hairdresserProfile.commissionFee || 0;
  const promotionGenerationFee = hairdresserProfile.promotionGenerationFee || 0;
  const promotionsGeneratedCount = hairdresserProfile.promotionsGeneratedCount || 0;
  const commissionThreshold = hairdresserProfile.commissionThreshold || Infinity;

  const totalAppointmentsDue = appointments.length * commissionFee;
  const totalPromotionsDue = promotionsGeneratedCount * promotionGenerationFee;
  const totalDue = totalAppointmentsDue + totalPromotionsDue;

  const closureRequired = useMemo(() => {
    return totalDue >= commissionThreshold;
  }, [totalDue, commissionThreshold]);

  const handlePaymentClosure = () => {
    if (appointments.length === 0 && promotionsGeneratedCount === 0) {
      contextShowAlert("Nessun Debito", "Non ci sono appuntamenti o promozioni da saldare.");
      return;
    }
    setPaymentModalVisible(true);
  };

  // Qui dovresti avere le tue funzioni 'handleGeneratePromotion' e 'handleRemovePromotion'.
  // Assicurati che usino le funzioni corrette dal contesto se necessario.

  return (
    <div style={styles.page}>
        {/*
          ATTENZIONE: Applica gli stessi cambiamenti alla parte di UI che hai omesso.
          Ad esempio, se mostri una lista di "parrucchieri", ora dovrai mappare l'array 'employees'.
          Se hai un form per cambiare le impostazioni, dovrà chiamare 'updateHairdresserProfile'.
        */}

        <div style={styles.archiveSection}>
            <h2 style={styles.sectionTitle}>Archivio Chiusure Contabili</h2>
            {archivedClosures.length > 0 ? (
                archivedClosures.map(closure => (
                    <div key={closure.id} style={styles.appointmentCard}>
                        <p style={styles.appointmentClient}>Chiusura del {new Date(closure.date).toLocaleString('it-IT')}</p>
                        <p style={styles.appointmentServices}>Appuntamenti pagati: {closure.appointmentCount}</p>
                        {closure.promotionGenerationCost !== undefined && (
                            <p style={styles.appointmentServices}>Costo Promozioni: €{closure.promotionGenerationCost.toFixed(2)}</p>
                        )}
                        <p style={styles.appointmentTotal}>Importo versato: €{closure.amountPaid.toFixed(2)}</p>
                    </div>
                ))
            ) : <p style={styles.noAppointmentsText}>Nessuna chiusura archiviata.</p>}
        </div>

        {/* --- SEZIONE PAGAMENTO AGGIORNATA --- */}
        <h2 style={{...styles.sectionTitle, marginTop: '40px'}}>Opzioni di Pagamento</h2>
        <div style={styles.appointmentCard}>
            <p style={styles.appointmentClient}>Pagamento Salone</p>
            <p style={{...styles.appointmentServices, marginTop: '10px'}}>
                {hairdresserProfile.stripeCustomerId
                    ? 'Il pagamento automatico per il tuo abbonamento è configurato.'
                    : 'Il pagamento automatico per il tuo abbonamento non è configurato.'
                }
            </p>
            <button
                style={styles.smallButton}
                onClick={() => setIsPaymentSetupModalVisible(true)}
            >
                {hairdresserProfile.stripeCustomerId ? 'Modifica Dati' : 'Configura Pagamento'}
            </button>
        </div>
      </div>
  );
};

export default AdminScreen;