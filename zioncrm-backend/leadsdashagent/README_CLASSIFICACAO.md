# 🎯 Sistema de Classificação Avançada de Leads

## 📋 Visão Geral

Sistema completo de classificação automática e manual de leads com 7 níveis de prioridade, rastreamento de status de vendas/pós-vendas, níveis de satisfação, status financeiro, e integração multi-canal (Facebook, WhatsApp, Telefone).

---

## 🎨 Funcionalidades Implementadas

### 1. **Sistema de Classificação em 7 Níveis de Prioridade (Temperatura)**

| Prioridade | Descrição | Badge Visual |
|------------|-----------|--------------|
| **NovaLead** | Lead recém-cadastrada, sem interação | 🆕 Verde claro |
| **Ruim** | Lead sem potencial identificado | ⚫ Cinza |
| **Fria** | Lead com baixo interesse | ❄️ Azul claro |
| **Morna** | Lead com interesse moderado | 🌡️ Laranja claro |
| **Quente** | Lead com alto interesse | 🔥 Laranja |
| **MuitoQuente** | Lead com altíssimo interesse | 🔥🔥 Laranja escuro |
| **Queimando** | Lead urgente, requer ação imediata | 🔥🔥🔥 Vermelho |

### 2. **Status de Vendas (10 estados)**

- 🆕 **NovaLeadVendas** - Nova lead no setor de vendas
- 📞 **Contato** - Primeiro contato realizado
- ✅ **Qualificacao** - Lead qualificada
- 📄 **Proposta** - Proposta enviada
- 💬 **Negociacao** - Em negociação
- ⏳ **AguardandoAssinatura** - Aguardando assinatura do contrato
- 🎉 **GanhaSucesso** - Venda concretizada
- ❌ **Perdida** - Oportunidade perdida
- 🔄 **Recuperar** - Cliente inativo a ser recuperado
- 🚫 **SemInteresse** - Lead sem interesse

### 3. **Status Pós-Venda (11 estratégias)**

- 👤 **AcompanhamentoPersonalizado** - Acompanhamento dedicado
- 📚 **TreinamentoSuporte** - Suporte e treinamento
- 🎁 **ProgramasDeFidelidade** - Programas de fidelização
- 🙏 **AcoesDeAgradecimento** - Ações de reconhecimento
- 📊 **AnaliseDeUsoEFeedback** - Análise de uso
- 😊 **AtivasSatisfeitas** - Clientes ativos satisfeitos
- 😟 **AtivasInsatisfeitas** - Clientes ativos insatisfeitos
- 🔧 **RecuperarSatisfacao** - Recuperação de satisfação
- 📈 **UpsellCrossSell** - Oferta de novos produtos
- ⚡ **AtendimentoRapido** - Prioridade no atendimento
- 🤝 **RelacionamentoDeLongoPrazo** - Foco em relacionamento

### 4. **Nível de Contentamento (5 níveis)**

- ⭐⭐⭐⭐⭐ **Excelente** (5 estrelas)
- ⭐⭐⭐⭐ **Bom** (4 estrelas)
- ⭐⭐⭐ **Regular** (3 estrelas)
- ⭐⭐ **Ruim** (2 estrelas)
- ⭐ **Péssimo** (1 estrela)

### 5. **Status Financeiro**

- ✅ **EmDia** - Pagamentos em dia
- ⚠️ **EmAtraso** - Pagamentos atrasados

### 6. **Canais de Comunicação (Origem)**

- 📄 **Panfleto** - Divulgação impressa
- 📞 **Telefone** - Contato telefônico
- 📧 **Email** - E-mail marketing
- 💬 **WhatsApp** - Mensagem WhatsApp
- 📷 **Instagram** - Rede social Instagram
- 📘 **Facebook** - Rede social Facebook
- 🔍 **Google** - Pesquisa Google/Ads
- 🐦 **Twitter** - Rede social Twitter
- 🏪 **Loja** - Visita presencial

### 7. **Sistema de Score (0-100)**

- 🟢 **Score Alto (60-100)** - Lead de alta qualidade
- 🟡 **Score Médio (30-59)** - Lead com potencial
- 🔴 **Score Baixo (0-29)** - Lead necessita qualificação

---

## 🔄 Lógica de Classificação Automática

### Regras Implementadas em `leadatributes.py`

```python
def classify_lead_by_contract_status(id_cliente):
    """
    Classifica automaticamente a lead baseado no status do contrato
    """
    
    # 1. SEM CONTRATO → Vendas (Nova Lead)
    if not has_contract:
        departamento = "vendas"
        prioridade = "NovaLead"
        status_vendas = "NovaLeadVendas"
    
    # 2. CONTRATO ATIVO → Pós-Venda
    elif contract_status == 'A':
        departamento = "pos_venda"
        satisfaction = get_customer_satisfaction(id_cliente)
        
        if satisfaction >= 4:
            status_pos_venda = "AtivasSatisfeitas"
            prioridade = "Quente"
        else:
            status_pos_venda = "AtivasInsatisfeitas"
            prioridade = "MuitoQuente"  # Requer atenção urgente
    
    # 3. CONTRATO CANCELADO → Vendas (Recuperar)
    elif contract_status == 'C':
        departamento = "vendas"
        prioridade = "MuitoQuente"  # Alta prioridade
        status_vendas = "Recuperar"
```

---

## 🚀 Como Usar

### **No Frontend (crud.html)**

#### **Classificação Manual Individual**
```
1. Acesse a aba "Leads"
2. Na listagem, clique no botão "🎯 Classificar" da lead desejada
3. Confirme a ação
4. A lead será automaticamente classificada baseada no status do contrato
```

#### **Classificação em Massa**
```
1. Clique no botão "🎯 Classificar Todas" no topo da página
2. Confirme a ação (pode levar alguns minutos)
3. Todas as leads serão reclassificadas
```

#### **Edição Manual de Classificação**
```
1. Clique no botão "✏️ Editar" na lead
2. Role até a seção "🎯 Classificação da Lead"
3. Ajuste manualmente os campos:
   - Prioridade (Temperatura)
   - Departamento (Vendas/Pós-Venda)
   - Status de Vendas
   - Status Pós-Venda
   - Nível de Contentamento
   - Status Financeiro
   - Origem/Canal
   - Score (0-100)
4. Clique em "💾 Salvar Alterações"
```

### **Na API (leadatributes.py)**

#### **Endpoint: Classificar Lead Individual**
```bash
POST http://localhost:5002/api/leads/classify/<id_cliente>

# Resposta
{
    "success": true,
    "data": {
        "departamento": "vendas",
        "prioridade": "Recuperar",
        "status_vendas": "Recuperar",
        "status_pos_venda": null,
        "nivel_contentamento": null,
        "score": 75
    }
}
```

#### **Endpoint: Classificar Todas as Leads**
```bash
POST http://localhost:5002/api/leads/classify-all

# Resposta
{
    "success": true,
    "classified": 145,
    "message": "145 leads classificadas com sucesso"
}
```

#### **Endpoint: Filtrar por Departamento**
```bash
GET http://localhost:5001/api/leads/by-department/vendas
GET http://localhost:5001/api/leads/by-department/pos_venda
```

#### **Endpoint: Filtrar por Prioridade**
```bash
GET http://localhost:5001/api/leads/by-priority/Queimando
GET http://localhost:5001/api/leads/by-priority/MuitoQuente
```

#### **Endpoint: Estatísticas Avançadas**
```bash
GET http://localhost:5001/api/leads/stats/advanced

# Resposta
{
    "success": true,
    "data": {
        "total": 500,
        "by_department": {
            "vendas": 300,
            "pos_venda": 200
        },
        "by_priority": {
            "Queimando": 25,
            "MuitoQuente": 50,
            "Quente": 100,
            ...
        },
        "by_status_vendas": {...},
        "by_status_pos_venda": {...},
        "average_score": 65
    }
}
```

---

## ⚙️ Configurações Necessárias

### **1. Migração do Banco de Dados**

Execute o script SQL para adicionar as novas colunas:

```bash
psql -h 45.160.180.34 -p 5432 -U zioncrm -d zioncrm -f migration_lead_classification.sql
```

Ou no pgAdmin/DBeaver, execute o conteúdo de [migration_lead_classification.sql](migration_lead_classification.sql).

### **2. Configurar Tabela de Satisfação do Cliente**

Edite `leadatributes.py` linha ~169:

```python
SATISFACTION_CONFIG = {
    "table_name": "cliente_satisfacao",              # ← SEU NOME DE TABELA
    "column_id_cliente": "id_cliente",               # ← COLUNA FK PARA CLIENTE
    "column_rating": "nota",                         # ← COLUNA COM NOTA (1-5)
    "column_feedback": "comentario",                 # ← COLUNA COM FEEDBACK
    "column_date": "data_avaliacao",                 # ← COLUNA COM DATA
}
```

### **3. Configurar Facebook Lead Ads (Opcional)**

Edite `leadatributes.py` linha ~162:

```python
FACEBOOK_CONFIG = {
    "page_access_token": "SEU_TOKEN_AQUI",           # Facebook Business Manager
    "verify_token": "meu_token_secreto_123",         # Token customizado
    "app_secret": "SEU_APP_SECRET_AQUI",             # Facebook App Dashboard
}
```

**Passos no Facebook:**
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um App → Adicione produto "Webhooks"
3. Configure webhook URL: `https://seu-servidor.com/api/leads/facebook-webhook`
4. Inscreva-se em eventos de `leadgen`
5. Copie os tokens para `FACEBOOK_CONFIG`

### **4. Configurar WhatsApp/Phone (Opcional)**

Edite `leadatributes.py` linhas ~178-189:

```python
WHATSAPP_CONFIG = {
    "enabled": True,
    "webhook_url": "https://api.whatsapp.com/...",
    "api_token": "SEU_TOKEN_WHATSAPP",
}

PHONE_INTEGRATION = {
    "enabled": True,
    "pbx_api_url": "https://seu-pbx.com/api",
    "api_key": "SUA_CHAVE_PBX",
}
```

---

## 📊 Visualização no Dashboard

### **Cards de Estatísticas**

O dashboard exibe cards coloridos com:

- 📈 **Total de Leads**
- 💼 **Departamento Vendas** (azul)
- ✅ **Departamento Pós-Venda** (verde)
- 🎯 **Score Médio** (0-100)
- 🔥 **Leads Prioritárias** (Queimando + Muito Quente)

### **Tabela de Leads**

Colunas exibidas:
- **ID** - Identificador único
- **Razão** - Nome da empresa/pessoa
- **CPF/CNPJ** - Documento
- **Email** - E-mail
- **Telefone** - Contato
- **Cidade** - Localização
- **Prioridade** - Badge colorido (NovaLead → Queimando)
- **Departamento** - Badge (Vendas/Pós-Venda)
- **Score** - Score colorido (0-100)
- **Status** - Ativo/Inativo
- **Ações** - Editar, Classificar, Deletar

---

## 🔗 Integração com Sistema de Exportação

### **Sincronização Automática**

Para ativar a classificação automática após cada sincronização de contratos:

**Edite `zionexportatributes.py`** (ou seu script de sincronização):

```python
import requests

def after_contract_sync(id_cliente):
    """
    Chama após sincronizar contratos de um cliente
    """
    try:
        response = requests.post(
            f'http://localhost:5002/api/sync/verify-and-classify',
            json={'id_cliente': id_cliente}
        )
        result = response.json()
        if result.get('success'):
            print(f"Lead {id_cliente} classificada: {result['data']['departamento']}")
    except Exception as e:
        print(f"Erro ao classificar lead {id_cliente}: {e}")

# Adicione esta chamada no final da função que sincroniza contratos
# Exemplo:
def sync_contracts():
    for contract in contracts:
        # ... seu código de sincronização ...
        
        # Após sincronizar, classifica a lead
        after_contract_sync(contract['id_cliente'])
```

---

## 🧪 Como Testar

### **1. Teste Manual no Frontend**

```bash
# 1. Inicie as APIs
python lead.py          # Porta 5001
python leadatributes.py # Porta 5002

# 2. Acesse no navegador
http://localhost:5001/crud

# 3. Teste o fluxo:
   a) Criar nova lead (botão "➕ Novo Lead")
   b) Classificar automaticamente (botão "🎯 Classificar")
   c) Editar classificação manualmente (botão "✏️ Editar")
   d) Visualizar badges coloridos na tabela
```

### **2. Teste via CURL**

```bash
# Classificar lead específica
curl -X POST http://localhost:5002/api/leads/classify/123

# Classificar todas as leads
curl -X POST http://localhost:5002/api/leads/classify-all

# Buscar leads do departamento de vendas
curl http://localhost:5001/api/leads/by-department/vendas

# Buscar leads com prioridade "Queimando"
curl http://localhost:5001/api/leads/by-priority/Queimando

# Estatísticas avançadas
curl http://localhost:5001/api/leads/stats/advanced
```

### **3. Teste de Integração Facebook**

```bash
# Simular webhook do Facebook
curl -X POST http://localhost:5002/api/leads/facebook-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "leadgen_id": "123456789",
          "created_time": 1234567890,
          "field_data": [
            {"name": "full_name", "values": ["João Silva"]},
            {"name": "email", "values": ["joao@email.com"]},
            {"name": "phone_number", "values": ["11999887766"]}
          ]
        }
      }]
    }]
  }'
```

---

## 📁 Arquivos Modificados/Criados

### **Arquivos Modificados:**

1. **`leadatributes.py`** (~1039 linhas)
   - ✅ Adicionadas 6 categorias de classificação (44+ opções)
   - ✅ Implementada lógica de classificação automática
   - ✅ Criados 7 novos endpoints REST
   - ✅ Configurações para Facebook, WhatsApp, Phone, Satisfaction

2. **`lead.py`** (~667 linhas)
   - ✅ SELECT queries atualizadas com 9 novos campos
   - ✅ Campos de classificação adicionados em POST/PUT
   - ✅ 4 novos endpoints (filtros e estatísticas)
   - ✅ Roteamento para frontend

3. **`static/crud.html`** (~1833 linhas)
   - ✅ Formulário expandido com seção de classificação
   - ✅ Badges coloridos (prioridade, departamento, score)
   - ✅ Botões "Classificar" e "Classificar Todas"
   - ✅ Funções JavaScript: `classifyLead()`, `classifyAllLeads()`, `editLead()`
   - ✅ Estilo `.btn-info` para botões de classificação
   - ✅ Suporte completo a edição com preenchimento automático

### **Arquivos Criados:**

1. **`migration_lead_classification.sql`** (82 linhas)
   - ✅ ALTER TABLE para adicionar 9 colunas
   - ✅ Índices em prioridade, status, departamento, score
   - ✅ Comentários descritivos em todas as colunas

2. **`README_CLASSIFICACAO.md`** (este arquivo)
   - ✅ Documentação completa do sistema
   - ✅ Guia de uso e configuração
   - ✅ Exemplos de requisições API

---

## 🎯 Próximos Passos

### **Ações Imediatas (Obrigatórias)**

- [ ] **1. Executar migração SQL** → Adicionar colunas no banco
- [ ] **2. Configurar SATISFACTION_CONFIG** → Preencher tabela/colunas de satisfação
- [ ] **3. Reiniciar APIs** → `python lead.py` e `python leadatributes.py`
- [ ] **4. Testar no frontend** → Criar/editar/classificar uma lead de teste

### **Configurações Opcionais**

- [ ] **5. Configurar Facebook Lead Ads** → Se usar Facebook para captura
- [ ] **6. Configurar WhatsApp** → Se usar WhatsApp para captura
- [ ] **7. Configurar Phone/PBX** → Se usar telefone para captura
- [ ] **8. Integrar com sincronização** → Adicionar classificação após sync de contratos

### **Melhorias Futuras (Sugestões)**

- [ ] Sistema de notificações por e-mail quando lead fica "Queimando"
- [ ] Dashboard com gráficos de conversão (Plotly/Chart.js)
- [ ] Histórico de mudanças de classificação (auditoria)
- [ ] Machine Learning para prever probabilidade de conversão
- [ ] Integração com CRM externo (RD Station, Pipedrive, etc.)
- [ ] Relatórios exportáveis (PDF/Excel)

---

## ❓ Troubleshooting

### **Erro: Coluna não existe**
```
psycopg2.errors.UndefinedColumn: column "prioridade" does not exist
```
**Solução:** Execute o script `migration_lead_classification.sql`.

### **Erro: Não consegue classificar lead**
```
Error: Cannot read satisfaction data
```
**Solução:** Configure `SATISFACTION_CONFIG` em `leadatributes.py` com tabela/colunas corretas.

### **Erro: Facebook webhook não funciona**
```
Error: Invalid verify token
```
**Solução:** 
1. Configure `FACEBOOK_CONFIG` com tokens válidos
2. Verifique se a URL do webhook está acessível publicamente (use ngrok para testes locais)

### **Erro: Badges não aparecem coloridos**
**Solução:** Limpe o cache do navegador (Ctrl+Shift+R) e recarregue.

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs das APIs: `python lead.py` e `python leadatributes.py`
2. Confira os erros no console do navegador (F12 → Console)
3. Revise as configurações em `leadatributes.py` (linhas 162-189)
4. Execute queries SQL manualmente para testar conexão

---

## 🏆 Resumo do Sistema

✅ **44+ opções de classificação** distribuídas em 7 categorias  
✅ **Classificação automática** baseada em status de contrato e satisfação  
✅ **Dashboard visual** com badges coloridos e estatísticas  
✅ **3 integrações** prontas (Facebook, WhatsApp, Phone)  
✅ **10 novos endpoints** REST para classificação e filtros  
✅ **Interface completa** para edição manual de todos os campos  
✅ **Sincronização inteligente** com sistema de contratos  
✅ **Totalmente configurável** via arquivos de configuração  

---

**🚀 Sistema pronto para produção após configuração inicial!**
