"""
Start All CRUD APIs - Inicia todos os servidores de API CRUD
Executa lead.py, leadatributes.py e leadinfos.py simultaneamente
"""

import subprocess
import sys
import time
import webbrowser
from threading import Thread

def start_server(script_name, port):
    """Inicia um servidor Python"""
    print(f"\n🚀 Iniciando {script_name} na porta {port}...")
    try:
        process = subprocess.Popen(
            [sys.executable, script_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Monitora output
        for line in process.stdout:
            print(f"[{script_name}] {line.strip()}")
        
        return process
    except Exception as e:
        print(f"❌ Erro ao iniciar {script_name}: {e}")
        return None


def open_browser():
    """Abre o navegador após 3 segundos"""
    time.sleep(3)
    print("\n🌐 Abrindo navegador...")
    webbrowser.open('http://localhost:5001/static/crud.html')


if __name__ == '__main__':
    print("=" * 70)
    print(" " * 15 + "🚀 ZION CRM - CRUD APIs Completo")
    print("=" * 70)
    print("\n📡 Este script vai iniciar 3 APIs simultâneas:\n")
    print("  1️⃣  lead.py          - Porta 5001 - API de Leads")
    print("  2️⃣  leadatributes.py - Porta 5002 - API de Contratos/Arquivos")
    print("  3️⃣  leadinfos.py     - Porta 5003 - API de Suporte/Usuários")
    print("\n" + "=" * 70)
    print("⚠️  IMPORTANTE: Certifique-se de que as portas 5001-5003 estão livres!")
    print("=" * 70 + "\n")
    
    input("Pressione ENTER para iniciar os servidores...")
    
    processes = []
    
    # Inicia servidores em threads separadas
    servers = [
        ('lead.py', 5001),
        ('leadatributes.py', 5002),
        ('leadinfos.py', 5003)
    ]
    
    for script, port in servers:
        thread = Thread(target=start_server, args=(script, port), daemon=True)
        thread.start()
        time.sleep(1)  # Aguarda 1 segundo entre cada início
    
    # Abre navegador
    browser_thread = Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    print("\n" + "=" * 70)
    print("✅ Todos os servidores foram iniciados!")
    print("=" * 70)
    print("\n📌 URLs disponíveis:")
    print("\n  🌐 Frontend CRUD: http://localhost:5001/static/crud.html")
    print("\n  📡 API Leads:      http://localhost:5001/api/leads")
    print("  📡 API Attributes: http://localhost:5002/api/contratos")
    print("  📡 API Infos:      http://localhost:5003/api/chamados")
    print("\n" + "=" * 70)
    print("⏹️  Pressione CTRL+C para parar todos os servidores")
    print("=" * 70 + "\n")
    
    try:
        # Mantém o script rodando
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Encerrando servidores...")
        for process in processes:
            if process:
                process.terminate()
        print("✅ Todos os servidores foram encerrados!")
        sys.exit(0)
