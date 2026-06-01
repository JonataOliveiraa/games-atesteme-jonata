import * as Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { SafetyChoice, SafetyLevel, SafetyScene } from "../types";

const GAME_ID = "guardioes-dos-dados";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;
const MODAL_SCALE = 1.28;

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
  private readonly paletteColors = {
    blue: 0x2563eb,
    navy: 0x25327a,
    green: 0x22c55e,
    orange: 0xf59e0b,
    cyan: 0x38bdf8,
  };

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
    this.levelStarted = true;
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
    this.cameras.main.setBackgroundColor("#f8fbff");

    const bgImage = this.add.image(640, 360, "guardians-bg-main").setDepth(0);
    this.coverImage(bgImage, 1280, 720);

    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.16).setDepth(1);

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

  }

  private renderCurrentScene() {
    this.children.list
      .filter((child) => child.getData("dynamic") === true)
      .forEach((child) => child.destroy());

    this.answeredCurrentScene = false;

    const scene = this.levelConfig.scenes[this.currentSceneIndex];

    this.createSceneBackdrop(scene);
    this.createHeader();
    this.createStoryCard(scene);
    this.createChoiceButtons(scene);
  }

  private markDynamic<T extends Phaser.GameObjects.GameObject>(object: T): T {
    object.setData("dynamic", true);
    return object;
  }

  private createRoundedBox(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor: number,
    strokeAlpha: number,
    radius: number,
    depth: number,
    strokeWidth = 4
  ) {
    const box = this.add.graphics();
    box.fillStyle(fillColor, fillAlpha);
    box.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    box.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    box.setDepth(depth);
    return this.markDynamic(box);
  }

  private createSceneBackdrop(scene: SafetyScene) {
    const image = this.markDynamic(
      this.add.image(640, 360, this.getSceneImageKey(scene.id)).setDepth(2)
    );
    this.coverImage(image, 1280, 720);

    this.markDynamic(
      this.add.rectangle(640, 360, 1280, 720, 0x0f172a, 0.08).setDepth(3)
    );

    this.markDynamic(
      this.add.rectangle(640, 630, 1280, 180, 0x0f172a, 0.16).setDepth(4)
    );
  }

  private getSceneImageKey(sceneId: string) {
    return `guardians-scene-${sceneId}`;
  }

  private coverImage(image: Phaser.GameObjects.Image, width: number, height: number) {
    const scale = Math.max(width / image.width, height / image.height);
    image.setScale(scale);
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
        .text(640, 165, this.levelConfig.objective, {
          fontSize: "22px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#0f172a",
          strokeThickness: 4,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(20)
    );

    this.createRoundedBox(1040, 118, 150, 46, 0xffffff, 0.9, 0xffffff, 0.92, 8, 20, 3);

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

    this.createRoundedBox(240, 118, 190, 46, 0xffffff, 0.9, 0xffffff, 0.92, 8, 20, 3);

    const shieldIcon = this.markDynamic(
      this.add.image(168, 118, "guardians-icon-shield").setDepth(21)
    );
    shieldIcon.setDisplaySize(30, 30);

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
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.24);
    shadow.fillRoundedRect(154, 496, 972, 144, 20);
    shadow.setDepth(9);
    this.markDynamic(shadow);

    this.createRoundedBox(640, 564, 980, 140, 0xffffff, 0.86, 0xffffff, 0.96, 20, 10, 5);

    this.markDynamic(
      this.add
        .text(640, 516, scene.title, {
          fontSize: "28px",
          fontFamily: "Arial Black, Arial",
          color: "#2563eb",
          stroke: "#ffffff",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(12)
    );

    this.markDynamic(
      this.add.text(640, 558, scene.situation, {
          fontSize: "25px",
          fontFamily: "Arial Black, Arial",
          color: "#0f172a",
          align: "center",
          wordWrap: { width: 910 },
          lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setDepth(13)
    );

    this.markDynamic(
      this.add
        .text(640, 606, scene.question, {
          fontSize: "28px",
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
      { x: 425, y: 686 },
      { x: 855, y: 686 },
    ];

    const choices =
      this.currentSceneIndex % 2 === 0
        ? scene.choices
        : [...scene.choices].reverse();

    choices.forEach((choice, index) => {
      const pos = positions[index];
      const button = this.createRoundedBox(pos.x, pos.y, 380, 62, 0x2563eb, 0.96, 0xffffff, 0.96, 15, 20, 4);
      button.setInteractive(
        new Phaser.Geom.Rectangle(pos.x - 190, pos.y - 31, 380, 62),
        Phaser.Geom.Rectangle.Contains
      );
      button.input!.cursor = "pointer";

      const text = this.markDynamic(
        this.add
          .text(pos.x, pos.y, choice.text, {
            fontSize: "23px",
            fontFamily: "Arial Black, Arial",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 340 },
          })
          .setOrigin(0.5)
          .setDepth(21)
      );

      const choose = () => this.handleChoice(choice, scene);

      button.on("pointerdown", choose);
      text.setInteractive({ useHandCursor: true });
      text.on("pointerdown", choose);

      button.on("pointerover", () => {
        button.clear();
        button.fillStyle(0x1d4ed8, 1);
        button.fillRoundedRect(pos.x - 190, pos.y - 31, 380, 62, 15);
        button.lineStyle(4, 0xffffff, 0.96);
        button.strokeRoundedRect(pos.x - 190, pos.y - 31, 380, 62, 15);
      });
      button.on("pointerout", () => {
        button.clear();
        button.fillStyle(0x2563eb, 0.96);
        button.fillRoundedRect(pos.x - 190, pos.y - 31, 380, 62, 15);
        button.lineStyle(4, 0xffffff, 0.96);
        button.strokeRoundedRect(pos.x - 190, pos.y - 31, 380, 62, 15);
      });
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
            710,
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

this.playClick();
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

  private showFeedback(message: string, color: number, _icon: string) {
    const isCorrect = color === 0x22c55e;
    const accent = isCorrect ? this.paletteColors.green : 0xef4444;

    const container = this.markDynamic(this.add.container(640, 478).setDepth(100));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.24);
    shadow.fillRoundedRect(-402, -50, 804, 104, 26);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.9);
    panel.fillRoundedRect(-410, -58, 820, 104, 26);
    panel.lineStyle(5, 0xffffff, 0.96);
    panel.strokeRoundedRect(-410, -58, 820, 104, 26);

    const accentBar = this.add.graphics();
    accentBar.fillStyle(accent, 1);
    accentBar.fillRoundedRect(-410, -58, 22, 104, 12);

    const glow = this.add.graphics();
    glow.fillStyle(accent, 0.18);
    glow.fillCircle(-332, -6, 48);

    const title = this.add
      .text(-255, -25, isCorrect ? "Boa escolha!" : "Atenção!", {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: isCorrect ? "#166534" : "#991b1b",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);

    const text =
      this.add
        .text(-255, 14, message, {
          fontSize: "18px",
          fontFamily: "Arial Black, Arial",
          color: "#25327a",
          align: "left",
          wordWrap: { width: 600 },
          lineSpacing: 4,
        })
        .setOrigin(0, 0.5);

    const feedbackIcon =
      this.add
        .image(-332, -6, isCorrect ? "guardians-icon-check" : "guardians-icon-alert")
        .setDisplaySize(74, 74);

    container.add([shadow, panel, accentBar, glow, feedbackIcon, title, text]);
    container.setScale(0.94);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: 460,
      scale: 1,
      duration: 220,
      ease: "Back.easeOut",
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
    this.levelStarted = false;
    this.playWin();
    this.timerEvent?.remove(false);
    this.showLevelCompleteTransition();
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

      this.time.delayedCall(2300, () => {
        this.showNextLevelStartTransition(nextLevel as 1 | 2 | 3);
      });

      return;
    }

    this.time.delayedCall(2300, () => {
      runtimeGameBridge.emit({
        type: "GAME_COMPLETED",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      });

      this.showGameCompleteScreen();
    });
  }

  private showLevelCompleteTransition() {
    this.clearOverlay();
    this.input.enabled = true;

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0f2542, 0.58).setDepth(450)
    );
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const score = this.getScore();
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -166, 540, 330, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -178, 556, 330, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -178, 556, 330, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(this.paletteColors.green, 1);
    topBar.fillRoundedRect(-196, -194, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14);

    const title = this.add
      .text(0, -112, "Missão concluída!", {
        fontSize: "36px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const completed = this.add
      .text(0, -54, `Nível ${this.levelConfig.level} protegido`, {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#2563eb",
      })
      .setOrigin(0.5);

    const scoreText = this.add
      .text(0, 4, `Pontuação: ${score} | Acertos: ${this.hits} | Erros: ${this.errors}`, {
        fontSize: "17px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 470 },
      })
      .setOrigin(0.5);

    const message = this.add
      .text(0, 62, this.getChecklistSummary(), {
        fontSize: "15px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    const waitText = this.add
      .text(0, 126, "Preparando a próxima missão...", {
        fontSize: "15px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
      })
      .setOrigin(0.5);

    modal.add([shadow, bg, topBar, title, completed, scoreText, message, waitText]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });

    this.createCelebrationParticles();
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    this.input.enabled = true;

    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0f2542, 0.58).setDepth(450)
    );
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -154, 540, 312, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -166, 556, 312, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -166, 556, 312, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(this.paletteColors.orange, 1);
    topBar.fillRoundedRect(-196, -182, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14);

    const title = this.add
      .text(0, -102, `Nível ${nextLevel}`, {
        fontSize: "38px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const objective = this.add
      .text(0, -42, nextConfig?.title ?? "Nova missão", {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#2563eb",
        align: "center",
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    const detail = this.add
      .text(0, 14, nextConfig?.objective ?? "Escolha atitudes seguras para proteger seus dados.", {
        fontSize: "16px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 420 },
      })
      .setOrigin(0.5);

    const button = this.add.container(0, 104);
    const buttonShadow = this.add.graphics();
    buttonShadow.fillStyle(0x000000, 0.16);
    buttonShadow.fillRoundedRect(-136, -20, 272, 48, 24);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(this.paletteColors.green, 1);
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26);
    buttonBg.lineStyle(4, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26);
    const buttonText = this.add
      .text(0, 0, "Iniciar missão", {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#166534",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    button.add([buttonShadow, buttonBg, buttonText]);

    const hitbox = this.addOverlayObject(
      this.add.zone(640, 360 + 104 * MODAL_SCALE, 280 * MODAL_SCALE, 58 * MODAL_SCALE).setDepth(452)
    );
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerout", () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerdown", () => {
      this.playClick();
      this.levelStarted = false;
      this.hasStartedTimer = false;
      this.timerEvent?.destroy();
      this.timerEvent = undefined;
      this.scene.restart({ level: nextLevel });
    });

    modal.add([shadow, bg, topBar, title, objective, detail, button]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });
  }

  private showGameCompleteScreen() {
    this.clearOverlay();
    this.input.enabled = true;
    this.levelStarted = false;

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0f2542, 0.64).setDepth(450)
    );
    overlay.setInteractive();

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const score = this.getScore();
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-292, -178, 584, 366, 34);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-304, -190, 608, 370, 34);
    bg.lineStyle(6, 0xffffff, 0.96);
    bg.strokeRoundedRect(-304, -190, 608, 370, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(this.paletteColors.green, 1);
    ribbon.fillRoundedRect(-214, -208, 428, 34, 17);
    ribbon.lineStyle(4, 0xffffff, 0.9);
    ribbon.strokeRoundedRect(-214, -208, 428, 34, 17);

    const title = this.add
      .text(0, -132, "Dados protegidos!", {
        fontSize: "38px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(0, -78, "Você concluiu todas as missões de segurança.", {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);

    const scoreText = this.add
      .text(0, -30, `Pontuação final: ${score} | Acertos: ${this.hits} | Erros: ${this.errors}`, {
        fontSize: "17px",
        fontFamily: "Arial Black, Arial",
        color: "#2563eb",
        align: "center",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 54);
      const badge = this.add.graphics();
      badge.fillStyle(index === 0 ? this.paletteColors.orange : index === 1 ? this.paletteColors.cyan : this.paletteColors.green, 1);
      badge.fillRoundedRect(-54, -42, 108, 84, 18);
      badge.lineStyle(4, 0xffffff, 0.95);
      badge.strokeRoundedRect(-54, -42, 108, 84, 18);
      const number = this.add
        .text(0, -13, String(level), {
          fontSize: "30px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#25327a",
          strokeThickness: 4,
        })
        .setOrigin(0.5);
      const label = this.add
        .text(0, 23, "protegido", {
          fontSize: "12px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      item.add([badge, number, label]);
      return item;
    });

    const createFinalButton = (x: number, label: string, color: number, stroke: string, onClick: () => void) => {
      const button = this.add.container(x, 138);
      const buttonShadow = this.add.graphics();
      buttonShadow.fillStyle(0x000000, 0.16);
      buttonShadow.fillRoundedRect(-128, -20, 256, 48, 24);
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(color, 1);
      buttonBg.fillRoundedRect(-132, -26, 264, 52, 26);
      buttonBg.lineStyle(4, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-132, -26, 264, 52, 26);
      const buttonText = this.add
        .text(0, 0, label, {
          fontSize: "20px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke,
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      button.add([buttonShadow, buttonBg, buttonText]);
      button.setSize(264, 58);
      button.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(-132, -29, 264, 58),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });
      button.on("pointerover", () => {
        this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
      });
      button.on("pointerout", () => {
        this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
      });
      button.on("pointerdown", () => {
        this.playClick();
        onClick();
      });
      return button;
    };

    const playAgain = createFinalButton(-142, "Jogar novamente", this.paletteColors.green, "#166534", () => {
      this.scene.restart({ level: 1 });
    });
    const exit = createFinalButton(142, "Voltar aos jogos", this.paletteColors.orange, "#9a3f00", () => {
      EventBus.emit("exit-game");
    });

    const sparkles = Array.from({ length: 14 }, (_, index) => {
      const sparkle = this.add.graphics();
      sparkle.fillStyle(index % 3 === 0 ? this.paletteColors.cyan : index % 3 === 1 ? this.paletteColors.orange : this.paletteColors.green, 0.9);
      sparkle.fillCircle(Phaser.Math.Between(-278, 278), Phaser.Math.Between(-168, 158), Phaser.Math.Between(4, 8));
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.35, to: 1 },
        scale: { from: 0.8, to: 1.35 },
        duration: 520 + index * 30,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      return sparkle;
    });

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, scoreText, ...levelLabels, playAgain, exit]);
    panel.setScale(MODAL_SCALE * 0.88);
    panel.setAlpha(0);

    this.tweens.add({
      targets: panel,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  private getScore() {
    return this.hits * 5 - this.errors * 5;
  }

  private getChecklistSummary() {
    const items = this.checklist.slice(0, 2);
    if (!items.length) return "Você praticou escolhas seguras para proteger seus dados.";
    return items.map((item) => `✓ ${item}`).join("\n");
  }

  private createCelebrationParticles() {
    const colors = [this.paletteColors.green, this.paletteColors.orange, this.paletteColors.cyan, 0xa855f7, 0xfacc15];
    for (let i = 0; i < 28; i++) {
      const particle = this.add.graphics().setDepth(452);
      const size = Phaser.Math.Between(5, 12);
      particle.fillStyle(colors[i % colors.length], 0.95);
      particle.fillCircle(0, 0, size);
      particle.setPosition(640 + Phaser.Math.Between(-90, 90), 360 + Phaser.Math.Between(-60, 60));
      this.tweens.add({
        targets: particle,
        x: 640 + Phaser.Math.Between(-380, 380),
        y: 360 + Phaser.Math.Between(-220, 180),
        alpha: 0,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: Phaser.Math.Between(760, 1260),
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
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
