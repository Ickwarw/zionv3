
import React from 'react';
import KanbanBoard from './KanbanBoard';
import { Tarefa } from '../types/tarefas.types';

interface TarefasContentProps {
  viewMode: 'kanban' | 'list';
  tarefas: Tarefa[];
  onTaskUpdate: (taskId: number, newStatus: string) => void;
  onTaskClick: (tarefa: Tarefa) => void;
  isJuliaActive: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}

const TarefasContent = ({
  viewMode,
  tarefas,
  onTaskUpdate,
  onTaskClick,
  isJuliaActive,
  onElementClick
}: TarefasContentProps) => {
  if (viewMode === 'kanban') {
    return (
      <KanbanBoard
        tarefas={tarefas}
        onTaskUpdate={onTaskUpdate}
        onTaskClick={onTaskClick}
        isJuliaActive={isJuliaActive}
        onElementClick={onElementClick}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Lista de Tarefas</h3>
      {/* Lista tradicional seria implementada aqui se necessário */}
    </div>
  );
};

export default TarefasContent;
