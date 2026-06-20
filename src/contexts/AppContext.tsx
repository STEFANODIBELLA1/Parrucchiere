import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, query, where, type DocumentData, type WithFieldValue } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from '../utils/firebaseConfig';
// TIPI AGGIORNATI: 'Employee' è il nuovo nome per il dipendente, 'Hairdresser' è l'account del salone.
import { Appointment, ArchivedClosure, Treatment, Prize, Hairdresser, Employee, ClientProfile } from '../utils/types';
import { LOYALTY_SETTINGS } from '../utils/constants'; // Rimuoviamo le costanti iniziali che ora sono dinamiche
import { getTodayString, getWeekNumber, getMonthString } from '../utils/helpers';
import AlertDialog from '../components/ui/AlertDialog';

// --- NUOVA LOGICA DI AUTENTICAZIONE (SIMULATA) ---
// In un'app reale, useresti un hook come `useAuth()` per ottenere l'utente e il suo hairdresserId.
// Per ora, simuliamo di essere loggati come un salone specifico.
const useSimulatedAuth = () => {
  // Sostituisci questo ID con altri per testare diversi saloni.
  // Se impostato a `null`, l'app non caricherà dati.
  const [currentHairdresserId] = useState<string | null>('salon_01_placeholder_id');
  return { currentHairdresserId };
};
// --- FINE LOGICA DI AUTENTICAZIONE (SIMULATA) ---

// Interfaccia per il profilo del salone attivo
interface HairdresserProfile extends Hairdresser {
  // Aggiungiamo qui altri campi specifici che prima erano globali
  hairdresserPassword?: string;
  activePromotionImageUrl?: string | null;
  promotionsGeneratedCount?: number;
  commissionThreshold?: number;
  commissionFee?: number;
  promotionGenerationFee?: number;
  autoPaymentThreshold?: number;
  // Informazioni del salone (scritte da SuperAdminModal)
  salonName?: string;
  salonAddress?: string;
  salonPhone?: string;
  salonLogoUrl?: string | null;
  stripeCustomerId?: string;
}

// Interfaccia aggiornata per il contesto
interface AppContextType {
  currentHairdresserId: string | null;
  hairdresserProfile: HairdresserProfile | null;
  appointments: Appointment[];
  archivedClosures: ArchivedClosure[];
  treatments: Treatment[];
  prizes: Prize[];
  employees: Employee[];
  clientProfiles: ClientProfile[];
  showAlert: (title: string, message: string) => void;
  // --- ALIAS RETRO-COMPATIBILI (le schermate/modali "vecchie" usano ancora questi nomi) ---
  hairdressers: Employee[];
  salonNameFromFirestore: string;
  salonAddressFromFirestore: string;
  salonPhoneFromFirestore: string;
  salonLogoUrlFromFirestore: string;
  activePromotionImage: string | null;
  commissionFee: number;
  commissionThreshold: number;
  promotionsGeneratedCount: number;
  promotionGenerationFee: number;
  autoPaymentThreshold: number;
  hairdresserPassword: string;
  updateAppSettings: (settings: Partial<HairdresserProfile>) => Promise<void>;
  addHairdresser: (name: string) => Promise<void>;
  deleteHairdresser: (id: string) => Promise<void>;
  updateHairdresser: (employee: Employee) => Promise<void>;
  // Funzioni modificate per essere multi-tenant
  addAppointment: (newAppointment: Omit<Appointment, 'id' | 'hairdresserId'>, clientPhone: string, totalCost: number) => Promise<string | null>;
  updateAppointmentPrize: (id: string, prizeText: string) => Promise<void>;
  updatePrizeDispensed: (prize: Prize) => Promise<void>;
  addArchivedClosure: (newClosure: Omit<ArchivedClosure, 'id' | 'hairdresserId'>) => Promise<void>;
  deleteAllAppointments: () => Promise<void>;
  resetPromotionsGeneratedCount: () => Promise<void>;
  resetPrizeDispensedCounts: (prizesToReset: Prize[]) => Promise<void>;
  updateHairdresserProfile: (settings: Partial<HairdresserProfile>) => Promise<void>;
  generatePromotionImage: (description: string, subject: 'woman' | 'man' | 'couple' | 'scenario' | null) => Promise<void>;
  removePromotionImage: () => Promise<void>;
  uploadSalonLogo: (file: File) => Promise<void>;
  addTreatment: (treatment: Omit<Treatment, 'id' | 'hairdresserId'>) => Promise<void>;
  deleteTreatment: (id: string) => Promise<void>;
  addPrize: (text: string) => Promise<void>;
  deletePrize: (id: string) => Promise<void>;
  updatePrizeLimits: (id: string, period: 'daily' | 'weekly' | 'monthly', value: number) => Promise<void>;
  addEmployee: (name: string) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { currentHairdresserId } = useSimulatedAuth();

  // Stato per il profilo del salone attualmente loggato
  const [hairdresserProfile, setHairdresserProfile] = useState<HairdresserProfile | null>(null);

  // Stato per i dati specifici del salone
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [archivedClosures, setArchivedClosures] = useState<ArchivedClosure[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]); // Rinominato da 'hairdressers'
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([]);

  // Stato per AlertDialog
  const [alertDialog, setAlertDialog] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string) => setAlertDialog({ visible: true, title, message });
  const closeAlert = () => setAlertDialog({ ...alertDialog, visible: false });

  // Caricamento dei dati basato sull'ID del salone loggato
  useEffect(() => {
    if (!currentHairdresserId) {
      // Se nessun utente è loggato, resetta tutti i dati
      setHairdresserProfile(null);
      setAppointments([]);
      setArchivedClosures([]);
      setTreatments([]);
      setPrizes([]);
      setEmployees([]);
      setClientProfiles([]);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Listener per il profilo del salone
    const unsubProfile = onSnapshot(doc(db, "hairdressers", currentHairdresserId), (docSnap) => {
      if (docSnap.exists()) {
        setHairdresserProfile({ id: docSnap.id, ...docSnap.data() } as HairdresserProfile);
      } else {
        // Potresti voler gestire il caso in cui il profilo del salone non esiste, magari reindirizzando al login
        console.error("Profilo salone non trovato!");
        setHairdresserProfile(null);
      }
    });
    unsubscribes.push(unsubProfile);

    // Funzione helper per creare listener filtrati per hairdresserId
    const setupScopedListener = <T extends DocumentData>(
      collectionName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const q = query(collection(db, collectionName), where("hairdresserId", "==", currentHairdresserId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedData: T[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
        setter(fetchedData);
      }, (error) => {
        console.error(`Errore nel caricamento ${collectionName}:`, error);
        showAlert("Errore", `Impossibile caricare i dati di ${collectionName}.`);
      });
      unsubscribes.push(unsubscribe);
    };

    // Imposta i listener per tutte le collezioni del salone
    setupScopedListener<Appointment>("appointments", setAppointments);
    setupScopedListener<ArchivedClosure>("archivedClosures", setArchivedClosures);
    setupScopedListener<Treatment>("treatments", setTreatments);
    setupScopedListener<Prize>("prizes", setPrizes);
    setupScopedListener<Employee>("employees", setEmployees);
    setupScopedListener<ClientProfile>("clientProfiles", setClientProfiles);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [currentHairdresserId]);

  // Funzione per assicurarsi che l'ID del salone sia disponibile
  const ensureHairdresserId = (): string => {
    if (!currentHairdresserId) {
      const errorMsg = "Operazione non permessa: nessun salone attivo.";
      showAlert("Errore", errorMsg);
      throw new Error(errorMsg);
    }
    return currentHairdresserId;
  };

  // --- FUNZIONI DI MANIPOLAZIONE DATI (RISCRITTE) ---

  const addAppointment = async (newBooking: Omit<Appointment, 'id' | 'hairdresserId'>, clientPhone: string, totalCost: number): Promise<string | null> => {
    const hairdresserId = ensureHairdresserId();
    try {
      let clientProfile = clientProfiles.find(profile => profile.phone === clientPhone);

      if (!clientProfile) {
        const clientProfileData = {
          name: newBooking.clientName,
          phone: clientPhone,
          loyaltyPoints: 0,
          hairdresserId: hairdresserId, // Assegna il cliente al salone
        };
        const clientProfileRef = await addDoc(collection(db, "clientProfiles"), clientProfileData);
        clientProfile = { id: clientProfileRef.id, ...clientProfileData };
      }

      const pointsEarned = totalCost * LOYALTY_SETTINGS.pointsPerEuro;
      const updatedPoints = clientProfile.loyaltyPoints + pointsEarned;
      await updateDoc(doc(db, "clientProfiles", clientProfile.id), { loyaltyPoints: updatedPoints });

      const bookingWithIds: Omit<Appointment, 'id'> = { ...newBooking, clientId: clientProfile.id, hairdresserId: hairdresserId };
      const docRef = await addDoc(collection(db, "appointments"), bookingWithIds);
      return docRef.id;
    } catch (error: any) {
      console.error("Errore durante la prenotazione:", error);
      showAlert("Errore", `Impossibile completare la prenotazione: ${error.message || 'Errore sconosciuto'}`);
      return null;
    }
  };

  const updateAppointmentPrize = async (id: string, prizeText: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { prize: prizeText });
    } catch (e: any) { showAlert("Errore", `Impossibile salvare il premio: ${e.message}`); }
  };
  
  const updatePrizeDispensed = async (prizeToUpdate: Prize) => {
    try {
      const prizeRef = doc(db, "prizes", prizeToUpdate.id);
      const today = getTodayString();
      const week = getWeekNumber(new Date());
      const month = getMonthString(new Date());

      const dailyCount = prizeToUpdate.dispensed.daily?.date === today ? (prizeToUpdate.dispensed.daily?.count || 0) + 1 : 1;
      const weeklyCount = prizeToUpdate.dispensed.weekly?.week === week ? (prizeToUpdate.dispensed.weekly?.count || 0) + 1 : 1;
      const monthlyCount = prizeToUpdate.dispensed.monthly?.month === month ? (prizeToUpdate.dispensed.monthly?.count || 0) + 1 : 1;

      await updateDoc(prizeRef, {
        dispensed: {
          daily: { count: dailyCount, date: today },
          weekly: { count: weeklyCount, week: week },
          monthly: { count: monthlyCount, month: month }
        }
      });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiornare il contatore premio: ${e.message}`); }
  };

  const addArchivedClosure = async (newClosure: Omit<ArchivedClosure, 'id' | 'hairdresserId'>) => {
    const hairdresserId = ensureHairdresserId();
    try {
      await addDoc(collection(db, "archivedClosures"), { ...newClosure, hairdresserId });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiungere la chiusura: ${e.message}`); }
  };

  const deleteAllAppointments = async () => {
    const hairdresserId = ensureHairdresserId();
    try {
      const q = query(collection(db, "appointments"), where("hairdresserId", "==", hairdresserId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e: any) { showAlert("Errore", `Impossibile eliminare gli appuntamenti: ${e.message}`); }
  };

  const resetPromotionsGeneratedCount = async () => {
    const hairdresserId = ensureHairdresserId();
    try {
      await updateDoc(doc(db, "hairdressers", hairdresserId), { promotionsGeneratedCount: 0 });
    } catch (e: any) { showAlert("Errore", `Impossibile resettare il contatore promozioni: ${e.message}`); }
  };
  
  const resetPrizeDispensedCounts = async (prizesToReset: Prize[]) => {
    try {
      const prizeResetPromises = prizesToReset.map(p => updateDoc(doc(db, "prizes", p.id), { dispensed: {} }));
      await Promise.all(prizeResetPromises);
    } catch (e: any) { showAlert("Errore", `Impossibile resettare i contatori dei premi: ${e.message}`); }
  };

  const updateHairdresserProfile = async (settings: Partial<HairdresserProfile>) => {
    const hairdresserId = ensureHairdresserId();
    try {
      await updateDoc(doc(db, "hairdressers", hairdresserId), settings);
    } catch (e: any) { showAlert("Errore", `Impossibile aggiornare le impostazioni: ${e.message}`); }
  };

  const generatePromotionImage = async (description: string, subject: 'woman' | 'man' | 'couple' | 'scenario' | null) => {
    const hairdresserId = ensureHairdresserId();
    if (!hairdresserProfile?.salonLogoUrl) {
      showAlert("Attenzione", "Carica prima un logo del salone per generare una promozione.");
      return;
    }
    // ... (la logica interna di generazione immagine rimane la stessa, ma ora si aggiorna il documento del parrucchiere) ...
    // --- Inizio logica AI --- (non modificata)
    try {
      let backgroundPrompt = '';
      if (subject === 'woman') {
        backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una modella con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
      } else if (subject === 'man') {
        backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare un modello uomo con un taglio di capelli artistico e d'avanguardia, in una posa dinamica e stravagante. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività dell'hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli del taglio e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dal soggetto principale. L'immagine non deve contenere testo, loghi o brand.";
      } else if (subject === 'couple') {
        backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un uomo e una donna) con tagli di capelli artistici e d'avanguardia, in pose dinamiche e stravaganti. Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle. L'illuminazione deve essere drammatica, da studio fotografico, per esaltare i dettagli dei tagli e i colori. Lo sfondo deve essere pulito e minimale per non distrarre dai soggetti principali. L'immagine non deve contenere testo, loghi o brand.";
      } else if (subject === 'scenario') {
        backgroundPrompt = "Crea un'immagine fotografica di alta moda per una campagna pubblicitaria di un parrucchiere. L'immagine deve presentare una coppia (un'uomo e una donna) con tagli di capelli artistici e d'avanguardia, immersi in un contesto di sfondo casuale, ma elegante e di lusso (es. un loft urbano, un giardino segreto, una galleria d'arte). Lo stile deve essere audace, moderno e di lusso. Concentrati sull'espressione artistica e sulla creatività degli hairstyle in relazione all'ambiente circostante. L'illuminazione deve essere drammatica per esaltare i dettagli dei tagli e i colori. L'immagine non deve contenere testo, loghi o brand.";
      }
      
      // Generazione immagine tramite Pollinations.ai: gratuito, senza chiave API né quota.
      const seed = Date.now() % 1000000;
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(backgroundPrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Impossibile ottenere il contesto del canvas");
      canvas.width = 1024;
      canvas.height = 1024;

      const backgroundImg = new Image();
      backgroundImg.crossOrigin = "Anonymous";
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";

      const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Impossibile caricare l'immagine: ${src}`));
          img.src = src;
      });

      await Promise.all([
          loadImage(backgroundImg, pollinationsUrl),
          loadImage(logoImg, hairdresserProfile.salonLogoUrl!)
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
      wrapText(description, canvas.width / 2, canvas.height - textPaddingBottom, canvas.width - 150, 95);
      
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

      const finalImageBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject(new Error("Impossibile creare il Blob dall'immagine per Firebase Storage."));
          }, 'image/png');
      });

      const imageFileName = `promotions/${hairdresserId}_${Date.now()}.png`;
      const imageRef = ref(storage, imageFileName);
      await uploadBytes(imageRef, finalImageBlob);
      const downloadURL = await getDownloadURL(imageRef);
    // --- Fine logica AI ---
    
      await updateDoc(doc(db, "hairdressers", hairdresserId), {
         activePromotionImageUrl: downloadURL,
         promotionsGeneratedCount: (hairdresserProfile?.promotionsGeneratedCount || 0) + 1,
      });
      showAlert("Successo", "Immagine promozionale creata!");
    } catch (e: any) {
        showAlert("Errore AI", `Errore durante la creazione dell'immagine: ${e.message}`);
    }
  };

  const removePromotionImage = async () => {
    const hairdresserId = ensureHairdresserId();
    if (!hairdresserProfile?.activePromotionImageUrl) return;
    try {
      const imageToDeleteRef = ref(storage, hairdresserProfile.activePromotionImageUrl);
      await deleteObject(imageToDeleteRef);
      await updateDoc(doc(db, "hairdressers", hairdresserId), { activePromotionImageUrl: null });
      showAlert("Successo", "Immagine promozionale rimossa!");
    } catch (e: any) { showAlert("Errore", `Impossibile rimuovere l'immagine: ${e.message}`); }
  };

  const uploadSalonLogo = async (file: File) => {
    const hairdresserId = ensureHairdresserId();
    try {
      if (hairdresserProfile?.salonLogoUrl) {
        try {
          const oldRef = ref(storage, hairdresserProfile.salonLogoUrl);
          await deleteObject(oldRef);
        } catch (deleteError) { console.warn("Il vecchio logo non è stato trovato, potrebbe essere già stato eliminato:", deleteError); }
      }
      const logoFileName = `salon_logos/${hairdresserId}.png`;
      const logoRef = ref(storage, logoFileName);
      await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(logoRef);
      await updateDoc(doc(db, "hairdressers", hairdresserId), { salonLogoUrl: downloadURL });
      showAlert("Successo", "Logo caricato!");
    } catch (e: any) { showAlert("Errore", `Impossibile caricare il logo: ${e.message}`); }
  };

  const addTreatment = async (treatment: Omit<Treatment, 'id' | 'hairdresserId'>) => {
    const hairdresserId = ensureHairdresserId();
    try {
      await addDoc(collection(db, "treatments"), { ...treatment, hairdresserId });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiungere il trattamento: ${e.message}`); }
  };

  const deleteTreatment = async (id: string) => {
    try { await deleteDoc(doc(db, "treatments", id)); } catch (e: any) { showAlert("Errore", `Impossibile eliminare il trattamento: ${e.message}`); }
  };

  const addPrize = async (text: string) => {
    const hairdresserId = ensureHairdresserId();
    try {
      await addDoc(collection(db, "prizes"), {
        text: text,
        limits: { daily: 1, weekly: 1, monthly: 1 },
        dispensed: {},
        hairdresserId: hairdresserId,
      });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiungere il premio: ${e.message}`); }
  };

  const deletePrize = async (id: string) => {
    try { await deleteDoc(doc(db, "prizes", id)); } catch (e: any) { showAlert("Errore", `Impossibile eliminare il premio: ${e.message}`); }
  };

  const updatePrizeLimits = async (id: string, period: 'daily' | 'weekly' | 'monthly', value: number) => {
    try {
      const prizeRef = doc(db, "prizes", id);
      const currentPrize = prizes.find(p => p.id === id);
      if (currentPrize) {
        await updateDoc(prizeRef, { limits: { ...currentPrize.limits, [period]: value } });
      }
    } catch (e: any) { showAlert("Errore", `Impossibile aggiornare il limite: ${e.message}`); }
  };

  const addEmployee = async (name: string) => {
    const hairdresserId = ensureHairdresserId();
    try {
      await addDoc(collection(db, "employees"), { // Collezione 'employees'
        name: name,
        hairdresserId: hairdresserId,
        workingHours: { /* orari default */ },
        absentDates: [],
      });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiungere il dipendente: ${e.message}`); }
  };

  const deleteEmployee = async (id: string) => {
    try { await deleteDoc(doc(db, "employees", id)); } catch (e: any) { showAlert("Errore", `Impossibile eliminare il dipendente: ${e.message}`); }
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      await updateDoc(doc(db, "employees", employee.id), {
        name: employee.name,
        workingHours: employee.workingHours,
        absentDates: employee.absentDates,
      });
    } catch (e: any) { showAlert("Errore", `Impossibile aggiornare il dipendente: ${e.message}`); }
  };

  // Il valore del contesto ora espone i dati e le funzioni aggiornate
  const contextValue = useMemo(() => ({
    currentHairdresserId,
    hairdresserProfile,
    appointments,
    archivedClosures,
    treatments,
    prizes,
    employees,
    clientProfiles,
    showAlert,
    // --- ALIAS RETRO-COMPATIBILI ---
    hairdressers: employees,
    salonNameFromFirestore: hairdresserProfile?.salonName ?? hairdresserProfile?.name ?? '',
    salonAddressFromFirestore: hairdresserProfile?.salonAddress ?? '',
    salonPhoneFromFirestore: hairdresserProfile?.salonPhone ?? '',
    salonLogoUrlFromFirestore: hairdresserProfile?.salonLogoUrl ?? '',
    activePromotionImage: hairdresserProfile?.activePromotionImageUrl ?? null,
    commissionFee: hairdresserProfile?.commissionFee ?? 0,
    commissionThreshold: hairdresserProfile?.commissionThreshold ?? Infinity,
    promotionsGeneratedCount: hairdresserProfile?.promotionsGeneratedCount ?? 0,
    promotionGenerationFee: hairdresserProfile?.promotionGenerationFee ?? 0,
    autoPaymentThreshold: hairdresserProfile?.autoPaymentThreshold ?? 0,
    hairdresserPassword: hairdresserProfile?.hairdresserPassword ?? '',
    updateAppSettings: updateHairdresserProfile,
    addHairdresser: addEmployee,
    deleteHairdresser: deleteEmployee,
    updateHairdresser: updateEmployee,
    addAppointment,
    updateAppointmentPrize,
    updatePrizeDispensed,
    addArchivedClosure,
    deleteAllAppointments,
    resetPromotionsGeneratedCount,
    resetPrizeDispensedCounts,
    updateHairdresserProfile,
    generatePromotionImage,
    removePromotionImage,
    uploadSalonLogo,
    addTreatment,
    deleteTreatment,
    addPrize,
    deletePrize,
    updatePrizeLimits,
    addEmployee,
    deleteEmployee,
    updateEmployee,
  }), [
    currentHairdresserId,
    hairdresserProfile,
    appointments,
    archivedClosures,
    treatments,
    prizes,
    employees,
    clientProfiles
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {alertDialog.visible && (
        <AlertDialog title={alertDialog.title} message={alertDialog.message} onClose={closeAlert} />
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};