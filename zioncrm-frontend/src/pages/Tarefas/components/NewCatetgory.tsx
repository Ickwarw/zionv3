import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { tasksService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';

export interface NewCategoryProps {
  onSave: (categoryId) => void;
  onCancel: () => void;
  isOpen: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const NewCategory = ({ isOpen, onSave, onCancel, onElementClick, isJuliaActive }: NewCategoryProps) => {
  const [formData, setFormData] = useState({
      name: '',
      color: '#3788d8'
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await tasksService.createTaskCategory(formData.name, formData.color);
      if (response.status == 200 || response.status == 201) {
        onSave(response.data.category.id);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Salvar a Categoria", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Salvar a Categoria", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Categoria:', error);
        showErrorAlert('Erro ao Salvar a Categoria', formatAxiosError(error));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onSave}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Cadastro de Nova Categoria!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Cadastro de Categoria de Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Nome da Categoria!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Nome
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome da Categoria de Tarefa"
              />
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Cor da Categoria!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Cor
              </Label>
              <Input
                value={formData.color}
                type="color"
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="Cor da Categoria"
              />
            </div>

          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default NewCategory;