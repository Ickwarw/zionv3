from app import app, db
from models.user import User
from models.group import Group, Permission
from models.tasks import TaskStatus, TaskPriority, TaskCategory
from models.leads import LeadStatus, LeadSource
from models.products import ProductCategory
from models.financial import Category as FinancialCategory
from models.assistants import Assistant
import os
import logging

logger = logging.getLogger(__name__)

def init_permissions():
    """Initialize default permissions"""
    permissions = [
        {"name": "Ver Dashboard", "code": "view_dashboard", "description": "Pode visualizar o dashboard"},
        {"name": "Gerenciar Usuários", "code": "manage_users", "description": "Pode criar, editar e excluir usuários"},
        {"name": "Gerenciar Grupos", "code": "manage_groups", "description": "Pode criar, editar e excluir grupos"},
        {"name": "Ver Leads", "code": "view_leads", "description": "Pode visualizar leads"},
        {"name": "Gerenciar Leads", "code": "manage_leads", "description": "Pode criar, editar e excluir leads"},
        {"name": "Ver Tarefas", "code": "view_tasks", "description": "Pode visualizar tarefas"},
        {"name": "Gerenciar Tarefas", "code": "manage_tasks", "description": "Pode criar, editar e excluir tarefas"},
        {"name": "Ver Produtos", "code": "view_products", "description": "Pode visualizar produtos"},
        {"name": "Gerenciar Produtos", "code": "manage_products", "description": "Pode criar, editar e excluir produtos"},
        {"name": "Ver Fornecedores", "code": "view_suppliers", "description": "Pode visualizar fornecedores"},
        {"name": "Gerenciar Fornecedores", "code": "manage_suppliers", "description": "Pode criar, editar e excluir fornecedores"},
        {"name": "Ver Financeiro", "code": "view_financial", "description": "Pode visualizar dados financeiros"},
        {"name": "Gerenciar Financeiro", "code": "manage_financial", "description": "Pode criar, editar e excluir dados financeiros"},
        {"name": "Ver Relatórios", "code": "view_reports", "description": "Pode visualizar relatórios"},
        {"name": "Gerenciar Relatórios", "code": "manage_reports", "description": "Pode criar, editar e excluir relatórios"},
        {"name": "Ver Logs", "code": "view_logs", "description": "Pode visualizar logs do sistema"},
        {"name": "Gerenciar Configuração", "code": "manage_config", "description": "Pode gerenciar configuração do sistema"},
        {"name": "Usar Assistentes de IA", "code": "use_assistants", "description": "Pode usar assistentes de IA"},
        {"name": "Gerenciar Assistentes de IA", "code": "manage_assistants", "description": "Pode gerenciar assistentes de IA e dados de treinamento"},
    ]
    
    for perm_data in permissions:
        perm = Permission.query.filter_by(code=perm_data["code"]).first()
        if not perm:
            perm = Permission(**perm_data)
            db.session.add(perm)
    
    db.session.commit()
    logger.info("Permissões inicializadas")

def init_assistants():
    """Initialize default AI assistants"""
    assistants_data = [
        {
            "name": "Julia",
            "description": "Assistente de gerenciamento de tarefas que ajuda você a organizar seu trabalho e manter a produtividade.",
            "avatar": "julia_avatar.png",
            "specialty": "task_management",
            "greeting": "Olá! Eu sou Julia, sua assistente de gerenciamento de tarefas. Posso ajudar você a organizar suas tarefas, definir prioridades e cumprir prazos. Como posso ajudar você hoje?",
            "model_type": "guide"
        },
        {
            "name": "Raizen",
            "description": "Assistente de análise de dados que ajuda você a analisar dados de negócios e gerar insights.",
            "avatar": "raizen_avatar.png",
            "specialty": "data_analysis",
            "greeting": "Olá! Eu sou Raizen, seu assistente de análise de dados. Posso ajudar você a analisar seus dados de negócios, identificar tendências e gerar insights acionáveis. O que você gostaria de analisar hoje?",
            "model_type": "ml"
        },
        {
            "name": "Joce",
            "description": "Assistente de atendimento ao cliente que ajuda você a lidar com consultas de clientes e tickets de suporte.",
            "avatar": "joce_avatar.png",
            "specialty": "customer_service",
            "greeting": "Oi! Eu sou Joce, sua assistente de atendimento ao cliente. Posso ajudar você a gerenciar consultas de clientes, resolver problemas e melhorar a satisfação do cliente. Como posso ajudar você com seu atendimento ao cliente hoje?",
            "model_type": "ml"
        },
        {
            "name": "Cristal",
            "description": "Assistente de marketing que ajuda você a planejar campanhas, criar conteúdo e analisar desempenho de marketing.",
            "avatar": "cristal_avatar.png",
            "specialty": "marketing",
            "greeting": "Olá! Eu sou Cristal, sua assistente de marketing. Posso ajudar você a planejar campanhas, criar conteúdo e analisar o desempenho das suas estratégias de marketing. Como posso impulsionar seus esforços de marketing hoje?",
            "model_type": "ml"
        },
        {
            "name": "Emanuel",
            "description": "Assistente de gestão financeira que ajuda você a acompanhar despesas, gerenciar orçamentos e gerar relatórios financeiros.",
            "avatar": "emanuel_avatar.png",
            "specialty": "financial",
            "greeting": "Olá! Eu sou Emanuel, seu assistente financeiro. Posso ajudar você com gestão financeira, orçamentos, análise de despesas e receitas, e planejamento financeiro. Como posso auxiliar com suas finanças hoje?",
            "model_type": "ml"
        },
        {
            "name": "Rodolfo",
            "description": "Assistente de vendas que ajuda você a gerenciar leads, acompanhar negócios e fechar vendas.",
            "avatar": "rodolfo_avatar.png",
            "specialty": "sales",
            "greeting": "Olá! Eu sou Rodolfo, seu assistente de vendas. Posso ajudar você a gerenciar leads, fechar negócios e otimizar seu processo de vendas. Como posso impulsionar suas vendas hoje?",
            "model_type": "ml"
        },
        {
            "name": "Kelly",
            "description": "Assistente de gerenciamento de produtos que ajuda você a gerenciar inventário, fornecedores e catálogo de produtos.",
            "avatar": "kelly_avatar.png",
            "specialty": "product_management",
            "greeting": "Olá! Eu sou Kelly, sua assistente de gestão de produtos. Posso ajudar você a gerenciar seu inventário, fornecedores, catálogo de produtos e estratégias de precificação. Como posso ajudar com seus produtos hoje?",
            "model_type": "ml"
        },
        {
            "name": "Erivaldo",
            "description": "Assistente de suporte técnico que ajuda você a solucionar problemas técnicos e resolver questões de TI.",
            "avatar": "erivaldo_avatar.png",
            "specialty": "technical_support",
            "greeting": "Olá! Eu sou Erivaldo, seu assistente de suporte técnico. Posso ajudar você a resolver problemas técnicos, configurar sistemas e otimizar seu ambiente tecnológico. Como posso ajudar com suas questões técnicas hoje?",
            "model_type": "ml"
        },
        {
            "name": "Ione",
            "description": "Assistente de recursos humanos que ajuda você com recrutamento, desenvolvimento de funcionários e políticas de RH.",
            "avatar": "ione_avatar.png",
            "specialty": "hr",
            "greeting": "Olá! Eu sou Ione, sua assistente de recursos humanos. Posso ajudar você com recrutamento, desenvolvimento de funcionários, políticas de RH e gestão de equipes. Como posso ajudar com suas questões de RH hoje?",
            "model_type": "ml"
        },
        {
            "name": "Ivonete",
            "description": "Assistente de estratégia de negócios que ajuda você com planejamento estratégico, análise de mercado e desenvolvimento de negócios.",
            "avatar": "ivonete_avatar.png",
            "specialty": "business_strategy",
            "greeting": "Olá! Eu sou Ivonete, sua assistente de estratégia de negócios. Posso ajudar você com planejamento estratégico, análise de mercado, desenvolvimento de negócios e tomada de decisões estratégicas. Como posso ajudar a impulsionar sua estratégia hoje?",
            "model_type": "ml"
        }
    ]
    
    for assistant_data in assistants_data:
        assistant = Assistant.query.filter_by(name=assistant_data["name"]).first()
        if not assistant:
            assistant = Assistant(**assistant_data)
            db.session.add(assistant)
    
    db.session.commit()
    logger.info("Assistentes de IA inicializados")

def main():
    """Initialize all default data"""
    with app.app_context():
        logger.info("Inicializando banco de dados SQLite em: %s", app.config['SQLALCHEMY_DATABASE_URI'])
        
        # Verifica se o diretório do banco de dados existe
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
            logger.info("Diretório do banco de dados criado: %s", db_dir)
        
        # Cria todas as tabelas
        db.create_all()
        logger.info("Tabelas do banco de dados criadas")
        
        # Inicializa dados padrão
        logger.info("Inicializando dados padrão...")
        init_permissions()
        init_assistants()
        # Adicione outras funções de inicialização conforme necessário
        
        logger.info("Inicialização de dados padrão concluída!")

if __name__ == "__main__":
    main()