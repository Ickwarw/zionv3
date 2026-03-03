import json
import os
import time
from datetime import datetime
from threading import Thread, Lock
import mysql.connector
import psycopg2
import psycopg2.extras

# Importa sistema de monitoramento
from zionmonitor import ZionMonitor, check_mysql_connectivity, check_postgres_connectivity

# Configurações do banco MariaDB (origem)
MYSQL_CONFIG = {
    "host": "45.160.180.14",
    "port": 3306,
    "user": "leitura",
    "password": "abwmwwTZCKefsiCwGKsKoTAy8Ak=",
    "database": "ixcprovedor",
}

# Configurações do banco PostgreSQL (destino)
POSTGRES_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}

BATCH_SIZE = 500
POLL_SECONDS = 10
STATE_FILE = os.path.join(os.path.dirname(__file__), "zionexportinfos_state.json")
state_lock = Lock()

# Inicializa monitor
monitor = ZionMonitor("zionexportinfos")

# Definição das tabelas e seus campos
TABLES_CONFIG = {
    "su_oss_chamado": {
        "columns": ["id", "id_cliente", "id_login", "prioridade", "id_assunto", "mensagem",
                   "data_abertura", "data_agenda", "id_tecnico", "mensagem_resposta", "status",
                   "id_filial", "id_atendente", "data_fechamento", "setor", "data_inicio",
                   "protocolo", "data_reabertura", "motivo_reabertura", "id_usuario_reabertura",
                   "data_final", "impresso", "id_ticket", "id_cobranca", "id_oss_chamado",
                   "data_hora_analise", "data_hora_encaminhado", "data_hora_assumido",
                   "data_hora_execucao", "id_wfl_param_os", "id_wfl_tarefa", "valor_total",
                   "valor_outras_despesas", "valor_total_comissao", "id_contrato_kit",
                   "gera_comissao", "valor_unit_comissao", "melhor_horario_agenda", "idx",
                   "id_resposta", "latitude", "longitude", "preview", "origem_endereco",
                   "endereco", "justificativa_sla_atrasado", "id_receber", "id_circuito",
                   "id_su_diagnostico", "id_cidade", "mostrar_os_sem_funcionario", "bairro",
                   "id_estrutura", "tipo", "origem_endereco_estrutura", "liberado",
                   "data_agenda_final", "data_prazo_limite", "data_reservada", "data_reagendar",
                   "data_prev_final", "origem_cadastro", "status_sla", "complemento",
                   "referencia", "bloco", "apartamento", "ultima_atualizacao", "id_condominio",
                   "origem_finalizacao", "notificacao_push_agrupada", "origem_os_aberta",
                   "habilita_assinatura_cliente", "status_assinatura", "status_pesquisa_satisfacao"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_cliente": "INTEGER",
            "id_login": "INTEGER",
            "prioridade": "VARCHAR(1)",
            "id_assunto": "INTEGER",
            "mensagem": "TEXT",
            "data_abertura": "TIMESTAMP",
            "data_agenda": "TIMESTAMP",
            "id_tecnico": "INTEGER",
            "mensagem_resposta": "TEXT",
            "status": "VARCHAR(3)",
            "id_filial": "INTEGER",
            "id_atendente": "VARCHAR(150)",
            "data_fechamento": "TIMESTAMP",
            "setor": "INTEGER",
            "data_inicio": "TIMESTAMP",
            "protocolo": "VARCHAR(50)",
            "data_reabertura": "TIMESTAMP",
            "motivo_reabertura": "VARCHAR(500)",
            "id_usuario_reabertura": "INTEGER",
            "data_final": "TIMESTAMP",
            "impresso": "VARCHAR(1)",
            "id_ticket": "INTEGER",
            "id_cobranca": "INTEGER",
            "id_oss_chamado": "INTEGER",
            "data_hora_analise": "TIMESTAMP",
            "data_hora_encaminhado": "TIMESTAMP",
            "data_hora_assumido": "TIMESTAMP",
            "data_hora_execucao": "TIMESTAMP",
            "id_wfl_param_os": "INTEGER",
            "id_wfl_tarefa": "INTEGER",
            "valor_total": "NUMERIC(15,2)",
            "valor_outras_despesas": "NUMERIC(15,2)",
            "valor_total_comissao": "NUMERIC(10,2)",
            "id_contrato_kit": "INTEGER",
            "gera_comissao": "VARCHAR(1)",
            "valor_unit_comissao": "NUMERIC(10,2)",
            "melhor_horario_agenda": "VARCHAR(1)",
            "idx": "INTEGER",
            "id_resposta": "INTEGER",
            "latitude": "VARCHAR(50)",
            "longitude": "VARCHAR(50)",
            "preview": "TEXT",
            "origem_endereco": "VARCHAR(2)",
            "endereco": "VARCHAR(150)",
            "justificativa_sla_atrasado": "TEXT",
            "id_receber": "BIGINT",
            "id_circuito": "INTEGER",
            "id_su_diagnostico": "INTEGER",
            "id_cidade": "INTEGER",
            "mostrar_os_sem_funcionario": "VARCHAR(1)",
            "bairro": "VARCHAR(100)",
            "id_estrutura": "INTEGER",
            "tipo": "VARCHAR(1)",
            "origem_endereco_estrutura": "VARCHAR(1)",
            "liberado": "INTEGER",
            "data_agenda_final": "TIMESTAMP",
            "data_prazo_limite": "TIMESTAMP",
            "data_reservada": "DATE",
            "data_reagendar": "TIMESTAMP",
            "data_prev_final": "TIMESTAMP",
            "origem_cadastro": "VARCHAR(3)",
            "status_sla": "VARCHAR(1)",
            "complemento": "VARCHAR(100)",
            "referencia": "VARCHAR(100)",
            "bloco": "VARCHAR(100)",
            "apartamento": "VARCHAR(100)",
            "ultima_atualizacao": "TIMESTAMP",
            "id_condominio": "INTEGER",
            "origem_finalizacao": "VARCHAR(3)",
            "notificacao_push_agrupada": "VARCHAR(1)",
            "origem_os_aberta": "VARCHAR(3)",
            "habilita_assinatura_cliente": "VARCHAR(1)",
            "status_assinatura": "VARCHAR(1)",
            "status_pesquisa_satisfacao": "INTEGER"
        },
        "track_column": "ultima_atualizacao"
    },
    "su_oss_chamado_arquivos": {
        "columns": ["id", "id_oss_chamado", "id_oss_chamado_mensagem", "descricao",
                   "local_arquivo", "data_envio", "nome_arquivo", "classificacao_arquivo", "tipo"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_oss_chamado": "INTEGER",
            "id_oss_chamado_mensagem": "INTEGER",
            "descricao": "VARCHAR(100)",
            "local_arquivo": "VARCHAR(500)",
            "data_envio": "TIMESTAMP",
            "nome_arquivo": "VARCHAR(500)",
            "classificacao_arquivo": "VARCHAR(1)",
            "tipo": "VARCHAR(1)"
        },
        "track_column": "data_envio"
    },
    "su_oss_chamado_historico": {
        "columns": ["id", "su_oss_chamado_id", "su_oss_chamado_tipo", "data_movimentacao",
                   "operador_id", "acao", "tipo", "descricao", "quantidade", "valor_unitario",
                   "valor_total", "patrimonio_id", "patrimonio_numero", "almoxarifado_id",
                   "mac", "numero_serie", "nome_arquivo"],
        "types": {
            "id": "BIGINT PRIMARY KEY",
            "su_oss_chamado_id": "BIGINT",
            "su_oss_chamado_tipo": "VARCHAR(1)",
            "data_movimentacao": "TIMESTAMP",
            "operador_id": "INTEGER",
            "acao": "VARCHAR(50)",
            "tipo": "VARCHAR(50)",
            "descricao": "TEXT",
            "quantidade": "NUMERIC(15,9)",
            "valor_unitario": "NUMERIC(18,9)",
            "valor_total": "NUMERIC(15,2)",
            "patrimonio_id": "INTEGER",
            "patrimonio_numero": "VARCHAR(50)",
            "almoxarifado_id": "INTEGER",
            "mac": "VARCHAR(100)",
            "numero_serie": "VARCHAR(50)",
            "nome_arquivo": "VARCHAR(500)"
        },
        "track_column": "data_movimentacao"
    },
    "su_oss_chamado_mensagem": {
        "columns": ["id", "id_chamado", "mensagem", "id_operador", "data", "status",
                   "id_tecnico", "id_evento", "data_inicio", "data_final", "id_compromisso",
                   "tipo_cobranca", "id_equipe", "id_proxima_tarefa", "finaliza_processo",
                   "id_resposta", "latitude", "longitude", "id_su_diagnostico",
                   "id_evento_status", "gps_time", "id_diagnostico_especifico", "historico",
                   "gera_comissao", "origem_registro"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_chamado": "INTEGER",
            "mensagem": "TEXT",
            "id_operador": "INTEGER",
            "data": "TIMESTAMP",
            "status": "VARCHAR(3)",
            "id_tecnico": "INTEGER",
            "id_evento": "INTEGER",
            "data_inicio": "TIMESTAMP",
            "data_final": "TIMESTAMP",
            "id_compromisso": "INTEGER",
            "tipo_cobranca": "VARCHAR(6)",
            "id_equipe": "INTEGER",
            "id_proxima_tarefa": "INTEGER",
            "finaliza_processo": "VARCHAR(1)",
            "id_resposta": "INTEGER",
            "latitude": "VARCHAR(45)",
            "longitude": "VARCHAR(45)",
            "id_su_diagnostico": "INTEGER",
            "id_evento_status": "INTEGER",
            "gps_time": "TIMESTAMP",
            "id_diagnostico_especifico": "INTEGER",
            "historico": "VARCHAR(200)",
            "gera_comissao": "VARCHAR(1)",
            "origem_registro": "VARCHAR(3)"
        },
        "track_column": "data"
    },
    "su_oss_evento": {
        "columns": ["id", "descricao"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "descricao": "VARCHAR(100)"
        },
        "track_column": "id"
    },
    "usuarios": {
        "columns": ["id", "id_grupo", "nome", "email", "senha", "id_caixa",
                   "recebimentos_dia_atual", "lancamentos_dia_atual", "vendedor_padrao",
                   "funcionario", "caixa_fn_receber", "status", "filtra_setor",
                   "filtra_funcionario", "desc_max_recebimento", "desc_max_venda",
                   "token_push", "crm_filtra_vendedor", "pagamentos_dia_atual",
                   "enviar_monitoramento_host", "acesso_webservice", "qtde_liberacoes",
                   "tipo_alcada", "mostrar_os_sem_funcionario", "enviar_notificacao_backup",
                   "imagem", "callcenter", "user_callcenter", "desc_max_renegociacao",
                   "inmap_filtra_vendedor", "permite_inutilizar_patrimonio",
                   "alter_passwd_date", "permite_acesso_ixc_mobile", "token_inmapservice",
                   "helpmode_enabled", "language", "permite_ver_diferenca",
                   "filtra_departamento_ticket", "filtra_funcionario_ticket",
                   "mostrar_ticket_sem_funcionario", "template", "administrador_kanban",
                   "versao_fiberdocs", "filtrar_plano_venda_filial_contrato", "scheme",
                   "token_webservice", "secret_code", "secret_active", "secret_url",
                   "email_verified", "sms_verified", "token_verified", "telefone",
                   "recovery_email", "is_valid_tfa", "desc_parc_atraso",
                   "finalizar_os_outro_setor", "desc_max_monetario",
                   "token_looker_generated_at", "permite_alterar_comunicacao_fn_apagar",
                   "filtra_colaborador_quadro_kanban", "permitir_alterar_versao_chaves",
                   "tipo_acesso", "mode_density", "workflow_click_count",
                   "timeline_click_count", "email_validation_status"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_grupo": "INTEGER",
            "nome": "VARCHAR(150)",
            "email": "VARCHAR(200)",
            "senha": "VARCHAR(255)",
            "id_caixa": "INTEGER",
            "recebimentos_dia_atual": "VARCHAR(1)",
            "lancamentos_dia_atual": "VARCHAR(1)",
            "vendedor_padrao": "INTEGER",
            "funcionario": "INTEGER",
            "caixa_fn_receber": "INTEGER",
            "status": "VARCHAR(1)",
            "filtra_setor": "VARCHAR(1)",
            "filtra_funcionario": "VARCHAR(1)",
            "desc_max_recebimento": "NUMERIC(5,2)",
            "desc_max_venda": "NUMERIC(5,2)",
            "token_push": "VARCHAR(180)",
            "crm_filtra_vendedor": "VARCHAR(1)",
            "pagamentos_dia_atual": "VARCHAR(1)",
            "enviar_monitoramento_host": "VARCHAR(1)",
            "acesso_webservice": "VARCHAR(1)",
            "qtde_liberacoes": "INTEGER",
            "tipo_alcada": "VARCHAR(3)",
            "mostrar_os_sem_funcionario": "VARCHAR(1)",
            "enviar_notificacao_backup": "VARCHAR(1)",
            "imagem": "VARCHAR(1024)",
            "callcenter": "VARCHAR(30)",
            "user_callcenter": "VARCHAR(1)",
            "desc_max_renegociacao": "NUMERIC(5,2)",
            "inmap_filtra_vendedor": "VARCHAR(1)",
            "permite_inutilizar_patrimonio": "VARCHAR(1)",
            "alter_passwd_date": "TIMESTAMP",
            "permite_acesso_ixc_mobile": "VARCHAR(1)",
            "token_inmapservice": "VARCHAR(163)",
            "helpmode_enabled": "VARCHAR(1)",
            "language": "VARCHAR(10)",
            "permite_ver_diferenca": "VARCHAR(1)",
            "filtra_departamento_ticket": "VARCHAR(1)",
            "filtra_funcionario_ticket": "VARCHAR(1)",
            "mostrar_ticket_sem_funcionario": "VARCHAR(1)",
            "template": "VARCHAR(2)",
            "administrador_kanban": "VARCHAR(1)",
            "versao_fiberdocs": "VARCHAR(1)",
            "filtrar_plano_venda_filial_contrato": "VARCHAR(1)",
            "scheme": "VARCHAR(255)",
            "token_webservice": "TEXT",
            "secret_code": "VARCHAR(300)",
            "secret_active": "VARCHAR(1)",
            "secret_url": "VARCHAR(300)",
            "email_verified": "SMALLINT",
            "sms_verified": "SMALLINT",
            "token_verified": "VARCHAR(250)",
            "telefone": "VARCHAR(25)",
            "recovery_email": "VARCHAR(200)",
            "is_valid_tfa": "SMALLINT",
            "desc_parc_atraso": "VARCHAR(1)",
            "finalizar_os_outro_setor": "VARCHAR(1)",
            "desc_max_monetario": "NUMERIC(15,2)",
            "token_looker_generated_at": "TIMESTAMP",
            "permite_alterar_comunicacao_fn_apagar": "VARCHAR(1)",
            "filtra_colaborador_quadro_kanban": "VARCHAR(1)",
            "permitir_alterar_versao_chaves": "VARCHAR(1)",
            "tipo_acesso": "VARCHAR(1)",
            "mode_density": "VARCHAR(1)",
            "workflow_click_count": "INTEGER",
            "timeline_click_count": "INTEGER",
            "email_validation_status": "VARCHAR(1)"
        },
        "track_column": "alter_passwd_date"
    }
}


def load_state():
    """Carrega o estado de sincronização de um arquivo JSON"""
    with state_lock:
        if not os.path.exists(STATE_FILE):
            return {table: {"last_sync": None} for table in TABLES_CONFIG.keys()}
        with open(STATE_FILE, "r", encoding="utf-8") as handle:
            state = json.load(handle)
        
        # Converte strings ISO para datetime
        for table in state:
            last_sync = state[table].get("last_sync")
            if last_sync:
                try:
                    state[table]["last_sync"] = datetime.fromisoformat(last_sync)
                except (ValueError, AttributeError):
                    state[table]["last_sync"] = None
        return state


def save_state(state):
    """Salva o estado de sincronização em um arquivo JSON"""
    with state_lock:
        with open(STATE_FILE, "w", encoding="utf-8") as handle:
            payload = {}
            for table, data in state.items():
                last_sync = data.get("last_sync")
                payload[table] = {
                    "last_sync": last_sync.isoformat() if last_sync else None
                }
            json.dump(payload, handle, indent=2)


def ensure_pg_table(cursor, table_name, config):
    """Cria a tabela no PostgreSQL se não existir"""
    column_defs = []
    for column in config["columns"]:
        column_type = config["types"].get(column, "TEXT")
        column_defs.append(f'"{column}" {column_type}')
    
    ddl = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(column_defs)})"
    cursor.execute(ddl)


def connect_mysql():
    """Conecta ao banco MariaDB"""
    try:
        return mysql.connector.connect(**MYSQL_CONFIG)
    except Exception as e:
        monitor.log_error(f"Erro ao conectar no MySQL: {str(e)}")
        raise


def connect_postgres():
    """Conecta ao banco PostgreSQL"""
    try:
        return psycopg2.connect(**POSTGRES_CONFIG)
    except Exception as e:
        monitor.log_error(f"Erro ao conectar no PostgreSQL: {str(e)}")
        raise


def normalize_value(value):
    """Normaliza valores para inserção no PostgreSQL"""
    if isinstance(value, datetime):
        return value
    return value


def fetch_rows(mysql_cursor, table_name, config, last_sync):
    """Busca registros do MariaDB em lotes"""
    columns_sql = ", ".join(f"`{col}`" for col in config["columns"])
    track_col = config.get("track_column", "id")
    
    if last_sync and track_col in config["columns"]:
        base_sql = (
            f"SELECT {columns_sql} FROM {table_name} "
            f"WHERE `{track_col}` > %s "
            f"ORDER BY `{track_col}`, id"
        )
        mysql_cursor.execute(base_sql, (last_sync,))
    else:
        base_sql = f"SELECT {columns_sql} FROM {table_name} ORDER BY id"
        mysql_cursor.execute(base_sql)
    
    while True:
        rows = mysql_cursor.fetchmany(BATCH_SIZE)
        if not rows:
            break
        yield rows


def upsert_rows(pg_cursor, table_name, config, rows):
    """Insere ou atualiza registros no PostgreSQL"""
    if not rows:
        return
    
    columns_sql = ", ".join(f'"{col}"' for col in config["columns"])
    placeholders = ", ".join(["%s"] * len(config["columns"]))
    update_assignments = ", ".join(
        f'"{col}" = EXCLUDED."{col}"' for col in config["columns"] if col != "id"
    )
    
    insert_sql = (
        f"INSERT INTO {table_name} ({columns_sql}) VALUES ({placeholders}) "
        f"ON CONFLICT (id) DO UPDATE SET {update_assignments}"
    )
    
    normalized = [[normalize_value(value) for value in row] for row in rows]
    psycopg2.extras.execute_batch(pg_cursor, insert_sql, normalized, page_size=BATCH_SIZE)


def get_latest_sync(rows, config, current_last_sync):
    """Obtém o timestamp mais recente dos registros processados"""
    if not rows:
        return current_last_sync
    
    track_col = config.get("track_column")
    if not track_col or track_col not in config["columns"]:
        return current_last_sync
    
    index = config["columns"].index(track_col)
    latest = current_last_sync
    
    for row in rows:
        value = row[index]
        if value is not None and (latest is None or value > latest):
            latest = value
    
    return latest


def sync_table(table_name, config, state):
    """Sincroniza uma tabela específica"""
    sync_start = time.time()
    last_sync = state[table_name].get("last_sync")
    
    mysql_conn = connect_mysql()
    pg_conn = connect_postgres()
    
    try:
        mysql_cursor = mysql_conn.cursor()
        pg_cursor = pg_conn.cursor()
        
        # Cria a tabela se não existir
        ensure_pg_table(pg_cursor, table_name, config)
        pg_conn.commit()
        
        # Sincroniza os dados
        total_rows = 0
        for rows in fetch_rows(mysql_cursor, table_name, config, last_sync):
            upsert_rows(pg_cursor, table_name, config, rows)
            pg_conn.commit()
            
            total_rows += len(rows)
            last_sync = get_latest_sync(rows, config, last_sync)
            state[table_name]["last_sync"] = last_sync
            save_state(state)
            
            monitor.log_debug(f"[{table_name}] {total_rows} registros até {last_sync}")
        
        if total_rows == 0:
            monitor.log_debug(f"[{table_name}] Nenhum registro novo")
        else:
            sync_duration = time.time() - sync_start
            monitor.log_table_sync(table_name, total_rows, sync_duration)
            
    except Exception as e:
        monitor.log_table_error(table_name, str(e))
    finally:
        mysql_conn.close()
        pg_conn.close()


def run_sync_cycle():
    """Executa um ciclo completo de sincronização de todas as tabelas"""
    state = load_state()
    
    threads = []
    for table_name, config in TABLES_CONFIG.items():
        thread = Thread(target=sync_table, args=(table_name, config, state))
        thread.start()
        threads.append(thread)
    
    # Aguarda todas as threads terminarem
    for thread in threads:
        thread.join()


def main():
    """Função principal - executa sincronização em loop"""
    monitor.log_info("=== Zion Export Infos ===")
    monitor.log_info(f"Sincronizando tabelas: {', '.join(TABLES_CONFIG.keys())}")
    monitor.log_info(f"Batch size: {BATCH_SIZE}")
    monitor.log_info(f"Intervalo: {POLL_SECONDS}s")
    
    monitor.start_export()
    cycle_number = 0
    
    try:
        while True:
            try:
                cycle_number += 1
                monitor.start_cycle(cycle_number)
                monitor.log_info(f"Iniciando ciclo #{cycle_number}")
                
                # Verifica conectividade
                mysql_ok, mysql_err = check_mysql_connectivity(MYSQL_CONFIG)
                postgres_ok, postgres_err = check_postgres_connectivity(POSTGRES_CONFIG)
                
                if mysql_ok and postgres_ok:
                    run_sync_cycle()
                    monitor.end_cycle(0)
                    monitor.log_info(f"Ciclo #{cycle_number} concluído")
                else:
                    if not mysql_ok:
                        monitor.log_error(f"MySQL inacessível: {mysql_err}")
                    if not postgres_ok:
                        monitor.log_error(f"PostgreSQL inacessível: {postgres_err}")
                
                monitor.log_info(f"Aguardando {POLL_SECONDS}s")
                time.sleep(POLL_SECONDS)
            except KeyboardInterrupt:
                raise
            except Exception as e:
                monitor.log_error(f"Erro no ciclo #{cycle_number}: {str(e)}")
                time.sleep(POLL_SECONDS)
    except KeyboardInterrupt:
        monitor.log_info("Sincronização interrompida pelo usuário")
    finally:
        monitor.stop_export()


if __name__ == "__main__":
    main()
