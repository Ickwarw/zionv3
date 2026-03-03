
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConfiguracoesGerais from './configuracoes/ConfiguracoesGerais';
import ConfiguracoesVoIP from './configuracoes/ConfiguracoesVoIP';
import ConfiguracoesLinguagem from './configuracoes/ConfiguracoesLinguagem';
import ConfiguracoesAparencia from './configuracoes/ConfiguracoesAparencia';
import ConfiguracoesNotificacoes from './configuracoes/ConfiguracoesNotificacoes';
import ConfiguracoesIntegracoes from './configuracoes/ConfiguracoesIntegracoes';
import ConfiguracoesSidebar from './configuracoes/ConfiguracoesSidebar';
import ConfiguracoesAPIs from './configuracoes/ConfiguracoesAPIs';

const Configuracoes = () => {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('geral');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Faça login para acessar as configurações.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'geral':
        return <ConfiguracoesGerais />;
      case 'voip':
        return <ConfiguracoesVoIP />;
      case 'meta-apis':
        return <ConfiguracoesAPIs />;
      case 'linguagem':
        return <ConfiguracoesLinguagem />;
      case 'aparencia':
        return <ConfiguracoesAparencia />;
      case 'notificacoes':
        return <ConfiguracoesNotificacoes />;
      case 'integracao':
        return <ConfiguracoesIntegracoes />;
      default:
        return <ConfiguracoesGerais />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Configurações
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalize e configure seu sistema ZION CRM
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <ConfiguracoesSidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
