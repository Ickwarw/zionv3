import React, { useEffect, useState } from 'react';
import { Calendar, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Compromisso } from '../types/agenda.types';
import { agendaService } from '@/services/api';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { Textarea } from '@/components/ui/textarea';
import FormateDateTime from '@/components/ui/FormateDateTime';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, parseDate, toISOWithOffset } from '@/lib/utils';
import Tag from '@/components/ui/tag';



interface AgendaDetalhesProps {
  compromisso: Compromisso;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const AgendaDetalhes = ({ compromisso, onClose, onElementClick, isJuliaActive, editMode }: AgendaDetalhesProps) => {
  const [localCompromisso, setLocalCompromisso] = useState(compromisso);
  const [eventTypeList, setEventTypeList] = useState([]);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({
    id: localCompromisso.id,
    title: localCompromisso.title,
    description: localCompromisso.description,
    start_time: localCompromisso.start_time,
    end_time: localCompromisso.end_time,
    location: localCompromisso.location,
    event_type: localCompromisso.event_type,
    is_public: localCompromisso.is_public,
    color: localCompromisso.color,
    event_type_id: localCompromisso.event_type_id,
    reminder_minutes: localCompromisso.reminder_minutes,
  });


  const handleSave = async () => {
    console.log("formData.start_time: ", formData.start_time);
    console.log("formData.end_time: ", formData.end_time);
    try {
      let event = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        start_time: toISOWithOffset(new Date(formData.start_time)),
        end_time: toISOWithOffset(parseDate(formatDate(formData.end_time))),
        location: formData.location,
        is_public: formData.is_public,
        color: formData.color,
        event_type_id: formData.event_type_id,
        reminder_minutes: formData.reminder_minutes
      }
      const response = await agendaService.updateEvent(formData.id, event);
      if (response.status == 200) {
        setFormData({
          id: response.data.event.id,
          title: response.data.event.title,
          description: response.data.event.description,
          start_time: response.data.event.start_time,
          end_time: response.data.event.end_time,
          location: response.data.event.location,
          is_public: response.data.event.is_public,
          color: response.data.event.color,
          event_type_id: response.data.event.event_type_id,
          event_type: response.data.event.event_type,
          reminder_minutes: response.data.event.reminder_minutes
        });
        setLocalCompromisso({
          ...response.data.event
        });
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Compromisso", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Compromisso", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to update Event:', error);
        showErrorAlert('Erro ao Salvar o Compromisso', formatAxiosError(error));
    }
  }

  const formatReminder = (value: number) => {
    if (value == 0) {
      return "Nenhum";
    } else if (value < 60) {
      return `${value} minutos antes`;
    } else {
      let hours = value/60;
      if (hours <= 1) {
         return `${value} hora antes`;
      } else {
        return `${value} horas antes`;
      }
    }
  }

  const getEventType = async () => {
    if (eventTypeList.length > 0) return;
    try {
      const response = await agendaService.getEventType();
      if (response.status == 200) {
          setEventTypeList(response.data.event_type);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar o Tipo de Compromisso", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar o Tipo de Compromisso", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Event Type:', error);
        showErrorAlert('Erro ao carregar o Tipo de Compromisso', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getEventType();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada do compromisso!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Calendar size={24} className="mr-2" />
              {isEditing ? 'Editar Compromisso' : 'Visualizar Compromisso'}
            </DialogTitle>
            <div className="flex space-x-2">
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label>Título *</Label>
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título do compromisso"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localCompromisso.title}</p>
                )}
              </div>

              <div>
                <Label>Tipo *</Label>
                {isEditing ? (
                 <Select 
                    value={formData.event_type_id?.toString() ?? ""}
                    onValueChange={(value) => setFormData({...formData, event_type_id: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Tipo do Compromisso" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeList?.length
                        ? eventTypeList.map((eventType) => (
                        <SelectItem key={eventType.id} value={eventType.id.toString()}>
                          {eventType.name}
                        </SelectItem>
                      ))
                      : <SelectItem value="0">Nenhum</SelectItem>
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localCompromisso.event_type.name}</p>
                )}
              </div>

              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição do compromisso"
                    required
                  />
                ) : (
                  // <p className="p-2 bg-gray-50 rounded min-height-40">{localCompromisso.description}</p>
                  <Textarea
                    className="p-2 bg-gray-50 rounded min-height-40"
                    value={localCompromisso.description}
                    disabled
                  />
                )}
              </div>

              <div>
                <Label>Data e Hora Início *</Label>
                {isEditing ? (
                   <Input
                    type="datetime-local"
                    value={formatDate(formData.start_time)}
                    onChange={(e) => setFormData({...formData, start_time: parseDate(e.target.value)})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateDateTime(localCompromisso.start_time)}</p>
                )}
              </div>

              <div>
                <Label>Data e Hora Fim *</Label>
                {isEditing ? (
                   <Input
                    type="datetime-local"
                    value={formatDate(formData.end_time)}
                    onChange={(e) => setFormData({...formData, end_time: parseDate(e.target.value)})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateDateTime(localCompromisso.end_time)}</p>
                )}
              </div>

              <div>
                <Label>Localização</Label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Localização do compromisso"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localCompromisso.location}</p>
                )}
              </div>

              <div>
                <Checkbox 
                  className="ml-20"
                  checked={formData.is_public}
                  disabled={!isEditing}
                  onCheckedChange={(checked) => {
                    if (typeof checked === "boolean") {
                      setFormData({...formData, is_public: checked})
                    } else {
                      setFormData({...formData, is_public: false})
                    }
                  }}
                />
                <Label>Compromisso público?</Label>
              </div>

              <div>
                <Label>Cor</Label>
                {isEditing ? (
                  <Input
                    value={formData.color}
                    type="color"
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="Cor do Compromisso"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    <Tag
                      backgroundColor={localCompromisso.color}
                      name={localCompromisso.color}
                    />
                    {/* <span className="badge" style={{backgroundColor: `${localCompromisso.color}`}}>{localCompromisso.color}</span> */}
                  </p>
                )}
              </div>

              <div>
                <Label>Lembrete</Label>
                {isEditing ? (
                  <Select 
                    value={formData.reminder_minutes.toString()}
                    onValueChange={(value) => setFormData({...formData, reminder_minutes: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tempo do alerta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhum</SelectItem>
                      <SelectItem value="5">5 minutos antes</SelectItem>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="120">2 horas antes</SelectItem>
                      <SelectItem value="180">3 horas antes</SelectItem>
                      <SelectItem value="240">4 horas antes</SelectItem>
                      <SelectItem value="300">5 horas antes</SelectItem>
                      <SelectItem value="360">6 horas antes</SelectItem>
                      <SelectItem value="420">7 horas antes</SelectItem>
                      <SelectItem value="480">8 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formatReminder(localCompromisso.reminder_minutes)}</p>
                )}
              </div>
            </div>
          </div>

          
          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaDetalhes;
