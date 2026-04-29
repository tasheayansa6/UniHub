const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject:     { type: String, default: '' },
  color:       { type: String, default: '#3b82f6' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['leader', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
