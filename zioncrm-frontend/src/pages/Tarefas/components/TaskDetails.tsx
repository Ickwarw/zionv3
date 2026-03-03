
import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Task } from '../types/tarefas.types';
import { formatDate, formatDateUTC, parseDate, toISOWithOffset } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import FormateDateTime from '@/components/ui/FormateDateTime';
import Tag from '@/components/ui/tag';


interface TaskDetailsProps {
  task: Task;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  onTaskUpdate: () => void;
}

const TaskDetails = ({ task, onClose, onTaskUpdate, onElementClick, isJuliaActive, editMode }: TaskDetailsProps) => {
  const [localTask, setLocalTask] = useState(task);
  const [isEditing, setIsEditing] = useState(editMode);
  const [priorityList, setPriorityList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [formData, setFormData] = useState({
    id: localTask.id,
    title: localTask.title,
    description: localTask.description,
    due_date: parseDate(localTask.due_date),
    priority_id: localTask.priority_id,
    status_id: localTask.status_id,
    category_id: localTask.category_id,
    assigned_to: localTask.assigned_to,
  });

  // const validateFields = () => {
  //   let message = '';
  //   if (formData.title == null && formData.title.trim() == '') {
  //     message = "Título da tarefa é obrigatório\n";
  //   }
  //   if (formData.due_date == null && formData.due_date.trim() == '') {
  //     message += "Prazo da tarefa é obrigatório";
  //   }
  //   if (message.length > 0) {
  //     showWarningAlert("Campos Obrigatórios",message,null);
  //     return false;
  //   }
  //   return true;
  // }

   // Fetch task statuses
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
  
  // Fetch task priorities
  const fetchPriorities = async () => {
    try {
      const response = await tasksService.getTaskPriorities();
      if (response.status == 200 || response.status == 201) {
        setPriorityList(response.data.priorities);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar as Prioridades", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar as Prioridades", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get priorities:', error);
        showErrorAlert('Erro ao buscar as Prioridades', formatAxiosError(error));
    }
  };

  // Fetch task categories
  const fetchCategories = async () => {
    try {
      const response = await tasksService.getTaskCategories();
    if (response.status == 200 || response.status == 201) {
        setCategoryList(response.data.categories);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar as Categorias", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar as Categorias", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get categories:', error);
        showErrorAlert('Erro ao buscar as Categorias', formatAxiosError(error));
    }
  };
  
  useEffect(() => {
    if (isEditing) {
      fetchStatuses();
      fetchPriorities();
      fetchCategories();
    } else {
      setStatusList([]);
      setCategoryList([]);
      setPriorityList([]);
    }
  }, [isEditing]);

  const handleSave = async () => {
    let taskToUpdate = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      due_date: toISOWithOffset(formData.due_date),
      priority_id: formData.priority_id,
      status_id: formData.status_id,
      category_id: formData.category_id,
      assigned_to: formData.assigned_to
    }
    try {
      const response = await tasksService.updateTask(taskToUpdate.id, taskToUpdate);
      if (response.status == 200) {
         setLocalTask({
          ...response.data.task
        });
        setIsEditing(false);
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Tarefa!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <CheckSquare size={24} className="mr-2" />
              {isEditing ? 'Editar Tarefa' : 'Visualizar Tarefa'}
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
            <h3 className="text-lg font-semibold text-gray-900">Informações da Tarefa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Título da Tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Título da Tarefa *
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título da tarefa"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localTask.title}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Descrição da Tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Descrição
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição da Tarefa"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localTask.description}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Prazo da tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Prazo da tarefa *</Label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    required
                    value={formData.due_date ? formatDateUTC(formData.due_date) : null}
                    placeholder='Prazo da Tarefa'
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        due_date: parseDate(e.target.value)
                      })
                    }}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateDateTime(localTask.due_date)}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Prioridade da tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Prioridade</Label>
                {isEditing ? (
                   <Select
                    value={formData.priority_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      priority_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityList.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id.toString()}>
                          <Tag
                            backgroundColor={priority.color}
                            name={priority.name}
                          />
                          {/* <span className="badge" style={{backgroundColor: `${priority.color}`}}>{priority.name}</span> */}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localTask.priority && (
                      <Tag
                        backgroundColor={localTask.priority?.color}
                        name={localTask.priority?.name}
                      />
                      // <span className="badge" style={{backgroundColor: `${localTask.priority?.color}`}}>{localTask.priority?.name}</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Categoria da tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Categoria</Label>
                {isEditing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <Select
                      value={formData.category_id?.toString() || null}
                      onValueChange={(value) => setFormData(formData => ({ 
                        ...formData, 
                        category_id: Number(value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <Tag
                              backgroundColor={category.color}
                              name={category?.name}
                            />
                            {/* <span className="badge" style={{backgroundColor: `${category.color}`}}>{category.name}</span> */}
                          </SelectItem>
                        ))
                      }
                      </SelectContent>
                    </Select>
                    <Button onClick={(e) => setShowNewCategory(true)}>
                      <Plus size={24} />
                      <span>Nova Categoria</span>
                    </Button>
                  </div>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localTask.category && (
                      <Tag
                        backgroundColor={localTask.category?.color}
                        name={localTask.category?.name}
                      />
                      // <span className="badge" style={{backgroundColor: `${localTask.category?.color}`}}>{localTask.category?.name}</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Status da tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.status_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      status_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          <Tag
                            backgroundColor={status.color}
                            name={status.name}
                          />
                          {/* <span className="badge" style={{backgroundColor: `${status.color}`}}>{status.name}</span> */}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localTask.status && (
                      <Tag
                        backgroundColor={localTask.status?.color}
                        name={localTask.status?.name}
                      />
                      // <span className="badge" style={{backgroundColor: `${localTask.status?.color}`}}>{localTask.status?.name}</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Responsável da tarefa!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Responsável</Label>
                {isEditing ? (
                  <Select
                    value={formData.assigned_to?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      assigned_to: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {userList.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.first_name}{' '}{user.last_name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localTask.assigned_to && (
                      <span>{localTask.assignee.first_name}{' '}{localTask.assignee.last_name}</span>
                    )}
                  </p>
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

export default TaskDetails;
