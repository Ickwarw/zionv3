def register_routes(app):
    # Import blueprints
    from modules.auth.routes import auth_bp
    # from modules.users.routes import users_bp
    from modules.agenda.routes import agenda_bp
    from modules.assistants.routes import assistants_bp
    from modules.chat.routes import chat_bp
    from modules.voip.routes import voip_bp
    # from modules.statistics.routes import statistics_bp
    from modules.financial.routes import financial_bp
    from modules.leads.routes import leads_bp
    # from modules.groups.routes import groups_bp
    from modules.logs.routes import logs_bp
    from modules.products.routes import products_bp
    # from modules.reports.routes import reports_bp
    from modules.tasks.routes import tasks_bp
    from modules.config.routes import config_bp
    from modules.relatorios.relatorios import report_bp
    from modules.user.routes import users_bp
    
    # Import LeadsDashAgent blueprints
    from leadsdashagent import lead_bp, dashboard_bp, leadattributes_bp, leadinfos_bp, raizen_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(agenda_bp, url_prefix='/api/agenda')
    app.register_blueprint(assistants_bp, url_prefix='/api/assistants')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(voip_bp, url_prefix='/api/voip')
    # app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    app.register_blueprint(financial_bp, url_prefix='/api/financial')
    app.register_blueprint(leads_bp, url_prefix='/api/leads')
    # app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    # app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(config_bp, url_prefix='/api/config')
    app.register_blueprint(report_bp, url_prefix='/api/report')
    
    # Register LeadsDashAgent blueprints
    app.register_blueprint(lead_bp, url_prefix='/api/leadsdashagent/leads')
    app.register_blueprint(dashboard_bp, url_prefix='/api/leadsdashagent/dashboard')
    app.register_blueprint(leadattributes_bp, url_prefix='/api/leadsdashagent/attributes')
    app.register_blueprint(leadinfos_bp, url_prefix='/api/leadsdashagent/infos')
    app.register_blueprint(raizen_bp, url_prefix='/api/leadsdashagent/raizen')
