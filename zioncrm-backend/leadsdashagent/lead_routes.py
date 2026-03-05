"""
Lead Routes - Rotas de CRUD de Leads para Blueprint
Conversão do lead.py para blueprint Flask
"""

from flask import jsonify, request
from . import lead_bp
import psycopg2
import psycopg2.extras
from datetime import datetime
from config import Config

# Configuração do PostgreSQL
# POSTGRES_CONFIG = {
#     "host": "45.160.180.34",
#     "port": 5432,
#     "user": "zioncrm",
#     "password": "kN98upt4gJ3G",
#     "dbname": "zioncrm",
# }

POSTGRES_CONFIG = Config().get_db_config()


def get_db_connection():
    """Cria conexão com PostgreSQL"""
    return psycopg2.connect(**POSTGRES_CONFIG)


def serialize_datetime(obj):
    """Serializa objetos datetime para JSON"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


# ============================================
# ENDPOINTS - LISTAGEM E BUSCA
# ============================================

@lead_bp.route('', methods=['GET'])
@lead_bp.route('/', methods=['GET'])
def get_leads():
    """Lista todos os leads com filtros opcionais"""
    try:
        # Parâmetros de busca
        search = request.args.get('search', '')
        ativo = request.args.get('ativo', 'S')
        departamento = request.args.get('departamento')
        prioridade = request.args.get('prioridade')
        status_vendas = request.args.get('status_vendas')
        origem = request.args.get('origem')
        
        # Paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Monta WHERE
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append("(LOWER(razao) LIKE %s OR LOWER(fantasia) LIKE %s OR cnpj_cpf LIKE %s OR email LIKE %s)")
            search_param = f"%{search.lower()}%"
            params.extend([search_param, search_param, search_param, search_param])
        
        if ativo:
            where_clauses.append("ativo = %s")
            params.append(ativo)
        
        if departamento:
            where_clauses.append("departamento = %s")
            params.append(departamento)
        
        if prioridade:
            where_clauses.append("prioridade = %s")
            params.append(prioridade)
        
        if status_vendas:
            where_clauses.append("status_vendas = %s")
            params.append(status_vendas)
        
        if origem:
            where_clauses.append("origem = %s")
            params.append(origem)
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        # Conta total
        count_query = f"SELECT COUNT(*) as total FROM lead {where_sql}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Busca dados paginados
        params.extend([per_page, offset])
        query = f"""
            SELECT
                id,
                razao,
                fantasia,
                cnpj_cpf,
                ie_identidade,
                tipo_pessoa,
                contato,
                email,
                fone,
                telefone_celular,
                telefone_comercial,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                uf,
                cep,
                referencia,
                data_nascimento,
                estado_civil,
                sexo,
                prioridade,
                origem,
                obs,
                ativo,
                data_cadastro
            FROM lead
            {where_sql}
            ORDER BY data_cadastro DESC
            LIMIT %s OFFSET %s
        """
        # query = f"""
        #     SELECT * FROM lead
        #     {where_sql}
        #     ORDER BY data_cadastro DESC
        #     LIMIT %s OFFSET %s
        # """
        
        cursor.execute(query, params)
        leads = cursor.fetchall()
        
        # Serializa datetime
        leads_list = []
        for lead in leads:
            lead_dict = dict(lead)
            for key, value in lead_dict.items():
                lead_dict[key] = serialize_datetime(value)
            leads_list.append(lead_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": leads_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "error": str(e)}), 500


@lead_bp.route('/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Busca lead específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM lead WHERE id = %s", (lead_id,))
        lead = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not lead:
            return jsonify({"success": False, "error": "Lead não encontrado"}), 404
        
        lead_dict = dict(lead)
        for key, value in lead_dict.items():
            lead_dict[key] = serialize_datetime(value)
        
        return jsonify({
            "success": True,
            "data": lead_dict
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ENDPOINTS - CRIAÇÃO
# ============================================

@lead_bp.route('', methods=['POST'])
@lead_bp.route('/', methods=['POST'])
def create_lead():
    """Cria um novo lead"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "Dados não fornecidos"}), 400
        
        # Campos obrigatórios
        required_fields = ['razao', 'cnpj_cpf']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório ausente: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Lista COMPLETA de campos permitidos (todos os campos da tabela cliente do MariaDB)
        allowed_fields = [
            # Campos básicos
            'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
            'cnpj_cpf', 'ie_identidade', 'cond_pagamento', 'fone', 'cep', 'email',
            'tipo_pessoa', 'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
            'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento', 'data',
            'id_myauth', 'telefone_comercial', 'telefone_celular', 'referencia',
            'complemento', 'ramal', 'senha', 'nao_bloquear_ate', 'nao_avisar_ate',
            'id_vendedor', 'isuf', 'tipo_assinante', 'data_nascimento', 'contato',
            'hotsite_email', 'hotsite_acesso', 'estado_civil', 'filial_id',
            'latitude', 'longitude', 'id_candato_tipo', 'tabela_preco',
            'rg_orgao_emissor', 'nacionalidade', 'deb_automatico', 'deb_agencia',
            'deb_conta', 'alerta', 'data_cadastro',
            # Endereço de cobrança
            'endereco_cob', 'numero_cob', 'bairro_cob', 'cidade_cob', 'uf_cob',
            'cep_cob', 'referencia_cob', 'complemento_cob', 'participa_cobranca',
            'num_dias_cob',
            # Profissão e sistema
            'profissao', 'url_site', 'url_sistema', 'ip_sistema', 'porta_ssh_sistema',
            'senha_root_sistema', 'remessa_debito', 'id_operadora_celular',
            # Cobrança
            'participa_pre_cobranca', 'cob_envia_email', 'cob_envia_sms',
            'regua_cobranca_wpp', 'regua_cobranca_notificacao', 'regua_cobranca_considera',
            # Fiscal
            'contribuinte_icms', 'iss_classificacao', 'iss_classificacao_padrao',
            'tipo_cliente_scm', 'pis_retem', 'cofins_retem', 'csll_retem', 'irrf_retem',
            'inss_retem', 'inscricao_municipal', 'regime_fiscal_col',
            'cli_desconta_iss_retido_total', 'desconto_irrf_valor_inferior',
            'tipo_ente_governamental', 'percentual_reducao',
            # Pessoal e família
            'sexo', 'id_condominio', 'nome_pai', 'nome_mae', 'quantidade_dependentes',
            'nome_conjuge', 'fone_conjuge', 'cpf_conjuge', 'rg_conjuge',
            'data_nascimento_conjuge', 'moradia', 'nome_contador', 'telefone_contador',
            'cpf_pai', 'cpf_mae', 'identidade_pai', 'identidade_mae',
            'nascimento_pai', 'nascimento_mae',
            # Referências
            'ref_com_empresa1', 'ref_com_empresa2', 'ref_com_fone1', 'ref_com_fone2',
            'ref_pes_nome1', 'ref_pes_nome2', 'ref_pes_fone1', 'ref_pes_fone2',
            # Emprego
            'emp_empresa', 'emp_cnpj', 'emp_cep', 'emp_endereco', 'emp_cidade',
            'emp_fone', 'emp_contato', 'emp_cargo', 'emp_remuneracao', 'emp_data_admissao',
            # Redes sociais
            'website', 'skype', 'whatsapp', 'facebook',
            # Prospecção
            'status_prospeccao', 'prospeccao_ultimo_contato', 'prospeccao_proximo_contato',
            'substatus_prospeccao', 'orgao_publico', 'pipe_id_organizacao',
            'grau_satisfacao',
            # Localização adicional
            'im', 'responsavel', 'bloco', 'apartamento', 'cif', 'idx',
            # Representantes
            'nome_representante_1', 'nome_representante_2', 'cpf_representante_1',
            'cpf_representante_2', 'identidade_representante_1', 'identidade_representante_2',
            # Relacionamentos
            'id_contato_principal', 'id_concorrente', 'id_perfil', 'codigo_operacao',
            'convert_cliente_forn', 'id_canal_venda', 'id_campanha',
            # Pagamento
            'tipo_pessoa_titular_conta', 'cnpj_cpf_titular_conta',
            # Integrações
            'cadastrado_no_galaxPay', 'atualizar_cadastro_galaxPay', 'id_galaxPay',
            'id_vindi', 'yapay_token_account', 'permite_armazenar_cartoes', 'foto_cartao',
            'tv_code', 'tv_access_token', 'tv_token_expires_in', 'tv_refresh_token',
            # Acesso
            'acesso_automatico_central', 'primeiro_acesso_central',
            'alterar_senha_primeiro_acesso', 'hash_redefinir_senha',
            'data_hash_redefinir_senha', 'senha_hotsite_md5', 'antigo_acesso_central',
            # Serasa e viabilidade
            'ativo_serasa', 'id_vd_contrato_desejado', 'cadastrado_via_viabilidade',
            'status_viabilidade',
            # Velocidade e localidade
            'tipo_localidade', 'qtd_pessoas_calc_vel', 'qtd_smart_calc_vel',
            'qtd_celular_calc_vel', 'qtd_computador_calc_vel', 'qtd_console_calc_vel',
            'freq_pessoas_calc_vel', 'freq_smart_calc_vel', 'freq_celular_calc_vel',
            'freq_computador_calc_vel', 'freq_console_calc_vel', 'resultado_calc_vel',
            'tipo_cobranca_auto_viab', 'plano_negociacao_auto_viab',
            'data_reserva_auto_viab', 'melhor_periodo_reserva_auto_viab',
            # Naturalidade e rede
            'cidade_naturalidade', 'operador_neutro', 'tipo_rede', 'rede_ativacao',
            # Identificação externa
            'external_id', 'external_system',
            # Indicação e conversão
            'indicado_por', 'numero_antigo', 'numero_cob_antigo', 'id_fornecedor_conversao',
            # Outros
            'filtra_filial', 'id_segmento', 'tipo_documento_identificacao', 'nome_social',
            # Campos de classificação (sistema ZionCRM)
            'prioridade', 'status_vendas', 'status_pos_venda', 'nivel_contentamento',
            'status_debito', 'origem', 'departamento', 'score', 'obs_classificacao'
        ]
        
        # Filtra apenas campos permitidos
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        # Adiciona data_cadastro
        insert_fields.append('data_cadastro')
        insert_values.append(datetime.now())
        placeholders.append('%s')
        
        # Monta query
        query = f"""
            INSERT INTO lead ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Lead criado com sucesso",
            "data": {"id": new_id}
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ENDPOINTS - ATUALIZAÇÃO
# ============================================

@lead_bp.route('/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Atualiza um lead existente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "Dados não fornecidos"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se lead existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Lead não encontrado"}), 404
        
        # Campos COMPLETOS permitidos para atualização (mesma lista do create)
        allowed_fields = [
            # Campos básicos
            'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
            'cnpj_cpf', 'ie_identidade', 'cond_pagamento', 'fone', 'cep', 'email',
            'tipo_pessoa', 'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
            'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento', 'data',
            'id_myauth', 'telefone_comercial', 'telefone_celular', 'referencia',
            'complemento', 'ramal', 'senha', 'nao_bloquear_ate', 'nao_avisar_ate',
            'id_vendedor', 'isuf', 'tipo_assinante', 'data_nascimento', 'contato',
            'hotsite_email', 'hotsite_acesso', 'estado_civil', 'filial_id',
            'latitude', 'longitude', 'id_candato_tipo', 'tabela_preco',
            'rg_orgao_emissor', 'nacionalidade', 'deb_automatico', 'deb_agencia',
            'deb_conta', 'alerta', 'data_cadastro',
            # Endereço de cobrança
            'endereco_cob', 'numero_cob', 'bairro_cob', 'cidade_cob', 'uf_cob',
            'cep_cob', 'referencia_cob', 'complemento_cob', 'participa_cobranca',
            'num_dias_cob',
            # Profissão e sistema
            'profissao', 'url_site', 'url_sistema', 'ip_sistema', 'porta_ssh_sistema',
            'senha_root_sistema', 'remessa_debito', 'id_operadora_celular',
            # Cobrança
            'participa_pre_cobranca', 'cob_envia_email', 'cob_envia_sms',
            'regua_cobranca_wpp', 'regua_cobranca_notificacao', 'regua_cobranca_considera',
            # Fiscal
            'contribuinte_icms', 'iss_classificacao', 'iss_classificacao_padrao',
            'tipo_cliente_scm', 'pis_retem', 'cofins_retem', 'csll_retem', 'irrf_retem',
            'inss_retem', 'inscricao_municipal', 'regime_fiscal_col',
            'cli_desconta_iss_retido_total', 'desconto_irrf_valor_inferior',
            'tipo_ente_governamental', 'percentual_reducao',
            # Pessoal e família
            'sexo', 'id_condominio', 'nome_pai', 'nome_mae', 'quantidade_dependentes',
            'nome_conjuge', 'fone_conjuge', 'cpf_conjuge', 'rg_conjuge',
            'data_nascimento_conjuge', 'moradia', 'nome_contador', 'telefone_contador',
            'cpf_pai', 'cpf_mae', 'identidade_pai', 'identidade_mae',
            'nascimento_pai', 'nascimento_mae',
            # Referências
            'ref_com_empresa1', 'ref_com_empresa2', 'ref_com_fone1', 'ref_com_fone2',
            'ref_pes_nome1', 'ref_pes_nome2', 'ref_pes_fone1', 'ref_pes_fone2',
            # Emprego
            'emp_empresa', 'emp_cnpj', 'emp_cep', 'emp_endereco', 'emp_cidade',
            'emp_fone', 'emp_contato', 'emp_cargo', 'emp_remuneracao', 'emp_data_admissao',
            # Redes sociais
            'website', 'skype', 'whatsapp', 'facebook',
            # Prospecção
            'status_prospeccao', 'prospeccao_ultimo_contato', 'prospeccao_proximo_contato',
            'substatus_prospeccao', 'orgao_publico', 'pipe_id_organizacao',
            'grau_satisfacao',
            # Localização adicional
            'im', 'responsavel', 'bloco', 'apartamento', 'cif', 'idx',
            # Representantes
            'nome_representante_1', 'nome_representante_2', 'cpf_representante_1',
            'cpf_representante_2', 'identidade_representante_1', 'identidade_representante_2',
            # Relacionamentos
            'id_contato_principal', 'id_concorrente', 'id_perfil', 'codigo_operacao',
            'convert_cliente_forn', 'id_canal_venda', 'id_campanha',
            # Pagamento
            'tipo_pessoa_titular_conta', 'cnpj_cpf_titular_conta',
            # Integrações
            'cadastrado_no_galaxPay', 'atualizar_cadastro_galaxPay', 'id_galaxPay',
            'id_vindi', 'yapay_token_account', 'permite_armazenar_cartoes', 'foto_cartao',
            'tv_code', 'tv_access_token', 'tv_token_expires_in', 'tv_refresh_token',
            # Acesso
            'acesso_automatico_central', 'primeiro_acesso_central',
            'alterar_senha_primeiro_acesso', 'hash_redefinir_senha',
            'data_hash_redefinir_senha', 'senha_hotsite_md5', 'antigo_acesso_central',
            # Serasa e viabilidade
            'ativo_serasa', 'id_vd_contrato_desejado', 'cadastrado_via_viabilidade',
            'status_viabilidade',
            # Velocidade e localidade
            'tipo_localidade', 'qtd_pessoas_calc_vel', 'qtd_smart_calc_vel',
            'qtd_celular_calc_vel', 'qtd_computador_calc_vel', 'qtd_console_calc_vel',
            'freq_pessoas_calc_vel', 'freq_smart_calc_vel', 'freq_celular_calc_vel',
            'freq_computador_calc_vel', 'freq_console_calc_vel', 'resultado_calc_vel',
            'tipo_cobranca_auto_viab', 'plano_negociacao_auto_viab',
            'data_reserva_auto_viab', 'melhor_periodo_reserva_auto_viab',
            # Naturalidade e rede
            'cidade_naturalidade', 'operador_neutro', 'tipo_rede', 'rede_ativacao',
            # Identificação externa
            'external_id', 'external_system',
            # Indicação e conversão
            'indicado_por', 'numero_antigo', 'numero_cob_antigo', 'id_fornecedor_conversao',
            # Outros
            'filtra_filial', 'id_segmento', 'tipo_documento_identificacao', 'nome_social',
            # Campos de classificação (sistema ZionCRM)
            'prioridade', 'status_vendas', 'status_pos_venda', 'nivel_contentamento',
            'status_debito', 'origem', 'departamento', 'score', 'obs_classificacao'
        ]
        
        # Monta query de update
        update_fields = []
        update_values = []
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Nenhum campo válido para atualizar"}), 400
        
        # Adiciona ultima_atualizacao
        update_fields.append("ultima_atualizacao = %s")
        update_values.append(datetime.now())
        
        # Adiciona ID no final
        update_values.append(lead_id)
        
        query = f"""
            UPDATE lead
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Lead atualizado com sucesso"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@lead_bp.route('/<int:lead_id>/partial', methods=['PATCH'])
def partial_update_lead(lead_id):
    """Atualização parcial de lead (alias para PUT)"""
    return update_lead(lead_id)


# ============================================
# ENDPOINTS - EXCLUSÃO
# ============================================

@lead_bp.route('/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Deleta um lead (soft delete - marca como inativo)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Lead não encontrado"}), 404
        
        # Soft delete
        cursor.execute(
            "UPDATE lead SET ativo = 'I', ultima_atualizacao = %s WHERE id = %s",
            (datetime.now(), lead_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Lead removido com sucesso"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ENDPOINTS - ESTATÍSTICAS
# ============================================

@lead_bp.route('/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas gerais dos leads"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        stats = {}
        
        # Total de leads
        cursor.execute("SELECT COUNT(*) as total FROM lead")
        stats['total'] = cursor.fetchone()['total']
        
        # Leads ativos
        cursor.execute("SELECT COUNT(*) as total FROM lead WHERE ativo = 'S'")
        stats['ativos'] = cursor.fetchone()['total']
        
        # Leads inativos
        cursor.execute("SELECT COUNT(*) as total FROM lead WHERE ativo = 'I'")
        stats['inativos'] = cursor.fetchone()['total']
        
        # Por departamento
        cursor.execute("""
            SELECT departamento, COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY departamento
        """)
        stats['por_departamento'] = {row['departamento']: row['total'] for row in cursor.fetchall()}
        
        # Por prioridade
        cursor.execute("""
            SELECT prioridade, COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY prioridade
        """)
        stats['por_prioridade'] = {row['prioridade']: row['total'] for row in cursor.fetchall()}
        
        # Score médio
        cursor.execute("SELECT AVG(score) as media FROM lead WHERE score > 0")
        result = cursor.fetchone()
        stats['score_medio'] = float(result['media']) if result['media'] else 0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": stats
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# HEALTH CHECK
# ============================================

@lead_bp.route('/health', methods=['GET'])
def health_check():
    """Verifica status da API de Leads"""
    return jsonify({
        "status": "ok",
        "service": "LeadsDashAgent - Leads API",
        "timestamp": datetime.now().isoformat()
    })
