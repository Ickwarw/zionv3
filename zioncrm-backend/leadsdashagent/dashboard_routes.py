"""
Dashboard Routes - Rotas de Dashboard para Blueprint
Conversão do routes.py (dashboard) para blueprint Flask
"""

from flask import jsonify, request
from . import dashboard_bp
from datetime import datetime
import sys
import os

# Adiciona o diretório leadsdashagent ao path para importar models
sys.path.insert(0, os.path.dirname(__file__))
import models


# ============================================
# ROTAS: ASSUNTOS DISPONÍVEIS
# ============================================

@dashboard_bp.route('/assuntos', methods=['GET'])
def listar_assuntos():
    """Lista todos os assuntos disponíveis para criação de gráficos"""
    try:
        categoria = request.args.get('categoria')
        
        if categoria:
            assuntos_filtrados = {
                k: v for k, v in models.ASSUNTOS_DISPONIVEIS.items()
                if v.get('categoria') == categoria
            }
            return jsonify({
                "success": True,
                "data": assuntos_filtrados
            })
        
        return jsonify({
            "success": True,
            "data": models.ASSUNTOS_DISPONIVEIS
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/assuntos/<assunto_key>', methods=['GET'])
def obter_dados_assunto(assunto_key):
    """Obtém dados de um assunto específico"""
    try:
        dados = models.get_dados_assunto(assunto_key)
        
        if "error" in dados:
            return jsonify({"success": False, "error": dados["error"]}), 404
        
        return jsonify({"success": True, "data": dados})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ROTAS: ESTATÍSTICAS GERAIS
# ============================================

@dashboard_bp.route('/estatisticas', methods=['GET'])
def obter_estatisticas_gerais():
    """Retorna estatísticas gerais para os 12 cards do dashboard"""
    try:
        stats = models.get_estatisticas_gerais()
        return jsonify({"success": True, "data": stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ROTAS: GRÁFICOS PERSONALIZADOS
# ============================================

@dashboard_bp.route('/graficos', methods=['GET'])
def listar_graficos():
    """Lista todos os gráficos salvos"""
    try:
        ativo = request.args.get('ativo', 'true').lower() == 'true'
        graficos = models.Grafico.find_all(ativo=ativo)
        
        return jsonify({
            "success": True,
            "data": [g.to_dict() for g in graficos],
            "total": len(graficos)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos/<int:grafico_id>', methods=['GET'])
def obter_grafico(grafico_id):
    """Obtém detalhes de um gráfico específico"""
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({"success": False, "error": "Gráfico não encontrado"}), 404
        
        return jsonify({"success": True, "data": grafico.to_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos/<int:grafico_id>/dados', methods=['GET'])
def obter_dados_grafico(grafico_id):
    """Obtém dados do gráfico no formato Chart.js"""
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({"success": False, "error": "Gráfico não encontrado"}), 404
        
        dados = grafico.get_dados()
        return jsonify({"success": True, "data": dados})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos', methods=['POST'])
def criar_grafico():
    """Cria um novo gráfico personalizado"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('titulo'):
            return jsonify({"success": False, "error": "Campo 'titulo' é obrigatório"}), 400
        
        if not data.get('assuntos') or len(data['assuntos']) == 0:
            return jsonify({"success": False, "error": "Selecione pelo menos um assunto"}), 400
        
        # Validar tipo de gráfico
        tipos_validos = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea']
        tipo_grafico = data.get('tipo_grafico', 'bar')
        if tipo_grafico not in tipos_validos:
            return jsonify({
                "success": False,
                "error": f"Tipo de gráfico inválido. Use: {', '.join(tipos_validos)}"
            }), 400
        
        # Validar assuntos
        assuntos_validos = models.ASSUNTOS_DISPONIVEIS.keys()
        for assunto in data['assuntos']:
            if assunto not in assuntos_validos:
                return jsonify({"success": False, "error": f"Assunto '{assunto}' não existe"}), 400
        
        # Criar gráfico
        grafico = models.Grafico(
            titulo=data['titulo'],
            descricao=data.get('descricao', ''),
            tipo_grafico=tipo_grafico,
            assuntos=data['assuntos'],
            configuracoes=data.get('configuracoes', {})
        )
        
        grafico_id = grafico.save()
        
        return jsonify({
            "success": True,
            "data": grafico.to_dict(),
            "message": "Gráfico criado com sucesso"
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos/<int:grafico_id>', methods=['PUT'])
def atualizar_grafico(grafico_id):
    """Atualiza um gráfico existente"""
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({"success": False, "error": "Gráfico não encontrado"}), 404
        
        data = request.get_json()
        
        # Atualizar campos
        if 'titulo' in data:
            grafico.titulo = data['titulo']
        if 'descricao' in data:
            grafico.descricao = data['descricao']
        if 'tipo_grafico' in data:
            tipos_validos = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea']
            if data['tipo_grafico'] not in tipos_validos:
                return jsonify({
                    "success": False,
                    "error": f"Tipo de gráfico inválido. Use: {', '.join(tipos_validos)}"
                }), 400
            grafico.tipo_grafico = data['tipo_grafico']
        
        if 'assuntos' in data:
            if len(data['assuntos']) == 0:
                return jsonify({"success": False, "error": "Selecione pelo menos um assunto"}), 400
            
            # Validar assuntos
            assuntos_validos = models.ASSUNTOS_DISPONIVEIS.keys()
            for assunto in data['assuntos']:
                if assunto not in assuntos_validos:
                    return jsonify({"success": False, "error": f"Assunto '{assunto}' não existe"}), 400
            
            grafico.assuntos = data['assuntos']
        
        if 'configuracoes' in data:
            grafico.configuracoes = data['configuracoes']
        
        if 'ativo' in data:
            grafico.ativo = data['ativo']
        
        grafico.save()
        
        return jsonify({
            "success": True,
            "data": grafico.to_dict(),
            "message": "Gráfico atualizado com sucesso"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos/<int:grafico_id>', methods=['DELETE'])
def deletar_grafico(grafico_id):
    """Remove um gráfico (soft delete)"""
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({"success": False, "error": "Gráfico não encontrado"}), 404
        
        grafico.delete()
        
        return jsonify({"success": True, "message": "Gráfico removido com sucesso"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================
# ROTAS: GRÁFICOS PREDEFINIDOS (12 CARDS)
# ============================================

@dashboard_bp.route('/graficos-predefinidos', methods=['GET'])
def listar_graficos_predefinidos():
    """Lista os 12 gráficos predefinidos do dashboard"""
    try:
        predefinidos = [
            {"key": "perdas_clientes_fidelizados", "label": "Perdas de Clientes Fidelizados", "descricao": "Clientes ativos satisfeitos que cancelaram", "icon": "📉", "color": "#FF6384"},
            {"key": "perdas_leads_ruins", "label": "Perda de Leads Ruins", "descricao": "Leads com baixa prioridade perdidas", "icon": "⚫", "color": "#9CA3AF"},
            {"key": "leads_recuperadas", "label": "Leads Recuperadas", "descricao": "Leads inativas que foram recuperadas", "icon": "🔄", "color": "#10B981"},
            {"key": "leads_queimando_perdidas", "label": "Leads Queimando Perdidas", "descricao": "Alta prioridade mas perdidas", "icon": "🔥", "color": "#EF4444"},
            {"key": "tempo_ordem_servico_funcionario", "label": "Tempo por OS (Funcionário)", "descricao": "Performance de atendimento", "icon": "⏱️", "color": "#F59E0B"},
            {"key": "distribuicao_prioridade", "label": "Distribuição por Prioridade", "descricao": "Leads por temperatura", "icon": "🌡️", "color": "#8B5CF6"},
            {"key": "distribuicao_departamento", "label": "Distribuição por Departamento", "descricao": "Vendas vs Pós-Venda", "icon": "🏢", "color": "#3B82F6"},
            {"key": "taxa_conversao_vendas", "label": "Taxa de Conversão", "descricao": "Funil de vendas", "icon": "📊", "color": "#06B6D4"},
            {"key": "satisfacao_cliente", "label": "Satisfação do Cliente", "descricao": "Níveis de contentamento", "icon": "⭐", "color": "#FBBF24"},
            {"key": "origem_leads", "label": "Origem das Leads", "descricao": "Leads por canal", "icon": "📱", "color": "#EC4899"},
            {"key": "status_financeiro", "label": "Status Financeiro", "descricao": "Em dia vs Atrasado", "icon": "💰", "color": "#14B8A6"},
            {"key": "score_medio_periodo", "label": "Score Médio por Período", "descricao": "Evolução do score", "icon": "📈", "color": "#6366F1"}
        ]
        
        return jsonify({"success": True, "data": predefinidos, "total": len(predefinidos)})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/graficos-predefinidos/<key>/dados', methods=['GET'])
def obter_dados_grafico_predefinido(key):
    """Obtém dados de um gráfico predefinido"""
    return obter_dados_assunto(key)


# ============================================
# HEALTH CHECK
# ============================================

@dashboard_bp.route('/health', methods=['GET'])
def health_check():
    """Verifica status da API de Dashboard"""
    return jsonify({
        "status": "ok",
        "service": "LeadsDashAgent - Dashboard API",
        "timestamp": datetime.now().isoformat()
    })
