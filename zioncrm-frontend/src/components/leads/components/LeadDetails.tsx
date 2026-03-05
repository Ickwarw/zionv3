
import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Save } from 'lucide-react';
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
import { leadsDashAgentService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { parseDate } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import Tag from '@/components/ui/tag';
import { Lead, LeadDepartment } from '../types/leads.types';
import { withMask } from 'use-mask-input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import FormateCurrency from '@/components/ui/FormateCurrency';


interface LeadDetailsProps {
  lead: Lead;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const LeadDetails = ({ lead, onClose, onElementClick, isJuliaActive, editMode }: LeadDetailsProps) => {
  const [localLead, setLocalLead] = useState(lead);
  const [isEditing, setIsEditing] = useState(editMode);
  // const [sourceList, setSourceList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [formData, setFormData] = useState({
    id: localLead.id,
    // Campos novos (backend)
    razao: localLead.razao || localLead.name,
    fantasia: localLead.fantasia || localLead.company,
    cnpj_cpf: localLead.cnpj_cpf,
    ie_identidade: localLead.ie_identidade,
    tipo_pessoa: localLead.tipo_pessoa,
    contato: localLead.contato,
    email: localLead.email,
    fone: localLead.fone || localLead.phone,
    telefone_celular: localLead.telefone_celular,
    telefone_comercial: localLead.telefone_comercial,
    endereco: localLead.endereco || localLead.address,
    numero: localLead.numero,
    complemento: localLead.complemento,
    bairro: localLead.bairro,
    cidade: localLead.cidade || localLead.city,
    uf: localLead.uf || localLead.state,
    cep: localLead.cep || localLead.zip_code,
    referencia: localLead.referencia,
    data_nascimento: localLead.data_nascimento,
    estado_civil: localLead.estado_civil,
    sexo: localLead.sexo,
    prioridade: localLead.prioridade,
    origem: localLead.origem,
    obs: localLead.obs || localLead.notes,
    ativo: localLead.ativo,
    // Campos antigos (compatibilidade)
    name: localLead.razao || localLead.name,
    phone: localLead.fone || localLead.phone,
    company: localLead.fantasia || localLead.company,
    position: localLead.position,
    address: localLead.endereco || localLead.address,
    city: localLead.cidade || localLead.city,
    state: localLead.uf || localLead.state,
    zip_code: localLead.cep || localLead.zip_code,
    country: localLead.country,
    status_id: localLead.status_id,
    source_id: localLead.source_id,
    assigned_to: localLead.assigned_to,
    department_id: localLead.department_id,
    notes: localLead.obs || localLead.notes,
    value: localLead.value,
    create_at: parseDate(localLead.created_at),
  });

  const validateFields = () => {
     let message = '';
     if (!formData.razao || (formData.razao && formData.razao.trim() == '')) {
       message = "Razão Social / Nome é obrigatório\n";
     }
     if (!formData.cnpj_cpf || (formData.cnpj_cpf && formData.cnpj_cpf.trim() == '')) {
       message += "CPF/CNPJ é obrigatório\n";
     }
     if (!formData.ie_identidade || (formData.ie_identidade && formData.ie_identidade.trim() == '')) {
       message += "RG/IE é obrigatório\n";
     }
     if (!formData.endereco || (formData.endereco && formData.endereco.trim() == '')) {
       message += "Endereço é obrigatório\n";
     }
     if (!formData.contato || (formData.contato && formData.contato.trim() == '')) {
       message += "Nome do Contato é obrigatório";
     }
     if (message.length > 0) {
       showWarningAlert("Campos Obrigatórios",message,null);
       return false;
     }
     return true;
   }

  const fetchStatuses = async () => {
    if (formData == null || formData.department_id == null) return;
    try {
      const response = await leadsDashAgentService.getLeadStats();
      if (response.status == 200 || response.status == 201) {
        setStatusList(response.data.statuses);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível buscar os Status", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível buscar os Status", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Status:', error);
        showErrorAlert('Erro ao buscar os Status', formatAxiosError(error));
    }
  };

  // const fetchSources = async () => {
  //   try {
  //     const response = await leadsDashAgentService.getLeadSources();
  //     if (response.status == 200 || response.status == 201) {
  //       setSourceList(response.data.sources);
  //     } else if (response.status == 400) {
  //       if ('message' in response.data) {
  //         showWarningAlert("Não foi possível buscar as Origens", response.data.message,null);
  //       } else {
  //         showWarningAlert("Não foi possível buscaras Origens", response.data,null);
  //       }
  //     }
  //   } catch (error) {
  //       console.error('Failed to get sources:', error);
  //       showErrorAlert('Erro ao buscar as Origens', formatAxiosError(error));
  //   }
  //   };
  
  // useEffect(() => {
  //   fetchSources();
  // }, []);

  useEffect(() => {
      fetchStatuses();
    }, [formData.department_id]);
  

  const handleSave = async () => {
    if (validateFields()) {
      try {
        let updatedLead = {
          id: formData.id,
          // Campos novos (backend principal)
          razao: formData.razao,
          fantasia: formData.fantasia,
          cnpj_cpf: formData.cnpj_cpf,
          ie_identidade: formData.ie_identidade,
          tipo_pessoa: formData.tipo_pessoa,
          contato: formData.contato,
          email: formData.email,
          fone: formData.fone,
          telefone_celular: formData.telefone_celular,
          telefone_comercial: formData.telefone_comercial,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf,
          cep: formData.cep,
          referencia: formData.referencia,
          data_nascimento: formData.data_nascimento,
          estado_civil: formData.estado_civil,
          sexo: formData.sexo,
          prioridade: formData.prioridade,
          origem: formData.origem,
          obs: formData.obs,
          ativo: formData.ativo,
          // Campos antigos (compatibilidade temporária)
          name: formData.razao || formData.name,
          phone: formData.fone || formData.phone,
          company: formData.fantasia || formData.company,
          position: formData.position,
          address: formData.endereco || formData.address,
          city: formData.cidade || formData.city,
          state: formData.uf || formData.state,
          zip_code: formData.cep || formData.zip_code,
          country: formData.country,
          status_id: formData.status_id != null ? Number(formData.status_id) : null,
          source_id: formData.source_id != null ? Number(formData.source_id) : null,
          assigned_to: formData.assigned_to != null ? Number(formData.assigned_to) : null,
          department_id: formData.department_id != null ? Number(formData.department_id) : null,
          notes: formData.obs || formData.notes,
          value: formData.value,
        }
        const response = await leadsDashAgentService.updateLead(updatedLead.id, updatedLead);
        if (response.status == 200 || response.status == 201) {
          setIsEditing(false);
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Atualizar a Lead", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível Atualizar a Lead", response.data,null);
          }
        }
      } catch (error) {
          console.error('Failed to update Lead:', error);
          showErrorAlert('Erro ao Atualizar a Lead', formatAxiosError(error));
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Tarefa!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <CheckSquare size={24} className="mr-2" />
              {isEditing ? 'Editar Lead' : 'Visualizar Lead'}
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
            <h3 className="text-lg font-semibold text-gray-900">Informações da Lead</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Razão Social / Nome!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Razão Social / Nome *
                </Label>
                {isEditing ? (
                   <Input
                    value={formData.razao}
                    onChange={(e) => setFormData({...formData, razao: e.target.value})}
                    placeholder="Razão Social ou Nome da Lead"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localLead.razao || localLead.name}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Email!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Email
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.email}
                    type="email"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="E-mail da Lead"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.email}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Telefone!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Telefone *</Label>
                {isEditing ? (
                  <Input
                    value={formData.fone}
                    onChange={(e) => setFormData({...formData, fone: e.target.value})}
                    placeholder="Telefone da Lead"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.fone || localLead.telefone_celular || localLead.telefone_comercial || localLead.phone}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Nome Fantasia!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Nome Fantasia</Label>
                {isEditing ? (
                   <Input
                      value={formData.fantasia}
                      onChange={(e) => setFormData({...formData, fantasia: e.target.value})}
                      placeholder="Nome Fantasia da Lead"
                    />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.fantasia || localLead.company}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Cargo!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Cargo</Label>
                {isEditing ? (
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Cargo do contato da Lead"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.position}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Endereço")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Endereço</Label>
                {isEditing ? (
                  <Input
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Endereço da Lead"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.endereco || localLead.address}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Cidade")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Cidade</Label>
                {isEditing ? (
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    placeholder="Cidade da Empresa da Lead"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.cidade || localLead.city}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Estado")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Estado</Label>
                {isEditing ? (
                  <Input
                    value={formData.uf}
                    onChange={(e) => setFormData({...formData, uf: e.target.value})}
                    placeholder="Estado da Empresa da Lead"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.uf || localLead.state}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "CEP")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >CEP</Label>
                {isEditing ? (
                  <Input
                    ref={withMask('99999-999')}
                    value={formData.cep}
                    onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.cep || localLead.zip_code}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "País")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >País</Label>
                {isEditing ? (
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="País da Empresa da Lead"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localLead.country}</p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Setor")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Setor</Label>
                {isEditing ? (
                  <Select
                    value={formData.department_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      department_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='marketing'>Marketing</SelectItem>
                      <SelectItem value='vendas'>Vendas</SelectItem>
                      <SelectItem value='pos_venda'>Pós Venda</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    <span>{localLead.departamento}</span>
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Status")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.status_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      status_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          <Tag
                            backgroundColor={status.color}
                            name={status.name}
                          />
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localLead.status && (
                      <Tag
                        backgroundColor={localLead.status.color}
                        name={localLead.status.name}
                      />
                    )}
                  </p>
                )}
              </div>

              {/* <div>
                <Label
                  onClick={(e) => onElementClick(e, "Origem")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Origem</Label>
                {isEditing ? (
                  <Select
                    value={formData.source_id?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      source_id: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceList.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          {source.name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localLead.source && (
                      <span>{localLead.source.name}</span>
                    )}
                  </p>
                )}
              </div> */}

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Responsável")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Responsável</Label>
                {isEditing ? (
                  <Select
                    value={formData.assigned_to?.toString() || null}
                    onValueChange={(value) => setFormData(formData => ({ 
                      ...formData, 
                      assigned_to: Number(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {userList.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.first_name}{' '}{user.last_name}
                        </SelectItem>
                      ))
                    }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localLead.assigned_user && (
                      <span>{localLead.assigned_user.first_name}{' '}{localLead.assigned_user.last_name}</span>
                    )}
                    {localLead.assigned_user == null && localLead.assigned_to != null && (
                      <span>{localLead.assigned_to}</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Observações")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Observações</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.obs}
                    onChange={(e) => setFormData({...formData, obs: e.target.value})}
                    placeholder="Observações"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">
                    {localLead.obs || localLead.notes || '-'}
                  </p>
                )}
              </div>

              <div>
                <Label
                  onClick={(e) => onElementClick(e, "Valor")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >Valor</Label>
                {isEditing ? (
                  <CurrencyInput
                    value={formData.value}
                    onChange={(value) => 
                      setFormData({
                        ...formData,
                        value: Number(value.replace('R$', '').replace(".","").replace(",",".")) 
                      })
                    }
                    placeholder="R$ 2299.00"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{FormateCurrency(localLead.value)}</p>
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

export default LeadDetails;
