import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSalonStore } from '@/store/salonStore';
import { getAvailableSlots, calculateEndTime } from '@/lib/scheduling';
import { closedDays } from '@/data/mockData';
import { Service, TimeSlot } from '@/types/salon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Header from '@/components/salon/Header';

const Booking = () => {
  const { services, appointments, addAppointment } = useSalonStore();
  const [step, setStep] = useState(0);
  const [clientName, setClientName] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const today = startOfDay(new Date());

  // Generate next 30 days
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

  const handleConfirm = () => {
    if (!clientName || !selectedService || !selectedDate || !selectedTime) return;

    const endTime = calculateEndTime(selectedTime, selectedService);
    addAppointment({
      clientName,
      serviceId: selectedService.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      status: 'confirmed',
    });

    toast.success('Agendamento confirmado!', {
      description: `${selectedService.name} em ${format(new Date(selectedDate + 'T12:00'), "dd 'de' MMMM", { locale: ptBR })} às ${selectedTime}`,
    });

    // Reset
    setStep(0);
    setClientName('');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const canProceed = () => {
    if (step === 0) return clientName.trim().length >= 2;
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!selectedTime;
    return false;
  };

  const steps = ['Nome', 'Serviço', 'Data', 'Horário'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-3xl font-bold text-foreground">
            Agendar Horário
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha o serviço e horário ideal para você
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Seu nome
                </label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-base"
                />
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
                            ({service.waitTime} min espera — permite encaixe)
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
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Selecione a data
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {availableDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isPast = isBefore(day, today);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        disabled={isPast}
                        onClick={() => handleSelectDate(day)}
                        className={`rounded-lg p-2 text-center text-sm transition-all ${
                          isPast
                            ? 'cursor-not-allowed text-muted-foreground/40'
                            : isSelected
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'bg-secondary text-foreground hover:bg-primary/10'
                        }`}
                      >
                        <div className="text-xs text-inherit opacity-70">
                          {format(day, 'EEE', { locale: ptBR })}
                        </div>
                        <div className="font-semibold">{format(day, 'dd')}</div>
                        <div className="text-xs text-inherit opacity-70">
                          {format(day, 'MMM', { locale: ptBR })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Horários disponíveis
                </p>
                {availableSlots.filter((s) => s.available).length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum horário disponível nesta data
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`rounded-lg py-3 text-center text-sm font-medium transition-all ${
                          !slot.available
                            ? 'cursor-not-allowed bg-muted text-muted-foreground/40 line-through'
                            : selectedTime === slot.time
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'bg-secondary text-foreground hover:bg-primary/10'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2 gradient-primary text-primary-foreground border-0"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!canProceed()}
              className="gap-2 gradient-primary text-primary-foreground border-0"
            >
              <CheckCircle className="h-4 w-4" /> Confirmar
            </Button>
          )}
        </div>

        {/* Summary */}
        {(selectedService || selectedDate || selectedTime) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resumo
            </p>
            <div className="space-y-1 text-sm text-foreground">
              {clientName && <p>👤 {clientName}</p>}
              {selectedService && <p>✂️ {selectedService.name} ({selectedService.totalTime} min)</p>}
              {selectedDate && (
                <p>📅 {format(new Date(selectedDate + 'T12:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              )}
              {selectedTime && <p>🕐 {selectedTime} — {selectedService ? calculateEndTime(selectedTime, selectedService) : ''}</p>}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Booking;
