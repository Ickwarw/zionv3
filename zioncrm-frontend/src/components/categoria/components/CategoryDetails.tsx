
import React, { useState } from 'react';
import { Package, Save, SquareMenu } from 'lucide-react';
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
import { financialService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { CategoryFormData } from '../types/cadastro-category.types';
import { getCategoryTypeDescription } from '@/lib/constantData';
import Tag from '@/components/ui/tag';


interface CategoryDetailsProps {
  category: CategoryFormData;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const CategoryDetails = ({ category, onClose, onElementClick, isJuliaActive, editMode }: CategoryDetailsProps) => {
  const [localCategory, setLocalCategory] = useState(category);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({
    id: localCategory.id,
    name: localCategory.name,
    color: localCategory.color,
    type: localCategory.type
  });

  const handleSave = async () => {
    try {
      const response = await financialService.updateCategory(formData.id, formData);
      if (response.status == 200) {
        setFormData({
          id: response.data.category.id,
          name: response.data.category.name,
          color: response.data.category.color,
          type: response.data.category.type
        });
        setLocalCategory({
          ...response.data.category
        });
        setIsEditing(false);
      } else if (response.status == 400) {
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
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Categoria!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <SquareMenu size={24} className="mr-2" />
              {isEditing ? 'Editar Categoria' : 'Visualizar Categoria'}
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
            <h3 className="text-lg font-semibold text-gray-900">Informações da Categoria</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Categoria</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localCategory.name}</p>
                )}
              </div>

              <div>
                <Label>Tipo</Label>
                {isEditing ? (
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
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{getCategoryTypeDescription(localCategory.type)}</p>
                )}
              </div>

              <div>
                <Label>Cor</Label>
                {isEditing ? (
                  <Input
                    value={formData.color}
                    type="color"
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="Cor da Categoria"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    <Tag
                      backgroundColor={localCategory.color}
                      name={localCategory.color}
                    />
                    {/* <span className="badge" style={{backgroundColor: `${localCategory.color}`}}>{localCategory.color}</span> */}
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

export default CategoryDetails;
