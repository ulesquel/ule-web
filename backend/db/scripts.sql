CREATE TABLE IF NOT EXISTS fests (
  id_fest TEXT PRIMARY KEY NOT NULL UNIQUE,
  frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly')) NOT NULL,
  fest_type TEXT CHECK(frequency IN ('event', 'workshop', 'competition')) NOT NULL,
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
