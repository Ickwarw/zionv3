
import React, { useState } from 'react';
import { Building2, SquareMenu, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { financialService } from '@/services/api';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryFormData, NewCategoryProps } from '../types/cadastro-category.types';

const NewCategory = ({ onClose, onElementClick, isJuliaActive }: NewCategoryProps) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    id: null,
    name: '',
    type: '',
    user_id: null,
    color: '#3788d8',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Categoria cadastrada:', { formData });
    saveCategory();
    onClose();
  };

  const saveCategory = async () => {
    try {
      const response = await financialService.createCategory(formData.name, formData.type, formData.color);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Categoria", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Categoria", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Categoria:', error);
        showErrorAlert('Erro ao Salvar a Categoria', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            onClick={(e) => onElementClick(e, "Formulário de cadastro de Categorias com informações completas!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <Building2 size={24} className="inline mr-2" />
            Cadastrar Nova Categoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 
              onClick={(e) => onElementClick(e, "Seção com os dados principais da categoria!")}
              className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              Dados da Categoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Nome da empresa!")}
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
                  onClick={(e) => onElementClick(e, "Tipo da Categoria!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Tipo
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(formData => ({ 
                    ...formData, 
                    type: value as 'income' | 'expense' | 'both'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="both">Receita/Despesa</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <SquareMenu size={20} className="mr-2" />
              Cadastrar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategory;
