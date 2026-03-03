#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para comparar colunas do cliente_estrutura.sql com zionexport.py
e verificar quais colunas faltam ser exportadas
"""

import re
import json

# Colunas que estão no zionexport.py
COLUNAS_ZIONEXPORT = [
    "id", "razao", "fantasia", "endereco", "numero", "bairro", "cidade", "uf",
    "cnpj_cpf", "ie_identidade", "fone", "cep", "email", "tipo_pessoa",
    "id_tipo_cliente", "ativo", "id_conta", "status_internet",
    "bloqueio_automatico", "aviso_atraso", "obs", "dia_vencimento", "data",
    "id_myauth", "telefone_comercial", "telefone_celular", "referencia",
    "complemento", "ramal", "senha", "id_vendedor", "isuf", "tipo_assinante",
    "data_nascimento", "contato", "hotsite_email", "hotsite_acesso",
    "estado_civil", "filial_id", "latitude", "longitude", "id_candato_tipo",
    "tabela_preco", "rg_orgao_emissor", "nacionalidade", "alerta",
    "data_cadastro", "endereco_cob", "numero_cob", "bairro_cob", "cidade_cob",
    "uf_cob", "cep_cob", "profissao", "id_operadora_celular", "Sexo",
    "id_condominio", "nome_pai", "nome_mae", "quantidade_dependentes",
    "nome_conjuge", "fone_conjuge", "cpf_conjuge", "rg_conjuge",
    "data_nascimento_conjuge", "moradia", "nome_contador", "telefone_contador",
    "ref_com_empresa1", "ref_com_empresa2", "ref_com_fone1", "ref_com_fone2",
    "ref_pes_nome1", "ref_pes_nome2", "ref_pes_fone1", "ref_pes_fone2",
    "emp_empresa", "emp_cnpj", "emp_cep", "emp_endereco", "emp_cidade",
    "emp_fone", "emp_contato", "emp_cargo", "emp_remuneracao",
    "emp_data_admissao", "website", "skype", "status_prospeccao",
    "prospeccao_ultimo_contato", "prospeccao_proximo_contato", "orgao_publico",
    "pipe_id_organizacao", "im", "responsavel", "bloco", "apartamento", "cif",
    "grau_satisfacao", "idx", "iss_classificacao", "iss_classificacao_padrao",
    "tipo_cliente_scm", "cpf_pai", "cpf_mae", "identidade_pai", "identidade_mae",
    "nascimento_pai", "nascimento_mae", "id_canal_venda", "whatsapp",
    "inscricao_municipal", "nome_representante_1", "nome_representante_2",
    "cpf_representante_1", "cpf_representante_2", "identidade_representante_1",
    "identidade_representante_2", "id_contato_principal", "id_concorrente",
    "id_perfil", "codigo_operacao", "convert_cliente_forn",
    "tipo_pessoa_titular_conta", "cnpj_cpf_titular_conta",
    "id_vd_contrato_desejado", "foto_cartao", "ultima_atualizacao", "tv_code",
    "tv_access_token", "tv_token_expires_in", "tv_refresh_token",
    "cidade_naturalidade", "cadastrado_via_viabilidade", "substatus_prospeccao",
    "tipo_localidade", "qtd_pessoas_calc_vel", "qtd_smart_calc_vel",
    "qtd_celular_calc_vel", "qtd_computador_calc_vel", "qtd_console_calc_vel",
    "freq_pessoas_calc_vel", "freq_smart_calc_vel", "freq_celular_calc_vel",
    "freq_computador_calc_vel", "freq_console_calc_vel", "resultado_calc_vel",
    "data_reserva_auto_viab", "melhor_periodo_reserva_auto_viab", "facebook",
    "instagram", "operador_neutro", "external_id", "external_system",
    "status_viabilidade", "tipo_rede", "rede_ativacao", "indicado_por",
    "numero_antigo", "numero_cob_antigo", "id_fornecedor_conversao",
    "id_campanha", "desconto_irrf_valor_inferior", "id_vindi", "filtra_filial",
    "tipo_documento_identificacao", "regua_cobranca_wpp",
    "regua_cobranca_notificacao", "regime_fiscal_col", "regua_cobranca_considera",
    "id_segmento", "tipo_ente_governamental", "percentual_reducao", "nome_social",
]

# Ler arquivo cliente_estrutura.sql e extrair colunas
def extrair_colunas_sql(arquivo_path):
    with open(arquivo_path, 'r', encoding='utf-8') as f:
        conteudo = f.read()
    
    # Regex para capturar nomes de colunas (backtic + nome + backtic)
    padrao = r'`(\w+)`\s+(?:int|varchar|enum|text|date|datetime|timestamp|decimal|blob|char|tinyint)'
    colunas = re.findall(padrao, conteudo, re.IGNORECASE)
    
    # Remover duplicatas mantendo ordem
    colunas_unicas = []
    vistas = set()
    for col in colunas:
        if col not in vistas:
            colunas_unicas.append(col)
            vistas.add(col)
    
    return colunas_unicas

# Extrair colunas do SQL
colunas_sql = extrair_colunas_sql(r'c:\Users\Hunson\Desktop\hefestbyte\cliente_estrutura.sql')

# Comparar
colunas_sql_set = set(colunas_sql)
colunas_zion_set = set(COLUNAS_ZIONEXPORT)

colunas_faltando = colunas_sql_set - colunas_zion_set
colunas_extras = colunas_zion_set - colunas_sql_set

# Criar relatório
relatorio = {
    "resumo": {
        "total_colunas_cliente_estrutura_sql": len(colunas_sql),
        "total_colunas_zionexport_py": len(COLUNAS_ZIONEXPORT),
        "colunas_faltando_no_zionexport": len(colunas_faltando),
        "colunas_no_zionexport_nao_no_sql": len(colunas_extras),
        "taxa_cobertura_percentual": round((len(colunas_zion_set & colunas_sql_set) / len(colunas_sql)) * 100, 2)
    },
    "colunas_faltando_no_zionexport": sorted(list(colunas_faltando)),
    "colunas_no_zionexport_nao_no_sql": sorted(list(colunas_extras)),
    "todas_colunas_cliente_estrutura": colunas_sql,
    "todas_colunas_zionexport": COLUNAS_ZIONEXPORT
}

# Salvar JSON
with open(r'c:\Users\Hunson\Desktop\hefestbyte\comparacao_colunas.json', 'w', encoding='utf-8') as f:
    json.dump(relatorio, f, indent=2, ensure_ascii=False)

# Imprimir resumo
print("="*80)
print("COMPARAÇÃO DE COLUNAS - cliente_estrutura.sql vs zionexport.py")
print("="*80)
print(f"\n📊 RESUMO:")
print(f"   • Total de colunas no cliente_estrutura.sql: {relatorio['resumo']['total_colunas_cliente_estrutura_sql']}")
print(f"   • Total de colunas no zionexport.py: {relatorio['resumo']['total_colunas_zionexport_py']}")
print(f"   • Taxa de cobertura: {relatorio['resumo']['taxa_cobertura_percentual']}%")
print(f"\n❌ COLUNAS FALTANDO NO ZIONEXPORT ({len(colunas_faltando)}):")
for col in sorted(colunas_faltando):
    print(f"   • {col}")

print(f"\n⚠️  COLUNAS NO ZIONEXPORT MAS NÃO NO SQL ({len(colunas_extras)}):")
for col in sorted(colunas_extras):
    print(f"   • {col}")

print(f"\n✅ Relatório salvo em: comparacao_colunas.json")
print("="*80)
