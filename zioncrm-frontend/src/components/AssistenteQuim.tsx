
import React, { useState } from 'react';
import { Bot, Send, Mic, FileText } from 'lucide-react';

const AssistenteQuim = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Olá! Eu sou o Quim, seu assistente especializado em vendas. Como posso ajudar você hoje?' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = { id: Date.now(), type: 'user', content: inputValue };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Simular resposta do bot
      setTimeout(() => {
        const botResponse = { 
          id: Date.now() + 1, 
          type: 'bot', 
          content: 'Entendi sua solicitação! Baseado na minha análise, posso sugerir as seguintes estratégias de vendas...' 
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Assistente Quim
          </h1>
          <p className="text-gray-600 mt-1">Especialista em vendas e estratégias comerciais</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
            <Bot size={24} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua pergunta para o Quim..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Especialidades do Quim</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Estratégias de Vendas</h4>
                <p className="text-sm text-purple-700">Técnicas e abordagens eficazes</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Análise de Pipeline</h4>
                <p className="text-sm text-blue-700">Otimização do funil de vendas</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Negociação</h4>
                <p className="text-sm text-green-700">Táticas para fechar negócios</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Perguntas Frequentes</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Como aumentar a taxa de conversão?
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Melhores práticas de follow-up
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Como qualificar leads?
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Estratégias para objeções
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Online e disponível</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistenteQuim;
