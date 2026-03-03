"""
Ione Assistant - Human Resources Specialist

This assistant specializes in human resources management, recruitment,
employee development, and HR best practices.
"""

import sqlite3
from datetime import datetime
import random

class IoneAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Ione"
        self.avatar = "ione_avatar.png"
        self.specialty = "hr"
        self.greeting = "Olá! Eu sou Ione, sua assistente de recursos humanos. Posso ajudar você com recrutamento, desenvolvimento de funcionários, políticas de RH e gestão de equipes. Como posso ajudar com suas questões de RH hoje?"
        self.db_path = db_path
        
        # Training data specific to HR
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ione_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE ione_training_data (
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
                    ("Como conduzir um processo de recrutamento eficaz?", "Para conduzir um recrutamento eficaz, comece com uma descrição de cargo clara e detalhada. Defina os requisitos essenciais versus desejáveis. Utilize múltiplos canais de recrutamento (job boards, LinkedIn, indicações de funcionários). Desenvolva um processo de triagem eficiente, incluindo análise de currículo e triagem telefônica. Estruture entrevistas com perguntas comportamentais e técnicas relevantes. Inclua testes práticos ou estudos de caso quando apropriado. Verifique referências profissionais. Envolva múltiplos stakeholders no processo de decisão. Comunique-se regularmente com os candidatos e forneça feedback. Analise métricas como tempo de preenchimento, custo por contratação e qualidade das contratações para melhorar continuamente o processo.", "recrutamento", 1.0),
                    ("Como desenvolver um plano de treinamento para funcionários?", "Para desenvolver um plano de treinamento eficaz, comece com uma análise de necessidades: identifique gaps de habilidades através de avaliações de desempenho, feedback de gestores e autoavaliações. Estabeleça objetivos claros e mensuráveis para cada treinamento. Selecione métodos de treinamento apropriados (workshops presenciais, e-learning, mentoria, job rotation). Crie um cronograma realista que não interfira excessivamente nas operações diárias. Desenvolva ou adquira materiais de treinamento de qualidade. Treine os treinadores se estiver usando recursos internos. Implemente o treinamento e colete feedback durante e após. Avalie a eficácia através de testes, observação de desempenho e ROI. Ofereça oportunidades de reforço e prática contínua. Documente tudo para referência futura e conformidade.", "treinamento", 1.0),
                    ("Como lidar com conflitos entre funcionários?", "Para lidar com conflitos entre funcionários, aja rapidamente antes que a situação escale. Converse individualmente com cada parte envolvida para entender suas perspectivas. Realize uma reunião conjunta em terreno neutro, estabelecendo regras básicas de respeito. Foque em comportamentos específicos e seu impacto, não em personalidades ou intenções presumidas. Incentive a escuta ativa e a empatia. Busque pontos em comum e áreas de acordo. Trabalhe para uma solução mutuamente aceitável, documentando os próximos passos acordados. Faça acompanhamento regular para garantir que o conflito foi realmente resolvido. Se necessário, envolva mediação profissional. Use o conflito como oportunidade de aprendizado organizacional, identificando melhorias em processos ou comunicação que possam prevenir problemas similares no futuro.", "conflitos", 1.0),
                    ("Como criar uma cultura organizacional positiva?", "Para criar uma cultura organizacional positiva, comece definindo claramente os valores e comportamentos desejados, com input dos funcionários. Garanta que a liderança modele esses valores consistentemente. Contrate pessoas que se alinhem com a cultura desejada. Integre novos funcionários adequadamente, comunicando expectativas culturais. Reconheça e recompense comportamentos que exemplifiquem os valores. Promova comunicação aberta e transparente em todos os níveis. Solicite feedback regularmente e aja sobre ele. Ofereça oportunidades de desenvolvimento e crescimento. Promova equilíbrio entre vida profissional e pessoal. Celebre conquistas e marcos importantes. Avalie regularmente a saúde da cultura através de pesquisas de engajamento e outros indicadores. Lembre-se que a cultura é dinâmica e requer atenção e ajustes contínuos.", "cultura", 1.0),
                    ("Como implementar um sistema de avaliação de desempenho?", "Para implementar um sistema de avaliação de desempenho eficaz, defina objetivos claros para o sistema (desenvolvimento, compensação, planejamento sucessório). Envolva stakeholders no design. Estabeleça métricas objetivas e subjetivas relevantes para cada função. Treine gestores em feedback construtivo e prevenção de vieses. Implemente um ciclo regular de feedback (não apenas anual). Utilize uma abordagem 360° quando apropriado. Documente claramente o processo e as expectativas. Vincule avaliações a planos de desenvolvimento individuais. Garanta consistência na aplicação entre departamentos. Revise e ajuste o sistema regularmente com base no feedback. Utilize tecnologia para simplificar o processo e análise de dados. Lembre-se que o objetivo principal deve ser o desenvolvimento e melhoria contínua, não apenas julgamento.", "avaliação", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO ione_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM ione_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como conduzir um processo de recrutamento eficaz?", "answer": "Para conduzir um recrutamento eficaz, comece com uma descrição de cargo clara e detalhada. Defina os requisitos essenciais versus desejáveis. Utilize múltiplos canais de recrutamento (job boards, LinkedIn, indicações de funcionários).", "category": "recrutamento", "confidence": 1.0},
                {"question": "Como desenvolver um plano de treinamento para funcionários?", "answer": "Para desenvolver um plano de treinamento eficaz, comece com uma análise de necessidades: identifique gaps de habilidades através de avaliações de desempenho, feedback de gestores e autoavaliações. Estabeleça objetivos claros e mensuráveis para cada treinamento.", "category": "treinamento", "confidence": 1.0}
            ]

    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and HR expertise
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
        
        # Keywords matching for HR topics
        if "recrutamento" in user_message_lower or "contratar" in user_message_lower:
            return "Um processo de recrutamento eficaz começa com uma descrição de cargo clara e atraente. Divulgue a vaga em múltiplos canais, incluindo plataformas online, redes sociais e programas de indicação de funcionários. Desenvolva um processo de seleção estruturado com triagem de currículos, entrevistas comportamentais e técnicas, e verificação de referências. Avalie tanto competências técnicas quanto adequação cultural. Mantenha uma comunicação clara com os candidatos durante todo o processo e colete feedback para melhorias contínuas."
            
        elif "treinamento" in user_message_lower or "desenvolvimento" in user_message_lower:
            return "O desenvolvimento de funcionários deve ser contínuo e alinhado tanto às necessidades organizacionais quanto às aspirações individuais. Identifique necessidades de treinamento através de avaliações de desempenho e feedback. Ofereça uma combinação de métodos de aprendizagem (workshops, e-learning, mentoria, job rotation). Crie planos de desenvolvimento individuais com metas claras. Meça a eficácia dos treinamentos e ajuste conforme necessário. Incentive uma cultura de aprendizado contínuo onde os funcionários assumam responsabilidade pelo seu próprio desenvolvimento."
            
        elif "avaliação" in user_message_lower or "desempenho" in user_message_lower:
            return "Avaliações de desempenho eficazes devem ser contínuas, não apenas anuais. Estabeleça expectativas claras e métricas objetivas no início do período. Forneça feedback regular e específico. Documente conquistas e áreas de melhoria. Durante as avaliações formais, foque em comportamentos e resultados específicos, não em traços de personalidade. Equilibre feedback positivo com oportunidades de desenvolvimento. Vincule avaliações a planos de desenvolvimento e, quando apropriado, a decisões de compensação e promoção."
            
        elif "cultura" in user_message_lower or "engajamento" in user_message_lower:
            return "Uma cultura organizacional positiva começa com valores claros que são vividos pela liderança. Promova comunicação aberta e transparente. Reconheça e celebre conquistas. Ofereça oportunidades de crescimento e desenvolvimento. Promova equilíbrio entre vida profissional e pessoal. Solicite feedback regularmente através de pesquisas de engajamento e aja sobre os resultados. Lembre-se que a cultura é formada por milhares de pequenas interações diárias, não apenas por declarações de missão ou eventos ocasionais."
            
        elif "legislação" in user_message_lower or "compliance" in user_message_lower:
            return "Mantenha-se atualizado sobre a legislação trabalhista e assegure compliance em todas as práticas de RH. Desenvolva políticas claras e atualizadas. Treine gestores sobre questões legais relevantes para suas funções. Documente adequadamente decisões de RH. Realize auditorias internas regulares para identificar e corrigir possíveis problemas. Consulte especialistas legais quando necessário. Lembre-se que compliance não é apenas sobre evitar problemas legais, mas também sobre criar um ambiente de trabalho justo e respeitoso."
        
        # Default response
        return "Como especialista em recursos humanos, posso ajudar com recrutamento e seleção, treinamento e desenvolvimento, gestão de desempenho, cultura organizacional, legislação trabalhista e bem-estar dos funcionários. Pergunte-me sobre qualquer aspecto de RH que você gostaria de melhorar em sua organização."

    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO ione_training_data (question, answer, category, confidence)
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