const express = require('express');
const router = express.Router();

const { register, login } = require('../../controllers/auth/controller');
const { authGuard } = require('../../middlewires/auth.middleware');

router.post('/register', register);
router.post('/login', login);

router.get('/me', authGuard, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
