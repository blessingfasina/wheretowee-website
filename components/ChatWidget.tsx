'use client';

/**
 * Floating live-chat widget.
 *
 * Talks to the same Supabase chat RPCs as the Flutter app, keyed by
 * the anonymous per-browser device id from lib/consent.ts. While the
 * panel is open it polls `chat_fetch_messages` every 4 seconds with
 * the last seen message id, so replies appear near-instantly without
 * a realtime socket. A closed widget checks unread count once on
 * mount and shows a red dot if the team has replied.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/consent';

interface ChatMsg {
  id: number;
  sender: 'user' | 'admin';
  body: string;
  created_at: string;
}

const POLL_MS = 4000;

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);

  const fetchMessages = useCallback(async (afterId: number): Promise<ChatMsg[]> => {
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) return [];
    const { data, error } = await supabase.rpc('chat_fetch_messages', {
      p_device_id: deviceId,
      p_after_id: afterId,
    });
    if (error || !Array.isArray(data)) return [];
    return data as ChatMsg[];
  }, []);

  const appendMessages = useCallback((fresh: ChatMsg[]) => {
    if (fresh.length === 0) return;
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const next = [...prev, ...fresh.filter((m) => !known.has(m.id))];
      lastIdRef.current = next.length ? next[next.length - 1].id : 0;
      return next;
    });
  }, []);

  // Unread indicator for the closed bubble (checked once on mount).
  useEffect(() => {
    if (open) return;
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) return;
    supabase
      .rpc('chat_unread_count', { p_device_id: deviceId })
      .then(({ data }) => {
        if (typeof data === 'number' && data > 0) setHasUnread(true);
      });
    // Intentionally mount-only: polling resumes when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin-controlled online status (checked once on mount).
  useEffect(() => {
    supabase.rpc('chat_get_online_status').then(({ data, error }) => {
      if (!error && typeof data === 'boolean') setOnline(data);
    });
  }, []);

  // Load history + poll while the panel is open.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const load = async () => {
      const fresh = await fetchMessages(lastIdRef.current);
      if (!cancelled) {
        appendMessages(fresh);
        setLoaded(true);
        setHasUnread(false);
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [open, fetchMessages, appendMessages]);

  // Keep scrolled to the newest message.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const handleSend = async () => {
    const body = input.trim();
    const deviceId = getOrCreateDeviceId();
    if (!body || !deviceId || sending) return;

    setSending(true);
    const { error } = await supabase.rpc('chat_send_message', {
      p_device_id: deviceId,
      p_body: body,
      p_platform: 'web',
    });
    if (!error) {
      setInput('');
      appendMessages(await fetchMessages(lastIdRef.current));
    }
    setSending(false);
  };

  // Keep the widget off the interactive map page — it would cover the
  // map controls on small screens.
  if (pathname?.startsWith('/map')) return null;

  return (
    <>
      {/* Floating bubble + online label */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
          {/* Status label sitting above the bubble */}
          <button
            onClick={() => setOpen(true)}
            aria-label={online ? 'Chat with us — we\'re online' : 'Chat with us — leave a message'}
            className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <span className="relative flex h-2.5 w-2.5">
              {online && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  online ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {online ? (
                <>
                  <span className="sm:hidden">We&apos;re online</span>
                  <span className="hidden sm:inline">Chat with us · We&apos;re online</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Leave a message</span>
                  <span className="hidden sm:inline">Chat with us · Leave a message</span>
                </>
              )}
            </span>
          </button>

          {/* Bubble */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Chat with us"
            className="relative flex h-14 w-14 items-center justify-center self-end rounded-full text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            <MessageCircle className="h-6 w-6" />
            {/* Online/offline dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
              <span
                className={`h-3 w-3 rounded-full ${
                  online ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </span>
            {hasUnread && (
              <span className="absolute -left-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <span className="relative flex h-2 w-2">
                  {online && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      online ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  />
                </span>
                Chat with us
              </p>
              <p className="text-xs text-white/70">
                {online
                  ? 'We usually reply within a few hours'
                  : 'Away right now — leave a message and we\'ll reply'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
            {!loaded ? (
              <p className="pt-8 text-center text-sm text-gray-400">Loading…</p>
            ) : messages.length === 0 ? (
              <div className="px-4 pt-10 text-center">
                <p className="text-base font-semibold text-gray-700">Say hello!</p>
                <p className="mt-1 text-sm text-gray-500">
                  Questions, feedback, a loo that needs fixing — send us a
                  message and we&apos;ll get back to you.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.sender === 'admin'
                        ? 'rounded-bl-sm bg-white text-gray-800 shadow-sm'
                        : 'rounded-br-sm text-white'
                    }`}
                    style={m.sender === 'admin' ? undefined : { backgroundColor: '#1E3A5F' }}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        m.sender === 'admin' ? 'text-gray-400' : 'text-white/70'
                      }`}
                    >
                      {new Date(m.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-gray-100 bg-white p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Type a message…"
              className="max-h-24 flex-1 resize-none rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
            />
            <button
              onClick={handleSend}
              disabled={sending || input.trim().length === 0}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
              style={{ backgroundColor: '#1E3A5F' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
