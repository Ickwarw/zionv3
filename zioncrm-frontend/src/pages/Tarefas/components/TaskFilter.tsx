import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Tag from '@/components/ui/tag';

export interface TaskFilterProps {
  onApply: (filter) => void;
  onCancel: () => void;
  isOpen: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  oldFilter: any;
}

const TaskFilter = ({ isOpen, onApply, onCancel, onElementClick, isJuliaActive, oldFilter }: TaskFilterProps) => {
  const [priorityList, setPriorityList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [formData, setFormData] = useState({
    status_id: oldFilter.status_id,
    priority_id: oldFilter.priority_id,
    category_id: oldFilter.category_id,
    assigned_to: oldFilter.assigned_to,
    search: oldFilter.search,
    due_date: oldFilter.due_date //today, tomorrow, week, overdue
  });

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

  const handleSubmit = () => {
    let param = {}
    if (formData.status_id != null && formData.status_id != '') {
      param = {...param, status_id : formData.status_id};
    }
    if (formData.category_id != null && formData.category_id != '') {
      param = {...param, category_id : formData.category_id};
    }
    if (formData.priority_id != null && formData.priority_id != '') {
      param = {...param, priority_id : formData.priority_id};
    }
    if (formData.assigned_to != null && formData.assigned_to != '') {
      param = {...param, assigned_to : formData.assigned_to};
    }
    if (formData.due_date != null && formData.due_date != '') {
      param = {...param, due_date : formData.due_date};
    }
    if (formData.search != null && formData.search.trim() != '') {
      param = {...param, search : formData.search};
    }
    onApply(param);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onApply}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Filtro de Tarefas!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Filtro de Tarefas
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

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
                  <SelectValue placeholder="Todos" />
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
                  <SelectValue placeholder="Todas" />
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
              <Select
                value={formData.category_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  category_id: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
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
                  <SelectValue placeholder="Todos" />
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

            <div>
              <Label
                onClick={(e) => onElementClick(e, "Prazo da tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >Prazo</Label>
              <Select
                value={formData.assigned_to || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  assigned_to: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Vence Hoje</SelectItem>
                  <SelectItem value="tomorrow">Vence Amanhã</SelectItem>
                  <SelectItem value="week">Vence Esta Semana</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Pesquisa o texto no título e/ou na descrição da Tarefa!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Buscar no Tìtulo e/ou Descrição
              </Label>
              <Input
                value={formData.search}
                onChange={(e) => setFormData({...formData, search: e.target.value})}
                placeholder="Buscar"
                required
              />
            </div>

          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Aplica Filtro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default TaskFilter;