"""
Zion Full Stack - Inicia API e Exportadores Juntos
Execute este script para rodar todo o sistema de uma vez
"""

import subprocess
import sys
import os
import time
import webbrowser
from threading import Thread

processes = []

def start_api():
    """Inicia a API Flask"""
    print("🚀 Iniciando API Flask...")
    script_path = os.path.join(os.path.dirname(__file__), "zionapi.py")
    proc = subprocess.Popen(
        [sys.executable, script_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(("API", proc))
    
    # Aguarda API iniciar
    time.sleep(3)
    
    # Abre dashboard no navegador
    print("🌐 Abrindo dashboard no navegador...")
    webbrowser.open("http://localhost:5000")


def start_export(script_name, display_name):
    """Inicia um script de exportação"""
    print(f"📦 Iniciando {display_name}...")
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    proc = subprocess.Popen(
        [sys.executable, script_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append((display_name, proc))


def monitor_output(name, proc):
    """Monitora output de um processo"""
    try:
        for line in proc.stdout:
            print(f"[{name}] {line.rstrip()}")
    except:
        pass


def main():
    """Função principal"""
    print("=" * 70)
    print("🔄 ZION FULL STACK - Sistema Completo de Sincronização")
    print("=" * 70)
    print()
    print("Este script irá iniciar:")
    print("  1. API Flask com Dashboard Web (porta 5000)")
    print("  2. API Lead (porta 5001)")
    print("  3. API Lead Attributes (porta 5002)")
    print("  4. API Lead Infos (porta 5003)")
    print("  5. API Dashboard (porta 5004)")
    print("  6. Exportador de Clientes (zionexport)")
    print("  7. Exportador de Contratos (zionexportatributes)")
    print("  8. Exportador de Suporte (zionexportinfos)")
    print()
    print("=" * 70)
    print()
    
    input("👉 Pressione ENTER para continuar ou Ctrl+C para cancelar...")
    print()
    
    try:
        # Inicia API principal
        start_api()
        time.sleep(2)
        
        # Inicia APIs do sistema de Leads
        print("📊 Iniciando APIs do sistema de Leads...")
        start_export("lead.py", "API Lead (5001)")
        time.sleep(1)
        
        start_export("leadatributes.py", "API Lead Attributes (5002)")
        time.sleep(1)
        
        start_export("leadinfos.py", "API Lead Infos (5003)")
        time.sleep(1)
        
        # Inicia API do Dashboard
        print("📈 Iniciando API do Dashboard...")
        start_export("routes.py", "API Dashboard (5004)")
        time.sleep(1)
        
        # Inicia exportadores
        print("🔄 Iniciando exportadores...")
        start_export("zionexport.py", "Exportador Cliente")
        time.sleep(1)
        
        start_export("zionexportatributes.py", "Exportador Contratos")
        time.sleep(1)
        
        start_export("zionexportinfos.py", "Exportador Suporte")
        time.sleep(1)
        
        print()
        print("=" * 70)
        print("✅ TODOS OS PROCESSOS INICIADOS COM SUCESSO!")
        print("=" * 70)
        print()
        print("📊 Dashboard Principal:   http://localhost:5000")
        print("🎯 CRUD Leads:            http://localhost:5001/crud")
        print("📡 API Leads:             http://localhost:5001/api/")
        print("📡 API Attributes:        http://localhost:5002/api/")
        print("📡 API Infos:             http://localhost:5003/api/")
        print("📈 API Dashboard:         http://localhost:5004/api/")
        print()
        print("💡 Pressione Ctrl+C para parar todos os processos")
        print("=" * 70)
        print()
        
        # Monitora processos
        threads = []
        for name, proc in processes:
            thread = Thread(target=monitor_output, args=(name, proc), daemon=True)
            thread.start()
            threads.append(thread)
        
        # Mantém rodando
        while True:
            time.sleep(1)
            
            # Verifica se algum processo morreu
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"\n⚠️  AVISO: Processo '{name}' terminou inesperadamente!")
                    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupção detectada! Finalizando processos...")
        
        for name, proc in processes:
            try:
                print(f"   Finalizando {name}...")
                proc.terminate()
                proc.wait(timeout=5)
            except:
                proc.kill()
        
        print("\n✅ Todos os processos foram finalizados.")
        print("👋 Até logo!\n")


if __name__ == "__main__":
    main()
