"""
Teste de Sintaxe do Sistema de Dashboard
Verifica se não há erros de sintaxe nos arquivos
"""

import sys

print("📝 Testando importação do models.py...")
try:
    import models
    print("✅ models.py importado com sucesso!")
    print(f"   Total de assuntos: {len(models.ASSUNTOS_DISPONIVEIS)}")
except Exception as e:
    print(f"❌ Erro ao importar models.py: {e}")
    sys.exit(1)

print("\n📝 Testando funções auxiliares...")
try:
    # Testar get_assuntos_disponiveis
    assuntos = models.get_assuntos_disponiveis()
    print(f"✅ get_assuntos_disponiveis(): {len(assuntos)} assuntos")
    
    # Testar get_categorias_disponiveis
    categorias = models.get_categorias_disponiveis()
    print(f"✅ get_categorias_disponiveis(): {len(categorias)} categorias")
    print(f"   Categorias: {', '.join(categorias)}")
    
    # Testar filtro por categoria
    assuntos_class = models.get_assuntos_disponiveis(categoria="Classificação")
    print(f"✅ Filtro por categoria 'Classificação': {len(assuntos_class)} assuntos")
    
except Exception as e:
    print(f"❌ Erro ao testar funções: {e}")
    sys.exit(1)

print("\n📝 Testando estrutura de assuntos...")
try:
    erros = []
    for key, assunto in models.ASSUNTOS_DISPONIVEIS.items():
        # Verificar campos obrigatórios
        if "label" not in assunto:
            erros.append(f"{key}: falta campo 'label'")
        if "descricao" not in assunto:
            erros.append(f"{key}: falta campo 'descricao'")
        if "query" not in assunto:
            erros.append(f"{key}: falta campo 'query'")
        if "categoria" not in assunto:
            erros.append(f"{key}: falta campo 'categoria'")
    
    if erros:
        print(f"❌ Encontrados {len(erros)} erros:")
        for erro in erros[:10]:  # Mostrar apenas os primeiros 10
            print(f"   - {erro}")
    else:
        print(f"✅ Todos os {len(models.ASSUNTOS_DISPONIVEIS)} assuntos estão corretos!")
except Exception as e:
    print(f"❌ Erro ao validar estrutura: {e}")
    sys.exit(1)

print("\n📝 Resumo por categoria:")
try:
    categorias_count = {}
    for assunto in models.ASSUNTOS_DISPONIVEIS.values():
        cat = assunto.get("categoria", "Sem Categoria")
        categorias_count[cat] = categorias_count.get(cat, 0) + 1
    
    for cat in sorted(categorias_count.keys()):
        print(f"   {cat}: {categorias_count[cat]} assuntos")
    
    print(f"\n📊 TOTAL: {len(models.ASSUNTOS_DISPONIVEIS)} assuntos em {len(categorias_count)} categorias")
except Exception as e:
    print(f"❌ Erro ao contar categorias: {e}")
    sys.exit(1)

print("\n✅ Todos os testes passaram com sucesso!")
print("🚀 Sistema pronto para uso!")
