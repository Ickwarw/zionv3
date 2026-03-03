
import React, { useEffect, useState } from 'react';
import { X, Calendar, Building2, Users, Plus } from 'lucide-react';
import { Tarefa, TaskCategory, TaskPriority, TaskStatus, User } from '../types/tarefas.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, parseDate, toISOWithOffset } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import NewCategory from './NewCatetgory';
import { Button } from '@/components/ui/button';
import Tag from '@/components/ui/tag';

interface NovaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isJuliaActive: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}

const NovaTarefaModal = ({ isOpen, onClose, onSave, onElementClick, isJuliaActive }: NovaTarefaModalProps) => {
  const [priorityList, setPriorityList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: null,
    priority_id: null,
    status_id: null,
    category_id: null,
    assigned_to: null
  });

  const validateFields = () => {
    let message = '';
    if (formData.title == null && formData.title.trim() == '') {
      message = "Título da tarefa é obrigatório\n";
    }
    if (formData.due_date == null && formData.due_date.trim() == '') {
      message += "Prazo da tarefa é obrigatório";
    }
    if (message.length > 0) {
      showWarningAlert("Campos Obrigatórios",message,null);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFields()) {
      try {
        let newTask = {
          title: formData.title,
          description: formData.description,
          due_date: toISOWithOffset(formData.due_date),
          priority_id: formData.priority_id,
          status_id: formData.status_id,
          category_id: formData.category_id,
          assigned_to: formData.assigned_to
        }
        const response = await tasksService.createTask(newTask);
        if (response.status == 200 || response.status == 201) {
          onSave();
          // onClose();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Salvar a Tarefa", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível Salvar a Tarefa", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to create Task:', error);
          showErrorAlert('Erro ao Salvar a Tarefa', formatAxiosError(error));
      }
    }
  };

  if (!isOpen) return null;

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
    fetchStatuses();
    fetchPriorities();
    fetchCategories();
  }, []);

  const newCategoryYes = (newCategoryId) => {
    fetchCategories();
    setFormData(formData => ({ 
                  ...formData, 
                  category_id: newCategoryId.toString()
                }))
    setShowNewCategory(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nova Tarefa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Título da Tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Título da Tarefa *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título da tarefa"
                required
              />
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Descrição da Tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Descrição
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição da Tarefa"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Prazo da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Prazo da tarefa *</Label>
              <Input
                type="datetime-local"
                required
                value={formData.due_date ? formatDate(formData.due_date) : null}
                placeholder='Prazo da Tarefa'
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    due_date: parseDate(e.target.value)
                  })
                }}
              />
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Prioridade da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Prioridade</Label>
              <Select
                value={formData.priority_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  priority_id: value.toString()
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
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Categoria da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Categoria</Label>
              <div className="grid grid-cols-[90%_10%] gap-2">
                <Select
                  value={formData.category_id || null}
                  onValueChange={(value) => setFormData(formData => ({ 
                    ...formData, 
                    category_id: value.toString()
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
                          name={category.name}
                        />
                      </SelectItem>
                    ))
                  }
                  </SelectContent>
                </Select>
                <Button onClick={(e) => setShowNewCategory(true)}>
                  <Plus size={24} />
                </Button>
              </div>
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Status da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Status</Label>
              <Select
                value={formData.status_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  status_id: value.toString()
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
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Responsável da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Responsável</Label>
              <Select
                value={formData.assigned_to || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  assigned_to: value.toString()
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
            </div>
          </div>


          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
        { showNewCategory && (
          <NewCategory
            isJuliaActive={isJuliaActive}
            isOpen={showNewCategory}
            onElementClick={onElementClick}
            onCancel={() => setShowNewCategory(false)}
            onSave={newCategoryYes}
          />
        )}
      </div>
    </div>
  );
};

export default NovaTarefaModal;
