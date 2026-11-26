'use client';

import {
  AlertCircle,
  DoorOpen,
  Moon,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/useGameStore';
import { AVATAR_OPTIONS, useUserStore } from '@/store/useUserStore';

export default function HomePage() {
  const router = useRouter();

  const {
    playerId,
    playerName,
    avatar,
    lastRoomId,
    isHydrated,
    hydrateFromSession,
    setPlayerName,
    setAvatar,
  } = useUserStore();

  const isConnected = useGameStore((s) => s.isConnected);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const kickedReason = useGameStore((s) => s.kickedReason);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);

  const [roomCodeInput, setRoomCodeInput] = useState('');

  const { createRoom, joinRoom } = useSocket((joinedRoomId) => {
    router.push(`/room/${joinedRoomId}`);
  });

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  const handleCreateRoom = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setErrorMessage(
        'Vui lòng nhập Tên hiển thị (Nickname) trước khi tạo phòng.'
      );
      return;
    }

    setErrorMessage(null);
    createRoom({
      playerName: trimmedName,
      avatar,
      playerId: playerId || undefined,
    });
  };

  const handleJoinRoom = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    const trimmedCode = roomCodeInput.trim().toUpperCase();

    if (!trimmedName) {
      setErrorMessage(
        'Vui lòng nhập Tên hiển thị (Nickname) trước khi vào phòng.'
      );
      return;
    }

    if (trimmedCode.length !== 6) {
      setErrorMessage('Mã phòng phải gồm đúng 6 ký tự.');
      return;
    }

    setErrorMessage(null);
    joinRoom({
      roomId: trimmedCode,
      playerName: trimmedName,
      avatar,
      playerId: playerId || undefined,
    });
  };

  const handleQuickReconnect = () => {
    if (!lastRoomId || !playerName.trim()) return;
    router.push(`/room/${lastRoomId}`);
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
      <div className="w-full max-w-lg rounded-3xl border border-purple-900/50 bg-slate-900/85 p-5 shadow-2xl shadow-purple-950/50 backdrop-blur-xl sm:p-8">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-purple-950 via-slate-900 to-red-950 shadow-lg shadow-amber-500/10 sm:h-16 sm:w-16">
            <Moon className="h-7 w-7 text-amber-400 sm:h-8 sm:w-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Werewolf Online Real-time</span>
          </div>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ma Sói Trực Tuyến
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Khi màn đêm buông xuống, ai là kẻ săn mồi ẩn mình trong ngôi làng?
          </p>
        </div>

        {/* Trạng thái kết nối Server */}
        <div className="mt-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isConnected
                ? 'border border-emerald-800/60 bg-emerald-950/50 text-emerald-300'
                : 'border border-rose-800/60 bg-rose-950/50 text-rose-300'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>Đã kết nối máy chủ</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Đang kết nối máy chủ (localhost:4000)...</span>
              </>
            )}
          </span>
        </div>

        {/* Banner Kết nối lại nhanh nếu người chơi vừa thoát hoặc F5 từ phòng trước */}
        {lastRoomId && playerName.trim() && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
            <div>
              <p className="font-bold text-amber-300">
                Phiên phòng gần nhất: {lastRoomId}
              </p>
              <p className="text-slate-300">
                Kết nối lại ngay với tư cách <strong>{playerName}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickReconnect}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 font-bold text-slate-950 shadow transition hover:bg-amber-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Vào lại</span>
            </button>
          </div>
        )}

        {/* Thông báo lỗi hoặc bị kick */}
        {(errorMessage || kickedReason) && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-800/70 bg-red-950/60 p-3 text-xs text-red-200 sm:text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage || kickedReason}</span>
          </div>
        )}

        {/* Bước 1: Nhập Nickname & Chọn Avatar */}
        <div className="mt-5 space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="nickname"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              1. Tên Hiển Thị (Nickname)
            </label>
            <input
              id="nickname"
              type="text"
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn trong làng..."
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Chọn Biểu Tượng Nhân Vật (Avatar)
            </span>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = avatar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvatar(item.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2 transition active:scale-95 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-purple-800'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{item.emoji}</span>
                    <span
                      className={`mt-1 truncate text-[10px] font-medium sm:text-[11px] ${
                        isSelected ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bước 2: Tạo phòng mới hoặc Nhập mã phòng */}
          <div className="border-t border-slate-800 pt-4 sm:pt-5">
            <button
              type="button"
              onClick={handleCreateRoom}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] sm:py-3.5"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Tạo Phòng Chơi Mới</span>
            </button>

            <div className="my-3.5 flex items-center gap-3 sm:my-4">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                Hoặc vào phòng có sẵn
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col gap-2 sm:flex-row sm:gap-2.5"
            >
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(e.target.value.toUpperCase())
                }
                placeholder="Nhập mã 6 ký tự (VD: WOLF99)"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-center font-mono text-sm font-bold uppercase tracking-widest text-amber-300 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:border-amber-500 focus:outline-none sm:text-left"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-700/70 bg-purple-950/80 px-5 py-3 text-sm font-bold text-purple-100 transition hover:bg-purple-900 active:scale-[0.99]"
              >
                <DoorOpen className="h-4 w-4 text-amber-400" />
                <span>Vào Phòng</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
