
import React, { useState } from 'react';
import { Plus, Search, Package, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2 } from 'lucide-react';

const Estoque = () => {
  const [activeTab, setActiveTab] = useState('produtos');

  const produtos = [
    { id: 1, name: 'Smartphone XYZ', sku: 'SMT001', category: 'Eletrônicos', stock: 45, minStock: 10, price: 899.99, status: 'Em Estoque' },
    { id: 2, name: 'Notebook ABC', sku: 'NBK002', category: 'Informática', stock: 8, minStock: 5, price: 2499.99, status: 'Baixo Estoque' },
    { id: 3, name: 'Fone Bluetooth', sku: 'FON003', category: 'Acessórios', stock: 0, minStock: 15, price: 199.99, status: 'Sem Estoque' },
    { id: 4, name: 'Mouse Gamer', sku: 'MOU004', category: 'Periféricos', stock: 32, minStock: 20, price: 149.99, status: 'Em Estoque' },
  ];

  const movimentacoes = [
    { id: 1, produto: 'Smartphone XYZ', tipo: 'Entrada', quantidade: 50, data: '2024-01-15', motivo: 'Compra' },
    { id: 2, produto: 'Notebook ABC', tipo: 'Saída', quantidade: 2, data: '2024-01-15', motivo: 'Venda' },
    { id: 3, produto: 'Fone Bluetooth', tipo: 'Saída', quantidade: 15, data: '2024-01-14', motivo: 'Venda' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Estoque': return 'bg-green-500/20 text-green-400';
      case 'Baixo Estoque': return 'bg-yellow-500/20 text-yellow-400';
      case 'Sem Estoque': return 'bg-red-500/20 text-red-400';
      default: return 'bg-purple-500/20 text-purple-400';
    }
  };

  const stats = [
    { label: 'Total de Produtos', value: produtos.length, icon: Package, color: 'from-blue-500 to-cyan-500' },
    { label: 'Produtos em Estoque', value: produtos.filter(p => p.stock > p.minStock).length, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Estoque Baixo', value: produtos.filter(p => p.stock <= p.minStock && p.stock > 0).length, icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
    { label: 'Sem Estoque', value: produtos.filter(p => p.stock === 0).length, icon: TrendingDown, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Estoque
          </h1>
          <p className="text-purple-300 mt-1">Controle de inventário e produtos</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors">
            <Search size={18} className="text-purple-400" />
            <span className="text-purple-300">Buscar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
            <Plus size={18} />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl">
        {/* Tabs */}
        <div className="border-b border-purple-500/20">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'produtos', label: 'Produtos', count: produtos.length },
              { id: 'movimentacoes', label: 'Movimentações', count: movimentacoes.length },
              { id: 'relatorios', label: 'Relatórios', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-purple-300 hover:text-purple-200'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'produtos' && (
            <div className="space-y-4">
              {produtos.map((produto) => (
                <div key={produto.id} className="bg-slate-900/50 rounded-xl p-6 hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Package size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{produto.name}</h4>
                        <p className="text-purple-300">SKU: {produto.sku}</p>
                        <p className="text-sm text-purple-400">Categoria: {produto.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{produto.stock}</p>
                        <p className="text-sm text-purple-400">Em estoque</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-purple-300">R$ {produto.price.toFixed(2)}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(produto.status)}`}>
                          {produto.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-purple-400 hover:text-purple-300">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'movimentacoes' && (
            <div className="space-y-4">
              {movimentacoes.map((mov) => (
                <div key={mov.id} className="bg-slate-900/50 rounded-xl p-6 hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        mov.tipo === 'Entrada' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {mov.tipo === 'Entrada' ? 
                          <TrendingUp size={20} className="text-green-400" /> : 
                          <TrendingDown size={20} className="text-red-400" />
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{mov.produto}</h4>
                        <p className="text-purple-300">{mov.motivo}</p>
                        <p className="text-sm text-purple-400">Data: {mov.data}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        mov.tipo === 'Entrada' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {mov.tipo === 'Entrada' ? '+' : '-'}{mov.quantidade}
                      </p>
                      <p className="text-sm text-purple-400">{mov.tipo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'relatorios' && (
            <div className="text-center py-12">
              <Package size={64} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Relatórios de Estoque</h3>
              <p className="text-purple-300 mb-6">Análises detalhadas e relatórios de movimentação</p>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                Gerar Relatório
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estoque;
