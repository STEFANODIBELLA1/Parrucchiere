import React, { type CSSProperties } from 'react';
import { useAppContext } from '../../contexts'; // Importa il contesto

// Stili copiati dal tuo App.tsx originale per il modale di pagamento
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
};

interface PaymentModalProps {
  onClose: () => void;
  totalDue: number;
}

const PaymentModal = ({ onClose, totalDue }: PaymentModalProps) => {
  const { 
    appointments, 
    commissionFee, 
    promotionsGeneratedCount, 
    promotionGenerationFee,
    addArchivedClosure,
    deleteAllAppointments,
    resetPromotionsGeneratedCount,
    resetPrizeDispensedCounts,
    prizes,
    showAlert,
  } = useAppContext();

  const handleAccountingClosure = async () => {
    const totalAppointmentsDue = appointments.length * commissionFee;
    const totalPromotionsDue = promotionsGeneratedCount * promotionGenerationFee;
    
    const newClosure = {
        id: '', // Firestore genererà l'ID
        date: new Date().toISOString(),
        appointmentCount: appointments.length,
        amountPaid: totalAppointmentsDue + totalPromotionsDue,
        appointments: [...appointments],
        promotionGenerationCost: totalPromotionsDue,
    };

    try {
        await addArchivedClosure(newClosure); // Aggiungi la chiusura
        await deleteAllAppointments(); // Elimina tutti gli appuntamenti correnti
        await resetPromotionsGeneratedCount(); // Resetta il contatore promozioni
        await resetPrizeDispensedCounts(prizes); // Resetta i contatori premi
        showAlert('Contabilità Chiusa', 'Pagamento registrato e contabilità chiusa con successo! App sbloccata.');
        onClose(); // Chiudi la modale
    } catch (error: any) {
        console.error("Errore durante la chiusura contabile:", error);
        showAlert("Errore", `Impossibile chiudere la contabilità: ${error.message || 'Errore sconosciuto'}`);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Conferma Pagamento</h2>
            <p style={styles.modalMessage}>Stai per saldare le commissioni per <b>{appointments.length} appuntamenti</b> (totale commissioni: €{(appointments.length * commissionFee).toFixed(2)}) e i costi di generazione promozioni (totale: €{(promotionsGeneratedCount * promotionGenerationFee).toFixed(2)}), per un totale di <b>€{totalDue.toFixed(2)}</b>.</p>
            <button style={styles.ctaButton} onClick={handleAccountingClosure}>Conferma e Paga Ora</button>
            <button style={styles.modalButton} onClick={onClose}>Annulla</button>
        </div>
    </div>
  );
};

export default PaymentModal;