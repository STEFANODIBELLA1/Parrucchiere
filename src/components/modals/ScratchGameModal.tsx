import React, { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Prize } from '../../utils/types';
import { getTodayString, getWeekNumber, getMonthString } from '../../utils/helpers';

// Stili copiati dal tuo App.tsx originale per il gioco gratta e vinci
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

interface ScratchGameModalProps {
  onGameEnd: (prize: Prize | null) => void;
  prizes: Prize[];
  showAlert: (title: string, message: string) => void;
  salonName: string; // Passa il nome del salone
}

const ScratchGameModal = ({ onGameEnd, prizes, showAlert, salonName }: ScratchGameModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null); // CORREZIONE QUI
    const [prize, setPrize] = useState<Prize | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const today = getTodayString();
        const week = getWeekNumber(new Date());
        const month = getMonthString(new Date());

        const availablePrizes = prizes.filter(p => {
            if (p.text.includes('Ritenta')) return true; // Il premio "Ritenta" è sempre disponibile

            const dailyCount = p.dispensed.daily?.date === today ? (p.dispensed.daily.count || 0) : 0;
            const weeklyCount = p.dispensed.weekly?.week === week ? (p.dispensed.weekly.count || 0) : 0;
            const monthlyCount = p.dispensed.monthly?.month === month ? (p.dispensed.monthly.count || 0) : 0;

            return dailyCount < p.limits.daily && weeklyCount < p.limits.weekly && monthlyCount < p.limits.monthly;
        });

        const eligible = availablePrizes.filter(p => !p.text.includes('Ritenta'));
        if (eligible.length > 0) {
            setPrize(eligible[Math.floor(Math.random() * eligible.length)]);
        } else {
            // Se nessun altro premio è disponibile, assegna "Ritenta"
            setPrize(prizes.find(p => p.text.includes('Ritenta')) || null);
        }
    }, [prizes]);

    useEffect(() => {
      if(!prize || !canvasRef.current) return;
      const canvas: HTMLCanvasElement = canvasRef.current; // CORREZIONE QUI: Tipizzazione esplicita
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 300;
      canvas.height = 150;
      ctx.fillStyle = '#b0b0b0'; // Colore per lo strato da grattare
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Disegna lo strato
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
        ctx.globalCompositeOperation = 'destination-out'; // Modalità "cancella"
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false); // Cerchio per la gomma
        ctx.fill();
      };

      const checkRevealed = () => {
          const imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
          const data = imageData.data;
          let transparentPixels = 0;
          for(let i=3; i < data.length; i+=4) { // Controlla il canale alfa di ogni pixel
              if (data[i] === 0) { // Se il pixel è completamente trasparente
                  transparentPixels++;
              }
          }
          const revealedPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
          if (revealedPercentage > 50) { // Se più del 50% è grattato
              setIsRevealed(true);
          }
      };
      
      // Aggiungi event listener
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing); // Per mouse che esce dal canvas
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing); // Per interruzioni touch

      // Cleanup function per rimuovere event listener
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
    }, [prize]); // Dipende dal premio selezionato

    const handleSavePrize = () => {
        if (!prize) return;
        // Crea una nuova finestra per stampare/salvare il premio
        const prizeWindow = window.open('', '', 'width=400,height=300');
        if (prizeWindow) {
            prizeWindow.document.write(`
                <html><head><title>Il Tuo Premio - ${salonName}</title>
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

export default ScratchGameModal;