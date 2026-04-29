// messages

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { Send, Users, Hash, Circle, Loader2, ArrowDown } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ user, size = 8 }) {
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];
  const idx = (user?.firstName?.charCodeAt(0) ?? 0) % colors.length;
  const px = size * 4;
  return (
    <div
      title={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none"
      style={{ width: px, height: px, background: colors[idx], fontSize: px * 0.38 }}
    >
      {initials}
    </div>
  );
}

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(date) {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// Group messages by date and consecutive sender
function groupMessages(messages) {
  const groups = [];
  let lastDate = null;
  let lastSenderId = null;

  messages.forEach((msg, i) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    const senderId = msg.sender?._id ?? msg.sender;

    if (msgDate !== lastDate) {
      groups.push({ type: 'divider', date: msg.createdAt, key: `div-${i}` });
      lastDate = msgDate;
      lastSenderId = null;
    }

    const showAvatar = senderId !== lastSenderId;
    groups.push({ type: 'message', msg, showAvatar, key: msg._id });
    lastSenderId = senderId;
  });

  return groups;
}

// ─── Socket singleton ─────────────────────────────────────────────────────────

let socketInstance = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const activeTeamRef = useRef(null);
  const socketRef = useRef(null);

  // ── Load teams ──
  useEffect(() => {
    api.get('/teams')
      .then(res => {
        const t = res.data.teams ?? [];
        setTeams(t);
        if (t.length) setActiveTeam(t[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingTeams(false));
  }, []);

  // ── Socket setup ──
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    setConnected(socket.connected);

    socket.on('new-message', (data) => {
      // Only add if it's for the currently active team
      if (data.teamId === activeTeamRef.current?._id) {
        setMessages(prev => {
          // Deduplicate — server echo may arrive alongside optimistic message
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // ── Join/leave team rooms ──
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeTeam) return;

    // Leave previous room
    if (activeTeamRef.current && activeTeamRef.current._id !== activeTeam._id) {
      socket.emit('leave-team', activeTeamRef.current._id);
    }

    activeTeamRef.current = activeTeam;
    socket.emit('join-team', activeTeam._id);

    // Load message history
    setLoadingMsgs(true);
    setMessages([]);
    api.get(`/teams/${activeTeam._id}/messages`)
      .then(res => setMessages(res.data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));

    return () => {
      socket.emit('leave-team', activeTeam._id);
    };
  }, [activeTeam]);

  // ── Auto-scroll ──
  useEffect(() => {
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, atBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < threshold);
  }, []);

  // ── Send message ──
  const handleSend = async () => {
    const content = text.trim();
    if (!content || !activeTeam || sending) return;

    setText('');
    setSending(true);

    // Optimistic message
    const optimistic = {
      _id: `opt-${Date.now()}`,
      content,
      sender: {
        _id: user?.id ?? user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
      team: activeTeam._id,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setAtBottom(true);

    try {
      const res = await api.post(`/teams/${activeTeam._id}/messages`, { content });
      const saved = res.data.message;

      // Replace optimistic with real
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));

      // Broadcast via socket so other users get it
      socketRef.current?.emit('send-message', {
        teamId: activeTeam._id,
        message: saved,
      });
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setText(content); // restore text
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const grouped = groupMessages(messages);
  const myId = user?.id ?? user?._id;

  // ── Render ──
  return (
    <div className="flex h-[calc(100vh-56px)] rounded-xl overflow-hidden border"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col flex-shrink-0 border-r"
        style={{ width: 240, borderColor: 'var(--border)', background: 'var(--card)' }}>

        {/* Sidebar header */}
        <div className="px-4 py-3 border-b flex items-center gap-2"
          style={{ borderColor: 'var(--border)' }}>
          <Hash size={14} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--muted-foreground)' }}>Team Chats</span>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loadingTeams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : teams.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Users size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No teams yet</p>
            </div>
          ) : (
            teams.map(team => {
              const active = activeTeam?._id === team._id;
              return (
                <button key={team._id} onClick={() => setActiveTeam(team)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                  style={{
                    background: active ? 'var(--accent)' : 'transparent',
                    borderLeft: `3px solid ${active ? (team.color ?? '#3b82f6') : 'transparent'}`,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: (team.color ?? '#3b82f6') + '20' }}>
                    💬
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate"
                      style={{ color: active ? (team.color ?? '#3b82f6') : 'var(--foreground)' }}>
                      {team.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {team.members?.length ?? 0} members
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Connection status */}
        <div className="px-4 py-3 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border)' }}>
          <Circle size={8} fill={connected ? '#10b981' : '#ef4444'}
            style={{ color: connected ? '#10b981' : '#ef4444' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {connected ? 'Connected' : 'Reconnecting…'}
          </span>
        </div>
      </aside>

      {/* ── Chat area ── */}
      {!activeTeam ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3"
          style={{ color: 'var(--muted-foreground)' }}>
          <Hash size={40} className="opacity-20" />
          <p className="text-sm">Select a team to start chatting</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--background)' }}>

          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: (activeTeam.color ?? '#3b82f6') + '20' }}>
                💬
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{activeTeam.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {activeTeam.members?.length ?? 0} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: connected ? '#10b98115' : '#ef444415', color: connected ? '#10b981' : '#ef4444' }}>
              <Circle size={6} fill="currentColor" />
              {connected ? 'Live' : 'Offline'}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-0.5">

            {loadingMsgs ? (
              <div className="flex items-center justify-center flex-1 py-16">
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3"
                style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-5xl">💬</div>
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  No messages yet
                </p>
                <p className="text-xs">Be the first to say something in {activeTeam.name}!</p>
              </div>
            ) : (
              grouped.map(item => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.key} className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      <span className="text-xs font-semibold px-2"
                        style={{ color: 'var(--muted-foreground)' }}>
                        {formatDateDivider(item.date)}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                  );
                }

                const { msg, showAvatar } = item;
                const isMine = (msg.sender?._id ?? msg.sender) === myId;

                return (
                  <div key={item.key}
                    className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>

                    {/* Avatar — only on first message in a group */}
                    <div className="flex-shrink-0" style={{ width: 32 }}>
                      {showAvatar && !isMine && <Avatar user={msg.sender} size={8} />}
                    </div>

                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[65%]`}>
                      {/* Sender name */}
                      {showAvatar && !isMine && (
                        <span className="text-xs font-semibold mb-1 px-1"
                          style={{ color: 'var(--muted-foreground)' }}>
                          {msg.sender?.firstName} {msg.sender?.lastName}
                        </span>
                      )}

                      {/* Bubble */}
                      <div className="px-3.5 py-2 text-sm leading-relaxed"
                        style={{
                          background: isMine ? '#3b82f6' : 'var(--card)',
                          color: isMine ? '#fff' : 'var(--foreground)',
                          borderRadius: isMine
                            ? (showAvatar ? '18px 18px 4px 18px' : '18px 4px 4px 18px')
                            : (showAvatar ? '18px 18px 18px 4px' : '4px 18px 18px 4px'),
                          border: isMine ? 'none' : '1px solid var(--border)',
                          opacity: msg.optimistic ? 0.7 : 1,
                        }}>
                        {msg.content}
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs mt-1 px-1" style={{ color: 'var(--muted-foreground)' }}>
                        {formatTime(msg.createdAt)}
                        {msg.optimistic && ' · sending…'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom button */}
          {!atBottom && (
            <button
              onClick={() => { setAtBottom(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              className="absolute bottom-24 right-8 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <ArrowDown size={16} />
            </button>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t flex-shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="flex items-end gap-3 rounded-2xl border px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/30"
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeTeam.name}…`}
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed"
                style={{
                  color: 'var(--foreground)',
                  maxHeight: 120,
                  overflowY: text.split('\n').length > 4 ? 'auto' : 'hidden',
                }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: '#3b82f6', color: '#fff' }}>
                {sending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Send size={14} />}
              </button>
            </div>
            <p className="text-xs mt-1.5 px-1" style={{ color: 'var(--muted-foreground)' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
