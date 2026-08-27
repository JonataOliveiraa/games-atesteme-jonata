import type { EventMeta, PlatformEvent } from "./platformEvents";
import type { PlatformCommand } from "./platformCommands";

/**
 * O ENVELOPE que atravessa o `postMessage`.
 *
 * Os guardas abaixo são a primeira linha de defesa de quem recebe. Eles não
 * substituem a checagem de ORIGEM — que é feita antes, em `iframeBridge` —
 * mas garantem que, depois de a origem passar, o que chegou tem a forma que
 * o código espera. `postMessage` aceita qualquer coisa que o outro lado
 * mandar, inclusive de uma aba que só quer ver o que quebra.
 */

export type IframePlatformEventMessage = {
  channel: "platform-event";
  payload: PlatformEvent;
};

export type IframePlatformCommandMessage = {
  channel: "platform-command";
  payload: PlatformCommand;
};

/**
 * ── O TERCEIRO CANAL: SINAIS DE INTERFACE ────────────────────────────────
 *
 * `platform-event` e `platform-command` são o contrato com a Atesteme, e não
 * mudam. Este aqui é outra coisa: são os sinais de INTERFACE que o jogo e a
 * página deste site trocavam pelo `EventBus` enquanto dividiam o mesmo
 * contexto JS — "sair do jogo", "abrir o modal de vida extra", "silenciar".
 *
 * Quando o jogo passou a rodar dentro de um iframe, o `EventBus` deixou de
 * alcançar: ele é um emissor em memória, e memória não atravessa janela. Só o
 * `postMessage` atravessa — daí este envelope.
 *
 * Ele NÃO faz parte do contrato da plataforma. Quem embute este site de fora
 * pode ignorar `game-ui` inteiro sem perder nada: tudo que importa para
 * creditar uma tentativa continua em `platform-event`.
 */
export type IframeGameUiMessage = {
  channel: "game-ui";
  payload: {
    /** Nome do sinal, igual ao que se usaria no `EventBus`. */
    signal: string;
    /** Carga opcional. Precisa sobreviver ao algoritmo de clone estruturado. */
    detail?: unknown;
  };
};

export type IframeMessage =
  | IframePlatformEventMessage
  | IframePlatformCommandMessage
  | IframeGameUiMessage;

const temTipo = (valor: unknown): boolean => {
  if (!valor || typeof valor !== "object") return false;
  const tipo = (valor as { type?: unknown }).type;
  return typeof tipo === "string" && tipo.length > 0;
};

/**
 * `meta`, quando vier, precisa estar inteiro.
 *
 * Meio `meta` é pior que nenhum: a plataforma creditaria uma tentativa vazia.
 * Evento sem `meta` continua válido — é o caso de quem roda o site fora do
 * embed, onde não existe tentativa nenhuma.
 */
export function isEventMeta(valor: unknown): valor is EventMeta {
  if (!valor || typeof valor !== "object") return false;
  const m = valor as Partial<EventMeta>;
  return (
    typeof m.attempt === "string" &&
    m.attempt.length > 0 &&
    typeof m.gameId === "string" &&
    m.gameId.length > 0 &&
    typeof m.sentAt === "number" &&
    m.protocolVersion === 1
  );
}

export function isIframePlatformEventMessage(
  value: unknown
): value is IframePlatformEventMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as Partial<IframePlatformEventMessage>;

  if (maybe.channel !== "platform-event") return false;
  if (!temTipo(maybe.payload)) return false;

  const meta = (maybe.payload as PlatformEvent).meta;
  if (meta !== undefined && !isEventMeta(meta)) return false;

  return true;
}

export function isIframePlatformCommandMessage(
  value: unknown
): value is IframePlatformCommandMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as Partial<IframePlatformCommandMessage>;

  return maybe.channel === "platform-command" && temTipo(maybe.payload);
}

export function isIframeGameUiMessage(
  value: unknown
): value is IframeGameUiMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as Partial<IframeGameUiMessage>;
  if (maybe.channel !== "game-ui") return false;

  const payload = maybe.payload;
  if (!payload || typeof payload !== "object") return false;

  const signal = (payload as { signal?: unknown }).signal;
  return typeof signal === "string" && signal.length > 0;
}
