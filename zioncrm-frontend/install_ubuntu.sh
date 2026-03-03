#!/bin/bash

echo "ZionCRM - Script de Instalação para Ubuntu"
echo "=========================================="
echo

# Verifica se o script está sendo executado como root
if [ "$EUID" -ne 0 ]; then
  echo "Por favor, execute este script como root ou usando sudo."
  exit 1
fi

# Atualiza os repositórios
echo "Atualizando repositórios..."
apt-get update

# Instala dependências do sistema
echo "Instalando dependências do sistema..."
apt-get install -y python3 python3-pip python3-venv python3-dev build-essential libssl-dev libffi-dev curl

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python não está instalado. Por favor, instale Python 3.8 ou superior."
    echo "Você pode instalá-lo com: sudo apt-get update && sudo apt-get install python3 python3-pip python3-venv"
    exit 1
fi

# Verifica se o pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "pip não está instalado. Instalando..."
    apt-get install -y python3-pip
fi

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não está instalado. Instalando Node.js 16.x..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
fi

# Verifica se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm não está instalado. Instalando..."
    apt-get install -y npm
fi

# Cria ambiente virtual
echo "Criando ambiente virtual..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Falha ao criar ambiente virtual."
    exit 1
fi

# Ativa ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Falha ao ativar ambiente virtual."
    exit 1
fi

# Atualiza pip
echo "Atualizando pip..."
pip install --upgrade pip
if [ $? -ne 0 ]; then
    echo "Falha ao atualizar pip."
    exit 1
fi

# Instala dependências do Python
echo "Instalando dependências do Python..."
pip install -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo "Falha ao instalar dependências."
    exit 1
fi

# Cria diretório de uploads
echo "Criando diretório de uploads..."
mkdir -p uploads
chmod 755 uploads
if [ $? -ne 0 ]; then
    echo "Falha ao criar diretório de uploads."
    exit 1
fi

# Inicializa banco de dados
echo "Inicializando banco de dados SQLite..."
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
if [ $? -ne 0 ]; then
    echo "Falha ao inicializar banco de dados."
    exit 1
fi

# Cria usuário administrador inicial
echo "Criando usuário administrador inicial..."
python -c "from app import app, db; from models.user import User; app.app_context().push(); admin = User(username='admin', email='admin@example.com', first_name='Admin', last_name='User', is_active=True, is_admin=True); admin.set_password('admin'); db.session.add(admin); db.session.commit()"
if [ $? -ne 0 ]; then
    echo "Falha ao criar usuário administrador."
    exit 1
fi

# Inicializa dados padrão
echo "Inicializando dados padrão..."
python init_data.py
if [ $? -ne 0 ]; then
    echo "Falha ao inicializar dados padrão."
    exit 1
fi

cd ..

# Instala dependências do frontend
echo "Instalando dependências do frontend..."
npm install
if [ $? -ne 0 ]; then
    echo "Falha ao instalar dependências do frontend."
    exit 1
fi

# Constrói o frontend
echo "Construindo o frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Falha ao construir o frontend."
    exit 1
fi

# Instala e configura o Nginx
echo "Instalando e configurando Nginx..."
apt-get install -y nginx

# Configura o Nginx
echo "Configurando Nginx para ZionCRM..."
cat > /etc/nginx/sites-available/zioncrm << EOF
server {
    listen 80;
    server_name localhost;

    root $PROJECT_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Configuração para WebSocket (para chat e notificações em tempo real)
    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Habilita o site
ln -sf /etc/nginx/sites-available/zioncrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testa configuração do Nginx
nginx -t
if [ $? -ne 0 ]; then
    echo "Teste de configuração do Nginx falhou."
    exit 1
fi

# Reinicia o Nginx
systemctl restart nginx
if [ $? -ne 0 ]; then
    echo "Falha ao reiniciar Nginx."
    exit 1
fi

# Cria serviço systemd para o backend
echo "Criando serviço systemd para o backend..."
cat > /etc/systemd/system/zioncrm.service << EOF
[Unit]
Description=ZionCRM Backend
After=network.target

[Service]
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/venv/bin/python $(pwd)/backend/app.py
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=zioncrm
Environment="PATH=$PROJECT_DIR/venv"

[Install]
WantedBy=multi-user.target
EOF

# Recarrega configurações do systemd
systemctl daemon-reload

# Inicia e habilita o serviço
systemctl enable zioncrm.service
systemctl start zioncrm.service

echo
echo "Instalação concluída com sucesso!"
echo
echo "O ZionCRM está rodando em: http://localhost"
echo
echo "Credenciais de administrador padrão:"
echo "Usuário: admin"
echo "Senha: admin"
echo
echo "IMPORTANTE: Altere a senha do administrador após o primeiro login!"
echo
echo "Para gerenciar o serviço do backend:"
echo "  PATH=$(pwd)/venv/bin"
echo "  - Iniciar: sudo systemctl start zioncrm"
echo "  - Parar: sudo systemctl stop zioncrm"
echo "  - Reiniciar: sudo systemctl restart zioncrm"
echo "  - Status: sudo systemctl status zioncrm"
echo
echo "Para visualizar logs do backend:"
echo "  sudo journalctl -u zioncrm"
echo "O sistema ZionCRM está rodando em: http://localhost"
echo

exit 0