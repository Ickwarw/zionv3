# 📊 Zion Monitor - Sistema de Monitoramento e Logging

Sistema completo de monitoramento em tempo real com dashboard web para visualizar logs, conectividade e status das exportações.

## 🚀 Componentes

### 1. **zionmonitor.py**
Módulo central de monitoramento que:
- Rastreia conectividade MySQL/MariaDB e PostgreSQL
- Registra logs de todos os exportadores
- Coleta métricas de performance
- Mantém histórico de erros
- Salva estado automaticamente

### 2. **zionapi.py**
API Flask RESTful que expõe:
- Status de conectividade dos bancos
- Informações detalhadas das exportações
- Logs filtráveis por nível e exportador
- Estatísticas gerais do sistema
- Dashboard web interativo

### 3. **dashboard.html**
Interface web moderna que exibe:
- Status de conectividade em tempo real
- Métricas de cada exportação
- Logs do sistema com filtros
- Atualização automática a cada 5 segundos

## 📋 Pré-requisitos

```bash
pip install -r requirements.txt
```

Dependências adicionadas:
- `flask>=2.3.0` - Framework web
- `flask-cors>=4.0.0` - CORS para requisições cross-origin

## 🎯 Como Usar

### Opção 1: Usar o Arquivo Batch (Recomendado)

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Iniciar a API (abre o dashboard automaticamente)
start_api.bat

# 3. Abrir navegador em: http://localhost:5000
```

### Opção 2: Linha de Comando

```bash
# Iniciar API Flask
python zionapi.py
```

Acesse o dashboard em: http://localhost:5000

### Opção 3: Integração Completa

```bash
# Terminal 1: Iniciar API
python zionapi.py

# Terminal 2: Iniciar exportadores
python zionmanager.py
```

## 📡 Endpoints da API

### Conectividade

```
GET /api/connectivity              # Status de ambos os bancos
POST /api/connectivity/check       # Força verificação
GET /api/connectivity/mysql        # Status apenas MySQL
GET /api/connectivity/postgres     # Status apenas PostgreSQL
```

### Exportações

```
GET /api/exports                   # Todas as exportações
GET /api/exports/<name>            # Exportação específica
GET /api/exports/<name>/tables     # Tabelas de uma exportação
GET /api/exports/<name>/errors     # Erros de uma exportação
```

### Logs

```
GET /api/logs                      # Todos os logs
    ?limit=100                     # Limita quantidade
    ?level=ERROR                   # Filtra por nível
    ?export=zionexport            # Filtra por exportador

GET /api/logs/errors               # Apenas erros
GET /api/logs/warnings             # Apenas avisos
```

### Dashboard e Stats

```
GET /api/dashboard                 # Dados completos do dashboard
GET /api/stats                     # Estatísticas gerais
```

### Health Check

```
GET /api/health                    # Health check da API
GET /api/ping                      # Ping simples
```

## 📊 Exemplo de Resposta da API

### GET /api/connectivity

```json
{
  "success": true,
  "data": {
    "mysql": {
      "status": "connected",
      "last_check": "2026-02-16T14:30:00",
      "avg_response_time": 0.023,
      "successful_checks": 150,
      "failed_checks": 2
    },
    "postgres": {
      "status": "connected",
      "last_check": "2026-02-16T14:30:00",
      "avg_response_time": 0.018,
      "successful_checks": 152,
      "failed_checks": 0
    }
  }
}
```

### GET /api/exports/zionexport

```json
{
  "success": true,
  "data": {
    "status": "running",
    "start_time": "2026-02-16T10:00:00",
    "last_sync": "2026-02-16T14:30:00",
    "total_syncs": 523,
    "total_records": 45230,
    "total_errors": 3,
    "current_cycle": 524,
    "tables": {
      "lead": {
        "total_syncs": 523,
        "total_records": 45230,
        "last_sync": "2026-02-16T14:30:00",
        "errors": 0
      }
    }
  }
}
```

### GET /api/logs?limit=5

```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-16T14:30:00",
      "export": "zionexport",
      "level": "INFO",
      "message": "Sincronizados 150 registros até 2026-02-16 14:30:00",
      "extra": {}
    }
  ],
  "count": 5
}
```

## 🎨 Recursos do Dashboard

### Conectividade
- ✅ Status em tempo real (conectado/desconectado)
- ⏱️ Tempo médio de resposta
- 📊 Taxa de sucesso das verificações
- ⚠️ Último erro (se houver)

### Exportações
- 📦 Status de cada exportador (rodando/parado)
- 📈 Total de registros sincronizados
- 🔄 Número de ciclos executados
- ❌ Contador de erros
- 📋 Status individual de cada tabela

### Logs
- 🔍 Filtros por nível (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- 📅 Timestamp de cada evento
- 🏷️ Identificação do exportador
- 🔄 Atualização automática a cada 5 segundos
- 📜 Histórico dos últimos 1000 eventos

## 🔧 Integração com Exportadores

Os scripts de exportação foram atualizados para usar o monitor:

```python
from zionmonitor import ZionMonitor

# Inicializa o monitor
monitor = ZionMonitor("nome_do_exportador")

# Marca início
monitor.start_export()

# Registra logs
monitor.log_info("Mensagem informativa")
monitor.log_error("Erro encontrado", error_type="ValueError")

# Registra sincronização de tabela
monitor.log_table_sync("nome_tabela", records_count=500, duration=2.5)

# Registra erro em tabela
monitor.log_table_error("nome_tabela", "Descrição do erro")

# Marca fim
monitor.stop_export()
```

## 📂 Arquivos de Estado

O sistema cria automaticamente:

- `zionmonitor_state.json` - Estado do monitoramento
- Salvo automaticamente a cada 30 segundos
- Salvo imediatamente em caso de erro
- Contém últimos 100 logs e todas as estatísticas

## 🔍 Níveis de Log

- **DEBUG**: Informações detalhadas para debugging
- **INFO**: Eventos normais do sistema  
- **WARNING**: Situações que merecem atenção
- **ERROR**: Erros que não impedem continuação
- **CRITICAL**: Erros graves que podem parar o sistema

## ⚙️ Configuração

### Alterar Porta da API

Em `zionapi.py`:
```python
app.run(host='0.0.0.0', port=5000)  # Altere 5000 para outra porta
```

### Alterar Intervalo de Verificação

No frontend (`dashboard.html`):
```javascript
autoRefreshInterval = setInterval(updateAll, 5000);  // 5000 = 5 segundos
```

### Alterar Quantidade de Logs em Memória

Em `zionmonitor.py`:
```python
LOG_HISTORY = deque(maxlen=1000)  # Altere 1000 para outro valor
```

## 🛡️ Segurança

- API não requer autenticação (adequado para uso interno)
- Para produção, adicione autenticação JWT ou similar
- CORS habilitado para desenvolvimento
- Logs não contêm senhas ou dados sensíveis

## 📈 Performance

- Monitoramento roda em threads separadas
- Não impacta performance dos exportadores
- Estado salvo de forma assíncrona
- Logs mantidos em memória (deque thread-safe)
- API Flask em modo threaded

## 🔄 Fluxo de Dados

```
Exportadores → zionmonitor.py → zionmonitor_state.json
                    ↓
                zionapi.py (Flask)
                    ↓
            dashboard.html (Browser)
```

## 📞 Troubleshooting

### Dashboard não carrega
- Verifique se a API está rodando: `python zionapi.py`
- Acesse http://localhost:5000/api/health
- Verifique o firewall/antivírus

### Dados não atualizam
- Verifique se os exportadores estão rodando
- Confirme que estão importando `zionmonitor`
- Veja logs do console da API

### Erro ao conectar nos bancos
- Verifique credenciais em `MYSQL_CONFIG` e `POSTGRES_CONFIG`
- Teste conectividade com: POST /api/connectivity/check

### Logs não aparecem
- Exportadores precisam estar rodando
- Logs são mantidos em memória (reiniciar limpa)
- Verifique arquivo `zionmonitor_state.json`

## 🎯 Próximos Passos

1. Instale as dependências: `pip install -r requirements.txt`
2. Inicie a API: `start_api.bat` ou `python zionapi.py`
3. Abra o dashboard: http://localhost:5000
4. Inicie os exportadores com monitoramento ativado

---

**Sistema de Monitoramento Zion v1.0**  
**Data**: Fevereiro 2026  
**Dashboard**: http://localhost:5000
