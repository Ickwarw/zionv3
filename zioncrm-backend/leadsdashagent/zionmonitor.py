"""
Zion Monitor - Sistema de Monitoramento e Logging Centralizado
Monitora conectividade, exportações, erros e performance
"""

import json
import os
import threading
import time
from datetime import datetime, timedelta
from collections import deque
import mysql.connector
import psycopg2

# Arquivo de estado do monitoramento
MONITOR_STATE_FILE = os.path.join(os.path.dirname(__file__), "zionmonitor_state.json")
MONITOR_LOCK = threading.Lock()

# Histórico de logs em memória (últimos 1000 eventos)
LOG_HISTORY = deque(maxlen=1000)

# Estatísticas em tempo real
STATS = {
    "mysql": {
        "status": "unknown",
        "last_check": None,
        "last_success": None,
        "last_error": None,
        "total_checks": 0,
        "successful_checks": 0,
        "failed_checks": 0,
        "avg_response_time": 0,
        "response_times": deque(maxlen=100)
    },
    "postgres": {
        "status": "unknown",
        "last_check": None,
        "last_success": None,
        "last_error": None,
        "total_checks": 0,
        "successful_checks": 0,
        "failed_checks": 0,
        "avg_response_time": 0,
        "response_times": deque(maxlen=100)
    },
    "exports": {}
}


class ZionMonitor:
    """Classe principal de monitoramento"""
    
    def __init__(self, export_name):
        self.export_name = export_name
        self.start_time = datetime.now()
        
        # Inicializa estatísticas do export se não existir
        if export_name not in STATS["exports"]:
            STATS["exports"][export_name] = {
                "status": "stopped",
                "start_time": None,
                "last_sync": None,
                "total_syncs": 0,
                "total_records": 0,
                "total_errors": 0,
                "current_cycle": 0,
                "tables": {},
                "errors": deque(maxlen=50),
                "performance": {
                    "avg_sync_time": 0,
                    "avg_records_per_second": 0,
                    "sync_times": deque(maxlen=100)
                }
            }
    
    def log(self, level, message, extra=None):
        """
        Registra um log
        level: DEBUG, INFO, WARNING, ERROR, CRITICAL
        """
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "export": self.export_name,
            "level": level,
            "message": message,
            "extra": extra or {}
        }
        
        with MONITOR_LOCK:
            LOG_HISTORY.append(log_entry)
        
        # Print console
        time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        level_emoji = {
            "DEBUG": "🔍",
            "INFO": "ℹ️",
            "WARNING": "⚠️",
            "ERROR": "❌",
            "CRITICAL": "🚨"
        }.get(level, "📝")
        
        print(f"{level_emoji} [{time_str}] [{self.export_name}] {message}")
        
        # Salva periodicamente
        if level in ["ERROR", "CRITICAL"]:
            self._save_state()
    
    def log_debug(self, message, **kwargs):
        self.log("DEBUG", message, kwargs)
    
    def log_info(self, message, **kwargs):
        self.log("INFO", message, kwargs)
    
    def log_warning(self, message, **kwargs):
        self.log("WARNING", message, kwargs)
    
    def log_error(self, message, **kwargs):
        self.log("ERROR", message, kwargs)
        # Adiciona às estatísticas de erro
        with MONITOR_LOCK:
            STATS["exports"][self.export_name]["total_errors"] += 1
            STATS["exports"][self.export_name]["errors"].append({
                "timestamp": datetime.now().isoformat(),
                "message": message,
                "details": kwargs
            })
    
    def log_critical(self, message, **kwargs):
        self.log("CRITICAL", message, kwargs)
    
    def start_export(self):
        """Marca o início da exportação"""
        with MONITOR_LOCK:
            STATS["exports"][self.export_name]["status"] = "running"
            STATS["exports"][self.export_name]["start_time"] = datetime.now().isoformat()
        self.log_info(f"Exportação iniciada")
    
    def stop_export(self):
        """Marca o fim da exportação"""
        with MONITOR_LOCK:
            STATS["exports"][self.export_name]["status"] = "stopped"
        self.log_info(f"Exportação finalizada")
    
    def start_cycle(self, cycle_number):
        """Marca o início de um ciclo de sincronização"""
        with MONITOR_LOCK:
            STATS["exports"][self.export_name]["current_cycle"] = cycle_number
            STATS["exports"][self.export_name]["cycle_start"] = time.time()
    
    def end_cycle(self, records_synced):
        """Marca o fim de um ciclo de sincronização"""
        with MONITOR_LOCK:
            export_stats = STATS["exports"][self.export_name]
            
            # Calcula tempo do ciclo
            if "cycle_start" in export_stats:
                cycle_time = time.time() - export_stats["cycle_start"]
                export_stats["performance"]["sync_times"].append(cycle_time)
                
                # Atualiza média
                sync_times = list(export_stats["performance"]["sync_times"])
                export_stats["performance"]["avg_sync_time"] = sum(sync_times) / len(sync_times)
                
                # Calcula registros por segundo
                if cycle_time > 0:
                    rps = records_synced / cycle_time
                    export_stats["performance"]["avg_records_per_second"] = rps
            
            export_stats["total_syncs"] += 1
            export_stats["total_records"] += records_synced
            export_stats["last_sync"] = datetime.now().isoformat()
    
    def log_table_sync(self, table_name, records_synced, duration=None):
        """Registra sincronização de uma tabela"""
        with MONITOR_LOCK:
            tables = STATS["exports"][self.export_name]["tables"]
            
            if table_name not in tables:
                tables[table_name] = {
                    "total_syncs": 0,
                    "total_records": 0,
                    "last_sync": None,
                    "errors": 0
                }
            
            tables[table_name]["total_syncs"] += 1
            tables[table_name]["total_records"] += records_synced
            tables[table_name]["last_sync"] = datetime.now().isoformat()
            
            if duration:
                tables[table_name]["last_duration"] = duration
        
        self.log_info(f"Tabela {table_name}: {records_synced} registros sincronizados")
    
    def log_table_error(self, table_name, error_message):
        """Registra erro em uma tabela"""
        with MONITOR_LOCK:
            tables = STATS["exports"][self.export_name]["tables"]
            
            if table_name not in tables:
                tables[table_name] = {
                    "total_syncs": 0,
                    "total_records": 0,
                    "last_sync": None,
                    "errors": 0
                }
            
            tables[table_name]["errors"] += 1
            tables[table_name]["last_error"] = {
                "timestamp": datetime.now().isoformat(),
                "message": error_message
            }
        
        self.log_error(f"Erro na tabela {table_name}: {error_message}", table=table_name)
    
    def _save_state(self):
        """Salva estado em arquivo"""
        try:
            with MONITOR_LOCK:
                state = {
                    "timestamp": datetime.now().isoformat(),
                    "stats": self._serialize_stats(),
                    "recent_logs": list(LOG_HISTORY)[-100:]  # Últimos 100 logs
                }
            
            with open(MONITOR_STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, default=str)
        except Exception as e:
            print(f"❌ Erro ao salvar estado do monitor: {str(e)}")
    
    def _serialize_stats(self):
        """Serializa estatísticas para JSON"""
        serialized = {}
        for key, value in STATS.items():
            if isinstance(value, dict):
                serialized[key] = {}
                for k, v in value.items():
                    if isinstance(v, deque):
                        serialized[key][k] = list(v)
                    elif isinstance(v, dict):
                        serialized[key][k] = self._serialize_dict(v)
                    else:
                        serialized[key][k] = v
            else:
                serialized[key] = value
        return serialized
    
    def _serialize_dict(self, d):
        """Serializa dicionário recursivamente"""
        result = {}
        for k, v in d.items():
            if isinstance(v, deque):
                result[k] = list(v)
            elif isinstance(v, dict):
                result[k] = self._serialize_dict(v)
            else:
                result[k] = v
        return result


def check_mysql_connectivity(config):
    """Verifica conectividade com MySQL/MariaDB"""
    start_time = time.time()
    
    try:
        conn = mysql.connector.connect(**config, connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        
        duration = time.time() - start_time
        
        with MONITOR_LOCK:
            STATS["mysql"]["status"] = "connected"
            STATS["mysql"]["last_check"] = datetime.now().isoformat()
            STATS["mysql"]["last_success"] = datetime.now().isoformat()
            STATS["mysql"]["last_error"] = None
            STATS["mysql"]["total_checks"] += 1
            STATS["mysql"]["successful_checks"] += 1
            STATS["mysql"]["response_times"].append(duration)
            
            # Calcula média
            response_times = list(STATS["mysql"]["response_times"])
            STATS["mysql"]["avg_response_time"] = sum(response_times) / len(response_times)
        
        return True, None
        
    except Exception as e:
        duration = time.time() - start_time
        error_msg = str(e)
        
        with MONITOR_LOCK:
            STATS["mysql"]["status"] = "disconnected"
            STATS["mysql"]["last_check"] = datetime.now().isoformat()
            STATS["mysql"]["last_error"] = {
                "timestamp": datetime.now().isoformat(),
                "message": error_msg,
                "type": type(e).__name__
            }
            STATS["mysql"]["total_checks"] += 1
            STATS["mysql"]["failed_checks"] += 1
        
        return False, error_msg


def check_postgres_connectivity(config):
    """Verifica conectividade com PostgreSQL"""
    start_time = time.time()
    
    try:
        conn = psycopg2.connect(**config, connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        
        duration = time.time() - start_time
        
        with MONITOR_LOCK:
            STATS["postgres"]["status"] = "connected"
            STATS["postgres"]["last_check"] = datetime.now().isoformat()
            STATS["postgres"]["last_success"] = datetime.now().isoformat()
            STATS["postgres"]["last_error"] = None
            STATS["postgres"]["total_checks"] += 1
            STATS["postgres"]["successful_checks"] += 1
            STATS["postgres"]["response_times"].append(duration)
            
            # Calcula média
            response_times = list(STATS["postgres"]["response_times"])
            STATS["postgres"]["avg_response_time"] = sum(response_times) / len(response_times)
        
        return True, None
        
    except Exception as e:
        duration = time.time() - start_time
        error_msg = str(e)
        
        with MONITOR_LOCK:
            STATS["postgres"]["status"] = "disconnected"
            STATS["postgres"]["last_check"] = datetime.now().isoformat()
            STATS["postgres"]["last_error"] = {
                "timestamp": datetime.now().isoformat(),
                "message": error_msg,
                "type": type(e).__name__
            }
            STATS["postgres"]["total_checks"] += 1
            STATS["postgres"]["failed_checks"] += 1
        
        return False, error_msg


def get_stats():
    """Retorna estatísticas serializadas"""
    with MONITOR_LOCK:
        monitor = ZionMonitor("system")
        return monitor._serialize_stats()


def get_logs(limit=100, level=None, export=None):
    """Retorna logs filtrados"""
    with MONITOR_LOCK:
        logs = list(LOG_HISTORY)
    
    # Filtra por level
    if level:
        logs = [log for log in logs if log["level"] == level]
    
    # Filtra por export
    if export:
        logs = [log for log in logs if log["export"] == export]
    
    # Limita quantidade
    return logs[-limit:]


def get_export_status(export_name=None):
    """Retorna status de exportação(ões)"""
    with MONITOR_LOCK:
        if export_name:
            return STATS["exports"].get(export_name, {})
        else:
            return STATS["exports"]


def get_connectivity_status():
    """Retorna status de conectividade"""
    with MONITOR_LOCK:
        return {
            "mysql": dict(STATS["mysql"]),
            "postgres": dict(STATS["postgres"])
        }


def get_dashboard_data():
    """Retorna todos os dados para o dashboard"""
    return {
        "timestamp": datetime.now().isoformat(),
        "connectivity": get_connectivity_status(),
        "exports": get_export_status(),
        "recent_logs": get_logs(limit=50),
        "stats": get_stats()
    }


# Auto-save periódico
def _auto_save_worker():
    """Worker thread para salvar estado periodicamente"""
    while True:
        time.sleep(30)  # Salva a cada 30 segundos
        monitor = ZionMonitor("system")
        monitor._save_state()


# Inicia worker de auto-save
_save_thread = threading.Thread(target=_auto_save_worker, daemon=True)
_save_thread.start()
