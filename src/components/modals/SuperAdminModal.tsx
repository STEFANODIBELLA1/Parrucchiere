import React, { useState, useEffect, type CSSProperties } from 'react';
import { useAppContext } from '../../contexts';
import { Hairdresser, Prize, Treatment } from '../../utils/types';
import { SALON_INFO } from '../../utils/constants'; // Per i valori di default

// Stili copiati dal tuo App.tsx originale per il modale Super Admin
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
  settingsSection: {
    backgroundColor: '#1e1e1e',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  subSectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: '10px',
    color: '#e6c300'
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
  deleteButton: {
    backgroundColor: '#d9534f',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
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
  aiFormLabel: { // Usato anche qui per coerenza
    fontSize: '16px',
    textAlign: 'left',
    marginBottom: '5px',
    display: 'block',
  },
};

interface SuperAdminModalProps {
  onClose: () => void;
}

const SuperAdminModal = ({ onClose }: SuperAdminModalProps) => {
  const { 
    commissionThreshold, 
    promotionGenerationFee, 
    commissionFee, 
    hairdresserPassword,
    salonNameFromFirestore,
    salonAddressFromFirestore,
    salonPhoneFromFirestore,
    salonLogoUrlFromFirestore,
    autoPaymentThreshold,
    treatments,
    prizes,
    hairdressers,
    showAlert,
    updateAppSettings,
    uploadSalonLogo,
    addTreatment,
    deleteTreatment,
    addPrize,
    deletePrize,
    updatePrizeLimits,
    addHairdresser,
    deleteHairdresser,
    updateHairdresser,
  } = useAppContext();

  // Stati locali per i campi di input modificabili
  const [settingsPassword, setSettingsPassword] = useState('');
  const [areSettingsUnlocked, setAreSettingsUnlocked] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(commissionThreshold.toString());
  const [tempCommissionFee, setTempCommissionFee] = useState(commissionFee.toString());
  const [tempPromotionGenerationFee, setTempPromotionGenerationFee] = useState(promotionGenerationFee.toString());
  const [tempAutoPaymentThreshold, setTempAutoPaymentThreshold] = useState(autoPaymentThreshold.toString());
  const [tempHairdresserPassword, setTempHairdresserPassword] = useState(hairdresserPassword);

  const [tempSalonName, setTempSalonName] = useState(salonNameFromFirestore);
  const [tempSalonAddress, setTempSalonAddress] = useState(salonAddressFromFirestore);
  const [tempSalonPhone, setTempSalonPhone] = useState(salonPhoneFromFirestore);
  const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);

  const [newTreatment, setNewTreatment] = useState({name: '', price: '', duration: ''});
  const [newPrize, setNewPrize] = useState('');
  const [newHairdresserName, setNewHairdresserName] = useState('');
  const [editingHairdresser, setEditingHairdresser] = useState<Hairdresser | null>(null);
  const [tempHairdresserWorkingHours, setTempHairdresserWorkingHours] = useState<{[key: string]: { start: string; end: string } | null}>({});
  const [tempHairdresserAbsentDates, setTempHairdresserAbsentDates] = useState<string[]>([]);


  // Sincronizza i valori temporanei quando cambiano dal contesto (es. all'apertura del modale)
  useEffect(() => { setTempThreshold(commissionThreshold.toString()); }, [commissionThreshold]);
  useEffect(() => { setTempCommissionFee(commissionFee.toString()); }, [commissionFee]);
  useEffect(() => { setTempPromotionGenerationFee(promotionGenerationFee.toString()); }, [promotionGenerationFee]);
  useEffect(() => { setTempAutoPaymentThreshold(autoPaymentThreshold.toString()); }, [autoPaymentThreshold]);
  useEffect(() => { setTempHairdresserPassword(hairdresserPassword); }, [hairdresserPassword]);
  useEffect(() => { setTempSalonName(salonNameFromFirestore); }, [salonNameFromFirestore]);
  useEffect(() => { setTempSalonAddress(salonAddressFromFirestore); }, [salonAddressFromFirestore]);
  useEffect(() => { setTempSalonPhone(salonPhoneFromFirestore); }, [salonPhoneFromFirestore]);


  const unlockSettings = () => {
    if (settingsPassword === 'freecent2025') {
        setAreSettingsUnlocked(true);
        setSettingsPassword(''); // Clear password input
    } else {
        showAlert('Accesso Negato', 'Password errata!');
    }
  };

  const handleSaveSettings = async () => {
    const newThreshold = parseFloat(tempThreshold);
    const newPromotionFee = parseFloat(tempPromotionGenerationFee);
    const newCommissionFee = parseFloat(tempCommissionFee);
    const newAutoPaymentThreshold = parseFloat(tempAutoPaymentThreshold);

    if (isNaN(newThreshold) || newThreshold <= 0 ||
        isNaN(newPromotionFee) || newPromotionFee < 0 ||
        isNaN(newCommissionFee) || newCommissionFee < 0 ||
        isNaN(newAutoPaymentThreshold) || newAutoPaymentThreshold <= 0)
    {
        showAlert("Errore di input", "Inserisci valori validi per tutte le tariffe e soglie.");
        return;
    }
    
    await updateAppSettings({
        commissionThreshold: newThreshold,
        promotionGenerationFee: newPromotionFee,
        commissionFee: newCommissionFee,
        autoPaymentThreshold: newAutoPaymentThreshold,
    });
    setAreSettingsUnlocked(false);
    showAlert('Impostazioni Salvate', 'Impostazioni salvate!');
  };

  const handleSaveHairdresserPassword = async () => {
      if(!tempHairdresserPassword.trim()){
          showAlert('Errore', 'La password non può essere vuota.');
          return;
      }
      await updateAppSettings({ hairdresserPassword: tempHairdresserPassword });
      setAreSettingsUnlocked(false);
      showAlert('Password Aggiornata', 'Password parrucchiere aggiornata!');
  };

  const handleSaveSalonInfo = async () => {
    if (!tempSalonName.trim() || !tempSalonAddress.trim() || !tempSalonPhone.trim()) {
      showAlert("Campi Mancanti", "Compila tutti i campi delle informazioni del salone.");
      return;
    }
    await updateAppSettings({
      salonName: tempSalonName,
      salonAddress: tempSalonAddress,
      salonPhone: tempSalonPhone,
    });
    showAlert("Successo", "Informazioni salone aggiornate!");
  };

  const handleLogoUpload = async () => {
    if (!tempLogoFile) {
      showAlert("File Mancante", "Seleziona un file immagine da caricare.");
      return;
    }
    await uploadSalonLogo(tempLogoFile);
    setTempLogoFile(null); // Resetta il file selezionato
  };

  const handleRestoreDefaultLogo = async () => {
    if (window.confirm("Sei sicuro di voler rimuovere il logo personalizzato e ripristinare quello di default?")) {
      await updateAppSettings({ salonLogoUrl: SALON_INFO.logoUrl });
      showAlert("Logo Rimosso", "Il logo personalizzato è stato rimosso e ripristinato a quello di default.");
    }
  };

  const handleAddTreatmentLocal = async () => {
      if(!newTreatment.name || !newTreatment.price || !newTreatment.duration) {
          showAlert("Campi Mancanti", "Compila tutti i campi del trattamento.");
          return;
      }
      await addTreatment({
        name: newTreatment.name,
        price: parseFloat(newTreatment.price),
        duration: parseInt(newTreatment.duration)
      } as Omit<Treatment, 'id'>); // Cast per garantire che id sia omesso
      setNewTreatment({name: '', price: '', duration: ''});
  };

  const handleAddPrizeLocal = async () => {
      if (!newPrize.trim()) {
          showAlert("Testo Mancante", "Inserisci il testo del premio.");
          return;
      }
      await addPrize(newPrize);
      setNewPrize('');
  };

  const handlePrizeLimitChangeLocal = async (id: string, period: 'daily' | 'weekly' | 'monthly', value: string) => {
      const parsedValue = parseInt(value) || 0;
      await updatePrizeLimits(id, period, parsedValue);
  };

  const handleAddHairdresserLocal = async () => {
      if (!newHairdresserName.trim()) {
          showAlert("Nome Mancante", "Inserisci il nome del parrucchiere.");
          return;
      }
      await addHairdresser(newHairdresserName);
      setNewHairdresserName('');
  };

  const handleEditHairdresser = (hd: Hairdresser) => {
    setEditingHairdresser(hd);
    setTempHairdresserWorkingHours(hd.workingHours || {});
    setTempHairdresserAbsentDates(hd.absentDates || []);
  };

  const handleSaveHairdresserWorkingHours = async () => {
    if (editingHairdresser) {
      await updateHairdresser({
        ...editingHairdresser,
        workingHours: tempHairdresserWorkingHours,
        absentDates: tempHairdresserAbsentDates,
      });
      setEditingHairdresser(null);
    }
  };


  return (
    <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Pannello di Controllo FreeCent</h2>
            
            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Password Parrucchiere</h3>
                <input type="text" value={tempHairdresserPassword} onChange={(e) => setTempHairdresserPassword(e.target.value)} placeholder="Nuova password" style={styles.inputField} />
                <button onClick={handleSaveHairdresserPassword} style={styles.smallButton}>Salva Password</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Informazioni Salone</h3>
                <label style={styles.aiFormLabel}>Nome Salone:</label>
                <input type="text" value={tempSalonName} onChange={(e) => setTempSalonName(e.target.value)} placeholder="Nome del salone" style={styles.inputField} />
                <label style={styles.aiFormLabel}>Indirizzo Salone:</label>
                <input type="text" value={tempSalonAddress} onChange={(e) => setTempSalonAddress(e.target.value)} placeholder="Indirizzo del salone" style={styles.inputField} />
                <label style={styles.aiFormLabel}>Numero di Telefono:</label>
                <input type="text" value={tempSalonPhone} onChange={(e) => setTempSalonPhone(e.target.value)} placeholder="Numero di telefono" style={styles.inputField} />
                <button onClick={handleSaveSalonInfo} style={styles.smallButton}>Salva Info Salone</button>

                <h4 style={{...styles.subSectionTitle, marginTop: '20px'}}>Gestione Logo Salone</h4>
                {salonLogoUrlFromFirestore && (
                    <img src={salonLogoUrlFromFirestore} alt="Logo attuale" style={{width: '80px', height: '80px', borderRadius: '50%', display: 'block', margin: '10px auto', border: '1px solid #e6c300'}} />
                )}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setTempLogoFile(e.target.files ? e.target.files[0] : null)} 
                    style={{...styles.inputField, padding: '10px', height: 'auto'}} 
                />
                <button onClick={handleLogoUpload} style={styles.smallButton} disabled={!tempLogoFile}>Carica Nuovo Logo</button>
                {salonLogoUrlFromFirestore !== SALON_INFO.logoUrl && (
                  <button onClick={handleRestoreDefaultLogo} style={{...styles.deleteButton, marginTop: '10px', width: '100%'}}>Ripristina Logo Default</button>
                )}
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Trattamenti</h3>
                <ul style={styles.managementList}>
                   {treatments.map(t => (
                        <li key={t.id} style={styles.managementListItem}>
                            <span>{t.name} - €{t.price} ({t.duration} min)</span>
                            <button onClick={() => deleteTreatment(t.id)} style={styles.deleteButton}>X</button>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newTreatment.name} onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})} placeholder="Nome trattamento" style={{...styles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.price} onChange={(e) => setNewTreatment({...newTreatment, price: e.target.value})} placeholder="Prezzo" style={{...styles.inputField, marginBottom: '10px'}} />
                <input type="number" value={newTreatment.duration} onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})} placeholder="Durata (min)" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddTreatmentLocal} style={styles.smallButton}>Aggiungi Trattamento</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Parrucchieri</h3>
                <ul style={styles.managementList}>
                   {hairdressers.map(hd => (
                        <li key={hd.id} style={styles.managementListItem}>
                            <span>{hd.name}</span>
                            <div>
                                <button onClick={() => deleteHairdresser(hd.id)} style={styles.deleteButton}>X</button>
                                <button onClick={() => handleEditHairdresser(hd)} style={styles.smallButton}>Modifica Orari</button>
                            </div>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newHairdresserName} onChange={(e) => setNewHairdresserName(e.target.value)} placeholder="Nome nuovo parrucchiere" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddHairdresserLocal} style={styles.smallButton}>Aggiungi Parrucchiere</button>
            </div>
            
            {editingHairdresser && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Modifica Orari per {editingHairdresser.name}</h2>
                        <h4 style={styles.subSectionTitle}>Orari Settimanali</h4>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                                <label style={{ flex: 1, textTransform: 'capitalize' }}>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
                                <input
                                    type="time"
                                    value={tempHairdresserWorkingHours[day]?.start || ''}
                                    onChange={(e) => setTempHairdresserWorkingHours(prev => ({
                                        ...prev,
                                        [day]: e.target.value ? { start: e.target.value, end: prev[day]?.end || '18:00' } : null
                                    }))}
                                    style={styles.inputField}
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    value={tempHairdresserWorkingHours[day]?.end || ''}
                                    onChange={(e) => setTempHairdresserWorkingHours(prev => ({
                                        ...prev,
                                        [day]: e.target.value ? { start: prev[day]?.start || '09:00', end: e.target.value } : null
                                    }))}
                                    style={styles.inputField}
                                />
                                <input
                                    type="checkbox"
                                    checked={tempHairdresserWorkingHours[day] === null}
                                    onChange={(e) => setTempHairdresserWorkingHours(prev => ({
                                        ...prev,
                                        [day]: e.target.checked ? null : { start: '09:00', end: '18:00' }
                                    }))}
                                /> Riposo
                            </div>
                        ))}

                        <h4 style={styles.subSectionTitle}>Date di Assenza (Ferie, Malattie, ecc.)</h4>
                        <p style={styles.modalMessage}>Aggiungi date specifiche in cui il parrucchiere non sarà disponibile.</p>
                        <input
                            type="date"
                            onChange={(e) => {
                                const newDate = e.target.value;
                                if (newDate && !tempHairdresserAbsentDates.includes(newDate)) {
                                    setTempHairdresserAbsentDates(prev => [...prev, newDate].sort());
                                }
                            }}
                            style={styles.inputField}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                            {tempHairdresserAbsentDates.map(date => (
                                <span key={date} style={{ backgroundColor: '#555', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {new Date(date).toLocaleDateString('it-IT')}
                                    <button onClick={() => setTempHairdresserAbsentDates(prev => prev.filter(d => d !== date))} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '14px' }}>&times;</button>
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={handleSaveHairdresserWorkingHours}
                            style={styles.ctaButton}
                        >
                            Salva Orari
                        </button>
                        <button style={styles.modalButton} onClick={() => setEditingHairdresser(null)}>Annulla</button>
                    </div>
                </div>
            )}

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Gestione Premi Gratta e Vinci</h3>
                <ul style={styles.managementList}>
                   {prizes.map((p) => (
                        <li key={p.id} style={styles.managementListItem}>
                            <span>{p.text}</span>
                            <div style={styles.limitInputContainer}>
                                <label>G:</label><input type="number" style={styles.limitInput} value={p.limits.daily} onChange={(e) => handlePrizeLimitChangeLocal(p.id, 'daily', e.target.value)} />
                                <label>S:</label><input type="number" style={styles.limitInput} value={p.limits.weekly} onChange={(e) => handlePrizeLimitChangeLocal(p.id, 'weekly', e.target.value)} />
                                <label>M:</label><input type="number" style={styles.limitInput} value={p.limits.monthly} onChange={(e) => handlePrizeLimitChangeLocal(p.id, 'monthly', e.target.value)} />
                                {!p.text.includes('Ritenta') && <button onClick={() => deletePrize(p.id)} style={styles.deleteButton}>X</button>}
                            </div>
                        </li>
                   ))}
                </ul>
                <input type="text" value={newPrize} onChange={(e) => setNewPrize(e.target.value)} placeholder="Nuovo premio (testo)" style={{...styles.inputField, marginBottom: '10px'}} />
                <button onClick={handleAddPrizeLocal} style={styles.smallButton}>Aggiungi Premio</button>
            </div>

            <div style={styles.settingsSection}>
                <h3 style={styles.subSectionTitle}>Impostazioni Pagamenti</h3>
                {!areSettingsUnlocked ? (
                    <div>
                        <input type="password" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} placeholder="Password Amministratore" style={styles.inputField} />
                        <button onClick={unlockSettings} style={styles.smallButton}>Sblocca</button>
                    </div>
                ) : (
                    <div>
                        <label style={{display: 'block', marginBottom: '10px'}}>Soglia di Pagamento Manuale (€)</label>
                        <input type="number" value={tempThreshold} onChange={(e) => setTempThreshold(e.target.value)} style={styles.inputField} step="5" min="5" />
                        
                        <label style={{display: 'block', marginTop: '20px', marginBottom: '10px'}}>Costo Generazione Immagine Promozionale (€)</label>
                        <input type="number" value={tempPromotionGenerationFee} onChange={(e) => setTempPromotionGenerationFee(e.target.value)} style={styles.inputField} step="1" min="0" />

                        <label style={{display: 'block', marginTop: '20px', marginBottom: '10px'}}>Commissione per Appuntamento (€)</label>
                        <input type="number" value={tempCommissionFee} onChange={(e) => setTempCommissionFee(e.target.value)} style={styles.inputField} step="0.10" min="0" />

                        <label style={{display: 'block', marginTop: '20px', marginBottom: '10px'}}>Soglia Pagamento Automatico (€)</label>
                        <input type="number" value={tempAutoPaymentThreshold} onChange={(e) => setTempAutoPaymentThreshold(e.target.value)} style={styles.inputField} step="10" min="10" />

                        <button onClick={handleSaveSettings} style={styles.smallButton}>Salva Impostazioni Pagamenti</button>
                    </div>
                )}
            </div>

            <button style={styles.modalButton} onClick={onClose}>Chiudi Pannello</button>
        </div>
    </div>
  );
};

export default SuperAdminModal;