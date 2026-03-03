
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface JuliaSpeechBubbleProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const JuliaSpeechBubble = ({ isVisible, message, onClose, position }: JuliaSpeechBubbleProps) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setIsTyping(true);
      setDisplayedMessage('');
      
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < message.length) {
          setDisplayedMessage(message.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
          // Auto fechar após 5 segundos
          setTimeout(() => {
            onClose();
          }, 5000);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [isVisible, message, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 max-w-sm"
      style={{
        left: Math.min(position.x, window.innerWidth - 300),
        top: Math.max(position.y - 100, 10)
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-4 relative animate-scale-in">
        {/* Seta do balão */}
        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-500 transform rotate-45"></div>
        
        {/* Avatar da Julia */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0">
            <img 
              src="/lovable-uploads/4d36e845-2d4f-41d0-ab86-d94d5ae76ce0.png" 
              alt="Julia" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-600">Julia - Suporte</h4>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensagem */}
        <div className="text-gray-700 text-sm leading-relaxed">
          {displayedMessage}
          {isTyping && <span className="animate-pulse">|</span>}
        </div>
      </div>
    </div>
  );
};

export default JuliaSpeechBubble;
