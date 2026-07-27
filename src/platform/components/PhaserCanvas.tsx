import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useFullscreen } from "../../hooks/useFullscreen";

interface PhaserCanvasProps {
  config: Phaser.Types.Core.GameConfig;
  gameId: string;
}

export default function PhaserCanvas({ config, gameId }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { isFullscreen, toggle } = useFullscreen();

  useEffect(() => {
    if (!containerRef.current) return;

    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    gameRef.current = new Phaser.Game({
      ...config,
      parent: containerRef.current,
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [config]);

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
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
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