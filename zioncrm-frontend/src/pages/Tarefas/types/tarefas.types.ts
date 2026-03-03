
export interface Tarefa {
  id: number;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'aberta' | 'encaminhada' | 'agendada' | 'pendente' | 'em_andamento' | 'em_execucao' | 'reaberta' | 'finalizada';
  dueDate: string;
  assignee: string;
  category: string;
  setor?: string;
  criadoPor: string;
  leadVinculada?: string;
  dataAgendamento?: string;
  horaAgendamento?: string;
}



export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed_at: string | null;
  status_id: number;
  status: {
    id: number;
    name: string;
    color: string;
    order: number;
  } | null;
  priority_id: number;
  priority: {
    id: number;
    name: string;
    color: string;
    order: number;
  } | null;
  category_id: number;
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
  assigned_to: number;
  assignee: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  created_by: number;
  creator: {
    id: number;
    username: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface TaskPriority {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface TaskCategory {
  id: number;
  name: string;
  color: string;
}

export interface TaskStatistics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  tasks_by_status: Array<{
    name: string;
    color: string;
    count: number;
  }>;
  tasks_by_priority: Array<{
    name: string;
    color: string;
    count: number;
  }>;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}
