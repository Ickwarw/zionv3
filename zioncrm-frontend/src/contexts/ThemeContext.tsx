
import { confService } from '@/components/configuracoes/service/confService';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { configService } from '@/services/api';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  themes: { id: string; name: string; gradient: string; colors: any }[];
}

const themes = [
  {
    id: 'roxo-rosa',
    name: 'Roxo/Rosa',
    gradient: 'from-purple-500 to-pink-500',
    colors: {
      primary: '#7c3aed',
      secondary: '#e11d48',
      accent: '#ec4899',
      background: '#ffffff',
      card: '#f8fafc',
      text: '#1e293b',
      border: '#e2e8f0',
      muted: '#f1f5f9',
      inputback: '#ffffff',
      inputtext: '#1e293b'
    }
  },
  {
    id: 'azul-ciano',
    name: 'Azul/Ciano',
    gradient: 'from-blue-500 to-cyan-500',
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#0ea5e9',
      background: '#f8fafc',
      card: '#eff6ff',
      text: '#1e3a8a',
      border: '#bfdbfe',
      muted: '#dbeafe',
      inputback: '#f8fafc',
      inputtext: '#1e3a8a'
    }
  },
  {
    id: 'verde-teal',
    name: 'Verde/Teal',
    gradient: 'from-green-500 to-teal-500',
    colors: {
      primary: '#10b981',
      secondary: '#14b8a6',
      accent: '#34d399',
      background: '#f0fdf4',
      card: '#dcfce7',
      text: '#064e3b',
      border: '#bbf7d0',
      muted: '#f0fdf4',
      inputback: '#f0fdf4',
      inputtext: '#064e3b'
    }
  },
  {
    id: 'escuro',
    name: 'Escuro',
    gradient: 'from-gray-700 to-gray-900',
    colors: {
      primary: '#6b7280',
      secondary: '#374151',
      accent: '#9ca3af',
      background: '#111827',
      card: '#1f2937',
      text: '#f9fafb',
      border: '#374151',
      muted: '#374151',
      inputback: '#6b7280',
      inputtext: '#f9fafb'
    }
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);



export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [confThemeId, setConfThemeId]  = useState(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // return localStorage.getItem('zion-theme') || 'roxo-rosa';
    return localStorage.getItem('zion-theme') || 'roxo-rosa';
  });

  const {
    handleSaveConfig
  } = confService();


  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('zion-theme', themeId);
    // handleSaveConfig(confThemeId, 'appearance.zion-theme', themeId);
    
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      // Aplicar variáveis CSS customizadas
      const root = document.documentElement;
      
      // Cores do tema personalizado
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-card', theme.colors.card);
      root.style.setProperty('--theme-text', theme.colors.text);
      root.style.setProperty('--theme-border', theme.colors.border);
      root.style.setProperty('--theme-muted', theme.colors.muted);
      root.style.setProperty('--theme-inputback', theme.colors.inputback);
      root.style.setProperty('--theme-inputtext', theme.colors.inputtext);

      // Aplicar ao body para mudança imediata
      document.body.style.backgroundColor = theme.colors.background;
      document.body.style.color = theme.colors.text;

      // Aplicar classe do tema
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${themeId}`);
    }
  };

  // Aplicar tema inicial
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getConf();
    }
  }, []);

  const getConf = async () => {
    try {
      const response = await configService.getConfigsByGroup("appearance");
      if (response.status == 200) {
          response.data.configs.map((conf) => {
            if (conf.key == "appearance.zion-theme") {
              setTheme(conf.value);
              setConfThemeId(conf.id);
            }
          });
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as configurações", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as configurações", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Week Config:', error);
        showErrorAlert('Erro ao carregar as configurações', formatAxiosError(error));
    }
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
