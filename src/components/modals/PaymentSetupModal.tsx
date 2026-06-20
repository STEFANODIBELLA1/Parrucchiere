import React, { type CSSProperties } from 'react';
import { useAppContext } from '../../contexts';
// Rimuoviamo l'import di 'Hairdresser' perché il modale non è più legato al singolo parrucchiere
// import { Hairdresser } from '../../utils/types';

// Gli stili possono rimanere invariati
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
};

// L'interfaccia delle props viene modificata: non riceve più 'hairdresser'
interface PaymentSetupModalProps {
  onClose: () => void;
  showAlert: (title: string, message: string) => void;
  autoPaymentThreshold: number;
}

const PaymentSetupModal = ({ onClose, showAlert, autoPaymentThreshold }: PaymentSetupModalProps) => {
    // CORREZIONE: Usiamo updateAppSettings invece di updateHairdresser
    const { updateAppSettings } = useAppContext();

    const handleSubmitCard = async () => {
        try {
            showAlert("Elaborazione...", "Invio dettagli di pagamento...");
            // Simula la creazione di un ID cliente Stripe per l'intero salone
            const simulatedCustomerId = `cus_salon_${Math.random().toString(36).substring(2, 15)}`;
            
            // CORREZIONE: Aggiorniamo l'impostazione globale del salone, non il singolo parrucchiere
            await updateAppSettings({ stripeCustomerId: simulatedCustomerId });
            
            showAlert("Successo (Simulato)", "Metodo di pagamento del salone configurato! (Simulato)");
            onClose();

        } catch (error) {
            console.error("Errore durante la configurazione del pagamento:", error);
            showAlert("Errore", "Impossibile configurare il pagamento. Riprova.");
        }
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* CORREZIONE: Titolo e messaggio generici per il salone */}
                <h2 style={styles.modalTitle}>Configura Pagamento Automatico Salone</h2>
                <p style={styles.modalMessage}>Inserisci i dettagli della carta di credito del salone. I pagamenti saranno elaborati automaticamente al raggiungimento della soglia (€{autoPaymentThreshold.toFixed(2)}).</p>
                
                <div style={{ padding: '20px', border: '1px dashed #e6c300', borderRadius: '8px', marginBottom: '20px', color: '#ccc' }}>
                    [Qui si integrerebbe il form della carta di credito di un gateway come Stripe Elements]
                    <input type="text" placeholder="Numero Carta (placeholder)" style={{...styles.inputField, marginTop: '10px'}} />
                    <div style={{display: 'flex', gap: '10px'}}>
                        <input type="text" placeholder="MM/AA (placeholder)" style={{...styles.inputField, flex: 1}} />
                        <input type="text" placeholder="CVC (placeholder)" style={{...styles.inputField, flex: 1}} />
                    </div>
                </div>
                
                <button style={styles.ctaButton} onClick={handleSubmitCard}>Salva Carta</button>
                <button style={styles.modalButton} onClick={onClose}>Annulla</button>
            </div>
        </div>
    );
};

export default PaymentSetupModal;
