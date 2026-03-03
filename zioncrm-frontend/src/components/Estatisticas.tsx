import React from 'react';
import { TrendingUp, Users, DollarSign, Target, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';

const Estatisticas = () => {
  const kpis = [
    { label: 'Receita Total', valor: 'R$ 847.320', variacao: '+23%', icon: DollarSign, cor: 'from-green-500 to-emerald-600' },
    { label: 'Novos Clientes', valor: '156', variacao: '+12%', icon: Users, cor: 'from-blue-500 to-cyan-600' },
    { label: 'Taxa de Conversão', valor: '8.4%', variacao: '+5%', icon: Target, cor: 'from-purple-500 to-violet-600' },
    { label: 'Ticket Médio', valor: 'R$ 2.847', variacao: '+8%', icon: TrendingUp, cor: 'from-orange-500 to-red-600' },
  ];

  const vendaData = [
    { mes: 'Jan', vendas: 65000, meta: 70000 },
    { mes: 'Fev', vendas: 78000, meta: 75000 },
    { mes: 'Mar', vendas: 89000, meta: 80000 },
    { mes: 'Abr', vendas: 95000, meta: 85000 },
    { mes: 'Mai', vendas: 110000, meta: 95000 },
    { mes: 'Jun', vendas: 125000, meta: 100000 },
  ];

  const canalData = [
    { nome: 'Online', valor: 45, cor: '#8B5CF6' },
    { nome: 'Telefone', valor: 30, cor: '#06B6D4' },
    { nome: 'Presencial', valor: 20, cor: '#10B981' },
    { nome: 'Email', valor: 5, cor: '#F59E0B' },
  ];

  const crescimentoData = [
    { mes: 'Jan', crescimento: 5.2 },
    { mes: 'Fev', crescimento: 7.8 },
    { mes: 'Mar', crescimento: 12.4 },
    { mes: 'Abr', crescimento: 15.6 },
    { mes: 'Mai', crescimento: 18.9 },
    { mes: 'Jun', crescimento: 23.1 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Estatísticas
          </h1>
          <p className="text-gray-600 mt-1">Análises avançadas e métricas de performance</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Exportar
          </button>
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
            Período
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.valor}</p>
                  <p className="text-green-600 text-sm font-medium mt-1">{kpi.variacao} vs mês anterior</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.cor}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas vs Meta Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
              <Bar dataKey="vendas" fill="#8B5CF6" name="Vendas" />
              <Bar dataKey="meta" fill="#C084FC" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Canal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={canalData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="valor"
                label={({ nome, valor }) => `${nome}: ${valor}%`}
              >
                {canalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Crescimento */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Crescimento Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={crescimentoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, 'Crescimento']} />
            <Area type="monotone" dataKey="crescimento" stroke="#8B5CF6" fill="#C084FC" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produtos</h3>
          <div className="space-y-3">
            {[
              { produto: 'CRM Pro', vendas: 245, percentual: 85 },
              { produto: 'CRM Basic', vendas: 189, percentual: 65 },
              { produto: 'CRM Enterprise', vendas: 156, percentual: 55 },
              { produto: 'Add-ons', vendas: 134, percentual: 45 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.produto}</p>
                  <p className="text-sm text-gray-600">{item.vendas} vendas</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${item.percentual}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600">{item.percentual}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
          <div className="space-y-3">
            {[
              { vendedor: 'João Silva', meta: 95, cor: 'bg-green-500' },
              { vendedor: 'Maria Santos', meta: 87, cor: 'bg-blue-500' },
              { vendedor: 'Pedro Costa', meta: 76, cor: 'bg-yellow-500' },
              { vendedor: 'Ana Oliveira', meta: 68, cor: 'bg-red-500' },
            ].map((vendedor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{vendedor.vendedor}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${vendedor.cor}`} style={{ width: `${vendedor.meta}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600">{vendedor.meta}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Chave</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tempo Médio de Ciclo</span>
              <span className="font-semibold text-gray-900">18 dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Fechamento</span>
              <span className="font-semibold text-green-600">24.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">NPS Score</span>
              <span className="font-semibold text-blue-600">8.7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churn Rate</span>
              <span className="font-semibold text-red-600">2.1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;
