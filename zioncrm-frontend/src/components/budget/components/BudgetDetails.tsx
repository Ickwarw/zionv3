
import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Save } from 'lucide-react';
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
import { budgetPeriod, getBudgetPeriodDescription, getCategoryTypeDescription } from '@/lib/constantData';
import { BudgetFormData } from '../types/cadastro-budget.types';
import CurrencyInput from '@/components/ui/CurrencyInput';
import FormateCurrency from '@/components/ui/FormateCurrency';
import Tag from '@/components/ui/tag';


interface BudgetDetailsProps {
  budget: BudgetFormData;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const BudgetDetails = ({ budget, onClose, onElementClick, isJuliaActive, editMode }: BudgetDetailsProps) => {
  const [budgetPeriodList] = useState(budgetPeriod);
  const [localBudget, setLocalBudget] = useState(budget);
  const [isEditing, setIsEditing] = useState(editMode);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    id: localBudget.id,
    user_id: localBudget.user_id,
    name: localBudget.name,
    color: localBudget.color,
    amount: localBudget.amount,
    period: localBudget.period,
    category_id: localBudget.category_id,
    category_name: localBudget.category_name
  });

  const handleSave = async () => {
    try {
      const response = await financialService.updateBudget(formData.id, formData);
      if (response.status == 200) {
        setFormData({
          id: response.data.budget.id,
          name: response.data.budget.name,
          color: response.data.budget.color,
          user_id: response.data.budget.user_id,
          amount: response.data.budget.amount,
          period: response.data.budget.period,
          category_id: response.data.budget.category_id,
          category_name: response.data.budget.category_name,
        });
        setLocalBudget({
          ...response.data.budget
        });
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Orçamento", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Orçamento", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Budget:', error);
        showErrorAlert('Erro ao Salvar o Orçamento', formatAxiosError(error));
    }
  }

  const getCategories = async () => {
    try {
      const response = await financialService.getCategories();
      setCategoryList(response.data.categories);
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada do Orçamento!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <CircleDollarSign size={24} className="mr-2" />
              {isEditing ? 'Editar Orçamento' : 'Visualizar Orçamento'}
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
            <h3 className="text-lg font-semibold text-gray-900">Informações do Orçamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Orçamento</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localBudget.name}</p>
                )}
              </div>

              <div>
                <Label>Valor</Label>
                {isEditing ? (
                  <CurrencyInput
                    value={formData.amount}
                    onChange={(value) => 
                      setFormData({
                        ...formData,
                        amount: Number(value.replace('R$', '').replace(".","").replace(",",".")) 
                      })
                    }
                    placeholder="R$ 2299.00"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateCurrency(localBudget.amount)}</p>
                )}
              </div>

              <div>
                <Label>Período</Label>
                {isEditing ? (
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      period: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Período" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetPeriodList.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{getBudgetPeriodDescription(localBudget.period)}</p>
                )}
              </div>

              <div>
                <Label>Categoria</Label>
                {isEditing ? (
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
                            name={category.name}
                          />
                          {/* <span className="badge" style={{backgroundColor: `${category.color}`}}>{category.name}</span> */}
                          {' - '}{getCategoryTypeDescription(category.type)}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localBudget.category_name}</p>
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
                    <span className="badge" style={{backgroundColor: `${localBudget.color}`}}>{localBudget.color}</span>
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

export default BudgetDetails;
