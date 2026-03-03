
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Calendar, User, Flag, Building2, Users, Info, MessageSquareText } from 'lucide-react';
import { Tarefa, Task } from '../types/tarefas.types';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import FormateDateTime from '@/components/ui/FormateDateTime';
import TaskList from './TaskList';
import { parseDate, toISOWithOffset } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  tarefas: Task[];
  onTaskUpdate: () => void;
  onTaskClick: (tarefa: Task) => void;
  isJuliaActive: boolean;
  onTaskComments: (taskId: number) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}

const KanbanBoard = ({ tarefas, isJuliaActive, onTaskClick, onElementClick, onTaskUpdate, onTaskComments }: KanbanBoardProps) => {
  const [statusList, setStatusList] = useState([]);

  const fetchStatuses = async () => {
    try {
      const response = await tasksService.getTaskStatuses();
      if (response.status == 200 || response.status == 201) {
        setStatusList(response.data.statuses);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar os Status", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar os Status", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Status:', error);
        showErrorAlert('Erro ao buscar os Status', formatAxiosError(error));
    }
  };

  const getTasksByStatus = (status: string) => {
    return tarefas.filter(tarefa => tarefa.status_id === Number(status));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    let updatedTask = null;
    tarefas.map((task) => {
      if (task.id == taskId) {
        updatedTask = task;
      }
    });
    let taskToUpdate = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      due_date: toISOWithOffset(parseDate(updatedTask.due_date)),
      priority_id: updatedTask.priority_id,
      status_id: newStatus,
      category_id: updatedTask.category_id,
      assigned_to: updatedTask.assigned_to
    }
    updateTask(taskToUpdate);
  };

  const updateTask = async (task) => {
    try {
      const response = await tasksService.updateTask(task.id, task);
      if (response.status == 200) {
        onTaskUpdate();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Editar Tarefa", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Editar Tarefa", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to edit Task:', error);
        showErrorAlert('Erro ao Editar Tarefa', formatAxiosError(error));
    }
  }

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div 
      onClick={(e) => onElementClick(e, "Este é o quadro Kanban onde você pode visualizar todas as tarefas organizadas por status e arrastar para mudar de coluna!")}
      className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto">
          {statusList.map((column) => (
            <div key={column.id} style={{backgroundColor: `${column.color}`}} className={"rounded-lg border-2 min-h-96"}>
              <div className="p-3 border-b">
                <h3 className="font-semibold text-gray-900 text-sm">{column.name}</h3>
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
                            // onClick={() => onTaskClick(tarefa)}
                            className={`bg-white rounded-lg p-3 mb-2 shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">{tarefa.title}</h4>
                              <Button
                                title="Informações da Tarefa"
                                className='bg-white-500 hover:bg-white-700 text-blue p-1 rounded-full w-4 h-4 flex items-center justify-center'
                                onClick={() => onTaskClick(tarefa)}
                              >
                                <Info size={"12"}/>
                              </Button>
                              <Button
                                title="Comentários da Tarefa"
                                className='bg-white-500 hover:bg-white-700 text-blue p-1 rounded-full w-4 h-4 flex items-center justify-center'
                                onClick={() => onTaskComments(tarefa.id)}
                              >
                                <MessageSquareText size={"12"}/>
                              </Button>
                              {tarefa.priority && (
                                <div
                                   title={`Priodidade ${tarefa.priority.name}`}
                                >
                                  <Flag className={"w-4 h-4"} style={{color: `${tarefa.priority.color}`}}/>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tarefa.description}</p>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-gray-400" />
                                { tarefa.assignee && (
                                  <span className="text-xs text-gray-600">{tarefa.assignee.first_name}{' '}{tarefa.assignee.last_name}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{FormateDateTime(tarefa.due_date)}</span>
                              </div>

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
