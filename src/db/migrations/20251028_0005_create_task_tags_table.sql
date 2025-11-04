CREATE TABLE
    IF NOT EXISTS task_tags (
        task_id CHAR(26) COLLATE ascii_bin NOT NULL,
        tag_id CHAR(26) COLLATE ascii_bin NOT NULL,
        PRIMARY KEY (task_id, tag_id),
        CONSTRAINT fk_task_tags_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        CONSTRAINT fk_task_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;