import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { EventBus } from "../../shared/EventBus";
import { carregarFonteDoJogo } from "../../shared/fonts/gameFont";
import { useFullscreen } from "../../hooks/useFullscreen";

interface PhaserCanvasProps {
  config: Phaser.Types.Core.GameConfig;
  gameId: string;
  /** A fase em que a partida deve começar. Chega ao jogo antes do boot. */
  stage?: 1 | 2 | 3;
}

export default function PhaserCanvas({ config, gameId, stage }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { isFullscreen, toggle } = useFullscreen();

  useEffect(() => {
    if (!containerRef.current) return;

    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const GAME_CHANNELS = [
      "mission-update", "mute-audio", "timer-start", "timer-pause",
      "timer-resume", "timer-stop", "timer-end", "show-tutorial",
      "hud-dim", "lose-game", "round-complete", "scene-ready",
    ];

    GAME_CHANNELS.forEach((c) => EventBus.removeAllListeners(c));

    let cancelado = false;

    /*
     * A FONTE ANTES DO PHASER.
     *
     * O Phaser mede cada texto no instante em que o cria, e desenha no canvas —
     * que não pede fonte para o navegador nem redesenha quando ela chega. Um
     * jogo criado antes de a fonte estar pronta fica em Arial para sempre, sem
     * erro nenhum no console. Meio segundo de espera aqui é o que evita isso.
     *
     * `finally` e não `then`: se a fonte falhar, o jogo abre do mesmo jeito.
     * Acabamento nunca pode ser motivo de tela preta.
     */
    void carregarFonteDoJogo().finally(() => {
      if (cancelado || !containerRef.current) return;
      gameRef.current = new Phaser.Game({
        ...config,
        parent: containerRef.current,

        /*
         * A FASE INICIAL ENTRA ANTES DE QUALQUER CENA EXISTIR.
         *
         * `preBoot` roda antes do `BootScene`, então quando ele for decidir
         * com que dados abrir a `GameScene`, o valor já está no registry (ver
         * `shared/level/faseInicial.ts`). Pelo `START_GAME` seria tarde: o
         * comando chega com o jogo já montado na fase 1.
         */
        callbacks: {
          ...config.callbacks,
          preBoot: (game) => {
            if (stage) game.registry.set("faseInicial", stage);
            config.callbacks?.preBoot?.(game);
          },
        },
      });
    });

    return () => {
      cancelado = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      EventBus.removeAllListeners();
    };
  }, [config, stage]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (isFullscreen) return;
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isFullscreen]);

  useEffect(() => {
    document.body.classList.toggle("game-fullscreen-active", isFullscreen);

    const id = window.setTimeout(() => {
      gameRef.current?.scale.refresh();
    }, 140);

    return () => {
      window.clearTimeout(id);
      document.body.classList.remove("game-fullscreen-active");
    };
  }, [isFullscreen]);

  useEffect(() => {
    const onResize = () => gameRef.current?.scale.refresh();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    /*
     * O CONTAINER PODE MUDAR DE TAMANHO SEM A JANELA MUDAR.
     *
     * Acontece quando o palco muda sem a janela mudar — o painel lateral do
     * harness, uma barra que some, o modo embed entrando. Sem observar o
     * Phaser continua desenhando na medida antiga — o jogo fica menor que a
     * área, ou sobrando para fora dela, e só volta ao normal se alguém
     * redimensionar a janela na mão.
     */
    const alvo = containerRef.current;
    const observador = alvo ? new ResizeObserver(onResize) : null;
    if (alvo && observador) observador.observe(alvo);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      observador?.disconnect();
    };
  }, []);

  return (
    <div className={`phaser-stage${isFullscreen ? " is-fullscreen" : ""}`}>
      <div
        id="game-root"
        ref={containerRef}
        className={`phaser-container phaser-container-${gameId}`}
      />

      <button
        type="button"
        className="game-fullscreen-btn"
        onClick={toggle}
        aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
      >
        {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      </button>
    </div>
  );
}