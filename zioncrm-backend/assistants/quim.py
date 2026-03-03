from assistants.raizen import RaizenAssistant


class QuimAssistant(RaizenAssistant):
    def __init__(self, db_path="ziondbsqlite.db"):
        super().__init__(db_path=db_path)
        self.name = "Quim"
        self.avatar = "quim_avatar.png"
        self.greeting = "Olá! Eu sou Quim, seu assistente de análise de dados. Posso ajudar você a analisar seus dados de negócios, identificar tendências e gerar insights acionáveis. Como posso ajudar com suas análises hoje?"
