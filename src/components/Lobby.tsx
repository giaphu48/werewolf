'use client';

import {
  Check,
  Clock,
  Copy,
  Crown,
  LogOut,
  Minus,
  Play,
  Plus,
  Settings,
  ShieldAlert,
  Sparkles,
  UserMinus,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import { getAvatarEmoji } from '@/store/useUserStore';
import { Role, RoomSettings, SanitizedGameState } from '@/types/types';

interface LobbyProps {
  roomState: SanitizedGameState;
  onLeaveRoom: () => void;
  onKickPlayer: (targetPlayerId: string) => void;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onStartGame: () => void;
}

interface RoleMeta {
  role: Exclude<Role, 'VILLAGER'>;
  name: string;
  faction: 'WEREWOLF' | 'VILLAGER';
  description: string;
  min: number;
  max: number;
}

const CONFIGURABLE_ROLES: RoleMeta[] = [
  {
    role: 'WEREWOLF',
    name: 'Ma Sói',
    faction: 'WEREWOLF',
    description: 'Thức dậy mỗi đêm để chọn 1 dân làng làm con mồi.',
    min: 1,
    max: 5,
  },
  {
    role: 'SEER',
    name: 'Tiên Tri',
    faction: 'VILLAGER',
    description: 'Mỗi đêm soi 1 người để biết họ có phải Ma Sói không.',
    min: 0,
    max: 2,
  },
  {
    role: 'BODYGUARD',
    name: 'Bảo Vệ',
    faction: 'VILLAGER',
    description:
      'Bảo vệ 1 người mỗi đêm khỏi Sói cắn (không trùng 2 đêm liên tiếp).',
    min: 0,
    max: 2,
  },
  {
    role: 'WITCH',
    name: 'Phù Thủy',
    faction: 'VILLAGER',
    description: 'Sở hữu 1 Bình Cứu và 1 Bình Độc dùng duy nhất 1 lần cả trận.',
    min: 0,
    max: 2,
  },
  {
    role: 'HUNTER',
    name: 'Thợ Săn',
    faction: 'VILLAGER',
    description: 'Khi chết được quyền kéo theo 1 người chơi khác.',
    min: 0,
    max: 2,
  },
];

export function Lobby({
  roomState,
  onLeaveRoom,
  onKickPlayer,
  onUpdateSettings,
  onStartGame,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const isHost = roomState.selfId === roomState.hostId;
  const playerCount = roomState.players.length;
  const { settings } = roomState;

  const specialAndWolfCount =
    settings.rolesConfig.WEREWOLF +
    settings.rolesConfig.SEER +
    settings.rolesConfig.BODYGUARD +
    settings.rolesConfig.WITCH +
    settings.rolesConfig.HUNTER;

  const autoVillagerCount = Math.max(0, playerCount - specialAndWolfCount);
  const canStartGame =
    isHost &&
    playerCount >= 6 &&
    playerCount <= 16 &&
    specialAndWolfCount < playerCount;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleRoleDelta = (
    role: Exclude<Role, 'VILLAGER'>,
    delta: number,
    min: number,
    max: number
  ) => {
    if (!isHost) return;
    const current = settings.rolesConfig[role];
    const nextValue = Math.min(max, Math.max(min, current + delta));
    if (nextValue === current) return;

    onUpdateSettings({
      rolesConfig: {
        ...settings.rolesConfig,
        [role]: nextValue,
      },
    });
  };

  const handleDurationChange = (
    key: 'maxPlayers' | 'nightDuration' | 'discussionDuration' | 'votingDuration',
    value: number
  ) => {
    if (!isHost) return;
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-purple-900/50 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Sảnh Chờ Ngôi Làng Huyền Bí</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Phòng:{' '}
              <span className="font-mono text-amber-400">
                {roomState.roomId}
              </span>
            </h1>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm">
            <span className="text-slate-400">Người chơi: </span>
            <span className="font-bold text-amber-400">
              {playerCount}/{settings.maxPlayers}
            </span>
          </div>

          <button
            type="button"
            onClick={onLeaveRoom}
            className="inline-flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-900/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Rời phòng</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Danh sách người chơi (7 cols) */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-xl backdrop-blur-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Danh Sách Dân Làng ({playerCount})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Cần tối thiểu 6 người chơi để bắt đầu
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roomState.players.map((player) => {
              const isSelf = player.id === roomState.selfId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                    isSelf
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-purple-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-800/50 bg-purple-950/70 text-2xl shadow-inner">
                      {getAvatarEmoji(player.avatar)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-slate-100">
                          {player.name}
                        </p>
                        {isSelf && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs">
                        {player.isHost ? (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-400">
                            <Crown className="h-3.5 w-3.5" />
                            Chủ phòng
                          </span>
                        ) : (
                          <span className="text-slate-400">Người chơi</span>
                        )}
                        <span className="text-slate-700">•</span>
                        {player.isConnected ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <Wifi className="h-3 w-3" />
                            Trực tuyến
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400">
                            <WifiOff className="h-3 w-3" />
                            Mất kết nối
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isHost && !player.isHost && (
                    <button
                      type="button"
                      onClick={() => onKickPlayer(player.id)}
                      title="Đuổi người chơi này khỏi phòng"
                      className="rounded-lg border border-red-900/50 bg-red-950/40 p-2 text-red-400 transition hover:bg-red-900/60 hover:text-red-200"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nút Bắt Đầu Ván Đấu */}
          <div className="mt-6 border-t border-slate-800/80 pt-5">
            {specialAndWolfCount >= playerCount && playerCount >= 6 && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/50 px-4 py-2.5 text-xs text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>
                  Tổng số Sói và chức năng đặc biệt ({specialAndWolfCount}) phải
                  nhỏ hơn tổng số người chơi hiện tại ({playerCount}).
                </span>
              </div>
            )}

            {isHost ? (
              <button
                type="button"
                disabled={!canStartGame}
                onClick={onStartGame}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>
                  {playerCount < 6
                    ? `Cần thêm ${6 - playerCount} người chơi để bắt đầu`
                    : 'Bắt Đầu Đêm Đầu Tiên'}
                </span>
              </button>
            ) : (
              <div className="rounded-xl border border-purple-900/40 bg-purple-950/30 p-3.5 text-center text-sm text-purple-200">
                Đang chờ chủ phòng thiết lập vai trò và bắt đầu ván đấu...
              </div>
            )}
          </div>
        </section>

        {/* Cột phải: Cấu hình vai trò & Thời gian (5 cols) */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-5 shadow-xl backdrop-blur-sm lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Cấu Hình Vai Trò & Thời Gian
              </h2>
            </div>
            {!isHost && (
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                Chỉ chủ phòng chỉnh sửa
              </span>
            )}
          </div>

          {/* Danh sách cấu hình từng vai trò */}
          <div className="space-y-2.5">
            {CONFIGURABLE_ROLES.map((item) => {
              const count = settings.rolesConfig[item.role];
              const isWolf = item.faction === 'WEREWOLF';

              return (
                <div
                  key={item.role}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    isWolf
                      ? 'border-red-900/50 bg-red-950/25'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isWolf ? 'text-red-400' : 'text-slate-100'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isWolf
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-purple-900/50 text-purple-300'
                        }`}
                      >
                        {isWolf ? 'Phe Sói' : 'Phe Dân'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={!isHost || count <= item.min}
                      onClick={() =>
                        handleRoleDelta(item.role, -1, item.min, item.max)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-amber-500/60 disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono text-base font-bold text-amber-400">
                      {count}
                    </span>
                    <button
                      type="button"
                      disabled={!isHost || count >= item.max}
                      onClick={() =>
                        handleRoleDelta(item.role, 1, item.min, item.max)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-amber-500/60 disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Dân làng tự động cân bằng */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <div>
                <span className="font-semibold text-slate-200">
                  Dân Làng (Tự động cân bằng)
                </span>
                <p className="mt-0.5 text-xs text-slate-400">
                  Số người chơi còn lại sẽ nhận vai trò Dân Làng.
                </p>
              </div>
              <span className="px-3 font-mono text-base font-bold text-emerald-400">
                {autoVillagerCount}
              </span>
            </div>
          </div>

          {/* Cấu hình thời gian & giới hạn phòng */}
          <div className="mt-5 space-y-3 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Thiết Lập Thời Gian & Giới Hạn</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                <span className="text-slate-400">Số người tối đa (6-16)</span>
                <select
                  disabled={!isHost}
                  value={settings.maxPlayers}
                  onChange={(e) =>
                    handleDurationChange('maxPlayers', Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 font-semibold text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
                >
                  {[6, 8, 10, 12, 14, 16].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
              </label>

              <label className="block rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                <span className="text-slate-400">Ban đêm (giây)</span>
                <select
                  disabled={!isHost}
                  value={settings.nightDuration}
                  onChange={(e) =>
                    handleDurationChange(
                      'nightDuration',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 font-semibold text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
                >
                  {[30, 35, 45, 60].map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} giây
                    </option>
                  ))}
                </select>
              </label>

              <label className="block rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                <span className="text-slate-400">Thảo luận (giây)</span>
                <select
                  disabled={!isHost}
                  value={settings.discussionDuration}
                  onChange={(e) =>
                    handleDurationChange(
                      'discussionDuration',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 font-semibold text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
                >
                  {[60, 90, 120, 180].map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} giây
                    </option>
                  ))}
                </select>
              </label>

              <label className="block rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                <span className="text-slate-400">Bỏ phiếu (giây)</span>
                <select
                  disabled={!isHost}
                  value={settings.votingDuration}
                  onChange={(e) =>
                    handleDurationChange(
                      'votingDuration',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 font-semibold text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
                >
                  {[20, 30, 45, 60].map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} giây
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
