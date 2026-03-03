import React, { useState } from 'react';
import { Search, Plus, Send, Paperclip, Smile, Mic, Eye, Clock, User, MessageSquare, Tag, CheckSquare, ArrowRight, X, Calendar, Bell, Home, FileText, Settings, Users, Menu, Grid3X3, Bot } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SidebarDialer from './SidebarDialer';
import JoceAvatar from './JoceAvatar';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import TypingIndicator from './TypingIndicator';

const ChatVoip = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [message, setMessage] = useState('');
  const [attendancePhase, setAttendancePhase] = useState<'before' | 'during' | 'after'>('before');
  const [activeSidebarItem, setActiveSidebarItem] = useState('chat');
  const [isDialerVisible, setIsDialerVisible] = useState(false);
  const [isJoceActive, setIsJoceActive] = useState(false);
  const [isJoceProcessing, setIsJoceProcessing] = useState(false);
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [isJuliaSpeaking, setIsJuliaSpeaking] = useState(false);
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });

  const sidebarItems = [
    { id: 'menu', icon: Menu, hasNotification: false },
    { id: 'bell', icon: Bell, hasNotification: true },
    { id: 'home', icon: Home, hasNotification: false },
    { id: 'clock', icon: Clock, hasNotification: true },
    { id: 'chat', icon: MessageSquare, hasNotification: true },
    { id: 'folder', icon: FileText, hasNotification: true },
    { id: 'users', icon: Users, hasNotification: false },
    { id: 'grid', icon: Grid3X3, hasNotification: false },
    { id: 'tag', icon: Tag, hasNotification: false },
    { id: 'settings', icon: Settings, hasNotification: false },
  ];

  const chats = [
    { 
      id: 1, 
      name: 'Fran', 
      platform: 'whatsapp', 
      lastMessage: 'Olá, gostaria de saber mais sobre...', 
      time: '10:30', 
      unread: 2, 
      avatar: 'F',
      phone: '+55 41 99964 5165',
      protocol: 'OPA202544335',
      attendanceStart: '15/06/2023 00:47:33',
      totalTime: '2 horas',
      queueTime: '2 horas',
      customerCode: '2425 - Claudenice de Oliveira Paz',
      whatsappNumber: '554232724200'
    },
    { id: 2, name: 'Maria Santos', platform: 'instagram', lastMessage: 'Obrigada pelo atendimento!', time: '09:45', unread: 0, avatar: 'MS' },
    { id: 3, name: 'Pedro Costa', platform: 'facebook', lastMessage: 'Quando vocês abrem?', time: '09:15', unread: 1, avatar: 'PC' },
    { id: 4, name: 'Ana Oliveira', platform: 'whatsapp', lastMessage: 'Perfeito, vou aguardar', time: '08:30', unread: 0, avatar: 'AO' },
  ];

  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Como posso ajudá-lo hoje?', sent: false, time: '10:25', isAI: false },
    { id: 2, text: 'Olá, gostaria de saber mais sobre seus produtos', sent: true, time: '10:26', isAI: false },
    { id: 3, text: 'Claro! Temos várias opções disponíveis. Qual tipo de produto você está procurando?', sent: false, time: '10:27', isAI: false },
    { id: 4, text: 'Estou interessado em produtos para casa', sent: true, time: '10:30', isAI: false },
  ]);

  // Função para obter explicações da Julia
  const getJuliaExplanation = (elementType: string) => {
    const explanations: Record<string, string> = {
      'search': 'Esta é a barra de pesquisa onde você pode buscar por conversas específicas digitando o nome do cliente ou palavras-chave das mensagens.',
      'plus': 'Este botão permite iniciar uma nova conversa com um cliente. Clique aqui para criar um novo atendimento.',
      'joce': 'Este é o botão para ativar a Joce, nossa assistente de IA. Ela pode ajudar a responder mensagens automaticamente e dar sugestões de resposta.',
      'send': 'Use este botão para enviar sua mensagem digitada para o cliente. Você também pode pressionar Enter no teclado.',
      'paperclip': 'Este ícone permite anexar arquivos à conversa, como imagens, documentos ou outros tipos de arquivo.',
      'smile': 'Clique aqui para adicionar emojis à sua mensagem e tornar a conversa mais expressiva.',
      'mic': 'Este botão permite gravar mensagens de áudio para enviar ao cliente.',
      'attend': 'Use este botão para iniciar o atendimento oficial do cliente e marcar o início do suporte.',
      'finish': 'Este botão encerra o atendimento atual e marca a conversa como finalizada.',
      'transfer': 'Use esta opção para transferir o atendimento para outro agente ou departamento.',
      'timeline': 'Visualize o histórico completo de interações e eventos relacionados a este cliente.',
    };
    
    return explanations[elementType] || 'Esta é uma funcionalidade do sistema. Clique para usar ou explore para descobrir mais sobre ela.';
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  const handleStartAttendance = () => {
    setAttendancePhase('during');
  };

  const handleFinishAttendance = () => {
    setAttendancePhase('after');
  };

  const handleSidebarItemClick = (itemId: string) => {
    if (itemId === 'grid') {
      setIsDialerVisible(!isDialerVisible);
    } else {
      setActiveSidebarItem(itemId);
      setIsDialerVisible(false);
    }
  };

  const handleActivateJoce = () => {
    if (isJuliaActive) {
      handleJuliaClick('joce', { clientX: 800, clientY: 200 });
      return;
    }
    
    setIsJoceActive(!isJoceActive);
    if (!isJoceActive) {
      setIsJoceProcessing(true);
      setTimeout(() => {
        setIsJoceProcessing(false);
        const aiMessage = {
          id: Date.now(),
          text: 'Olá! Sou a Joce, sua assistente de IA. Estou analisando a conversa e posso ajudar com sugestões de resposta.',
          sent: false,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isAI: true
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 3000);
    }
  };

  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaSpeaking) {
      setIsJuliaSpeaking(false);
    }
  };

  const handleJuliaClick = (elementType: string, event: { clientX: number; clientY: number }) => {
    if (!isJuliaActive) return;
    
    const explanation = getJuliaExplanation(elementType);
    setJuliaMessage(explanation);
    setJuliaPosition({ x: event.clientX, y: event.clientY });
    setIsJuliaSpeaking(true);
  };

  const handleJuliaClose = () => {
    setIsJuliaSpeaking(false);
  };

  const selectedChat = chats[activeChat];

  return (
    <div className="p-6 h-full">
      <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* Left Sidebar */}
          <div className="bg-slate-900/70 border-r border-purple-500/20 flex flex-col items-center py-4">
            <div className="space-y-3">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={(e) => {
                        handleSidebarItemClick(item.id);
                        if (isJuliaActive) {
                          handleJuliaClick(item.id, e);
                        }
                      }}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        (activeSidebarItem === item.id || (item.id === 'grid' && isDialerVisible))
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                    {item.hasNotification && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Conditional Rendering: Dialer or Chat Interface */}
          {isDialerVisible ? (
            <div className="lg:col-span-11 flex items-center justify-center">
              <SidebarDialer 
                isVisible={isDialerVisible} 
                onClose={() => setIsDialerVisible(false)} 
              />
            </div>
          ) : (
            <>
              {/* Chat List */}
              <div className="lg:col-span-3 bg-slate-900/50 border-r border-purple-500/20">
                <div className="p-4 border-b border-purple-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Conversas</h2>
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('plus', e);
                        }
                      }}
                      className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Plus size={18} className="text-white" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search 
                      size={18} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 cursor-pointer" 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('search', e);
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar conversas..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto">
                  {chats.map((chat, index) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(index)}
                      className={`p-4 border-b border-purple-500/10 cursor-pointer transition-colors ${
                        activeChat === index ? 'bg-purple-500/20' : 'hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {chat.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getPlatformColor(chat.platform)} rounded-full border-2 border-slate-900`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-white">{chat.name}</h4>
                            <span className="text-xs text-purple-400">{chat.time}</span>
                          </div>
                          <p className="text-sm text-purple-300 truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unread > 0 && (
                          <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="p-4 border-b border-purple-500/20 bg-slate-900/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedChat?.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{selectedChat?.name}</h3>
                        <p className="text-sm text-green-400">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleActivateJoce}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          isJoceActive 
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30' 
                            : 'bg-purple-500/20 hover:bg-purple-500/30'
                        }`}
                      >
                        <JoceAvatar isActive={isJoceActive} isProcessing={isJoceProcessing} />
                      </button>
                      <button 
                        onClick={handleJuliaToggle}
                        className="p-2 rounded-lg transition-all duration-300"
                      >
                        <JuliaAvatar isActive={isJuliaActive} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sent 
                          ? 'bg-purple-500 text-white rounded-br-sm' 
                          : msg.isAI
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-bl-sm border border-pink-500/30'
                          : 'bg-slate-700 text-white rounded-bl-sm'
                      }`}>
                        {msg.isAI && (
                          <div className="flex items-center space-x-1 mb-1">
                            <Bot size={12} className="text-pink-200" />
                            <span className="text-xs text-pink-200">Joce IA</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sent 
                            ? 'text-purple-200' 
                            : msg.isAI 
                            ? 'text-pink-200' 
                            : 'text-purple-400'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <TypingIndicator isVisible={isJoceProcessing} aiName="Joce" />
                </div>

                <div className="p-4 border-t border-purple-500/20 bg-slate-900/30">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('paperclip', e);
                        }
                      }}
                      className="p-2 text-purple-400 hover:text-purple-300"
                    >
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('smile', e);
                        }
                      }}
                      className="p-2 text-purple-400 hover:text-purple-300"
                    >
                      <Smile size={20} />
                    </button>
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('mic', e);
                        }
                      }}
                      className="p-2 text-purple-400 hover:text-purple-300"
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('send', e);
                        }
                      }}
                      className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Send size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Panel */}
              <div className="lg:col-span-3 bg-slate-900/50 border-l border-purple-500/20 p-4">
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={32} className="text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h4 className="text-white font-semibold text-lg">{selectedChat?.name}</h4>
                      <p className="text-purple-400 text-sm">{selectedChat?.customerCode}</p>
                      <p className="text-purple-400 text-sm">{selectedChat?.phone}</p>
                    </div>

                    {attendancePhase === 'before' && (
                      <>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors mb-4">
                          Atribuir a mim
                        </button>
                        
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors mb-4">
                          Visualizar dashboard
                        </button>
                        
                        <div className="space-y-2 text-sm text-purple-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} />
                            <span>Atendimento aberto em {selectedChat?.attendanceStart}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>Tempo total em atendimento: {selectedChat?.totalTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User size={14} />
                            <span>Nesta fila há {selectedChat?.queueTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageSquare size={14} />
                            <span>WhatsApp {selectedChat?.whatsappNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Tag size={14} />
                            <span>Protocolo: {selectedChat?.protocol}</span>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            handleStartAttendance();
                            if (isJuliaActive) {
                              handleJuliaClick('attend', e);
                            }
                          }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Atender
                        </button>
                      </>
                    )}

                    {attendancePhase === 'during' && (
                      <>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors mb-4">
                          Atribuir a mim
                        </button>
                        
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors mb-4">
                          Visualizar dashboard
                        </button>
                        
                        <div className="space-y-2 text-sm text-purple-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} />
                            <span>Atendimento aberto em {selectedChat?.attendanceStart}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>Tempo total em atendimento: {selectedChat?.totalTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User size={14} />
                            <span>Nesta fila há segundos</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageSquare size={14} />
                            <span>WhatsApp 554232724200</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Tag size={14} />
                            <span>Protocolo: {selectedChat?.protocol}</span>
                          </div>
                        </div>

                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors mb-3">
                          Nova observação
                        </button>

                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm text-center mb-3">
                          Suporte ✓
                        </div>

                        <div className="space-y-2 mb-4">
                          <label className="text-purple-300 text-sm">Informar motivo do atendimento</label>
                          <Select>
                            <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suporte">Suporte técnico</SelectItem>
                              <SelectItem value="comercial">Comercial</SelectItem>
                              <SelectItem value="financeiro">Financeiro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 mb-4">
                          <label className="text-purple-300 text-sm">Vincular etiquetas</label>
                          <Select>
                            <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgente">Urgente</SelectItem>
                              <SelectItem value="importante">Importante</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="fixar" className="rounded" />
                            <label htmlFor="fixar" className="text-purple-300 text-sm">Fixar atendimento no topo</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="aguardar" className="rounded" />
                            <label htmlFor="aguardar" className="text-purple-300 text-sm">Aguardando resposta do cliente</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="pendencia" className="rounded" />
                            <label htmlFor="pendencia" className="text-purple-300 text-sm">Pendência externa</label>
                          </div>
                        </div>

                        <div className="flex space-x-2 mb-4">
                          <button 
                            onClick={(e) => {
                              if (isJuliaActive) {
                                handleJuliaClick('transfer', e);
                              }
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Transferir
                          </button>
                          <button 
                            onClick={(e) => {
                              if (isJuliaActive) {
                                handleJuliaClick('timeline', e);
                              }
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Timeline
                          </button>
                        </div>

                        <button 
                          onClick={(e) => {
                            handleFinishAttendance();
                            if (isJuliaActive) {
                              handleJuliaClick('finish', e);
                            }
                          }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Encerrar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={isJuliaSpeaking}
        message={juliaMessage}
        onClose={handleJuliaClose}
        position={juliaPosition}
      />
    </div>
  );
};

export default ChatVoip;
