import React, { type CSSProperties } from 'react';

// Stili copiati dal tuo App.tsx originale per lo slot orario
const styles: { [key: string]: CSSProperties } = {
  slotItem: {
    padding: '12px 18px',
    backgroundColor: '#333',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '16px',
    border: '1px solid #333',
    transition: 'background-color 0.2s',
  },
  slotItemSelected: {
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  slotItemBooked: {
    backgroundColor: '#5a2d2d',
    color: '#aaa',
    cursor: 'not-allowed',
    textDecoration: 'line-through'
  },
};

const TimeSlot = ({ time, onSelect, isSelected, isBooked }: {time: string; onSelect: (time: string) => void; isSelected: boolean; isBooked: boolean }) => (
    <button
        style={{
            ...styles.slotItem,
            ...(isSelected && styles.slotItemSelected),
            ...(isBooked && styles.slotItemBooked)
        }}
        onClick={() => !isBooked && onSelect(time)}
        disabled={isBooked}
    >
        {time}
    </button>
);

export default TimeSlot;