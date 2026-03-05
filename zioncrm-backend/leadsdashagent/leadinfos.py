"""
Lead Infos API - CRUD para tabelas de suporte e usuários
Gerencia: su_oss_chamado, su_oss_chamado_arquivos, su_oss_chamado_historico,
         su_oss_chamado_mensagem, su_oss_evento, usuarios
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app)

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
# CHAMADOS (OSS)
# ============================================

@app.route('/api/chamados', methods=['GET'])
def get_chamados():
    """Lista chamados"""
    try:
        id_cliente = request.args.get('id_cliente', type=int)
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_clauses = []
        params = []
        
        if id_cliente:
            where_clauses.append("id_cliente = %s")
            params.append(id_cliente)
        
        if status:
            where_clauses.append("status = %s")
            params.append(status)
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        # Conta total
        count_query = f"SELECT COUNT(*) as total FROM su_oss_chamado {where_sql}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Busca dados
        params.extend([per_page, offset])
        query = f"""
            SELECT * FROM su_oss_chamado
            {where_sql}
            ORDER BY data_abertura DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params)
        chamados = cursor.fetchall()
        
        # Serializa
        chamados_list = []
        for chamado in chamados:
            chamado_dict = dict(chamado)
            for key, value in chamado_dict.items():
                chamado_dict[key] = serialize_datetime(value)
            chamados_list.append(chamado_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": chamados_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados/<int:chamado_id>', methods=['GET'])
def get_chamado(chamado_id):
    """Busca chamado específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM su_oss_chamado WHERE id = %s", (chamado_id,))
        chamado = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not chamado:
            return jsonify({"success": False, "error": "Chamado não encontrado"}), 404
        
        chamado_dict = dict(chamado)
        for key, value in chamado_dict.items():
            chamado_dict[key] = serialize_datetime(value)
        
        return jsonify({"success": True, "data": chamado_dict})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados', methods=['POST'])
def create_chamado():
    """Cria novo chamado"""
    try:
        data = request.get_json()
        
        required_fields = ['id_cliente', 'assunto', 'descricao']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_cliente', 'assunto', 'descricao', 'status', 'prioridade',
            'id_setor', 'id_tecnico', 'id_origem', 'data_abertura',
            'data_previsao', 'data_fechamento', 'observacao', 'numero_chamado'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_abertura' not in data:
            insert_fields.append('data_abertura')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        if 'status' not in data:
            insert_fields.append('status')
            insert_values.append('A')  # Aberto
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO su_oss_chamado ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Chamado criado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados/<int:chamado_id>', methods=['PUT'])
def update_chamado(chamado_id):
    """Atualiza chamado"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM su_oss_chamado WHERE id = %s", (chamado_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Chamado não encontrado"}), 404
        
        allowed_fields = [
            'assunto', 'descricao', 'status', 'prioridade', 'id_setor',
            'id_tecnico', 'data_previsao', 'data_fechamento', 'observacao'
        ]
        
        update_fields = []
        update_values = []
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Nenhum campo para atualizar"}), 400
        
        update_values.append(chamado_id)
        
        query = f"UPDATE su_oss_chamado SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Chamado atualizado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados/<int:chamado_id>', methods=['DELETE'])
def delete_chamado(chamado_id):
    """Deleta chamado"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM su_oss_chamado WHERE id = %s", (chamado_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Chamado não encontrado"}), 404
        
        cursor.execute("DELETE FROM su_oss_chamado WHERE id = %s", (chamado_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Chamado deletado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ARQUIVOS DE CHAMADOS
# ============================================

@app.route('/api/chamados-arquivos', methods=['GET'])
def get_chamados_arquivos():
    """Lista arquivos dos chamados"""
    try:
        id_chamado = request.args.get('id_chamado', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_chamado = %s" if id_chamado else ""
        params = [id_chamado] if id_chamado else []
        
        query = f"""
            SELECT * FROM su_oss_chamado_arquivos
            {where_sql}
            ORDER BY data_upload DESC
        """
        cursor.execute(query, params)
        arquivos = cursor.fetchall()
        
        arquivos_list = []
        for arquivo in arquivos:
            arquivo_dict = dict(arquivo)
            for key, value in arquivo_dict.items():
                arquivo_dict[key] = serialize_datetime(value)
            arquivos_list.append(arquivo_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": arquivos_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-arquivos', methods=['POST'])
def create_chamado_arquivo():
    """Adiciona arquivo ao chamado"""
    try:
        data = request.get_json()
        
        required_fields = ['id_chamado']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_chamado', 'nome_arquivo', 'caminho', 'tipo', 'tamanho',
            'data_upload', 'id_usuario'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_upload' not in data:
            insert_fields.append('data_upload')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO su_oss_chamado_arquivos ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Arquivo adicionado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-arquivos/<int:arquivo_id>', methods=['DELETE'])
def delete_chamado_arquivo(arquivo_id):
    """Remove arquivo do chamado"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM su_oss_chamado_arquivos WHERE id = %s", (arquivo_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Arquivo não encontrado"}), 404
        
        cursor.execute("DELETE FROM su_oss_chamado_arquivos WHERE id = %s", (arquivo_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Arquivo removido"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# HISTÓRICO DE CHAMADOS
# ============================================

@app.route('/api/chamados-historico', methods=['GET'])
def get_chamados_historico():
    """Lista histórico de chamados"""
    try:
        id_chamado = request.args.get('id_chamado', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_chamado = %s" if id_chamado else ""
        params = [id_chamado] if id_chamado else []
        
        query = f"""
            SELECT * FROM su_oss_chamado_historico
            {where_sql}
            ORDER BY data_evento DESC
        """
        cursor.execute(query, params)
        historico = cursor.fetchall()
        
        historico_list = []
        for item in historico:
            item_dict = dict(item)
            for key, value in item_dict.items():
                item_dict[key] = serialize_datetime(value)
            historico_list.append(item_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": historico_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-historico', methods=['POST'])
def create_chamado_historico():
    """Adiciona evento ao histórico do chamado"""
    try:
        data = request.get_json()
        
        required_fields = ['id_chamado', 'tipo_evento']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_chamado', 'tipo_evento', 'descricao', 'data_evento',
            'id_usuario', 'campo_alterado', 'valor_anterior', 'valor_novo'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_evento' not in data:
            insert_fields.append('data_evento')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO su_oss_chamado_historico ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Histórico adicionado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# MENSAGENS DE CHAMADOS
# ============================================

@app.route('/api/chamados-mensagens', methods=['GET'])
def get_chamados_mensagens():
    """Lista mensagens do chamado"""
    try:
        id_chamado = request.args.get('id_chamado', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_chamado = %s" if id_chamado else ""
        params = [id_chamado] if id_chamado else []
        
        query = f"""
            SELECT * FROM su_oss_chamado_mensagem
            {where_sql}
            ORDER BY data_mensagem ASC
        """
        cursor.execute(query, params)
        mensagens = cursor.fetchall()
        
        mensagens_list = []
        for mensagem in mensagens:
            mensagem_dict = dict(mensagem)
            for key, value in mensagem_dict.items():
                mensagem_dict[key] = serialize_datetime(value)
            mensagens_list.append(mensagem_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": mensagens_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-mensagens', methods=['POST'])
def create_chamado_mensagem():
    """Adiciona mensagem ao chamado"""
    try:
        data = request.get_json()
        
        required_fields = ['id_chamado', 'mensagem']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_chamado', 'mensagem', 'id_usuario', 'tipo_remetente',
            'data_mensagem', 'lida', 'privada'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_mensagem' not in data:
            insert_fields.append('data_mensagem')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO su_oss_chamado_mensagem ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Mensagem adicionada", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-mensagens/<int:mensagem_id>', methods=['PUT'])
def update_chamado_mensagem(mensagem_id):
    """Atualiza mensagem (marcar como lida, etc)"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM su_oss_chamado_mensagem WHERE id = %s", (mensagem_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Mensagem não encontrada"}), 404
        
        allowed_fields = ['lida', 'privada']
        
        update_fields = []
        update_values = []
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Nenhum campo para atualizar"}), 400
        
        update_values.append(mensagem_id)
        
        query = f"UPDATE su_oss_chamado_mensagem SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Mensagem atualizada"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chamados-mensagens/<int:mensagem_id>', methods=['DELETE'])
def delete_chamado_mensagem(mensagem_id):
    """Remove mensagem do chamado"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM su_oss_chamado_mensagem WHERE id = %s", (mensagem_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Mensagem não encontrada"}), 404
        
        cursor.execute("DELETE FROM su_oss_chamado_mensagem WHERE id = %s", (mensagem_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Mensagem removida"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# EVENTOS
# ============================================

@app.route('/api/eventos', methods=['GET'])
def get_eventos():
    """Lista eventos do sistema"""
    try:
        tipo = request.args.get('tipo')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE tipo = %s" if tipo else ""
        params = [tipo, per_page, offset] if tipo else [per_page, offset]
        
        # Conta total
        count_query = f"SELECT COUNT(*) as total FROM su_oss_evento {where_sql}"
        cursor.execute(count_query, params[:-2] if tipo else [])
        total = cursor.fetchone()['total']
        
        # Busca dados
        query = f"""
            SELECT * FROM su_oss_evento
            {where_sql}
            ORDER BY data_evento DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params)
        eventos = cursor.fetchall()
        
        eventos_list = []
        for evento in eventos:
            evento_dict = dict(evento)
            for key, value in evento_dict.items():
                evento_dict[key] = serialize_datetime(value)
            eventos_list.append(evento_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": eventos_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/eventos', methods=['POST'])
def create_evento():
    """Registra novo evento"""
    try:
        data = request.get_json()
        
        required_fields = ['tipo', 'descricao']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'tipo', 'descricao', 'id_usuario', 'id_cliente', 'id_chamado',
            'data_evento', 'ip', 'user_agent'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_evento' not in data:
            insert_fields.append('data_evento')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO su_oss_evento ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Evento registrado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# USUÁRIOS
# ============================================

@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    """Lista usuários"""
    try:
        ativo = request.args.get('ativo')
        tipo = request.args.get('tipo')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_clauses = []
        params = []
        
        if ativo:
            where_clauses.append("ativo = %s")
            params.append(ativo)
        
        if tipo:
            where_clauses.append("tipo = %s")
            params.append(tipo)
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        query = f"""
            SELECT id, login, nome, email, tipo, ativo, data_cadastro,
                   ultimo_acesso, id_filial
            FROM usuarios
            {where_sql}
            ORDER BY nome ASC
        """
        cursor.execute(query, params)
        usuarios = cursor.fetchall()
        
        usuarios_list = []
        for usuario in usuarios:
            usuario_dict = dict(usuario)
            for key, value in usuario_dict.items():
                usuario_dict[key] = serialize_datetime(value)
            usuarios_list.append(usuario_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": usuarios_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/usuarios/<int:usuario_id>', methods=['GET'])
def get_usuario(usuario_id):
    """Busca usuário específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Não retorna senha
        cursor.execute("""
            SELECT id, login, nome, email, tipo, ativo, data_cadastro,
                   ultimo_acesso, id_filial, telefone, observacao
            FROM usuarios 
            WHERE id = %s
        """, (usuario_id,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not usuario:
            return jsonify({"success": False, "error": "Usuário não encontrado"}), 404
        
        usuario_dict = dict(usuario)
        for key, value in usuario_dict.items():
            usuario_dict[key] = serialize_datetime(value)
        
        return jsonify({"success": True, "data": usuario_dict})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/usuarios', methods=['POST'])
def create_usuario():
    """Cria novo usuário"""
    try:
        data = request.get_json()
        
        required_fields = ['login', 'nome', 'senha']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se login já existe
        cursor.execute("SELECT id FROM usuarios WHERE login = %s", (data['login'],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Login já existe"}), 400
        
        allowed_fields = [
            'login', 'senha', 'nome', 'email', 'tipo', 'ativo',
            'id_filial', 'telefone', 'observacao'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                # Hash da senha deveria ser implementado aqui
                insert_values.append(data[field])
                placeholders.append('%s')
        
        insert_fields.append('data_cadastro')
        insert_values.append(datetime.now())
        placeholders.append('%s')
        
        if 'ativo' not in data:
            insert_fields.append('ativo')
            insert_values.append('S')
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO usuarios ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Usuário criado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/usuarios/<int:usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    """Atualiza usuário"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM usuarios WHERE id = %s", (usuario_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Usuário não encontrado"}), 404
        
        allowed_fields = [
            'nome', 'email', 'tipo', 'ativo', 'id_filial',
            'telefone', 'observacao', 'senha'
        ]
        
        update_fields = []
        update_values = []
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                # Hash da senha deveria ser implementado aqui
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Nenhum campo para atualizar"}), 400
        
        update_values.append(usuario_id)
        
        query = f"UPDATE usuarios SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Usuário atualizado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/usuarios/<int:usuario_id>', methods=['DELETE'])
def delete_usuario(usuario_id):
    """Deleta usuário"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM usuarios WHERE id = %s", (usuario_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Usuário não encontrado"}), 404
        
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Usuário deletado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ESTATÍSTICAS
# ============================================

@app.route('/api/chamados/stats', methods=['GET'])
def get_chamados_stats():
    """Estatísticas de chamados"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Total de chamados
        cursor.execute("SELECT COUNT(*) as total FROM su_oss_chamado")
        total = cursor.fetchone()['total']
        
        # Por status
        cursor.execute("""
            SELECT status, COUNT(*) as total 
            FROM su_oss_chamado 
            GROUP BY status
        """)
        por_status = cursor.fetchall()
        
        # Por prioridade
        cursor.execute("""
            SELECT prioridade, COUNT(*) as total 
            FROM su_oss_chamado 
            WHERE prioridade IS NOT NULL
            GROUP BY prioridade
        """)
        por_prioridade = cursor.fetchall()
        
        # Abertos hoje
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM su_oss_chamado 
            WHERE DATE(data_abertura) = CURRENT_DATE
        """)
        abertos_hoje = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "total": total,
                "por_status": [dict(row) for row in por_status],
                "por_prioridade": [dict(row) for row in por_prioridade],
                "abertos_hoje": abertos_hoje
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/infos/health', methods=['GET'])
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
    print("🚀 Lead Infos API - Suporte e Usuários")
    print("=" * 60)
    print("\n📡 Endpoints disponíveis:")
    print("\n  Chamados:")
    print("    GET    /api/chamados")
    print("    GET    /api/chamados/<id>")
    print("    POST   /api/chamados")
    print("    PUT    /api/chamados/<id>")
    print("    DELETE /api/chamados/<id>")
    print("\n  Arquivos de Chamados:")
    print("    GET    /api/chamados-arquivos")
    print("    POST   /api/chamados-arquivos")
    print("    DELETE /api/chamados-arquivos/<id>")
    print("\n  Histórico de Chamados:")
    print("    GET    /api/chamados-historico")
    print("    POST   /api/chamados-historico")
    print("\n  Mensagens de Chamados:")
    print("    GET    /api/chamados-mensagens")
    print("    POST   /api/chamados-mensagens")
    print("    PUT    /api/chamados-mensagens/<id>")
    print("    DELETE /api/chamados-mensagens/<id>")
    print("\n  Eventos:")
    print("    GET    /api/eventos")
    print("    POST   /api/eventos")
    print("\n  Usuários:")
    print("    GET    /api/usuarios")
    print("    GET    /api/usuarios/<id>")
    print("    POST   /api/usuarios")
    print("    PUT    /api/usuarios/<id>")
    print("    DELETE /api/usuarios/<id>")
    print("\n  Estatísticas:")
    print("    GET    /api/chamados/stats")
    print("\n" + "=" * 60)
    print("🌐 Servidor rodando em: http://localhost:5003")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)
