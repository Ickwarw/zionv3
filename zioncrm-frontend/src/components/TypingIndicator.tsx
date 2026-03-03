
import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  aiName: string;
}

const TypingIndicator = ({ isVisible, aiName }: TypingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-xs text-purple-300">{aiName} está digitando...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
