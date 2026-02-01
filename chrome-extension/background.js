// Service Worker pour l'extension Chrome
chrome.runtime.onInstalled.addListener(() => {
    console.log('Darija Translator Extension installed');

    // Configuration par défaut
    chrome.storage.local.set({
        wildflyConfig: {
            url: 'http://localhost:8080/translator-service',
            username: 'user1',
            password: 'userpass'
        }
    });

    // Configurer le side panel
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(() => {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
});

// Gérer les messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'textSelected') {
        // Stocker la dernière sélection
        chrome.storage.local.set({ lastSelection: request.text });
    }
});