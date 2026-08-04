CREATE TABLE IF NOT EXISTS fests (
  id_fest TEXT PRIMARY KEY NOT NULL UNIQUE,
  frequency TEXT  NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  fest_type TEXT NOT NULL CHECK(fest_type IN ('event', 'workshop', 'competition')),
  name VARCHAR(128) NOT NULL,
  objective VARCHAR(128) NOT NULL,
  description VARCHAR(512) NOT NULL,
  init_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  address VARCHAR(256) NOT NULL,
  img VARCHAR(512) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id_project TEXT PRIMARY KEY NOT NULL UNIQUE,
  repo_url VARCHAR(256) NOT NULL,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(256) NOT NULL,
  project_link VARCHAR(512) NOT NULL,
  img VARCHAR(512) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id_user TEXT PRIMARY KEY NOT NULL UNIQUE,
  username VARCHAR(64) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'editor'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id_refresh_token TEXT PRIMARY KEY NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    id_user INTEGER NOT NULL, -- Usa TEXT si el ID de tus usuarios es un UUID
    -- Restricción relacional: si borras al usuario, sus tokens desaparecen
    CONSTRAINT fk_user 
      FOREIGN KEY (id_user) 
      REFERENCES users(id_user) 
      ON DELETE CASCADE
);

-- Índices para optimizar las consultas del endpoint /refresh
CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_user_tokens ON refresh_tokens(id_user);
