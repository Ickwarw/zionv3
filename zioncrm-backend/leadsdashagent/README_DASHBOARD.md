# 📊 Sistema de Dashboard com Gráficos Personalizáveis

## 🎯 Visão Geral

Sistema completo de dashboard com **12 assuntos predefinidos** e capacidade de criar **gráficos personalizados** combinando múltiplos assuntos no mesmo gráfico. Totalmente integrado com **Chart.js** via JSON.

---

## 🏗️ Arquitetura

```
Sistema de Dashboard
│
├─ models.py           # Modelos de dados, queries SQL, lógica de negócio
├─ routes.py           # API REST Flask (porta 5004)
├─ dashboard_api_docs.json  # Documentação completa da API
└─ migration_dashboard.sql  # Script SQL para criar tabela
```

---

## 📋 12 Assuntos Disponíveis

| # | Assunto | Descrição | Ícone |
|---|---------|-----------|-------|
| 1 | **perdas_clientes_fidelizados** | Clientes ativos satisfeitos que cancelaram | 📉 |
| 2 | **perdas_leads_ruins** | Leads com prioridade "Ruim" perdidas | ⚫ |
| 3 | **leads_recuperadas** | Leads inativas que foram recuperadas | 🔄 |
| 4 | **leads_queimando_perdidas** | Alta prioridade mas perdidas | 🔥 |
| 5 | **tempo_ordem_servico_funcionario** | Performance por funcionário | ⏱️ |
| 6 | **distribuicao_prioridade** | Leads por temperatura | 🌡️ |
| 7 | **distribuicao_departamento** | Vendas vs Pós-Venda | 🏢 |
| 8 | **taxa_conversao_vendas** | Funil de vendas | 📊 |
| 9 | **satisfacao_cliente** | Níveis de contentamento | ⭐ |
| 10 | **origem_leads** | Leads por canal | 📱 |
| 11 | **status_financeiro** | Em dia vs Atrasado | 💰 |
| 12 | **score_medio_periodo** | Evolução do score | 📈 |

---

## 🚀 Como Usar

### **1. Instalação e Configuração**

#### **Passo 1: Instalar dependências**
```bash
pip install flask flask-cors psycopg2-binary
```

#### **Passo 2: Executar migração do banco de dados**
```bash
psql -h 45.160.180.34 -p 5432 -U zioncrm -d zioncrm -f migration_dashboard.sql
```

Ou execute manualmente no pgAdmin/DBeaver.

#### **Passo 3: Iniciar a API**
```bash
python routes.py
```

A API iniciará na porta **5004**.

---

### **2. Fluxo de Uso no Frontend**

#### **A. Dashboard Inicial (12 Cards Clicáveis)**

1. **Carregar lista de assuntos predefinidos:**
```javascript
const response = await fetch('http://localhost:5004/api/dashboard/graficos-predefinidos');
const result = await response.json();

// result.data contém 12 cards com: key, label, descricao, icon, color
result.data.forEach(card => {
    // Renderizar card clicável com ícone e cor
    console.log(`${card.icon} ${card.label}`);
});
```

2. **Ao clicar em um card, abrir página de detalhes:**
```javascript
async function abrirDetalhesAssunto(key) {
    const response = await fetch(`http://localhost:5004/api/dashboard/graficos-predefinidos/${key}/dados`);
    const result = await response.json();
    
    // result.data contém: labels, data, label, descricao
    renderizarGrafico(result.data);
}
```

#### **B. Criar Gráfico Personalizado**

1. **Listar assuntos disponíveis para seleção:**
```javascript
const response = await fetch('http://localhost:5004/api/dashboard/assuntos');
const result = await response.json();

// Renderizar checkboxes com result.data
Object.entries(result.data).forEach(([key, assunto]) => {
    console.log(`<input type="checkbox" value="${key}"> ${assunto.label}`);
});
```

2. **Criar gráfico com assuntos selecionados:**
```javascript
async function criarGrafico() {
    const assuntosSelecionados = Array.from(
        document.querySelectorAll('input[name="assuntos"]:checked')
    ).map(cb => cb.value);
    
    const body = {
        titulo: "Meu Gráfico Personalizado",
        descricao: "Análise comparativa de múltiplos assuntos",
        tipo_grafico: "line",  // bar, line, pie, doughnut, radar, polarArea
        assuntos: assuntosSelecionados,
        configuracoes: {
            colors: ["#FF6384", "#36A2EB", "#FFCE56"],
            borderWidth: 2
        }
    };
    
    const response = await fetch('http://localhost:5004/api/dashboard/graficos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    const result = await response.json();
    if (result.success) {
        // Redirecionar para página de visualização
        window.location.href = `/graficos?id=${result.data.id}`;
    }
}
```

#### **C. Listar Gráficos Salvos (Botão "Gráficos")**

```javascript
async function listarGraficosSalvos() {
    const response = await fetch('http://localhost:5004/api/dashboard/graficos');
    const result = await response.json();
    
    result.data.forEach(grafico => {
        console.log(`[${grafico.id}] ${grafico.titulo} - ${grafico.assuntos.length} assuntos`);
    });
}
```

#### **D. Renderizar Gráfico com Chart.js**

```javascript
async function renderizarGraficoPersonalizado(graficoId) {
    const response = await fetch(`http://localhost:5004/api/dashboard/graficos/${graficoId}/dados`);
    const result = await response.json();
    
    if (result.success) {
        const chartData = result.data;
        const ctx = document.getElementById('myChart').getContext('2d');
        
        new Chart(ctx, {
            type: chartData.tipo_grafico,
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: `rgba(${index * 100}, ${index * 50}, 192, 0.2)`,
                    borderColor: `rgba(${index * 100}, ${index * 50}, 192, 1)`,
                    borderWidth: chartData.configuracoes?.borderWidth || 1
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: chartData.titulo,
                        font: { size: 20 }
                    },
                    subtitle: {
                        display: true,
                        text: chartData.descricao
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
```

---

## 📡 Endpoints da API

### **Assuntos**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/assuntos` | Lista todos os 12 assuntos |
| GET | `/api/dashboard/assuntos/{key}` | Dados de um assunto específico |

### **Estatísticas**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/estatisticas` | Estatísticas gerais (12 cards) |

### **Gráficos Personalizados**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/graficos` | Lista gráficos salvos |
| POST | `/api/dashboard/graficos` | Cria novo gráfico |
| GET | `/api/dashboard/graficos/{id}` | Detalhes de um gráfico |
| PUT | `/api/dashboard/graficos/{id}` | Atualiza gráfico |
| DELETE | `/api/dashboard/graficos/{id}` | Remove gráfico |
| GET | `/api/dashboard/graficos/{id}/dados` | Dados prontos para Chart.js |

### **Gráficos Predefinidos**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/graficos-predefinidos` | Lista 12 cards |
| GET | `/api/dashboard/graficos-predefinidos/{key}/dados` | Dados de um card |

---

## 📊 Tipos de Gráficos Suportados

- **bar** - Gráfico de barras
- **line** - Gráfico de linhas
- **pie** - Gráfico de pizza
- **doughnut** - Gráfico de rosca
- **radar** - Gráfico de radar
- **polarArea** - Área polar

---

## 🔍 Exemplos de Requisições

### **Exemplo 1: Obter dados de "Perdas de Clientes Fidelizados"**

```bash
curl http://localhost:5004/api/dashboard/assuntos/perdas_clientes_fidelizados
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "label": "Perdas de Clientes Fidelizados",
    "descricao": "Clientes ativos satisfeitos que cancelaram contrato",
    "labels": ["2026-02", "2026-01", "2025-12"],
    "data": [5, 8, 3]
  }
}
```

### **Exemplo 2: Criar gráfico comparando 3 assuntos**

```bash
curl -X POST http://localhost:5004/api/dashboard/graficos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Análise Completa de Perdas",
    "tipo_grafico": "line",
    "assuntos": [
      "perdas_clientes_fidelizados",
      "perdas_leads_ruins",
      "leads_queimando_perdidas"
    ],
    "configuracoes": {
      "colors": ["#FF6384", "#9CA3AF", "#EF4444"]
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "titulo": "Análise Completa de Perdas",
    "tipo_grafico": "line",
    "assuntos": [
      "perdas_clientes_fidelizados",
      "perdas_leads_ruins",
      "leads_queimando_perdidas"
    ],
    "ativo": true
  },
  "message": "Gráfico criado com sucesso"
}
```

### **Exemplo 3: Obter dados do gráfico para Chart.js**

```bash
curl http://localhost:5004/api/dashboard/graficos/7/dados
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "labels": ["2026-02", "2026-01", "2025-12"],
    "datasets": [
      {
        "label": "Perdas de Clientes Fidelizados",
        "data": [5, 8, 3],
        "labels": ["2026-02", "2026-01", "2025-12"]
      },
      {
        "label": "Perda de Leads Ruins",
        "data": [12, 15, 10],
        "labels": ["2026-02", "2026-01", "2025-12"]
      },
      {
        "label": "Leads Queimando Perdidas",
        "data": [2, 4, 1],
        "labels": ["2026-02", "2026-01", "2025-12"]
      }
    ],
    "tipo_grafico": "line",
    "titulo": "Análise Completa de Perdas",
    "descricao": ""
  }
}
```

---

## 🛠️ Estrutura do `models.py`

### **Principais Componentes:**

1. **`ASSUNTOS_DISPONIVEIS`** - Dicionário com 12 assuntos e suas queries SQL
2. **`class Grafico`** - Modelo ORM para gráficos personalizados
3. **`get_assuntos_disponiveis()`** - Lista assuntos para seleção
4. **`get_dados_assunto(key)`** - Executa query e retorna dados JSON
5. **`get_estatisticas_gerais()`** - Estatísticas para os 12 cards

### **Exemplo de Query (perdas_clientes_fidelizados):**

```sql
SELECT 
    DATE_TRUNC('month', data_ultima_classificacao) as periodo,
    COUNT(*) as total
FROM lead
WHERE status_pos_venda = 'AtivasSatisfeitas'
AND departamento = 'vendas'
AND status_vendas = 'Recuperar'
GROUP BY periodo
ORDER BY periodo DESC
LIMIT 12
```

---

## 📁 Arquivos Criados

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| **models.py** | Modelos, queries SQL, lógica de dados | ~620 |
| **routes.py** | API REST Flask com 10 endpoints | ~600 |
| **dashboard_api_docs.json** | Documentação completa JSON | ~400 |
| **migration_dashboard.sql** | Script de criação de tabela | ~120 |
| **README_DASHBOARD.md** | Este arquivo | ~500 |

---

## ✅ Checklist de Implementação

### **Backend (Pronto)**
- [x] models.py com 12 assuntos e queries SQL
- [x] routes.py com 10 endpoints REST
- [x] Classe Grafico com ORM
- [x] Suporte a múltiplos assuntos no mesmo gráfico
- [x] Formato JSON compatível com Chart.js
- [x] Soft delete de gráficos
- [x] Validações de entrada
- [x] Documentação JSON completa

### **Banco de Dados (Pronto)**
- [x] Script SQL de migração
- [x] Tabela dashboard_graficos
- [x] Índices para performance
- [x] Trigger de auto-atualização de timestamp
- [x] Dados de exemplo (3 gráficos)

### **Frontend (Você deve implementar)**
- [ ] Página dashboard com 12 cards
- [ ] Página de seleção de assuntos
- [ ] Formulário de criação de gráfico
- [ ] Página de visualização de gráficos salvos
- [ ] Botão "Gráficos" no dashboard
- [ ] Integração com Chart.js
- [ ] Seleção de tipo de gráfico (bar, line, pie, etc)

---

## 🎨 Sugestão de Interface

### **Página 1: Dashboard (12 Cards)**

```
+-----------------------------------------------------------+
|  [📊 Dashboard]  [Gráficos]  [Configurações]             |
+-----------------------------------------------------------+
|                                                           |
|  +-------------+  +-------------+  +-------------+        |
|  | 📉 Perdas   |  | ⚫ Leads    |  | 🔄 Leads    |        |
|  | Clientes    |  | Ruins       |  | Recuperadas |        |
|  | Fidelizados |  | Perdidas    |  |             |        |
|  | 5 este mês  |  | 12 este mês |  | 10 este mês |        |
|  +-------------+  +-------------+  +-------------+        |
|                                                           |
|  +-------------+  +-------------+  +-------------+        |
|  | 🔥 Leads    |  | ⏱️ Tempo    |  | 🌡️ Distrib. |        |
|  | Queimando   |  | por OS      |  | Prioridade  |        |
|  | Perdidas    |  |             |  |             |        |
|  +-------------+  +-------------+  +-------------+        |
|                                                           |
|  ... (mais 6 cards)                                       |
+-----------------------------------------------------------+
```

### **Página 2: Seleção de Assuntos**

```
+-----------------------------------------------------------+
|  [⬅️ Voltar]  Criar Gráfico Personalizado                 |
+-----------------------------------------------------------+
|                                                           |
|  Título: [____________________________________]           |
|  Tipo:   [Linhas ▼]                                      |
|                                                           |
|  Selecione os assuntos para comparar:                    |
|                                                           |
|  ☑ Perdas de Clientes Fidelizados                        |
|  ☐ Perda de Leads Ruins                                  |
|  ☑ Leads Recuperadas                                     |
|  ☐ Leads Queimando Perdidas                              |
|  ... (mais 8 opções)                                      |
|                                                           |
|  [Criar Gráfico]                                          |
+-----------------------------------------------------------+
```

### **Página 3: Visualização de Gráfico**

```
+-----------------------------------------------------------+
|  [⬅️ Voltar]  Análise de Perdas vs Recuperações           |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+  |
|  |                                                     |  |
|  |         [GRÁFICO CHART.JS AQUI]                    |  |
|  |                                                     |  |
|  |   Linha 1: Perdas de Clientes (vermelho)          |  |
|  |   Linha 2: Leads Recuperadas (verde)              |  |
|  |                                                     |  |
|  +-----------------------------------------------------+  |
|                                                           |
|  [Editar]  [Exportar PNG]  [Compartilhar]  [Deletar]     |
+-----------------------------------------------------------+
```

---

## 🧪 Como Testar

### **1. Testar API diretamente**

```bash
# Iniciar servidor
python routes.py

# Em outro terminal, testar endpoints
curl http://localhost:5004/api/dashboard/assuntos
curl http://localhost:5004/api/dashboard/estatisticas
curl http://localhost:5004/api/dashboard/graficos-predefinidos
```

### **2. Testar criação de gráfico**

```bash
curl -X POST http://localhost:5004/api/dashboard/graficos \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","tipo_grafico":"bar","assuntos":["perdas_clientes_fidelizados"]}'
```

### **3. Testar obtenção de dados**

```bash
curl http://localhost:5004/api/dashboard/graficos/1/dados
```

---

## 🚀 Próximos Passos

1. **Execute a migração SQL** → Criar tabela `dashboard_graficos`
2. **Inicie a API** → `python routes.py`
3. **Teste os endpoints** → Use CURL ou Postman
4. **Implemente o frontend** → Use os exemplos JavaScript acima
5. **Integre com Chart.js** → Renderize os gráficos com os dados JSON

---

## 📞 Suporte

Todos os endpoints retornam JSON no formato:
```json
{
  "success": true/false,
  "data": {...},
  "error": "mensagem de erro (se houver)"
}
```

Para detalhes completos, consulte **dashboard_api_docs.json**.

---

**🎉 Sistema pronto para uso! O backend Python está 100% funcional, aguardando apenas integração com o frontend existente.**
