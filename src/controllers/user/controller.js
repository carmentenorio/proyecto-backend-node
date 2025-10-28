const { pool: pool2 } = require('../../db/connection');

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool2.execute('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error en getById:', err);
    return res.status(500).json({ message: 'Error al obtener usuario' });
  }
};