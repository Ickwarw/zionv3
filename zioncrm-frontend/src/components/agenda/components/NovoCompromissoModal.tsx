
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Compromisso } from '../types/agenda.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, parseDate } from '@/lib/utils';
import { agendaService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';

interface NovoCompromissoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (compromisso: Omit<Compromisso, 'id'>) => void;
}


const NovoCompromissoModal = ({ isOpen, onClose, onSave }: NovoCompromissoModalProps) => {
  const [eventTypeList, setEventTypeList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type_id: null,
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
    location: '',
    is_public: false,
    color: '#3788d8',
    reminder_minutes: 15
  });

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

  if (!isOpen) return null;
  getEventType();

  const handleSave = () => {
    onSave(formData);
    onClose();
    // Reset form
    setFormData({
       title: '',
      description: '',
      event_type_id: null,
      start_time: new Date(),
      end_time: new Date(),
      location: '',
      is_public: false,
      color: '#3788d8',
      reminder_minutes: 15
    });
  };

  

  // useEffect(() => {
  //   getEventType();
  // }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Novo Compromisso
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título do compromisso"
                required
              />
            </div>
            <div>
              <Label>Tipo</Label>
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
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição do compromisso"
                required
              />
            </div>
            <div>
              <Label>Data e Hora Início *</Label>
              <Input
                type="datetime-local"
                value={formatDate(formData.start_time)}
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    start_time: parseDate(e.target.value)
                  })
                }}
              />
            </div>

            <div>
              <Label>Data e Hora Fim *</Label>
              <Input
                type="datetime-local"
                value={formatDate(formData.end_time)}
                onChange={(e) => setFormData({...formData, end_time: parseDate(e.target.value)})}
              />
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Localização do compromisso"
              />
            </div>
            <div>
              <Checkbox 
                className="ml-20"
                checked={formData.is_public}
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
              <Input
                value={formData.color}
                type="color"
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="Cor do Compromisso"
              />
            </div>
            <div>
              <Label>Lembrete</Label>
              <Select 
                value={formData.reminder_minutes.toString() ?? ""}
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
            </div>

          </div>


          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.start_time || !formData.end_time}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Salvar Compromisso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovoCompromissoModal;
