const { pool } = require('../../db/connection');
const { monotonicFactory } = require('ulid');
const nextUlid = monotonicFactory();
const { decorateCategory, decorateList } = require('../../decorators/category.decorator');

exports.create = async (req, res) => {
    try {
        const { name } = req.body || {};
        const userId = req.user.id;
        if (!name) {
            return res.status(422).json({ message: 'Name and user_id are required' });
        }
        const id = nextUlid();
        await pool.execute('INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?)', [id, name, userId]);

        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?', [id]);
        return res.status(201).json({data:decorateCategory(rows[0])});

    } catch (error) {
        return res.status(500).json({ message: 'Error creating' });
    }
}
exports.list = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.execute(
            'SELECT * FROM categories ORDER BY created_at DESC');
        return res.json({data:decorateList(rows)});
    } catch (error) {
        return res.status(500).json({ message: 'Listing error' });
    }
}

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        return res.json({data:decorateCategory(rows[0])});
    } catch (error) {
        return res.status(500).json({ message: 'Error listing a category' });
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body || {};
        const userId = req.user.id;

        if (!name) return res.status(422).json({ message: 'name required' });

        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });

        await pool.execute(
            'UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [name, id, userId]
        );

        const catg = { ...rows[0], name };
        return res.status(200).json({data:decorateCategory(catg)});

    } catch (error) {
        return res.status(500).json({ message: 'Error updating', err });
    }
}
exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
            [id, userId]
        );
        if (!rows.length) return res.status(404).json({ message: 'Not found or not owned by user' });
        const deleted = rows[0];
        const [del] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
        
        return res.status(201).json({data:decorateCategory(deleted)});
        
    } catch (err) {
        return res.status(500).json({ message: 'Delete error', err });
    }
};