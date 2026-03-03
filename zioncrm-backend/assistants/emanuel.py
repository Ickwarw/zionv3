"""
Emanuel Assistant - Financial Management Specialist

This assistant specializes in financial management, budgeting,
accounting, and financial analysis.
"""

import sqlite3
from datetime import datetime
import random

class EmanuelAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Emanuel"
        self.avatar = "emanuel_avatar.png"
        self.specialty = "financial"
        self.greeting = "Olá! Eu sou Emanuel, seu assistente financeiro. Posso ajudar você com gestão financeira, orçamentos, análise de despesas e receitas, e planejamento financeiro. Como posso auxiliar com suas finanças hoje?"
        self.db_path = db_path
        
        # Training data specific to financial management
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='emanuel_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE emanuel_training_data (
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
                    ("Como criar um orçamento eficaz para minha empresa?", "Para criar um orçamento eficaz, comece analisando dados históricos de receitas e despesas. Identifique padrões sazonais e tendências. Estabeleça metas financeiras realistas para o próximo período. Categorize todas as despesas (fixas e variáveis) e projete receitas com base em dados históricos e previsões de crescimento. Inclua uma margem para contingências (10-15% é recomendado). Revise o orçamento mensalmente e ajuste conforme necessário. Use ferramentas de software financeiro para automatizar o acompanhamento e gerar relatórios regulares.", "orçamento", 1.0),
                    ("Como analisar o fluxo de caixa da minha empresa?", "Para analisar o fluxo de caixa, comece registrando todas as entradas e saídas de dinheiro. Categorize-as em operacionais, de investimento e de financiamento. Calcule o fluxo de caixa líquido (entradas menos saídas) para cada período. Identifique padrões e sazonalidades. Monitore a proporção entre receitas e despesas e o ciclo de conversão de caixa. Crie previsões de fluxo de caixa para os próximos 3-6 meses. Use gráficos para visualizar tendências e identifique períodos de possível escassez de caixa para planejar com antecedência.", "fluxo_de_caixa", 1.0),
                    ("Quais são os principais indicadores financeiros que devo monitorar?", "Os principais indicadores financeiros a monitorar incluem: Margem de Lucro Bruto e Líquido, ROI (Retorno sobre Investimento), ROA (Retorno sobre Ativos), Índice de Liquidez Corrente, Ciclo de Conversão de Caixa, Índice de Endividamento, Ponto de Equilíbrio, EBITDA, e Valor do Ticket Médio. Para pequenas empresas, foque especialmente no fluxo de caixa, margem de lucro, ponto de equilíbrio e ciclo de conversão de caixa. Monitore esses indicadores mensalmente e compare com períodos anteriores e médias do setor.", "indicadores", 1.0),
                    ("Como reduzir custos sem comprometer a qualidade?", "Para reduzir custos sem comprometer a qualidade, analise detalhadamente todas as despesas e identifique ineficiências. Negocie com fornecedores por melhores preços ou condições de pagamento. Considere compras em maior volume para obter descontos. Automatize processos repetitivos. Revise contratos de serviços recorrentes e elimine assinaturas subutilizadas. Implemente políticas de economia de energia e recursos. Considere um modelo híbrido de trabalho para reduzir custos de espaço físico. Terceirize funções não essenciais. Invista em tecnologia que aumente a produtividade. Envolva os funcionários na identificação de oportunidades de economia.", "redução_custos", 1.0),
                    ("Como precificar meus produtos ou serviços corretamente?", "Para precificar corretamente, calcule todos os custos diretos (matéria-prima, mão de obra direta) e indiretos (overhead, marketing, administrativo). Adicione uma margem de lucro adequada ao seu setor (pesquise médias do setor). Analise os preços dos concorrentes e o valor percebido pelo cliente. Considere estratégias como precificação baseada em valor, não apenas em custo. Teste diferentes preços em segmentos de mercado distintos. Revise sua precificação regularmente com base em mudanças nos custos, demanda do mercado e estratégias dos concorrentes. Considere oferecer diferentes níveis de preço para atender diversos segmentos de clientes.", "precificação", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO emanuel_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM emanuel_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como criar um orçamento eficaz para minha empresa?", "answer": "Para criar um orçamento eficaz, comece analisando dados históricos de receitas e despesas. Identifique padrões sazonais e tendências. Estabeleça metas financeiras realistas para o próximo período.", "category": "orçamento", "confidence": 1.0},
                {"question": "Como analisar o fluxo de caixa da minha empresa?", "answer": "Para analisar o fluxo de caixa, comece registrando todas as entradas e saídas de dinheiro. Categorize-as em operacionais, de investimento e de financiamento. Calcule o fluxo de caixa líquido para cada período.", "category": "fluxo_de_caixa", "confidence": 1.0}
            ]

    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO emanuel_training_data (question, answer, category, confidence)
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

    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and financial expertise
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
        
        # Keywords matching for financial topics
        if "orçamento" in user_message_lower or "budget" in user_message_lower:
            return "Um bom orçamento empresarial deve ser baseado em dados históricos e projeções realistas. Divida-o em categorias claras (receitas, custos fixos, custos variáveis, investimentos), inclua uma margem para contingências, revise-o regularmente e ajuste conforme necessário. Use ferramentas de software financeiro para facilitar o acompanhamento e análise."
            
        elif "fluxo de caixa" in user_message_lower or "cash flow" in user_message_lower:
            return "O fluxo de caixa é vital para a saúde financeira da sua empresa. Monitore todas as entradas e saídas, crie previsões para os próximos meses, mantenha uma reserva de emergência (idealmente 3-6 meses de despesas operacionais), e estabeleça políticas claras de recebimentos e pagamentos. Use gráficos para visualizar tendências e identificar possíveis problemas com antecedência."
            
        elif "lucro" in user_message_lower or "margem" in user_message_lower:
            return "Para aumentar a lucratividade, analise tanto a margem bruta quanto a líquida. Estratégias incluem: aumentar preços estrategicamente, reduzir custos sem comprometer qualidade, aumentar o volume de vendas, melhorar o mix de produtos (foco em itens mais lucrativos), reduzir desperdícios e otimizar processos operacionais. Monitore regularmente suas margens por produto, cliente e canal de vendas."
            
        elif "investimento" in user_message_lower or "roi" in user_message_lower:
            return "Ao avaliar investimentos, calcule o ROI (Retorno sobre Investimento) e o payback period (tempo para recuperar o investimento). Compare diferentes opções considerando não apenas o retorno financeiro, mas também benefícios estratégicos. Para investimentos maiores, considere métodos como VPL (Valor Presente Líquido) e TIR (Taxa Interna de Retorno). Diversifique investimentos para mitigar riscos."
            
        elif "imposto" in user_message_lower or "tributo" in user_message_lower:
            return "O planejamento tributário legal pode reduzir significativamente sua carga fiscal. Mantenha-se atualizado sobre legislação tributária, escolha o regime tributário mais vantajoso para seu negócio, aproveite incentivos fiscais disponíveis, documente adequadamente todas as transações e considere consultar um contador especializado em seu setor. Planeje com antecedência para evitar surpresas fiscais."
        
        # Default response
        return "Como especialista financeiro, posso ajudar com orçamentos, fluxo de caixa, análise de lucratividade, investimentos, precificação, redução de custos e planejamento tributário. Pergunte-me sobre qualquer aspecto financeiro que você gostaria de melhorar em seu negócio."