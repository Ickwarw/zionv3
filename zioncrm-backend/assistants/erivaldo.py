"""
Erivaldo Assistant - Technical Support Specialist

This assistant specializes in technical support, troubleshooting,
system configuration, and technical problem resolution.
"""

import sqlite3
from datetime import datetime
import random

class ErivaldoAssistant:
    def __init__(self, db_path="ziondbsqlite.db"):
        self.name = "Erivaldo"
        self.avatar = "erivaldo_avatar.png"
        self.specialty = "technical_support"
        self.greeting = "Olá! Eu sou Erivaldo, seu assistente de suporte técnico. Posso ajudar você a resolver problemas técnicos, configurar sistemas e otimizar seu ambiente tecnológico. Como posso ajudar com suas questões técnicas hoje?"
        self.db_path = db_path
        
        # Training data specific to technical support
        self.training_data = self._load_training_data()
    
    def _load_training_data(self):
        """Load training data from database or initialize if not exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='erivaldo_training_data'")
            if not cursor.fetchone():
                # Create table if it doesn't exist
                cursor.execute('''
                CREATE TABLE erivaldo_training_data (
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
                    ("Como resolver problemas de conexão com o banco de dados?", "Para resolver problemas de conexão com o banco de dados, verifique primeiro se o servidor de banco de dados está em execução. Confirme as credenciais de acesso (usuário/senha) e verifique se o IP do cliente está autorizado a acessar o servidor. Teste a conectividade de rede entre o cliente e o servidor usando ping ou telnet. Verifique logs de erro tanto no cliente quanto no servidor. Confirme se a string de conexão está correta, incluindo nome do servidor, porta, nome do banco de dados e parâmetros adicionais. Se estiver usando um ORM, verifique se a configuração está correta. Para problemas persistentes, reinicie o serviço de banco de dados e, se necessário, o servidor.", "banco_dados", 1.0),
                    ("Como otimizar o desempenho do sistema?", "Para otimizar o desempenho do sistema, comece identificando gargalos através de ferramentas de monitoramento. Para aplicações web, minimize requisições HTTP, comprima arquivos, utilize cache de navegador e CDNs. Para bancos de dados, otimize consultas, adicione índices apropriados e considere procedimentos armazenados para operações complexas. No servidor, aumente recursos (CPU, RAM) conforme necessário, distribua carga entre múltiplos servidores e implemente balanceamento de carga. Monitore regularmente o uso de recursos e estabeleça alertas para quando ultrapassarem limiares críticos. Implemente um processo de manutenção regular incluindo limpeza de dados temporários e otimização de banco de dados.", "desempenho", 1.0),
                    ("Como configurar backups automáticos?", "Para configurar backups automáticos, primeiro determine o que precisa ser backup (banco de dados, arquivos de configuração, conteúdo gerado pelo usuário). Escolha uma estratégia de backup (completo, incremental, diferencial) e frequência adequada ao seu RTO (Recovery Time Objective) e RPO (Recovery Point Objective). Utilize ferramentas nativas do seu sistema ou soluções de terceiros como Veeam, Acronis ou scripts personalizados. Armazene backups em múltiplas localizações, incluindo pelo menos um local off-site ou na nuvem. Implemente criptografia para dados sensíveis. Configure notificações para falhas de backup. Mais importante, teste regularmente a restauração dos backups para garantir que funcionem quando necessário.", "backup", 1.0),
                    ("Como resolver problemas de impressão?", "Para resolver problemas de impressão, verifique primeiro se a impressora está ligada, conectada à rede e com suprimentos (papel, tinta/toner). Confirme se o driver correto está instalado e atualizado. Reinicie a fila de impressão (spooler) no computador. Verifique se há trabalhos presos na fila e limpe-os se necessário. Teste a conectividade entre o computador e a impressora usando ping (para impressoras de rede). Se o problema persistir, desinstale e reinstale o driver da impressora. Para problemas recorrentes, considere atualizar o firmware da impressora ou consultar o suporte do fabricante. Documente a solução para referência futura.", "impressão", 1.0),
                    ("Como implementar medidas de segurança básicas?", "Para implementar medidas de segurança básicas, mantenha todos os sistemas e software atualizados com os patches mais recentes. Utilize senhas fortes e implemente autenticação de dois fatores onde possível. Configure firewalls para permitir apenas tráfego necessário. Instale e mantenha software antivírus/antimalware atualizado. Implemente políticas de controle de acesso baseadas no princípio do menor privilégio. Criptografe dados sensíveis tanto em repouso quanto em trânsito. Realize backups regulares e armazene-os de forma segura. Treine usuários sobre ameaças comuns como phishing. Monitore logs de sistema e rede para atividades suspeitas. Desenvolva e teste um plano de resposta a incidentes.", "segurança", 1.0)
                ]
                
                cursor.executemany('''
                INSERT INTO erivaldo_training_data (question, answer, category, confidence)
                VALUES (?, ?, ?, ?)
                ''', initial_data)
                
                conn.commit()
            
            # Load training data
            cursor.execute("SELECT question, answer, category, confidence FROM erivaldo_training_data WHERE is_approved = 1")
            training_data = cursor.fetchall()
            
            conn.close()
            
            # Convert to dictionary format
            return [{"question": q, "answer": a, "category": c, "confidence": conf} for q, a, c, conf in training_data]
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Return default training data if database fails
            return [
                {"question": "Como resolver problemas de conexão com o banco de dados?", "answer": "Para resolver problemas de conexão com o banco de dados, verifique primeiro se o servidor de banco de dados está em execução. Confirme as credenciais de acesso e verifique se o IP do cliente está autorizado a acessar o servidor.", "category": "banco_dados", "confidence": 1.0},
                {"question": "Como otimizar o desempenho do sistema?", "answer": "Para otimizar o desempenho do sistema, comece identificando gargalos através de ferramentas de monitoramento. Para aplicações web, minimize requisições HTTP, comprima arquivos, utilize cache de navegador e CDNs.", "category": "desempenho", "confidence": 1.0}
            ]
    
    def get_response(self, user_message, context=None):
        """
        Generate a response based on user message and context
        Uses training data and technical support expertise
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
        
        # Keywords matching for technical support topics
        if "erro" in user_message_lower or "bug" in user_message_lower:
            return "Para solucionar erros efetivamente, documente exatamente o que aconteceu, incluindo mensagens de erro completas. Identifique os passos para reproduzir o problema. Verifique logs do sistema e da aplicação. Pesquise a mensagem de erro em bases de conhecimento ou fóruns. Tente soluções simples primeiro, como reiniciar a aplicação ou o sistema. Isole o problema alterando uma variável de cada vez. Se o problema persistir, colete informações detalhadas (screenshots, logs, configurações) para encaminhar ao suporte técnico especializado."
            
        elif "lentidão" in user_message_lower or "performance" in user_message_lower:
            return "Problemas de lentidão podem ter várias causas. Verifique o uso de CPU, memória e disco durante a lentidão. Identifique processos consumindo muitos recursos. Para aplicações web, use ferramentas como Lighthouse ou PageSpeed para analisar o desempenho. Para bancos de dados, verifique consultas lentas e otimize-as. Considere adicionar mais recursos ao servidor se necessário. Implemente cache para dados frequentemente acessados. Monitore o desempenho regularmente para identificar tendências e degradações antes que se tornem críticas."
            
        elif "backup" in user_message_lower or "cópia de segurança" in user_message_lower:
            return "Um bom sistema de backup deve seguir a regra 3-2-1: mantenha pelo menos 3 cópias dos seus dados, em 2 tipos diferentes de mídia, com 1 cópia armazenada off-site. Automatize o processo para garantir consistência. Verifique regularmente a integridade dos backups. Documente claramente o processo de restauração e teste-o periodicamente. Considere o tempo necessário para restauração ao planejar sua estratégia. Para dados críticos, considere soluções de backup contínuo ou replicação em tempo real."
            
        elif "segurança" in user_message_lower or "hacker" in user_message_lower:
            return "A segurança deve ser uma preocupação constante. Implemente uma abordagem em camadas: firewalls, antivírus, patches de segurança, senhas fortes, autenticação multifator, criptografia, controle de acesso, e monitoramento. Realize avaliações de vulnerabilidade regularmente. Eduque os usuários sobre ameaças como phishing e engenharia social. Desenvolva políticas claras de segurança e garanta que sejam seguidas. Mantenha-se informado sobre novas ameaças e vulnerabilidades relevantes para seus sistemas."
            
        elif "rede" in user_message_lower or "conexão" in user_message_lower:
            return "Para problemas de rede, verifique a conectividade física primeiro (cabos, switches, roteadores). Use ferramentas como ping, traceroute e nslookup para diagnosticar problemas. Verifique configurações de IP, máscara de sub-rede, gateway e DNS. Confirme se firewalls não estão bloqueando o tráfego necessário. Para redes Wi-Fi, verifique interferência, distância do ponto de acesso e congestionamento de canais. Monitore o uso de largura de banda para identificar possíveis gargalos ou uso anormal."
        
        # Default response
        return "Como especialista em suporte técnico, posso ajudar com resolução de problemas, otimização de desempenho, configuração de sistemas, segurança, backups e manutenção preventiva. Descreva seu problema técnico em detalhes para que eu possa oferecer a melhor solução possível."
    
    def add_training_data(self, question, answer, category=None, confidence=1.0):
        """Add new training data to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO erivaldo_training_data (question, answer, category, confidence)
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
