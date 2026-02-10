import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Importando a persistência
import { Appointment, Service } from '@/types/salon';
import { defaultServices, initialAppointments } from '@/data/mockData';
import { setServicesRef } from '@/lib/scheduling';

interface SalonStore {
  services: Service[];
  appointments: Appointment[];
  addService: (service: Omit<Service, 'id' | 'totalTime'>) => void;
  removeService: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (id: string) => void;
  clearAllAppointments: () => void;
}

export const useSalonStore = create<SalonStore>()(
  persist(
    (set, get) => {
      // Initialize services ref
      setServicesRef(defaultServices);

      return {
        services: defaultServices,
        appointments: initialAppointments,

        addService: (service) => {
          const totalTime = service.activeTimeStart + service.waitTime + service.activeTimeEnd;
          const newService: Service = {
            ...service,
            id: Date.now().toString(),
            totalTime,
          };
          const updated = [...get().services, newService];
          setServicesRef(updated);
          set({ services: updated });
        },

        removeService: (id) => {
          const updated = get().services.filter((s) => s.id !== id);
          setServicesRef(updated);
          set({ services: updated });
        },

        addAppointment: (appointment) => {
          const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
          };
          set({ appointments: [...get().appointments, newAppointment] });
        },

        cancelAppointment: (id) => {
          set({
            appointments: get().appointments.map((a) =>
              a.id === id ? { ...a, status: 'cancelled' as const } : a
            ),
          });
        },

        clearAllAppointments: () => {
          set({ appointments: [] });
        },
      };
    },
    {
      name: 'salon-data-storage', // Nome da chave no LocalStorage do navegador
      storage: createJSONStorage(() => localStorage),
      // Opcional: sincroniza a referência de serviços ao carregar os dados persistidos
      onRehydrateStorage: () => (state) => {
        if (state) {
          setServicesRef(state.services);
        }
      },
    }
  )
);