
import React, { useEffect, useState } from 'react';
import { Check, Save, Shield, User, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserData } from '../types/user-data.types';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface UserDetailsProps {
  userData: UserData;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  editMode: boolean;
}

const UserDetails = ({ userData, editMode, onClose, onElementClick, isJuliaActive }: UserDetailsProps) => {
  const [ groupList, setGroupList ] = useState([]);
  const [localUser, setLocalUser] = useState(userData);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({
    id: localUser.id,
    first_name: localUser.first_name,
    last_name: localUser.last_name,
    username: localUser.username,
    email: localUser.email,
    password: localUser.password,
    is_active: localUser.is_active,
    is_admin: localUser.is_admin,
    groups: localUser.groups.map(group => group.id)
    // groups: [] as string[]
  });
 
  const handleSave = async () => {
    try {
      let user = {
        id: formData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username:formData.username,
        email: formData.email,
        is_active: formData.is_active,
        is_admin: formData.is_admin,
        groups: formData.groups,
      }
      const response = await userService.updateUser(formData.id, user);
      if (response.status == 200) {
        setFormData({
          id: response.data.user.id,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          username: response.data.user.username,
          email: response.data.user.email,
          is_active: response.data.user.is_active,
          is_admin: response.data.user.is_admin,
          password: response.data.user.password,
          groups: response.data.user.groups.map(group => group.id)
        });
        setLocalUser({
          ...response.data.user
        });
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Usuário", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Usuário", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to update EvUserent:', error);
        showErrorAlert('Erro ao Salvar o Usuário', formatAxiosError(error));
    }
  }

  const getGroups = async () => {
    try {
      const response = await userService.getGroups();
      if (response.status == 200) {
          setGroupList(response.data.groups);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Grupos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Grupos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Groups:', error);
        showErrorAlert('Erro ao carregar os Grupos', formatAxiosError(error));
    }
  }

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId]
    }));
  };

  useEffect(() => {
      getGroups();
    }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada da Conta!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <User size={24} className="mr-2" />
              Usuário
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
            <h3 className="text-lg font-semibold text-gray-900">Informações do Usuário</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label>Primeiro Nome</Label>
                {isEditing ? (
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Primeiro Nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localUser.first_name}</p>
                )}
              </div>

              <div>
                <Label>Sobrenome</Label>
                {isEditing ? (
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Sobrenome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localUser.last_name}</p>
                )}
              </div>

              <div>
                <Label>E-mail</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="E-mail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localUser.email}</p>
                )}
              </div>

              <div>
                <Label>Username</Label>
                {isEditing ? (
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localUser.username}</p>
                )}
              </div>
              <div>
                <Checkbox 
                  className="ml-20"
                  checked={formData.is_active}
                  disabled={!isEditing}
                  onCheckedChange={(checked) => {
                    if (typeof checked === "boolean") {
                      setFormData({...formData, is_active: checked})
                    } else {
                      setFormData({...formData, is_active: false})
                    }
                  }}
                />
                <Label>Ativo</Label>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Grupo do usuário</h3>
                </div>
      
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupList.map(group => (
                        <label key={group.id} className="flex items-start space-x-3 cursor-pointer">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.groups.includes(group.id)}
                              onChange={() => handleGroupToggle(group.id)}
                              className="sr-only"
                              disabled={!isEditing}
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              formData.groups.includes(group.id)
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-300 hover:border-purple-400'
                            }`}>
                              {formData.groups.includes(group.id) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                            <p className="text-xs text-gray-600">{group.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

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

export default UserDetails;
