"""
Ivonete Assistant - Business Strategy Specialist

This assistant specializes in business strategy, market analysis,
business planning, and strategic decision-making.
"""

import sqlite3
from datetime import datetime
import random

class IvoneteAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Ivonete"
        self.avatar = "ivonete_avatar.png"
        self.specialty = "business_strategy"
        self.greeting = "Olá! Eu sou Ivonete, sua assistente de estratégia de negócios. Posso ajudar você com planejamento estratégico, análise de mercado, desenvolvimento de negócios e tomada de decisões estratégicas. Como posso ajudar a impulsionar sua estratégia hoje?"
        self.db_path = db_path
        
        # Training data specific to business strategy
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ivonete_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE ivonete_training_data (
                    id INTEGER PRIMARY KEY,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    category TEXT,
                    confidence REAL DEFAULT 1.0,
                    is_approved INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                
                # Insert initial training data
                initial_data = [
                    ("Como desenvolver um plano estratégico eficaz?", "Para desenvolver um plano estratégico eficaz, comece com uma análise abrangente do ambiente interno (forças e fraquezas) e externo (oportunidades e ameaças) usando ferramentas como SWOT e PESTEL. Defina ou revise sua missão, visão e valores. Estabeleça objetivos estratégicos claros, específicos, mensuráveis, alcançáveis, relevantes e com prazo definido (SMART). Identifique as estratégias e táticas para atingir esses objetivos. Aloque recursos necessários (financeiros, humanos, tecnológicos). Desenvolva KPIs para monitorar o progresso. Crie um plano de implementação detalhado com responsabilidades claras. Comunique o plano a todos os stakeholders. Revise e ajuste regularmente com base em feedback e mudanças no ambiente de negócios.", "planejamento_estratégico", 1.0),
                    ("Como realizar uma análise de mercado eficiente?", "Para realizar uma análise de mercado eficiente, defina claramente seus objetivos de pesquisa. Combine dados primários (pesquisas, entrevistas, grupos focais) e secundários (relatórios da indústria, dados governamentais, estudos acadêmicos). Analise o tamanho e crescimento do mercado, tendências, segmentação e necessidades não atendidas. Estude seus concorrentes diretos e indiretos (produtos, preços, posicionamento, forças e fraquezas). Identifique barreiras de entrada e fatores regulatórios. Analise a cadeia de valor e canais de distribuição. Utilize ferramentas como as Cinco Forças de Porter e análise PESTEL. Sintetize os insights em oportunidades e ameaças concretas. Atualize sua análise regularmente, pois mercados mudam constantemente. Lembre-se que o objetivo não é apenas coletar dados, mas gerar insights acionáveis para decisões estratégicas.", "análise_mercado", 1.0),
                    ("Como identificar novas oportunidades de negócio?", "Para identificar novas oportunidades de negócio, monitore constantemente tendências de mercado, mudanças tecnológicas, demográficas e comportamentais. Mantenha contato próximo com clientes para identificar necessidades não atendidas. Analise a cadeia de valor de sua indústria para identificar ineficiências ou gaps. Estude indústrias adjacentes para possíveis expansões. Observe startups e inovações disruptivas em seu setor. Realize sessões de brainstorming estruturadas com equipes multidisciplinares. Analise dados de clientes para identificar padrões e oportunidades. Considere parcerias estratégicas ou aquisições. Avalie oportunidades internacionais. Priorize oportunidades com base em alinhamento estratégico, tamanho de mercado, viabilidade e capacidades organizacionais. Desenvolva protótipos ou MVPs para testar conceitos promissores antes de investimentos significativos.", "oportunidades", 1.0),
                    ("Como tomar decisões estratégicas em ambientes incertos?", "Para tomar decisões estratégicas em ambientes incertos, adote uma mentalidade de experimentação e aprendizado contínuo. Utilize ferramentas como planejamento de cenários para antecipar diferentes futuros possíveis. Desenvolva planos contingenciais para cenários críticos. Priorize flexibilidade e adaptabilidade sobre eficiência em curto prazo. Implemente abordagens ágeis com ciclos rápidos de feedback e ajuste. Diversifique investimentos estratégicos para mitigar riscos. Busque opções que preservem flexibilidade futura (opções reais). Construa redundâncias em sistemas críticos. Desenvolva capacidades de detecção antecipada para identificar mudanças no ambiente. Cultive uma cultura organizacional que tolere ambiguidade e valorize aprendizado a partir de falhas. Lembre-se que em ambientes incertos, a capacidade de adaptar-se rapidamente frequentemente supera a importância do planejamento perfeito.", "decisões_incerteza", 1.0),
                    ("Como implementar mudanças estratégicas com sucesso?", "Para implementar mudanças estratégicas com sucesso, comece articulando claramente a necessidade e visão da mudança. Envolva stakeholders-chave desde o início para construir buy-in. Forme uma coalizão de liderança forte e diversificada para conduzir a mudança. Comunique excessivamente, utilizando múltiplos canais e mensagens consistentes. Estabeleça e celebre vitórias de curto prazo para manter o momentum. Antecipe e planeje para superar resistências. Aloque recursos adequados (tempo, pessoas, orçamento). Alinhe sistemas organizacionais (estrutura, processos, métricas, incentivos) para suportar a mudança. Desenvolva capacidades necessárias através de treinamento e coaching. Monitore o progresso com métricas claras. Institucionalize as mudanças incorporando-as na cultura organizacional. Documente aprendizados para futuras iniciativas de mudança. Lembre-se que mudança significativa geralmente leva mais tempo do que o esperado - mantenha a persistência.", "gestão_mudança", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO ivonete_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM ivonete_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como desenvolver um plano estratégico eficaz?", "answer": "Para desenvolver um plano estratégico eficaz, comece com uma análise abrangente do ambiente interno (forças e fraquezas) e externo (oportunidades e ameaças) usando ferramentas como SWOT e PESTEL. Defina ou revise sua missão, visão e valores.", "category": "planejamento_estratégico", "confidence": 1.0},
                {"question": "Como realizar uma análise de mercado eficiente?", "answer": "Para realizar uma análise de mercado eficiente, defina claramente seus objetivos de pesquisa. Combine dados primários (pesquisas, entrevistas, grupos focais) e secundários (relatórios da indústria, dados governamentais, estudos acadêmicos).", "category": "análise_mercado", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and business strategy expertise
        """
        user_message_lower = user_message.lower()
        
        # Check training data for exact matches
        for item in self.training_data:
            if item["question"].lower() == user_message_lower:
                return item["answer"]
        
        # Check for partial matches in training data
        for item in self.training_data:
            if item["question"].lower() in user_message_lower or user_message_lower in item["question"].lower():
                return item["answer"]
        
        # Keywords matching for business strategy topics
        if "estratégia" in user_message_lower or "planejamento estratégico" in user_message_lower:
            return "O planejamento estratégico eficaz deve equilibrar visão de longo prazo com flexibilidade para adaptar-se a mudanças. Comece com uma análise SWOT completa. Defina objetivos SMART claros. Desenvolva estratégias que aproveitem suas forças e oportunidades de mercado. Crie um plano de implementação detalhado com responsáveis, prazos e recursos necessários. Estabeleça KPIs para monitorar o progresso. Revise e ajuste regularmente. Lembre-se que o valor está mais na reflexão estratégica contínua do que no documento em si."
            
        elif "mercado" in user_message_lower or "concorrência" in user_message_lower:
            return "A análise de mercado deve ser contínua, não um evento único. Monitore tendências da indústria, movimentos dos concorrentes, mudanças no comportamento do consumidor e desenvolvimentos tecnológicos. Utilize tanto dados quantitativos (tamanho de mercado, participação, crescimento) quanto qualitativos (percepções de clientes, posicionamento de marca). Identifique segmentos subatendidos e oportunidades de diferenciação. Lembre-se que o objetivo é identificar onde você pode criar valor único para clientes específicos."
            
        elif "inovação" in user_message_lower or "disrupção" in user_message_lower:
            return "A inovação estratégica requer um equilíbrio entre exploração (buscar novas oportunidades) e explotação (otimizar o negócio atual). Crie processos estruturados para capturar e avaliar ideias de diversas fontes (funcionários, clientes, parceiros). Desenvolva um portfólio balanceado de iniciativas de inovação com diferentes horizontes temporais e níveis de risco. Utilize metodologias como design thinking e lean startup para testar hipóteses rapidamente e com baixo custo. Cultive uma cultura que tolere falhas como parte do processo de aprendizado."
            
        elif "crescimento" in user_message_lower or "expansão" in user_message_lower:
            return "Estratégias de crescimento podem seguir várias direções: penetração de mercado (vender mais produtos atuais em mercados atuais), desenvolvimento de mercado (levar produtos atuais a novos mercados), desenvolvimento de produto (criar novos produtos para mercados atuais) ou diversificação (novos produtos em novos mercados). Cada direção tem diferentes níveis de risco e requisitos de recursos. Avalie também opções de crescimento orgânico versus inorgânico (fusões e aquisições). Priorize oportunidades com base em atratividade de mercado e adequação estratégica."
            
        elif "decisão" in user_message_lower or "incerteza" in user_message_lower:
            return "Em ambientes de alta incerteza, decisões estratégicas devem focar em criar opções e manter flexibilidade. Utilize planejamento de cenários para preparar-se para diferentes futuros possíveis. Adote uma abordagem de experimentação com ciclos rápidos de feedback e aprendizado. Busque decisões reversíveis quando possível. Desenvolva gatilhos claros para mudanças de curso. Lembre-se que em ambientes dinâmicos, a velocidade de adaptação frequentemente supera a importância do planejamento perfeito."
        
        # Default response
        return "Como especialista em estratégia de negócios, posso ajudar com planejamento estratégico, análise de mercado, identificação de oportunidades, gestão de crescimento, inovação e tomada de decisões em ambientes incertos. Pergunte-me sobre qualquer aspecto de estratégia que você gostaria de desenvolver em sua organização."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO ivonete_training_data (question, answer, category, confidence)
            VALUES (?, ?, ?, ?)
            ''', (question, answer, category, confidence))
            
            conn.commit()
            conn.close()
            
            # Reload training data
            self.training_data = self._load_training_data()
            
            return True
        except Exception as e:
            print(f"Error adding training data: {e}")
            return False
