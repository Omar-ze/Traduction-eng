<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English to Darija Translator - WildFly</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php require_once 'config.php'; ?>

    <div class="container">
        <header>
            <h1><i class="fas fa-language"></i> English to Darija Translator</h1>
            <p class="subtitle">Powered by WildFly & LLM</p>

            <?php
            $status = checkServiceStatus();
            if ($status['online']): ?>
                <div class="status online">
                    <i class="fas fa-check-circle"></i>
                    Service Status: Online
                </div>
            <?php else: ?>
                <div class="status offline">
                    <i class="fas fa-exclamation-circle"></i>
                    Service Status: Offline
                </div>
            <?php endif; ?>
        </header>

        <main>
            <div class="translator-card">
                <form method="POST" action="translate.php">
                    <div class="input-section">
                        <label for="english-text">
                            <i class="fas fa-keyboard"></i> English Text
                        </label>
                        <textarea
                            id="english-text"
                            name="text"
                            placeholder="Enter text in English..."
                            rows="5"
                            required
                        ><?php echo isset($_POST['text']) ? htmlspecialchars($_POST['text']) : ''; ?></textarea>
                        <div class="char-count">
                            <span id="char-count">0</span> characters
                        </div>
                    </div>

                    <div class="actions">
                        <button type="submit" class="btn-translate">
                            <i class="fas fa-exchange-alt"></i> Translate to Darija
                        </button>
                        <button type="button" class="btn-clear" onclick="clearText()">
                            <i class="fas fa-trash"></i> Clear
                        </button>
                        <button type="button" class="btn-history" onclick="loadHistory()">
                            <i class="fas fa-history"></i> History
                        </button>
                    </div>
                </form>
            </div>

            <div id="result-container"></div>

            <div id="history-container" class="history-section" style="display: none;">
                <h3><i class="fas fa-history"></i> Translation History</h3>
                <div id="history-content"></div>
            </div>
        </main>

        <footer>
            <div class="info-box">
                <h3><i class="fas fa-info-circle"></i> About this Service</h3>
                <p>This translator service is deployed on <strong>WildFly Application Server</strong> and uses:</p>
                <ul>
                    <li>JAX-RS for RESTful web services</li>
                    <li>Jakarta Security for authentication</li>
                    <li>JPA/Hibernate for data persistence</li>
                    <li>Google Gemini API for translation</li>
                </ul>
                <p>Endpoints:</p>
                <code>POST /api/translator/translate</code><br>
                <code>GET /api/translator/history</code><br>
                <code>GET /api/translator/status</code>
            </div>

            <div class="credentials">
                <p><strong>Test Credentials:</strong></p>
                <p>Username: <code>user1</code> | Password: <code>userpass</code></p>
                <p>Username: <code>admin</code> | Password: <code>adminpass</code></p>
            </div>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>