import React, { useState, type CSSProperties } from 'react';
import { Spinner } from '../ui'; // Importa lo Spinner dal modulo ui

// Stili copiati e consolidati dal tuo App.tsx originale per il modale AI
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

interface AiModalProps {
  onClose: () => void;
  showAlert: (title: string, message: string) => void;
}

const AiModal = ({ onClose, showAlert }: AiModalProps) => {
  const [aiAnswers, setAiAnswers] = useState({ occasion: '', style: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

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
    // ATTENZIONE: In una vera applicazione, la chiave API non dovrebbe essere qui sul frontend!
    // Usare Firebase Functions o un backend per chiamate API sicure.
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            setAiSuggestion(result.candidates[0].content.parts[0].text);
        } else { throw new Error("Risposta non valida dall'AI."); }
    } catch (error: any) {
        console.error("Errore AI:", error);
        setAiSuggestion("Siamo spiacenti, si è verificato un errore. Riprova più tardi.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>✨ Trova il tuo Look Ideale</h2>
        <p style={styles.modalMessage}>Rispondi a due semplici domande e lascia che la nostra AI ti suggerisca il look perfetto per te!</p>
        {!isGenerating && !aiSuggestion ? (
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
        ) : isGenerating ? (
          <Spinner />
        ) : (
          <> 
            <div style={styles.aiResultBox}>{aiSuggestion}</div> 
            <button style={styles.modalButton} onClick={onClose}>Chiudi</button> 
          </>
        )}
      </div>
    </div>
  );
};

export default AiModal;