import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, QrCode, Eye, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tasksService } from '@/services/api';
import { showQuestionAlert } from '@/components/ui/alert-dialog-question';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { Task } from '../types/tarefas.types';
import FormateDateTime from '@/components/ui/FormateDateTime';
import { getTextColorForBackground } from '@/lib/utils';
import Tag from '@/components/ui/tag';

interface TaskListProps {
  taskList: Task[];
  onTaskUpdate: () => void;
  onTaskClick: (tarefa: Task) => void;
  onTaskComments: (taskId: number) => void;
  onTaskEditClick: (tarefa: Task) => void;
  isJuliaActive: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
}


const TaskList = ({ taskList, onTaskUpdate, onTaskClick, onTaskEditClick, onTaskComments, isJuliaActive, onElementClick}: TaskListProps) => {
  
  

  // const applyFilter = ()  => {
  //   let searchTMP = search?.trim() ?? "";
  //   if (searchTMP !== "") {
  //       const lowerSearch = searchTMP.toLowerCase();
  //       setProdutoList(originalList.filter((item) => 
  //               item.name.toLowerCase().includes(lowerSearch) || 
  //               (item.description != null && item.description.toLowerCase().includes(lowerSearch)) ||
  //               (item.sku != null && item.sku.toLowerCase().includes(lowerSearch)) ||
  //               (item.serial != null && item.serial.toLowerCase().includes(lowerSearch)) ||
  //               (item.category != null && item.category.toLowerCase().includes(lowerSearch)) ||
  //               (item.supplier != null && item.supplier.toLowerCase().includes(lowerSearch))
  //             ));
  //     } else {
  //       setProdutoList(originalList);
  //     }
  // }

  const deleteTask = (task) => {
    showQuestionAlert('Deletar Tarefa?',
      `Deseja realmente deletar o Tarefa ${task.title}?`,
      task.id,
      closeDeleteNo,
      closeDeleteYes);
  }

  const closeDeleteYes = async (taskId) => {
    console.log("closeDeleteYes");
      try {
      const response = await tasksService.deleteTask(taskId);
      if (response.status == 200) {
        onTaskUpdate();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível deletar a Tarefa", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível deletar a Tarefa", response.data,null);
          }
        }
    } catch (error) {
      console.error('Failed to get delete Task:', error);
      showErrorAlert('Erro ao Deletar a Tarefa', formatAxiosError(error));
    }
  }
  
  const closeDeleteNo = () => {
    console.log("closeDeleteNo");
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Criador</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskList?.length
                ? taskList.map((task) => (
              <TableRow 
                key={task.id}
                onClick={(e) => {
                  if (isJuliaActive) {
                    onElementClick(e, `Tafefa: ${task.title}`)
                  }
                }}
                className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <TableCell className="text-gray-600">{task.title}</TableCell>
                <TableCell className="text-gray-600">
                  {task.category && (
                    <Tag
                      backgroundColor={task.category?.color}
                      name={task.category?.name}
                    />
                  )}
                </TableCell>
                <TableCell className="text-gray-600">{FormateDateTime(task.created_at)}</TableCell>
                <TableCell className="text-gray-600">{FormateDateTime(task.due_date)}</TableCell>
                <TableCell className="text-gray-600">
                  {task.status && (
                    <Tag
                      backgroundColor={task.status?.color}
                      name={task.status?.name}
                    />
                  )}
                </TableCell>
                <TableCell className="text-gray-600">
                  {task.priority && (
                     <Tag
                      backgroundColor={task.priority?.color}
                      name={task.priority?.name}
                    />
                  )}
                </TableCell>
                <TableCell className="text-gray-600">{task.creator?.username}</TableCell>
                <TableCell className="text-gray-600">{task.assignee?.username}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      title="Visualizar Comentários"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Comentários da Tarefa!");
                        } else {
                          onTaskComments(task.id);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <MessageSquareText size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Visualizar Detalhes"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Visualizar detalhes da Tarefa!");
                        } else {
                          onTaskClick(task);
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
                          onElementClick(e, "Editar informações da Tarefa!");
                        } else {
                          onTaskEditClick(task);
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
                          onElementClick(e, "Excluir esta tarefa permanentemente do sistema!");
                        } else {
                          deleteTask(task);
                        }
                      }}
                      className={`text-red-600 hover:text-red-800 ${isJuliaActive ? 'cursor-help' : ''}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            : <TableRow 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="font-mono text-sm">
                  <div className="font-medium text-gray-900">Nenhuma Tarefa encontrado</div>
                </TableCell>
                
              </TableRow>
          }
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TaskList;
