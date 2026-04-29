const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMessages);
router.post('/', sendMessage);

module.exports = router;
