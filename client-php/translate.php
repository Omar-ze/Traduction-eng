<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$text = $_POST['text'] ?? '';

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['error' => 'Text is required']);
    exit;
}

$result = translateText($text);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'data' => $result['data']
    ]);
} else {
    http_response_code($result['http_code']);
    echo json_encode([
        'success' => false,
        'error' => $result['data']['error'] ?? 'Translation failed'
    ]);
}
?>