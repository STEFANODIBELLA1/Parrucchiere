import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react';
// Importa i tipi dai nuovi file
import { type Treatment, type Prize, type Appointment, type ArchivedClosure, type Hairdresser } from './utils/types';
// Importa le costanti dai nuovi file
import { SALON_INFO, INITIAL_TREATMENTS, INITIAL_PRIZES, AVAILABLE_SLOTS, COMMISSION_FEE, SUPER_ADMIN_SEQUENCE, INITIAL_HAIRDRESSERS } from './utils/constants';
// Importa le funzioni utility dai nuovi file
import { getWeekNumber, getTodayString, getMonthString } from './utils/helpers';


// FIREBASE START
import { db, storage } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// FIREBASE END


// --- STILI (CSS-in-JS con tipi corretti) ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    color: '#fff',
  },
  page: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'block',
    margin: '40px auto 20px auto',
    border: '3px solid #e6c300',
    cursor: 'pointer',
  },
  salonName: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
  },
  salonAddress: {
    fontSize: '16px',
    color: '#ccc',
    textAlign: 'center',
    marginBottom: '40px',
  },
  ctaButton: {
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    padding: '18px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  ctaButtonDisabled: {
    backgroundColor: '#555',
    color: '#999',
    cursor: 'not-allowed',
  },
  ctaButtonAlert: {
    backgroundColor: '#d9534f',
    color: '#fff',
    animation: 'pulse 1.5s infinite',
  },
  aiButton: {
    backgroundColor: 'transparent',
    color: '#e6c300',
    padding: '18px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid #e6c300',
    width: '100%',
  },
  adminButton: {
    padding: '12px',
    borderRadius: '10px',
    textAlign: 'center',
    marginTop: '50px',
    backgroundColor: '#333',
    color: '#e6c300',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none'
  },
  backButton: {
    marginBottom: '20px',
    color: '#e6c300',
    fontSize: '16px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '15px',
    borderLeft: '3px solid #e6c300',
    paddingLeft: '10px'
  },
  subSectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: '10px',
    color: '#e6c300'
  },
  slotsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
  },
  slotItem: {
    padding: '12px 18px',
    backgroundColor: '#333',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '16px',
    border: '1px solid #333',
    transition: 'background-color 0.2s',
  },
  slotItemSelected: {
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  slotItemBooked: {
    backgroundColor: '#5a2d2d',
    color: '#aaa',
    cursor: 'not-allowed',
    textDecoration: 'line-through'
  },
  treatmentItem: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    border: '1px solid #444',
  },
  treatmentItemSelected: {
    backgroundColor: '#e6c300',
    borderColor: '#e6c300'
  },
  treatmentContent: {
    flex: 1,
    cursor: 'pointer',
  },
  treatmentInfoIcon: {
    marginLeft: '15px',
    fontSize: '24px',
    color: '#e6c300',
    cursor: 'pointer',
  },
  treatmentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  treatmentNameSelected: { color: '#1a1a1a' },
  treatmentDuration: {
    fontSize: '14px',
    color: '#aaa',
    marginTop: '4px',
  },
  treatmentDurationSelected: { color: '#555' },
  treatmentPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e6c300',
  },
  treatmentPriceSelected: { color: '#1a1a1a' },
    inputField: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2c2c2c',
    border: '1px solid #444', // CORREZIONE QUI
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '20px'
  },
  summaryContainer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#2c2c2c',
    borderRadius: '12px',
    borderTop: '4px solid #e6c300'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  summaryText: {
    fontSize: '16px',
    color: '#ddd',
    marginBottom: '8px'
  },
  summaryTotal: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#e6c300',
    textAlign: 'right',
    marginTop: '10px',
    marginBottom: '20px'
  },
  adminHeader: {
    textAlign: 'center',
    padding: '20px 0',
    marginBottom: '20px',
  },
  adminTitle: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#e6c300'
  },
  adminSubtitle: {
      fontSize: '16px',
      color: '#ccc'
  },
  adminAlert: {
    backgroundColor: '#d9534f',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  statsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '30px',
      gap: '20px',
  },
  statBox: {
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      flex: 1,
  },
  statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#e6c300',
  },
  statLabel: {
      fontSize: '14px',
      color: '#aaa',
      marginTop: '5px',
  },
  noAppointmentsText: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: '16px',
      marginTop: '30px'
  },
  appointmentCard: {
      backgroundColor: '#2c2c2c',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '10px'
  },
  appointmentClient: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#e6c300',
  },
  appointmentDate: {
      fontSize: '16px',
      color: '#fff',
      marginTop: '5px',
  },
  appointmentPrize: {
      fontSize: '14px',
      color: '#4caf50',
      fontWeight: 'bold',
      marginTop: '8px',
  },
  appointmentServices: {
      fontSize: '14px',
      color: '#ccc',
      marginTop: '5px',
  },
  appointmentTotal: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#e6c300',
      textAlign: 'right',
      marginTop: '10px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2c2c2c',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '500px',
    textAlign: 'center',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e6c300',
    marginBottom: '15px',
  },
  modalMessage: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '25px',
  },
  modalButton: {
    backgroundColor: '#e6c300',
    padding: '12px 40px',
    borderRadius: '10px',
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  },
  spinner: {
    border: '6px solid #333',
    borderTop: '6px solid #e6c300',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '20px auto',
  },
  calendarContainer: {
    backgroundColor: '#2c2c2c',
    padding: '15px',
    borderRadius: '12px',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  calendarNavButton: {
    background: 'none',
    border: 'none',
    color: '#e6c300',
    fontSize: '24px',
    cursor: 'pointer',
  },
  calendarMonthLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  calendarDayLabel: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '12px',
  },
  calendarDay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40px',
    cursor: 'pointer',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  calendarDaySelected: {
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  calendarDayOtherMonth: {
    color: '#555',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
  calendarDayPast: {
    color: '#555',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
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
    deleteButton: {
    backgroundColor: '#d9534f',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
  },
  archiveSection: {
    marginTop: '40px',
    borderTop: '1px solid #444',
    paddingTop: '20px'
  },
  scratchCardContainer: {
    position: 'relative',
    width: '300px',
    height: '150px',
    margin: '20px auto',
    borderRadius: '10px',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#e6c300',
    fontSize: '20px',
    fontWeight: 'bold',
    border: '2px dashed #444'
  },
  scratchCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'cell',
    borderRadius: '10px',
  },
  settingsSection: {
    backgroundColor: '#1e1e1e',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  managementList: {
      listStyle: 'none',
      padding: 0,
  },
  managementListItem: {
      backgroundColor: '#333',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
  },
    limitInputContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginTop: '10px',
        width: '100%',
    },
    limitInput: {
        width: '60px',
        padding: '5px',
        backgroundColor: '#444',
        border: '1px solid #666',
        borderRadius: '5px',
        color: '#fff',
    },
  aiSelect: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    marginBottom: '10px',
  },
  aiFormLabel: {
    fontSize: '16px',
    textAlign: 'left',
    marginBottom: '5px',
    display: 'block',
  },
  aiResultBox: {
    textAlign: 'left',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  },
  splashScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashScreenHidden: {
      opacity: 0,
      pointerEvents: 'none',
  },
  splashImage: {
      maxWidth: '90%',
      maxHeight: '90%',
      borderRadius: '15px',
      boxShadow: '0 0 30px rgba(230, 195, 0, 0.5)',
  }
};


// --- Componenti UI (Questi verranno spostati in futuro) ---

// AlertDialog Component for custom modals
const AlertDialog = ({ title, message, onClose }: { title: string; message: string; onClose: () => void }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>{title}</h2>
      <p style={styles.modalMessage}>{message}</p>
      <button style={styles.modalButton} onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

const TreatmentItem = ({ item, onSelect, isSelected, onInfoClick }: {item: Treatment, onSelect: (item: Treatment) => void, isSelected: boolean, onInfoClick: (item: Treatment) => void}) => (
  <div style={{...styles.treatmentItem, ...(isSelected && styles.treatmentItemSelected)}}>
    <div style={styles.treatmentContent} onClick={() => onSelect(item)}>
      <p style={{...styles.treatmentName, ...(isSelected && styles.treatmentNameSelected)}}>{item.name}</p>
      <p style={{...styles.treatmentDuration, ...(isSelected && styles.treatmentDurationSelected)}}>{item.duration} min</p>
    </div>
    <span style={styles.treatmentInfoIcon} onClick={() => onInfoClick(item)}>✨</span>
  </div>
);

const TimeSlot = ({ time, onSelect, isSelected, isBooked }: {time: string, onSelect: (time: string) => void, isSelected: boolean, isBooked: boolean }) => (
    <button
        style={{
            ...styles.slotItem,
            ...(isSelected && styles.slotItemSelected),
            ...(isBooked && styles.slotItemBooked)
        }}
        onClick={() => !isBooked && onSelect(time)}
        disabled={isBooked}
    >
        {time}
    </button>
);

const Calendar = ({ selectedDate, onDateSelect }: {selectedDate: string, onDateSelect: (date: string) => void}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const changeMonth = (amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderDays = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1)); // Adjust for Monday start
        
        const days = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            const dateString = day.toISOString().split('T')[0];

            const isOtherMonth = day.getMonth() !== currentMonth.getMonth();
            const isPast = day < today;
            const isSelected = dateString === selectedDate;

            days.push(
                <div 
                    key={dateString}
                    style={{
                        ...styles.calendarDay,
                        ...(isOtherMonth && styles.calendarDayOtherMonth),
                        ...(isSelected && styles.calendarDaySelected),
                        ...(isPast && styles.calendarDayPast),
                    }}
                    onClick={() => !isPast && onDateSelect(dateString)}
                >
                    {day.getDate()}
                </div>
            );
        }
        return days;
    };
    
    return (
        <div style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
                <button onClick={() => changeMonth(-1)} style={styles.calendarNavButton}>‹</button>
                <span style={styles.calendarMonthLabel}>
                    {currentMonth.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} style={styles.calendarNavButton}>›</button>
            </div>
            <div style={styles.calendarGrid}>
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => <div key={day} style={styles.calendarDayLabel}>{day}</div>)}
                {renderDays()}
            </div>
        </div>
    );
};


// --- Schermata Principale dell'App ---
export default function App() {
  const [screen, setScreen] = useState('home');
  // FIREBASE START - Inizializza con array vuoti, i dati verranno caricati da Firestore
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [archivedClosures, setArchivedClosures] = useState<ArchivedClosure[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]); // Caricati da Firestore
  const [prizes, setPrizes] = useState<Prize[]>([]); // Caricati da Firestore
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]); // Nuovo: Stato per i parrucchieri
  // FIREBASE END

  const [isConfModalVisible, setConfModalVisible] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  
  // FIREBASE STORAGE START - activePromotionImage verrà caricato da Firestore (il cui URL proviene da Storage)
  const [activePromotionImage, setActivePromotionImage] = useState<string | null>(null);
  // Nuovo: URL del logo del salone, caricato da Firestore
  const [salonLogoUrlFromFirestore, setSalonLogoUrlFromFirestore] = useState<string>(SALON_INFO.logoUrl); 
  // FIREBASE STORAGE END
  const [isSplashVisible, setIsSplashVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [clientName, setClientName] = useState('');
  // Nuovo: Stato per il numero di telefono del cliente
  const [clientPhone, setClientPhone] = useState(''); 
  const [selectedHairdresserId, setSelectedHairdresserId] = useState<string>(''); // Nuovo: ID del parrucchiere selezionato, non più null
  
  const [isAiModalVisible, setAiModalVisible] = useState(false);
  const [aiAnswers, setAiAnswers] = useState({ occasion: '', style: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(''); 

  const [isTreatmentModalVisible, setTreatmentModalVisible] = useState(false);
  const [selectedTreatmentForModal, setSelectedTreatmentForModal] = useState<Treatment | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState<Appointment | null>(null);
  const [reminderText, setReminderText] = useState('');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);

  const [isGameModalVisible, setGameModalVisible] = useState(false);
  const [isSuperAdminVisible, setSuperAdminVisible] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [logoTapCount, setLogoTapCount] = useState(0);

  // FIREBASE START - commissionThreshold e hairdresserPassword verranno gestiti su Firestore
  const [commissionThreshold, setCommissionThreshold] = useState(10.00); // Valore di default
  const [settingsPassword, setSettingsPassword] = useState('');
  const [areSettingsUnlocked, setAreSettingsUnlocked] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(commissionThreshold.toString());
  
  const [newTreatment, setNewTreatment] = useState({name: '', price: '', duration: ''});
  const [newPrize, setNewPrize] = useState('');
  const [newHairdresserName, setNewHairdresserName] = useState(''); // Nuovo: Stato per aggiungere un parrucchiere
  const [promoDescription, setPromoDescription] = useState('');
  const [promoSubject, setPromoSubject] = useState<'woman' | 'man' | 'couple' | 'scenario' | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  const [hairdresserPassword, setHairdresserPassword] = useState('parola'); // Valore di default
  const [isHairdresserLoginModalVisible, setHairdresserLoginModalModalVisible] = useState(false);
  const [hairdresserPasswordInput, setHairdresserPasswordInput] = useState('');
  const [tempHairdresserPassword, setTempHairdresserPassword] = useState(hairdresserPassword);

  // Nuovi stati per le informazioni del salone modificabili
  const [salonNameFromFirestore, setSalonNameFromFirestore] = useState(SALON_INFO.name);
  const [salonAddressFromFirestore, setSalonAddressFromFirestore] = useState(SALON_INFO.address);
  const [salonPhoneFromFirestore, setSalonPhoneFromFirestore] = useState(SALON_INFO.phone);
  // Stati temporanei per i campi di input nel Super Admin
  const [tempSalonName, setTempSalonName] = useState(SALON_INFO.name);
  const [tempSalonAddress, setTempSalonAddress] = useState(SALON_INFO.address);
  const [tempSalonPhone, setTempSalonPhone] = useState(SALON_INFO.phone);
  const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);

  // FIREBASE END

  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // State for custom alert dialog
  const [alertDialog, setAlertDialog] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const closeAlert = () => {
    setAlertDialog({ ...alertDialog, visible: false });
  };


  const closureRequired = useMemo(() => {
    return appointments.length * COMMISSION_FEE >= commissionThreshold;
  }, [appointments, commissionThreshold]);
  
  useEffect(() => {
    if(closureRequired) {
      setIsAppLocked(true);
    }
  }, [closureRequired]);

  // FIREBASE START - Caricamento iniziale dei dati da Firestore (incluso URL immagine da Storage)
  useEffect(() => {
    // Carica appuntamenti
    const unsubscribeAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const fetchedAppointments: Appointment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(fetchedAppointments);
    }, (error) => {
      console.error("Errore nel caricamento appuntamenti:", error);
      showAlert("Errore", "Impossibile caricare gli appuntamenti.");
    });

    // Carica archivio chiusure
    const unsubscribeClosures = onSnapshot(collection(db, "archivedClosures"), (snapshot) => {
      const fetchedClosures: ArchivedClosure[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArchivedClosure[];
      setArchivedClosures(fetchedClosures);
    }, (error) => {
      console.error("Errore nel caricamento archivio chiusure:", error);
      showAlert("Errore", "Impossibile caricare l'archivio chiusure.");
    });

    // Carica trattamenti
    const unsubscribeTreatments = onSnapshot(collection(db, "treatments"), (snapshot) => {
      const fetchedTreatments: Treatment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Treatment[];
      // Popola con dati iniziali se non ci sono trattamenti
      if (fetchedTreatments.length === 0) {
        INITIAL_TREATMENTS.forEach(t => addDoc(collection(db, "treatments"), t));
        setTreatments(INITIAL_TREATMENTS); // Imposta subito per evitare delay
      } else {
        setTreatments(fetchedTreatments);
      }
    }, (error) => {
      console.error("Errore nel caricamento trattamenti:", error);
      showAlert("Errore", "Impossibile caricare i trattamenti.");
    });

    // Carica premi
    const unsubscribePrizes = onSnapshot(collection(db, "prizes"), (snapshot) => {
      const fetchedPrizes: Prize[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prize[];
       // Popola con dati iniziali se non ci sono premi
      if (fetchedPrizes.length === 0) {
        INITIAL_PRIZES.forEach(p => addDoc(collection(db, "prizes"), p));
        setPrizes(INITIAL_PRIZES); // Imposta subito per evitare delay
      } else {
        setPrizes(fetchedPrizes);
      }
    }, (error) => {
      console.error("Errore nel caricamento premi:", error);
      showAlert("Errore", "Impossibile caricare i premi.");
    });

    // Nuovo: Carica parrucchieri
    const unsubscribeHairdressers = onSnapshot(collection(db, "hairdressers"), (snapshot) => {
      const fetchedHairdressers: Hairdresser[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hairdresser[];
      if (fetchedHairdressers.length === 0) {
        INITIAL_HAIRDRESSERS.forEach(hd => addDoc(collection(db, "hairdressers"), hd));
        setHairdressers(INITIAL_HAIRDRESSERS);
      } else {
        setHairdressers(fetchedHairdressers);
      }
    }, (error) => {
      console.error("Errore nel caricamento parrucchieri:", error);
      showAlert("Errore", "Impossibile caricare i parrucchieri.");
    });

    // Carica impostazioni globali (soglia commissione, password parrucchiere, immagine promozionale URL, info salone)
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "appSettings"), (docSnap) => {
      if (docSnap.exists()) {
        const settingsData = docSnap.data();
        setCommissionThreshold(settingsData.commissionThreshold || 10.00);
        setTempThreshold((settingsData.commissionThreshold || 10.00).toString());
        setHairdresserPassword(settingsData.hairdresserPassword || 'parola');
        setTempHairdresserPassword(settingsData.hairdresserPassword || 'parola');
        // Firebase Storage: Carica l'URL dell'immagine da Firestore
        setActivePromotionImage(settingsData.activePromotionImageUrl || null);
        // Nuovo: Carica info salone da Firestore
        setSalonNameFromFirestore(settingsData.salonName || SALON_INFO.name);
        setTempSalonName(settingsData.salonName || SALON_INFO.name);
        setSalonAddressFromFirestore(settingsData.salonAddress || SALON_INFO.address);
        setTempSalonAddress(settingsData.salonAddress || SALON_INFO.address);
        setSalonPhoneFromFirestore(settingsData.salonPhone || SALON_INFO.phone);
        setTempSalonPhone(settingsData.salonPhone || SALON_INFO.phone);
        setSalonLogoUrlFromFirestore(settingsData.salonLogoUrl || SALON_INFO.logoUrl); // Carica l'URL del logo
      } else {
        // Se le impostazioni non esistono, creale con valori di default
        setDoc(doc(db, "settings", "appSettings"), {
          commissionThreshold: 10.00,
          hairdresserPassword: 'parola',
          activePromotionImageUrl: null,
          // Nuovo: Inizializza info salone con valori di default
          salonName: SALON_INFO.name,
          salonAddress: SALON_INFO.address,
          salonPhone: SALON_INFO.phone,
          salonLogoUrl: SALON_INFO.logoUrl, // Inizializza l'URL del logo a default
        });
      }
    }, (error) => {
      console.error("Errore nel caricamento impostazioni:", error);
      showAlert("Errore", "Impossibile caricare le impostazioni.");
    });

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeAppointments();
      unsubscribeClosures();
      unsubscribeTreatments();
      unsubscribePrizes();
      unsubscribeHairdressers(); // Cleanup per i parrucchieri
      unsubscribeSettings();
    };
  }, []); // Esegui solo una volta all'avvio

  useEffect(() => {
    if (activePromotionImage) {
      setIsSplashVisible(true);
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
        setIsSplashVisible(false);
    }
  }, [activePromotionImage]);

  // FIREBASE END


  // Key sequence listener for Super Admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        setKeySequence(prev => [...prev, e.key].slice(-SUPER_ADMIN_SEQUENCE.length));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
      if (keySequence.join('') === SUPER_ADMIN_SEQUENCE.join('')) {
          setSuperAdminVisible(true);
          setKeySequence([]);
      }
  }, [keySequence]);

  const handleLogoTap = () => {
      const newCount = logoTapCount + 1;
      setLogoTapCount(newCount);
      if (newCount === 7) {
          setSuperAdminVisible(true);
          setLogoTapCount(0);
      }
      // Reset tap count if not enough taps within 2 seconds
      setTimeout(() => {
          if (logoTapCount > 0 && newCount < 7) {
              setLogoTapCount(0);
          }
      }, 2000);
  };

  const totalCost = useMemo(() => selectedTreatments.reduce((sum, t) => sum + t.price, 0), [selectedTreatments]);

  // FIREBASE START - Funzione handleBooking modificata per Firestore
  const handleBooking = async () => {
    if (!clientName.trim()) {
        showAlert("Errore di input", "Per favore, inserisci il tuo nome.");
        return;
    }
    if (!clientPhone.trim()) { // Nuovo: Validazione del numero di telefono
      showAlert("Errore di input", "Per favore, inserisci il tuo numero di telefono.");
      return;
    }
    if (!selectedHairdresserId) { // Nuovo: Validazione del parrucchiere
        showAlert("Errore di input", "Per favore, scegli un parrucchiere.");
        return;
    }
    
    try {
        const newBooking: Appointment = {
            id: '', // L'ID verrà generato da Firestore
            clientName: clientName,
            clientPhone: clientPhone, // Nuovo: Aggiunto numero di telefono
            date: selectedDate,
            time: selectedSlot,
            treatments: selectedTreatments,
            total: totalCost,
            prize: '',
            hairdresserId: selectedHairdresserId, // Nuovo: Aggiunto ID del parrucchiere
        };
        
        const docRef = await addDoc(collection(db, "appointments"), newBooking);
        setLastBookingId(docRef.id); // Firestore genera l'ID

        // Aggiorna lo stato localmente con l'ID generato (onSnapshot lo farà in background, ma questo è più immediato)
        setAppointments(prev => [...prev, { ...newBooking, id: docRef.id }]);
        
        setSelectedDate('');
        setSelectedSlot('');
        setSelectedTreatments([]);
        setClientName('');
        setClientPhone(''); // Nuovo: Resetta il campo telefono
        setSelectedHairdresserId(''); // Nuovo: Resetta il parrucchiere selezionato
        setConfModalVisible(true);
    } catch (error) {
        console.error("Errore durante la prenotazione:", error);
        showAlert("Errore", "Impossibile completare la prenotazione. Riprova.");
    }
  };
  // FIREBASE END
  
  const handleCloseConfirmationModal = () => {
    setConfModalVisible(false);
    setGameModalVisible(true);
  };

  // FIREBASE START - Funzione handleGameEnd modificata per Firestore
  const handleGameEnd = async (prizeWon: Prize | null) => {
    if (lastBookingId) {
      try {
        const appointmentRef = doc(db, "appointments", lastBookingId);
        await updateDoc(appointmentRef, { prize: prizeWon ? prizeWon.text : '' });

        if (prizeWon) {
          const prizeRef = doc(db, "prizes", prizeWon.id);
          // PRIMA DI AGGIORNARE, LEGGI IL DOCUMENTO PER ASSICURARTI CHE ESISTA
          const prizeDocSnap = await getDoc(prizeRef);
          if (prizeDocSnap.exists()) {
              const currentPrizeDocData = prizeDocSnap.data() as Prize; // Cast per TypeScript
              const today = getTodayString();
              const week = getWeekNumber(new Date());
              const month = getMonthString(new Date());

              // Calcola i contatori aggiornati basati sui dati attuali nel DB
              const dailyCount = currentPrizeDocData.dispensed.daily?.date === today ? (currentPrizeDocData.dispensed.daily.count || 0) : 0;
              const weeklyCount = currentPrizeDocData.dispensed.weekly?.week === week ? (currentPrizeDocData.dispensed.weekly.count || 0) : 0;
              const monthlyCount = currentPrizeDocData.dispensed.monthly?.month === month ? (currentPrizeDocData.dispensed.monthly.count || 0) : 0;

              await updateDoc(prizeRef, {
                dispensed: {
                  daily: { count: dailyCount + 1, date: today },
                  weekly: { count: weeklyCount + 1, week: week },
                  monthly: { count: monthlyCount + 1, month: month }
                }
              });
          } else {
              console.warn(`Tentativo di aggiornare un premio non esistente: ${prizeWon.id}`);
              // Puoi aggiungere qui una logica per creare il documento se non esiste, se appropriato
              // Ad esempio: await setDoc(prizeRef, { ...prizeWon, dispensed: { ... } });
          }
        }
      } catch (error: any) { // Tipizza l'errore come 'any' o 'FirebaseError' per accedere a .message
        console.error("Errore durante l'aggiornamento del premio:", error);
        showAlert("Errore", `Impossibile salvare i dati del premio: ${error.message || 'Errore sconosciuto'}`);
      }
    }
    setLastBookingId(null);
    setGameModalVisible(false);
    setScreen('home');
    if (closureRequired) {
      showAlert("APP BLOCCATA", "ATTENZIONE: L'app è bloccata. È necessario saldare il conto nell'Area Riservata per continuare a ricevere prenotazioni.");
      setScreen('admin');
    }
  }
  // FIREBASE END

  // FIREBASE STORAGE START - Funzione generatePromoImage per Firebase Storage
  const generatePromoImage = async () => {
      if (!promoDescription.trim()) {
          showAlert("Input Richiesto", "Inserisci una descrizione per la promozione.");
          return;
      }
      if (!promoSubject) {
          showAlert("Soggetto Richiesto", "Seleziona se il soggetto della promozione è 'Donna', 'Uomo', 'Coppia' o 'Scenario'.");
          return;
      }

      setIsGeneratingPromo(true);
      setActivePromotionImage(null); // Resetta temporaneamente l'immagine

      try {
          let backgroundPrompt = '';
          if (promoSubject === 'woman') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una modella con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'man') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare un modello uomo con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'couple') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un uomo e una donna) con tagli di capelli artistici e d'avanguardia, in pose dinamiche e stravaganti. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli dei tagli e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dai soggetti principali. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'scenario') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un'uomo e una donna) con tagli di capelli artistici e d'avanguardia, immersi in un contesto di sfondo casuale, ma elegante e di lusso (es. un loft urbano, un giardino segreto, una galleria d'arte). Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle in relazione all'ambiente circostante. L'illuminazione deve essere drammatica per esaltare i dettagli dei tagli e i colori. L'immagine non deve contenere testo, loghi o brand.";
          }
          
          const payload = { instances: [{ prompt: backgroundPrompt }], parameters: { "sampleCount": 1} };
          // CAMBIA QUI: Inserisci la tua VERA API Key di Google Gemini
          const apiKey = "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0"; // La tua chiave API Gemini
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
          
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const result = await response.json();

          if (!result.predictions || result.predictions.length === 0 || !result.predictions[0].bytesBase64Encoded) {
              throw new Error("La generazione dello sfondo AI è fallita.");
          }
          const backgroundBase64 = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Impossibile ottenere il contesto del canvas");
          canvas.width = 1024;
          canvas.height = 1024;

          const backgroundImg = new Image();
          const logoImg = new Image();
          logoImg.crossOrigin = "Anonymous";

          const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error(`Impossibile caricare l'immagine: ${src}`));
              img.src = src;
          });

          await Promise.all([
              loadImage(backgroundImg, backgroundBase64),
              loadImage(logoImg, salonLogoUrlFromFirestore) // Usa il logo caricato da Firestore
          ]);
          
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 80px "Montserrat", "Helvetica Neue", sans-serif'; 
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;

          const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
              const words = text.split(' ');
              let line = '';
              const lines: string[] = [];
              for(let n = 0; n < words.length; n++) {
                  const testLine = line + words[n] + ' ';
                  const metrics = ctx.measureText(testLine);
                  if (metrics.width > maxWidth && n > 0) {
                      lines.push(line);
                      line = words[n] + ' ';
                  } else {
                      line = testLine;
                  }
              }
              lines.push(line);
              
              let currentY = y - ((lines.length - 1) * lineHeight);
              for (let i = 0; i < lines.length; i++) {
                  ctx.fillText(lines[i].trim(), x, currentY);
                  currentY += lineHeight;
              }
          };

          const textPaddingBottom = 80;
          wrapText(promoDescription, canvas.width / 2, canvas.height - textPaddingBottom, canvas.width - 150, 95);
          
          ctx.shadowColor = 'transparent';

          const logoPadding = 40;
          const logoSize = 120;
          const logoX = canvas.width - logoSize - logoPadding;
          const logoY = logoPadding;
          
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          // Ottieni il Blob dall'immagine finale del canvas per caricarlo su Firebase Storage
          const finalImageBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(blob => {
                  if (blob) resolve(blob);
                  else reject(new Error("Impossibile creare il Blob dall'immagine per Firebase Storage."));
              }, 'image/png');
          });

          // FIREBASE STORAGE START: Caricamento su Firebase Storage
          const imageFileName = `promotions/${Date.now()}.png`; // Nome file unico
          const imageRef = ref(storage, imageFileName); // Crea un riferimento allo storage
          await uploadBytes(imageRef, finalImageBlob); // Carica il Blob
          const downloadURL = await getDownloadURL(imageRef); // Ottieni l'URL pubblico
          // FIREBASE STORAGE END

          setActivePromotionImage(downloadURL);
          // FIREBASE: Salva l'URL dell'immagine in Firestore (associato alle impostazioni dell'app)
          await updateDoc(doc(db, "settings", "appSettings"), { activePromotionImageUrl: downloadURL });

          showAlert("Successo", "Immagine promozionale creata e impostata come splash screen!");

      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
          console.error("Errore generazione immagine promo:", error);
          const errorMessage = error.message || "Errore sconosciuto";
          showAlert("Errore AI", `Errore durante la creazione dell'immagine promozionale: ${errorMessage}`);
      } finally {
          setIsGeneratingPromo(false);
      }
  };

  // FIREBASE STORAGE START: Funzione removePromotionImage per Firebase Storage
  const removePromotionImage = async () => {
    if (!activePromotionImage) return; // Se non c'è un'immagine attiva, non fare nulla
    try {
      // Crea un riferimento all'immagine in Firebase Storage usando l'URL completo
      const imageToDeleteRef = ref(storage, activePromotionImage);
      await deleteObject(imageToDeleteRef); // Elimina l'immagine da Firebase Storage

      // Rimuovi l'URL dell'immagine dall'impostazione di Firestore
      await updateDoc(doc(db, "settings", "appSettings"), { activePromotionImageUrl: null });
      setActivePromotionImage(null); // Aggiorna lo stato locale
      showAlert("Successo", "Immagine promozionale rimossa!");
    } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
      console.error("Errore durante la rimozione dell'immagine promozionale:", error);
      showAlert("Errore", `Impossibile rimuovere l'immagine promozionale: ${error.message || 'Errore sconosciuto'}`);
    }
  }
  // FIREBASE STORAGE END

  // Nuovo: Funzione per salvare le informazioni del salone
  const handleSaveSalonInfo = async () => {
    if (!tempSalonName.trim() || !tempSalonAddress.trim() || !tempSalonPhone.trim()) {
      showAlert("Campi Mancanti", "Compila tutti i campi delle informazioni del salone.");
      return;
    }
    try {
      await updateDoc(doc(db, "settings", "appSettings"), {
        salonName: tempSalonName,
        salonAddress: tempSalonAddress,
        salonPhone: tempSalonPhone,
      });
      setSalonNameFromFirestore(tempSalonName);
      setSalonAddressFromFirestore(tempSalonAddress);
      setSalonPhoneFromFirestore(tempSalonPhone);
      showAlert("Successo", "Informazioni salone aggiornate!");
    } catch (error: any) {
      console.error("Errore nel salvataggio info salone:", error);
      showAlert("Errore", `Impossibile salvare le informazioni del salone: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  // Nuovo: Funzione per caricare il logo
  const handleLogoUpload = async () => {
    if (!tempLogoFile) {
      showAlert("File Mancante", "Seleziona un file immagine da caricare.");
      return;
    }
    try {
      const logoFileName = `salon_logo/logo_${Date.now()}.png`; // Nome file unico
      const logoRef = ref(storage, logoFileName);
      await uploadBytes(logoRef, tempLogoFile);
      const downloadURL = await getDownloadURL(logoRef);

      // Elimina il vecchio logo se esiste un URL diverso dal placeholder di default
      if (salonLogoUrlFromFirestore && salonLogoUrlFromFirestore !== SALON_INFO.logoUrl) { 
        try {
          const oldPath = new URL(salonLogoUrlFromFirestore).pathname.split('/o/')[1].split('?')[0];
          const decodedOldPath = decodeURIComponent(oldPath);
          await deleteObject(ref(storage, decodedOldPath));
        } catch (deleteError) {
          console.warn("Errore durante l'eliminazione del vecchio logo:", deleteError);
        }
      }

      await updateDoc(doc(db, "settings", "appSettings"), { salonLogoUrl: downloadURL });
      setSalonLogoUrlFromFirestore(downloadURL);
      setTempLogoFile(null); // Resetta il file selezionato
      showAlert("Successo", "Logo caricato e aggiornato!");
    } catch (error: any) {
      console.error("Errore nel caricamento logo:", error);
      showAlert("Errore", `Impossibile caricare il logo: ${error.message || 'Errore sconosciuto'}`);
    }
  };


  // FIREBASE START - Funzione handleAccountingClosure modificata per Firestore
  const handleAccountingClosure = async () => {
    const totalDue = appointments.length * COMMISSION_FEE;
    const newClosure: ArchivedClosure = {
        id: '', // Firestore genererà l'ID
        date: new Date().toISOString(),
        appointmentCount: appointments.length,
        amountPaid: totalDue,
        appointments: [...appointments] // Copia degli appuntamenti correnti
    };

    try {
        await addDoc(collection(db, "archivedClosures"), newClosure); // Aggiungi la chiusura all'archivio
        
        // Elimina tutti gli appuntamenti correnti dalla collezione "appointments"
        const q = collection(db, "appointments");
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "appointments", d.id)));
        await Promise.all(deletePromises);

        // Resetta i contatori dispensed dei premi
        const prizeResetPromises = prizes.map(p => {
          const prizeRef = doc(db, "prizes", p.id);
          // Imposta dispensed a un oggetto vuoto, resettando i contatori
          return updateDoc(prizeRef, { dispensed: {} });
        });
        await Promise.all(prizeResetPromises);


        // La rimozione degli appuntamenti dallo stato locale avverrà automaticamente tramite onSnapshot
        setIsAppLocked(false);
        setPaymentModalVisible(false);
        showAlert('Contabilità Chiusa', 'Pagamento registrato e contabilità chiusa con successo! App sbloccata.');
    } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore durante la chiusura contabile:", error);
        showAlert("Errore", `Impossibile chiudere la contabilità: ${error.message || 'Errore sconosciuto'}`);
    }
  };
  // FIREBASE END

  const unlockSettings = () => {
    if (settingsPassword === 'freecent2025') {
        setAreSettingsUnlocked(true);
        setSettingsPassword('');
    } else {
        showAlert('Accesso Negato', 'Password errata!');
    }
  };

  // FIREBASE START - Funzione saveSettings modificata per Firestore
  const saveSettings = async () => {
    const newThreshold = parseFloat(tempThreshold);
    if (isNaN(newThreshold) || newThreshold <= 0) {
        showAlert("Errore di input", "Inserisci un valore valido per la soglia.");
        return;
    }
    
    try {
        await updateDoc(doc(db, "settings", "appSettings"), {
            commissionThreshold: newThreshold
        });
        setCommissionThreshold(newThreshold);
        setAreSettingsUnlocked(false);
        showAlert('Impostazioni Salvate', 'Impostazioni salvate!');
    } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nel salvataggio impostazioni:", error);
        showAlert("Errore", `Impossibile salvare le impostazioni: ${error.message || 'Errore sconosciuto'}`);
    }
  };
  // FIREBASE END

  // FIREBASE START - Funzione saveHairdresserPassword modificata per Firestore
  const saveHairdresserPassword = async () => {
      if(!tempHairdresserPassword.trim()){
          showAlert('Errore', 'La password non può essere vuota.');
          return;
      }
      try {
        await updateDoc(doc(db, "settings", "appSettings"), {
            hairdresserPassword: tempHairdresserPassword
        });
        setHairdresserPassword(tempHairdresserPassword);
        setAreSettingsUnlocked(false);
        showAlert('Password Aggiornata', 'Password parrucchiere aggiornata!');
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nel salvataggio password parrucchiere:", error);
        showAlert("Errore", `Impossibile aggiornare la password: ${error.message || 'Errore sconosciuto'}`);
      }
  }
  // FIREBASE END

  const handleHairdresserLogin = () => {
      if (hairdresserPasswordInput === hairdresserPassword) {
          setHairdresserLoginModalModalVisible(false);
          setScreen('admin');
          setHairdresserPasswordInput('');
      } else {
          showAlert('Accesso Negato', 'Password errata!');
          setHairdresserPasswordInput('');
      }
  };

  const handleSelectTreatment = (treatment: Treatment) => {
    setSelectedTreatments((prev) =>
      prev.find(t => t.id === treatment.id)
        ? prev.filter(t => t.id !== treatment.id)
        : [...prev, treatment]
    );
  };

  const openTreatmentModal = (treatment: Treatment) => {
    setSelectedTreatmentForModal(treatment);
    setAiDescription(''); // Clear previous description
    setTreatmentModalVisible(true);
  };

  const openReminderModal = (app: Appointment) => {
    setSelectedAppointmentForReminder(app);
    setReminderText(''); // Clear previous reminder
    setReminderModalVisible(true);
  };

  // FIREBASE START - Funzioni Super Admin modificate per Firestore
  const handleAddTreatment = async () => {
      if(!newTreatment.name || !newTreatment.price || !newTreatment.duration) {
          showAlert("Campi Mancanti", "Compila tutti i campi del trattamento.");
          return;
      }
      try {
        await addDoc(collection(db, "treatments"), {
          name: newTreatment.name,
          price: parseFloat(newTreatment.price),
          duration: parseInt(newTreatment.duration)
        });
        setNewTreatment({name: '', price: '', duration: ''});
        showAlert("Successo", "Trattamento aggiunto!");
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nell'aggiunta trattamento:", error);
        showAlert("Errore", `Impossibile aggiungere il trattamento: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleDeleteTreatment = async (id: string) => {
      try {
        await deleteDoc(doc(db, "treatments", id));
        showAlert("Successo", "Trattamento eliminato!");
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nell'eliminazione trattamento:", error);
        showAlert("Errore", `Impossibile eliminare il trattamento: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleAddPrize = async () => {
      if (!newPrize.trim()) {
          showAlert("Testo Mancante", "Inserisci il testo del premio.");
          return;
      }
      try {
        await addDoc(collection(db, "prizes"), {
          text: newPrize,
          limits: { daily: 1, weekly: 1, monthly: 1 },
          dispensed: {}
        });
        setNewPrize('');
        showAlert("Successo", "Premio aggiunto!");
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nell'aggiunta premio:", error);
        showAlert("Errore", `Impossibile aggiungere il premio: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleDeletePrize = async (idToDelete: string) => {
      try {
        await deleteDoc(doc(db, "prizes", idToDelete));
        showAlert("Successo", "Premio eliminato!");
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nell'eliminazione premio:", error);
        showAlert("Errore", `Impossibile eliminare il premio: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handlePrizeLimitChange = async (id: string, period: 'daily' | 'weekly' | 'monthly', value: string) => {
      const parsedValue = parseInt(value) || 0;
      try {
        const prizeRef = doc(db, "prizes", id);
        const currentPrize = prizes.find(p => p.id === id);
        if (currentPrize) {
          await updateDoc(prizeRef, {
            limits: { ...currentPrize.limits, [period]: parsedValue }
          });
        }
      } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
        console.error("Errore nell'aggiornamento limite premio:", error);
        showAlert("Errore", `Impossibile aggiornare il limite del premio: ${error.message || 'Errore sconosciuto'}`);
      }
  }

  // Nuovo: Gestione Parrucchieri - Aggiunta
  const handleAddHairdresser = async () => {
      if (!newHairdresserName.trim()) {
          showAlert("Nome Mancante", "Inserisci il nome del parrucchiere.");
          return;
      }
      try {
          await addDoc(collection(db, "hairdressers"), { name: newHairdresserName });
          setNewHairdresserName('');
          showAlert("Successo", "Parrucchiere aggiunto!");
      } catch (error: any) {
          console.error("Errore nell'aggiunta parrucchiere:", error);
          showAlert("Errore", `Impossibile aggiungere il parrucchiere: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  // Nuovo: Gestione Parrucchieri - Eliminazione
  const handleDeleteHairdresser = async (id: string) => {
      try {
          await deleteDoc(doc(db, "hairdressers", id));
          showAlert("Successo", "Parrucchiere eliminato!");
      } catch (error: any) {
          console.error("Errore nell'eliminazione parrucchiere:", error);
          showAlert("Errore", `Impossibile eliminare il parrucchiere: ${error.message || 'Errore sconosciuto'}`);
      }
  };
  // FIREBASE END

  // Funzioni AI
    const generateAiSuggestion = async () => {
        if (!aiAnswers.occasion || !aiAnswers.style) {
            showAlert("Campi Mancanti", "Per favore, rispondi a entrambe le domande.");
            return;
        }
        setIsGenerating(true);
        setAiSuggestion('');
        
        const prompt = `Agisci come un esperto hair stylist. Un cliente cerca un consiglio per un look. L'occasione è "${aiAnswers.occasion}" e il suo stile personale è "${aiAnswers.style}". Fornisci un suggestion dettagliato e creativo per un taglio e colore, spiegando perché si adatta al contesto. Sii incoraggiante e professionale.`;

        let chatHistory = [{ role: "user" as const, parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory }; 
        const apiKey = "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                setAiSuggestion(result.candidates[0].content.parts[0].text);
            } else { throw new Error("Risposta non valida dall'AI."); }
        } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
            console.error("Errore AI:", error);
            setAiSuggestion("Siamo spiacenti, si è verificato un errore. Riprova più tardi.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Effect to generate AI description for treatments when modal opens
    useEffect(() => {
        const generateDescription = async () => {
            if (!isTreatmentModalVisible || !selectedTreatmentForModal || aiDescription) return;
            
            setIsGeneratingDescription(true);
            const prompt = `Scrivi una breve, accattivante e semplice descrizione di marketing per il seguente trattamento per capelli: "${selectedTreatmentForModal.name}". Evidenzia i benefici chiave per il cliente in 2-3 frasi.`;
            
            let chatHistory = [{ role: "user" as const, parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates[0].content.parts[0].text) {
                    setAiDescription(result.candidates[0].content.parts[0].text);
                } else { throw new Error("Risposta non valida dall'AI."); }
            } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
                console.error("Errore AI:", error);
                setAiDescription("Non è stato possibile caricare la descrizione.");
            } finally {
                setIsGeneratingDescription(false);
            }
        };
        generateDescription();
    }, [isTreatmentModalVisible, selectedTreatmentForModal, aiDescription]);

    // Effect to generate AI reminder for appointments when modal opens
    useEffect(() => {
        const generateReminder = async () => {
            if (!isReminderModalVisible || !selectedAppointmentForReminder || reminderText) return;
            
            setIsGeneratingReminder(true);
            const { clientName, date, time, clientPhone, hairdresserId } = selectedAppointmentForReminder; // Incluso clientPhone e hairdresserId
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
            
            const hairdresser = hairdressers.find(hd => hd.id === hairdresserId);
            const hairdresserName = hairdresser ? ` con ${hairdresser.name}` : ''; // Aggiungi il nome del parrucchiere se trovato

            const prompt = `Scrivi un breve, amichevole e professionale messaggio di promemoria per un appuntamento dal parrucchiere. Il nome del cliente è ${clientName}, l'appuntamento è per il giorno ${formattedDate} alle ore ${time}${hairdresserName} presso "${salonNameFromFirestore}". Il loro numero di telefono è ${clientPhone}. Aggiungi un tocco di entusiasmo.`; // Usa salonNameFromFirestore, clientPhone e hairdresserName

            let chatHistory = [{ role: "user" as const, parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates[0].content.parts[0].text) {
                    setReminderText(result.candidates[0].content.parts[0].text);
                } else { throw new Error("Risposta non valida dall'AI."); }
            } catch (error: any) { // Tipizza l'errore come 'any' per accedere a .message
                console.error("Errore AI:", error);
                setReminderText(`Ciao ${clientName}! Ti ricordiamo il tuo appuntamento da ${salonNameFromFirestore} per il giorno ${formattedDate} alle ore ${time}${hairdresserName}. A presto!`);
            } finally {
                setIsGeneratingReminder(false);
            }
        };
        generateReminder();
    }, [isReminderModalVisible, selectedAppointmentForReminder, reminderText, salonNameFromFirestore, hairdressers]); // Dipendenza da salonNameFromFirestore e hairdressers

  // --- Funzioni di Rendering ---
  const renderHomeScreen = () => (
    <div style={styles.page}>
      {isAppLocked && (
        <div style={styles.adminAlert}>
            APP BLOCCATA: Pagamento richiesto nell'Area Riservata.
        </div>
      )}
      <img src={salonLogoUrlFromFirestore} style={styles.logo} alt="Logo del salone" onClick={handleLogoTap} />
      <h1 style={styles.salonName}>{salonNameFromFirestore}</h1>
      <p style={styles.salonAddress}>{salonAddressFromFirestore} {salonPhoneFromFirestore && ` | Tel: ${salonPhoneFromFirestore}`}</p>
      
      <button style={{...styles.ctaButton, ...(isAppLocked && styles.ctaButtonDisabled)}} onClick={() => !isAppLocked && setScreen('booking')} disabled={isAppLocked}>
        Prenota un Appuntamento
      </button>

        <button style={styles.aiButton} onClick={() => setAiModalVisible(true)}>
        ✨ Consulente di Stile Virtuale
      </button>
      
      <button style={styles.adminButton} onClick={() => setHairdresserLoginModalModalVisible(true)}>
        Area Riservata
      </button>
    </div>
  );
  
  const renderBookingScreen = () => (
    <div style={styles.page}>
      <button style={styles.backButton} onClick={() => setScreen('home')}>
        ‹ Torna alla Home
      </button>
      
      <h2 style={styles.sectionTitle}>1. Scegli la data</h2>
      <Calendar 
        selectedDate={selectedDate}
        onDateSelect={(date: string) => {
            setSelectedDate(date);
            setSelectedSlot(''); // Reset selected slot when date changes
            setSelectedHairdresserId(''); // Reset selected hairdresser when date changes
        }}
      />

      {selectedDate && (
        <>
          <h2 style={styles.sectionTitle}>2. Scegli il tuo parrucchiere</h2> {/* Nuovo passaggio */}
          <div style={styles.slotsContainer}> {/* Riusiamo lo stile slotContainer */}
            {hairdressers.map(hd => (
              <button
                key={hd.id}
                style={{
                  ...styles.slotItem,
                  ...(selectedHairdresserId === hd.id && styles.slotItemSelected)
                }}
                onClick={() => {
                    setSelectedHairdresserId(hd.id);
                    setSelectedSlot(''); // Resetta lo slot quando cambia il parrucchiere
                }}
              >
                {hd.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedHairdresserId && selectedDate && ( // Ora dipende dal parrucchiere scelto e dalla data
        <>
          <h2 style={styles.sectionTitle}>3. Scegli l'orario</h2> {/* Ora step 3 */}
          <div style={styles.slotsContainer}>
            {AVAILABLE_SLOTS.map(time => {
              // Verifica se lo slot è già prenotato per la data E il parrucchiere selezionato
              const isBooked = appointments.some(app => 
                app.date === selectedDate && 
                app.time === time && 
                app.hairdresserId === selectedHairdresserId
              );
              return <TimeSlot key={time} time={time} onSelect={setSelectedSlot} isSelected={selectedSlot === time} isBooked={isBooked} />
            })}
          </div>
        </>
      )}

      {selectedSlot && selectedHairdresserId && ( // Ora dipende anche dal parrucchiere
        <>
          <h2 style={styles.sectionTitle}>4. Scegli i trattamenti</h2> {/* Ora step 4 */}
          {treatments.map(item => <TreatmentItem key={item.id} item={item} onSelect={handleSelectTreatment} isSelected={selectedTreatments.some(t => t.id === item.id)} onInfoClick={openTreatmentModal} /> )}
        </>
      )}

      {selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && ( // Tutte le dipendenze
          <>
            <h2 style={styles.sectionTitle}>5. Inserisci i tuoi dati</h2> {/* Ora step 5 */}
            <input type="text" style={styles.inputField} placeholder="Il tuo Nome e Cognome" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <input type="tel" style={styles.inputField} placeholder="Il tuo Numero di Telefono" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </>
      )}
      
      {clientName && clientPhone && selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && ( // Tutte le dipendenze
        <div style={styles.summaryContainer}>
            <h3 style={styles.summaryTitle}>Riepilogo Prenotazione</h3>
            <p style={styles.summaryText}><b>Nome:</b> {clientName}</p>
            <p style={styles.summaryText}><b>Telefono:</b> {clientPhone}</p>
            <p style={styles.summaryText}><b>Data:</b> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
            <p style={styles.summaryText}><b>Orario:</b> {selectedSlot}</p>
            <p style={styles.summaryText}><b>Parrucchiere:</b> {hairdressers.find(hd => hd.id === selectedHairdresserId)?.name || 'N/A'}</p>
            <p style={styles.summaryText}><b>Trattamenti:</b> {selectedTreatments.map(t => t.name).join(', ')}</p>
            <p style={styles.summaryTotal}>Totale: €{totalCost}</p>
            <button style={styles.ctaButton} onClick={handleBooking}>
                Conferma Prenotazione
            </button>
        </div>
      )}
    </div>
  );

  const renderAdminScreen = () => {
    const totalDue = appointments.length * COMMISSION_FEE;
    
    return (
      <div style={styles.page}>
           <button style={styles.backButton} onClick={() => setScreen('home')}>
           ‹ Torna alla Home
         </button>
        
        <div style={styles.adminHeader}>
            <h1 style={styles.adminTitle}>Dashboard Parrucchiere</h1>
            <p style={styles.adminSubtitle}>Periodo contabile corrente</p>
        </div>

        <div style={styles.settingsSection}>
            <h3 style={styles.subSectionTitle}>Crea una Promozione</h3>
            <p style={{...styles.modalMessage, textAlign: 'left', marginBottom: '15px'}}>Descrivi la tua offerta. L'AI creerà un'immagine accattivante da mostrare ai clienti all'apertura dell'app.</p>
            <input type="text" value={promoDescription} onChange={(e) => setPromoDescription(e.target.value)} placeholder="Es: Sconto 20% sul colore a Giugno" style={styles.inputField} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <button
                    style={{
                        ...styles.smallButton,
                        flex: 1,
                        minWidth: 'calc(50% - 5px)',
                        backgroundColor: promoSubject === 'woman' ? '#e6c300' : '#444',
                        color: promoSubject === 'woman' ? '#1a1a1a' : '#e6c300',
                    }}
                    onClick={() => setPromoSubject('woman')}
                >
                    Donna
                </button>
                <button
                    style={{
                        ...styles.smallButton,
                        flex: 1,
                        minWidth: 'calc(50% - 5px)',
                        backgroundColor: promoSubject === 'man' ? '#e6c300' : '#444',
                        color: promoSubject === 'man' ? '#1a1a1a' : '#e6c300',
                    }}
                    onClick={() => setPromoSubject('man')}
                >
                    Uomo
                </button>
                <button
                    style={{
                        ...styles.smallButton,
                        flex: 1,
                        minWidth: 'calc(50% - 5px)',
                        backgroundColor: promoSubject === 'couple' ? '#e6c300' : '#444',
                        color: promoSubject === 'couple' ? '#1a1a1a' : '#e6c300',
                    }}
                    onClick={() => setPromoSubject('couple')}
                >
                    Coppia
                </button>
                <button
                    style={{
                        ...styles.smallButton,
                        flex: 1,
                        minWidth: 'calc(50% - 5px)',
                        backgroundColor: promoSubject === 'scenario' ? '#e6c300' : '#444',
                        color: promoSubject === 'scenario' ? '#1a1a1a' : '#e6c300',
                    }}
                    onClick={() => setPromoSubject('scenario')}
                >
                    Scenario
                </button>
            </div>
            {isGeneratingPromo ? <div style={{...styles.spinner, animation: 'spin 1s linear infinite'}}></div> : <button onClick={generatePromoImage} style={{...styles.ctaButton, ...(promoDescription.trim() === '' || promoSubject === null ? styles.ctaButtonDisabled : {})}} disabled={promoDescription.trim() === '' || promoSubject === null}>Genera Immagine Promozionale</button>}
            {activePromotionImage && (
                <div>
                    <h4 style={styles.subSectionTitle}>Promozione Attiva</h4>
                    <img src={activePromotionImage} alt="Anteprima promozione" style={{width: '100%', borderRadius: '10px', marginTop: '10px'}} />
                    <button onClick={removePromotionImage} style={{...styles.deleteButton, marginTop: '10px', width: '100%'}}>Rimuovi Promozione</button>
                </div>
            )}
        </div>

        {isAppLocked && (
            <div style={styles.adminAlert}>
                APP BLOCCATA - PAGAMENTO RICHIESTO
            </div>
        )}

        <div style={styles.statsContainer}>
            <div style={styles.statBox}>
                <p style={styles.statValue}>{appointments.length}</p>
                <p style={styles.statLabel}>Appuntamenti da pagare</p>
            </div>
            <div style={styles.statBox}>
                <p style={styles.statValue}>€ {totalDue.toFixed(2)}</p>
                <p style={styles.statLabel}>Commissioni Dovute</p>
            </div>
        </div>

        <button 
            style={{ ...styles.ctaButton, ...(appointments.length === 0 && styles.ctaButtonDisabled), ...(isAppLocked && styles.ctaButtonAlert) }}
            onClick={() => setPaymentModalVisible(true)}
            disabled={appointments.length === 0}
        >
            {isAppLocked ? 'PAGA ORA' : 'Chiudi Contabilità e Paga'}
        </button>
        
        <h2 style={styles.sectionTitle}>Dettaglio Appuntamenti Correnti</h2>
        {appointments.length > 0 ? (
            // Sort appointments by date for better readability
            [...appointments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((app) => {
                const assignedHairdresser = hairdressers.find(hd => hd.id === app.hairdresserId); // Trova il parrucchiere assegnato
                return (
                    <div key={app.id} style={styles.appointmentCard}>
                      <p style={styles.appointmentClient}>{app.clientName}</p>
                      <p style={styles.appointmentDate}>{new Date(app.date + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', day: 'numeric', month: 'long'})} alle {app.time}</p>
                      {assignedHairdresser && ( // Nuovo: Mostra parrucchiere assegnato
                        <p style={styles.appointmentServices}>Parrucchiere: {assignedHairdresser.name}</p>
                      )}
                      {app.prize && !app.prize.includes('Ritenta') && (
                        <p style={styles.appointmentPrize}>🏆 Premio Vinto: {app.prize}</p>
                      )}
                      <button style={styles.smallButton} onClick={() => openReminderModal(app)}>✨ Genera Promemoria</button>
                    </div>
                );
            })
        ) : <p style={styles.noAppointmentsText}>Nessun appuntamento in attesa di pagamento.</p> }

        <div style={styles.archiveSection}>
            <h2 style={styles.sectionTitle}>Archivio Chiusure Contabili</h2>
            {archivedClosures.length > 0 ? (
                archivedClosures.map(closure => (
                    <div key={closure.id} style={styles.appointmentCard}>
                                        <p style={styles.appointmentClient}>Chiusura del {new Date(closure.date).toLocaleString('it-IT')}</p>
                                        <p style={styles.appointmentServices}>Appuntamenti pagati: {closure.appointmentCount}</p>
                                        <p style={styles.appointmentTotal}>Importo versato: €{closure.amountPaid.toFixed(2)}</p>
                    </div>
                ))
            ) : <p style={styles.noAppointmentsText}>Nessuna chiusura archiviata.</p>}
        </div>
      </div>
    );
  };
  
  const AiModal = () => (
    <div style={styles.modalOverlay} onClick={() => setAiModalVisible(false)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>✨ Trova il tuo Look Ideale</h2>
        <p style={styles.modalMessage}>Rispondi a due semplici domande e lascia che la nostra AI ti suggerisca il look perfetto per te!</p>
        {!isGenerating && !aiSuggestion && (
          <>
            <label style={styles.aiFormLabel}>Per quale occasione?</label>
            <select name="occasion" style={styles.aiSelect} value={aiAnswers.occasion} onChange={(e) => setAiAnswers({...aiAnswers, occasion: e.target.value})}>
              <option value="">Scegli un'opzione...</option>
              <option value="Vita di tutti i giorni">Vita di tutti i giorni</option>
              <option value="Evento speciale (matrimonio, festa)">Evento speciale (matrimonio, festa)</option>
              <option value="Incontro di lavoro importante">Incontro di lavoro importante</option>
              <option value="Voglia di un cambiamento radicale">Voglia di un cambiamento radicale</option>
            </select>
            <label style={styles.aiFormLabel}>Qual è il tuo stile?</label>
            <select name="style" style={styles.aiSelect} value={aiAnswers.style} onChange={(e) => setAiAnswers({...aiAnswers, style: e.target.value})}>
              <option value="">Scegli un'opzione...</option>
              <option value="Elegante e classico">Elegante e classico</option>
              <option value="Moderno e audace">Moderno e audace</option>
              <option value="Naturale e minimalista">Naturale e minimalista</option>
              <option value="Casual e sportivo">Casual e sportivo</option>
            </select>
            <button style={{...styles.ctaButton, marginTop: '30px'}} onClick={generateAiSuggestion}>Genera Suggerimento</button>
          </>
        )}
        {isGenerating && <div style={{...styles.spinner, animation: 'spin 1s linear infinite'}}></div>}
        {aiSuggestion && (<> <div style={styles.aiResultBox}>{aiSuggestion}</div> <button style={styles.modalButton} onClick={() => setAiModalVisible(false)}>Chiudi</button> </>)}
      </div>
    </div>
  );

  const TreatmentModal = () => {
    if (!selectedTreatmentForModal) return null;
    return (
      <div style={styles.modalOverlay} onClick={() => setTreatmentModalVisible(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={styles.modalTitle}>{selectedTreatmentForModal.name}</h2>
          {isGeneratingDescription && <div style={{...styles.spinner, animation: 'spin 1s linear infinite'}}></div>}
          {!isGeneratingDescription && aiDescription && <div style={styles.aiResultBox}>{aiDescription}</div>}
          <button style={styles.modalButton} onClick={() => setTreatmentModalVisible(false)}>Chiudi</button>
        </div>
      </div>
    );
  };
  
  const ReminderModal = () => (
    <div style={styles.modalOverlay} onClick={() => setReminderModalVisible(false)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>✨ Promemoria Generato</h2>
        {isGeneratingReminder && <div style={{...styles.spinner, animation: 'spin 1s linear infinite'}}></div>}
        {!isGeneratingReminder && reminderText && (
          <>
            <div style={styles.aiResultBox}>{reminderText}</div>
            <button style={{...styles.ctaButton, marginTop: '15px'}} onClick={() => {
                const textarea = document.createElement('textarea');
                textarea.value = reminderText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showAlert('Copiato!', 'Il promemoria è stato copiato negli appunti.');
            }}>Copia Testo</button>
          </>
        )}
        <button style={styles.modalButton} onClick={() => setReminderModalVisible(false)}>Chiudi</button>
      </div>
    </div>
  );
  
  const ScratchGameModal = ({ onGameEnd }: {onGameEnd: (prize: Prize | null) => void}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [prize, setPrize] = useState<Prize | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const today = getTodayString();
        const week = getWeekNumber(new Date());
        const month = getMonthString(new Date());

        const availablePrizes = prizes.filter(p => {
            if (p.text.includes('Ritenta')) return true;

            const dailyCount = p.dispensed.daily?.date === today ? (p.dispensed.daily.count || 0) : 0;
            const weeklyCount = p.dispensed.weekly?.week === week ? (p.dispensed.weekly.count || 0) : 0;
            const monthlyCount = p.dispensed.monthly?.month === month ? (p.dispensed.monthly.count || 0) : 0;

            return dailyCount < p.limits.daily && weeklyCount < p.limits.weekly && monthlyCount < p.limits.monthly;
        });

        const eligible = availablePrizes.filter(p => !p.text.includes('Ritenta'));
        if (eligible.length > 0) {
            setPrize(eligible[Math.floor(Math.random() * eligible.length)]);
        } else {
            setPrize(prizes.find(p => p.text.includes('Ritenta')) || null);
        }
    }, [prizes]);

    useEffect(() => {
      if(!prize || !canvasRef.current) return; 
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 300;
      canvas.height = 150;
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setIsRevealed(false);
      isDrawingRef.current = false;

      const getEventPosition = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const event = 'touches' in e ? e.touches[0] : e;
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => { e.preventDefault(); isDrawingRef.current = true; draw(e); };
      const stopDrawing = () => { isDrawingRef.current = false; checkRevealed(); };
      const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false);
        ctx.fill();
      };

      const checkRevealed = () => {
          const imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
          const data = imageData.data;
          let transparentPixels = 0;
          for(let i=3; i < data.length; i+=4) {
              if (data[i] === 0) {
                  transparentPixels++;
              }
          }
          const revealedPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
          if (revealedPercentage > 50) {
              setIsRevealed(true);
          }
      };
      
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing);

      return () => { 
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
        canvas.removeEventListener('touchcancel', stopDrawing);
      };
    }, [prize]);

    const handleSavePrize = () => {
        if (!prize) return;
        const prizeWindow = window.open('', '', 'width=400,height=300');
        if (prizeWindow) {
            prizeWindow.document.write(`
                <html><head><title>Il Tuo Premio - ${salonNameFromFirestore}</title>
                <style>
                    body { font-family: sans-serif; background-color: #1a1a1a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .container { text-align: center; border: 3px solid #e6c300; padding: 30px; border-radius: 15px; background-color: #2c2c2c; }
                    h1 { color: #e6c300; }
                </style>
                </head><body>
                <div class="container">
                    <h1>Congratulazioni!</h1>
                    <p>Hai vinto:</p>
                    <h2>${prize.text}</h2>
                    <p><small>Presenta questo screenshot alla cassa. Valido per 30 giorni.</small></p>
                </div>
                </body></html>
            `);
        }
    };
    
    return (
      <div style={styles.modalOverlay} onClick={() => onGameEnd(prize)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={styles.modalTitle}>Il tuo Gratta e Vinci!</h2>
          <p style={styles.modalMessage}>Usa il mouse o il dito per grattare e scoprire se hai vinto un premio!</p>
          <div style={styles.scratchCardContainer}>
            <span>{prize ? prize.text : ''}</span>
            <canvas ref={canvasRef} width="300" height="150" style={styles.scratchCanvas} />
          </div>
          {isRevealed && prize && !prize.text.includes("Ritenta") && (
              <button style={styles.ctaButton} onClick={handleSavePrize}>Salva Vincita</button>
          )}
          <button style={styles.modalButton} onClick={() => onGameEnd(prize)}>Torna alla Home</button>
        </div>
      </div>
    );
  };
  
  const renderPaymentModal = () => (
      <div style={styles.modalOverlay} onClick={() => setPaymentModalVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Conferma Pagamento</h2>
              <p style={styles.modalMessage}>Stai per saldare le commissioni per <b>{appointments.length} appuntamenti</b>, per un totale di <b>€{(appointments.length * COMMISSION_FEE).toFixed(2)}</b>.</p>
              <button style={styles.ctaButton} onClick={handleAccountingClosure}>Conferma e Paga Ora</button>
              <button style={styles.modalButton} onClick={() => setPaymentModalVisible(false)}>Annulla</button>
          </div>
      </div>
  );

  const renderHairdresserLoginModal = () => (
      <div style={styles.modalOverlay} onClick={() => setHairdresserLoginModalModalVisible(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Accesso Area Riservata</h2>
            <input 
                type="password" 
                style={styles.inputField} 
                placeholder="Password"
                value={hairdresserPasswordInput}
                onChange={(e) => setHairdresserPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleHairdresserLogin()}
            />
            <button style={styles.ctaButton} onClick={handleHairdresserLogin}>Accedi</button>
        </div>
      </div>
  );

  const renderSuperAdminModal = () => (
    <div style={styles.modalOverlay} onClick={() => setSuperAdminVisible(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Pannello di Controllo FreeCent</h2>
            
            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Password Parrucchiere</h3>
                <input type="text" value={tempHairdresserPassword} onChange={(e) => setTempHairdresserPassword(e.target.value)} placeholder="Nuova password" style={styles.inputField} />
                <button onClick={saveHairdresserPassword} style={styles.smallButton}>Salva Password</button>
            </div>

            {/* Nuovo: Sezione per le Informazioni del Salone */}
            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Informazioni Salone</h3>
                <label style={styles.aiFormLabel}>Nome Salone:</label>
                <input type="text" value={tempSalonName} onChange={(e) => setTempSalonName(e.target.value)} placeholder="Nome del salone" style={styles.inputField} />
                <label style={styles.aiFormLabel}>Indirizzo Salone:</label>
                <input type="text" value={tempSalonAddress} onChange={(e) => setTempSalonAddress(e.target.value)} placeholder="Indirizzo del salone" style={styles.inputField} />
                <label style={styles.aiFormLabel}>Numero di Telefono:</label>
                <input type="text" value={tempSalonPhone} onChange={(e) => setTempSalonPhone(e.target.value)} placeholder="Numero di telefono" style={styles.inputField} />
                <button onClick={handleSaveSalonInfo} style={styles.smallButton}>Salva Info Salone</button>

                <h4 style={{...styles.subSectionTitle, marginTop: '20px'}}>Gestione Logo Salone</h4>
                {salonLogoUrlFromFirestore && (
                    <img src={salonLogoUrlFromFirestore} alt="Logo attuale" style={{width: '80px', height: '80px', borderRadius: '50%', display: 'block', margin: '10px auto', border: '1px solid #e6c300'}} />
                )}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setTempLogoFile(e.target.files ? e.target.files[0] : null)} 
                    style={{...styles.inputField, padding: '10px', height: 'auto'}} 
                />
                <button onClick={handleLogoUpload} style={styles.smallButton} disabled={!tempLogoFile}>Carica Nuovo Logo</button>
                {salonLogoUrlFromFirestore !== SALON_INFO.logoUrl && ( // Permetti di rimuovere solo se non è il logo placeholder
                  <button onClick={() => {
                    // Chiedi conferma prima di rimuovere il logo
                    if (window.confirm("Sei sicuro di voler rimuovere il logo personalizzato?")) {
                      // Imposta salonLogoUrlFromFirestore a SALON_INFO.logoUrl direttamente senza cancellare da Storage
                      // L'obiettivo è ripristinare il default, non necessariamente cancellare il file
                      updateDoc(doc(db, "settings", "appSettings"), { salonLogoUrl: SALON_INFO.logoUrl });
                      setSalonLogoUrlFromFirestore(SALON_INFO.logoUrl); // Aggiorna lo stato locale
                      showAlert("Logo Rimosso", "Il logo personalizzato è stato rimosso e ripristinato a quello di default.");
                    }
                  }} style={{...styles.deleteButton, marginTop: '10px', width: '100%'}}>Ripristina Logo Default</button>
                )}
            </div>


            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Trattamenti</h3>
                <ul style={styles.managementList}>
                   {treatments.map(t => (
                        <li key={t.id} style={styles.managementListItem}>
                            <span>{t.name} - €{t.price} ({t.duration} min)</span>
                            <button onClick={() => handleDeleteTreatment(t.id)} style={styles.deleteButton}>X</button>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newTreatment.name} onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})} placeholder="Nome trattamento" style={{...styles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.price} onChange={(e) => setNewTreatment({...newTreatment, price: e.target.value})} placeholder="Prezzo" style={{...styles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.duration} onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})} placeholder="Durata (min)" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddTreatment} style={styles.smallButton}>Aggiungi Trattamento</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Parrucchieri</h3> {/* Nuovo: Sezione per la gestione dei parrucchieri */}
                <ul style={styles.managementList}>
                   {hairdressers.map(hd => (
                        <li key={hd.id} style={styles.managementListItem}>
                            <span>{hd.name}</span>
                            <button onClick={() => handleDeleteHairdresser(hd.id)} style={styles.deleteButton}>X</button>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newHairdresserName} onChange={(e) => setNewHairdresserName(e.target.value)} placeholder="Nome nuovo parrucchiere" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddHairdresser} style={styles.smallButton}>Aggiungi Parrucchiere</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Premi Gratta e Vinci</h3>
                <ul style={styles.managementList}>
                   {prizes.map((p) => (
                        <li key={p.id} style={styles.managementListItem}>
                            <span>{p.text}</span>
                            <div style={styles.limitInputContainer}>
                                <label>G:</label><input type="number" style={styles.limitInput} value={p.limits.daily} onChange={(e) => handlePrizeLimitChange(p.id, 'daily', e.target.value)} />
                                <label>S:</label><input type="number" style={styles.limitInput} value={p.limits.weekly} onChange={(e) => handlePrizeLimitChange(p.id, 'weekly', e.target.value)} />
                                <label>M:</label><input type="number" style={styles.limitInput} value={p.limits.monthly} onChange={(e) => handlePrizeLimitChange(p.id, 'monthly', e.target.value)} />
                                {!p.text.includes('Ritenta') && <button onClick={() => handleDeletePrize(p.id)} style={styles.deleteButton}>X</button>}
                            </div>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newPrize} onChange={(e) => setNewPrize(e.target.value)} placeholder="Nuovo premio (testo)" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddPrize} style={styles.smallButton}>Aggiungi Premio</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Impostazioni Pagamento</h3>
                {!areSettingsUnlocked ? (
                    <div>
                        <input type="password" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} placeholder="Password Amministratore" style={styles.inputField} />
                        <button onClick={unlockSettings} style={styles.smallButton}>Sblocca</button>
                    </div>
                ) : (
                    <div>
                        <label style={{display: 'block', marginBottom: '10px'}}>Soglia di Pagamento (€)</label>
                        <input type="number" value={tempThreshold} onChange={(e) => setTempThreshold(e.target.value)} style={styles.inputField} step="5" min="5" />
                        <button onClick={saveSettings} style={styles.smallButton}>Salva Impostazioni</button>
                    </div>
                )}
            </div>

            <button style={styles.modalButton} onClick={() => setSuperAdminVisible(false)}>Chiudi Pannello</button>
        </div>
    </div>
  );


  return (
    <div style={styles.container}>
        {/* Global styles for animations */}
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(217, 83, 79, 0); } 100% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0); } }
        `}</style>
      
      {/* Splash Screen */}
      {isSplashVisible && activePromotionImage && (
            <div style={{...styles.splashScreen, ...(isSplashVisible ? {} : styles.splashScreenHidden)}}>
                <img src={activePromotionImage} alt="Promozione speciale" style={styles.splashImage} />
            </div>
      )}
      
      {/* Main App Content - Hidden if splash screen is visible */}
      <div style={{ visibility: isSplashVisible ? 'hidden' : 'visible' }}>
        {screen === 'home' && renderHomeScreen()}
        {screen === 'booking' && renderBookingScreen()}
        {screen === 'admin' && renderAdminScreen()}
      </div>
      
      {/* Confirmation Modal */}
      {isConfModalVisible && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2 style={styles.modalTitle}>Grazie!</h2>
                <p style={styles.modalMessage}>Il tuo appuntamento è stato confermato con successo.</p>
                <button style={styles.modalButton} onClick={handleCloseConfirmationModal}>Scopri il tuo premio!</button>
            </div>
        </div>
      )}

      {/* AI Modals */}
      {isAiModalVisible && <AiModal />}
      {isTreatmentModalVisible && <TreatmentModal />}
      {isReminderModalVisible && <ReminderModal />}
      
      {/* Game Modal */}
      {isGameModalVisible && <ScratchGameModal onGameEnd={handleGameEnd} />}
      
      {/* Payment and Admin Modals */}
      {isPaymentModalVisible && renderPaymentModal()}
      {isSuperAdminVisible && renderSuperAdminModal()}
      {isHairdresserLoginModalVisible && renderHairdresserLoginModal()}

      {/* Custom Alert Dialog */}
      {alertDialog.visible && (
        <AlertDialog
          title={alertDialog.title}
          message={alertDialog.message}
          onClose={closeAlert}
        />
      )}
    </div>
  );
}