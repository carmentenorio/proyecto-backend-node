const express = require('express');
const router = express.Router();

const { getById } = require('../../controllers/user/controller');
const { authGuard } = require('../../middlewires/auth.middleware');

router.get('/:id', authGuard, getById);

module.exports = router;