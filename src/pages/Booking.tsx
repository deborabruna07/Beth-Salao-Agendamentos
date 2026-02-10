import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight, Home, CheckCircle2, Scissors, Mail, Phone } from 'lucide-react';
import { format, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useSalonStore } from '@/store/salonStore';
import { getAvailableSlots, calculateEndTime } from '@/lib/scheduling';
import { closedDays } from '@/data/mockData';
import { Service, TimeSlot } from '@/types/salon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Header from '@/components/salon/Header';
import { sendConfirmationEmail } from '@/services/emailService';

const Booking = () => {
  const { services, appointments, addAppointment } = useSalonStore();
  const [step, setStep] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Estado para os novos dados solicitados
  const [clientData, setClientData] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const today = startOfDay(new Date());

  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i));
  const availableDays = days.filter((d) => !closedDays.includes(getDay(d)));

  const handleSelectDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    if (selectedService) {
      const slots = getAvailableSlots(dateStr, selectedService, appointments);
      setAvailableSlots(slots);
    }
    setSelectedTime('');
  };

  const handleConfirm = async () => {
    if (!clientData.name || !clientData.email || !selectedService || !selectedDate || !selectedTime) return;

    const endTime = calculateEndTime(selectedTime, selectedService);
    
    // Adiciona o agendamento localmente
    addAppointment({
      clientName: clientData.name,
      serviceId: selectedService.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      status: 'confirmed',
    });

    // Envio do e-mail via API Brevo
    const emailPromise = sendConfirmationEmail(
      { name: clientData.name, email: clientData.email },
      { 
        serviceName: selectedService.name, 
        date: format(new Date(selectedDate + 'T12:00'), "dd/MM/yyyy"), 
        time: selectedTime 
      }
    );

    toast.promise(emailPromise, {
      loading: 'Confirmando e enviando e-mail...',
      success: () => {
        setIsConfirmed(true);
        return 'Agendamento confirmado!';
      },
      error: () => {
        setIsConfirmed(true); // Exibe a tela rosa mesmo se o e-mail falhar para confirmar a reserva
        return 'Agendamento salvo, mas erro ao enviar e-mail.';
      }
    });
  };

  const canProceed = () => {
    if (step === 0) {
      return (
        clientData.name.trim().length >= 3 && 
        clientData.whatsapp.trim().length >= 10 && 
        clientData.email.includes('@')
      );
    }
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!selectedTime;
    return false;
  };

  const steps = ['Dados', 'Serviço', 'Data', 'Horário'];

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex items-center justify-center px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-8 rounded-3xl border border-primary/20 bg-card p-10 text-center shadow-lg"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-bold text-foreground">Agendamento Realizado!</h2>
              <p className="text-muted-foreground">
                Tudo pronto, <span className="font-semibold text-foreground">{clientData.name}</span>! Enviamos os detalhes para o e-mail informado.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-6 text-left space-y-4">
              <div className="flex items-center gap-3 text-base">
                <Scissors className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{selectedService?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-foreground">{format(new Date(selectedDate + 'T12:00'), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-3 text-base">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-foreground">{selectedTime}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <Link to="/" className="w-fit">
                <Button className="w-full max-w-[200px] h-12 gap-2 gradient-primary text-primary-foreground border-0 shadow-soft px-8">
                  <Home className="h-4 w-4" />
                  Voltar para o Início
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Agendar Horário</h1>
          <p className="mt-2 text-muted-foreground">Escolha o serviço e horário ideal para você</p>
        </motion.div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 w-8 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="client-data" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4 text-left">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><User className="h-4 w-4 text-primary" /> Nome Completo</label>
                  <Input placeholder="Seu nome" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><Phone className="h-4 w-4 text-primary" /> WhatsApp</label>
                  <Input placeholder="(00) 00000-0000" value={clientData.whatsapp} onChange={(e) => setClientData({ ...clientData, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4 text-primary" /> E-mail</label>
                  <Input type="email" placeholder="seu@email.com" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedService?.id === service.id
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border bg-card hover:border-primary/30 shadow-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {service.totalTime} min total
                        {service.waitTime > 0 && (
                          <span className="ml-2 text-xs text-accent">
                            ({service.waitTime} min espera)
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 transition-colors ${
                        selectedService?.id === service.id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card text-left">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"><Calendar className="h-4 w-4 text-primary" /> Selecione a data</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {availableDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isPast = isBefore(day, today);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button key={dateStr} disabled={isPast} onClick={() => handleSelectDate(day)} className={`rounded-lg p-2 text-center text-sm transition-all ${isPast ? 'cursor-not-allowed opacity-40' : isSelected ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary text-foreground hover:bg-primary/10'}`}>
                        <div className="text-xs opacity-70">{format(day, 'EEE', { locale: ptBR })}</div>
                        <div className="font-semibold">{format(day, 'dd')}</div>
                        <div className="text-xs opacity-70">{format(day, 'MMM', { locale: ptBR })}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card text-left">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"><Clock className="h-4 w-4 text-primary" /> Horários disponíveis</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availableSlots.filter((s) => s.available).map((slot) => (
                    <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`rounded-lg py-3 text-center text-sm font-medium transition-all ${selectedTime === slot.time ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary text-foreground hover:bg-primary/10'}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="gap-2 gradient-primary text-primary-foreground border-0">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={!canProceed()} className="gap-2 gradient-primary text-primary-foreground border-0">
              <CheckCircle className="h-4 w-4" /> Confirmar
            </Button>
          )}
        </div>

        {/* Resumo visual fixo no final do formulário */}
        {(clientData.name || selectedService || selectedDate || selectedTime) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumo</p>
            <div className="space-y-1 text-sm text-foreground">
              {clientData.name && <p>👤 {clientData.name}</p>}
              {selectedService && <p>✂️ {selectedService.name}</p>}
              {selectedDate && <p>📅 {format(new Date(selectedDate + 'T12:00'), "dd 'de' MMMM", { locale: ptBR })}</p>}
              {selectedTime && <p>🕐 {selectedTime}</p>}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Booking;