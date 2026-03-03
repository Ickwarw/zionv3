import React, { useState, useEffect } from 'react';
import { Building2, CircleDollarSign, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { BudgetFormData, NewBudgetProps } from '../types/cadastro-budget.types';
import { financialService } from '@/services/api';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { budgetPeriod, getCategoryTypeDescription } from '@/lib/constantData';
import Tag from '@/components/ui/tag';

const NewBudget = ({ onClose, onElementClick, isJuliaActive }: NewBudgetProps) => {
  const [budgetPeriodList] = useState(budgetPeriod);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState<BudgetFormData>({
    id: null,
    name: '',
    user_id: null,
    amount: null,
    period: '',
    category_id: null,
    category_name: '',
    color: '#3788d8',
    current_spending: null,
    percentage: null,
    created_at: null,
    updated_at: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Orçamento Cadastrado:');
    saveBudget();
  };

  const saveBudget = async () => {
    try {
      const response = await financialService.createBudget(formData);
      if (response.status == 200 || response.status == 201) {
        onClose();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Orçamento", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvaro Orçamento", response.data,null);
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
          <DialogTitle 
            onClick={(e) => onElementClick(e, "Formulário de cadastro de Orçamentos!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <CircleDollarSign size={24} className="inline mr-2" />
            Cadastrar Novo Orçamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 
              onClick={(e) => onElementClick(e, "Seção com os dados principais daconta!")}
              className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              Dados do Orçamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Nome do Orçamento!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Nome *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome do Orçamento"
                  required
                />
              </div>

              <div>
                <Label>Valor *</Label>
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
              </div>
              
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Período!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Período
                </Label>
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
              </div>

              <div>
                <Label>Categoria *</Label>
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
              </div>
              
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Cor do Orçamento!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Cor
                </Label>
                <Input
                  value={formData.color}
                  type="color"
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="Cor do Orçamento"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <CircleDollarSign size={20} className="mr-2" />
              Cadastrar Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewBudget;
