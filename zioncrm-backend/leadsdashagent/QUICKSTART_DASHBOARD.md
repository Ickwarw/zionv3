# 🚀 Guia Rápido - Dashboard de Gráficos

## ⚡ Início Rápido (5 minutos)

### **1️⃣ Execute a migração do banco de dados**

```bash
psql -h 45.160.180.34 -p 5432 -U zioncrm -d zioncrm -f migration_dashboard.sql
```

Ou execute manualmente no pgAdmin/DBeaver o conteúdo de `migration_dashboard.sql`.

---

### **2️⃣ Inicie a API do Dashboard**

```bash
python routes.py
```

Aguarde a mensagem:
```
🚀 Dashboard API - Sistema de Gráficos Personalizáveis
===================================================================
🌐 Iniciando servidor na porta 5004...
```

---

### **3️⃣ Teste a API**

Em outro terminal:

```bash
python test_dashboard_api.py
```

Ou manualmente:

```bash
curl http://localhost:5004/api/dashboard/assuntos
```

---

### **4️⃣ Integre com seu frontend**

**Exemplo básico HTML:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <canvas id="myChart"></canvas>
    
    <script>
        // Buscar dados de um assunto
        fetch('http://localhost:5004/api/dashboard/assuntos/distribuicao_prioridade')
            .then(res => res.json())
            .then(result => {
                const chartData = result.data;
                
                new Chart(document.getElementById('myChart'), {
                    type: 'bar',
                    data: {
                        labels: chartData.labels,
                        datasets: [{
                            label: chartData.label,
                            data: chartData.data,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)'
                        }]
                    }
                });
            });
    </script>
</body>
</html>
```

---

## 📊 Principais Endpoints

### **Assuntos Disponíveis**
```bash
GET http://localhost:5004/api/dashboard/assuntos
```

### **Dados de um Assunto**
```bash
GET http://localhost:5004/api/dashboard/assuntos/perdas_clientes_fidelizados
```

### **Criar Gráfico Personalizado**
```bash
POST http://localhost:5004/api/dashboard/graficos
Content-Type: application/json

{
  "titulo": "Meu Gráfico",
  "tipo_grafico": "line",
  "assuntos": ["perdas_clientes_fidelizados", "leads_recuperadas"]
}
```

### **Dados do Gráfico (Chart.js)**
```bash
GET http://localhost:5004/api/dashboard/graficos/1/dados
```

---

## 🎨 12 Assuntos Predefinidos

1. 📉 **perdas_clientes_fidelizados** - Clientes satisfeitos que cancelaram
2. ⚫ **perdas_leads_ruins** - Leads ruins perdidas
3. 🔄 **leads_recuperadas** - Leads recuperadas
4. 🔥 **leads_queimando_perdidas** - Alta prioridade perdidas
5. ⏱️ **tempo_ordem_servico_funcionario** - Performance por funcionário
6. 🌡️ **distribuicao_prioridade** - Leads por temperatura
7. 🏢 **distribuicao_departamento** - Vendas vs Pós-Venda
8. 📊 **taxa_conversao_vendas** - Funil de vendas
9. ⭐ **satisfacao_cliente** - Níveis de contentamento
10. 📱 **origem_leads** - Leads por canal
11. 💰 **status_financeiro** - Em dia vs Atrasado
12. 📈 **score_medio_periodo** - Evolução do score

---

## 💡 Próximos Passos

1. ✅ **Backend pronto** - models.py e routes.py funcionando
2. 🎨 **Implemente o frontend** - Use os endpoints JSON
3. 📊 **Integre Chart.js** - Renderize os gráficos
4. 🔗 **Dashboard** - Crie os 12 cards clicáveis

---

## 📚 Documentação Completa

- **README_DASHBOARD.md** - Documentação detalhada
- **dashboard_api_docs.json** - Referência de API completa
- **models.py** - Ver queries SQL dos assuntos
- **routes.py** - Ver todos os endpoints disponíveis

---

## 🆘 Problemas?

**Erro: Tabela não existe**
```bash
# Execute a migração
psql -h 45.160.180.34 -p 5432 -U zioncrm -d zioncrm -f migration_dashboard.sql
```

**Erro: Porta já em uso**
```bash
# Mude a porta em routes.py (última linha)
app.run(host='0.0.0.0', port=5005, debug=True)  # Use outra porta
```

**Erro: Módulo não encontrado**
```bash
pip install flask flask-cors psycopg2-binary
```

---

## 🎉 Pronto!

O sistema está 100% funcional no backend. Basta integrar com seu frontend existente usando os endpoints JSON documentados.

**Base URL:** `http://localhost:5004`
