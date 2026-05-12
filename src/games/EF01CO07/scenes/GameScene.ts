import * as Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { SafetyChoice, SafetyLevel, SafetyScene } from "../types";

const GAME_ID = "guardioes-dos-dados";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;

export class GameScene extends Phaser.Scene {
  private levelStarted = false;
  private hasStartedTimer = false;
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private levelConfig!: SafetyLevel;
  private currentSceneIndex = 0;
  private hits = 0;
  private errors = 0;
  private answeredCurrentScene = false;
  private checklist: string[] = [];
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === lvl) ?? LEVELS[0];
    this.currentSceneIndex = 0;
    this.hits = 0;
    this.errors = 0;
    this.answeredCurrentScene = false;
    this.checklist = [];
    this.levelStarted = false;
this.hasStartedTimer = false;

this.timerEvent?.destroy();
this.timerEvent = undefined;

this.timerBar = undefined;
this.overlayObjects = [];
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({
      type: "GAME_READY",
      gameId: GAME_ID,
    });

    this.renderCurrentScene();
    this.emitProgress();

    this.time.delayedCall(80, () => {
  this.showStartScreen();
});
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;

    const remaining = this.timerEvent.getRemaining();
    const total = (this.levelConfig.timeLimit ?? 60) * 1000;
    const pct = Math.max(0, remaining / total);

    this.timerBar.setSize(TIMER_BAR_W * pct, 20);

    if (pct > 0.5) this.timerBar.setFillStyle(0x22c55e);
    else if (pct > 0.25) this.timerBar.setFillStyle(0xf59e0b);
    else this.timerBar.setFillStyle(0xef4444);
  }

  shutdown() {
    this.timerEvent?.destroy();

    if (this.unsubscribePlatformCommands) {
      this.unsubscribePlatformCommands();
      this.unsubscribePlatformCommands = undefined;
    }
  }

  private clearOverlay() {
  this.overlayObjects.forEach((object) => object.destroy());
  this.overlayObjects = [];
}

private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
  this.overlayObjects.push(object);
  return object;
}

private startTimerOnce() {
  if (this.hasStartedTimer) return;

  this.hasStartedTimer = true;
  this.startTimer();
}

private getLevelInstructions() {
  if (this.levelConfig.level === 1) {
    return {
      title: "Nível 1 - Proteja seus dados",
      objective: "Escolha atitudes seguras em situações digitais.",
      tip: "Leia com atenção antes de responder.",
    };
  }

  if (this.levelConfig.level === 2) {
    return {
      title: "Nível 2 - Atenção aos riscos",
      objective: "Identifique comportamentos perigosos.",
      tip: "Pense antes de clicar ou compartilhar.",
    };
  }

  return {
    title: "Nível 3 - Guardião especialista",
    objective: "Resolva situações mais difíceis.",
    tip: "Proteja informações pessoais.",
  };
}
private showStartScreen() {
  this.clearOverlay();

  this.levelStarted = false;
  this.input.enabled = true;

  const info = this.getLevelInstructions();

  this.addOverlayObject(
    this.add.rectangle(640, 360, 1280, 720, 0xeff6ff, 0.98).setDepth(300)
  );

  this.addOverlayObject(
    this.add.text(640, 115, "🛡️", {
      fontSize: "64px",
      fontFamily: "Arial",
      padding: {
        top: 18,
        bottom: 18,
        left: 18,
        right: 18,
      },
    })
      .setOrigin(0.5)
      .setDepth(301)
  );

  this.addOverlayObject(
    this.add.text(640, 210, info.title, {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#1d4ed8",
      stroke: "#ffffff",
      strokeThickness: 6,
      align: "center",
      wordWrap: { width: 920 },
    })
      .setOrigin(0.5)
      .setDepth(301)
  );

  this.addOverlayObject(
    this.add.rectangle(640, 380, 900, 230, 0xffffff, 0.92)
      .setStrokeStyle(5, 0x60a5fa)
      .setDepth(301)
  );

  this.addOverlayObject(
    this.add.text(640, 335, `🎯 ${info.objective}`, {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 760 },
    })
      .setOrigin(0.5)
      .setDepth(302)
  );

  this.addOverlayObject(
    this.add.text(640, 430, `💡 ${info.tip}`, {
      fontSize: "24px",
      fontFamily: "Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 760 },
    })
      .setOrigin(0.5)
      .setDepth(302)
  );

  const button = this.addOverlayObject(
    this.add.rectangle(640, 585, 330, 70, 0x2563eb, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(302)
  );

  const buttonText = this.addOverlayObject(
    this.add.text(640, 585, "Iniciar nível", {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    })
      .setOrigin(0.5)
      .setDepth(303)
  );

  const start = () => {
    this.playClick();
    this.clearOverlay();

    if (this.levelConfig.level === 1) {
      this.showTutorialStep(0);
      return;
    }

    this.levelStarted = true;
  };

  button.on("pointerdown", start);

  buttonText.setInteractive({ useHandCursor: true });
  buttonText.on("pointerdown", start);
}

private showTutorialStep(stepIndex: number) {
  this.clearOverlay();

  const steps = [
    {
      title: "Leia a situação",
      description: "Observe o problema apresentado.",
      emoji: "👀",
    },
    {
      title: "Escolha com segurança",
      description: "Escolha a atitude mais segura.",
      emoji: "🛡️",
    },
    {
      title: "Aprenda com o feedback",
      description: "Leia a explicação depois da resposta.",
      emoji: "✅",
    },
  ];

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  this.addOverlayObject(
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72)
      .setDepth(400)
  );

  this.addOverlayObject(
    this.add.rectangle(640, 300, 880, 270, 0xffffff, 1)
      .setStrokeStyle(6, 0x2563eb)
      .setDepth(401)
  );

  this.addOverlayObject(
    this.add.text(640, 225, step.emoji, {
      fontSize: "64px",
      fontFamily: "Arial",
      padding: {
        top: 14,
        bottom: 14,
      },
    })
      .setOrigin(0.5)
      .setDepth(402)
  );

  this.addOverlayObject(
    this.add.text(640, 300, step.title, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#1d4ed8",
      align: "center",
    })
      .setOrigin(0.5)
      .setDepth(402)
  );

  this.addOverlayObject(
    this.add.text(640, 370, step.description, {
      fontSize: "24px",
      fontFamily: "Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 620 },
    })
      .setOrigin(0.5)
      .setDepth(402)
  );

  const button = this.addOverlayObject(
    this.add.rectangle(1020, 300, 80, 80, 0x2563eb, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(403)
  );

  const buttonText = this.addOverlayObject(
    this.add.text(1020, 300, isLast ? "▶" : "→", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    })
      .setOrigin(0.5)
      .setDepth(404)
  );

  const next = () => {
    this.playClick();

    if (isLast) {
      this.clearOverlay();
      this.levelStarted = true;
      return;
    }

    this.showTutorialStep(stepIndex + 1);
  };

  button.on("pointerdown", next);

  buttonText.setInteractive({ useHandCursor: true });
  buttonText.on("pointerdown", next);
}

  private createBackground() {
    this.add.rectangle(640, 360, 1280, 720, 0xf8fbff);
    this.add.rectangle(640, 140, 1280, 280, 0xdbeafe, 0.65);
    this.add.rectangle(640, 610, 1280, 220, 0xfef3c7, 0.35);

    const circles = [
      { x: 120, y: 120, size: 70, color: 0x93c5fd },
      { x: 1150, y: 160, size: 90, color: 0xbfdbfe },
      { x: 180, y: 620, size: 60, color: 0xfde68a },
      { x: 1080, y: 590, size: 80, color: 0x86efac },
      { x: 80, y: 390, size: 52, color: 0xc4b5fd },
      { x: 1200, y: 405, size: 58, color: 0xf9a8d4 },
    ];

    circles.forEach((circle, index) => {
      const shape = this.add
        .circle(circle.x, circle.y, circle.size, circle.color, 0.16)
        .setDepth(0);

      this.tweens.add({
        targets: shape,
        scale: 1.08,
        duration: 2200 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

      const cornerIcons = [
  { x: 140, y: 160, icon: "🛡️" },
  { x: 1120, y: 180, icon: "🔒" },
  { x: 170, y: 585, icon: "💻" },
  { x: 1080, y: 575, icon: "📱" },
];

    cornerIcons.forEach((item, index) => {
      const icon = this.add
        .text(item.x, item.y, item.icon, {
          fontSize: "26px",
        })
        .setOrigin(0.5)
        .setAlpha(0.18)
        .setDepth(1);

      this.tweens.add({
        targets: icon,
        y: icon.y + (index % 2 === 0 ? -8 : 8),
        duration: 2400 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private createTimerBar() {
    this.add
      .rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 28, 0x334155, 0.4)
      .setStrokeStyle(2, 0x64748b)
      .setDepth(5);

    this.timerBar = this.add
      .rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 20, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(6);

    this.add
      .text(640, TIMER_BAR_Y - 25, "Tempo", {
        fontSize: "16px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        stroke: "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(7);
  }

  private renderCurrentScene() {
    this.children.list
      .filter((child) => child.getData("dynamic") === true)
      .forEach((child) => child.destroy());

    this.answeredCurrentScene = false;

    const scene = this.levelConfig.scenes[this.currentSceneIndex];

    this.createHeader();
    this.createStoryCard(scene);
    this.createChoiceButtons(scene);
    this.createProgressDots();
  }

  private markDynamic<T extends Phaser.GameObjects.GameObject>(object: T): T {
    object.setData("dynamic", true);
    return object;
  }

  private createHeader() {
    this.markDynamic(
      this.add
        .text(640, 115, this.levelConfig.title, {
          fontSize: "42px",
          fontFamily: "Arial Black, Arial",
          color: "#2563eb",
          stroke: "#ffffff",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(20)
    );

    this.markDynamic(
      this.add
        .text(640, 160, this.levelConfig.objective, {
          fontSize: "22px",
          fontFamily: "Arial",
          color: "#475569",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(20)
    );

    this.markDynamic(
      this.add
        .rectangle(1040, 118, 150, 46, 0xffffff, 0.95)
        .setStrokeStyle(3, 0x93c5fd)
        .setDepth(20)
    );

    this.markDynamic(
      this.add
        .text(
          1040,
          118,
          `Cena ${this.currentSceneIndex + 1}/${this.levelConfig.scenes.length}`,
          {
            fontSize: "20px",
            fontFamily: "Arial Black, Arial",
            color: "#1e3a8a",
          }
        )
        .setOrigin(0.5)
        .setDepth(21)
    );

    this.markDynamic(
      this.add
        .rectangle(240, 118, 170, 46, 0xffffff, 0.95)
        .setStrokeStyle(3, 0xbfdbfe)
        .setDepth(20)
    );

    this.markDynamic(
      this.add
        .text(240, 118, "🛡️ Segurança", {
          fontSize: "19px",
          fontFamily: "Arial Black, Arial",
          color: "#1e3a8a",
        })
        .setOrigin(0.5)
        .setDepth(21)
    );
  }

  private createStoryCard(scene: SafetyScene) {
    this.markDynamic(
      this.add
        .rectangle(640, 395, 920, 340, 0xffffff, 0.98)
        .setStrokeStyle(4, 0x93c5fd)
        .setDepth(10)
    );

    this.markDynamic(
      this.add
        .rectangle(640, 250, 920, 58, 0x2563eb, 1)
        .setDepth(11)
    );

    this.markDynamic(
      this.add
        .text(640, 250, `${scene.emoji} ${scene.title}`, {
          fontSize: "26px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(12)
    );

    this.markDynamic(
      this.add
        .circle(350, 390, 85, 0xdbeafe, 1)
        .setStrokeStyle(5, 0x60a5fa)
        .setDepth(12)
    );

    this.markDynamic(
  this.add
    .text(350, 390, scene.emoji, {
      fontSize: "60px",
      fontFamily: "Arial",
      padding: {
        top: 18,
        bottom: 18,
        left: 18,
        right: 18,
      },
    })
    .setOrigin(0.5)
    .setDepth(13)
);

    this.markDynamic(
      this.add.text(500, 355, scene.situation, {
          fontSize: "28px",
          fontFamily: "Arial Black, Arial",
          color: "#0f172a",
          wordWrap: { width: 540 },
          lineSpacing: 10,
        })
        .setOrigin(0, 0.5)
        .setDepth(13)
    );

    this.markDynamic(
      this.add
        .text(640, 505, scene.question, {
          fontSize: "30px",
          fontFamily: "Arial Black, Arial",
          color: "#2563eb",
          stroke: "#ffffff",
          strokeThickness: 4,
          align: "center",
          wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
        .setDepth(13)
    );
  }

  private createChoiceButtons(scene: SafetyScene) {
    const positions = [
      { x: 410, y: 635 },
      { x: 870, y: 635 },
    ];

    const choices =
      this.currentSceneIndex % 2 === 0
        ? scene.choices
        : [...scene.choices].reverse();

    choices.forEach((choice, index) => {
      const pos = positions[index];
      const button = this.markDynamic(
        this.add
          .rectangle(pos.x, pos.y, 390, 78, 0x2563eb, 1)
          .setStrokeStyle(4, 0xffffff)
          .setInteractive({ useHandCursor: true })
          .setDepth(20)
      );

      const text = this.markDynamic(
        this.add
          .text(pos.x, pos.y, choice.text, {
            fontSize: "20px",
            fontFamily: "Arial Black, Arial",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 330 },
          })
          .setOrigin(0.5)
          .setDepth(21)
      );

      const choose = () => this.handleChoice(choice, scene);

      button.on("pointerdown", choose);
      text.setInteractive({ useHandCursor: true });
      text.on("pointerdown", choose);

      button.on("pointerover", () => button.setFillStyle(0x1d4ed8));
      button.on("pointerout", () => button.setFillStyle(0x2563eb));
    });
  }

  private createProgressDots() {
    const total = this.levelConfig.scenes.length;
    const startX = 640 - ((total - 1) * 34) / 2;

    for (let i = 0; i < total; i++) {
      this.markDynamic(
        this.add
          .circle(
            startX + i * 34,
            690,
            10,
            i <= this.currentSceneIndex ? 0x2563eb : 0xcbd5e1,
            1
          )
          .setDepth(20)
      );
    }
  }

  private handleChoice(choice: SafetyChoice, scene: SafetyScene) {
    if (!this.levelStarted) return;
if (this.answeredCurrentScene) return;

this.startTimerOnce();

    this.answeredCurrentScene = true;

    if (choice.isSafe) {
      this.hits += 1;
      this.checklist.push(scene.checklistItem);
      this.playCorrect();

      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: 5,
      });

      this.showFeedback(choice.feedback, 0x22c55e, "🛡️");
      this.emitProgress();

      this.time.delayedCall(2000, () => this.goToNextScene());
      return;
    }

    this.errors += 1;
    this.playWrong();

    runtimeGameBridge.emit({
      type: "WRONG_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: -5,
    });

    this.showFeedback(choice.feedback, 0xef4444, "⚠️");
    this.emitProgress();

    this.time.delayedCall(1600, () => {
      this.answeredCurrentScene = false;
    });
  }

  private showFeedback(message: string, color: number, icon: string) {
    const panel = this.markDynamic(
      this.add
        .rectangle(640, 470, 820, 95, color, 0.95)
        .setStrokeStyle(4, 0xffffff)
        .setDepth(100)
    );

    const text = this.markDynamic(
      this.add
        .text(640, 470, `${icon} ${message}`, {
          fontSize: "23px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 740 },
        })
        .setOrigin(0.5)
        .setDepth(101)
    );

    this.tweens.add({
      targets: [panel, text],
      y: "-=10",
      duration: 200,
      yoyo: true,
    });
  }

  private goToNextScene() {
    this.currentSceneIndex += 1;

    if (this.currentSceneIndex < this.levelConfig.scenes.length) {
      this.renderCurrentScene();
      this.emitProgress();
      return;
    }

    this.handleLevelSuccess();
  }

  private handleLevelSuccess() {
    this.playWin();
    this.timerEvent?.remove(false);
    this.showLevelComplete();
    this.emitProgress();

    const nextLevel = this.levelConfig.level + 1;

    if (nextLevel <= 3) {
      runtimeGameBridge.emit({
        type: "CHECKPOINT",
        gameId: GAME_ID,
        stage: nextLevel,
        progress: 0,
        score: this.hits * 5 - this.errors * 5,
        hits: this.hits,
        errors: this.errors,
      });

      this.time.delayedCall(1200, () => {
        this.showNextLevelButton(nextLevel as 1 | 2 | 3);
      });

      return;
    }

    this.time.delayedCall(1700, () => {
      runtimeGameBridge.emit({
        type: "GAME_COMPLETED",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      });

      this.input.enabled = false;
    });
  }

  private showLevelComplete() {
    this.markDynamic(
      this.add
        .rectangle(640, 360, 920, 380, 0xffffff, 0.96)
        .setStrokeStyle(5, 0x22c55e)
        .setDepth(120)
    );

    this.markDynamic(
      this.add
        .text(640, 245, "Missão concluída!", {
          fontSize: "40px",
          fontFamily: "Arial Black, Arial",
          color: "#16a34a",
          stroke: "#ffffff",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(121)
    );

    const checklistText = this.checklist.map((item) => `✅ ${item}`).join("\n");

    this.markDynamic(
      this.add
        .text(640, 360, checklistText || "✅ Você fez escolhas seguras!", {
          fontSize: "22px",
          fontFamily: "Arial Black, Arial",
          color: "#334155",
          align: "left",
          wordWrap: { width: 720 },
        })
        .setOrigin(0.5)
        .setDepth(121)
    );

    const emojis = ["🛡️", "✨", "⭐", "🔒"];

    for (let i = 0; i < 20; i++) {
      const star = this.add
        .text(640, 360, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(24, 44)}px`,
        })
        .setOrigin(0.5)
        .setDepth(130);

      this.tweens.add({
        targets: star,
        x: 640 + Phaser.Math.Between(-380, 380),
        y: 360 + Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(700, 1200),
        onComplete: () => star.destroy(),
      });
    }
  }

  private showNextLevelButton(nextLevel: 1 | 2 | 3) {
    const button = this.add
      .rectangle(640, 565, 430, 58, 0x16a34a, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(140);

    const text = this.add
      .text(640, 565, "Avançar para o próximo nível", {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(141);

    const goNext = () => {
      this.playClick();

  this.levelStarted = false;
  this.hasStartedTimer = false;

  this.timerEvent?.destroy();
  this.timerEvent = undefined;

  this.scene.restart({ level: nextLevel });
};

    button.on("pointerdown", goNext);
    button.on("pointerover", () => button.setFillStyle(0x15803d));
    button.on("pointerout", () => button.setFillStyle(0x16a34a));

    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", goNext);
  }

  private startTimer() {
    this.timerEvent?.destroy();

    this.timerEvent = this.time.addEvent({
      delay: (this.levelConfig.timeLimit ?? 60) * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
    });
  }

  private onTimeUp() {
    this.input.enabled = false;
    this.timerEvent?.destroy();
    this.playWrong();
    this.showFeedback("Tempo esgotado! A missão foi encerrada.", 0xef4444, "⏰");

    runtimeGameBridge.emit({
      type: "GAME_OVER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    });
  }

  private emitProgress() {
    const total = this.levelConfig.scenes.length;
    const progress = Math.round((this.currentSceneIndex / total) * 100);

    EventBus.emit("safety-progress", {
      progress,
      hits: this.hits,
      errors: this.errors,
    });

    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      progress,
      score: this.hits * 5 - this.errors * 5,
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    });
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand(
      (command: PlatformCommand) => {
        if (command.type !== "START_GAME") return;
        if (command.gameId !== GAME_ID) return;
        if (command.stage === this.levelConfig.level) return;

        this.time.delayedCall(100, () => {
          this.scene.restart({ level: command.stage as 1 | 2 | 3 });
        });
      }
    );
  }

  private getAudioContext(): AudioContext | null {
    if (!("context" in this.sound)) return null;
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.25,
    delaySeconds = 0
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delaySeconds);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delaySeconds);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + delaySeconds + duration
    );

    osc.start(ctx.currentTime + delaySeconds);
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01);
  }

  private playClick() {
    this.playTone(440, 0.05, "sine", 0.12);
  }

  private playCorrect() {
    this.playTone(523, 0.12, "sine", 0.28, 0);
    this.playTone(659, 0.12, "sine", 0.28, 0.1);
    this.playTone(784, 0.2, "sine", 0.32, 0.2);
  }

  private playWrong() {
    this.playTone(220, 0.1, "square", 0.18, 0);
    this.playTone(196, 0.1, "square", 0.14, 0.1);
    this.playTone(165, 0.18, "square", 0.1, 0.2);
  }

  private playWin() {
    [262, 330, 392, 523].forEach((freq, index) => {
      this.playTone(freq, 0.2, "sine", 0.3, index * 0.13);
    });
  }
}
