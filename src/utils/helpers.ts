// src/utils/helpers.ts

/**
 * Calcola il numero della settimana ISO per una data data.
 * @param d La data da cui calcolare il numero della settimana.
 * @returns Una stringa nel formato 'YYYY-WW' (es: '2023-45').
 */
export const getWeekNumber = (d: Date): string => {
    // Copia la data per evitare modifiche all'originale
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Imposta la data al giovedì della stessa settimana (ISO week date standard)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Data di inizio dell'anno (1 gennaio)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calcola il numero della settimana
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return d.getUTCFullYear() + '-' + weekNo;
};

/**
 * Restituisce la stringa della data odierna nel formato YYYY-MM-DD.
 * @returns La stringa della data odierna.
 */
export const getTodayString = (): string => new Date().toISOString().split('T')[0];

/**
 * Restituisce la stringa del mese nel formato YYYY-M (es: '2023-11').
 * @param d La data da cui estrarre la stringa del mese.
 * @returns La stringa del mese.
 */
export const getMonthString = (d: Date): string => d.getFullYear() + '-' + (d.getMonth() + 1);
