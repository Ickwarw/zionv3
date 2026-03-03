from flask import Blueprint, request, jsonify, send_file, make_response
import pandas as pd
from datetime import datetime
import io

report_bp = Blueprint('report', __name__)

@report_bp.route('/modulos', methods=['GET'])
def get_modulos():
    modulos = [
        { "value": 'visitas', "label": 'Visitas ao Site' },
        { "value": 'leads', "label": 'Análise de Leads' },
        { "value": 'vendas', "label": 'Análise de Vendas' },
        { "value": 'financeiro', "label": 'Análise Financeira' },
        { "value": 'tarefas', "label": 'Relatório de Tarefas' },
        { "value": 'chat', "label": 'Chat e VoIP' },
        { "value": 'logs', "label": 'Logs do Sistema' },
        { "value": 'canais', "label": 'Canais de Contato' }
    ]
    return jsonify(modulos)

@report_bp.route('/periodos', methods=['GET'])
def get_periodos():
    periodos = [
        { "value": "mensal", "label": "Mensal" },
        { "value": "semanal", "label": "Semanal" },
        { "value": "trimestral", "label": "Trimestral" },
        { "value": "anual", "label": "Anual" },
        { "value": "personalizado", "label": "Personalizado" }
    ]
    return jsonify(periodos)


@report_bp.route('/formatos-exportacao', methods=['GET'])
def get_formatos_exportacao():
    formatos = [
        { "value": "pdf", "label": "PDF" },
        { "value": "excel", "label": "Excel" },
        { "value": "csv", "label": "CSV" }
    ]
    return jsonify(formatos)

@report_bp.route('/gerar-relatorio', methods=['POST'])
def gerar_relatorio():
    try:
        data = request.get_json()
        modulo = data.get('modulo')
        periodo = data.get('periodo')
        data_inicio = data.get('data_inicio')
        data_fim = data.get('data_fim')
        formato = data.get('formato', 'json')
        resultado = {
            "status": "sucesso",
            "mensagem": f"Relatório do módulo {modulo} gerado para o período {periodo}, formato {formato}",
            "filtros_aplicados": {
                "modulo": modulo,
                "periodo": periodo,
                "data_inicio": data_inicio,
                "data_fim": data_fim
            }
        }
        
        if formato == 'json':
            return jsonify(resultado)
        elif formato == 'csv':
            df = pd.DataFrame([resultado['filtros_aplicados']])
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)

            filename = f'relatorio_{modulo}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            response = make_response(send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename
            ))
            response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
            response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
            return response

        elif formato == 'excel':
            df = pd.DataFrame([resultado['filtros_aplicados']])
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                df.to_excel(writer, sheet_name='Relatório', index=False)
            output.seek(0)
            filename = f'relatorio_{modulo}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
            response = make_response(send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=filename
            ))
            response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
            response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
            return response
        elif formato == 'pdf':
            return jsonify({
                "status": "info",
                "mensagem": "Exportação para PDF será implementada em breve",
                "dados": resultado
            })
        
    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro ao gerar relatório: {str(e)}"
        }), 500

@report_bp.route('/relatorios/vendas', methods=['POST'])
def relatorio_vendas():
    return processar_relatorio('vendas')

@report_bp.route('/relatorios/leads', methods=['POST'])
def relatorio_leads():
    return processar_relatorio('leads')

@report_bp.route('/relatorios/financeiro', methods=['POST'])
def relatorio_financeiro():
    return processar_relatorio('financeiro')

@report_bp.route('/relatorios/produtividade', methods=['POST'])
def relatorio_produtividade():
    return processar_relatorio('produtividade')

@report_bp.route('/relatorios/satisfacao', methods=['POST'])
def relatorio_satisfacao():
    return processar_relatorio('satisfacao')

@report_bp.route('/relatorios/estoque', methods=['POST'])
def relatorio_estoque():
    return processar_relatorio('estoque')

def processar_relatorio(tipo_relatorio):

    try:
        data = request.get_json()
        periodo = data.get('periodo')
        data_inicio = data.get('data_inicio')
        data_fim = data.get('data_fim')
        formato = data.get('formato', 'json')
        resultado = {
            "status": "sucesso",
            "tipo_relatorio": tipo_relatorio,
            "periodo": periodo,
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "dados": f"Dados do relatório de {tipo_relatorio} serão gerados aqui"
        }
        
        if formato == 'json':
            return jsonify(resultado)
        else:
            return jsonify({
                "status": "info",
                "mensagem": f"Exportação para {formato} do relatório {tipo_relatorio} será implementada"
            })
            
    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro ao processar relatório {tipo_relatorio}: {str(e)}"
        }), 500

@report_bp.route('/relatorios/historico', methods=['GET'])
def get_historico_relatorios():
    historico = [
        {
            "id": 1,
            "tipo": "Vendas",
            "periodo": "Mensal",
            "data_geracao": "15/12/2023",
            "formato": "PDF"
        },
        {
            "id": 2,
            "tipo": "Leads",
            "periodo": "Semanal",
            "data_geracao": "18/12/2023",
            "formato": "Excel"
        }
    ]
    return jsonify(historico)

@report_bp.route('/relatorios/personalizados', methods=['POST'])
def criar_relatorio_personalizado():
    try:
        data = request.get_json()
        nome_relatorio = data.get('nome')
        campos = data.get('campos', [])
        filtros = data.get('filtros', {})
        formato = data.get('formato', 'json')
        resultado = {
            "status": "sucesso",
            "mensagem": f"Relatório personalizado '{nome_relatorio}' criado com sucesso",
            "campos_selecionados": campos,
            "filtros_aplicados": filtros
        }
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro ao criar relatório personalizado: {str(e)}"
        }), 500
