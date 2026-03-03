import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Send, Paperclip, Smile, Mic, Eye, Clock, User, MessageSquare, Tag, CheckSquare, ArrowRight, X, Calendar, Bell, Home, FileText, Settings, Users, Menu, Grid3X3, Bot, Facebook, Instagram, MessageCircle, MessageSquareText, CircleAlert, Headset, Network } from 'lucide-react';
import SidebarDialer from './SidebarDialer';
import JoceAvatar from './JoceAvatar';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import TypingIndicator from './TypingIndicator';
import { chatService, userService } from '@/services/api';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import FormateHour from './ui/FormateHour';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MultiTagSelect } from './ui/multi-tag-select';
import FormateDateTime from './ui/FormateDateTime';
import { set } from 'react-hook-form';
import ChatObservation from './chat/ChatObservation';
import AddTagDialog from './chat/AddTagDialog';
import { getChatStatusDescription } from '@/lib/constantData';
import FormateTimeAge from './ui/FormateDateAge';
import TransferChat from './chat/TransferChat';
import { showQuestionAlert } from './ui/alert-dialog-question';
import SocketService from "@/services/SocketService";
import { Socket } from 'jssip';
import { channel } from 'diagnostics_channel';


const ChatVoip = () => {
  const [channelList, setChannelList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [activeChat, setActiveChat] = useState(-1);
  const [message, setMessage] = useState('');
  const [attendancePhase, setAttendancePhase] = useState<'before' | 'during' | 'after'>('before');
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);
  const [isDialerVisible, setIsDialerVisible] = useState(false);
  const [isJoceActive, setIsJoceActive] = useState(false);
  const [isJoceProcessing, setIsJoceProcessing] = useState(false);
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [isJuliaSpeaking, setIsJuliaSpeaking] = useState(false);
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef(null);
  const [unreads, setUnreads] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [ groupList, setGroupList ] = useState([]);
  const [ showObservation, setShowObservation] = useState(false);
  const [ showNewTags, setShowNewTags] = useState(false);
  const [ showTransfer, setShowTransfer] = useState(false);
  const prevSelectedChat = useRef<number | undefined>(undefined);
  
      // setUser(storedUser ? JSON.parse(storedUser) as User : null);
  
  // TAGS
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6b46c1");
  const [selectedTags, setSelectedTags] = useState([]);
  const [socket, setSocket] = useState(null);

  const sidebarItems = [
    // { id: 'menu', icon: Menu, hasNotification: false },
    // { id: 'bell', icon: Bell, hasNotification: true },
    // { id: 'home', icon: Home, hasNotification: false },
    { id: 'clock', icon: Clock, hasNotification: true, title: "Pendente de atendimento"},
    { id: 'chat', icon: MessageSquare, hasNotification: true, title: "Em atendimento (meus atendimentos)" },
    { id: 'folder', icon: FileText, hasNotification: true, title: "Em avaliação (Lead) Avaliação de satisfação do cliente" },
    { id: 'users', icon: Users, hasNotification: false, title: "Todos os atendimentos avaliados" },
    { id: 'grid', icon: Grid3X3, hasNotification: false },
    { id: 'network', icon: Network, hasNotification: false, title: "Grupos" },
    { id: 'headset', icon: Headset, hasNotification: false, title: "Outros Atendentes" },
    { id: 'tag', icon: Tag, hasNotification: false, title: "Marketing entrando em contato" },
    { id: 'settings', icon: Settings, hasNotification: false, title: "Configuração das APIs" },
  ];

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

  // const handleStartAttendance = () => {
  //   setAttendancePhase('during');
  // };

  const handleFinishAttendance = () => {
    setAttendancePhase('after');
  };

  const handleSidebarItemClick = (itemId: string) => {
    if (itemId === 'grid') {
      setIsDialerVisible(!isDialerVisible);
      return;
    } else if (itemId == 'clock') {
      getChannels('pending')
    } else if (itemId == 'chat') {
      getChannels('in_progress')
    } else if (itemId == 'folder') {
      getChannels('under_review')
    } else if (itemId == 'users') {
      getChannels('completed')
    } else if (itemId == 'network') {
      getChannels('groups')
    } else if (itemId == 'headset') {
      getChannels('users')
    }
    setActiveSidebarItem(itemId);
    setIsDialerVisible(false);
    setActiveChat(-1);
    setMessageList([]);

    
    // { id: 'folder', icon: FileText, hasNotification: true, title: "Em avaliação (Lead) Avaliação de satisfação do cliente" },
    // { id: 'tag', icon: Tag, hasNotification: false, title: "Marketing entrando em contato" },
    // { id: 'settings', icon: Settings, hasNotification: false, title: "Configuração das APIs" },

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
        // setMessages(prev => [...prev, aiMessage]);
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

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else {
      return parts[0][0].toUpperCase();
    }
  }

  const getChannels = async (type) => {
    try {
      setSelectedType(type);
      let response = null;
      if (type == 'groups') {
        response = await chatService.getChannelsGroups()
      } else if (type == 'users') {
        response = await chatService.getChannelsUsers();
      } else {
        response = await chatService.getChannelsStatus(type)
      }
      if (response.status == 200) {
        let channels = response.data.channels;
        channels.map((channel) => {
          channel.avatar = getInitials(channel.name);
        });
        setChannelList(channels);

      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Chats", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Chats", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Channels:', error);
        showErrorAlert('Erro ao carregar os Chats', formatAxiosError(error));
    }
  }

  const getUnreads = async () => {
    try {
      const response = await chatService.getUnreads()
      if (response.status == 200) {
        setUnreads(response.data.unreads);
        for (let index = 0; index < sidebarItems.length; index++) {
          const element = sidebarItems[index];
          if (element.id == 'clock') {
            element.hasNotification = response.data.unreads.pending > 0;
          } else if (element.id == 'chat') {
            element.hasNotification = response.data.unreads.my_channels > 0;
          } else if (element.id == 'users') {
            element.hasNotification = response.data.unreads.rating > 0;
          } else {
            element.hasNotification = false;
          }
        }
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Chats", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Chats", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Channels:', error);
        showErrorAlert('Erro ao carregar os Chats', formatAxiosError(error));
    }
  }

  const getTags = async () => {
    try {
      const response = await chatService.getTags()
      if (response.status == 200) {
        setTags(response.data.tags);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as Tags", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as Tags", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Tags:', error);
        showErrorAlert('Erro ao carregar as Tags', formatAxiosError(error));
    }
  }

  const itemHasNotification = (menuId) => {
    if (unreads == null)
      return false;
    if (menuId == 'clock') {
      return unreads.pending > 0;
    } else if (menuId == 'chat') {
      return unreads.my_channels > 0;
    } else if (menuId == 'users') {
      return unreads.rating > 0;
    } else {
      return false;
    }
  }

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActiveChat(-1);
        setMessageList([]);
        setMessage('');
      }
    };

    window.addEventListener("keydown", handleEsc);
    getUnreads();
    getGroups();
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const selectedChat = activeChat >= 0 ? channelList[activeChat] : null;

  const selectActiveChat = (chat, index) => {
    setActiveChat(index);
    chargeMessages(chat);
    getTags();
    getChannelTags(chat.id);
  }

  useEffect(() => {
    console.log("Selected Chat changed:", selectedChat);
    console.log("Current Socket:", socket);
    if (socket == null)
      setSocket(SocketService.connect());
    if (selectedChat == null) {
      let data = {
        user_id: storedUser.id,
        channel_id: prevSelectedChat.current !== undefined ? prevSelectedChat.current : null
      }
      SocketService.leaveRoom(data);
      return;
    }
    let data = {
      channel_id: selectedChat.id,
      user_id: storedUser.id
    }
    console.log("Joining room with data:", data);
    SocketService.joinRoom(data);

    const onMessage = (msg) => {
      console.log('New message received via Socket.IO:', msg);
      chargeMessages(selectedChat);
      getUnreads();
      getChannels(selectedType);
    };

    SocketService.on("new_message", onMessage);

    return () => {
      SocketService.off("new_message", onMessage);
      let data = {
        user_id: storedUser.id,
        channel_id: prevSelectedChat.current !== undefined ? prevSelectedChat.current : null
      }
      SocketService.leaveRoom(data);
    };
    prevSelectedChat.current = selectedChat?.id;
  }, [selectedChat]);

  function sortByCreatedAtAsc<T extends { created_at?: string }>(arr: T[]): T[] {
    return [...arr].sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : NaN;
      const tb = b.created_at ? Date.parse(b.created_at) : NaN;

      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return 1;
      if (Number.isNaN(tb)) return -1;

      return ta - tb; // Asc
    });
  }

  const chargeMessages = async (chat) => {
    try {
      const response = await chatService.getMessages(chat.id);
      if (response.status == 200) {
        let messages = response.data.messages;
        let sortedMessages = sortByCreatedAtAsc(messages);
        setMessageList(sortedMessages);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as Mensagens", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as Mensagens", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Messages:', error);
        showErrorAlert('Erro ao carregar as Mensagens', formatAxiosError(error));
    }
  }

  const getTimelineMessages = async (concatId) => {
    try {
      const response = await chatService.getContactMessages(concatId);
      if (response.status == 200) {
        let messages = response.data.messages;
        let sortedMessages = sortByCreatedAtAsc(messages);
        setMessageList(sortedMessages);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as Mensagens do Timeline", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as Mensagens do Timeline", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Timeline Messages:', error);
        showErrorAlert('Erro ao carregar as Mensagens do Timeline', formatAxiosError(error));
    }
  }

  const handleSendMessage = async () => {
    if (message != null  && message.trim() != '' && selectedChat != null) {
      try {
        const response = await chatService.sendMessage(selectedChat.id, message);
        if (response.status == 200 || response.status == 201) {
          chargeMessages(selectedChat);
          setMessage('');
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível postar Mensagem", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível postar Mensagem", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to post Message:', error);
          showErrorAlert('Erro ao postar Mensagem', formatAxiosError(error));
      }
    }
  }

  const getChannelTags = async (channelId) => {
    if (channelId != null) {
      try {
        const response = await chatService.getChannelTags(channelId);
        if (response.status == 200 || response.status == 201) {
          setSelectedTags(response.data.tags.map(tag => tag.id));
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível carregar Tag", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível carregar Tag", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to get Tag:', error);
          showErrorAlert('Erro ao carregar Tag', formatAxiosError(error));
      }
    }
  };

  const handleSelectTag = async (tagId) => {
    if (tagId != null) {
      try {
        const response = await chatService.setChannelTag(selectedChat.id, tagId);
        if (response.status == 200 || response.status == 201) {
          setSelectedTags([...selectedTags, tagId]);
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Adicionar Tag", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível Adicionar Tag", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to post Tag:', error);
          showErrorAlert('Erro ao Adicionar Tag', formatAxiosError(error));
      }
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (tagId != null) {
      try {
        const response = await chatService.delChannelTag(selectedChat.id, tagId);
        if (response.status == 200 || response.status == 201) {
          setSelectedTags(selectedTags.filter((t) => t !== tagId));
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Deletar Tag", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível Deletar Tag", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to Del Tag:', error);
          showErrorAlert('Erro ao Deletar Tag', formatAxiosError(error));
      }
    }
  };

  const assumeChat = async () => {
    try {
      const response = await chatService.assumeChannel(selectedChat.id);
      if (response.status == 200 || response.status == 201) {
        getChannels(selectedType);
        setMessageList([]);
        setTags([]);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível assumir Atendimento", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível assumir Atendimento", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to assume Chat:', error);
        showErrorAlert('Erro ao assumir Atendimento', formatAxiosError(error));
    }
  }

  const finishChatQuestion = (chat) => {
    showQuestionAlert('Encerrar Atendimento?',
      `Deseja realmente Encerrar o Atendimento ${chat.name}?`,
      chat.id,
      null,
      finishChat);
  }
    
  const finishChat = async (chatId) => {
    try {
      const response = await chatService.finishChanel(chatId);
      if (response.status == 200 || response.status == 201) {
        getChannels(selectedType);
        setMessageList([]);
        setTags([]);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível encerrar o Atendimento", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível encerrar o Atendimento", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to finish Chat:', error);
        showErrorAlert('Erro ao encerrar o Atendimento', formatAxiosError(error));
    }
  }

  const getGroups = async () => {
    try {
      const response = await userService.getGroups();
      if (response.status == 200) {
          setGroupList(response.data.groups);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Grupos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Grupos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Groups:', error);
        showErrorAlert('Erro ao carregar os Grupos', formatAxiosError(error));
    }
  }

  const handleCloseObservation = async () => {
    let chatId = selectedChat.id;
    await getChannels(selectedType);
    const newIndex = channelList.findIndex(c => c.id === chatId);

    if (newIndex !== -1) {
      setActiveChat(newIndex);
    } else {
      setActiveChat(-1);
    }
    setShowObservation(false);
  };

  const handleShowObservation = () => {
    setShowObservation(selectedChat != null);
  };

  const handleCloseNewTag = async () => {
    await getTags();
    setShowNewTags(false);
  };

  const handleTransferChat = async () => {
    getChannels(selectedType);
    setMessageList([]);
    setTags([]);
    setActiveChat(-1);
  }

  function formatChatDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()

    today.setHours(0, 0, 0, 0)
    yesterday.setDate(today.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const messageDate = new Date(date)
    messageDate.setHours(0, 0, 0, 0)

    if (messageDate.getTime() === today.getTime()) {
      return 'Hoje'
    }

    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Ontem'
    }

    return messageDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function shouldShowDateSeparator(
    currentMsg: any,
    previousMsg: any | null
  ) {
    if (!previousMsg) return true

    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()

    return currentDate !== previousDate
  }

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
                  <div key={item.id} className="relative" title={item.title}>
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
                    {/* {item.hasNotification && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                    )} */}
                    {itemHasNotification(item.id) && (
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
                  {channelList?.length
                    ? channelList.map((chat, index) => (
                    <div
                      key={chat.id}
                      onClick={() => selectActiveChat(chat, index)}
                      className={`p-4 border-b border-purple-500/10 cursor-pointer transition-colors ${
                        activeChat === index ? 'bg-purple-500/20' : 'hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          { chat.contact?.profile_picture == null && chat.contact?.profile_picture != '' ?  (
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {chat.avatar}
                            </div>
                          ) : (
                            <img src={chat.contact?.profile_picture} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                          )}
                          {chat.channel_mode == 'contact' && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 text-white ${getPlatformColor(chat.channel_type)} rounded-full border-2 border-slate-900`}
                              title={chat.channel_type}>
                              {/* <chat.icon size={12}/> */}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-white">{chat.name}</h4>
                            { chat.last_message_time && (
                              <span className="text-xs text-purple-400">{FormateHour(chat.last_message_time)}</span>
                            )}
                          </div>
                          <p className="text-sm text-purple-300 truncate">{chat.last_message}</p>
                        </div>
                        {chat.unread > 0 && (
                          <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                  : 
                  <div className="items-center"
                  >
                    <div className="flex-1 space-x-3">
                      <div></div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-white">Não há Conversas</h4>
                      </div>
                      <div></div>
                    </div>
                  </div>
                }
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="p-4 border-b border-purple-500/20 bg-slate-900/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      { selectedChat && (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedChat?.avatar}
                        </div>
                      )}
                      { selectedChat && (
                        <div>
                          <h3 className="font-semibold text-white">{selectedChat?.name}</h3>
                          {/* <p className="text-sm text-green-400">Online</p> */}
                        </div>
                      )}
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
                  {messageList.map((msg, index) => {
                    const previousMsg = index > 0 ? messageList[index - 1] : null
                    const showDateSeparator = shouldShowDateSeparator(msg, previousMsg)

                    return (
                      <div key={msg.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 text-xs text-slate-300 bg-slate-800 rounded-full">
                              {formatChatDate(msg.created_at)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            msg.is_from_user 
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
                            {msg.is_from_user && (
                              <div className="flex items-center space-x-1 mb-1">
                                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User size={12} className="text-gray-600" />
                                </div>
                                <span className="text-xs text-white-200">{msg.user.full_name}</span>
                              </div>
                            )}
                            {!msg.is_from_user && !msg.isAI && (
                              <div className="flex items-center space-x-1 mb-1">
                                { selectedChat?.contact?.profile_picture == null || selectedChat?.contact?.profile_picture == '' ? (  
                                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                                    <User size={12} className="text-gray-600" />
                                  </div>
                                ) : (
                                  <img src={selectedChat?.contact?.profile_picture} alt="Profile" className="w-4 h-4 rounded-full" />
                                )}
                                <span className="text-xs text-white-200">{selectedChat?.name}</span>
                              </div>
                            )}

                            <p>{msg.content}</p>

                            <p className={`text-xs mt-1 ${
                              msg.is_from_user 
                                ? 'text-purple-200' 
                                : msg.isAI 
                                ? 'text-pink-200' 
                                : 'text-purple-400'
                            }`}>
                              {FormateHour(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <TypingIndicator isVisible={isJoceProcessing} aiName="Joce" />
                </div>

                <div className="p-4 border-t border-purple-500/20 bg-slate-900/30">
                  <div className="flex items-center space-x-2">
                    {/* <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('paperclip', e);
                        }
                      }}
                      className="p-2 text-purple-400 hover:text-purple-300"
                    >
                      <Paperclip size={20} />
                    </button> */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    {/* <button 
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
                    </button> */}
                    <button 
                      onClick={(e) => {
                        if (isJuliaActive) {
                          handleJuliaClick('send', e);
                        } else {
                          handleSendMessage();
                        }
                      }}
                      className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                      disabled={selectActiveChat == null}
                    >
                      <Send size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Panel */}
              <div className="lg:col-span-3 bg-slate-900/50 border-l border-purple-500/20 p-4">
                <div className="space-y-4">
                  {selectedChat != null && selectedChat.channel_mode == 'contact' && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-4">
                        { selectedChat?.contact?.profile_picture == null || selectedChat?.contact?.profile_picture == '' ? (  
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={32} className="text-gray-600" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                            <img src={selectedChat?.contact?.profile_picture} alt="Profile" className="w-16 h-16 rounded-full" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center mb-4">
                        <h4 className="text-white font-semibold text-lg">{selectedChat?.name}</h4>
                        <p className="text-purple-400 text-sm">{selectedChat?.customerCode}</p>
                        <p className="text-purple-400 text-sm">{selectedChat?.phone}</p>
                      </div>

                          { selectedChat?.user_id == null ? (
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors mb-4"
                              onClick={assumeChat}
                            >
                              Atribuir a mim
                            </button>
                          ) : (
                            <>
                              { selectedChat?.user_id == storedUser?.id && (
                                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm text-center mb-4">
                                  Atribuído a você
                                </div>
                              )}
                              { selectedChat?.user_id != storedUser?.id && (
                                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm text-center mb-4">
                                  Atribuído para <span>{selectedChat?.user?.full_name}</span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/*
                          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors mb-4">
                            Visualizar dashboard
                          </button> */}
                          
                          <div className="space-y-2 text-sm text-purple-300 mb-4">
                            <div className="flex items-center space-x-2">
                              <CircleAlert size={14} />
                              <span>Status: <b>{getChatStatusDescription(selectedChat?.status)}</b></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>Atendimento aberto em <b>{FormateDateTime(selectedChat?.created_at)}</b></span>
                            </div>
                            { selectedChat?.status != 'pending' && (
                              <div className="flex items-center space-x-2">
                                <Clock size={14} />
                                <span>Tempo total em atendimento: <b>{FormateTimeAge(selectedChat?.assumed_at, selectedChat?.finished_at)}</b></span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <User size={14} />
                              <span>Nesta fila há <b>{FormateTimeAge(selectedChat?.created_at, selectedChat?.finished_at)}</b></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageSquare size={14} />
                              <span>WhatsApp {selectedChat?.contact?.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Tag size={14} />
                              <span>Protocolo: {selectedChat?.protocol}</span>
                            </div>
                          </div>

                          <button 
                            onClick={handleShowObservation}
                            disabled={!selectedChat?.user_id}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Observações
                          </button>

                          <Label className="text-purple-300 text-sm">Grupo do atendimento</Label>
                          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm text-center mb-3">
                            { selectedChat?.user_group != null ? (
                              <Label>{selectedChat?.user_group?.name}</Label>
                            ) : (
                              <Label>Nenhum</Label>
                            )}
                          </div>


                          <div className="space-y-2 mb-4">
                            <Label className="text-purple-300 text-sm">Vincular etiquetas</Label>
                            <div className="grid grid-cols-[90%_10%] gap-2">
                              <MultiTagSelect className="bg-slate-800 border-purple-500/30 text-white"
                                tags={tags}
                                value={selectedTags} // array de IDs
                                addTag={handleSelectTag}
                                removeTag={handleRemoveTag}
                                readOnly={selectedChat?.user_id != storedUser?.id || selectedChat?.status == 'completed'}
                              />
                              <button 
                                onClick={(e) => setShowNewTags(true)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-1 rounded-lg transition-colors"
                              >
                                <Plus size={24} />
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-2 mb-4">
                            <button 
                              disabled={!selectedChat?.user_id || selectedChat?.status != 'in_progress'}
                              onClick={(e) => {
                                if (isJuliaActive) {
                                  handleJuliaClick('transfer', e);
                                } else {
                                  setShowTransfer(true);
                                }
                              }}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Transferir
                            </button>
                            <button 
                              disabled={!selectedChat?.contact_id}
                              onClick={(e) => {
                                if (isJuliaActive) {
                                  handleJuliaClick('timeline', e);
                                } else {
                                  getTimelineMessages(selectedChat?.contact_id);
                                }
                              }}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Timeline
                            </button>
                          </div>
                          { selectedChat?.user_id != null && selectedChat?.status != 'completed' && (
                            <button 
                              onClick={(e) => {
                                handleFinishAttendance();
                                if (isJuliaActive) {
                                  handleJuliaClick('finish', e);
                                } else {
                                  finishChatQuestion(selectedChat);
                                }
                              }}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                              Encerrar
                            </button>
                          )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Julia Speech Bubble */}
      {isJuliaSpeaking && (
        <JuliaSpeechBubble
          isVisible={isJuliaSpeaking}
          message={juliaMessage}
          onClose={handleJuliaClose}
          position={juliaPosition}
        />
      )}
      {showObservation && selectedChat != null && (
        <ChatObservation
          observation={selectedChat?.observation}
          chatId={selectedChat?.id}
          onClose={handleCloseObservation}
          canEdit={selectedChat?.status != 'completed'}
          // onElementClick={handleJuliaClick}
          // isJuliaActive={isJuliaActive}
        />
      )}
      {showNewTags && selectedChat != null && (
        <AddTagDialog
          tags={tags}
          onClose={handleCloseNewTag}
          // onElementClick={handleJuliaClick}
          // isJuliaActive={isJuliaActive}
        />
      )}

      {showTransfer && selectedChat != null && (
        <TransferChat
          chat={selectedChat}
          onClose={() => setShowTransfer(false)}
          onTransfer={handleTransferChat}
        />
      )}
    </div>
  );
};

export default ChatVoip;
