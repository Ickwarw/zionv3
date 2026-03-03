
import React, { useState } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Compromisso } from '../types/agenda.types';

interface NovoCompromissoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (compromisso: Omit<Compromisso, 'id'>) => void;
}

const NovoCompromissoModal = ({ isOpen, onClose, onSave }: NovoCompromissoModalProps) => {
  const [step, setStep] = useState<'form' | 'month' | 'day' | 'hour' | 'minute'>('form');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    cliente: '',
    tipo: 'reuniao' as 'reuniao' | 'ligacao' | 'apresentacao' | 'visita',
    status: 'pendente' as 'pendente' | 'em_andamento' | 'finalizado' | 'pausado',
    motivo_status: '',
    anotacoes: '',
    criado_por: 'Kelly', // Assistente da agenda
    participantes: []
  });

  if (!isOpen) return null;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const handleSave = () => {
    const compromisso = {
      ...formData,
      data: selectedDate.toLocaleDateString('pt-BR'),
      horario: selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    // onSave(compromisso);
    onClose();
    // Reset form
    setFormData({
      titulo: '',
      descricao: '',
      cliente: '',
      tipo: 'reuniao',
      status: 'pendente',
      motivo_status: '',
      anotacoes: '',
      criado_por: 'Kelly',
      participantes: []
    });
    setStep('form');
  };

  const renderDateTimePicker = () => {
    if (step === 'month') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Selecione o Mês</h3>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(index);
                  setSelectedDate(newDate);
                  setStep('day');
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate.getMonth() === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'day') {
      const daysInMonth = getDaysInMonth(selectedDate);
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('month')} className="text-purple-500 hover:text-purple-600">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            <div className="w-5"></div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(day);
                  setSelectedDate(newDate);
                  setStep('hour');
                }}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate.getDate() === day
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'hour') {
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('day')} className="text-purple-500 hover:text-purple-600">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">Selecione a Hora</h3>
            <div className="w-5"></div>
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(hour);
                  setSelectedDate(newDate);
                  setStep('minute');
                }}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate.getHours() === hour
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hour.toString().padStart(2, '0')}h
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'minute') {
      const minutes = [0, 15, 30, 45];

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('hour')} className="text-purple-500 hover:text-purple-600">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">Selecione os Minutos</h3>
            <div className="w-5"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {minutes.map(minute => (
              <button
                key={minute}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMinutes(minute);
                  setSelectedDate(newDate);
                  setStep('form');
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate.getMinutes() === minute
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {minute.toString().padStart(2, '0')} min
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'form' ? 'Novo Compromisso' : 'Selecionar Data e Hora'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {step === 'form' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="reuniao">Reunião</option>
                  <option value="ligacao">Ligação</option>
                  <option value="apresentacao">Apresentação</option>
                  <option value="visita">Visita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora</label>
              <button
                onClick={() => setStep('month')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-purple-500" />
                  <span>{selectedDate.toLocaleDateString('pt-BR')} às {selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo do Status</label>
              <textarea
                value={formData.motivo_status}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anotações</label>
              <textarea
                value={formData.anotacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, anotacoes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
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
                disabled={!formData.titulo || !formData.cliente}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Salvar Compromisso
              </button>
            </div>
          </div>
        ) : (
          <div>
            {renderDateTimePicker()}
          </div>
        )}
      </div>
    </div>
  );
};

export default NovoCompromissoModal;
