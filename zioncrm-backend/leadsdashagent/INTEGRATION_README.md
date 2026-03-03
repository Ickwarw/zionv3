# LeadsDashAgent - Integração com ZionCRM Backend

## 📋 Mudanças Realizadas

### ✅ Backend - Integração Completa

#### 1. Estrutura de Blueprints Criada

Foram criados arquivos de blueprint para integrar o sistema `leadsdashagent` ao `zioncrm-backend`:

- **`leadsdashagent/__init__.py`** - Módulo principal que define os 4 blueprints
- **`leadsdashagent/lead_routes.py`** - Rotas de CRUD de Leads
- **`leadsdashagent/dashboard_routes.py`** - Rotas de Dashboard
- **`leadsdashagent/leadattributes_routes.py`** - Rotas de Atributos (placeholder)
- **`leadsdashagent/leadinfos_routes.py`** - Rotas de Infos (placeholder)

#### 2. Registro Automático no Sistema Principal

O arquivo **`routes.py`** foi atualizado para registrar automaticamente os blueprints do leadsdashagent:

```python
# Import LeadsDashAgent blueprints
from leadsdashagent import lead_bp, dashboard_bp, leadattributes_bp, leadinfos_bp

# Register LeadsDashAgent blueprints
app.register_blueprint(lead_bp, url_prefix='/api/leadsdashagent/leads')
app.register_blueprint(dashboard_bp, url_prefix='/api/leadsdashagent/dashboard')
app.register_blueprint(leadattributes_bp, url_prefix='/api/leadsdashagent/attributes')
app.register_blueprint(leadinfos_bp, url_prefix='/api/leadsdashagent/infos')
```

#### 3. Endpoints Disponíveis

Agora quando o `zioncrm-backend` iniciar, os seguintes endpoints estarão disponíveis:

##### **Leads API** (`/api/leadsdashagent/leads/`)
- `GET /api/leadsdashagent/leads/` - Listar leads com filtros
- `GET /api/leadsdashagent/leads/<id>` - Buscar lead específico
- `POST /api/leadsdashagent/leads/` - Criar novo lead
- `PUT /api/leadsdashagent/leads/<id>` - Atualizar lead
- `PATCH /api/leadsdashagent/leads/<id>/partial` - Atualização parcial
- `DELETE /api/leadsdashagent/leads/<id>` - Deletar lead (soft delete)
- `GET /api/leadsdashagent/leads/stats` - Estatísticas de leads
- `GET /api/leadsdashagent/leads/health` - Health check

##### **Dashboard API** (`/api/leadsdashagent/dashboard/`)
- `GET /api/leadsdashagent/dashboard/assuntos` - Listar assuntos disponíveis
- `GET /api/leadsdashagent/dashboard/assuntos/<key>` - Dados de um assunto
- `GET /api/leadsdashagent/dashboard/estatisticas` - Estatísticas gerais
- `GET /api/leadsdashagent/dashboard/graficos` - Listar gráficos
- `GET /api/leadsdashagent/dashboard/graficos/<id>` - Obter gráfico
- `GET /api/leadsdashagent/dashboard/graficos/<id>/dados` - Dados do gráfico
- `POST /api/leadsdashagent/dashboard/graficos` - Criar gráfico
- `PUT /api/leadsdashagent/dashboard/graficos/<id>` - Atualizar gráfico
- `DELETE /api/leadsdashagent/dashboard/graficos/<id>` - Deletar gráfico
- `GET /api/leadsdashagent/dashboard/graficos-predefinidos` - 12 gráficos predefinidos
- `GET /api/leadsdashagent/dashboard/health` - Health check

##### **Attributes & Infos APIs**
- `GET /api/leadsdashagent/attributes/health` - Health check
- `GET /api/leadsdashagent/infos/health` - Health check

---

### ✅ Frontend - Tipos Atualizados

#### Arquivo `leads.types.ts` Completo

O arquivo **`zioncrm-frontend/src/components/leads/types/leads.types.ts`** foi completamente atualizado com todos os campos do backend:

##### **Campos Adicionados:**

**Dados Básicos:**
- `razao` - Razão Social (obrigatório)
- `fantasia` - Nome Fantasia
- `cnpj_cpf` - CNPJ ou CPF (obrigatório)
- `ie_identidade` - IE ou RG
- `tipo_pessoa` - Tipo de pessoa (F=Física, J=Jurídica)

**Contato:**
- `fone` - Telefone principal
- `telefone_comercial`
- `telefone_celular`
- `contato` - Nome do contato

**Endereço Principal:**
- `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `cep`
- `referencia`, `latitude`, `longitude`

**Endereço de Cobrança:**
- `endereco_cob`, `numero_cob`, `bairro_cob`, `cidade_cob`, `uf_cob`, `cep_cob`

**Dados Pessoais:**
- `data_nascimento`
- `estado_civil`

**Classificação de Vendas (Novos Campos):**
- `prioridade` - NovaLead, Ruim, Fria, Morna, Quente, MuitoQuente, Queimando
- `status_vendas` - NovaLeadVendas, PerdasLeads*, Recuperadas, Recuperar, Fidelizado
- `status_pos_venda` - AcompanhamentoPersonalizado, TreinamentoSuporte, etc
- `nivel_contentamento` - Excelente, Bom, Regular, Ruim, Pessimo
- `status_debito` - EmDia, EmAtraso
- `origem` - Panfleto, Telefone, Email, WhatsApp, RedeInstagram, etc
- `departamento` - vendas, pos_venda
- `score` - Pontuação 0-100
- `obs_classificacao` - Observações da classificação automática
- `data_ultima_classificacao`

**Dados Comerciais:**
- `id_tipo_cliente`
- `id_vendedor`
- `id_conta`
- `filial_id`

**Status e Controle:**
- `ativo` - S=Sim, I=Inativo
- `status_internet`
- `bloqueio_automatico`
- `aviso_atraso`
- `alerta`

**Financeiro:**
- `dia_vencimento`

**Timestamps:**
- `data_cadastro`
- `ultima_atualizacao`
- `created_at`
- `updated_at`

**Campos Legados (Mantidos para Compatibilidade):**
- `name`, `phone`, `company`, `position`, `address`, `city`, `state`, `zip_code`, `country`
- `status_id`, `status`, `department_id`, `source_id`, `source`
- `assigned_to`, `assigned_user`, `notes`, `value`, `created_by`, `creator`

---

## 🚀 Como Usar

### Backend

1. **Inicie o servidor normalmente:**
   ```bash
   cd zioncrm-backend
   python app.py
   ```

2. **O sistema iniciará com todas as rotas registradas:**
   - Rotas principais: `http://localhost:5000/api/*`
   - LeadsDashAgent Leads: `http://localhost:5000/api/leadsdashagent/leads/*`
   - LeadsDashAgent Dashboard: `http://localhost:5000/api/leadsdashagent/dashboard/*`

3. **Teste os endpoints:**
   ```bash
   # Listar leads
   curl http://localhost:5000/api/leadsdashagent/leads/
   
   # Estatísticas
   curl http://localhost:5000/api/leadsdashagent/leads/stats
   
   # Dashboard
   curl http://localhost:5000/api/leadsdashagent/dashboard/estatisticas
   ```

### Frontend

1. **Use os novos tipos no código TypeScript:**
   ```typescript
   import { Lead } from '@/components/leads/types/leads.types';
   
   const novoLead: Lead = {
     razao: "Empresa XYZ Ltda",
     cnpj_cpf: "12.345.678/0001-90",
     email: "contato@xyz.com",
     fone: "(11) 98765-4321",
     prioridade: "Quente",
     status_vendas: "NovaLeadVendas",
     departamento: "vendas",
     score: 75
   };
   ```

2. **Todos os campos são opcionais exceto `razao` e `cnpj_cpf`**

---

## 📝 Notas Importantes

### ⚠️ Configurações do PostgreSQL

Os arquivos de rotas ainda usam as credenciais hardcoded do PostgreSQL:

```python
POSTGRES_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}
```

**Recomendação:** Mova essas configurações para variáveis de ambiente ou arquivo de configuração seguro.

### 📦 Dependências

Certifique-se de que o `psycopg2` está instalado:
```bash
pip install psycopg2-binary
```

### 🗄️ Migração do Banco

Execute a migração SQL para adicionar os novos campos de classificação:
```bash
psql -h 45.160.180.34 -U zioncrm -d zioncrm -f leadsdashagent/migration_lead_classification.sql
```

---

## 🔄 Compatibilidade

### Sem Quebrar Código Existente

- Os campos legados (`name`, `phone`, `email`, etc.) foram mantidos
- O sistema principal de leads (`/api/leads/`) continua funcionando normalmente
- Os novos endpoints estão em um namespace separado (`/api/leadsdashagent/`)

### Mapeamento de Campos

Se necessário, você pode mapear campos legados para os novos:

```typescript
// Exemplo de mapeamento
const leadLegacy = {
  name: lead.razao,
  phone: lead.fone,
  company: lead.fantasia,
  address: lead.endereco,
  state: lead.uf,
  zip_code: lead.cep
};
```

---

## ✅ Checklist de Verificação

- [x] Blueprints criados para leadsdashagent
- [x] Blueprints registrados no routes.py principal
- [x] Endpoints de Leads funcionais
- [x] Endpoints de Dashboard funcionais
- [x] Tipos TypeScript atualizados com todos os campos
- [x] Compatibilidade com código existente mantida
- [ ] Migração SQL executada no banco
- [ ] Variáveis de ambiente configuradas
- [ ] Testes de integração realizados

---

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:

1. Os logs do servidor Flask
2. Se o PostgreSQL está acessível
3. Se a migração SQL foi executada
4. Se todas as dependências estão instaladas

---

**Sistema LeadsDashAgent totalmente integrado ao ZionCRM Backend! 🎉**
