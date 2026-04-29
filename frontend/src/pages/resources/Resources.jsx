// resources

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import VideoPlayer from '../../components/ui/video-player';
import {
  Upload, Trash2, Download, FolderOpen, Search,
  FileText, FileImage, FileVideo, FileArchive, File,
  Users, Plus, X, MoreHorizontal, Calendar, HardDrive,
  SlidersHorizontal, Eye
} from 'lucide-react';

const VIDEO_TYPES = ['mp4', 'mov', 'webm', 'ogg', 'avi'];
const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILE_ICONS = {
  pdf:  { icon: FileText,    color: '#ef4444' },
  doc:  { icon: FileText,    color: '#3b82f6' },
  docx: { icon: FileText,    color: '#3b82f6' },
  xls:  { icon: FileText,    color: '#10b981' },
  xlsx: { icon: FileText,    color: '#10b981' },
  ppt:  { icon: FileText,    color: '#f59e0b' },
  pptx: { icon: FileText,    color: '#f59e0b' },
  png:  { icon: FileImage,   color: '#8b5cf6' },
  jpg:  { icon: FileImage,   color: '#8b5cf6' },
  jpeg: { icon: FileImage,   color: '#8b5cf6' },
  gif:  { icon: FileImage,   color: '#8b5cf6' },
  mp4:  { icon: FileVideo,   color: '#ec4899' },
  mov:  { icon: FileVideo,   color: '#ec4899' },
  zip:  { icon: FileArchive, color: '#f59e0b' },
  rar:  { icon: FileArchive, color: '#f59e0b' },
};

function getFileIcon(type) {
  return FILE_ICONS[type?.toLowerCase()] ?? { icon: File, color: '#64748b' };
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function UserAvatar({ user }) {
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';
  const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'];
  const bg = colors[(user?.firstName?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <Avatar className="w-6 h-6" title={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}>
      {user?.avatar && <AvatarImage src={`http://localhost:5000${user.avatar}`} alt={user.firstName} />}
      <AvatarFallback style={{ background: bg, color: '#fff', fontSize: 10, fontWeight: 700 }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ resource, onClose }) {
  if (!resource) return null;
  const type = resource.fileType?.toLowerCase();
  const url = `http://localhost:5000${resource.fileUrl}`;
  const isVideo = VIDEO_TYPES.includes(type);
  const isImage = IMAGE_TYPES.includes(type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl rounded-2xl overflow-hidden border shadow-2xl"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{resource.title}</p>
              <p className="text-xs uppercase font-bold tracking-wider mt-0.5"
                style={{ color: getFileIcon(resource.fileType).color }}>
                {resource.fileType}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <a href={url} download={resource.fileName}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: '#3b82f620', color: '#3b82f6' }}>
                <Download size={12} /> Download
              </a>
              <button onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center"
            style={{ background: '#000' }}>
            {isVideo && <VideoPlayer src={url} className="w-full" />}
            {isImage && (
              <img src={url} alt={resource.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            )}
            {!isVideo && !isImage && (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: getFileIcon(resource.fileType).color + '20' }}>
                  {(() => { const { icon: Icon, color } = getFileIcon(resource.fileType); return <Icon size={32} style={{ color }} />; })()}
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{resource.fileName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Preview not available for this file type
                </p>
                <a href={url} download={resource.fileName}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#3b82f6', color: '#fff' }}>
                  <Download size={14} /> Download File
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Resource Card ─────────────────────────────────────────────────────────────

function ResourceCard({ resource, onDelete, onPreview, canDelete }) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const { icon: Icon, color } = getFileIcon(resource.fileType);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color + '18' }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
            {resource.title}
          </p>
          <p className="text-xs mt-0.5 uppercase font-bold tracking-wider" style={{ color }}>
            {resource.fileType || 'file'}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenu(m => !m)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-all"
            style={{ color: 'var(--muted-foreground)' }}>
            <MoreHorizontal size={15} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-8 z-20 w-36 rounded-xl border shadow-xl overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <button onClick={() => { onPreview(resource); setMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--foreground)' }}>
                  <Eye size={13} /> Preview
                </button>
                <a href={`http://localhost:5000${resource.fileUrl}`} download={resource.fileName}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--foreground)' }}>
                  <Download size={13} /> Download
                </a>
                {canDelete && (
                  <button onClick={() => { onDelete(resource._id); setMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
          {resource.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <UserAvatar user={resource.uploadedBy} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {resource.uploadedBy?.firstName ?? 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-1">
            <HardDrive size={10} /> {formatSize(resource.fileSize)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {timeAgo(resource.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({ open, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setFile(null); setTitle(''); setDescription(''); }
  }, [open]);

  const handleFile = (f) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);
    fd.append('description', description);
    await onUpload(fd);
    setUploading(false);
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
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Upload Resource</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: drag ? '#3b82f6' : 'var(--border)',
                  background: drag ? '#3b82f610' : 'var(--background)',
                }}
              >
                <input ref={inputRef} type="file" className="hidden"
                  onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#3b82f620' }}>
                      <File size={22} className="text-blue-400" />
                    </div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatSize(file.size)}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Drop a file or click to browse
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      PDF, DOCX, images, videos, archives…
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title…"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description…" rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
                <button type="submit" disabled={!file || uploading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: '#3b82f6', color: '#fff' }}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Resources() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    api.get('/teams').then(res => {
      const t = res.data.teams ?? [];
      setTeams(t);
      if (t.length) setSelectedTeam(t[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    api.get(`/teams/${selectedTeam._id}/resources`)
      .then(res => setResources(res.data.resources ?? []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  const handleUpload = async (formData) => {
    try {
      const res = await api.post(`/teams/${selectedTeam._id}/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResources(prev => [res.data.resource, ...prev]);
      setModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teams/${selectedTeam._id}/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (e) { console.error(e); }
  };

  // Unique file types for filter
  const types = ['all', ...new Set(resources.map(r => r.fileType).filter(Boolean))];

  const filtered = resources.filter(r => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.fileType === filterType;
    return matchSearch && matchType;
  });

  // Stats
  const totalSize = resources.reduce((s, r) => s + (r.fileSize ?? 0), 0);

  return (
    <div className="space-y-6 fade-up" style={{ color: 'var(--foreground)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen size={22} className="text-blue-400" /> Resources
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Upload and share files with your team
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} disabled={!selectedTeam}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: '#3b82f6', color: '#fff' }}>
          <Plus size={16} /> Upload File
        </button>
      </div>

      {/* Team selector */}
      {teams.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Users size={15} style={{ color: 'var(--muted-foreground)' }} />
          {teams.map(t => (
            <button key={t._id} onClick={() => setSelectedTeam(t)}
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
          <div className="text-4xl mb-3">📁</div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No teams yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Create or join a team to share resources.</p>
        </div>
      )}

      {selectedTeam && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Files',  value: resources.length,                          color: '#3b82f6', icon: FolderOpen  },
              { label: 'Total Size',   value: formatSize(totalSize),                     color: '#10b981', icon: HardDrive   },
              { label: 'Images',       value: resources.filter(r => ['png','jpg','jpeg','gif'].includes(r.fileType)).length, color: '#8b5cf6', icon: FileImage },
              { label: 'Documents',    value: resources.filter(r => ['pdf','doc','docx','xls','xlsx'].includes(r.fileType)).length, color: '#f59e0b', icon: FileText },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1.5">
                  <s.icon size={13} style={{ color: s.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal size={14} style={{ color: 'var(--muted-foreground)' }} />
              {types.map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize"
                  style={{
                    background: filterType === t ? '#3b82f620' : 'transparent',
                    borderColor: filterType === t ? '#3b82f6' : 'var(--border)',
                    color: filterType === t ? '#3b82f6' : 'var(--muted-foreground)',
                  }}>
                  {t === 'all' ? 'All' : t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <FolderOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
              <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No files yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Upload the first file for <strong>{selectedTeam.name}</strong>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map(r => (
                  <ResourceCard
                    key={r._id}
                    resource={r}
                    onDelete={handleDelete}
                    onPreview={setPreviewResource}
                    canDelete={r.uploadedBy?._id === user?.id || r.uploadedBy?._id === user?._id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <UploadModal open={modalOpen} onClose={() => setModalOpen(false)} onUpload={handleUpload} />

      {/* Preview modal */}
      {previewResource && (
        <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
    </div>
  );
}
