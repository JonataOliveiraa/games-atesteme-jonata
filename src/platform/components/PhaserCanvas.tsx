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

    // Se já existir um jogo, destruímos ele antes de criar o novo com a nova config
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
  }, [config]); // O React vai rodar isso toda vez que a 'config' (fase/jogo) mudar

  return (
    <div 
      id="game-root" 
      ref={containerRef} 
      className="phaser-container" 
      style={{ width: '100%', height: '100%', minHeight: '720px' }} 
    />
  );
}