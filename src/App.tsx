import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react';
// Importa i tipi dai nuovi file
import { type Treatment, type Prize, type Appointment, type ArchivedClosure, type Hairdresser, type ClientProfile } from './utils/types';
// Importa le costanti dai nuovi file
import { SALON_INFO, INITIAL_TREATMENTS, INITIAL_PRIZES, COMMISSION_FEE, SUPER_ADMIN_SEQUENCE, INITIAL_HAIRDRESSERS, PROMOTION_GENERATION_FEE, LOYALTY_SETTINGS } from './utils/constants';
// Importa le funzioni utility dai nuovi file
import { getWeekNumber, getTodayString, getMonthString } from './utils/helpers';


// FIREBASE START
import { db, storage } from './utils/firebaseConfig'; // Percorso corretto per firebaseConfig
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// FIREBASE END


// --- STILI GLOBALI (CSS-in-JS con tipi corretti) ---
const globalStyles: { [key: string]: CSSProperties } = {
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
    animation: 'pulse 1.s infinite',
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
    border: '1px solid #444',
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

const AlertDialog = ({ title, message, onClose }: { title: string; message: string; onClose: () => void }) => (
  <div style={globalStyles.modalOverlay}>
    <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h2 style={globalStyles.modalTitle}>{title}</h2>
      <p style={globalStyles.modalMessage}>{message}</p>
      <button style={globalStyles.modalButton} onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

const TreatmentItem = ({ item, onSelect, isSelected, onInfoClick }: {item: Treatment, onSelect: (item: Treatment) => void, isSelected: boolean, onInfoClick: (item: Treatment) => void}) => (
  <div style={{...globalStyles.treatmentItem, ...(isSelected && globalStyles.treatmentItemSelected)}}>
    <div style={globalStyles.treatmentContent} onClick={() => onSelect(item)}>
      <p style={{...globalStyles.treatmentName, ...(isSelected && globalStyles.treatmentNameSelected)}}>{item.name}</p>
      <p style={{...globalStyles.treatmentDuration, ...(isSelected && globalStyles.treatmentDurationSelected)}}>{item.duration} min</p>
    </div>
    <span style={globalStyles.treatmentInfoIcon} onClick={() => onInfoClick(item)}>✨</span>
  </div>
);

const TimeSlot = ({ time, onSelect, isSelected, isBooked }: {time: string, onSelect: (time: string) => void, isSelected: boolean, isBooked: boolean }) => (
    <button
        style={{
            ...globalStyles.slotItem,
            ...(isSelected && globalStyles.slotItemSelected),
            ...(isBooked && globalStyles.slotItemBooked)
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
        startDate.setDate(startDate.getDate() - (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1));
        
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
                        ...globalStyles.calendarDay,
                        ...(isOtherMonth && globalStyles.calendarDayOtherMonth),
                        ...(isSelected && globalStyles.calendarDaySelected),
                        ...(isPast && globalStyles.calendarDayPast),
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
        <div style={globalStyles.calendarContainer}>
            <div style={globalStyles.calendarHeader}>
                <button onClick={() => changeMonth(-1)} style={globalStyles.calendarNavButton}>‹</button>
                <span style={globalStyles.calendarMonthLabel}>
                    {currentMonth.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} style={globalStyles.calendarNavButton}>›</button>
            </div>
            <div style={globalStyles.calendarGrid}>
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => <div key={day} style={globalStyles.calendarDayLabel}>{day}</div>)}
                {renderDays()}
            </div>
        </div>
    );
};


// --- Schermata Principale dell'App ---
export default function App() {
  const [screen, setScreen] = useState('home');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [archivedClosures, setArchivedClosures] = useState<ArchivedClosure[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([]);

  const [isConfModalVisible, setConfModalVisible] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  
  const [activePromotionImage, setActivePromotionImage] = useState<string | null>(null);
  const [salonLogoUrlFromFirestore, setSalonLogoUrlFromFirestore] = useState<string>(SALON_INFO.logoUrl);
  const [isSplashVisible, setIsSplashVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedHairdresserId, setSelectedHairdresserId] = useState<string>('');
  
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

  const [commissionThreshold, setCommissionThreshold] = useState(10.00);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [areSettingsUnlocked, setAreSettingsUnlocked] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(commissionThreshold.toString());

  const [temporaryUnlockThreshold, setTemporaryUnlockThreshold] = useState<number | null>(null);
  const [tempUnlockThresholdInput, setTempUnlockThresholdInput] = useState('');


  const [commissionFee, setCommissionFee] = useState(COMMISSION_FEE);
  const [tempCommissionFee, setTempCommissionFee] = useState(COMMISSION_FEE.toString());

  const [promotionGenerationFee, setPromotionGenerationFee] = useState(PROMOTION_GENERATION_FEE);
  const [tempPromotionGenerationFee, setTempPromotionGenerationFee] = useState(PROMOTION_GENERATION_FEE.toString());
  const [promotionsGeneratedCount, setPromotionsGeneratedCount] = useState(0);

  const [autoPaymentThreshold, setAutoPaymentThreshold] = useState(50.00);
  const [tempAutoPaymentThreshold, setTempAutoPaymentThreshold] = useState("50.00");
  
  const [newTreatment, setNewTreatment] = useState({name: '', price: '', duration: ''});
  const [newPrize, setNewPrize] = useState('');
  const [newHairdresserName, setNewHairdresserName] = useState('');
  const [editingHairdresser, setEditingHairdresser] = useState<Hairdresser | null>(null);
  const [tempHairdresserWorkingHours, setTempHairdresserWorkingHours] = useState<{[key: string]: { start: string; end: string } | null}>({});
  const [tempHairdresserAbsentDates, setTempHairdresserAbsentDates] = useState<string[]>([]);

  const [promoDescription, setPromoDescription] = useState('');
  const [promoSubject, setPromoSubject] = useState<'woman' | 'man' | 'couple' | 'scenario' | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  const [hairdresserPassword, setHairdresserPassword] = useState('parola');
  const [isHairdresserLoginModalVisible, setHairdresserLoginModalVisible] = useState(false);
  const [hairdresserPasswordInput, setHairdresserPasswordInput] = useState('');
  const [tempHairdresserPassword, setTempHairdresserPassword] = useState(hairdresserPassword);

  const [salonNameFromFirestore, setSalonNameFromFirestore] = useState(SALON_INFO.name);
  const [salonAddressFromFirestore, setSalonAddressFromFirestore] = useState(SALON_INFO.address);
  const [salonPhoneFromFirestore, setSalonPhoneFromFirestore] = useState(SALON_INFO.phone);
  const [tempSalonName, setTempSalonName] = useState(SALON_INFO.name);
  const [tempSalonAddress, setTempSalonAddress] = useState(SALON_INFO.address);
  const [tempSalonPhone, setTempSalonPhone] = useState(SALON_INFO.phone);
  const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);

  const [isPaymentSetupModalVisible, setIsPaymentSetupModalVisible] = useState(false);
  const [salonStripeCustomerId, setSalonStripeCustomerId] = useState<string | null>(null);
  
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

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
    const totalDue = (appointments.length * commissionFee) + (promotionsGeneratedCount * promotionGenerationFee);

    const isAutoPaymentLocked = salonStripeCustomerId && totalDue >= autoPaymentThreshold;

    const manualThreshold = temporaryUnlockThreshold || commissionThreshold;
    const isManualPaymentLocked = !salonStripeCustomerId && totalDue >= manualThreshold;

    return isAutoPaymentLocked || isManualPaymentLocked;
  }, [
      appointments, 
      commissionFee, 
      promotionsGeneratedCount, 
      promotionGenerationFee, 
      commissionThreshold, 
      temporaryUnlockThreshold,
      autoPaymentThreshold,
      salonStripeCustomerId
  ]);
  
  useEffect(() => {
    if(closureRequired) {
      setIsAppLocked(true);
    } else {
      setIsAppLocked(false);
    }
  }, [closureRequired]);

  useEffect(() => {
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

    const unsubscribeTreatments = onSnapshot(collection(db, "treatments"), (snapshot) => {
      const fetchedTreatments: Treatment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Treatment[];
      if (fetchedTreatments.length === 0) {
        INITIAL_TREATMENTS.forEach(t => addDoc(collection(db, "treatments"), t));
        setTreatments(INITIAL_TREATMENTS);
      } else {
        setTreatments(fetchedTreatments);
      }
    }, (error) => {
      console.error("Errore nel caricamento trattamenti:", error);
      showAlert("Errore", "Impossibile caricare i trattamenti.");
    });

    const unsubscribePrizes = onSnapshot(collection(db, "prizes"), (snapshot) => {
      const fetchedPrizes: Prize[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prize[];
      if (fetchedPrizes.length === 0) {
        INITIAL_PRIZES.forEach(p => addDoc(collection(db, "prizes"), p));
        setPrizes(INITIAL_PRIZES);
      } else {
        setPrizes(fetchedPrizes);
      }
    }, (error) => {
      console.error("Errore nel caricamento premi:", error);
      showAlert("Errore", "Impossibile caricare i premi.");
    });
    
    const unsubscribeHairdressers = onSnapshot(collection(db, "hairdressers"), (snapshot) => {
      const fetchedHairdressers: Hairdresser[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Nome non disponibile',
            workingHours: data.workingHours || { monday: { start: '09:00', end: '18:00' }, tuesday: { start: '09:00', end: '18:00' }, wednesday: { start: '09:00', end: '18:00' }, thursday: { start: '09:00', end: '18:00' }, friday: { start: '09:00', end: '18:00' }, saturday: { start: '09:00', end: '13:00' }, sunday: null },
            absentDates: data.absentDates || [],
        };
      });
      if (fetchedHairdressers.length === 0 && hairdressers.length === 0) {
        INITIAL_HAIRDRESSERS.forEach(hd => addDoc(collection(db, "hairdressers"), hd));
        setHairdressers(INITIAL_HAIRDRESSERS);
      } else {
        setHairdressers(fetchedHairdressers);
      }
    }, (error) => {
      console.error("Errore nel caricamento parrucchieri:", error);
      showAlert("Errore", "Impossibile caricare i parrucchieri.");
    });

    const unsubscribeClientProfiles = onSnapshot(collection(db, "clientProfiles"), (snapshot) => {
      const fetchedProfiles: ClientProfile[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClientProfile[];
      setClientProfiles(fetchedProfiles);
    }, (error) => {
      console.error("Errore nel caricamento profili cliente:", error);
      showAlert("Errore", "Impossibile caricare i profili cliente.");
    });

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "appSettings"), (docSnap) => {
      if (docSnap.exists()) {
        const settingsData = docSnap.data();
        setCommissionThreshold(settingsData.commissionThreshold || 10.00);
        setTempThreshold((settingsData.commissionThreshold || 10.00).toString());
        setHairdresserPassword(settingsData.hairdresserPassword || 'parola');
        setTempHairdresserPassword(settingsData.hairdresserPassword || 'parola');
        setActivePromotionImage(settingsData.activePromotionImageUrl || null);
        setSalonNameFromFirestore(settingsData.salonName || SALON_INFO.name);
        setTempSalonName(settingsData.salonName || SALON_INFO.name);
        setSalonAddressFromFirestore(settingsData.salonAddress || SALON_INFO.address);
        setTempSalonAddress(settingsData.salonAddress || SALON_INFO.address);
        setSalonPhoneFromFirestore(settingsData.salonPhone || SALON_INFO.phone);
        setTempSalonPhone(settingsData.salonPhone || SALON_INFO.phone);
        setSalonLogoUrlFromFirestore(settingsData.salonLogoUrl || SALON_INFO.logoUrl);
        setPromotionGenerationFee(settingsData.promotionGenerationFee || PROMOTION_GENERATION_FEE);
        setTempPromotionGenerationFee((settingsData.promotionGenerationFee || PROMOTION_GENERATION_FEE).toString());
        setPromotionsGeneratedCount(settingsData.promotionsGeneratedCount || 0);
        setCommissionFee(settingsData.commissionFee || COMMISSION_FEE);
        setTempCommissionFee((settingsData.commissionFee || COMMISSION_FEE).toString());
        setAutoPaymentThreshold(settingsData.autoPaymentThreshold || 50.00);
        setTempAutoPaymentThreshold((settingsData.autoPaymentThreshold || 50.00).toString());
        setSalonStripeCustomerId(settingsData.salonStripeCustomerId || null);
        setTemporaryUnlockThreshold(settingsData.temporaryUnlockThreshold || null);

      } else {
        setDoc(doc(db, "settings", "appSettings"), {
          commissionThreshold: 10.00,
          hairdresserPassword: 'parola',
          activePromotionImageUrl: null,
          salonName: SALON_INFO.name,
          salonAddress: SALON_INFO.address,
          salonPhone: SALON_INFO.phone,
          salonLogoUrl: SALON_INFO.logoUrl,
          promotionGenerationFee: PROMOTION_GENERATION_FEE,
          promotionsGeneratedCount: 0,
          commissionFee: COMMISSION_FEE,
          autoPaymentThreshold: 50.00,
          salonStripeCustomerId: null,
          temporaryUnlockThreshold: null,
        });
      }
    }, (error) => {
      console.error("Errore nel caricamento impostazioni:", error);
      showAlert("Errore", "Impossibile caricare le impostazioni.");
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeClosures();
      unsubscribeTreatments();
      unsubscribePrizes();
      unsubscribeHairdressers();
      unsubscribeClientProfiles();
      unsubscribeSettings();
    };
  }, []);

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
      setTimeout(() => {
          if (logoTapCount > 0 && newCount < 7) {
              setLogoTapCount(0);
          }
      }, 2000);
  };

  const totalCost = useMemo(() => selectedTreatments.reduce((sum, t) => sum + t.price, 0), [selectedTreatments]);

  const getHairdresserAvailableSlots = (dateString: string, hdId: string): string[] => {
    const selectedDay = new Date(dateString + 'T00:00:00');
    const dayOfWeek = selectedDay.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hairdresser = hairdressers.find(hd => hd.id === hdId);
    if (!hairdresser) return [];
    if (hairdresser.absentDates.includes(dateString)) return [];
    const dailyHours = hairdresser.workingHours[dayOfWeek];
    if (!dailyHours) return [];
    const [startHour, startMinute] = dailyHours.start.split(':').map(Number);
    const [endHour, endMinute] = dailyHours.end.split(':').map(Number);
    const slots: string[] = [];
    const currentTime = new Date(selectedDay);
    currentTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(selectedDay);
    endTime.setHours(endHour, endMinute, 0, 0);
    const now = new Date();
    if (selectedDay.toDateString() === now.toDateString()) {
        if (currentTime.getHours() < now.getHours() || (currentTime.getHours() === now.getHours() && currentTime.getMinutes() < now.getMinutes())) {
            if (now.getMinutes() > 30) {
              currentTime.setHours(now.getHours() + 1, 0, 0, 0);
            } else {
              currentTime.setMinutes(30, 0, 0);
            }
        }
    } else if (selectedDay < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        return [];
    }
    while (currentTime.getTime() < endTime.getTime()) {
      const slot = currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      slots.push(slot);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    return slots.filter(slot => !appointments.some(app =>
      app.date === dateString && 
      app.time === slot && 
      app.hairdresserId === hdId
    ));
  };

  const handleBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim() || !selectedHairdresserId || selectedTreatments.length === 0 || !selectedSlot || !selectedDate) {
      showAlert("Dati Mancanti", "Per favore, compila tutti i campi prima di confermare.");
      return;
    }
    try {
        const newBookingData = {
            clientName: clientName,
            clientPhone: clientPhone,
            date: selectedDate,
            time: selectedSlot,
            treatments: selectedTreatments,
            total: totalCost,
            prize: '',
            hairdresserId: selectedHairdresserId,
        };
        let clientProfile = clientProfiles.find(profile => profile.phone === clientPhone);
        if (!clientProfile) {
            const clientProfileRef = await addDoc(collection(db, "clientProfiles"), {
                name: clientName,
                phone: clientPhone,
                loyaltyPoints: 0,
            });
            clientProfile = { id: clientProfileRef.id, name: clientName, phone: clientPhone, loyaltyPoints: 0 };
        }
        const pointsEarned = newBookingData.total * LOYALTY_SETTINGS.pointsPerEuro;
        const updatedPoints = clientProfile.loyaltyPoints + pointsEarned;
        await updateDoc(doc(db, "clientProfiles", clientProfile.id), { loyaltyPoints: updatedPoints });
        
        const docRef = await addDoc(collection(db, "appointments"), { ...newBookingData, clientId: clientProfile.id });
        setLastBookingId(docRef.id);
        
        setSelectedDate('');
        setSelectedSlot('');
        setSelectedTreatments([]);
        setClientName('');
        setClientPhone('');
        setSelectedHairdresserId('');
        setConfModalVisible(true);
    } catch (error) {
        console.error("Errore durante la prenotazione:", error);
        showAlert("Errore", "Impossibile completare la prenotazione. Riprova.");
    }
  };
  
  const handleCloseConfirmationModal = () => {
    setConfModalVisible(false);
    setGameModalVisible(true);
  };

  const handleGameEnd = async (prizeWon: Prize | null) => {
    if (lastBookingId && prizeWon) {
      try {
        await updateDoc(doc(db, "appointments", lastBookingId), { prize: prizeWon.text });
        const prizeRef = doc(db, "prizes", prizeWon.id);
        const prizeDocSnap = await getDoc(prizeRef);
        if (prizeDocSnap.exists()) {
            const currentPrizeDocData = prizeDocSnap.data() as Prize;
            const today = getTodayString();
            const week = getWeekNumber(new Date());
            const month = getMonthString(new Date());
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
        }
      } catch (error: any) {
        console.error("Errore durante l'aggiornamento del premio:", error);
        showAlert("Errore", `Impossibile salvare i dati del premio: ${error.message || 'Errore sconosciuto'}`);
      }
    }
    setLastBookingId(null);
    setGameModalVisible(false);
    setScreen('home');
  }

  const generatePromoImage = async () => {
      if (!promoDescription.trim() || !promoSubject) {
          showAlert("Dati Mancanti", "Inserisci una descrizione e seleziona un soggetto per la promozione.");
          return;
      }
      setIsGeneratingPromo(true);
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
          // Generazione immagine tramite Pollinations.ai: gratuito, senza chiave API né quota.
          const seed = Date.now() % 1000000;
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(backgroundPrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
          // Scarico lo sfondo come blob: più robusto del caricamento diretto (niente problemi CORS/canvas, con qualche tentativo per la prima generazione lenta).
          let bgBlob: Blob | null = null;
          for (let attempt = 0; attempt < 3 && !bgBlob; attempt++) {
              try { const r = await fetch(pollinationsUrl); if (r.ok) bgBlob = await r.blob(); } catch (_) { /* riprovo */ }
              if (!bgBlob) await new Promise(res => setTimeout(res, 2500));
          }
          if (!bgBlob) throw new Error("Il servizio di generazione immagini non risponde al momento, riprova tra poco.");
          const bgObjectUrl = URL.createObjectURL(bgBlob);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Impossibile ottenere il contesto del canvas");
          canvas.width = 1024;
          canvas.height = 1024;
          const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error(`Impossibile caricare l'immagine: ${src}`));
              img.src = src;
          });
          const backgroundImg = new Image();
          await loadImage(backgroundImg, bgObjectUrl);
          // Il logo è opzionale: se non si carica (es. CORS Firebase) proseguo senza, l'immagine si crea lo stesso.
          let logoImg: HTMLImageElement | null = new Image();
          logoImg.crossOrigin = "Anonymous";
          try { await loadImage(logoImg, salonLogoUrlFromFirestore); } catch (_) { logoImg = null; }
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
          if (logoImg) {
            ctx.beginPath();
            ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          }
          const finalImageBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(blob => {
                  if (blob) resolve(blob);
                  else reject(new Error("Impossibile creare il Blob dall'immagine."));
              }, 'image/png');
          });
          const imageFileName = `promotions/${Date.now()}.png`;
          const imageRef = ref(storage, imageFileName);
          await uploadBytes(imageRef, finalImageBlob);
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(db, "settings", "appSettings"), {
             activePromotionImageUrl: downloadURL,
             promotionsGeneratedCount: promotionsGeneratedCount + 1,
          });
          showAlert("Successo", "Immagine promozionale creata e impostata!");
      } catch (error: any) {
          console.error("Errore generazione immagine promo:", error);
          showAlert("Errore AI", `Errore durante la creazione dell'immagine: ${error.message || "Errore sconosciuto"}`);
      } finally {
          setIsGeneratingPromo(false);
      }
  };

  const removePromotionImage = async () => {
    if (!activePromotionImage) return;
    try {
      const imageToDeleteRef = ref(storage, activePromotionImage);
      await deleteObject(imageToDeleteRef);
      await updateDoc(doc(db, "settings", "appSettings"), { activePromotionImageUrl: null });
      showAlert("Successo", "Immagine promozionale rimossa!");
    } catch (error: any) {
      console.error("Errore rimozione immagine:", error);
      showAlert("Errore", `Impossibile rimuovere l'immagine: ${error.message || 'Errore sconosciuto'}`);
    }
  }

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
      showAlert("Successo", "Informazioni salone aggiornate!");
    } catch (error: any) {
      console.error("Errore salvataggio info salone:", error);
      showAlert("Errore", `Impossibile salvare le informazioni: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  const handleLogoUpload = async () => {
    if (!tempLogoFile) {
      showAlert("File Mancante", "Seleziona un file immagine da caricare.");
      return;
    }
    try {
      const logoFileName = `salon_logo/logo_${Date.now()}.png`;
      const logoRef = ref(storage, logoFileName);
      await uploadBytes(logoRef, tempLogoFile);
      const downloadURL = await getDownloadURL(logoRef);
      if (salonLogoUrlFromFirestore && salonLogoUrlFromFirestore !== SALON_INFO.logoUrl) {
        try {
          const oldPath = new URL(salonLogoUrlFromFirestore).pathname.split('/o/')[1].split('?')[0];
          const decodedOldPath = decodeURIComponent(oldPath);
          await deleteObject(ref(storage, decodedOldPath));
        } catch (deleteError) {
          console.warn("Errore eliminazione vecchio logo:", deleteError);
        }
      }
      await updateDoc(doc(db, "settings", "appSettings"), { salonLogoUrl: downloadURL });
      setTempLogoFile(null);
      showAlert("Successo", "Logo caricato e aggiornato!");
    } catch (error: any) {
      console.error("Errore caricamento logo:", error);
      showAlert("Errore", `Impossibile caricare il logo: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  const handleAccountingClosure = async () => {
    const totalAppointmentsDue = appointments.length * commissionFee;
    const totalPromotionsDue = promotionsGeneratedCount * promotionGenerationFee;
    const totalDue = totalAppointmentsDue + totalPromotionsDue;
    const newClosure: Omit<ArchivedClosure, 'id'> = {
        date: new Date().toISOString(),
        appointmentCount: appointments.length,
        amountPaid: totalDue,
        appointments: [...appointments],
        promotionGenerationCost: totalPromotionsDue,
    };
    try {
        await addDoc(collection(db, "archivedClosures"), newClosure);
        const querySnapshot = await getDocs(collection(db, "appointments"));
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "appointments", d.id)));
        await Promise.all(deletePromises);
        await updateDoc(doc(db, "settings", "appSettings"), { 
            promotionsGeneratedCount: 0,
            temporaryUnlockThreshold: null 
        });
        const prizeResetPromises = prizes.map(p => updateDoc(doc(db, "prizes", p.id), { dispensed: {} }));
        await Promise.all(prizeResetPromises);
        setIsAppLocked(false);
        setPaymentModalVisible(false);
        showAlert('Contabilità Chiusa', 'Pagamento registrato e contabilità chiusa con successo! App sbloccata.');
    } catch (error: any) {
        console.error("Errore chiusura contabile:", error);
        showAlert("Errore", `Impossibile chiudere la contabilità: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  const unlockSettings = () => {
    if (settingsPassword === 'freecent2025') {
        setAreSettingsUnlocked(true);
        setSettingsPassword('');
    } else {
        showAlert('Accesso Negato', 'Password errata!');
    }
  };

  const saveSettings = async () => {
    const newThreshold = parseFloat(tempThreshold);
    const newPromotionFee = parseFloat(tempPromotionGenerationFee);
    const newCommissionFee = parseFloat(tempCommissionFee);
    const newAutoPaymentThreshold = parseFloat(tempAutoPaymentThreshold);
    if (isNaN(newThreshold) || isNaN(newPromotionFee) || isNaN(newCommissionFee) || isNaN(newAutoPaymentThreshold)) {
        showAlert("Errore di input", "Inserisci valori numerici validi.");
        return;
    }
    try {
        await updateDoc(doc(db, "settings", "appSettings"), {
            commissionThreshold: newThreshold,
            promotionGenerationFee: newPromotionFee,
            commissionFee: newCommissionFee,
            autoPaymentThreshold: newAutoPaymentThreshold,
        });
        setAreSettingsUnlocked(false);
        showAlert('Impostazioni Salvate', 'Impostazioni salvate!');
    } catch (error: any) {
        console.error("Errore salvataggio impostazioni:", error);
        showAlert("Errore", `Impossibile salvare le impostazioni: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  const handleSetTemporaryThreshold = async () => {
    const newTempThreshold = parseFloat(tempUnlockThresholdInput);
    const currentTotalDue = (appointments.length * commissionFee) + (promotionsGeneratedCount * promotionGenerationFee);

    if (isNaN(newTempThreshold) || newTempThreshold <= currentTotalDue) {
        showAlert(
            "Valore Invalido", 
            `Inserisci un valore numerico maggiore del totale dovuto attuale (€${currentTotalDue.toFixed(2)}).`
        );
        return;
    }

    try {
        setTemporaryUnlockThreshold(newTempThreshold);
        
        await updateDoc(doc(db, "settings", "appSettings"), {
            temporaryUnlockThreshold: newTempThreshold
        });

        setTempUnlockThresholdInput('');
        showAlert(
            "Successo", 
            `Nuova soglia temporanea impostata a €${newTempThreshold.toFixed(2)}. L'app è sbloccata.`
        );
    } catch (error: any) {
        console.error("Errore impostazione soglia temporanea:", error);
        setTemporaryUnlockThreshold(null); // Rollback in caso di errore
        showAlert("Errore", `Impossibile impostare la soglia temporanea: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  const saveHairdresserPassword = async () => {
      if(!tempHairdresserPassword.trim()){
          showAlert('Errore', 'La password non può essere vuota.');
          return;
      }
      try {
        await updateDoc(doc(db, "settings", "appSettings"), { hairdresserPassword: tempHairdresserPassword });
        setAreSettingsUnlocked(false);
        showAlert('Password Aggiornata', 'Password parrucchiere aggiornata!');
      } catch (error: any) {
        console.error("Errore salvataggio password:", error);
        showAlert("Errore", `Impossibile aggiornare la password: ${error.message || 'Errore sconosciuto'}`);
      }
  }

  const handleHairdresserLogin = () => {
      if (hairdresserPasswordInput === hairdresserPassword) {
          // *** ERRORE CORRETTO QUI ***
          setHairdresserLoginModalVisible(false);
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
    setAiDescription('');
    setTreatmentModalVisible(true);
  };

  const openReminderModal = (app: Appointment) => {
    setSelectedAppointmentForReminder(app);
    setReminderText('');
    setReminderModalVisible(true);
  };

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
      } catch (error: any) {
        console.error("Errore aggiunta trattamento:", error);
        showAlert("Errore", `Impossibile aggiungere il trattamento: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleDeleteTreatment = async (id: string) => {
      try {
        await deleteDoc(doc(db, "treatments", id));
        showAlert("Successo", "Trattamento eliminato!");
      } catch (error: any) {
        console.error("Errore eliminazione trattamento:", error);
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
      } catch (error: any) {
        console.error("Errore aggiunta premio:", error);
        showAlert("Errore", `Impossibile aggiungere il premio: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleDeletePrize = async (idToDelete: string) => {
      try {
        await deleteDoc(doc(db, "prizes", idToDelete));
        showAlert("Successo", "Premio eliminato!");
      } catch (error: any) {
        console.error("Errore eliminazione premio:", error);
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
      } catch (error: any) {
        console.error("Errore aggiornamento limite premio:", error);
        showAlert("Errore", `Impossibile aggiornare il limite del premio: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleAddHairdresser = async () => {
      if (!newHairdresserName.trim()) {
          showAlert("Nome Mancante", "Inserisci il nome del parrucchiere.");
          return;
      }
      try {
          await addDoc(collection(db, "hairdressers"), {
            name: newHairdresserName,
            workingHours: {
                monday: { start: '09:00', end: '18:00' },
                tuesday: { start: '09:00', end: '18:00' },
                wednesday: { start: '09:00', end: '18:00' },
                thursday: { start: '09:00', end: '18:00' },
                friday: { start: '09:00', end: '18:00' },
                saturday: { start: '09:00', end: '13:00' },
                sunday: null,
            },
            absentDates: [],
          });
          setNewHairdresserName('');
          showAlert("Successo", "Parrucchiere aggiunto!");
      } catch (error: any) {
          console.error("Errore aggiunta parrucchiere:", error);
          showAlert("Errore", `Impossibile aggiungere il parrucchiere: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  const handleDeleteHairdresser = async (id: string) => {
      try {
          await deleteDoc(doc(db, "hairdressers", id));
          showAlert("Successo", "Parrucchiere eliminato!");
      } catch (error: any) {
          console.error("Errore nell'eliminazione parrucchiere:", error);
          showAlert("Errore", `Impossibile eliminare il parrucchiere: ${error.message || 'Errore sconosciuto'}`);
      }
  };

  // --- Funzioni AI (rimangono invariate) ---
    const generateAiSuggestion = async () => {
        if (!aiAnswers.occasion || !aiAnswers.style) { showAlert("Campi Mancanti", "Per favore, rispondi a entrambe le domande."); return; }
        setIsGenerating(true);
        setAiSuggestion('');
        const prompt = `Agisci come un esperto hair stylist. Un cliente cerca un consiglio per un look. L'occasione è "${aiAnswers.occasion}" e il suo stile personale è "${aiAnswers.style}". Fornisci un suggestion dettagliato e creativo per un taglio e colore, spiegando perché si adatta al contesto. Sii incoraggiante e professionale.`;
        const payload = { contents: [{ role: "user" as const, parts: [{ text: prompt }] }] };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) { setAiSuggestion(result.candidates[0].content.parts[0].text); }
            else { throw new Error("Risposta non valida dall'AI."); }
        } catch (error: any) {
            console.error("Errore AI:", error);
            setAiSuggestion("Siamo spiacenti, si è verificato un errore. Riprova più tardi.");
        } finally { setIsGenerating(false); }
    };
    
    useEffect(() => {
        const generateDescription = async () => {
            if (!isTreatmentModalVisible || !selectedTreatmentForModal || aiDescription) return;
            setIsGeneratingDescription(true);
            const prompt = `Scrivi una breve, accattivante e semplice descrizione di marketing per il seguente trattamento per capelli: "${selectedTreatmentForModal.name}". Evidenzia i benefici chiave per il cliente in 2-3 frasi.`;
            const payload = { contents: [{ role: "user" as const, parts: [{ text: prompt }] }] };
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates[0].content.parts[0].text) { setAiDescription(result.candidates[0].content.parts[0].text); }
                else { throw new Error("Risposta non valida dall'AI."); }
            } catch (error: any) {
                console.error("Errore AI:", error);
                setAiDescription("Non è stato possibile caricare la descrizione.");
            } finally { setIsGeneratingDescription(false); }
        };
        generateDescription();
    }, [isTreatmentModalVisible, selectedTreatmentForModal, aiDescription]);

    useEffect(() => {
        const generateReminder = async () => {
            if (!isReminderModalVisible || !selectedAppointmentForReminder || reminderText) return;
            setIsGeneratingReminder(true);
            const { clientName, date, time, clientPhone, hairdresserId } = selectedAppointmentForReminder;
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
            const hairdresser = hairdressers.find(hd => hd.id === hairdresserId);
            const hairdresserName = hairdresser ? ` con ${hairdresser.name}` : '';
            const prompt = `Scrivi un breve, amichevole e professionale messaggio di promemoria per un appuntamento dal parrucchiere. Il nome del cliente è ${clientName}, l'appuntamento è per il giorno ${formattedDate} alle ore ${time}${hairdresserName} presso "${salonNameFromFirestore}". Il loro numero di telefono è ${clientPhone}. Aggiungi un tocco di entusiasmo.`;
            const payload = { contents: [{ role: "user" as const, parts: [{ text: prompt }] }] };
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates[0].content.parts[0].text) { setReminderText(result.candidates[0].content.parts[0].text); }
                else { throw new Error("Risposta non valida dall'AI."); }
            } catch (error: any) {
                console.error("Errore AI:", error);
                setReminderText(`Ciao ${clientName}! Ti ricordiamo il tuo appuntamento da ${salonNameFromFirestore} per il giorno ${formattedDate} alle ore ${time}${hairdresserName}. A presto!`);
            } finally { setIsGeneratingReminder(false); }
        };
        generateReminder();
    }, [isReminderModalVisible, selectedAppointmentForReminder, reminderText, salonNameFromFirestore, hairdressers]);

  // --- Funzioni di Rendering (invariate) ---
  const renderHomeScreen = () => (
    <div style={globalStyles.page}>
      {isAppLocked && <div style={globalStyles.adminAlert}>APP BLOCCATA: Pagamento richiesto nell'Area Riservata.</div>}
      <img src={salonLogoUrlFromFirestore} style={globalStyles.logo} alt="Logo del salone" onClick={handleLogoTap} />
      <h1 style={globalStyles.salonName}>{salonNameFromFirestore}</h1>
      <p style={globalStyles.salonAddress}>{salonAddressFromFirestore} {salonPhoneFromFirestore && ` | Tel: ${salonPhoneFromFirestore}`}</p>
      <button style={{...globalStyles.ctaButton, ...(isAppLocked && globalStyles.ctaButtonDisabled)}} onClick={() => !isAppLocked && setScreen('booking')} disabled={isAppLocked}>Prenota un Appuntamento</button>
      <button style={globalStyles.aiButton} onClick={() => setAiModalVisible(true)}>✨ Consulente di Stile Virtuale</button>
      {/* *** ERRORE CORRETTO QUI *** */}
      <button style={globalStyles.adminButton} onClick={() => setHairdresserLoginModalVisible(true)}>Area Riservata</button>
    </div>
  );
  
  const renderBookingScreen = () => (
    <div style={globalStyles.page}>
      <button style={globalStyles.backButton} onClick={() => setScreen('home')}>‹ Torna alla Home</button>
      <h2 style={globalStyles.sectionTitle}>1. Scegli la data</h2>
      <Calendar selectedDate={selectedDate} onDateSelect={(date: string) => { setSelectedDate(date); setSelectedSlot(''); setSelectedHairdresserId(''); }} />
      {selectedDate && (
        <>
          <h2 style={globalStyles.sectionTitle}>2. Scegli il tuo parrucchiere</h2>
          <div style={globalStyles.slotsContainer}>
            {hairdressers.map(hd => (
              <button key={hd.id} style={{ ...globalStyles.slotItem, ...(selectedHairdresserId === hd.id && globalStyles.slotItemSelected) }} onClick={() => { setSelectedHairdresserId(hd.id); setSelectedSlot(''); }}>{hd.name}</button>
            ))}
          </div>
        </>
      )}
      {selectedHairdresserId && selectedDate && (
        <>
          <h2 style={globalStyles.sectionTitle}>3. Scegli l'orario</h2>
          <div style={globalStyles.slotsContainer}>
            {getHairdresserAvailableSlots(selectedDate, selectedHairdresserId).map(time => (
              <TimeSlot key={time} time={time} onSelect={setSelectedSlot} isSelected={selectedSlot === time} isBooked={appointments.some(app => app.date === selectedDate && app.time === time && app.hairdresserId === selectedHairdresserId)} />
            ))}
          </div>
        </>
      )}
      {selectedSlot && selectedHairdresserId && (
        <>
          <h2 style={globalStyles.sectionTitle}>4. Scegli i trattamenti</h2>
          {treatments.map(item => <TreatmentItem key={item.id} item={item} onSelect={handleSelectTreatment} isSelected={selectedTreatments.some(t => t.id === item.id)} onInfoClick={openTreatmentModal} /> )}
        </>
      )}
      {selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && (
        <>
          <h2 style={globalStyles.sectionTitle}>5. Inserisci i tuoi dati</h2>
          <input type="text" style={globalStyles.inputField} placeholder="Il tuo Nome e Cognome" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input type="tel" style={globalStyles.inputField} placeholder="Il tuo Numero di Telefono" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
        </>
      )}
      {clientName && clientPhone && selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && (
        <>
            {clientPhone.trim() && (
                <div style={globalStyles.summaryContainer}>
                    <h3 style={globalStyles.subSectionTitle}>Punti Fedeltà</h3>
                    {(() => {
                        const currentClient = clientProfiles.find(p => p.phone === clientPhone);
                        if (!currentClient) return <p style={globalStyles.summaryText}>Registrati con questo numero per iniziare a guadagnare punti!</p>;
                        return (
                            <>
                                <p style={globalStyles.summaryText}>Hai accumulato: <b>{currentClient.loyaltyPoints} punti</b></p>
                                <p style={globalStyles.summaryText}>Punti guadagnati: <b>+{totalCost * LOYALTY_SETTINGS.pointsPerEuro}</b></p>
                                <h4 style={globalStyles.subSectionTitle}>Riscatta Premio:</h4>
                                {LOYALTY_SETTINGS.thresholds.map(threshold => (
                                    <button key={threshold.points} style={{ ...globalStyles.smallButton, marginRight: '10px', backgroundColor: currentClient.loyaltyPoints >= threshold.points ? '#4CAF50' : '#555', color: currentClient.loyaltyPoints >= threshold.points ? '#1a1a1a' : '#aaa', cursor: currentClient.loyaltyPoints >= threshold.points ? 'pointer' : 'not-allowed' }} disabled={currentClient.loyaltyPoints < threshold.points} onClick={() => { showAlert("Riscatto Premio", `Hai riscattato ${threshold.description}!`); }}>{threshold.description} ({threshold.points} punti)</button>
                                ))}
                            </>
                        );
                    })()}
                </div>
            )}
            <div style={globalStyles.summaryContainer}>
                <h3 style={globalStyles.summaryTitle}>Riepilogo Prenotazione</h3>
                <p style={globalStyles.summaryText}><b>Nome:</b> {clientName}</p>
                <p style={globalStyles.summaryText}><b>Telefono:</b> {clientPhone}</p>
                <p style={globalStyles.summaryText}><b>Data:</b> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
                <p style={globalStyles.summaryText}><b>Orario:</b> {selectedSlot}</p>
                <p style={globalStyles.summaryText}><b>Parrucchiere:</b> {hairdressers.find(hd => hd.id === selectedHairdresserId)?.name || 'N/A'}</p>
                <p style={globalStyles.summaryText}><b>Trattamenti:</b> {selectedTreatments.map(t => t.name).join(', ')}</p>
                <p style={globalStyles.summaryTotal}>Totale: €{totalCost.toFixed(2)}</p>
                <button style={globalStyles.ctaButton} onClick={handleBooking}>Conferma Prenotazione</button>
            </div>
        </>
      )}
    </div>
  );

  const renderAdminScreen = () => {
    const totalAppointmentsDue = appointments.length * commissionFee;
    const totalPromotionsDue = promotionsGeneratedCount * promotionGenerationFee;
    const totalDue = totalAppointmentsDue + totalPromotionsDue;
    return (
      <div style={globalStyles.page}>
         <button style={globalStyles.backButton} onClick={() => setScreen('home')}>‹ Torna alla Home</button>
        <div style={globalStyles.adminHeader}>
            <h1 style={globalStyles.adminTitle}>Dashboard Parrucchiere</h1>
            <p style={globalStyles.adminSubtitle}>Periodo contabile corrente</p>
        </div>
        <div style={globalStyles.settingsSection}>
            <h3 style={globalStyles.subSectionTitle}>Crea una Promozione</h3>
            <p style={{...globalStyles.modalMessage, textAlign: 'left', marginBottom: '15px'}}>Descrivi la tua offerta. L'AI creerà un'immagine accattivante.</p>
            <input type="text" value={promoDescription} onChange={(e) => setPromoDescription(e.target.value)} placeholder="Es: Sconto 20% sul colore" style={globalStyles.inputField} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <button style={{...globalStyles.smallButton, flex: 1, minWidth: 'calc(50% - 5px)', backgroundColor: promoSubject === 'woman' ? '#e6c300' : '#444', color: promoSubject === 'woman' ? '#1a1a1a' : '#e6c300' }} onClick={() => setPromoSubject('woman')}>Donna</button>
                <button style={{...globalStyles.smallButton, flex: 1, minWidth: 'calc(50% - 5px)', backgroundColor: promoSubject === 'man' ? '#e6c300' : '#444', color: promoSubject === 'man' ? '#1a1a1a' : '#e6c300' }} onClick={() => setPromoSubject('man')}>Uomo</button>
                <button style={{...globalStyles.smallButton, flex: 1, minWidth: 'calc(50% - 5px)', backgroundColor: promoSubject === 'couple' ? '#e6c300' : '#444', color: promoSubject === 'couple' ? '#1a1a1a' : '#e6c300' }} onClick={() => setPromoSubject('couple')}>Coppia</button>
                <button style={{...globalStyles.smallButton, flex: 1, minWidth: 'calc(50% - 5px)', backgroundColor: promoSubject === 'scenario' ? '#e6c300' : '#444', color: promoSubject === 'scenario' ? '#1a1a1a' : '#e6c300' }} onClick={() => setPromoSubject('scenario')}>Scenario</button>
            </div>
            {isGeneratingPromo ? <div style={{...globalStyles.spinner, animation: 'spin 1s linear infinite'}}></div> : <button onClick={generatePromoImage} style={{...globalStyles.ctaButton, ...(promoDescription.trim() === '' || promoSubject === null ? globalStyles.ctaButtonDisabled : {})}} disabled={promoDescription.trim() === '' || promoSubject === null}>Genera Immagine</button>}
            {activePromotionImage && (
                <div>
                    <h4 style={globalStyles.subSectionTitle}>Promozione Attiva</h4>
                    <img src={activePromotionImage} alt="Anteprima promozione" style={{width: '100%', borderRadius: '10px', marginTop: '10px'}} />
                    <button onClick={removePromotionImage} style={{...globalStyles.deleteButton, marginTop: '10px', width: '100%'}}>Rimuovi Promozione</button>
                </div>
            )}
        </div>
        {isAppLocked && <div style={globalStyles.adminAlert}>APP BLOCCATA - PAGAMENTO RICHIESTO</div>}
        <div style={globalStyles.statsContainer}>
            <div style={globalStyles.statBox}><p style={globalStyles.statValue}>{appointments.length}</p><p style={globalStyles.statLabel}>Appuntamenti</p></div>
            <div style={globalStyles.statBox}><p style={globalStyles.statValue}>€ {totalAppointmentsDue.toFixed(2)}</p><p style={globalStyles.statLabel}>Commissioni App.</p></div>
            <div style={globalStyles.statBox}><p style={globalStyles.statValue}>€ {totalPromotionsDue.toFixed(2)}</p><p style={globalStyles.statLabel}>Costi Promo ({promotionsGeneratedCount}x)</p></div>
            <div style={globalStyles.statBox}><p style={globalStyles.statValue}>€ {totalDue.toFixed(2)}</p><p style={globalStyles.statLabel}>Totale Dovuto</p></div>
        </div>
        <button style={{ ...globalStyles.ctaButton, ...(appointments.length === 0 && promotionsGeneratedCount === 0 && globalStyles.ctaButtonDisabled), ...(isAppLocked && globalStyles.ctaButtonAlert) }} onClick={() => setPaymentModalVisible(true)} disabled={appointments.length === 0 && promotionsGeneratedCount === 0}>{isAppLocked ? 'PAGA ORA' : 'Chiudi Contabilità e Paga'}</button>
        <h2 style={globalStyles.sectionTitle}>Dettaglio Appuntamenti Correnti</h2>
        {appointments.length > 0 ? (
            [...appointments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((app) => (
                <div key={app.id} style={globalStyles.appointmentCard}>
                  <p style={globalStyles.appointmentClient}>{app.clientName}</p>
                  <p style={globalStyles.appointmentDate}>{new Date(app.date + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', day: 'numeric', month: 'long'})} alle {app.time}</p>
                  {hairdressers.find(hd => hd.id === app.hairdresserId) && (<p style={globalStyles.appointmentServices}>Parrucchiere: {hairdressers.find(hd => hd.id === app.hairdresserId)?.name}</p>)}
                  {app.prize && !app.prize.includes('Ritenta') && <p style={globalStyles.appointmentPrize}>🏆 Premio Vinto: {app.prize}</p>}
                  <button style={globalStyles.smallButton} onClick={() => openReminderModal(app)}>✨ Genera Promemoria</button>
                </div>
            ))
        ) : <p style={globalStyles.noAppointmentsText}>Nessun appuntamento in attesa di pagamento.</p> }
        <div style={globalStyles.archiveSection}>
            <h2 style={globalStyles.sectionTitle}>Archivio Chiusure Contabili</h2>
            {archivedClosures.length > 0 ? (
                archivedClosures.map(closure => (
                    <div key={closure.id} style={globalStyles.appointmentCard}>
                        <p style={globalStyles.appointmentClient}>Chiusura del {new Date(closure.date).toLocaleString('it-IT')}</p>
                        <p style={globalStyles.appointmentServices}>Appuntamenti pagati: {closure.appointmentCount}</p>
                        {closure.promotionGenerationCost !== undefined && (<p style={globalStyles.appointmentServices}>Costo Promozioni: €{closure.promotionGenerationCost.toFixed(2)}</p>)}
                        <p style={globalStyles.appointmentTotal}>Importo versato: €{closure.amountPaid.toFixed(2)}</p>
                    </div>
                ))
            ) : <p style={globalStyles.noAppointmentsText}>Nessuna chiusura archiviata.</p>}
        </div>
        <h2 style={globalStyles.sectionTitle}>Opzioni di Pagamento Automatico</h2>
        <div style={globalStyles.appointmentCard}>
            <p style={globalStyles.appointmentClient}>Pagamento Salone</p>
            <p style={{...globalStyles.appointmentServices, marginTop: '10px'}}>
                {salonStripeCustomerId 
                    ? 'Il pagamento automatico per il salone è configurato.' 
                    : 'Il pagamento automatico per il salone non è ancora stato configurato.'
                }
            </p>
            <button
                style={globalStyles.smallButton}
                onClick={() => setIsPaymentSetupModalVisible(true)}
            >
                {salonStripeCustomerId ? 'Modifica Dati di Pagamento' : 'Configura Pagamento Automatico'}
            </button>
        </div>
      </div>
    );
  };
  
  const AiModal = () => (
    <div style={globalStyles.modalOverlay} onClick={() => setAiModalVisible(false)}>
      <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={globalStyles.modalTitle}>✨ Trova il tuo Look Ideale</h2>
        <p style={globalStyles.modalMessage}>Rispondi a due semplici domande e lascia che la nostra AI ti suggerisca il look perfetto per te!</p>
        {!isGenerating && !aiSuggestion && (
          <>
            <label style={globalStyles.aiFormLabel}>Per quale occasione?</label>
            <select name="occasion" style={globalStyles.aiSelect} value={aiAnswers.occasion} onChange={(e) => setAiAnswers({...aiAnswers, occasion: e.target.value})}>
              <option value="">Scegli un'opzione...</option>
              <option value="Vita di tutti i giorni">Vita di tutti i giorni</option>
              <option value="Evento speciale (matrimonio, festa)">Evento speciale (matrimonio, festa)</option>
              <option value="Incontro di lavoro importante">Incontro di lavoro importante</option>
              <option value="Voglia di un cambiamento radicale">Voglia di un cambiamento radicale</option>
            </select>
            <label style={globalStyles.aiFormLabel}>Qual è il tuo stile?</label>
            <select name="style" style={globalStyles.aiSelect} value={aiAnswers.style} onChange={(e) => setAiAnswers({...aiAnswers, style: e.target.value})}>
              <option value="">Scegli un'opzione...</option>
              <option value="Elegante e classico">Elegante e classico</option>
              <option value="Moderno e audace">Moderno e audace</option>
              <option value="Naturale e minimalista">Naturale e minimalista</option>
              <option value="Casual e sportivo">Casual e sportivo</option>
            </select>
            <button style={{...globalStyles.ctaButton, marginTop: '30px'}} onClick={generateAiSuggestion}>Genera Suggerimento</button>
          </>
        )}
        {isGenerating && <div style={{...globalStyles.spinner, animation: 'spin 1s linear infinite'}}></div>}
        {aiSuggestion && (<> <div style={globalStyles.aiResultBox}>{aiSuggestion}</div> <button style={globalStyles.modalButton} onClick={() => setAiModalVisible(false)}>Chiudi</button> </>)}
      </div>
    </div>
  );

  const TreatmentModal = () => {
    if (!selectedTreatmentForModal) return null;
    return (
      <div style={globalStyles.modalOverlay} onClick={() => setTreatmentModalVisible(false)}>
        <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={globalStyles.modalTitle}>{selectedTreatmentForModal.name}</h2>
          {isGeneratingDescription && <div style={{...globalStyles.spinner, animation: 'spin 1s linear infinite'}}></div>}
          {!isGeneratingDescription && aiDescription && <div style={globalStyles.aiResultBox}>{aiDescription}</div>}
          <button style={globalStyles.modalButton} onClick={() => setTreatmentModalVisible(false)}>Chiudi</button>
        </div>
      </div>
    );
  };
  
  const ReminderModal = () => (
    <div style={globalStyles.modalOverlay} onClick={() => setReminderModalVisible(false)}>
      <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={globalStyles.modalTitle}>✨ Promemoria Generato</h2>
        {isGeneratingReminder && <div style={{...globalStyles.spinner, animation: 'spin 1s linear infinite'}}></div>}
        {!isGeneratingReminder && reminderText && (
          <>
            <div style={globalStyles.aiResultBox}>{reminderText}</div>
            <button style={{...globalStyles.ctaButton, marginTop: '15px'}} onClick={() => {
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
        <button style={globalStyles.modalButton} onClick={() => setReminderModalVisible(false)}>Chiudi</button>
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
        setPrize(eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : prizes.find(p => p.text.includes('Ritenta')) || null);
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
          let transparentPixels = 0;
          for(let i=3; i < imageData.data.length; i+=4) if (imageData.data[i] === 0) transparentPixels++;
          if ((transparentPixels / (canvas.width * canvas.height)) * 100 > 50) setIsRevealed(true);
      };
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    }, [prize]);

    const handleSavePrize = () => {
        if (!prize) return;
        const prizeWindow = window.open('', '', 'width=400,height=300');
        if (prizeWindow) {
            prizeWindow.document.write(`<html><head><title>Il Tuo Premio - ${salonNameFromFirestore}</title><style>body { font-family: sans-serif; background-color: #1a1a1a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .container { text-align: center; border: 3px solid #e6c300; padding: 30px; border-radius: 15px; background-color: #2c2c2c; } h1 { color: #e6c300; }</style></head><body><div class="container"><h1>Congratulazioni!</h1><p>Hai vinto:</p><h2>${prize.text}</h2><p><small>Presenta questo screenshot alla cassa. Valido per 30 giorni.</small></p></div></body></html>`);
        }
    };
    
    return (
      <div style={globalStyles.modalOverlay} onClick={() => onGameEnd(prize)}>
        <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={globalStyles.modalTitle}>Il tuo Gratta e Vinci!</h2>
          <p style={globalStyles.modalMessage}>Gratta e scopri se hai vinto un premio!</p>
          <div style={globalStyles.scratchCardContainer}>
            <span>{prize ? prize.text : ''}</span>
            <canvas ref={canvasRef} style={globalStyles.scratchCanvas} />
          </div>
          {isRevealed && prize && !prize.text.includes("Ritenta") && <button style={globalStyles.ctaButton} onClick={handleSavePrize}>Salva Vincita</button>}
          <button style={globalStyles.modalButton} onClick={() => onGameEnd(prize)}>Torna alla Home</button>
        </div>
      </div>
    );
  };
  
  const renderPaymentModal = () => (
      <div style={globalStyles.modalOverlay} onClick={() => setPaymentModalVisible(false)}>
          <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={globalStyles.modalTitle}>Conferma Pagamento</h2>
              <p style={globalStyles.modalMessage}>Stai per saldare le commissioni per <b>{appointments.length} appuntamenti</b> (totale: €{(appointments.length * commissionFee).toFixed(2)}) e i costi promozioni (totale: €{(promotionsGeneratedCount * promotionGenerationFee).toFixed(2)}), per un totale di <b>€{(appointments.length * commissionFee + promotionsGeneratedCount * promotionGenerationFee).toFixed(2)}</b>.</p>
              <button style={globalStyles.ctaButton} onClick={handleAccountingClosure}>Conferma e Paga Ora</button>
              <button style={globalStyles.modalButton} onClick={() => setPaymentModalVisible(false)}>Annulla</button>
          </div>
      </div>
  );

  const renderHairdresserLoginModal = () => (
      <div style={globalStyles.modalOverlay} onClick={() => setHairdresserLoginModalVisible(false)}>
        <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={globalStyles.modalTitle}>Accesso Area Riservata</h2>
            <input type="password" style={globalStyles.inputField} placeholder="Password" value={hairdresserPasswordInput} onChange={(e) => setHairdresserPasswordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleHairdresserLogin()} />
            <button style={globalStyles.ctaButton} onClick={handleHairdresserLogin}>Accedi</button>
        </div>
      </div>
  );

  const renderSuperAdminModal = () => (
    <div style={globalStyles.modalOverlay} onClick={() => setSuperAdminVisible(false)}>
        <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={globalStyles.modalTitle}>Pannello di Controllo FreeCent</h2>
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Gestione Password Parrucchiere</h3>
                <input type="text" value={tempHairdresserPassword} onChange={(e) => setTempHairdresserPassword(e.target.value)} placeholder="Nuova password" style={globalStyles.inputField} />
                <button onClick={saveHairdresserPassword} style={globalStyles.smallButton}>Salva Password</button>
            </div>
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Informazioni Salone</h3>
                <label style={globalStyles.aiFormLabel}>Nome Salone:</label>
                <input type="text" value={tempSalonName} onChange={(e) => setTempSalonName(e.target.value)} placeholder="Nome del salone" style={globalStyles.inputField} />
                <label style={globalStyles.aiFormLabel}>Indirizzo Salone:</label>
                <input type="text" value={tempSalonAddress} onChange={(e) => setTempSalonAddress(e.target.value)} placeholder="Indirizzo del salone" style={globalStyles.inputField} />
                <label style={globalStyles.aiFormLabel}>Numero di Telefono:</label>
                <input type="text" value={tempSalonPhone} onChange={(e) => setTempSalonPhone(e.target.value)} placeholder="Numero di telefono" style={globalStyles.inputField} />
                <button onClick={handleSaveSalonInfo} style={globalStyles.smallButton}>Salva Info Salone</button>
                <h4 style={{...globalStyles.subSectionTitle, marginTop: '20px'}}>Gestione Logo Salone</h4>
                {salonLogoUrlFromFirestore && <img src={salonLogoUrlFromFirestore} alt="Logo attuale" style={{width: '80px', height: '80px', borderRadius: '50%', display: 'block', margin: '10px auto', border: '1px solid #e6c300'}} />}
                <input type="file" accept="image/*" onChange={(e) => setTempLogoFile(e.target.files ? e.target.files[0] : null)} style={{...globalStyles.inputField, padding: '10px', height: 'auto'}} />
                <button onClick={handleLogoUpload} style={globalStyles.smallButton} disabled={!tempLogoFile}>Carica Nuovo Logo</button>
                {salonLogoUrlFromFirestore !== SALON_INFO.logoUrl && (
                  <button onClick={() => { if (window.confirm("Sei sicuro di voler rimuovere il logo personalizzato?")) { updateDoc(doc(db, "settings", "appSettings"), { salonLogoUrl: SALON_INFO.logoUrl }); showAlert("Logo Rimosso", "Il logo personalizzato è stato ripristinato."); } }} style={{...globalStyles.deleteButton, marginTop: '10px', width: '100%'}}>Ripristina Logo Default</button>
                )}
            </div>
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Gestione Trattamenti</h3>
                <ul style={globalStyles.managementList}>
                   {treatments.map(t => (<li key={t.id} style={globalStyles.managementListItem}><span>{t.name} - €{t.price} ({t.duration} min)</span><button onClick={() => handleDeleteTreatment(t.id)} style={globalStyles.deleteButton}>X</button></li>))}
                </ul>
                <input type="text" value={newTreatment.name} onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})} placeholder="Nome trattamento" style={{...globalStyles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.price} onChange={(e) => setNewTreatment({...newTreatment, price: e.target.value})} placeholder="Prezzo" style={{...globalStyles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.duration} onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})} placeholder="Durata (min)" style={{...globalStyles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddTreatment} style={globalStyles.smallButton}>Aggiungi Trattamento</button>
            </div>
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Gestione Parrucchieri</h3>
                <ul style={globalStyles.managementList}>
                   {hairdressers.map(hd => (
                        <li key={hd.id} style={globalStyles.managementListItem}>
                            <span>{hd.name}</span>
                            <div>
                                <button onClick={() => handleDeleteHairdresser(hd.id)} style={globalStyles.deleteButton}>X</button>
                                <button onClick={() => { setEditingHairdresser(hd); setTempHairdresserWorkingHours(hd.workingHours || {}); setTempHairdresserAbsentDates(hd.absentDates || []); }} style={globalStyles.smallButton}>Modifica Orari</button>
                            </div>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newHairdresserName} onChange={(e) => setNewHairdresserName(e.target.value)} placeholder="Nome nuovo parrucchiere" style={{...globalStyles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddHairdresser} style={globalStyles.smallButton}>Aggiungi Parrucchiere</button>
            </div>
            {editingHairdresser && (
                <div style={globalStyles.modalOverlay}><div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2 style={globalStyles.modalTitle}>Modifica Orari per {editingHairdresser.name}</h2>
                    <h4 style={globalStyles.subSectionTitle}>Orari Settimanali</h4>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                            <label style={{ flex: 1, textTransform: 'capitalize' }}>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
                            <input type="time" value={tempHairdresserWorkingHours[day]?.start || ''} onChange={(e) => setTempHairdresserWorkingHours(prev => ({...prev, [day]: e.target.value ? { start: e.target.value, end: prev[day]?.end || '18:00' } : null }))} style={globalStyles.inputField} />
                            <span>-</span>
                            <input type="time" value={tempHairdresserWorkingHours[day]?.end || ''} onChange={(e) => setTempHairdresserWorkingHours(prev => ({...prev, [day]: e.target.value ? { start: prev[day]?.start || '09:00', end: e.target.value } : null }))} style={globalStyles.inputField} />
                            <input type="checkbox" checked={tempHairdresserWorkingHours[day] === null} onChange={(e) => setTempHairdresserWorkingHours(prev => ({...prev, [day]: e.target.checked ? null : { start: '09:00', end: '18:00' } }))} /> Riposo
                        </div>
                    ))}
                    <h4 style={globalStyles.subSectionTitle}>Date di Assenza</h4>
                    <input type="date" onChange={(e) => { const newDate = e.target.value; if (newDate && !tempHairdresserAbsentDates.includes(newDate)) setTempHairdresserAbsentDates(prev => [...prev, newDate].sort()); }} style={globalStyles.inputField} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                        {tempHairdresserAbsentDates.map(date => (<span key={date} style={{ backgroundColor: '#555', padding: '5px 10px', borderRadius: '5px' }}>{new Date(date).toLocaleDateString('it-IT')}<button onClick={() => setTempHairdresserAbsentDates(prev => prev.filter(d => d !== date))} style={{ background: 'none', border: 'none', color: '#d9534f' }}>&times;</button></span>))}
                    </div>
                    <button onClick={async () => { try { await updateDoc(doc(db, "hairdressers", editingHairdresser.id), { workingHours: tempHairdresserWorkingHours, absentDates: tempHairdresserAbsentDates, }); setEditingHairdresser(null); showAlert("Successo", "Orari aggiornati!"); } catch (error: any) { showAlert("Errore", `Impossibile aggiornare gli orari: ${error.message}`); } }} style={globalStyles.ctaButton}>Salva Orari</button>
                    <button style={globalStyles.modalButton} onClick={() => setEditingHairdresser(null)}>Annulla</button>
                </div></div>
            )}
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Gestione Premi Gratta e Vinci</h3>
                <ul style={globalStyles.managementList}>
                   {prizes.map((p) => (<li key={p.id} style={globalStyles.managementListItem}><span>{p.text}</span><div style={globalStyles.limitInputContainer}><label>G:</label><input type="number" style={globalStyles.limitInput} value={p.limits.daily} onChange={(e) => handlePrizeLimitChange(p.id, 'daily', e.target.value)} /><label>S:</label><input type="number" style={globalStyles.limitInput} value={p.limits.weekly} onChange={(e) => handlePrizeLimitChange(p.id, 'weekly', e.target.value)} /><label>M:</label><input type="number" style={globalStyles.limitInput} value={p.limits.monthly} onChange={(e) => handlePrizeLimitChange(p.id, 'monthly', e.target.value)} />{!p.text.includes('Ritenta') && <button onClick={() => handleDeletePrize(p.id)} style={globalStyles.deleteButton}>X</button>}</div></li>))}
                </ul>
                <input type="text" value={newPrize} onChange={(e) => setNewPrize(e.target.value)} placeholder="Nuovo premio (testo)" style={{...globalStyles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddPrize} style={globalStyles.smallButton}>Aggiungi Premio</button>
            </div>
            <div style={globalStyles.settingsSection}>
                <h3 style={globalStyles.subSectionTitle}>Impostazioni Pagamenti e Soglie</h3>
                {!areSettingsUnlocked ? (
                    <div><input type="password" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} placeholder="Password Amministratore" style={globalStyles.inputField} /><button onClick={unlockSettings} style={globalStyles.smallButton}>Sblocca</button></div>
                ) : (
                    <div>
                        <label>Soglia Pagamento Manuale (€)</label><input type="number" value={tempThreshold} onChange={(e) => setTempThreshold(e.target.value)} style={globalStyles.inputField} step="5" min="5" />
                        <label>Costo Generazione Promo (€)</label><input type="number" value={tempPromotionGenerationFee} onChange={(e) => setTempPromotionGenerationFee(e.target.value)} style={globalStyles.inputField} step="1" min="0" />
                        <label>Commissione per Appuntamento (€)</label><input type="number" value={tempCommissionFee} onChange={(e) => setTempCommissionFee(e.target.value)} style={globalStyles.inputField} step="0.10" min="0" />
                        <label>Soglia Pagamento Automatico (€)</label><input type="number" value={tempAutoPaymentThreshold} onChange={(e) => setTempAutoPaymentThreshold(e.target.value)} style={globalStyles.inputField} step="10" min="10" />
                        <button onClick={saveSettings} style={globalStyles.smallButton}>Salva Impostazioni</button>

                        <hr style={{border: '1px solid #444', margin: '20px 0'}}/>

                        <h4 style={globalStyles.subSectionTitle}>Sblocco App Temporaneo</h4>
                        <p style={{...globalStyles.summaryText, fontSize: '14px', marginBottom: '10px'}}>Se l'app è bloccata, puoi impostare una nuova soglia temporanea qui per sbloccarla fino alla prossima chiusura contabile.</p>
                        <label>Nuova Soglia Temporanea (€)</label>
                        <input 
                            type="number" 
                            value={tempUnlockThresholdInput} 
                            onChange={(e) => setTempUnlockThresholdInput(e.target.value)} 
                            style={globalStyles.inputField}
                            placeholder={`Maggiore del debito attuale`}
                        />
                        <button onClick={handleSetTemporaryThreshold} style={globalStyles.smallButton}>Imposta Soglia Temporanea</button>
                    </div>
                )}
            </div>
            <button style={globalStyles.modalButton} onClick={() => setSuperAdminVisible(false)}>Chiudi Pannello</button>
        </div>
    </div>
  );

    const PaymentSetupModal = () => {
        const handleSubmitCard = async () => {
            try {
                showAlert("Elaborazione...", "Invio dettagli di pagamento...");
                const simulatedCustomerId = `cus_salon_${Math.random().toString(36).substring(2, 15)}`;
                
                await updateDoc(doc(db, "settings", "appSettings"), { salonStripeCustomerId: simulatedCustomerId });
                
                setSalonStripeCustomerId(simulatedCustomerId);
                
                showAlert("Successo (Simulato)", "Metodo di pagamento per il salone configurato! (Simulato)");
                setIsPaymentSetupModalVisible(false);

            } catch (error) {
                console.error("Errore configurazione pagamento:", error);
                showAlert("Errore", "Impossibile configurare il pagamento. Riprova.");
            }
        };

        return (
            <div style={globalStyles.modalOverlay} onClick={() => setIsPaymentSetupModalVisible(false)}>
                <div style={globalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2 style={globalStyles.modalTitle}>Configura Pagamento Automatico Salone</h2>
                    <p style={globalStyles.modalMessage}>Inserisci i dettagli della carta di credito del salone. I pagamenti saranno elaborati automaticamente al raggiungimento della soglia (€
{autoPaymentThreshold.toFixed(2)}).</p>
                    
                    <div style={{ padding: '20px', border: '1px dashed #e6c300', borderRadius: '8px', marginBottom: '20px', color: '#ccc' }}>
                        [Qui si integrerebbe il form di Stripe Elements]
                        <input type="text" placeholder="Numero Carta (simulato)" style={{...globalStyles.inputField, marginTop: '10px'}} />
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input type="text" placeholder="MM/AA (simulato)" style={{...globalStyles.inputField, flex: 1}} />
                            <input type="text" placeholder="CVC (simulato)" style={{...globalStyles.inputField, flex: 1}} />
                        </div>
                    </div>
                    
                    <button style={globalStyles.ctaButton} onClick={handleSubmitCard}>Salva Carta</button>
                    <button style={globalStyles.modalButton} onClick={() => setIsPaymentSetupModalVisible(false)}>Annulla</button>
                </div>
            </div>
        );
    };


  return (
    <div style={globalStyles.container}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(217, 83, 79, 0); } 100% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0); } }
        `}</style>
      
      {isSplashVisible && activePromotionImage && (
            <div style={{...globalStyles.splashScreen, ...(isSplashVisible ? {} : globalStyles.splashScreenHidden)}}>
                <img src={activePromotionImage} alt="Promozione speciale" style={globalStyles.splashImage} />
            </div>
      )}
      
      <div style={{ visibility: isSplashVisible ? 'hidden' : 'visible' }}>
        {screen === 'home' && renderHomeScreen()}
        {screen === 'booking' && renderBookingScreen()}
        {screen === 'admin' && renderAdminScreen()}
      </div>
      
      {isConfModalVisible && (
        <div style={globalStyles.modalOverlay}>
            <div style={globalStyles.modalContent}>
                <h2 style={globalStyles.modalTitle}>Grazie!</h2>
                <p style={globalStyles.modalMessage}>Il tuo appuntamento è stato confermato con successo.</p>
                <button style={globalStyles.modalButton} onClick={handleCloseConfirmationModal}>Scopri il tuo premio!</button>
            </div>
        </div>
      )}

      {isAiModalVisible && <AiModal />}
      {isTreatmentModalVisible && <TreatmentModal />}
      {isReminderModalVisible && <ReminderModal />}
      {isGameModalVisible && <ScratchGameModal onGameEnd={handleGameEnd} />}
      {isPaymentModalVisible && renderPaymentModal()}
      {isSuperAdminVisible && renderSuperAdminModal()}
      {isHairdresserLoginModalVisible && renderHairdresserLoginModal()}
      {isPaymentSetupModalVisible && <PaymentSetupModal />}
      {alertDialog.visible && <AlertDialog title={alertDialog.title} message={alertDialog.message} onClose={closeAlert} />}
    </div>
  );
}