"""
Teste Rápido da API Dashboard
Execute para verificar se todos os endpoints estão funcionando
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5004"

def print_header(title):
    print("\n" + "=" * 70)
    print(f"🧪 {title}")
    print("=" * 70)

def test_health():
    """Testa endpoint de health check"""
    print_header("1. Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_assuntos():
    """Testa listagem de assuntos"""
    print_header("2. Listar Assuntos Disponíveis")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/assuntos")
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Total de assuntos: {data.get('total', 0)}")
        
        if data.get('success'):
            print("\nAssuntos disponíveis:")
            for key, assunto in list(data['data'].items())[:3]:
                print(f"  • {assunto['label']}")
            print(f"  ... e mais {data['total'] - 3} assuntos")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_dados_assunto():
    """Testa obtenção de dados de um assunto"""
    print_header("3. Obter Dados de Assunto Específico")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/assuntos/distribuicao_prioridade")
        data = response.json()
        print(f"Status: {response.status_code}")
        
        if data.get('success'):
            assunto_data = data['data']
            print(f"\nAssunto: {assunto_data['label']}")
            print(f"Descrição: {assunto_data['descricao']}")
            print(f"Labels: {assunto_data.get('labels', [])[:3]}...")
            print(f"Data: {assunto_data.get('data', [])[:3]}...")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_estatisticas():
    """Testa estatísticas gerais"""
    print_header("4. Estatísticas Gerais")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/estatisticas")
        data = response.json()
        print(f"Status: {response.status_code}")
        
        if data.get('success'):
            stats = data['data']
            print(f"\n📊 Estatísticas:")
            print(f"  Total de Leads: {stats.get('total_leads', 0)}")
            print(f"  Leads Prioritárias: {stats.get('leads_prioritarias', 0)}")
            print(f"  Score Médio: {stats.get('score_medio', 0)}")
            
            if 'por_departamento' in stats:
                print(f"\n  Por Departamento:")
                for dept, total in stats['por_departamento'].items():
                    print(f"    - {dept}: {total}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_graficos_predefinidos():
    """Testa listagem de gráficos predefinidos"""
    print_header("5. Gráficos Predefinidos")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/graficos-predefinidos")
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Total de cards: {data.get('total', 0)}")
        
        if data.get('success'):
            print("\n12 Cards do Dashboard:")
            for card in data['data'][:3]:
                print(f"  {card['icon']} {card['label']} - {card['color']}")
            print(f"  ... e mais {data['total'] - 3} cards")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_criar_grafico():
    """Testa criação de gráfico personalizado"""
    print_header("6. Criar Gráfico Personalizado")
    
    try:
        body = {
            "titulo": "Teste Automático",
            "descricao": f"Gráfico criado em {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "tipo_grafico": "line",
            "assuntos": [
                "perdas_clientes_fidelizados",
                "leads_recuperadas"
            ],
            "configuracoes": {
                "colors": ["#FF6384", "#36A2EB"],
                "borderWidth": 2
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/dashboard/graficos",
            json=body
        )
        data = response.json()
        print(f"Status: {response.status_code}")
        
        if data.get('success'):
            grafico = data['data']
            print(f"\n✅ Gráfico criado:")
            print(f"  ID: {grafico['id']}")
            print(f"  Título: {grafico['titulo']}")
            print(f"  Tipo: {grafico['tipo_grafico']}")
            print(f"  Assuntos: {len(grafico['assuntos'])}")
            return grafico['id']
        
        return None
    except Exception as e:
        print(f"❌ Erro: {e}")
        return None

def test_listar_graficos():
    """Testa listagem de gráficos salvos"""
    print_header("7. Listar Gráficos Salvos")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/graficos")
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Total de gráficos: {data.get('total', 0)}")
        
        if data.get('success'):
            print("\nGráficos salvos:")
            for grafico in data['data'][:5]:
                print(f"  [{grafico['id']}] {grafico['titulo']} ({grafico['tipo_grafico']})")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_obter_dados_grafico(grafico_id):
    """Testa obtenção de dados de um gráfico"""
    print_header("8. Obter Dados do Gráfico (Chart.js)")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/graficos/{grafico_id}/dados")
        data = response.json()
        print(f"Status: {response.status_code}")
        
        if data.get('success'):
            chart_data = data['data']
            print(f"\n📊 Dados prontos para Chart.js:")
            print(f"  Título: {chart_data['titulo']}")
            print(f"  Tipo: {chart_data['tipo_grafico']}")
            print(f"  Labels: {chart_data.get('labels', [])[:3]}...")
            print(f"  Datasets: {len(chart_data.get('datasets', []))}")
            
            for i, dataset in enumerate(chart_data.get('datasets', [])[:2], 1):
                print(f"\n  Dataset {i}:")
                print(f"    Label: {dataset['label']}")
                print(f"    Data: {dataset.get('data', [])[:3]}...")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_deletar_grafico(grafico_id):
    """Testa deleção de gráfico"""
    print_header("9. Deletar Gráfico")
    
    try:
        response = requests.delete(f"{BASE_URL}/api/dashboard/graficos/{grafico_id}")
        data = response.json()
        print(f"Status: {response.status_code}")
        
        if data.get('success'):
            print(f"\n✅ {data.get('message')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("\n" + "=" * 70)
    print("🚀 TESTE COMPLETO DA API DASHBOARD")
    print("=" * 70)
    print(f"\nBase URL: {BASE_URL}")
    print("Certifique-se de que a API está rodando (python routes.py)")
    print("\n" + "=" * 70)
    
    input("\n👉 Pressione ENTER para iniciar os testes...")
    
    results = []
    
    # Executar testes
    results.append(("Health Check", test_health()))
    results.append(("Listar Assuntos", test_assuntos()))
    results.append(("Obter Dados Assunto", test_dados_assunto()))
    results.append(("Estatísticas Gerais", test_estatisticas()))
    results.append(("Gráficos Predefinidos", test_graficos_predefinidos()))
    
    # Testes de CRUD
    grafico_id = test_criar_grafico()
    results.append(("Criar Gráfico", grafico_id is not None))
    results.append(("Listar Gráficos", test_listar_graficos()))
    
    if grafico_id:
        results.append(("Obter Dados Gráfico", test_obter_dados_grafico(grafico_id)))
        results.append(("Deletar Gráfico", test_deletar_grafico(grafico_id)))
    
    # Resumo
    print("\n" + "=" * 70)
    print("📊 RESUMO DOS TESTES")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 70)
    print(f"Resultado: {passed}/{total} testes passaram ({passed/total*100:.1f}%)")
    print("=" * 70 + "\n")
    
    if passed == total:
        print("🎉 TODOS OS TESTES PASSARAM!")
    else:
        print("⚠️  Alguns testes falharam. Verifique os logs acima.")

if __name__ == "__main__":
    main()
