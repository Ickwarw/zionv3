
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, Calendar, Users, ShoppingCart, Briefcase, PieChart, BarChart3, TrendingUp as Growth } from 'lucide-react';

interface FinancialStatsProps {
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  margemLucro: number;
  onStatClick: (tab: string) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const FinancialStats = ({
  totalReceitas,
  totalDespesas,
  lucroLiquido,
  margemLucro,
  onStatClick,
  onElementClick,
  isJuliaActive
}: FinancialStatsProps) => {
  const financialStats = [
    { 
      label: 'Receitas do Período', 
      value: `R$ ${totalReceitas.toLocaleString('pt-BR')}`, 
      change: '+12%', 
      type: 'positive' as const,
      icon: TrendingUp,
      onClick: () => onStatClick('receitas')
    },
    { 
      label: 'Despesas do Período', 
      value: `R$ ${totalDespesas.toLocaleString('pt-BR')}`, 
      change: '+5%', 
      type: 'negative' as const,
      icon: TrendingDown,
      onClick: () => onStatClick('despesas')
    },
    { 
      label: 'Lucro Líquido', 
      value: `R$ ${lucroLiquido.toLocaleString('pt-BR')}`, 
      change: '+18%', 
      type: 'positive' as const,
      icon: DollarSign,
      onClick: () => onStatClick('relatorios')
    },
    { 
      label: 'Margem de Lucro', 
      value: `${margemLucro.toFixed(1)}%`, 
      change: '+2.1%', 
      type: 'positive' as const,
      icon: Target,
      onClick: () => onStatClick('relatorios')
    },
    { 
      label: 'Contas a Receber', 
      value: 'R$ 45.200', 
      change: '+8%', 
      type: 'positive' as const,
      icon: CreditCard,
      onClick: () => onStatClick('receitas')
    },
    { 
      label: 'Contas a Pagar', 
      value: 'R$ 18.900', 
      change: '-3%', 
      type: 'positive' as const,
      icon: Calendar,
      onClick: () => onStatClick('despesas')
    },
    { 
      label: 'Faturamento Mensal', 
      value: 'R$ 89.500', 
      change: '+15%', 
      type: 'positive' as const,
      icon: BarChart3,
      onClick: () => onStatClick('receitas')
    },
    { 
      label: 'Ticket Médio', 
      value: 'R$ 3.250', 
      change: '+7%', 
      type: 'positive' as const,
      icon: Users,
      onClick: () => onStatClick('relatorios')
    },
    { 
      label: 'Vendas do Mês', 
      value: 'R$ 72.800', 
      change: '+22%', 
      type: 'positive' as const,
      icon: ShoppingCart,
      onClick: () => onStatClick('receitas')
    },
    { 
      label: 'ROI Campanhas', 
      value: '285%', 
      change: '+45%', 
      type: 'positive' as const,
      icon: Growth,
      onClick: () => onStatClick('relatorios')
    },
    { 
      label: 'Fluxo de Caixa', 
      value: 'R$ 156.300', 
      change: '+11%', 
      type: 'positive' as const,
      icon: Briefcase,
      onClick: () => onStatClick('relatorios')
    },
    { 
      label: 'Inadimplência', 
      value: '2.8%', 
      change: '-1.2%', 
      type: 'positive' as const,
      icon: PieChart,
      onClick: () => onStatClick('despesas')
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {financialStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            onClick={() => {
              stat.onClick();
              onElementClick({} as any, `Visualizando detalhes de ${stat.label}: ${stat.value}`);
            }}
            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${
                  stat.type === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} vs período anterior
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                stat.type === 'positive' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialStats;
