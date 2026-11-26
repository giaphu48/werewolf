'use client';

import { useCallback, useEffect, useRef } from 'react';
import { GamePhase } from '@/types/types';

/**
 * Hệ thống hiệu ứng âm thanh tổng hợp trực tiếp bằng Web Audio API (không phụ thuộc file mp3 ngoài)
 * - Tiếng sói hú khi vào đêm (NIGHT)
 * - Tiếng gà gáy khi trời sáng (MORNING)
 * - Tiếng chuông cảnh báo khi vào giờ Bỏ phiếu (VOTING) / Thợ săn bắn (HUNTER_SHOOT)
 * - Tiếng đồng hồ tích tắc trong 10 giây cuối cùng của mỗi pha
 */
export function useSoundEffects(
  phase: GamePhase | undefined,
  secondsLeft: number,
  isMuted: boolean
) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevPhaseRef = useRef<GamePhase | undefined>(undefined);
  const lastTickSecondRef = useRef<number | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    if (
      audioCtxRef.current &&
      audioCtxRef.current.state === 'suspended'
    ) {
      void audioCtxRef.current.resume().catch(() => {
        // Bỏ qua nếu trình duyệt yêu cầu tương tác người dùng trước
      });
    }

    return audioCtxRef.current;
  }, []);

  /**
   * Tiếng sói hú huyền bí khi màn đêm buông xuống (NIGHT)
   */
  const playWolfHowl = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const masterGain = ctx.createGain();

    osc.type = 'triangle';
    // Đường cong tần số mô phỏng tiếng sói hú vang trong đêm
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.7);
    osc.frequency.setValueAtTime(420, now + 1.1);
    osc.frequency.exponentialRampToValueAtTime(340, now + 1.7);
    osc.frequency.exponentialRampToValueAtTime(160, now + 2.4);

    // Tạo độ rung nhẹ (vibrato) ở cuối tiếng hú
    vibrato.frequency.setValueAtTime(5.5, now);
    vibratoGain.gain.setValueAtTime(8, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 0.35);
    masterGain.gain.setValueAtTime(0.16, now + 1.4);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.45);

    osc.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 2.5);
    vibrato.stop(now + 2.5);
  }, [getAudioContext, isMuted]);

  /**
   * Tiếng gà gáy báo hiệu bình minh (MORNING)
   */
  const playRoosterCrow = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 4 nốt "Ò - Ó - O - Ò"
    const notes = [
      { freq: 523.25, start: 0, duration: 0.16 },
      { freq: 659.25, start: 0.19, duration: 0.16 },
      { freq: 880.0, start: 0.38, duration: 0.25 },
      { freq: 783.99, start: 0.66, duration: 0.65 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const noteStart = now + note.start;
      const noteEnd = noteStart + note.duration;

      osc.frequency.setValueAtTime(note.freq * 0.94, noteStart);
      osc.frequency.exponentialRampToValueAtTime(note.freq, noteStart + 0.06);
      if (note.duration > 0.4) {
        osc.frequency.exponentialRampToValueAtTime(
          note.freq * 0.82,
          noteEnd
        );
      }

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteEnd + 0.02);
    });
  }, [getAudioContext, isMuted]);

  /**
   * Tiếng chuông trầm báo hiệu giờ Bỏ phiếu hoặc Thợ săn nổ súng
   */
  const playAlertChime = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }, [getAudioContext, isMuted]);

  /**
   * Tiếng đồng hồ tích tắc mỗi giây khi còn <= 10 giây
   */
  const playClockTick = useCallback(
    (isUrgent: boolean) => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 1150 : 880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

      gain.gain.setValueAtTime(isUrgent ? 0.14 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    },
    [getAudioContext, isMuted]
  );

  // Phát âm thanh khi chuyển pha
  useEffect(() => {
    if (!phase || phase === prevPhaseRef.current) return;
    prevPhaseRef.current = phase;
    lastTickSecondRef.current = null;

    if (phase === 'NIGHT') {
      playWolfHowl();
    } else if (phase === 'MORNING') {
      playRoosterCrow();
    } else if (phase === 'VOTING' || phase === 'HUNTER_SHOOT') {
      playAlertChime();
    }
  }, [phase, playAlertChime, playRoosterCrow, playWolfHowl]);

  // Phát tiếng đồng hồ tích tắc trong 10 giây cuối cùng
  useEffect(() => {
    if (
      !phase ||
      phase === 'LOBBY' ||
      phase === 'GAME_OVER' ||
      secondsLeft <= 0 ||
      secondsLeft > 10
    ) {
      return;
    }

    if (lastTickSecondRef.current === secondsLeft) {
      return;
    }

    lastTickSecondRef.current = secondsLeft;
    playClockTick(secondsLeft <= 3);
  }, [phase, playClockTick, secondsLeft]);
}
