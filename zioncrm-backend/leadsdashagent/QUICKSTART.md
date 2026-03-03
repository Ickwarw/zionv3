# 🚀 Guia Rápido de Início - Zion Export

## ⚡ Início Rápido (3 passos)

### 1️⃣ Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2️⃣ Iniciar o Sistema
Escolha uma das opções:

#### Opção A: Sistema Completo (Recomendado) 🌟
```bash
start_fullstack.bat
```
Inicia **TUDO de uma vez**:
- ✅ API Flask
- ✅ Dashboard Web (abre automaticamente)
- ✅ Todos os 3 exportadores

#### Opção B: Apenas API + Dashboard
```bash
start_api.bat
```
Depois acesse: http://localhost:5000

#### Opção C: Gerenciador de Exportadores
```bash
start_zionmanager.bat
```
Menu interativo para escolher exportadores

### 3️⃣ Acessar Dashboard
Abra no navegador: **http://localhost:5000**

---

## 📊 O que você verá no Dashboard

### Status de Conectividade
- 🟢 Verde = Conectado
- 🔴 Vermelho = Desconectado
- Tempo de resposta em milissegundos
- Taxa de sucesso das verificações

### Exportações em Tempo Real
- Status: Rodando/Parado
- Total de registros sincronizados
- Número de ciclos executados
- Contador de erros
- Última sincronização

### Logs do Sistema
- Filtros: Todos, Info, Avisos, Erros, Críticos
- Atualização automática a cada 5 segundos
- Timestamp de cada evento

---

## 📁 Estrutura de Arquivos

### Scripts Principais
- `zionexport.py` - Exporta clientes
- `zionexportatributes.py` - Exporta contratos
- `zionexportinfos.py` - Exporta suporte/usuários

### Sistema de Monitoramento
- `zionmonitor.py` - Sistema de logging
- `zionapi.py` - API Flask
- `static/dashboard.html` - Dashboard web

### Gerenciadores
- `zionmanager.py` - Gerenciador de exportadores
- `start_fullstack.py` - Inicia tudo junto

### Atalhos Windows
- `start_fullstack.bat` - Sistema completo ⭐
- `start_api.bat` - Apenas API
- `start_zionmanager.bat` - Gerenciador

---

## 🎯 Fluxo de Trabalho Recomendado

### Para Desenvolvimento/Teste
```bash
# 1. Apenas API (para testar dashboard)
start_api.bat

# 2. Exportadores individuais em outros terminais
python zionexport.py
python zionexportatributes.py
```

### Para Produção/Uso Real
```bash
# Tudo de uma vez
start_fullstack.bat
```

### Para Monitoramento Existente
```bash
# Se os exportadores já estão rodando
start_api.bat
```

---

## 🔧 Configurações

### Bancos de Dados

**MariaDB (Origem)**
- Host: 45.160.180.14
- Porta: 3306
- Usuário: leitura (somente SELECT)
- Database: ixcprovedor

**PostgreSQL (Destino)**
- Host: 45.160.180.34
- Porta: 5432
- Usuário: zioncrm
- Database: zioncrm

### Parâmetros de Sincronização
- **Batch Size**: 500 registros por vez
- **Intervalo**: 10 segundos entre ciclos
- **Dashboard**: Atualiza a cada 5 segundos

---

## 📊 Endpoints da API

### Principais
```
GET  /                             # Dashboard Web
GET  /api/dashboard                # Dados completos
GET  /api/connectivity             # Status dos bancos
GET  /api/exports                  # Status exportações
GET  /api/logs                     # Logs do sistema
```

### Testes
```
GET  /api/health                   # Health check
GET  /api/ping                     # Teste simples
```

---

## ❓ FAQ

### Como parar tudo?
`Ctrl + C` no terminal

### Como reiniciar sincronização do zero?
Delete os arquivos `*_state.json`

### Como ver apenas erros?
No dashboard, clique em "Erros" nos filtros de log

### Como testar conectividade?
Acesse: http://localhost:5000/api/connectivity/check

### Como mudar o intervalo de sincronização?
Edite `POLL_SECONDS` nos scripts de exportação

---

## 🐛 Troubleshooting

### "Connection refused" ao acessar dashboard
```bash
# Verifique se a API está rodando
python zionapi.py
```

### "Module not found: zionmonitor"
```bash
# Certifique-se de estar no diretório correto
cd C:\Users\Hunson\Desktop\hefestbyte
```

### Exportadores não aparecem no dashboard
```bash
# Os exportadores precisam estar rodando
start_fullstack.bat
```

### Erro ao conectar no banco
```bash
# Teste conectividade
POST http://localhost:5000/api/connectivity/check
```

---

## 📚 Documentação Completa

- [README_ZIONEXPORT.md](README_ZIONEXPORT.md) - Sistema de exportação
- [README_MONITOR.md](README_MONITOR.md) - Sistema de monitoramento

---

## 🎉 Pronto para Usar!

```bash
# Execute e seja feliz!
start_fullstack.bat
```

Dashboard abrirá automaticamente em: **http://localhost:5000**

---

**Zion Export System v1.0**  
*Sincronização inteligente com monitoramento em tempo real*
