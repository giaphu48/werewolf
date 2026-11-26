'use client';

import {
  Clock,
  Crosshair,
  Crown,
  Flame,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Moon,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Users,
  Volume2,
  VolumeX,
  Vote,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import { ActionPanel } from '@/components/ActionPanel';
import { ChatBox } from '@/components/ChatBox';
import { GameOverModal } from '@/components/GameOverModal';
import { getRoleDisplayInfo, RoleCard } from '@/components/RoleCard';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useGameStore } from '@/store/useGameStore';
import { getAvatarEmoji } from '@/store/useUserStore';
import {
  ChatChannel,
  GamePhase,
  NightActionType,
  SanitizedGameState,
} from '@/types/types';

interface GameBoardProps {
  roomState: SanitizedGameState;
  onNightAction: (actionType: NightActionType, targetId?: string) => void;
  onVote: (targetId: string | null) => void;
  onHunterShoot: (targetId: string) => void;
  onSendChat: (message: string, channel: ChatChannel) => void;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

type MobileTab = 'BOARD' | 'ROLE' | 'CHAT';

function getPhaseBadgeMeta(phase: GamePhase): {
  label: string;
  isNightTheme: boolean;
} {
  switch (phase) {
    case 'NIGHT':
      return { label: 'Ban Đêm • Hành Động Bí Mật', isNightTheme: true };
    case 'MORNING':
      return { label: 'Bình Minh • Công Bố Đêm Qua', isNightTheme: false };
    case 'DISCUSSION':
      return { label: 'Ban Ngày • Thảo Luận Tìm Sói', isNightTheme: false };
    case 'VOTING':
      return { label: 'Phán Quyết • Bỏ Phiếu Treo Cổ', isNightTheme: false };
    case 'HUNTER_SHOOT':
      return { label: 'Thợ Săn • Phát Súng Cuối Cùng', isNightTheme: false };
    case 'GAME_OVER':
      return { label: 'Kết Thúc Ván Đấu', isNightTheme: true };
    default:
      return { label: 'Sảnh Chờ', isNightTheme: false };
  }
}

export function GameBoard({
  roomState,
  onNightAction,
  onVote,
  onHunterShoot,
  onSendChat,
  onPlayAgain,
  onLeaveRoom,
}: GameBoardProps) {
  const selectedTargetId = useGameStore((s) => s.selectedTargetId);
  const setSelectedTargetId = useGameStore((s) => s.setSelectedTargetId);
  const phaseMessage = useGameStore((s) => s.phaseMessage);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const chatMessagesCount = useGameStore((s) => s.chatMessages.length);

  const [mobileTab, setMobileTab] = useState<MobileTab>('BOARD');

  const secondsLeft = useGameTimer(
    roomState.timerEnd,
    roomState.remainingTime
  );

  // Kích hoạt hiệu ứng âm thanh (tiếng sói hú, tiếng gà gáy, tiếng đồng hồ tích tắc)
  useSoundEffects(roomState.phase, secondsLeft, isSoundMuted);

  const selfPlayer = roomState.players.find((p) => p.id === roomState.selfId);
  const alivePlayersCount = roomState.players.filter((p) => p.isAlive).length;
  const phaseMeta = getPhaseBadgeMeta(roomState.phase);

  // Tính số phiếu bầu hiện tại của mỗi người chơi trong pha VOTING
  const voteCountsMap: Record<string, number> = {};
  for (const targetId of Object.values(roomState.votes)) {
    if (targetId) {
      voteCountsMap[targetId] = (voteCountsMap[targetId] ?? 0) + 1;
    }
  }

  // Tính số phiếu cắn của Sói trong pha NIGHT (chỉ hiển thị nếu người xem là Sói)
  const wolfVoteCountsMap: Record<string, number> = {};
  if (roomState.myNightInfo?.wolfVotes) {
    for (const targetId of Object.values(roomState.myNightInfo.wolfVotes)) {
      if (targetId) {
        wolfVoteCountsMap[targetId] = (wolfVoteCountsMap[targetId] ?? 0) + 1;
      }
    }
  }

  const handleSelectPlayerCard = (targetId: string, isAlive: boolean) => {
    if (!isAlive) return;
    if (selectedTargetId === targetId) {
      setSelectedTargetId(null);
    } else {
      setSelectedTargetId(targetId);
    }
  };

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-700 lg:pb-8 ${
        phaseMeta.isNightTheme
          ? 'bg-gradient-to-b from-slate-950 via-purple-950/60 to-slate-950'
          : 'bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950'
      }`}
    >
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:py-6">
        {/* Thanh trạng thái trên cùng (Tối ưu cho cả màn hình 375px và Desktop) */}
        <header className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-purple-900/50 bg-slate-900/85 p-3.5 shadow-2xl backdrop-blur-md sm:mb-5 sm:flex-row sm:items-center sm:p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${
                phaseMeta.isNightTheme
                  ? 'border-purple-700/60 bg-purple-950/80 text-amber-400'
                  : 'border-amber-500/50 bg-amber-500/15 text-amber-400'
              }`}
            >
              {phaseMeta.isNightTheme ? (
                <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] font-extrabold text-amber-300">
                  PHÒNG {roomState.roomId}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  • Ngày {roomState.dayCount}
                </span>
              </div>
              <h1 className="mt-0.5 truncate text-base font-extrabold text-white sm:text-xl">
                {phaseMeta.label}
              </h1>
            </div>
          </div>

          {/* Đồng hồ đếm ngược, Âm thanh & Nút rời bàn */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs sm:px-3.5 sm:py-2">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden text-slate-400 sm:inline">Còn sống:</span>
              <strong className="font-mono text-xs text-emerald-400 sm:text-sm">
                {alivePlayersCount}/{roomState.players.length}
              </strong>
            </div>

            {roomState.timerEnd !== null && (
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono sm:px-4 sm:py-2 ${
                  secondsLeft <= 10
                    ? 'animate-pulse border-red-600/80 bg-red-950/70 text-red-300'
                    : 'border-amber-500/40 bg-slate-950/80 text-amber-400'
                }`}
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm font-extrabold sm:text-base">
                  {secondsLeft}s
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleSoundMuted}
              title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 p-2 text-slate-300 transition hover:border-amber-500/50 hover:text-amber-300"
            >
              {isSoundMuted ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-amber-400" />
              )}
            </button>

            <button
              type="button"
              onClick={onLeaveRoom}
              className="inline-flex items-center gap-1 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-900/50 sm:px-3.5 sm:py-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Rời bàn</span>
            </button>
          </div>
        </header>

        {/* Thông báo diễn biến pha hiện tại */}
        {phaseMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-purple-950/70 px-3.5 py-2.5 text-xs font-medium text-amber-200 shadow-lg sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{phaseMessage}</span>
          </div>
        )}

        {/* Bố cục chính: Desktop hiển thị 2 cột song song; Mobile chuyển tab mượt mà */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Cột Trái: Bàn chơi + ActionPanel nhanh trên Mobile */}
          <section
            className={`space-y-4 lg:col-span-7 ${
              mobileTab === 'BOARD' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/75 p-3.5 shadow-2xl backdrop-blur-md sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 sm:text-sm">
                  Bàn Chơi Ngôi Làng ({roomState.players.length} vị trí)
                </h2>
                <span className="text-[11px] text-slate-400">
                  Chạm vào người còn sống để chọn mục tiêu
                </span>
              </div>

              {/* Lưới người chơi tối ưu cho 375px (2 cột) và Tablet/Desktop (3 cột) */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                {roomState.players.map((player, index) => {
                  const isSelf = player.id === roomState.selfId;
                  const isSelected = player.id === selectedTargetId;
                  const roleInfo = getRoleDisplayInfo(player.role);
                  const voteCount = voteCountsMap[player.id] ?? 0;
                  const wolfVoteCount = wolfVoteCountsMap[player.id] ?? 0;
                  const isProtectedTonight =
                    roomState.myNightInfo?.protectedPlayerId === player.id;
                  const wasKilledLastNight =
                    roomState.lastNightDeaths.includes(player.id);

                  return (
                    <button
                      key={player.id}
                      type="button"
                      disabled={!player.isAlive}
                      onClick={() =>
                        handleSelectPlayerCard(player.id, player.isAlive)
                      }
                      className={`group relative flex flex-col justify-between rounded-2xl border p-2.5 text-left transition active:scale-[0.98] sm:p-3.5 ${
                        !player.isAlive
                          ? 'cursor-not-allowed border-slate-800/60 bg-slate-950/40 opacity-55 grayscale'
                          : isSelected
                            ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50'
                            : isSelf
                              ? 'border-purple-700/70 bg-purple-950/35 hover:border-amber-500/60'
                              : 'border-slate-800 bg-slate-950/75 hover:border-purple-700/70 hover:bg-slate-900/90'
                      }`}
                    >
                      {/* Dòng trên: Số ghế & trạng thái */}
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-400">
                          #{index + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          {!player.isConnected && (
                            <span
                              title="Mất kết nối"
                              className="rounded bg-rose-950/80 p-1 text-rose-400"
                            >
                              <WifiOff className="h-3 w-3" />
                            </span>
                          )}

                          {player.isHost && (
                            <span
                              title="Chủ phòng"
                              className="rounded bg-amber-500/15 p-1 text-amber-400"
                            >
                              <Crown className="h-3 w-3" />
                            </span>
                          )}

                          {isSelected && player.isAlive && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 sm:text-[10px]">
                              <Crosshair className="h-2.5 w-2.5" />
                              Chọn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Avatar & Tên người chơi */}
                      <div className="my-2 flex flex-col items-center text-center sm:my-3">
                        <div
                          className={`relative flex h-12 w-12 items-center justify-center rounded-full border text-2xl shadow-inner sm:h-14 sm:w-14 sm:text-3xl ${
                            !player.isAlive
                              ? 'border-slate-800 bg-slate-900'
                              : roleInfo?.isWolfFaction
                                ? 'border-red-700/70 bg-red-950/70'
                                : 'border-purple-800/60 bg-purple-950/60'
                          }`}
                        >
                          <span>{getAvatarEmoji(player.avatar)}</span>

                          {!player.isAlive && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/75">
                              <Skull className="h-5 w-5 text-rose-500 sm:h-6 sm:w-6" />
                            </div>
                          )}
                        </div>

                        <div className="mt-1.5 flex max-w-full items-center gap-1 sm:mt-2">
                          <p className="truncate text-xs font-bold text-white sm:text-sm">
                            {player.name}
                          </p>
                          {isSelf && (
                            <span className="shrink-0 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-300 sm:text-[10px]">
                              Bạn
                            </span>
                          )}
                        </div>

                        {/* Nhãn Vai trò (chỉ hiện nếu Server cho phép nhìn thấy) */}
                        {roleInfo && (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                              roleInfo.isWolfFaction
                                ? 'bg-red-900/70 text-red-200'
                                : 'bg-purple-900/60 text-amber-300'
                            }`}
                          >
                            <span>{roleInfo.emoji}</span>
                            <span>{roleInfo.title}</span>
                          </span>
                        )}
                      </div>

                      {/* Dòng dưới: Huy hiệu phiếu bầu / bị Sói nhắm / được Bảo Vệ / trạng thái sinh tồn */}
                      <div className="flex min-h-[20px] flex-wrap items-center justify-center gap-1 border-t border-slate-800/80 pt-1.5 text-[10px]">
                        {!player.isAlive ? (
                          <span className="font-semibold text-rose-400">
                            {wasKilledLastNight ? '☠️ Đêm qua' : '☠️ Đã chết'}
                          </span>
                        ) : (
                          <>
                            {roomState.phase === 'VOTING' && voteCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 font-bold text-amber-300">
                                <Vote className="h-3 w-3" />
                                {voteCount} phiếu
                              </span>
                            )}

                            {roomState.phase === 'NIGHT' &&
                              wolfVoteCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-900/80 px-2 py-0.5 font-bold text-red-200">
                                  <Flame className="h-3 w-3" />
                                  {wolfVoteCount} Sói
                                </span>
                              )}

                            {roomState.phase === 'NIGHT' &&
                              isProtectedTonight && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/80 px-2 py-0.5 font-bold text-emerald-200">
                                  <Shield className="h-3 w-3" />
                                  Bảo vệ
                                </span>
                              )}

                            {voteCount === 0 &&
                              wolfVoteCount === 0 &&
                              !isProtectedTonight && (
                                <span className="text-emerald-400/90">
                                  ● Còn sống
                                </span>
                              )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hiển thị ActionPanel ngay dưới Bàn Chơi trên Mobile để thao tác chọn & bấm kỹ năng tức thì */}
            <div className="block lg:hidden">
              <ActionPanel
                roomState={roomState}
                onNightAction={onNightAction}
                onVote={onVote}
                onHunterShoot={onHunterShoot}
              />
            </div>
          </section>

          {/* Cột Phải: Thẻ Bài Vai Trò, Bảng Hành Động & Khung Chat */}
          <aside className="flex flex-col gap-4 lg:col-span-5">
            <div
              className={`space-y-4 ${
                mobileTab === 'ROLE' ? 'block' : 'hidden lg:block'
              }`}
            >
              <RoleCard
                role={selfPlayer?.role}
                isAlive={selfPlayer?.isAlive ?? true}
              />

              <ActionPanel
                roomState={roomState}
                onNightAction={onNightAction}
                onVote={onVote}
                onHunterShoot={onHunterShoot}
              />
            </div>

            <div
              className={`${
                mobileTab === 'CHAT' ? 'block' : 'hidden lg:block'
              }`}
            >
              <ChatBox roomState={roomState} onSendChat={onSendChat} />
            </div>
          </aside>
        </div>
      </div>

      {/* Thanh điều hướng dưới cùng dành riêng cho Mobile (375px) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-purple-900/60 bg-slate-950/95 px-2 py-2 backdrop-blur-lg lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('BOARD')}
          className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition ${
            mobileTab === 'BOARD'
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Bàn Chơi</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('ROLE')}
          className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition ${
            mobileTab === 'ROLE'
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Thẻ Vai Trò</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('CHAT')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition ${
            mobileTab === 'CHAT'
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="h-4 w-4" />
            {chatMessagesCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-slate-950">
                {chatMessagesCount > 99 ? '99+' : chatMessagesCount}
              </span>
            )}
          </div>
          <span>Trò Chuyện</span>
        </button>
      </nav>

      {/* Modal Kết thúc ván đấu */}
      <GameOverModal
        roomState={roomState}
        onPlayAgain={onPlayAgain}
        onLeaveRoom={onLeaveRoom}
      />
    </div>
  );
}
