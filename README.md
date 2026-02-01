## 🌐  Traducteur Anglais ↔ Darija - API REST Java
Une application web Java complète de traduction entre l'anglais et le darija (arabe marocain), déployable
sur WildFly avec interface web et extension Chrome.

Ce projet fournit une solution complète de traduction bidirectionnelle anglais-darija implémentée comme une API REST Java avec :
    Backend : API REST sécurisée avec Jakarta EE
    Frontend : Interface web responsive en HTML/JavaScript
    Extension : Extension Chrome pour traductions rapides
    Authentification : Sécurité Basic Auth pour l'API
      Technique

    Backend : Java 17, Jakarta EE 9, JAX-RS (Jersey)

    Serveur : WildFly 26+ (compatible JBoss EAP)

    Build Tool : Maven 3.6+

    Frontend : HTML5, CSS3, Vanilla JavaScript

    Sécurité : Basic Auth, CORS, Headers de sécurité

    Format : JSON pour toutes les communications API

    Extension Chrome
    🪟 Sidepanel intégré dans Chrome
    ✨ Traduction instantanée depuis n'importe quelle page
    📋 Copie automatique des résultats dans le presse-papier

# Utilisation
    git clone https://github.com/Omar-ze/traduction.git
   
1. Interface Web
bash

# Lancer le serveur de développement frontend
cd php-client
python -m http.server 8000
# Accédez à: http://localhost:8000

2. Tester l'API
bash

# Test de santé de l'API
curl http://localhost:8080/translator/api/translate/test

# Traduction exemple
curl -X POST http://localhost:8080/translator/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=" \
  -d '{"text":"hello", "sourceLang":"en", "targetLang":"darija"}'

3. Extension Chrome

    Ouvrez chrome://extensions/

    Activez "Mode développeur"

    "Charger l'extension non empaquetée"

    Sélectionnez le dossier chrome-extension/
   
   🌍 Déploiement
Sur WildFly
bash

# 1. Démarrer WildFly
wildfly/bin/standalone.sh

# 2. Déployer l'application
cp target/translator.war wildfly/standalone/deployments/

# 3. Vérifier
http://localhost:8080/translator/api/translate/test



📁 Structure du Projet
text

translator-project/
│
├── pom.xml                                  
├── README.md                                    
│
├── src/main/java/com/translator/
│   ├── auth/                                    
│   │   ├── BasicAuth.java                       
│   │   ├── BasicAuthFilter.java                 
│   │   └── UserService.java                     
│   │
│   ├── model/                                  
│   │   └── TranslationRequest.java              
│   │
│   ├── resource/                               
│   │   └── TranslatorResource.java              
│   │
│   ├── service/                                
│   │   └── LLMTranslatorService.java          
│   │
│   └── filter/                               
│       └── CorsFilter.java                  
│
├── src/main/webapp/WEB-INF/
│   ├── web.xml                               
│   └── jboss-web.xml                          
│
├── php-client/                                 
│   ├── index.html                             
│   ├── proxy.php                              
│   ├── test.html                                
│   └── favicon.ico                              
│
├── chrome-extension/                            
│   ├── manifest.json                            
│   ├── background.js                            
│   ├── sidepanel.html                           
│   ├── sidepanel.js                            
│   ├── styles.css                              
└── icons/                                   
│
└── scripts/                                     # SCRIPTS UTILES
    ├── start-server.bat                         # Démarrage Windows
    ├── test-api.bat                             # Tests API Windows
    └── create-structure.bat                     # Création structure

