"""
Lead Attributes Routes - Rotas para gestão de atributos das leads (placeholder)
Este arquivo será expandido conforme necessário
"""

from flask import jsonify
from . import leadattributes_bp
from datetime import datetime


@leadattributes_bp.route('/health', methods=['GET'])
def health_check():
    """Verifica status da API de Atributos"""
    return jsonify({
        "status": "ok",
        "service": "LeadsDashAgent - Attributes API",
        "timestamp": datetime.now().isoformat()
    })
