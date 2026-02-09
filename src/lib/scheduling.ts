import { Appointment, Service, TimeSlot } from '@/types/salon';
import { workingHours } from '@/data/mockData';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateEndTime(startTime: string, service: Service): string {
  const startMinutes = timeToMinutes(startTime);
  return minutesToTime(startMinutes + service.totalTime);
}

export function getAvailableSlots(
  date: string,
  service: Service,
  appointments: Appointment[]
): TimeSlot[] {
  const dayAppointments = appointments.filter(
    (a) => a.date === date && a.status === 'confirmed'
  );

  const slots: TimeSlot[] = [];
  const startMinutes = workingHours.start * 60;
  const endMinutes = workingHours.end * 60;

  for (let t = startMinutes; t + service.totalTime <= endMinutes; t += 30) {
    const slotStart = t;
    const slotEnd = t + service.totalTime;

    // Check active periods only (not wait time) for conflicts
    const activeStart1 = slotStart;
    const activeEnd1 = slotStart + service.activeTimeStart;
    const activeStart2 = slotEnd - service.activeTimeEnd;
    const activeEnd2 = slotEnd;

    let available = true;

    for (const appt of dayAppointments) {
      const apptService = getServiceForAppointment(appt);
      if (!apptService) {
        // Simple overlap check
        const aStart = timeToMinutes(appt.startTime);
        const aEnd = timeToMinutes(appt.endTime);
        if (slotStart < aEnd && slotEnd > aStart) {
          available = false;
          break;
        }
        continue;
      }

      const aStart = timeToMinutes(appt.startTime);
      const aActiveEnd1 = aStart + apptService.activeTimeStart;
      const aEnd = timeToMinutes(appt.endTime);
      const aActiveStart2 = aEnd - apptService.activeTimeEnd;

      // Check if active periods overlap
      if (activeStart1 < aActiveEnd1 && activeEnd1 > aStart) {
        available = false;
        break;
      }
      if (apptService.activeTimeEnd > 0 && activeStart1 < aEnd && activeEnd1 > aActiveStart2) {
        available = false;
        break;
      }
      if (service.activeTimeEnd > 0 && activeStart2 < aActiveEnd1 && activeEnd2 > aStart) {
        available = false;
        break;
      }
      if (service.activeTimeEnd > 0 && apptService.activeTimeEnd > 0 && activeStart2 < aEnd && activeEnd2 > aActiveStart2) {
        available = false;
        break;
      }
    }

    slots.push({
      time: minutesToTime(t),
      available,
    });
  }

  return slots;
}

// This will be set by the store
let servicesRef: Service[] = [];
export function setServicesRef(services: Service[]) {
  servicesRef = services;
}

function getServiceForAppointment(appt: Appointment): Service | undefined {
  return servicesRef.find((s) => s.id === appt.serviceId);
}

export function exportToCSV(appointments: Appointment[], services: Service[]): string {
  const header = 'Cliente,Serviço,Data,Início,Término,Status\n';
  const rows = appointments.map((a) => {
    const service = services.find((s) => s.id === a.serviceId);
    return `${a.clientName},${service?.name || 'N/A'},${a.date},${a.startTime},${a.endTime},${a.status}`;
  });
  return header + rows.join('\n');
}
