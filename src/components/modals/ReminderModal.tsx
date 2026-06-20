import React, { useState, useEffect, type CSSProperties } from 'react';
import { Spinner } from '../ui';
import { Appointment } from '../../utils/types';
import { useAppContext } from '../../contexts';

// Stili copiati dal tuo App.tsx originale per il modale promemoria
const styles: { [key: string]: CSSProperties } = {
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
  aiResultBox: {
    textAlign: 'left',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
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
};

interface ReminderModalProps {
  appointment: Appointment;
  onClose: () => void;
  showAlert: (title: string, message: string) => void;
}

const ReminderModal = ({ appointment, onClose, showAlert }: ReminderModalProps) => {
  const { hairdressers, salonNameFromFirestore } = useAppContext();
  const [reminderText, setReminderText] = useState('');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);

  useEffect(() => {
    const generateReminder = async () => {
        if (!appointment || reminderText) return; // Non rigenerare se già presente
        
        setIsGeneratingReminder(true);
        const { clientName, date, time, clientPhone, hairdresserId } = appointment;
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        
        const hairdresser = hairdressers.find(hd => hd.id === hairdresserId);
        const hairdresserName = hairdresser ? ` con ${hairdresser.name}` : '';

        const prompt = `Scrivi un breve, amichevole e professionale messaggio di promemoria per un appuntamento dal parrucchiere. Il nome del cliente è ${clientName}, l'appuntamento è per il giorno ${formattedDate} alle ore ${time}${hairdresserName} presso "${salonNameFromFirestore}". Il loro numero di telefono è ${clientPhone}. Aggiungi un tocco di entusiasmo.`;

        let chatHistory = [{ role: "user" as const, parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                setReminderText(result.candidates[0].content.parts[0].text);
            } else { throw new Error("Risposta non valida dall'AI."); }
        } catch (error: any) {
            console.error("Errore AI:", error);
            // Fallback in caso di errore
            setReminderText(`Ciao ${clientName}! Ti ricordiamo il tuo appuntamento da ${salonNameFromFirestore} per il giorno ${formattedDate} alle ore ${time}${hairdresserName}. A presto!`);
        } finally {
            setIsGeneratingReminder(false);
        }
    };
    generateReminder();
  }, [appointment, reminderText, hairdressers, salonNameFromFirestore]); // Dipendenze aggiornate

  const copyToClipboard = () => {
    const textarea = document.createElement('textarea');
    textarea.value = reminderText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showAlert('Copiato!', 'Il promemoria è stato copiato negli appunti.');
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>✨ Promemoria Generato</h2>
        {isGeneratingReminder ? (
          <Spinner />
        ) : (
          <>
            <div style={styles.aiResultBox}>{reminderText}</div>
            <button style={{...styles.ctaButton, marginTop: '15px'}} onClick={copyToClipboard}>Copia Testo</button>
          </>
        )}
        <button style={styles.modalButton} onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
};

export default ReminderModal;