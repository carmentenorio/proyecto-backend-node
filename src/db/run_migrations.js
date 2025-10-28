const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');
const migrationsPath = path.join(__dirname, 'migrations');
const files = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.sql'));
(async () => {
    for (const file of files) {
        const filePath = path.join(migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        try {
            await pool.query(sql);
            console.log(` Migrate DB: ${file}`);
        } catch (err) {
            console.log(err);
            console.error(`Error on ${file}:`, err.message);
        }
    }
})();