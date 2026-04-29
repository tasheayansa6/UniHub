import { useEffect, useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus, X, ChevronDown, Flag, Calendar, User2,
  MoreHorizontal, Trash2, Pencil, CheckSquare, Clock,
  AlertCircle, CircleDot, CheckCircle2, Search, Filter,
  SlidersHorizontal, Users
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#64748b', bg: '#64748b15', icon: CircleDot    },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b', bg: '#f59e0b15', icon: Clock        },
  { id: 'review',      label: 'In Review',   color: '#8b5cf6', bg: '#8b5cf615', icon: AlertCircle  },
  { id: 'done',        label: 'Done',        color: '#10b981', bg: '#10b98115', icon: CheckCircle2 },
];

const PRIORITY = {
  low:    { label: 'Low',    color: '#10b981', bg: '#10b98120' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#f59e0b20' },
  high:   { label: 'High',   color: '#ef4444', bg: '#ef444420' },
};

const EMPTY_FORM = {
  title: '', description: '', priority: 'medium', status: 'todo',
  assignedTo: [], dueDate: '',
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function Avatar({ user, size = 7 }) {
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';
  const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'];
  const idx = (user?.firstName?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div
      title={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: colors[idx], fontSize: size * 1.6 }}
    >
      {initials}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] ?? PRIORITY.medium;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: p.bg, color: p.color }}>
      <Flag size={10} /> {p.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const diff = Math.ceil((date - now) / 86400000);
  const str = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0) return { str, overdue: true };
  if (diff <= 2) return { str, soon: true };
  return { str };
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const due = formatDate(task.dueDate);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenu(m => !m)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-white/10"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <MoreHorizontal size={15} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-7 z-20 w-36 rounded-xl border shadow-xl overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <button onClick={() => { onEdit(task); setMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--foreground)' }}>
                  <Pencil size={13} /> Edit
                </button>
                {COLUMNS.filter(c => c.id !== task.status).map(col => (
                  <button key={col.id} onClick={() => { onStatusChange(task._id, col.id); setMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: col.color }}>
                    <col.icon size={13} /> Move to {col.label}
                  </button>
                ))}
                <button onClick={() => { onDelete(task._id); setMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm leading-snug mb-1" style={{ color: 'var(--foreground)' }}>
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {task.assignedTo?.slice(0, 3).map(u => (
            <div key={u._id} className="ring-2 rounded-full" style={{ ringColor: 'var(--card)' }}>
              <Avatar user={u} size={6} />
            </div>
          ))}
          {task.assignedTo?.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs ring-2">
              +{task.assignedTo.length - 3}
            </div>
          )}
          {!task.assignedTo?.length && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Unassigned</span>
          )}
        </div>

        {/* Due date */}
        {due && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            due.overdue ? 'bg-red-500/15 text-red-400' :
            due.soon    ? 'bg-amber-500/15 text-amber-400' :
                          'bg-slate-500/15 text-slate-400'
          }`}>
            <Calendar size={10} /> {due.str}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({ open, onClose, onSave, initial, teamMembers }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? {
      title:       initial.title       ?? '',
      description: initial.description ?? '',
      priority:    initial.priority    ?? 'medium',
      status:      initial.status      ?? 'todo',
      assignedTo:  initial.assignedTo?.map(u => u._id ?? u) ?? [],
      dueDate:     initial.dueDate ? initial.dueDate.slice(0, 10) : '',
    } : EMPTY_FORM);
  }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleMember = (id) =>
    set('assignedTo', form.assignedTo.includes(id)
      ? form.assignedTo.filter(x => x !== id)
      : [...form.assignedTo, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
                {initial ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Task title..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(PRIORITY).map(([k, v]) => (
                      <button key={k} type="button"
                        onClick={() => set('priority', k)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                          background: form.priority === k ? v.bg : 'transparent',
                          borderColor: form.priority === k ? v.color : 'var(--border)',
                          color: form.priority === k ? v.color : 'var(--muted-foreground)',
                        }}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => set('dueDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Assign members */}
              {teamMembers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Assign To
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(m => {
                      const u = m.user ?? m;
                      const selected = form.assignedTo.includes(u._id);
                      return (
                        <button key={u._id} type="button"
                          onClick={() => toggleMember(u._id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all"
                          style={{
                            background: selected ? '#3b82f620' : 'transparent',
                            borderColor: selected ? '#3b82f6' : 'var(--border)',
                            color: selected ? '#3b82f6' : 'var(--muted-foreground)',
                          }}>
                          <Avatar user={u} size={5} />
                          {u.firstName} {u.lastName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: '#3b82f6', color: '#fff' }}>
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ col, tasks, onEdit, onDelete, onStatusChange, onAddClick }) {
  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{col.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: col.bg, color: col.color }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={() => onAddClick(col.id)}
          className="p-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted-foreground)' }}
          title={`Add task to ${col.label}`}>
          <Plus size={15} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 rounded-2xl p-3 space-y-3 min-h-[200px]"
        style={{ background: col.bg }}>
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
            <col.icon size={22} style={{ color: col.color }} />
            <span className="text-xs" style={{ color: col.color }}>No tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Tasks() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [modalInitial, setModalInitial] = useState({ status: 'todo' });
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [teamMembers, setTeamMembers] = useState([]);

  // Load teams
  useEffect(() => {
    api.get('/teams').then(res => {
      const t = res.data.teams ?? [];
      setTeams(t);
      if (t.length) setSelectedTeam(t[0]);
    }).catch(() => {});
  }, []);

  // Load tasks when team changes
  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    api.get(`/teams/${selectedTeam._id}/tasks`)
      .then(res => setTasks(res.data.tasks ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));

    // Load team members for assignment
    api.get(`/teams/${selectedTeam._id}`)
      .then(res => setTeamMembers(res.data.team?.members ?? []))
      .catch(() => setTeamMembers([]));
  }, [selectedTeam]);

  // Stats
  const stats = COLUMNS.map(c => ({
    ...c,
    count: tasks.filter(t => t.status === c.id).length,
  }));
  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // Filtered tasks
  const filtered = tasks.filter(t => {
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  // CRUD
  const openCreate = (status = 'todo') => {
    setEditTask(null);
    setModalInitial({ status });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      if (editTask) {
        const res = await api.put(`/teams/${selectedTeam._id}/tasks/${editTask._id}`, form);
        setTasks(prev => prev.map(t => t._id === editTask._id ? res.data.task : t));
      } else {
        const res = await api.post(`/teams/${selectedTeam._id}/tasks`, form);
        setTasks(prev => [res.data.task, ...prev]);
      }
      setModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teams/${selectedTeam._id}/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/teams/${selectedTeam._id}/tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t._id === id ? res.data.task : t));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 fade-up" style={{ color: 'var(--foreground)' }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare size={22} className="text-blue-400" /> Task Board
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Manage and track your team's work
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          disabled={!selectedTeam}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: '#3b82f6', color: '#fff' }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* ── Team Selector ── */}
      {teams.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Users size={15} style={{ color: 'var(--muted-foreground)' }} />
          {teams.map(t => (
            <button key={t._id}
              onClick={() => setSelectedTeam(t)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: selectedTeam?._id === t._id ? (t.color ?? '#3b82f6') + '20' : 'transparent',
                borderColor: selectedTeam?._id === t._id ? (t.color ?? '#3b82f6') : 'var(--border)',
                color: selectedTeam?._id === t._id ? (t.color ?? '#3b82f6') : 'var(--muted-foreground)',
              }}>
              {t.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No teams yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create or join a team to start managing tasks.
          </p>
        </div>
      )}

      {selectedTeam && (
        <>
          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map(s => (
              <div key={s.id} className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1.5">
                  <s.icon size={13} style={{ color: s.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
            <div className="rounded-xl border p-4 flex flex-col gap-1"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} className="text-red-400" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Overdue</span>
              </div>
              <span className="text-2xl font-bold text-red-400">{overdueCount}</span>
            </div>
          </div>

          {/* ── Search + Filter ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} style={{ color: 'var(--muted-foreground)' }} />
              {['all', 'high', 'medium', 'low'].map(p => (
                <button key={p}
                  onClick={() => setFilterPriority(p)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize"
                  style={{
                    background: filterPriority === p
                      ? (p === 'all' ? '#3b82f620' : PRIORITY[p]?.bg)
                      : 'transparent',
                    borderColor: filterPriority === p
                      ? (p === 'all' ? '#3b82f6' : PRIORITY[p]?.color)
                      : 'var(--border)',
                    color: filterPriority === p
                      ? (p === 'all' ? '#3b82f6' : PRIORITY[p]?.color)
                      : 'var(--muted-foreground)',
                  }}>
                  {p === 'all' ? 'All' : PRIORITY[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Kanban Board ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tasks={filtered.filter(t => t.status === col.id)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddClick={openCreate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal ── */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTask ? { ...editTask } : modalInitial}
        teamMembers={teamMembers}
      />
    </div>
  );
}
