
import React, { useEffect, useState } from 'react';
import { X, RotateCcw, User, Phone } from 'lucide-react';
import JsSIP from "jssip";


interface SidebarDialerProps {
  isVisible: boolean;
  onClose: () => void;
}


const SidebarDialer = ({ isVisible, onClose }: SidebarDialerProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ua, setUa] = useState(null);
  
  const config = {
      account: {
        domain: '187.60.60.161',
        username: '5511920835503',
        password: '&8oYR0',
        wssServer: '187.60.60.161',
        webSocketPort: '5060',
        serverPath: '',
      },
    };

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
      const eventHandlers = {
        progress: () => console.log("Chamando..."),
        failed: (e) => console.error("Falhou:", e),
        confirmed: () => console.log("Atendeu!"),
        ended: () => console.log("Encerrada."),
      };
    
      const options = {
        eventHandlers,
        mediaConstraints: { audio: true, video: false },
      };

       ua.call("sip:5543991171953@187.60.60.161", options);

      // SipConnection.methods('5511920835503').dialByNumber('audio', '5543991171953');
      
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

   useEffect(() => {
    const socket = new JsSIP.WebSocketInterface("wss://187.60.60.161:5060");

    const ua = new JsSIP.UA({
      uri: "sip:+5511920835503@187.60.60.161:5060",
      password: "&8oYR0",
      sockets: [socket],
      session_timers: false,
    });

    ua.start();

    ua.on("connected", () => console.log("✅ Conectado ao servidor SIP"));
    ua.on("disconnected", () => console.log("❌ Desconectado do servidor SIP"));
    ua.on("registered", () => console.log("📡 Registrado com sucesso"));
    ua.on("unregistered", () => console.log("🚪 Saiu do servidor SIP"));
    ua.on("registrationFailed", (e) => console.error("⚠️ Falha no registro:", e));

    // Guardar ua em window para testar no console
    setUa(ua);

    return () => {
      ua.stop();
    };
  }, []);

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
      <p className="text-center text-purple-400 text-xs">
        Não utilize o discador para realizar chamadas de emergência.
      </p>
    </div>
  );
};

export default SidebarDialer;
