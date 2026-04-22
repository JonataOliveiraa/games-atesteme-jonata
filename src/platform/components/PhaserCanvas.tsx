import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface PhaserCanvasProps {
  config: Phaser.Types.Core.GameConfig;
}

export default function PhaserCanvas({ config }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

  return <div ref={containerRef} className="phaser-container" />;
}