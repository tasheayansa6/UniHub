const express = require('express');
const router = express.Router();
const { getTeams, createTeam, getTeam, updateTeam, addMember, removeMember } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getTeams);
router.post('/', createTeam);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
