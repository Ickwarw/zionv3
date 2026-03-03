import json
import os
import time
from datetime import datetime
from threading import Lock

import mysql.connector
import psycopg2
import psycopg2.extras

# Importa sistema de monitoramento
from zionmonitor import ZionMonitor, check_mysql_connectivity, check_postgres_connectivity

MYSQL_CONFIG = {
    "host": "45.160.180.14",
    "port": 3306,
    "user": "leitura",
    "password": "abwmwwTZCKefsiCwGKsKoTAy8Ak=",
    "database": "ixcprovedor",
}

POSTGRES_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}

TABLE_SOURCE = "cliente"
TABLE_TARGET = "lead"
BATCH_SIZE = 500
POLL_SECONDS = 10
STATE_FILE = os.path.join(os.path.dirname(__file__), "zionexport_state.json")
state_lock = Lock()

# Inicializa monitor
monitor = ZionMonitor("zionexport")

COLUMNS = [
    "id",
    "razao",
    "fantasia",
    "endereco",
    "numero",
    "bairro",
    "cidade",
    "uf",
    "cnpj_cpf",
    "ie_identidade",
    "fone",
    "cep",
    "email",
    "tipo_pessoa",
    "id_tipo_cliente",
    "ativo",
    "id_conta",
    "status_internet",
    "bloqueio_automatico",
    "aviso_atraso",
    "obs",
    "dia_vencimento",
    "data",
    "id_myauth",
    "telefone_comercial",
    "telefone_celular",
    "referencia",
    "complemento",
    "ramal",
    "senha",
    "id_vendedor",
    "isuf",
    "tipo_assinante",
    "data_nascimento",
    "contato",
    "cond_pagamento",
    "hotsite_email",
    "hotsite_acesso",
    "nao_bloquear_ate",
    "nao_avisar_ate",
    "estado_civil",
    "filial_id",
    "latitude",
    "longitude",
    "id_candato_tipo",
    "tabela_preco",
    "rg_orgao_emissor",
    "nacionalidade",
    "alerta",
    "data_cadastro",
    "deb_automatico",
    "deb_agencia",
    "deb_conta",
    "endereco_cob",
    "numero_cob",
    "bairro_cob",
    "cidade_cob",
    "uf_cob",
    "cep_cob",
    "referencia_cob",
    "complemento_cob",
    "participa_cobranca",
    "num_dias_cob",
    "profissao",
    "url_site",
    "url_sistema",
    "ip_sistema",
    "porta_ssh_sistema",
    "senha_root_sistema",
    "remessa_debito",
    "id_operadora_celular",
    "participa_pre_cobranca",
    "cob_envia_email",
    "cob_envia_sms",
    "contribuinte_icms",
    "Sexo",
    "id_condominio",
    "nome_pai",
    "nome_mae",
    "quantidade_dependentes",
    "nome_conjuge",
    "fone_conjuge",
    "cpf_conjuge",
    "rg_conjuge",
    "data_nascimento_conjuge",
    "moradia",
    "nome_contador",
    "telefone_contador",
    "ref_com_empresa1",
    "ref_com_empresa2",
    "ref_com_fone1",
    "ref_com_fone2",
    "ref_pes_nome1",
    "ref_pes_nome2",
    "ref_pes_fone1",
    "ref_pes_fone2",
    "emp_empresa",
    "emp_cnpj",
    "emp_cep",
    "emp_endereco",
    "emp_cidade",
    "emp_fone",
    "emp_contato",
    "emp_cargo",
    "emp_remuneracao",
    "emp_data_admissao",
    "website",
    "skype",
    "pis_retem",
    "cofins_retem",
    "csll_retem",
    "irrf_retem",
    "status_prospeccao",
    "prospeccao_ultimo_contato",
    "prospeccao_proximo_contato",
    "orgao_publico",
    "pipe_id_organizacao",
    "im",
    "responsavel",
    "bloco",
    "apartamento",
    "cif",
    "grau_satisfacao",
    "idx",
    "iss_classificacao",
    "iss_classificacao_padrao",
    "tipo_cliente_scm",
    "cpf_pai",
    "cpf_mae",
    "identidade_pai",
    "identidade_mae",
    "nascimento_pai",
    "nascimento_mae",
    "id_canal_venda",
    "whatsapp",
    "inscricao_municipal",
    "nome_representante_1",
    "nome_representante_2",
    "cpf_representante_1",
    "cpf_representante_2",
    "identidade_representante_1",
    "identidade_representante_2",
    "id_contato_principal",
    "id_concorrente",
    "id_perfil",
    "codigo_operacao",
    "convert_cliente_forn",
    "tipo_pessoa_titular_conta",
    "cnpj_cpf_titular_conta",
    "id_vd_contrato_desejado",
    "cadastrado_no_galaxPay",
    "atualizar_cadastro_galaxPay",
    "id_galaxPay",
    "acesso_automatico_central",
    "primeiro_acesso_central",
    "ativo_serasa",
    "foto_cartao",
    "ultima_atualizacao",
    "permite_armazenar_cartoes",
    "yapay_token_account",
    "cli_desconta_iss_retido_total",
    "tv_code",
    "tv_access_token",
    "tv_token_expires_in",
    "tv_refresh_token",
    "cidade_naturalidade",
    "cadastrado_via_viabilidade",
    "substatus_prospeccao",
    "tipo_cobranca_auto_viab",
    "plano_negociacao_auto_viab",
    "tipo_localidade",
    "qtd_pessoas_calc_vel",
    "qtd_smart_calc_vel",
    "qtd_celular_calc_vel",
    "qtd_computador_calc_vel",
    "qtd_console_calc_vel",
    "freq_pessoas_calc_vel",
    "freq_smart_calc_vel",
    "freq_celular_calc_vel",
    "freq_computador_calc_vel",
    "freq_console_calc_vel",
    "resultado_calc_vel",
    "data_reserva_auto_viab",
    "melhor_periodo_reserva_auto_viab",
    "alterar_senha_primeiro_acesso",
    "hash_redefinir_senha",
    "data_hash_redefinir_senha",
    "senha_hotsite_md5",
    "facebook",
    "operador_neutro",
    "external_id",
    "external_system",
    "status_viabilidade",
    "tipo_rede",
    "rede_ativacao",
    "indicado_por",
    "numero_antigo",
    "numero_cob_antigo",
    "antigo_acesso_central",
    "id_fornecedor_conversao",
    "id_campanha",
    "desconto_irrf_valor_inferior",
    "id_vindi",
    "filtra_filial",
    "tipo_documento_identificacao",
    "regua_cobranca_wpp",
    "regua_cobranca_notificacao",
    "regime_fiscal_col",
    "regua_cobranca_considera",
    "id_segmento",
    "inss_retem",
    "tipo_ente_governamental",
    "percentual_reducao",
    "nome_social",
]

COLUMN_TYPES = {
    "id": "INTEGER",
    "cidade": "INTEGER",
    "uf": "INTEGER",
    "id_tipo_cliente": "INTEGER",
    "id_conta": "INTEGER",
    "dia_vencimento": "INTEGER",
    "id_myauth": "INTEGER",
    "id_vendedor": "INTEGER",
    "cond_pagamento": "INTEGER",
    "filial_id": "INTEGER",
    "id_candato_tipo": "INTEGER",
    "tabela_preco": "INTEGER",
    "cidade_cob": "INTEGER",
    "uf_cob": "INTEGER",
    "num_dias_cob": "INTEGER",
    "porta_ssh_sistema": "INTEGER",
    "remessa_debito": "INTEGER",
    "id_operadora_celular": "INTEGER",
    "id_condominio": "INTEGER",
    "quantidade_dependentes": "INTEGER",
    "emp_cidade": "INTEGER",
    "id_canal_venda": "INTEGER",
    "id_contato_principal": "INTEGER",
    "id_concorrente": "INTEGER",
    "id_perfil": "INTEGER",
    "codigo_operacao": "INTEGER",
    "id_vd_contrato_desejado": "INTEGER",
    "id_galaxPay": "INTEGER",
    "ativo_serasa": "INTEGER",
    "cidade_naturalidade": "INTEGER",
    "substatus_prospeccao": "INTEGER",
    "tipo_cobranca_auto_viab": "INTEGER",
    "plano_negociacao_auto_viab": "INTEGER",
    "qtd_pessoas_calc_vel": "INTEGER",
    "qtd_smart_calc_vel": "INTEGER",
    "qtd_celular_calc_vel": "INTEGER",
    "qtd_computador_calc_vel": "INTEGER",
    "qtd_console_calc_vel": "INTEGER",
    "operador_neutro": "INTEGER",
    "indicado_por": "INTEGER",
    "id_fornecedor_conversao": "INTEGER",
    "id_campanha": "INTEGER",
    "id_vindi": "INTEGER",
    "id_segmento": "SMALLINT",
    "data": "DATE",
    "data_nascimento": "DATE",
    "nao_bloquear_ate": "DATE",
    "nao_avisar_ate": "DATE",
    "data_cadastro": "DATE",
    "data_nascimento_conjuge": "DATE",
    "prospeccao_ultimo_contato": "DATE",
    "prospeccao_proximo_contato": "DATE",
    "nascimento_pai": "DATE",
    "nascimento_mae": "DATE",
    "emp_data_admissao": "DATE",
    "tv_token_expires_in": "TIMESTAMP",
    "data_reserva_auto_viab": "DATE",
    "data_hash_redefinir_senha": "TIMESTAMP",
    "ultima_atualizacao": "TIMESTAMP",
    "emp_remuneracao": "NUMERIC(15,2)",
    "percentual_reducao": "NUMERIC(7,4)",
    "foto_cartao": "BYTEA",
}


def load_state():
    """Carrega o estado de sincronização de um arquivo JSON"""
    with state_lock:
        if not os.path.exists(STATE_FILE):
            return {"last_sync": None}
        with open(STATE_FILE, "r", encoding="utf-8") as handle:
            state = json.load(handle)
        last_sync = state.get("last_sync")
        if last_sync:
            try:
                state["last_sync"] = datetime.fromisoformat(last_sync)
            except ValueError:
                state["last_sync"] = None
        return state


def save_state(state):
    """Salva o estado de sincronização em um arquivo JSON"""
    with state_lock:
        with open(STATE_FILE, "w", encoding="utf-8") as handle:
            payload = dict(state)
            last_sync = payload.get("last_sync")
            payload["last_sync"] = last_sync.isoformat() if last_sync else None
            json.dump(payload, handle, indent=2)


def ensure_pg_table(cursor):
    """Cria a tabela no PostgreSQL se não existir"""
    column_defs = []
    for column in COLUMNS:
        column_type = COLUMN_TYPES.get(column, "TEXT")
        if column == "id":
            column_defs.append(f'"{column}" {column_type} PRIMARY KEY')
        else:
            column_defs.append(f'"{column}" {column_type}')
    ddl = f"CREATE TABLE IF NOT EXISTS {TABLE_TARGET} (" + ", ".join(column_defs) + ")"
    cursor.execute(ddl)


def connect_mysql():
    """Conecta ao banco MariaDB"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        monitor.log_debug("Conexão MySQL estabelecida")
        return conn
    except Exception as e:
        monitor.log_error(f"Erro ao conectar no MySQL: {str(e)}", error_type=type(e).__name__)
        raise


def connect_postgres():
    """Conecta ao banco PostgreSQL"""
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        monitor.log_debug("Conexão PostgreSQL estabelecida")
        return conn
    except Exception as e:
        monitor.log_error(f"Erro ao conectar no PostgreSQL: {str(e)}", error_type=type(e).__name__)
        raise


def normalize_value(value):
    """Normaliza valores para inserção no PostgreSQL"""
    if isinstance(value, (datetime,)):
        return value
    return value


def fetch_rows(mysql_cursor, last_sync):
    """Busca registros do MariaDB em lotes"""
    columns_sql = ", ".join(f"`{col}`" for col in COLUMNS)
    base_sql = (
        f"SELECT {columns_sql} FROM {TABLE_SOURCE} "
        "WHERE (%s IS NULL OR ultima_atualizacao > %s) "
        "ORDER BY ultima_atualizacao, id"
    )
    mysql_cursor.execute(base_sql, (last_sync, last_sync))
    while True:
        rows = mysql_cursor.fetchmany(BATCH_SIZE)
        if not rows:
            break
        yield rows


def upsert_rows(pg_cursor, rows):
    """Insere ou atualiza registros no PostgreSQL"""
    if not rows:
        return
    columns_sql = ", ".join(f'"{col}"' for col in COLUMNS)
    placeholders = ", ".join(["%s"] * len(COLUMNS))
    update_assignments = ", ".join(
        f'"{col}" = EXCLUDED."{col}"' for col in COLUMNS if col != "id"
    )
    insert_sql = (
        f"INSERT INTO {TABLE_TARGET} ({columns_sql}) VALUES ({placeholders}) "
        f"ON CONFLICT (id) DO UPDATE SET {update_assignments}"
    )
    normalized = [[normalize_value(value) for value in row] for row in rows]
    psycopg2.extras.execute_batch(pg_cursor, insert_sql, normalized, page_size=BATCH_SIZE)


def get_latest_sync(rows, current_last_sync):
    """Obtém o timestamp mais recente dos registros processados"""
    if not rows:
        return current_last_sync
    index = COLUMNS.index("ultima_atualizacao")
    latest = current_last_sync
    for row in rows:
        value = row[index]
        if value is not None and (latest is None or value > latest):
            latest = value
    return latest


def run_sync_cycle():
    """Executa um ciclo completo de sincronização"""
    cycle_start = time.time()
    state = load_state()
    last_sync = state.get("last_sync")

    # Verifica conectividade
    mysql_ok, mysql_err = check_mysql_connectivity(MYSQL_CONFIG)
    if not mysql_ok:
        monitor.log_error(f"MySQL inacessível: {mysql_err}")
        return
    
    postgres_ok, postgres_err = check_postgres_connectivity(POSTGRES_CONFIG)
    if not postgres_ok:
        monitor.log_error(f"PostgreSQL inacessível: {postgres_err}")
        return

    mysql_conn = connect_mysql()
    pg_conn = connect_postgres()

    try:
        mysql_cursor = mysql_conn.cursor()
        pg_cursor = pg_conn.cursor()

        ensure_pg_table(pg_cursor)
        pg_conn.commit()

        total_rows = 0
        for rows in fetch_rows(mysql_cursor, last_sync):
            upsert_rows(pg_cursor, rows)
            pg_conn.commit()
            
            total_rows += len(rows)
            last_sync = get_latest_sync(rows, last_sync)
            state["last_sync"] = last_sync
            save_state(state)
            
            monitor.log_info(f"Sincronizados {total_rows} registros até {last_sync}")
        
        if total_rows == 0:
            monitor.log_debug("Nenhum registro novo para sincronizar")
        
        # Registra métricas do ciclo
        cycle_duration = time.time() - cycle_start
        monitor.log_table_sync(TABLE_TARGET, total_rows, cycle_duration)
            
    except Exception as e:
        monitor.log_error(f"Erro na sincronização: {str(e)}", error_type=type(e).__name__, table=TABLE_TARGET)
        raise
    finally:
        mysql_conn.close()
        pg_conn.close()
        monitor.log_debug("Conexões fechadas")


def main():
    """Função principal - executa sincronização em loop"""
    monitor.log_info("=== Zion Export Cliente ===")
    monitor.log_info(f"Sincronizando tabela: {TABLE_SOURCE} -> {TABLE_TARGET}")
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
                
                run_sync_cycle()
                
                monitor.end_cycle(0)  # Será atualizado dentro do run_sync_cycle
                monitor.log_info(f"Ciclo #{cycle_number} concluído. Aguardando {POLL_SECONDS}s")
                time.sleep(POLL_SECONDS)
            except KeyboardInterrupt:
                raise
            except Exception as e:
                monitor.log_error(f"Erro no ciclo #{cycle_number}: {str(e)}", error_type=type(e).__name__)
                time.sleep(POLL_SECONDS)
    except KeyboardInterrupt:
        monitor.log_info("Sincronização interrompida pelo usuário")
    finally:
        monitor.stop_export()


if __name__ == "__main__":
    main()
