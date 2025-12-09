import { create } from 'zustand';
import type { Theme } from '@/types';
import { api } from '@/services/api';

interface ThemeState {
  theme: Theme | null;
  isLoading: boolean;
  fetchTheme: () => Promise<void>;
  updateTheme: (data: Partial<Theme>) => Promise<void>;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: null,
  isLoading: false,

  fetchTheme: async () => {
    set({ isLoading: true });
    try {
      const theme = await api.getTheme();
      set({ theme, isLoading: false });
      get().applyTheme();
    } catch (error) {
      // Ignora erros silenciosamente se não estiver autenticado
      set({ isLoading: false });
    }
  },

  updateTheme: async (data: Partial<Theme>) => {
    try {
      const theme = await api.updateTheme(data);
      set({ theme });
      get().applyTheme();
    } catch (error) {
      throw error;
    }
  },

  applyTheme: () => {
    const { theme } = get();
    if (!theme) return;

    const root = document.documentElement;
    
    // Aplicar cores CSS customizadas
    if (theme.primary_color) {
      root.style.setProperty('--primary', theme.primary_color);
    }
    if (theme.secondary_color) {
      root.style.setProperty('--secondary', theme.secondary_color);
    }
    if (theme.accent_color) {
      root.style.setProperty('--accent', theme.accent_color);
    }
    if (theme.background_color) {
      root.style.setProperty('--background', theme.background_color);
    }
    if (theme.text_color) {
      root.style.setProperty('--foreground', theme.text_color);
    }

    // Aplicar CSS customizado
    if (theme.custom_css) {
      let styleElement = document.getElementById('custom-theme-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-theme-style';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.custom_css;
    }
  },
}));

