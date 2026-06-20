import React, { type CSSProperties } from 'react';

// Stili copiati dal tuo App.tsx originale per lo spinner
const styles: { [key: string]: CSSProperties } = {
  spinner: {
    border: '6px solid #333',
    borderTop: '6px solid #e6c300',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite', // L'animazione 'spin' sarà definita globalmente in App.tsx
    margin: '20px auto',
  },
};

const Spinner = () => (
  <div style={styles.spinner}></div>
);

export default Spinner;