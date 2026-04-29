const Task = require('../models/Task');
const Notification = require('../models/Notification');

const getTasks = async (req, res) => {
  try {
    const filter = { team: req.params.teamId };
    if (req.query.status) filter.status = req.query.status;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const task = await Task.create({
      title, description, status, priority, dueDate,
      assignedTo: assignedTo || [],
      team: req.params.teamId,
      createdBy: req.user.id
    });

    if (assignedTo?.length) {
      const notifications = assignedTo.map(uid => ({
        user: uid,
        title: 'New Task Assigned',
        message: `You have been assigned to task "${title}"`,
        type: 'task',
        link: '/tasks'
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await task.populate([
      { path: 'assignedTo', select: 'firstName lastName avatar' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    res.status(201).json({ success: true, task: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true })
      .populate('assignedTo', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
