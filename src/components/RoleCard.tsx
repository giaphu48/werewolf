'use client';

import { Eye, EyeOff, Shield, Skull, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { Role, VisibleRole } from '@/types/types';

interface RoleDisplayInfo {
  title: string;
  emoji: string;
  factionLabel: string;
  isWolfFaction: boolean;
  description: string;
}

export const ROLE_INFO_MAP: Record<Role, RoleDisplayInfo> = {
  WEREWOLF: {
    title: 'Ma Sói',
    emoji: '🐺',
    factionLabel: 'Phe Ma Sói',
    isWolfFaction: true,
    description:
      'Mỗi đêm thức dậy cùng bầy Sói để chọn 1 người cắn. Ban ngày hãy trà trộn và đánh lạc hướng Dân Làng.',
  },
  SEER: {
    title: 'Tiên Tri',
    emoji: '🔮',
    factionLabel: 'Phe Dân Làng',
    isWolfFaction: false,
    description:
      'Mỗi đêm được chọn 1 người chơi để soi xem họ có phải là Ma Sói hay không.',
  },
  BODYGUARD: {
    title: 'Bảo Vệ',
    emoji: '🛡️',
    factionLabel: 'Phe Dân Làng',
    isWolfFaction: false,
    description:
      'Mỗi đêm chọn 1 người để bảo vệ khỏi nanh vuốt Ma Sói (không được bảo vệ cùng 1 người 2 đêm liên tiếp).',
  },
  WITCH: {
    title: 'Phù Thủy',
    emoji: '🧪',
    factionLabel: 'Phe Dân Làng',
    isWolfFaction: false,
    description:
      'Sở hữu 1 Bình Cứu (cứu người bị Sói cắn) và 1 Bình Độc (tiêu diệt 1 người bất kỳ). Mỗi bình dùng 1 lần duy nhất.',
  },
  HUNTER: {
    title: 'Thợ Săn',
    emoji: '🏹',
    factionLabel: 'Phe Dân Làng',
    isWolfFaction: false,
    description:
      'Khi ngã xuống (bị Sói cắn hoặc bị treo cổ), được quyền nổ súng kéo theo 1 người chơi khác.',
  },
  VILLAGER: {
    title: 'Dân Làng',
    emoji: '🌾',
    factionLabel: 'Phe Dân Làng',
    isWolfFaction: false,
    description:
      'Không có kỹ năng ban đêm. Hãy dùng suy luận sắc bén vào ban ngày để tìm và treo cổ Ma Sói.',
  },
};

export function getRoleDisplayInfo(
  role?: VisibleRole
): RoleDisplayInfo | undefined {
  if (!role || role === 'UNKNOWN') return undefined;
  return ROLE_INFO_MAP[role];
}

interface RoleCardProps {
  role?: VisibleRole;
  isAlive: boolean;
}

export function RoleCard({ role, isAlive }: RoleCardProps) {
  const isFlipped = useGameStore((s) => s.isRoleCardFlipped);
  const toggleFlipped = useGameStore((s) => s.toggleRoleCardFlipped);

  const info = getRoleDisplayInfo(role);

  return (
    <div className="rounded-2xl border border-purple-900/50 bg-slate-900/85 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sparkles className="h-4 w-4" />
          <span>Thẻ Bài Định Mệnh</span>
        </div>

        <button
          type="button"
          onClick={toggleFlipped}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:border-amber-500/50 hover:text-amber-300"
        >
          {isFlipped ? (
            <>
              <EyeOff className="h-3.5 w-3.5 text-amber-400" />
              <span>Úp thẻ</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              <span>Lật xem</span>
            </>
          )}
        </button>
      </div>

      {!isFlipped || !info ? (
        <button
          type="button"
          onClick={toggleFlipped}
          className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-purple-800/70 bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 px-4 py-7 text-center transition hover:border-amber-500/60"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-2xl shadow-inner transition group-hover:scale-110">
            🌙
          </div>
          <p className="mt-3 text-sm font-bold text-slate-200">
            Thẻ Vai Trò Đang Úp Bảo Mật
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Nhấn vào đây để lật xem danh tính bí mật của bạn
          </p>
        </button>
      ) : (
        <div
          className={`relative overflow-hidden rounded-xl border p-4 transition ${
            info.isWolfFaction
              ? 'border-red-800/70 bg-gradient-to-br from-red-950/80 via-slate-950 to-red-950/50'
              : 'border-amber-500/40 bg-gradient-to-br from-purple-950/70 via-slate-950 to-slate-900'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border p-2.5 text-3xl shadow-lg ${
                  info.isWolfFaction
                    ? 'border-red-700/60 bg-red-900/40'
                    : 'border-amber-500/40 bg-purple-900/40'
                }`}
              >
                {info.emoji}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white">
                    {info.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      info.isWolfFaction
                        ? 'bg-red-900/70 text-red-200'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {info.factionLabel}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  {isAlive ? (
                    <span className="font-semibold text-emerald-400">
                      ● Còn sống
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                      <Skull className="h-3.5 w-3.5" />
                      Đã hy sinh (Linh hồn)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 border-t border-slate-800/80 pt-2.5 text-xs leading-relaxed text-slate-300">
            {info.description}
          </p>
        </div>
      )}
    </div>
  );
}
