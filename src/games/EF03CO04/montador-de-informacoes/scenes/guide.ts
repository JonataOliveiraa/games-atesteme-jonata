import Phaser from "phaser";
import { FX } from "../../../../shared/effects/FX";
import { createTutorial, type TutorialStep } from "../../../../shared/tutorial/createTutorial";

const GOLD = 0xfacc15;
const INK = 0x1e3a8a;
const DOT_R = 22;
const DEPTH = 8800;

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
  return new Promise((resolve) => {
    createTutorial(scene, {
      key,
      steps,
      once: false,
      textSize: 32,
      accent: 0x22c55e,
      safeTop: 70,
      onFinish: () => resolve(),
    });
  });
}

type Movable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform;

export interface Tap {
  carry(fromX: number, fromY: number, toX: number, toY: number, cargo: Movable[]): Promise<void>;
  destroy(): void;
}

export function createTap(scene: Phaser.Scene): Tap {
  const dot = scene.add.circle(0, 0, DOT_R, GOLD).setStrokeStyle(5, INK).setDepth(DEPTH).setVisible(false);
  const waves = new Set<Phaser.GameObjects.Graphics>();

  const ripple = (x: number, y: number, delay: number) => {
    const g = scene.add.graphics().setDepth(DEPTH - 1);
    waves.add(g);
    const t = { v: 0 };
    scene.tweens.add({
      targets: t,
      v: 1,
      delay,
      duration: 520,
      ease: "Sine.easeOut",
      onUpdate: () => {
        if (!waves.has(g)) return;
        g.clear();
        const r = DOT_R + t.v * 48;
        g.lineStyle(6, INK, 0.5 * (1 - t.v));
        g.strokeCircle(x, y, r + 2);
        g.lineStyle(4, GOLD, 1 - t.v);
        g.strokeCircle(x, y, r);
      },
      onComplete: () => {
        if (!waves.delete(g)) return;
        g.destroy();
      },
    });
  };

  return {
    async carry(fromX, fromY, toX, toY, cargo) {
      dot.setPosition(fromX, fromY).setVisible(true).setAlpha(0).setScale(1);
      await FX.to(scene, dot, { alpha: 1 }, { duration: 180 });
      await FX.to(scene, dot, { scale: 0.72 }, { duration: 160, ease: "Quad.easeOut" });
      ripple(fromX, fromY, 0);
      ripple(fromX, fromY, 160);
      await FX.wait(scene, 380);
      scene.tweens.add({ targets: cargo, x: toX, y: toY, duration: FX.ms(scene, 900), ease: "Sine.easeInOut" });
      await FX.to(scene, dot, { x: toX, y: toY }, { duration: 900, ease: "Sine.easeInOut" });
      await FX.to(scene, dot, { scale: 1 }, { duration: 140 });
      await FX.to(scene, dot, { alpha: 0 }, { duration: 200 });
      dot.setVisible(false);
    },
    destroy() {
      FX.kill(scene, dot);
      waves.forEach((g) => g.destroy());
      waves.clear();
      dot.destroy();
    },
  };
}
