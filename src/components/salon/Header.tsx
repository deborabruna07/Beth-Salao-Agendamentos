import { Link, useLocation } from 'react-router-dom';
import { Scissors, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore'; // Importação do store de autenticação

const Header = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout); // Hook para logout
  const isAdminPage = location.pathname === '/admin';

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Ao clicar no logo para voltar à home, chamamos o logout para resetar a sessão */}
        <Link 
          to="/" 
          onClick={() => logout()} 
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            Beth Salão
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {/* O Agendar só aparece se NÃO for a página administrativa */}
          {!isAdminPage && (
            <Link
              to="/agendar"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/agendar')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar</span>
            </Link>
          )}

          <Link
            to="/admin"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;