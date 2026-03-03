
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Compass } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import GraficosInterativos from './estatisticas/GraficosInterativos';

const Estatisticas = () => {
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
          onClick={(e) => handleElementClick(e, "Esta é a seção de Estatísticas onde a IA analisa seus dados e apresenta insights inteligentes através de gráficos interativos!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Estatísticas Inteligentes
          </h1>
          <p className="text-gray-600 mt-1">Análises avançadas com inteligência artificial</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <BarChart3 size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Gráficos Interativos */}
      <GraficosInterativos />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={(e) => handleElementClick(e, "Total de vendas realizadas com crescimento de 15% este mês!")}
          className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
              <p className="text-2xl font-bold text-green-600">1,234</p>
              <p className="text-sm text-green-600">+15% este mês</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Novos clientes conquistados com aumento de 22% este mês!")}
          className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
              <p className="text-2xl font-bold text-blue-600">89</p>
              <p className="text-sm text-blue-600">+22% este mês</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Taxa de conversão de leads em clientes com melhoria de 3% este mês!")}
          className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
              <p className="text-2xl font-bold text-purple-600">18.5%</p>
              <p className="text-sm text-purple-600">+3% este mês</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Nível de satisfação dos clientes com melhoria de 0.2 pontos este mês!")}
          className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação</p>
              <p className="text-2xl font-bold text-orange-600">4.8/5</p>
              <p className="text-sm text-orange-600">+0.2 este mês</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;
