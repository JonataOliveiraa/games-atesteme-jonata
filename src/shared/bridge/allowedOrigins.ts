/**
 * ══════════════════════════════════════════════════════════════════════════
 *  QUEM PODE CONVERSAR COM ESTE SITE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `postMessage` não tem destinatário: uma mensagem enviada com `targetOrigin`
 * "*" chega em QUALQUER página que tenha embutido este site num iframe, e uma
 * mensagem recebida sem checar `event.origin` veio de qualquer um que
 * conseguiu abrir uma janela para cá.
 *
 * Como o que trafega aqui é resultado de atividade de aluno — e o que volta
 * são comandos que iniciam e destravam jogo —, as duas pontas checam.
 *
 * A lista vem de `VITE_EMBED_ALLOWED_ORIGINS`, separada por vírgula:
 *
 *   VITE_EMBED_ALLOWED_ORIGINS=https://edu.atesteme.com,http://localhost:5173
 *
 * ── LISTA VAZIA NÃO É "LIBERADO" ─────────────────────────────────────────
 *
 * Se a variável não existir, `getAllowedOrigins()` devolve lista vazia e
 * NADA é enviado nem aceito. É o contrário do padrão confortável — e é de
 * propósito: um deploy que esqueceu a variável falha visível (o jogo não
 * reporta) em vez de falhar aberto (o jogo reporta para todo mundo).
 */

/** Só o `origin`: protocolo + host + porta. Path e barra final não entram. */
function normalizar(bruto: string): string | null {
  const limpo = bruto.trim();
  if (!limpo) return null;
  try {
    return new URL(limpo).origin;
  } catch {
    return null;
  }
}

let cache: string[] | null = null;

/**
 * ── A PRÓPRIA ORIGEM ENTRA SEMPRE ────────────────────────────────────────
 *
 * A allowlist existe para decidir quem, LÁ DE FORA, pode conversar com este
 * site. A própria origem não é "lá fora": uma página e um iframe da mesma
 * origem já podem ler e escrever um no outro diretamente, sem `postMessage`.
 * Exigir configuração para o site falar consigo mesmo não protege de nada.
 *
 * E cobrava caro. Como a página de detalhes agora roda o jogo num iframe
 * apontado para ela mesma, ela É o destinatário — e uma lista que não
 * mencionasse a própria origem deixava a ponte muda dentro de casa.
 *
 * Foi exatamente o que aconteceu: o `.env.local` fixa
 * `http://localhost:5173`, o Vite subiu na 5174 porque a 5173 estava ocupada,
 * e TODO evento da partida passou a ser descartado pelo navegador
 * ("target origin does not match the recipient window's origin"). O sintoma
 * não parecia em nada com a causa: o jogo travava ao errar e a tela de derrota
 * nunca aparecia, porque a plataforma jamais recebeu o `WRONG_ANSWER` nem o
 * `GAME_OVER`.
 *
 * Trocar de porta não pode quebrar o jogo.
 */
export function getAllowedOrigins(): string[] {
  if (cache) return cache;

  const bruto = import.meta.env.VITE_EMBED_ALLOWED_ORIGINS as string | undefined;

  const daVariavel = (bruto ?? "")
    .split(",")
    .map(normalizar)
    .filter((o): o is string => !!o);

  const propria =
    typeof window !== "undefined" ? normalizar(window.location.origin) : null;

  cache = [...new Set(propria ? [propria, ...daVariavel] : daVariavel)];

  if (import.meta.env.DEV && daVariavel.length === 0) {
    console.warn(
      "[embed] VITE_EMBED_ALLOWED_ORIGINS está vazia: o site fala consigo " +
        "mesmo, mas nenhuma plataforma externa recebe evento nem envia " +
        "comando. Crie um .env.local a partir do .env.example."
    );
  }

  return cache;
}

export function isOriginAllowed(origin: string): boolean {
  return getAllowedOrigins().includes(origin);
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  PARA QUAIS ORIGENS MANDAR ESTA MENSAGEM
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `postMessage` exige um `targetOrigin`, e ele precisa bater com a origem real
 * da janela de destino — senão o navegador descarta a mensagem e escreve um
 * erro no console. Como não dá para perguntar a origem de uma janela de outro
 * domínio, a saída é mandar uma mensagem por origem permitida: a certa é
 * entregue, as outras são descartadas.
 *
 * Só que dá para saber quando a janela é DA MESMA ORIGEM: ler
 * `janela.location.origin` funciona nesse caso e lança `SecurityError` em
 * qualquer outro. E é o caso normal desde que a página de detalhes passou a
 * embutir o próprio site.
 *
 * Quando a origem é conhecida, mandamos UMA mensagem, para ela. Isso não muda
 * o que chega do outro lado — muda o que aparece no console, que antes era
 * uma parede de "Failed to execute 'postMessage'" a cada evento da partida,
 * varrendo para longe qualquer erro de verdade.
 */
export function origensDeDestino(janela: Window | null): string[] {
  if (!janela) return [];

  try {
    const mesma = janela.location.origin;
    if (mesma && isOriginAllowed(mesma)) return [mesma];
  } catch {
    // origem diferente: não dá para saber qual é, então vale a lista inteira
  }

  return getAllowedOrigins();
}

/** Só para teste: força a releitura da variável. */
export function resetAllowedOriginsCache() {
  cache = null;
}
