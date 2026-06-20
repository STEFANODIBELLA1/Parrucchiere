import React, { useState, useEffect, type CSSProperties } from 'react';
import { Spinner } from '../ui';
import { Treatment } from '../../utils/types';

// Stili copiati dal tuo App.tsx originale per il modale trattamento
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
};

interface TreatmentModalProps {
  treatment: Treatment;
  onClose: () => void;
  showAlert: (title: string, message: string) => void;
}

const TreatmentModal = ({ treatment, onClose, showAlert }: TreatmentModalProps) => {
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    const generateDescription = async () => {
        if (!treatment || aiDescription) return; // Non rigenerare se già presente
        
        setIsGeneratingDescription(true);
        const prompt = `Scrivi una breve, accattivante e semplice descrizione di marketing per il seguente trattamento per capelli: "${treatment.name}". Evidenzia i benefici chiave per il cliente in 2-3 frasi.`;
        
        let chatHistory = [{ role: "user" as const, parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                setAiDescription(result.candidates[0].content.parts[0].text);
            } else { throw new Error("Risposta non valida dall'AI."); }
        } catch (error: any) {
            console.error("Errore AI:", error);
            setAiDescription("Non è stato possibile caricare la descrizione.");
            showAlert("Errore AI", `Impossibile generare la descrizione: ${error.message || 'Errore sconosciuto'}`);
        } finally {
            setIsGeneratingDescription(false);
        }
    };
    generateDescription();
  }, [treatment, aiDescription, showAlert]); // Dipendenze aggiornate

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>{treatment.name}</h2>
        {isGeneratingDescription ? (
          <Spinner />
        ) : (
          !aiDescription ? (
            <p style={styles.modalMessage}>Descrizione non disponibile.</p>
          ) : (
            <div style={styles.aiResultBox}>{aiDescription}</div>
          )
        )}
        <button style={styles.modalButton} onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
};

export default TreatmentModal;