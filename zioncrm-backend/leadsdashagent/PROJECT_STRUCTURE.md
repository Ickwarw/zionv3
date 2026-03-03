# 📦 Zion Export - Estrutura Completa do Projeto

## 📂 Arquivos do Projeto

```
hefestbyte/
│
├── 📊 SISTEMA DE EXPORTAÇÃO
│   ├── zionexport.py                    # Exporta clientes (cliente → lead)
│   ├── zionexportatributes.py          # Exporta contratos (5 tabelas)
│   ├── zionexportinfos.py              # Exporta suporte (6 tabelas)
│   ├── zionmanager.py                   # Gerenciador de exportadores
│   │
│   ├── zionexport_state.json           # Estado: clientes (gerado)
│   ├── zionexportatributes_state.json  # Estado: contratos (gerado)
│   └── zionexportinfos_state.json      # Estado: suporte (gerado)
│
├── 🔍 SISTEMA DE MONITORAMENTO
│   ├── zionmonitor.py                   # Módulo de logging/monitoramento
│   ├── zionapi.py                       # API Flask REST
│   ├── zionmonitor_state.json          # Estado do monitor (gerado)
│   │
│   └── static/
│       └── dashboard.html              # Dashboard web interativo
│
├── 🚀 INICIALIZADORES
│   ├── start_fullstack.py              # Inicia tudo junto (Python)
│   ├── start_fullstack.bat             # Inicia tudo junto (Windows)
│   ├── start_api.bat                   # Inicia apenas API
│   └── start_zionmanager.bat           # Inicia gerenciador
│
├── 📚 DOCUMENTAÇÃO
│   ├── QUICKSTART.md                   # ⭐ COMECE AQUI ⭐
│   ├── README_ZIONEXPORT.md            # Sistema de exportação
│   ├── README_MONITOR.md               # Sistema de monitoramento
│   └── requirements.txt                # Dependências Python
│
└── 📋 SCHEMAS SQL (Referência)
    ├── geraltables2.sql                # Schema completo
    ├── cliente_contrato.sql
    ├── cliente_contrato_alt_plano.sql
    ├── cliente_contrato_historico.sql
    ├── cliente_contrato_servico.sql
    ├── su_chamado.sql
    ├── su_chamado_arquivo.sql
    ├── su_chamado_evento.sql
    ├── su_mensagensos.sql
    ├── su_oss_assunto.sql
    └── usuarios.sql
```

## 🎯 Fluxo de Dados

```
┌─────────────────┐
│  MariaDB        │
│  ixcprovedor    │
│  45.160.180.14  │
└────────┬────────┘
         │
         │ SELECT (leitura)
         │
    ┌────▼──────────────────────┐
    │  Exportadores Python      │
    │  ├─ zionexport            │
    │  ├─ zionexportatributes   │
    │  └─ zionexportinfos       │
    └────┬──────────────────────┘
         │
         │ Logs e Métricas
         │
    ┌────▼──────────────────────┐
    │  zionmonitor.py           │
    │  (Sistema de Logging)     │
    └────┬──────────────────────┘
         │
         ├─────────────┬─────────────────┐
         │             │                 │
    ┌────▼────┐   ┌────▼────────┐  ┌────▼─────────┐
    │ INSERT  │   │  Flask API  │  │ State Files  │
    │ UPSERT  │   │  (REST)     │  │ (JSON)       │
    └────┬────┘   └─────┬───────┘  └──────────────┘
         │              │
         │              │ http://localhost:5000/api
         │              │
    ┌────▼────────┐     │
    │ PostgreSQL  │     │
    │  zioncrm    │     │
    │ 45.160.180.34    │
    └─────────────┘     │
                        │
                   ┌────▼──────────────┐
                   │  Dashboard Web    │
                   │  (HTML/JS/CSS)    │
                   │  Auto-refresh 5s  │
                   └───────────────────┘
```

## 📊 Tabelas Exportadas

### 🧑 Cliente (zionexport.py)
- `cliente` → `lead` (1 tabela)

### 📝 Contratos (zionexportatributes.py)
1. `cliente_arquivos`
2. `cliente_contrato`
3. `cliente_contrato_alt_plano`
4. `cliente_contrato_historico`
5. `cliente_contrato_servicos`

### 🎫 Suporte (zionexportinfos.py)
1. `su_oss_chamado`
2. `su_oss_chamado_arquivos`
3. `su_oss_chamado_historico`
4. `su_oss_chamado_mensagem`
5. `su_oss_evento`
6. `usuarios`

**Total: 12 tabelas sincronizadas**

## 🔧 Tecnologias Utilizadas

### Backend
- **Python 3.x** - Linguagem principal
- **mysql-connector-python** - Conexão MariaDB
- **psycopg2** - Conexão PostgreSQL
- **Flask** - Framework web API
- **flask-cors** - CORS para API

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização moderna
- **JavaScript ES6** - Lógica e interação
- **Fetch API** - Requisições AJAX

### Arquitetura
- **REST API** - Comunicação cliente-servidor
- **Multi-threading** - Sincronização paralela
- **Real-time** - Atualização automática
- **State Management** - Arquivos JSON

## 🚀 Modos de Operação

### 1. Desenvolvimento
```bash
# Terminal 1: API
python zionapi.py

# Terminal 2: Testes
python zionexport.py
```

### 2. Produção
```bash
# Tudo de uma vez
start_fullstack.bat
```

### 3. Gerenciado
```bash
# Menu interativo
start_zionmanager.bat
```

## 📈 Estatísticas do Sistema

### Performance
- **Batch Size**: 500 registros/lote
- **Intervalo**: 10s entre ciclos
- **Threads**: 1 por tabela (paralelo)
- **Dashboard**: Atualização a cada 5s

### Capacidade
- **Logs em Memória**: 1000 eventos
- **Response Times**: Últimos 100
- **Erros Rastreados**: Últimos 50
- **Sync Times**: Últimos 100

### Monitoramento
- **Conectividade**: A cada 30s
- **Auto-save**: A cada 30s
- **Health Check**: Sempre disponível

## 🎨 Recursos do Dashboard

### Visual
- ✅ Design moderno e responsivo
- ✅ Gradientes coloridos
- ✅ Ícones e emojis
- ✅ Animações suaves
- ✅ Indicadores de status em tempo real

### Funcional
- ✅ Atualização automática
- ✅ Filtros de logs
- ✅ Métricas detalhadas
- ✅ Status de conectividade
- ✅ Performance em tempo real
- ✅ Cards por exportador
- ✅ Histórico de erros

## 🔐 Segurança

### Acesso aos Bancos
- **MariaDB**: Usuário `leitura` - **somente SELECT**
- **PostgreSQL**: Usuário `zioncrm` - INSERT/UPDATE/CREATE

### API
- **CORS**: Habilitado (desenvolvimento)
- **Autenticação**: Não implementada (interno)
- **Logs**: Sem dados sensíveis

## 📞 Suporte

### Verificar Status
```bash
# Health check
curl http://localhost:5000/api/health

# Conectividade
curl http://localhost:5000/api/connectivity
```

### Logs do Sistema
- Console dos exportadores
- Dashboard web (/api/logs)
- Arquivo: zionmonitor_state.json

### Reiniciar do Zero
```bash
# Delete os estados
del *_state.json

# Reinicie
start_fullstack.bat
```

## 📅 Histórico de Versões

### v1.0.0 (Fevereiro 2026)
- ✅ Sistema de exportação completo
- ✅ 12 tabelas sincronizadas
- ✅ Sistema de monitoramento
- ✅ API Flask REST
- ✅ Dashboard web interativo
- ✅ Logs em tempo real
- ✅ Métricas de performance

## 🎯 Próximos Passos

1. **Instalar dependências**
   ```bash
   pip install -r requirements.txt
   ```

2. **Ler o Quickstart**
   - Abra: [QUICKSTART.md](QUICKSTART.md)

3. **Iniciar o sistema**
   ```bash
   start_fullstack.bat
   ```

4. **Acessar dashboard**
   - URL: http://localhost:5000

## 💡 Dicas

- Use `start_fullstack.bat` para facilidade máxima
- Dashboard atualiza automaticamente
- Logs são filtráveis por nível
- Estado é salvo automaticamente
- Ctrl+C para parar tudo

---

**Zion Export Full Stack v1.0**  
*Sistema completo de sincronização com monitoramento em tempo real*  
*Desenvolvido em Fevereiro 2026*
