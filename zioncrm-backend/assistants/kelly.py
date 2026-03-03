"""
Kelly Assistant - Product Management Specialist

This assistant specializes in product management, inventory control,
supplier relationships, and product lifecycle management.
"""

import sqlite3
from datetime import datetime
import random

class KellyAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Kelly"
        self.avatar = "kelly_avatar.png"
        self.specialty = "product_management"
        self.greeting = "Olá! Eu sou Kelly, sua assistente de gestão de produtos. Posso ajudar você a gerenciar seu inventário, fornecedores, catálogo de produtos e estratégias de precificação. Como posso ajudar com seus produtos hoje?"
        self.db_path = db_path
        
        # Training data specific to product management
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='kelly_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE kelly_training_data (
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
                    ("Como otimizar o controle de estoque?", "Para otimizar o controle de estoque, implemente um sistema de gestão de inventário que permita rastreamento em tempo real. Utilize o método ABC para classificar produtos (A: alto valor/baixo volume, B: valor médio, C: baixo valor/alto volume) e ajuste as estratégias de controle para cada categoria. Estabeleça pontos de reposição e quantidades de pedido econômicas para cada produto. Realize contagens cíclicas regulares em vez de inventários anuais completos. Analise dados históricos para identificar padrões sazonais e ajuste os níveis de estoque adequadamente. Considere implementar um sistema just-in-time para produtos de alta rotatividade.", "inventário", 1.0),
                    ("Como selecionar os melhores fornecedores?", "Para selecionar os melhores fornecedores, estabeleça critérios claros de avaliação: qualidade do produto, confiabilidade de entrega, preço, termos de pagamento, capacidade de produção, suporte pós-venda e estabilidade financeira. Solicite amostras e referências. Realize auditorias presenciais quando possível. Considere a localização geográfica e possíveis riscos da cadeia de suprimentos. Avalie não apenas o custo direto, mas o custo total de aquisição. Busque fornecedores que possam crescer com seu negócio e que compartilhem seus valores. Mantenha um processo de avaliação contínua e diversifique sua base de fornecedores para produtos críticos.", "fornecedores", 1.0),
                    ("Como precificar produtos corretamente?", "Para precificar produtos corretamente, comece calculando todos os custos diretos e indiretos associados ao produto. Pesquise os preços dos concorrentes e posicione seu produto estrategicamente (premium, valor médio ou econômico). Considere o valor percebido pelo cliente, não apenas seus custos. Teste diferentes estratégias de preço como desnatamento (preço alto inicial) ou penetração (preço baixo inicial). Implemente precificação dinâmica para produtos com demanda sazonal. Analise regularmente a elasticidade de preço dos seus produtos. Considere estratégias de bundling para aumentar o valor médio do pedido. Revise sua precificação regularmente com base em mudanças nos custos, concorrência e condições de mercado.", "precificação", 1.0),
                    ("Como gerenciar o ciclo de vida do produto?", "Para gerenciar efetivamente o ciclo de vida do produto, defina métricas claras para cada fase (introdução, crescimento, maturidade, declínio). Na fase de introdução, foque em educar o mercado e obter feedback inicial. Durante o crescimento, expanda canais de distribuição e otimize processos. Na maturidade, diferencie o produto e busque novos mercados. No declínio, considere reposicionamento, redesign ou descontinuação planejada. Mantenha um pipeline de desenvolvimento de novos produtos para substituir aqueles em declínio. Utilize análise de dados para identificar em qual fase cada produto se encontra e ajuste suas estratégias de marketing, vendas e produção de acordo.", "ciclo_de_vida", 1.0),
                    ("Como reduzir custos na cadeia de suprimentos?", "Para reduzir custos na cadeia de suprimentos, consolide pedidos para obter economias de escala. Negocie contratos de longo prazo com fornecedores-chave. Otimize rotas de transporte e considere consolidação de fretes. Implemente tecnologia para automação e visibilidade em tempo real. Reduza o número de SKUs eliminando produtos de baixo desempenho. Melhore a precisão das previsões de demanda para reduzir excesso de estoque. Considere estratégias de postponement (adiamento da diferenciação do produto). Avalie regularmente make-vs-buy decisions. Implemente programas de melhoria contínua com fornecedores. Analise o custo total de propriedade, não apenas o preço de compra inicial.", "redução_custos", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO kelly_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM kelly_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como otimizar o controle de estoque?", "answer": "Para otimizar o controle de estoque, implemente um sistema de gestão de inventário que permita rastreamento em tempo real. Utilize o método ABC para classificar produtos e ajuste as estratégias de controle para cada categoria.", "category": "inventário", "confidence": 1.0},
                {"question": "Como selecionar os melhores fornecedores?", "answer": "Para selecionar os melhores fornecedores, estabeleça critérios claros de avaliação: qualidade do produto, confiabilidade de entrega, preço, termos de pagamento, capacidade de produção, suporte pós-venda e estabilidade financeira.", "category": "fornecedores", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and product management expertise
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
        
        # Keywords matching for product management topics
        if "estoque" in user_message_lower or "inventário" in user_message_lower:
            return "Para uma gestão eficiente de estoque, estabeleça níveis mínimos de estoque para cada produto, implemente um sistema de código de barras ou RFID para rastreamento preciso, realize contagens cíclicas regularmente, analise a velocidade de giro de cada item, e utilize previsões de demanda para planejar compras. Considere o método just-in-time para itens de alto valor e mantenha um buffer para produtos essenciais."
            
        elif "fornecedor" in user_message_lower or "supplier" in user_message_lower:
            return "O relacionamento com fornecedores é crucial para o sucesso do negócio. Estabeleça acordos de nível de serviço (SLAs) claros, mantenha comunicação regular, desenvolva parcerias estratégicas com fornecedores-chave, avalie o desempenho periodicamente, e diversifique sua base de fornecedores para mitigar riscos. Considere programas de desenvolvimento de fornecedores para melhorar qualidade e eficiência."
            
        elif "produto" in user_message_lower or "catálogo" in user_message_lower:
            return "Para gerenciar seu catálogo de produtos eficientemente, mantenha informações detalhadas e atualizadas de cada item, categorize produtos de forma lógica, revise regularmente o desempenho de cada SKU, elimine produtos de baixo desempenho, e mantenha um processo estruturado para introdução de novos produtos. Utilize análise de dados para identificar oportunidades de cross-selling e upselling."
            
        elif "preço" in user_message_lower or "precificação" in user_message_lower:
            return "A estratégia de precificação deve considerar custos, valor percebido pelo cliente, posicionamento de mercado e concorrência. Revise preços regularmente com base em mudanças nos custos e condições de mercado. Considere estratégias como preços psicológicos, bundling, e descontos por volume. Teste diferentes abordagens e analise o impacto nas vendas e margens."
            
        elif "qualidade" in user_message_lower or "controle de qualidade" in user_message_lower:
            return "O controle de qualidade deve ser integrado em todo o processo, desde a seleção de fornecedores até a entrega ao cliente. Estabeleça especificações claras para cada produto, implemente inspeções em pontos críticos, mantenha registros detalhados, analise tendências de defeitos, e implemente ações corretivas rapidamente. Considere certificações de qualidade relevantes para seu setor."
        
        # Default response
        return "Como especialista em gestão de produtos, posso ajudar com controle de estoque, seleção de fornecedores, desenvolvimento de produtos, precificação, controle de qualidade e otimização da cadeia de suprimentos. Pergunte-me sobre qualquer aspecto da gestão de produtos que você gostaria de melhorar."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO kelly_training_data (question, answer, category, confidence)
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
