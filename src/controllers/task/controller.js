const { pool } = require('../../db/connection');
const { monotonicFactory } = require('ulid');
const nextUlid = monotonicFactory();
const { decorateTask, decorateList } = require('../../decorators/task.decorator');

exports.create = async (req, res) => {
    try {
        const { title, description, status, user_id, category_id, tag_ids } = req.body || {};
        if (!title || !user_id) {
            return res.status(422).json({ message: 'Title and user_id are required' });
        }

        const id = nextUlid();

        await pool.execute(
            'INSERT INTO tasks (id, title, description, status, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, description || null, status || 'pending', user_id, category_id || null]
        );

        if (Array.isArray(tag_ids)) {
            for (const tagId of tag_ids) {
                await pool.execute(
                    'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
                    [id, tagId]
                );
            }
        }

        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM tasks t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.id = ?`, [id]
        );

        return res.status(201).json(decorateTask(rows[0]));

    } catch (error) {
        return res.status(500).json({ message: 'Error creating task', error });
    }
};

exports.list = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM tasks t
             LEFT JOIN categories c ON c.id = t.category_id
             ORDER BY t.created_at DESC`
        );
        return res.json(decorateList(rows));
    } catch (error) {
        return res.status(500).json({ message: 'Error listing tasks', error });
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM tasks t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.id = ?`, [id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Task not found' });
        return res.json(decorateTask(rows[0]));
    } catch (error) {
        return res.status(500).json({ message: 'Error getting task', error });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, category_id, tag_ids } = req.body || {};

        const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Task not found' });

        const task = rows[0];

        await pool.execute(
            `UPDATE tasks SET title = ?, description = ?, status = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [
                title || task.title,
                description || task.description,
                status || task.status,
                category_id || task.category_id,
                id
            ]
        );

        if (Array.isArray(tag_ids)) {
            await pool.execute('DELETE FROM task_tags WHERE task_id = ?', [id]);
            for (const tagId of tag_ids) {
                await pool.execute(
                    'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
                    [id, tagId]
                );
            }
        }

        const [updatedRows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM tasks t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.id = ?`, [id]
        );

        return res.json(decorateTask(updatedRows[0]));

    } catch (error) {
        return res.status(500).json({ message: 'Error updating task', error });
    }
};

exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Task not found' });

        await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

        return res.status(201).json(decorateTask(rows[0]));

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting task', error });
    }
};
