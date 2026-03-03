import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, ArrowLeft, Shield, Check } from 'lucide-react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { userService } from '@/services/api';
import { showWarningAlert } from '../../ui/alert-dialog-warning';
import { showErrorAlert } from '../../ui/alert-dialog-error';
import { formatAxiosError } from '../../ui/formatResponseError';
import { Checkbox } from '@/components/ui/checkbox';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [ groupList, setGroupList ] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    is_active: true,
    is_admin: false,
    groups: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getGroups = async () => {
    try {
      const response = await userService.getGroupsSimple();
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

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || 
        !formData.username || !formData.password || !formData.confirm_password) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    if (formData.confirm_password !== formData.password) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userService.createUser(formData);
      if (response.status == 201) {
        setFormData(response.data);
        onClose();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível criar Usuário", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível criar Usuário", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create User:', error);
        showErrorAlert('Erro ao criar Usuário', formatAxiosError(error));
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

  if (!isOpen) return null;

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onSwitchToLogin}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cadastrar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={saveUser} className="space-y-4">
          <div>
            <Label>
              Primeiro Nome
            </Label>
            <Input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Digite seu primeiro nome"
              required
            />
          </div>

           <div>
            <Label>
              Sobrenome
            </Label>
            <Input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Digite seu sobrenome"
              required
            />
          </div>

          {/* <div>
            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Digite seu nome completo"
              required
            />
          </div> */}
         

          <div>
            <Label>
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Label>
              Username
            </Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="username"
              required
            />
          </div>

          <div>
            <Label>
              Senha
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <Label>
              Confirmar Senha
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder="Confirme sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
