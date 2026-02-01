// Gestion du compteur de caractères
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('english-text');
    const charCount = document.getElementById('char-count');

    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });

        // Initialiser le compteur
        charCount.textContent = textarea.value.length;

        // Soumission AJAX du formulaire
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                translateText();
            });
        }
    }
});

function clearText() {
    const textarea = document.getElementById('english-text');
    const charCount = document.getElementById('char-count');

    if (textarea) {
        textarea.value = '';
        if (charCount) {
            charCount.textContent = '0';
        }
        textarea.focus();
    }
}

function translateText() {
    const textarea = document.getElementById('english-text');
    const text = textarea.value.trim();

    if (!text) {
        alert('Please enter some text to translate');
        return;
    }

    // Afficher un indicateur de chargement
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Translating...
        </div>
    `;

    // Envoyer la requête AJAX
    fetch('translate.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'text=' + encodeURIComponent(text)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayTranslation(text, data.data);
        } else {
            showError(data.error || 'Translation failed');
        }
    })
    .catch(error => {
        showError('Network error: ' + error.message);
    });
}

function displayTranslation(original, data) {
    const resultContainer = document.getElementById('result-container');

    const html = `
        <div class="result-card">
            <h3><i class="fas fa-check-circle"></i> Translation Result</h3>

            <div class="original-text">
                <strong>English:</strong><br>
                ${escapeHtml(original)}
            </div>

            <div class="translation-text">
                <strong>Darija:</strong><br>
                ${escapeHtml(data.translation)}
            </div>

            <div class="result-meta">
                <small>Translated by: ${data.username}</small>
                <small>Time: ${new Date().toLocaleString()}</small>
            </div>

            <div class="result-actions">
                <button onclick="speakText('${escapeSingleQuotes(data.translation)}')" class="btn-speak">
                    <i class="fas fa-volume-up"></i> Listen
                </button>
                <button onclick="copyToClipboard('${escapeSingleQuotes(data.translation)}')" class="btn-copy">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
}

function loadHistory() {
    const historyContainer = document.getElementById('history-container');
    const historyContent = document.getElementById('history-content');

    // Afficher le conteneur
    historyContainer.style.display = 'block';
    historyContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading history...</div>';

    // Récupérer l'historique via AJAX
    fetch('config.php?action=history')
    .then(response => response.json())
    .then(data => {
        if (data.success && Array.isArray(data.data)) {
            displayHistory(data.data);
        } else {
            historyContent.innerHTML = '<p>No history available</p>';
        }
    })
    .catch(() => {
        historyContent.innerHTML = '<p>Failed to load history</p>';
    });
}

function displayHistory(history) {
    const historyContent = document.getElementById('history-content');

    if (history.length === 0) {
        historyContent.innerHTML = '<p>No translation history yet</p>';
        return;
    }

    let html = '';
    history.forEach(item => {
        html += `
            <div class="history-item">
                <div class="original"><strong>English:</strong> ${truncateText(item.original, 80)}</div>
                <div class="translation"><strong>Darija:</strong> ${truncateText(item.translation, 80)}</div>
                <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `;
    });

    historyContent.innerHTML = html;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-MA';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in your browser');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err.message);
    });
}

function showError(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}
        </div>
    `;
}

// Fonctions utilitaires
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeSingleQuotes(text) {
    return text.replace(/'/g, "\\'");
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}