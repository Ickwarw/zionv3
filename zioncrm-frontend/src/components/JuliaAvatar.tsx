
import React from 'react';
import { Compass } from 'lucide-react';

interface JuliaAvatarProps {
  isActive: boolean;
  isVisible?: boolean;
}

const JuliaAvatar = ({ isActive, isVisible = false }: JuliaAvatarProps) => {
  return (
    <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
      {isVisible ? (
        // Imagem da Julia quando ela está falando
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
          <img 
            src="/lovable-uploads/4d36e845-2d4f-41d0-ab86-d94d5ae76ce0.png" 
            alt="Julia - Assistente de Suporte" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        // Ícone do Compass da Julia (mesmo da página assistentes)
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? 'bg-green-500 shadow-lg shadow-green-500/50' 
            : 'bg-indigo-500'
        }`}>
          <Compass size={20} className="text-white" />
        </div>
      )}
      
      {/* Status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-400'
      }`}></div>
    </div>
  );
};

export default JuliaAvatar;
