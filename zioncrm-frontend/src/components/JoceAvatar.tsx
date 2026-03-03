
import React from 'react';
import { Bot } from 'lucide-react';

interface JoceAvatarProps {
  isActive: boolean;
  isProcessing: boolean;
}

const JoceAvatar = ({ isActive, isProcessing }: JoceAvatarProps) => {
  return (
    <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/50' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500'
      }`}>
        <Bot size={20} className="text-white" />
      </div>
      
      {/* Processing animation */}
      {isProcessing && (
        <div className="absolute -inset-2">
          <div className="w-14 h-14 border-2 border-pink-500/30 rounded-full animate-spin">
            <div className="absolute top-0 left-1/2 w-1 h-3 bg-pink-500 rounded-full transform -translate-x-1/2"></div>
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-400'
      }`}></div>
    </div>
  );
};

export default JoceAvatar;
