
import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

const SummaryCards = () => {
  const cards = [
    {
      title: 'Vendas Totais',
      value: 'R$ 284.500',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Clientes Ativos',
      value: '1.247',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Pedidos',
      value: '423',
      change: '+15.3%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'purple'
    },
    {
      title: 'Taxa de Conversão',
      value: '3.24%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                <Icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                card.changeType === 'positive' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-red-600 bg-red-50'
              }`}>
                {card.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
