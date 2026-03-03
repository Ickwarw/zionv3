
import { useState } from 'react';
import { Tarefa } from '../types/tarefas.types';

export const useTarefasMain = () => {
  const [activeTab, setActiveTab] = useState('todas');
  const [showNovaTarefa, setShowNovaTarefa] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const handleTaskClick = (tarefa: Tarefa) => {
    setSelectedTask(tarefa);
  };

  const handleNovaTarefaClick = () => {
    setShowNovaTarefa(true);
  };

  const handleCloseNovaTarefa = () => {
    setShowNovaTarefa(false);
  };

  return {
    activeTab,
    setActiveTab,
    showNovaTarefa,
    setShowNovaTarefa,
    selectedTask,
    setSelectedTask,
    viewMode,
    setViewMode,
    handleTaskClick,
    handleNovaTarefaClick,
    handleCloseNovaTarefa
  };
};
