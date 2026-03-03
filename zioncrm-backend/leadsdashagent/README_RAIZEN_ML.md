# 🧠 RAIZEN ML SYSTEM - DOCUMENTAÇÃO COMPLETA

## Sistema de Machine Learning, Aprendizado Contínuo e Banco de Dados

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura)
3. [Instalação e Configuração](#instalação)
4. [Banco de Dados](#banco-de-dados)
5. [Sistema de Chat e Popups](#chat-popups)
6. [Sistema de Treinamento ML](#treinamento)
7. [Análise de Clientes](#análise-clientes)
8. [JSON Schemas](#json-schemas)
9. [Exemplos de Uso](#exemplos)

---

## 🎯 Visão Geral

O Raizen ML System é uma extensão completa do assistente Raizen que adiciona:

- ✅ **Machine Learning**: Aprendizado contínuo com feedback
- ✅ **Banco de Dados**: Armazenamento completo em MySQL (zioncrm)
- ✅ **Chat Inteligente**: Conversas com contexto e aprendizado
- ✅ **Sistema de Popups**: Notificações e aprovações
- ✅ **Treinamento Supervisionado**: Aprovação/rejeição de treinamentos
- ✅ **Análise de Clientes**: Predições de churn e engajamento
- ✅ **Insights Automáticos**: Geração de insights estratégicos
- ✅ **Logs Completos**: Rastreamento de todas atividades

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              (HTML/JS - Sua implementação)          │
└─────────────────┬───────────────────────────────────┘
                  │ JSON (HTTP/WebSocket)
┌─────────────────▼───────────────────────────────────┐
│           RAIZEN INTEGRATED                          │
│   (raizen_integrated.py - API Python)               │
├──────────────┬──────────────┬───────────────────────┤
│   Raizen     │   ML System  │   Database           │
│  Assistant   │              │   Manager            │
└──────┬───────┴──────┬───────┴──────┬───────────────┘
       │              │              │
       │    ┌─────────▼──────────────▼──────┐
       │    │     MySQL Database             │
       │    │        (zioncrm)               │
       │    │                                │
       │    │  - raizen_conversations       │
       │    │  - raizen_messages            │
       │    │  - raizen_chat_popups         │
       │    │  - raizen_training_data       │
       │    │  - raizen_training_deprecated │
       │    │  - raizen_ml_predictions      │
       │    │  - raizen_insights            │
       │    │  - raizen_customer_analysis   │
       │    │  - raizen_activity_logs       │
       │    │  - raizen_feedback            │
       │    │  - raizen_statistics          │
       │    └────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   APIs Externas (OpenAI, Google,     │
│   Anthropic)                         │
└──────────────────────────────────────┘
```

---

## 📦 Instalação

### 1. Requisitos

```bash
pip install mysql-connector-python requests
```

### 2. Configurar Banco de Dados

```bash
# Criar banco e tabelas
mysql -u root -p zioncrm < raizen_database_schema.sql
```

### 3. Configurar API Keys

```bash
# Windows
$env:OPENAI_API_KEY = "sua-chave"
$env:GOOGLE_API_KEY = "sua-chave"
$env:ANTHROPIC_API_KEY = "sua-chave"

# Linux/Mac
export OPENAI_API_KEY="sua-chave"
export GOOGLE_API_KEY="sua-chave"
export ANTHROPIC_API_KEY="sua-chave"
```

### 4. Arquivos do Sistema

- `raizen.py` - Assistente base
- `raizen_ml_system.py` - Sistema ML e banco de dados
- `raizen_integrated.py` - Integração completa
- `raizen_database_schema.sql` - Schema do banco
- `raizen_json_schemas.json` - Schemas de comunicação
- `raizen_config.json` - Configurações dos modelos

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### 1. raizen_conversations
Armazena conversas entre usuários e assistente.

```sql
CREATE TABLE raizen_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) UNIQUE,
    user_id INT,
    provider VARCHAR(50),
    model_id VARCHAR(100),
    total_messages INT,
    total_tokens INT,
    total_cost DECIMAL(10,6),
    created_at TIMESTAMP
);
```

#### 2. raizen_messages
Mensagens individuais das conversas.

```sql
CREATE TABLE raizen_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100),
    message_id VARCHAR(100) UNIQUE,
    role ENUM('system', 'user', 'assistant'),
    content TEXT,
    tokens_total INT,
    cost DECIMAL(10,6),
    timestamp TIMESTAMP
);
```

#### 3. raizen_chat_popups
Popups enviados aos usuários.

```sql
CREATE TABLE raizen_chat_popups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    popup_id VARCHAR(100) UNIQUE,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    popup_type ENUM('info', 'warning', 'success', 'error', 'question', 'training_approval'),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    requires_action BOOLEAN,
    status ENUM('pending', 'displayed', 'interacted', 'dismissed', 'expired'),
    created_at TIMESTAMP
);
```

#### 4. raizen_training_data
Dados de treinamento **APROVADOS**.

```sql
CREATE TABLE raizen_training_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_id VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    input_data JSON,
    expected_output JSON,
    model_output JSON,
    is_approved BOOLEAN,
    effectiveness_score DECIMAL(5,2),
    usage_count INT,
    approved_at TIMESTAMP
);
```

#### 5. raizen_training_deprecated
Treinamentos **REJEITADOS** (não podem ser usados).

```sql
CREATE TABLE raizen_training_deprecated (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_id VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    input_data JSON,
    rejection_reason TEXT,
    rejected_by INT,
    deprecation_type ENUM('rejected', 'obsolete', 'error', 'duplicate'),
    rejected_at TIMESTAMP
);
```

#### 6. raizen_ml_predictions
Predições do modelo ML.

```sql
CREATE TABLE raizen_ml_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prediction_id VARCHAR(100) UNIQUE,
    prediction_type VARCHAR(100),
    input_features JSON,
    prediction_result JSON,
    confidence_score DECIMAL(5,4),
    actual_outcome JSON,
    is_accurate BOOLEAN
);
```

#### 7. raizen_customer_analysis
Análises de clientes.

```sql
CREATE TABLE raizen_customer_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id VARCHAR(100),
    customer_id INT,
    analysis_type VARCHAR(100),
    score DECIMAL(5,2),
    risk_level ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
    recommendations JSON,
    is_current BOOLEAN
);
```

### Views Úteis

```sql
-- Conversas por usuário
SELECT * FROM v_raizen_user_conversation_stats;

-- Treinamentos aprovados
SELECT * FROM v_raizen_approved_trainings;

-- Popups pendentes
SELECT * FROM v_raizen_pending_popups;

-- Insights ativos
SELECT * FROM v_raizen_active_insights;

-- Clientes de alto risco
SELECT * FROM v_raizen_high_risk_customers;
```

---

## 💬 Sistema de Chat e Popups

### Uso do Chat

```python
from raizen_integrated import RaizenIntegrated

raizen = RaizenIntegrated(
    db_host='localhost',
    db_user='root',
    db_password='senha',
    db_name='zioncrm'
)

raizen.set_user(1, "João Silva")

# Chat com aprendizado
response = raizen.chat(
    message="Analise minha campanha de email marketing",
    provider='google',
    model_id='gemini-1.5-flash',
    learn_from_interaction=True
)

print(response['response'])
print(f"Aprendizado aplicado: {response['learning_applied']}")
```

### JSON de Resposta

```json
{
  "success": true,
  "conversation_id": "uuid-da-conversa",
  "response": "Análise da campanha...",
  "model": {
    "provider": "google",
    "model_id": "gemini-1.5-flash"
  },
  "tokens": {
    "input": 50,
    "output": 300,
    "total": 350
  },
  "cost": 0.0001,
  "response_time_ms": 1250,
  "learning_applied": true,
  "trainings_used": 3
}
```

### Gerenciamento de Popups

```python
# Buscar popups pendentes
popups = raizen.get_pending_popups()

# Responder a popup (aprovar treinamento)
response = raizen.respond_to_popup(
    popup_id="popup-uuid",
    action="approve",
    data={"feedback_score": 0.95}
)

# Rejeitar treinamento
response = raizen.respond_to_popup(
    popup_id="popup-uuid",
    action="reject",
    response="Dados inconsistentes"
)
```

### JSON de Popup

```json
{
  "popup_id": "uuid",
  "title": "Novo Treinamento: marketing_analysis",
  "message": "Um novo treinamento foi gerado...",
  "popup_type": "training_approval",
  "priority": "high",
  "requires_action": true,
  "action_type": "approve_training",
  "action_data": {
    "training_id": "training-uuid",
    "category": "marketing_analysis"
  },
  "buttons": [
    {"label": "Aprovar", "action": "approve", "style": "primary"},
    {"label": "Rejeitar", "action": "reject", "style": "danger"}
  ],
  "expires_at": "2026-02-20T10:00:00"
}
```

---

## 🎓 Sistema de Treinamento ML

### Fluxo de Treinamento

```
1. Interação do Usuário
       ↓
2. Sistema detecta padrão útil
       ↓
3. Cria candidato a treinamento
       ↓
4. Popup de aprovação enviado ao operador
       ↓
5. Operador decide:
   ├─ Aprovar → raizen_training_data
   └─ Rejeitar → raizen_training_deprecated
       ↓
6. Treinamentos aprovados são
   usados em futuras interações
```

### Aprovar Treinamento

```python
# Via popup
raizen.respond_to_popup(
    popup_id="popup-uuid",
    action="approve",
    data={"feedback_score": 0.9}
)

# Direto
from raizen_ml_system import RaizenMLSystem, RaizenDatabase

db = RaizenDatabase('localhost', 'root', 'senha', 'zioncrm')
db.connect()
ml = RaizenMLSystem(db)
ml.set_current_user(1, "Admin")

# Aprovar
ml.approve_training("training-uuid", feedback_score=0.95)

# Rejeitar
ml.reject_training(
    "training-uuid",
    rejection_reason="Dados imprecisos",
    deprecation_type="rejected"
)
```

### Buscar Treinamentos Aprovados

```python
# Por categoria
trainings = ml.get_approved_trainings(category='marketing_analysis')

# Todos
all_trainings = ml.get_approved_trainings()

for t in trainings:
    print(f"ID: {t['training_id']}")
    print(f"Efetividade: {t['effectiveness_score']}")
    print(f"Usado {t['usage_count']} vezes")
```

### Estrutura de Treinamento

```json
{
  "training_id": "uuid",
  "category": "marketing_analysis",
  "subcategory": "campaign_performance",
  "input_data": {
    "campaign": "Email Q1",
    "opens": 2500,
    "clicks": 500
  },
  "expected_output": {
    "recommendation": "Increase email frequency",
    "predicted_improvement": "15%"
  },
  "model_output": {
    "response": "Análise completa..."
  },
  "is_approved": true,
  "effectiveness_score": 85.50,
  "usage_count": 12,
  "approved_by": 1,
  "approved_at": "2026-02-18T10:30:00"
}
```

---

## 👥 Análise de Clientes

### Analisar Cliente

```python
customer_data = {
    'customer_id': 123,
    'last_purchase_days': 90,
    'total_purchases': 5,
    'total_value': 1500,
    'engagement_score': 45,
    'email_opens': 10,
    'support_tickets': 2
}

# Análise de churn
analysis = raizen.analyze_customer(
    customer_id=123,
    customer_data=customer_data,
    analysis_types=['churn_risk', 'engagement', 'lifetime_value']
)

print(f"Score de risco: {analysis['analyses'][0]['score']}")
print(f"Nível de risco: {analysis['analyses'][0]['risk_level']}")
```

### Buscar Clientes de Alto Risco

```python
high_risk = raizen.get_high_risk_customers()

for customer in high_risk['customers']:
    print(f"Cliente #{customer['customer_id']}")
    print(f"Risco: {customer['risk_level']} ({customer['score']})")
    print(f"Prioridade: {customer['intervention_priority']}/10")
    print(f"Recomendações: {customer['recommendations']}")
```

### Popup Automático para Alto Risco

Quando um cliente é identificado como alto risco, um popup urgente é criado automaticamente:

```json
{
  "title": "⚠️ Cliente em Risco: ID 123",
  "message": "Cliente com risco very_high\nScore: 85.50\n\nAção imediata recomendada!",
  "popup_type": "warning",
  "priority": "urgent",
  "requires_action": true,
  "action_data": {
    "customer_id": 123,
    "risk_level": "very_high",
    "recommendations": [...]
  }
}
```

---

## 📊 Dashboard e Estatísticas

### Dados Completos do Dashboard

```python
dashboard = raizen.get_dashboard_data()

# Resumo
print(dashboard['summary'])
# {
#   'total_conversations': 150,
#   'total_tokens': 50000,
#   'total_cost': 2.50,
#   'active_insights': 5,
#   'pending_popups': 3,
#   'high_risk_customers': 8,
#   'ml_enabled': true
# }

# Atividades recentes
print(dashboard['recent_activity'])

# Insights principais
print(dashboard['top_insights'])

# Alertas
for alert in dashboard['alerts']:
    print(f"{alert['severity']}: {alert['message']}")
```

---

## 📄 JSON Schemas

Todos os schemas de comunicação estão em `raizen_json_schemas.json`:

### Frontend → Python (Enviar Mensagem)

```json
{
  "message": "Analise minha campanha",
  "provider": "openai",
  "model_id": "gpt-4o-mini",
  "user_id": 1,
  "user_name": "João"
}
```

### Python → Frontend (Resposta)

```json
{
  "success": true,
  "conversation_id": "uuid",
  "response": "Análise...",
  "tokens": {"input": 50, "output": 300},
  "cost": 0.0001,
  "learning_applied": true
}
```

### Frontend → Python (Aprovar Treinamento)

```json
{
  "training_id": "uuid",
  "action": "approve",
  "feedback_score": 0.95
}
```

### Python ↔ Banco de Dados

Todos os dados são automaticamente convertidos entre Python e MySQL:

- Python Dict → MySQL JSON
- Python datetime → MySQL TIMESTAMP
- Python Decimal → MySQL DECIMAL
- Python bool → MySQL BOOLEAN

---

## 🔧 Exemplos Completos

### 1. Chat Completo com Aprendizado

```python
from raizen_integrated import RaizenIntegrated

# Inicializar
raizen = RaizenIntegrated(
    db_host='localhost',
    db_user='root',
    db_password='senha'
)

raizen.set_user(1, "Operador")

# Primeira interação
r1 = raizen.chat(
    message="Quais as melhores estratégias para captação de clientes?",
    provider='google',
    model_id='gemini-1.5-flash'
)

print(r1['response'])

# Segunda interação (com contexto)
r2 = raizen.chat(
    message="E para o segmento B2B especificamente?",
    provider='google',
    model_id='gemini-1.5-flash'
)

print(r2['response'])
print(f"Treinamentos usados: {r2['trainings_used']}")
```

### 2. Fluxo Completo de Treinamento

```python
# Sistema detecta padrão
# Cria treinamento automaticamente
# Popup é enviado

# Operador busca popups
popups = raizen.get_pending_popups()
training_popup = popups['popups'][0]

# Operador revisa e aprova
raizen.respond_to_popup(
    popup_id=training_popup['popup_id'],
    action='approve',
    data={'feedback_score': 0.90}
)

# Treinamento agora está ativo e será usado
# nas próximas interações relevantes
```

### 3. Análise e Intervenção em Cliente

```python
# Analisar cliente
analysis = raizen.analyze_customer(
    customer_id=456,
    customer_data={
        'last_purchase_days': 120,
        'engagement_score': 25
    }
)

# Se alto risco, popup é criado automaticamente
popups = raizen.get_pending_popups()
# Popup urgente de cliente em risco aparece

# Operador toma ação
raizen.respond_to_popup(
    popup_id=popups['popups'][0]['popup_id'],
    action='take_action',
    data={'action': 'contact_customer'}
)
```

### 4. Dashboard em Tempo Real

```python
import time

while True:
    dashboard = raizen.get_dashboard_data()
    
    print(f"\n=== DASHBOARD ==")
    print(f"Conversas: {dashboard['summary']['total_conversations']}")
    print(f"Popups pendentes: {dashboard['summary']['pending_popups']}")
    print(f"Clientes risco: {dashboard['summary']['high_risk_customers']}")
    
    for alert in dashboard['alerts']:
        print(f"⚠️ {alert['message']}")
    
    time.sleep(30)  # Atualiza a cada 30s
```

---

## 🔐 Segurança

- Todas as senhas devem ser armazenadas de forma segura
- Use variáveis de ambiente para API keys
- Configure permissões adequadas no MySQL
- Valide todos os inputs do frontend
- Use HTTPS em produção

---

## 📈 Otimização

### Índices do Banco

Já incluídos no schema:
- Índices em chaves estrangeiras
- Índices compostos para queries comuns
- Índices em campos de busca frequente

### Performance

- Cache de treinamentos aprovados
- Batch operations para múltiplos registros
- Limpeza automática de dados antigos (sp_raizen_cleanup_old_data)

---

## 🆘 Troubleshooting

### Erro de Conexão ao Banco

```python
# Verificar conexão
db = RaizenDatabase('localhost', 'root', 'senha')
if db.connect():
    print("Conectado!")
else:
    print("Falha na conexão")
```

### Treinamento não sendo aplicado

```python
# Verificar se está aprovado
trainings = ml.get_approved_trainings(category='sua_categoria')
print(f"Treinamentos aprovados: {len(trainings)}")

# Verificar se aprendizado está ativo
raizen.toggle_learning(True)
```

### Popups não aparecendo

```python
# Verificar popups pendentes
popups = ml.get_pending_popups()
for p in popups:
    print(f"{p['title']} - Status: {p['status']}")
```

---

## 📚 Referências

- [README_RAIZEN.md](README_RAIZEN.md) - Documentação do assistente base
- [RAIZEN_MODELOS.md](RAIZEN_MODELOS.md) - Lista de todos os 50 modelos
- [QUICKSTART_RAIZEN.md](QUICKSTART_RAIZEN.md) - Guia rápido de início
- [raizen_json_schemas.json](raizen_json_schemas.json) - Schemas completos

---

## ✅ Checklist de Implementação

- [ ] Banco de dados criado (executar raizen_database_schema.sql)
- [ ] Dependências instaladas (mysql-connector-python, requests)
- [ ] API Keys configuradas
- [ ] Conexão ao banco testada
- [ ] Primeiro chat funcionando
- [ ] Popups aparecendo
- [ ] Treinamento aprovado/rejeitado
- [ ] Análise de cliente funcionando
- [ ] Dashboard carregando

---

**Sistema Raizen ML completo e pronto para uso! 🚀**

Para dúvidas ou suporte, consulte os exemplos em `raizen_integrated.py`.
