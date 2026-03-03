import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User, ChevronLeft, ChevronRight, ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowBigRightDash, MapPin, Badge } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import EventoModal from './agenda/components/EventoModal';
import NovoCompromissoModal from './agenda/components/NovoCompromissoModal';
import { Compromisso } from './agenda/types/agenda.types';
import Calendar from 'react-calendar';
import './AgendaCalendar.css';
import { agendaService } from '@/services/api';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import FormateDateTimeNoSec from './ui/FormateDateTimeNoSec';
import FormateDate from './ui/FormateDate';

const Agenda = () => {
  const [eventList, setEventList] = useState([]);
  const [eventListFiltered, setEventListFiltered] = useState([]);

  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Compromisso | null>(null);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showNovoCompromisso, setShowNovoCompromisso] = useState(false);
  // const [currentDate, setCurrentDate] = useState(new Date());
    // const [calendarView, setCalendarView] = useState<'month' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [lastDayOfMonth, setLastDayOfMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
  
  const formatDate = (date: Date, startOfDay: boolean): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    // const hours = startOfDay ? "00:00:00" : "23:59:59";
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    getEvents();
    filterEventsOfDay(new Date().getTime());
  }, []);

  useEffect(() => {
    getEvents();
    filterEventsOfDay(new Date().getTime());
  }, [lastDayOfMonth]);

  const getEvents = async () => {
    try {
      let params = {
        start_date: formatDate(firstDayOfMonth, true),
        end_date: formatDate(lastDayOfMonth, false)
      }
      const response = await agendaService.getEvents(params);
      if (response.status == 200) {
          setEventList(response.data.events);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar a Agenda", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar a Agenda", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Events:', error);
        showErrorAlert('Erro ao carregar a Agenda', formatAxiosError(error));
    }
  }

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

  const handleEventoClick = (evento: Compromisso) => {
    setSelectedEvento(evento);
    setShowEventoModal(true);
  };

  const handleSaveEvento = (evento: Compromisso) => {
    // setCompromissos(prev => prev.map(c => c.id === evento.id ? evento : c));
    setShowEventoModal(false);
  };

  const handleDeleteEvento = (id: number) => {
    // setCompromissos(prev => prev.filter(c => c.id !== id));
  };

  const handleNovoCompromisso = (novoCompromisso: Omit<Compromisso, 'id'>) => {
    // const newId = Math.max(...compromissos.map(c => c.id)) + 1;
    // setCompromissos(prev => [...prev, { ...novoCompromisso, id: newId }]);
  };

  // const getDaysInMonth = (date: Date) => {
  //   return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  // };

  // const getCompromissosForDay = (day: number) => {
  //   const dateStr = `${day.toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
  //   return compromissos.filter(c => c.data === dateStr);
  // };

  // const getStatsForUser = (user: string) => {
  //   const userTasks = compromissos.filter(c => c.criado_por === user);
  //   return {
  //     total: userTasks.length,
  //     pendente: userTasks.filter(c => c.status === 'pendente').length,
  //     em_andamento: userTasks.filter(c => c.status === 'em_andamento').length,
  //     finalizado: userTasks.filter(c => c.status === 'finalizado').length,
  //     pausado: userTasks.filter(c => c.status === 'pausado').length,
  //   };
  // };

 const onScheduleChange = (value) => {
    let timestamp = new Date(value).getTime()
    filterEventsOfDay(timestamp);
    setSelectedDay(new Date(value));
  };

  const filterEventsOfDay = (day) => {
    setEventListFiltered(eventList.filter((event) => compareSameDay(day, event.start)));
  }

  const compareSameDay = (date1, date2) => {
    const normalizedDate1 = new Date(date1);
    const normalizedDate2 = new Date(date2);
    normalizedDate1.setHours(0, 0, 0, 0);
    normalizedDate2.setHours(0, 0, 0, 0);

    return (normalizedDate1.getTime() === normalizedDate2.getTime());
  }

  const verifyDay = (value) => {
    let sameDay = false;
    eventList.forEach(event => {
      if (compareSameDay(value, event.start)) {
        sameDay= true;
        return;
      }
    });
    return sameDay;
  }

  return (
    <div className="p-6 space-y-6">
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
          onClick={(e) => handleElementClick(e, "Esta é a seção de Agenda onde você pode gerenciar todos os seus compromissos, reuniões e eventos!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Agenda
          </h1>
          <p className="text-gray-600 mt-1">Gerencie seus compromissos e reuniões</p>
        </div>
        <button 
          onClick={() => setShowNovoCompromisso(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Compromisso</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          {compareSameDay(new Date(), selectedDay) 
          ? <h2 className="text-xl font-bold text-gray-900 mb-4">Agenda de Hoje ({FormateDate(selectedDay)})</h2>
          : <h2 className="text-xl font-bold text-gray-900 mb-4">Agenda dia {FormateDate(selectedDay)}</h2>
          }
          <div className="space-y-4">
            {eventListFiltered?.length
                ? eventListFiltered.map((compromisso) => (
              <div 
                key={compromisso.id} 
                onClick={() => handleEventoClick(compromisso)}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      compromisso.tipo === 'reuniao' ? 'bg-blue-100 text-blue-600' :
                      compromisso.tipo === 'ligacao' ? 'bg-green-100 text-green-600' :
                      compromisso.tipo === 'apresentacao' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{compromisso.title}</h3>
                      <Badge style={{backgroundColor: `${compromisso.color}`}} />
                      <div className="flex items-center space-x-1 text-green-600">
                        <span className="text-sm text-gray-900">{compromisso.description}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-gray-600" title="Início">
                          <Clock size={16} />
                          <span className="text-sm">{FormateDateTimeNoSec(compromisso.start)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600" title="Fim">
                          <User size={16} />
                          <span className="text-sm">{FormateDateTimeNoSec(compromisso.end)}</span>
                        </div>
                      </div>
                      {compromisso.location ?
                          <div className="flex items-center space-x-1 text-gray-600">
                            <MapPin size={16} />
                            <span className="text-sm">{compromisso.location}</span>
                          </div>
                        : <div></div>}

                      {/* <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          compromisso.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          compromisso.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                          compromisso.status === 'finalizado' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {compromisso.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-purple-400">• Por: {compromisso.criado_por}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
            : <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">Não há Compromissos</h4>
                  </div>
                </td>
              </tr>
            }
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Calendário</h3>
            <Calendar 
              onChange={onScheduleChange}
              onActiveStartDateChange={({action, activeStartDate, value, view}) => {
                console.log("action: ", action, "activeStartDate: ",activeStartDate, "value: ",value, "view: ",view);
                setFirstDayOfMonth(activeStartDate);
                setLastDayOfMonth(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 0));
              }}
              defaultValue={new Date()}
              calendarType="gregory"
              view="month"
              prevLabel={<ArrowBigLeft/>}
              prev2Label={<ArrowBigLeftDash/>}
              nextLabel={<ArrowBigRight/>}
              next2Label={<ArrowBigRightDash/>}
              tileClassName={({ date, view }) => view === 'month' && verifyDay(date) ? 'day-event' : null}
            />
          </div>
          
          

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo Semanal</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reuniões</span>
                <span className="font-semibold text-purple-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ligações</span>
                <span className="font-semibold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Apresentações</span>
                <span className="font-semibold text-blue-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Visitas</span>
                <span className="font-semibold text-orange-600">3</span>
              </div>
            </div>
          </div>
        </div>

         {/*<div className="space-y-6">
         <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Calendário</h3>
               <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-1 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                >
                  Atual
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={16} />
                </button>
              </div> *
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Calendário</h3>
              <Calendar 
                onChange={onScheduleChange} 
                defaultValue={new Date()}
                calendarType="gregory"
                view="month"
                prevLabel={<ArrowBigLeft/>}
                prev2Label={<ArrowBigLeftDash/>}
                nextLabel={<ArrowBigRight/>}
                next2Label={<ArrowBigRightDash/>}
                tileClassName={({ date, view }) => view === 'month' && verifyDay(date) ? 'day-event' : null}
              />
            </div>

            {calendarView === 'month' ? (
              <>
                <div className="text-center mb-3">
                  <button
                    onClick={() => setCalendarView('day')}
                    className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  <div className="font-semibold text-gray-600 p-2">Dom</div>
                  <div className="font-semibold text-gray-600 p-2">Seg</div>
                  <div className="font-semibold text-gray-600 p-2">Ter</div>
                  <div className="font-semibold text-gray-600 p-2">Qua</div>
                  <div className="font-semibold text-gray-600 p-2">Qui</div>
                  <div className="font-semibold text-gray-600 p-2">Sex</div>
                  <div className="font-semibold text-gray-600 p-2">Sáb</div>
                  {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(day => {
                    const dayTasks = getCompromissosForDay(day);
                    const isToday = day === 15; // Mock today
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDay(day);
                          setCalendarView('day');
                        }}
                        className={`p-2 hover:bg-purple-100 cursor-pointer rounded relative ${
                          isToday ? 'bg-purple-500 text-white' : 'text-gray-700'
                        }`}
                      >
                        {day}
                        {dayTasks.length > 0 && (
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarView('month')}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    ← Voltar ao mês
                  </button>
                  <h4 className="font-semibold">
                    {selectedDay}/{currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedDay && getCompromissosForDay(selectedDay).map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleEventoClick(task)}
                      className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-sm font-medium">{task.titulo}</div>
                      <div className="text-xs text-gray-600">{task.horario} - {task.cliente}</div>
                    </div>
                  ))}
                  {selectedDay && getCompromissosForDay(selectedDay).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhuma tarefa para este dia</p>
                  )}
                </div>
              </div>
            )} 
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas por Usuário</h3>
            <div className="space-y-4">
              {users.map(user => {
                const stats = getStatsForUser(user);
                return (
                  <div key={user} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">{user}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Total: <span className="font-medium">{stats.total}</span></div>
                      <div className="text-yellow-600">Pendente: <span className="font-medium">{stats.pendente}</span></div>
                      <div className="text-blue-600">Em And.: <span className="font-medium">{stats.em_andamento}</span></div>
                      <div className="text-green-600">Finalizado: <span className="font-medium">{stats.finalizado}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> 
        </div>*/}
      </div>

      {/* Modals */}
      <EventoModal
        isOpen={showEventoModal}
        evento={selectedEvento}
        onClose={() => setShowEventoModal(false)}
        onSave={handleSaveEvento}
        onDelete={handleDeleteEvento}
      />

      <NovoCompromissoModal
        isOpen={showNovoCompromisso}
        onClose={() => setShowNovoCompromisso(false)}
        onSave={handleNovoCompromisso}
      />
    </div>
  );
};

export default Agenda;
