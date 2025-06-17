import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react';

// --- DEFINIZIONE DEI TIPI (per TypeScript) ---
interface Treatment {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Prize {
  id: string;
  text: string;
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  dispensed: {
    daily?: { count: number; date: string };
    weekly?: { count: number; week: string };
    monthly?: { count: number; month: string };
  };
}

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  treatments: Treatment[];
  total: number;
  prize: string;
}

interface ArchivedClosure {
    id: string;
    date: string;
    appointmentCount: number;
    amountPaid: number;
    appointments: Appointment[];
}


// --- DATI DI ESEMPIO E CONFIGURAZIONE ---
const SALON_INFO = {
  name: "L'Angolo dell'Hair Stylist",
  address: "Via della Moda, 12, Milano",
  logoUrl: 'https://placehold.co/150x150/1a1a1a/ffffff?text=Logo',
};

const INITIAL_TREATMENTS: Treatment[] = [
  { id: '1', name: 'Taglio Uomo', price: 25, duration: 30 },
  { id: '2', name: 'Taglio e Piega Donna', price: 50, duration: 60 },
  { id: '3', name: 'Colore', price: 70, duration: 90 },
  { id: '4', name: 'Barba', price: 15, duration: 20 },
  { id: '5', name: 'Trattamento Ristrutturante', price: 35, duration: 45 },
];

const INITIAL_PRIZES: Prize[] = [
    { id: 'prize1', text: '10% Sconto sul prossimo trattamento!', limits: { daily: 5, weekly: 20, monthly: 50 }, dispensed: {} },
    { id: 'prize2', text: 'Trattamento omaggio!', limits: { daily: 1, weekly: 5, monthly: 15 }, dispensed: {} },
    { id: 'prize3', text: 'Ritenta, sarai più fortunato!', limits: { daily: 999, weekly: 9999, monthly: 99999 }, dispensed: {} }
];

const AVAILABLE_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const COMMISSION_FEE = 0.50;
const SUPER_ADMIN_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'f', 'c'];

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

// --- Funzioni Utilità ---
const getWeekNumber = (d: Date): string => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return d.getUTCFullYear() + '-' + weekNo;
};
const getTodayString = (): string => new Date().toISOString().split('T')[0];
const getMonthString = (d: Date): string => d.getFullYear() + '-' + (d.getMonth() + 1);

// --- Componenti UI ---

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [archivedClosures, setArchivedClosures] = useState<ArchivedClosure[]>([]);
  const [isConfModalVisible, setConfModalVisible] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  
  const [treatments, setTreatments] = useState<Treatment[]>(INITIAL_TREATMENTS);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [activePromotionImage, setActivePromotionImage] = useState<string | null>(null);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [clientName, setClientName] = useState('');
  
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
  
  const [newTreatment, setNewTreatment] = useState({name: '', price: '', duration: ''});
  const [newPrize, setNewPrize] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  // New state for promo image subject, updated to include 'couple' and 'scenario'
  const [promoSubject, setPromoSubject] = useState<'woman' | 'man' | 'couple' | 'scenario' | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  const [hairdresserPassword, setHairdresserPassword] = useState('parola');
  const [isHairdresserLoginModalVisible, setHairdresserLoginModalVisible] = useState(false);
  const [hairdresserPasswordInput, setHairdresserPasswordInput] = useState('');
  const [tempHairdresserPassword, setTempHairdresserPassword] = useState(hairdresserPassword);
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

  // Splash Screen Logic
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

  const handleBooking = () => {
    if (!clientName.trim()) {
        showAlert("Errore di input", "Per favorire, inserisci il tuo nome.");
        return;
    }
    const newBookingId = Math.random().toString(36).substr(2, 9);
    const newBooking: Appointment = {
      id: newBookingId,
      clientName: clientName,
      date: selectedDate,
      time: selectedSlot,
      treatments: selectedTreatments,
      total: totalCost,
      prize: '',
    };
    
    setLastBookingId(newBookingId);
    setAppointments(prev => [...prev, newBooking]);
    
    setSelectedDate('');
    setSelectedSlot('');
    setSelectedTreatments([]);
    setClientName('');
    setConfModalVisible(true);
  };
  
  const handleCloseConfirmationModal = () => {
    setConfModalVisible(false);
    setGameModalVisible(true);
  };

  const handleGameEnd = (prizeWon: Prize | null) => {
    if (lastBookingId && prizeWon) {
        setAppointments(prevApps => prevApps.map(app =>
            app.id === lastBookingId ? { ...app, prize: prizeWon.text } : app
        ));
        
        setPrizes(currentPrizes => currentPrizes.map(p => {
            if (p.id === prizeWon.id) {
                const today = getTodayString();
                const week = getWeekNumber(new Date());
                const month = getMonthString(new Date());
                const dailyCount = p.dispensed.daily?.date === today ? (p.dispensed.daily.count || 0) : 0;
                const weeklyCount = p.dispensed.weekly?.week === week ? (p.dispensed.weekly.count || 0) : 0;
                const monthlyCount = p.dispensed.monthly?.month === month ? (p.dispensed.monthly.count || 0) : 0;
                return {
                    ...p,
                    dispensed: {
                        daily: { count: dailyCount + 1, date: today },
                        weekly: { count: weeklyCount + 1, week: week },
                        monthly: { count: monthlyCount + 1, month: month }
                    }
                }
            }
            return p;
        }));
    }
    setLastBookingId(null);
    setGameModalVisible(false);
    setScreen('home');
    if (closureRequired) {
      showAlert("APP BLOCCATA", "ATTENZIONE: L'app è bloccata. È necessario saldare il conto nell'Area Riservata per continuare a ricevere prenotazioni.");
      setScreen('admin');
    }
  }

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
      setActivePromotionImage(null);

      try {
          let backgroundPrompt = '';
          if (promoSubject === 'woman') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una modella con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'man') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare un modello uomo con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'couple') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un uomo e una donna) con tagli di capelli artistici e d'avanguardia, in pose dinamiche e stravaganti. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli dei tagli e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dai soggetti principali. L'immagine non deve contenere testo, loghi o brand.";
          } else if (promoSubject === 'scenario') {
            backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un uomo e una donna) con tagli di capelli artistici e d'avanguardia, immersi in un contesto di sfondo casuale, ma elegante e di lusso (es. un loft urbano, un giardino segreto, una galleria d'arte). Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle in relazione all'ambiente circostante. L'illuminazione deve essere drammatica per esaltare i dettagli dei tagli e i colori. L'immagine non deve contenere testo, loghi o brand.";
          }
          
          const payload = { instances: [{ prompt: backgroundPrompt }], parameters: { "sampleCount": 1} };
          const apiKey = "AIzaSyA7O1WU20fKBxEoaLdiPYP_NYovRQ9M4_0"; // Keep this empty as per instructions. Canvas will provide it at runtime.
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
          logoImg.crossOrigin = "Anonymous"; // Required for loading images from different origins onto canvas

          const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error(`Impossibile caricare l'immagine: ${src}`));
              img.src = src;
          });

          await Promise.all([
              loadImage(backgroundImg, backgroundBase64),
              loadImage(logoImg, SALON_INFO.logoUrl)
          ]);
          
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 80px "Montserrat", "Helvetica Neue", sans-serif'; // Using Montserrat, common web font
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;

          // Function to wrap text to fit within canvas
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
              
              let currentY = y - ((lines.length - 1) * lineHeight); // Adjust start Y for multi-line text to align to bottom
              for (let i = 0; i < lines.length; i++) {
                  ctx.fillText(lines[i].trim(), x, currentY);
                  currentY += lineHeight;
              }
          };

          const textPaddingBottom = 80; // Padding from the bottom for the text
          wrapText(promoDescription, canvas.width / 2, canvas.height - textPaddingBottom, canvas.width - 150, 95);
          
          ctx.shadowColor = 'transparent'; // Reset shadow for logo

          // Draw logo with a white circle background
          const logoPadding = 40;
          const logoSize = 120;
          const logoX = canvas.width - logoSize - logoPadding;
          const logoY = logoPadding;
          
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, Math.PI * 2); // White background circle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          const finalImage = canvas.toDataURL('image/png');
          setActivePromotionImage(finalImage);
          showAlert("Successo", "Immagine promozionale creata e impostata come splash screen!");

      } catch (error) {
          console.error("Errore generazione immagine promo:", error);
          const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
          showAlert("Errore AI", `Errore durante la creazione dell'immagine promozionale: ${errorMessage}`);
      } finally {
          setIsGeneratingPromo(false);
      }
  };

  const handleAccountingClosure = () => {
    const totalDue = appointments.length * COMMISSION_FEE;
    const newClosure: ArchivedClosure = {
        id: `closure-${Date.now()}`,
        date: new Date().toISOString(),
        appointmentCount: appointments.length,
        amountPaid: totalDue,
        appointments: [...appointments]
    };
    setArchivedClosures(prev => [...prev, newClosure]);
    setAppointments([]);
    setIsAppLocked(false);
    setPaymentModalVisible(false);
    showAlert('Contabilità Chiusa', 'Pagamento registrato e contabilità chiusa con successo! App sbloccata.');
  };

  const unlockSettings = () => {
    if (settingsPassword === 'freecent2025') {
        setAreSettingsUnlocked(true);
        setSettingsPassword('');
    } else {
        showAlert('Accesso Negato', 'Password errata!');
    }
  };

  const saveSettings = () => {
    const newThreshold = parseFloat(tempThreshold);
    if (isNaN(newThreshold) || newThreshold <= 0) {
        showAlert("Errore di input", "Inserisci un valore valido per la soglia.");
        return;
    }
    setCommissionThreshold(newThreshold);
    setAreSettingsUnlocked(false);
    showAlert('Impostazioni Salvate', 'Impostazioni salvate!');
  };

  const saveHairdresserPassword = () => {
      if(!tempHairdresserPassword.trim()){
          showAlert('Errore', 'La password non può essere vuota.');
          return;
      }
      setHairdresserPassword(tempHairdresserPassword);
      setAreSettingsUnlocked(false);
      showAlert('Password Aggiornata', 'Password parrucchiere aggiornata!');
  }

  const handleHairdresserLogin = () => {
      if (hairdresserPasswordInput === hairdresserPassword) {
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
    setAiDescription(''); // Clear previous description
    setTreatmentModalVisible(true);
  };

  const openReminderModal = (app: Appointment) => {
    setSelectedAppointmentForReminder(app);
    setReminderText(''); // Clear previous reminder
    setReminderModalVisible(true);
  };

  // Funzioni Super Admin
  const handleAddTreatment = () => {
      if(!newTreatment.name || !newTreatment.price || !newTreatment.duration) {
          showAlert("Campi Mancanti", "Compila tutti i campi del trattamento.");
          return;
      }
      const newId = `treatment-${Date.now()}`;
      setTreatments([...treatments, {id: newId, ...newTreatment, price: parseFloat(newTreatment.price), duration: parseInt(newTreatment.duration)}]);
      setNewTreatment({name: '', price: '', duration: ''});
  };
  const handleDeleteTreatment = (id: string) => {
      setTreatments(treatments.filter(t => t.id !== id));
  };
  const handleAddPrize = () => {
      if (!newPrize.trim()) {
          showAlert("Testo Mancante", "Inserisci il testo del premio.");
          return;
      }
      setPrizes([...prizes, { id: `prize-${Date.now()}`, text: newPrize, limits: { daily: 1, weekly: 1, monthly: 1 }, dispensed: {} }]);
      setNewPrize('');
  };
  const handleDeletePrize = (idToDelete: string) => {
      setPrizes(prizes.filter(p => p.id !== idToDelete));
  };
  const handlePrizeLimitChange = (id: string, period: 'daily' | 'weekly' | 'monthly', value: string) => {
      setPrizes(prizes.map(p => {
          if (p.id === id) {
              return { ...p, limits: { ...p.limits, [period]: parseInt(value) || 0 }};
          }
          return p;
      }));
  }

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
        } catch (error) {
            console.error("Errore AI:", error);
            setAiSuggestion("Siamo spiacenti, si è verificato un errore. Riprova più tardi.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Effect to generate AI description for treatments when modal opens
    useEffect(() => {
        const generateDescription = async () => {
            if (!isTreatmentModalVisible || !selectedTreatmentForModal || aiDescription) return; // Only generate if modal is open, a treatment is selected, and description isn't already there
            
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
            } catch (error) {
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
            if (!isReminderModalVisible || !selectedAppointmentForReminder || reminderText) return; // Only generate if modal is open, an appointment is selected, and reminder isn't already there
            
            setIsGeneratingReminder(true);
            const { clientName, date, time } = selectedAppointmentForReminder;
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
            
            const prompt = `Scrivi un breve, amichevole e professionale messaggio di promemoria per un appuntamento dal parrucchiere. Il nome del cliente è ${clientName}, l'appuntamento è per il giorno ${formattedDate} alle ore ${time} presso "${SALON_INFO.name}". Aggiungi un tocco di entusiasmo.`;

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
            } catch (error) {
                console.error("Errore AI:", error);
                setReminderText(`Ciao ${clientName}! Ti ricordiamo il tuo appuntamento da ${SALON_INFO.name} per il giorno ${formattedDate} alle ore ${time}. A presto!`);
            } finally {
                setIsGeneratingReminder(false);
            }
        };
        generateReminder();
    }, [isReminderModalVisible, selectedAppointmentForReminder, reminderText]);

  // --- Funzioni di Rendering ---
  const renderHomeScreen = () => (
    <div style={styles.page}>
      {isAppLocked && (
        <div style={styles.adminAlert}>
            APP BLOCCATA: Pagamento richiesto nell'Area Riservata.
        </div>
      )}
      <img src={SALON_INFO.logoUrl} style={styles.logo} alt="Logo del salone" onClick={handleLogoTap} />
      <h1 style={styles.salonName}>{SALON_INFO.name}</h1>
      <p style={styles.salonAddress}>{SALON_INFO.address}</p>
      
      <button style={{...styles.ctaButton, ...(isAppLocked && styles.ctaButtonDisabled)}} onClick={() => !isAppLocked && setScreen('booking')} disabled={isAppLocked}>
        Prenota un Appuntamento
      </button>

        <button style={styles.aiButton} onClick={() => setAiModalVisible(true)}>
        ✨ Consulente di Stile Virtuale
      </button>
      
      <button style={styles.adminButton} onClick={() => setHairdresserLoginModalVisible(true)}>
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
        }}
      />

      {selectedDate && (
        <>
          <h2 style={styles.sectionTitle}>2. Scegli l'orario</h2>
          <div style={styles.slotsContainer}>
            {AVAILABLE_SLOTS.map(time => {
              const isBooked = appointments.some(app => app.date === selectedDate && app.time === time);
              return <TimeSlot key={time} time={time} onSelect={setSelectedSlot} isSelected={selectedSlot === time} isBooked={isBooked} />
            })}
          </div>
        </>
      )}

      {selectedSlot && (
        <>
          <h2 style={styles.sectionTitle}>3. Scegli i trattamenti</h2>
          {treatments.map(item => <TreatmentItem key={item.id} item={item} onSelect={handleSelectTreatment} isSelected={selectedTreatments.some(t => t.id === item.id)} onInfoClick={openTreatmentModal} /> )}
        </>
      )}

      {selectedTreatments.length > 0 && selectedSlot && (
          <>
            <h2 style={styles.sectionTitle}>4. Inserisci il tuo nome</h2>
            <input type="text" style={styles.inputField} placeholder="Il tuo Nome e Cognome" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </>
      )}
      
      {clientName && selectedTreatments.length > 0 && selectedSlot && selectedDate && (
        <div style={styles.summaryContainer}>
            <h3 style={styles.summaryTitle}>Riepilogo Prenotazione</h3>
            <p style={styles.summaryText}><b>Nome:</b> {clientName}</p>
            <p style={styles.summaryText}><b>Data:</b> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
            <p style={styles.summaryText}><b>Orario:</b> {selectedSlot}</p>
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
                        minWidth: 'calc(50% - 5px)', // Adjusted for two columns, wrap
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
                        minWidth: 'calc(50% - 5px)', // Adjusted for two columns, wrap
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
                        minWidth: 'calc(50% - 5px)', // Adjusted for two columns, wrap
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
                        minWidth: 'calc(50% - 5px)', // Adjusted for two columns, wrap
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
                    <button onClick={() => setActivePromotionImage(null)} style={{...styles.deleteButton, marginTop: '10px', width: '100%'}}>Rimuovi Promozione</button>
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
            [...appointments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((app) => (
                <div key={app.id} style={styles.appointmentCard}>
                  <p style={styles.appointmentClient}>{app.clientName}</p>
                  <p style={styles.appointmentDate}>{new Date(app.date + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', day: 'numeric', month: 'long'})} alle {app.time}</p>
                  {app.prize && !app.prize.includes('Ritenta') && (
                    <p style={styles.appointmentPrize}>🏆 Premio Vinto: {app.prize}</p>
                  )}
                  <button style={styles.smallButton} onClick={() => openReminderModal(app)}>✨ Genera Promemoria</button>
                </div>
            ))
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
            {/* Using document.execCommand('copy') for clipboard operations in iframe environments */}
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
    // Use a ref for isDrawing to prevent re-renders from resetting the drawing state
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const today = getTodayString();
        const week = getWeekNumber(new Date());
        const month = getMonthString(new Date());

        const availablePrizes = prizes.filter(p => {
            // "Ritenta" prize is always available
            if (p.text.includes('Ritenta')) return true;

            const dailyCount = p.dispensed.daily?.date === today ? (p.dispensed.daily.count || 0) : 0;
            const weeklyCount = p.dispensed.weekly?.week === week ? (p.dispensed.weekly.count || 0) : 0;
            const monthlyCount = p.dispensed.monthly?.month === month ? (p.dispensed.monthly.count || 0) : 0;

            // Check if limits for the current period are exceeded
            return dailyCount < p.limits.daily && weeklyCount < p.limits.weekly && monthlyCount < p.limits.monthly;
        });

        const eligible = availablePrizes.filter(p => !p.text.includes('Ritenta')); // Filter out "Ritenta" for initial random selection
        if (eligible.length > 0) {
            setPrize(eligible[Math.floor(Math.random() * eligible.length)]);
        } else {
            // If no eligible prizes, select "Ritenta"
            setPrize(prizes.find(p => p.text.includes('Ritenta')) || null);
        }
    }, [prizes]);

    useEffect(() => {
      if(!prize || !canvasRef.current) return; 
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Always re-initialize canvas when prize changes (new game starts)
      canvas.width = 300;
      canvas.height = 150;
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setIsRevealed(false); // Reset revealed state for new game
      isDrawingRef.current = false; // Ensure ref is reset too

      const getEventPosition = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const event = 'touches' in e ? e.touches[0] : e;
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => { e.preventDefault(); isDrawingRef.current = true; draw(e); };
      const stopDrawing = () => { isDrawingRef.current = false; checkRevealed(); };
      const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current) return; // Use ref here
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        ctx.globalCompositeOperation = 'destination-out'; // This makes drawn areas transparent
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false); // Draw a transparent circle
        ctx.fill();
      };

      const checkRevealed = () => {
          // Get image data to check transparency
          const imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
          const data = imageData.data;
          let transparentPixels = 0;
          // Loop through pixels, checking the alpha channel (every 4th byte)
          for(let i=3; i < data.length; i+=4) {
              if (data[i] === 0) { // If alpha channel is 0, it's fully transparent
                  transparentPixels++;
              }
          }
          const revealedPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
          if (revealedPercentage > 50) { // If more than 50% is transparent, consider it revealed
              setIsRevealed(true);
          }
      };
      
      // Add event listeners for both mouse and touch interactions
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing); // Important for mouse
      canvas.addEventListener('touchstart', startDrawing, { passive: false }); // passive: false to allow preventDefault
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing); // Handle when touch is interrupted

      // Cleanup function for event listeners
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
    }, [prize]); // Dependency: prize. When prize changes, a new game starts, and canvas needs re-init.
    // The isDrawingRef is not a dependency here as it's a mutable ref and changing it
    // doesn't mean the effect needs to re-run.

    const handleSavePrize = () => {
        if (!prize) return;
        // Open a new window to display the prize certificate
        const prizeWindow = window.open('', '', 'width=400,height=300');
        if (prizeWindow) {
            prizeWindow.document.write(`
                <html><head><title>Il Tuo Premio - ${SALON_INFO.name}</title>
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
            {/* Display prize text underneath the canvas */}
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
      <div style={styles.modalOverlay} onClick={() => setHairdresserLoginModalVisible(false)}>
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
                <input type="text" value={tempHairdresserPassword} onChange={(e) => setTempHairdresserPassword(e.target.value)} style={styles.inputField} />
                <button onClick={saveHairdresserPassword} style={styles.smallButton}>Salva Password</button>
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