package com.translator;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class DatabaseService {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public void saveTranslation(String username, String original, String translation) {
        TranslationEntity entity = new TranslationEntity();
        entity.setUsername(username);
        entity.setOriginalText(original);
        entity.setTranslatedText(translation);
        entity.setTimestamp(new java.util.Date());

        em.persist(entity);
    }

    public List<Map<String, Object>> getUserHistory(String username) {
        List<TranslationEntity> results = em.createQuery(
                        "SELECT t FROM TranslationEntity t WHERE t.username = :username ORDER BY t.timestamp DESC",
                        TranslationEntity.class
                )
                .setParameter("username", username)
                .setMaxResults(50)
                .getResultList();

        List<Map<String, Object>> history = new ArrayList<>();
        for (TranslationEntity entity : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", entity.getId());
            item.put("original", entity.getOriginalText());
            item.put("translation", entity.getTranslatedText());
            item.put("timestamp", entity.getTimestamp());
            history.add(item);
        }

        return history;
    }

    @Entity
    @Table(name = "translations")
    public static class TranslationEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String username;

        @Column(length = 2000)
        private String originalText;

        @Column(length = 2000)
        private String translatedText;

        @Temporal(TemporalType.TIMESTAMP)
        private java.util.Date timestamp;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getOriginalText() { return originalText; }
        public void setOriginalText(String originalText) { this.originalText = originalText; }

        public String getTranslatedText() { return translatedText; }
        public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }

        public java.util.Date getTimestamp() { return timestamp; }
        public void setTimestamp(java.util.Date timestamp) { this.timestamp = timestamp; }
    }
}