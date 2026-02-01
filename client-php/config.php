<?php
// Configuration pour WildFly
define('WILDFLY_URL', 'http://localhost:8080/translator-service/api/translator');
define('API_USERNAME', 'user1');
define('API_PASSWORD', 'userpass');

// Fonction d'appel API avec authentification Basic
function callTranslatorAPI($endpoint, $method = 'POST', $data = null) {
    $url = WILDFLY_URL . $endpoint;

    $headers = [
        'Authorization: Basic ' . base64_encode(API_USERNAME . ':' . API_PASSWORD),
        'Content-Type: application/x-www-form-urlencoded'
    ];

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }
    } elseif ($method === 'GET') {
        if ($data) {
            $url .= '?' . http_build_query($data);
            curl_setopt($ch, CURLOPT_URL, $url);
        }
    }

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['error' => 'cURL Error: ' . $error];
    }

    curl_close($ch);

    $decodedResponse = json_decode($response, true);

    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'http_code' => $httpCode,
        'data' => $decodedResponse ?: $response
    ];
}

// Fonction spécifique pour la traduction
function translateText($text) {
    return callTranslatorAPI('/translate', 'POST', ['text' => $text]);
}

// Fonction pour récupérer l'historique
function getTranslationHistory() {
    return callTranslatorAPI('/history', 'GET');
}

// Fonction pour vérifier le statut du service
function checkServiceStatus() {
    $url = WILDFLY_URL . '/status';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    return [
        'online' => $httpCode === 200,
        'data' => json_decode($response, true)
    ];
}
?>