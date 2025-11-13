const { pool } = require('../../db/connection');
const { monotonicFactory } = require('ulid');
const nextUlid = monotonicFactory();
const { decorateTask, decorateList } = require('../../decorators/task.decorator');

exports.create = async (req, res) => {
    try {
        let { title, description, status, category_id, tag_ids, completed, tags } = req.body || {};
        const userId = "01K9SQXKQ8EME4E2Y0PMB5TF87";

        if (tags && !tag_ids) tag_ids = tags;
        if (!title) return res.status(422).json({ message: 'Title is required' });

        const id = nextUlid();

        await pool.execute(
            'INSERT INTO tasks (id, title, description, status, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, description || null, status, userId, category_id]
        );

        if (Array.isArray(tag_ids)) {
            for (const tagId of tag_ids) {
                await pool.execute(
                    'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
                    [id, tagId]
                );
            }
        }

        const [tasks] = await pool.execute(
            `SELECT id, title, description, status, category_id, user_id
       FROM tasks WHERE id = ?`,
            [id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found after insert' });
        }

        const categoryIds = [...new Set(tasks.map(t => t.category_id))];
        const [categories] = await pool.execute(
            `SELECT id, name FROM categories WHERE id IN (${categoryIds.map(() => '?').join(',')})`,
            categoryIds
        );

        const taskIds = tasks.map(t => t.id);
        const [taskTagRelations] = await pool.execute(
            `SELECT task_id, tag_id FROM task_tags WHERE task_id IN (${taskIds.map(() => '?').join(',')})`,
            taskIds
        );

        const tagIds = [...new Set(taskTagRelations.map(tt => tt.tag_id))];
        let tagsData = [];
        if (tagIds.length > 0) {
            const [tagRows] = await pool.execute(
                `SELECT id, name FROM tags WHERE id IN (${tagIds.map(() => '?').join(',')})`,
                tagIds
            );
            tagsData = tagRows;
        }

        const task = tasks[0];
        const category = categories.find(category => category.id === task.category_id) || null;
        const relatedTags = taskTagRelations
            .filter(tasks_tags => tasks_tags.task_id === task.id)
            .map(tasks_tags => tagsData.find(tasks=> tasks.id === tasks_tags.tag_id))
            .filter(Boolean);

        const decoratedTask = decorateTask({
            ...task,
            category,
            tags: relatedTags
        });

        return res.status(201).json({ data: decoratedTask });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating task', error });
    }
};

exports.list = async (req, res) => {
    try {
        const userId = "01K9SQXKQ8EME4E2Y0PMB5TF87";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const [tasks] = await pool.execute(
            `SELECT id, title, description, status, category_id, user_id, created_at, updated_at
       FROM tasks WHERE user_id = ? ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
            [userId]
        );

        if (tasks.length === 0) {
            return res.json({ data: [] });
        }

        const categoryIds = [...new Set(tasks.map(t => t.category_id).filter(Boolean))];
        let categories = [];
        if (categoryIds.length > 0) {
            const [categoryRows] = await pool.execute(
                `SELECT id, name FROM categories WHERE id IN (${categoryIds.map(() => '?').join(',')})`,
                categoryIds
            );
            categories = categoryRows;
        }

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?`,
            [userId]
        );

        const taskIds = tasks.map(t => t.id);
        const [taskTagRelations] = await pool.execute(
            `SELECT task_id, tag_id FROM task_tags WHERE task_id IN (${taskIds.map(() => '?').join(',')})`,
            taskIds
        );

        const tagIds = [...new Set(taskTagRelations.map(tt => tt.tag_id))];
        let tagsData = [];
        if (tagIds.length > 0) {
            const [tagRows] = await pool.execute(
                `SELECT id, name FROM tags WHERE id IN (${tagIds.map(() => '?').join(',')})`,
                tagIds
            );
            tagsData = tagRows;
        }

        const tasksList = decorateList(tasks.map(task => {
            const category = categories.find(c => c.id === task.category_id) || null;
            const relatedTags = taskTagRelations
                .filter(tt => tt.task_id === task.id)
                .map(tt => tagsData.find(t => t.id === tt.tag_id))
                .filter(Boolean);
            return { ...task, category, tags: relatedTags };
        }));
        
        return res.json({
            data: tasksList,
            current_page: page,
            per_page: limit,
            total,
            last_page: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error listing tasks', error });
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = "01K9SQXKQ8EME4E2Y0PMB5TF87";

        const [tasks] = await pool.execute(
            `SELECT id, title, description, status, category_id, user_id, created_at, updated_at
       FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
            [id, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const task = tasks[0];
        let category = null;
        if (task.category_id) {
            const [categories] = await pool.execute(
                `SELECT id, name FROM categories WHERE id = ? LIMIT 1`,
                [task.category_id]
            );
            category = categories.length ? categories[0] : null;
        }

        const [taskTagRelations] = await pool.execute(
            `SELECT tag_id FROM task_tags WHERE task_id = ?`,
            [id]
        );

        let tags = [];
        if (taskTagRelations.length > 0) {
            const tagIds = taskTagRelations.map(tt => tt.tag_id);
            const [tagRows] = await pool.execute(
                `SELECT id, name FROM tags WHERE id IN (${tagIds.map(() => '?').join(',')})`,
                tagIds
            );
            tags = tagRows;
        }

        const decoratedTask = decorateTask({
            ...task,
            category,
            tags
        });

        return res.json({ data: decoratedTask });
    } catch (error) {
        return res.status(500).json({ message: 'Error getting task', error });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, description, status, completed, category_id, tags, tag_ids } = req.body || {};
        const userId = "01K9SQXKQ8EME4E2Y0PMB5TF87";

        if(completed !== undefined){
            status = completed;
        }
        
        if (tags && !tag_ids) tag_ids = tags;

        const [rows] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (!rows.length) return res.status(404).json({ message: 'Task not found' });

        const task = rows[0];
        await pool.execute(
            `UPDATE tasks
             SET title = ?, description = ?, status = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [
                title !== undefined ? title : task.title,
                description !== undefined ? description : task.description,
                status !== undefined ? status : task.status,
                category_id !== undefined ? category_id : task.category_id,
                id,
                userId
            ]
        );

        if (Array.isArray(tag_ids)) {
            await pool.execute('DELETE FROM task_tags WHERE task_id = ?', [id]);

            for (const tag of tag_ids) {
                const tagId = (tag.id || tag).trim();
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
             WHERE t.id = ?`,
            [id]
        );
        const updatedTask = updatedRows[0];

        const [taskTagRelations] = await pool.execute('SELECT tag_id FROM task_tags WHERE task_id = ?', [id]);

        const tagIds = taskTagRelations.map(tt => tt.tag_id);
        let tagsData = [];
        if (tagIds.length > 0) {
            const [tagRows] = await pool.execute(
                `SELECT id, name FROM tags WHERE id IN (${tagIds.map(() => '?').join(',')})`,
                tagIds
            );
            tagsData = tagRows;
        }

        const decoratedTask = decorateTask({
            ...updatedTask,
            category: updatedTask.category_name
                ? { id: updatedTask.category_id, name: updatedTask.category_name }
                : null,
            tags: tagsData,
            completed: !!updatedTask.status,
            category_name: updatedTask.category_name || 'Uncategorized'
        });
        return res.json({ data: decoratedTask });

    } catch (error) {
        return res.status(500).json({ message: 'Error updating task', error });
    }
};

exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = "01K9SQXKQ8EME4E2Y0PMB5TF87";

        const [rows] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1',
            [id, userId]
        );
        if (!rows.length) return res.status(404).json({ message: 'Task not found' });

        const task = rows[0];
        await pool.execute('DELETE FROM task_tags WHERE task_id = ?', [id]);
        await pool.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

        return res.status(200).json({ data: decorateTask(task) });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting task', error });
    }
};
