import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  Trash2,
  Plus,
  Download,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  XCircle,
  LogOut,
} from 'lucide-react';
import { useSalonStore } from '@/store/salonStore';
import { useAuthStore } from '@/store/authStore';
import { exportToCSV } from '@/lib/scheduling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Header from '@/components/salon/Header';


const Admin = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const {
    services,
    appointments,
    addService,
    removeService,
    cancelAppointment,
    clearAllAppointments,
  } = useSalonStore();

const setAppointments = useSalonStore((state) => state.setAppointments);

const fetchAppointments = useSalonStore((s) => s.fetchAppointments);
const fetchServices = useSalonStore((s) => s.fetchServices);

useEffect(() => {
  fetchServices();
  fetchAppointments();
}, []);


  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    activeTimeStart: '',
    waitTime: '',
    activeTimeEnd: '',
  });

  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada com sucesso');
    navigate('/'); // Agora redireciona para a página inicial
  };

  const handleAddService = () => {
    if (!newService.name || !newService.activeTimeStart) return;
    addService({
      name: newService.name,
      activeTimeStart: Number(newService.activeTimeStart),
      waitTime: Number(newService.waitTime) || 0,
      activeTimeEnd: Number(newService.activeTimeEnd) || 0,
    });
    setNewService({ name: '', activeTimeStart: '', waitTime: '', activeTimeEnd: '' });
    setShowAddService(false);
    toast.success('Serviço cadastrado!');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(appointments, services);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agendamentos.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado!');
  };

  const handleClearAll = () => {
    clearAllAppointments();
    toast.success('Todos os agendamentos foram removidos');
  };

  const confirmedAppointments = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie serviços e agendamentos
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="mr-2 inline h-4 w-4" />
            Agendamentos ({confirmedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            ✂️ Serviços ({services.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <AlertTriangle className="h-4 w-4" /> Limpar Todos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover TODOS os agendamentos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>
                      Sim, limpar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {confirmedAppointments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">Nenhum agendamento confirmado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedAppointments.map((appt, i) => {
                  const service = services.find((s) => s.id === appt.serviceId);
                  return (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{appt.clientName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ✂️ {service?.name || 'Serviço removido'}
                        </p>
                        <p className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(appt.date + 'T12:00'), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appt.startTime} — {appt.endTime}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          cancelAppointment(appt.id);
                          toast.success('Agendamento cancelado');
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Button
              onClick={() => setShowAddService(!showAddService)}
              className="gap-2 gradient-primary text-primary-foreground border-0"
            >
              <Plus className="h-4 w-4" /> Novo Serviço
            </Button>

            {showAddService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Nome do serviço
                    </label>
                    <Input
                      placeholder="Ex: Coloração"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Tempo ativo inicial (min)
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newService.activeTimeStart}
                      onChange={(e) =>
                        setNewService({ ...newService, activeTimeStart: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Tempo de espera (min)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newService.waitTime}
                      onChange={(e) =>
                        setNewService({ ...newService, waitTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Tempo ativo final (min)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newService.activeTimeEnd}
                      onChange={(e) =>
                        setNewService({ ...newService, activeTimeEnd: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end sm:col-span-2">
                    <Button onClick={handleAddService} className="w-full gradient-primary text-primary-foreground border-0">
                      Cadastrar Serviço
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ativo: {service.activeTimeStart}min
                      {service.waitTime > 0 && ` → Espera: ${service.waitTime}min`}
                      {service.activeTimeEnd > 0 && ` → Ativo: ${service.activeTimeEnd}min`}
                      {' '}= <span className="font-semibold text-primary">{service.totalTime}min total</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeService(service.id);
                      toast.success('Serviço removido');
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;