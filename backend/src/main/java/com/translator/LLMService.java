package com.translator;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class LLMService {

    // SUPPRIME cette ligne:
    // @Inject
    // private Logger logger;

    private static final String GEMINI_API_KEY = System.getenv("GEMINI_API_KEY");
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    public String translateToDarija(String englishText) throws Exception {
        try {
            return translateWithGemini(englishText);
        } catch (Exception e) {
            // REMPLACE logger.warnf par System.out.println
            System.out.println("Gemini failed: " + e.getMessage() + ", trying mock translation");
            return translateMock(englishText);
        }
    }

    private String translateWithGemini(String englishText) throws Exception {
        if (GEMINI_API_KEY == null || GEMINI_API_KEY.isEmpty()) {
            throw new RuntimeException("Gemini API key not configured. Set GEMINI_API_KEY environment variable.");
        }

        String prompt = String.format(
                "Translate this English text to Moroccan Darija dialect. " +
                        "Provide only the translation, no explanations:\n\n" +
                        "English: %s\n" +
                        "Darija:",
                englishText
        );

        String requestBody = String.format(
                "{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}",
                escapeJson(prompt)
        );

        Client client = ClientBuilder.newClient();
        try {
            Response response = client.target(GEMINI_URL)
                    .queryParam("key", GEMINI_API_KEY)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.entity(requestBody, MediaType.APPLICATION_JSON));

            if (response.getStatus() != 200) {
                throw new RuntimeException("Gemini API error: " + response.getStatus());
            }

            String jsonResponse = response.readEntity(String.class);
            return extractGeminiTranslation(jsonResponse);

        } finally {
            client.close();
        }
    }

    private String translateMock(String englishText) {
        Map<String, String> mockTranslations = new HashMap<>();
        mockTranslations.put("hello", "سلام");
        mockTranslations.put("how are you", "كيفاش");
        mockTranslations.put("thank you", "شكرا");
        mockTranslations.put("good morning", "صباح الخير");
        mockTranslations.put("good night", "مساء الخير");

        String lowerText = englishText.toLowerCase();
        for (Map.Entry<String, String> entry : mockTranslations.entrySet()) {
            if (lowerText.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "Traduction Darija pour: " + englishText;
    }

    private String extractGeminiTranslation(String jsonResponse) throws Exception {
        // Simple extraction pour le test
        // Tu peux ajouter Jackson plus tard
        if (jsonResponse.contains("\"text\"")) {
            int start = jsonResponse.indexOf("\"text\":\"") + 8;
            int end = jsonResponse.indexOf("\"", start);
            if (start > 7 && end > start) {
                return jsonResponse.substring(start, end).trim();
            }
        }
        return "Traduction non disponible";
    }

    private String escapeJson(String input) {
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}