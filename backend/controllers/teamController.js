const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user.id, isActive: true })
      .populate('members.user', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName');
    res.json({ success: true, teams });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description, subject, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Team name is required' });

    const team = await Team.create({
      name, description, subject, color,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'leader' }]
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: { teamId: team._id, role: 'leader' } }
    });

    const populated = await team.populate('members.user', 'firstName lastName email avatar');
    res.status(201).json({ success: true, team: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'firstName lastName email avatar bio skills')
      .populate('createdBy', 'firstName lastName');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('members.user', 'firstName lastName email avatar');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const already = team.members.some(m => m.user.toString() === user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'User is already a member' });

    team.members.push({ user: user._id, role: 'member' });
    await team.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { teams: { teamId: team._id, role: 'member' } }
    });

    await Notification.create({
      user: user._id,
      title: 'Team Invitation',
      message: `You have been added to team "${team.name}"`,
      type: 'team',
      link: `/teams`
    });

    const populated = await team.populate('members.user', 'firstName lastName email avatar');
    res.json({ success: true, team: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
    await team.save();

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { teams: { teamId: team._id } }
    });

    res.json({ success: true, message: 'Member removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getTeams, createTeam, getTeam, updateTeam, addMember, removeMember };
