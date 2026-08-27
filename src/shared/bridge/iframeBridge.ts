import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands";
import {
  isIframePlatformCommandMessage,
  type IframePlatformEventMessage,
} from "../contracts/iframeMessages";
import { isOriginAllowed, origensDeDestino } from "./allowedOrigins";
import { completarEvento } from "./outgoingEvent";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PONTE COM QUEM EMBUTE ESTE SITE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * As duas funções aqui têm a mesma regra: só conversa com origem que está na
 * allowlist. Ver `allowedOrigins.ts` para o porquê.
 */

/**
 * MANDA O EVENTO PARA A PLATAFORMA.
 *
 * Uma mensagem POR ORIGEM PERMITIDA, cada uma com `targetOrigin` explícito.
 *
 * Parece desperdício mandar N mensagens quando só uma página embutiu o site —
 * e é, mas é o desperdício certo: `postMessage` só entrega para a janela pai
 * se o `targetOrigin` bater com a origem DELA, então mandar para as três
 * origens da lista entrega uma e descarta duas, sem nunca precisar do "*".
 *
 * Com `targetOrigin: "*"`, qualquer página que embutisse este site receberia
 * o desempenho do aluno. Não é um risco teórico: basta um iframe num blog.
 */
export function emitIframeGameEvent(event: PlatformEvent) {
  const message: IframePlatformEventMessage = {
    channel: "platform-event",
    payload: completarEvento(event),
  };

  const origens = origensDeDestino(window.parent);

  if (origens.length === 0) {
    if (import.meta.env.DEV) {
      console.warn(
        "[embed] evento não enviado: VITE_EMBED_ALLOWED_ORIGINS está vazia.",
        event.type
      );
    }
    return;
  }

  for (const origem of origens) {
    try {
      window.parent.postMessage(message, origem);
    } catch {
      // origem inválida ou janela pai fechada: seguir para a próxima
    }
  }
}

/**
 * RECEBE COMANDOS DA PLATAFORMA.
 *
 * A ordem das checagens importa: ORIGEM primeiro, forma depois. Olhar o
 * payload antes de saber quem mandou é dar a uma página desconhecida a chance
 * de exercitar o nosso parser.
 */
export function subscribeToIframePlatformCommands(
  handler: (command: PlatformCommand) => void
) {
  const listener = (raw: MessageEvent) => {
    if (!isOriginAllowed(raw.origin)) return;
    if (!isIframePlatformCommandMessage(raw.data)) return;

    handler(raw.data.payload);
  };

  window.addEventListener("message", listener);

  return () => {
    window.removeEventListener("message", listener);
  };
}
