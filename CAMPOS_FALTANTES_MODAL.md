# CAMPOS FALTANTES NO MODAL DE CADASTRO

## ✅ Campos JÁ INCLUÍDOS no Modal (~30 campos):

### Obrigatórios (5):
- razao, cnpj_cpf, ie_identidade, endereco, contato

### Opcionais Básicos (25):
- fantasia, tipo_pessoa, email, fone, telefone_comercial, telefone_celular
- numero, complemento, bairro, cidade, uf, cep, referencia
- data_nascimento, estado_civil, sexo
- endereco_cob, numero_cob, bairro_cob, cidade_cob, uf_cob, cep_cob
- prioridade, origem, obs, ativo

---

## ❌ Campos FALTANTES no Modal (~170 campos):

### 1. Dados Complementares (10 campos):
- cond_pagamento - Condição de pagamento
- isuf - IS/UF
- tipo_assinante - Tipo de assinante
- rg_orgao_emissor - Órgão emissor do RG
- nacionalidade - Nacionalidade
- tipo_documento_identificacao - Tipo de documento
- nome_social - Nome social
- id_myauth - ID MyAuth
- ramal - Ramal telefônico
- senha - Senha (se houver)

### 2. Controle de Bloqueio (4 campos):
- nao_bloquear_ate - Data limite para não bloquear
- nao_avisar_ate - Data limite para não avisar
- data - Data de referência
- data_cadastro - Data de cadastro (auto)

### 3. Relacionamentos Comerciais (10 campos):
- id_tipo_cliente - ID tipo de cliente
- id_vendedor - ID do vendedor
- id_conta - ID da conta
- filial_id - ID da filial
- tabela_preco - Tabela de preços
- id_candato_tipo - ID candidato tipo
- id_segmento - ID do segmento
- id_contato_principal - ID contato principal
- id_concorrente - ID concorrente
- id_perfil - ID perfil

### 4. Status e Ativação (6 campos):
- status_internet - Status de internet
- bloqueio_automatico - Bloqueio automático (bool)
- aviso_atraso - Aviso de atraso (bool)
- alerta - Alertas
- filtra_filial - Filtrar por filial
- numero_antigo - Número antigo

### 5. Localização Detalhada (8 campos):
- latitude - Latitude GPS
- longitude - Longitude GPS
- im - IM (inscrição municipal)
- responsavel - Nome do responsável
- bloco - Bloco do prédio
- apartamento - Número do apartamento
- cif - CIF
- idx - IDX
- tipo_localidade - Tipo de localidade
- id_condominio - ID do condomínio

### 6. Endereço de Cobrança Completo (4 campos já parcialmente cobertos):
- referencia_cob - Referência de cobrança
- complemento_cob - Complemento de cobrança
- participa_cobranca - Participa de cobrança
- num_dias_cob - Número de dias para cobrança

### 7. Família e Pessoais Completos (18 campos):
- nome_pai - Nome do pai
- nome_mae - Nome da mãe
- cpf_pai - CPF do pai
- cpf_mae - CPF da mãe
- identidade_pai - RG do pai
- identidade_mae - RG da mãe
- nascimento_pai - Data nascimento do pai
- nascimento_mae - Data nascimento da mãe
- quantidade_dependentes - Qtd dependentes
- nome_conjuge - Nome do cônjuge
- fone_conjuge - Telefone do cônjuge
- cpf_conjuge - CPF do cônjuge
- rg_conjuge - RG do cônjuge
- data_nascimento_conjuge - Nascimento cônjuge
- moradia - Tipo de moradia
- cidade_naturalidade - Cidade de nascimento

### 8. Profissão e Emprego (10 campos):
- profissao - Profissão
- emp_empresa - Empresa empregadora
- emp_cnpj - CNPJ da empresa
- emp_cep - CEP da empresa
- emp_endereco - Endereço da empresa
- emp_cidade - Cidade da empresa
- emp_fone - Telefone da empresa
- emp_contato - Contato na empresa
- emp_cargo - Cargo
- emp_remuneracao - Remuneração
- emp_data_admissao - Data de admissão

### 9. Referências Pessoais e Comerciais (8 campos):
- ref_com_empresa1 - Referência comercial 1
- ref_com_empresa2 - Referência comercial 2
- ref_com_fone1 - Telefone ref. comercial 1
- ref_com_fone2 - Telefone ref. comercial 2
- ref_pes_nome1 - Referência pessoal 1
- ref_pes_nome2 - Referência pessoal 2
- ref_pes_fone1 - Telefone ref. pessoal 1
- ref_pes_fone2 - Telefone ref. pessoal 2

### 10. Representantes Legais (6 campos):
- nome_representante_1 - Nome representante 1
- nome_representante_2 - Nome representante 2
- cpf_representante_1 - CPF representante 1
- cpf_representante_2 - CPF representante 2
- identidade_representante_1 - RG representante 1
- identidade_representante_2 - RG representante 2

### 11. Redes Sociais (4 campos):
- website - Site
- skype - Skype
- whatsapp - WhatsApp
- facebook - Facebook

### 12. Prospecção e Vendas (7 campos):
- status_prospeccao - Status de prospecção
- prospeccao_ultimo_contato - Último contato
- prospeccao_proximo_contato - Próximo contato
- substatus_prospeccao - Sub-status prospecção
- orgao_publico - Órgão público
- pipe_id_organizacao - ID organização (pipe)
- grau_satisfacao - Grau de satisfação
- indicado_por - Indicado por

### 13. Financeiro e Pagamento (11 campos):
- dia_vencimento - Dia de vencimento
- deb_automatico - Débito automático
- deb_agencia - Agência bancária
- deb_conta - Conta bancária
- tipo_pessoa_titular_conta - Tipo pessoa titular
- cnpj_cpf_titular_conta - CPF/CNPJ titular
- participa_pre_cobranca - Participa pré-cobrança
- cob_envia_email - Cobrança por email
- cob_envia_sms - Cobrança por SMS
- regua_cobranca_wpp - Régua cobrança WhatsApp
- regua_cobranca_notificacao - Régua notificação
- regua_cobranca_considera - Régua considera

### 14. Fiscal e Tributário (16 campos):
- contribuinte_icms - Contribuinte ICMS
- iss_classificacao - Classificação ISS
- iss_classificacao_padrao - ISS padrão
- tipo_cliente_scm - Tipo cliente SCM
- pis_retem - Retém PIS
- cofins_retem - Retém COFINS
- csll_retem - Retém CSLL
- irrf_retem - Retém IRRF
- inss_retem - Retém INSS
- inscricao_municipal - Inscrição municipal
- regime_fiscal_col - Regime fiscal COL
- cli_desconta_iss_retido_total - Desconta ISS retido
- desconto_irrf_valor_inferior - Desconto IRRF
- tipo_ente_governamental - Tipo ente governamental
- percentual_reducao - % redução
- nome_contador - Nome do contador
- telefone_contador - Telefone contador

### 15. Sistema e Acesso (14 campos):
- hotsite_email - Email hotsite
- hotsite_acesso - Acesso hotsite
- senha_hotsite_md5 - Senha MD5 hotsite
- acesso_automatico_central - Acesso auto central
- primeiro_acesso_central - Primeiro acesso
- alterar_senha_primeiro_acesso - Alterar senha
- antigo_acesso_central - Acesso antigo
- hash_redefinir_senha - Hash redefinir senha
- data_hash_redefinir_senha - Data hash senha
- url_site - URL do site
- url_sistema - URL sistema
- ip_sistema - IP sistema
- porta_ssh_sistema - Porta SSH
- senha_root_sistema - Senha root

### 16. Integrações Externas (13 campos):
- cadastrado_no_galaxPay - Cadastrado GalaxyPay
- atualizar_cadastro_galaxPay - Atualizar GalaxyPay
- id_galaxPay - ID GalaxyPay
- id_vindi - ID Vindi
- yapay_token_account - Token Yapay
- permite_armazenar_cartoes - Armazena cartões
- foto_cartao - Foto do cartão
- tv_code - TV Code
- tv_access_token - TV Access Token
- tv_token_expires_in - TV Token Expira
- tv_refresh_token - TV Refresh Token
- external_id - ID Externo
- external_system - Sistema Externo

### 17. Relacionamentos e Canais (7 campos):
- codigo_operacao - Código operação
- convert_cliente_forn - Converter cliente/fornecedor
- id_canal_venda - ID canal de venda
- id_campanha - ID campanha
- id_operadora_celular - ID operadora celular
- id_fornecedor_conversao - ID fornecedor conversão
- remessa_debito - Remessa débito

### 18. Viabilidade e Cálculos (18 campos):
- ativo_serasa - Ativo Serasa
- id_vd_contrato_desejado - ID contrato desejado
- cadastrado_via_viabilidade - Via viabilidade
- status_viabilidade - Status viabilidade
- qtd_pessoas_calc_vel - Qtd pessoas (velocidade)
- qtd_smart_calc_vel - Qtd smartphones
- qtd_celular_calc_vel - Qtd celulares
- qtd_computador_calc_vel - Qtd computadores
- qtd_console_calc_vel - Qtd consoles
- freq_pessoas_calc_vel - Frequência pessoas
- freq_smart_calc_vel - Frequência smartphones
- freq_celular_calc_vel - Frequência celulares
- freq_computador_calc_vel - Frequência computadores
- freq_console_calc_vel - Frequência consoles
- resultado_calc_vel - Resultado cálculo velocidade
- tipo_cobranca_auto_viab - Tipo cobrança viabilidade
- plano_negociacao_auto_viab - Plano negociação
- data_reserva_auto_viab - Data reserva
- melhor_periodo_reserva_auto_viab - Melhor período

### 19. Rede e Infraestrutura (4 campos):
- operador_neutro - Operador neutro
- tipo_rede - Tipo de rede
- rede_ativacao - Rede de ativação

### 20. Classificação ZionCRM (já incluídos parcialmente):
- status_vendas - Status vendas
- status_pos_venda - Status pós-venda
- nivel_contentamento - Nível contentamento
- status_debito - Status débito
- departamento - Departamento
- score - Score (0-100)
- obs_classificacao - Observações classificação

---

## 📊 TOTAL:
- ✅ Incluídos: ~30 campos
- ❌ Faltantes: ~170 campos
- 📦 Total disponível no backend: 200+ campos

---

## 💡 RECOMENDAÇÃO:

Você quer que eu adicione TODOS esses campos no modal? 

**Opções:**

1. **Modal com Abas** (Recomendado)
   - Aba "Essenciais" (atual)
   - Aba "Dados Pessoais Completos"
   - Aba "Profissão e Emprego"
   - Aba "Fiscal e Tributário"
   - Aba "Integrações"
   - Aba "Referências"
   - Etc...

2. **Modal com Seções Expansíveis/Colapsáveis**
   - Seções fechadas por padrão
   - Usuário expande o que precisa

3. **Manter Atual + Tela de Edição Completa**
   - Modal simples para cadastro rápido
   - Página separada para edição detalhada

Qual você prefere?
