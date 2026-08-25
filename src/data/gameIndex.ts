import type Phaser from "phaser";
import type { Game } from "../types/game";
import type { SkillCode } from "../shared/types/game";
import { catalog } from "./catalog";

/* ─────────────────────────────────────────── índices ─────────── */

const byId = new Map<string, Game>();
const bySlug = new Map<string, Game>();
const bySkill = new Map<SkillCode, Game[]>();

for (const game of catalog) {
  byId.set(game.id, game);
  bySlug.set(game.slug, game);

  for (const alias of game.aliases ?? []) {
    bySlug.set(alias, game);
  }

  // Map<skill, Game[]> e não Map<skill, Game>: a relação é 1 habilidade
  // para N jogos. É só do lado do jogo que ela é 1:1.
  const list = bySkill.get(game.skill) ?? [];
  list.push(game);
  bySkill.set(game.skill, list);
}

/* ───────────────────────────────────── validação em dev ─────────

   Um catálogo com id duplicado é o tipo de bug que só aparece três
   telas depois, como progresso trocado entre dois jogos. Falha aqui,
   alto e cedo.                                                     */

if (import.meta.env.DEV) {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenModules = new Set<string>();

  for (const game of catalog) {
    if (seenIds.has(game.id)) {
      throw new Error(`[catalog] id duplicado: ${game.id}`);
    }
    seenIds.add(game.id);

    if (!/^\d{3}$/.test(game.id)) {
      throw new Error(`[catalog] id fora do formato 000: ${game.id}`);
    }

    for (const s of [game.slug, ...(game.aliases ?? [])]) {
      if (seenSlugs.has(s)) {
        throw new Error(`[catalog] slug duplicado: ${s}`);
      }
      seenSlugs.add(s);
    }

    if (seenModules.has(game.module)) {
      throw new Error(`[catalog] module duplicado: ${game.module}`);
    }
    seenModules.add(game.module);

    // A convenção é "<skill>/<slug>". Não é obrigatória tecnicamente,
    // mas quebrá-la sem querer deixa a pasta órfã do agrupamento.
    if (!game.module.startsWith(`${game.skill}/`)) {
      console.warn(
        `[catalog] ${game.id}: module "${game.module}" não começa com a ` +
          `skill "${game.skill}". Intencional?`
      );
    }
  }
}

/* ────────────────────────────────────────── resolvers ─────────── */

/** Lista pública, já na ordem da trilha. */
export const games: Game[] = [...catalog].sort((a, b) => a.order - b.order);

export function getGameById(id: string): Game | undefined {
  return byId.get(id);
}

export function getGameBySlug(slug: string): Game | undefined {
  return bySlug.get(slug);
}

/** Todos os jogos de uma habilidade. Pode ser mais de um. */
export function getGamesBySkill(skill: SkillCode): Game[] {
  return bySkill.get(skill) ?? [];
}

export function getGamesByYear(year: number): Game[] {
  return games.filter((g) => g.years.includes(year));
}

export function getGamesByTag(tag: string): Game[] {
  const needle = tag.toLowerCase();
  return games.filter(
    (g) =>
      g.tags.some((t) => t.toLowerCase() === needle) ||
      g.skill.toLowerCase() === needle
  );
}

/** Agrupamento por habilidade, para telas que listam a trilha da BNCC. */
export function groupBySkill(): Array<{ skill: SkillCode; games: Game[] }> {
  return [...bySkill.entries()]
    .map(([skill, list]) => ({
      skill,
      games: [...list].sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill));
}

/**
 * Aceita id ("001"), slug ("pixel-secreto"), alias antigo ou código de
 * habilidade ("EF01CO05") e devolve SEMPRE o id.
 *
 * Substitui o antigo `normalizeGameId` + `GAME_CODE_TO_SLUG`, que só
 * cobria 4 dos 45 jogos.
 *
 * Aviso: resolver por código de habilidade é ambíguo quando a habilidade
 * tem mais de um jogo — devolve o de menor `order`. Serve só para
 * compatibilidade com estado antigo; código novo não deve depender disso.
 */
export function resolveGameId(input: string): string | undefined {
  if (byId.has(input)) return input;

  const bySlugHit = bySlug.get(input);
  if (bySlugHit) return bySlugHit.id;

  const bySkillHit = bySkill.get(input as SkillCode);
  if (bySkillHit?.length) {
    return [...bySkillHit].sort((a, b) => a.order - b.order)[0].id;
  }

  return undefined;
}

/* ──────────────────────────────── carregamento do Phaser ────────

   Dois níveis de glob porque a pasta agora é <skill>/<slug>.
   O Vite resolve isso em build time e mantém cada jogo em seu próprio
   chunk — o import continua preguiçoso. Isso aposenta o
   GAME_CONFIG_LOADERS escrito à mão com 45 linhas.                  */

/* A convenção é `index.ts`, e é o que os 45 jogos usam.

   O `.tsx` está no glob como REDE, não como alternativa: a Arena da Lógica
   nasceu com os sete arquivos em `.tsx` (sem uma linha de JSX em nenhum
   deles), o glob não a encontrava, e o resultado era a página inteira
   quebrando com um stack trace do React — um erro de extensão derrubando a
   tela toda. Aceitar as duas evita que um deslize desses volte a custar isso.
   Arquivo novo continua nascendo `.ts`.                                    */

const gameModules = import.meta.glob<{
  default: Phaser.Types.Core.GameConfig;
}>("../games/*/*/index.{ts,tsx}");

export function loadGameConfig(game: Game) {
  const loader =
    gameModules[`../games/${game.module}/index.ts`] ??
    gameModules[`../games/${game.module}/index.tsx`];

  if (!loader) {
    throw new Error(
      `[catalog] jogo "${game.id}" aponta para o módulo "${game.module}", ` +
        `mas src/games/${game.module}/index.ts não existe. ` +
        `Módulos encontrados: ${Object.keys(gameModules).join(", ")}`
    );
  }

  return loader();
}
