import React, { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { useAppContext } from '../contexts'; // Importa il contesto
import { SUPER_ADMIN_SEQUENCE } from '../utils/constants';

// Stili copiati e consolidati dal tuo App.tsx originale per HomeScreen
const styles: { [key: string]: CSSProperties } = {
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
  adminAlert: {
    backgroundColor: '#d9534f',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
};

interface HomeScreenProps {
  setScreen: (screen: string) => void;
  setIsSplashVisible: (visible: boolean) => void;
  isSplashVisible: boolean; // Utilizzato per decidere se mostrare il contenuto o lo splash
}

const HomeScreen = ({ setScreen, setIsSplashVisible, isSplashVisible }: HomeScreenProps) => {
  const { 
    appointments, 
    commissionFee, 
    commissionThreshold, 
    promotionsGeneratedCount, 
    promotionGenerationFee,
    salonNameFromFirestore,
    salonAddressFromFirestore,
    salonPhoneFromFirestore,
    salonLogoUrlFromFirestore,
    activePromotionImage,
    showAlert, // Per alert in caso di blocco
  } = useAppContext();

  const [isAppLocked, setIsAppLocked] = useState(false); // Stato per il blocco dell'app
  const [isSuperAdminVisible, setSuperAdminVisible] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [logoTapCount, setLogoTapCount] = useState(0);

  // Calcola se la chiusura è richiesta
  const closureRequired = useMemo(() => {
    const totalAppointmentsDue = appointments.length * commissionFee;
    const totalPromotionsDue = promotionsGeneratedCount * promotionGenerationFee;
    return (totalAppointmentsDue + totalPromotionsDue) >= commissionThreshold;
  }, [appointments, commissionThreshold, promotionsGeneratedCount, promotionGenerationFee, commissionFee]);

  // Effetto per bloccare/sbloccare l'app
  useEffect(() => {
    if(closureRequired) {
      setIsAppLocked(true);
      // Puoi aggiungere qui un alert automatico se vuoi
      // showAlert("APP BLOCCATA", "ATTENZIONE: L'app è bloccata. È necessario saldare il conto nell'Area Riservata per continuare a ricevere prenotazioni.");
    } else {
      setIsAppLocked(false);
    }
  }, [closureRequired, showAlert]);


  // Gestione dello splash screen (spostato qui dallo App.tsx principale per coerenza)
  useEffect(() => {
    if (activePromotionImage) {
      setIsSplashVisible(true);
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 4000); // 4 secondi
      return () => clearTimeout(timer);
    } else {
        setIsSplashVisible(false); // Se non c'è immagine promo, non mostrare splash
    }
  }, [activePromotionImage, setIsSplashVisible]);

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
          showAlert("Super Admin", "Pannello Super Admin sbloccato!");
      }
  }, [keySequence, showAlert]); // Aggiungi showAlert alle dipendenze

  const handleLogoTap = () => {
      const newCount = logoTapCount + 1;
      setLogoTapCount(newCount);
      if (newCount === 7) {
          setSuperAdminVisible(true);
          setLogoTapCount(0);
          showAlert("Super Admin", "Pannello Super Admin sbloccato!");
      }
      // Reset tap count if not enough taps within 2 seconds
      setTimeout(() => {
          if (logoTapCount > 0 && newCount < 7) {
              setLogoTapCount(0);
          }
      }, 2000);
  };

  return (
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

      <button style={styles.aiButton} onClick={() => setScreen('aiModal')}>
        ✨ Consulente di Stile Virtuale
      </button>
      
      <button style={styles.adminButton} onClick={() => setScreen('hairdresserLogin')}>
        Area Riservata
      </button>

      {/* Il SuperAdminModal sarà renderizzato direttamente in AppContent quando isSuperAdminVisible è true */}
    </div>
  );
};

export default HomeScreen;