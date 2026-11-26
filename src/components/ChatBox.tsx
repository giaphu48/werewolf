'use client';

import { Flame, Ghost, MessageSquare, Send } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ChatChannel, SanitizedGameState } from '@/types/types';

interface ChatBoxProps {
  roomState: SanitizedGameState;
  onSendChat: (message: string, channel: ChatChannel) => void;
}

export function ChatBox({ roomState, onSendChat }: ChatBoxProps) {
  const chatMessages = useGameStore((s) => s.chatMessages);
  const activeChannel = useGameStore((s) => s.activeChatChannel);
  const setActiveChannel = useGameStore((s) => s.setActiveChatChannel);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selfPlayer = roomState.players.find((p) => p.id === roomState.selfId);
  const isAlive = selfPlayer?.isAlive ?? true;
  const isWolf = selfPlayer?.role === 'WEREWOLF';
  const isNight = roomState.phase === 'NIGHT';
  const isGameOver = roomState.phase === 'GAME_OVER';

  // Xác định các kênh mà người chơi được phép xem/chuyển tab
  const canUseWolfChannel = (isWolf && isNight && isAlive) || !isAlive;
  const canUseDeadChannel = !isAlive || isGameOver;

  // Kiểm tra quyền gửi tin nhắn ở kênh đang mở
  const canSendInActiveChannel = (() => {
    if (activeChannel === 'PUBLIC') {
      if (isGameOver || roomState.phase === 'LOBBY') return true;
      return isAlive && !isNight;
    }
    if (activeChannel === 'WOLF') {
      return isAlive && isWolf && isNight;
    }
    if (activeChannel === 'DEAD') {
      return !isAlive || isGameOver;
    }
    return false;
  })();

  const filteredMessages = chatMessages.filter(
    (msg) => msg.channel === activeChannel
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, activeChannel]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !canSendInActiveChannel) return;

    onSendChat(trimmed, activeChannel);
    setInput('');
  };

  return (
    <div className="flex h-[360px] flex-col rounded-2xl border border-slate-800/90 bg-slate-900/85 shadow-xl backdrop-blur-md">
      {/* Header & Channel Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
          <MessageSquare className="h-4 w-4 text-amber-400" />
          <span>Trò Chuyện</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveChannel('PUBLIC')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeChannel === 'PUBLIC'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            <span>Dân Làng</span>
          </button>

          {canUseWolfChannel && (
            <button
              type="button"
              onClick={() => setActiveChannel('WOLF')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeChannel === 'WOLF'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-950/60 text-red-300 hover:bg-red-900/50'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Bầy Sói</span>
            </button>
          )}

          {canUseDeadChannel && (
            <button
              type="button"
              onClick={() => setActiveChannel('DEAD')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeChannel === 'DEAD'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/50'
              }`}
            >
              <Ghost className="h-3 w-3" />
              <span>Linh Hồn</span>
            </button>
          )}
        </div>
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5 text-xs">
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <p>
              {activeChannel === 'PUBLIC' &&
                'Chưa có tin nhắn nào ở kênh Dân Làng.'}
              {activeChannel === 'WOLF' &&
                'Kênh bí mật của Bầy Sói trong đêm tối.'}
              {activeChannel === 'DEAD' &&
                'Nơi trò chuyện của những Linh Hồn đã ngã xuống.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === roomState.selfId;
            const timeStr = new Date(msg.timestamp).toLocaleTimeString(
              'vi-VN',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                <div className="mb-0.5 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isMe ? 'Bạn' : msg.senderName}
                  </span>
                  <span>•</span>
                  <span>{timeStr}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.channel === 'WOLF'
                      ? 'border border-red-800/60 bg-red-950/70 text-red-100'
                      : msg.channel === 'DEAD'
                        ? 'border border-purple-800/60 bg-purple-950/70 text-purple-100'
                        : isMe
                          ? 'bg-amber-500 font-medium text-slate-950'
                          : 'border border-slate-800 bg-slate-950/80 text-slate-200'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-800 p-2.5"
      >
        <input
          type="text"
          maxLength={300}
          disabled={!canSendInActiveChannel}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            !canSendInActiveChannel
              ? activeChannel === 'PUBLIC' && isNight
                ? 'Không thể chat kênh chung vào ban đêm...'
                : !isAlive && activeChannel === 'PUBLIC'
                  ? 'Người đã chết chỉ chat được ở kênh Linh Hồn...'
                  : 'Bạn không thể gửi tin nhắn ở kênh này...'
              : activeChannel === 'WOLF'
                ? 'Nhắn tin mật cho đồng đội Sói...'
                : activeChannel === 'DEAD'
                  ? 'Trò chuyện cùng các Linh Hồn...'
                  : 'Nhập tin nhắn thảo luận...'
          }
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!canSendInActiveChannel || !input.trim()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
