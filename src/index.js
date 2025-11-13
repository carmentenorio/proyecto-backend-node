require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth/routes.js');
const usersRoutes = require('./routes/user/routes.js');
const categoriesRoutes = require('./routes/category/routes.js');
const tagsRoutes = require('./routes/tag/routes.js');
const tasksRoutes = require('./routes/task/routes.js');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server working correctly' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

