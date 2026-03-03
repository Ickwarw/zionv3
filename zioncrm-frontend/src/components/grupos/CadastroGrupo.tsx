
import React, { useEffect, useState } from 'react';
import { X, Shield, Users, Check } from 'lucide-react';
import { userService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { formatAxiosError } from '../ui/formatResponseError';
import { showErrorAlert } from '../ui/alert-dialog-error';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface CadastroGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grupo: any) => void;
}

const CadastroGrupo = ({ isOpen, onClose, onSave }: CadastroGrupoProps) => {
  const [ permList, setPermList ] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSave({
  //     ...formData,
  //     id: Date.now()
  //   });
  //   setFormData({ name: '', description: '', permissions: [] });
  //   onClose();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userService.createGroup(formData);
      if (response.status == 201) {
        setFormData(response.data);
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cadastrar Novo Grupo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Administradores, Vendedores..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descreva as responsabilidades do grupo"
              />
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
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Criar Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroGrupo;
