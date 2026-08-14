import { resolveGameId } from "../data/gameIndex";

export const STORAGE_KEY = "platform-state-v6";
const LEGACY_KEY = "platform-state-v5";

type AnyRecord = Record<string, unknown>;

/**
 * Remapeia as chaves de um mapa indexado por slug para indexado por id.
 * Chave que não resolve é descartada — é lixo de um jogo que não existe mais.
 */
function remapKeys<T>(source: Record<string, T> | undefined): Record<string, T> {
  const out: Record<string, T> = {};
  if (!source) return out;

  for (const [key, value] of Object.entries(source)) {
    const id = resolveGameId(key);
    if (id) out[id] = value;
  }

  return out;
}

function remapHistory(history: AnyRecord[] | undefined): AnyRecord[] {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const id = resolveGameId(String(item.gameId ?? ""));
      return id ? { ...item, gameId: id } : null;
    })
    .filter((item): item is AnyRecord => item !== null);
}

/**
 * Converte o estado v5 (indexado por slug) para v6 (indexado por id).
 *
 * Roda uma única vez: depois de gravar o v6, o v5 é removido.
 * Se o usuário nunca jogou, não há v5 e a função devolve null sem drama.
 */
export function migrateLegacyState(): AnyRecord | null {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;

  try {
    const old = JSON.parse(raw) as AnyRecord;

    const migrated: AnyRecord = {
      points: old.points ?? 0,
      extraLifeCost: old.extraLifeCost,
      unlockCost: old.unlockCost,
      blockedGames: remapKeys(old.blockedGames as Record<string, string>),
      gameLives: remapKeys(old.gameLives as Record<string, number>),
      gameStreaks: remapKeys(old.gameStreaks as Record<string, number>),
      gameErrorCounts: remapKeys(old.gameErrorCounts as Record<string, number>),
      history: remapHistory(old.history as AnyRecord[]),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_KEY);

    return migrated;
  } catch {
    // v5 corrompido: melhor começar limpo do que travar o app na inicialização
    localStorage.removeItem(LEGACY_KEY);
    return null;
  }
}

/**
 * Use no lugar do localStorage.getItem direto do loadInitialState().
 * Tenta o v6; se não existir, tenta migrar o v5; se nada existir, devolve null.
 */
export function readPersistedState(): AnyRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      return JSON.parse(raw) as AnyRecord;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  return migrateLegacyState();
}
