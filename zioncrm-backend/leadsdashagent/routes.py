"""
Routes para o Sistema de Dashboard
API REST para gráficos personalizáveis com Chart.js
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import models
from datetime import datetime

# ============================================
# CONFIGURAÇÃO DO FLASK
# ============================================

app = Flask(__name__)
CORS(app)

# Inicializar tabelas na primeira execução
try:
    models.create_dashboard_tables()
    print("✅ Tabelas do dashboard verificadas/criadas")
except Exception as e:
    print(f"⚠️ Aviso ao criar tabelas: {e}")


# ============================================
# ROTAS: ASSUNTOS DISPONÍVEIS
# ============================================

@app.route('/api/dashboard/assuntos', methods=['GET'])
def listar_assuntos():
    """
    Lista todos os assuntos disponíveis para criação de gráficos
    
    GET /api/dashboard/assuntos
    GET /api/dashboard/assuntos?categoria=Classificação
    
    Query params:
    - categoria: Filtrar por categoria específica (opcional)
    
    Resposta:
    {
        "success": true,
        "data": {
            "perdas_clientes_fidelizados": {
                "label": "Perdas de Clientes Fidelizados",
                "descricao": "...",
                "categoria": "Classificação"
            },
            ...
        },
        "total": 150
    }
    """
    try:
        # Obter filtro de categoria da query string
        categoria = request.args.get('categoria', None)
        
        # Buscar assuntos (com ou sem filtro)
        assuntos = models.get_assuntos_disponiveis(categoria=categoria)
        
        return jsonify({
            "success": True,
            "data": assuntos,
            "total": len(assuntos),
            "categoria_filtrada": categoria
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/categorias', methods=['GET'])
def listar_categorias():
    """
    Lista todas as categorias disponíveis
    
    GET /api/dashboard/categorias
    
    Resposta:
    {
        "success": true,
        "data": ["Classificação", "Status", "Localização", ...],
        "total": 14
    }
    """
    try:
        categorias = models.get_categorias_disponiveis()
        return jsonify({
            "success": True,
            "data": categorias,
            "total": len(categorias)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/assuntos/<assunto_key>', methods=['GET'])
def obter_dados_assunto(assunto_key):
    """
    Obtém dados de um assunto específico
    
    GET /api/dashboard/assuntos/perdas_clientes_fidelizados
    
    Resposta:
    {
        "success": true,
        "data": {
            "label": "Perdas de Clientes Fidelizados",
            "descricao": "...",
            "labels": ["2026-01", "2026-02", ...],
            "data": [10, 15, ...]
        }
    }
    """
    try:
        dados = models.get_dados_assunto(assunto_key)
        
        if "error" in dados:
            return jsonify({
                "success": False,
                "error": dados["error"]
            }), 404
        
        return jsonify({
            "success": True,
            "data": dados
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ROTAS: ESTATÍSTICAS GERAIS
# ============================================

@app.route('/api/dashboard/estatisticas', methods=['GET'])
def obter_estatisticas_gerais():
    """
    Retorna estatísticas gerais para os 12 cards do dashboard
    
    GET /api/dashboard/estatisticas
    
    Resposta:
    {
        "success": true,
        "data": {
            "total_leads": 500,
            "por_departamento": {"vendas": 300, "pos_venda": 200},
            "leads_prioritarias": 50,
            "score_medio": 65.5,
            "perdas_clientes_fidelizados": {...},
            ...
        }
    }
    """
    try:
        stats = models.get_estatisticas_gerais()
        return jsonify({
            "success": True,
            "data": stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ROTAS: GRÁFICOS PERSONALIZADOS
# ============================================

@app.route('/api/dashboard/graficos', methods=['GET'])
def listar_graficos():
    """
    Lista todos os gráficos salvos
    
    GET /api/dashboard/graficos
    GET /api/dashboard/graficos?ativo=true
    
    Resposta:
    {
        "success": true,
        "data": [
            {
                "id": 1,
                "titulo": "Meu Gráfico",
                "tipo_grafico": "bar",
                "assuntos": ["perdas_clientes_fidelizados", "leads_recuperadas"],
                ...
            }
        ]
    }
    """
    try:
        ativo = request.args.get('ativo', 'true').lower() == 'true'
        graficos = models.Grafico.find_all(ativo=ativo)
        
        return jsonify({
            "success": True,
            "data": [g.to_dict() for g in graficos],
            "total": len(graficos)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos/<int:grafico_id>', methods=['GET'])
def obter_grafico(grafico_id):
    """
    Obtém detalhes de um gráfico específico
    
    GET /api/dashboard/graficos/1
    
    Resposta:
    {
        "success": true,
        "data": {
            "id": 1,
            "titulo": "Meu Gráfico",
            "tipo_grafico": "bar",
            "assuntos": [...],
            ...
        }
    }
    """
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({
                "success": False,
                "error": "Gráfico não encontrado"
            }), 404
        
        return jsonify({
            "success": True,
            "data": grafico.to_dict()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos/<int:grafico_id>/dados', methods=['GET'])
def obter_dados_grafico(grafico_id):
    """
    Obtém dados do gráfico no formato Chart.js
    
    GET /api/dashboard/graficos/1/dados
    
    Resposta:
    {
        "success": true,
        "data": {
            "labels": ["2026-01", "2026-02", ...],
            "datasets": [
                {
                    "label": "Perdas de Clientes",
                    "data": [10, 15, 8, ...],
                    "labels": ["2026-01", "2026-02", ...]
                },
                {
                    "label": "Leads Recuperadas",
                    "data": [5, 12, 10, ...],
                    "labels": ["2026-01", "2026-02", ...]
                }
            ],
            "tipo_grafico": "bar",
            "titulo": "Meu Gráfico",
            "descricao": "..."
        }
    }
    """
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({
                "success": False,
                "error": "Gráfico não encontrado"
            }), 404
        
        dados = grafico.get_dados()
        
        return jsonify({
            "success": True,
            "data": dados
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos', methods=['POST'])
def criar_grafico():
    """
    Cria um novo gráfico personalizado
    
    POST /api/dashboard/graficos
    Body:
    {
        "titulo": "Análise de Perdas",
        "descricao": "Comparação de perdas e recuperações",
        "tipo_grafico": "line",  # bar, line, pie, doughnut, radar, polarArea
        "assuntos": [
            "perdas_clientes_fidelizados",
            "leads_recuperadas",
            "perdas_leads_ruins"
        ],
        "configuracoes": {
            "colors": ["#FF6384", "#36A2EB", "#FFCE56"],
            "borderWidth": 2
        }
    }
    
    Resposta:
    {
        "success": true,
        "data": {
            "id": 5,
            "titulo": "Análise de Perdas",
            ...
        },
        "message": "Gráfico criado com sucesso"
    }
    """
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('titulo'):
            return jsonify({
                "success": False,
                "error": "Campo 'titulo' é obrigatório"
            }), 400
        
        if not data.get('assuntos') or len(data['assuntos']) == 0:
            return jsonify({
                "success": False,
                "error": "Selecione pelo menos um assunto"
            }), 400
        
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
                return jsonify({
                    "success": False,
                    "error": f"Assunto '{assunto}' não existe"
                }), 400
        
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos/<int:grafico_id>', methods=['PUT'])
def atualizar_grafico(grafico_id):
    """
    Atualiza um gráfico existente
    
    PUT /api/dashboard/graficos/1
    Body:
    {
        "titulo": "Novo Título",
        "assuntos": ["perdas_clientes_fidelizados"],
        ...
    }
    
    Resposta:
    {
        "success": true,
        "data": {...},
        "message": "Gráfico atualizado com sucesso"
    }
    """
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({
                "success": False,
                "error": "Gráfico não encontrado"
            }), 404
        
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
                return jsonify({
                    "success": False,
                    "error": "Selecione pelo menos um assunto"
                }), 400
            
            # Validar assuntos
            assuntos_validos = models.ASSUNTOS_DISPONIVEIS.keys()
            for assunto in data['assuntos']:
                if assunto not in assuntos_validos:
                    return jsonify({
                        "success": False,
                        "error": f"Assunto '{assunto}' não existe"
                    }), 400
            
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos/<int:grafico_id>', methods=['DELETE'])
def deletar_grafico(grafico_id):
    """
    Remove um gráfico (soft delete)
    
    DELETE /api/dashboard/graficos/1
    
    Resposta:
    {
        "success": true,
        "message": "Gráfico removido com sucesso"
    }
    """
    try:
        grafico = models.Grafico.find_by_id(grafico_id)
        
        if not grafico:
            return jsonify({
                "success": False,
                "error": "Gráfico não encontrado"
            }), 404
        
        grafico.delete()
        
        return jsonify({
            "success": True,
            "message": "Gráfico removido com sucesso"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ROTAS: GRÁFICOS PREDEFINIDOS (12 CARDS)
# ============================================

@app.route('/api/dashboard/graficos-predefinidos', methods=['GET'])
def listar_graficos_predefinidos():
    """
    Lista os 12 gráficos predefinidos do dashboard
    
    GET /api/dashboard/graficos-predefinidos
    
    Resposta:
    {
        "success": true,
        "data": [
            {
                "key": "perdas_clientes_fidelizados",
                "label": "Perdas de Clientes Fidelizados",
                "descricao": "...",
                "icon": "📉",
                "color": "#FF6384"
            },
            ...
        ]
    }
    """
    try:
        predefinidos = [
            {
                "key": "perdas_clientes_fidelizados",
                "label": "Perdas de Clientes Fidelizados",
                "descricao": "Clientes ativos satisfeitos que cancelaram",
                "icon": "📉",
                "color": "#FF6384"
            },
            {
                "key": "perdas_leads_ruins",
                "label": "Perda de Leads Ruins",
                "descricao": "Leads com baixa prioridade perdidas",
                "icon": "⚫",
                "color": "#9CA3AF"
            },
            {
                "key": "leads_recuperadas",
                "label": "Leads Recuperadas",
                "descricao": "Leads inativas que foram recuperadas",
                "icon": "🔄",
                "color": "#10B981"
            },
            {
                "key": "leads_queimando_perdidas",
                "label": "Leads Queimando Perdidas",
                "descricao": "Alta prioridade mas perdidas",
                "icon": "🔥",
                "color": "#EF4444"
            },
            {
                "key": "tempo_ordem_servico_funcionario",
                "label": "Tempo por OS (Funcionário)",
                "descricao": "Performance de atendimento",
                "icon": "⏱️",
                "color": "#F59E0B"
            },
            {
                "key": "distribuicao_prioridade",
                "label": "Distribuição por Prioridade",
                "descricao": "Leads por temperatura",
                "icon": "🌡️",
                "color": "#8B5CF6"
            },
            {
                "key": "distribuicao_departamento",
                "label": "Distribuição por Departamento",
                "descricao": "Vendas vs Pós-Venda",
                "icon": "🏢",
                "color": "#3B82F6"
            },
            {
                "key": "taxa_conversao_vendas",
                "label": "Taxa de Conversão",
                "descricao": "Funil de vendas",
                "icon": "📊",
                "color": "#06B6D4"
            },
            {
                "key": "satisfacao_cliente",
                "label": "Satisfação do Cliente",
                "descricao": "Níveis de contentamento",
                "icon": "⭐",
                "color": "#FBBF24"
            },
            {
                "key": "origem_leads",
                "label": "Origem das Leads",
                "descricao": "Leads por canal",
                "icon": "📱",
                "color": "#EC4899"
            },
            {
                "key": "status_financeiro",
                "label": "Status Financeiro",
                "descricao": "Em dia vs Atrasado",
                "icon": "💰",
                "color": "#14B8A6"
            },
            {
                "key": "score_medio_periodo",
                "label": "Score Médio por Período",
                "descricao": "Evolução do score",
                "icon": "📈",
                "color": "#6366F1"
            }
        ]
        
        return jsonify({
            "success": True,
            "data": predefinidos,
            "total": len(predefinidos)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/dashboard/graficos-predefinidos/<key>/dados', methods=['GET'])
def obter_dados_grafico_predefinido(key):
    """
    Obtém dados de um gráfico predefinido
    
    GET /api/dashboard/graficos-predefinidos/perdas_clientes_fidelizados/dados
    
    Resposta: Mesma estrutura de /api/dashboard/assuntos/<key>
    """
    return obter_dados_assunto(key)


# ============================================
# ROTA: HEALTH CHECK
# ============================================

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Verifica status da API
    
    GET /health
    
    Resposta:
    {
        "status": "ok",
        "service": "Dashboard API",
        "timestamp": "2026-02-16T10:30:00"
    }
    """
    return jsonify({
        "status": "ok",
        "service": "Dashboard API",
        "timestamp": datetime.now().isoformat()
    })


# ============================================
# INICIALIZAÇÃO
# ============================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Dashboard API - Sistema de Gráficos Personalizáveis")
    print("=" * 60)
    print("\n📊 Endpoints disponíveis:")
    print("\nASSUNTOS:")
    print("  GET    /api/dashboard/assuntos")
    print("  GET    /api/dashboard/assuntos/<key>")
    print("\nESTATÍSTICAS:")
    print("  GET    /api/dashboard/estatisticas")
    print("\nGRÁFICOS PERSONALIZADOS:")
    print("  GET    /api/dashboard/graficos")
    print("  POST   /api/dashboard/graficos")
    print("  GET    /api/dashboard/graficos/<id>")
    print("  PUT    /api/dashboard/graficos/<id>")
    print("  DELETE /api/dashboard/graficos/<id>")
    print("  GET    /api/dashboard/graficos/<id>/dados")
    print("\nGRÁFICOS PREDEFINIDOS:")
    print("  GET    /api/dashboard/graficos-predefinidos")
    print("  GET    /api/dashboard/graficos-predefinidos/<key>/dados")
    print("\n" + "=" * 60)
    print("🌐 Iniciando servidor na porta 5004...")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5004, debug=True)
