import { User } from "@/pages/Tarefas/types/tarefas.types";

export interface LeadStatus {
  id: number;
  name: string;
  color: string;
  order: number;
  department_id?: number;
  department?: LeadDepartment;
  created_at: string;
  updated_at: string;
}

export interface LeadDepartment {
  id: number;
  name: string;
  color: string;
  order: number;
  status_count: number;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  // IDs e identificação
  id?: number;
  
  // ==================== DADOS BÁSICOS ====================
  razao: string; // Razão Social (obrigatório)
  fantasia?: string; // Nome Fantasia
  cnpj_cpf: string; // CNPJ ou CPF (obrigatório)
  ie_identidade?: string; // IE ou RG
  tipo_pessoa?: string; // Tipo de pessoa (F=Física, J=Jurídica)
  cond_pagamento?: string; // Condição de pagamento
  isuf?: string;
  tipo_assinante?: string;
  rg_orgao_emissor?: string;
  nacionalidade?: string;
  tipo_documento_identificacao?: string;
  nome_social?: string;
  
  // ==================== CONTATO ====================
  email?: string;
  fone?: string; // Telefone principal
  telefone_comercial?: string;
  telefone_celular?: string;
  contato?: string; // Nome do contato
  ramal?: string;
  whatsapp?: string;
  website?: string;
  skype?: string;
  facebook?: string;
  
  // ==================== ENDEREÇO PRINCIPAL ====================
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
  
  // ==================== ENDEREÇO DE COBRANÇA ====================
  endereco_cob?: string;
  numero_cob?: string;
  bairro_cob?: string;
  cidade_cob?: string;
  uf_cob?: string;
  cep_cob?: string;
  referencia_cob?: string;
  complemento_cob?: string;
  participa_cobranca?: string;
  num_dias_cob?: number;
  numero_cob_antigo?: string;
  
  // ==================== DADOS PESSOAIS / FAMÍLIA ====================
  data_nascimento?: string;
  estado_civil?: string;
  sexo?: string;
  nome_pai?: string;
  nome_mae?: string;
  cpf_pai?: string;
  cpf_mae?: string;
  identidade_pai?: string;
  identidade_mae?: string;
  nascimento_pai?: string;
  nascimento_mae?: string;
  quantidade_dependentes?: number;
  nome_conjuge?: string;
  fone_conjuge?: string;
  cpf_conjuge?: string;
  rg_conjuge?: string;
  data_nascimento_conjuge?: string;
  moradia?: string;
  cidade_naturalidade?: string;
  
  // ==================== PROFISSÃO E EMPREGO ====================
  profissao?: string;
  emp_empresa?: string;
  emp_cnpj?: string;
  emp_cep?: string;
  emp_endereco?: string;
  emp_cidade?: string;
  emp_fone?: string;
  emp_contato?: string;
  emp_cargo?: string;
  emp_remuneracao?: number;
  emp_data_admissao?: string;
  
  // ==================== REFERÊNCIAS ====================
  ref_com_empresa1?: string;
  ref_com_empresa2?: string;
  ref_com_fone1?: string;
  ref_com_fone2?: string;
  ref_pes_nome1?: string;
  ref_pes_nome2?: string;
  ref_pes_fone1?: string;
  ref_pes_fone2?: string;
  
  // ==================== REPRESENTANTES LEGAIS ====================
  nome_representante_1?: string;
  nome_representante_2?: string;
  cpf_representante_1?: string;
  cpf_representante_2?: string;
  identidade_representante_1?: string;
  identidade_representante_2?: string;
  
  // ==================== LOCALIZAÇÃO ADICIONAL ====================
  im?: string;
  responsavel?: string;
  bloco?: string;
  apartamento?: string;
  cif?: string;
  idx?: string;
  tipo_localidade?: string;
  id_condominio?: number;
  
  // ==================== CLASSIFICAÇÃO DE VENDAS (Sistema ZionCRM) ====================
  prioridade?: string; // NovaLead, Ruim, Fria, Morna, Quente, MuitoQuente, Queimando
  status_vendas?: string; // NovaLeadVendas, PerdasLeads*, Recuperadas, Recuperar, Fidelizado
  status_pos_venda?: string; // AcompanhamentoPersonalizado, TreinamentoSuporte, etc
  nivel_contentamento?: string; // Excelente, Bom, Regular, Ruim, Pessimo
  status_debito?: string; // EmDia, EmAtraso
  origem?: string; // Panfleto, Telefone, Email, WhatsApp, RedeInstagram, etc
  departamento?: string; // vendas, pos_venda
  score?: number; // Pontuação 0-100
  obs_classificacao?: string; // Observações da classificação automática
  data_ultima_classificacao?: string;
  
  // ==================== PROSPECÇÃO E VENDAS ====================
  status_prospeccao?: string;
  prospeccao_ultimo_contato?: string;
  prospeccao_proximo_contato?: string;
  substatus_prospeccao?: string;
  orgao_publico?: string;
  pipe_id_organizacao?: string;
  grau_satisfacao?: string;
  indicado_por?: string;
  
  // ==================== DADOS COMERCIAIS ====================
  id_tipo_cliente?: number;
  id_vendedor?: number;
  id_conta?: number;
  filial_id?: number;
  tabela_preco?: string;
  id_candato_tipo?: number;
  id_segmento?: number;
  
  // ==================== STATUS E CONTROLE ====================
  ativo?: string; // S=Sim, I=Inativo
  status_internet?: string;
  bloqueio_automatico?: boolean;
  aviso_atraso?: boolean;
  alerta?: string;
  data?: string;
  nao_bloquear_ate?: string;
  nao_avisar_ate?: string;
  filtra_filial?: string;
  numero_antigo?: string;
  
  // ==================== FINANCEIRO E COBRANÇA ====================
  dia_vencimento?: number;
  deb_automatico?: string;
  deb_agencia?: string;
  deb_conta?: string;
  tipo_pessoa_titular_conta?: string;
  cnpj_cpf_titular_conta?: string;
  participa_pre_cobranca?: string;
  cob_envia_email?: string;
  cob_envia_sms?: string;
  regua_cobranca_wpp?: string;
  regua_cobranca_notificacao?: string;
  regua_cobranca_considera?: string;
  remessa_debito?: string;
  
  // ==================== FISCAL E TRIBUTÁRIO ====================
  contribuinte_icms?: string;
  iss_classificacao?: string;
  iss_classificacao_padrao?: string;
  tipo_cliente_scm?: string;
  pis_retem?: string;
  cofins_retem?: string;
  csll_retem?: string;
  irrf_retem?: string;
  inss_retem?: string;
  inscricao_municipal?: string;
  regime_fiscal_col?: string;
  cli_desconta_iss_retido_total?: string;
  desconto_irrf_valor_inferior?: string;
  tipo_ente_governamental?: string;
  percentual_reducao?: number;
  nome_contador?: string;
  telefone_contador?: string;
  
  // ==================== SISTEMA E ACESSO ====================
  id_myauth?: number;
  senha?: string;
  hotsite_email?: string;
  hotsite_acesso?: string;
  senha_hotsite_md5?: string;
  acesso_automatico_central?: string;
  primeiro_acesso_central?: string;
  alterar_senha_primeiro_acesso?: string;
  antigo_acesso_central?: string;
  hash_redefinir_senha?: string;
  data_hash_redefinir_senha?: string;
  url_site?: string;
  url_sistema?: string;
  ip_sistema?: string;
  porta_ssh_sistema?: string;
  senha_root_sistema?: string;
  
  // ==================== INTEGRAÇÕES EXTERNAS ====================
  cadastrado_no_galaxPay?: string;
  atualizar_cadastro_galaxPay?: string;
  id_galaxPay?: string;
  id_vindi?: string;
  yapay_token_account?: string;
  permite_armazenar_cartoes?: string;
  foto_cartao?: string;
  tv_code?: string;
  tv_access_token?: string;
  tv_token_expires_in?: number;
  tv_refresh_token?: string;
  external_id?: string;
  external_system?: string;
  
  // ==================== RELACIONAMENTOS ====================
  id_contato_principal?: number;
  id_concorrente?: number;
  id_perfil?: number;
  codigo_operacao?: string;
  convert_cliente_forn?: string;
  id_canal_venda?: number;
  id_campanha?: number;
  id_operadora_celular?: number;
  id_fornecedor_conversao?: number;
  
  // ==================== VIABILIDADE E SERASA ====================
  ativo_serasa?: string;
  id_vd_contrato_desejado?: number;
  cadastrado_via_viabilidade?: string;
  status_viabilidade?: string;
  qtd_pessoas_calc_vel?: number;
  qtd_smart_calc_vel?: number;
  qtd_celular_calc_vel?: number;
  qtd_computador_calc_vel?: number;
  qtd_console_calc_vel?: number;
  freq_pessoas_calc_vel?: string;
  freq_smart_calc_vel?: string;
  freq_celular_calc_vel?: string;
  freq_computador_calc_vel?: string;
  freq_console_calc_vel?: string;
  resultado_calc_vel?: string;
  tipo_cobranca_auto_viab?: string;
  plano_negociacao_auto_viab?: string;
  data_reserva_auto_viab?: string;
  melhor_periodo_reserva_auto_viab?: string;
  
  // ==================== REDE E INFRAESTRUTURA ====================
  operador_neutro?: string;
  tipo_rede?: string;
  rede_ativacao?: string;
  
  // ==================== OBSERVAÇÕES ====================
  obs?: string;
  
  // Legacy fields (manter compatibilidade se necessário)
  name?: string; // Pode ser mapeado para razao
  phone?: string; // Pode ser mapeado para fone
  company?: string; // Pode ser mapeado para fantasia
  position?: string;
  address?: string; // Pode ser mapeado para endereco
  city?: string; // Já existe
  state?: string; // Pode ser mapeado para uf
  zip_code?: string; // Pode ser mapeado para cep
  country?: string;
  status_id?: number;
  status?: LeadStatus;
  department_id?: number;
  source_id?: number;
  source?: LeadSource;
  assigned_to?: number;
  assigned_user?: User;
  notes?: string; // Pode ser mapeado para obs
  value?: number;
  created_by?: number;
  creator?: User;
  
  // Timestamps
  data_cadastro?: string;
  ultima_atualizacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
}

export interface NovoLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novoLead: Omit<Lead, 'id'>) => void;
  tipo: 'marketing' | 'vendas' | 'posvenda';
}

export interface LeadsTableProps {
  leads: Lead[];
  activeTab: string;
  onLeadClick: (lead: Lead) => void;
  isJuliaActive: boolean;
}

export interface DetailedProgressBarProps {
  activeTab: 'marketing' | 'vendas' | 'posvenda';
  selectedStatus: string | null;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: 'marketing' | 'vendas' | 'posvenda') => void;
}

export interface LeadsKanbanProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: number, newStatus: string) => void;
  isJuliaActive?: boolean;
  onElementClick?: (event: React.MouseEvent, message: string) => void;
}

export interface LeadsHeaderProps {
  onNewLead: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}
