'use client';

import { AlertCircle, ArrowLeft, Moon, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { Lobby } from '@/components/Lobby';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomIdParam = (params?.id || '').toUpperCase();

  const {
    playerId,
    playerName,
    avatar,
    isHydrated,
    hydrateFromSession,
  } = useUserStore();

  const roomState = useGameStore((s) => s.roomState);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);

  const {
    joinRoom,
    leaveRoom,
    kickPlayer,
    updateSettings,
    startGame,
    sendNightAction,
    sendVote,
    sendHunterShoot,
    sendChat,
  } = useSocket();

  const hasRequestedJoin = useRef(false);

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  // Tự động gửi yêu cầu join / reconnect bằng playerId lưu trong sessionStorage khi tải trang hoặc F5
  useEffect(() => {
    if (!isHydrated || !roomIdParam) return;

    if (roomState && roomState.roomId === roomIdParam) {
      return;
    }

    if (!playerName.trim()) {
      router.replace('/');
      return;
    }

    if (!hasRequestedJoin.current) {
      hasRequestedJoin.current = true;
      joinRoom({
        roomId: roomIdParam,
        playerName: playerName.trim(),
        avatar,
        playerId: playerId || undefined,
      });
    }
  }, [
    avatar,
    isHydrated,
    joinRoom,
    playerId,
    playerName,
    roomIdParam,
    roomState,
    router,
  ]);

  const handleLeave = () => {
    if (roomState) {
      leaveRoom(roomState.roomId);
    }
    router.push('/');
  };

  if (!roomState || roomState.roomId !== roomIdParam) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-purple-900/50 bg-slate-900/80 p-6 text-center shadow-2xl">
          <Moon className="mx-auto h-10 w-10 animate-pulse text-amber-400" />
          <h2 className="mt-3 text-lg font-bold text-white">
            Đang đồng bộ phòng {roomIdParam}...
          </h2>
          {errorMessage && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-800/60 bg-red-950/60 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay về Trang Chủ</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {errorMessage && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-red-800/70 bg-red-950/80 px-4 py-3 text-sm text-red-200 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="rounded-lg p-1 text-red-300 hover:bg-red-900/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {roomState.phase === 'LOBBY' ? (
        <Lobby
          roomState={roomState}
          onLeaveRoom={handleLeave}
          onKickPlayer={(targetId) => kickPlayer(roomState.roomId, targetId)}
          onUpdateSettings={(newSettings) =>
            updateSettings(roomState.roomId, newSettings)
          }
          onStartGame={() => startGame(roomState.roomId)}
        />
      ) : (
        <GameBoard
          roomState={roomState}
          onNightAction={(actionType, targetId) =>
            sendNightAction({
              roomId: roomState.roomId,
              actionType,
              targetId,
            })
          }
          onVote={(targetId) =>
            sendVote({
              roomId: roomState.roomId,
              targetId,
            })
          }
          onHunterShoot={(targetId) =>
            sendHunterShoot({
              roomId: roomState.roomId,
              targetId,
            })
          }
          onSendChat={(message, channel) =>
            sendChat({
              roomId: roomState.roomId,
              message,
              channel,
            })
          }
          onPlayAgain={() => startGame(roomState.roomId)}
          onLeaveRoom={handleLeave}
        />
      )}
    </main>
  );
}
