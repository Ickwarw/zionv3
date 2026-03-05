
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCcw, User, Phone, PhoneOff } from 'lucide-react';
import JsSIP from 'jssip';
import { configService, voipService } from '@/services/api';
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
  const [isSipReady, setIsSipReady] = useState(false);
  const [ua, setUa] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const callStartRef = useRef<number | null>(null);
  const [sipSettings, setSipSettings] = useState({
    server: '',
    port: '7443',
    extension: '',
    password: ''
  });

  const sipDomain = useMemo(() => {
    const raw = sipSettings.server || '';
    const withoutProtocol = raw.replace(/^wss?:\/\//i, '').replace(/^https?:\/\//i, '');
    const host = withoutProtocol.split('/')[0];
    return host.split(':')[0] || '';
  }, [sipSettings.server]);

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

  const normalizePhoneNumber = (value: string) => {
    return value.replace(/\s+/g, '').trim();
  };

  const getWsUrl = (server: string, port: string) => {
    if (!server) {
      return '';
    }
    if (/^wss?:\/\//i.test(server)) {
      return server;
    }
    if (/^https?:\/\//i.test(server)) {
      return server.replace(/^http/i, 'ws');
    }
    return `wss://${server}:${port || '7443'}`;
  };

  const getDialDestination = (value: string) => {
    const target = normalizePhoneNumber(value);
    if (target.startsWith('sip:')) {
      return target;
    }
    if (target.includes('@')) {
      return `sip:${target}`;
    }
    return `sip:${target}@${sipDomain}`;
  };

  const loadSipSettings = async () => {
    try {
      const response = await configService.getConfigsByGroup('voip');
      const confs = response?.data?.configs || [];
      const confMap: Record<string, string> = {};
      confs.forEach((conf: any) => {
        confMap[conf.key] = conf.value;
      });

      let extensionServer = '';
      let extensionNumber = '';
      let extensionPassword = '';
      try {
        const extResponse = await voipService.getExtension();
        extensionServer = extResponse?.data?.sip_server || '';
        extensionNumber = extResponse?.data?.extension_number || '';
        extensionPassword = extResponse?.data?.password || '';
      } catch {
        // usuário sem extensão cadastrada
      }

      setSipSettings({
        server: extensionServer || confMap['voip.server'] || '',
        port: confMap['voip.port'] || '7443',
        extension: extensionNumber || confMap['voip.user'] || '',
        password: extensionPassword || confMap['voip.pass'] || ''
      });
    } catch (error) {
      showErrorAlert('Erro ao carregar configurações VoIP', formatAxiosError(error));
    }
  };

  const handleCall = async () => {
    if (!phoneNumber || isSubmitting) {
      return;
    }
    if (!ua || !isSipReady) {
      showWarningAlert('SIP não conectado', 'Verifique as configurações VoIP e a conexão com o servidor SIP.', null);
      return;
    }
    if (!sipDomain) {
      showWarningAlert('Domínio SIP inválido', 'Configure corretamente o servidor SIP.', null);
      return;
    }
    if (activeSession) {
      showWarningAlert('Ligação em andamento', 'Finalize a ligação atual antes de iniciar outra.', null);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await voipService.initiateCall(phoneNumber);
      const call = response?.data?.call;
      const callId = call?.call_id ?? null;
      if (!callId) {
        showWarningAlert('Falha ao iniciar ligação', 'Não foi possível criar o registro da chamada no backend.', null);
        return;
      }

      setCurrentCallId(callId);
      setCallStatus(call?.status ?? 'initiating');
      callStartRef.current = null;

      const eventHandlers = {
        progress: async () => {
          setCallStatus('ringing');
          await voipService.updateCallStatus({ call_id: callId, status: 'ringing' });
        },
        confirmed: async () => {
          const nowIso = new Date().toISOString();
          callStartRef.current = Date.now();
          setCallStatus('connected');
          await voipService.updateCallStatus({
            call_id: callId,
            status: 'connected',
            connect_time: nowIso
          });
        },
        failed: async () => {
          const nowIso = new Date().toISOString();
          const duration = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : null;
          setCallStatus('failed');
          await voipService.updateCallStatus({
            call_id: callId,
            status: 'failed',
            end_time: nowIso,
            duration
          });
          setActiveSession(null);
          setCurrentCallId(null);
          callStartRef.current = null;
        },
        ended: async () => {
          const nowIso = new Date().toISOString();
          const duration = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : null;
          setCallStatus('completed');
          await voipService.updateCallStatus({
            call_id: callId,
            status: 'completed',
            end_time: nowIso,
            duration
          });
          setActiveSession(null);
          setCurrentCallId(null);
          callStartRef.current = null;
        }
      };

      const session = ua.call(getDialDestination(phoneNumber), {
        eventHandlers,
        mediaConstraints: { audio: true, video: false }
      });
      setActiveSession(session);
    } catch (error) {
      showErrorAlert('Não foi possível iniciar a ligação', formatAxiosError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHangup = async () => {
    if (isSubmitting) {
      return;
    }

    if (activeSession) {
      activeSession.terminate();
      return;
    }

    if (!currentCallId) {
      showWarningAlert('Sem ligação ativa', 'Nenhuma ligação em andamento para encerrar.', null);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await voipService.endCall(currentCallId);
      const call = response?.data?.call;
      setCallStatus(call?.status ?? 'completed');
      setCurrentCallId(null);
      callStartRef.current = null;
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
    loadSipSettings();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    if (!sipSettings.server || !sipSettings.extension || !sipSettings.password) {
      setIsSipReady(false);
      return;
    }

    const wsUrl = getWsUrl(sipSettings.server, sipSettings.port);
    const socket = new JsSIP.WebSocketInterface(wsUrl);
    const sipUri = `sip:${sipSettings.extension}@${sipDomain}`;
    const userAgent = new JsSIP.UA({
      sockets: [socket],
      uri: sipUri,
      password: sipSettings.password,
      session_timers: false,
      register: true
    });

    userAgent.on('registered', () => setIsSipReady(true));
    userAgent.on('registrationFailed', () => setIsSipReady(false));
    userAgent.on('disconnected', () => setIsSipReady(false));
    userAgent.start();
    setUa(userAgent);

    return () => {
      setIsSipReady(false);
      setUa(null);
      setActiveSession(null);
      userAgent.stop();
    };
  }, [isVisible, sipDomain, sipSettings.extension, sipSettings.password, sipSettings.port, sipSettings.server]);

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
      if (!currentCallId || payload.call_id === currentCallId) {
        setCurrentCallId(payload.call_id);
      }
      setCallStatus(payload.status || null);
      if (payload.status === 'completed' || payload.status === 'failed') {
        setCurrentCallId(null);
      }
    };

    SocketService.on('call_status', onCallStatus);
    return () => {
      SocketService.off('call_status', onCallStatus);
    };
  }, [storedUser?.id, currentCallId]);

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
      <p className="text-center text-slate-300 text-xs mt-1">
        SIP: {isSipReady ? 'conectado' : 'desconectado'}
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
