
import { useState } from 'react';
import { Tarefa } from '../types/tarefas.types';

export const useTarefas = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    {
      id: 1,
      title: 'Ligar para João Silva',
      description: 'Follow-up da proposta enviada na semana passada para análise do CRM Enterprise',
      priority: 'Alta',
      status: 'aberta',
      dueDate: '2024-01-16',
      assignee: 'Kelly',
      category: 'Vendas',
      setor: 'Comercial',
      criadoPor: 'Erivaldo',
      leadVinculada: 'João Silva'
    },
    {
      id: 2,
      title: 'Preparar apresentação Q1',
      description: 'Criar slides com resultados do primeiro trimestre e métricas de performance',
      priority: 'Média',
      status: 'em_andamento',
      dueDate: '2024-01-18',
      assignee: 'Rodolfo',
      category: 'Gestão',
      setor: 'Administração',
      criadoPor: 'Ione'
    },
    {
      id: 3,
      title: 'Atualizar site da empresa',
      description: 'Revisar conteúdo e adicionar novos produtos ao catálogo online',
      priority: 'Baixa',
      status: 'finalizada',
      dueDate: '2024-01-15',
      assignee: 'Ivonete',
      category: 'Marketing',
      setor: 'Marketing',
      criadoPor: 'Kelly'
    },
    {
      id: 4,
      title: 'Revisar contratos pendentes',
      description: 'Análise jurídica dos contratos em negociação com novos clientes',
      priority: 'Alta',
      status: 'pendente',
      dueDate: '2024-01-17',
      assignee: 'Erivaldo',
      category: 'Jurídico',
      setor: 'Jurídico',
      criadoPor: 'Rodolfo'
    },
    {
      id: 5,
      title: 'Treinamento equipe CRM',
      description: 'Sessão de treinamento para novos recursos do sistema',
      priority: 'Média',
      status: 'agendada',
      dueDate: '2024-01-20',
      assignee: 'Ione',
      category: 'Treinamento',
      setor: 'RH',
      criadoPor: 'Ivonete',
      dataAgendamento: '2024-01-20',
      horaAgendamento: '14:00'
    },
    {
      id: 6,
      title: 'Suporte técnico - Carla Mendes',
      description: 'Resolver problema de integração no sistema da startup',
      priority: 'Alta',
      status: 'em_execucao',
      dueDate: '2024-01-16',
      assignee: 'Rodolfo',
      category: 'Suporte',
      setor: 'TI',
      criadoPor: 'Kelly',
      leadVinculada: 'Carla Mendes'
    }
  ]);

  const handleNovaTarefa = (novaTarefa: Omit<Tarefa, 'id'>) => {
    const newId = Math.max(...tarefas.map(t => t.id)) + 1;
    setTarefas(prev => [...prev, { ...novaTarefa, id: newId }]);
  };

  const handleTaskUpdate = (taskId: number, newStatus: string) => {
    setTarefas(prev => prev.map(tarefa => 
      tarefa.id === taskId ? { ...tarefa, status: newStatus as any } : tarefa
    ));
  };

  const filterTarefas = (activeTab: string) => {
    switch (activeTab) {
      case 'aberta':
        return tarefas.filter(t => t.status === 'aberta');
      case 'encaminhada':
        return tarefas.filter(t => t.status === 'encaminhada');
      case 'agendada':
        return tarefas.filter(t => t.status === 'agendada');
      case 'pendente':
        return tarefas.filter(t => t.status === 'pendente');
      case 'em_andamento':
        return tarefas.filter(t => t.status === 'em_andamento');
      case 'em_execucao':
        return tarefas.filter(t => t.status === 'em_execucao');
      case 'reaberta':
        return tarefas.filter(t => t.status === 'reaberta');
      case 'finalizada':
        return tarefas.filter(t => t.status === 'finalizada');
      default:
        return tarefas;
    }
  };

  return {
    tarefas,
    handleNovaTarefa,
    handleTaskUpdate,
    filterTarefas
  };
};
