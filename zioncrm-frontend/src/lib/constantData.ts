import { clsx, type ClassValue } from "clsx"
import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";
import { twMerge } from "tailwind-merge"

const paymentMethod = [
  { "id": "cash", "name": "Dinheiro" },
  { "id": "credit-card", "name": 'Cartão de Crédito' },
  { "id": "debit-card", "name": 'Cartão de Débito' },
  { "id": "pix", "name": 'PIX' },
  { "id": "bank-transfer", "name": 'Transferência Bancária' },
  { "id": "payment-order", "name": 'Boleto' },
  { "id": "check", "name": 'Cheque' }
];

export function getPaymentMethods() {
  return paymentMethod;
}

export function getPaymentMethodsDescription(id: string):string {
  for (let index = 0; index < paymentMethod.length; index++) {
    const element = paymentMethod[index];
    if (element['id'] == id) {
      return element['name'];
    }
  }
  return "Nenhum";
}

export function getCategoryTypeDescription(value): string {
  if (value == 'income') {
    return "Receita";
  } else if (value == 'expense') {
    return "Despesa";
  } else if (value == 'both') {
    return "Receita/Despesa";
  }
  return "Nenhum";
}

export function mountCategoryTypeIcon(categoryList): [] {
  categoryList.map((item) => {
    if (item.type == 'income') {
      item['icon'] = TrendingUp;
      item['icon_class'] = 'bg-gradient-to-r from-green-500 to-emerald-500'
    } else if (item.type == 'expense') {
      item['icon'] = TrendingDown;
      item['icon_class'] = 'bg-gradient-to-r from-red-500 to-pink-500';
    } else {
      item['icon'] = TrendingUpDown;
      item['icon_class'] = 'bg-gradient-to-r from-red-500 to-green-500';
    }
  });
  return categoryList;
}

export const accountType = [
  { "id": "checking", "name": "Conta Corrente" },
  { "id": "savings", "name": 'Poupança' },
  { "id": "credit", "name": 'Crédito' },
  { "id": "cash", "name": 'Dinheiro' },
];


export function getAccountTypeDescription(value): string {
  for (let index = 0; index < accountType.length; index++) {
    const element = accountType[index];
    if (element['id'] == value) {
      return element['name'];
    }
  }
  return "Nenhum";
}

export const budgetPeriod = [
  { "id": "weekly", "name": "Semanalmente" },
  { "id": "monthly", "name": 'Mensalmente' },
  { "id": "yearly", "name": 'Anualmente' },
];

export function getBudgetPeriodDescription(value): string {
  for (let index = 0; index < budgetPeriod.length; index++) {
    const element = budgetPeriod[index];
    if (element['id'] == value) {
      return element['name'];
    }
  }
  return "Nenhum";
}

export function getChatStatusDescription(value): string {
  if (value == 'pending') {
    return "Pendente de Atendimento";
  } else if (value == 'in_progress') {
    return "Em Atendimento";
  } else if (value == 'under_review') {
    return "Em Avaliação";
  } else if (value == 'completed') {
    return "Finalizado";
  }
  return "Nenhum";
}
