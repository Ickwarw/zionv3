import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Cria instância do axios com configuração para ambiente de produção
const api = axios.create({
  // Usa a variável de ambiente ou fallback para localhost
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout para requisições
  timeout: 30000,
});

// Adiciona interceptor de requisição para incluir token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adiciona interceptor de resposta para lidar com expiração de token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    
     // Se o erro for 401 (não autorizado) e não estiver já tentando novamente
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenta atualizar o token
        // const refreshToken = localStorage.getItem('refreshToken');
        const refreshToken = localStorage.getItem('token');
        if (!refreshToken) {
          // Sem refresh token, redireciona para login
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        // Usa URL absoluta para evitar problemas com proxy
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          }
        );
        
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        
        // Tenta novamente a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Falha ao atualizar token, limpa dados de autenticação e redireciona
        console.log("Eerrrrroooo: ", refreshError)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Exporta serviços de API organizados por módulo
// Serviços de autenticação, usuários e permissões
export const authService = {
  login: (username: string, password: string) => {
    return api.post('/auth/login', { username, password });
  },
  
  register: (userData: any) => {
    return api.post('/auth/register', userData);
  },
  
  logout: () => {
    return api.post('/auth/logout');
  },
  
  getCurrentUser: () => {
    return api.get('/auth/me');
  },
  
  changePassword: (currentPassword: string, newPassword: string) => {
    return api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
  },
  
  checkPermission: (permissionCode: string) => {
    return api.post('/auth/check-permission', { permission_code: permissionCode });
  }
};

// Serviços de tarefas
export const tasksService = {
  getTasks: (params?: any) => {
    return api.get('/tasks/', { params });
  },
  
  getTask: (id: number) => {
    return api.get(`/tasks/${id}`);
  },
  
  createTask: (taskData: any) => {
    return api.post('/tasks/', taskData);
  },
  
  updateTask: (id: number, taskData: any) => {
    return api.put(`/tasks/${id}`, taskData);
  },
  
  deleteTask: (id: number) => {
    return api.delete(`/tasks/${id}`);
  },
  
  getTaskComments: (taskId: number) => {
    return api.get(`/tasks/${taskId}/comments`);
  },
  
  addTaskComment: (taskId: number, content: string) => {
    return api.post(`/tasks/${taskId}/comments`, { content });
  },
  
  getTaskStatuses: () => {
    return api.get('/tasks/statuses');
  },
  
  getTaskPriorities: () => {
    return api.get('/tasks/priorities');
  },
  
  getTaskCategories: () => {
    return api.get('/tasks/categories');
  },
  
  createTaskCategory: (name: string, color: string) => {
    return api.post('/tasks/categories', { name, color });
  },
  
  getTaskStatistics: () => {
    return api.get('/tasks/statistics');
  }
};

// Serviços de leads
// export const leadsService = {
//   getLeads: (params?: any) => {
//     return api.get('/leads/', { params });
//   },
  
//   getLead: (id: number) => {
//     return api.get(`/leads/${id}`);
//   },
  
//   createLead: (leadData: any) => {
//     return api.post('/leads/', leadData);
//   },
  
//   updateLead: (id: number, leadData: any) => {
//     return api.put(`/leads/${id}`, leadData);
//   },
  
//   deleteLead: (id: number) => {
//     return api.delete(`/leads/${id}`);
//   },
  
//   getLeadActivities: (leadId: number) => {
//     return api.get(`/leads/${leadId}/activities`);
//   },
  
//   addLeadActivity: (leadId: number, activityType: string, description: string) => {
//     return api.post(`/leads/${leadId}/activities`, { activity_type: activityType, description });
//   },

//    getLeadDepartments: () => {
//     return api.get('/leads/departments');
//   },

//    getLeadStatuses: () => {
//     return api.get('/leads/statuses');
//   },
  
//   getLeadDepartmentStatuses: (depId: number) => {
//     return api.get(`/leads/departments/${depId}/statuses`);
//   },
  
//   getLeadSources: () => {
//     return api.get('/leads/sources');
//   },

//   addLeadSources: ( name: string, description: string) => {
//     return api.post('/leads/sources', { name, description });
//   },
  
//   getLeadStatistics: () => {
//     return api.get('/leads/statistics');
//   }
// };

// Serviços LeadsDashAgent - Sistema completo de gestão de leads
export const leadsDashAgentService = {
  // CRUD de Leads
  getLeads: (params?: any) => {
    return api.get('/leadsdashagent/leads/', { params });
  },
  
  getLead: (id: number) => {
    return api.get(`/leadsdashagent/leads/${id}`);
  },
  
  createLead: (leadData: any) => {
    return api.post('/leadsdashagent/leads/', leadData);
  },
  
  updateLead: (id: number, leadData: any) => {
    return api.put(`/leadsdashagent/leads/${id}`, leadData);
  },
  
  partialUpdateLead: (id: number, leadData: any) => {
    return api.patch(`/leadsdashagent/leads/${id}/partial`, leadData);
  },
  
  deleteLead: (id: number) => {
    return api.delete(`/leadsdashagent/leads/${id}`);
  },
  
  getLeadStats: () => {
    return api.get('/leadsdashagent/leads/stats');
  },

  // Dashboard - Assuntos disponíveis
  getAssuntos: (categoria?: string) => {
    return api.get('/leadsdashagent/dashboard/assuntos', { params: { categoria } });
  },

  getDadosAssunto: (assuntoKey: string) => {
    return api.get(`/leadsdashagent/dashboard/assuntos/${assuntoKey}`);
  },

  // Dashboard - Estatísticas gerais
  getEstatisticasGerais: () => {
    return api.get('/leadsdashagent/dashboard/estatisticas');
  },

  // Dashboard - Gráficos personalizados
  listarGraficos: (ativo: boolean = true) => {
    return api.get('/leadsdashagent/dashboard/graficos', { params: { ativo } });
  },

  obterGrafico: (graficoId: number) => {
    return api.get(`/leadsdashagent/dashboard/graficos/${graficoId}`);
  },

  criarGrafico: (dados: any) => {
    return api.post('/leadsdashagent/dashboard/graficos', dados);
  },

  atualizarGrafico: (graficoId: number, dados: any) => {
    return api.put(`/leadsdashagent/dashboard/graficos/${graficoId}`, dados);
  },

  deletarGrafico: (graficoId: number) => {
    return api.delete(`/leadsdashagent/dashboard/graficos/${graficoId}`);
  },

  getDadosGrafico: (graficoId: number) => {
    return api.get(`/leadsdashagent/dashboard/graficos/${graficoId}/dados`);
  },

  // Dashboard - Gráficos predefinidos
  listarGraficosPredefinidos: () => {
    return api.get('/leadsdashagent/dashboard/graficos-predefinidos');
  },

  getDadosGraficoPredefinido: (key: string) => {
    return api.get(`/leadsdashagent/dashboard/graficos-predefinidos/${key}/dados`);
  }
};

export const leadsDashRaizenService = {
  chat: (message: string, options?: { customer_name?: string; source?: 'text' | 'voice' }) => {
    return api.post('/leadsdashagent/raizen/chat', {
      message,
      customer_name: options?.customer_name,
      source: options?.source || 'text'
    });
  },

  health: () => {
    return api.get('/leadsdashagent/raizen/health');
  }
};

// Serviços de produtos
export const productsService = {
  getProducts: (params?: any) => {
    return api.get('/products/products', { params });
  },
  
  getProduct: (id: number) => {
    return api.get(`/products/products/${id}`);
  },
  
  createProduct: (productData: any) => {
    return api.post('/products/products', productData);
  },
  
  updateProduct: (id: number, productData: any) => {
    return api.put(`/products/products/${id}`, productData);
  },
  
  deleteProduct: (id: number) => {
    return api.delete(`/products/products/${id}`);
  },
  
  getProductQRCode: (id: number) => {
    return api.get(`/products/products/${id}/qrcode`);
  },
  
  getProductCategories: () => {
    return api.get('/products/categories');
  },
  
  createProductCategory: (name: string, description: string) => {
    return api.post('/products/categories', { name, description });
  },
  
  getSuppliers: (params?: any) => {
    return api.get('/products/suppliers', { params });
  },
  
  getSupplier: (id: number) => {
    return api.get(`/products/suppliers/${id}`);
  },
  
  createSupplier: (supplierData: any) => {
    return api.post('/products/suppliers', supplierData);
  },
  
  updateSupplier: (id: number, supplierData: any) => {
    return api.put(`/products/suppliers/${id}`, supplierData);
  },
  
  deleteSupplier: (id: number) => {
    return api.delete(`/products/suppliers/${id}`);
  },
  
  getSupplierContacts: (supplierId: number) => {
    return api.get(`/products/suppliers/${supplierId}/contacts`);
  },
  
  addSupplierContact: (supplierId: number, contactData: any) => {
    return api.post(`/products/suppliers/${supplierId}/contacts`, contactData);
  },
  
  updateInventory: (productId: number, quantity: number, reorderLevel?: number, reorderQuantity?: number, location?: string) => {
    return api.put(`/products/products/${productId}/inventory`, { 
      quantity, 
      reorder_level: reorderLevel, 
      reorder_quantity: reorderQuantity, 
      location 
    });
  },
  
  getLowStockProducts: () => {
    return api.get('/products/low-stock');
  },
  
  getProductStatistics: () => {
    return api.get('/products/statistics');
  }
};

// Serviços financeiros
export const financialService = {
  getTransactions: (params?: any) => {
    return api.get('/financial/transactions', { params });
  },
  
  getTransaction: (id: number) => {
    return api.get(`/financial/transactions/${id}`);
  },
  
  createTransaction: (transactionData: any) => {
    return api.post('/financial/transactions', transactionData);
  },
  
  updateTransaction: (id: number, transactionData: any) => {
    return api.put(`/financial/transactions/${id}`, transactionData);
  },
  
  deleteTransaction: (id: number) => {
    return api.delete(`/financial/transactions/${id}`);
  },
  
  getCategories: () => {
    return api.get('/financial/categories');
  },
  
  createCategory: (name: string, type: string, color: string) => {
    return api.post('/financial/categories', { name, type, color });
  },

  updateCategory: (id: number, categoryData: any) => {
    return api.put(`/financial/categories/${id}`, categoryData);
  },

  deleteCategory: (id: number) => {
    return api.delete(`/financial/categories/${id}`);
  },
  
  getAccounts: () => {
    return api.get('/financial/accounts');
  },
  
  createAccount: (accountData: any) => {
    return api.post('/financial/accounts', accountData);
  },

  getFinancialSummary: (period: string = 'month') => {
    return api.get('/financial/summary', { params: { period } });
  },
  
  getChartData: (year?: number) => {
    return api.get('/financial/chart-data', { params: { year } });
  },
  
  getBudgets: () => {
    return api.get('/financial/budgets');
  },
  
  createBudget: (budgetData: any) => {
    return api.post('/financial/budgets', budgetData);
  },
  
  updateBudget: (id: number, budgetData: any) => {
    return api.put(`/financial/budgets/${id}`, budgetData);
  },
  
  deleteBudget: (id: number) => {
    return api.delete(`/financial/budgets/${id}`);
  }
};

// Serviços de agenda
export const agendaService = {
  getEvents: (params?: any) => {
    return api.get('/agenda/', { params });
  },

  getEventType: () => {
    return api.get('/agenda/event-type');
  },
  
  getEvent: (id: number) => {
    return api.get(`/agenda/${id}`);
  },
  
  createEvent: (eventData: any) => {
    return api.post('/agenda/', eventData);
  },
  
  updateEvent: (id: number, eventData: any) => {
    return api.put(`/agenda/${id}`, eventData);
  },
  
  deleteEvent: (id: number) => {
    return api.delete(`/agenda/${id}`);
  },
  
  getUpcomingEvents: () => {
    return api.get('/agenda/upcoming');
  },

  getWeekSumary: () => {
    return api.get('/agenda/week-summary');
  }
};

// Serviços de assistentes de IA
export const assistantsService = {
  getActivationStatus: () => {
    return api.get('/assistants/activation-status');
  },

  activateWithApiToken: (apiToken: string) => {
    return api.post('/assistants/activation', { api_token: apiToken });
  },

  getAssistants: () => {
    return api.get('/assistants');
  },
  
  getAssistant: (id: number) => {
    return api.get(`/assistants/${id}`);
  },
  
  startConversation: (assistantId: number) => {
    return api.post(`/assistants/${assistantId}/conversations`);
  },
  
  getConversations: () => {
    return api.get('/assistants/conversations');
  },
  
  getMessages: (conversationId: number) => {
    return api.get(`/assistants/conversations/${conversationId}/messages`);
  },
  
  sendMessage: (conversationId: number, content: string) => {
    return api.post(`/assistants/conversations/${conversationId}/messages`, { content });
  },
  
  updateConversation: (conversationId: number, title: string) => {
    return api.put(`/assistants/conversations/${conversationId}`, { title });
  },
  
  deleteConversation: (conversationId: number) => {
    return api.delete(`/assistants/conversations/${conversationId}`);
  },
  
  getTrainingData: (assistantName: string, params?: any) => {
    return api.get(`/assistants/training-data/${assistantName}`, { params });
  },
  
  addTrainingData: (assistantName: string, question: string, answer: string, category?: string, confidence?: number) => {
    return api.post(`/assistants/training-data/${assistantName}`, { 
      question, 
      answer, 
      category, 
      confidence 
    });
  },
  
  updateTrainingData: (assistantName: string, dataId: number, trainingData: any) => {
    return api.put(`/assistants/training-data/${assistantName}/${dataId}`, trainingData);
  },
  
  deleteTrainingData: (assistantName: string, dataId: number) => {
    return api.delete(`/assistants/training-data/${assistantName}/${dataId}`);
  }
};

// Serviços de chat
export const chatService = {
  getMyChannels: () => {
    return api.get('/chat/channels');
  },

  getChannelsPending: () => {
    return api.get('/chat/channels-pending');
  },

  getChannelsRating: () => {
    return api.get('/chat/channels-rating');
  },

  getChannelsStatus: (status: string) => {
    return api.get('/chat/channels-status', { params: { status } });
  },

  getChannelsGroups: () => {
    return api.get('/chat/channels-groups');
  },

  getChannelsUsers: () => {
    return api.get('/chat/channels-users');
  },

  getUnreads: () => {
    return api.get('/chat/unread');
  },
  
  getChannel: (id: number) => {
    return api.get(`/chat/channels/${id}`);
  },

  transferChanel: (channelId: number, groupId: number) => {
    return api.put(`/chat/channels/${channelId}/transfer`, { groupId });
  },

  finishChanel: (channelId: number) => {
    return api.put(`/chat/channels/${channelId}/finish`);
  },
  
  getMessages: (channelId: number, params?: any) => {
    return api.get(`/chat/channels/${channelId}/messages`, { params });
  },
  
  sendMessage: (channelId: number, content: string) => {
    return api.post(`/chat/channels/${channelId}/messages`, { content });
  },

  getTags: () => {
    return api.get(`/chat/channels/tags`);
  },

  createTag: (tag: any) => {
    return api.post('/chat/channels/tags', tag);
  },

  getChannelTags: (channelId: number) => {
    return api.get(`/chat/channels/${channelId}/tags`);
  },

  setChannelTag: (channelId: number, tagId: number) => {
    return api.post(`/chat/channels/${channelId}/tags`, { 'tag_id': tagId });
  },

  delChannelTag: (channelId: number, tagId: number) => {
    return api.delete(`/chat/channels/${channelId}/tags/${tagId}`);
  },

  assumeChannel: (channelId: number) => {
    return api.put(`/chat/channels/${channelId}/assume`);
  },

  setChannelObservation: (channelId: number, observation: string) => {
    return api.put(`/chat/channels/${channelId}/observation`, { 'observation': observation });
  },
  
  getContacts: () => {
    return api.get('/chat/contacts');
  },
  
  addContact: (contactData: any) => {
    return api.post('/chat/contacts', contactData);
  },
  
  updateContact: (id: number, contactData: any) => {
    return api.put(`/chat/contacts/${id}`, contactData);
  },
  
  deleteContact: (id: number) => {
    return api.delete(`/chat/contacts/${id}`);
  },

  getContactMessages: (contactId: number) => {
    return api.get(`/chat/contacts/${contactId}/timeline`);
  },

 
};

// Serviços de VoIP
export const voipService = {
  getExtension: () => {
    return api.get('/voip/extension');
  },

  getExtensions: () => {
    return api.get('/voip/extensions');
  },
  
  createExtension: (extensionData: any) => {
    return api.post('/voip/extension', extensionData);
  },
  
  getCalls: (params?: any) => {
    return api.get('/voip/calls', { params });
  },
  
  getCall: (id: number) => {
    return api.get(`/voip/calls/${id}`);
  },
  
  initiateCall: (phoneNumber: string, fromExtension?: string) => {
    return api.post('/voip/call', { phone_number: phoneNumber, from_extension: fromExtension });
  },

  updateCallStatus: (payload: any) => {
    return api.post('/voip/call/status', payload);
  },
  
  endCall: (callId: string) => {
    return api.post(`/voip/call/${callId}/end`);
  },
  
  getContacts: () => {
    return api.get('/voip/contacts');
  },
  
  addContact: (contactData: any) => {
    return api.post('/voip/contacts', contactData);
  },
  
  updateContact: (id: number, contactData: any) => {
    return api.put(`/voip/contacts/${id}`, contactData);
  },
  
  deleteContact: (id: number) => {
    return api.delete(`/voip/contacts/${id}`);
  }
};

// Serviços de grupos e permissões
export const groupsService = {
  getGroups: () => {
    return api.get('/auth/groups');
  },
  
  getGroup: (id: number) => {
    return api.get(`/auth/groups/${id}`);
  },
  
  createGroup: (groupData: any) => {
    return api.post('/auth/groups', groupData);
  },
  
  updateGroup: (id: number, groupData: any) => {
    return api.put(`/auth/groups/${id}`, groupData);
  },
  
  deleteGroup: (id: number) => {
    return api.delete(`/auth/groups/${id}`);
  },
  
  getPermissions: () => {
    return api.get('/auth/permissions');
  },
  
  addUsersToGroup: (groupId: number, userIds: number[]) => {
    return api.post(`/auth/groups/${groupId}/users`, { user_ids: userIds });
  },
  
  removeUsersFromGroup: (groupId: number, userIds: number[]) => {
    return api.delete(`/auth/groups/${groupId}/users`, { data: { user_ids: userIds } });
  },
  
  getUsersInGroup: (groupId: number) => {
    return api.get(`/auth/groups/${groupId}/users`);
  }
};

export const userService = {
  getUsers: () => {
    return api.get('/users/');
  },
  
  getUser: (id: number) => {
    return api.get(`/users/${id}`);
  },
  
  createUser: (data: any) => {
    return api.post('/users/', data);
  },
  
  updateUser: (id: number, data: any) => {
    return api.put(`/users/${id}`, data);
  },

  getPermissions: () => {
    return api.get('/users/permissions');
  },

  getGroups: () => {
    return api.get('/users/groups');
  },

  getGroupsSimple: () => {
    return api.get('/users/groups-simple');
  },

  createGroup: (data: any) => {
    return api.post('/users/groups', data);
  },
  
  updateGroup: (id: number, data: any) => {
    return api.put(`/users/groups/${id}`, data);
  },

};

// Serviços de logs
export const logsService = {
  getLogs: (params?: any) => {
    return api.get('/logs/', { params });
  },
  
  getLogTypes: () => {
    return api.get('/logs/types');
  },
  
  getLogStatistics: () => {
    return api.get('/logs/statistics');
  },
  
  clearLogs: (days: number) => {
    return api.post('/logs/clear', { days });
  },
  
  exportLogs: (params?: any) => {
    return api.get('/logs/export', { params });
  }
};

// Serviços de configuração
export const configService = {
  getAllConfigs: () => {
    return api.get('/config/');
  },
  
  getConfig: (key: string) => {
    return api.get(`/config/${key}`);
  },
  
  getConfigsByGroup: (group_name) => {
    return api.get('/config/group', { params: { "group_name": group_name }  });
  },

  createConfig: (key: string, value: any, description?: string) => {
    return api.post('/config/', { key, value, description });
  },

  createConfigAPIs: (configApis) => {
    return api.post('/config/apis', configApis);
  },
  
  updateConfig: (key: string, value: any, description?: string) => {
    return api.put(`/config/${key}`, { value, description });
  },
  
  deleteConfig: (key: string) => {
    return api.delete(`/config/${key}`);
  },
  
  getAppearanceSettings: () => {
    return api.get('/config/appearance');
  },
  
  getIntegrationSettings: () => {
    return api.get('/config/integrations');
  },
  
  getNotificationSettings: () => {
    return api.get('/config/notifications');
  }
};

// Serviços de estatísticas
export const statisticsService = {
  getDashboardStats: () => {
    return Promise.all([
      tasksService.getTaskStatistics(),
      leadsDashAgentService.getEstatisticasGerais(),
      financialService.getFinancialSummary(),
      productsService.getProductStatistics()
    ]).then(([tasks, leads, financial, products]) => ({
      tasks: tasks.data,
      leads: leads.data,
      financial: financial.data,
      products: products.data
    })).catch(error => {
      console.error("Erro ao carregar estatísticas do dashboard:", error);
      throw error;
    });
  }
};

// Serviços de relatórios
export const reportService = {

  generateReport: async (params?: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/report/gerar-relatorio`, 
      params, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 auth header
        },
      responseType: "blob", 
    });
    const blob = new Blob([response.data], { type: response.headers["content-type"] });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const disposition = response.headers["content-disposition"];
    let filename = `report.${params['formato']}`;
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

  },

  getModules: () => {
    return api.get('/report/modulos');
  },
  
  getPeriods: () => {
    return api.get('/report/periodos');
  },
  
  getFormat: () => {
    return api.get('/report/formatos-exportacao');
  },
  
  // generateReport: (params?: any) => {
  //   return api.post('/report/gerar-relatorio', params);
  // },
  
  viewReportSells: (params?: any) => {
    return api.post(`/report/relatorios/vendas`, params);
  },

  viewReportLeads: (params?: any) => {
    return api.post(`/report/relatorios/leads`, params);
  },

  viewReportFinancial: (params?: any) => {
    return api.post(`/report/relatorios/financeiro`, params);
  },

  viewReportProductivity: (params?: any) => {
    return api.post(`/report/relatorios/produtividade`, params);
  },

  viewReportSatisfaction: (params?: any) => {
    return api.post(`/report/relatorios/satisfacao`, params);
  },

  viewReportStock: (params?: any) => {
    return api.post(`/report/relatorios/estoque`, params);
  },
  
};

export default api;
