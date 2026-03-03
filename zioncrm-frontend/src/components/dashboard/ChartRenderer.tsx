import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie, ScatterChart, Scatter } from 'recharts';
import {
  vendasMensaisData,
  receitaDespesasData,
  funilVendasData,
  distribuicaoClientesData,
  produtosVendidosData,
  performanceEquipeData,
  trafegoCanalData,
  satisfacaoClienteData,
  crescimentoTrimestralData,
  tempoRespostaData,
  roiCampanhasData,
  taxaConversaoData,
} from './ChartData';

interface ChartRendererProps {
  selectedChart: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ selectedChart }) => {
  const renderChart = () => {
    switch (selectedChart) {
      case 'vendas-mensais':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={vendasMensaisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
              <Bar dataKey="vendas" fill="#8B5CF6" name="Vendas" />
              <Bar dataKey="meta" fill="#C084FC" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'receita-despesas':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={receitaDespesasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={3} name="Receita" />
              <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={3} name="Despesas" />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'funil-vendas':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={funilVendasData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
              >
                {funilVendasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'distribuicao-clientes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={distribuicaoClientesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {distribuicaoClientesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return <div className="w-full">{renderChart()}</div>;
};

export default ChartRenderer;
