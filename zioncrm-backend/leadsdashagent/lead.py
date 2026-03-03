"""
Lead API - CRUD completo para gerenciamento de Leads (Clientes)
Conecta no PostgreSQL e fornece endpoints REST para o frontend
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime
import json
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configuração do PostgreSQL
POSTGRES_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}


def get_db_connection():
    """Cria conexão com PostgreSQL"""
    return psycopg2.connect(**POSTGRES_CONFIG)


def serialize_datetime(obj):
    """Serializa objetos datetime para JSON"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


# ============================================
# ROTAS DE FRONTEND
# ============================================

@app.route('/')
def index():
    """Redireciona para o CRUD"""
    return send_from_directory('static', 'crud.html')


@app.route('/crud')
def crud():
    """Serve o frontend CRUD"""
    return send_from_directory('static', 'crud.html')


# ============================================
# ENDPOINTS - LISTAGEM E BUSCA
# ============================================

@app.route('/api/leads', methods=['GET'])
def get_leads():
    """Lista todos os leads com paginação e filtros"""
    try:
        # Parâmetros de query
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        order_by = request.args.get('order_by', 'id')
        order_dir = request.args.get('order_dir', 'DESC')
        
        # Calcula offset
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Monta query base
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append("""
                (LOWER(razao) LIKE LOWER(%s) OR 
                 LOWER(fantasia) LIKE LOWER(%s) OR 
                 LOWER(cnpj_cpf) LIKE LOWER(%s) OR 
                 LOWER(email) LIKE LOWER(%s))
            """)
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term, search_term])
        
        if status:
            where_clauses.append("ativo = %s")
            params.append(status)
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        # Conta total de registros
        count_query = f"SELECT COUNT(*) as total FROM lead {where_sql}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Busca registros paginados
        query = f"""
            SELECT id, razao, fantasia, cnpj_cpf, email, fone, telefone_celular,
                   cidade, uf, ativo, status_internet, data_cadastro, 
                   ultima_atualizacao, id_vendedor, dia_vencimento,
                   prioridade, status_vendas, status_pos_venda, nivel_contentamento,
                   status_debito, origem, departamento, score, data_ultima_classificacao
            FROM lead
            {where_sql}
            ORDER BY {order_by} {order_dir}
            LIMIT %s OFFSET %s
        """
        params.extend([per_page, offset])
        cursor.execute(query, params)
        leads = cursor.fetchall()
        
        # Serializa dados
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Busca um lead específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM lead WHERE id = %s", (lead_id,))
        lead = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not lead:
            return jsonify({
                "success": False,
                "error": "Lead não encontrado"
            }), 404
        
        # Serializa dados
        lead_dict = dict(lead)
        for key, value in lead_dict.items():
            lead_dict[key] = serialize_datetime(value)
        
        return jsonify({
            "success": True,
            "data": lead_dict
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - CRIAÇÃO
# ============================================

@app.route('/api/leads', methods=['POST'])
def create_lead():
    """Cria um novo lead"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        # Campos obrigatórios
        required_fields = ['razao', 'cnpj_cpf']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Campo obrigatório ausente: {field}"
                }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Lista de campos permitidos (ajuste conforme sua tabela)
        allowed_fields = [
            'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
            'cnpj_cpf', 'ie_identidade', 'fone', 'cep', 'email', 'tipo_pessoa',
            'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
            'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento',
            'telefone_comercial', 'telefone_celular', 'referencia', 'complemento',
            'id_vendedor', 'data_nascimento', 'contato', 'estado_civil',
            'filial_id', 'latitude', 'longitude', 'alerta', 'endereco_cob',
            'numero_cob', 'bairro_cob', 'cidade_cob', 'uf_cob', 'cep_cob',
            # Novos campos de classificação
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - ATUALIZAÇÃO
# ============================================

@app.route('/api/leads/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Atualiza um lead existente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se lead existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Lead não encontrado"
            }), 404
        
        # Campos permitidos para atualização
        allowed_fields = [
            'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
            'cnpj_cpf', 'ie_identidade', 'fone', 'cep', 'email', 'tipo_pessoa',
            'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
            'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento',
            'telefone_comercial', 'telefone_celular', 'referencia', 'complemento',
            'id_vendedor', 'data_nascimento', 'contato', 'estado_civil',
            'filial_id', 'latitude', 'longitude', 'alerta', 'endereco_cob',
            'numero_cob', 'bairro_cob', 'cidade_cob', 'uf_cob', 'cep_cob',
            # Novos campos de classificação
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
            return jsonify({
                "success": False,
                "error": "Nenhum campo válido para atualizar"
            }), 400
        
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/<int:lead_id>/partial', methods=['PATCH'])
def partial_update_lead(lead_id):
    """Atualização parcial de campos específicos"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se lead existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Lead não encontrado"
            }), 404
        
        # Monta query dinamicamente
        update_parts = []
        values = []
        
        for key, value in data.items():
            if key != 'id':  # Não permite alterar ID
                update_parts.append(f"{key} = %s")
                values.append(value)
        
        if not update_parts:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Nenhum campo para atualizar"
            }), 400
        
        # Adiciona ultima_atualizacao
        update_parts.append("ultima_atualizacao = %s")
        values.append(datetime.now())
        values.append(lead_id)
        
        query = f"UPDATE lead SET {', '.join(update_parts)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Lead atualizado parcialmente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - EXCLUSÃO
# ============================================

@app.route('/api/leads/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Deleta um lead"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se lead existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Lead não encontrado"
            }), 404
        
        # Deleta lead
        cursor.execute("DELETE FROM lead WHERE id = %s", (lead_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Lead deletado com sucesso"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - ESTATÍSTICAS
# ============================================

@app.route('/api/leads/stats', methods=['GET'])
def get_leads_stats():
    """Retorna estatísticas dos leads"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Total de leads
        cursor.execute("SELECT COUNT(*) as total FROM lead")
        total = cursor.fetchone()['total']
        
        # Leads ativos
        cursor.execute("SELECT COUNT(*) as total FROM lead WHERE ativo = 'S'")
        ativos = cursor.fetchone()['total']
        
        # Leads inativos
        cursor.execute("SELECT COUNT(*) as total FROM lead WHERE ativo = 'I'")
        inativos = cursor.fetchone()['total']
        
        # Por tipo de pessoa
        cursor.execute("""
            SELECT tipo_pessoa, COUNT(*) as total 
            FROM lead 
            WHERE tipo_pessoa IS NOT NULL
            GROUP BY tipo_pessoa
        """)
        por_tipo = cursor.fetchall()
        
        # Cadastros recentes (últimos 7 dias)
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM lead 
            WHERE data_cadastro >= CURRENT_DATE - INTERVAL '7 days'
        """)
        recentes = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "total": total,
                "ativos": ativos,
                "inativos": inativos,
                "por_tipo_pessoa": [dict(row) for row in por_tipo],
                "cadastros_ultimos_7_dias": recentes
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - BUSCA AVANÇADA
# ============================================

@app.route('/api/leads/search', methods=['POST'])
def search_leads():
    """Busca avançada com múltiplos filtros"""
    try:
        filters = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_clauses = []
        params = []
        
        # Filtros disponíveis
        if filters.get('razao'):
            where_clauses.append("LOWER(razao) LIKE LOWER(%s)")
            params.append(f"%{filters['razao']}%")
        
        if filters.get('cnpj_cpf'):
            where_clauses.append("cnpj_cpf LIKE %s")
            params.append(f"%{filters['cnpj_cpf']}%")
        
        if filters.get('email'):
            where_clauses.append("LOWER(email) LIKE LOWER(%s)")
            params.append(f"%{filters['email']}%")
        
        if filters.get('cidade'):
            where_clauses.append("cidade = %s")
            params.append(filters['cidade'])
        
        if filters.get('uf'):
            where_clauses.append("uf = %s")
            params.append(filters['uf'])
        
        if filters.get('ativo'):
            where_clauses.append("ativo = %s")
            params.append(filters['ativo'])
        
        if filters.get('id_vendedor'):
            where_clauses.append("id_vendedor = %s")
            params.append(filters['id_vendedor'])
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        query = f"""
            SELECT id, razao, fantasia, cnpj_cpf, email, fone, cidade, uf, 
                   ativo, data_cadastro, id_vendedor
            FROM lead
            {where_sql}
            ORDER BY data_cadastro DESC
            LIMIT 100
        """
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        # Serializa dados
        results_list = []
        for row in results:
            row_dict = dict(row)
            for key, value in row_dict.items():
                row_dict[key] = serialize_datetime(value)
            results_list.append(row_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": results_list,
            "count": len(results_list)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - CLASSIFICAÇÃO AVANÇADA
# ============================================

@app.route('/api/leads/<int:lead_id>/classify', methods=['POST'])
def classify_lead_manual(lead_id):
    """
    Atualiza manualmente a classificação de uma lead
    
    Body JSON:
    {
        "prioridade": "Quente",
        "status_vendas": "NovaLeadVendas",
        "departamento": "vendas"
    }
    """
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se lead existe
        cursor.execute("SELECT id FROM lead WHERE id = %s", (lead_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Lead não encontrada"
            }), 404
        
        # Atualiza classificação
        update_fields = []
        update_values = []
        
        classification_fields = [
            'prioridade', 'status_vendas', 'status_pos_venda', 
            'nivel_contentamento', 'status_debito', 'origem', 
            'departamento', 'score', 'obs_classificacao'
        ]
        
        for field in classification_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "Nenhum campo de classificação fornecido"
            }), 400
        
        # Adiciona data de classificação
        update_fields.append("data_ultima_classificacao = %s")
        update_values.append(datetime.now())
        
        update_fields.append("ultima_atualizacao = %s")
        update_values.append(datetime.now())
        
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
            "message": "Classificação atualizada com sucesso"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/by-department/<department>', methods=['GET'])
def get_leads_by_department(department):
    """
    Lista leads por departamento (vendas ou pos_venda)
    
    Uso: GET /api/leads/by-department/vendas
          GET /api/leads/by-department/pos_venda
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Conta total
        cursor.execute("SELECT COUNT(*) as total FROM lead WHERE departamento = %s", (department,))
        total = cursor.fetchone()['total']
        
        # Busca leads
        cursor.execute("""
            SELECT id, razao, fantasia, cnpj_cpf, email, telefone_celular,
                   cidade, uf, prioridade, status_vendas, status_pos_venda,
                   nivel_contentamento, status_debito, origem, score, data_cadastro
            FROM lead
            WHERE departamento = %s
            ORDER BY score DESC, data_ultima_classificacao DESC
            LIMIT %s OFFSET %s
        """, (department, per_page, offset))
        
        leads = cursor.fetchall()
        
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
            "department": department,
            "data": leads_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/by-priority/<priority>', methods=['GET'])
def get_leads_by_priority(priority):
    """
    Lista leads por prioridade
    
    Uso: GET /api/leads/by-priority/Quente
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT id, razao, cnpj_cpf, email, telefone_celular,
                   prioridade, status_vendas, departamento, score
            FROM lead
            WHERE prioridade = %s
            ORDER BY score DESC, data_cadastro DESC
            LIMIT 100
        """, (priority,))
        
        leads = cursor.fetchall()
        
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
            "priority": priority,
            "data": leads_list,
            "count": len(leads_list)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/stats/advanced', methods=['GET'])
def get_advanced_stats():
    """Retorna estatísticas avançadas incluindo classificações"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Total de leads
        cursor.execute("SELECT COUNT(*) as total FROM lead")
        total = cursor.fetchone()['total']
        
        # Por departamento
        cursor.execute("""
            SELECT departamento, COUNT(*) as total 
            FROM lead 
            WHERE departamento IS NOT NULL
            GROUP BY departamento
        """)
        por_departamento = cursor.fetchall()
        
        # Por prioridade
        cursor.execute("""
            SELECT prioridade, COUNT(*) as total 
            FROM lead 
            WHERE prioridade IS NOT NULL
            GROUP BY prioridade
            ORDER BY 
                CASE prioridade
                    WHEN 'Queimando' THEN 1
                    WHEN 'MuitoQuente' THEN 2
                    WHEN 'Quente' THEN 3
                    WHEN 'Morna' THEN 4
                    WHEN 'Fria' THEN 5
                    WHEN 'Ruim' THEN 6
                    ELSE 7
                END
        """)
        por_prioridade = cursor.fetchall()
        
        # Por status de vendas
        cursor.execute("""
            SELECT status_vendas, COUNT(*) as total 
            FROM lead 
            WHERE status_vendas IS NOT NULL
            GROUP BY status_vendas
        """)
        por_status_vendas = cursor.fetchall()
        
        # Por origem (canal)
        cursor.execute("""
            SELECT origem, COUNT(*) as total 
            FROM lead 
            WHERE origem IS NOT NULL
            GROUP BY origem
            ORDER BY total DESC
        """)
        por_origem = cursor.fetchall()
        
        # Por nível de contentamento
        cursor.execute("""
            SELECT nivel_contentamento, COUNT(*) as total 
            FROM lead 
            WHERE nivel_contentamento IS NOT NULL
            GROUP BY nivel_contentamento
        """)
        por_contentamento = cursor.fetchall()
        
        # Score médio
        cursor.execute("SELECT AVG(score) as media FROM lead WHERE score > 0")
        score_medio = cursor.fetchone()['media'] or 0
        
        # Leads quentes (prioridade alta)
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM lead 
            WHERE prioridade IN ('Queimando', 'MuitoQuente', 'Quente')
        """)
        leads_quentes = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "total": total,
                "leads_quentes": leads_quentes,
                "score_medio": round(float(score_medio), 2),
                "por_departamento": [dict(row) for row in por_departamento],
                "por_prioridade": [dict(row) for row in por_prioridade],
                "por_status_vendas": [dict(row) for row in por_status_vendas],
                "por_origem": [dict(row) for row in por_origem],
                "por_contentamento": [dict(row) for row in por_contentamento]
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/leads/health', methods=['GET'])
def health_check():
    """Verifica saúde da API"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "status": "healthy",
            "database": "connected"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Lead API - Sistema de Gerenciamento de Leads")
    print("=" * 60)
    print("\n📡 Endpoints disponíveis:")
    print("\n  Listagem e Busca:")
    print("    GET    /api/leads              - Lista todos (paginado)")
    print("    GET    /api/leads/<id>         - Busca por ID")
    print("    POST   /api/leads/search       - Busca avançada")
    print("\n  Criação:")
    print("    POST   /api/leads              - Cria novo lead")
    print("\n  Atualização:")
    print("    PUT    /api/leads/<id>         - Atualiza lead completo")
    print("    PATCH  /api/leads/<id>/partial - Atualização parcial")
    print("\n  Exclusão:")
    print("    DELETE /api/leads/<id>         - Deleta lead")
    print("\n  Estatísticas:")
    print("    GET    /api/leads/stats        - Estatísticas gerais")
    print("\n  Health:")
    print("    GET    /api/leads/health       - Health check")
    print("\n" + "=" * 60)
    print("🌐 Servidor rodando em: http://localhost:5001")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
