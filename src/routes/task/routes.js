const express = require('express');
const { create, list, show, update, destroy } = require('../../controllers/task/controller');

const router = express.Router();

router.post('/', create);
router.get('/', list);
router.get('/:id', show);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
