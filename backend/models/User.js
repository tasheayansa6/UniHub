const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar:    { type: String, default: '' },
  bio:       { type: String, default: '' },
  skills:    [{ type: String }],
  teams:     [{ teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, role: { type: String, enum: ['leader', 'member'], default: 'member' } }],
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual('initials').get(function () {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
