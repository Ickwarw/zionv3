#!/usr/bin/env python3
"""
Script para analisar e comparar campos da tabela cliente (MariaDB) com lead (PostgreSQL)
"""

# Campos da tabela cliente do arquivo cliente_estrutura.sql (MariaDB)
CAMPOS_CLIENTE_MARIADB = [
    'id', 'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
    'cnpj_cpf', 'ie_identidade', 'cond_pagamento', 'fone', 'cep', 'email',
    'tipo_pessoa', 'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
    'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento', 'data',
    'id_myauth', 'telefone_comercial', 'telefone_celular', 'referencia',
    'complemento', 'ramal', 'senha', 'nao_bloquear_ate', 'nao_avisar_ate',
    'id_vendedor', 'isuf', 'tipo_assinante', 'data_nascimento', 'contato',
    'hotsite_email', 'hotsite_acesso', 'estado_civil', 'filial_id',
    'latitude', 'longitude', 'id_candato_tipo', 'tabela_preco',
    'rg_orgao_emissor', 'nacionalidade', 'deb_automatico', 'deb_agencia',
    'deb_conta', 'alerta', 'data_cadastro', 'endereco_cob', 'numero_cob',
    'bairro_cob', 'cidade_cob', 'uf_cob', 'cep_cob', 'referencia_cob',
    'complemento_cob', 'participa_cobranca', 'num_dias_cob', 'profissao',
    'url_site', 'url_sistema', 'ip_sistema', 'porta_ssh_sistema',
    'senha_root_sistema', 'remessa_debito', 'id_operadora_celular',
    'participa_pre_cobranca', 'cob_envia_email', 'cob_envia_sms',
    'contribuinte_icms', 'Sexo', 'id_condominio', 'nome_pai', 'nome_mae',
    'quantidade_dependentes', 'nome_conjuge', 'fone_conjuge', 'cpf_conjuge',
    'rg_conjuge', 'data_nascimento_conjuge', 'moradia', 'nome_contador',
    'telefone_contador', 'ref_com_empresa1', 'ref_com_empresa2',
    'ref_com_fone1', 'ref_com_fone2', 'ref_pes_nome1', 'ref_pes_nome2',
    'ref_pes_fone1', 'ref_pes_fone2', 'emp_empresa', 'emp_cnpj', 'emp_cep',
    'emp_endereco', 'emp_cidade', 'emp_fone', 'emp_contato', 'emp_cargo',
    'emp_remuneracao', 'emp_data_admissao', 'website', 'skype',
    'status_prospeccao', 'prospeccao_ultimo_contato',
    'prospeccao_proximo_contato', 'orgao_publico', 'pipe_id_organizacao',
    'im', 'responsavel', 'bloco', 'apartamento', 'cif', 'grau_satisfacao',
    'idx', 'iss_classificacao', 'iss_classificacao_padrao',
    'tipo_cliente_scm', 'pis_retem', 'cofins_retem', 'csll_retem',
    'irrf_retem', 'cpf_pai', 'cpf_mae', 'identidade_pai', 'identidade_mae',
    'nascimento_pai', 'nascimento_mae', 'id_canal_venda', 'whatsapp',
    'inscricao_municipal', 'nome_representante_1', 'nome_representante_2',
    'cpf_representante_1', 'cpf_representante_2', 'identidade_representante_1',
    'identidade_representante_2', 'id_contato_principal', 'id_concorrente',
    'id_perfil', 'codigo_operacao', 'convert_cliente_forn',
    'tipo_pessoa_titular_conta', 'cnpj_cpf_titular_conta',
    'cadastrado_no_galaxPay', 'atualizar_cadastro_galaxPay', 'id_galaxPay',
    'acesso_automatico_central', 'primeiro_acesso_central', 'ativo_serasa',
    'id_vd_contrato_desejado', 'foto_cartao', 'ultima_atualizacao',
    'permite_armazenar_cartoes', 'yapay_token_account',
    'cli_desconta_iss_retido_total', 'tv_code', 'tv_access_token',
    'tv_token_expires_in', 'tv_refresh_token', 'cidade_naturalidade',
    'cadastrado_via_viabilidade', 'substatus_prospeccao', 'tipo_localidade',
    'qtd_pessoas_calc_vel', 'qtd_smart_calc_vel', 'qtd_celular_calc_vel',
    'qtd_computador_calc_vel', 'qtd_console_calc_vel', 'freq_pessoas_calc_vel',
    'freq_smart_calc_vel', 'freq_celular_calc_vel', 'freq_computador_calc_vel',
    'freq_console_calc_vel', 'resultado_calc_vel', 'tipo_cobranca_auto_viab',
    'plano_negociacao_auto_viab', 'data_reserva_auto_viab',
    'melhor_periodo_reserva_auto_viab', 'facebook',
    'alterar_senha_primeiro_acesso', 'hash_redefinir_senha',
    'data_hash_redefinir_senha', 'senha_hotsite_md5', 'operador_neutro',
    'external_id', 'external_system', 'status_viabilidade', 'tipo_rede',
    'rede_ativacao', 'indicado_por', 'numero_antigo', 'numero_cob_antigo',
    'id_fornecedor_conversao', 'id_campanha', 'desconto_irrf_valor_inferior',
    'id_vindi', 'antigo_acesso_central', 'filtra_filial',
    'tipo_documento_identificacao', 'regua_cobranca_wpp',
    'regua_cobranca_notificacao', 'regime_fiscal_col',
    'regua_cobranca_considera', 'id_segmento', 'inss_retem',
    'tipo_ente_governamental', 'percentual_reducao', 'nome_social'
]

# Campos que já estão no backend (lead_routes.py)
CAMPOS_BACKEND_ATUAL = [
    'razao', 'fantasia', 'endereco', 'numero', 'bairro', 'cidade', 'uf',
    'cnpj_cpf', 'ie_identidade', 'fone', 'cep', 'email', 'tipo_pessoa',
    'id_tipo_cliente', 'ativo', 'id_conta', 'status_internet',
    'bloqueio_automatico', 'aviso_atraso', 'obs', 'dia_vencimento',
    'telefone_comercial', 'telefone_celular', 'referencia', 'complemento',
    'id_vendedor', 'data_nascimento', 'contato', 'estado_civil',
    'filial_id', 'latitude', 'longitude', 'alerta', 'endereco_cob',
    'numero_cob', 'bairro_cob', 'cidade_cob', 'uf_cob', 'cep_cob',
    # Campos de classificação (migration)
    'prioridade', 'status_vendas', 'status_pos_venda', 'nivel_contentamento',
    'status_debito', 'origem', 'departamento', 'score', 'obs_classificacao'
]

def main():
    print("=" * 80)
    print("ANÁLISE DE CAMPOS - CLIENTE (MariaDB) vs LEAD (PostgreSQL)")
    print("=" * 80)
    
    print(f"\n📊 Total de campos na tabela cliente (MariaDB): {len(CAMPOS_CLIENTE_MARIADB)}")
    print(f"📊 Total de campos no backend atual: {len(CAMPOS_BACKEND_ATUAL)}")
    
    # Campos faltantes no backend
    campos_faltantes = set(CAMPOS_CLIENTE_MARIADB) - set(CAMPOS_BACKEND_ATUAL)
    campos_faltantes = sorted(campos_faltantes)
    
    print(f"\n⚠️  CAMPOS FALTANTES NO BACKEND: {len(campos_faltantes)}")
    print("-" * 80)
    
    # Agrupar por categoria
    categorias = {
        'Identificação': ['id', 'id_myauth', 'idx', 'external_id', 'external_system'],
        'Datas': ['data', 'data_cadastro', 'nao_bloquear_ate', 'nao_avisar_ate', 
                  'prospeccao_ultimo_contato', 'prospeccao_proximo_contato',
                  'data_nascimento_conjuge', 'emp_data_admissao', 'nascimento_pai', 
                  'nascimento_mae', 'data_reserva_auto_viab', 'data_hash_redefinir_senha'],
        'Senhas e Autenticação': ['senha', 'ramal', 'hotsite_email', 'hotsite_acesso',
                                    'acesso_automatico_central', 'primeiro_acesso_central',
                                    'alterar_senha_primeiro_acesso', 'hash_redefinir_senha',
                                    'senha_hotsite_md5', 'antigo_acesso_central'],
        'Dados Bancários': ['deb_automatico', 'deb_agencia', 'deb_conta', 'remessa_debito',
                            'tipo_pessoa_titular_conta', 'cnpj_cpf_titular_conta'],
        'Cobrança': ['cond_pagamento', 'participa_cobranca', 'num_dias_cob', 'participa_pre_cobranca',
                     'cob_envia_email', 'cob_envia_sms', 'regua_cobranca_wpp',
                     'regua_cobranca_notificacao', 'regua_cobranca_considera',
                     'tipo_cobranca_auto_viab', 'plano_negociacao_auto_viab'],
        'Fiscal/Tributário': ['contribuinte_icms', 'iss_classificacao', 'iss_classificacao_padrao',
                              'pis_retem', 'cofins_retem', 'csll_retem', 'irrf_retem', 
                              'inss_retem', 'inscricao_municipal', 'regime_fiscal_col',
                              'cli_desconta_iss_retido_total', 'desconto_irrf_valor_inferior',
                              'tipo_ente_governamental', 'percentual_reducao'],
        'Documentos': ['rg_orgao_emissor', 'cpf_pai', 'cpf_mae', 'identidade_pai', 'identidade_mae',
                       'cpf_conjuge', 'rg_conjuge', 'cpf_representante_1', 'cpf_representante_2',
                       'identidade_representante_1', 'identidade_representante_2',
                       'tipo_documento_identificacao'],
        'Família': ['nome_pai', 'nome_mae', 'quantidade_dependentes', 'nome_conjuge', 
                    'fone_conjuge', 'moradia'],
        'Profissão/Emprego': ['profissao', 'emp_empresa', 'emp_cnpj', 'emp_cep', 'emp_endereco',
                               'emp_cidade', 'emp_fone', 'emp_contato', 'emp_cargo', 'emp_remuneracao'],
        'Referências': ['ref_com_empresa1', 'ref_com_empresa2', 'ref_com_fone1', 'ref_com_fone2',
                        'ref_pes_nome1', 'ref_pes_nome2', 'ref_pes_fone1', 'ref_pes_fone2',
                        'nome_contador', 'telefone_contador', 'referencia_cob'],
        'Contato': ['whatsapp', 'website', 'skype', 'facebook', 'id_operadora_celular',
                    'nome_social'],
        'Endereço Adicional': ['bloco', 'apartamento', 'id_condominio'],
        'Sistema/Técnico': ['url_site', 'url_sistema', 'ip_sistema', 'porta_ssh_sistema',
                            'senha_root_sistema', 'tipo_assinante', 'isuf', 'cif'],
        'Integrações': ['pipe_id_organizacao', 'cadastrado_no_galaxPay', 
                        'atualizar_cadastro_galaxPay', 'id_galaxPay', 'id_vindi',
                        'yapay_token_account', 'tv_code', 'tv_access_token',
                        'tv_token_expires_in', 'tv_refresh_token', 'foto_cartao',
                        'permite_armazenar_cartoes'],
        'Relacionamentos': ['id_candato_tipo', 'tabela_preco', 'id_perfil', 'id_concorrente',
                            'id_contato_principal', 'responsavel', 'id_canal_venda',
                            'nome_representante_1', 'nome_representante_2', 'codigo_operacao',
                            'id_vd_contrato_desejado', 'id_campanha', 'indicado_por',
                            'id_segmento', 'operador_neutro', 'id_fornecedor_conversao'],
        'Localidade': ['nacionalidade', 'cidade_naturalidade', 'tipo_localidade', 'im',
                       'orgao_publico'],
        'Prospecção/Vendas': ['status_prospeccao', 'grau_satisfacao', 'ativo_serasa',
                              'convert_cliente_forn', 'substatus_prospeccao',
                              'cadastrado_via_viabilidade', 'status_viabilidade',
                              'tipo_rede', 'rede_ativacao', 'melhor_periodo_reserva_auto_viab'],
        'TV/Internet': ['tipo_cliente_scm', 'qtd_pessoas_calc_vel', 'qtd_smart_calc_vel',
                        'qtd_celular_calc_vel', 'qtd_computador_calc_vel', 'qtd_console_calc_vel',
                        'freq_pessoas_calc_vel', 'freq_smart_calc_vel', 'freq_celular_calc_vel',
                        'freq_computador_calc_vel', 'freq_console_calc_vel', 'resultado_calc_vel'],
        'Diversos': ['Sexo', 'filtra_filial', 'numero_antigo', 'numero_cob_antigo', 'ultima_atualizacao']
    }
    
    for categoria, campos in categorias.items():
        campos_na_categoria = [c for c in campos_faltantes if c in campos]
        if campos_na_categoria:
            print(f"\n📁 {categoria} ({len(campos_na_categoria)} campos):")
            for campo in campos_na_categoria:
                print(f"   - {campo}")
    
    # Listar campos não categorizados
    campos_categorizados = []
    for campos in categorias.values():
        campos_categorizados.extend(campos)
    
    nao_categorizados = [c for c in campos_faltantes if c not in campos_categorizados]
    if nao_categorizados:
        print(f"\n❓ NÃO CATEGORIZADOS ({len(nao_categorizados)} campos):")
        for campo in nao_categorizados:
            print(f"   - {campo}")
    
    print("\n" + "=" * 80)
    print("RESUMO")
    print("=" * 80)
    print(f"✅ Campos já implementados: {len(CAMPOS_BACKEND_ATUAL)}")
    print(f"⚠️  Campos faltantes: {len(campos_faltantes)}")
    print(f"📊 Cobertura atual: {len(CAMPOS_BACKEND_ATUAL)/len(CAMPOS_CLIENTE_MARIADB)*100:.1f}%")
    print("=" * 80)

if __name__ == '__main__':
    main()
