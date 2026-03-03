
import React from 'react';
import { FileText } from 'lucide-react';
import { FiltroFinanceiro } from '../types/financeiro.types';

interface ReportsSectionProps {
  filtro: FiltroFinanceiro;
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  margemLucro: number;
}

const ReportsSection = ({ 
  filtro, 
  totalReceitas, 
  totalDespesas, 
  lucroLiquido, 
  margemLucro 
}: ReportsSectionProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="text-center py-12">
      <FileText size={64} className="text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatórios Financeiros</h3>
      <p className="text-gray-600 mb-6">
        Relatório do período: {new Date(filtro.dataInicio).toLocaleDateString('pt-BR')} até {new Date(filtro.dataFim).toLocaleDateString('pt-BR')}
      </p>
      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
        <h4 className="font-semibold text-gray-900 mb-4">Resumo do Período</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total de Receitas:</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalReceitas)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total de Despesas:</span>
            <span className="font-semibold text-red-600">{formatCurrency(totalDespesas)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between">
            <span>Lucro Líquido:</span>
            <span className={`font-semibold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucroLiquido)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Margem de Lucro:</span>
            <span className={`font-semibold ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {margemLucro.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
        Gerar Relatório Detalhado
      </button>
    </div>
  );
};

export default ReportsSection;
