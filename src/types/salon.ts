export interface Service {
  id: string;
  name: string;
  activeTimeStart: number; // minutes
  waitTime: number; // minutes
  activeTimeEnd: number; // minutes
  totalTime: number; // computed
}

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'confirmed' | 'cancelled';
}

export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
}
