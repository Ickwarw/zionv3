
import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Edit3, Trash2 } from 'lucide-react';
import { Compromisso } from '../types/agenda.types';

interface EventoModalProps {
  isOpen: boolean;
  evento: Compromisso | null;
  onClose: () => void;
  onSave: (evento: Compromisso) => void;
  onDelete: (id: number) => void;
}

const EventoModal = ({ isOpen, evento, onClose, onSave, onDelete }: EventoModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedEvento, setEditedEvento] = useState<Compromisso | null>(evento);

  if (!isOpen || !evento) return null;

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    finalizado: 'bg-green-100 text-green-800',
    pausado: 'bg-red-100 text-red-800'
  };

  const handleSave = () => {
    if (editedEvento) {
      onSave(editedEvento);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(evento.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Compromisso' : 'Detalhes do Compromisso'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvento?.titulo || ''}
                  onChange={(e) => setEditedEvento(prev => prev ? {...prev, titulo: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900 font-semibold">{evento.titulo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvento?.cliente || ''}
                  onChange={(e) => setEditedEvento(prev => prev ? {...prev, cliente: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900">{evento.cliente}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-purple-500" />
                <span className="text-gray-900">{evento.data}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-purple-500" />
                <span className="text-gray-900">{evento.horario}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {isEditing ? (
                <select
                  value={editedEvento?.status || ''}
                  onChange={(e) => setEditedEvento(prev => prev ? {...prev, status: e.target.value as any} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="pausado">Pausado</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[evento.status]}`}>
                  {evento.status.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {(isEditing || evento.motivo_status) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo do Status</label>
              {isEditing ? (
                <textarea
                  value={editedEvento?.motivo_status || ''}
                  onChange={(e) => setEditedEvento(prev => prev ? {...prev, motivo_status: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900">{evento.motivo_status}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            {isEditing ? (
              <textarea
                value={editedEvento?.descricao || ''}
                onChange={(e) => setEditedEvento(prev => prev ? {...prev, descricao: e.target.value} : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={4}
              />
            ) : (
              <p className="text-gray-900">{evento.descricao}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anotações</label>
            {isEditing ? (
              <textarea
                value={editedEvento?.anotacoes || ''}
                onChange={(e) => setEditedEvento(prev => prev ? {...prev, anotacoes: e.target.value} : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-900">{evento.anotacoes || 'Nenhuma anotação'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Criado por</label>
            <div className="flex items-center space-x-2">
              <User size={16} className="text-purple-500" />
              <span className="text-gray-900">{evento.criado_por}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>

          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Edit3 size={16} />
                <span>Visualizar/Editar</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoModal;
