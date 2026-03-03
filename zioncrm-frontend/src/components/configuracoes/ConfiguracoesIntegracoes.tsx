
import React from 'react';
import { Button } from '../ui/button';

interface Integracao {
  id: string;
  nome: string;
  descricao: string;
  status: 'conectado' | 'desconectado';
}

const ConfiguracoesIntegracoes = () => {
  const integracoes: Integracao[] = [
    {
      id: 'whatsapp',
      nome: 'WhatsApp Business',
      descricao: 'Integração com WhatsApp Business API',
      status: 'conectado'
    },
    {
      id: 'analytics',
      nome: 'Google Analytics',
      descricao: 'Análise de tráfego e conversões',
      status: 'desconectado'
    },
    {
      id: 'mailchimp',
      nome: 'Mailchimp',
      descricao: 'Email marketing automatizado',
      status: 'conectado'
    },
    {
      id: 'zapier',
      nome: 'Zapier',
      descricao: 'Automação de workflows',
      status: 'desconectado'
    }
  ];

  const handleIntegrationAction = (id: string, action: string) => {
    console.log(`${action} integração:`, id);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Integrações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integracoes.map((integracao) => (
          <div key={integracao.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{integracao.nome}</h3>
              <span className={`px-2 py-1 rounded-full text-sm ${
                integracao.status === 'conectado' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {integracao.status === 'conectado' ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{integracao.descricao}</p>
            <Button
              size="sm"
              onClick={() => handleIntegrationAction(
                integracao.id, 
                integracao.status === 'conectado' ? 'configurar' : 'conectar'
              )}
            >
              {integracao.status === 'conectado' ? 'Configurar' : 'Conectar'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfiguracoesIntegracoes;
