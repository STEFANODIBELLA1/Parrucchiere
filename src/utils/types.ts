// src/utils/types.ts

export interface Treatment {
  id: string;
  name: string;
  price: number;
  duration: number; // in minuti
}

export interface Prize {
  id: string;
  text: string;
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  dispensed: {
    daily?: { count: number; date: string };
    weekly?: { count: number; week: string };
    monthly?: { count: number; month: string };
  };
}

export interface Hairdresser {
  id: string;
  name: string;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
    } | null;
  };
  absentDates: string[];
}

// 'Employee' è il nuovo nome per il dipendente del salone (ex 'Hairdresser').
export type Employee = Hairdresser;

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  treatments: Treatment[];
  total: number;
  prize: string;
  hairdresserId: string;
}

export interface ArchivedClosure {
    id: string;
    date: string;
    appointmentCount: number;
    amountPaid: number;
    appointments: Appointment[];
    promotionGenerationCost?: number;
}
