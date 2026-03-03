"""
Cristal Assistant - Marketing Specialist

This assistant specializes in marketing strategies, campaign management,
content creation, and social media marketing.
"""

import sqlite3
from datetime import datetime
import random

class CristalAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Cristal"
        self.avatar = "cristal_avatar.png"
        self.specialty = "marketing"
        self.greeting = "Olá! Eu sou Cristal, sua assistente de marketing. Posso ajudar você a planejar campanhas, criar conteúdo e analisar o desempenho das suas estratégias de marketing. Como posso impulsionar seus esforços de marketing hoje?"
        self.db_path = db_path
        
        # Training data specific to marketing
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cristal_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE cristal_training_data (
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
                    ("Como criar uma campanha de marketing eficaz?", "Para criar uma campanha de marketing eficaz, comece definindo objetivos claros e mensuráveis. Identifique seu público-alvo e crie mensagens personalizadas que ressoem com eles. Escolha os canais de marketing apropriados (email, redes sociais, anúncios pagos) com base no comportamento do seu público. Estabeleça um orçamento realista e um cronograma. Implemente a campanha, monitore os resultados e ajuste conforme necessário. Após a campanha, analise os resultados para informar estratégias futuras.", "campanhas", 1.0),
                    ("Quais são as melhores estratégias de marketing digital?", "As melhores estratégias de marketing digital incluem: otimização para mecanismos de busca (SEO), marketing de conteúdo, marketing de mídia social, email marketing, marketing de influenciadores, publicidade paga (PPC), e marketing de afiliados. A chave é escolher as estratégias que melhor se alinham com seus objetivos de negócio e público-alvo. Combine várias estratégias para maximizar seu alcance e impacto. Monitore e analise o desempenho regularmente para otimizar seus esforços.", "estratégias_digitais", 1.0),
                    ("Como medir o ROI das campanhas de marketing?", "Para medir o ROI das campanhas de marketing, primeiro defina métricas claras alinhadas aos seus objetivos (conversões, leads, vendas). Implemente ferramentas de rastreamento como Google Analytics, UTM parameters e CRM. Calcule o custo total da campanha, incluindo criação, distribuição e tempo da equipe. Meça os resultados usando as métricas definidas e calcule o ROI com a fórmula: ROI = (Ganho da Campanha - Custo da Campanha) / Custo da Campanha × 100. Compare o ROI entre diferentes campanhas para otimizar seu orçamento de marketing.", "análise_ROI", 1.0),
                    ("Como criar conteúdo envolvente para redes sociais?", "Para criar conteúdo envolvente para redes sociais, conheça seu público e personalize o conteúdo para seus interesses. Use elementos visuais de alta qualidade (imagens, vídeos, infográficos) que chamem a atenção. Conte histórias autênticas que ressoem emocionalmente com seu público. Mantenha o conteúdo conciso e direto ao ponto. Inclua chamadas para ação claras. Varie os tipos de conteúdo (educativo, inspirador, entretenimento) e adapte o formato para cada plataforma. Analise o desempenho e ajuste sua estratégia com base nos dados.", "conteúdo_social", 1.0),
                    ("Quais são as tendências atuais de marketing?", "As tendências atuais de marketing incluem: marketing de vídeo curto (TikTok, Reels), marketing conversacional com chatbots e IA, conteúdo gerado pelo usuário, marketing de influenciadores (especialmente micro-influenciadores), realidade aumentada e experiências imersivas, marketing de voz (otimização para pesquisa por voz), sustentabilidade e responsabilidade social, personalização avançada usando IA e big data, e marketing sem cookies com foco em privacidade. Fique atento a estas tendências e adapte sua estratégia para se manter relevante.", "tendências", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO cristal_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM cristal_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como criar uma campanha de marketing eficaz?", "answer": "Para criar uma campanha de marketing eficaz, comece definindo objetivos claros e mensuráveis. Identifique seu público-alvo e crie mensagens personalizadas que ressoem com eles.", "category": "campanhas", "confidence": 1.0},
                {"question": "Quais são as melhores estratégias de marketing digital?", "answer": "As melhores estratégias de marketing digital incluem: otimização para mecanismos de busca (SEO), marketing de conteúdo, marketing de mídia social, email marketing, marketing de influenciadores, publicidade paga (PPC), e marketing de afiliados.", "category": "estratégias_digitais", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and marketing expertise
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
        
        # Keywords matching for marketing topics
        if "campanha" in user_message_lower or "campanha de marketing" in user_message_lower:
            return "Para planejar uma campanha de marketing eficaz, defina objetivos SMART (Específicos, Mensuráveis, Atingíveis, Relevantes e Temporais), identifique seu público-alvo, crie mensagens persuasivas, escolha os canais apropriados, estabeleça um orçamento e cronograma, e implemente métricas de acompanhamento para medir o sucesso."
            
        elif "conteúdo" in user_message_lower or "blog" in user_message_lower:
            return "O marketing de conteúdo é uma estratégia poderosa para atrair e engajar clientes. Crie um calendário editorial, pesquise palavras-chave relevantes, produza conteúdo de alta qualidade que resolva problemas do seu público, otimize para SEO, promova nas redes sociais e analise o desempenho para melhorar continuamente."
            
        elif "redes sociais" in user_message_lower or "social media" in user_message_lower:
            return "Para uma estratégia eficaz de redes sociais, escolha as plataformas onde seu público está, crie um calendário de conteúdo consistente, misture conteúdo promocional com educativo e de entretenimento, use elementos visuais de alta qualidade, interaja com sua audiência e analise métricas para otimizar seu desempenho."
            
        elif "email marketing" in user_message_lower or "newsletter" in user_message_lower:
            return "O email marketing continua sendo uma das estratégias com melhor ROI. Segmente sua lista, personalize as mensagens, crie assuntos atraentes, otimize para dispositivos móveis, inclua chamadas para ação claras, teste diferentes versões (A/B testing) e analise métricas como taxa de abertura, cliques e conversões."
            
        elif "seo" in user_message_lower or "otimização" in user_message_lower:
            return "Para melhorar seu SEO, pesquise palavras-chave relevantes, otimize títulos e meta descrições, crie conteúdo de qualidade, melhore a estrutura do site e velocidade de carregamento, construa backlinks de qualidade, otimize para pesquisa local e móvel, e monitore seu desempenho nos mecanismos de busca regularmente."
        
        # Default response
        return "Como especialista em marketing, posso ajudar com estratégias de marketing digital, planejamento de campanhas, criação de conteúdo, otimização de redes sociais, email marketing, SEO e análise de desempenho. Pergunte-me sobre qualquer aspecto do marketing que você gostaria de melhorar."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO cristal_training_data (question, answer, category, confidence)
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
