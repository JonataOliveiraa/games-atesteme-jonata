import { useEffect, useRef } from "react";
import { isIframePlatformEventMessage } from "../../shared/contracts/iframeMessages";
import { isOriginAllowed } from "../../shared/bridge/allowedOrigins";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O DEPURADOR DE EVENTOS — tecla Y
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Desligado por padrão. `Y` liga e desliga, e avisa qual dos dois aconteceu.
 * Ligado, dá um `alert()` quando o jogo anuncia que ficou pronto, que venceu
 * ou que perdeu.
 *
 * Existe porque esse tráfego é invisível: quando um evento não sai, a tela
 * simplesmente não reage, e "não reagiu" tem uma dúzia de causas. Foi assim
 * com o jogo travando ao errar — a plataforma nunca recebia o `GAME_OVER`, e
 * nada na tela dizia isso. Um alerta que NÃO aparece responde a pergunta na
 * hora.
 *
 * O bloqueio do `alert()` é uma vantagem aqui: ele PARA o jogo no instante do
 * evento, então dá para ver a tela exatamente como ela estava.
 */

/**
 * Os eventos que valem interromper.
 *
 * `CHECKPOINT`, `CORRECT_ANSWER` e `WRONG_ANSWER` ficam DE FORA de propósito:
 * eles disparam a cada jogada, e um `alert()` a cada acerto tornaria o jogo
 * injogável. Esses saem no console, que recebe todos.
 */
const AVISAR: ReadonlySet<string> = new Set([
  "GAME_READY",
  "GAME_COMPLETED",
  "GAME_OVER",
]);

/**
 * Quando a tecla vale alguma coisa.
 *
 * Em desenvolvimento, sempre. Em produção, só com `?debug=1` na URL — um
 * `alert()` na cara de uma criança no meio da atividade seria pior que o
 * problema que ele veio investigar.
 */
function depuradorDisponivel(): boolean {
  /*
   * Só na janela de cima. O site se embute a si mesmo, então o mesmo `App`
   * roda duas vezes — na página e dentro do iframe. Sem este corte, cada
   * evento daria DOIS alertas e o `Y` alternaria duas vezes (voltando ao
   * ponto de partida, que é justamente "não acontece nada").
   */
  try {
    if (window.self !== window.top) return false;
  } catch {
    return false; // acesso negado a `window.top` já quer dizer "estou embutido"
  }

  if (import.meta.env.DEV) return true;

  try {
    return new URLSearchParams(window.location.search).get("debug") === "1";
  } catch {
    return false;
  }
}

/** A frase do alerta. Curta, e dizendo o que o evento significa. */
function mensagem(evento: PlatformEvent): string {
  const linhas: string[] = [];

  if (evento.type === "GAME_READY") {
    linhas.push("🎮 GAME_READY — o jogo carregou e está pronto");
  } else if (evento.type === "GAME_OVER") {
    linhas.push("💀 GAME_OVER — o jogo avisou que a criança perdeu");
    linhas.push(`fase: ${evento.stage}`);
  } else if (evento.type === "GAME_COMPLETED") {
    linhas.push(
      evento.isFinalStage
        ? "🏆 GAME_COMPLETED — VENCEU O JOGO (última fase)"
        : "✅ GAME_COMPLETED — terminou uma fase (ainda não é o fim)"
    );
    linhas.push(`fase ${evento.stage} de ${evento.totalStages ?? "?"}`);
    if (evento.score !== undefined) linhas.push(`pontos: ${evento.score}`);
  }

  if (evento.meta) linhas.push(`tentativa: ${evento.meta.attempt}`);
  linhas.push(`jogo: ${evento.gameId}`);

  return linhas.join("\n");
}

export default function EventMonitor() {
  /*
   * Um `ref`, e não um `useState`.
   *
   * O valor é lido de dentro de ouvintes de evento que ficam pendurados a
   * vida toda. Com estado, cada troca recriaria os ouvintes — e recriar o
   * ouvinte que está DENTRO do iframe é justamente o que dá errado quando o
   * iframe é trocado no meio do caminho. Nada aqui é desenhado na tela, então
   * o estado não tem outra serventia.
   */
  const ligado = useRef(false);

  useEffect(() => {
    if (!depuradorDisponivel()) return;

    /* ── a tecla ──────────────────────────────────────────────────────── */

    const alternar = () => {
      ligado.current = !ligado.current;

      window.alert(
        ligado.current
          ? "Depurador de eventos ATIVADO\n\n"
          : "Depurador de eventos DESATIVADO\n\n"
      );
    };

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (e.key.toLowerCase() !== "y") return;

      // digitando num campo, Y é uma letra e não um atalho
      const alvo = e.target as HTMLElement | null;
      const tag = alvo?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || alvo?.isContentEditable) return;

      e.preventDefault();
      alternar();
    };

    /*
     * ── A TECLA PRECISA VALER DENTRO DO JOGO TAMBÉM ────────────────────
     *
     * Assim que alguém clica no canvas, o `keydown` passa a ser entregue à
     * janela DE DENTRO do iframe, e um ouvinte só aqui fora para de ver a
     * tecla. Foi o motivo mais provável de o `Y` "não fazer nada": a primeira
     * coisa que qualquer pessoa faz é clicar no jogo.
     *
     * Registro na fase de CAPTURA da `window` de cada documento — é a
     * primeiríssima etapa do trajeto de um evento, antes de o Phaser ver a
     * tecla e antes de qualquer `stopPropagation`.
     *
     * O iframe pode nem existir ainda (a página só o monta depois do
     * "Iniciar"), e é trocado a cada partida. Por isso o `setInterval`, e não
     * uma busca única na montagem: ele custa quase nada e cobre todos os casos
     * sem depender de um evento de `load` por frame.
     */
    const ligados = new Set<Window>();

    const ligarNaJanela = (alvo: Window) => {
      if (ligados.has(alvo)) return;
      alvo.addEventListener("keydown", aoTeclar, true);
      ligados.add(alvo);
    };

    const varrer = () => {
      ligarNaJanela(window);
      document.querySelectorAll("iframe").forEach((frame) => {
        try {
          // ler `contentDocument` confirma mesma origem antes de tocar
          if (!frame.contentDocument || !frame.contentWindow) return;
          ligarNaJanela(frame.contentWindow);
        } catch {
          // origem diferente: o atalho vale só fora do jogo
        }
      });
    };

    varrer();
    const relogio = window.setInterval(varrer, 700);

    /* ── os eventos ───────────────────────────────────────────────────── */

    const tratar = (evento: PlatformEvent, origem: string) => {
      // o console recebe TODOS, ligado ou não, inclusive os frequentes demais
      console.info(`[evento ${origem}]`, evento.type, evento);

      if (!ligado.current) return;
      if (!AVISAR.has(evento.type)) return;

      /*
       * O `alert()` fica para o fim da fila.
       *
       * Ele congela a thread, e congelar DENTRO do tratamento da mensagem
       * seguraria o `postMessage` no meio do caminho — a plataforma só
       * processaria o evento depois de alguém clicar em OK. Com o
       * `setTimeout` o evento segue o curso normal e o aviso aparece atrás.
       */
      window.setTimeout(() => window.alert(mensagem(evento)), 0);
    };

    /* o jogo montado nesta mesma janela (`/jogos/<slug>` aberto direto) */
    const aoLocal = (raw: Event) => {
      const evento = (raw as CustomEvent<PlatformEvent>).detail;
      if (evento?.type) tratar(evento, "local");
    };

    /* o jogo dentro do iframe (`/iframe/<slug>`) */
    const aoDoIframe = (raw: MessageEvent) => {
      if (!isOriginAllowed(raw.origin)) return;
      if (!isIframePlatformEventMessage(raw.data)) return;
      tratar(raw.data.payload, "iframe");
    };

    window.addEventListener("platform-game-event", aoLocal);
    window.addEventListener("message", aoDoIframe);

    return () => {
      window.clearInterval(relogio);
      ligados.forEach((alvo) => {
        try {
          alvo.removeEventListener("keydown", aoTeclar, true);
        } catch {
          // a janela já foi embora junto com o iframe
        }
      });
      window.removeEventListener("platform-game-event", aoLocal);
      window.removeEventListener("message", aoDoIframe);
    };
  }, []);

  return null;
}
