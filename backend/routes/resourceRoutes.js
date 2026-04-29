const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const { getResources, uploadResource, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);
router.get('/', getResources);
router.post('/', upload.single('file'), uploadResource);
router.delete('/:resourceId', deleteResource);

module.exports = router;
