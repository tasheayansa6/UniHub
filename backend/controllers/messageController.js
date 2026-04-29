const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Message content required' });

    const message = await Message.create({
      team: req.params.teamId,
      sender: req.user.id,
      content: content.trim()
    });
    const populated = await message.populate('sender', 'firstName lastName avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getMessages, sendMessage };
