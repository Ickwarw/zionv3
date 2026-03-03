
import React from 'react';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

const SummaryCards: React.FC = () => {
  const summaryData = [
    {
      title: 'Total de Vendas',
      value: 'R$ 348.000',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Clientes Ativos',
      value: '1.247',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Taxa Conversão',
      value: '5.8%',
      icon: Target,
      color: 'text-purple-500',
    },
    {
      title: 'ROI Médio',
      value: '285%',
      icon: Award,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {summaryData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{item.title}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
              <Icon className={item.color} size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
