
import React from 'react';
import { Settings, User, Phone, Palette, Globe, Bell, Shield, Database, Plug } from 'lucide-react';

interface ConfiguracoesSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ConfiguracoesSidebar = ({ activeSection, setActiveSection }: ConfiguracoesSidebarProps) => {
  const menuItems = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'voip', label: 'VoIP', icon: Phone },
    { id: 'meta-apis', label: 'APIs', icon: Plug },
    // { id: 'linguagem', label: 'Linguagem', icon: Globe },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'integracao', label: 'Integrações', icon: Database }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-fit">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ConfiguracoesSidebar;
