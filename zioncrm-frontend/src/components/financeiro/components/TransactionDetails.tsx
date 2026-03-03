import React, { useState, useEffect } from 'react';
import { Calendar, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { agendaService, financialService } from '@/services/api';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { Textarea } from '@/components/ui/textarea';
import FormateDateTime from '@/components/ui/FormateDateTime';
import { formatDate, formatDateUTC, parseDate, toISOWithOffset } from '@/lib/utils';
import { Transacao } from '../types/financeiro.types';
import CurrencyInput from '@/components/ui/CurrencyInput';
import FormateCurrency from '@/components/ui/FormateCurrency';
import { getCategoryTypeDescription, getPaymentMethods, getPaymentMethodsDescription, mountCategoryTypeIcon } from '@/lib/constantData';
import Tag from '@/components/ui/tag';



interface TransactionDetailsProps {
  transaction: Transacao;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const TransactionDetails = ({ transaction, onClose, onElementClick, isJuliaActive, editMode }: TransactionDetailsProps) => {
  const [localTransaction, setLocalTransaction] = useState(transaction);
  const [isEditing, setIsEditing] = useState(editMode);
  const [paymentMethodList] = useState(getPaymentMethods())
  const [categoryList, setCategoryList] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [formData, setFormData] = useState({
    id: localTransaction.id,
    user_id: localTransaction.user_id,
    amount: localTransaction.amount,
    transaction_type: localTransaction.transaction_type,
    date: localTransaction.date,
    description: localTransaction.description,
    category_id: localTransaction.category_id,
    category_name: localTransaction.category_name,
    account_id: localTransaction.account_id,
    account_name: localTransaction.account_name,
    payment_method: localTransaction.payment_method,
    reference: localTransaction.reference,
    notes: localTransaction.notes,
    created_at: localTransaction.created_at,
    updated_at: localTransaction.updated_at,
  });


  const handleSave = async () => {
    try {
      let transaction = {
        id: formData.id,
        amount: formData.amount,
        transaction_type: formData.transaction_type,
        date: toISOWithOffset(formData.date),
        description: formData.description,
        category_id: Number(formData.category_id),
        account_id: Number(formData.account_id),
        payment_method: formData.payment_method,
        reference: formData.reference,
        notes: formData.notes,
      }
      const response = await financialService.updateTransaction(transaction.id, transaction);
      if (response.status == 200 || response.status == 201) {
        setIsEditing(false);
        setLocalTransaction({
          ...response.data.transaction
      });
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Transação", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Transação", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get current Transaction:', error);
        showErrorAlert('Erro ao salvar a Transação', formatAxiosError(error));
    }
  };

  const getAccounts = async () => {
    try {
      const response = await financialService.getAccounts();
      setAccountList(response.data.accounts);
    } catch (error) {
      console.error('Failed to get accounts:', error);
      showErrorAlert('Erro ao carregar a lista de Contas', formatAxiosError(error));
    }
  }

  const getCategories = async () => {
    try {
      const response = await financialService.getCategories();
      let auxList = response.data.categories;
      auxList = mountCategoryTypeIcon(auxList);
      setCategoryList(auxList);
      // setCategoryList(response.data.categories);
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error));
    }
  }

  useEffect(() => {
    if (editMode) {
      getCategories();
      getAccounts();
    }
  }, [editMode]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Transação!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Calendar size={24} className="mr-2" />
              {isEditing ? 'Editar Transação' : 'Visualizar Transação'}
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
            <h3 className="text-lg font-semibold text-gray-900">Informações do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                ) : (
                  <Textarea
                    className="p-2 bg-gray-50 rounded min-height-40"
                    value={localTransaction.description}
                    disabled
                  />
                )}
              </div>

              <div>
                <Label>Valor *</Label>
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
                  <p className="p-2 bg-gray-50 rounded">{FormateCurrency(localTransaction.amount)}</p>
                )}
              </div>

              <div>
                <Label>Data *</Label>
                {isEditing ? (
                   <Input
                    type="datetime-local"
                    value={formatDate(formData.date)}
                    onChange={(e) => setFormData({...formData, date: parseDate(e.target.value)})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateDateTime(localTransaction.date)}</p>
                )}
              </div>

              <div>
                <Label>Tipo</Label>
                {isEditing ? (
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      transaction_type: value as 'income' | 'expense'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{getCategoryTypeDescription(localTransaction.transaction_type)}</p>
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
                        <SelectItem key={category.id.toString()} value={category.id.toString()}>
                          <div className="grid grid-cols-[30%_70%] gap-2">
                            <div>
                              <div className={`w-8 h-8 ${category.icon_class} rounded-full flex items-center justify-center`}
                                title={getCategoryTypeDescription(category.type)}  
                              >
                                <category.icon size={16} className="text-white" />
                              </div>
                              {/* {getCategoryTypeDescription(category.type)} */}
                            </div>
                            <Tag
                              backgroundColor={category.color}
                              name={category.name}
                            />
                          </div>
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localTransaction.category_name}</p>
                )}
              </div>
              
              <div>
                <Label>Conta</Label>
                {isEditing ? (
                  <Select
                    value={formData.account_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      account_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountList.map((account) => (
                        <SelectItem key={account.id.toString()} value={account.id.toString()}>
                         {account.name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localTransaction.account_name}</p>
                )}
              </div>

              <div>
                <Label>Forma de Pagamento</Label>
                {isEditing ? (
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      payment_method: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodList.map((payment) => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {payment.name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{getPaymentMethodsDescription(localTransaction.payment_method)}</p>
                )}
              </div>

              <div>
                <Label>Referência</Label>
                {isEditing ? (
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{getPaymentMethodsDescription(localTransaction.reference)}</p>
                )}
              </div>

              <div>
                <Label>Observações</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Observações da Trasação"
                    required
                  />
                ) : (
                  <Textarea
                    className="p-2 bg-gray-50 rounded min-height-40"
                    value={localTransaction.description}
                    disabled
                  />
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

export default TransactionDetails;
