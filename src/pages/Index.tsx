import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Scissors, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/salon/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm" />
        <div className="container relative mx-auto px-4 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary shadow-soft"
            >
              <Scissors className="h-10 w-10 text-primary-foreground" />
            </motion.div>

            <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Realce sua beleza no seu {' '}
              <span className="text-primary">tempo e agende o seu momento.</span>
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Escolha seu serviço favorito e agende um horário em poucos 
              segundos. Sua melhor versão espera por você.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/agendar">
                <Button size="lg" className="gap-2 gradient-primary text-primary-foreground border-0 px-8 shadow-soft">
                  <Calendar className="h-5 w-5" />
                  Agendar Horário
                </Button>
              </Link>
              
              {/* Este link será interceptado pelo PrivateRoute no App.tsx */}
              <Link to="/admin">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  Painel Admin
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Clock,
              title: 'Sua Hora, Suas Regras',
              description: 'Agende o seu horário conosco onde estiver.',
            },
            {
              icon: Calendar,
              title: 'Agenda Dinâmica',
              description: 'Visualize apenas horários disponíveis, sem conflitos.',
            },
            {
              icon: Sparkles,
              title: 'Lembretes Automáticos',
              description: 'Você recebe um aviso antes do seu horário para não esquecer.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-soft"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          SGA — Desenvolvido por{' '}
          <span className="font-medium text-foreground">Débora Bruna</span>
        </p>
      </footer>
    </div>
  );
};

export default Index;