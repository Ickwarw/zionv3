
import React from 'react';
import { StatisticOption } from './ChartData';
import { X, Plus } from 'lucide-react';

interface StatisticSelectorProps {
  statistics: StatisticOption[];
  selectedStatistics: string[];
  onStatisticToggle: (statisticId: string) => void;
  onAddMore: () => void;
}

const StatisticSelector: React.FC<StatisticSelectorProps> = ({
  statistics,
  selectedStatistics,
  onStatisticToggle,
  onAddMore
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Selecione as Estatísticas ({selectedStatistics.length}/6)
        </h3>
        <button
          onClick={onAddMore}
          disabled={selectedStatistics.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          <span>Adicionar Gráfico</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {statistics.map((stat) => {
          const isSelected = selectedStatistics.includes(stat.id);
          const canSelect = selectedStatistics.length < 6 || isSelected;
          
          return (
            <div
              key={stat.id}
              onClick={() => canSelect && onStatisticToggle(stat.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : canSelect
                  ? 'border-gray-200 bg-white hover:border-purple-300 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{stat.name}</h4>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <div 
                  className="w-full h-1 rounded"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticSelector;
