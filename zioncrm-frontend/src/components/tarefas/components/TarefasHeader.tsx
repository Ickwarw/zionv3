
import React from 'react';
import { Plus, Search } from 'lucide-react';

interface TarefasHeaderProps {
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
  onNovaTarefa: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const TarefasHeader = ({ 
  viewMode, 
  setViewMode, 
  onNovaTarefa, 
  onElementClick, 
  isJuliaActive 
}: TarefasHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div
        onClick={(e) => onElementClick(e, "Esta é a seção de Tarefas onde você pode gerenciar todas as suas atividades em formato Kanban!")}
        className={isJuliaActive ? 'cursor-help' : ''}
      >
        <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
        <p className="text-gray-600 mt-1">Gerencie suas tarefas em formato Kanban</p>
      </div>
      <div className="flex space-x-3">
        <button 
          onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {viewMode === 'kanban' ? 'Lista' : 'Kanban'}
        </button>
        <button 
          onClick={(e) => onElementClick(e, "Use este botão para buscar tarefas específicas!")}
          className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <Search size={18} />
          <span>Buscar</span>
        </button>
        <button 
          onClick={onNovaTarefa}
          className={`flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </button>
      </div>
    </div>
  );
};

export default TarefasHeader;
