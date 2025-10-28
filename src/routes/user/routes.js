const express = require('express');
const { getById } = require('../../controllers/user/controller');
const router = express.Router();

router.get('/:id', getById);
module.exports = router;