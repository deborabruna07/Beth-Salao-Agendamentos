import { Service, Appointment } from '@/types/salon';

export const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Corte Feminino',
    activeTimeStart: 30,
    waitTime: 0,
    activeTimeEnd: 0,
    totalTime: 30,
  },
  {
    id: '2',
    name: 'Coloração',
    activeTimeStart: 20,
    waitTime: 30,
    activeTimeEnd: 15,
    totalTime: 65,
  },
  {
    id: '3',
    name: 'Escova Progressiva',
    activeTimeStart: 30,
    waitTime: 40,
    activeTimeEnd: 30,
    totalTime: 100,
  },
  {
    id: '4',
    name: 'Manicure e Pedicure',
    activeTimeStart: 45,
    waitTime: 10,
    activeTimeEnd: 15,
    totalTime: 70,
  },
  {
    id: '5',
    name: 'Hidratação Capilar',
    activeTimeStart: 15,
    waitTime: 20,
    activeTimeEnd: 10,
    totalTime: 45,
  },
  {
    id: '6',
    name: 'Penteado',
    activeTimeStart: 40,
    waitTime: 0,
    activeTimeEnd: 0,
    totalTime: 40,
  },
];

export const initialAppointments: Appointment[] = [
  {
    id: 'a1',
    clientName: 'Maria Silva',
    serviceId: '2',
    date: '2026-02-10',
    startTime: '09:00',
    endTime: '10:05',
    status: 'confirmed',
  },
  {
    id: 'a2',
    clientName: 'Ana Costa',
    serviceId: '1',
    date: '2026-02-10',
    startTime: '10:30',
    endTime: '11:00',
    status: 'confirmed',
  },
  {
    id: 'a3',
    clientName: 'Juliana Santos',
    serviceId: '3',
    date: '2026-02-11',
    startTime: '14:00',
    endTime: '15:40',
    status: 'confirmed',
  },
];

// Closed days (0=Sun, 1=Mon, ..., 6=Sat)
export const closedDays = [0]; // Sunday closed

// Working hours
export const workingHours = { start: 8, end: 18 }; // 8:00 - 18:00
