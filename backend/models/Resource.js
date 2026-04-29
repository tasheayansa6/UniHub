const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  description:{ type: String, default: '' },
  fileUrl:    { type: String, required: true },
  fileName:   { type: String, required: true },
  fileSize:   { type: Number },
  fileType:   { type: String },
  team:       { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
