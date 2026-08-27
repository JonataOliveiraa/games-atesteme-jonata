import { useCallback, useEffect, useRef } from "react";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";
import type { PlatformCommand } from "../../shared/contracts/platformCommands";
import {
  isIframePlatformEventMessage,
  type IframePlatformCommandMessage,
} from "../../shared/contracts/iframeMessages";
import {
  isOriginAllowed,
  origensDeDestino,
} from "../../shared/bridge/allowedOrigins";
import { subscribeToGameUi } from "../../shared/bridge/uiTunnel";
import { resolveGameId } from "../../data/gameIndex";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O JOGO NUM IFRAME, VISTO DE FORA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Este componente é a plataforma de jogos fazendo, para si mesma, exatamente
 * o que a Atesteme vai fazer: montar um iframe apontado para
 * `/jogos/<slug>?embed=1&…`, mandar `START_GAME` e escutar os eventos da
 * partida.
 *
 * Isso é de propósito. Enquanto o Phaser era montado ao lado da página, o
 * caminho do iframe só era exercitado pelas páginas de teste — e um caminho
 * que ninguém percorre no dia a dia é um caminho que quebra em silêncio. Agora
 * ele é o caminho normal: se o embed quebrar, quebra aqui primeiro, para nós,
 * e não lá, na apresentação.
 *
 * ── O QUE FOI CONSERTADO AO REESCREVER ───────────────────────────────────
 *
 * A versão anterior deste arquivo estava morta (ninguém passava `mode:
 * "iframe"`) e trazia três defeitos que só apareceriam quando alguém a usasse:
 *
 *  1. `postMessage(mensagem, "*")` — mandava o comando para qualquer página
 *     que estivesse na janela. É a regra que o contrato proíbe em letras
 *     maiúsculas.
 *  2. Nenhuma checagem de `event.origin` ao receber: qualquer aba conseguiria
 *     forjar um `GAME_COMPLETED` e ganhar os pontos do aluno.
 *  3. `START_GAME` por `setTimeout(100)` depois do `load`. Um jogo Phaser leva
 *     centenas de milissegundos para bootar e registrar o ouvinte; o comando
 *     saía no vazio. O `GameLauncher` já tinha resolvido isso esperando o
 *     `GAME_READY` — aqui é o mesmo aperto de mão.
 */

interface IframeGameFrameProps {
  gameId: string;
  level: 1 | 2 | 3;
  points: number;
  lives: number;
  src: string;
  onPlatformEvent: (event: PlatformEvent) => void;
}

/** A rede de segurança, igual à do `GameLauncher`. */
const PRAZO_DO_APERTO_DE_MAO_MS = 3000;

export default function IframeGameFrame({
  gameId,
  level,
  points,
  lives,
  src,
  onPlatformEvent,
}: IframeGameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /*
   * O handler mais recente, sem re-inscrever o ouvinte a cada render.
   * `onPlatformEvent` costuma ser uma função nova toda vez que a página
   * renderiza, e re-inscrever a cada uma delas perderia mensagens na troca.
   */
  const handlerRef = useRef(onPlatformEvent);
  useEffect(() => {
    handlerRef.current = onPlatformEvent;
  }, [onPlatformEvent]);

  const enviarComando = useCallback((comando: PlatformCommand) => {
    const janela = iframeRef.current?.contentWindow;
    if (!janela) return;

    const mensagem: IframePlatformCommandMessage = {
      channel: "platform-command",
      payload: comando,
    };

    /*
     * Uma mensagem por origem permitida, com `targetOrigin` explícito. O
     * navegador entrega só na que bater com a origem real do iframe e
     * descarta as outras — que é como se manda uma mensagem endereçada sem
     * nunca precisar do "*".
     */
    for (const destino of origensDeDestino(janela)) {
      try {
        janela.postMessage(mensagem, destino);
      } catch {
        // origem inválida: segue para a próxima
      }
    }
  }, []);

  /* ── os eventos que sobem do jogo ─────────────────────────────────────── */

  useEffect(() => {
    const aoReceber = (raw: MessageEvent) => {
      // ORIGEM primeiro, forma depois — a mesma ordem de `iframeBridge`
      if (!isOriginAllowed(raw.origin)) return;
      if (!isIframePlatformEventMessage(raw.data)) return;

      const evento = raw.data.payload;

      /*
       * O jogo se identifica pelo apelido que ele conhece; a página pensa em
       * id de catálogo. Normalizar os dois antes de comparar é o que faz um
       * evento de `EF05CO07` não vazar para a tela de outro jogo.
       */
      const doEvento = resolveGameId(evento.gameId) ?? evento.gameId;
      const daTela = resolveGameId(gameId) ?? gameId;
      if (doEvento !== daTela) return;

      handlerRef.current({ ...evento, gameId: doEvento });
    };

    window.addEventListener("message", aoReceber);
    return () => window.removeEventListener("message", aoReceber);
  }, [gameId]);

  /* ── os sinais de interface (exit-game e companhia) ───────────────────── */

  useEffect(() => subscribeToGameUi(), []);

  /* ── START_GAME depois do GAME_READY ──────────────────────────────────── */

  useEffect(() => {
    let enviado = false;

    const enviarStart = () => {
      if (enviado) return;
      enviado = true;

      enviarComando({
        type: "START_GAME",
        gameId,
        stage: level,
        points,
        lives,
      });
    };

    const aoReceber = (raw: MessageEvent) => {
      if (!isOriginAllowed(raw.origin)) return;
      if (!isIframePlatformEventMessage(raw.data)) return;

      const evento = raw.data.payload;
      if (evento.type !== "GAME_READY") return;

      const doEvento = resolveGameId(evento.gameId) ?? evento.gameId;
      const daTela = resolveGameId(gameId) ?? gameId;
      if (doEvento !== daTela) return;

      enviarStart();
    };

    window.addEventListener("message", aoReceber);
    const prazo = window.setTimeout(enviarStart, PRAZO_DO_APERTO_DE_MAO_MS);

    return () => {
      window.removeEventListener("message", aoReceber);
      window.clearTimeout(prazo);
    };
    /*
     * Só `gameId` e `src`: o aperto de mão é UMA vez por jogo carregado.
     * Incluir `points`/`lives` aqui remontaria o efeito a cada ponto ganho e
     * mandaria um `START_GAME` no meio da partida — que é exatamente o bug que
     * o `GAME_READY` único existe para evitar.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={`Jogo ${gameId}`}
      className="game-iframe"
      allow="autoplay; fullscreen"
    />
  );
}
