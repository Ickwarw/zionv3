import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { withMask } from 'use-mask-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { leadsDashAgentService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';

interface NovoLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const NewLeadModal = ({ isOpen, onClose, onSave }: NovoLeadModalProps) => {
  const [formData, setFormData] = useState({
    // Campos obrigatórios
    razao: '',
    cnpj_cpf: '',
    ie_identidade: '',
    endereco: '',
    contato: '',
    
    // Campos adicionais importantes
    fantasia: '',
    tipo_pessoa: 'F', // F=Física, J=Jurídica
    email: '',
    fone: '',
    telefone_comercial: '',
    telefone_celular: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    referencia: '',
    
    // Dados pessoais
    data_nascimento: '',
    estado_civil: '',
    sexo: '',
    
    // Endereço de cobrança
    endereco_cob: '',
    numero_cob: '',
    bairro_cob: '',
    cidade_cob: '',
    uf_cob: '',
    cep_cob: '',
    
    // Classificação
    prioridade: 'NovaLead',
    origem: '',
    
    // Outros
    obs: '',
    ativo: 'S'
  });

  const validateFields = () => {
    let message = '';
    
    if (!formData.razao || formData.razao.trim() === '') {
      message += "• Razão Social / Nome é obrigatório\n";
    }
    if (!formData.cnpj_cpf || formData.cnpj_cpf.trim() === '') {
      message += "• CPF/CNPJ é obrigatório\n";
    }
    if (!formData.ie_identidade || formData.ie_identidade.trim() === '') {
      message += "• RG/IE é obrigatório\n";
    }
    if (!formData.endereco || formData.endereco.trim() === '') {
      message += "• Endereço é obrigatório\n";
    }
    if (!formData.contato || formData.contato.trim() === '') {
      message += "• Nome do Contato é obrigatório\n";
    }
    
    if (message.length > 0) {
      showWarningAlert("Campos Obrigatórios", message, null);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateFields()) {
      try {
        // Monta o objeto com todos os campos do formulário
        const leadData = {
          ...formData,
          // Remove campos vazios para o backend usar valores default
          fantasia: formData.fantasia || null,
          email: formData.email || null,
          fone: formData.fone || null,
          telefone_comercial: formData.telefone_comercial || null,
          telefone_celular: formData.telefone_celular || null,
          data_nascimento: formData.data_nascimento || null,
          obs: formData.obs || null
        };
        
        const response = await leadsDashAgentService.createLead(leadData);
        
        if (response.status === 200 || response.status === 201) {
          onSave();
          onClose();
          // Limpa o formulário
          setFormData({
            razao: '', cnpj_cpf: '', ie_identidade: '', endereco: '', contato: '',
            fantasia: '', tipo_pessoa: 'F', email: '', fone: '', telefone_comercial: '',
            telefone_celular: '', numero: '', complemento: '', bairro: '', cidade: '',
            uf: '', cep: '', referencia: '', data_nascimento: '', estado_civil: '',
            sexo: '', endereco_cob: '', numero_cob: '', bairro_cob: '', cidade_cob: '',
            uf_cob: '', cep_cob: '', prioridade: 'NovaLead', origem: '', obs: '', ativo: 'S'
          });
        } else if (response.status === 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Salvar a Lead", response.data.message, null);
          } else {
            showWarningAlert("Não foi possível Salvar a Lead", response.data, null);
          }
        }
      } catch (error) {
        console.error('Failed to create Lead:', error);
        showErrorAlert('Erro ao Salvar a Lead', formatAxiosError(error));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Novo Lead
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <Label>Tipo de Pessoa</Label>
                <Select
                  value={formData.tipo_pessoa}
                  onValueChange={(value) => setFormData({...formData, tipo_pessoa: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Pessoa Física</SelectItem>
                    <SelectItem value="J">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Razão Social / Nome Completo *</Label>
                <Input
                  value={formData.razao}
                  onChange={(e) => setFormData({...formData, razao: e.target.value})}
                  placeholder="Nome ou Razão Social"
                  required
                />
              </div>

              <div>
                <Label>Nome Fantasia / Apelido</Label>
                <Input
                  value={formData.fantasia}
                  onChange={(e) => setFormData({...formData, fantasia: e.target.value})}
                  placeholder="Nome Fantasia"
                />
              </div>

              <div>
                <Label>CPF / CNPJ *</Label>
                <Input
                  value={formData.cnpj_cpf}
                  onChange={(e) => setFormData({...formData, cnpj_cpf: e.target.value})}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  required
                />
              </div>

              <div>
                <Label>RG / Inscrição Estadual *</Label>
                <Input
                  value={formData.ie_identidade}
                  onChange={(e) => setFormData({...formData, ie_identidade: e.target.value})}
                  placeholder="RG ou IE"
                  required
                />
              </div>

              <div>
                <Label>Nome do Contato *</Label>
                <Input
                  value={formData.contato}
                  onChange={(e) => setFormData({...formData, contato: e.target.value})}
                  placeholder="Nome da pessoa de contato"
                  required
                />
              </div>

            </div>
          </div>

          {/* Contato */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  type="email"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label>Telefone Principal</Label>
                <Input
                  value={formData.fone}
                  onChange={(e) => setFormData({...formData, fone: e.target.value})}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div>
                <Label>Telefone Celular</Label>
                <Input
                  value={formData.telefone_celular}
                  onChange={(e) => setFormData({...formData, telefone_celular: e.target.value})}
                  placeholder="(00) 90000-0000"
                />
              </div>

              <div>
                <Label>Telefone Comercial</Label>
                <Input
                  value={formData.telefone_comercial}
                  onChange={(e) => setFormData({...formData, telefone_comercial: e.target.value})}
                  placeholder="(00) 0000-0000"
                />
              </div>

            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Rua, Avenida, etc"
                  required
                />
              </div>

              <div>
                <Label>Número</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  placeholder="123"
                />
              </div>

              <div>
                <Label>Complemento</Label>
                <Input
                  value={formData.complemento}
                  onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                  placeholder="Apto, Sala, etc"
                />
              </div>

              <div>
                <Label>Bairro</Label>
                <Input
                  value={formData.bairro}
                  onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                  placeholder="Nome do Bairro"
                />
              </div>

              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  placeholder="Nome da Cidade"
                />
              </div>

              <div>
                <Label>Estado (UF)</Label>
                <Input
                  value={formData.uf}
                  onChange={(e) => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div>
                <Label>CEP</Label>
                <Input
                  ref={withMask('99999-999')}
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  placeholder="00000-000"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Referência</Label>
                <Input
                  value={formData.referencia}
                  onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                  placeholder="Ponto de referência"
                />
              </div>

            </div>
          </div>

          {/* Dados Pessoais (Opcional) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                />
              </div>

              <div>
                <Label>Sexo</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => setFormData({...formData, sexo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado Civil</Label>
                <Select
                  value={formData.estado_civil}
                  onValueChange={(value) => setFormData({...formData, estado_civil: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* Classificação */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({...formData, prioridade: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NovaLead">Nova Lead</SelectItem>
                    <SelectItem value="Ruim">Ruim</SelectItem>
                    <SelectItem value="Fria">Fria</SelectItem>
                    <SelectItem value="Morna">Morna</SelectItem>
                    <SelectItem value="Quente">Quente</SelectItem>
                    <SelectItem value="MuitoQuente">Muito Quente</SelectItem>
                    <SelectItem value="Queimando">Queimando</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Origem</Label>
                <Input
                  value={formData.origem}
                  onChange={(e) => setFormData({...formData, origem: e.target.value})}
                  placeholder="Panfleto, WhatsApp, Instagram, etc"
                />
              </div>

            </div>
          </div>

          {/* Observações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.obs}
                onChange={(e) => setFormData({...formData, obs: e.target.value})}
                placeholder="Informações adicionais sobre o lead"
                rows={4}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
