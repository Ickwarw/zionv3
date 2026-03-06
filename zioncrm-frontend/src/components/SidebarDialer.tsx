import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Delete, Eraser, Eye, EyeOff, Phone, PhoneForwarded, PhoneOff, PhoneOutgoing, RefreshCw, Search, User, UserPlus, Wifi, WifiOff, X } from 'lucide-react';
import JsSIP from 'jssip';
import { chatService, configService, voipService } from '@/services/api';
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
  const [isSipConnecting, setIsSipConnecting] = useState(false);
  const [ua, setUa] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  const [showContactsPopup, setShowContactsPopup] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [extensionsLoading, setExtensionsLoading] = useState(false);
  const [selectedTransferExtension, setSelectedTransferExtension] = useState<string>('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const [sipSettings, setSipSettings] = useState({
    server: '',
    port: '8088',
    wsPath: '/ws'
  });

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const sipUserStorageKey = `voip:sip:user:${storedUser?.id || 'default'}`;
  const sipPassStorageKey = `voip:sip:pass:${storedUser?.id || 'default'}`;
  const sipNameStorageKey = `voip:sip:name:${storedUser?.id || 'default'}`;

  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');
  const [sipDisplayName, setSipDisplayName] = useState('');
  const [showSipPassword, setShowSipPassword] = useState(false);

  const callStartRef = useRef<number | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

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

  const normalizePhoneNumber = (value: string) => value.replace(/\s+/g, '').trim();

  const getWsUrl = (server: string, port: string, wsPath: string) => {
    const raw = (server || '').trim();
    if (!raw) return '';

    if (/^wss?:\/\//i.test(raw)) return raw;
    if (/^https?:\/\//i.test(raw)) return raw.replace(/^http/i, 'ws');

    const hostPart = raw.includes('/') ? raw.slice(0, raw.indexOf('/')) : raw;
    const pathFromServer = raw.includes('/') ? raw.slice(raw.indexOf('/')) : '';
    const hostWithPort = hostPart.includes(':') ? hostPart : `${hostPart}:${port || '8088'}`;

    let path = (wsPath || '').trim() || pathFromServer || '/ws';
    if (!path.startsWith('/')) path = `/${path}`;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${hostWithPort}${path}`;
  };

  const getDialDestination = (value: string) => {
    const target = normalizePhoneNumber(value);
    if (target.startsWith('sip:')) return target;
    if (target.includes('@')) return `sip:${target}`;
    return `sip:${target}@${sipDomain}`;
  };

  const getCallStatusStyle = () => {
    switch (callStatus) {
      case 'connected':
        return { label: 'Em ligação', icon: CheckCircle2, cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' };
      case 'ringing':
      case 'initiating':
        return { label: 'Chamando', icon: PhoneOutgoing, cls: 'bg-amber-500/20 text-amber-300 border border-amber-400/40' };
      case 'failed':
        return { label: 'Falhou', icon: AlertTriangle, cls: 'bg-red-500/20 text-red-300 border border-red-400/40' };
      case 'completed':
        return { label: 'Finalizada', icon: CheckCircle2, cls: 'bg-slate-500/20 text-slate-200 border border-slate-400/40' };
      default:
        return { label: 'Inativa', icon: Phone, cls: 'bg-slate-500/20 text-slate-200 border border-slate-400/40' };
    }
  };

  const getSipStatusStyle = () => {
    if (isSipReady) {
      return { label: 'SIP conectado', icon: Wifi, cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' };
    }
    if (isSipConnecting) {
      return { label: 'Conectando SIP...', icon: RefreshCw, cls: 'bg-amber-500/20 text-amber-300 border border-amber-400/40' };
    }
    return { label: 'SIP desconectado', icon: WifiOff, cls: 'bg-red-500/20 text-red-300 border border-red-400/40' };
  };

  const loadSipSettings = async () => {
    try {
      const response = await configService.getConfigsByGroup('voip');
      const confs = response?.data?.configs || [];
      const confMap: Record<string, string> = {};
      confs.forEach((conf: any) => {
        confMap[conf.key] = conf.value;
      });

      setSipSettings({
        server: confMap['voip.server'] || '',
        port: confMap['voip.port'] || '8088',
        wsPath: confMap['voip.ws_path'] || '/ws'
      });
    } catch (error) {
      showErrorAlert('Erro ao carregar configurações VoIP', formatAxiosError(error));
    }
  };

  const loadStoredSipCredentials = () => {
    setSipUsername(localStorage.getItem(sipUserStorageKey) || '');
    setSipPassword(localStorage.getItem(sipPassStorageKey) || '');
    setSipDisplayName(localStorage.getItem(sipNameStorageKey) || '');
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await chatService.getContacts();
      const list = response?.data?.contacts || [];
      setContacts(list.filter((contact: any) => contact.phone && String(contact.phone).trim() !== ''));
    } catch (error) {
      showErrorAlert('Erro ao carregar contatos', formatAxiosError(error));
    } finally {
      setContactsLoading(false);
    }
  };

  const loadExtensions = async () => {
    try {
      setExtensionsLoading(true);
      const response = await voipService.getExtensions();
      const list = response?.data?.extensions || [];
      setExtensions(list.filter((ext: any) => !ext.is_current_user));
    } catch (error) {
      showErrorAlert('Erro ao carregar ramais', formatAxiosError(error));
    } finally {
      setExtensionsLoading(false);
    }
  };

  const openContactsPopup = async () => {
    setShowContactsPopup(true);
    setSelectedContactId(null);
    setContactSearch('');
    await loadContacts();
  };

  const openTransferPopup = async () => {
    if (!hasCallInProgress) {
      return;
    }
    setShowTransferPopup(true);
    setSelectedTransferExtension('');
    await loadExtensions();
  };

  const filteredContacts = contacts.filter((contact) => {
    const term = contactSearch.toLowerCase().trim();
    if (!term) return true;
    const name = String(contact.name || '').toLowerCase();
    const phone = String(contact.phone || '').toLowerCase();
    return name.includes(term) || phone.includes(term);
  });

  const useSelectedContactPhone = () => {
    if (!selectedContactId) {
      showWarningAlert('Selecione um contato', 'Escolha um contato para usar o telefone no discador.', null);
      return;
    }
    const selected = contacts.find((contact) => contact.id === selectedContactId);
    if (!selected?.phone) {
      showWarningAlert('Contato sem telefone', 'O contato selecionado não possui telefone válido.', null);
      return;
    }
    setPhoneNumber(String(selected.phone));
    setShowContactsPopup(false);
  };

  const cleanupRemoteAudio = () => {
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const attachRemoteAudio = (session: any) => {
    if (!session?.connection || !remoteAudioRef.current) return;

    const pc = session.connection;
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    remoteAudioRef.current.srcObject = remoteStream;

    const playRemoteAudio = () => {
      remoteAudioRef.current?.play().catch(() => {
        // browser pode bloquear autoplay sem gesto adicional
      });
    };

    const onTrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        event.streams[0].getAudioTracks().forEach((track) => remoteStream.addTrack(track));
      } else if (event.track) {
        remoteStream.addTrack(event.track);
      }
      playRemoteAudio();
    };

    pc.addEventListener('track', onTrack);
    session.on('ended', () => {
      pc.removeEventListener('track', onTrack);
      cleanupRemoteAudio();
    });
    session.on('failed', () => {
      pc.removeEventListener('track', onTrack);
      cleanupRemoteAudio();
    });
  };

  const disconnectSip = () => {
    if (activeSession) {
      activeSession.terminate();
    }
    ua?.stop();
    setUa(null);
    setIsSipReady(false);
    setIsSipConnecting(false);
  };

  const connectSip = () => {
    if (!sipSettings.server) {
      showWarningAlert('Servidor SIP não configurado', 'Defina servidor/porta/path nas configurações VoIP.', null);
      return;
    }
    if (!sipUsername || !sipPassword) {
      showWarningAlert('Credenciais obrigatórias', 'Informe usuário e senha SIP para conectar.', null);
      return;
    }

    const wsUrl = getWsUrl(sipSettings.server, sipSettings.port, sipSettings.wsPath);
    if (!wsUrl) {
      showWarningAlert('WebSocket SIP inválido', 'Não foi possível montar a URL WS/WSS.', null);
      return;
    }

    try {
      setIsSipConnecting(true);
      ua?.stop();

      const socket = new JsSIP.WebSocketInterface(wsUrl);
      const sipUri = sipUsername.includes('@') ? `sip:${sipUsername}` : `sip:${sipUsername}@${sipDomain}`;

      const userAgent = new JsSIP.UA({
        sockets: [socket],
        uri: sipUri,
        password: sipPassword,
        session_timers: false,
        register: true
      });

      userAgent.on('registered', () => {
        setIsSipReady(true);
        setIsSipConnecting(false);
        console.log('SIP registrado com sucesso:', wsUrl);
        voipService.createExtension({
          extension_number: sipUsername,
          display_name: (sipDisplayName || sipUsername).trim()
        }).catch((error) => {
          console.error('Falha ao persistir extensão no backend', error);
        });
      });

      userAgent.on('registrationFailed', (event: any) => {
        setIsSipReady(false);
        setIsSipConnecting(false);
        console.error('Falha no registro SIP:', event?.cause || event);
        showWarningAlert('Falha no registro SIP', `Causa: ${event?.cause || 'desconhecida'}`, null);
      });

      userAgent.on('disconnected', () => {
        setIsSipReady(false);
        setIsSipConnecting(false);
      });

      userAgent.start();
      setUa(userAgent);

      localStorage.setItem(sipUserStorageKey, sipUsername);
      localStorage.setItem(sipPassStorageKey, sipPassword);
      localStorage.setItem(sipNameStorageKey, sipDisplayName || sipUsername);
    } catch (error) {
      setIsSipConnecting(false);
      showErrorAlert('Erro ao conectar SIP', formatAxiosError(error));
    }
  };

  const handleCall = async () => {
    if (!phoneNumber || isSubmitting) return;

    if (!ua || !isSipReady) {
      showWarningAlert('SIP não conectado', 'Conecte no SIP antes de iniciar a ligação.', null);
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
      const response = await voipService.initiateCall(phoneNumber, sipUsername);
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

      attachRemoteAudio(session);
      setActiveSession(session);
    } catch (error) {
      showErrorAlert('Não foi possível iniciar a ligação', formatAxiosError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHangup = async () => {
    if (isSubmitting) return;

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
      cleanupRemoteAudio();
    } catch (error) {
      showErrorAlert('Não foi possível encerrar a ligação', formatAxiosError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!activeSession || !currentCallId) {
      showWarningAlert('Sem ligação ativa', 'Só é possível transferir com uma ligação em andamento.', null);
      return;
    }
    if (!selectedTransferExtension) {
      showWarningAlert('Selecione um ramal', 'Escolha o ramal de destino para transferir.', null);
      return;
    }

    try {
      setTransferSubmitting(true);
      const target = selectedTransferExtension.includes('@')
        ? `sip:${selectedTransferExtension}`
        : `sip:${selectedTransferExtension}@${sipDomain}`;

      activeSession.refer(target);

      await voipService.updateCallStatus({
        call_id: currentCallId,
        status: 'completed',
        transferred: true,
        transfer_to_extension: selectedTransferExtension,
        end_time: new Date().toISOString()
      });

      setCallStatus('completed');
      setActiveSession(null);
      setCurrentCallId(null);
      callStartRef.current = null;
      cleanupRemoteAudio();
      setShowTransferPopup(false);
    } catch (error) {
      showErrorAlert('Falha ao transferir chamada', formatAxiosError(error));
    } finally {
      setTransferSubmitting(false);
    }
  };

  useEffect(() => {
    loadSipSettings();
  }, []);

  useEffect(() => {
    loadStoredSipCredentials();
  }, [storedUser?.id]);

  useEffect(() => {
    localStorage.setItem(sipUserStorageKey, sipUsername);
    localStorage.setItem(sipPassStorageKey, sipPassword);
    localStorage.setItem(sipNameStorageKey, sipDisplayName);
  }, [sipDisplayName, sipNameStorageKey, sipPassStorageKey, sipPassword, sipUserStorageKey, sipUsername]);

  useEffect(() => {
    return () => {
      disconnectSip();
      cleanupRemoteAudio();
    };
  }, []);

  useEffect(() => {
    if (!storedUser?.id) return;

    SocketService.connect();
    SocketService.socket?.emit('register_for_calls', { user_id: storedUser.id });

    const onCallStatus = (payload: any) => {
      if (!payload?.call_id) return;

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

  const hasCallInProgress = Boolean(activeSession || currentCallId);
  const sipDisconnected = !isSipReady;
  const hasSipCredentials = sipUsername.trim() !== '' && sipPassword.trim() !== '';
  const canConnectSip = sipDisconnected && !isSipConnecting && hasSipCredentials;
  const callStatusStyle = getCallStatusStyle();
  const sipStatusStyle = getSipStatusStyle();
  const CallStatusIcon = callStatusStyle.icon;
  const SipStatusIcon = sipStatusStyle.icon;

  return (
    <>
      <div className="bg-slate-800/50 rounded-lg p-6 max-w-sm mx-auto">
        <audio ref={remoteAudioRef} autoPlay playsInline />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isSipReady ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-white font-semibold">Discador</span>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="w-6 h-4 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-xs">🇧🇷</span>
          </div>
          <div className="flex-1 bg-slate-700 rounded px-3 py-2 min-h-[40px] flex items-center">
            <span className="text-white font-mono text-lg">{phoneNumber || ''}</span>
          </div>
        </div>

        <div className="flex justify-center space-x-8 mb-6">
          <button
            onClick={() => setPhoneNumber('')}
            disabled={sipDisconnected}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Limpar número discado"
          >
            <Eraser size={20} className="text-purple-400" />
          </button>
          <button
            onClick={openContactsPopup}
            disabled={sipDisconnected}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Visualizar contatos"
          >
            <User size={20} className="text-purple-400" />
          </button>
          <button
            onClick={openTransferPopup}
            disabled={sipDisconnected || !hasCallInProgress}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Transferir chamada"
          >
            <PhoneForwarded size={20} className="text-purple-400" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {dialpadNumbers.flat().map((num) => (
            <button
            key={num}
            onClick={() => setPhoneNumber((prev) => prev + num)}
            disabled={sipDisconnected}
            className="h-14 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-xl font-semibold transition-colors"
          >
            {num}
          </button>
          ))}
        </div>

        <div className="flex justify-center space-x-8 mb-4">
          <button
            disabled={sipDisconnected}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Adicionar contato"
          >
            <UserPlus size={20} className="text-purple-400" />
          </button>
          {hasCallInProgress ? (
            <button
              onClick={handleHangup}
              disabled={sipDisconnected || isSubmitting}
              className="p-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              title="Encerrar ligação"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          ) : (
            <button
              onClick={handleCall}
              disabled={sipDisconnected || isSubmitting}
              className="p-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              title="Iniciar/atender ligação"
            >
              <Phone size={24} className="text-white" />
            </button>
          )}
          <button
            onClick={() => setPhoneNumber((prev) => prev.slice(0, -1))}
            disabled={sipDisconnected}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Delete size={20} className="text-purple-400" />
          </button>
        </div>

        <p className="text-center text-purple-400 text-xs">Não utilize o discador para realizar chamadas de emergência.</p>

        <div className="mt-3 space-y-2">
          <div className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${callStatusStyle.cls}`}>
            <CallStatusIcon size={14} />
            <span>Chamada: {callStatusStyle.label}</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome"
              value={sipDisplayName}
              onChange={(e) => setSipDisplayName(e.target.value)}
              disabled={isSipReady || isSipConnecting}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white placeholder:text-slate-400 disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Usuário SIP"
              value={sipUsername}
              onChange={(e) => setSipUsername(e.target.value)}
              disabled={isSipReady || isSipConnecting}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white placeholder:text-slate-400 disabled:opacity-60"
            />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <input
                  type={showSipPassword ? 'text' : 'password'}
                  placeholder="Senha SIP"
                  value={sipPassword}
                  onChange={(e) => setSipPassword(e.target.value)}
                  disabled={isSipReady || isSipConnecting}
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 pr-8 text-xs text-white placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowSipPassword((prev) => !prev)}
                  disabled={isSipReady || isSipConnecting}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white disabled:opacity-60"
                  title={showSipPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSipPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={isSipReady ? disconnectSip : connectSip}
                disabled={isSipReady ? isSipConnecting : !canConnectSip}
                className="px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-60"
                title={isSipReady ? 'Desconectar' : 'Conectar no SIP'}
              >
                {isSipReady ? <WifiOff size={16} /> : <RefreshCw size={16} className={isSipConnecting ? 'animate-spin' : ''} />}
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${sipStatusStyle.cls}`}>
            <SipStatusIcon size={14} />
            <span>{sipStatusStyle.label}</span>
          </div>
        </div>
      </div>

      {showTransferPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/65 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Transferir Chamada</h3>
              <button
                onClick={() => setShowTransferPopup(false)}
                className="text-slate-300 hover:text-white"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              {extensionsLoading && (
                <p className="text-sm text-slate-300">Carregando ramais...</p>
              )}

              {!extensionsLoading && extensions.length === 0 && (
                <p className="text-sm text-slate-300">Nenhum ramal disponível para transferência.</p>
              )}

              {!extensionsLoading && extensions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {extensions.map((extension) => (
                    <button
                      key={extension.id}
                      onClick={() => setSelectedTransferExtension(extension.extension_number)}
                      className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${
                        selectedTransferExtension === extension.extension_number
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-slate-700 bg-slate-800 hover:bg-slate-700/70'
                      }`}
                    >
                      <p className="text-white text-sm font-medium">{extension.display_name || extension.extension_number}</p>
                      <p className="text-slate-300 text-xs">Ramal: {extension.extension_number}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
              <button
                onClick={() => setShowTransferPopup(false)}
                className="px-3 py-2 rounded-md bg-slate-700 text-slate-100 hover:bg-slate-600 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferSubmitting || !selectedTransferExtension || extensionsLoading}
                className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 text-sm"
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactsPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/65 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Selecionar Contato</h3>
              <button onClick={() => setShowContactsPopup(false)} className="text-slate-300 hover:text-white" title="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {contactsLoading && <p className="text-sm text-slate-300">Carregando contatos...</p>}

                {!contactsLoading && filteredContacts.length === 0 && (
                  <p className="text-sm text-slate-300">Nenhum contato com telefone encontrado.</p>
                )}

                {!contactsLoading && filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${
                      selectedContactId === contact.id
                        ? 'border-green-400 bg-green-500/10'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700/70'
                    }`}
                  >
                    <p className="text-white text-sm font-medium">{contact.name || 'Sem nome'}</p>
                    <p className="text-slate-300 text-xs">{contact.phone}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
              <button onClick={() => setShowContactsPopup(false)} className="px-3 py-2 rounded-md bg-slate-700 text-slate-100 hover:bg-slate-600 text-sm">
                Cancelar
              </button>
              <button onClick={useSelectedContactPhone} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm">
                Usar telefone
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarDialer;
