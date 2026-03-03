"""
Zion Export Manager - Gerenciador de sincronização de dados
Este script permite executar todos os scripts de exportação simultaneamente
ou individualmente.
"""

import subprocess
import sys
import os
import signal
import time
from datetime import datetime

# Lista de scripts de exportação disponíveis
EXPORT_SCRIPTS = {
    "1": {
        "name": "Cliente (Lead)",
        "file": "zionexport.py",
        "description": "Sincroniza tabela cliente -> lead"
    },
    "2": {
        "name": "Atributos (Contratos)",
        "file": "zionexportatributes.py",
        "description": "Sincroniza contratos e arquivos de clientes"
    },
    "3": {
        "name": "Infos (Suporte)",
        "file": "zionexportinfos.py",
        "description": "Sincroniza chamados, eventos e usuários"
    }
}

processes = []

def signal_handler(sig, frame):
    """Trata o sinal de interrupção (Ctrl+C)"""
    print("\n\n⚠ Interrupção detectada! Finalizando processos...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except:
            proc.kill()
    print("✓ Todos os processos foram finalizados.")
    sys.exit(0)


def run_script(script_file):
    """Executa um script Python"""
    script_path = os.path.join(os.path.dirname(__file__), script_file)
    if not os.path.exists(script_path):
        print(f"❌ Erro: Arquivo {script_file} não encontrado!")
        return None
    
    try:
        proc = subprocess.Popen(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        return proc
    except Exception as e:
        print(f"❌ Erro ao iniciar {script_file}: {str(e)}")
        return None


def run_all():
    """Executa todos os scripts de exportação simultaneamente"""
    print("=" * 60)
    print("🚀 INICIANDO TODOS OS EXPORTADORES")
    print("=" * 60)
    
    for key, script in EXPORT_SCRIPTS.items():
        print(f"\n📦 Iniciando: {script['name']}")
        print(f"   {script['description']}")
        proc = run_script(script['file'])
        if proc:
            processes.append(proc)
            print(f"   ✓ Processo iniciado (PID: {proc.pid})")
        else:
            print(f"   ❌ Falha ao iniciar")
    
    if not processes:
        print("\n❌ Nenhum processo foi iniciado com sucesso!")
        return
    
    print("\n" + "=" * 60)
    print(f"✓ {len(processes)} processos em execução")
    print("=" * 60)
    print("\n💡 Pressione Ctrl+C para parar todos os processos\n")
    
    # Monitora os processos
    try:
        while True:
            time.sleep(1)
            # Verifica se algum processo terminou
            for proc in processes[:]:
                if proc.poll() is not None:
                    print(f"\n⚠ Processo {proc.pid} terminou inesperadamente!")
                    processes.remove(proc)
            
            if not processes:
                print("\n❌ Todos os processos foram encerrados!")
                break
                
    except KeyboardInterrupt:
        pass


def run_individual():
    """Permite escolher e executar scripts individualmente"""
    print("\n" + "=" * 60)
    print("📋 ESCOLHA OS EXPORTADORES PARA EXECUTAR")
    print("=" * 60)
    
    for key, script in EXPORT_SCRIPTS.items():
        print(f"\n[{key}] {script['name']}")
        print(f"    {script['description']}")
    
    print("\n[0] Voltar ao menu principal")
    print("=" * 60)
    
    choices = input("\n👉 Digite os números separados por vírgula (ex: 1,2): ").strip()
    
    if choices == "0":
        return
    
    selected = [c.strip() for c in choices.split(",") if c.strip() in EXPORT_SCRIPTS]
    
    if not selected:
        print("❌ Nenhuma opção válida selecionada!")
        return
    
    print("\n" + "=" * 60)
    print("🚀 INICIANDO EXPORTADORES SELECIONADOS")
    print("=" * 60)
    
    for key in selected:
        script = EXPORT_SCRIPTS[key]
        print(f"\n📦 Iniciando: {script['name']}")
        proc = run_script(script['file'])
        if proc:
            processes.append(proc)
            print(f"   ✓ Processo iniciado (PID: {proc.pid})")
        else:
            print(f"   ❌ Falha ao iniciar")
    
    if not processes:
        print("\n❌ Nenhum processo foi iniciado com sucesso!")
        return
    
    print("\n" + "=" * 60)
    print(f"✓ {len(processes)} processos em execução")
    print("=" * 60)
    print("\n💡 Pressione Ctrl+C para parar todos os processos\n")
    
    # Monitora os processos
    try:
        while True:
            time.sleep(1)
            for proc in processes[:]:
                if proc.poll() is not None:
                    print(f"\n⚠ Processo {proc.pid} terminou inesperadamente!")
                    processes.remove(proc)
            
            if not processes:
                print("\n❌ Todos os processos foram encerrados!")
                break
                
    except KeyboardInterrupt:
        pass


def show_menu():
    """Exibe o menu principal"""
    print("\n" + "=" * 60)
    print("🔄 ZION EXPORT MANAGER")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print("\n[1] Executar TODOS os exportadores")
    print("[2] Executar exportadores individuais")
    print("[3] Ver status dos exportadores")
    print("[0] Sair")
    print("\n" + "=" * 60)


def show_status():
    """Mostra o status dos arquivos de estado"""
    print("\n" + "=" * 60)
    print("📊 STATUS DOS EXPORTADORES")
    print("=" * 60)
    
    state_files = {
        "zionexport_state.json": "Cliente (Lead)",
        "zionexportatributes_state.json": "Atributos (Contratos)",
        "zionexportinfos_state.json": "Infos (Suporte)"
    }
    
    for state_file, name in state_files.items():
        path = os.path.join(os.path.dirname(__file__), state_file)
        print(f"\n📦 {name}")
        if os.path.exists(path):
            try:
                import json
                with open(path, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                print(f"   ✓ Arquivo de estado encontrado")
                if isinstance(state, dict):
                    if "last_sync" in state:
                        # Formato do zionexport.py
                        print(f"   🕐 Última sincronização: {state.get('last_sync', 'Nunca')}")
                    else:
                        # Formato dos outros exportadores
                        for table, info in state.items():
                            last_sync = info.get('last_sync', 'Nunca')
                            print(f"   📋 {table}: {last_sync}")
            except Exception as e:
                print(f"   ⚠ Erro ao ler arquivo: {str(e)}")
        else:
            print(f"   ⚠ Ainda não foi executado (nenhum estado salvo)")
    
    print("\n" + "=" * 60)
    input("\n👉 Pressione ENTER para voltar ao menu...")


def main():
    """Função principal"""
    # Registra o handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    while True:
        show_menu()
        choice = input("👉 Escolha uma opção: ").strip()
        
        if choice == "0":
            print("\n👋 Encerrando...")
            break
        elif choice == "1":
            run_all()
            processes.clear()
        elif choice == "2":
            run_individual()
            processes.clear()
        elif choice == "3":
            show_status()
        else:
            print("\n❌ Opção inválida! Tente novamente.")
            time.sleep(1)


if __name__ == "__main__":
    main()
