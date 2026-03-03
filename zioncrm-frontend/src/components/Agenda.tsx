import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User, ChevronLeft, ChevronRight, ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowBigRightDash, MapPin, Badge, Pencil, Trash2, Edit, Eye } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
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
import { Button } from './ui/button';
import { showQuestionAlert } from './ui/alert-dialog-question';
import AgendaDetalhes from './agenda/components/AgendaDetalhes';
import { toISOWithOffset } from '@/lib/utils';
import Tag from './ui/tag';

const Agenda = () => {
  const [eventList, setEventList] = useState([]);
  const [weekSumaryList, setWeekSumaryList] = useState([]);
  const [eventListFiltered, setEventListFiltered] = useState([]);
  const [eventSelected, setEventSelected] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showNovoCompromisso, setShowNovoCompromisso] = useState(false);
  let selectedDay = new Date();
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [lastDayOfMonth, setLastDayOfMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const run = async () => {
      getWeekSumary();
      await getEvents();
      selectedDay = new Date();
      filterEventsOfDay(new Date());
    };
    run();
  }, []);

  useEffect(() => {
    getEvents();
    if (isInCurrentMonth(lastDayOfMonth)) {
      filterEventsOfDay(new Date());
    }
  }, [lastDayOfMonth]);

  const isInCurrentMonth = (date: Date): boolean => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  const getEvents = async () => {
    try {
      let params = {
        start_date: formatDate(firstDayOfMonth),
        end_date: formatDate(lastDayOfMonth)
      }
      const response = await agendaService.getEvents(params);
      if (response.status == 200) {
          setEventList(response.data.events);
          if (selectedDay != null) {
            setEventListFiltered(response.data.events.filter((event) => compareSameDay(new Date(), event.start_time)));
          }
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

  const getWeekSumary = async () => {
    try {
      const response = await agendaService.getWeekSumary();
      if (response.status == 200) {
          setWeekSumaryList(response.data.events);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar o resumo Semanal", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar o resumo Semanal", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Week Events:', error);
        showErrorAlert('Erro ao carregar o resumo Semanal', formatAxiosError(error));
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

  const saveEvent = async (compromisso) => {
    try {
      const response = await agendaService.createEvent(compromisso);
      if (response.status == 200 || response.status == 201) {
        getEvents();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Salvar o Compromisso", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Salvar o Compromisso", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Events:', error);
        showErrorAlert('Erro ao Salvar o Compromisso', formatAxiosError(error));
    }
  }

  const handleNovoCompromisso = (novoCompromisso: Omit<Compromisso, 'id'>) => {
    let newCompromisso = {
      title: novoCompromisso.title,
      description: novoCompromisso.description,
      start_time: toISOWithOffset(novoCompromisso.start_time),
      end_time: toISOWithOffset(novoCompromisso.end_time),
      location: novoCompromisso.location,
      event_type_id: novoCompromisso.event_type_id,
      is_public: novoCompromisso.is_public,
      color: novoCompromisso.color,
      reminder_minutes: novoCompromisso.reminder_minutes
    }
    saveEvent(newCompromisso);
  };

  const onScheduleChange = (value) => {
    selectedDay = value;
    filterEventsOfDay(value);
  };

  const filterEventsOfDay = (day) => {
    setEventListFiltered(eventList.filter((event) => compareSameDay(day, event.start_time)));
  }

  const compareSameDay = (date1, date2) => {
    const normalizedDate1 = new Date(date1);
    if (typeof date2 == "string") {
      date2 = date2 + "Z";
    }
    const normalizedDate2 = new Date(date2);
    normalizedDate1.setHours(0, 0, 0, 0);
    normalizedDate2.setHours(0, 0, 0, 0);
    return (normalizedDate1.getTime() === normalizedDate2.getTime());
  }

  const verifyDay = (value) => {
    let sameDay = false;
    eventList.forEach(event => {
      if (compareSameDay(value, event.start_time)) {
        sameDay= true;
        return;
      }
    });
    return sameDay;
  }

  const editEvent = (event: any) => {
    setEditMode(true);
    setEventSelected(event);
  }

  const closeEventDeleteYes = async (eventId) => {
    try {
      const response = await agendaService.deleteEvent(eventId);
      if (response.status == 200 || response.status == 201) {
        getEvents();
        filterEventsOfDay(selectedDay);
        getWeekSumary();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Compromisso", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Compromisso", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get current Compromisso:', error);
      showErrorAlert('Erro ao carregar a lista de Compromisso', formatAxiosError(error));
    }
  }
  
  const closeEventDeleteNo = () => {
    console.log("closeEventDeleteNo");
  }

  const deleteEvent = (event) => {
    showQuestionAlert('Deletar Compromisso?',
      `Deseja realmente deletar o compromisso ${event.title}?`,
      event.id,
      closeEventDeleteNo,
      closeEventDeleteYes);
  }

  const closeEvent = () => {
    setEditMode(false);
    setEventSelected(null);
    getEvents();
    getWeekSumary();
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
                // onClick={() => handleEventoClick(compromisso)}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* <div className={`p-3 rounded-xl ${
                      compromisso.tipo === 'reuniao' ? 'bg-blue-100 text-blue-600' :
                      compromisso.tipo === 'ligacao' ? 'bg-green-100 text-green-600' :
                      compromisso.tipo === 'apresentacao' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <CalendarIcon size={20} />
                    </div> */}
                    <Tag 
                      backgroundColor={compromisso.color}
                      name={compromisso.event_type.name}
                      color="white"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        <span className='pd-15'>{compromisso.title}</span>
                        {/* <span className="badge" style={{backgroundColor: `${compromisso.color}`}}></span>{compromisso.title} */}
                      </h3>
                      <div className="flex items-center space-x-1 text-green-600">
                        <span className="text-sm text-gray-900">{compromisso.description}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        
                        <div className="flex items-center space-x-1 text-gray-600" title="Início">
                          <Clock size={16} />
                          <span className="text-sm">{FormateDateTimeNoSec(compromisso.start_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600" title="Fim">
                          <Clock size={16} />
                          <span className="text-sm">{FormateDateTimeNoSec(compromisso.end_time)}</span>
                        </div>
                        {compromisso.location ?
                            <div className="flex items-center space-x-1 text-gray-600">
                              <MapPin size={16} />
                              <span className="text-sm">{compromisso.location}</span>
                            </div>
                          : <div></div>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      title="Visualizar Detalhes"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          handleElementClick(e, "Visualizar detalhes completos do produto!");
                        } else {
                          setEventSelected(compromisso);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          handleElementClick(e, "Editar informações do compromissos!");
                        } else {
                          editEvent(compromisso);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          handleElementClick(e, "Excluir este compromisso permanentemente do sistema!");
                        } else {
                          // setProdutoDeleteSelecionado(produto);
                          deleteEvent(compromisso);
                        }
                      }}
                      className={`text-red-600 hover:text-red-800 ${isJuliaActive ? 'cursor-help' : ''}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
            : 
              <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h4 className="font-semibold text-gray-900">Não há Compromissos</h4>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Calendário</h3>
            <Calendar 
              onClickDay={(value, event) => {
                 onScheduleChange(value);
              }}
              onActiveStartDateChange={({action, activeStartDate, value, view}) => {
                // console.log("action: ", action, "activeStartDate: ",activeStartDate, "value: ",value, "view: ",view);
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
              // tileClassName={({ date, view }) => view === 'month' && verifyDay(date) ? 'day-event' : null}
              tileContent={({ date, view }) => {
                if (view === 'month' && verifyDay(date)) {
                  return <span className='badge-i'></span>
                } else {
                  return null;
                }
              }}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo Semanal</h3>
            <div className="space-y-3">
              { weekSumaryList.length > 0 && 
                weekSumaryList.map((week) => (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{week.name}</span>
                    <span className="font-semibold text-gray-600">{week.count}</span>
                  </div>
                ))
              }
              
              {/* <div className="flex justify-between items-center">
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
              </div> */}
            </div>
          </div>
        </div>

      
      </div>

      {/* Modals */}
      {/* <EventoModal
        isOpen={showEventoModal}
        evento={selectedEvento}
        onClose={() => setShowEventoModal(false)}
        onSave={handleSaveEvento}
        onDelete={handleDeleteEvento}
      /> */}

      {eventSelected && (
        <AgendaDetalhes
          compromisso={eventSelected}
          editMode={editMode}
          onClose={() => closeEvent()}
          onElementClick={handleElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}

      <NovoCompromissoModal
        isOpen={showNovoCompromisso}
        onClose={() => setShowNovoCompromisso(false)}
        onSave={handleNovoCompromisso}
      />
    </div>
  );
};

export default Agenda;
