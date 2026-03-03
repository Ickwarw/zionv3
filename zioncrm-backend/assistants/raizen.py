"""
Raizen Assistant - Data Analysis Specialist

This assistant specializes in data analysis, business intelligence,
and helping users understand their business metrics.
"""

import sqlite3
import pandas as pd
from datetime import datetime, timedelta
import json


class RaizenAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Raizen"
        self.avatar = "raizen_avatar.png"
        self.specialty = "data_analysis"
        self.greeting = "Olá! Eu sou Raizen, seu assistente de análise de dados. Posso ajudar você a analisar seus dados de negócios, identificar tendências e gerar insights acionáveis. Como posso ajudar com suas análises hoje?"
        self.db_path = db_path
        self.training_data = self._load_training_data()

    def _load_training_data(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='raizen_training_data'")
            if not cursor.fetchone():
                cursor.execute('''
                CREATE TABLE raizen_training_data (
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

                initial_data = [
                    ("Como posso analisar as vendas por período?", "Para analisar vendas por período, vá para o Dashboard e selecione 'Vendas' no seletor de gráficos. Você pode ajustar o período (diário, semanal, mensal, anual) usando o controle de período. Isso mostrará tendências de vendas ao longo do tempo e permitirá identificar padrões sazonais.", "análise_vendas", 1.0),
                    ("Quais são os melhores clientes?", "Para identificar seus melhores clientes, vá para Relatórios > Clientes e ordene por 'Valor Total de Compras'. Você também pode analisar a frequência de compras e o valor médio do pedido para identificar clientes de alto valor. Considere implementar um programa de fidelidade para esses clientes VIP.", "análise_clientes", 1.0),
                    ("Como faço para prever vendas futuras?", "Para previsões de vendas, use a função 'Previsão' no módulo de Relatórios. Selecione o período histórico para basear sua previsão e o horizonte de previsão desejado. O sistema usa algoritmos de séries temporais para projetar tendências futuras com base em dados históricos e sazonalidade.", "previsão", 0.9),
                    ("Quais produtos têm melhor desempenho?", "Para analisar o desempenho do produto, vá para Relatórios > Produtos e ordene por 'Receita Total' ou 'Quantidade Vendida'. Você também pode ver a margem de lucro por produto para identificar quais são mais rentáveis. Considere promover mais os produtos de alto desempenho e revisar sua estratégia para produtos de baixo desempenho.", "análise_produtos", 1.0),
                    ("Como posso visualizar a distribuição de leads por fonte?", "Para visualizar a distribuição de leads por fonte, vá para o Dashboard e selecione 'Leads por Fonte' no seletor de gráficos. Isso mostrará um gráfico de pizza ou barras com a proporção de leads de cada fonte. Você também pode filtrar por período para ver como a distribuição mudou ao longo do tempo.", "análise_leads", 1.0)
                ]

                cursor.executemany('''
                INSERT INTO raizen_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)

                conn.commit()

            cursor.execute("SELECT question, answer, category, confidence FROM raizen_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()

            conn.close()

            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]

        except Exception:
            return [
                {"question": "Como posso analisar as vendas por período?", "answer": "Para analisar vendas por período, vá para o Dashboard e selecione 'Vendas' no seletor de gráficos. Você pode ajustar o período (diário, semanal, mensal, anual) usando o controle de período.", "category": "análise_vendas", "confidence": 1.0},
                {"question": "Quais são os melhores clientes?", "answer": "Para identificar seus melhores clientes, vá para Relatórios > Clientes e ordene por 'Valor Total de Compras'.", "category": "análise_clientes", "confidence": 1.0}
            ]

    def _get_data_insights(self, data_type):
        try:
            conn = sqlite3.connect(self.db_path)

            if data_type == "sales":
                df = pd.read_sql_query('''
                SELECT date(date) as day, SUM(amount) as total
                FROM transactions
                WHERE transaction_type = 'income'
                GROUP BY day
                ORDER BY day
                ''', conn)

                if len(df) > 0:
                    total_sales = df['total'].sum()
                    avg_daily = df['total'].mean()
                    max_day = df.loc[df['total'].idxmax()]

                    return f"Análise de vendas: Total de R${total_sales:.2f}, média diária de R${avg_daily:.2f}. O melhor dia foi {max_day['day']} com R${max_day['total']:.2f} em vendas."
                return "Não há dados de vendas suficientes para análise."

            if data_type == "leads":
                df = pd.read_sql_query('''
                SELECT status.name as status, COUNT(leads.id) as count
                FROM leads
                JOIN lead_statuses as status ON leads.status_id = status.id
                GROUP BY status.name
                ''', conn)

                if len(df) > 0:
                    total_leads = df['count'].sum()
                    converted = df[df['status'] == 'Converted']['count'].sum() if 'Converted' in df['status'].values else 0
                    conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0

                    return f"Análise de leads: Total de {total_leads} leads, {converted} convertidos, taxa de conversão de {conversion_rate:.1f}%."
                return "Não há dados de leads suficientes para análise."

            return "Tipo de dados não suportado para análise."

        except Exception as e:
            return f"Erro ao gerar insights: {e}"
        finally:
            if 'conn' in locals():
                conn.close()

    def get_response(self, user_message, context=None):
        user_message_lower = user_message.lower()

        if "analisar vendas" in user_message_lower or "análise de vendas" in user_message_lower:
            return self._get_data_insights("sales")

        if "analisar leads" in user_message_lower or "conversão de leads" in user_message_lower:
            return self._get_data_insights("leads")

        for item in self.training_data:
            if item["question"].lower() in user_message_lower or user_message_lower in item["question"].lower():
                return item["answer"]

        if "dashboard" in user_message_lower or "painel" in user_message_lower:
            return "O Dashboard oferece uma visão geral do desempenho do seu negócio. Você pode personalizar os gráficos e métricas exibidos selecionando diferentes visualizações no seletor de gráficos. Use o seletor de período para ajustar o intervalo de tempo dos dados mostrados."

        if "relatório" in user_message_lower or "relatorio" in user_message_lower:
            return "O módulo de Relatórios permite criar análises detalhadas dos seus dados de negócios. Você pode gerar relatórios de vendas, leads, produtos, clientes e financeiros. Use os filtros disponíveis para refinar os dados e exportar os resultados em vários formatos."

        if "tendência" in user_message_lower or "tendencia" in user_message_lower or "previsão" in user_message_lower:
            return "Para análise de tendências, use os gráficos de linha no Dashboard ou no módulo de Relatórios. Eles mostram como os dados mudam ao longo do tempo, permitindo identificar padrões e sazonalidade. A função de previsão usa esses dados históricos para projetar tendências futuras."

        return "Como especialista em análise de dados, posso ajudar você a entender seus dados de negócios e identificar insights valiosos. Pergunte-me sobre análise de vendas, leads, clientes, produtos ou qualquer outro dado do seu negócio."

    def add_training_data(self, question, answer, category=None, confidence=1.0):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
            INSERT INTO raizen_training_data (question, answer, category, confidence)
            VALUES (?, ?, ?, ?)
            ''', (question, answer, category, confidence))

            conn.commit()
            conn.close()
            self.training_data = self._load_training_data()
            return True
        except Exception:
            return False
