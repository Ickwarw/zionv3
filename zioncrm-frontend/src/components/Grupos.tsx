
import React, { useEffect, useState } from 'react';
import { Users, UserPlus, User, Edit, Trash2, Compass, Plus, UserRoundX, UserCog } from 'lucide-react';
import RegisterModal from './usuario/components/RegisterModal';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import CadastroGrupo from './grupos/CadastroGrupo';
import { userService } from '@/services/api';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import { Button } from './ui/button';
import UserDetails from './usuario/components/UserDetails';
import { showQuestionAlert } from './ui/alert-dialog-question';
import GroupDetails from './grupos/GroupDetails';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface GroupData {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

const Grupos = () => {
  const [ userList, setUserList ] = useState([]);
  const [ userSelected, setUserSelected] = useState(null);
  const [ editMode, setEditMode] = useState(false);
  const [ groupList, setGroupList ] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCadastroGrupoOpen, setIsCadastroGrupoOpen] = useState(false);

  const [ groupSelected, setGroupSelected ]  = useState(null);
  const [ editGroupMode, setEditGroupMode] = useState(false);
  
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);


  const getUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response.status == 200) {
          setUserList(response.data.users);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Usuários", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Usuários", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Users:', error);
        showErrorAlert('Erro ao carregar os Usuários', formatAxiosError(error));
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

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaActive) {
      setShowJuliaBubble(false);
    }
  };

  const handleElementClick = (event: React.MouseEvent, message: string) => {
    if (isJuliaActive) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setJuliaPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setJuliaMessage(message);
      setShowJuliaBubble(true);
    }
  };

  const handleCloseBubble = () => {
    setShowJuliaBubble(false);
  };

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const getUser = async (userId) => {
    try {
      const response = await userService.getUser(userId);
      if (response.status == 200) {
          return response.data;
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Usuários", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Usuários", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Users:', error);
        showErrorAlert('Erro ao carregar os Usuários', formatAxiosError(error));
    }
    return null;
  }

  const closeUserDeleteYes = async (userId) => {
    console.log("closeProdutoDeleteYes");
    try {
      let user = getUser(userId);
      user['is_active'] = false;
      const response = await userService.updateUser(userId, user);
      if (response.status == 200) {
        getUsers();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível Editar o Usuário", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível Editar o Usuário", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao Editar o Usuário', formatAxiosError(error));
    }
  }
  
  const closeUserDeleteNo = () => {
    console.log("closeUserDeleteNo");
  }

  const deleteUser = (user) => {
    showQuestionAlert('Inativar o Usuário?',
      `Deseja realmente Inativar o usuário ${user.first_name}?`,
      user.id,
      closeUserDeleteNo,
      closeUserDeleteYes);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={handleCloseBubble}
        position={juliaPosition}
      />

      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a seção de Grupos e Permissões onde você pode gerenciar usuários, criar grupos e definir níveis de acesso!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Grupos e Permissões
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os grupos, permissões e usuários do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <Users size={28} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          onClick={(e) => handleElementClick(e, "Aqui você pode gerenciar os grupos de usuários, definindo diferentes níveis de acesso e permissões para cada grupo!")}
          className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Grupos</h2>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isJuliaActive) {
                  handleElementClick(e, "Clique aqui para criar um novo grupo com permissões personalizadas!");
                } else {
                  setIsCadastroGrupoOpen(true);
                }
              }}
              className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Plus size={16} />
              <span>Novo Grupo</span>
            </button>
          </div>

          <div className="space-y-4">
            {groupList?.length
              ? groupList.map((group) => (
                <div 
                  key={group.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isJuliaActive) {
                      handleElementClick(e, `Grupo ${group.name}: ${group.description}. Permissões: ${group.permissions.join(', ')}`);
                    } else {
                      setGroupSelected(group);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl bg-gray-50 ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          handleElementClick(e, "Edite as permissões e configurações deste grupo!");
                        } else {
                          setEditGroupMode(true);
                          setGroupSelected(group);
                        }
                      }}
                      className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))
              :
                <div 
                  className={`flex items-center justify-between p-4 rounded-xl bg-gray-50 ${isJuliaActive ? 'cursor-help' : ''}`}
                >
                  <p>Não há registros</p>
                </div>
            }
          </div>
        </div>

        <div 
          onClick={(e) => handleElementClick(e, "Aqui você pode gerenciar todos os usuários do sistema, adicionar novos usuários e definir suas funções!")}
          className={`bg-white rounded-2xl p-6 shadow-lg ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Usuários</h2>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleElementClick(e, "Clique aqui para adicionar um novo usuário ao sistema!");
                if (!isJuliaActive) setIsRegisterModalOpen(true);
              }}
              className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              Novo Usuário
            </Button>
          </div>

          <div className="space-y-4">
            {userList.map(user => (
              <div 
                key={user.id} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isJuliaActive) {
                    handleElementClick(e, `Usuário: ${user.first_name} ${user.last_name} (${user.email}) com Admin ${user.is_admin}`);
                  } else {
                    setUserSelected(user);
                  }
                }}
                className={`flex items-center justify-between p-4 rounded-xl outline-red-50 bg-gray-50 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <div>
                  <div className="flex space-x-2">
                    <p className="text-sm text-gray-500">
                      { user.is_admin && 
                        <div title="Usuário ADMIN">
                          <UserCog size={16} className="text-blue-600"/>
                        </div>
                      }
                      { !user.is_active && 
                        <div title="Usuário Inativo">
                          <UserRoundX size={16} className="text-red-600"/>
                        </div>
                      }
                    </p>
                    <h3 className="font-medium text-gray-800">{user.first_name} {user.last_name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    title="Editar usuário"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isJuliaActive) {
                        handleElementClick(e, "Edite as informações e permissões deste usuário!");
                      } else {
                        setEditMode(true);
                        setUserSelected(user);
                      }
                    }}
                    className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  { user.is_active && 
                    <button 
                      title="Inativar usuário"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          handleElementClick(e, "Remova este usuário do sistema!");
                        } else {
                          deleteUser(user);
                        }
                      }}
                      className={`p-2 rounded-lg hover:bg-red-100 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  }
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      { isRegisterModalOpen && 
        <RegisterModal 
          isOpen={isRegisterModalOpen} 
          onClose={() => {
              setIsRegisterModalOpen(false); 
              getUsers();
            }
          } 
          onSwitchToLogin={() => setIsRegisterModalOpen(false)}
        />
      } 

      { userSelected && 
        <UserDetails 
          userData={userSelected}
          editMode={editMode}
          onClose={() => {
              setEditMode(false);
              setUserSelected(null);
              getUsers();
            }
          } 
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
        />
      } 

      { isCadastroGrupoOpen && 
        <CadastroGrupo
          isOpen={isCadastroGrupoOpen}
          onClose={() => setIsCadastroGrupoOpen(false)}
          onSave={() => {
                getGroups();
              }
            } 
        />
      }

      { groupSelected && 
        <GroupDetails 
          group={groupSelected}
          editMode={editGroupMode}
          onClose={() => {
              setEditGroupMode(false);
              setGroupSelected(null);
              getGroups();
            }
          } 
        />
      } 
    </div>
  );
};

export default Grupos;
