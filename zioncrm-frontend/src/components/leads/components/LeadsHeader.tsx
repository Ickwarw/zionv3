
import React from 'react';
import { Filter, Plus } from 'lucide-react';

interface LeadsHeaderProps {
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
  onNewLead: () => void;
  setShowFilter: (show: boolean) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const LeadsHeader = ({ viewMode, setViewMode, setShowFilter, onNewLead, onElementClick, isJuliaActive }: LeadsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div
        onClick={(e) => onElementClick(e, "Esta é a seção de Leads onde você pode gerenciar todos os seus leads!")}
        className={isJuliaActive ? 'cursor-help' : ''}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Leads
        </h1>
        <p className="text-gray-600 mt-1">Gerencie todos os seus leads</p>
      </div>
      <div className="flex space-x-3">
        <button 
          onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          title="Mudar a visão entre Kanban e Tabela"
          className="flex items-end space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {viewMode === 'kanban' ? 'Kanban' : 'Lista'}
        </button>
        <button 
          onClick={(e) => {
            if (isJuliaActive) {
              onElementClick(e, "Use este botão para buscar Leads específicas!")
            } else {
              setShowFilter(true);
            }
          }}
          className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <Filter size={20} />
          <span>Filtrar</span>
        </button>
        <button 
          onClick={onNewLead}
          className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <Plus size={20} />
          <span>Novo Lead</span>
        </button>
      </div>
    </div>
  );
};

export default LeadsHeader;
