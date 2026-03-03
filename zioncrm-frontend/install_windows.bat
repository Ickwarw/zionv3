@echo off
echo ZionCRM - Script de Instalacao para Windows
echo ==========================================
echo.

REM Verifica se o Python está instalado
echo Verificando instalacao do Python...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python nao esta instalado. Por favor, instale Python 3.8 ou superior.
    echo Voce pode baixa-lo em https://www.python.org/downloads/
    exit /b 1
)

REM Verifica se o pip está instalado
echo Verificando instalacao do pip...
python -m pip --version > nul 2>&1
if %errorlevel% neq 0 (
    echo pip nao esta instalado. Por favor, instale pip.
    exit /b 1
)

REM Verifica se o Node.js está instalado
echo Verificando instalacao do Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao esta instalado. Por favor, instale Node.js 14 ou superior.
    echo Voce pode baixa-lo em https://nodejs.org/
    exit /b 1
)

REM Verifica se o npm está instalado
echo Verificando instalacao do npm...
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo npm nao esta instalado. Por favor, instale npm.
    exit /b 1
)

REM Cria ambiente virtual
echo Criando ambiente virtual...
python -m venv venv
if %errorlevel% neq 0 (
    echo Falha ao criar ambiente virtual.
    exit /b 1
)

REM Ativa ambiente virtual
echo Ativando ambiente virtual...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Falha ao ativar ambiente virtual.
    exit /b 1
)

REM Atualiza pip
echo Atualizando pip...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo Falha ao atualizar pip.
    exit /b 1
)

REM Instala dependências
echo Instalando dependencias do Python...
pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo Falha ao instalar dependencias.
    exit /b 1
)

REM Cria diretório de uploads
echo Criando diretorio de uploads...
mkdir uploads
if %errorlevel% neq 0 (
    echo Falha ao criar diretorio de uploads.
    exit /b 1
)

REM Inicializa banco de dados
echo Inicializando banco de dados SQLite...
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
if %errorlevel% neq 0 (
    echo Falha ao inicializar banco de dados.
    exit /b 1
)

REM Cria usuário administrador inicial
echo Criando usuario administrador inicial...
python -c "from app import app, db; from models.user import User; app.app_context().push(); admin = User(username='admin', email='admin@example.com', first_name='Admin', last_name='User', is_active=True, is_admin=True); admin.set_password('admin'); db.session.add(admin); db.session.commit()"
if %errorlevel% neq 0 (
    echo Falha ao criar usuario administrador.
    exit /b 1
)

REM Inicializa dados padrão
echo Inicializando dados padrao...
python init_data.py
if %errorlevel% neq 0 (
    echo Falha ao inicializar dados padrao.
    exit /b 1
)

cd ..

REM Instala dependências do frontend
echo Instalando dependencias do frontend...
npm install
if %errorlevel% neq 0 (
    echo Falha ao instalar dependencias do frontend.
    exit /b 1
)

REM Constrói o frontend
echo Construindo o frontend...
npm run build
if %errorlevel% neq 0 (
    echo Falha ao construir o frontend.
    exit /b 1
)

REM Instala e configura o Apache
echo Verificando instalacao do Apache...
where httpd > nul 2>&1
if %errorlevel% neq 0 (
    echo Apache nao esta instalado. Instalando Apache...
    
    REM Baixa o Apache
    echo Baixando Apache...
    powershell -Command "Invoke-WebRequest -Uri 'https://www.apachelounge.com/download/VS16/binaries/httpd-2.4.54-win64-VS16.zip' -OutFile 'apache.zip'"
    if %errorlevel% neq 0 (
        echo Falha ao baixar Apache. Tentando metodo alternativo...
        curl -o apache.zip https://www.apachelounge.com/download/VS16/binaries/httpd-2.4.54-win64-VS16.zip
        if %errorlevel% neq 0 (
            echo Falha ao baixar Apache. Por favor, instale manualmente.
            echo Voce pode baixa-lo em https://www.apachelounge.com/download/
            goto skip_apache
        )
    )
    
    REM Extrai o Apache
    echo Extraindo Apache...
    powershell -Command "Expand-Archive -Path 'apache.zip' -DestinationPath 'C:\Apache24' -Force"
    if %errorlevel% neq 0 (
        echo Falha ao extrair Apache. Por favor, extraia manualmente o arquivo apache.zip para C:\Apache24
        goto skip_apache
    )
    
    REM Configura o Apache
    echo Configurando Apache...
    echo ^<VirtualHost *:80^> > C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     ServerName localhost >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     DocumentRoot "%cd%\dist" >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     ^<Directory "%cd%\dist"^> >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo         Options Indexes FollowSymLinks >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo         AllowOverride All >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo         Require all granted >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     ^</Directory^> >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     ProxyPass /api http://localhost:5000/api >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo     ProxyPassReverse /api http://localhost:5000/api >> C:\Apache24\conf\extra\httpd-vhosts.conf
    echo ^</VirtualHost^> >> C:\Apache24\conf\extra\httpd-vhosts.conf
    
    REM Atualiza httpd.conf para incluir vhosts e módulos necessários
    echo LoadModule proxy_module modules/mod_proxy.so >> C:\Apache24\conf\httpd.conf
    echo LoadModule proxy_http_module modules/mod_proxy_http.so >> C:\Apache24\conf\httpd.conf
    echo Include conf/extra/httpd-vhosts.conf >> C:\Apache24\conf\httpd.conf
    
    REM Instala o Apache como um serviço
    echo Instalando Apache como um servico...
    C:\Apache24\bin\httpd.exe -k install
    if %errorlevel% neq 0 (
        echo Falha ao instalar Apache como servico. Por favor, execute como administrador.
        goto skip_apache
    )
    
    REM Inicia o serviço do Apache
    echo Iniciando servico do Apache...
    net start Apache2.4
    if %errorlevel% neq 0 (
        echo Falha ao iniciar servico do Apache. Por favor, inicie manualmente.
        goto skip_apache
    )
) else (
    echo Apache ja esta instalado. Configurando para ZionCRM...
    
    REM Configura o Apache
    echo Configurando Apache...
    echo ^<VirtualHost *:80^> > %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     ServerName localhost >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     DocumentRoot "%cd%\dist" >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     ^<Directory "%cd%\dist"^> >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo         Options Indexes FollowSymLinks >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo         AllowOverride All >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo         Require all granted >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     ^</Directory^> >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     ProxyPass /api http://localhost:5000/api >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo     ProxyPassReverse /api http://localhost:5000/api >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    echo ^</VirtualHost^> >> %APACHE_HOME%\conf\extra\httpd-vhosts.conf
    
    REM Reinicia o serviço do Apache
    echo Reiniciando servico do Apache...
    net stop Apache2.4
    net start Apache2.4
    if %errorlevel% neq 0 (
        echo Falha ao reiniciar servico do Apache. Por favor, reinicie manualmente.
    )
)

:skip_apache
echo.
echo Instalacao concluida com sucesso!
echo.
echo Para iniciar a aplicacao:
echo 1. Ative o ambiente virtual: venv\Scripts\activate
echo 2. Inicie o backend: python backend\app.py
echo 3. Acesse a aplicacao em http://localhost
echo.
echo Credenciais de administrador padrao:
echo Usuario: admin
echo Senha: admin
echo.
echo IMPORTANTE: Altere a senha do administrador apos o primeiro login!
echo.

exit /b 0