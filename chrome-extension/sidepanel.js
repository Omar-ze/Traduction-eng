// Configuration pour WildFly
const WILDFLY_API = 'http://localhost:8080/translator-service/api/translator';
const USERNAME = 'user1';
const PASSWORD = 'userpass';

// Authentification Basic
const AUTH_HEADER = 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`);

// Éléments DOM
const elements = {
    sourceText: document.getElementById('source-text'),
    translateBtn: document.getElementById('translate-btn'),
    translationResult: document.getElementById('translation-result'),
    historyBtn: document.getElementById('history-btn'),
    historyContainer: document.getElementById('history-container'),
    clearBtn: document.getElementById('clear-btn')
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    elements.translateBtn.addEventListener('click', translateText);
    elements.historyBtn.addEventListener('click', loadHistory);
    elements.clearBtn.addEventListener('click', clearText);

    // Récupérer le texte sélectionné depuis la page active
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
            if (response && response.text) {
                elements.sourceText.value = response.text;
            }
        });
    });
});

async function translateText() {
    const text = elements.sourceText.value.trim();

    if (!text) {
        showMessage('Please enter some text', 'error');
        return;
    }

    // Désactiver le bouton pendant la traduction
    elements.translateBtn.disabled = true;
    elements.translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';

    try {
        const response = await fetch(`${WILDFLY_API}/translate`, {
            method: 'POST',
            headers: {
                'Authorization': AUTH_HEADER,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `text=${encodeURIComponent(text)}`
        });

        if (response.ok) {
            const data = await response.json();
            displayTranslation(text, data);
            showMessage('Translation successful!', 'success');
        } else {
            const error = await response.json();
            showMessage(`Error: ${error.error || response.statusText}`, 'error');
        }
    } catch (error) {
        showMessage(`Network error: ${error.message}`, 'error');
    } finally {
        elements.translateBtn.disabled = false;
        elements.translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
    }
}

async function loadHistory() {
    try {
        const response = await fetch(`${WILDFLY_API}/history`, {
            method: 'GET',
            headers: {
                'Authorization': AUTH_HEADER
            }
        });

        if (response.ok) {
            const history = await response.json();
            displayHistory(history);
        }
    } catch (error) {
        showMessage(`Failed to load history: ${error.message}`, 'error');
    }
}

function displayTranslation(original, data) {
    const html = `
        <div class="translation-card">
            <h4><i class="fas fa-language"></i> Translation Result</h4>
            <div class="original">
                <strong>English:</strong>
                <p>${escapeHtml(original)}</p>
            </div>
            <div class="translated">
                <strong>Darija:</strong>
                <p>${escapeHtml(data.translation)}</p>
            </div>
            <div class="translation-actions">
                <button onclick="speakTranslation('${escapeSingleQuotes(data.translation)}')">
                    <i class="fas fa-volume-up"></i> Listen
                </button>
                <button onclick="copyTranslation('${escapeSingleQuotes(data.translation)}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>
    `;

    elements.translationResult.innerHTML = html;
}

function displayHistory(history) {
    if (!history.length) {
        elements.historyContainer.innerHTML = '<p>No history yet</p>';
        return;
    }

    let html = '<h4><i class="fas fa-history"></i> Recent Translations</h4>';
    history.forEach(item => {
        html += `
            <div class="history-item">
                <p><strong>EN:</strong> ${truncateText(item.original, 60)}</p>
                <p><strong>DARIJA:</strong> ${truncateText(item.translation, 60)}</p>
                <small>${new Date(item.timestamp).toLocaleString()}</small>
            </div>
        `;
    });

    elements.historyContainer.innerHTML = html;
}

function clearText() {
    elements.sourceText.value = '';
    elements.translationResult.innerHTML = '';
    elements.historyContainer.innerHTML = '';
}

function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        color: white;
        font-weight: bold;
    `;

    messageEl.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';

    document.body.appendChild(messageEl);

    setTimeout(() => {
        document.body.removeChild(messageEl);
    }, 3000);
}

// Fonctions utilitaires globales
window.speakTranslation = function(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-MA';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
};

window.copyTranslation = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('Copied to clipboard!', 'success');
    });
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeSingleQuotes(text) {
    return text.replace(/'/g, "\\'");
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}