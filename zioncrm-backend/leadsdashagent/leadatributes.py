"""
Lead Attributes API - CRUD para tabelas de contratos e arquivos
Gerencia: cliente_arquivos, cliente_contrato, cliente_contrato_alt_plano, 
         cliente_contrato_historico, cliente_contrato_servicos

FUNCIONALIDADES AVANÇADAS:
- Classificação automática de leads baseada no status do contrato
- Integração com Facebook API para criação automática de leads
- Sistema de pontuação e priorização de leads
- Gestão de satisfação do cliente
- Canais de comunicação e origem das leads
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# ============================================
# CONSTANTES - CLASSIFICAÇÃO DE LEADS
# ============================================

# Prioridade da Lead (temperatura)
NEWLEAD = 'NovaLead'
LOW = 'Ruim'
COLD = 'Fria'
MEDIUN = 'Morna'
WARM = 'Quente'
VERYHOT = 'MuitoQuente'
BURNING = 'Queimando'

CHOICES_PRIORITY = (
    (NEWLEAD, 'Nova Lead'),
    (LOW, 'Ruim'),
    (COLD, 'Fria'),
    (MEDIUN, 'Morna'),
    (WARM, 'Quente'),
    (VERYHOT, 'Muito Quente'),
    (BURNING, 'Queimando'),
)

# Status de Vendas (tratamento de vendas)
NEWLEADSALES = 'NovaLeadVendas'
LOSSLOW = 'PerdasLeadsRuins'
LOSSCOLD = 'PerdasLeadsFrias'
LOSSMEDIUN = 'PerdasLeadsMornas'
LOSSWARM = 'PerdasLeadsQuentes'
LOSSVERYHOT = 'PerdasLeadsMuitoQuentes'
LOSSBURNING = 'PerdasLeadsQueimando'
RECOVERED = 'Recuperadas'
STRATEGY = 'Recuperar'
FIDELITY = 'Fidelizado'

CHOICES_STATUS = (
    (NEWLEADSALES, 'Nova Lead Vendas'),
    (LOSSLOW, 'Perdas Leads Ruins'),
    (LOSSCOLD, 'Perdas Leads Frias'),
    (LOSSMEDIUN, 'Perdas Leads Mornas'),
    (LOSSWARM, 'Perdas Leads Quentes'),
    (LOSSVERYHOT, 'Perdas Leads Muito Quentes'),
    (LOSSBURNING, 'Perdas Leads Queimando'),
    (RECOVERED, 'Recuperadas'),
    (STRATEGY, 'Recuperar'),
    (FIDELITY, 'Fidelizado'),
)

# Avaliação (nível de contentamento)
EXCELLENT = 'Excelente'
GOOD = 'Bom'
REGULAR = 'Regular'
BAD = 'Ruim'
TERRIBLE = 'Pessimo'

CHOICES_NIVEL_CONTENTAMENTO = (
    (EXCELLENT, 'Excelente'),
    (GOOD, 'Bom'),
    (REGULAR, 'Regular'),
    (BAD, 'Ruim'),
    (TERRIBLE, 'Péssimo'),
)

# Status financeiro
ON_TIME = 'EmDia'
LATE = 'EmAtraso'

CHOICES_STATUS_DEBITO = (
    (ON_TIME, 'Em dia'),
    (LATE, 'Em atraso'),
)

# Canais de Comunicação (origem da lead)
PAMPHLET = 'Panfleto'
PHONE = 'Telefone'
EMAIL = 'Email'
WHATSAPP = 'WhatsApp'
SOCIAL_MEDIA0 = 'RedeInstagram'
SOCIAL_MEDIA1 = 'RedeFacebook'
SOCIAL_MEDIA2 = 'RedeGoogle'
SOCIAL_MEDIA3 = 'RedeTwiter'
STORE = 'Loja'

CHOICES_CANAIS_COMUNICACAO = (
    (PAMPHLET, 'Panfleto'),
    (PHONE, 'Telefone'),
    (EMAIL, 'E-mail'),
    (WHATSAPP, 'WhatsApp'),
    (SOCIAL_MEDIA0, 'Instagram'),
    (SOCIAL_MEDIA1, 'Facebook'),
    (SOCIAL_MEDIA2, 'Google'),
    (SOCIAL_MEDIA3, 'Twitter'),
    (STORE, 'Loja'),
)

# Pós Venda (tratamento do cliente pós venda)
FOLLOWUP = 'AcompanhamentoPersonalizado'
NEWLEADPSALES = 'NovaLeadposVendas'
SUPPORT = 'TreinamentoSuporte'
LOYALTY = 'ProgramasDeFidelidade'
THANKYOU = 'AcoesDeAgradecimento'
FEEDBACK = 'AnaliseDeUsoEFeedback'
ACTIVED = 'AtivasSatisfeitas'
ACTIVED2 = 'AtivasInsatisfeitas'
STRATEGY2 = 'RecuperarSatisfacao'
UPSALE = 'UpsellCrossSell'
QUICK_SUPPORT = 'AtendimentoRapido'
LONG_RELATIONSHIP = 'RelacionamentoDeLongoPrazo'

CHOICES_POS_VENDA = (
    (FOLLOWUP, 'Acompanhamento Personalizado'),
    (SUPPORT, 'Treinamento e Suporte'),
    (LOYALTY, 'Programas de Fidelidade'),
    (THANKYOU, 'Ações de Agradecimento'),
    (FEEDBACK, 'Análise de Uso e Feedback'),
    (ACTIVED, 'Ativas Satisfeitas'),
    (ACTIVED2, 'Ativas Insatisfeitas'),
    (STRATEGY2, 'Recuperar Satisfação'),
    (UPSALE, 'Oferecer Novos Produtos'),
    (QUICK_SUPPORT, 'Atendimento Rápido'),
    (LONG_RELATIONSHIP, 'Relacionamento de Longo Prazo'),
)

# Configuração do PostgreSQL
POSTGRES_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}

# ============================================
# CONFIGURAÇÕES DE INTEGRAÇÃO (A SEREM PREENCHIDAS)
# ============================================

# TODO: Configurar integração com Facebook Lead Ads
FACEBOOK_CONFIG = {
    "page_access_token": "",  # Token de acesso da página
    "verify_token": "",        # Token de verificação webhook
    "app_secret": "",          # App Secret do Facebook
}

# TODO: Configurar tabela de satisfação do cliente
# Esta tabela deve existir no banco de dados para buscar a satisfação
SATISFACTION_CONFIG = {
    "table_name": "",           # Nome da tabela (ex: 'cliente_satisfacao')
    "column_id_cliente": "",    # Coluna que liga ao cliente (ex: 'id_cliente')
    "column_rating": "",        # Coluna com a avaliação (ex: 'nota')
    "column_feedback": "",      # Coluna com feedback texto (ex: 'comentario')
    "column_date": "",          # Coluna com data da avaliação (ex: 'data_avaliacao')
}

# TODO: Configurar outras integrações de criação de leads
WHATSAPP_CONFIG = {
    "enabled": False,
    "webhook_url": "",
    "api_token": "",
}

PHONE_INTEGRATION = {
    "enabled": False,
    "pbx_api_url": "",
    "api_key": "",
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
# FUNÇÕES DE LÓGICA DE NEGÓCIO
# ============================================

def get_customer_satisfaction(id_cliente):
    """
    Busca a satisfação do cliente no banco de dados
    
    TODO: Preencher SATISFACTION_CONFIG com os nomes corretos das tabelas/colunas
    
    Args:
        id_cliente: ID do cliente
    
    Returns:
        dict: Dados de satisfação ou None se não configurado/encontrado
    """
    if not SATISFACTION_CONFIG["table_name"]:
        return None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = f"""
            SELECT 
                {SATISFACTION_CONFIG['column_rating']} as rating,
                {SATISFACTION_CONFIG['column_feedback']} as feedback,
                {SATISFACTION_CONFIG['column_date']} as date
            FROM {SATISFACTION_CONFIG['table_name']}
            WHERE {SATISFACTION_CONFIG['column_id_cliente']} = %s
            ORDER BY {SATISFACTION_CONFIG['column_date']} DESC
            LIMIT 1
        """
        
        cursor.execute(query, (id_cliente,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            return {
                "rating": result['rating'],
                "feedback": result['feedback'],
                "date": serialize_datetime(result['date'])
            }
        
        return None
        
    except Exception as e:
        print(f"Erro ao buscar satisfação do cliente: {e}")
        return None


def classify_lead_by_contract_status(id_cliente):
    """
    Classifica a lead baseada no status do contrato
    
    REGRAS DE NEGÓCIO:
    - Se contrato ATIVO: cliente vai para PÓS-VENDA
    - Se contrato DESATIVADO: cliente vai para VENDAS (recuperação)
    - Se sem contrato: permanece como NOVA LEAD
    
    Args:
        id_cliente: ID do cliente/lead
    
    Returns:
        dict: Classificação sugerida
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Busca contratos do cliente
        cursor.execute("""
            SELECT status, data_cancelamento, valor_total
            FROM cliente_contrato
            WHERE id_cliente = %s
            ORDER BY data_cadastro DESC
            LIMIT 1
        """, (id_cliente,))
        
        contrato = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not contrato:
            # Sem contrato = Nova Lead em Vendas
            return {
                "departamento": "vendas",
                "status_vendas": NEWLEADSALES,
                "status_pos_venda": None,
                "prioridade": NEWLEAD,
                "motivo": "Cliente sem contrato ativo"
            }
        
        # Contrato ativo
        if contrato['status'] and contrato['status'].upper() in ['A', 'ATIVO', 'ACTIVE']:
            # Busca satisfação para classificar em pós-venda
            satisfaction = get_customer_satisfaction(id_cliente)
            
            if satisfaction:
                rating = satisfaction.get('rating', 0)
                
                # Classifica baseado na satisfação
                if rating >= 4:  # Satisfeito
                    return {
                        "departamento": "pos_venda",
                        "status_vendas": FIDELITY,
                        "status_pos_venda": ACTIVED,
                        "prioridade": WARM,
                        "nivel_contentamento": EXCELLENT if rating == 5 else GOOD,
                        "motivo": "Cliente ativo e satisfeito"
                    }
                else:  # Insatisfeito
                    return {
                        "departamento": "pos_venda",
                        "status_vendas": STRATEGY,
                        "status_pos_venda": ACTIVED2,
                        "prioridade": VERYHOT,
                        "nivel_contentamento": BAD if rating == 2 else TERRIBLE,
                        "motivo": "Cliente ativo mas insatisfeito - necessita atenção"
                    }
            else:
                # Sem info de satisfação, assume satisfeito
                return {
                    "departamento": "pos_venda",
                    "status_vendas": FIDELITY,
                    "status_pos_venda": ACTIVED,
                    "prioridade": WARM,
                    "motivo": "Cliente ativo (satisfação não avaliada)"
                }
        
        # Contrato cancelado/inativo
        else:
            return {
                "departamento": "vendas",
                "status_vendas": STRATEGY,
                "status_pos_venda": None,
                "prioridade": VERYHOT,
                "motivo": "Cliente com contrato cancelado - recuperação necessária"
            }
    
    except Exception as e:
        print(f"Erro ao classificar lead: {e}")
        return {
            "departamento": "vendas",
            "status_vendas": NEWLEADSALES,
            "prioridade": NEWLEAD,
            "motivo": f"Erro na classificação: {e}"
        }


def create_lead_from_facebook(facebook_data):
    """
    Cria uma nova lead a partir dos dados do Facebook Lead Ads
    
    TODO: Configurar FACEBOOK_CONFIG e implementar webhook
    
    Args:
        facebook_data: Dados recebidos do Facebook webhook
    
    Returns:
        dict: Lead criada ou erro
    """
    try:
        # TODO: Validar dados do Facebook
        # facebook_data deve conter: name, email, phone, etc.
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Dados da lead do Facebook
        lead_data = {
            "razao": facebook_data.get('name', facebook_data.get('full_name', '')),
            "email": facebook_data.get('email', ''),
            "telefone_celular": facebook_data.get('phone', facebook_data.get('phone_number', '')),
            "origem": SOCIAL_MEDIA1,  # Facebook
            "prioridade": NEWLEAD,
            "status_vendas": NEWLEADSALES,
            "data_cadastro": datetime.now(),
            "obs": f"Lead criada automaticamente via Facebook em {datetime.now()}"
        }
        
        # Verifica se já existe pelo email ou telefone
        if lead_data['email']:
            cursor.execute("""
                SELECT id FROM lead WHERE email = %s
            """, (lead_data['email'],))
            
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return {
                    "success": False,
                    "error": "Lead já existe com este email",
                    "action": "duplicate_prevention"
                }
        
        # Cria a lead
        # TODO: Integrar com a API de leads (lead.py) em localhost:5001
        # Por enquanto, retorna os dados que seriam enviados
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "lead_data": lead_data,
            "message": "Lead capturada do Facebook",
            "next_step": "Enviar para API de leads localhost:5001/api/leads"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def create_lead_from_contact(contact_data, source):
    """
    Cria lead a partir de contato via WhatsApp, telefone ou outro canal
    
    TODO: Integrar com sistemas de telefonia/WhatsApp
    
    Args:
        contact_data: Dados do contato (nome, telefone, mensagem)
        source: Origem (WHATSAPP, PHONE, EMAIL, etc.)
    
    Returns:
        dict: Lead criada ou erro
    """
    try:
        lead_data = {
            "razao": contact_data.get('name', 'Nome não informado'),
            "telefone_celular": contact_data.get('phone', ''),
            "email": contact_data.get('email', ''),
            "origem": source,
            "prioridade": WARM if source == WHATSAPP else MEDIUN,
            "status_vendas": NEWLEADSALES,
            "data_cadastro": datetime.now(),
            "obs": f"Lead criada via {source} - Mensagem: {contact_data.get('message', '')}"
        }
        
        return {
            "success": True,
            "lead_data": lead_data,
            "message": f"Lead capturada via {source}",
            "next_step": "Enviar para API de leads localhost:5001/api/leads"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def update_lead_classification(id_cliente):
    """
    Atualiza a classificação de uma lead baseada em dados atuais
    
    Esta função deve ser chamada:
    - Quando um contrato é criado/alterado
    - Quando a satisfação do cliente é atualizada
    - Periodicamente (batch processing)
    
    Args:
        id_cliente: ID do cliente/lead
    
    Returns:
        dict: Resultado da atualização
    """
    try:
        # Classifica baseado no contrato
        classification = classify_lead_by_contract_status(id_cliente)
        
        # TODO: Atualizar na tabela lead (via API localhost:5001)
        # Campos a atualizar: prioridade, status_vendas, status_pos_venda, nivel_contentamento
        
        return {
            "success": True,
            "id_cliente": id_cliente,
            "classification": classification,
            "next_step": "Atualizar lead via API localhost:5001/api/leads/" + str(id_cliente)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def check_financial_status(id_cliente):
    """
    Verifica o status financeiro do cliente
    
    TODO: Implementar lógica de verificação de débitos/vencimentos
    
    Args:
        id_cliente: ID do cliente
    
    Returns:
        str: ON_TIME ou LATE
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # TODO: Verificar na tabela de financeiro/boletos
        # Por enquanto, assume em dia
        
        cursor.close()
        conn.close()
        
        return ON_TIME
        
    except Exception as e:
        print(f"Erro ao verificar status financeiro: {e}")
        return ON_TIME


# ============================================
# ENDPOINTS DE CLASSIFICAÇÃO DE LEADS
# ============================================

@app.route('/api/leads/classify/<int:id_cliente>', methods=['POST'])
def classify_lead(id_cliente):
    """
    Classifica uma lead baseada no status do contrato e satisfação
    
    Uso: POST /api/leads/classify/123
    """
    try:
        classification = classify_lead_by_contract_status(id_cliente)
        financial_status = check_financial_status(id_cliente)
        
        classification['status_debito'] = financial_status
        
        return jsonify({
            "success": True,
            "id_cliente": id_cliente,
            "classification": classification
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/classify-all', methods=['POST'])
def classify_all_leads():
    """
    Classifica todas as leads em lote
    
    ATENÇÃO: Esta operação pode demorar dependendo do número de leads
    
    Uso: POST /api/leads/classify-all
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Busca todos os clientes
        cursor.execute("SELECT id FROM lead")
        clientes = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        results = []
        for cliente in clientes:
            classification = classify_lead_by_contract_status(cliente['id'])
            results.append({
                "id_cliente": cliente['id'],
                "classification": classification
            })
        
        return jsonify({
            "success": True,
            "total_processed": len(results),
            "results": results,
            "next_step": "Use os resultados para atualizar as leads via API localhost:5001"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/facebook-webhook', methods=['GET', 'POST'])
def facebook_webhook():
    """
    Webhook para receber leads do Facebook Lead Ads
    
    TODO: 
    1. Configurar FACEBOOK_CONFIG
    2. Configurar webhook no Facebook Business Manager
    3. Apontar para: https://seu-servidor.com/api/leads/facebook-webhook
    
    GET: Verificação do webhook pelo Facebook
    POST: Recebimento de dados da lead
    """
    if request.method == 'GET':
        # Verificação do webhook
        verify_token = request.args.get('hub.verify_token', '')
        challenge = request.args.get('hub.challenge', '')
        
        if verify_token == FACEBOOK_CONFIG['verify_token']:
            return challenge
        else:
            return jsonify({"error": "Token inválido"}), 403
    
    elif request.method == 'POST':
        # Recebimento de lead
        data = request.get_json()
        
        # TODO: Validar assinatura do Facebook (segurança)
        # TODO: Processar dados e criar lead
        
        result = create_lead_from_facebook(data)
        
        return jsonify(result)


@app.route('/api/leads/from-contact', methods=['POST'])
def create_lead_contact():
    """
    Cria lead a partir de um contato via WhatsApp/Telefone/Email
    
    Body JSON:
    {
        "name": "Nome do cliente",
        "phone": "11999999999",
        "email": "email@example.com",
        "message": "Mensagem enviada",
        "source": "WhatsApp" ou "Telefone" ou "Email"
    }
    
    TODO: Integrar com sistemas de WhatsApp e telefonia
    """
    try:
        data = request.get_json()
        
        source_map = {
            "WhatsApp": WHATSAPP,
            "Telefone": PHONE,
            "Email": EMAIL,
            "Instagram": SOCIAL_MEDIA0,
            "Facebook": SOCIAL_MEDIA1,
        }
        
        source = source_map.get(data.get('source', ''), PHONE)
        
        result = create_lead_from_contact(data, source)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/leads/satisfaction/<int:id_cliente>', methods=['GET'])
def get_satisfaction(id_cliente):
    """
    Busca dados de satisfação do cliente
    
    TODO: Configurar SATISFACTION_CONFIG
    """
    try:
        satisfaction = get_customer_satisfaction(id_cliente)
        
        if satisfaction:
            return jsonify({
                "success": True,
                "id_cliente": id_cliente,
                "satisfaction": satisfaction
            })
        else:
            return jsonify({
                "success": False,
                "message": "Satisfação não encontrada ou não configurada"
            }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/sync/verify-and-classify', methods=['POST'])
def verify_and_classify_on_sync():
    """
    Endpoint chamado durante a sincronização de dados
    
    Verifica contratos e classifica leads automaticamente
    
    INTEGRAÇÃO: Este endpoint deve ser chamado pelo zionexportatributes.py
    após sincronizar contratos do MariaDB para PostgreSQL
    
    Body JSON:
    {
        "id_cliente": 123
    }
    """
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        
        if not id_cliente:
            return jsonify({
                "success": False,
                "error": "id_cliente é obrigatório"
            }), 400
        
        # Classifica a lead
        classification = classify_lead_by_contract_status(id_cliente)
        
        return jsonify({
            "success": True,
            "id_cliente": id_cliente,
            "classification": classification,
            "message": "Lead classificada durante sincronização"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# CLIENTE ARQUIVOS
# ============================================

@app.route('/api/arquivos', methods=['GET'])
def get_arquivos():
    """Lista arquivos dos clientes"""
    try:
        id_cliente = request.args.get('id_cliente', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_cliente = %s" if id_cliente else ""
        params = [id_cliente, per_page, offset] if id_cliente else [per_page, offset]
        
        # Conta total
        count_query = f"SELECT COUNT(*) as total FROM cliente_arquivos {where_sql}"
        cursor.execute(count_query, params[:-2] if id_cliente else [])
        total = cursor.fetchone()['total']
        
        # Busca dados
        query = f"""
            SELECT * FROM cliente_arquivos
            {where_sql}
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params)
        arquivos = cursor.fetchall()
        
        # Serializa
        arquivos_list = []
        for arquivo in arquivos:
            arquivo_dict = dict(arquivo)
            for key, value in arquivo_dict.items():
                arquivo_dict[key] = serialize_datetime(value)
            arquivos_list.append(arquivo_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": arquivos_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/arquivos/<int:arquivo_id>', methods=['GET'])
def get_arquivo(arquivo_id):
    """Busca arquivo específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM cliente_arquivos WHERE id = %s", (arquivo_id,))
        arquivo = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not arquivo:
            return jsonify({"success": False, "error": "Arquivo não encontrado"}), 404
        
        arquivo_dict = dict(arquivo)
        for key, value in arquivo_dict.items():
            arquivo_dict[key] = serialize_datetime(value)
        
        return jsonify({"success": True, "data": arquivo_dict})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/arquivos', methods=['POST'])
def create_arquivo():
    """Cria novo arquivo"""
    try:
        data = request.get_json()
        
        required_fields = ['id_cliente']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = ['id_cliente', 'nome', 'caminho', 'tipo', 'tamanho', 
                         'descricao', 'data_upload']
        
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
            INSERT INTO cliente_arquivos ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Arquivo criado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/arquivos/<int:arquivo_id>', methods=['PUT'])
def update_arquivo(arquivo_id):
    """Atualiza arquivo"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_arquivos WHERE id = %s", (arquivo_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Arquivo não encontrado"}), 404
        
        allowed_fields = ['nome', 'caminho', 'tipo', 'tamanho', 'descricao']
        
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
        
        update_values.append(arquivo_id)
        
        query = f"UPDATE cliente_arquivos SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Arquivo atualizado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/arquivos/<int:arquivo_id>', methods=['DELETE'])
def delete_arquivo(arquivo_id):
    """Deleta arquivo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_arquivos WHERE id = %s", (arquivo_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Arquivo não encontrado"}), 404
        
        cursor.execute("DELETE FROM cliente_arquivos WHERE id = %s", (arquivo_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Arquivo deletado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# CLIENTE CONTRATO
# ============================================

@app.route('/api/contratos', methods=['GET'])
def get_contratos():
    """Lista contratos"""
    try:
        id_cliente = request.args.get('id_cliente', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_cliente = %s" if id_cliente else ""
        params = [id_cliente, per_page, offset] if id_cliente else [per_page, offset]
        
        count_query = f"SELECT COUNT(*) as total FROM cliente_contrato {where_sql}"
        cursor.execute(count_query, params[:-2] if id_cliente else [])
        total = cursor.fetchone()['total']
        
        query = f"""
            SELECT * FROM cliente_contrato
            {where_sql}
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params)
        contratos = cursor.fetchall()
        
        contratos_list = []
        for contrato in contratos:
            contrato_dict = dict(contrato)
            for key, value in contrato_dict.items():
                contrato_dict[key] = serialize_datetime(value)
            contratos_list.append(contrato_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": contratos_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos/<int:contrato_id>', methods=['GET'])
def get_contrato(contrato_id):
    """Busca contrato específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM cliente_contrato WHERE id = %s", (contrato_id,))
        contrato = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not contrato:
            return jsonify({"success": False, "error": "Contrato não encontrado"}), 404
        
        contrato_dict = dict(contrato)
        for key, value in contrato_dict.items():
            contrato_dict[key] = serialize_datetime(value)
        
        return jsonify({"success": True, "data": contrato_dict})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos', methods=['POST'])
def create_contrato():
    """Cria novo contrato"""
    try:
        data = request.get_json()
        
        required_fields = ['id_cliente']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_cliente', 'data_cadastro', 'data_ativacao', 'valor', 'desconto',
            'desconto_fidelidade', 'valor_acrescimo', 'valor_total', 'dia_vencimento',
            'id_plano', 'status', 'data_cancelamento', 'motivo_cancelamento',
            'observacao', 'numero_contrato', 'tipo_contrato', 'id_vendedor'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_cadastro' not in data:
            insert_fields.append('data_cadastro')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO cliente_contrato ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Contrato criado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos/<int:contrato_id>', methods=['PUT'])
def update_contrato(contrato_id):
    """Atualiza contrato"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_contrato WHERE id = %s", (contrato_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Contrato não encontrado"}), 404
        
        allowed_fields = [
            'data_ativacao', 'valor', 'desconto', 'desconto_fidelidade',
            'valor_acrescimo', 'valor_total', 'dia_vencimento', 'id_plano',
            'status', 'data_cancelamento', 'motivo_cancelamento', 'observacao',
            'tipo_contrato', 'id_vendedor'
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
        
        update_values.append(contrato_id)
        
        query = f"UPDATE cliente_contrato SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Contrato atualizado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos/<int:contrato_id>', methods=['DELETE'])
def delete_contrato(contrato_id):
    """Deleta contrato"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_contrato WHERE id = %s", (contrato_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Contrato não encontrado"}), 404
        
        cursor.execute("DELETE FROM cliente_contrato WHERE id = %s", (contrato_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Contrato deletado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ALTERAÇÃO DE PLANO
# ============================================

@app.route('/api/alteracoes-plano', methods=['GET'])
def get_alteracoes_plano():
    """Lista alterações de plano"""
    try:
        id_contrato = request.args.get('id_contrato', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_contrato = %s" if id_contrato else ""
        params = [id_contrato] if id_contrato else []
        
        query = f"""
            SELECT * FROM cliente_contrato_alt_plano
            {where_sql}
            ORDER BY id DESC
        """
        cursor.execute(query, params)
        alteracoes = cursor.fetchall()
        
        alteracoes_list = []
        for alteracao in alteracoes:
            alteracao_dict = dict(alteracao)
            for key, value in alteracao_dict.items():
                alteracao_dict[key] = serialize_datetime(value)
            alteracoes_list.append(alteracao_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": alteracoes_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/alteracoes-plano', methods=['POST'])
def create_alteracao_plano():
    """Registra alteração de plano"""
    try:
        data = request.get_json()
        
        required_fields = ['id_contrato', 'id_plano_anterior', 'id_plano_novo']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_contrato', 'id_plano_anterior', 'id_plano_novo', 'data_alteracao',
            'valor_anterior', 'valor_novo', 'motivo', 'observacao', 'id_usuario'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_alteracao' not in data:
            insert_fields.append('data_alteracao')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO cliente_contrato_alt_plano ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Alteração registrada", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# HISTÓRICO DE CONTRATO
# ============================================

@app.route('/api/historico-contrato', methods=['GET'])
def get_historico_contrato():
    """Lista histórico de contratos"""
    try:
        id_contrato = request.args.get('id_contrato', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_contrato = %s" if id_contrato else ""
        params = [id_contrato] if id_contrato else []
        
        query = f"""
            SELECT * FROM cliente_contrato_historico
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


@app.route('/api/historico-contrato', methods=['POST'])
def create_historico_contrato():
    """Adiciona evento ao histórico"""
    try:
        data = request.get_json()
        
        required_fields = ['id_contrato', 'tipo_evento']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_contrato', 'tipo_evento', 'descricao', 'data_evento',
            'id_usuario', 'valor_anterior', 'valor_novo', 'campo_alterado'
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
            INSERT INTO cliente_contrato_historico ({', '.join(insert_fields)})
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
# SERVIÇOS DO CONTRATO
# ============================================

@app.route('/api/contratos-servicos', methods=['GET'])
def get_contratos_servicos():
    """Lista serviços dos contratos"""
    try:
        id_contrato = request.args.get('id_contrato', type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        where_sql = "WHERE id_contrato = %s" if id_contrato else ""
        params = [id_contrato] if id_contrato else []
        
        query = f"""
            SELECT * FROM cliente_contrato_servicos
            {where_sql}
            ORDER BY id DESC
        """
        cursor.execute(query, params)
        servicos = cursor.fetchall()
        
        servicos_list = []
        for servico in servicos:
            servico_dict = dict(servico)
            for key, value in servico_dict.items():
                servico_dict[key] = serialize_datetime(value)
            servicos_list.append(servico_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "data": servicos_list})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos-servicos', methods=['POST'])
def create_contrato_servico():
    """Adiciona serviço ao contrato"""
    try:
        data = request.get_json()
        
        required_fields = ['id_contrato', 'id_servico']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Campo obrigatório: {field}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        allowed_fields = [
            'id_contrato', 'id_servico', 'quantidade', 'valor_unitario',
            'valor_total', 'data_adicao', 'data_remocao', 'ativo', 'observacao'
        ]
        
        insert_fields = []
        insert_values = []
        placeholders = []
        
        for field in allowed_fields:
            if field in data and data[field] is not None:
                insert_fields.append(field)
                insert_values.append(data[field])
                placeholders.append('%s')
        
        if 'data_adicao' not in data:
            insert_fields.append('data_adicao')
            insert_values.append(datetime.now())
            placeholders.append('%s')
        
        query = f"""
            INSERT INTO cliente_contrato_servicos ({', '.join(insert_fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING id
        """
        
        cursor.execute(query, insert_values)
        new_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Serviço adicionado", "data": {"id": new_id}}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos-servicos/<int:servico_id>', methods=['PUT'])
def update_contrato_servico(servico_id):
    """Atualiza serviço do contrato"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_contrato_servicos WHERE id = %s", (servico_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Serviço não encontrado"}), 404
        
        allowed_fields = [
            'quantidade', 'valor_unitario', 'valor_total', 'data_remocao',
            'ativo', 'observacao'
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
        
        update_values.append(servico_id)
        
        query = f"UPDATE cliente_contrato_servicos SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Serviço atualizado"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contratos-servicos/<int:servico_id>', methods=['DELETE'])
def delete_contrato_servico(servico_id):
    """Remove serviço do contrato"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM cliente_contrato_servicos WHERE id = %s", (servico_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Serviço não encontrado"}), 404
        
        cursor.execute("DELETE FROM cliente_contrato_servicos WHERE id = %s", (servico_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Serviço removido"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/attributes/health', methods=['GET'])
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
    print("🚀 Lead Attributes API - Contratos e Arquivos")
    print("=" * 60)
    print("\n📡 Endpoints disponíveis:")
    print("\n  Cliente Arquivos:")
    print("    GET    /api/arquivos")
    print("    GET    /api/arquivos/<id>")
    print("    POST   /api/arquivos")
    print("    PUT    /api/arquivos/<id>")
    print("    DELETE /api/arquivos/<id>")
    print("\n  Cliente Contrato:")
    print("    GET    /api/contratos")
    print("    GET    /api/contratos/<id>")
    print("    POST   /api/contratos")
    print("    PUT    /api/contratos/<id>")
    print("    DELETE /api/contratos/<id>")
    print("\n  Alterações de Plano:")
    print("    GET    /api/alteracoes-plano")
    print("    POST   /api/alteracoes-plano")
    print("\n  Histórico de Contrato:")
    print("    GET    /api/historico-contrato")
    print("    POST   /api/historico-contrato")
    print("\n  Serviços do Contrato:")
    print("    GET    /api/contratos-servicos")
    print("    POST   /api/contratos-servicos")
    print("    PUT    /api/contratos-servicos/<id>")
    print("    DELETE /api/contratos-servicos/<id>")
    print("\n" + "=" * 60)
    print("🌐 Servidor rodando em: http://localhost:5002")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)
