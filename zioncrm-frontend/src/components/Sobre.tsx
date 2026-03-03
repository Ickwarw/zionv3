
import React, { useState } from 'react';
import { Users, Target, Award, Heart, Compass } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';

const Sobre = () => {
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
          onClick={(e) => handleElementClick(e, "Esta é a página Sobre Nós onde você pode conhecer mais sobre o ZION CRM, nossa história, missão e valores!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sobre Nós
          </h1>
          <p className="text-gray-600 mt-1">Conheça nossa empresa e nossa missão</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          onClick={(e) => handleElementClick(e, "Aqui você pode ler sobre a história do ZION CRM, como começamos e nossa trajetória desde 2020!")}
          className={`bg-white rounded-2xl p-8 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa História</h2>
          <p className="text-gray-600 leading-relaxed">
            O ZION CRM nasceu da necessidade de democratizar o acesso a ferramentas de gestão empresarial de alta qualidade. 
            Fundada em 2020, nossa empresa tem como objetivo principal oferecer soluções tecnológicas inovadoras que 
            transformem a forma como as empresas gerenciam seus negócios.
          </p>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Nossa visão é ser reconhecida como a principal plataforma de CRM do Brasil, sempre priorizando inovação e experiência do usuário!")}
          className={`bg-white rounded-2xl p-8 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h2>
          <p className="text-gray-600 leading-relaxed">
            Ser reconhecida como a principal plataforma de CRM do Brasil, proporcionando às empresas as ferramentas 
            necessárias para crescer de forma sustentável e eficiente, sempre priorizando a experiência do usuário 
            e a inovação tecnológica.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={(e) => handleElementClick(e, "Nossa equipe é formada por profissionais experientes e apaixonados por tecnologia, sempre prontos para inovar!")}
          className={`bg-white rounded-2xl p-6 shadow-lg text-center ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 inline-block mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nossa Equipe</h3>
          <p className="text-gray-600">Profissionais experientes e apaixonados por tecnologia</p>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Nossa missão é simplificar a gestão empresarial através da tecnologia, tornando-a acessível para todos!")}
          className={`bg-white rounded-2xl p-6 shadow-lg text-center ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 inline-block mb-4">
            <Target size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nossa Missão</h3>
          <p className="text-gray-600">Simplificar a gestão empresarial através da tecnologia</p>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Nossos valores fundamentais são excelência, inovação e compromisso total com o sucesso do cliente!")}
          className={`bg-white rounded-2xl p-6 shadow-lg text-center ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 inline-block mb-4">
            <Award size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nossos Valores</h3>
          <p className="text-gray-600">Excelência, inovação e compromisso com o cliente</p>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Nosso propósito é impactar positivamente o crescimento dos negócios dos nossos clientes!")}
          className={`bg-white rounded-2xl p-6 shadow-lg text-center ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 inline-block mb-4">
            <Heart size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nosso Propósito</h3>
          <p className="text-gray-600">Impactar positivamente o crescimento dos negócios</p>
        </div>
      </div>

      <div 
        onClick={(e) => handleElementClick(e, "Aqui estão os principais motivos para escolher o ZION CRM: facilidade de uso, suporte completo e inovação constante!")}
        className={`bg-white rounded-2xl p-8 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Por que escolher o ZION CRM?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(e, "Nossa interface é intuitiva e amigável, projetada para usuários de todos os níveis técnicos!");
            }}
            className={`text-center ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <h3 className="font-bold text-lg text-purple-600 mb-2">Facilidade de Uso</h3>
            <p className="text-gray-600">Interface intuitiva e amigável, projetada para usuários de todos os níveis</p>
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(e, "Temos uma equipe de suporte especializada disponível para ajudar sempre que você precisar!");
            }}
            className={`text-center ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <h3 className="font-bold text-lg text-purple-600 mb-2">Suporte Completo</h3>
            <p className="text-gray-600">Equipe de suporte especializada disponível para ajudar quando você precisar</p>
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(e, "Recebemos atualizações regulares com novas funcionalidades e melhorias baseadas no feedback dos usuários!");
            }}
            className={`text-center ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <h3 className="font-bold text-lg text-purple-600 mb-2">Inovação Constante</h3>
            <p className="text-gray-600">Atualizações regulares com novas funcionalidades e melhorias</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
