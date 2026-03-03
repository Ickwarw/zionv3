# 🚀 Quick Start - Zion CRM CRUD

## ⚡ Início Rápido (3 minutos)

### 1️⃣ Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2️⃣ Iniciar o Sistema

**Windows:**
```bash
start_crud.bat
```

**Linux/Mac:**
```bash
python start_crud_apis.py
```

### 3️⃣ Acessar Interface

O navegador abrirá automaticamente em:
```
http://localhost:5001/static/crud.html
```

## ✅ Isso é TUDO!

O sistema está pronto para uso. Você terá acesso a:

- ✅ Gerenciamento de Leads
- ✅ Gerenciamento de Contratos
- ✅ Gerenciamento de Arquivos
- ✅ Sistema de Chamados
- ✅ Chat/Mensagens
- ✅ Gerenciamento de Usuários

## 🎯 Primeiros Passos

### Criar seu Primeiro Lead

1. Clique na aba **"👥 Leads"**
2. Clique em **"➕ Novo Lead"**
3. Preencha:
   - Razão Social (obrigatório)
   - CPF/CNPJ (obrigatório)
   - Email, telefone, endereço
4. Clique em **"➕ Criar Lead"**

### Criar seu Primeiro Chamado

1. Clique na aba **"🎫 Chamados"**
2. Clique em **"➕ Novo Chamado"**
3. Preencha:
   - ID do Cliente
   - Assunto
   - Descrição
   - Prioridade
4. Clique em **"➕ Abrir Chamado"**

### Adicionar Mensagens a um Chamado

1. Clique na aba **"💬 Mensagens"**
2. Digite o ID do chamado
3. Clique em **"🔍 Buscar Mensagens"**
4. Clique em **"➕ Nova Mensagem"**
5. Digite a mensagem e envie

## 📊 URLs Úteis

### Frontend
```
http://localhost:5001/static/crud.html
```

### APIs Diretas
```
http://localhost:5001/api/leads
http://localhost:5001/api/leads/stats
http://localhost:5002/api/contratos
http://localhost:5003/api/chamados
http://localhost:5003/api/chamados/stats
```

### Health Checks
```
http://localhost:5001/api/leads/health
http://localhost:5002/api/attributes/health
http://localhost:5003/api/infos/health
```

## 🔧 Testar com CURL

### Criar Lead
```bash
curl -X POST http://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -d '{"razao":"Teste", "cnpj_cpf":"123456"}'
```

### Listar Leads
```bash
curl http://localhost:5001/api/leads
```

### Ver Estatísticas
```bash
curl http://localhost:5001/api/leads/stats
```

## 🛑 Parar o Sistema

**Windows:**
- Feche as janelas dos servidores

**Linux/Mac:**
- Pressione `CTRL+C` no terminal

## 📚 Documentação Completa

Veja [README_CRUD.md](README_CRUD.md) para:
- Lista completa de endpoints
- Exemplos avançados de uso
- Troubleshooting
- Configurações
- Segurança

## 🆘 Problemas?

### Porta em uso
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID [numero] /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9
```

### Erro de banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais em cada arquivo .py
- Teste: `psql -h 45.160.180.34 -U zioncrm -d zioncrm`

### APIs não respondem
```bash
# Reinstalar dependências
pip install --upgrade -r requirements.txt

# Testar cada API individualmente
python lead.py        # Terminal 1
python leadatributes.py  # Terminal 2
python leadinfos.py   # Terminal 3
```

## 🎓 Próximos Passos

1. **Explore a Interface** - Navegue pelas abas e experimente criar registros
2. **Teste as Buscas** - Use a busca para filtrar leads
3. **Veja Estatísticas** - Confira os cards de estatísticas
4. **Crie Chamados** - Simule um fluxo de suporte
5. **Adicione Mensagens** - Teste o sistema de chat

## 💡 Dicas

- 🔍 Use a busca nos leads digitando pelo menos 3 caracteres
- 📄 Navegue entre páginas com os botões de paginação
- 🔄 Clique em "Atualizar" para recarregar os dados
- 📊 Estatísticas são atualizadas automaticamente
- ⚠️ Confirmação é solicitada antes de deletar registros

---

**Pronto! Você está pronto para usar o Zion CRM! 🚀**
