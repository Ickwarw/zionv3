
import React, { useState } from 'react';
import { Building2, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { AccountFormData, NewAccountProps } from '../types/cadastro-account.types';
import { financialService } from '@/services/api';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountType } from '@/lib/constantData';

const NewAccount = ({ onClose, onElementClick, isJuliaActive }: NewAccountProps) => {
  const [accountTypeList] = useState(accountType);
  const [formData, setFormData] = useState<AccountFormData>({
    id: null,
    name: '',
    account_type: '',
    balance: 0,
    user_id: '',
    description: '',
    currency: 'BRL',
    created_at: null,
    updated_at: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Conta cadastrada:', { formData });
    saveAccount();
    onClose();
  };

  const saveAccount = async () => {
    try {
      const response = await financialService.createAccount(formData);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Conta", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Conta", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Account:', error);
        showErrorAlert('Erro ao Salvar a Conta', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            onClick={(e) => onElementClick(e, "Formulário de cadastro de fornecedores com informações completas!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <Building2 size={24} className="inline mr-2" />
            Cadastrar Novo Fornecedor
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 
              onClick={(e) => onElementClick(e, "Seção com os dados principais daconta!")}
              className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              Dados da Conta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Nome da Conta!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Nome *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome da conta"
                  required
                />
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Descrição da Conta!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Descrição
                </Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição da conta"
                  required
                />
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Tipo da conta!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Tipo
                </Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData(formData => ({ 
                    ...formData, 
                    account_type: value as 'checking' | 'savings' | 'credit' | 'cash'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Tipo" />
                  </SelectTrigger>
                   <SelectContent>
                      {accountTypeList.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Moeda da conta!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Moeda
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(formData => ({ 
                    ...formData, 
                    currency: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="BRL">Real (Brasil)</SelectItem>
                      <SelectSeparator/>
                      <SelectItem value="USD">Dólar Americano</SelectItem>
                      <SelectItem value="ARS">Peso Argentin</SelectItem>
                      <SelectItem value="CLP">Peso Chileno</SelectItem>
                      <SelectItem value="COP">Peso Colombiano</SelectItem>
                      <SelectItem value="MXN">Peso Mexicano</SelectItem>
                      <SelectItem value="PEN">Sol Peru</SelectItem>
                      <SelectItem value="UYU">Peso Uruguaio</SelectItem>
                      <SelectItem value="EUR">Euro</SelectItem>
                      <SelectItem value="JPY">Iene Japonês</SelectItem>
                      <SelectItem value="CAD">Dólar Canadense</SelectItem>
                      <SelectItem value="AUD">Dólar Australiano</SelectItem>
                      <SelectItem value="NZD">Dólar Neozelandês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Wallet size={20} className="mr-2" />
              Cadastrar Conta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAccount;
