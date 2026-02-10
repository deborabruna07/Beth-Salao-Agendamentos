// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// REMOVA o middleware 'persist' e 'sessionStorage'
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // Sempre começa como falso ao carregar o site
  login: (password: string) => {
    // Substitua pela sua senha real
    if (password === 'salao54321') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
}));