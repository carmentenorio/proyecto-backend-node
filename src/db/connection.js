// src/db/connection.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',          
  port: 3306, 
  user: 'root',         
  password: "",  
  database:'todolist_node',      
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

module.exports = { pool };