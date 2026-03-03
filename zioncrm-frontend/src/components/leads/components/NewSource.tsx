import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { leadsService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';

export interface NewSourceProps {
  onSave: (sourceId) => void;
  onCancel: () => void;
  isOpen: boolean;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const NewSource = ({ isOpen, onSave, onCancel, onElementClick, isJuliaActive }: NewSourceProps) => {
  const [formData, setFormData] = useState({
      name: '',
      description: ''
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await leadsService.addLeadSources(formData.name, formData.description);
      if (response.status == 200 || response.status == 201) {
        onSave(response.data.source.id);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Salvar a Origem", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Salvar a Origem", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Origem:', error);
        showErrorAlert('Erro ao Salvar a Origem', formatAxiosError(error));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onSave}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Cadastro de Nova Origem!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Cadastro de Origem da Lead
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Nome!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Nome
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome da Origem"
              />
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Descrição!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Descrição
              </Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição da Origem"
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

export default NewSource;