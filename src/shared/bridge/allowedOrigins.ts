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

/**
 * ── ORIGENS COM CURINGA ──────────────────────────────────────────────────
 *
 * A plataforma que embute este site atende cada parceiro num subdomínio
 * próprio — `inpeq.edu-staging.atesteme.com`, e um novo a cada venda. Como a
 * lista entra no BUILD, listar host por host significa que todo parceiro novo
 * nasce com o jogo quebrado até alguém lembrar de republicar este site.
 *
 * Então a lista aceita padrão de sufixo:
 *
 *   VITE_EMBED_ALLOWED_ORIGINS=https://edu.atesteme.com,https://*.atesteme.com
 *
 * O curinga cobre um nível ou mais de subdomínio, sempre no mesmo protocolo, e
 * nunca o domínio pelado: `https://*.atesteme.com` não autoriza
 * `https://atesteme.com` nem `https://malicioso-atesteme.com` — o ponto vai
 * junto no sufixo, e é ele que impede o vizinho de se passar pelo domínio.
 *
 * ── CURINGA SÓ SERVE PARA ACEITAR ────────────────────────────────────────
 *
 * `postMessage` exige um `targetOrigin` concreto: mandar para
 * `https://*.atesteme.com` é erro, não coringa. Por isso o padrão entra só na
 * checagem de quem PODE falar; a origem concreta de quem embute é aprendida em
 * tempo de execução, pelo `returnBase` da query ou pela primeira mensagem que
 * chega dela.
 */
function ehPadrao(bruto: string): boolean {
  return bruto.includes("*");
}

function casaComPadrao(origem: string, padrao: string): boolean {
  const separador = padrao.indexOf("://");
  if (separador < 0) return false;

  const protocolo = padrao.slice(0, separador);
  const host = padrao.slice(separador + 3);
  if (!host.startsWith("*.")) return false;

  let alvo: URL;
  try {
    alvo = new URL(origem);
  } catch {
    return false;
  }

  if (alvo.protocol !== protocolo + ":") return false;

  const sufixo = host.slice(1);
  return alvo.hostname.endsWith(sufixo) && alvo.hostname.length > sufixo.length;
}

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
let padroes: string[] | null = null;

/**
 * Origens concretas descobertas em execução.
 *
 * Quem embute por um subdomínio de parceiro é autorizado por padrão, mas o
 * padrão não serve de `targetOrigin`. Então a origem real é registrada quando
 * aparece — pelo `returnBase` da query, antes da partida começar — e a partir
 * daí as mensagens vão direto para ela, sem depender de tentativa e erro.
 */
const aprendidas = new Set<string>();

/**
 * Registra a origem concreta de quem embutiu, se ela for autorizada.
 *
 * Devolve `true` quando passou a valer como destino. Chamar com origem não
 * autorizada não faz nada — o registro não é uma porta lateral para a lista.
 */
export function registrarOrigemDeQuemEmbute(origem: string): boolean {
  const normalizada = normalizar(origem);
  if (!normalizada || !isOriginAllowed(normalizada)) return false;

  aprendidas.add(normalizada);
  return true;
}

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

  const entradas = (bruto ?? "")
    .split(",")
    .map((entrada) => entrada.trim())
    .filter(Boolean);

  padroes = entradas.filter(ehPadrao);

  const daVariavel = entradas
    .filter((entrada) => !ehPadrao(entrada))
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
  if (getAllowedOrigins().includes(origin)) return true;
  return (padroes ?? []).some((padrao) => casaComPadrao(origin, padrao));
}

/** Só para teste: os padrões com curinga configurados nesta build. */
export function getAllowedOriginPatterns(): string[] {
  getAllowedOrigins();
  return [...(padroes ?? [])];
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
    // origem diferente: não dá para ler qual é
  }

  /*
   * As origens aprendidas entram aqui, e são o que faz o curinga funcionar de
   * verdade: um parceiro autorizado por padrão não aparece na lista fixa, então
   * sem isto a mensagem não teria para onde ir.
   */
  return [...new Set([...aprendidas, ...getAllowedOrigins()])];
}

/** Só para teste: força a releitura da variável. */
export function resetAllowedOriginsCache() {
  cache = null;
}
