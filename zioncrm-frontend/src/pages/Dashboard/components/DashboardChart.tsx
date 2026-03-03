
import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { X } from 'lucide-react';
import { StatisticOption } from '../data/ChartData';

interface DashboardChartProps {
  id: string;
  modelType: string;
  statistics: StatisticOption[];
  onRemove: (id: string) => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

const DashboardChart = ({ id, modelType, statistics, onRemove }: DashboardChartProps) => {
  if (!statistics || statistics.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Gráfico Vazio</h3>
          <button 
            onClick={() => onRemove(id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Selecione estatísticas para exibir
        </div>
      </div>
    );
  }

  // Combinar dados de todas as estatísticas selecionadas
  const combinedData = statistics[0].data.map((item: any, index: number) => {
    const result: any = { ...item };
    
    statistics.slice(1).forEach(stat => {
      if (stat.data[index]) {
        Object.keys(stat.data[index]).forEach(key => {
          if (key !== Object.keys(item)[0] && typeof stat.data[index][key] === 'number') {
            result[`${stat.name}_${key}`] = Number(stat.data[index][key]);
          }
        });
      }
    });
    
    return result;
  });

  const renderChart = () => {
    const chartHeight = 300;
    
    switch (modelType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(combinedData[0])[0]} />
              <YAxis />
              <Tooltip />
              {Object.keys(combinedData[0]).slice(1).map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(combinedData[0])[0]} />
              <YAxis />
              <Tooltip />
              {Object.keys(combinedData[0]).slice(1).map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = statistics[0].data.map((item: any) => ({
          name: Object.values(item)[0],
          value: Number(Object.values(item)[1])
        }));
        
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(combinedData[0])[0]} />
              <YAxis />
              <Tooltip />
              {Object.keys(combinedData[0]).slice(1).map((key, index) => (
                <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart data={statistics[0].data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="X" />
              <YAxis dataKey="y" name="Y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Dados" data={statistics[0].data} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="h-64 flex items-center justify-center">Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {statistics.map(s => s.name).join(' + ')}
          </h3>
          <p className="text-sm text-gray-600">
            {modelType.charAt(0).toUpperCase() + modelType.slice(1)} Chart
          </p>
        </div>
        <button 
          onClick={() => onRemove(id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      {renderChart()}
    </div>
  );
};

export default DashboardChart;
