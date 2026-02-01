@echo off
echo ========================================
echo  DEPLOIEMENT WILDFLY - WINDOWS
echo ========================================

echo 1. Configuration du datasource...
call "%JBOSS_HOME%\bin\jboss-cli.bat" --connect --file=configure.cli

echo 2. Creation des utilisateurs...
call "%JBOSS_HOME%\bin\jboss-cli.bat" --connect --file=create-users.cli

echo 3. Deploiement de l'application...
echo - En supposant que le WAR est dans ../backend/target/translator-service.war
if exist "..\backend\target\translator-service.war" (
    call "%JBOSS_HOME%\bin\jboss-cli.bat" --connect --command="deploy ..\backend\target\translator-service.war --force"
) else (
    echo ERREUR: Fichier WAR non trouve!
    echo Place-toi dans le dossier backend et execute: mvn clean package
)

echo.
echo ========================================
echo  DEPLOIEMENT TERMINE!
echo ========================================
echo URLs:
echo  - Application: http://localhost:8080/translator-service
echo  - Console Admin: http://localhost:9990
echo ========================================
pause