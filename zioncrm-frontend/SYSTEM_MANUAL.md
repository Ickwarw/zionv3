# Manual do Sistema ZionCRM

## Índice
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Instalação Passo a Passo](#instalação-passo-a-passo)
4. [Configuração](#configuração)
5. [Arquitetura do Sistema](#arquitetura-do-sistema)
6. [Módulos do Sistema](#módulos-do-sistema)
7. [Assistentes de IA](#assistentes-de-ia)
8. [Manutenção e Backup](#manutenção-e-backup)
9. [Solução de Problemas](#solução-de-problemas)
10. [Perguntas Frequentes](#perguntas-frequentes)

## Visão Geral do Sistema

O Tailwind CSS
- **Banco de Dados**: SQLite (padrão)
- **Comunicação em Tempo Real**: Suporte a WebSocket via Flask-SocketIO
- **Autenticação**: Autenticação baseada em JWT com tokens de atualização

### Principais Recursos ZionCRM é um sistema abrangente de Gestão de Relacionamento
- Gerenciamento de Tarefas com quadros Kanban
- com o Cliente construído com Gerenciamento e a:
- **Backend**: Python Flask com SQLAlchemy ORM
- **Frontend**: Reactcompanhamento de Leads
- Gerenciamento de Produtos e Inventário
- Gerenciamento Financeiro e relatórios
- Assistentes de IA com com TypeScript e Tailwind CSS
- **Banco de Dados**: SQLite (padrão)
- **Comunic dados de treinamento individuais
- Integraçãoação em Tempo Real**: de Chat e VoIP
- Grupos de Usuários e Permissões
- Logs Suporte a WebSocket via Flask-SocketIO
- **Autenticação**: Autenticação baseada em JWT e Análises do Sistema
- Gerenciamento de Agenda e Eventos

## Requisitos do Sistema

### Requisitos de Hardware
- **CPU**: Processador dual-core 2GHz ou superior
- **Memória**: Mínimo 4GB RAM (8GB recomendado)
- **Armazenamento**: 2GB de espaço livre em disco (mais para crescimento  com tokens de atualização

### Principais Recursos
- Gerenciamento de Tarefas com quadros Kanban
- Gerenciamento e acompanhamento de Leads
- Gerenciamento de Produtos e Inventário
- Gerenciamento Financeiro e relatórios
- Assistentes de IA com dados de treinamento individuais
- Integração de Chat e VoIP
- Grupos de Usuários e Permissões
- Logs e Análises do Sistema
- Gerenciamento de Agenda e Eventos

## Requisitos do Sistema

### Requisitos de Hardware
- **CPU**: Processador dualdo banco de dados)
- **Rede**: Conexão com a internet para instalação de dependências

### Requisitos de Software
- **Sistema Operacional**:
  - Windows 10/11 ou
  - Ubuntu 18.04 LTS ou superior
- **Dependências**:
  - Python 3.8 ou superior
  - Node.js 14 ou superior
  - npm 6 ou superior
  --core 2GHz ou superior
- Servidor web (Apache para **Memória**: Mínimo 4GB RAM (re Windows, Nginx para Ubuntu)

## Instalação Passo a Passo

### Instalação nocomendado 8GB ou mais)
- **Armazenamento**: Mínimo 2GB de espaço livre em disco
- **Rede**: Conexão com a internet para instalação de dependências

### Requisitos de Software Windows

1. **Pré-requisitos**:
   - Instale Python 3.8+ de [python.org](https://www.python.org/downloads/)
   - Instale Node.js 14+ de [nodejs.org
- **Sistema Operacional**: Windows 10/11 ou Ubuntu 18.04/20.04/22.04
- **Python**: Versão 3.8 ou superior
- **Node.js**: Versão 14.x ou superior
-](https://nodejs.org/)
   - Certifique-se de que Python e Node.js estão no PATH do sistema

2. **Baixe o ZionCRM**:
   - Clone o repositório ou baixe o arquivo ZIP
   - Extra **Navegador Web**: Chrome, Firefox, Edge ou Safari atualizado

## Instalação Passo a Passo

### Pré-requisitos

Antes de iniciar a instalação, certifique-se de queia para um diretório de sua escolha (ex: `C:\ZionCRM`)

3. **Execute o script de instalação**:
   - Abra o Prompt de Comando como administrador
   - Navegue até o diretório do ZionCRM: `cd C:\ZionCRM` os seguintes softwares estão instalados:

#### Windows:
1. **Python 3.8+
   - Execute o script de instalação: `install_windows.bat`

4. **O script realizará automaticamente**:
   - Verificação de dependências
   - Criação de ambiente virtual Python
   - Instalação de dependências do backend
   - Inicialização do banco de dados SQLite
   - Criação de usuário administrador
   - Instalação de dependências do frontend
   - Construção do frontend
   - Instalação e configuração do Apache (se não estiver instalado)

5. **Inicie o sistema**:
   - Ative o ambiente virtual: `venv\Scripts\activate`
   - Inicie o backend: `python backend\app.py`
   - Acesse o sistema em: `http://localhost`

### Instalação no Ubuntu

1. **Pré-requisitos**:
   - Ubuntu 18.04 LTS ou superior
   - Acesso de superusuário (sudo)

2. **Baixe o ZionCRM**:
   - Clone o repositório ou baixe o arquivo ZIP
   - Extraia para um diretório de sua escolha (ex: `/home/user/ZionCRM`)

3. **Execute o script de instalação**:
   - Abra o Terminal
   - Navegue até o diretório do ZionCRM: `cd /home/user/ZionCRM`
   - Torne o script executável: `chmod +x install_ubuntu.sh`
   - Execute o script como superusuário: `sudo ./install_ubuntu.sh`

4. **O script realizará automaticamente**:
   - Instalação de dependências do sistema
   - Instalação de Python, pip, Node.js e npm (se necessário)
   - Criação do diretório de instalação em `/opt/zioncrm`
   - Criação de ambiente virtual Python
   - Instalação de dependências do backend
   - Inicialização do banco de dados SQLite
   - Criação de usuário administrador
   - Instalação de dependências do frontend
   - Construção do frontend
   - Instalação e configuração do Nginx
   - Criação de serviço systemd para o backend

5. **Acesse o sistema**:
   - Abra um navegador e acesse: `http://localhost`
   - O sistema estará rodando como um serviço

### Instalação Manual

Se os scripts automatizados não funcionarem, siga estes passos para instalação manual:

1. **Configuração do Backend**:

   # Crie e ative um ambiente virtual
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   
   # Instale as dependências
   pip install -r backend/requirements.txt
   
   # Inicialize o banco de dados
   cd backend
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   
   # Crie o usuário administrador
   python -c "from app import app, db; from models.user import User; app.app_context().push(); admin = User(username='admin', email='admin@example.com', first_name='Admin', last_name='User', is_active=True, is_admin=True); admin.set_password('admin'); db.session.add(admin); db.session.commit()"
   
   # Inicialize dados padrão
   python init_data.py
   
   # Inicie o servidor backend
   python app.py


2. **Configuração do Frontend**:

   # Instale as dependências
   npm install
   
   # Construa o frontend
   npm run build


3. **Configuração do Servidor Web**:
   - Configure seu servidor web (Apache/Nginx) para servir os arquivos estáticos do diretório `dist`
   - Configure um proxy para redirecionar solicitações `/api` para `http://localhost:5000/api`

## Configuração

### Configuração do Backend

O backend pode ser configurado através de variáveis de ambiente ou do arquivo `backend/config.py`:

1. **Variáveis de Ambiente**:
   - `SECRET_KEY`: Chave secreta para Flask
   - `JWT_SECRET_KEY`: Chave secreta para tokens JWT
   - `DATABASE_URL`: URL do banco de dados (padrão: SQLite)
   - `FACEBOOK_API_KEY`, `WHATSAPP_API_KEY`, `INSTAGRAM_API_KEY`: Chaves de API para integrações
   - `SIP_SERVER`, `SIP_USERNAME`, `SIP_PASSWORD`: Configurações para VoIP

2. **Arquivo .env**:
   Crie um arquivo `.env` na raiz do projeto:

   SECRET_KEY=sua-chave-secreta-aqui
   JWT_SECRET_KEY=sua-chave-jwt-secreta-aqui
   DATABASE_URL=sqlite:///ziondbsqlite.db
   FACEBOOK_API_KEY=sua-chave-api-facebook
   WHATSAPP_API_KEY=sua-chave-api-whatsapp
   INSTAGRAM_API_KEY=sua-chave-api-instagram
   SIP_SERVER=seu-servidor-sip
   SIP_USERNAME=seu-usuario-sip
   SIP_PASSWORD=sua-senha-sip


### Configuração do Frontend

O frontend pode ser configurado através de variáveis de ambiente ou do arquivo `.env`:

1. **Variáveis de Ambiente**:
   - `VITE_API_URL`: URL da API do backend (padrão: `/api`)

2. **Arquivo .env**:

   VITE_API_URL=/api


### Configuração do Servidor Web

#### Apache (Windows)

Arquivo de configuração em `C:\Apache24\conf\extra\httpd-vhosts.conf`:

<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/ZionCRM/dist"
    
    <Directory "C:/ZionCRM/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</VirtualHost>


Certifique-se de que os módulos `mod_proxy` e `mod_proxy_http` estão habilitados em `httpd.conf`.

#### Nginx (Ubuntu)

Arquivo de configuração em `/etc/nginx/sites-available/zioncrm`:

server {
    listen 80;
    server_name localhost;

    root /opt/zioncrm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


## Arquitetura do Sistema

### Estrutura de Diretórios


zioncrm/
├── backend/
│   ├── app.py                 # Ponto de entrada principal
│   ├── config.py              # Configurações
│   ├── extensions.py          # Extensões Flask
│   ├── routes.py              # Registro de rotas
│   ├── init_data.py           # Inicialização de dados
│   ├── assistants/            # Assistentes de IA individuais
│   ├── models/                # Modelos de banco de dados
│   └── modules/               # Módulos de funcionalidades
├── dist/                      # Frontend construído
├── node_modules/              # Dependências do Node.js
├── public/                    # Arquivos públicos
├── src/                       # Código-fonte do frontend
├── uploads/                   # Diretório de uploads
├── venv/                      # Ambiente virtual Python
├── .env                       # Variáveis de ambiente
├── install_ubuntu.sh          # Script de instalação para Ubuntu
├── install_windows.bat        # Script de instalação para Windows
├── package.json               # Configuração do npm
└── README.md                  # Documentação


### Fluxo de Dados

1. **Autenticação**:
   - Cliente envia credenciais para `/api/auth/login`
   - Servidor valida e retorna tokens JWT
   - Cliente armazena tokens no localStorage
   - Tokens são incluídos em requisições subsequentes

2. **Comunicação Cliente-Servidor**:
   - Cliente faz requisições REST para endpoints da API
   - Servidor processa requisições e retorna respostas JSON
   - WebSockets são usados para comunicação em tempo real (chat, notificações)

3. **Persistência de Dados**:
   - Dados são armazenados no banco de dados SQLite
   - Modelos SQLAlchemy definem a estrutura do banco de dados
   - Transações garantem a integridade dos dados

## Módulos do Sistema

### Módulo de Autenticação e Usuários

- **Funcionalidades**:
  - Registro de usuários
  - Login/logout
  - Gerenciamento de perfil
  - Recuperação de senha
  - Grupos e permissões

- **Endpoints Principais**:
  - `POST /api/auth/login` - Login de usuário
  - `POST /api/auth/register` - Registro de usuário
  - `GET /api/auth/me` - Obter informações do usuário atual
  - `POST /api/auth/change-password` - Alterar senha

### Módulo de Tarefas

- **Funcionalidades**:
  - Criação e gerenciamento de tarefas
  - Atribuição de tarefas a usuários
  - Categorização e priorização
  - Visualização em quadro Kanban
  - Comentários em tarefas

- **Endpoints Principais**:
  - `GET /api/tasks` - Listar tarefas
  - `POST /api/tasks` - Criar tarefa
  - `PUT /api/tasks/{id}` - Atualizar tarefa
  - `GET /api/tasks/statistics` - Obter estatísticas

### Módulo de Leads

- **Funcionalidades**:
  - Gerenciamento de leads
  - Acompanhamento de status
  - Registro de atividades
  - Conversão de leads
  - Análise de desempenho

- **Endpoints Principais**:
  - `GET /api/leads` - Listar leads
  - `POST /api/leads` - Criar lead
  - `GET /api/leads/{id}/activities` - Obter atividades do lead
  - `GET /api/leads/statistics` - Obter estatísticas

### Módulo de Produtos

- **Funcionalidades**:
  - Catálogo de produtos
  - Gerenciamento de inventário
  - Gerenciamento de fornecedores
  - Geração de códigos QR
  - Alertas de estoque baixo

- **Endpoints Principais**:
  - `GET /api/products/products` - Listar produtos
  - `POST /api/products/products` - Criar produto
  - `GET /api/products/suppliers` - Listar fornecedores
  - `GET /api/products/low-stock` - Obter produtos com estoque baixo

### Módulo Financeiro

- **Funcionalidades**:
  - Registro de transações (receitas/despesas)
  - Categorização financeira
  - Gerenciamento de contas
  - Orçamentos
  - Relatórios financeiros

- **Endpoints Principais**:
  - `GET /api/financial/transactions` - Listar transações
  - `POST /api/financial/transactions` - Criar transação
  - `GET /api/financial/summary` - Obter resumo financeiro
  - `GET /api/financial/chart-data` - Obter dados para gráficos

### Módulo de Chat e VoIP

- **Funcionalidades**:
  - Integração com Facebook, WhatsApp e Instagram
  - Gerenciamento de conversas
  - Chamadas VoIP
  - Registro de chamadas
  - Gerenciamento de contatos

- **Endpoints Principais**:
  - `GET /api/chat/channels` - Listar canais de chat
  - `POST /api/chat/channels/{id}/messages` - Enviar mensagem
  - `POST /api/voip/call` - Iniciar chamada
  - `GET /api/voip/calls` - Listar histórico de chamadas

### Módulo de Agenda

- **Funcionalidades**:
  - Gerenciamento de eventos
  - Calendário
  - Lembretes
  - Eventos recorrentes
  - Compartilhamento de eventos

- **Endpoints Principais**:
  - `GET /api/agenda` - Listar eventos
  - `POST /api/agenda` - Criar evento
  - `GET /api/agenda/upcoming` - Obter próximos eventos

### Módulo de Logs

- **Funcionalidades**:
  - Registro de atividades do sistema
  - Filtragem e busca de logs
  - Exportação de logs
  - Estatísticas de logs
  - Limpeza automática

- **Endpoints Principais**:
  - `GET /api/logs` - Listar logs
  - `GET /api/logs/statistics` - Obter estatísticas de logs
  - `POST /api/logs/clear` - Limpar logs antigos
  - `GET /api/logs/export` - Exportar logs

## Assistentes de IA

O ZionCRM inclui 10 assistentes de IA especializados, cada um com sua própria área de expertise e base de conhecimento:

### 1. Julia - Guia de Gerenciamento de Tarefas

- **Função**: Explica como usar as funcionalidades do sistema de tarefas
- **Tipo**: Assistente de guia (não usa IA/ML)
- **Arquivo**: `backend/assistants/julia.py`
- **Uso**: Pergunte sobre como criar, atribuir ou gerenciar tarefas

### 2. Quim - Especialista em Análise de Dados

- **Função**: Ajuda com análise de dados, relatórios e insights
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/quim.py`
- **Tabela de Treinamento**: `quim_training_data`
- **Uso**: Pergunte sobre análise de vendas, tendências, previsões

### 3. Joce - Especialista em Atendimento ao Cliente

- **Função**: Ajuda com atendimento ao cliente e resolução de problemas
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/joce.py`
- **Tabela de Treinamento**: `joce_training_data`
- **Uso**: Pergunte sobre como lidar com reclamações, melhorar satisfação

### 4. Cristal - Especialista em Marketing

- **Função**: Ajuda com estratégias de marketing e campanhas
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/cristal.py`
- **Tabela de Treinamento**: `cristal_training_data`
- **Uso**: Pergunte sobre campanhas, conteúdo, redes sociais

### 5. Emanuel - Especialista em Gestão Financeira

- **Função**: Ajuda com gestão financeira e orçamentos
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/emanuel.py`
- **Tabela de Treinamento**: `emanuel_training_data`
- **Uso**: Pergunte sobre orçamentos, fluxo de caixa, redução de custos

### 6. Rodolfo - Especialista em Vendas

- **Função**: Ajuda com estratégias de vendas e fechamento de negócios
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/rodolfo.py`
- **Tabela de Treinamento**: `rodolfo_training_data`
- **Uso**: Pergunte sobre qualificação de leads, técnicas de fechamento

### 7. Kelly - Especialista em Gerenciamento de Produtos

- **Função**: Ajuda com gerenciamento de produtos e inventário
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/kelly.py`
- **Tabela de Treinamento**: `kelly_training_data`
- **Uso**: Pergunte sobre controle de estoque, fornecedores, precificação

### 8. Erivaldo - Especialista em Suporte Técnico

- **Função**: Ajuda com problemas técnicos e configurações
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/erivaldo.py`
- **Tabela de Treinamento**: `erivaldo_training_data`
- **Uso**: Pergunte sobre resolução de problemas, otimização, segurança

### 9. Ione - Especialista em Recursos Humanos

- **Função**: Ajuda com recrutamento e gestão de equipes
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/ione.py`
- **Tabela de Treinamento**: `ione_training_data`
- **Uso**: Pergunte sobre recrutamento, treinamento, conflitos

### 10. Ivonete - Especialista em Estratégia de Negócios

- **Função**: Ajuda com planejamento estratégico e análise de mercado
- **Tipo**: Assistente de IA com treinamento específico
- **Arquivo**: `backend/assistants/ivonete.py`
- **Tabela de Treinamento**: `ivonete_training_data`
- **Uso**: Pergunte sobre planejamento estratégico, análise de mercado

### Como Usar os Assistentes

1. Acesse a seção de Assistentes no menu principal
2. Selecione o assistente apropriado para sua necessidade
3. Inicie uma conversa digitando sua pergunta
4. O assistente responderá com base em seu conhecimento especializado
5. Você pode continuar a conversa ou iniciar uma nova a qualquer momento

### Treinamento dos Assistentes

Administradores podem adicionar novos dados de treinamento para melhorar os assistentes:

1. Acesse a seção de Administração > Assistentes
2. Selecione o assistente que deseja treinar
3. Clique em "Gerenciar Dados de Treinamento"
4. Adicione novos pares de pergunta/resposta
5. Defina a categoria e nível de confiança
6. Salve os novos dados de treinamento

## Administração do Sistema

### Primeiro Acesso

Após a instalação, acesse o sistema com as credenciais padrão:
- **Usuário**: admin
- **Senha**: admin

**IMPORTANTE**: Altere a senha do administrador após o primeiro login!

### Gerenciamento de Usuários

1. **Criar Novo Usuário**:
   - Acesse Administração > Usuários
   - Clique em "Novo Usuário"
   - Preencha os dados necessários
   - Atribua grupos e permissões
   - Salve o novo usuário

2. **Gerenciar Grupos e Permissões**:
   - Acesse Administração > Grupos
   - Crie novos grupos conforme necessário
   - Atribua permissões aos grupos
   - Adicione usuários aos grupos

### Configurações do Sistema

1. **Configurações Gerais**:
   - Acesse Administração > Configurações
   - Ajuste nome da empresa, logo, fuso horário
   - Configure opções de notificação
   - Salve as alterações

2. **Integrações**:
   - Acesse Administração > Integrações
   - Configure APIs de terceiros (Facebook, WhatsApp, Instagram)
   - Configure servidor SIP para VoIP
   - Teste as integrações

### Backup e Restauração

1. **Backup do Banco de Dados**:

   # SQLite
   cp ziondbsqlite.db ziondbsqlite_backup_$(date +%Y%m%d).db


2. **Restauração do Banco de Dados**:

   # SQLite
   cp ziondbsqlite_backup_20230101.db ziondbsqlite.db


3. **Backup Completo do Sistema**:

   # Windows
   xcopy /E /I /H /Y C:\ZionCRM C:\Backups\ZionCRM_$(date /f yyyy-mm-dd)
   
   # Ubuntu
   cp -r /opt/zioncrm /opt/backups/zioncrm_$(date +%Y%m%d)


## Solução de Problemas

### Problemas Comuns e Soluções

1. **Erro de Conexão com o Banco de Dados**:
   - **Sintoma**: Mensagem "Unable to connect to database"
   - **Solução**:
     - Verifique se o caminho do banco de dados está correto em `config.py`
     - Verifique permissões do arquivo do banco de dados
     - Certifique-se de que o diretório do banco de dados existe

2. **Erro de Autenticação**:
   - **Sintoma**: Não consegue fazer login mesmo com credenciais corretas
   - **Solução**:
     - Limpe o cache do navegador e cookies
     - Verifique se JWT_SECRET_KEY está configurado corretamente
     - Reinicie o servidor backend

3. **Erro 404 ao Acessar API**:
   - **Sintoma**: Mensagens de erro "API not found" no console
   - **Solução**:
     - Verifique se o servidor backend está rodando
     - Verifique configuração de proxy no servidor web
     - Certifique-se de que VITE_API_URL está configurado corretamente

4. **Erro ao Carregar Frontend**:
   - **Sintoma**: Página em branco ou erro de JavaScript
   - **Solução**:
     - Verifique console do navegador para erros específicos
     - Reconstrua o frontend: `npm run build`
     - Verifique configuração do servidor web

5. **Problemas com Assistentes de IA**:
   - **Sintoma**: Assistentes não respondem ou dão respostas incorretas
   - **Solução**:
     - Verifique logs do servidor para erros
     - Certifique-se de que as tabelas de treinamento existem no banco de dados
     - Adicione mais dados de treinamento para melhorar respostas

### Logs do Sistema

Os logs do sistema são essenciais para diagnóstico de problemas:

1. **Logs do Backend**:
   - Verifique o console onde o servidor está rodando
   - Em produção (Ubuntu): `sudo journalctl -u zioncrm`

2. **Logs do Frontend**:
   - Abra o console do navegador (F12)
   - Verifique a aba "Console" para erros de JavaScript
   - Verifique a aba "Network" para erros de requisição

3. **Logs do Servidor Web**:
   - Apache (Windows): `C:\Apache24\logs\error.log`
   - Nginx (Ubuntu): `/var/log/nginx/error.log`

4. **Logs do Sistema**:
   - Acesse a interface do ZionCRM: Administração > Logs
   - Filtre por tipo, data ou usuário
   - Exporte logs para análise detalhada

## Manutenção

### Manutenção Regular

1. **Atualização do Sistema**:

   # Atualizar código-fonte
   git pull
   
   # Atualizar dependências do backend
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   pip install -r backend/requirements.txt
   
   # Atualizar dependências do frontend
   npm install
   npm run build
   
   # Reiniciar serviços
   # Ubuntu:
   sudo systemctl restart zioncrm
   sudo systemctl restart nginx
   
   # Windows:
   net stop Apache2.4
   net start Apache2.4


2. **Manutenção do Banco de Dados**:

   # Backup antes da manutenção
   cp ziondbsqlite.db ziondbsqlite_backup.db
   
   # Otimização do banco de dados SQLite
   sqlite3 ziondbsqlite.db "VACUUM;"


3. **Limpeza de Logs**:
   - Acesse Administração > Logs
   - Clique em "Limpar Logs Antigos"
   - Selecione o período (ex: logs com mais de 90 dias)
   - Confirme a limpeza

4. **Verificação de Segurança**:
   - Atualize regularmente todas as dependências
   - Verifique permissões de arquivos e diretórios
   - Monitore logs em busca de atividades suspeitas
   - Faça backup regular dos dados

### Atualização de Assistentes de IA

Para manter os assistentes de IA atualizados e melhorar suas respostas:

1. **Revisar Conversas**:
   - Analise as conversas dos usuários com os assistentes
   - Identifique perguntas frequentes sem boas respostas

2. **Adicionar Dados de Treinamento**:
   - Acesse Administração > Assistentes > [Nome do Assistente]
   - Adicione novos pares de pergunta/resposta
   - Categorize adequadamente
   - Defina nível de confiança apropriado

3. **Testar Assistentes**:
   - Após adicionar novos dados, teste os assistentes
   - Faça perguntas que anteriormente não tinham boas respostas
   - Verifique se as respostas melhoraram

4. **Ajustar Conforme Necessário**:
   - Modifique respostas existentes se necessário
   - Remova dados de treinamento obsoletos
   - Ajuste níveis de confiança para priorizar respostas melhores


Após realizar essas correções e ajustes, o sistema ZionCRM estará pronto para ser colocado em produção. O frontend agora está configurado para se conectar corretamente ao backend, os scripts de instalação foram aprimorados para garantir uma configuração completa e correta, e o manual do sistema foi atualizado com instruções detalhadas passo a passo.

Os principais pontos que foram abordados:

1. **Ajustes no Frontend**: Melhorias no serviço de API para garantir conexão correta com o backend, incluindo tratamento de erros e refresh de tokens.

2. **Correções no Backend**: Garantia de que todos os assistentes sejam importados corretamente e que o banco de dados SQLite seja criado e inicializado adequadamente.

3. **Aprimoramento dos Scripts de Instalação**: Adição de verificações de dependências, tratamento de erros, e configuração completa dos servidores web (Apache para Windows e Nginx para Ubuntu).

4. **Manual do Sistema Detalhado**: Criação de um manual abrangente com instruções passo a passo para instalação, configuração, uso e manutenção do sistema.

O sistema agora está pronto para ser utilizado em ambiente de produção, com todos os componentes integrados e funcionando corretamente.