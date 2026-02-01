// Content script pour capturer la sélection de texte
let lastSelection = '';

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection() {
    const selection = window.getSelection().toString().trim();

    if (selection && selection !== lastSelection) {
        lastSelection = selection;

        // Envoyer le texte sélectionné au side panel
        chrome.runtime.sendMessage({
            action: 'textSelected',
            text: selection,
            url: window.location.href
        });
    }
}

// Répondre aux messages du side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelection') {
        const selection = window.getSelection().toString().trim();
        sendResponse({ text: selection || '' });
    }
    return true;
});