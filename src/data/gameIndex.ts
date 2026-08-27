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

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CHUNK QUE SUMIU DEBAIXO DA ABA ABERTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Cada jogo é carregado por `import()`, e o arquivo tem hash no nome. Num
 * deploy os arquivos novos entram com hashes novos e os antigos somem.
 *
 * Quem estava com a aba aberta nesse instante continua rodando o HTML velho,
 * que só conhece os hashes velhos. Enquanto ninguém troca de tela, nada
 * acontece — o problema aparece no primeiro `import()`: o arquivo não existe
 * mais, e o jogo fica em "Carregando jogo..." para sempre.
 *
 * Isso não é hipótese: aconteceu em 27/08/2026, poucos minutos depois de um
 * deploy. E o sintoma não ajuda — o console fala de MIME type e de módulo,
 * porque o servidor devolvia `index.html` no lugar do arquivo que faltava.
 *
 * O remédio é o de sempre: recarregar uma vez. A aba pega o HTML novo, com os
 * hashes novos, e segue. É o único conserto possível do lado do cliente —
 * o código velho não tem como adivinhar o nome do arquivo novo.
 */

/** A marca fica no `sessionStorage`: é por aba, e sobrevive ao reload. */
const MARCA_DE_RECARGA = "jogos:recarga-por-chunk-antigo";

/**
 * O erro é de arquivo que sumiu, ou é problema do jogo?
 *
 * Cada navegador escreve a mesma falha com uma frase diferente, e nenhum
 * oferece um código. Sobrou casar texto — feio, e é o que existe.
 *
 * Exportado porque a decisão é a parte que precisa ser conferida: recarregar
 * por engano custa a partida de alguém.
 */
export function pareceChunkAntigo(erro: unknown): boolean {
  const mensagem = erro instanceof Error ? erro.message : String(erro ?? "");

  return (
    // Chrome
    /Failed to fetch dynamically imported module/i.test(mensagem) ||
    // Firefox
    /error loading dynamically imported module/i.test(mensagem) ||
    // Safari
    /Importing a module script failed/i.test(mensagem) ||
    /Unable to load module script/i.test(mensagem) ||
    // o que o navegador diz quando recebeu HTML no lugar de JavaScript
    /Expected a JavaScript(-or-Wasm)? module script/i.test(mensagem)
  );
}

/**
 * Vale recarregar por causa deste erro?
 *
 * Separado do ato de recarregar de propósito: assim a regra — que é a parte
 * arriscada — pode ser exercitada sem ninguém precisar derrubar uma página.
 *
 * Três condições, e todas precisam valer:
 *
 *  1. o erro tem cara de arquivo que sumiu (e não de bug do jogo);
 *  2. esta aba ainda não tentou — senão uma falha permanente vira laço
 *     infinito de recarga, que é muito pior que uma tela travada;
 *  3. dá para GRAVAR a marca. Sem `sessionStorage` (aba anônima, storage
 *     bloqueado) a condição 2 não se sustenta depois do reload, e aí a opção
 *     segura é não recarregar. Falhar como antes é ruim; falhar em laço é
 *     inaceitável.
 */
export function decidirRecarga(erro: unknown): boolean {
  if (!pareceChunkAntigo(erro)) return false;
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(MARCA_DE_RECARGA)) return false;
    window.sessionStorage.setItem(MARCA_DE_RECARGA, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Apagada em toda carga bem-sucedida.
 *
 * Sem isto, a aba teria direito a UMA recarga na vida. Com isto, cada deploy
 * novo ganha a sua — e o laço continua impossível, porque só um sucesso
 * devolve o direito.
 */
function limparMarcaDeRecarga() {
  try {
    window.sessionStorage.removeItem(MARCA_DE_RECARGA);
  } catch {
    // sem storage não havia marca para apagar
  }
}

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

  return loader().then(
    (modulo) => {
      limparMarcaDeRecarga();
      return modulo;
    },
    (erro: unknown) => {
      if (!decidirRecarga(erro)) throw erro;

      console.warn(
        "[jogos] o arquivo deste jogo não existe mais no servidor — " +
          "provavelmente houve um deploy com esta aba aberta. Recarregando " +
          "uma vez para pegar a versão nova.",
        erro
      );

      window.location.reload();

      /*
       * A promessa que nunca resolve.
       *
       * A página está sendo trocada; resolver ou rejeitar aqui só serviria
       * para o chamador desenhar um erro que ninguém vai ler, no meio do
       * caminho. Deixar pendente mantém a tela como está até o reload chegar.
       */
      return new Promise<never>(() => {});
    }
  );
}
