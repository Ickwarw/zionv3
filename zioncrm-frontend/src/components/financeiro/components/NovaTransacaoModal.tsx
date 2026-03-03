import React, { useState, useEffect } from 'react';
import { X, Calendar} from 'lucide-react';
import { Transacao } from '../types/financeiro.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { financialService } from '@/services/api';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatDateUTC, parseDate } from '@/lib/utils';
import { getCategoryTypeDescription, getPaymentMethods, mountCategoryTypeIcon } from '@/lib/constantData';
import Tag from '@/components/ui/tag';

interface NovaTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData) => void;
}

const NovaTransacaoModal = ({ isOpen, onClose, onSave }: NovaTransacaoModalProps) => {
  if (!isOpen) return null;
  const [paymentMethodList] = useState(getPaymentMethods())
  const [categoryList, setCategoryList] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date(),
    description: '',
    category_id: '',
    transaction_type: '',
    account_id: '',
    payment_method: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    getCategories();
    getAccounts();
  }, []);

  const handleSave = () => {
    console.log("handleSave");
    if (!formData.description || !formData.amount || !formData.category_id) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    let transaction = {
      amount: formData.amount,
      transaction_type:formData.transaction_type,
      date: formatDateUTC(formData.date),
      description: formData.description,
      category_id: formData.category_id,
      account_id: formData.account_id,
      payment_method: formData.payment_method,
      reference: formData.reference,
      notes: formData.notes,
    }
    onSave({
      ...transaction,
    });
    onClose();
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
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error));
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nova Transação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label>Descrição *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Venda para cliente XYZ"
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
                <Label>Data *</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={formatDate(formData.date)}
                    onChange={(e) => setFormData({...formData, date: parseDate(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>Tipo *</Label>
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
              </div>
                      
            <div>
              <Label>Categoria *</Label>
              <Select
                value={formData.category_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  category_id: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
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
            </div>

            <div>
              <Label>Conta *</Label>
              <Select
                value={formData.account_id || null}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  account_id: value.toString()
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Conta" />
                </SelectTrigger>
                <SelectContent>
                  {accountList.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData(formData => ({ 
                  ...formData, 
                  payment_method: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Forma de Pagamento" />
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
            </div>

            <div>
              <Label>Referência</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Salvar Transação
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovaTransacaoModal;
