'use client';

import { create } from 'zustand';

export const AVATAR_OPTIONS = [
  { id: 'wolf', emoji: '🐺', label: 'Sói Đêm' },
  { id: 'mage', emoji: '🔮', label: 'Nhà Tiên Tri' },
  { id: 'witch', emoji: '🧪', label: 'Phù Thủy' },
  { id: 'shield', emoji: '🛡️', label: 'Hộ Vệ' },
  { id: 'hunter', emoji: '🏹', label: 'Thợ Săn' },
  { id: 'moon', emoji: '🌙', label: 'Dân Làng' },
  { id: 'crow', emoji: '🐦‍⬛', label: 'Quạ Đen' },
  { id: 'lantern', emoji: '🏮', label: 'Lữ Khách' },
] as const;

const STORAGE_KEYS = {
  PLAYER_ID: 'werewolf_player_id',
  PLAYER_NAME: 'werewolf_player_name',
  PLAYER_AVATAR: 'werewolf_player_avatar',
  LAST_ROOM_ID: 'werewolf_last_room_id',
} as const;

interface UserState {
  playerId: string;
  playerName: string;
  avatar: string;
  lastRoomId: string;
  isHydrated: boolean;
  hydrateFromSession: () => void;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setLastRoomId: (roomId: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  playerId: '',
  playerName: '',
  avatar: 'wolf',
  lastRoomId: '',
  isHydrated: false,

  hydrateFromSession: () => {
    if (typeof window === 'undefined') return;
    const savedId = window.sessionStorage.getItem(STORAGE_KEYS.PLAYER_ID) || '';
    const savedName =
      window.sessionStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
    const savedAvatar =
      window.sessionStorage.getItem(STORAGE_KEYS.PLAYER_AVATAR) || 'wolf';
    const savedRoom =
      window.sessionStorage.getItem(STORAGE_KEYS.LAST_ROOM_ID) || '';

    set({
      playerId: savedId,
      playerName: savedName,
      avatar: savedAvatar,
      lastRoomId: savedRoom,
      isHydrated: true,
    });
  },

  setPlayerId: (id: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEYS.PLAYER_ID, id);
    }
    set({ playerId: id });
  },

  setPlayerName: (name: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
    }
    set({ playerName: name });
  },

  setAvatar: (avatar: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEYS.PLAYER_AVATAR, avatar);
    }
    set({ avatar });
  },

  setLastRoomId: (roomId: string) => {
    if (typeof window !== 'undefined') {
      if (roomId) {
        window.sessionStorage.setItem(STORAGE_KEYS.LAST_ROOM_ID, roomId);
      } else {
        window.sessionStorage.removeItem(STORAGE_KEYS.LAST_ROOM_ID);
      }
    }
    set({ lastRoomId: roomId });
  },
}));

export function getAvatarEmoji(avatarId: string): string {
  const found = AVATAR_OPTIONS.find((item) => item.id === avatarId);
  return found ? found.emoji : '🐺';
}
