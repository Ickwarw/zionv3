
import React, { useState, useEffect } from 'react';
import { Building2, Save, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FornecedorFormData, Contact } from './types/cadastro-fornecedor.types';
import { productsService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { Country, State, City } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useForm } from 'react-hook-form';
import { useHookFormMask, withMask } from 'use-mask-input';

interface VisualizarFornecedorProps {
  fornecedor: FornecedorFormData;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;

}

const VisualizarFornecedor = ({ fornecedor, onClose, onElementClick, isJuliaActive, editMode }: VisualizarFornecedorProps) => {
  const [country, setCountry] = useState("BR"); // Brasil default
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];
  const { register, handleSubmit } = useForm();
  const registerWithMask = useHookFormMask(register);
  
  const [localFornecedor, setLocalFornecedor] = useState(fornecedor);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({
    id: localFornecedor.id,
    name: localFornecedor.name,
    address: localFornecedor.address,
    phone: localFornecedor.phone,
    email: localFornecedor.email,
    notes: localFornecedor.notes,
    city: localFornecedor.city,
    state: localFornecedor.state,
    zip_code: localFornecedor.zip_code,
    country: localFornecedor.country,
    website: localFornecedor.website,
    contact_person: localFornecedor.contact_person,
    contacts: localFornecedor.contacts
  });

  const [contatos, setContatos] = useState<Contact[]>([
    { 
      id: 1, 
      name: '', 
      position: '', 
      phone: '', 
      email: '',
      new: false
    }
  ]);
  const [contatosDeletados, setContatosDeletados] = useState<Contact[]>([]);


  const adicionarContato = () => {
    const novoContato: Contact = {
      id: Date.now(),
      name: '', 
      position: '', 
      phone: '', 
      email: '',
      new: true
    };
    setContatos([...contatos, novoContato]);
  };

  const removerContato = (id: number) => {
    if (contatos.length > 1) {
      contatos.map((contato) => {
        if (contato.id == id) {
          setContatosDeletados([...contatosDeletados, contato]);
        }
      });
      setContatos(contatos.filter(contato => contato.id !== id));
    }
  };

  const atualizarContato = (id: number, campo: string, valor: string) => {
    setContatos(contatos.map(contato => 
      contato.id === id ? { ...contato, [campo]: valor } : contato
    ));
  };

  const saveContacts = async () => {
    for (let index = 0; index < contatos.length; index++) {
      const contato = contatos[index];
      if (contato.new != null && contato.new == true) {
        if (contato.new != null && contato.new == true) {
          const resp = await productsService.addSupplierContact(fornecedor.id, contato);
          if (resp.status == 200) {
            contato.id = resp.data.contact.id;
          } else if (resp.status == 400) {
            if ('message' in resp.data) {
              showWarningAlert("Não foi possível atualizar o Fornecedor", resp.data.message,null);
            } else {
              showWarningAlert("Não foi possível atualizar o Fornecedor", resp.data,null);
            }
          }
        }
      }
    }
  }

  const handleSave = async () => {
    try {
      let supplier: FornecedorFormData = {
        ...formData,
      };
      if (contatos?.length) {
        supplier.contacts = contatos.map((contato) => ({
          id: contato.id,
          name: contato.name,
          email: contato.email,
          phone: contato.phone,
          position: contato.position,
          new: null
        }));
      }
      const response = await productsService.updateSupplier(supplier.id, supplier);
      if (response.status == 200) {
        setFormData({
          id: response.data.supplier.id,
          name: response.data.supplier.name,
          address: response.data.supplier.address,
          phone: response.data.supplier.phone,
          email: response.data.supplier.email,
          notes: response.data.supplier.notes,
          city: response.data.supplier.city,
          state: response.data.supplier.state,
          zip_code: response.data.supplier.zip_code,
          country: response.data.supplier.country,
          website: response.data.supplier.website,
          contact_person: response.data.supplier.contact_person,
          contacts: response.data.supplier.contacts
        });
        setLocalFornecedor(response.data.supplier);
        await saveContacts();
        localFornecedor.contacts = contatos;
        carregaContatos();
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível atualizar o Fornecedor", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível atualizar o Fornecedor", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Supplier:', error);
        showErrorAlert('Erro ao atualizar o Fornecedores', formatAxiosError(error));
        
    }
  }

  useEffect(() => {
    carregaContatos();
  }, []);

  const carregaContatos = () => {
    if (localFornecedor.contacts) {
      setContatos(localFornecedor.contacts);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada do fornecedor!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Building2 size={24} className="mr-2" />
              {isEditing ? 'Editar Fornecedor' : 'Visualizar Fornecedor'}
            </DialogTitle>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

       <div className="space-y-6">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados da Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded font-mono">{localFornecedor.name}</p>
                )}
              </div>

              <div>
                <Label>Contato Principal</Label>
                {isEditing ? (
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.contact_person}</p>
                )}
              </div>

              <div>
                <Label>Telefone</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    // type="tel"
                    // {...registerWithMask("phone", ['(99) 9999-9999', '(99) 99999-9999'], {
                    //   required: true
                    // })}
                    // onBlur={(e) => {
                    //   setFormData({...formData, phone: e.target.value})
                    // }}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.phone}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.email}</p>
                )}
              </div>

              <div>
                <Label>País</Label>
                {isEditing ? (
                  <Select 
                      value={formData.country ?? ""}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          country: value
                        });
                        setCountry(value);
                        setState("");
                        setCity("");
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((pais) => (
                        <SelectItem key={pais.isoCode} value={pais.isoCode}>
                          {pais.name}
                        </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.country}</p>
                )}
              </div>

              <div>
                <Label>Estado</Label>
                {isEditing ? (
                  states.length > 0 ? (
                    <Select 
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          state: value
                        });
                        setState(value);
                        setCity("");
                      }}
                      value={formData.state ?? ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  ) : (
                        <Input
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                  )
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.state}</p>
                )}
              </div>

              <div>
                <Label>Cidade</Label>
                {isEditing ? (
                  cities.length > 0 ? (
                    <Select 
                        value={formData.city ?? ""}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            city: value
                          });
                          setCity(value);
                        }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={`${c.countryCode}-${c.stateCode}-${c.name}`} value={c.name}>
                            {c.name}
                          </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    ) : (<Input
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    )
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.city}</p>
                )}
              </div>

              <div>
                <Label>CEP</Label>
                {isEditing ? (
                  <Input
                    value={formData.zip_code}
                    ref={withMask('99999-999')}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.zip_code}</p>
                )}
              </div>

              <div>
                <Label>Endereço</Label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.address}</p>
                )}
              </div>

              <div>
                <Label>Website</Label>
                {isEditing ? (
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localFornecedor.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contatos por Setor */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Contatos por Setor</h3>
              {isEditing && (
                <Button 
                  type="button" 
                  onClick={adicionarContato}
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Contato
                </Button>
              )}
            </div>

            {contatos.map((contato, index) => (
              <div key={contato.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Contato {index + 1}</h4>
                  {isEditing && contatos.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removerContato(contato.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm">Nome do Contato</Label>
                    {isEditing ? (
                      <Input
                        value={contato.name}
                        onChange={(e) => atualizarContato(contato.id, 'name', e.target.value)}
                        placeholder="Nome completo"
                      />
                    ) : (
                      <p className="p-2 bg-white rounded text-sm">{contato.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm">Cargo</Label>
                    {isEditing ? (
                      <Input
                        value={contato.position}
                        onChange={(e) => atualizarContato(contato.id, 'position', e.target.value)}
                        placeholder="Ex: Vendas, Suporte"
                      />
                    ) : (
                      <p className="p-2 bg-white rounded text-sm">{contato.position}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm">Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={contato.phone}
                        onChange={(e) => atualizarContato(contato.id, 'phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    ) : (
                      <p className="p-2 bg-white rounded text-sm">{contato.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm">Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={contato.email}
                        onChange={(e) => atualizarContato(contato.id, 'email', e.target.value)}
                        placeholder="contato@empresa.com"
                      />
                    ) : (
                      <p className="p-2 bg-white rounded text-sm">{contato.email}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estatísticas */}
          {/* <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Estatísticas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Notas Fiscais:</span>
                <span className="ml-2 font-medium">{fornecedor.notasFiscais}</span>
              </div>
              <div>
                <span className="text-blue-600">Produtos Ativos:</span>
                <span className="ml-2 font-medium">-</span>
              </div>
              <div>
                <span className="text-blue-600">Último Pedido:</span>
                <span className="ml-2 font-medium">-</span>
              </div>
            </div>
          </div> */}

          {/* Observações - Apenas no modo edição */}
          {isEditing && (
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações adicionais sobre o fornecedor..."
                rows={3}
              />
            </div>
          )}

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

export default VisualizarFornecedor;
