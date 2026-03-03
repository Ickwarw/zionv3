import React from 'react';
import KanbanBoard from './KanbanBoard';
import { Tarefa, Task } from '../types/tarefas.types';
import TaskList from './TaskList';

interface TarefasContentProps {
  viewMode: 'kanban' | 'list';
  tarefas: Task[];
  onTaskUpdate: () => void;
  onTaskClick: (tarefa: Task) => void;
  onTaskEditClick: (tarefa: Task) => void;
  onTaskComments: (taskId: number) => void;
  isJuliaActive: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}

const TarefasContent = ({
  viewMode,
  tarefas,
  onTaskUpdate,
  onTaskClick,
  onTaskEditClick,
  isJuliaActive,
  onElementClick,
  onTaskComments
}: TarefasContentProps) => {
  if (viewMode === 'kanban') {
    return (
      <KanbanBoard
        tarefas={tarefas}
        onTaskUpdate={onTaskUpdate}
        onTaskClick={onTaskClick}
        isJuliaActive={isJuliaActive}
        onElementClick={onElementClick}
        onTaskComments={onTaskComments}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Lista de Tarefas</h3>
      {/* Lista tradicional seria implementada aqui se necessário */}
      <TaskList 
        isJuliaActive={isJuliaActive}
        onElementClick={onElementClick}
        onTaskClick={onTaskClick}
        onTaskUpdate={onTaskUpdate}
        onTaskEditClick={onTaskEditClick}
        onTaskComments={onTaskComments}
        taskList={tarefas}
      />
    </div>
  );
};

export default TarefasContent;
