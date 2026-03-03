
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Compass } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';

const Contato = () => {
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);

  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaActive) {
      setShowJuliaBubble(false);
    }
  };

  const handleElementClick = (event: React.MouseEvent, message: string) => {
    if (isJuliaActive) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setJuliaPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setJuliaMessage(message);
      setShowJuliaBubble(true);
    }
  };

  const handleCloseBubble = () => {
    setShowJuliaBubble(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={handleCloseBubble}
        position={juliaPosition}
      />

      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a página de Contato onde você pode entrar em contato conosco através de formulário ou informações diretas!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Contato
          </h1>
          <p className="text-gray-600 mt-1">Entre em contato conosco</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          onClick={(e) => handleElementClick(e, "Use este formulário para enviar uma mensagem diretamente para nossa equipe de suporte!")}
          className={`bg-white rounded-2xl p-8 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fale Conosco</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Digite aqui seu nome completo para que possamos identificá-lo!");
                }}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isJuliaActive ? 'cursor-help' : ''}`}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Digite seu email para que possamos responder sua mensagem!");
                }}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isJuliaActive ? 'cursor-help' : ''}`}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Digite seu telefone caso prefira que entremos em contato por telefone!");
                }}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isJuliaActive ? 'cursor-help' : ''}`}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
              <textarea
                rows={4}
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Descreva aqui sua dúvida, sugestão ou como podemos ajudá-lo!");
                }}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isJuliaActive ? 'cursor-help' : ''}`}
                placeholder="Como podemos ajudar você?"
              ></textarea>
            </div>
            <button
              type="submit"
              onClick={(e) => {
                e.stopPropagation();
                handleElementClick(e, "Clique aqui para enviar sua mensagem para nossa equipe de suporte!");
              }}
              className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              Enviar Mensagem
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div 
            onClick={(e) => handleElementClick(e, "Entre em contato conosco pelo telefone (11) 3456-7890 para suporte direto!")}
            className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
                <Phone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Telefone</h3>
                <p className="text-gray-600">(11) 3456-7890</p>
              </div>
            </div>
          </div>

          <div 
            onClick={(e) => handleElementClick(e, "Envie um email para contato@zioncrm.com.br para dúvidas ou suporte técnico!")}
            className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Email</h3>
                <p className="text-gray-600">contato@zioncrm.com.br</p>
              </div>
            </div>
          </div>

          <div 
            onClick={(e) => handleElementClick(e, "Nosso escritório fica na Av. Paulista, 1000 - São Paulo, SP. Você pode nos visitar!")}
            className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Endereço</h3>
                <p className="text-gray-600">Av. Paulista, 1000 - São Paulo, SP</p>
              </div>
            </div>
          </div>

          <div 
            onClick={(e) => handleElementClick(e, "Nosso horário de atendimento é de segunda a sexta das 8h às 18h, e sábados das 8h às 12h!")}
            className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Horário de Atendimento</h3>
                <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                <p className="text-gray-600">Sábado: 8h às 12h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;
