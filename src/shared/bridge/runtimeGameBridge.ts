import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands";
import {
  emitGameEvent,
  subscribeToPlatformCommands,
} from "./localBridge";
import {
  emitIframeGameEvent,
  subscribeToIframePlatformCommands,
} from "./iframeBridge";
import { completarEvento } from "./outgoingEvent";
import { primeiroProntoDaTentativa } from "./embedSession";

export interface RuntimeGameBridge {
  emit: (event: PlatformEvent) => void;
  onCommand: (handler: (command: PlatformCommand) => void) => () => void;
}

function isInsideIframe() {
  try {
    return window.self !== window.top;
  } catch {
    // acesso negado a `window.top` já é resposta: estamos embutidos
    return true;
  }
}

const embutido = isInsideIframe();

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O EVENTO VAI PARA OS DOIS LADOS AO MESMO TEMPO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Antes, esta ponte ESCOLHIA: dentro de iframe mandava só para a plataforma,
 * fora mandava só para a página. Escolher quebra o modo embed — a rota de
 * embed roda DENTRO do iframe e precisa ouvir o fim da partida para navegar
 * para `/approve` ou `/reprove`. Com a ponte só falando para fora, ela ficaria
 * surda dentro da própria janela.
 *
 * Agora o evento local sai SEMPRE (é o que a página deste site escuta) e, se
 * estivermos embutidos, sai também para a plataforma. Um evento, dois
 * ouvintes, nenhuma condição escondida.
 *
 * A ordem importa: local primeiro. Se a plataforma responder na mesma batida,
 * a nossa própria página já processou o que aconteceu.
 */
export const runtimeGameBridge: RuntimeGameBridge = {
  emit: (event) => {
    /*
     * COMPLETA UMA VEZ, ENTREGA NOS DOIS.
     *
     * `meta` e `isFinalStage` são adicionados AQUI, e não só na saída para a
     * plataforma, porque a rota de embed escuta pelo lado local e é ela quem
     * decide aprovar ou reprovar. Se o evento local viesse cru, ela não teria
     * como saber que a fase que acabou era a última — e aprovaria o aluno na
     * fase 1, que é exatamente o bug que `isFinalStage` existe para evitar.
     */
    /*
     * UM `GAME_READY` POR TENTATIVA.
     *
     * Os jogos emitem no `create()`, que roda de novo a cada `scene.restart()`
     * — ou seja, uma vez por nível. Quem está de fora usa esse evento como
     * autorização para mandar `START_GAME`, e receber três autorizações
     * significa três `START_GAME`, o segundo e o terceiro no meio da partida.
     *
     * Ver `embedSession.ts` para a explicação inteira. Fora do embed nada
     * muda: sem sessão, todos passam.
     */
    if (event.type === "GAME_READY" && !primeiroProntoDaTentativa()) return;

    const completo = completarEvento(event);

    emitGameEvent(completo);
    if (embutido) emitIframeGameEvent(completo);
  },

  onCommand: (handler) => {
    const desinscreveLocal = subscribeToPlatformCommands(handler);
    const desinscreveIframe = embutido
      ? subscribeToIframePlatformCommands(handler)
      : () => {};

    return () => {
      desinscreveLocal();
      desinscreveIframe();
    };
  },
};
