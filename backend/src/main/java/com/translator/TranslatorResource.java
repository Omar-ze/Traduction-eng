package com.translator;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.HashMap;
import java.util.Map;

@Path("/translator")
public class TranslatorResource {

    @POST
    @Path("/translate")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response translate(@FormParam("text") String englishText) {

        try {
            if (englishText == null || englishText.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Text parameter is required\"}")
                        .build();
            }

            // Traduction mock simple
            String darijaTranslation = translateMock(englishText);

            Map<String, String> response = new HashMap<>();
            response.put("original", englishText);
            response.put("translation", darijaTranslation);
            response.put("status", "success");
            response.put("timestamp", java.time.LocalDateTime.now().toString());

            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Translation failed: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/status")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "English-Darija Translator");
        status.put("status", "operational");
        status.put("version", "1.0.0");
        status.put("timestamp", java.time.LocalDateTime.now().toString());
        return Response.ok(status).build();
    }

    @GET
    @Path("/history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistory() {
        // Retourne un historique mock
        return Response.ok("[]").build();
    }

    private String translateMock(String englishText) {
        // Traduction mock
        String lower = englishText.toLowerCase();
        if (lower.contains("hello")) return "سلام";
        if (lower.contains("thank")) return "شكرا";
        if (lower.contains("good morning")) return "صباح الخير";
        if (lower.contains("good night")) return "مساء الخير";
        if (lower.contains("how are you")) return "كيفاش";
        if (lower.contains("welcome")) return "مرحبا";
        if (lower.contains("yes")) return "اه";
        if (lower.contains("no")) return "لا";

        return "Traduction Darija pour: " + englishText;
    }
}