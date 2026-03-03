
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard/Dashboard';
import ChatVoip from '../components/ChatVoip';
import CRM from '../components/CRM';
import Financeiro from '../components/Financeiro';
import Estoque from '../components/Estoque';
import Tarefas from './Tarefas/Tarefas';
import Sobre from '../components/Sobre';
import Contato from '../components/Contato';
import Produtos from '../components/Produtos';
import Agenda from '../components/Agenda';
import Leads from '../components/Leads';
import Relatorios from '../components/Relatorios';
import Estatisticas from '../components/EstatisticasOld';
import Assistentes from '../components/Assistentes';
import Grupos from '../components/Grupos';
import Logs from '../components/Logs';
import Configuracoes from '../components/Configuracoes';
import Contas from '@/components/Contas';
import FinancialCategory from '@/components/FinancialCategory';
import Budget from '@/components/Budget';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { currentTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('sobre');

  // Redireciona para dashboard apenas quando faz login pela primeira vez
  useEffect(() => {
    if (isAuthenticated && activeSection === 'sobre') {
      setActiveSection('dashboard');
    } else if (!isAuthenticated && !['sobre', 'contato'].includes(activeSection)) {
      setActiveSection('sobre');
    }
  }, [isAuthenticated]); // Removido activeSection da dependência

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return isAuthenticated ? <Dashboard /> : <Sobre />;
      case 'sobre':
        return <Sobre />; // Sempre mostra a página Sobre quando clicado
      case 'contato':
        return <Contato />;
      case 'produtos':
        return isAuthenticated ? <Produtos /> : <Sobre />;
      case 'agenda':
        return isAuthenticated ? <Agenda /> : <Sobre />;
      case 'financeiro':
        return isAuthenticated ? <Financeiro /> : <Sobre />;
      case 'contas':
        return isAuthenticated ? <Contas /> : <Sobre />;
      case 'categoria-financeira':
        return isAuthenticated ? <FinancialCategory /> : <Sobre />;
      case 'orcamentos':
        return isAuthenticated ? <Budget /> : <Sobre />;
      case 'leads':
        return isAuthenticated ? <Leads /> : <Sobre />;
      case 'chat':
        return isAuthenticated ? <ChatVoip /> : <Sobre />;
      case 'tarefas':
        return isAuthenticated ? <Tarefas /> : <Sobre />;
      case 'relatorios':
        return isAuthenticated ? <Relatorios /> : <Sobre />;
      case 'estatisticas':
        return isAuthenticated ? <Estatisticas /> : <Sobre />;
      case 'assistentes':
        return isAuthenticated ? <Assistentes /> : <Sobre />;
      case 'grupos':
        return isAuthenticated ? <Grupos /> : <Sobre />;
      case 'logs':
        return isAuthenticated ? <Logs /> : <Sobre />;
      case 'configuracoes':
        return isAuthenticated ? <Configuracoes /> : <Sobre />;
      default:
        return <Sobre />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 ml-64 transition-all duration-300">
        {renderSection()}
      </div>
    </div>
  );
};

export default Index;
