
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Calendar, User, Flag, Building2, Users } from 'lucide-react';
import { Tarefa } from '../types/tarefas.types';

interface KanbanBoardProps {
  tarefas: Tarefa[];
  onTaskUpdate: (taskId: number, newStatus: string) => void;
  onTaskClick: (tarefa: Tarefa) => void;
  isJuliaActive: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}

const KanbanBoard = ({ tarefas, onTaskUpdate, onTaskClick, isJuliaActive, onElementClick }: KanbanBoardProps) => {
  const statusColumns = [
    { id: 'aberta', title: 'Aberta', color: 'bg-gray-100 border-gray-300' },
    { id: 'encaminhada', title: 'Encaminhada', color: 'bg-blue-100 border-blue-300' },
    { id: 'agendada', title: 'Agendada', color: 'bg-purple-100 border-purple-300' },
    { id: 'pendente', title: 'Pendente', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'em_andamento', title: 'Em Andamento', color: 'bg-orange-100 border-orange-300' },
    { id: 'em_execucao', title: 'Em Execução', color: 'bg-indigo-100 border-indigo-300' },
    { id: 'reaberta', title: 'Reaberta', color: 'bg-red-100 border-red-300' },
    { id: 'finalizada', title: 'Finalizada', color: 'bg-green-100 border-green-300' }
  ];

  const getTasksByStatus = (status: string) => {
    return tarefas.filter(tarefa => tarefa.status === status);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    
    onTaskUpdate(taskId, newStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600';
      case 'Média': return 'text-yellow-600';
      case 'Baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />;
  };

  return (
    <div 
      onClick={(e) => onElementClick(e, "Este é o quadro Kanban onde você pode visualizar todas as tarefas organizadas por status e arrastar para mudar de coluna!")}
      className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto">
          {statusColumns.map((column) => (
            <div key={column.id} className={`rounded-lg border-2 ${column.color} min-h-96`}>
              <div className="p-3 border-b">
                <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
                <span className="text-xs text-gray-600">
                  {getTasksByStatus(column.id).length} tarefas
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 min-h-80 ${snapshot.isDraggingOver ? 'bg-gray-50' : ''}`}
                  >
                    {getTasksByStatus(column.id).map((tarefa, index) => (
                      <Draggable key={tarefa.id} draggableId={tarefa.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(tarefa)}
                            className={`bg-white rounded-lg p-3 mb-2 shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">{tarefa.title}</h4>
                              {getPriorityIcon(tarefa.priority)}
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tarefa.description}</p>
                            
                            <div className="space-y-1">
                              {tarefa.setor && (
                                <div className="flex items-center space-x-1">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{tarefa.setor}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{tarefa.assignee}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{tarefa.dueDate}</span>
                              </div>
                              
                              {tarefa.leadVinculada && (
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{tarefa.leadVinculada}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
