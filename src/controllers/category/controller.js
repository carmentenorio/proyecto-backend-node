const { pool } = require('../../db/connection');
const { monotonicFactory } = require('ulid');
const nextUlid = monotonicFactory();
const { decorateCategory, decorateList } = require('../../decorators/category.decorator');

exports.create = async (req, res) => {
    try {
        const { name, user_id } = req.body || {};
        if (!name || !user_id) {
            return res.status(422).json({ message: 'Name and user_id are required' });
        }
        const id = nextUlid();
        await pool.execute('INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?)', [id, name, user_id]);

        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?', [id]);
        return res.status(201).json(decorateCategory ? decorateCategory(rows[0]) : rows[0]);

    } catch (error) {
        return res.status(500).json({ message: 'Error creating' });
    }
}
exports.list = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM categories ORDER BY created_at DESC');
        return res.json(decorateList ? decorateList(rows) : rows);
    } catch (error) {
        return res.status(500).json({ message: 'Listing error' });
    }
}

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        return res.json(decorateCategory ? decorateCategory(rows[0]) : rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error listing a category' });
    }
}
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body || {};
        if (!name) return res.status(422).json({ message: 'name required' });

        const [upd] = await pool.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        if (upd.affectedRows === 0) return res.status(404).json({ message: 'Not found' });

        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?', [id]);
        return res.status(201).json(decorateCategory ? decorateCategory(rows[0]) : rows[0]);

    } catch (error) {
        return res.status(500).json({ message: 'Error updating' });
    }
}
exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const [del] = await pool.execute(
            'DELETE FROM categories WHERE id = ?', [id]);
        if (del.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Delete error' });
    }
}

