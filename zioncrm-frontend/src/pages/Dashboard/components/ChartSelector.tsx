
import React from 'react';

interface ChartSelectorProps {
  selectedChart: string;
  onChartChange: (chart: string) => void;
}

const ChartSelector = ({ selectedChart, onChartChange }: ChartSelectorProps) => {
  const chartOptions = [
    { value: 'vendas', label: 'Vendas' },
    { value: 'leads', label: 'Leads' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'produtos', label: 'Produtos' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Categoria
      </label>
      <select
        value={selectedChart}
        onChange={(e) => onChartChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
      >
        {chartOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChartSelector;
