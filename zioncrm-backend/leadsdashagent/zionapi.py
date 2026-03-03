"""
Zion API - API Flask para Monitoramento em Tempo Real
Expõe endpoints REST para o frontend consumir dados de monitoramento
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import threading
import time
from datetime import datetime

# Importa o sistema de monitoramento
import zionmonitor

app = Flask(__name__, static_folder='static')
CORS(app)  # Permite requisições de qualquer origem

# Configurações do banco
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


# ============================================
# ENDPOINTS - CONECTIVIDADE
# ============================================

@app.route('/api/connectivity', methods=['GET'])
def get_connectivity():
    """Retorna status de conectividade dos bancos"""
    try:
        status = zionmonitor.get_connectivity_status()
        return jsonify({
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/connectivity/check', methods=['POST'])
def check_connectivity():
    """Força uma verificação de conectividade"""
    try:
        # Verifica MySQL
        mysql_ok, mysql_error = zionmonitor.check_mysql_connectivity(MYSQL_CONFIG)
        
        # Verifica PostgreSQL
        postgres_ok, postgres_error = zionmonitor.check_postgres_connectivity(POSTGRES_CONFIG)
        
        return jsonify({
            "success": True,
            "data": {
                "mysql": {
                    "connected": mysql_ok,
                    "error": mysql_error
                },
                "postgres": {
                    "connected": postgres_ok,
                    "error": postgres_error
                }
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/connectivity/mysql', methods=['GET'])
def get_mysql_status():
    """Retorna apenas status do MySQL"""
    try:
        status = zionmonitor.get_connectivity_status()
        return jsonify({
            "success": True,
            "data": status["mysql"],
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/connectivity/postgres', methods=['GET'])
def get_postgres_status():
    """Retorna apenas status do PostgreSQL"""
    try:
        status = zionmonitor.get_connectivity_status()
        return jsonify({
            "success": True,
            "data": status["postgres"],
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - EXPORTAÇÕES
# ============================================

@app.route('/api/exports', methods=['GET'])
def get_all_exports():
    """Retorna status de todas as exportações"""
    try:
        exports = zionmonitor.get_export_status()
        return jsonify({
            "success": True,
            "data": exports,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/exports/<export_name>', methods=['GET'])
def get_export(export_name):
    """Retorna status de uma exportação específica"""
    try:
        export_data = zionmonitor.get_export_status(export_name)
        
        if not export_data:
            return jsonify({
                "success": False,
                "error": f"Export '{export_name}' not found"
            }), 404
        
        return jsonify({
            "success": True,
            "data": export_data,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/exports/<export_name>/tables', methods=['GET'])
def get_export_tables(export_name):
    """Retorna status das tabelas de uma exportação"""
    try:
        export_data = zionmonitor.get_export_status(export_name)
        
        if not export_data:
            return jsonify({
                "success": False,
                "error": f"Export '{export_name}' not found"
            }), 404
        
        return jsonify({
            "success": True,
            "data": export_data.get("tables", {}),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/exports/<export_name>/errors', methods=['GET'])
def get_export_errors(export_name):
    """Retorna erros de uma exportação"""
    try:
        export_data = zionmonitor.get_export_status(export_name)
        
        if not export_data:
            return jsonify({
                "success": False,
                "error": f"Export '{export_name}' not found"
            }), 404
        
        errors = list(export_data.get("errors", []))
        
        return jsonify({
            "success": True,
            "data": errors,
            "count": len(errors),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - LOGS
# ============================================

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Retorna logs com filtros opcionais"""
    try:
        # Parâmetros de query
        limit = request.args.get('limit', 100, type=int)
        level = request.args.get('level', None)
        export = request.args.get('export', None)
        
        logs = zionmonitor.get_logs(limit=limit, level=level, export=export)
        
        return jsonify({
            "success": True,
            "data": logs,
            "count": len(logs),
            "filters": {
                "limit": limit,
                "level": level,
                "export": export
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/logs/errors', methods=['GET'])
def get_error_logs():
    """Retorna apenas logs de erro"""
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = zionmonitor.get_logs(limit=limit, level="ERROR")
        
        return jsonify({
            "success": True,
            "data": logs,
            "count": len(logs),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/logs/warnings', methods=['GET'])
def get_warning_logs():
    """Retorna apenas logs de aviso"""
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = zionmonitor.get_logs(limit=limit, level="WARNING")
        
        return jsonify({
            "success": True,
            "data": logs,
            "count": len(logs),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - DASHBOARD
# ============================================

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Retorna todos os dados para o dashboard"""
    try:
        data = zionmonitor.get_dashboard_data()
        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas gerais"""
    try:
        stats = zionmonitor.get_stats()
        return jsonify({
            "success": True,
            "data": stats,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================
# ENDPOINTS - HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check da API"""
    return jsonify({
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })


@app.route('/api/ping', methods=['GET'])
def ping():
    """Ping simples"""
    return jsonify({
        "success": True,
        "message": "pong"
    })


# ============================================
# FRONTEND
# ============================================

@app.route('/')
def index():
    """Serve o dashboard HTML"""
    return send_from_directory('static', 'dashboard.html')


@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos"""
    return send_from_directory('static', filename)


# ============================================
# BACKGROUND WORKER
# ============================================

def connectivity_checker():
    """Worker que verifica conectividade periodicamente"""
    while True:
        try:
            zionmonitor.check_mysql_connectivity(MYSQL_CONFIG)
            zionmonitor.check_postgres_connectivity(POSTGRES_CONFIG)
        except Exception as e:
            print(f"Erro no connectivity checker: {str(e)}")
        
        time.sleep(30)  # Verifica a cada 30 segundos


# Inicia checker de conectividade em background
checker_thread = threading.Thread(target=connectivity_checker, daemon=True)
checker_thread.start()


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Zion API - Sistema de Monitoramento")
    print("=" * 60)
    print("\n📡 Endpoints disponíveis:")
    print("\n  Conectividade:")
    print("    GET  /api/connectivity")
    print("    POST /api/connectivity/check")
    print("    GET  /api/connectivity/mysql")
    print("    GET  /api/connectivity/postgres")
    print("\n  Exportações:")
    print("    GET  /api/exports")
    print("    GET  /api/exports/<name>")
    print("    GET  /api/exports/<name>/tables")
    print("    GET  /api/exports/<name>/errors")
    print("\n  Logs:")
    print("    GET  /api/logs")
    print("    GET  /api/logs/errors")
    print("    GET  /api/logs/warnings")
    print("\n  Dashboard:")
    print("    GET  /api/dashboard")
    print("    GET  /api/stats")
    print("\n  Health:")
    print("    GET  /api/health")
    print("    GET  /api/ping")
    print("\n  Frontend:")
    print("    GET  /")
    print("\n" + "=" * 60)
    print("🌐 Servidor rodando em: http://localhost:5000")
    print("📊 Dashboard: http://localhost:5000")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
