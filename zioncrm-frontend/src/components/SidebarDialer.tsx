
import React, { useEffect, useState } from 'react';
import { X, RotateCcw, User, Phone, PhoneOff } from 'lucide-react';
import { voipService } from '@/services/api';
import { formatAxiosError } from './ui/formatResponseError';
import { showErrorAlert } from './ui/alert-dialog-error';
import { showWarningAlert } from './ui/alert-dialog-warning';
import SocketService from '@/services/SocketService';


interface SidebarDialerProps {
  isVisible: boolean;
  onClose: () => void;
}


const SidebarDialer = ({ isVisible, onClose }: SidebarDialerProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

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

  const handleCall = async () => {
    if (!phoneNumber || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await voipService.initiateCall(phoneNumber);
      const call = response?.data?.call;
      setCurrentCallId(call?.call_id ?? null);
      setCallStatus(call?.status ?? 'initiating');
    } catch (error) {
      showErrorAlert('Não foi possível iniciar a ligação', formatAxiosError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHangup = async () => {
    if (!currentCallId || isSubmitting) {
      showWarningAlert('Sem ligação ativa', 'Nenhuma ligação em andamento para encerrar.', null);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await voipService.endCall(currentCallId);
      const call = response?.data?.call;
      setCallStatus(call?.status ?? 'completed');
      setCurrentCallId(null);
    } catch (error) {
      showErrorAlert('Não foi possível encerrar a ligação', formatAxiosError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!storedUser?.id) {
      return;
    }

    SocketService.connect();
    SocketService.socket?.emit('register_for_calls', { user_id: storedUser.id });

    const onCallStatus = (payload: any) => {
      if (!payload?.call_id) {
        return;
      }
      setCurrentCallId(payload.call_id);
      setCallStatus(payload.status || null);
      if (payload.status === 'completed' || payload.status === 'failed') {
        setCurrentCallId(null);
      }
    };

    SocketService.on('call_status', onCallStatus);
    return () => {
      SocketService.off('call_status', onCallStatus);
    };
  }, [storedUser?.id]);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-white font-semibold">Discador</span>
        </div>
        <button onClick={onClose} className="text-purple-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

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
      <div className="flex justify-center space-x-8 mb-4">
        <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
          <User size={20} className="text-purple-400" />
        </button>
        <button 
          onClick={handleCall}
          disabled={isSubmitting}
          className="p-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
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
      <p className="text-center text-purple-400 text-xs">
        Não utilize o discador para realizar chamadas de emergência.
      </p>
      <p className="text-center text-slate-300 text-xs mt-2">
        {callStatus ? `Status da chamada: ${callStatus}` : 'Status da chamada: inativa'}
      </p>
      <div className="flex justify-center mt-3">
        <button
          onClick={handleHangup}
          disabled={!currentCallId || isSubmitting}
          className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
          title="Encerrar ligação"
        >
          <PhoneOff size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default SidebarDialer;
