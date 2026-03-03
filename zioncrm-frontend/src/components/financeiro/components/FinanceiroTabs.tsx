
import React from 'react';
import { TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface FinanceiroTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  receitasCount: number;
  despesasCount: number;
}

const FinanceiroTabs = ({ activeTab, setActiveTab, receitasCount, despesasCount }: FinanceiroTabsProps) => {
  const tabs = [
    { id: 'receitas', label: 'Receitas', icon: TrendingUp, count: receitasCount },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown, count: despesasCount },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, count: 0 }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FinanceiroTabs;
