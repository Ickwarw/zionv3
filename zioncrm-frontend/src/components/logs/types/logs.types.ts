export interface LogsByType {
  count: number;
  type: string;
}

export interface LogsByUser {
  count: number;
  username: string;
}

export interface LogsByDay {
  count: number;
  date: string;
}

export interface Stats {
  total_logs: number;
  logs_by_type: LogsByType[];
  logs_by_user: LogsByUser[];
  logs_by_day: LogsByDay[];
}
