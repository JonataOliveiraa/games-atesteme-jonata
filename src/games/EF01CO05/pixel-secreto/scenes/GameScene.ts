import * as Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { PixelCode, PixelLevel } from "../types";

const GAME_ID = "pixel-secreto";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;
const MODAL_SCALE = 1.28;

type CellObject = Phaser.GameObjects.Rectangle & {
  row: number;
  col: number;
  code: PixelCode;
  filled: boolean;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: PixelLevel;
  private selectedCode: PixelCode = "A";
  private cells: CellObject[] = [];
  private hits = 0;
  private errors = 0;
  private hasStartedTimer = false;
  private levelStarted = false;
  private tutorialStep = 0;
  private tutorialContainer?: Phaser.GameObjects.Container;
  private nextTutorialButton?: Phaser.GameObjects.Container;
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private paletteObjects: Phaser.GameObjects.GameObject[] = [];
  private paintCursor?: Phaser.GameObjects.Image;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;
  private unsubscribePlatformCommands?: () => void;

  private readonly paletteColors = {
    purple: 0x7c3aed,
    orange: 0xf59e0b,
    green: 0x22c55e,
    cream: 0xfff7ed,
    ink: 0x25327a,
  };

  private handleExternalFinalGameOver = (raw: Event) => {
    const event = raw as CustomEvent<{
      blockedUntil?: string;
      unlockCost?: number;
    }>;

    this.showGameOverScreen(
      event.detail?.blockedUntil,
      event.detail?.unlockCost ?? 30
    );
  };

  private handleExternalResumeGame = () => {
    this.resumeAfterPlatformModal();
  };

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === lvl) ?? LEVELS[0];
    this.selectedCode = this.levelConfig.palette[0]?.code ?? "A";
    this.cells = [];
    this.hits = 0;
    this.errors = 0;
    this.hasStartedTimer = false;
    this.levelStarted = false;
    this.tutorialStep = 0;
    this.overlayObjects = [];
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createTimerBar();
    this.createPalette();
    this.createGrid();
    this.createPaintCursor();
    this.registerPaintCursorEvents();
    this.registerPlatformCommands();
    this.updatePaintCursor();

    window.addEventListener(
      "pixel-secret-show-final-game-over",
      this.handleExternalFinalGameOver as EventListener
    );

    window.addEventListener(
      "pixel-secret-resume-game",
      this.handleExternalResumeGame
    );

    runtimeGameBridge.emit({
      type: "GAME_READY",
      gameId: GAME_ID,
    });

    this.emitProgress();
    this.levelStarted = true;
  }

  update() {
    if (this.paintCursor && !this.isTouchDevice()) {
      const pointer = this.input.activePointer;
      this.positionPaintCursor(pointer);
    }

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

    window.removeEventListener(
      "pixel-secret-show-final-game-over",
      this.handleExternalFinalGameOver as EventListener
    );

    window.removeEventListener(
      "pixel-secret-resume-game",
      this.handleExternalResumeGame
    );

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

  private addPaletteObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.paletteObjects.push(object);
    return object;
  }

  private clearPalette() {
    this.paletteObjects.forEach((object) => object.destroy());
    this.paletteObjects = [];
  }

  private getStars(level: number) {
    return "⭐".repeat(level);
  }

  private getLevelInstructions() {
    if (this.levelConfig.level === 1) {
      return {
        objective: "Revele a imagem escondida usando os códigos A e B.",
        controls:
          "Clique na legenda para escolher uma cor e depois clique nos quadradinhos com a letra igual.",
        tip: "No nível 1, algumas partes já aparecem como dica.",
      };
    }

    if (this.levelConfig.level === 2) {
      return {
        objective: "Use mais códigos para completar a flor escondida.",
        controls:
          "Escolha uma cor na legenda e preencha todos os espaços com a letra correspondente.",
        tip: "Observe bem cada letra antes de pintar.",
      };
    }

    return {
      objective: "Complete a imagem sem dicas e revele o desenho final.",
      controls: "Escolha o código certo na legenda e pinte a matriz com atenção.",
      tip: "No nível 3, a grade é maior. Vá por partes.",
    };
  }

  private showStartScreen() {
    this.clearOverlay();
    this.input.enabled = true;

    const info = this.getLevelInstructions();

    const bg = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0xfdf2f8, 0.98).setDepth(300)
    );

    const decorativeSquares: Phaser.GameObjects.Rectangle[] = [];

    for (let i = 0; i < 16; i++) {
      const square = this.addOverlayObject(
        this.add
          .rectangle(
            Phaser.Math.Between(70, 1210),
            Phaser.Math.Between(80, 650),
            Phaser.Math.Between(16, 34),
            Phaser.Math.Between(16, 34),
            Phaser.Utils.Array.GetRandom([
              0xf9a8d4,
              0xc4b5fd,
              0x93c5fd,
              0xfacc15,
            ]),
            0.28
          )
          .setDepth(300)
      );

      decorativeSquares.push(square);

      this.tweens.add({
        targets: square,
        angle: 360,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 2500 + i * 120,
        yoyo: true,
        repeat: -1,
      });
    }

    const stars = this.addOverlayObject(
      this.add.container(640, 105).setDepth(301)
    );

    const totalStars = this.levelConfig.level;
    const spacing = 90;
    const startX = -((totalStars - 1) * spacing) / 2;

    for (let i = 0; i < totalStars; i++) {
      const star = this.add
        .star(startX + i * spacing, 0, 5, 16, 34, 0xffd700)
        .setStrokeStyle(4, 0x111827);

      stars.add(star);

      this.tweens.add({
        targets: star,
        scale: { from: 0.95, to: 1.08 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const title = this.addOverlayObject(
      this.add
        .text(640, 175, `Nível ${this.levelConfig.level} - ${this.levelConfig.title}`, {
          fontSize: "38px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#86198f",
          stroke: "#ffffff",
          strokeThickness: 5,
          align: "center",
          wordWrap: { width: 940 },
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const card = this.addOverlayObject(
      this.add
        .rectangle(640, 355, 900, 270, 0xffffff, 0.95)
        .setStrokeStyle(5, 0xc084fc)
        .setDepth(301)
    );

    const objective = this.addOverlayObject(
      this.add
        .text(640, 275, `🎯 ${info.objective}`, {
          fontSize: "26px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#334155",
          align: "center",
          wordWrap: { width: 780 },
        })
        .setOrigin(0.5)
        .setDepth(302)
    );

    const controls = this.addOverlayObject(
      this.add
        .text(640, 365, `🖱️ ${info.controls}`, {
          fontSize: "24px",
          fontFamily: "DynaPuff, Arial, sans-serif",
          color: "#475569",
          align: "center",
          wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
        .setDepth(302)
    );

    const tip = this.addOverlayObject(
      this.add
        .text(640, 455, `💡 ${info.tip}`, {
          fontSize: "23px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#7e22ce",
          align: "center",
          wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
        .setDepth(302)
    );

    const button = this.addOverlayObject(
      this.add
        .rectangle(640, 585, 300, 68, 0x9333ea, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const buttonText = this.addOverlayObject(
      this.add
        .text(640, 585, "Iniciar", {
          fontSize: "30px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    const start = () => {
      this.playClick();
      this.clearOverlay();
      this.levelStarted = true;

      if (this.levelConfig.level === 1) {
        this.time.delayedCall(450, () => {
          this.createTutorialAnimation();
        });
      }
    };

    button.on("pointerdown", start);
    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on("pointerdown", start);

    button.on("pointerover", () => button.setFillStyle(0xa855f7));
    button.on("pointerout", () => button.setFillStyle(0x9333ea));

    this.tweens.add({
      targets: [stars, title, card, objective, controls, tip, button, buttonText],
      alpha: { from: 0, to: 1 },
      y: "+=8",
      duration: 450,
      ease: "Back.Out",
    });

    this.tweens.add({
      targets: stars,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: [button, buttonText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    void bg;
    void decorativeSquares;
  }

  private createTutorialAnimation() {
    this.tutorialStep = 0;
    this.showTutorialStep();
  }

  private showTutorialStep() {
    this.tutorialContainer?.destroy();
    this.nextTutorialButton?.destroy();

    const steps = [
      { text: "Clique na legenda A = ROSA", color: 0xff66b3, label: "A" },
      { text: "Agora clique nos espaços com a letra A", color: 0xffffff, label: "A" },
      { text: "Clique na legenda B = BRANCO", color: 0xffffff, label: "B" },
      { text: "Agora clique nos espaços com a letra B", color: 0xffffff, label: "B" },
      { text: "Complete o desenho para avançar de nível", color: 0x86efac, label: "✓" },
    ];

    const step = steps[this.tutorialStep];

    const blocker = this.add
      .rectangle(640, 360, 1280, 720, 0x111827, 0.82)
      .setDepth(190)
      .setInteractive();

    const panel = this.add
      .rectangle(640, 210, 760, 150, 0xffffff, 0.97)
      .setStrokeStyle(4, 0xa855f7)
      .setDepth(200);

    const numberBadge = this.add
      .circle(300, 195, 24, 0x2563eb, 1)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(201);

    const numberText = this.add
      .text(300, 195, String(this.tutorialStep + 1), {
        fontSize: "24px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(202);

    const text = this.add
      .text(640, 160, step.text, {
        fontSize: "26px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#7e22ce",
        align: "center",
        wordWrap: { width: 620 },
      })
      .setOrigin(0.5)
      .setDepth(202);

    const square = this.add
      .rectangle(640, 230, 70, 70, step.color, 1)
      .setStrokeStyle(4, 0x111827)
      .setDepth(202);

    const label = this.add
      .text(640, 230, step.label, {
        fontSize: "32px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#111827",
      })
      .setOrigin(0.5)
      .setDepth(203);

    this.tutorialContainer = this.add.container(0, 0, [
      blocker,
      panel,
      numberBadge,
      numberText,
      text,
      square,
      label,
    ]);

    this.createNextTutorialButton();
  }

  private createNextTutorialButton() {
    const buttonBg = this.add
      .rectangle(1035, 210, 64, 64, 0xa855f7, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(210);

    const arrow = this.add
      .text(1035, 210, "➜", {
        fontSize: "34px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(211);

    const goNext = () => {
      this.playClick();
      this.tutorialStep++;

      if (this.tutorialStep >= 5) {
        this.tutorialContainer?.destroy();
        this.nextTutorialButton?.destroy();
        return;
      }

      this.showTutorialStep();
    };

    buttonBg.on("pointerdown", goNext);
    arrow.setInteractive({ useHandCursor: true });
    arrow.on("pointerdown", goNext);

    this.nextTutorialButton = this.add.container(0, 0, [buttonBg, arrow]);
  }

  private createBackground() {
    this.cameras.main.setBackgroundColor("#f8fbff");

    if (this.currentLevelHasBackground()) {
      const bgImage = this.add.image(640, 360, this.getLevelBackgroundKey());
      this.coverImage(bgImage, 1280, 720);
      bgImage.setDepth(0);

      const readabilityOverlay = this.add.graphics();
      readabilityOverlay.fillStyle(0xffffff, 0.22);
      readabilityOverlay.fillRect(0, 0, 1280, 720);
      readabilityOverlay.setDepth(1);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0xe0f2fe, 0xfce7f3, 0xfef3c7, 0xdcfce7, 1);
      bg.fillRect(0, 0, 1280, 720);
      bg.setDepth(0);
    }

    for (let i = 0; i < 18; i++) {
      const size = Phaser.Math.Between(12, 28);
      const square = this.add.rectangle(
        Phaser.Math.Between(35, 1245),
        Phaser.Math.Between(85, 675),
        size,
        size,
        Phaser.Utils.Array.GetRandom([0xf9a8d4, 0xc4b5fd, 0x93c5fd, 0xfacc15]),
        0.18
      );

      this.tweens.add({
        targets: square,
        angle: 360,
        duration: 5000 + i * 120,
        repeat: -1,
      });
    }
  }

  private createTitle() {
    this.add
      .text(640, 128, this.levelConfig.title, {
        fontSize: "44px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#4c1d95",
        stroke: "#ffffff",
        strokeThickness: 7,
      })
      .setOrigin(0.5)
      .setDepth(40);

    this.add
      .text(640, 180, "Escolha o código, pinte a matriz e revele a imagem.", {
        fontSize: "22px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#155e75",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(40);
  }

  private createTimerBar() {
    this.add
      .rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 28, 0x334155, 0.4)
      .setStrokeStyle(2, 0x64748b)
      .setDepth(45);

    this.timerBar = this.add
      .rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 20, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(46);

    this.add
      .text(640, TIMER_BAR_Y - 25, "Tempo", {
        fontSize: "16px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        stroke: "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(47);
  }

  private createPalette() {
    this.clearPalette();
    const rows = this.levelConfig.grid.length;
    const panelCenterY = rows >= 8 ? 458 : 433;
    const panelHeight = 84 + this.levelConfig.palette.length * 74;
    const panelY = panelCenterY - panelHeight / 2;
    const titlePillY = panelY - 20;
    const firstCardY = panelY + 76;

    const shadow = this.addPaletteObject(this.add.graphics());
    shadow.fillStyle(0x0f172a, 0.26);
    shadow.fillRoundedRect(866, panelY + 10, 336, panelHeight, 28);

    const panel = this.addPaletteObject(this.add.graphics());
    panel.fillStyle(0xf8fbff, 0.82);
    panel.fillRoundedRect(856, panelY, 336, panelHeight, 28);
    panel.lineStyle(6, 0xffffff, 1);
    panel.strokeRoundedRect(856, panelY, 336, panelHeight, 28);

    const titlePill = this.addPaletteObject(this.add.graphics());
    titlePill.fillStyle(0x7c3aed, 1);
    titlePill.fillRoundedRect(918, titlePillY, 212, 48, 24);

    this.addPaletteObject(
      this.add
        .text(1024, titlePillY + 24, "Código de cores", {
          fontSize: "20px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
    );

    this.levelConfig.palette.forEach((item, index) => {
      const y = firstCardY + index * 74;
      const isSelected = item.code === this.selectedCode;
      const card = this.addPaletteObject(this.add.container(1024, y));

      const cardShadow = this.add.graphics();
      cardShadow.fillStyle(0x0f172a, isSelected ? 0.3 : 0.18);
      cardShadow.fillRoundedRect(-126, -23, 252, 54, 18);

      const cardBg = this.add.graphics();
      cardBg.fillStyle(isSelected ? 0xfff1b8 : 0xffffff, 1);
      cardBg.fillRoundedRect(-132, -30, 264, 58, 18);
      cardBg.lineStyle(isSelected ? 6 : 4, isSelected ? 0xf59e0b : 0x9b7cf2, 1);
      cardBg.strokeRoundedRect(-132, -30, 264, 58, 18);

      const swatch = this.add.graphics();
      swatch.fillStyle(item.color, 1);
      swatch.fillRoundedRect(-110, -21, 48, 42, 12);
      swatch.lineStyle(4, 0x334155, 0.7);
      swatch.strokeRoundedRect(-110, -21, 48, 42, 12);

      const code = this.add
        .text(-86, -2, item.code, {
          fontSize: "22px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: item.textColor ?? "#ffffff",
          stroke: item.textColor ? "#ffffff" : "#25327a",
          strokeThickness: item.textColor ? 2 : 4,
        })
        .setOrigin(0.5);

      const label = this.add
        .text(-38, 0, item.label, {
          fontSize: "21px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#25327a",
          stroke: "#ffffff",
          strokeThickness: 4,
        })
        .setOrigin(0, 0.5);

      card.add([cardShadow, cardBg, swatch, code, label]);
      card.setSize(264, 62);

      card.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, 264, 62),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });

      card.on("pointerdown", () => {
        if (!this.levelStarted) return;
        this.startTimerOnce();
        this.playClick();
        this.selectedCode = item.code;
        this.createPalette();
        this.updatePaintCursor();
      });

      card.on("pointerover", () => {
        this.tweens.add({ targets: card, scale: 1.03, duration: 90, ease: "Sine.easeOut" });
      });
      card.on("pointerout", () => {
        this.tweens.add({ targets: card, scale: 1, duration: 90, ease: "Sine.easeOut" });
      });
    });

  }

  private createPaintBucketIndicator() {
    const selected = this.levelConfig.palette.find((item) => item.code === this.selectedCode);
    const color = selected?.color ?? 0xffffff;
    const textColor = selected?.textColor ?? "#ffffff";
    const bucket = this.addPaletteObject(this.add.container(1024, 528));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.12);
    shadow.fillRoundedRect(-108, -21, 216, 56, 18);

    const bg = this.add.graphics();
    bg.fillStyle(0xf8fafc, 1);
    bg.fillRoundedRect(-114, -28, 228, 58, 18);
    bg.lineStyle(3, 0xc4b5fd, 1);
    bg.strokeRoundedRect(-114, -28, 228, 58, 18);

    const can = this.add.graphics();
    can.fillStyle(0xffffff, 1);
    can.fillRoundedRect(-86, -10, 54, 32, 8);
    can.lineStyle(3, 0x334155, 0.82);
    can.strokeRoundedRect(-86, -10, 54, 32, 8);
    can.lineStyle(3, 0x334155, 0.82);
    can.beginPath();
    can.arc(-59, -11, 22, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340));
    can.strokePath();
    can.fillStyle(color, 1);
    can.fillRoundedRect(-79, 0, 40, 15, 5);
    can.fillStyle(color, 0.95);
    can.fillCircle(-31, 20, 7);

    const code = this.add
      .text(-59, 5, this.selectedCode, {
        fontSize: "18px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: textColor,
        stroke: textColor === "#ffffff" ? "#334155" : "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const label = this.add
      .text(-12, 1, "Pinte com", {
        fontSize: "15px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#64748b",
      })
      .setOrigin(0, 0.5);

    const colorName = this.add
      .text(68, 1, selected?.label ?? "", {
        fontSize: "17px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
      })
      .setOrigin(0.5);

    bucket.add([shadow, bg, can, code, label, colorName]);
  }

  private createPaintCursor() {
    const pointer = this.input.activePointer;
    this.input.setDefaultCursor("default");
    this.paintCursor = this.add
      .image(pointer.x, pointer.y, this.getCursorTextureKey())
      .setOrigin(0, 0.15)
      .setDisplaySize(this.getPaintCursorWidth(), this.getPaintCursorHeight())
      .setDepth(2000)
      .setAlpha(this.isTouchDevice() ? 0 : 0.95);
  }

  private updatePaintCursor() {
    if (!this.paintCursor) return;

    this.paintCursor.setTexture(this.getCursorTextureKey());
    this.paintCursor.setDisplaySize(this.getPaintCursorWidth(), this.getPaintCursorHeight());
    this.input.setDefaultCursor("default");
  }

  private registerPaintCursorEvents() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.positionPaintCursor(pointer, true);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.positionPaintCursor(pointer, true);
    });

    this.input.on("pointerup", () => {
      if (this.isTouchDevice()) {
        this.paintCursor?.setAlpha(0);
      }
    });

    this.input.on("gameout", () => {
      if (this.isTouchDevice()) {
        this.paintCursor?.setAlpha(0);
      }
    });
  }

  private positionPaintCursor(pointer: Phaser.Input.Pointer, visible = true) {
    if (!this.paintCursor) return;

    const offsetX = this.isTouchDevice() ? 24 : 14;
    const offsetY = this.isTouchDevice() ? -56 : 10;
    this.paintCursor.setPosition(pointer.x + offsetX, pointer.y + offsetY);

    if (visible) {
      this.paintCursor.setAlpha(0.95);
    }
  }

  private hidePaintCursorForButton() {
    if (this.isTouchDevice()) return;
    this.paintCursor?.setAlpha(0);
  }

  private showPaintCursorAfterButton() {
    if (this.isTouchDevice()) return;
    this.paintCursor?.setAlpha(0.95);
  }

  private getPaintCursorWidth() {
    return this.isTouchDevice() ? 44 : 34;
  }

  private getPaintCursorHeight() {
    return this.isTouchDevice() ? 52 : 40;
  }

  private isTouchDevice() {
    return this.sys.game.device.input.touch;
  }

  private getCursorTextureKey() {
    const selected = this.levelConfig.palette.find((item) => item.code === this.selectedCode);
    const label = selected?.label.toLowerCase() ?? "";

    if (label.includes("rosa")) return "pixel-secret-cursor-pink";
    if (label.includes("branco")) return "pixel-secret-cursor-white";
    if (label.includes("amarelo")) return "pixel-secret-cursor-yellow";
    if (label.includes("verde")) return "pixel-secret-cursor-green";
    if (label.includes("azul")) return "pixel-secret-cursor-blue";
    if (label.includes("roxo")) return "pixel-secret-cursor-purple";
    if (label.includes("cinza")) return "pixel-secret-cursor-gray";
    if (label.includes("preto")) return "pixel-secret-cursor-black";

    return "pixel-secret-cursor-pink";
  }

  private createGrid() {
    const rows = this.levelConfig.grid.length;
    const cols = this.levelConfig.grid[0]?.length ?? 0;
    const cellSize = this.getGridCellSize(rows, cols);
    const gap = 4;
    const totalW = cols * cellSize + (cols - 1) * gap;
    const totalH = rows * cellSize + (rows - 1) * gap;
    const gridCenterY = this.getGridCenterY(rows, cols);
    const startX = 500 - totalW / 2 + cellSize / 2;
    const startY = gridCenterY - totalH / 2 + cellSize / 2;
    const panelPadding = this.getGridPanelPadding(rows, cols);

    const panelShadow = this.add.graphics();
    panelShadow.fillStyle(0x0f172a, 0.12);
    panelShadow.fillRoundedRect(
      500 - (totalW + panelPadding) / 2 + 8,
      gridCenterY - (totalH + panelPadding) / 2 + 10,
      totalW + panelPadding,
      totalH + panelPadding,
      32
    );

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.34);
    panel.fillRoundedRect(
      500 - (totalW + panelPadding) / 2,
      gridCenterY - (totalH + panelPadding) / 2,
      totalW + panelPadding,
      totalH + panelPadding,
      32
    );
    panel.lineStyle(5, 0xffffff, 0.88);
    panel.strokeRoundedRect(
      500 - (totalW + panelPadding) / 2,
      gridCenterY - (totalH + panelPadding) / 2,
      totalW + panelPadding,
      totalH + panelPadding,
      32
    );

    this.levelConfig.grid.forEach((row, rowIndex) => {
      row.forEach((code, colIndex) => {
        const x = startX + colIndex * (cellSize + gap);
        const y = startY + rowIndex * (cellSize + gap);
        const isEmpty = code === "";
        const hint = this.levelConfig.hints?.some(
          (item) => item.row === rowIndex && item.col === colIndex
        );
        const color = hint ? this.getColorByCode(code) : 0xffffff;

        const cell = this.add
          .rectangle(x, y, cellSize, cellSize, isEmpty ? 0xf8fafc : color, isEmpty ? 0.45 : 1)
          .setStrokeStyle(2, isEmpty ? 0xe2e8f0 : hint ? 0xffffff : 0xcbd5e1)
          .setInteractive({ useHandCursor: false }) as CellObject;

        cell.row = rowIndex;
        cell.col = colIndex;
        cell.code = code;
        cell.filled = Boolean(hint || isEmpty);

        if (!hint && !isEmpty) {
          this.add
            .text(x, y, code, {
              fontSize: `${Math.round(cellSize * 0.4)}px`,
              fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
              color: "#7c2d12",
            })
            .setOrigin(0.5)
            .setName(`label-${rowIndex}-${colIndex}`);
        }

        if (!isEmpty) {
          cell.on("pointerdown", () => this.handleCellClick(cell));
        }

        this.cells.push(cell);
      });
    });
  }

  private handleCellClick(cell: CellObject) {
    if (!this.levelStarted) return;
    if (cell.filled) return;

    this.startTimerOnce();

    if (this.selectedCode !== cell.code) {
      this.errors += 1;
      this.playWrong();

      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });

      this.emitProgress();
      return;
    }

    cell.filled = true;
    cell.setFillStyle(this.getColorByCode(cell.code));
    cell.setStrokeStyle(4, 0xffffff);
    this.hideCellLabel(cell.row, cell.col);
    this.hits += 1;
    this.playCorrect();
    this.tweens.add({
      targets: cell,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 110,
      yoyo: true,
      ease: "Sine.easeOut",
    });

    runtimeGameBridge.emit({
      type: "CORRECT_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: 5,
    });

    this.showCorrectFeedback(cell.x, cell.y);
    this.emitProgress();

    if (this.isCompleted()) {
      this.time.delayedCall(600, () => this.handleSuccess());
    }
  }

  private showErrorScreen() {
    this.clearOverlay();
    this.levelStarted = false;

    if (this.timerEvent) {
      this.timerEvent.paused = true;
    }

    const bg = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x111827, 0.95).setDepth(300)
    );

    const title = this.addOverlayObject(
      this.add
        .text(640, 175, "Você cometeu um erro!", {
          fontSize: "52px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
          stroke: "#ef4444",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const subtitle = this.addOverlayObject(
      this.add
        .text(640, 310, "-1 ponto de vida.\nDeseja tentar novamente?", {
          fontSize: "30px",
          fontFamily: "DynaPuff, Arial, sans-serif",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 820 },
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const retryButton = this.addOverlayObject(
      this.add
        .rectangle(500, 500, 310, 66, 0x22c55e, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const retryText = this.addOverlayObject(
      this.add
        .text(500, 500, "Tentar novamente", {
          fontSize: "24px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    const exitButton = this.addOverlayObject(
      this.add
        .rectangle(790, 500, 220, 66, 0xef4444, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const exitText = this.addOverlayObject(
      this.add
        .text(790, 500, "Sair", {
          fontSize: "24px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    const retry = () => {
      this.playClick();
      this.clearOverlay();
      window.dispatchEvent(new CustomEvent("pixel-secret-show-extra-life-modal"));
    };

    const exit = () => {
      this.playClick();
      window.dispatchEvent(new CustomEvent("pixel-secret-exit-game"));
    };

    retryButton.on("pointerdown", retry);
    retryText.setInteractive({ useHandCursor: true });
    retryText.on("pointerdown", retry);

    exitButton.on("pointerdown", exit);
    exitText.setInteractive({ useHandCursor: true });
    exitText.on("pointerdown", exit);

    retryButton.on("pointerover", () => retryButton.setFillStyle(0x16a34a));
    retryButton.on("pointerout", () => retryButton.setFillStyle(0x22c55e));
    exitButton.on("pointerover", () => exitButton.setFillStyle(0xdc2626));
    exitButton.on("pointerout", () => exitButton.setFillStyle(0xef4444));

    this.tweens.add({
      targets: [title, subtitle, retryButton, retryText, exitButton, exitText],
      alpha: { from: 0, to: 1 },
      y: "+=10",
      duration: 450,
      ease: "Back.Out",
    });

    void bg;
  }

  private showGameOverScreen(blockedUntil?: string, unlockCost = 30) {
    this.clearOverlay();
    this.levelStarted = false;
    this.input.enabled = true;
    this.timerEvent?.remove(false);

    const formattedDate = blockedUntil
      ? new Date(blockedUntil).toLocaleString("pt-BR")
      : "em 2 dias";

    const bg = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x111827, 0.96).setDepth(300)
    );

    const title = this.addOverlayObject(
      this.add
        .text(640, 120, "GAME OVER", {
          fontSize: "64px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
          stroke: "#ef4444",
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const text = this.addOverlayObject(
      this.add
        .text(
          640,
          270,
          `Você ficou sem vidas.\n\nO jogo foi bloqueado até:\n${formattedDate}`,
          {
            fontSize: "30px",
            fontFamily: "DynaPuff, Arial, sans-serif",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 900 },
          }
        )
        .setOrigin(0.5)
        .setDepth(301)
    );

    const unlockInfo = this.addOverlayObject(
      this.add
        .text(640, 430, `Você pode desbloquear agora usando ${unlockCost} pontos.`, {
          fontSize: "26px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#facc15",
          align: "center",
          wordWrap: { width: 900 },
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    // botão desbloquear
    const unlockButton = this.addOverlayObject(
      this.add
        .rectangle(470, 560, 340, 74, 0x9333ea, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const unlockText = this.addOverlayObject(
      this.add
        .text(470, 560, "Desbloquear jogo", {
          fontSize: "24px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    // botão sair
    const exitButton = this.addOverlayObject(
      this.add
        .rectangle(820, 560, 320, 74, 0xef4444, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const exitText = this.addOverlayObject(
      this.add
        .text(820, 560, "Voltar aos jogos", {
          fontSize: "24px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    const unlock = () => {
      this.playClick();

      window.dispatchEvent(
        new CustomEvent("pixel-secret-open-unlock-modal")
      );
    };

    const exit = () => {
      this.playClick();

      window.dispatchEvent(
        new CustomEvent("pixel-secret-exit-game")
      );
    };

    unlockButton.on("pointerdown", unlock);

    unlockText.setInteractive({ useHandCursor: true });
    unlockText.on("pointerdown", unlock);

    exitButton.on("pointerdown", exit);

    exitText.setInteractive({ useHandCursor: true });
    exitText.on("pointerdown", exit);

    this.tweens.add({
      targets: [
        title,
        text,
        unlockInfo,
        unlockButton,
        unlockText,
        exitButton,
        exitText,
      ],
      alpha: { from: 0, to: 1 },
      y: "+=10",
      duration: 450,
      ease: "Back.Out",
    });

    void bg;
  }


  private hideCellLabel(row: number, col: number) {
    const label = this.children.getByName(`label-${row}-${col}`);
    label?.destroy();
  }

  private isCompleted() {
    return this.cells.every((cell) => cell.filled);
  }

  private handleSuccess() {
    this.levelStarted = false;
    this.playWin();
    this.showSuccessAnimation();
    this.emitProgress();
    this.timerEvent?.remove(false);

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

      this.time.delayedCall(1600, () => {
        this.showLevelCompleteTransition(nextLevel as 1 | 2 | 3);
      });

      return;
    }

    this.time.delayedCall(1800, () => {
      runtimeGameBridge.emit({
        type: "GAME_COMPLETED",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      });

      this.input.enabled = false;
      this.showFinalLevelCompleteTransition();
    });
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450)
    );
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -166, 540, 330, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -178, 556, 330, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -178, 556, 330, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(this.paletteColors.orange, 1);
    topBar.fillRoundedRect(-196, -194, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14);

    const title = this.add
      .text(0, -110, "Parabéns!", {
        fontSize: "40px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const completed = this.add
      .text(0, -50, `Nível ${this.levelConfig.level} concluído`, {
        fontSize: "26px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#7c3aed",
        align: "center",
      })
      .setOrigin(0.5);

    const message = this.add
      .text(0, 8, `Imagem revelada: ${this.levelConfig.imageName}.`, {
        fontSize: "17px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    const waitText = this.add
      .text(0, 116, "Preparando o próximo nível...", {
        fontSize: "15px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
      })
      .setOrigin(0.5);

    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics();
      dot.fillStyle(level <= this.levelConfig.level ? 0x22c55e : level === nextLevel ? 0xf59e0b : 0xd8dde8, 1);
      dot.fillCircle(-28 + index * 28, 72, 8);
      dot.lineStyle(2, 0xffffff, 0.9);
      dot.strokeCircle(-28 + index * 28, 72, 8);
      return dot;
    });

    modal.add([shadow, bg, topBar, title, completed, message, ...dots, waitText]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(2300, () => {
      this.showNextLevelStartTransition(nextLevel);
    });
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450)
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
    topBar.fillStyle(0x22c55e, 1);
    topBar.fillRoundedRect(-196, -182, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14);

    const title = this.add
      .text(0, -102, `Nível ${nextLevel}`, {
        fontSize: "38px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const objective = this.add
      .text(0, -42, nextConfig?.title ?? "Novo desafio", {
        fontSize: "24px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#7c3aed",
        align: "center",
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    const detail = this.add
      .text(0, 12, nextConfig?.objective ?? "Decodifique a matriz para revelar a imagem.", {
        fontSize: "16px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
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
    buttonBg.fillStyle(0xf59e0b, 1);
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26);
    buttonBg.lineStyle(4, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26);
    const buttonText = this.add
      .text(0, 0, "Iniciar nível", {
        fontSize: "22px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#9a3f00",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    button.add([buttonShadow, buttonBg, buttonText]);

    const buttonHitbox = this.addOverlayObject(
      this.add.zone(640, 360 + 104 * MODAL_SCALE, 280 * MODAL_SCALE, 58 * MODAL_SCALE).setDepth(452)
    );
    buttonHitbox.setInteractive({ useHandCursor: true });
    buttonHitbox.on("pointerover", () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerout", () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerdown", () => {
      this.playClick();
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

  private showFinalLevelCompleteTransition() {
    this.clearOverlay();

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450)
    );
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -166, 540, 330, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -178, 556, 330, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -178, 556, 330, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(this.paletteColors.orange, 1);
    topBar.fillRoundedRect(-196, -194, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14);

    const title = this.add
      .text(0, -110, "Parabéns!", {
        fontSize: "40px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const completed = this.add
      .text(0, -50, "Nível concluído", {
        fontSize: "26px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#7c3aed",
      })
      .setOrigin(0.5);

    const message = this.add
      .text(0, 8, `Imagem revelada: ${this.levelConfig.imageName}.`, {
        fontSize: "17px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    const waitText = this.add
      .text(0, 116, "Preparando a finalização...", {
        fontSize: "15px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
      })
      .setOrigin(0.5);

    modal.add([shadow, bg, topBar, title, completed, message, waitText]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(2300, () => {
      this.showGameCompleteScreen();
    });
  }

  private showGameCompleteScreen() {
    this.clearOverlay();
    this.input.enabled = true;
    this.levelStarted = false;

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.62).setDepth(450)
    );
    overlay.setInteractive();

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451));

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
      .text(0, -128, "Jogo concluído!", {
        fontSize: "38px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(0, -74, "Você decodificou todas as imagens secretas.", {
        fontSize: "20px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        align: "center",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 54);
      const badge = this.add.graphics();
      badge.fillStyle(index === 0 ? this.paletteColors.orange : index === 1 ? 0x38bdf8 : this.paletteColors.green, 1);
      badge.fillRoundedRect(-54, -42, 108, 84, 18);
      badge.lineStyle(4, 0xffffff, 0.95);
      badge.strokeRoundedRect(-54, -42, 108, 84, 18);

      const number = this.add
        .text(0, -13, String(level), {
          fontSize: "30px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
          stroke: "#25327a",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      const label = this.add
        .text(0, 23, "concluído", {
          fontSize: "12px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      item.add([badge, number, label]);
      return item;
    });

    const createFinalButton = (
      x: number,
      label: string,
      color: number,
      stroke: string,
      onClick: () => void
    ) => {
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
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
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
        this.hidePaintCursorForButton();
        this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
      });
      button.on("pointerout", () => {
        this.showPaintCursorAfterButton();
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
      const x = Phaser.Math.Between(-278, 278);
      const y = Phaser.Math.Between(-168, 158);
      sparkle.fillStyle(index % 3 === 0 ? 0x38bdf8 : index % 3 === 1 ? this.paletteColors.orange : this.paletteColors.green, 0.9);
      sparkle.fillCircle(x, y, Phaser.Math.Between(4, 8));
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

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, ...levelLabels, playAgain, exit]);
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

  private showLevelCompleteScreen(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const bg = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0xf0fdf4, 0.98).setDepth(300)
    );

    const badge = this.addOverlayObject(
      this.add
        .text(640, 150, this.getStars(this.levelConfig.level), {
          fontSize: "52px",
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const title = this.addOverlayObject(
      this.add
        .text(640, 260, `Parabéns!\nVocê concluiu o nível ${this.levelConfig.level}!`, {
          fontSize: "42px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#16a34a",
          stroke: "#ffffff",
          strokeThickness: 5,
          align: "center",
          wordWrap: { width: 900 },
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const subtitle = this.addOverlayObject(
      this.add
        .text(640, 410, "Prepare-se para o próximo desafio.", {
          fontSize: "28px",
          fontFamily: "DynaPuff, Arial, sans-serif",
          color: "#334155",
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    void bg;
    void badge;
    void title;
    void subtitle;

    this.time.delayedCall(1700, () => {
      this.showNextLevelScreen(nextLevel);
    });
  }

  private showNextLevelScreen(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const nextConfig = LEVELS.find((item) => item.level === nextLevel);

    const bg = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0xfdf2f8, 0.98).setDepth(300)
    );

    const stars = this.addOverlayObject(
      this.add
        .text(640, 140, this.getStars(nextLevel), {
          fontSize: "52px",
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const title = this.addOverlayObject(
      this.add
        .text(640, 240, `Próximo nível: ${nextLevel}`, {
          fontSize: "42px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#86198f",
          stroke: "#ffffff",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const subtitle = this.addOverlayObject(
      this.add
        .text(640, 325, nextConfig?.title ?? "Novo desafio", {
          fontSize: "32px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#334155",
          align: "center",
          wordWrap: { width: 850 },
        })
        .setOrigin(0.5)
        .setDepth(301)
    );

    const button = this.addOverlayObject(
      this.add
        .rectangle(640, 510, 430, 66, 0x9333ea, 1)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(302)
    );

    const buttonText = this.addOverlayObject(
      this.add
        .text(640, 510, "Avançar", {
          fontSize: "30px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(303)
    );

    const goNext = () => {
      this.playClick();
      this.clearOverlay();
      this.scene.restart({ level: nextLevel });
    };

    button.on("pointerdown", goNext);
    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on("pointerdown", goNext);

    button.on("pointerover", () => button.setFillStyle(0xa855f7));
    button.on("pointerout", () => button.setFillStyle(0x9333ea));

    void bg;
    void stars;
    void title;
    void subtitle;
  }

  private startTimerOnce() {
    if (this.hasStartedTimer) return;

    this.hasStartedTimer = true;
    this.startTimer();
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

    runtimeGameBridge.emit({
      type: "WRONG_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: -5,
    });

    this.emitProgress();
  }

  private getGridCellSize(rows: number, cols: number) {
    const maxDimension = Math.max(rows, cols);

    if (maxDimension <= 5) return 76;
    if (maxDimension <= 7) return 66;
    return 52;
  }

  private getGridCenterY(rows: number, cols: number) {
    const maxDimension = Math.max(rows, cols);

    if (maxDimension <= 7) return 452;
    return 466;
  }

  private getGridPanelPadding(rows: number, cols: number) {
    const maxDimension = Math.max(rows, cols);

    if (maxDimension <= 7) return 72;
    return 64;
  }

  private emitProgress() {
    const playableCells = this.cells.filter((cell) => cell.code !== "");
    const filled = playableCells.filter((cell) => cell.filled).length;
    const progress = playableCells.length
      ? Math.round((filled / playableCells.length) * 100)
      : 0;

    EventBus.emit("pixel-progress", {
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
        if (command.type === "PAUSE_GAME") {
          this.pauseForPlatformModal();
          return;
        }

        if (command.type === "RESUME_GAME") {
          this.resumeAfterPlatformModal();
          return;
        }

        if (command.type !== "START_GAME") return;
        if (command.gameId !== GAME_ID) return;
        if (command.stage === this.levelConfig.level) return;

        this.time.delayedCall(100, () => {
          this.scene.restart({
            level: command.stage as 1 | 2 | 3,
          });
        });
      }
    );
  }

  private pauseForPlatformModal() {
    this.levelStarted = false;
    this.input.enabled = false;

    if (this.timerEvent) {
      this.timerEvent.paused = true;
    }
  }

  private resumeAfterPlatformModal() {
    this.clearOverlay();
    this.input.enabled = true;
    this.levelStarted = true;

    if (this.timerEvent) {
      this.timerEvent.paused = false;
    }
  }

  private getColorByCode(code: PixelCode): number {
    return this.levelConfig.palette.find((item) => item.code === code)?.color ?? 0xffffff;
  }

  private showMiniCheck(x: number, y: number) {
    const check = this.add
      .text(x, y, "✓", {
        fontSize: "32px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#22c55e",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: check,
      y: y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => check.destroy(),
    });
  }

  private showCorrectFeedback(x: number, y: number) {
    const feedback = this.add.container(x, y).setDepth(80);
    const glow = this.add.graphics();
    glow.fillStyle(0x22c55e, 0.24);
    glow.fillCircle(0, 0, 38);
    glow.lineStyle(4, 0xffffff, 0.92);
    glow.strokeCircle(0, 0, 34);

    const check = this.add
      .text(0, -1, "✓", {
        fontSize: "34px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#16a34a",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    feedback.add([glow, check]);

    this.tweens.add({
      targets: feedback,
      y: y - 30,
      scaleX: 1.18,
      scaleY: 1.18,
      alpha: 0,
      duration: 680,
      ease: "Back.Out",
      onComplete: () => feedback.destroy(),
    });
  }

  private showSuccessAnimation() {
    const centerX = 500;
    const centerY = this.levelConfig.grid.length >= 8 ? 458 : 433;

    const flash = this.add.rectangle(centerX, centerY, 540, 420, 0xffffff, 0.42).setDepth(88);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 520,
      ease: "Sine.easeOut",
      onComplete: () => flash.destroy(),
    });

    this.cells
      .filter((cell) => cell.code !== "")
      .forEach((cell, index) => {
        this.tweens.add({
          targets: cell,
          scaleX: 1.1,
          scaleY: 1.1,
          delay: index * 18,
          duration: 110,
          yoyo: true,
          ease: "Back.easeOut",
        });
      });

    const messageBg = this.add.graphics().setDepth(120);
    messageBg.fillStyle(0x22c55e, 0.96);
    messageBg.fillRoundedRect(centerX - 260, 172, 520, 72, 28);
    messageBg.lineStyle(5, 0xffffff, 0.96);
    messageBg.strokeRoundedRect(centerX - 260, 172, 520, 72, 28);
    messageBg.setAlpha(0);

    const message = this.add
      .text(centerX, 208, `Imagem revelada: ${this.levelConfig.imageName}!`, {
        fontSize: "28px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#166534",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(121)
      .setAlpha(0);

    this.tweens.add({
      targets: [messageBg, message],
      alpha: 1,
      scaleX: { from: 0.82, to: 1 },
      scaleY: { from: 0.82, to: 1 },
      duration: 260,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: [messageBg, message],
      y: "-=12",
      alpha: 0,
      delay: 960,
      duration: 420,
      ease: "Sine.easeIn",
      onComplete: () => {
        messageBg.destroy();
        message.destroy();
      },
    });

    const colors = [0x22c55e, 0xf59e0b, 0x38bdf8, 0xf472b6, 0xa855f7, 0xfacc15];

    for (let i = 0; i < 34; i++) {
      const particle = this.add.graphics().setDepth(110);
      const size = Phaser.Math.Between(5, 12);
      const startX = centerX + Phaser.Math.Between(-90, 90);
      const startY = centerY + Phaser.Math.Between(-70, 70);

      particle.fillStyle(colors[i % colors.length], 0.95);
      if (i % 3 === 0) {
        particle.fillCircle(0, 0, size);
      } else {
        particle.fillRoundedRect(-size / 2, -size / 2, size, size, 3);
      }
      particle.setPosition(startX, startY);

      this.tweens.add({
        targets: particle,
        x: centerX + Phaser.Math.Between(-370, 370),
        y: centerY + Phaser.Math.Between(-220, 180),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: Phaser.Math.Between(760, 1260),
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  private showLegacySuccessAnimation() {
    this.showFloatingMessage(`Imagem revelada: ${this.levelConfig.imageName}!`, 0x22c55e);

    const emojis = ["⭐", "✨", "🎨", "🌟"];

    for (let i = 0; i < 22; i++) {
      const star = this.add
        .text(500, 360, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(24, 44)}px`,
        })
        .setOrigin(0.5)
        .setDepth(90);

      this.tweens.add({
        targets: star,
        x: 500 + Phaser.Math.Between(-360, 360),
        y: 360 + Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(700, 1200),
        onComplete: () => star.destroy(),
      });
    }
  }

  private currentLevelHasBackground() {
    return this.levelConfig.level >= 1 && this.levelConfig.level <= 3;
  }

  private getLevelBackgroundKey() {
    return `pixel-secret-bg-level-${this.levelConfig.level}`;
  }

  private coverImage(image: Phaser.GameObjects.Image, width: number, height: number) {
    const scale = Math.max(width / image.width, height / image.height);
    image.setScale(scale);
  }

  private showFloatingMessage(message: string, color: number) {
    const bgColor = Phaser.Display.Color.IntegerToColor(color).rgba;

    const text = this.add
      .text(500, 210, message, {
        fontSize: "30px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        backgroundColor: bgColor,
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: text,
      y: 185,
      alpha: 0,
      delay: 900,
      duration: 450,
      onComplete: () => text.destroy(),
    });
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
