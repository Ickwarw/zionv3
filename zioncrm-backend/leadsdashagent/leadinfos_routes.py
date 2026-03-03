"""
Lead Infos Routes - Rotas para informações adicionais de leads (placeholder)
Este arquivo será expandido conforme necessário
"""

from flask import jsonify
from . import leadinfos_bp
from datetime import datetime


@leadinfos_bp.route('/health', methods=['GET'])
def health_check():
    """Verifica status da API de Infos"""
    return jsonify({
        "status": "ok",
        "service": "LeadsDashAgent - Infos API",
        "timestamp": datetime.now().isoformat()
    })
