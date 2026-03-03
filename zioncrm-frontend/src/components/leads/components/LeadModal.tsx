
import React from 'react';
import { Lead } from '../types/leads.types';

interface LeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

const LeadModal = ({ isOpen, lead, onClose }: LeadModalProps) => {
  if (!isOpen || !lead) return null;

  const getStatusColor = (status: string) => {
    // Marketing
    if (['Ruim'].includes(status)) return 'bg-red-100 text-red-800';
    if (['Fria'].includes(status)) return 'bg-blue-100 text-blue-800';
    if (['Morna'].includes(status)) return 'bg-yellow-100 text-yellow-800';
    if (['Quente'].includes(status)) return 'bg-orange-100 text-orange-800';
    if (['MuitoQuente', 'Queimando'].includes(status)) return 'bg-red-100 text-red-800';
    
    // Vendas
    if (['Fidelizado'].includes(status)) return 'bg-green-100 text-green-800';
    if (['Recuperadas', 'Recuperar'].includes(status)) return 'bg-purple-100 text-purple-800';
    if (status.includes('Perdas')) return 'bg-gray-100 text-gray-800';
    
    // Pós-vendas
    if (['AtivasSatisfeitas'].includes(status)) return 'bg-green-100 text-green-800';
    if (['AtivasInsatisfeitas', 'RecuperarSatisfacao'].includes(status)) return 'bg-yellow-100 text-yellow-800';
    if (['UpsellCrossSell'].includes(status)) return 'bg-purple-100 text-purple-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detalhes do Lead</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div className="space-y-3">
              <div><strong>Razão Social / Nome:</strong> {lead.razao || lead.name}</div>
              <div><strong>Nome Fantasia:</strong> {lead.fantasia || lead.company}</div>
              <div><strong>CNPJ/CPF:</strong> {lead.cnpj_cpf}</div>
              <div><strong>IE/Identidade:</strong> {lead.ie_identidade}</div>
              <div><strong>Email:</strong> {lead.email}</div>
              <div><strong>Prioridade:</strong> {lead.prioridade}</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${getStatusColor(String(lead.status))}`}>{String(lead.status)}</span></div>
            </div>
          </div>

          {/* Contatos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatos</h3>
            <div className="space-y-3">
              <div><strong>Contato:</strong> {lead.contato}</div>
              <div><strong>Telefone:</strong> {lead.fone || lead.telefone_celular || lead.telefone_comercial || lead.phone}</div>
              <div><strong>Celular:</strong> {lead.telefone_celular}</div>
              <div><strong>Comercial:</strong> {lead.telefone_comercial}</div>
              <div><strong>Email:</strong> {lead.email}</div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
            <div className="space-y-3">
              <div><strong>CEP:</strong> {lead.cep || lead.zip_code}</div>
              <div><strong>Endereço:</strong> {lead.endereco || lead.address}, {lead.numero}</div>
              <div><strong>Complemento:</strong> {lead.complemento}</div>
              <div><strong>Bairro:</strong> {lead.bairro}</div>
              <div><strong>Cidade:</strong> {lead.cidade || lead.city} - {lead.uf || lead.state}</div>
              <div><strong>Referência:</strong> {lead.referencia}</div>
            </div>
          </div>

          {/* Documentos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h3>
            <div className="space-y-3">
              <div><strong>CNPJ/CPF:</strong> {lead.cnpj_cpf}</div>
              <div><strong>IE/RG:</strong> {lead.ie_identidade}</div>
              <div><strong>Tipo Pessoa:</strong> {lead.tipo_pessoa === 'F' ? 'Física' : lead.tipo_pessoa === 'J' ? 'Jurídica' : lead.tipo_pessoa}</div>
              <div><strong>Data de Nascimento:</strong> {lead.data_nascimento ? new Date(lead.data_nascimento).toLocaleDateString('pt-BR') : '-'}</div>
              <div><strong>Estado Civil:</strong> {lead.estado_civil}</div>
              <div><strong>Sexo:</strong> {lead.sexo === 'M' ? 'Masculino' : lead.sexo === 'F' ? 'Feminino' : lead.sexo}</div>
            </div>
          </div>

          {/* Classificação e Origem */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classificação e Origem</h3>
            <div className="space-y-3">
              <div><strong>Origem:</strong> {lead.origem}</div>
              <div><strong>Prioridade:</strong> {lead.prioridade}</div>
              <div><strong>Status:</strong> {lead.status}</div>
              <div><strong>Ativo:</strong> {lead.ativo === 'S' ? 'Sim' : lead.ativo === 'N' ? 'Não' : lead.ativo}</div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
            <div className="space-y-3">
              <div><strong>Observações:</strong> {lead.obs || lead.notes || '-'}</div>
              <div><strong>Data de Cadastro:</strong> {lead.data_cadastro ? new Date(lead.data_cadastro).toLocaleDateString('pt-BR') : '-'}</div>
              {lead.created_at && <div><strong>Criado em:</strong> {new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            Editar Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
