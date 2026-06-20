import React, { useState, type CSSProperties } from 'react';

// Stili copiati dal tuo App.tsx originale per il calendario
const styles: { [key: string]: CSSProperties } = {
  calendarContainer: {
    backgroundColor: '#2c2c2c',
    padding: '15px',
    borderRadius: '12px',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  calendarNavButton: {
    background: 'none',
    border: 'none',
    color: '#e6c300',
    fontSize: '24px',
    cursor: 'pointer',
  },
  calendarMonthLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  calendarDayLabel: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '12px',
  },
  calendarDay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40px',
    cursor: 'pointer',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  calendarDaySelected: {
    backgroundColor: '#e6c300',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  calendarDayOtherMonth: {
    color: '#555',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
  calendarDayPast: {
    color: '#555',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
};

const Calendar = ({ selectedDate, onDateSelect }: {selectedDate: string; onDateSelect: (date: string) => void}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const changeMonth = (amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderDays = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const startDate = new Date(monthStart);
        // Imposta il primo giorno della settimana come Lunedì (getDay() restituisce 0 per Domenica)
        startDate.setDate(startDate.getDate() - (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1));
        
        const days = [];
        const today = new Date();
        today.setHours(0,0,0,0); // Normalizza a mezzanotte per il confronto

        for (let i = 0; i < 42; i++) { // 6 settimane * 7 giorni
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            const dateString = day.toISOString().split('T')[0];

            const isOtherMonth = day.getMonth() !== currentMonth.getMonth();
            const isPast = day.getTime() < today.getTime(); // Confronta timestamp
            const isSelected = dateString === selectedDate;

            days.push(
                <div 
                    key={dateString}
                    style={{
                        ...styles.calendarDay,
                        ...(isOtherMonth && styles.calendarDayOtherMonth),
                        ...(isSelected && styles.calendarDaySelected),
                        ...(isPast && styles.calendarDayPast),
                    }}
                    onClick={() => !isPast && onDateSelect(dateString)} // Non selezionabile se nel passato
                >
                    {day.getDate()}
                </div>
            );
        }
        return days;
    };
    
    return (
        <div style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
                <button onClick={() => changeMonth(-1)} style={styles.calendarNavButton}>‹</button>
                <span style={styles.calendarMonthLabel}>
                    {currentMonth.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} style={styles.calendarNavButton}>›</button>
            </div>
            <div style={styles.calendarGrid}>
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => <div key={day} style={styles.calendarDayLabel}>{day}</div>)}
                {renderDays()}
            </div>
        </div>
    );
};

export default Calendar;