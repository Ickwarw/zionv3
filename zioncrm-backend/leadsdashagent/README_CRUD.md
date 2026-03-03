# 🚀 Zion CRM - Sistema CRUD Completo

Sistema completo de gerenciamento de dados com APIs REST e interface web interativa.

## 📋 Visão Geral

Este sistema fornece APIs CRUD (Create, Read, Update, Delete) completas para gerenciar:

- **Leads (Clientes)** - Cadastro completo de clientes
- **Contratos** - Gerenciamento de contratos e serviços
- **Arquivos** - Upload e gerenciamento de documentos
- **Chamados** - Sistema de suporte técnico
- **Mensagens** - Comunicação entre cliente e suporte
- **Usuários** - Gerenciamento de usuários do sistema

## 🏗️ Arquitetura

O sistema é dividido em 3 APIs independentes que trabalham em conjunto:

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Web                       │
│               (static/crud.html)                     │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐   ┌────▼─────┐   ┌───▼─────┐
│ API 1  │   │  API 2   │   │  API 3  │
│5001    │   │  5002    │   │  5003   │
│lead.py │   │leadatri  │   │leadinfo │
│        │   │butes.py  │   │s.py     │
└───┬────┘   └────┬─────┘   └───┬─────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
          ┌───────▼────────┐
          │   PostgreSQL   │
          │   (zioncrm)    │
          └────────────────┘
```

## 📦 Componentes

### 1. lead.py (Porta 5001)
API principal para gerenciamento de leads/clientes.

**Endpoints:**
- `GET /api/leads` - Lista leads com paginação
- `GET /api/leads/<id>` - Busca lead específico
- `POST /api/leads` - Cria novo lead
- `PUT /api/leads/<id>` - Atualiza lead
- `PATCH /api/leads/<id>/partial` - Atualização parcial
- `DELETE /api/leads/<id>` - Deleta lead
- `POST /api/leads/search` - Busca avançada
- `GET /api/leads/stats` - Estatísticas

### 2. leadatributes.py (Porta 5002)
API para contratos e arquivos.

**Endpoints:**

**Arquivos:**
- `GET /api/arquivos` - Lista arquivos
- `POST /api/arquivos` - Adiciona arquivo
- `PUT /api/arquivos/<id>` - Atualiza arquivo
- `DELETE /api/arquivos/<id>` - Remove arquivo

**Contratos:**
- `GET /api/contratos` - Lista contratos
- `POST /api/contratos` - Cria contrato
- `PUT /api/contratos/<id>` - Atualiza contrato
- `DELETE /api/contratos/<id>` - Remove contrato

**Alterações de Plano:**
- `GET /api/alteracoes-plano` - Lista alterações
- `POST /api/alteracoes-plano` - Registra alteração

**Histórico:**
- `GET /api/historico-contrato` - Lista histórico
- `POST /api/historico-contrato` - Adiciona evento

**Serviços:**
- `GET /api/contratos-servicos` - Lista serviços
- `POST /api/contratos-servicos` - Adiciona serviço
- `PUT /api/contratos-servicos/<id>` - Atualiza serviço
- `DELETE /api/contratos-servicos/<id>` - Remove serviço

### 3. leadinfos.py (Porta 5003)
API para suporte e usuários.

**Endpoints:**

**Chamados:**
- `GET /api/chamados` - Lista chamados
- `POST /api/chamados` - Cria chamado
- `PUT /api/chamados/<id>` - Atualiza chamado
- `DELETE /api/chamados/<id>` - Remove chamado
- `GET /api/chamados/stats` - Estatísticas

**Mensagens:**
- `GET /api/chamados-mensagens` - Lista mensagens
- `POST /api/chamados-mensagens` - Adiciona mensagem
- `PUT /api/chamados-mensagens/<id>` - Atualiza mensagem
- `DELETE /api/chamados-mensagens/<id>` - Remove mensagem

**Arquivos de Chamados:**
- `GET /api/chamados-arquivos` - Lista arquivos
- `POST /api/chamados-arquivos` - Adiciona arquivo
- `DELETE /api/chamados-arquivos/<id>` - Remove arquivo

**Histórico de Chamados:**
- `GET /api/chamados-historico` - Lista histórico
- `POST /api/chamados-historico` - Adiciona evento

**Eventos:**
- `GET /api/eventos` - Lista eventos
- `POST /api/eventos` - Registra evento

**Usuários:**
- `GET /api/usuarios` - Lista usuários
- `GET /api/usuarios/<id>` - Busca usuário
- `POST /api/usuarios` - Cria usuário
- `PUT /api/usuarios/<id>` - Atualiza usuário
- `DELETE /api/usuarios/<id>` - Remove usuário

### 4. static/crud.html
Interface web completa e responsiva para interagir com todas as APIs.

**Recursos:**
- 📊 Dashboard com estatísticas em tempo real
- 📝 Formulários dinâmicos para criação/edição
- 🔍 Busca e filtros avançados
- 📄 Paginação automática
- ✅ Validação de formulários
- 🎨 Design moderno e responsivo
- 🔄 Atualização automática de dados

## 🚀 Como Usar

### Opção 1: Iniciar Tudo de Uma Vez (Recomendado)

```bash
python start_crud_apis.py
```

Este script:
- ✅ Inicia as 3 APIs simultaneamente
- ✅ Abre automaticamente o navegador
- ✅ Exibe logs de todas as APIs
- ✅ Permite parar tudo com CTRL+C

### Opção 2: Iniciar APIs Individualmente

**Terminal 1:**
```bash
python lead.py
```

**Terminal 2:**
```bash
python leadatributes.py
```

**Terminal 3:**
```bash
python leadinfos.py
```

Depois abra: http://localhost:5001/static/crud.html

## 📱 Usando a Interface Web

### 1. Acessar o Sistema
Abra seu navegador em: `http://localhost:5001/static/crud.html`

### 2. Navegação
Use as abas no topo para alternar entre:
- 👥 **Leads** - Gerenciar clientes
- 📄 **Contratos** - Gerenciar contratos
- 📁 **Arquivos** - Gerenciar documentos
- 🎫 **Chamados** - Gerenciar suporte
- 💬 **Mensagens** - Ver/enviar mensagens
- 👤 **Usuários** - Gerenciar usuários

### 3. Operações CRUD

#### Criar Novo Registro
1. Clique no botão "➕ Novo [Tipo]"
2. Preencha o formulário
3. Clique em "Criar"

#### Editar Registro
1. Clique em "✏️ Editar" na linha desejada
2. Modifique os campos
3. Clique em "Salvar Alterações"

#### Deletar Registro
1. Clique em "🗑️ Deletar" na linha desejada
2. Confirme a operação

#### Buscar/Filtrar
- Use a caixa de busca no topo
- Digite pelo menos 3 caracteres
- Resultados aparecem automaticamente

### 4. Recursos Especiais

#### Dashboard de Estatísticas
- Exibido automaticamente nas abas Leads e Chamados
- Atualiza sempre que você carrega os dados
- Mostra métricas importantes em tempo real

#### Paginação
- Use os botões "← Anterior" e "Próxima →"
- Mostra página atual e total de páginas
- 20 registros por página (leads)
- 50 registros por página (outros)

#### Mensagens de Chamados
1. Digite o ID do chamado
2. Clique em "🔍 Buscar Mensagens"
3. Visualize o histórico completo
4. Adicione novas mensagens

## 🔧 Configuração do Banco de Dados

Todas as APIs conectam em:
- **Host:** 45.160.180.34
- **Porta:** 5432
- **Database:** zioncrm
- **Usuário:** zioncrm
- **Senha:** kN98upt4gJ3G

Para alterar, edite a variável `POSTGRES_CONFIG` em cada arquivo .py:

```python
POSTGRES_CONFIG = {
    "host": "seu_host",
    "port": 5432,
    "user": "seu_usuario",
    "password": "sua_senha",
    "dbname": "seu_banco",
}
```

## 📊 Exemplos de Uso da API

### Criar um Lead (POST)

```bash
curl -X POST http://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "razao": "Empresa Teste LTDA",
    "cnpj_cpf": "12.345.678/0001-90",
    "email": "contato@teste.com",
    "telefone_celular": "(11) 99999-9999",
    "cidade": "São Paulo",
    "uf": "SP",
    "ativo": "S"
  }'
```

### Buscar Leads (GET)

```bash
# Todos os leads (página 1)
curl http://localhost:5001/api/leads

# Buscar por nome
curl http://localhost:5001/api/leads?search=teste

# Lead específico
curl http://localhost:5001/api/leads/1

# Estatísticas
curl http://localhost:5001/api/leads/stats
```

### Atualizar Lead (PUT)

```bash
curl -X PUT http://localhost:5001/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novoemail@teste.com",
    "telefone_celular": "(11) 88888-8888"
  }'
```

### Deletar Lead (DELETE)

```bash
curl -X DELETE http://localhost:5001/api/leads/1
```

### Criar Chamado (POST)

```bash
curl -X POST http://localhost:5003/api/chamados \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 1,
    "assunto": "Problema de conexão",
    "descricao": "Internet está instável",
    "prioridade": "A"
  }'
```

## 🎨 Personalização da Interface

### Cores do Tema
Edite o `<style>` em `static/crud.html`:

```css
/* Cor primária (roxo) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Altere para azul, por exemplo: */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

### Itens por Página
Edite nas funções de carregamento:

```javascript
// De:
const response = await fetch(`${API_LEADS}/leads?page=${page}&per_page=20`);

// Para (50 items):
const response = await fetch(`${API_LEADS}/leads?page=${page}&per_page=50`);
```

## 🔒 Segurança

⚠️ **IMPORTANTE:** Este sistema é para uso interno. Para produção, implemente:

1. **Autenticação:**
   - JWT tokens
   - Sessões de usuário
   - Login/logout

2. **Autorização:**
   - Controle de permissões por role
   - Validação de acesso aos recursos

3. **Validação:**
   - Sanitização de inputs
   - Prevenção de SQL Injection (use prepared statements)
   - Validação de tipos de dados

4. **HTTPS:**
   - Configure SSL/TLS
   - Use certificados válidos

5. **Rate Limiting:**
   - Limite requisições por IP
   - Proteção contra DDoS

6. **Senhas:**
   - Hash com bcrypt ou argon2
   - Nunca armazene senhas em texto puro

## 🐛 Troubleshooting

### Erro: "Porta já em uso"
```bash
# Windows - Liberar porta 5001
netstat -ano | findstr :5001
taskkill /PID [número_do_processo] /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9
```

### Erro: "Conexão com banco recusada"
- Verifique se o PostgreSQL está rodando
- Confira as credenciais em `POSTGRES_CONFIG`
- Teste a conexão: `psql -h 45.160.180.34 -U zioncrm -d zioncrm`

### Erro: "CORS bloqueado"
As APIs já possuem CORS habilitado. Se ainda assim tiver problemas:
- Verifique se `flask-cors` está instalado
- Confirme que `CORS(app)` está em cada arquivo .py

### Frontend não carrega dados
1. Verifique se as 3 APIs estão rodando
2. Abra o Console do navegador (F12)
3. Confira as URLs das APIs no JavaScript
4. Teste as APIs diretamente: `http://localhost:5001/api/leads/health`

## 📚 Estrutura de Resposta da API

### Sucesso:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação concluída"
}
```

### Erro:
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Paginação:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8
  }
}
```

## 📈 Próximos Passos

Sugestões para expandir o sistema:

1. **Autenticação JWT**
   - Login seguro
   - Tokens de sessão
   - Renovação automática

2. **Upload Real de Arquivos**
   - Integração com Amazon S3
   - Armazenamento local
   - Prévia de imagens

3. **Relatórios**
   - Exportação para PDF
   - Gráficos interativos
   - Dashboards personalizados

4. **Notificações**
   - Email automático
   - Push notifications
   - Alertas em tempo real

5. **Websockets**
   - Chat em tempo real
   - Atualizações automáticas
   - Presença online

6. **Testes Automatizados**
   - Testes unitários (pytest)
   - Testes de integração
   - Cobertura de código

## 🤝 Integração com Sistema de Exportação

Este sistema CRUD trabalha em paralelo com o sistema de exportação:

```
MariaDB (ixcprovedor)
        ↓ sync
PostgreSQL (zioncrm)
        ↓ read/write
    APIs CRUD
        ↓ display
   Frontend Web
```

- **Exportadores** sincronizam dados do MariaDB → PostgreSQL
- **APIs CRUD** permitem edição dos dados no PostgreSQL
- **Frontend** visualiza e modifica os dados sincronizados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs das APIs no terminal
2. Confira o Console do navegador (F12)
3. Teste os endpoints com curl
4. Verifique a conectividade com o banco

## 📄 Licença

Sistema desenvolvido para uso interno da Zion CRM.

---

**Desenvolvido com ❤️ para Zion CRM**

🚀 Versão: 1.0.0
📅 Data: 2024
