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
STATE_FILE = os.path.join(os.path.dirname(__file__), "zionexportatributes_state.json")
state_lock = Lock()

# Inicializa monitor
monitor = ZionMonitor("zionexportatributes")

# Definição das tabelas e seus campos
TABLES_CONFIG = {
    "cliente_arquivos": {
        "columns": ["id", "nome_arquivo", "local_arquivo", "data_envio", "id_cliente", 
                   "descricao", "id_contrato", "id_termo", "tipo_arquivo"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "nome_arquivo": "VARCHAR(500)",
            "local_arquivo": "VARCHAR(500)",
            "data_envio": "TIMESTAMP",
            "id_cliente": "INTEGER",
            "descricao": "VARCHAR(100)",
            "id_contrato": "INTEGER",
            "id_termo": "INTEGER",
            "tipo_arquivo": "VARCHAR(1)"
        },
        "track_column": "data_envio"
    },
    "cliente_contrato": {
        "columns": ["id", "id_vd_contrato", "id_cliente", "status", "data", "data_validade", 
                   "pago_ate_data", "renovacao_automatica", "valor_unitario", "id_tipo_contrato",
                   "contrato", "id_filial", "id_tipo_documento", "id_carteira_cobranca", "id_vendedor",
                   "comissao", "status_internet", "bloqueio_automatico", "nao_bloquear_ate",
                   "aviso_atraso", "nao_avisar_ate", "obs", "id_modelo", "cc_previsao", "tipo_doc_opc",
                   "data_cancelamento", "data_validada", "taxa_instalacao", "desconto_fidelidade",
                   "fidelidade", "taxa_improdutiva", "data_renovacao", "tipo", "tel_franquia_segundos",
                   "tel_franquia_prefix", "obs_cancelamento", "motivo_cancelamento", "email_cobranca",
                   "tipo_cobranca", "lote", "condicao_pagamento_primeira_fat", "data_negativacao",
                   "protocolo_negativacao", "desbloqueio_confianca", "desbloqueio_confianca_ativo",
                   "descricao_aux_plano_venda", "avalista_1", "avalista_2", "rec_bandeira", "rec_cartao",
                   "rec_token", "data_ativacao", "ultima_atualizacao"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_vd_contrato": "INTEGER",
            "id_cliente": "INTEGER",
            "status": "VARCHAR(1)",
            "data": "DATE",
            "data_validade": "DATE",
            "pago_ate_data": "DATE",
            "renovacao_automatica": "VARCHAR(1)",
            "valor_unitario": "NUMERIC(15,5)",
            "id_tipo_contrato": "INTEGER",
            "contrato": "VARCHAR(100)",
            "id_filial": "INTEGER",
            "id_tipo_documento": "INTEGER",
            "id_carteira_cobranca": "INTEGER",
            "id_vendedor": "INTEGER",
            "comissao": "NUMERIC(5,2)",
            "status_internet": "VARCHAR(2)",
            "bloqueio_automatico": "VARCHAR(1)",
            "nao_bloquear_ate": "DATE",
            "aviso_atraso": "VARCHAR(1)",
            "nao_avisar_ate": "DATE",
            "obs": "TEXT",
            "id_modelo": "INTEGER",
            "cc_previsao": "VARCHAR(1)",
            "tipo_doc_opc": "INTEGER",
            "data_cancelamento": "DATE",
            "data_validada": "DATE",
            "taxa_instalacao": "NUMERIC(15,2)",
            "desconto_fidelidade": "NUMERIC(15,2)",
            "fidelidade": "INTEGER",
            "taxa_improdutiva": "NUMERIC(15,3)",
            "data_renovacao": "DATE",
            "tipo": "VARCHAR(3)",
            "tel_franquia_segundos": "INTEGER",
            "tel_franquia_prefix": "VARCHAR(250)",
            "obs_cancelamento": "TEXT",
            "motivo_cancelamento": "INTEGER",
            "email_cobranca": "VARCHAR(250)",
            "tipo_cobranca": "VARCHAR(1)",
            "lote": "INTEGER",
            "condicao_pagamento_primeira_fat": "INTEGER",
            "data_negativacao": "DATE",
            "protocolo_negativacao": "VARCHAR(50)",
            "desbloqueio_confianca": "VARCHAR(1)",
            "desbloqueio_confianca_ativo": "VARCHAR(1)",
            "descricao_aux_plano_venda": "VARCHAR(200)",
            "avalista_1": "INTEGER",
            "avalista_2": "INTEGER",
            "rec_bandeira": "VARCHAR(12)",
            "rec_cartao": "VARCHAR(20)",
            "rec_token": "VARCHAR(80)",
            "data_ativacao": "DATE",
            "ultima_atualizacao": "TIMESTAMP"
        },
        "track_column": "ultima_atualizacao"
    },
    "cliente_contrato_alt_plano": {
        "columns": ["id", "id_contrato", "data_hora_alteracao", "valor_atual", "valor_novo",
                   "id_tipo_plano_atual", "id_tipo_plano_novo", "altera_plano", "altera_tipo_cobranca",
                   "tipo_alteracao", "id_vd_contrato_atual", "id_vd_contrato_novo", "opcoes_vencidos",
                   "status", "alt_plano_tipo_assinatura", "id_operador", "id_vendedor",
                   "gerar_prorata_serv_adic", "id_modelo_impressao", "alt_plano_modelo_impressao",
                   "definicao_contrato_termo", "id_modelo_termo", "id_lote", "valor_desconto_atual",
                   "valor_acrescimo_atual"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_contrato": "INTEGER",
            "data_hora_alteracao": "TIMESTAMP",
            "valor_atual": "NUMERIC(15,2)",
            "valor_novo": "NUMERIC(15,2)",
            "id_tipo_plano_atual": "INTEGER",
            "id_tipo_plano_novo": "INTEGER",
            "altera_plano": "VARCHAR(1)",
            "altera_tipo_cobranca": "VARCHAR(1)",
            "tipo_alteracao": "VARCHAR(2)",
            "id_vd_contrato_atual": "INTEGER",
            "id_vd_contrato_novo": "INTEGER",
            "opcoes_vencidos": "VARCHAR(1)",
            "status": "VARCHAR(1)",
            "alt_plano_tipo_assinatura": "VARCHAR(1)",
            "id_operador": "INTEGER",
            "id_vendedor": "INTEGER",
            "gerar_prorata_serv_adic": "VARCHAR(1)",
            "id_modelo_impressao": "INTEGER",
            "alt_plano_modelo_impressao": "INTEGER",
            "definicao_contrato_termo": "VARCHAR(2)",
            "id_modelo_termo": "INTEGER",
            "id_lote": "INTEGER",
            "valor_desconto_atual": "NUMERIC(15,2)",
            "valor_acrescimo_atual": "NUMERIC(15,2)"
        },
        "track_column": "data_hora_alteracao"
    },
    "cliente_contrato_historico": {
        "columns": ["id", "historico", "data", "tipo", "id_cliente", "id_contrato", "operador",
                   "created_at", "url", "request_body", "response_body"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "historico": "TEXT",
            "data": "DATE",
            "tipo": "VARCHAR(30)",
            "id_cliente": "INTEGER",
            "id_contrato": "INTEGER",
            "operador": "INTEGER",
            "created_at": "TIMESTAMP",
            "url": "VARCHAR(255)",
            "request_body": "TEXT",
            "response_body": "TEXT"
        },
        "track_column": "created_at"
    },
    "cliente_contrato_servicos": {
        "columns": ["id", "id_contrato", "id_produto", "descricao", "data", "id_unidade",
                   "quantidade", "valor_unitario", "valor_total", "repetir", "repetir_qtde",
                   "status", "execucoes", "ultima_execucao", "pdesconto", "vdesconto",
                   "id_sip", "id_oss_mensagem", "id_oss_chamado", "id_contrato_aluguel",
                   "id_im_lanc_mensal", "id_im_imovel", "id_vd_contrato_produtos",
                   "status_nf21", "execucoes_nf21", "ultima_execucao_nf21", "id_areceber",
                   "id_almox", "tipo_acres_desc", "id_produto_contrato_vinc", "tipo",
                   "data_inicial_ligacoes", "data_final_ligacoes", "data_validade",
                   "incluido_por_prorata", "id_login_tv", "id_tipo_documento", "id_lote_rotina",
                   "origem", "id_lote", "origem_movimento", "id_lote_importacao", "observacao"],
        "types": {
            "id": "INTEGER PRIMARY KEY",
            "id_contrato": "INTEGER",
            "id_produto": "INTEGER",
            "descricao": "VARCHAR(200)",
            "data": "DATE",
            "id_unidade": "INTEGER",
            "quantidade": "NUMERIC(15,9)",
            "valor_unitario": "NUMERIC(15,2)",
            "valor_total": "NUMERIC(15,2)",
            "repetir": "VARCHAR(1)",
            "repetir_qtde": "INTEGER",
            "status": "VARCHAR(1)",
            "execucoes": "INTEGER",
            "ultima_execucao": "TIMESTAMP",
            "pdesconto": "NUMERIC(9,6)",
            "vdesconto": "NUMERIC(15,2)",
            "id_sip": "INTEGER",
            "id_oss_mensagem": "INTEGER",
            "id_oss_chamado": "INTEGER",
            "id_contrato_aluguel": "INTEGER",
            "id_im_lanc_mensal": "INTEGER",
            "id_im_imovel": "INTEGER",
            "id_vd_contrato_produtos": "INTEGER",
            "status_nf21": "VARCHAR(1)",
            "execucoes_nf21": "INTEGER",
            "ultima_execucao_nf21": "TIMESTAMP",
            "id_areceber": "BIGINT",
            "id_almox": "INTEGER",
            "tipo_acres_desc": "VARCHAR(1)",
            "id_produto_contrato_vinc": "INTEGER",
            "tipo": "VARCHAR(3)",
            "data_inicial_ligacoes": "DATE",
            "data_final_ligacoes": "DATE",
            "data_validade": "DATE",
            "incluido_por_prorata": "VARCHAR(1)",
            "id_login_tv": "INTEGER",
            "id_tipo_documento": "INTEGER",
            "id_lote_rotina": "INTEGER",
            "origem": "VARCHAR(1)",
            "id_lote": "INTEGER",
            "origem_movimento": "VARCHAR(1)",
            "id_lote_importacao": "INTEGER",
            "observacao": "TEXT"
        },
        "track_column": "ultima_execucao"
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
    monitor.log_info("=== Zion Export Atributes ===")
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
