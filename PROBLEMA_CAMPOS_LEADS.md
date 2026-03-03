# ⚠️ PROBLEMA ENCONTRADO - Componentes de Leads

## 🔴 Status: INCOMPATIBILIDADE DE CAMPOS

Os componentes de leads no frontend estão usando **campos antigos** que NÃO correspondem aos campos do backend!

---

## 📊 Comparação de Campos:

| **Componente Usa** | **Backend Espera** | **Status** |
|-------------------|-------------------|-----------|
| `lead.name` | `lead.razao` | ❌ INCOMPATÍVEL |
| `lead.phone` | `lead.fone` | ❌ INCOMPATÍVEL |
| `lead.company` | `lead.fantasia` | ❌ INCOMPATÍVEL |
| `lead.address` | `lead.endereco` | ❌ INCOMPATÍVEL |
| `lead.email` | `lead.email` | ✅ OK |

---

## 🔍 Componentes Afetados:

### 1. **LeadsTable.tsx** ❌
```tsx
// Linha 104-107: Usando campos antigos
<TableCell>{lead.name}</TableCell>        // ❌ Deveria ser lead.razao
<TableCell>{lead.phone}</TableCell>       // ❌ Deveria ser lead.fone
<TableCell>{lead.company}</TableCell>     // ❌ Deveria ser lead.fantasia
```

### 2. **LeadsKanban.tsx** ❌
```tsx
// Linha 59-65: Usando campos antigos no update
name: updatedLead.name,              // ❌ Deveria ser razao
phone: updatedLead.phone,            // ❌ Deveria ser fone
company: updatedLead.company,        // ❌ Deveria ser fantasia
address: updatedLead.address,        // ❌ Deveria ser endereco

// Linha 182: Exibindo campos antigos
<h4>{lead.name}</h4>                 // ❌ Deveria ser lead.razao
<span>{lead.phone}</span>            // ❌ Deveria ser lead.fone
<span>{lead.company}</span>          // ❌ Deveria ser lead.fantasia
```

### 3. **LeadDetails.tsx** ❌
```tsx
// Linha 45-53: Usando campos antigos no formData
name: localLead.name,                // ❌ Deveria ser razao
phone: localLead.phone,              // ❌ Deveria ser fone
company: localLead.company,          // ❌ Deveria ser fantasia
address: localLead.address,          // ❌ Deveria ser endereco
```

### 4. **LeadModal.tsx** ❌
```tsx
// Linha 53: Exibindo campos antigos
<div><strong>Nome:</strong> {lead.name}</div>  // ❌ Deveria ser lead.razao
```

### 5. **NewLeadModal.tsx** ✅
```tsx
// Este SIM está correto! Usa os campos novos
razao: '', cnpj_cpf: '', ie_identidade: '', ...
```

---

## 🎯 Impacto do Problema:

### Cenário 1: Cadastro via NewLeadModal
✅ **Funciona!** Envia campos corretos (razao, fone, fantasia)
❌ **MAS** quando visualiza na tabela/kanban → aparece vazio porque procura por name/phone/company

### Cenário 2: Edição via LeadDetails
❌ **NÃO funciona!** Tenta atualizar com campos antigos (name, phone, company)
❌ Backend rejeita ou ignora esses campos

### Cenário 3: Drag & Drop no Kanban
❌ **NÃO funciona!** Tenta enviar lead.name, lead.phone ao invés de lead.razao, lead.fone

### Cenário 4: Listagem de Leads
❌ **Aparece vazio!** Mesmo que tenha dados no banco (razao, fone), procura por name/phone

---

## 💡 Solução:

### Opção A: **Mapear no Backend** (Temporário)
Backend retorna dados duplicados:
```json
{
  "razao": "João Silva",
  "name": "João Silva",      // Compatibilidade
  "fone": "(11) 98765-4321",
  "phone": "(11) 98765-4321" // Compatibilidade
}
```

### Opção B: **Atualizar Todos os Componentes** ✅ RECOMENDADO
Alterar TODOS os componentes para usar campos corretos:
- `lead.name` → `lead.razao`
- `lead.phone` → `lead.fone`
- `lead.company` → `lead.fantasia`
- `lead.address` → `lead.endereco`

### Opção C: **Criar Helper/Adapter**
Função que converte entre formatos:
```typescript
const adaptLead = (lead: Lead) => ({
  ...lead,
  name: lead.razao,
  phone: lead.fone,
  company: lead.fantasia,
  address: lead.endereco
});
```

---

## 🚀 Recomendação:

**Implementar Opção B** - Atualizar todos os componentes para usar os campos corretos do backend.

Isso garante:
1. ✅ Compatibilidade total com backend
2. ✅ Dados exibidos corretamente
3. ✅ Edição funcionando
4. ✅ Kanban drag & drop funcionando
5. ✅ Sem duplicação de dados

---

## 📝 Componentes que Precisam Correção:

1. ❌ LeadsTable.tsx (6 ocorrências)
2. ❌ LeadsKanban.tsx (9 ocorrências)
3. ❌ LeadDetails.tsx (20+ ocorrências)
4. ❌ LeadModal.tsx (10+ ocorrências)
5. ❌ LeadsKanban-old.tsx (5 ocorrências)
6. ✅ NewLeadModal.tsx (já correto!)

---

## ⚡ Ação Necessária:

Devo corrigir TODOS os componentes agora para usar os campos corretos (razao, fone, fantasia, endereco)?
