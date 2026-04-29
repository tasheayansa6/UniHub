import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus, X, Users, Search, Pencil, Trash2, UserPlus,
  Crown, Shield, ChevronRight, Calendar, BookOpen,
  MoreHorizontal, Mail, LogOut, AlertTriangle, Check
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899',
];

const AVATAR_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899',
  '#06b6d4', '#f97316', '#84cc16', '#a855f7',
];

const EMPTY_FORM = { name: '', description: '', subject: '', color: '#3b82f6' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarColor(firstName) {
  if (!firstName) return AVATAR_COLORS[0];
  return AVATAR_COLORS[firstName.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 32, className = '' }) {
  if (!user) return null;
  const bg = getAvatarColor(user.firstName);
  const initials = getInitials(user.firstName, user.lastName);
  return (
    <div
      title={`${user.firstName} ${user.lastName}`}
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.max(10, size * 0.38),
      }}
    >
      {initials}
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const isLeader = role === 'leader';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isLeader ? '#f59e0b20' : '#3b82f620',
        color: isLeader ? '#f59e0b' : '#3b82f6',
      }}
    >
      {isLeader ? <Crown size={10} /> : <Shield size={10} />}
      {isLeader ? 'Leader' : 'Member'}
    </span>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: danger ? '#ef444420' : '#3b82f620' }}>
                <AlertTriangle size={18} style={{ color: danger ? '#ef4444' : '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{title}</h3>
            </div>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: danger ? '#ef4444' : '#3b82f6', color: '#fff' }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Team Form Modal ──────────────────────────────────────────────────────────

function TeamModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name ?? '', description: initial.description ?? '', subject: initial.subject ?? '', color: initial.color ?? '#3b82f6' }
        : EMPTY_FORM
      );
      setError('');
    }
  }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Team name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: form.color + '25' }}>
                  <Users size={15} style={{ color: form.color }} />
                </div>
                <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
                  {initial ? 'Edit Team' : 'Create Team'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Team Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Algorithm Study Group"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  placeholder="e.g. Computer Science, Mathematics…"
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
                  placeholder="What is this team about?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  Team Color
                </label>
                <div className="flex items-center gap-2.5">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('color', c)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                      style={{
                        background: c,
                        outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                        outlineOffset: '2px',
                      }}
                    >
                      {form.color === c && <Check size={14} color="#fff" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: form.color, color: '#fff' }}
                >
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Team'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Team Detail Panel ────────────────────────────────────────────────────────

function TeamDetailPanel({ team, currentUserId, onClose, onMemberAdded, onMemberRemoved }) {
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null); // { userId, name }

  const currentMember = team.members?.find(m => m.user?._id === currentUserId);
  const isLeader = currentMember?.role === 'leader';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      const res = await api.post(`/teams/${team._id}/members`, { email: email.trim() });
      setAddSuccess('Member added successfully!');
      setEmail('');
      onMemberAdded(res.data.team ?? res.data);
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (err) {
      setAddError(err?.response?.data?.message ?? 'Could not add member.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmRemove) return;
    try {
      const res = await api.delete(`/teams/${team._id}/members/${confirmRemove.userId}`);
      onMemberRemoved(confirmRemove.userId, res.data.team ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmRemove(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full z-50 w-full max-w-sm shadow-2xl flex flex-col"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Panel Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: team.color ?? '#3b82f6' }}
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>
                {team.name}
              </h3>
              {team.subject && (
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {team.subject}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          {team.description && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                About
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                {team.description}
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-col gap-2">
            {team.createdBy && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <Crown size={12} />
                <span>Created by <strong style={{ color: 'var(--foreground)' }}>{team.createdBy.firstName} {team.createdBy.lastName}</strong></span>
              </div>
            )}
            {team.createdAt && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <Calendar size={12} />
                <span>{formatDate(team.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                Members ({team.members?.length ?? 0})
              </p>
            </div>
            <div className="space-y-2">
              {team.members?.map(m => {
                const u = m.user;
                if (!u) return null;
                const isSelf = u._id === currentUserId;
                return (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <Avatar user={u} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {u.firstName} {u.lastName}
                          {isSelf && <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>(you)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail size={10} style={{ color: 'var(--muted-foreground)' }} />
                        <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{u.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <RoleBadge role={m.role} />
                      {isLeader && !isSelf && (
                        <button
                          onClick={() => setConfirmRemove({ userId: u._id, name: `${u.firstName} ${u.lastName}` })}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                          title="Remove member"
                        >
                          <LogOut size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Member (leader only) */}
          {isLeader && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Add Member by Email
              </p>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  type="submit"
                  disabled={adding || !email.trim()}
                  className="px-3 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 flex items-center gap-1.5"
                  style={{ background: '#3b82f6', color: '#fff' }}
                >
                  {adding ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                </button>
              </form>
              {addError && (
                <p className="text-xs text-red-400 mt-1.5">{addError}</p>
              )}
              {addSuccess && (
                <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                  <Check size={11} /> {addSuccess}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirm remove dialog */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Member"
        message={`Remove ${confirmRemove?.name} from this team? They will lose access to all team resources.`}
        onConfirm={handleRemoveMember}
        onCancel={() => setConfirmRemove(null)}
        danger
      />
    </>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ team, currentUserId, onEdit, onDelete, onViewDetail, index }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const currentMember = team.members?.find(m => m.user?._id === currentUserId);
  const isLeader = currentMember?.role === 'leader';
  const visibleMembers = team.members?.slice(0, 4) ?? [];
  const extraCount = (team.members?.length ?? 0) - visibleMembers.length;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
      className="group relative rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      onClick={() => onViewDetail(team)}
    >
      {/* Colored left border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: team.color ?? '#3b82f6' }}
      />

      {/* Top color strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${team.color ?? '#3b82f6'}60, transparent)` }}
      />

      <div className="p-5 pl-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>
                {team.name}
              </h3>
              <RoleBadge role={currentMember?.role ?? 'member'} />
            </div>
            {team.subject && (
              <div className="flex items-center gap-1.5">
                <BookOpen size={11} style={{ color: team.color ?? '#3b82f6' }} />
                <span className="text-xs font-medium" style={{ color: team.color ?? '#3b82f6' }}>
                  {team.subject}
                </span>
              </div>
            )}
          </div>

          {/* Menu */}
          <div
            className="relative flex-shrink-0"
            ref={menuRef}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-white/10"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <MoreHorizontal size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 z-20 w-40 rounded-xl border shadow-xl overflow-hidden"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => { onViewDetail(team); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Users size={13} /> View Members
                  </button>
                  {isLeader && (
                    <>
                      <button
                        onClick={() => { onEdit(team); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <Pencil size={13} /> Edit Team
                      </button>
                      <button
                        onClick={() => { onDelete(team); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} /> Delete Team
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {team.description ? (
          <p
            className="text-xs leading-relaxed line-clamp-2 mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {team.description}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Stacked avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {visibleMembers.map(m => (
                <div
                  key={m.user?._id}
                  className="ring-2 rounded-full"
                  style={{ '--tw-ring-color': 'var(--card)' }}
                >
                  <Avatar user={m.user} size={28} />
                </div>
              ))}
              {extraCount > 0 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--muted-foreground)',
                    '--tw-ring-color': 'var(--card)',
                  }}
                >
                  +{extraCount}
                </div>
              )}
            </div>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {team.members?.length ?? 0} member{(team.members?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* View detail arrow */}
          <div
            className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: team.color ?? '#3b82f6' }}
          >
            View <ChevronRight size={13} />
          </div>
        </div>

        {/* Creator + date */}
        <div
          className="flex items-center justify-between mt-3 pt-3 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {team.createdBy && (
            <span className="flex items-center gap-1">
              <Crown size={10} />
              {team.createdBy.firstName} {team.createdBy.lastName}
            </span>
          )}
          {team.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(team.createdAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: '#3b82f615', border: '2px dashed #3b82f640' }}
        >
          <Users size={40} style={{ color: '#3b82f6' }} />
        </div>
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#f59e0b20', border: '2px solid #f59e0b40' }}
        >
          <Crown size={14} style={{ color: '#f59e0b' }} />
        </div>
        <div
          className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#10b98120', border: '2px solid #10b98140' }}
        >
          <BookOpen size={12} style={{ color: '#10b981' }} />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
        No teams yet
      </h3>
      <p className="text-sm max-w-xs leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Create your first team to start collaborating with classmates on projects and assignments.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: '#3b82f6', color: '#fff' }}
      >
        <Plus size={16} /> Create Your First Team
      </button>
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ teams, currentUserId }) {
  const totalMembers = teams.reduce((acc, t) => {
    const unique = new Set(t.members?.map(m => m.user?._id).filter(Boolean));
    return acc + unique.size;
  }, 0);
  const leaderCount = teams.filter(t =>
    t.members?.some(m => m.user?._id === currentUserId && m.role === 'leader')
  ).length;

  const stats = [
    {
      label: 'Total Teams',
      value: teams.length,
      icon: Users,
      color: '#3b82f6',
      bg: '#3b82f615',
    },
    {
      label: 'Total Members',
      value: totalMembers,
      icon: UserPlus,
      color: '#10b981',
      bg: '#10b98115',
    },
    {
      label: 'Leading',
      value: leaderCount,
      icon: Crown,
      color: '#f59e0b',
      bg: '#f59e0b15',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg }}
          >
            <s.icon size={18} style={{ color: s.color }} />
          </div>
          <div>
            <div className="text-2xl font-bold leading-none" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {s.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState(null);   // team object to edit
  const [deleteTeam, setDeleteTeam] = useState(null); // team object to delete
  const [detailTeam, setDetailTeam] = useState(null); // team object for detail panel

  // ── Load teams ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get('/teams')
      .then(res => setTeams(res.data.teams ?? []))
      .catch(err => console.error('Failed to load teams:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD handlers ────────────────────────────────────────────────────────────

  const handleCreate = async (form) => {
    const res = await api.post('/teams', form);
    const newTeam = res.data.team ?? res.data;
    setTeams(prev => [newTeam, ...prev]);
    setCreateOpen(false);
  };

  const handleEdit = async (form) => {
    const res = await api.put(`/teams/${editTeam._id}`, form);
    const updated = res.data.team ?? res.data;
    setTeams(prev => prev.map(t => t._id === editTeam._id ? updated : t));
    // Also update detail panel if open
    if (detailTeam?._id === editTeam._id) setDetailTeam(updated);
    setEditTeam(null);
  };

  const handleDelete = async () => {
    if (!deleteTeam) return;
    try {
      await api.delete(`/teams/${deleteTeam._id}`);
      setTeams(prev => prev.filter(t => t._id !== deleteTeam._id));
      if (detailTeam?._id === deleteTeam._id) setDetailTeam(null);
    } catch (err) {
      console.error('Failed to delete team:', err);
    } finally {
      setDeleteTeam(null);
    }
  };

  const handleMemberAdded = (updatedTeam) => {
    if (!updatedTeam?._id) return;
    setTeams(prev => prev.map(t => t._id === updatedTeam._id ? updatedTeam : t));
    setDetailTeam(updatedTeam);
  };

  const handleMemberRemoved = (userId, updatedTeam) => {
    if (updatedTeam?._id) {
      setTeams(prev => prev.map(t => t._id === updatedTeam._id ? updatedTeam : t));
      setDetailTeam(updatedTeam);
    } else {
      // Fallback: remove locally
      setTeams(prev => prev.map(t => {
        if (t._id !== detailTeam?._id) return t;
        return { ...t, members: t.members.filter(m => m.user?._id !== userId) };
      }));
      setDetailTeam(prev => prev
        ? { ...prev, members: prev.members.filter(m => m.user?._id !== userId) }
        : prev
      );
    }
  };

  // ── Filtered teams ───────────────────────────────────────────────────────────
  const filtered = teams.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" style={{ color: 'var(--foreground)' }}>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#3b82f620' }}
            >
              <Users size={18} style={{ color: '#3b82f6' }} />
            </div>
            Teams
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Collaborate with classmates on projects and assignments
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 self-start sm:self-auto"
          style={{ background: '#3b82f6', color: '#fff' }}
        >
          <Plus size={16} /> New Team
        </button>
      </div>

      {/* ── Stats Bar ── */}
      {!loading && teams.length > 0 && (
        <StatsBar teams={teams} currentUserId={user?._id} />
      )}

      {/* ── Search ── */}
      {!loading && teams.length > 0 && (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-foreground)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams by name, subject…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl border h-52 animate-pulse"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState onCreateClick={() => setCreateOpen(true)} />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search size={36} className="mb-3 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No teams match "{search}"</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Try a different search term.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((team, i) => (
              <TeamCard
                key={team._id}
                team={team}
                currentUserId={user?._id}
                index={i}
                onEdit={(t) => setEditTeam(t)}
                onDelete={(t) => setDeleteTeam(t)}
                onViewDetail={(t) => setDetailTeam(t)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Create Modal ── */}
      <TeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        initial={null}
      />

      {/* ── Edit Modal ── */}
      <TeamModal
        open={!!editTeam}
        onClose={() => setEditTeam(null)}
        onSave={handleEdit}
        initial={editTeam}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTeam}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteTeam?.name}"? This action cannot be undone and all team data will be lost.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTeam(null)}
        danger
      />

      {/* ── Detail Panel ── */}
      <AnimatePresence>
        {detailTeam && (
          <TeamDetailPanel
            key={detailTeam._id}
            team={detailTeam}
            currentUserId={user?._id}
            onClose={() => setDetailTeam(null)}
            onMemberAdded={handleMemberAdded}
            onMemberRemoved={handleMemberRemoved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
