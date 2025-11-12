CREATE TABLE
    IF NOT EXISTS tasks (
        id CHAR(26) COLLATE ascii_bin NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status TINYINT(1) DEFAULT 0,
        user_id CHAR(26) COLLATE ascii_bin NOT NULL,
        category_id CHAR(26) COLLATE ascii_bin,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_task_user (user_id),
        KEY idx_task_category (category_id),
        CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;