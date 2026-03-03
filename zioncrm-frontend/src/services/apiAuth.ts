import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Cria instância do axios com configuração para ambiente de produção
const apiAuth = axios.create({
  // Usa a variável de ambiente ou fallback para localhost
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout para requisições
  timeout: 30000,
});

// Serviços de autenticação, usuários e permissões
export const authLoginService = {
  login: (email: string, password: string) => {
    return apiAuth.post('/auth/login', { email, password });
  },
  
  register: (userData: any) => {
    return apiAuth.post('/auth/register', userData);
  },
  
};

export default apiAuth;