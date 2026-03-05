
import React from 'react';
import { Progress } from '../../ui/progress';

interface DetailedProgressBarProps {
  activeTab: 'marketing' | 'vendas' | 'posvenda';
  selectedStatus: string | null;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: 'marketing' | 'vendas' | 'posvenda') => void;
}

const DetailedProgressBar = ({ activeTab, selectedStatus, onStatusClick, onTabChange }: DetailedProgressBarProps) => {
  const marketingSteps = [
    { id: 'Ruim', label: 'Ruim', color: 'bg-red-500' },
    { id: 'Fria', label: 'Fria', color: 'bg-blue-400' },
    { id: 'Morna', label: 'Morna', color: 'bg-yellow-400' },
    { id: 'Quente', label: 'Quente', color: 'bg-orange-500' },
    { id: 'MuitoQuente', label: 'Muito Quente', color: 'bg-red-400' },
    { id: 'Queimando', label: 'Queimando', color: 'bg-red-600' }
  ];

  const vendasSteps = [
    { id: 'PerdasLeadsRuins', label: 'Perdas Ruins', color: 'bg-gray-500' },
    { id: 'PerdasLeadsFrias', label: 'Perdas Frias', color: 'bg-gray-400' },
    { id: 'PerdasLeadsMornas', label: 'Perdas Mornas', color: 'bg-gray-600' },
    { id: 'PerdasLeadsQuentes', label: 'Perdas Quentes', color: 'bg-gray-700' },
    { id: 'PerdasLeadsMuitoQuentes', label: 'Perdas M. Quentes', color: 'bg-gray-800' },
    { id: 'PerdasLeadsQueimando', label: 'Perdas Queimando', color: 'bg-black' },
    { id: 'Recuperadas', label: 'Recuperadas', color: 'bg-green-400' },
    { id: 'Recuperar', label: 'Recuperar', color: 'bg-yellow-500' },
    { id: 'Fidelizado', label: 'Fidelizado', color: 'bg-green-600' }
  ];

  const posvendaSteps = [
    { id: 'AcompanhamentoPersonalizado', label: 'Acomp. Personalizado', color: 'bg-purple-400' },
    { id: 'TreinamentoSuporte', label: 'Treinamento/Suporte', color: 'bg-purple-500' },
    { id: 'ProgramasDeFidelidade', label: 'Prog. Fidelidade', color: 'bg-purple-600' },
    { id: 'AcoesDeAgradecimento', label: 'Ações Agradecimento', color: 'bg-pink-400' },
    { id: 'AnaliseDeUsoEFeedback', label: 'Análise/Feedback', color: 'bg-pink-500' },
    { id: 'AtivasSatisfeitas', label: 'Ativas Satisfeitas', color: 'bg-green-500' },
    { id: 'AtivasInsatisfeitas', label: 'Ativas Insatisfeitas', color: 'bg-red-500' },
    { id: 'RecuperarSatisfacao', label: 'Recuperar Satisfação', color: 'bg-yellow-600' },
    { id: 'UpsellCrossSell', label: 'Upsell/Cross-sell', color: 'bg-indigo-500' },
    { id: 'AtendimentoRapido', label: 'Atendimento Rápido', color: 'bg-teal-500' },
    { id: 'RelacionamentoDeLongoPrazo', label: 'Relacionamento L. Prazo', color: 'bg-emerald-600' }
  ];

  const getCurrentSteps = () => {
    switch (activeTab) {
      case 'marketing': return marketingSteps;
      case 'vendas': return vendasSteps;
      case 'posvenda': return posvendaSteps;
      default: return marketingSteps;
    }
  };

  const currentSteps = getCurrentSteps();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil Detalhado de Leads</h3>
      
      {/* Tab Selector */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => onTabChange('marketing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'marketing' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Marketing ({marketingSteps.length} etapas)
        </button>
        <button
          onClick={() => onTabChange('vendas')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'vendas' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vendas ({vendasSteps.length} etapas)
        </button>
        <button
          onClick={() => onTabChange('posvenda')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'posvenda' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pós-vendas ({posvendaSteps.length} etapas)
        </button>
      </div>

      {/* Detailed Progress Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {currentSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStatusClick(step.id)}
            className={`p-3 rounded-lg text-center transition-all duration-300 border-2 ${
              selectedStatus === step.id
                ? `${step.color} text-white border-gray-800 shadow-lg scale-105`
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
              selectedStatus === step.id ? 'bg-white text-gray-800' : step.color + ' text-white'
            }`}>
              {index + 1}
            </div>
            <div className="text-xs font-medium leading-tight">{step.label}</div>
          </button>
        ))}
      </div>

      {/* Reset Filter Button */}
      {selectedStatus && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onStatusClick('')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Mostrar Todos os Status
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedProgressBar;
