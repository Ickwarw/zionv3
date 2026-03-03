
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import DadosEmpresa from './components/DadosEmpresa';
import ContatosGerenciamento from './components/ContatosGerenciamento';
import { CadastroFornecedorProps, FornecedorFormData, Contact } from './types/cadastro-fornecedor.types';
import { productsService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { showWarningAlert } from '../ui/alert-dialog-warning';

const CadastroFornecedor = ({ onClose, onElementClick, isJuliaActive }: CadastroFornecedorProps) => {
  const [formData, setFormData] = useState<FornecedorFormData>({
    id: null,
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    website: '',
    contact_person: ''
  });

  const [contatos, setContatos] = useState<Contact[]>([
    { id: 1, name: '', position: '', phone: '', email: '', new: null }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fornecedor cadastrado:', { ...formData, contatos });
    saveFornecedor();
    onClose();
  };

  const saveFornecedor = async () => {
    try {
      let fornecedor: FornecedorFormData = {
        ...formData,
      };
      if (contatos?.length) {
        fornecedor.contacts = contatos.map((contato) => ({
          id: contato.id,
          name: contato.name,
          email: contato.email,
          phone: contato.phone,
          position: contato.position,
          new: null
        }));
      }
      const response = await productsService.createSupplier(fornecedor);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Fornecedor", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Fornecedor", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Supplier:', error);
        showErrorAlert('Erro ao Salvar o fornecedor', formatAxiosError(error));
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
          <DadosEmpresa 
            formData={formData}
            setFormData={setFormData}
            onElementClick={onElementClick}
            isJuliaActive={isJuliaActive}
          />

          <ContatosGerenciamento 
            contatos={contatos}
            setContatos={setContatos}
            onElementClick={onElementClick}
            isJuliaActive={isJuliaActive}
          />

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Observações adicionais sobre o fornecedor!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Observações
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações adicionais sobre o fornecedor..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Building2 size={20} className="mr-2" />
              Cadastrar Fornecedor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroFornecedor;
