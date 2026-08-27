import { getAllowedOrigins } from "../../shared/bridge/allowedOrigins";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CHEGA PELA QUERY STRING, LIDO NUM LUGAR SÓ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A plataforma abre o jogo assim:
 *
 *   /jogos/sistema-operacional?embed=1&attempt=6f1c…&stage=1&points=120
 *                             &lives=3&returnBase=https%3A%2F%2Fedu.atesteme.com
 *
 * ── DUAS CLASSES DE PARÂMETRO, E DUAS REAÇÕES DIFERENTES ─────────────────
 *
 * `stage`, `points`, `lives` e `locale` são AJUSTES: valor estranho vira o
 * padrão e a partida começa. Ninguém deveria ver uma tela de erro porque
 * chegou `stage=9`.
 *
 * `attempt` e `returnBase` são o CONTEXTO: sem eles a partida existe mas o
 * resultado não tem para onde ir. Aí a resposta certa é não começar — jogar
 * uma partida que ninguém consegue creditar é pior que uma mensagem de erro,
 * porque a criança joga, ganha, e o esforço evapora.
 *
 * ── NADA DE SEGREDO AQUI ─────────────────────────────────────────────────
 *
 * A query trafega em histórico, em log de servidor e em `Referer`. Por isso
 * só entram identificadores opacos e números — nunca nome de aluno, token ou
 * qualquer coisa que identifique uma pessoa.
 */

export type EmbedParams = {
  embed: boolean;
  /**
   * ── O EMBED DE DENTRO DE CASA ──────────────────────────────────────────
   *
   * `inline=1` diz "quem me embutiu é este mesmo site". É o que a
   * `GameDetailsPage` usa para rodar o jogo num iframe apontado para a própria
   * rota, em vez de montar o Phaser ao lado dela.
   *
   * Duas consequências, e as duas são o ponto:
   *
   *  · NÃO existe `/approve` nem `/reprove`. Quem hospeda é a plataforma de
   *    jogos, que tem pontos, vidas e modais próprios; navegar o iframe para
   *    uma rota de retorno arrancaria o jogo da tela no melhor momento. O
   *    resultado chega por `postMessage`, que é o canal principal de qualquer
   *    jeito — a navegação sempre foi só a rede de segurança de quem está
   *    fora.
   *  · NÃO existe tela de "Iniciar/Instruções". O hospedeiro já mostrou a
   *    dele antes de montar o iframe; repetir seria pedir dois cliques para
   *    começar o mesmo jogo.
   *
   * Por isso `attempt` e `returnBase` deixam de ser exigidos aqui — e SÓ aqui.
   * Para quem embute de fora, a exigência continua de pé, intacta.
   */
  inline: boolean;
  /** Opaco. Só volta como eco em `meta.attempt`. */
  attempt: string | null;
  stage: 1 | 2 | 3;
  points: number;
  lives: number;
  locale: string;
  /** Origem da plataforma que recebe o resultado. Sempre normalizada. */
  returnBase: string | null;
};

/** O contexto está completo o bastante para valer uma partida? */
export type EmbedValidation =
  | { ok: true }
  | { ok: false; motivo: string };

const PADRAO = {
  stage: 1 as const,
  points: 0,
  lives: 3,
  locale: "pt-BR",
};

const inteiro = (bruto: string | null, padrao: number, minimo: number): number => {
  if (bruto === null) return padrao;
  const n = Number.parseInt(bruto, 10);
  if (!Number.isFinite(n) || n < minimo) return padrao;
  return n;
};

const fase = (bruto: string | null): 1 | 2 | 3 => {
  const n = Number.parseInt(bruto ?? "", 10);
  return n === 1 || n === 2 || n === 3 ? n : PADRAO.stage;
};

/** Só o `origin`. Path, query e barra final são descartados. */
const origem = (bruto: string | null): string | null => {
  if (!bruto) return null;
  try {
    return new URL(bruto).origin;
  } catch {
    return null;
  }
};

export function parseEmbedParams(query: URLSearchParams): EmbedParams {
  /*
   * `id` é sinônimo legado de `attempt`.
   *
   * Existem iframes escritos com `?id=` circulando. O nome canônico é
   * `attempt`, e ele vence se os dois vierem — assim uma URL corrigida pela
   * metade não passa a mandar a tentativa errada.
   */
  const attempt = query.get("attempt")?.trim() || query.get("id")?.trim() || null;

  return {
    embed: query.get("embed") === "1",
    inline: query.get("inline") === "1",
    attempt,
    stage: fase(query.get("stage")),
    points: inteiro(query.get("points"), PADRAO.points, 0),
    lives: inteiro(query.get("lives"), PADRAO.lives, 1),
    locale: query.get("locale")?.trim() || PADRAO.locale,
    returnBase: origem(query.get("returnBase")),
  };
}

/**
 * ── POR QUE A ORIGEM É CONFERIDA AQUI, E NÃO SÓ NA HORA DE NAVEGAR ───────
 *
 * `returnBase` vira uma URL para onde o iframe vai sozinho no fim da partida.
 * Sem conferir contra a allowlist, essa query é um redirecionamento aberto:
 * qualquer pessoa monta um link deste site que joga a criança em outro lugar.
 *
 * Conferir no começo, e não no fim, evita a partida inteira ser jogada para
 * então descobrir que o resultado não tem para onde ir.
 */
export function validarEmbed(params: EmbedParams): EmbedValidation {
  if (!params.embed) return { ok: true };

  /*
   * O embed de dentro de casa não tem contexto para validar: não há tentativa
   * na Atesteme e não há para onde navegar no fim. Exigir os dois aqui seria
   * inventar uma cerimônia para o site conversar consigo mesmo — e o motivo
   * original da exigência (não deixar a criança jogar uma partida que ninguém
   * consegue creditar) não se aplica: quem credita é a própria página que
   * montou o iframe, e ela está do outro lado do `postMessage`.
   */
  if (params.inline) return { ok: true };

  if (!params.attempt) {
    return { ok: false, motivo: "Contexto da atividade não recebido." };
  }

  if (!params.returnBase) {
    return { ok: false, motivo: "Endereço de retorno não recebido." };
  }

  if (!getAllowedOrigins().includes(params.returnBase)) {
    return { ok: false, motivo: "Endereço de retorno não autorizado." };
  }

  return { ok: true };
}

/** `<returnBase>/approve?id=<attempt>` — o `id` é o attempt, sem transformar. */
export function montarRotaDeRetorno(
  returnBase: string,
  resultado: "approve" | "reprove",
  attempt: string
): string {
  const url = new URL(`/${resultado}`, returnBase);
  url.searchParams.set("id", attempt);
  return url.toString();
}
