const express = require('express');
const { create, list, show, update, destroy } = require('../../controllers/tag/controller');
const { authGuard } = require('../../middlewires/auth.middleware');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/', authGuard, create);
router.get('/', authGuard, list);
router.get('/:id', authGuard, show);
router.put('/:id', authGuard, update);
router.delete('/:id', authGuard, destroy);
module.exports = router;
