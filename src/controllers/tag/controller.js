const { pool } = require('../../db/connection');
const { monotonicFactory } = require('ulid');
const nextUlid = monotonicFactory();
const { decorateTag, decorateList } = require('../../decorators/tag.decorator');

exports.create = async (req, res) => {
    try {
        const { name, user_id } = req.body || {};
        if (!name || !user_id) {
            return res.status(422).json({ message: 'Name and user_id are required' });
        }
        const id = nextUlid();
        await pool.execute('INSERT INTO tags (id, name, user_id) VALUES (?, ?, ?)', [id, name, user_id]);

        const [rows] = await pool.execute(
            'SELECT * FROM tags WHERE id = ?', [id]);
        return res.status(201).json({data:decorateTag(rows[0])});

    } catch (error) {
        return res.status(500).json({ message: 'Error creating' });
    }
}
exports.list = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM tags ORDER BY created_at DESC');
        return res.json({data:decorateList(rows)});
    } catch (error) {
        return res.status(500).json({ message: 'Listing error' });
    }
}

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM tags WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        return res.json({data:decorateTag(rows[0])});
    } catch (error) {
        return res.status(500).json({ message: 'Error listing a tag' });
    }
}
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body || {};
        if (!name) return res.status(422).json({ message: 'name required' });

        const [rows] = await pool.execute('SELECT * FROM tags WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ message: 'Not found' });

        await pool.execute(
            'UPDATE tags SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, id]
        );

        const tag = { ...rows[0], name };
        return res.status(200).json({data:decorateTag(tag)});

    } catch (error) {
        return res.status(500).json({ message: 'Error updating', err });
    }
}
exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM tags WHERE id = ? LIMIT 1',
            [id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        const deleted = rows[0];
        const [del] = await pool.execute('DELETE FROM tags WHERE id = ?', [id]);
        
        return res.status(201).json({data:decorateTag(deleted)});
        
    } catch (err) {
        return res.status(500).json({ message: 'Delete error', err });
    }
};