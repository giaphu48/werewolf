'use client';

import { useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/useGameStore';
import { useUserStore } from '@/store/useUserStore';
import {
  ChatChannel,
  ClientToServerEvents,
  NightActionType,
  RoomSettings,
  ServerToClientEvents,
} from '@/types/types';

type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

const globalForSocket = globalThis as unknown as {
  __werewolfSocket?: TypedClientSocket;
};

function attachSingletonListeners(socket: TypedClientSocket): void {
  socket.off('connect');
  socket.off('disconnect');
  socket.off('room:kicked');
  socket.off('room:state_sync');
  socket.off('game:phase_changed');
  socket.off('game:seer_result');
  socket.off('game:witch_info');
  socket.off('chat:receive');
  socket.off('error:message');

  socket.on('connect', () => {
    useGameStore.getState().setConnected(true);

    // Tự động Reconnect lại vào phòng nếu kết nối mạng bị rớt tạm thời
    const userState = useUserStore.getState();
    const activeRoomId =
      useGameStore.getState().roomState?.roomId || userState.lastRoomId;

    if (activeRoomId && userState.playerId && userState.playerName.trim()) {
      socket.emit('room:join', {
        roomId: activeRoomId,
        playerName: userState.playerName.trim(),
        avatar: userState.avatar,
        playerId: userState.playerId,
      });
    }
  });

  socket.on('disconnect', () => {
    useGameStore.getState().setConnected(false);
  });

  socket.on('room:kicked', (payload) => {
    useUserStore.getState().setLastRoomId('');
    useGameStore.getState().resetGameStore();
    useGameStore.getState().setKickedReason(payload.reason);
  });

  socket.on('room:state_sync', (payload) => {
    useGameStore.getState().setRoomState(payload.roomState);
  });

  socket.on('game:phase_changed', (payload) => {
    const store = useGameStore.getState();
    store.setPhaseMessage(payload.message);
    store.setSelectedTargetId(null);
    store.setErrorMessage(null);
    if (payload.phase === 'NIGHT') {
      store.setSeerResult(null);
      store.setWitchVictimId(null);
    }
  });

  socket.on('game:seer_result', (payload) => {
    useGameStore.getState().setSeerResult(payload);
  });

  socket.on('game:witch_info', (payload) => {
    useGameStore.getState().setWitchVictimId(payload.victimId);
  });

  socket.on('chat:receive', (payload) => {
    useGameStore.getState().addChatMessage(payload);
  });

  socket.on('error:message', (payload) => {
    useGameStore.getState().setErrorMessage(payload.message);
  });
}

export function getSocket(): TypedClientSocket {
  if (!globalForSocket.__werewolfSocket) {
    globalForSocket.__werewolfSocket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  attachSingletonListeners(globalForSocket.__werewolfSocket);
  return globalForSocket.__werewolfSocket;
}

/**
 * Hook useSocket: Quản lý toàn bộ kết nối Socket.io (Server -> Client & Client -> Server)
 * Khớp 100% với danh sách Socket Events trong ARCHITECTURE.md
 */
export function useSocket(onRoomJoined?: (roomId: string) => void) {
  const setConnected = useGameStore((s) => s.setConnected);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);
  const setKickedReason = useGameStore((s) => s.setKickedReason);
  const resetGameStore = useGameStore((s) => s.resetGameStore);

  const setPlayerId = useUserStore((s) => s.setPlayerId);
  const setLastRoomId = useUserStore((s) => s.setLastRoomId);

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);

    const handleRoomJoined = (payload: {
      roomId: string;
      playerId: string;
    }) => {
      setPlayerId(payload.playerId);
      setLastRoomId(payload.roomId);
      setErrorMessage(null);
      setKickedReason(null);
      if (onRoomJoined) {
        onRoomJoined(payload.roomId);
      }
    };

    socket.on('room:joined', handleRoomJoined);

    return () => {
      socket.off('room:joined', handleRoomJoined);
    };
  }, [
    onRoomJoined,
    setConnected,
    setErrorMessage,
    setKickedReason,
    setLastRoomId,
    setPlayerId,
  ]);

  // ==========================================
  // CLIENT -> SERVER EMITTERS
  // ==========================================

  const createRoom = useCallback(
    (params: { playerName: string; avatar: string; playerId?: string }) => {
      getSocket().emit('room:create', params);
    },
    []
  );

  const joinRoom = useCallback(
    (params: {
      roomId: string;
      playerName: string;
      avatar: string;
      playerId?: string;
    }) => {
      getSocket().emit('room:join', params);
    },
    []
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      getSocket().emit('room:leave', { roomId });
      setLastRoomId('');
      resetGameStore();
    },
    [resetGameStore, setLastRoomId]
  );

  const kickPlayer = useCallback((roomId: string, targetPlayerId: string) => {
    getSocket().emit('room:kick', { roomId, targetPlayerId });
  }, []);

  const updateSettings = useCallback(
    (roomId: string, settings: Partial<RoomSettings>) => {
      getSocket().emit('room:update_settings', { roomId, settings });
    },
    []
  );

  const startGame = useCallback((roomId: string) => {
    getSocket().emit('game:start', { roomId });
  }, []);

  const sendNightAction = useCallback(
    (params: {
      roomId: string;
      actionType: NightActionType;
      targetId?: string;
    }) => {
      useGameStore.getState().setErrorMessage(null);
      getSocket().emit('game:night_action', params);
    },
    []
  );

  const sendVote = useCallback(
    (params: { roomId: string; targetId: string | null }) => {
      useGameStore.getState().setErrorMessage(null);
      getSocket().emit('game:vote', params);
    },
    []
  );

  const sendHunterShoot = useCallback(
    (params: { roomId: string; targetId: string }) => {
      useGameStore.getState().setErrorMessage(null);
      getSocket().emit('game:hunter_shoot', params);
    },
    []
  );

  const sendChat = useCallback(
    (params: { roomId: string; message: string; channel: ChatChannel }) => {
      useGameStore.getState().setErrorMessage(null);
      getSocket().emit('chat:send', params);
    },
    []
  );

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    updateSettings,
    startGame,
    sendNightAction,
    sendVote,
    sendHunterShoot,
    sendChat,
  };
}
