const bcrypt = require('bcryptjs');
const { pool } = require('../../db/connection');
const { nextUlid } = require('../../utils/ids');
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(422).json({ message: 'Name, email and password are required' });
        }
        const [exists] = await pool.execute(
            'SELECT id FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        if (exists.length) {
            return res.status(422).json({ message: 'The email is already registered' });
        }
        const id = nextUlid();

        const hash = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
            [id, name, email, hash]
        );
        return res.status(201).json({ id, name, email });

    } catch (err) {
        return res.status(400).json({ message: 'Error registering user' });
    }
}