const bcrypt = require('bcryptjs');
const { pool } = require('../../db/connection');
const { nextUlid } = require('../../utils/ids');
const jwt = require('jsonwebtoken');
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(422).json({ message: 'Email and password are required' });
        }
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        if (!rows.length) {
            return res.status(422).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET || 'dev',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(400).json({ message: 'Error logging in user' });
    }
};
