
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LeadsSearchProps {
  currentLeadsCount: number;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  search: string;
  setSearch: (value: string) => void;
}

  
const LeadsSearch = ({ currentLeadsCount, onElementClick, isJuliaActive, search,  setSearch}: LeadsSearchProps) => {
  return (
    <div 
      onClick={(e) => onElementClick(e, "Use estes filtros para buscar e organizar seus leads de forma mais eficiente!")}
      className={`flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6 ${isJuliaActive ? 'cursor-help' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar leads..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        {/* <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} />
          <span>Filtros</span>
        </button> */}
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium">Total de {currentLeadsCount} Leads</span>
      </div>
    </div>
  );
};

export default LeadsSearch;
