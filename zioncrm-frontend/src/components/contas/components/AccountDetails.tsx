
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AccountFormData } from '../types/cadastro-account.types';
import FormateCurrency from '@/components/ui/FormateCurrency';
import { getAccountTypeDescription } from '@/lib/constantData';


interface AccountDetailsProps {
  account: AccountFormData;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const AccountDetails = ({ account, onClose, onElementClick, isJuliaActive }: AccountDetailsProps) => {
  const [localAccount] = useState(account);
  
  // const getAccountTypeDescription = (value) => {
  //   if (value == 'checking') {
  //     return "Conta Corrente";
  //   } else if (value == 'savings') {
  //     return "Poupança";
  //   } else if (value == 'credit') {
  //     return "Crédito";
  //   } else if (value == 'cash') {
  //     return "Dinheiro";
  //   }
  //   return "Nenhum";
  // }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Conta!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Wallet size={24} className="mr-2" />
              Visualizar Conta
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações da Conta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label>Nome da Conta</Label>
                <p className="p-2 bg-gray-50 rounded">{localAccount.name}</p>
              </div>

              <div>
                <Label>Descrição</Label>
                <p className="p-2 bg-gray-50 rounded min-height-40">{localAccount.description}</p>
              </div>

              <div>
                <Label>Tipo da Conta</Label>
                <p className="p-2 bg-gray-50 rounded min-height-40">{getAccountTypeDescription(localAccount.account_type)}</p>
              </div>

              <div>
                <Label>Moeda</Label>
                <p className="p-2 bg-gray-50 rounded min-height-40">{localAccount.currency}</p>
              </div>

              <div>
                <Label>Saldo</Label>
                <p className="p-2 bg-gray-50 rounded min-height-40">{FormateCurrency(localAccount.balance)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetails;
