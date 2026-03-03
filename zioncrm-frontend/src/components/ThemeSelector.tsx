
import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <div className="relative group">
      <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all duration-300">
        <Palette size={20} />
        <span className="font-medium">Tema</span>
      </button>
      
      <div className="absolute left-full ml-2 -top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 min-w-48">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Escolher Tema</h4>
        <div className="space-y-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                currentTheme === theme.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-sm">{theme.name}</span>
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
