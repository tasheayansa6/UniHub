// profile

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  User, Mail, Shield, Calendar, Pencil, Check, X,
  Plus, Lock, Eye, EyeOff, Save, Users,
  Star, Camera, Loader2
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ user, size = 20 }) {
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';
  const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'];
  const idx = (user?.firstName?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: colors[idx], fontSize: size * 2 }}>
      {initials}
    </div>
  );
}

function Field({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
        <Icon size={12} /> {label}
      </label>
      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{value || '—'}</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '', skills: [] });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Password change
  const [pwSection, setPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, bio: user.bio ?? '', skills: user.skills ?? [] });
  }, [user]);

  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data.teams ?? [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
    setNewSkill('');
  };

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.post('/auth/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.user);
      setSaveMsg('Photo updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to upload photo.');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      setSaveMsg('Saved!');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg('Failed to save.');
    } finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault(); setPwMsg('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => { setPwMsg(''); setPwSection(false); }, 3000);
    } catch (e) {
      setPwMsg(e.response?.data?.message ?? 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  if (!user) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-up max-w-3xl" style={{ color: 'var(--foreground)' }}>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User size={22} className="text-blue-400" /> Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

        {/* Banner */}
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }} />

        {/* Avatar + name row */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative group">
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar circle */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="cursor-pointer rounded-full overflow-hidden transition-all"
                style={{
                  width: 80, height: 80,
                  boxShadow: '0 0 0 4px var(--card)',
                }}
                title="Click to change photo"
              >
                {(avatarPreview || user.avatar) ? (
                  <img
                    src={avatarPreview || `http://localhost:5000${user.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{
                      background: ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'][
                        (user.firstName?.charCodeAt(0) ?? 0) % 6
                      ]
                    }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Hover overlay — sits on top, outside overflow-hidden */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {avatarUploading
                  ? <Loader2 size={22} className="text-white animate-spin" />
                  : <Camera size={22} className="text-white" />
                }
              </div>

              {/* Upload indicator ring */}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              )}

              {/* Always-visible label */}
              <p className="text-center text-xs mt-1.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {avatarUploading ? 'Uploading…' : 'Change photo'}
              </p>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: editing ? '#10b981' : '#3b82f6', color: '#fff' }}>
              {editing ? <><Save size={14} /> {saving ? 'Saving…' : 'Save'}</> : <><Pencil size={14} /> Edit Profile</>}
            </button>
          </div>

          {saveMsg && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm font-medium mb-3"
              style={{ color: saveMsg.includes('!') ? '#10b981' : '#ef4444' }}>
              {saveMsg}
            </motion.p>
          )}

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['firstName','First Name'], ['lastName','Last Name']].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Bio</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Tell your team about yourself…" rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              {/* Skills editor */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <AnimatePresence>
                    {form.skills.map(s => (
                      <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill…"
                    className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <button onClick={addSkill}
                    className="px-3 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: '#3b82f6', color: '#fff' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button onClick={() => { setEditing(false); setForm({ firstName: user.firstName, lastName: user.lastName, bio: user.bio ?? '', skills: user.skills ?? [] }); }}
                className="text-sm font-medium hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm capitalize font-medium mt-0.5" style={{ color: '#3b82f6' }}>{user.role}</p>
              </div>
              {user.bio && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{user.bio}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <Field label="Email"    value={user.email}    icon={Mail}     />
                <Field label="Role"     value={user.role}     icon={Shield}   />
                <Field label="Member since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'} icon={Calendar} />
              </div>
              {user.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <Star size={12} /> Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Users size={16} className="text-amber-400" /> My Teams
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: '#f59e0b20', color: '#f59e0b' }}>{teams.length}</span>
        </h3>
        {teams.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>You haven't joined any teams yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map(t => {
              const myRole = t.members?.find(m => (m.user?._id ?? m.user) === user.id)?.role ?? 'member';
              return (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ borderLeft: `3px solid ${t.color ?? '#3b82f6'}`, borderColor: 'var(--border)', background: 'var(--background)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: (t.color ?? '#3b82f6') + '20' }}>
                    👥
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{t.name}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>
                      {myRole} · {t.members?.length ?? 0} members
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <button onClick={() => setPwSection(s => !s)}
          className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
          style={{ color: 'var(--foreground)' }}>
          <span className="font-bold flex items-center gap-2">
            <Lock size={16} className="text-red-400" /> Change Password
          </span>
          <motion.span animate={{ rotate: pwSection ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.span>
        </button>

        <AnimatePresence>
          {pwSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handlePwChange} className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="pt-4" />
                {[
                  { key: 'currentPassword', label: 'Current Password' },
                  { key: 'newPassword',     label: 'New Password'     },
                  { key: 'confirm',         label: 'Confirm Password' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                    <div className="relative">
                      <input
                        type={showPw[key] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        required
                        className="w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                        style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--muted-foreground)' }}>
                        {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwMsg && (
                  <p className="text-sm font-medium" style={{ color: pwMsg.includes('success') ? '#10b981' : '#ef4444' }}>
                    {pwMsg}
                  </p>
                )}

                <button type="submit" disabled={pwSaving}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
