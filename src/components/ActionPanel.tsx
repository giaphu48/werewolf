'use client';

import {
  CheckCircle2,
  Crosshair,
  Eye,
  Flame,
  HeartPulse,
  Moon,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Vote,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { NightActionType, SanitizedGameState } from '@/types/types';

interface ActionPanelProps {
  roomState: SanitizedGameState;
  onNightAction: (actionType: NightActionType, targetId?: string) => void;
  onVote: (targetId: string | null) => void;
  onHunterShoot: (targetId: string) => void;
}

export function ActionPanel({
  roomState,
  onNightAction,
  onVote,
  onHunterShoot,
}: ActionPanelProps) {
  const selectedTargetId = useGameStore((s) => s.selectedTargetId);
  const setSelectedTargetId = useGameStore((s) => s.setSelectedTargetId);
  const seerResult = useGameStore((s) => s.seerResult);
  const witchVictimId = useGameStore((s) => s.witchVictimId);

  const selfPlayer = roomState.players.find((p) => p.id === roomState.selfId);
  const selectedTarget = roomState.players.find(
    (p) => p.id === selectedTargetId
  );

  if (!selfPlayer) return null;

  const isHunterPendingSelf =
    roomState.phase === 'HUNTER_SHOOT' &&
    roomState.hunterPendingShotId === selfPlayer.id;

  // 1. Pha đặc biệt: Thợ Săn bắn trả trước khi chết
  if (roomState.phase === 'HUNTER_SHOOT') {
    const hunterPlayer = roomState.players.find(
      (p) => p.id === roomState.hunterPendingShotId
    );

    if (isHunterPendingSelf) {
      const canShoot =
        Boolean(selectedTarget) &&
        selectedTarget?.isAlive &&
        selectedTarget.id !== selfPlayer.id;

      return (
        <div className="rounded-2xl border border-amber-500/70 bg-gradient-to-br from-red-950/90 via-slate-900 to-amber-950/50 p-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
            <Crosshair className="h-4 w-4 animate-spin" />
            <span>Kỹ Năng Thợ Săn Cuối Cùng</span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-white">
            Bạn đã ngã xuống! Hãy chọn 1 người trên bàn chơi để nổ súng kéo theo.
          </h3>

          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
            Mục tiêu đang ngắm:{' '}
            <strong className="text-amber-400">
              {selectedTarget ? selectedTarget.name : 'Chưa chọn mục tiêu'}
            </strong>
          </div>

          <button
            type="button"
            disabled={!canShoot}
            onClick={() => {
              if (selectedTarget) {
                onHunterShoot(selectedTarget.id);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-900/40 transition hover:from-red-500 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Crosshair className="h-4 w-4" />
            <span>
              {selectedTarget
                ? `Bắn Hạ ${selectedTarget.name}`
                : 'Chọn 1 người chơi trên bàn để bắn'}
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-amber-500/40 bg-slate-900/85 p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Crosshair className="h-4 w-4" />
          <span>Phát Súng Của Thợ Săn</span>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Đang chờ Thợ Săn{' '}
          <strong className="text-amber-400">
            {hunterPlayer?.name || ''}
          </strong>{' '}
          lựa chọn mục tiêu kéo theo...
        </p>
      </div>
    );
  }

  // 2. Nếu người chơi đã chết -> Chế độ Khán giả / Linh hồn
  if (!selfPlayer.isAlive) {
    return (
      <div className="rounded-2xl border border-purple-900/50 bg-slate-900/80 p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
          <Skull className="h-4 w-4 text-rose-400" />
          <span>Chế Độ Linh Hồn (Khán Giả)</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Bạn đã hy sinh và trở thành Linh Hồn. Bạn có thể nhìn thấy vai trò thật
          của tất cả người chơi trên bàn và trò chuyện cùng những linh hồn khác ở
          kênh <strong className="text-purple-300">Linh Hồn (DEAD)</strong>.
        </p>
      </div>
    );
  }

  // 3. Pha VOTING (Bỏ phiếu ban ngày)
  if (roomState.phase === 'VOTING') {
    const myCurrentVote = roomState.votes[selfPlayer.id];
    const hasVoted = Object.prototype.hasOwnProperty.call(
      roomState.votes,
      selfPlayer.id
    );
    const votedTargetPlayer = roomState.players.find(
      (p) => p.id === myCurrentVote
    );

    return (
      <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Vote className="h-4 w-4" />
            <span>Bỏ Phiếu Phán Quyết</span>
          </div>
          {hasVoted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              {myCurrentVote === null
                ? 'Đã bỏ phiếu trắng'
                : `Đã vote: ${votedTargetPlayer?.name || ''}`}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-300">
          Chọn một người chơi còn sống trên bàn để bỏ phiếu treo cổ, hoặc bỏ
          phiếu trắng nếu bạn chưa chắc chắn.
        </p>

        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-300">
          Mục tiêu đang chọn:{' '}
          <strong className="text-amber-400">
            {selectedTarget ? selectedTarget.name : 'Chưa chọn ai'}
          </strong>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!selectedTarget || !selectedTarget.isAlive}
            onClick={() => {
              if (selectedTarget) {
                onVote(selectedTarget.id);
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Vote className="h-4 w-4" />
            <span>
              {selectedTarget
                ? `Treo Cổ ${selectedTarget.name}`
                : 'Chọn người để Vote'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTargetId(null);
              onVote(null);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <span>Bỏ Phiếu Trắng</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Pha MORNING & DISCUSSION
  if (roomState.phase === 'MORNING' || roomState.phase === 'DISCUSSION') {
    const deadLastNightPlayers = roomState.players.filter((p) =>
      roomState.lastNightDeaths.includes(p.id)
    );

    return (
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/85 p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sun className="h-4 w-4" />
          <span>
            {roomState.phase === 'MORNING'
              ? 'Thông Báo Bình Minh'
              : 'Thảo Luận Tìm Ma Sói'}
          </span>
        </div>

        <div className="mt-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
          {deadLastNightPlayers.length > 0 ? (
            <p className="text-rose-300">
              Đêm qua:{' '}
              <strong>
                {deadLastNightPlayers.map((p) => p.name).join(', ')}
              </strong>{' '}
              đã bị sát hại!
            </p>
          ) : (
            <p className="text-emerald-300">
              Đêm qua là một đêm bình yên, không có ai thiệt mạng.
            </p>
          )}
        </div>

        <p className="mt-2.5 text-xs text-slate-400">
          Hãy trao đổi thông tin ở khung Chat bên dưới để tìm ra Ma Sói trước khi
          bước vào giờ Bỏ Phiếu.
        </p>
      </div>
    );
  }

  // 5. Pha NIGHT (Ban đêm - Bảng điều khiển riêng cho từng Role)
  if (roomState.phase === 'NIGHT') {
    const role = selfPlayer.role;
    const nightInfo = roomState.myNightInfo;

    // 5.1. MA SÓI (WEREWOLF)
    if (role === 'WEREWOLF') {
      const myWolfVoteTargetId = nightInfo?.wolfVotes?.[selfPlayer.id];
      const myVotedVictim = roomState.players.find(
        (p) => p.id === myWolfVoteTargetId
      );

      return (
        <div className="rounded-2xl border border-red-800/70 bg-gradient-to-br from-red-950/85 via-slate-900 to-slate-950 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-red-400">
              <Flame className="h-4 w-4" />
              <span>Cuộc Săn Đêm Của Bầy Sói</span>
            </div>
            {myVotedVictim && (
              <span className="rounded-full bg-red-900/60 px-2.5 py-0.5 text-[11px] font-bold text-red-200">
                Đang nhắm: {myVotedVictim.name}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-300">
            Thống nhất với đồng đội ở kênh <strong className="text-red-400">Chat Sói</strong> và
            chọn 1 con mồi trên bàn chơi để kết liễu đêm nay.
          </p>

          <button
            type="button"
            disabled={!selectedTarget || !selectedTarget.isAlive}
            onClick={() => {
              if (selectedTarget) {
                onNightAction('KILL', selectedTarget.id);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition hover:from-red-600 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Skull className="h-4 w-4" />
            <span>
              {selectedTarget
                ? `Cắn ${selectedTarget.name}`
                : 'Chọn 1 con mồi trên bàn chơi'}
            </span>
          </button>
        </div>
      );
    }

    // 5.2. TIÊN TRI (SEER)
    if (role === 'SEER') {
      const inspectedTargetId = nightInfo?.seerTargetId ?? seerResult?.targetId;
      const inspectedPlayer = roomState.players.find(
        (p) => p.id === inspectedTargetId
      );
      const hasInspectedTonight = Boolean(inspectedTargetId);

      return (
        <div className="rounded-2xl border border-purple-700/60 bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 p-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
            <Eye className="h-4 w-4" />
            <span>Quả Cầu Tiên Tri</span>
          </div>

          <p className="mt-1.5 text-xs text-slate-300">
            Mỗi đêm bạn được soi danh tính thật sự của 1 người chơi khác.
          </p>

          {seerResult && inspectedPlayer && (
            <div
              className={`mt-3 rounded-xl border p-3 text-xs font-semibold ${
                seerResult.isWolf
                  ? 'border-red-700 bg-red-950/80 text-red-200'
                  : 'border-emerald-700 bg-emerald-950/80 text-emerald-200'
              }`}
            >
              Kết quả soi <strong>{inspectedPlayer.name}</strong>:{' '}
              {seerResult.isWolf ? (
                <span className="font-extrabold uppercase text-red-400">
                  🐺 ĐÂY LÀ MA SÓI!
                </span>
              ) : (
                <span className="font-extrabold uppercase text-emerald-400">
                  ✨ Thuộc Phe Dân Làng
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={
              hasInspectedTonight ||
              !selectedTarget ||
              !selectedTarget.isAlive ||
              selectedTarget.id === selfPlayer.id
            }
            onClick={() => {
              if (selectedTarget) {
                onNightAction('SEER', selectedTarget.id);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {hasInspectedTonight
                ? `Đã soi ${inspectedPlayer?.name || 'mục tiêu'} đêm nay`
                : selectedTarget
                  ? selectedTarget.id === selfPlayer.id
                    ? 'Không thể tự soi chính mình'
                    : `Soi Danh Tính ${selectedTarget.name}`
                  : 'Chọn 1 người chơi trên bàn để soi'}
            </span>
          </button>
        </div>
      );
    }

    // 5.3. BẢO VỆ (BODYGUARD)
    if (role === 'BODYGUARD') {
      const protectedId = nightInfo?.protectedPlayerId;
      const lastProtectedId = nightInfo?.lastProtectedPlayerId;
      const protectedPlayer = roomState.players.find(
        (p) => p.id === protectedId
      );
      const lastProtectedPlayer = roomState.players.find(
        (p) => p.id === lastProtectedId
      );
      const isSameAsLastNight =
        Boolean(selectedTarget) && selectedTarget?.id === lastProtectedId;

      return (
        <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-950 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
              <Shield className="h-4 w-4" />
              <span>Khiên Hộ Vệ Ban Đêm</span>
            </div>
            {protectedPlayer && (
              <span className="rounded-full bg-emerald-950/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                Đang bảo vệ: {protectedPlayer.name}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-slate-300">
            Chọn 1 người chơi để che chở khỏi đòn tấn công của Ma Sói đêm nay.
          </p>

          {lastProtectedPlayer && (
            <p className="mt-1.5 text-[11px] text-amber-300/90">
              Lưu ý: Đêm trước bạn đã bảo vệ{' '}
              <strong>{lastProtectedPlayer.name}</strong> nên không thể chọn lại
              người này đêm nay.
            </p>
          )}

          <button
            type="button"
            disabled={
              !selectedTarget || !selectedTarget.isAlive || isSameAsLastNight
            }
            onClick={() => {
              if (selectedTarget) {
                onNightAction('PROTECT', selectedTarget.id);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Shield className="h-4 w-4" />
            <span>
              {isSameAsLastNight
                ? 'Không được bảo vệ 1 người 2 đêm liên tiếp'
                : selectedTarget
                  ? `Bảo Vệ ${selectedTarget.name}`
                  : 'Chọn 1 người chơi trên bàn để bảo vệ'}
            </span>
          </button>
        </div>
      );
    }

    // 5.4. PHÙ THỦY (WITCH)
    if (role === 'WITCH') {
      const potions = roomState.myWitchPotions ?? {
        hasSavePotion: false,
        hasPoisonPotion: false,
      };
      const saveUsedTonight = Boolean(nightInfo?.witchSaveUsedTonight);
      const poisonedTargetId = nightInfo?.witchPoisonTargetId;
      const poisonedPlayer = roomState.players.find(
        (p) => p.id === poisonedTargetId
      );
      const wolfVictimPlayer = roomState.players.find(
        (p) => p.id === witchVictimId
      );

      return (
        <div className="rounded-2xl border border-purple-700/60 bg-gradient-to-br from-purple-950/85 via-slate-900 to-slate-950 p-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Bàn Pha Chế Của Phù Thủy</span>
          </div>

          <div className="mt-3 space-y-3">
            {/* Bình Cứu */}
            <div className="rounded-xl border border-emerald-800/60 bg-slate-950/75 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                  <HeartPulse className="h-4 w-4" />
                  Bình Thuốc Cứu Sinh
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    potions.hasSavePotion
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {potions.hasSavePotion ? 'Còn 1 bình' : 'Đã dùng hết'}
                </span>
              </div>

              {potions.hasSavePotion && (
                <p className="mt-1.5 text-xs text-slate-300">
                  Nạn nhân bị Sói cắn đêm nay:{' '}
                  {wolfVictimPlayer ? (
                    <strong className="text-red-400">
                      {wolfVictimPlayer.name}
                    </strong>
                  ) : (
                    <span className="italic text-slate-400">
                      Đang chờ bầy Sói chọn con mồi...
                    </span>
                  )}
                </p>
              )}

              <button
                type="button"
                disabled={!potions.hasSavePotion || !wolfVictimPlayer}
                onClick={() => onNightAction('WITCH_SAVE')}
                className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  saveUsedTonight
                    ? 'border border-emerald-500 bg-emerald-900/60 text-emerald-200'
                    : 'bg-emerald-600 text-slate-950 hover:bg-emerald-500'
                }`}
              >
                <HeartPulse className="h-3.5 w-3.5" />
                <span>
                  {saveUsedTonight
                    ? `Đã kích hoạt cứu ${wolfVictimPlayer?.name || ''} (Nhấn để hủy)`
                    : wolfVictimPlayer
                      ? `Dùng Bình Cứu cho ${wolfVictimPlayer.name}`
                      : 'Chưa có nạn nhân để cứu'}
                </span>
              </button>
            </div>

            {/* Bình Độc */}
            <div className="rounded-xl border border-red-900/60 bg-slate-950/75 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-red-400">
                  <Skull className="h-4 w-4" />
                  Bình Độc Dược
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    potions.hasPoisonPotion
                      ? 'bg-red-950 text-red-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {potions.hasPoisonPotion ? 'Còn 1 bình' : 'Đã dùng hết'}
                </span>
              </div>

              {poisonedPlayer && (
                <p className="mt-1.5 text-xs text-red-300">
                  Đang chọn đầu độc: <strong>{poisonedPlayer.name}</strong>
                </p>
              )}

              <button
                type="button"
                disabled={
                  !potions.hasPoisonPotion ||
                  !selectedTarget ||
                  !selectedTarget.isAlive
                }
                onClick={() => {
                  if (selectedTarget) {
                    onNightAction('WITCH_POISON', selectedTarget.id);
                  }
                }}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-red-700 to-purple-700 px-3 py-2 text-xs font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Skull className="h-3.5 w-3.5" />
                <span>
                  {selectedTarget
                    ? `Quăng Bình Độc vào ${selectedTarget.name}`
                    : 'Chọn 1 người trên bàn để dùng Bình Độc'}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 5.5. DÂN LÀNG / THỢ SĂN (Không có hành động chủ động ban đêm)
    return (
      <div className="rounded-2xl border border-purple-900/50 bg-slate-900/80 p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
          <Moon className="h-4 w-4 text-amber-400" />
          <span>Màn Đêm Tĩnh Lặng</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Ngôi làng đang chìm trong bóng đêm. Các vai trò chức năng đang bí mật
          hành động, hãy chờ bình minh lên để biết chuyện gì đã xảy ra...
        </p>
      </div>
    );
  }

  return null;
}
