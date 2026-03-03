
import React, { useEffect, useState } from 'react';
import { ChartSpline, CheckCircle, CheckSquare } from 'lucide-react';
import { Tarefa } from '../types/tarefas.types';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { getTextColorForBackground } from '@/lib/utils';

interface TarefasStatsProps {
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const TarefasStats = ({ 
  onElementClick, 
  isJuliaActive 
}: TarefasStatsProps) => {
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [tasksByStatus, setTasksByStatus] = useState([]);
  const [tasksByPriority, setTasksByPriority] = useState([]);

  // const tarefaStats = [
  //   { label: 'Total de Tarefas', value: tarefas.length, color: 'from-blue-500 to-cyan-500' },
  //   { label: 'Aberta', value: tarefas.filter(t => t.status === 'aberta').length, color: 'from-gray-500 to-gray-600' },
  //   { label: 'Pendentes', value: tarefas.filter(t => t.status === 'pendente').length, color: 'from-yellow-500 to-orange-500' },
  //   { label: 'Em Andamento', value: tarefas.filter(t => t.status === 'em_andamento').length, color: 'from-orange-500 to-red-500' },
  //   { label: 'Em Execução', value: tarefas.filter(t => t.status === 'em_execucao').length, color: 'from-indigo-500 to-purple-500' },
  //   { label: 'Agendadas', value: tarefas.filter(t => t.status === 'agendada').length, color: 'from-purple-500 to-pink-500' },
  //   { label: 'Finalizadas', value: tarefas.filter(t => t.status === 'finalizada').length, color: 'from-green-500 to-emerald-500' },
  //   { label: 'Reabertas', value: tarefas.filter(t => t.status === 'reaberta').length, color: 'from-red-500 to-red-600' }
  // ];

  const fetchStatistics = async () => {
    try {
      const response = await tasksService.getTaskStatistics();
      if (response.status == 200 || response.status == 201) {
        setTotalTasks(response.data.total_tasks);
        setCompletedTasks(response.data.completed_tasks);
        setOverdueTasks(response.data.overdue_tasks);
        setCompletionRate(response.data.completion_rate);
        setTasksByStatus(response.data.tasks_by_status);
        setTasksByPriority(response.data.tasks_by_priority);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar as Estatísticas", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar as Estatísticas", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Statistics:', error);
        showErrorAlert('Erro ao buscar as Estatísticas', formatAxiosError(error));
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const getTagStyles = (bgColor) => {
    const tagStyle = {
      color: getTextColorForBackground(bgColor),
      backgroundColor: `${bgColor}`
    };
    return tagStyle;
  }

  return (
    <div className="space-y-4">
      <h3>Estatísticas de Tarefas</h3>
      <div 
        onClick={(e) => onElementClick(e, "Aqui você pode ver um resumo estatístico das tarefas!")}
        className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Tarefas</p>
              <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">
                <CheckSquare size={20} className="text-blue-600" />
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarefas Completadas</p>
              <p className="text-xl font-bold text-green-600">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 font-bold">
                <CheckSquare size={20} className="text-blue-600" />
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarefas atrasadas</p>
              <p className="text-xl font-bold text-yellow-600">{overdueTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 font-bold">
                <CheckSquare size={20} className="text-blue-600" />
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de conclusão</p>
              <p className="text-xl font-bold text-red-600">{completionRate}</p>
            </div>
          </div>
        </div>
      </div>
      <h3>Tarefas por Status</h3>
      <div 
        onClick={(e) => onElementClick(e, "Aqui você pode ver um resumo estatístico de tarefas por Status!")}
        className={`grid grid-cols-1 md:grid-cols-8 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        
        {tasksByStatus?.length
          ? tasksByStatus.map((item) => (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div style={getTagStyles(item.color)} className={`p-2 rounded-lg bg-gradient-to-r`}>
                  <CheckCircle size={16}/>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.name}</p>
                  <p className="text-xl font-bold text-gray-900">{item.count}</p>
                </div>
              </div>
            </div>
          ))
          : <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChartSpline size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não há Estatísticas por Status</p>
                  <p className="text-xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
        }
      </div>
      <h3>Tarefas por Prioridade</h3>
      <div 
        onClick={(e) => onElementClick(e, "Aqui você pode ver um resumo estatístico dos tarefas por Prioridade!")}
        className={`grid grid-cols-1 md:grid-cols-6 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        
        {tasksByPriority?.length
          ? tasksByPriority.map((item) => (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div style={getTagStyles(item.color)} className={`p-2 rounded-lg bg-gradient-to-r`}>
                  <CheckCircle size={16}/>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.name}</p>
                  <p className="text-xl font-bold text-gray-900">{item.count}</p>
                </div>
              </div>
            </div>
          ))
          : <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChartSpline size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não há Estatísticas por PRioridade</p>
                  <p className="text-xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
        }
      </div>
    </div>


    // <div 
    //   onClick={(e) => onElementClick(e, "Aqui você pode ver um resumo das suas tarefas organizadas por status!")}
    //   className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 ${isJuliaActive ? 'cursor-help' : ''}`}
    // >
    //   {tarefaStats.map((stat, index) => (
    //     <button
    //       key={index}
    //       onClick={() => setActiveTab(stat.label.toLowerCase().replace(' ', '_').replace('é', 'e'))}
    //       className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left ${
    //         activeTab === stat.label.toLowerCase().replace(' ', '_').replace('é', 'e') ? 'ring-2 ring-purple-500' : ''
    //       }`}
    //     >
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
    //           <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
    //         </div>
    //         <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
    //           <CheckCircle size={16} className="text-white" />
    //         </div>
    //       </div>
    //     </button>
    //   ))}
    // </div>
  );
};

export default TarefasStats;
