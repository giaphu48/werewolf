'use client';

import { Crown, LogOut, RotateCcw, Skull, Trophy } from 'lucide-react';
import { getRoleDisplayInfo } from '@/components/RoleCard';
import { getAvatarEmoji } from '@/store/useUserStore';
import { SanitizedGameState } from '@/types/types';

interface GameOverModalProps {
  roomState: SanitizedGameState;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export function GameOverModal({
  roomState,
  onPlayAgain,
  onLeaveRoom,
}: GameOverModalProps) {
  if (roomState.phase !== 'GAME_OVER' || !roomState.winner) {
    return null;
  }

  const isWolfWin = roomState.winner === 'WEREWOLF';
  const isHost = roomState.selfId === roomState.hostId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div
        className={`w-full max-w-2xl overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8 ${
          isWolfWin
            ? 'border-red-800/80 bg-gradient-to-b from-red-950/95 via-slate-900 to-slate-950'
            : 'border-amber-500/60 bg-gradient-to-b from-purple-950/95 via-slate-900 to-slate-950'
        }`}
      >
        {/* Banner Phe Chiến Thắng */}
        <div className="text-center">
          <div
            className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl shadow-lg ${
              isWolfWin
                ? 'border-red-600/60 bg-red-900/40 text-red-300'
                : 'border-amber-400/60 bg-amber-500/20 text-amber-300'
            }`}
          >
            <Trophy className="h-8 w-8" />
          </div>

          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${
              isWolfWin
                ? 'bg-red-900/70 text-red-200'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            Ván Đấu Kết Thúc • Ngày thứ {roomState.dayCount}
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-white">
            {isWolfWin
              ? '🐺 Phe Ma Sói Chiến Thắng!'
              : '✨ Phe Dân Làng Chiến Thắng!'}
          </h2>

          <p className="mt-1.5 text-sm text-slate-300">
            {isWolfWin
              ? 'Bóng tối đã nuốt chửng ngôi làng. Số lượng Ma Sói đã áp đảo Dân Làng.'
              : 'Công lý đã được thực thi! Toàn bộ Ma Sói ẩn mình đã bị tiêu diệt.'}
          </p>
        </div>

        {/* Bảng tổng kết vai trò của tất cả người chơi */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Bảng Tổng Kết Vai Trò Toàn Bộ Người Chơi
          </h3>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {roomState.players.map((player) => {
              const roleInfo = getRoleDisplayInfo(player.role);
              const isSelf = player.id === roomState.selfId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    roleInfo?.isWolfFaction
                      ? 'border-red-900/60 bg-red-950/35'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl">
                      {getAvatarEmoji(player.avatar)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">
                          {player.name}
                        </span>
                        {isSelf && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            Bạn
                          </span>
                        )}
                        {player.isHost && (
                          <Crown className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="mt-0.5 text-xs">
                        {player.isAlive ? (
                          <span className="text-emerald-400">
                            ● Sống sót đến cuối trận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400">
                            <Skull className="h-3 w-3" />
                            Đã hy sinh
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {roleInfo && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                        roleInfo.isWolfFaction
                          ? 'border-red-700/60 bg-red-900/50 text-red-200'
                          : 'border-purple-700/60 bg-purple-950/70 text-amber-300'
                      }`}
                    >
                      <span>{roleInfo.emoji}</span>
                      <span>{roleInfo.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút điều hướng: Chơi lại hoặc Rời phòng */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isHost ? (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Chơi Ván Mới</span>
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400">
              Đang chờ Chủ phòng bắt đầu ván mới...
            </div>
          )}

          <button
            type="button"
            onClick={onLeaveRoom}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 px-5 py-3.5 text-sm font-bold text-red-300 transition hover:bg-red-900/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Rời Phòng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
