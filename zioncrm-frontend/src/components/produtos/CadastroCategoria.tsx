
import React, { useState } from 'react';
import { TextQuote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { productsService } from '@/services/api';
import { CategoriaFormData } from './types/cadastro-categoria.types';
import { Input } from '../ui/input';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';

export interface CadastroCategoriaProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const CadastroCategoria = ({ onClose, onElementClick, isJuliaActive }: CadastroCategoriaProps) => {
  const [formData, setFormData] = useState<CategoriaFormData>({
    id: null,
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Categoria cadastrado:', { ...formData });
    saveCategoria();
    onClose();
  };

  const saveCategoria = async () => {
    try {
      const response = await productsService.createProductCategory(formData.name, formData.description);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Categoria", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Categoria", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Category:', error);
        showErrorAlert('Erro ao Salvar a Categoria', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            onClick={(e) => onElementClick(e, "Formulário de cadastro de Categoria de Produtos!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <TextQuote size={24} className="inline mr-2" />
            Cadastrar Nova Categoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Nome da categoria!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Nome *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome da Categoria"
                required
              />
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Nome da categoria!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Descrição *
              </Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição da Categoria"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <TextQuote size={20} className="mr-2" />
              Cadastrar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroCategoria;
