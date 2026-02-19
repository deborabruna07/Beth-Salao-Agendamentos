import { create } from 'zustand';
import { Appointment, Service } from '@/types/salon';
import { supabase } from '@/lib/supabase';
import { setServicesRef } from '@/lib/scheduling';

interface SalonStore {
  services: Service[];
  appointments: Appointment[];

  fetchServices: () => Promise<void>;
  fetchAppointments: () => Promise<void>;

  addService: (service: Omit<Service, 'id' | 'totalTime'>) => Promise<void>;
  removeService: (id: string) => Promise<void>;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  
  cancelAppointment: (id: string) => Promise<void>;
  clearAllAppointments: () => Promise<void>;

  setAppointments: (appointments: Appointment[]) => void;
}

export const useSalonStore = create<SalonStore>((set, get) => ({
  services: [],
  appointments: [],

  fetchServices: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      console.error(error);
      return;
    }

    const formatted = data.map((s) => ({
      id: s.id,
      name: s.name,
      activeTimeStart: s.active_time_start,
      waitTime: s.wait_time,
      activeTimeEnd: s.active_time_end,
      totalTime: s.total_time,
    }));

    setServicesRef(formatted);
    set({ services: formatted });
  },

  // BUSCAR AGENDAMENTOS
  fetchAppointments: async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const formatted = data.map((a) => ({
      id: a.id,
      clientName: a.client_name,
      clientWhatsapp: a.client_whatsapp,
      clientEmail: a.client_email,
      serviceId: a.service_id,
      date: a.date,
      startTime: a.start_time,
      endTime: a.end_time,
      status: a.status,
    }));

    set({ appointments: formatted });
  },

  // ADICIONAR SERVIÇO
  addService: async (service) => {
    const totalTime =
      service.activeTimeStart +
      service.waitTime +
      service.activeTimeEnd;

    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          name: service.name,
          active_time_start: service.activeTimeStart,
          wait_time: service.waitTime,
          active_time_end: service.activeTimeEnd,
          total_time: totalTime,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const formatted = {
      id: data.id,
      name: data.name,
      activeTimeStart: data.active_time_start,
      waitTime: data.wait_time,
      activeTimeEnd: data.active_time_end,
      totalTime: data.total_time,
    };

    const updated = [...get().services, formatted];
    setServicesRef(updated);
    set({ services: updated });
  },

  // REMOVER SERVIÇO
  removeService: async (id) => {
    await supabase.from('services').delete().eq('id', id);

    const updated = get().services.filter((s) => s.id !== id);
    setServicesRef(updated);
    set({ services: updated });
  },

  // ADICIONAR AGENDAMENTO
  addAppointment: async (appointment) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          client_name: appointment.clientName,
          client_whatsapp: appointment.clientWhatsapp,
          client_email: appointment.clientEmail,
          service_id: appointment.serviceId,
          date: appointment.date,
          start_time: appointment.startTime,
          end_time: appointment.endTime,
          status: appointment.status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const formatted = {
      id: data.id,
      clientName: data.client_name,
      clientWhatsapp: data.client_whatsapp,
      clientEmail: data.client_email,
      serviceId: data.service_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
    };

    set({
appointments: [...get().appointments, formatted],
    });
  },

clearAllAppointments: async () => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .not('id', 'is', null); // Deleta todos onde o ID não é nulo

  if (error) {
    console.error('Erro ao limpar tudo:', error);
    throw error;
  }

  set({ appointments: [] });
},

  // CANCELAR AGENDAMENTO
  cancelAppointment: async (id) => {
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    set({
      appointments: get().appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' } : a
      ),
    });
  },

  setAppointments: (appointments) => set({ appointments }),
}));
