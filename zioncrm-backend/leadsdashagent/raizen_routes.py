from flask import jsonify, request
from . import raizen_bp
from . import models
from models.logs import SystemLog
from models.assistants import RaizenTrainingData


def _normalize_chart_type(text: str) -> str:
    lower = (text or '').lower()
    if any(token in lower for token in ['linha', 'line']):
        return 'line'
    if any(token in lower for token in ['pizza', 'pie']):
        return 'pie'
    if any(token in lower for token in ['rosca', 'donut', 'doughnut']):
        return 'doughnut'
    if any(token in lower for token in ['radar']):
        return 'radar'
    if any(token in lower for token in ['polar']):
        return 'polarArea'
    return 'bar'


def _find_assunto_by_query(query: str) -> str:
    lower = (query or '').lower()
    topics = models.ASSUNTOS_DISPONIVEIS

    keyword_map = [
        ('prospeccao', ['prospec', 'prospecção']),
        ('status_prospeccao', ['status prospec', 'prospecção status']),
        ('substatus_prospeccao', ['substatus', 'sub status']),
        ('origem_leads', ['origem', 'canal']),
        ('taxa_conversao_vendas', ['convers', 'funil']),
        ('distribuicao_prioridade', ['prioridade', 'temperatura']),
        ('leads_recuperadas', ['recuperad']),
        ('leads_queimando_perdidas', ['queimando']),
        ('score_medio_periodo', ['score']),
        ('distribuicao_por_cidade', ['cidade']),
        ('distribuicao_por_uf', ['estado', 'uf']),
        ('cadastros_por_mes', ['cadastro', 'mês', 'mes']),
    ]

    for key, terms in keyword_map:
        if key in topics and any(term in lower for term in terms):
            return key

    for key, cfg in topics.items():
        label = str(cfg.get('label', '')).lower()
        desc = str(cfg.get('descricao', '')).lower()
        if any(token in label or token in desc for token in lower.split() if len(token) > 4):
            return key

    return 'status_prospeccao' if 'status_prospeccao' in topics else list(topics.keys())[0]


def _build_chart_payload(user_query: str):
    assunto_key = _find_assunto_by_query(user_query)
    dados = models.get_dados_assunto(assunto_key)
    if 'error' in dados:
        return None

    chart_type = _normalize_chart_type(user_query)
    config = models.ASSUNTOS_DISPONIVEIS.get(assunto_key, {})

    return {
        'title': dados.get('label', config.get('label', 'Gráfico de Prospecção')),
        'description': dados.get('descricao', config.get('descricao', '')),
        'type': chart_type,
        'labels': dados.get('labels', []),
        'datasets': [
            {
                'label': dados.get('label', 'Série principal'),
                'data': dados.get('data', [])
            }
        ],
        'assunto_key': assunto_key
    }


@raizen_bp.route('/chat', methods=['POST'])
def raizen_chat():
    try:
        payload = request.get_json() or {}
        message = (payload.get('message') or '').strip()
        if not message:
            return jsonify({'success': False, 'error': "Campo 'message' é obrigatório"}), 400

        lower_message = message.lower()
        response_text = "Recebi seu pedido. Posso gerar gráfico, detalhar prospecções, trazer logs e status de treinamentos."
        chart = None
        meta = {}

        wants_chart = any(token in lower_message for token in [
            'gráfico', 'grafico', 'chart', 'plot', 'visualiza', 'mostra em barras', 'mostra em linha', 'pizza'
        ])
        asks_training = 'treinamento' in lower_message or 'treinamentos' in lower_message
        asks_logs = 'log' in lower_message or 'logs' in lower_message
        asks_marketing = 'marketing' in lower_message

        if wants_chart or 'prospec' in lower_message:
            chart = _build_chart_payload(message)
            if chart:
                response_text = (
                    f"Gerei um gráfico de {chart['title']} com base na sua solicitação. "
                    "Se quiser, posso trocar o tipo (barra, linha, pizza, radar ou polar)."
                )

        if asks_training:
            pending_trainings = RaizenTrainingData.query.filter_by(is_approved=False).count()
            approved_trainings = RaizenTrainingData.query.filter_by(is_approved=True).count()
            meta['training'] = {
                'pending': pending_trainings,
                'approved': approved_trainings
            }
            response_text += (
                f" Treinamentos: {approved_trainings} aprovados e {pending_trainings} pendentes."
            )

        if asks_logs:
            recent_logs = SystemLog.query.order_by(SystemLog.created_at.desc()).limit(10).all()
            meta['logs'] = [
                {
                    'id': log.id,
                    'type': log.log_type,
                    'message': log.message,
                    'created_at': log.created_at.isoformat()
                }
                for log in recent_logs
            ]
            response_text += " Consultei também os 10 logs mais recentes do sistema."

        if asks_marketing:
            lead_name = payload.get('customer_name') or payload.get('cliente') or payload.get('customer')
            if lead_name:
                response_text += (
                    f" Estratégia de marketing para {lead_name}: priorize campanhas segmentadas por origem de lead, "
                    "reengajamento de inativos e abordagem consultiva para leads quentes."
                )
            else:
                response_text += (
                    " Informe o nome do cliente para eu devolver recomendações de marketing específicas por perfil."
                )

        return jsonify({
            'success': True,
            'response': response_text,
            'chart': chart,
            'meta': meta,
            'voice_enabled': True
        })

    except Exception as error:
        return jsonify({'success': False, 'error': str(error)}), 500


@raizen_bp.route('/health', methods=['GET'])
def raizen_health():
    return jsonify({'success': True, 'service': 'LeadsDashAgent Raizen', 'voice_enabled': True})
