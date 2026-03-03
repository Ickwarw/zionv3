"""
LeadsDashAgent - Sistema integrado de Leads e Dashboard
Este módulo fornece blueprints para integração com o sistema ZionCRM
"""

from flask import Blueprint

# Blueprints para integração com o sistema principal
lead_bp = Blueprint('leadsdashagent_leads', __name__)
dashboard_bp = Blueprint('leadsdashagent_dashboard', __name__)
leadattributes_bp = Blueprint('leadsdashagent_attributes', __name__)
leadinfos_bp = Blueprint('leadsdashagent_infos', __name__)
raizen_bp = Blueprint('leadsdashagent_raizen', __name__)

# Importar as rotas dos blueprints
from .lead_routes import *
from .dashboard_routes import *
from .leadattributes_routes import *
from .leadinfos_routes import *
from .raizen_routes import *
