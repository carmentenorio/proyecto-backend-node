const { pool: pool2 } = require('../../db/connection');
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool2.execute(
      'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return res.json(rows);
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json({ message: 'Error listing users' });
  }
};
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool2.execute('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Error getting user' });
  }
};