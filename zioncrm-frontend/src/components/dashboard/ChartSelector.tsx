
import React from 'react';
import { TrendingUp, Users, DollarSign, Package, MessageSquare, Phone, Activity, Calendar, BarChart3, PieChart, LineChart, Target, ShoppingCart, Clock, Award, FileText } from 'lucide-react';

interface ChartOption {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface ChartSelectorProps {
  chartOptions: ChartOption[];
  selectedChart: string;
  onChartSelect: (chartId: string) => void;
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
  PieChart,
  LineChart,
  Target,
  ShoppingCart,
  Clock,
  Award,
  FileText,
};

const ChartSelector: React.FC<ChartSelectorProps> = ({ chartOptions, selectedChart, onChartSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {chartOptions.map((chart) => {
        const Icon = iconMap[chart.icon as keyof typeof iconMap];
        const isSelected = selectedChart === chart.id;
        return (
          <div
            key={chart.id}
            onClick={() => onChartSelect(chart.id)}
            className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:shadow-lg ${
              isSelected 
                ? 'bg-gradient-to-r ' + chart.color + ' text-white shadow-lg scale-105' 
                : 'bg-white hover:bg-gray-50 shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <Icon size={20} className={isSelected ? 'text-white' : 'text-purple-600'} />
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${
                  isSelected ? 'text-white' : 'text-gray-900'
                }`}>
                  {chart.title}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChartSelector;
