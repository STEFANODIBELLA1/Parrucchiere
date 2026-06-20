import React, { type CSSProperties } from 'react';
import { type Treatment } from '../../utils/types'; // Importa il tipo Treatment

// Stili copiati dal tuo App.tsx originale per il trattamento
const styles: { [key: string]: CSSProperties } = {
  treatmentItem: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    border: '1px solid #444',
  },
  treatmentItemSelected: {
    backgroundColor: '#e6c300',
    borderColor: '#e6c300'
  },
  treatmentContent: {
    flex: 1,
    cursor: 'pointer',
  },
  treatmentInfoIcon: {
    marginLeft: '15px',
    fontSize: '24px',
    color: '#e6c300',
    cursor: 'pointer',
  },
  treatmentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  treatmentNameSelected: { color: '#1a1a1a' },
  treatmentDuration: {
    fontSize: '14px',
    color: '#aaa',
    marginTop: '4px',
  },
  treatmentDurationSelected: { color: '#555' },
  treatmentPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e6c300',
  },
  treatmentPriceSelected: { color: '#1a1a1a' },
};

const TreatmentItem = ({ item, onSelect, isSelected, onInfoClick }: {item: Treatment; onSelect: (item: Treatment) => void; isSelected: boolean; onInfoClick: (item: Treatment) => void}) => (
  <div style={{...styles.treatmentItem, ...(isSelected && styles.treatmentItemSelected)}}>
    <div style={styles.treatmentContent} onClick={() => onSelect(item)}>
      <p style={{...styles.treatmentName, ...(isSelected && styles.treatmentNameSelected)}}>{item.name}</p>
      <p style={{...styles.treatmentDuration, ...(isSelected && styles.treatmentDurationSelected)}}>{item.duration} min</p>
    </div>
    <span style={styles.treatmentInfoIcon} onClick={() => onInfoClick(item)}>✨</span>
  </div>
);

export default TreatmentItem;