# Zion Export - Sistema de Sincronização de Dados

Sistema completo de exportação e sincronização de dados do MariaDB (IXCProvedor) para PostgreSQL (ZionCRM).

## 📋 Descrição

Este sistema sincroniza dados em tempo real entre dois bancos de dados:
- **Origem**: MariaDB (IXCProvedor) - 45.160.180.14
- **Destino**: PostgreSQL (ZionCRM) - 45.160.180.34

## 🚀 Componentes

### 1. **zionexport.py**
Sincroniza a tabela principal de clientes:
- **Tabela**: `cliente` → `lead`
- **Registros**: Informações de clientes/prospects
- **Rastreamento**: Campo `ultima_atualizacao`

### 2. **zionexportatributes.py**
Sincroniza tabelas de contratos e atributos:
- `cliente_arquivos` - Arquivos de clientes
- `cliente_contrato` - Contratos principais
- `cliente_contrato_alt_plano` - Alterações de planos
- `cliente_contrato_historico` - Histórico de contratos
- `cliente_contrato_servicos` - Serviços contratados

### 3. **zionexportinfos.py**
Sincroniza tabelas de suporte e usuários:
- `su_oss_chamado` - Chamados/tickets
- `su_oss_chamado_arquivos` - Arquivos de chamados
- `su_oss_chamado_historico` - Histórico de chamados
- `su_oss_chamado_mensagem` - Mensagens de chamados
- `su_oss_evento` - Eventos do sistema
- `usuarios` - Usuários do sistema

### 4. **zionmanager.py**
Gerenciador central que permite:
- Executar todos os exportadores simultaneamente
- Executar exportadores específicos
- Monitorar o status de sincronização
- Parar todos os processos com Ctrl+C

## ⚙️ Configuração

### Requisitos
```bash
pip install mysql-connector-python psycopg2
```

### Credenciais

**MariaDB (Origem):**
- Host: 45.160.180.14
- Porta: 3306
- Usuário: leitura (somente SELECT)
- Senha: abwmwwTZCKefsiCwGKsKoTAy8Ak=
- Database: ixcprovedor

**PostgreSQL (Destino):**
- Host: 45.160.180.34
- Porta: 5432
- Usuário: zioncrm
- Senha: kN98upt4gJ3G
- Database: zioncrm

## 🎯 Como Usar

### Opção 1: Usando o Gerenciador (Recomendado)

```bash
python zionmanager.py
```

O menu interativo permite:
1. Executar todos os exportadores
2. Escolher exportadores específicos
3. Ver status da sincronização
0. Sair

### Opção 2: Executar Scripts Individualmente

```bash
# Sincronizar apenas clientes
python zionexport.py

# Sincronizar apenas contratos
python zionexportatributes.py

# Sincronizar apenas suporte
python zionexportinfos.py
```

### Opção 3: Executar em Background (Windows)

```powershell
# Executar todos simultaneamente
Start-Process python -ArgumentList "zionexport.py" -WindowStyle Hidden
Start-Process python -ArgumentList "zionexportatributes.py" -WindowStyle Hidden
Start-Process python -ArgumentList "zionexportinfos.py" -WindowStyle Hidden
```

## 📊 Funcionamento

### Sincronização Incremental
- Cada script mantém um arquivo de estado (`.json`)
- Registra o último timestamp sincronizado
- Busca apenas registros novos/atualizados
- Evita duplicação de esforços

### Batch Processing
- Importa **500 registros por vez**
- Otimizado para não sobrecarregar os bancos
- Usa UPSERT (INSERT com ON CONFLICT)

### Real-Time Sync
- Executa em **loop contínuo**
- Intervalo: **10 segundos** entre ciclos
- Thread-safe com locks

### Conversão de Tipos
- Converte tipos MariaDB → PostgreSQL automaticamente
- INT → INTEGER
- VARCHAR → VARCHAR/TEXT
- DECIMAL → NUMERIC
- DATETIME → TIMESTAMP
- ENUM → VARCHAR

## 📁 Arquivos de Estado

Os scripts criam arquivos JSON para rastrear o progresso:

- `zionexport_state.json`
- `zionexportatributes_state.json`
- `zionexportinfos_state.json`

Exemplo:
```json
{
  "cliente_contrato": {
    "last_sync": "2026-02-16T14:30:00"
  },
  "cliente_arquivos": {
    "last_sync": "2026-02-16T14:29:45"
  }
}
```

## 🔧 Otimizações Implementadas

1. **Multi-threading**: Cada tabela sincroniza em thread separada
2. **Batch Processing**: Lotes de 500 registros
3. **Upsert Eficiente**: ON CONFLICT DO UPDATE
4. **Incremental Sync**: Apenas novos/modificados
5. **Connection Pooling**: Conexões gerenciadas por ciclo
6. **Error Handling**: Recupera de erros automaticamente
7. **Thread-safe State**: Locks para gravação de estado

## 🛡️ Segurança

- Usuário MariaDB tem **apenas permissão SELECT**
- Não pode modificar dados de origem
- Credenciais isoladas em constantes
- State files não contêm senhas

## 📈 Monitoramento

### Ver Logs em Tempo Real
Cada script imprime:
- Quantidade de registros sincronizados
- Timestamp da última sincronização
- Erros (se houver)

### Verificar Estado
```bash
python zionmanager.py
# Escolha opção 3 - Ver status
```

## 🔄 Manutenção

### Reiniciar Sincronização Completa
Para reprocessar todos os dados, delete os arquivos de estado:
```bash
del zionexport_state.json
del zionexportatributes_state.json
del zionexportinfos_state.json
```

### Ajustar Intervalo de Sincronização
Edite a variável `POLL_SECONDS` em cada script:
```python
POLL_SECONDS = 10  # segundos entre ciclos
```

### Ajustar Tamanho do Lote
Edite a variável `BATCH_SIZE` em cada script:
```python
BATCH_SIZE = 500  # registros por lote
```

## ⚠️ Troubleshooting

### Erro de Conexão MariaDB
- Verifique se o IP 45.160.180.14 está acessível
- Confirme as credenciais do usuário `leitura`

### Erro de Conexão PostgreSQL
- Verifique se o IP 45.160.180.34 está acessível
- Confirme as credenciais do usuário `zioncrm`

### Tabelas Não Criadas
- Verifique se o usuário PostgreSQL tem permissão CREATE TABLE
- O script tenta criar tabelas automaticamente

### Sincronização Lenta
- Aumente `BATCH_SIZE` para processar mais registros por vez
- Reduza `POLL_SECONDS` para ciclos mais frequentes
- Verifique a latência de rede entre os servidores

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs de cada script
2. Consulte os arquivos de estado
3. Revise as tabelas no PostgreSQL

## 📝 Notas

- Sistema otimizado para não impactar performance dos bancos
- Usa índices existentes para busca eficiente
- Mantém integridade referencial quando possível
- Logs detalhados para auditoria

---

**Autor**: Sistema Zion Export v1.0  
**Data**: Fevereiro 2026  
**Licença**: Uso Interno
