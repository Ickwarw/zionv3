
import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Phone, Mail, Calendar, MoreVertical } from 'lucide-react';

const CRM = () => {
  const [activeTab, setActiveTab] = useState('leads');

  const leads = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', status: 'Qualificado', source: 'WhatsApp', value: 5000, lastContact: '2024-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 88888-8888', status: 'Proposta', source: 'Instagram', value: 12000, lastContact: '2024-01-14' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', phone: '(11) 77777-7777', status: 'Negociação', source: 'Facebook', value: 8500, lastContact: '2024-01-13' },
  ];

  const clientes = [
    { id: 1, name: 'Ana Oliveira', email: 'ana@email.com', phone: '(11) 66666-6666', company: 'Tech Corp', value: 25000, lastPurchase: '2024-01-10' },
    { id: 2, name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 55555-5555', company: 'Digital Inc', value: 18000, lastPurchase: '2024-01-08' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualificado': return 'bg-blue-500/20 text-blue-400';
      case 'Proposta': return 'bg-yellow-500/20 text-yellow-400';
      case 'Negociação': return 'bg-orange-500/20 text-orange-400';
      case 'Fechado': return 'bg-green-500/20 text-green-400';
      default: return 'bg-purple-500/20 text-purple-400';
    }
  };

  const stats = [
    { label: 'Total de Leads', value: leads.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Clientes Ativos', value: clientes.length, color: 'from-green-500 to-emerald-500' },
    { label: 'Taxa de Conversão', value: '24%', color: 'from-purple-500 to-pink-500' },
    { label: 'Ticket Médio', value: 'R$ 15.2k', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            CRM
          </h1>
          <p className="text-purple-300 mt-1">Gestão de clientes e relacionamento</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors">
            <Filter size={18} className="text-purple-400" />
            <span className="text-purple-300">Filtros</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
            <Plus size={18} />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl">
        {/* Tabs */}
        <div className="border-b border-purple-500/20">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'leads', label: 'Leads', count: leads.length },
              { id: 'clientes', label: 'Clientes', count: clientes.length },
              { id: 'pipeline', label: 'Pipeline', count: 0 }
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

        {/* Search Bar */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-slate-900/50 rounded-xl p-6 hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{lead.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-300">
                          <span className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>{lead.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{lead.phone}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-purple-400">Fonte: {lead.source}</span>
                          <span className="text-sm text-purple-400">• Último contato: {lead.lastContact}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">R$ {lead.value.toLocaleString()}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <button className="p-2 text-purple-400 hover:text-purple-300">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-4">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="bg-slate-900/50 rounded-xl p-6 hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {cliente.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{cliente.name}</h4>
                        <p className="text-purple-300">{cliente.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-purple-300">
                          <span className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>{cliente.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{cliente.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">R$ {cliente.value.toLocaleString()}</p>
                        <p className="text-sm text-purple-400">Última compra: {cliente.lastPurchase}</p>
                      </div>
                      <button className="p-2 text-purple-400 hover:text-purple-300">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="text-center py-12">
              <Users size={64} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Pipeline de Vendas</h3>
              <p className="text-purple-300 mb-6">Visualize o funil de vendas e acompanhe o progresso dos leads</p>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                Configurar Pipeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRM;
