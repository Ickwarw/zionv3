
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
