
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginModal from './LoginModal';
import RegisterModal from './usuario/components/RegisterModal';
import ThemeSelector from './ThemeSelector';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Calendar, 
  DollarSign, 
  Package, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Bot, 
  Shield, 
  FileSearch,
  Menu,
  X,
  Info,
  Phone,
  LogOut,
  Settings,
  Mail,
  Wallet,
  SquareMenu,
  CircleDollarSign,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export interface User {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const { isAuthenticated, logout } = useAuth();
  const { currentTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // const [user, setUser] = useState<User | null>(() => {
  //     const storedUser = localStorage.getItem('user');
  //     return storedUser ? JSON.parse(storedUser) as User : null;
  //   });
  const [openMenus, setOpenMenus] = useState({});

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, requiresAuth: true },
    { id: 'sobre', label: 'Sobre Nós', icon: Info, requiresAuth: false },
    { id: 'contato', label: 'Contato', icon: Phone, requiresAuth: false },
    { id: 'produtos', label: 'Produtos', icon: Package, requiresAuth: true },
    { id: 'agenda', label: 'Agenda', icon: Calendar, requiresAuth: true },
    { id: 'financeiro', label: 'Finanças', icon: Receipt, requiresAuth: true,
      children: [
      { id: 'financeiro', label: 'Financeiro', icon: DollarSign, requiresAuth: true },
      { id: 'contas', label: 'Contas', icon: Wallet, requiresAuth: true },
      { id: 'categoria-financeira', label: 'Cat. Financeira', icon: SquareMenu, requiresAuth: true },
      { id: 'orcamentos', label: 'Orçamentos', icon: CircleDollarSign, requiresAuth: true },
      ]
    },
    { id: 'leads', label: 'Leads', icon: Users, requiresAuth: true },
    { id: 'chat', label: 'Chat & VoIP', icon: MessageCircle, requiresAuth: true },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare, requiresAuth: true },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, requiresAuth: true },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3, requiresAuth: true },
    { id: 'assistentes', label: 'Assistentes IA', icon: Bot, requiresAuth: true },
    { id: 'grupos', label: 'Grupos e Permissões', icon: Shield, requiresAuth: true },
    { id: 'logs', label: 'Logs', icon: FileSearch, requiresAuth: true },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, requiresAuth: true },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    setActiveSection('sobre');
  };

  const toggleMenu = (id) => {
    if (user == null) {
      loadUser
    }
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) as User : null);
  }

  useEffect(() => {
      loadUser();
    }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full ${
          isCollapsed ? 'w-16' : 'w-64'
        } flex flex-col bg-white border-r shadow-md transition-all duration-300 z-50`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className={`text-2xl font-bold text-purple-600 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            ZION CRM
          </span>
          <button onClick={toggleCollapse} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && user && (
          <div className={`px-4 py-2 border-t border-b border-gray-200 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
            <p className="text-sm text-gray-600">
              Olá, {user?.full_name}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            (!item.requiresAuth || isAuthenticated) && (
              <div key={item.id} className="space-y-1">
                {/* Botão principal */}
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.id);
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50' 
                  }`}
                  disabled={!isAuthenticated && item.requiresAuth}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Indicador de submenu */}
                  {item.children && !isCollapsed && (
                    <span className="text-sm">
                      {openMenus[item.id] ? "▲" : "▼"}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {item.children && openMenus[item.id] && (
                  <div className="ml-8 space-y-1">
                    {item.children.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSection(sub.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          activeSection === sub.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <sub.icon size={16} />
                        <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                          {sub.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </nav>
        {/* <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            (!item.requiresAuth || isAuthenticated) && (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  activeSection === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                }`}
                disabled={!isAuthenticated && item.requiresAuth}
              >
                <item.icon size={18} />
                <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.label}</span>
              </button>
            )
          ))}
        </nav> */}

        {/* Theme Selector */}
        <div className={`px-4 py-3 border-t border-gray-200 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
          <ThemeSelector />
        </div>

        {/* Auth Buttons / Logout */}
        <div className={`p-4 space-y-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Registrar
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      { showRegisterModal &&
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      }
    </>
  );
};

export default Sidebar;
