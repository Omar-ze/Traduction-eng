<#
    deploy.ps1 - Script de déploiement WildFly pour Windows
    Usage: .\deploy.ps1
    Prérequis: WildFly démarré sur localhost:9990
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉPLOIEMENT WILDFLY - WINDOWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$WILDFLY_HOME = "C:\Users\omar\Downloads\wildfly-39.0.0.Final\wildfly-39.0.0.Final"
$PROJECT_HOME = "C:\Users\omar\Desktop\wisd\XML\rojet2\projet-traduction"
$WAR_FILE = "$PROJECT_HOME\backend\target\translator-service.war"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  WildFly: $WILDFLY_HOME"
Write-Host "  Projet: $PROJECT_HOME"
Write-Host "  WAR: $WAR_FILE"
Write-Host ""

# Vérifications
if (-not (Test-Path $WILDFLY_HOME)) {
    Write-Host "❌ ERREUR: WildFly non trouvé à $WILDFLY_HOME" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $WAR_FILE)) {
    Write-Host "❌ ERREUR: Fichier WAR non trouvé: $WAR_FILE" -ForegroundColor Red
    Write-Host "Exécute d'abord: mvn clean package dans le dossier backend" -ForegroundColor Yellow
    exit 1
}

# 1. Vérifier que WildFly est démarré
Write-Host "1. Vérification de WildFly..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9990" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   ✅ WildFly démarré" -ForegroundColor Green
} catch {
    Write-Host "   ❌ WildFly non démarré ou inaccessible sur localhost:9990" -ForegroundColor Red
    Write-Host "   Démarrez WildFly avec: $WILDFLY_HOME\bin\standalone.bat" -ForegroundColor Yellow
    exit 1
}

# 2. Créer la datasource H2 (si elle n'existe pas)
Write-Host "2. Configuration de la datasource..." -ForegroundColor Yellow
try {
    $datasourceCheck = & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=datasources/data-source=TranslatorDS:read-resource" 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Datasource TranslatorDS existe déjà" -ForegroundColor Green
    } else {
        Write-Host "   Création de la datasource TranslatorDS..." -ForegroundColor Gray
        & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=datasources/data-source=TranslatorDS:add(jndi-name=java:jboss/datasources/TranslatorDS, driver-name=h2, connection-url=`"jdbc:h2:mem:translator;DB_CLOSE_DELAY=-1`", user-name=sa, password=sa)"

        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Datasource créée avec succès" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Erreur création datasource (peut-être déjà existante)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la configuration de la datasource" -ForegroundColor Yellow
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Gray
}

# 3. Créer les utilisateurs
Write-Host "3. Création des utilisateurs..." -ForegroundColor Yellow
try {
    # Créer le realm
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:add(path=translator-users, relative-to=jboss.server.config.dir)"

    # Créer user1
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:add-identity(identity=user1)"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:set-password(identity=user1, clear={password=`"userpass`"})"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:add-identity-attribute(identity=user1, name=Roles, value=[`"USER`"])"

    # Créer admin
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:add-identity(identity=admin)"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:set-password(identity=admin, clear={password=`"adminpass`"})"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/filesystem-realm=translator-realm:add-identity-attribute(identity=admin, name=Roles, value=[`"USER`",`"ADMIN`"])"

    Write-Host "   ✅ Utilisateurs créés:" -ForegroundColor Green
    Write-Host "      user1 / userpass (ROLE: USER)" -ForegroundColor Gray
    Write-Host "      admin / adminpass (ROLES: USER, ADMIN)" -ForegroundColor Gray

} catch {
    Write-Host "   ⚠️  Erreur lors de la création des utilisateurs" -ForegroundColor Yellow
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Gray
}

# 4. Configurer le security domain
Write-Host "4. Configuration de la sécurité..." -ForegroundColor Yellow
try {
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=elytron/security-domain=translator-domain:add(default-realm=translator-realm, permission-mapper=default-permission-mapper, realms=[{realm=translator-realm}])"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=undertow/application-security-domain=translator-domain:add"
    Write-Host "   ✅ Security domain configuré" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur configuration security domain" -ForegroundColor Yellow
}

# 5. Activer CORS
Write-Host "5. Activation CORS..." -ForegroundColor Yellow
try {
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=undertow/configuration=filter/response-header=Access-Control-Allow-Origin:add(header-name=Access-Control-Allow-Origin, header-value=*)"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=undertow/configuration=filter/response-header=Access-Control-Allow-Methods:add(header-name=Access-Control-Allow-Methods, header-value=GET,POST,PUT,DELETE,OPTIONS)"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=undertow/server=default-server/host=default-host/filter-ref=Access-Control-Allow-Origin:add"
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="/subsystem=undertow/server=default-server/host=default-host/filter-ref=Access-Control-Allow-Methods:add"
    Write-Host "   ✅ CORS activé" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur activation CORS" -ForegroundColor Yellow
}

# 6. Déployer l'application
Write-Host "6. Déploiement de l'application..." -ForegroundColor Yellow
try {
    & "$WILDFLY_HOME\bin\jboss-cli.bat" --connect --command="deploy `"$WAR_FILE`" --force"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Application déployée avec succès!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Échec du déploiement" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du déploiement: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérifier le déploiement
Write-Host "7. Vérification du déploiement..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/translator-service/api/translator/status" -Method Get -ErrorAction Stop
    Write-Host "   ✅ API accessible: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  API non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs d'accès:" -ForegroundColor Cyan
Write-Host "  • API REST:    http://localhost:8080/translator-service" -ForegroundColor White
Write-Host "  • Statut API:  http://localhost:8080/translator-service/api/translator/status" -ForegroundColor White
Write-Host "  • Console Admin: http://localhost:9990" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Identifiants de test:" -ForegroundColor Cyan
Write-Host "  • user1 / userpass (ROLE_USER)" -ForegroundColor White
Write-Host "  • admin / adminpass (ROLE_USER, ROLE_ADMIN)" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Pour tester:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:8080/translator-service/api/translator/status" -ForegroundColor Gray
Write-Host "  curl -X POST http://localhost:8080/translator-service/api/translator/translate \`" -ForegroundColor Gray
Write-Host "    -u user1:userpass \`" -ForegroundColor Gray
Write-Host "    -d `"text=Hello world`"" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green

# Attendre une entrée utilisateur
Read-Host "Appuyez sur Entrée pour quitter"