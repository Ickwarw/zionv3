# =============================================================================
# RAIZEN - CONFIGURAÇÃO DE API KEYS
# =============================================================================
# 
# Este script auxilia na configuração das chaves de API necessárias para
# o funcionamento do assistente Raizen.
#
# Execute este script para configurar as variáveis de ambiente automaticamente.
# =============================================================================

import os
import sys
import platform

def clear_screen():
    """Limpa a tela do terminal"""
    os.system('cls' if platform.system() == 'Windows' else 'clear')

def print_header():
    """Imprime o cabeçalho"""
    print("=" * 70)
    print(" " * 20 + "RAIZEN - CONFIGURAÇÃO")
    print("=" * 70)
    print()

def get_api_key(provider_name, env_var_name):
    """Solicita a API key do usuário"""
    print(f"\n{provider_name}")
    print("-" * 70)
    current_key = os.getenv(env_var_name, "")
    
    if current_key:
        masked_key = current_key[:8] + "..." + current_key[-4:] if len(current_key) > 12 else "***"
        print(f"Chave atual: {masked_key}")
        change = input("Deseja alterar? (s/N): ").strip().lower()
        if change != 's':
            return current_key
    
    print(f"\nCole sua API Key do {provider_name}:")
    print("(Deixe em branco para pular)")
    key = input("> ").strip()
    
    return key if key else current_key

def save_windows_env(var_name, value):
    """Salva variável de ambiente no Windows (permanente)"""
    try:
        os.system(f'setx {var_name} "{value}"')
        return True
    except:
        return False

def generate_env_file(keys):
    """Gera arquivo .env com as chaves"""
    with open('.env', 'w') as f:
        f.write("# API Keys para Raizen Assistant\n")
        f.write("# Gerado automaticamente\n\n")
        for key, value in keys.items():
            if value:
                f.write(f'{key}="{value}"\n')

def generate_batch_file(keys):
    """Gera arquivo batch para Windows"""
    with open('setup_raizen_keys.bat', 'w') as f:
        f.write("@echo off\n")
        f.write("echo Configurando API Keys do Raizen...\n")
        for key, value in keys.items():
            if value:
                f.write(f'setx {key} "{value}"\n')
        f.write("echo.\n")
        f.write("echo API Keys configuradas com sucesso!\n")
        f.write("pause\n")

def generate_shell_script(keys):
    """Gera script shell para Linux/Mac"""
    with open('setup_raizen_keys.sh', 'w') as f:
        f.write("#!/bin/bash\n\n")
        f.write("echo 'Configurando API Keys do Raizen...'\n\n")
        for key, value in keys.items():
            if value:
                f.write(f'export {key}="{value}"\n')
        f.write("\necho 'API Keys configuradas na sessão atual!'\n")
        f.write("echo 'Para tornar permanente, adicione as linhas acima ao seu ~/.bashrc ou ~/.zshrc'\n")
    
    # Torna executável
    try:
        os.chmod('setup_raizen_keys.sh', 0o755)
    except:
        pass

def test_api_keys():
    """Testa se as API Keys estão configuradas"""
    print("\n" + "=" * 70)
    print("VERIFICANDO CONFIGURAÇÃO")
    print("=" * 70)
    
    keys = {
        'OPENAI_API_KEY': 'OpenAI',
        'GOOGLE_API_KEY': 'Google',
        'ANTHROPIC_API_KEY': 'Anthropic'
    }
    
    configured = 0
    for var, name in keys.items():
        value = os.getenv(var, "")
        status = "✓ Configurada" if value else "✗ Não configurada"
        print(f"{name:15} {status}")
        if value:
            configured += 1
    
    print()
    if configured == 0:
        print("⚠ Nenhuma API Key configurada. Configure pelo menos uma.")
    elif configured < 3:
        print(f"✓ {configured}/3 API Keys configuradas.")
        print("  Configure as demais para acesso completo a todos os modelos.")
    else:
        print("✓ Todas as API Keys configuradas!")
    
    return configured > 0

def show_instructions():
    """Mostra instruções de onde obter as API Keys"""
    print("\n" + "=" * 70)
    print("ONDE OBTER AS API KEYS")
    print("=" * 70)
    print()
    print("OpenAI (ChatGPT):")
    print("  → https://platform.openai.com/api-keys")
    print()
    print("Google (Gemini):")
    print("  → https://makersuite.google.com/app/apikey")
    print()
    print("Anthropic (Claude):")
    print("  → https://console.anthropic.com/account/keys")
    print()
    input("Pressione Enter para continuar...")

def main():
    """Função principal"""
    clear_screen()
    print_header()
    
    print("Este assistente vai ajudá-lo a configurar as API Keys do Raizen.")
    print()
    print("Você precisará de pelo menos uma das seguintes chaves:")
    print("  • OpenAI (ChatGPT)")
    print("  • Google (Gemini)")
    print("  • Anthropic (Claude)")
    print()
    
    choice = input("Deseja ver onde obter as API Keys? (s/N): ").strip().lower()
    if choice == 's':
        show_instructions()
        clear_screen()
        print_header()
    
    # Coleta as API Keys
    keys = {
        'OPENAI_API_KEY': get_api_key("OpenAI (ChatGPT)", 'OPENAI_API_KEY'),
        'GOOGLE_API_KEY': get_api_key("Google (Gemini)", 'GOOGLE_API_KEY'),
        'ANTHROPIC_API_KEY': get_api_key("Anthropic (Claude)", 'ANTHROPIC_API_KEY')
    }
    
    # Filtra keys vazias
    keys = {k: v for k, v in keys.items() if v}
    
    if not keys:
        print("\n⚠ Nenhuma API Key foi configurada.")
        print("O Raizen não funcionará sem pelo menos uma API Key.")
        return
    
    # Salva as configurações
    print("\n" + "=" * 70)
    print("SALVANDO CONFIGURAÇÕES")
    print("=" * 70)
    
    # Gera arquivo .env
    generate_env_file(keys)
    print("✓ Arquivo .env criado")
    
    # Configura variáveis de ambiente da sessão atual
    for key, value in keys.items():
        os.environ[key] = value
    print("✓ Variáveis de ambiente configuradas na sessão atual")
    
    # Gera scripts de configuração
    if platform.system() == 'Windows':
        generate_batch_file(keys)
        print("✓ Arquivo setup_raizen_keys.bat criado")
        print("  Execute-o para configurar permanentemente no Windows")
    else:
        generate_shell_script(keys)
        print("✓ Arquivo setup_raizen_keys.sh criado")
        print("  Execute-o com: source ./setup_raizen_keys.sh")
    
    # Testa configuração
    test_api_keys()
    
    print("\n" + "=" * 70)
    print("PRÓXIMOS PASSOS")
    print("=" * 70)
    print()
    print("1. As API Keys estão configuradas para esta sessão")
    print("2. Para tornar permanente:")
    if platform.system() == 'Windows':
        print("   → Execute: setup_raizen_keys.bat")
    else:
        print("   → Execute: source ./setup_raizen_keys.sh")
        print("   → Adicione ao seu ~/.bashrc ou ~/.zshrc")
    print()
    print("3. Execute o Raizen:")
    print("   → python raizen_exemplo_uso.py")
    print()
    print("=" * 70)
    
    input("\nPressione Enter para finalizar...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Configuração cancelada pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        input("\nPressione Enter para sair...")
        sys.exit(1)
