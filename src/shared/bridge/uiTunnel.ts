import { EventBus } from "../EventBus";
import {
  isIframeGameUiMessage,
  type IframeGameUiMessage,
} from "../contracts/iframeMessages";
import { isOriginAllowed, origensDeDestino } from "./allowedOrigins";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O TÚNEL DE INTERFACE — o `EventBus` atravessando a parede do iframe
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── O PROBLEMA ───────────────────────────────────────────────────────────
 *
 * Enquanto o Phaser era montado dentro da mesma página, o jogo e a plataforma
 * dividiam um `EventBus` em memória: o jogo emitia `exit-game`, a
 * `GameDetailsPage` escutava, e pronto. Isso funciona porque os dois são o
 * mesmo programa.
 *
 * Com o jogo dentro de um iframe eles passam a ser DOIS programas, com dois
 * heaps. Um `EventBus` no filho não existe para o pai. O único fio entre eles
 * é o `postMessage`.
 *
 * ── A IDEIA ──────────────────────────────────────────────────────────────
 *
 * Em vez de reescrever quem escuta o quê nos dois lados, o túnel ESPELHA os
 * dois `EventBus`. Um sinal emitido de um lado reaparece do outro, com o mesmo
 * nome e a mesma carga.
 *
 * O ganho está no que NÃO muda: a `GameDetailsPage` continua com o seu
 * `EventBus.on("exit-game", ...)` intacto, e os 45 jogos continuam com o
 * `EventBus.emit("exit-game")` deles. Nenhum dos dois sabe que existe uma
 * parede no meio. Foi o que permitiu mover o jogo para dentro do iframe sem
 * encostar em nenhum jogo.
 *
 * ── A LISTA É FECHADA, DE PROPÓSITO ──────────────────────────────────────
 *
 * Espelhar o `EventBus` inteiro seria mais curto de escrever e errado: a maior
 * parte do tráfego dele é conversa INTERNA do jogo (`timer-tick`,
 * `mission-update`, `sparks`, `curtain` — mais de trinta nomes), com as duas
 * pontas dentro do mesmo Phaser. Esses sinais continuam funcionando sozinhos
 * dentro do iframe e não têm por que atravessar; jogá-los na parede seria
 * dezenas de `postMessage` por segundo para ninguém.
 *
 * Atravessam só os sinais em que UMA das pontas é a plataforma.
 */

/** Do jogo para a plataforma. */
const DO_JOGO_PARA_A_PLATAFORMA = [
  "exit-game",
  "game-back-to-start",
  "close-game-modals",
] as const;

/**
 * Da plataforma para o jogo.
 *
 * `mute-audio` e `show-tutorial` não têm quem os emita hoje — 50 e 68 jogos os
 * ESCUTAM, e nenhuma tela da plataforma os dispara. Estão aqui porque o botão
 * que falta é de interface, e o dia em que ele existir não pode esbarrar numa
 * parede que ninguém lembra que está aqui.
 */
const DA_PLATAFORMA_PARA_O_JOGO = ["mute-audio", "show-tutorial"] as const;

/**
 * Os sinais do Pixel Secreto, que nunca passaram pelo `EventBus`.
 *
 * Ele conversa por `CustomEvent` no `window` — outro caminho para o mesmo
 * lugar, e igualmente preso à janela. Ficam separados porque o transporte
 * local é outro: `window.dispatchEvent` em vez de `EventBus.emit`.
 */
const JANELA_DO_JOGO_PARA_A_PLATAFORMA = [
  "pixel-secret-show-extra-life-modal",
  "pixel-secret-exit-game",
] as const;

const JANELA_DA_PLATAFORMA_PARA_O_JOGO = ["pixel-secret-resume-game"] as const;

type Sinal = string;

/**
 * A TRAVA CONTRA O ECO.
 *
 * Os dois lados fazem a mesma coisa: escutam o `EventBus` local e mandam para
 * o outro. Sem isto, um sinal recebido seria re-emitido localmente, o relay
 * local o pegaria de volta, mandaria de novo — e os dois lados ficariam
 * jogando o mesmo `exit-game` um para o outro até a aba morrer.
 *
 * Enquanto estamos injetando o que chegou de fora, o relay local se cala.
 */
let injetando = false;

function reemitirLocalmente(signal: Sinal, detail: unknown, viaJanela: boolean) {
  injetando = true;
  try {
    if (viaJanela) {
      window.dispatchEvent(new CustomEvent(signal, { detail }));
    } else {
      EventBus.emit(signal, detail);
    }
  } finally {
    injetando = false;
  }
}

function montarMensagem(signal: Sinal, detail: unknown): IframeGameUiMessage {
  return { channel: "game-ui", payload: { signal, detail } };
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  LADO DE DENTRO — instalado pelo jogo embutido
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Manda para o pai o que o jogo emitiu, e injeta no `EventBus` de cá o que o
 * pai mandou. Devolve a função que desmonta tudo.
 *
 * Uma mensagem por origem permitida, com `targetOrigin` explícito — a mesma
 * regra de `iframeBridge`, e pelo mesmo motivo: com `"*"` qualquer página que
 * embutisse este site receberia os sinais.
 */
export function installGameUiTunnel(): () => void {
  /*
   * No modo `inline` o pai é este mesmo site, então a própria origem é o
   * destino — e ela precisa estar na allowlist como qualquer outra. Se não
   * estiver, o túnel fica mudo, do mesmo jeito que a ponte de eventos fica.
   * Um lugar só decide quem conversa com este site.
   */
  const destinos = origensDeDestino(window.parent);

  const mandarParaOPai = (signal: Sinal, detail: unknown) => {
    if (injetando) return;

    const mensagem = montarMensagem(signal, detail);
    for (const destino of destinos) {
      try {
        window.parent.postMessage(mensagem, destino);
      } catch {
        // origem inválida ou janela pai fechada: seguir para a próxima
      }
    }
  };

  const desmontar: Array<() => void> = [];

  for (const signal of DO_JOGO_PARA_A_PLATAFORMA) {
    const ouvinte = (detail: unknown) => mandarParaOPai(signal, detail);
    EventBus.on(signal, ouvinte);
    desmontar.push(() => EventBus.off(signal, ouvinte));
  }

  for (const signal of JANELA_DO_JOGO_PARA_A_PLATAFORMA) {
    const ouvinte = (evento: Event) =>
      mandarParaOPai(signal, (evento as CustomEvent).detail);
    window.addEventListener(signal, ouvinte);
    desmontar.push(() => window.removeEventListener(signal, ouvinte));
  }

  const aoReceber = (raw: MessageEvent) => {
    if (!isOriginAllowed(raw.origin)) return;
    if (!isIframeGameUiMessage(raw.data)) return;

    const { signal, detail } = raw.data.payload;

    if ((DA_PLATAFORMA_PARA_O_JOGO as readonly string[]).includes(signal)) {
      reemitirLocalmente(signal, detail, false);
      return;
    }

    if ((JANELA_DA_PLATAFORMA_PARA_O_JOGO as readonly string[]).includes(signal)) {
      reemitirLocalmente(signal, detail, true);
    }
  };

  window.addEventListener("message", aoReceber);
  desmontar.push(() => window.removeEventListener("message", aoReceber));

  return () => desmontar.forEach((f) => f());
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  LADO DE FORA — instalado por quem embute (o `IframeGameFrame`)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Recebe o que veio do jogo e re-emite no `EventBus` DESTA página. É essa
 * linha que faz a `GameDetailsPage` continuar funcionando sem alteração: para
 * ela, o `exit-game` chega exatamente como chegava quando o Phaser estava
 * montado ao lado.
 */
export function subscribeToGameUi(): () => void {
  const aoReceber = (raw: MessageEvent) => {
    if (!isOriginAllowed(raw.origin)) return;
    if (!isIframeGameUiMessage(raw.data)) return;

    const { signal, detail } = raw.data.payload;

    if ((DO_JOGO_PARA_A_PLATAFORMA as readonly string[]).includes(signal)) {
      reemitirLocalmente(signal, detail, false);
      return;
    }

    if ((JANELA_DO_JOGO_PARA_A_PLATAFORMA as readonly string[]).includes(signal)) {
      reemitirLocalmente(signal, detail, true);
    }
  };

  window.addEventListener("message", aoReceber);
  return () => window.removeEventListener("message", aoReceber);
}

/** Manda um sinal da plataforma para o jogo embutido. */
export function sendGameUi(
  janela: Window | null,
  signal: Sinal,
  detail?: unknown
) {
  if (!janela) return;

  const mensagem = montarMensagem(signal, detail);
  for (const destino of origensDeDestino(janela)) {
    try {
      janela.postMessage(mensagem, destino);
    } catch {
      // segue para a próxima origem
    }
  }
}
