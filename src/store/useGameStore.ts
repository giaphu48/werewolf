'use client';

import { create } from 'zustand';
import {
  ChatChannel,
  ChatReceivePayload,
  SanitizedGameState,
  SeerResultPayload,
} from '@/types/types';

interface GameStoreState {
  isConnected: boolean;
  roomState: SanitizedGameState | null;
  selectedTargetId: string | null;
  phaseMessage: string;
  seerResult: SeerResultPayload | null;
  witchVictimId: string | null;
  chatMessages: ChatReceivePayload[];
  activeChatChannel: ChatChannel;
  isRoleCardFlipped: boolean;
  isSoundMuted: boolean;
  errorMessage: string | null;
  kickedReason: string | null;

  setConnected: (connected: boolean) => void;
  setRoomState: (state: SanitizedGameState | null) => void;
  setSelectedTargetId: (targetId: string | null) => void;
  setPhaseMessage: (message: string) => void;
  setSeerResult: (result: SeerResultPayload | null) => void;
  setWitchVictimId: (victimId: string | null) => void;
  addChatMessage: (msg: ChatReceivePayload) => void;
  clearChatMessages: () => void;
  setActiveChatChannel: (channel: ChatChannel) => void;
  toggleRoleCardFlipped: () => void;
  toggleSoundMuted: () => void;
  setErrorMessage: (message: string | null) => void;
  setKickedReason: (reason: string | null) => void;
  resetGameStore: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  isConnected: false,
  roomState: null,
  selectedTargetId: null,
  phaseMessage: '',
  seerResult: null,
  witchVictimId: null,
  chatMessages: [],
  activeChatChannel: 'PUBLIC',
  isRoleCardFlipped: false,
  isSoundMuted: false,
  errorMessage: null,
  kickedReason: null,

  setConnected: (connected) => set({ isConnected: connected }),

  setRoomState: (roomState) =>
    set((prev) => {
      if (!roomState) {
        return { roomState: null, selectedTargetId: null };
      }

      // Nếu mục tiêu đang chọn đã chết hoặc không còn trong phòng thì bỏ chọn
      const currentTarget = roomState.players.find(
        (p) => p.id === prev.selectedTargetId
      );
      const validSelectedTargetId =
        currentTarget && currentTarget.isAlive ? prev.selectedTargetId : null;

      // Tự động gợi ý kênh chat phù hợp khi chuyển pha hoặc khi người chơi chết
      const selfPlayer = roomState.players.find(
        (p) => p.id === roomState.selfId
      );
      let nextChannel: ChatChannel = prev.activeChatChannel;

      if (selfPlayer && !selfPlayer.isAlive && roomState.phase !== 'GAME_OVER') {
        nextChannel = 'DEAD';
      } else if (
        roomState.phase === 'NIGHT' &&
        selfPlayer?.isAlive &&
        selfPlayer.role === 'WEREWOLF'
      ) {
        nextChannel = 'WOLF';
      } else if (roomState.phase !== 'NIGHT' && nextChannel === 'WOLF') {
        nextChannel = 'PUBLIC';
      }

      return {
        roomState,
        selectedTargetId: validSelectedTargetId,
        activeChatChannel: nextChannel,
      };
    }),

  setSelectedTargetId: (selectedTargetId) => set({ selectedTargetId }),
  setPhaseMessage: (phaseMessage) => set({ phaseMessage }),
  setSeerResult: (seerResult) => set({ seerResult }),
  setWitchVictimId: (witchVictimId) => set({ witchVictimId }),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-99), msg],
    })),

  clearChatMessages: () => set({ chatMessages: [] }),
  setActiveChatChannel: (activeChatChannel) => set({ activeChatChannel }),
  toggleRoleCardFlipped: () =>
    set((state) => ({ isRoleCardFlipped: !state.isRoleCardFlipped })),
  toggleSoundMuted: () =>
    set((state) => ({ isSoundMuted: !state.isSoundMuted })),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setKickedReason: (kickedReason) => set({ kickedReason }),

  resetGameStore: () =>
    set({
      roomState: null,
      selectedTargetId: null,
      phaseMessage: '',
      seerResult: null,
      witchVictimId: null,
      chatMessages: [],
      activeChatChannel: 'PUBLIC',
      isRoleCardFlipped: false,
      errorMessage: null,
    }),
}));
