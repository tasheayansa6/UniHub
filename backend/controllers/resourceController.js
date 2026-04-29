const Resource = require('../models/Resource');
const path = require('path');

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ team: req.params.teamId })
      .populate('uploadedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const uploadResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const resource = await Resource.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).slice(1),
      team: req.params.teamId,
      uploadedBy: req.user.id
    });

    const populated = await resource.populate('uploadedBy', 'firstName lastName avatar');
    res.status(201).json({ success: true, resource: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.resourceId);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getResources, uploadResource, deleteResource };
