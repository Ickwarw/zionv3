"""
Julia Assistant - Task Management Guide

This assistant doesn't use AI or machine learning as it simply explains
system functionality based on what the user clicks.
"""

class JuliaAssistant:
    def __init__(self):
        self.name = "Julia"
        self.avatar = "julia_avatar.png"
        self.specialty = "task_management"
        self.greeting = "Olá! Eu sou Julia, sua assistente de gerenciamento de tarefas. Posso explicar como usar as funcionalidades do sistema. Em que posso ajudar hoje?"
    
    def get_response(self, user_message, context=None):
        """
        Returns a response based on the system functionality being asked about.
        No AI/ML is used - just predefined responses about system features.
        """
        user_message = user_message.lower()
        
        # Task creation responses
        if "criar tarefa" in user_message or "nova tarefa" in user_message:
            return "Para criar uma nova tarefa, clique no botão '+ Nova Tarefa' no canto superior direito da página de Tarefas. Preencha os detalhes como título, descrição, data de vencimento, prioridade e categoria, e clique em 'Salvar'."
        
        # Task assignment responses
        elif "atribuir tarefa" in user_message or "designar tarefa" in user_message:
            return "Para atribuir uma tarefa a alguém, abra a tarefa e use o menu suspenso 'Atribuído a' para selecionar o usuário. Você também pode fazer isso ao criar uma nova tarefa ou ao editar uma existente."
        
        # Task status responses
        elif "status" in user_message or "concluir tarefa" in user_message:
            return "Para alterar o status de uma tarefa, arraste-a para a coluna apropriada no quadro Kanban, ou abra a tarefa e altere o status no menu suspenso 'Status'. Os status disponíveis são: A Fazer, Em Andamento, Revisão, Concluído e Cancelado."
        
        # Task priority responses
        elif "prioridade" in user_message:
            return "As tarefas podem ter quatro níveis de prioridade: Baixa, Média, Alta e Urgente. Você pode definir a prioridade ao criar uma tarefa ou editá-la posteriormente. As tarefas são codificadas por cores de acordo com sua prioridade para fácil identificação."
        
        # Task filtering responses
        elif "filtrar" in user_message or "buscar tarefa" in user_message:
            return "Para filtrar tarefas, use os controles de filtro na parte superior da página de Tarefas. Você pode filtrar por status, prioridade, categoria, responsável e data de vencimento. Também há uma barra de pesquisa para encontrar tarefas por título ou descrição."
        
        # Task statistics responses
        elif "estatística" in user_message or "relatório" in user_message:
            return "As estatísticas de tarefas estão disponíveis na parte superior da página de Tarefas. Você pode ver o total de tarefas, tarefas concluídas, tarefas atrasadas e a taxa de conclusão. Também há gráficos mostrando a distribuição de tarefas por status e prioridade."
        
        # Default response
        else:
            return "Posso explicar como usar qualquer funcionalidade do sistema de gerenciamento de tarefas. Pergunte-me sobre criar tarefas, atribuir tarefas, alterar status, definir prioridades, filtrar tarefas ou ver estatísticas."
