
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { ChartModel } from '../data/ChartData';
import { TrendingUp, Users, DollarSign, Package, MessageSquare, Phone, Activity, Calendar, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Target, ShoppingCart, Clock, Award, FileText } from 'lucide-react';

interface ChartModelSelectorProps {
  chartModels: ChartModel[];
  onModelSelect: (model: ChartModel) => void;
}

const iconMap = {
  TrendingUp,
  Users,
  DollarSign,
  Package,
  MessageSquare,
  Phone,
  Activity,
  Calendar,
  BarChart3,
  PieChart: PieChartIcon,
  LineChart: LineChartIcon,
  Target,
  ShoppingCart,
  Clock,
  Award,
  FileText,
};

const ChartModelSelector: React.FC<ChartModelSelectorProps> = ({ chartModels, onModelSelect }) => {
  const renderPreviewChart = (model: ChartModel) => {
    switch (model.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={model.previewData}>
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={model.previewData}>
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie data={model.previewData} dataKey="value" cx="50%" cy="50%" outerRadius={30} fill="#8884d8">
                {model.previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#8B5CF6" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={model.previewData}>
              <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="#FEF3C7" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={80}>
            <ScatterChart data={model.previewData}>
              <Scatter dataKey="y" fill="#EF4444" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chartModels.map((model) => {
        const Icon = iconMap[model.icon as keyof typeof iconMap];
        return (
          <div
            key={model.id}
            onClick={() => onModelSelect(model)}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${model.color}`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{model.name}</h3>
                <p className="text-sm text-gray-600">{model.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              {renderPreviewChart(model)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChartModelSelector;
