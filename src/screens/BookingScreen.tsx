import React, { useState, useMemo, type CSSProperties } from 'react';
import { useAppContext } from '../contexts';
import { Calendar, TimeSlot, TreatmentItem } from '../components/ui'; // Importa i componenti UI
import { type Treatment, type Appointment } from '../utils/types';
import { LOYALTY_SETTINGS } from '../utils/constants';

// Stili copiati e consolidati dal tuo App.tsx originale per BookingScreen
const styles: { [key: string]: CSSProperties } = {
  page: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
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
  slotItem: { // Necessario per i bottoni dei parrucchieri
    padding: '12px 18px',
    backgroundColor: '#333',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '16px',
    border: '1px solid #333',
    transition: 'background-color 0.2s',
  },
  slotItemSelected: { // Necessario per i bottoni dei parrucchieri
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
};

interface BookingScreenProps {
  setScreen: (screen: string) => void;
  setConfModalVisible: (visible: boolean) => void;
  setLastBookingId: (id: string | null) => void;
  setSelectedAppointmentForReminder: (app: Appointment | null) => void; // Per il modale promemoria
  setTreatmentModalVisible: (visible: boolean) => void; // Per il modale trattamento
  setSelectedTreatmentForModal: (treatment: Treatment | null) => void; // Per il modale trattamento
}

const BookingScreen = ({ 
    setScreen, 
    setConfModalVisible, 
    setLastBookingId,
    setSelectedAppointmentForReminder,
    setTreatmentModalVisible,
    setSelectedTreatmentForModal,
}: BookingScreenProps) => {
  const { 
    appointments, 
    treatments, 
    hairdressers, 
    clientProfiles, 
    addAppointment,
    showAlert,
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedHairdresserId, setSelectedHairdresserId] = useState<string>('');

  const totalCost = useMemo(() => selectedTreatments.reduce((sum, t) => sum + t.price, 0), [selectedTreatments]);

  // Funzione per ottenere gli slot disponibili per un parrucchiere in una data specifica
  const getHairdresserAvailableSlots = (dateString: string, hdId: string): string[] => {
    const selectedDay = new Date(dateString + 'T00:00:00');
    const dayOfWeek = selectedDay.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const hairdresser = hairdressers.find(hd => hd.id === hdId);
    if (!hairdresser) return [];

    // Controlla se il parrucchiere è assente in quella data
    if (hairdresser.absentDates.includes(dateString)) {
      return [];
    }

    const dailyHours = hairdresser.workingHours[dayOfWeek];

    if (!dailyHours) { // Giorno di riposo
      return [];
    }

    const [startHour, startMinute] = dailyHours.start.split(':').map(Number);
    const [endHour, endMinute] = dailyHours.end.split(':').map(Number);

    const slots: string[] = [];
    const currentTime = new Date(selectedDay);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(selectedDay);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Controlla anche che la data e l'ora non siano nel passato
    const now = new Date();
    if (selectedDay.toDateString() === now.toDateString()) { // Se è oggi
        if (currentTime.getHours() < now.getHours() || (currentTime.getHours() === now.getHours() && currentTime.getMinutes() < now.getMinutes())) {
            // Se l'ora è già passata oggi, imposta l'inizio allo slot successivo valido
            if (now.getMinutes() > 30) {
              currentTime.setHours(now.getHours() + 1, 0, 0, 0);
            } else {
              currentTime.setMinutes(30, 0, 0);
            }
        }
    } else if (selectedDay < new Date(now.getFullYear(), now.getMonth(), now.getDate())) { // Se è una data passata
        return [];
    }


    while (currentTime.getTime() < endTime.getTime()) {
      const slot = currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      slots.push(slot);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    // Filtra gli slot già prenotati per quella data e quel parrucchiere
    return slots.filter(slot => !appointments.some(app =>
      app.date === dateString && 
      app.time === slot && 
      app.hairdresserId === hdId
    ));
  };

  const handleBooking = async () => {
    if (!clientName.trim()) {
        showAlert("Errore di input", "Per favore, inserisci il tuo nome.");
        return;
    }
    if (!clientPhone.trim()) {
        showAlert("Errore di input", "Per favore, inserisci il tuo numero di telefono.");
        return;
    }
    if (!selectedHairdresserId) {
        showAlert("Errore di input", "Per favore, scegli un parrucchiere.");
        return;
    }
    if (selectedTreatments.length === 0) {
        showAlert("Errore di input", "Per favore, scegli almeno un trattamento.");
        return;
    }
    if (!selectedSlot) {
        showAlert("Errore di input", "Per favore, scegli un orario.");
        return;
    }
    if (!selectedDate) {
        showAlert("Errore di input", "Per favore, scegli una data.");
        return;
    }
    
    // Costruisci l'oggetto Appointment (senza ID, sarà generato da Firebase)
    const newBooking: Omit<Appointment, 'id'> = {
        clientName: clientName,
        clientPhone: clientPhone,
        date: selectedDate,
        time: selectedSlot,
        treatments: selectedTreatments,
        total: totalCost,
        prize: '', // Il premio viene aggiunto dopo il gioco
        hairdresserId: selectedHairdresserId,
    };

    const bookingId = await addAppointment(newBooking, clientPhone, totalCost);
    if (bookingId) {
        setLastBookingId(bookingId);
        // Resetta gli stati del form
        setSelectedDate('');
        setSelectedSlot('');
        setSelectedTreatments([]);
        setClientName('');
        setClientPhone('');
        setSelectedHairdresserId('');
        setConfModalVisible(true); // Mostra la modale di conferma
    }
  };

  const handleSelectTreatment = (treatment: Treatment) => {
    setSelectedTreatments((prev) =>
      prev.find(t => t.id === treatment.id)
        ? prev.filter(t => t.id !== treatment.id)
        : [...prev, treatment]
    );
  };

  const openTreatmentInfoModal = (treatment: Treatment) => {
    setSelectedTreatmentForModal(treatment);
    setTreatmentModalVisible(true);
  };

  return (
    <div style={styles.page}>
      <button style={styles.backButton} onClick={() => setScreen('home')}>
        ‹ Torna alla Home
      </button>
      
      <h2 style={styles.sectionTitle}>1. Scegli la data</h2>
      <Calendar 
        selectedDate={selectedDate}
        onDateSelect={(date: string) => {
            setSelectedDate(date);
            setSelectedSlot('');
            setSelectedHairdresserId(''); // Reset parrucchiere e slot alla selezione nuova data
        }}
      />

      {selectedDate && (
        <>
          <h2 style={styles.sectionTitle}>2. Scegli il tuo parrucchiere</h2>
          <div style={styles.slotsContainer}>
            {hairdressers.map(hd => (
              <button
                key={hd.id}
                style={{
                  ...styles.slotItem,
                  ...(selectedHairdresserId === hd.id && styles.slotItemSelected)
                }}
                onClick={() => {
                    setSelectedHairdresserId(hd.id);
                    setSelectedSlot(''); // Reset slot alla selezione nuovo parrucchiere
                }}
              >
                {hd.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedHairdresserId && selectedDate && (
        <>
          <h2 style={styles.sectionTitle}>3. Scegli l'orario</h2>
          <div style={styles.slotsContainer}>
            {getHairdresserAvailableSlots(selectedDate, selectedHairdresserId).map(time => {
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

      {selectedSlot && selectedHairdresserId && (
        <>
          <h2 style={styles.sectionTitle}>4. Scegli i trattamenti</h2>
          {treatments.map(item => (
            <TreatmentItem 
              key={item.id} 
              item={item} 
              onSelect={handleSelectTreatment} 
              isSelected={selectedTreatments.some(t => t.id === item.id)} 
              onInfoClick={openTreatmentInfoModal} 
            />
          ))}
        </>
      )}

      {selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && (
        <>
          <h2 style={styles.sectionTitle}>5. Inserisci i tuoi dati</h2>
          <input type="text" style={styles.inputField} placeholder="Il tuo Nome e Cognome" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input type="tel" style={styles.inputField} placeholder="Il tuo Numero di Telefono" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
        </>
      )}
      
      {clientName && clientPhone && selectedTreatments.length > 0 && selectedSlot && selectedDate && selectedHairdresserId && (
        <>
            {clientPhone.trim() && (
                <div style={styles.summaryContainer}>
                    <h3 style={styles.subSectionTitle}>Punti Fedeltà</h3>
                    {(() => {
                        const currentClient = clientProfiles.find(p => p.phone === clientPhone);
                        if (!currentClient) {
                            return <p style={styles.summaryText}>Registrati con questo numero per iniziare a guadagnare punti!</p>;
                        }
                        const pointsGained = totalCost * LOYALTY_SETTINGS.pointsPerEuro;
                        return (
                            <>
                                <p style={styles.summaryText}>Hai accumulato: <b>{currentClient.loyaltyPoints} punti</b></p>
                                <p style={styles.summaryText}>Punti guadagnati con questa prenotazione: <b>+{pointsGained.toFixed(2)}</b></p>
                                <h4 style={styles.subSectionTitle}>Riscatta Premio:</h4>
                                {LOYALTY_SETTINGS.thresholds.map(threshold => (
                                    <button
                                        key={threshold.points}
                                        style={{
                                            ...styles.smallButton,
                                            marginRight: '10px',
                                            backgroundColor: currentClient.loyaltyPoints >= threshold.points ? '#4CAF50' : '#555',
                                            color: currentClient.loyaltyPoints >= threshold.points ? '#1a1a1a' : '#aaa',
                                            cursor: currentClient.loyaltyPoints >= threshold.points ? 'pointer' : 'not-allowed',
                                        }}
                                        disabled={currentClient.loyaltyPoints < threshold.points}
                                        onClick={() => {
                                            showAlert("Riscatto Premio", `Hai riscattato ${threshold.description}! I tuoi punti verranno aggiornati dopo la conferma della prenotazione.`);
                                        }}
                                    >
                                        {threshold.description} ({threshold.points} punti)
                                    </button>
                                ))}
                            </>
                        );
                    })()}
                </div>
            )}

            <div style={styles.summaryContainer}>
                <h3 style={styles.summaryTitle}>Riepilogo Prenotazione</h3>
                <p style={styles.summaryText}><b>Nome:</b> {clientName}</p>
                <p style={styles.summaryText}><b>Telefono:</b> {clientPhone}</p>
                <p style={styles.summaryText}><b>Data:</b> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
                <p style={styles.summaryText}><b>Orario:</b> {selectedSlot}</p>
                <p style={styles.summaryText}><b>Parrucchiere:</b> {hairdressers.find(hd => hd.id === selectedHairdresserId)?.name || 'N/A'}</p>
                <p style={styles.summaryText}><b>Trattamenti:</b> {selectedTreatments.map(t => t.name).join(', ')}</p>
                <p style={styles.summaryTotal}>Totale: €{totalCost.toFixed(2)}</p>
                <button style={styles.ctaButton} onClick={handleBooking}>
                    Conferma Prenotazione
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default BookingScreen;