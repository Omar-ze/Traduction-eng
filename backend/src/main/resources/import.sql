-- Table des utilisateurs (pour l'authentification)
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_roles (
    username VARCHAR(50),
    role VARCHAR(50),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Insérer des utilisateurs de test
INSERT INTO users (username, password) VALUES
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKv.wJvC'), -- password: userpass
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKv.wJvC'); -- password: adminpass

INSERT INTO user_roles (username, role) VALUES
('user1', 'USER'),
('admin', 'ADMIN'),
('admin', 'USER');

-- Table des traductions (créée automatiquement par JPA)