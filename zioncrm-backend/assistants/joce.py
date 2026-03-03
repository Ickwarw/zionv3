"""
Joce Assistant - Customer Service Specialist

This assistant specializes in customer service, helping users handle
customer inquiries, resolve issues, and improve customer satisfaction.
"""

import sqlite3
from datetime import datetime
import random

class JoceAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Joce"
        self.avatar = "joce_avatar.png"
        self.specialty = "customer_service"
        self.greeting = "Olá! Eu sou Joce, sua assistente de atendimento ao cliente. Posso ajudar você a gerenciar interações com clientes, resolver problemas e melhorar a satisfação do cliente. Como posso ajudar você hoje?"
        self.db_path = db_path
        
        # Training data specific to customer service
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='joce_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE joce_training_data (
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
                    ("Como lidar com um cliente insatisfeito?", "Ao lidar com um cliente insatisfeito, mantenha a calma e escute atentamente. Reconheça o problema sem interromper, demonstre empatia, peça desculpas pela situação e foque em encontrar uma solução. Pergunte o que faria o cliente ficar satisfeito e tente resolver o problema o mais rápido possível. Acompanhe depois para garantir que o cliente está satisfeito com a resolução.", "atendimento_cliente", 1.0),
                    ("Como processar um pedido de reembolso?", "Para processar um reembolso, primeiro verifique os detalhes da compra, entenda o motivo do reembolso e verifique se ele atende aos critérios da política de reembolso. Em seguida, processe o reembolso através do sistema de pagamento apropriado. Documente o reembolso e informe o cliente quando estiver concluído. Certifique-se de seguir todas as políticas da empresa e regulamentações financeiras.", "reembolsos", 1.0),
                    ("Quais são as melhores práticas para atendimento ao cliente?", "As melhores práticas para atendimento ao cliente incluem: responder rapidamente, personalizar o atendimento, ouvir ativamente, ser empático, superar expectativas quando possível, acompanhar após as interações, treinar sua equipe consistentemente e medir continuamente a satisfação do cliente. Lembre-se que cada interação é uma oportunidade para fortalecer o relacionamento com o cliente.", "melhores_práticas", 1.0),
                    ("Como melhorar a satisfação do cliente?", "Para melhorar a satisfação do cliente, foque em atendimento rápido e personalizado, ouça ativamente o feedback, exceda expectativas quando possível, acompanhe após as interações, treine sua equipe consistentemente e meça continuamente a satisfação do cliente através de pesquisas e outros métodos. Implemente um programa de fidelidade e reconheça clientes frequentes.", "satisfação_cliente", 1.0),
                    ("O que fazer quando não consigo resolver o problema de um cliente?", "Se você não conseguir resolver o problema de um cliente, seja honesto sobre as limitações, escale o problema para um supervisor ou equipe especializada, mantenha o cliente informado sobre o processo de escalonamento, forneça um prazo para resolução e acompanhe para garantir que o problema seja eventualmente resolvido. Nunca deixe o cliente sem resposta ou solução.", "resolução_problemas", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO joce_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM joce_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como lidar com um cliente insatisfeito?", "answer": "Ao lidar com um cliente insatisfeito, mantenha a calma e escute atentamente. Reconheça o problema sem interromper, demonstre empatia, peça desculpas pela situação e foque em encontrar uma solução.", "category": "atendimento_cliente", "confidence": 1.0},
                {"question": "Como processar um pedido de reembolso?", "answer": "Para processar um reembolso, primeiro verifique os detalhes da compra, entenda o motivo do reembolso e verifique se ele atende aos critérios da política de reembolso.", "category": "reembolsos", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and customer service expertise
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
        
        # Keywords matching for customer service topics
        if "cliente insatisfeito" in user_message_lower or "reclamação" in user_message_lower:
            return "Ao lidar com reclamações, escute atentamente o cliente, demonstre empatia, peça desculpas pela situação e foque em encontrar uma solução. Não fique na defensiva e trate cada reclamação como uma oportunidade de melhorar seu serviço."
            
        elif "reembolso" in user_message_lower or "devolução" in user_message_lower:
            return "Para processar reembolsos, verifique a política da empresa, os detalhes da compra e o motivo do reembolso. Processe o reembolso rapidamente e mantenha o cliente informado durante todo o processo. Documente tudo para referência futura."
            
        elif "satisfação" in user_message_lower or "feedback" in user_message_lower:
            return "Para melhorar a satisfação do cliente, colete feedback regularmente através de pesquisas, monitore as interações com os clientes e implemente melhorias com base no feedback recebido. Reconheça clientes fiéis e crie um programa de fidelidade para incentivar compras repetidas."
            
        elif "atendimento" in user_message_lower or "suporte" in user_message_lower:
            return "Um bom atendimento ao cliente é personalizado, rápido e empático. Treine sua equipe para ouvir ativamente, resolver problemas eficientemente e superar as expectativas dos clientes. Use um sistema de CRM para acompanhar todas as interações e garantir continuidade no atendimento."
            
        elif "escalar" in user_message_lower or "supervisor" in user_message_lower:
            return "Quando precisar escalar um problema, informe o cliente sobre o processo, forneça um prazo para resolução e acompanhe para garantir que o problema seja resolvido. Mantenha o cliente informado durante todo o processo de escalonamento."
        
        # Default response
        return "Como especialista em atendimento ao cliente, posso ajudar com estratégias para melhorar a satisfação do cliente, lidar com reclamações, processar reembolsos e treinar sua equipe de atendimento. Pergunte-me sobre qualquer aspecto do atendimento ao cliente que você gostaria de melhorar."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO joce_training_data (question, answer, category, confidence)
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
