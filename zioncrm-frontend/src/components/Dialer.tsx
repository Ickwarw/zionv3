
import React, { useState } from 'react';
import { X, RotateCcw, User, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DialerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dialer = ({ isOpen, onClose }: DialerProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleNumberClick = (num: string) => {
    setPhoneNumber(prev => prev + num);
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleCall = () => {
    if (phoneNumber) {
      console.log('Calling:', phoneNumber);
      // Aqui você pode implementar a lógica de chamada
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-sm p-0">
        <DialogHeader className="p-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <DialogTitle className="text-white">Discador</DialogTitle>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-purple-400 hover:text-white">
                <User size={16} />
              </button>
              <button onClick={onClose} className="text-purple-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          {/* Flag and Number Display */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-4 bg-green-500 rounded-sm flex items-center justify-center">
              <span className="text-xs">🇧🇷</span>
            </div>
            <div className="flex-1 bg-slate-700 rounded px-3 py-2 min-h-[40px] flex items-center">
              <span className="text-white font-mono text-lg">
                {phoneNumber || ''}
              </span>
            </div>
          </div>

          {/* Action Buttons - 3 buttons only */}
          <div className="flex justify-center space-x-8 mb-6">
            <button 
              onClick={handleClear}
              className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
            >
              <RotateCcw size={20} className="text-purple-400" />
            </button>
            <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
              <User size={20} className="text-purple-400" />
            </button>
            <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
              <User size={20} className="text-purple-400" />
            </button>
          </div>

          {/* Dialpad */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {dialpadNumbers.flat().map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="h-14 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xl font-semibold transition-colors"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Bottom Action Buttons - 3 buttons only */}
          <div className="flex justify-center space-x-8">
            <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
              <User size={20} className="text-purple-400" />
            </button>
            <button 
              onClick={handleCall}
              className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
            >
              <Phone size={24} className="text-white" />
            </button>
            <button 
              onClick={handleBackspace}
              className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
            >
              <X size={20} className="text-purple-400" />
            </button>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-purple-400 text-xs mt-4">
            Não utilize o discador para realizar chamadas de emergência.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Dialer;
