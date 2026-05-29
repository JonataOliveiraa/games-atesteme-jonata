import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface PhaserCanvasProps {
  config: Phaser.Types.Core.GameConfig;
  gameId: string;
}

export default function PhaserCanvas({ config, gameId }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

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
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
  <div
    id="game-root"
    ref={containerRef}
    className={`phaser-container phaser-container-${gameId}`}
  />
);
}
