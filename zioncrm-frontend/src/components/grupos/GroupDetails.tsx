
import React, { useEffect, useState } from 'react';
import { X, Shield, Users, Check } from 'lucide-react';
import { userService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { formatAxiosError } from '../ui/formatResponseError';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface GroupDetailsProps {
  group: any;
  editMode: boolean;
  onClose: () => void;
  
}

const GroupDetails = ({ group, editMode, onClose }: GroupDetailsProps) => {
  const [ permList, setPermList ] = useState([]);
  const [ localGroup, setLocalGroup ] = useState(group);
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({
    id: group.id,
    name: group.name,
    description: group.description,
    permissions: group.permissions.map(perm => perm.id)
    // permissions: [] as string[]
  });

  
  const getPermissions = async () => {
    try {
      const response = await userService.getPermissions();
      if (response.status == 200) {
          setPermList(response.data.permissions);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar as Permissões", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar as Permissões", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Permissions:', error);
        showErrorAlert('Erro ao carregar as Permissões', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getPermissions();
  }, []);

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const updateGrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userService.updateGroup(formData.id, formData);
      if (response.status == 200) {
        setFormData({
          id: response.data.group.id,
          name: response.data.group.name,
          description: response.data.group.description,
          permissions: response.data.group.permissions.map(perm => perm.id)
          });
        setIsEditing(false);
        setLocalGroup(response.data.group);
        // onClose();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível criar Grupo", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível criar Grupo", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Group:', error);
        showErrorAlert('Erro ao criar Grupo', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              <Users size={24} className="mr-2" />
              Visualizar Grupo
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>
              Nome do Grupo
            </Label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Administradores, Vendedores..."
                required
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded">{localGroup.name}</p>
            )}
          </div>

          <div>
            <Label>
              Descrição
            </Label>
            {isEditing ? (
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descreva as responsabilidades do grupo"
              />
            ) : (
              <p className="p-2 bg-gray-50 rounded">{localGroup.description}</p>
            )}
            
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="text-purple-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Permissões do Grupo</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permList.map(permission => (
                  <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="sr-only"
                        disabled={!isEditing}
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.permissions.includes(permission.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300 hover:border-purple-400'
                      }`}>
                        {formData.permissions.includes(permission.id) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{permission.name}</p>
                      <p className="text-xs text-gray-600">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button
                  onClick={updateGrop}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
          
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetails;
