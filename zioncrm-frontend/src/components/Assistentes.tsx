import React, { useEffect, useState } from 'react';
import { Bot, Send, Mic, FileText, Heart, Code, Gem, Flower, Shield, X, Calendar, Compass, UserCheck, Users2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';
import { assistantsService, leadsDashRaizenService } from '@/services/api';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  specialties: { name: string; description: string; bgColor: string; textColor: string }[];
  initialMessage: string;
  placeholderText: string;
}

interface ActivationState {
  isActivated: boolean;
  showKeyDialog: boolean;
  showResultDialog: boolean;
  isSuccess: boolean;
  key: string;
}

interface ChatChart {
  title: string;
  description?: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
}

const assistants: Assistant[] = [
  {
    id: 'julia',
    name: 'Julia',
    description: 'Guia do sistema CRM - Te ajuda a navegar e entender todas as funcionalidades',
    icon: Compass,
    color: 'indigo',
    bgGradient: 'from-indigo-500 to-purple-600',
    specialties: [
      { name: 'Navegação do Sistema', description: 'Como usar cada módulo do CRM', bgColor: 'bg-indigo-50', textColor: 'text-indigo-900' },
      { name: 'Configurações', description: 'Setup e personalização', bgColor: 'bg-purple-50', textColor: 'text-purple-900' },
      { name: 'Onboarding', description: 'Primeiros passos no sistema', bgColor: 'bg-blue-50', textColor: 'text-blue-900' }
    ],
    initialMessage: 'Olá! Eu sou a Julia, sua guia no ZION CRM! Posso te ajudar a entender como funciona cada seção do sistema. Qual funcionalidade você gostaria de conhecer?',
    placeholderText: 'Pergunte sobre qualquer funcionalidade do sistema...'
  },
  {
    id: 'raizen',
    name: 'Raizen',
    description: 'Especialista em vendas e estratégias comerciais',
    icon: FileText,
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    specialties: [
      { name: 'Estratégias de Vendas', description: 'Técnicas e abordagens eficazes', bgColor: 'bg-purple-50', textColor: 'text-purple-900' },
      { name: 'Análise de Pipeline', description: 'Otimização do funil de vendas', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Negociação', description: 'Táticas para fechar negócios', bgColor: 'bg-green-50', textColor: 'text-green-900' }
    ],
    initialMessage: 'Olá! Eu sou o Raizen, seu assistente especializado em vendas. Como posso ajudar você hoje?',
    placeholderText: 'Digite sua pergunta para o Raizen...'
  },
  {
    id: 'brayan',
    name: 'Brayan',
    description: 'Especialista em soluções técnicas e automações',
    icon: Code,
    color: 'blue',
    bgGradient: 'from-blue-500 to-cyan-600',
    specialties: [
      { name: 'Integrações', description: 'APIs e webhooks', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Automações', description: 'Fluxos e workflows', bgColor: 'bg-green-50', textColor: 'text-green-900' },
      { name: 'Desenvolvimento', description: 'Soluções customizadas', bgColor: 'bg-purple-50', textColor: 'text-purple-900' }
    ],
    initialMessage: 'E aí! Sou o Brayan, seu assistente técnico! Posso te ajudar com integrações, automações e soluções técnicas. Qual é o desafio hoje?',
    placeholderText: 'Digite sua pergunta técnica para o Brayan...'
  },
  {
    id: 'joce',
    name: 'Joce',
    description: 'Especialista em atendimento ao cliente e relacionamento',
    icon: Heart,
    color: 'pink',
    bgGradient: 'from-pink-500 to-rose-600',
    specialties: [
      { name: 'Atendimento ao Cliente', description: 'Suporte e resolução de problemas', bgColor: 'bg-pink-50', textColor: 'text-pink-900' },
      { name: 'Relacionamento', description: 'Fidelização e retenção', bgColor: 'bg-purple-50', textColor: 'text-purple-900' },
      { name: 'Satisfação', description: 'Pesquisas e feedback', bgColor: 'bg-blue-50', textColor: 'text-blue-900' }
    ],
    initialMessage: 'Oi! Eu sou a Joce, sua assistente de atendimento ao cliente! Estou aqui para ajudar com suporte e relacionamento. Em que posso ajudar?',
    placeholderText: 'Digite sua pergunta para a Joce...'
  },
  {
    id: 'cristal',
    name: 'Cristal',
    description: 'Especialista em análise de dados e relatórios',
    icon: Gem,
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    specialties: [
      { name: 'Business Intelligence', description: 'Análise de dados avançada', bgColor: 'bg-emerald-50', textColor: 'text-emerald-900' },
      { name: 'Relatórios', description: 'Dashboards e métricas', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Insights', description: 'Tendências e previsões', bgColor: 'bg-purple-50', textColor: 'text-purple-900' }
    ],
    initialMessage: 'Olá! Sou a Cristal, especialista em análise de dados. Posso te ajudar a extrair insights valiosos dos seus dados. O que gostaria de analisar?',
    placeholderText: 'Digite sua pergunta sobre dados para a Cristal...'
  },
  {
    id: 'erivaldo',
    name: 'Erivaldo',
    description: 'Especialista em marketing digital e estratégias online',
    icon: Flower,
    color: 'rose',
    bgGradient: 'from-rose-500 to-pink-600',
    specialties: [
      { name: 'Marketing Digital', description: 'Estratégias online e SEO', bgColor: 'bg-rose-50', textColor: 'text-rose-900' },
      { name: 'Campanhas', description: 'Criação e otimização', bgColor: 'bg-purple-50', textColor: 'text-purple-900' },
      { name: 'Redes Sociais', description: 'Gestão e engajamento', bgColor: 'bg-blue-50', textColor: 'text-blue-900' }
    ],
    initialMessage: 'Oi! Eu sou o Erivaldo, seu especialista em marketing digital! Posso te ajudar com campanhas, redes sociais e estratégias de marketing. Vamos começar?',
    placeholderText: 'Digite sua pergunta de marketing para o Erivaldo...'
  },
  {
    id: 'kelly',
    name: 'Kelly',
    description: 'Especialista em agenda e gestão de tempo',
    icon: Calendar,
    color: 'cyan',
    bgGradient: 'from-cyan-500 to-blue-600',
    specialties: [
      { name: 'Gestão de Agenda', description: 'Organização de compromissos', bgColor: 'bg-cyan-50', textColor: 'text-cyan-900' },
      { name: 'Agendamentos', description: 'Marcação e remarcação', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Produtividade', description: 'Otimização de tempo', bgColor: 'bg-green-50', textColor: 'text-green-900' }
    ],
    initialMessage: 'Olá! Eu sou a Kelly, sua assistente de agenda! Posso te ajudar com agendamentos, organização de compromissos e gestão de tempo. Como posso ajudar?',
    placeholderText: 'Digite sua pergunta sobre agenda para a Kelly...'
  },
  {
    id: 'emanuel',
    name: 'Emanuel',
    description: 'Especialista em segurança e compliance',
    icon: Shield,
    color: 'slate',
    bgGradient: 'from-slate-600 to-gray-700',
    specialties: [
      { name: 'Segurança', description: 'Proteção de dados e sistemas', bgColor: 'bg-slate-50', textColor: 'text-slate-900' },
      { name: 'Compliance', description: 'Conformidade e regulamentações', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Auditoria', description: 'Monitoramento e logs', bgColor: 'bg-green-50', textColor: 'text-green-900' }
    ],
    initialMessage: 'Olá! Sou o Emanuel, especialista em segurança e compliance. Posso te ajudar com proteção de dados, conformidade e auditoria. Como posso ajudar?',
    placeholderText: 'Digite sua pergunta sobre segurança para o Emanuel...'
  },
  {
    id: 'rodolfo',
    name: 'Rodolfo',
    description: 'Especialista em recursos humanos e gestão de equipe',
    icon: UserCheck,
    color: 'indigo',
    bgGradient: 'from-indigo-500 to-blue-600',
    specialties: [
      { name: 'Gestão de Pessoas', description: 'Administração de equipes', bgColor: 'bg-indigo-50', textColor: 'text-indigo-900' },
      { name: 'Recrutamento', description: 'Seleção e contratação', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
      { name: 'Desenvolvimento', description: 'Treinamento e capacitação', bgColor: 'bg-green-50', textColor: 'text-green-900' }
    ],
    initialMessage: 'Olá! Eu sou o Rodolfo, especialista em recursos humanos! Posso te ajudar com gestão de equipe, recrutamento e desenvolvimento de pessoas. Como posso ajudar?',
    placeholderText: 'Digite sua pergunta sobre RH para o Rodolfo...'
  },
  {
    id: 'ione',
    name: 'Ione',
    description: 'Especialista em logística e operações',
    icon: Users2,
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    specialties: [
      { name: 'Logística', description: 'Gestão de estoque e distribuição', bgColor: 'bg-amber-50', textColor: 'text-amber-900' },
      { name: 'Operações', description: 'Processos e workflows', bgColor: 'bg-orange-50', textColor: 'text-orange-900' },
      { name: 'Supply Chain', description: 'Cadeia de suprimentos', bgColor: 'bg-yellow-50', textColor: 'text-yellow-900' }
    ],
    initialMessage: 'Olá! Eu sou a Ione, especialista em logística e operações! Posso te ajudar com gestão de estoque, processos operacionais e supply chain. Como posso ajudar?',
    placeholderText: 'Digite sua pergunta sobre logística para a Ione...'
  }
];

const Assistentes = () => {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [messages, setMessages] = useState<{ id: number; type: 'user' | 'bot'; content: string; chart?: ChatChart | null }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activationStates, setActivationStates] = useState<Record<string, ActivationState>>({});
  const [isApiActivated, setIsApiActivated] = useState(false);
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);

  useEffect(() => {
    const loadActivationStatus = async () => {
      try {
        const response = await assistantsService.getActivationStatus();
        setIsApiActivated(Boolean(response?.data?.is_activated));
      } catch (error) {
        setIsApiActivated(false);
      }
    };

    loadActivationStatus();
  }, []);

  const getActivationState = (assistantId: string): ActivationState => {
    return activationStates[assistantId] || {
      isActivated: isApiActivated,
      showKeyDialog: false,
      showResultDialog: false,
      isSuccess: false,
      key: ''
    };
  };

  const updateActivationState = (assistantId: string, updates: Partial<ActivationState>) => {
    setActivationStates(prev => ({
      ...prev,
      [assistantId]: { ...getActivationState(assistantId), ...updates }
    }));
  };

  const handleActivateClick = (assistant: Assistant) => {
    updateActivationState(assistant.id, { showKeyDialog: true });
  };

  const handleKeySubmit = async (assistant: Assistant) => {
    const state = getActivationState(assistant.id);
    const apiToken = state.key.trim();

    if (!apiToken) {
      updateActivationState(assistant.id, {
        showKeyDialog: false,
        showResultDialog: true,
        isSuccess: false,
        isActivated: false
      });

      setTimeout(() => {
        updateActivationState(assistant.id, { showResultDialog: false });
      }, 2000);
      return;
    }

    let isSuccess = false;
    try {
      await assistantsService.activateWithApiToken(apiToken);
      isSuccess = true;
      setIsApiActivated(true);
    } catch (error) {
      isSuccess = false;
    }

    updateActivationState(assistant.id, {
      showKeyDialog: false,
      showResultDialog: true,
      isSuccess,
      isActivated: isSuccess,
      key: ''
    });

    setTimeout(() => {
      updateActivationState(assistant.id, { showResultDialog: false });
      if (isSuccess) {
        setSelectedAssistant(assistant);
        setMessages([{ id: 1, type: 'bot', content: assistant.initialMessage }]);
      }
    }, 2000);
  };

  const handleAssistantSelect = (assistant: Assistant) => {
    const state = getActivationState(assistant.id);
    if (state.isActivated || isApiActivated) {
      setSelectedAssistant(assistant);
      setMessages([{ id: 1, type: 'bot', content: assistant.initialMessage }]);
      setInputValue('');
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (overrideText?: string, source: 'text' | 'voice' = 'text') => {
    if (!selectedAssistant) return;

    const contentToSend = (overrideText ?? inputValue).trim();
    if (!contentToSend) return;

    const newMessage = { id: Date.now(), type: 'user' as const, content: contentToSend, chart: null };
    setMessages(prev => [...prev, newMessage]);
    if (!overrideText) setInputValue('');

    if (selectedAssistant.id === 'raizen') {
      try {
        const response = await leadsDashRaizenService.chat(contentToSend, { source });
        const botText = response?.data?.response || 'Não consegui processar seu pedido agora.';
        const botChart = response?.data?.chart || null;

        const botResponse = {
          id: Date.now() + 1,
          type: 'bot' as const,
          content: botText,
          chart: botChart
        };

        setMessages(prev => [...prev, botResponse]);
        if (source === 'voice') speakText(botText);
        return;
      } catch (error) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot' as const,
          content: 'Falha ao consultar o Raizen do LeadsDashboard. Tente novamente em instantes.',
          chart: null
        };
        setMessages(prev => [...prev, botResponse]);
        return;
      }
    }

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot' as const,
        content: `Entendi sua solicitação! Como ${selectedAssistant.name}, vou te ajudar da melhor forma possível...`,
        chart: null
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    };

    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: 'Seu navegador não suporta reconhecimento de voz.',
        chart: null
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = async (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (!transcript) return;
      setInputValue(transcript);
      await handleSendMessage(transcript, 'voice');
    };

    recognition.start();
  };

  const renderMessageChart = (chart?: ChatChart | null) => {
    if (!chart || !chart.datasets || chart.datasets.length === 0) return null;

    const baseData = chart.labels.map((label, index) => ({
      label,
      ...chart.datasets.reduce((acc, dataset) => {
        acc[dataset.label] = dataset.data[index] ?? 0;
        return acc;
      }, {} as Record<string, number>)
    }));

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={baseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            {chart.datasets.map((dataset, idx) => (
              <Line key={dataset.label} type="monotone" dataKey={dataset.label} stroke={colors[idx % colors.length]} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === 'pie' || chart.type === 'doughnut' || chart.type === 'polarArea' || chart.type === 'radar') {
      const pieData = chart.labels.map((label, idx) => ({
        name: label,
        value: chart.datasets[0]?.data?.[idx] ?? 0
      }));

      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={85} label>
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={baseData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          {chart.datasets.map((dataset, idx) => (
            <Bar key={dataset.label} dataKey={dataset.label} fill={colors[idx % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const handleBackToSelection = () => {
    setSelectedAssistant(null);
    setMessages([]);
    setInputValue('');
  };

  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaActive) {
      setShowJuliaBubble(false);
    }
  };

  const handleElementClick = (event: React.MouseEvent, message: string) => {
    if (isJuliaActive) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setJuliaPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setJuliaMessage(message);
      setShowJuliaBubble(true);
    }
  };

  const handleCloseBubble = () => {
    setShowJuliaBubble(false);
  };

  if (selectedAssistant) {
    const AssistantIcon = selectedAssistant.icon;
    return (
      <div className="p-6 space-y-6 min-h-screen bg-white text-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <button
                onClick={handleBackToSelection}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Voltar aos Assistentes
              </button>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Assistente {selectedAssistant.name}
            </h1>
            <p className="text-gray-600 mt-1">{selectedAssistant.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedAssistant.bgGradient}`}>
              <AssistantIcon size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user' 
                      ? `bg-${selectedAssistant.color}-500 text-white` 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div>{message.content}</div>
                    {message.type === 'bot' && message.chart && (
                      <div className="mt-3 bg-white rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-1">{message.chart.title}</div>
                        {renderMessageChart(message.chart)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={selectedAssistant.placeholderText}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button onClick={handleVoiceInput} className="p-2 text-gray-400 hover:text-gray-600">
                  <Mic size={20} className={isListening ? 'text-red-500' : ''} />
                </button>
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Especialidades</h3>
              <div className="space-y-3">
                {selectedAssistant.specialties.map((specialty, index) => (
                  <div key={index} className={`p-3 ${specialty.bgColor} rounded-lg`}>
                    <h4 className={`font-medium ${specialty.textColor}`}>{specialty.name}</h4>
                    <p className={`text-sm ${specialty.textColor.replace('900', '700')}`}>{specialty.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Online e disponível</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-white text-gray-900">
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={handleCloseBubble}
        position={juliaPosition}
      />

      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a seção de Assistentes IA onde você pode ativar e conversar com diferentes assistentes especializados!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Assistentes IA
          </h1>
          <p className="text-gray-600 mt-1">Escolha um assistente especializado para te ajudar</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <Bot size={28} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => {
          const AssistantIcon = assistant.icon;
          const state = getActivationState(assistant.id);
          const isActivated = state.isActivated || isApiActivated;
          
          return (
            <div key={assistant.id}>
              <div
                onClick={(e) => {
                  if (isActivated) {
                    handleElementClick(e, `Converse com ${assistant.name}, especialista em ${assistant.specialties[0].name.toLowerCase()}!`);
                    if (!isJuliaActive) handleAssistantSelect(assistant);
                  } else {
                    handleElementClick(e, `Ative ${assistant.name} para ter acesso a um assistente especializado em ${assistant.specialties[0].name.toLowerCase()}!`);
                  }
                }}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isActivated ? 'cursor-pointer group hover:scale-105' : ''
                } ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${assistant.bgGradient} ${
                    isActivated ? 'group-hover:scale-110' : ''
                  } transition-transform`}>
                    <AssistantIcon size={32} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`w-2 h-2 rounded-full ${isActivated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{assistant.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{assistant.description}</p>
                
                <div className="space-y-2">
                  {assistant.specialties.slice(0, 2).map((specialty, index) => (
                    <div key={index} className={`p-2 ${specialty.bgColor} rounded-lg`}>
                      <span className={`text-xs font-medium ${specialty.textColor}`}>{specialty.name}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => isActivated ? handleAssistantSelect(assistant) : handleActivateClick(assistant)}
                  className={`w-full mt-4 px-4 py-2 bg-gradient-to-r ${assistant.bgGradient} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  {isActivated ? `Conversar com ${assistant.name}` : `Ativar ${assistant.name}`}
                </button>
              </div>

              {/* Key Input Dialog */}
              <Dialog open={state.showKeyDialog} onOpenChange={(open) => !open && updateActivationState(assistant.id, { showKeyDialog: false })}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ativar {assistant.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600">Insira o token da API para ativar {assistant.name}:</p>
                    <Input
                      type="password"
                      placeholder="Digite o token da API"
                      value={state.key}
                      onChange={(e) => updateActivationState(assistant.id, { key: e.target.value })}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleKeySubmit(assistant)}
                        className="flex-1"
                      >
                        Ativar
                      </Button>
                      <Button 
                        onClick={() => updateActivationState(assistant.id, { showKeyDialog: false })}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Result Dialog */}
              <Dialog open={state.showResultDialog} onOpenChange={() => {}}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className={state.isSuccess ? 'text-green-600' : 'text-red-600'}>
                      {state.isSuccess ? 'Sucesso!' : 'Erro!'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="text-center">
                    <p className={`text-lg ${state.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                      {state.isSuccess 
                        ? `${assistant.name} ativado com sucesso!` 
                        : `Falha ao ativar ${assistant.name}`
                      }
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assistentes;
