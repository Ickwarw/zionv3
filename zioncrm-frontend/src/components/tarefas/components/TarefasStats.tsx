
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Tarefa } from '../types/tarefas.types';

interface TarefasStatsProps {
  tarefas: Tarefa[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const TarefasStats = ({ 
  tarefas, 
  activeTab, 
  setActiveTab, 
  onElementClick, 
  isJuliaActive 
}: TarefasStatsProps) => {
  const tarefaStats = [
    { label: 'Total de Tarefas', value: tarefas.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aberta', value: tarefas.filter(t => t.status === 'aberta').length, color: 'from-gray-500 to-gray-600' },
    { label: 'Pendentes', value: tarefas.filter(t => t.status === 'pendente').length, color: 'from-yellow-500 to-orange-500' },
    { label: 'Em Andamento', value: tarefas.filter(t => t.status === 'em_andamento').length, color: 'from-orange-500 to-red-500' },
    { label: 'Em Execução', value: tarefas.filter(t => t.status === 'em_execucao').length, color: 'from-indigo-500 to-purple-500' },
    { label: 'Agendadas', value: tarefas.filter(t => t.status === 'agendada').length, color: 'from-purple-500 to-pink-500' },
    { label: 'Finalizadas', value: tarefas.filter(t => t.status === 'finalizada').length, color: 'from-green-500 to-emerald-500' },
    { label: 'Reabertas', value: tarefas.filter(t => t.status === 'reaberta').length, color: 'from-red-500 to-red-600' }
  ];

  return (
    <div 
      onClick={(e) => onElementClick(e, "Aqui você pode ver um resumo das suas tarefas organizadas por status!")}
      className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
    >
      {tarefaStats.map((stat, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(stat.label.toLowerCase().replace(' ', '_').replace('é', 'e'))}
          className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left ${
            activeTab === stat.label.toLowerCase().replace(' ', '_').replace('é', 'e') ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TarefasStats;
