"""
Rodolfo Assistant - Sales Specialist

This assistant specializes in sales strategies, lead management,
closing deals, and sales performance optimization.
"""

import sqlite3
from datetime import datetime
import random

class RodolfoAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Rodolfo"
        self.avatar = "rodolfo_avatar.png"
        self.specialty = "sales"
        self.greeting = "Olá! Eu sou Rodolfo, seu assistente de vendas. Posso ajudar você a gerenciar leads, fechar negócios e otimizar seu processo de vendas. Como posso impulsionar suas vendas hoje?"
        self.db_path = db_path
        
        # Training data specific to sales
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rodolfo_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE rodolfo_training_data (
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
                    ("Como qualificar leads efetivamente?", "Para qualificar leads efetivamente, use o framework BANT (Budget, Authority, Need, Timeline). Verifique se o lead tem orçamento para sua solução, se está falando com o decisor ou influenciador, se há uma necessidade clara que seu produto resolve, e se há um prazo definido para implementação. Faça perguntas abertas para entender melhor a situação do cliente. Documente todas as informações no CRM e atribua uma pontuação ao lead com base em sua qualificação. Priorize leads com maior pontuação para maximizar a eficiência da equipe de vendas.", "qualificação_leads", 1.0),
                    ("Quais são as melhores técnicas de fechamento de vendas?", "As melhores técnicas de fechamento incluem: fechamento assumido (agir como se a venda já estivesse garantida), fechamento de alternativa (oferecer opções em vez de perguntas sim/não), fechamento com senso de urgência (destacar benefícios de agir agora), fechamento de resumo (recapitular todos os benefícios antes de pedir a venda), e fechamento de objeção (abordar diretamente as preocupações finais). A chave é escolher a técnica apropriada para cada cliente e situação. Pratique estas técnicas regularmente e analise quais funcionam melhor para diferentes tipos de clientes e produtos.", "técnicas_fechamento", 1.0),
                    ("Como criar um funil de vendas eficiente?", "Para criar um funil de vendas eficiente, defina claramente cada estágio (conscientização, interesse, consideração, intenção, avaliação, compra). Estabeleça critérios objetivos para a movimentação de leads entre estágios. Crie conteúdo e ações específicas para cada estágio. Implemente um CRM para rastrear o progresso dos leads. Analise métricas como taxa de conversão entre estágios, tempo médio em cada estágio e valor do ticket médio. Identifique gargalos onde leads estão estagnando e otimize esses pontos. Automatize partes do processo quando possível, mas mantenha o toque humano nos momentos críticos.", "funil_vendas", 1.0),
                    ("Como lidar com objeções de clientes?", "Para lidar com objeções, primeiro escute atentamente sem interromper. Reconheça a preocupação do cliente e demonstre empatia. Faça perguntas para entender melhor a objeção real (muitas vezes a primeira objeção mencionada não é a verdadeira). Responda com fatos, dados e histórias de sucesso de outros clientes. Confirme se sua resposta atendeu à preocupação. Se a objeção for sobre preço, foque no valor e ROI, não apenas no custo. Antecipe objeções comuns e prepare respostas convincentes antecipadamente. Lembre-se que objeções são oportunidades de esclarecer valor, não obstáculos.", "objeções", 1.0),
                    ("Como aumentar a taxa de conversão de vendas?", "Para aumentar a taxa de conversão, qualifique melhor seus leads inicialmente para focar nos mais promissores. Personalize sua abordagem para cada cliente com base em suas necessidades específicas. Melhore suas apresentações destacando benefícios, não apenas recursos. Utilize provas sociais como depoimentos e estudos de caso. Ofereça garantias para reduzir o risco percebido. Treine continuamente sua equipe em técnicas de vendas e conhecimento do produto. Implemente um processo de acompanhamento estruturado após cada interação. Analise dados para identificar onde os leads estão abandonando o processo e otimize esses pontos. Teste diferentes abordagens e mensagens para encontrar o que funciona melhor.", "conversão", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO rodolfo_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM rodolfo_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como qualificar leads efetivamente?", "answer": "Para qualificar leads efetivamente, use o framework BANT (Budget, Authority, Need, Timeline). Verifique se o lead tem orçamento para sua solução, se está falando com o decisor ou influenciador, se há uma necessidade clara que seu produto resolve, e se há um prazo definido para implementação.", "category": "qualificação_leads", "confidence": 1.0},
                {"question": "Quais são as melhores técnicas de fechamento de vendas?", "answer": "As melhores técnicas de fechamento incluem: fechamento assumido (agir como se a venda já estivesse garantida), fechamento de alternativa (oferecer opções em vez de perguntas sim/não), fechamento com senso de urgência (destacar benefícios de agir agora), fechamento de resumo (recapitular todos os benefícios antes de pedir a venda), e fechamento de objeção (abordar diretamente as preocupações finais).", "category": "técnicas_fechamento", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and sales expertise
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
        
        # Keywords matching for sales topics
        if "lead" in user_message_lower or "prospecto" in user_message_lower:
            return "Para gerenciar leads efetivamente, qualifique-os usando critérios como BANT (Budget, Authority, Need, Timeline). Priorize leads com maior potencial de conversão, mantenha um acompanhamento consistente, personalize sua abordagem para cada lead e documente todas as interações no CRM. Estabeleça um processo claro para nutrir leads que não estão prontos para comprar imediatamente."
            
        elif "fechar" in user_message_lower or "fechamento" in user_message_lower:
            return "O fechamento de vendas é uma arte que requer prática. Identifique sinais de compra (perguntas sobre implementação, prazos, etc.), aborde todas as objeções pendentes, crie um senso de urgência legítimo, apresente uma proposta clara com próximos passos definidos e peça o negócio de forma confiante. Lembre-se que o fechamento começa desde o primeiro contato, construindo valor e confiança ao longo de todo o processo."
            
        elif "objeção" in user_message_lower or "resistência" in user_message_lower:
            return "As objeções são oportunidades, não obstáculos. Escute atentamente, faça perguntas para entender a verdadeira preocupação, valide a objeção, responda com fatos e exemplos concretos, e confirme se sua resposta foi satisfatória. Para objeções de preço, foque no valor e ROI. Para objeções sobre timing, explore as consequências de adiar a decisão. Mantenha um registro das objeções comuns e refine suas respostas."
            
        elif "pipeline" in user_message_lower or "funil" in user_message_lower:
            return "Um pipeline de vendas bem gerenciado é essencial para previsibilidade. Defina claramente os estágios do seu funil, estabeleça critérios objetivos para movimentação entre estágios, estime a probabilidade de fechamento em cada estágio, monitore o tempo médio que os negócios permanecem em cada estágio e identifique onde estão os gargalos. Faça revisões regulares do pipeline com sua equipe para garantir dados atualizados e precisos."
            
        elif "negociação" in user_message_lower or "desconto" in user_message_lower:
            return "Na negociação, prepare-se conhecendo seu BATNA (Best Alternative To a Negotiated Agreement), estabeleça seu preço âncora no início, ofereça concessões em troca de algo valioso, use o silêncio estrategicamente, e foque em criar valor antes de distribuí-lo. Evite oferecer descontos sem obter algo em troca, como um contrato mais longo, pagamento adiantado ou um case study. Lembre-se que uma boa negociação resulta em ganhos para ambas as partes."
        
        # Default response
        return "Como especialista em vendas, posso ajudar com estratégias para qualificar leads, técnicas de fechamento, gestão de pipeline, negociação, objeções de clientes e otimização do processo de vendas. Pergunte-me sobre qualquer aspecto de vendas que você gostaria de melhorar."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO rodolfo_training_data (question, answer, category, confidence)
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
