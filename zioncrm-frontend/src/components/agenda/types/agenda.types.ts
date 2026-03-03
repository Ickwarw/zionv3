export interface EventType {
  id: number;
  name: string;
}

export interface Compromisso {
  id?: number;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  event_type_id: number;
  event_type?: EventType;
  is_public?: boolean;
  color?: string;
  reminder_minutes?: number;
}

export interface EventoCalendario {
  id: number;
  titulo: string;
  data: string;
  horario: string;
  tipo: string;
  status: string;
}
