
import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity, Users, DollarSign } from 'lucide-react';

const GraficosInterativos = () => {
  const [tipoGrafico, setTipoGrafico] = useState('vendas');
  const [periodoAnalise, setPeriodoAnalise] = useState('mensal');

  const graficos = [
    { id: 'vendas', nome: 'Vendas por Período', icon: DollarSign, cor: 'bg-green-500' },
    { id: 'leads', nome: 'Conversão de Leads', icon: Users, cor: 'bg-blue-500' },
    { id: 'tarefas', nome: 'Produtividade', icon: Activity, cor: 'bg-purple-500' },
    { id: 'financeiro', nome: 'Fluxo de Caixa', icon: TrendingUp, cor: 'bg-orange-500' }
  ];

  const gerarAnaliseIA = () => {
    const analises = {
      vendas: "A IA analisou que suas vendas cresceram 23% este mês. Recomenda-se focar nos produtos com maior margem de lucro.",
      leads: "Taxa de conversão está em 18.5%, acima da média do setor. Continue investindo em leads quentes.",
      tarefas: "Produtividade da equipe aumentou 15%. Tarefas agendadas têm 90% de conclusão no prazo.",
      financeiro: "Fluxo de caixa positivo. Receita recorrente representa 67% do total mensal."
    };
    
    return analises[tipoGrafico as keyof typeof analises];
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Análise Inteligente por IA</h2>
        <div className="flex space-x-2">
          <select
            value={periodoAnalise}
            onChange={(e) => setPeriodoAnalise(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {graficos.map((grafico) => (
          <button
            key={grafico.id}
            onClick={() => setTipoGrafico(grafico.id)}
            className={`p-4 rounded-xl transition-all duration-300 ${
              tipoGrafico === grafico.id
                ? `${grafico.cor} text-white shadow-lg scale-105`
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <grafico.icon size={24} className="mx-auto mb-2" />
            <p className="text-sm font-medium">{grafico.nome}</p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900">Gráfico - {graficos.find(g => g.id === tipoGrafico)?.nome}</h3>
        </div>
        <div className="h-64 bg-white rounded-lg flex items-center justify-center border border-gray-200">
          <p className="text-gray-500">Gráfico Interativo - {graficos.find(g => g.id === tipoGrafico)?.nome}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900">Análise da IA</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">
          {gerarAnaliseIA()}
        </p>
        <div className="flex space-x-2 mt-4">
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors">
            Ver Detalhes
          </button>
          <button className="bg-white text-purple-600 border border-purple-300 px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
            Exportar Análise
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraficosInterativos;
