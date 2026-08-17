import { useEffect, useRef } from "react";
import Phaser from "phaser";
import config from "../games/EF01CO01/base-dos-classificadores";

export default function GameStandalone() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const game = new Phaser.Game({
      ...config,
      parent: ref.current,
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
      }}
    >
      <div ref={ref} />
    </div>
  );
}