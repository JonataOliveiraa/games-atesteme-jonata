import * as Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { AlgorithmCard, AlgorithmLevel } from "../types";

interface CardSprite extends Phaser.GameObjects.Container {
  cardData: AlgorithmCard;
  originX_: number;
  originY_: number;
  baseScale_: number;
  currentSlotIndex?: number | null;
}

const GAME_ID = "oficina-dos-algoritmos";
const GAME_W = 1280;
const GAME_H = 720;
const TIMER_W = 760;

export class GameScene extends Phaser.Scene {
  private levelConfig!: AlgorithmLevel;
  private levelStarted = false;
  private hasStartedTimer = false;
  private gameLocked = false;

  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private cardSprites: CardSprite[] = [];
  private slots: Phaser.GameObjects.Rectangle[] = [];
  private placedCards: Array<CardSprite | null> = [];
  private executionMarkers: Phaser.GameObjects.GameObject[] = [];
  private hintContainer?: Phaser.GameObjects.Container;

  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;
  private timerGlow?: Phaser.GameObjects.Rectangle;

  private hits = 0;
  private errors = 0;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === lvl) ?? LEVELS[0];

    this.levelStarted = false;
    this.hasStartedTimer = false;
    this.gameLocked = false;
    this.overlayObjects = [];
    this.cardSprites = [];
    this.slots = [];
    this.placedCards = [];
    this.executionMarkers = [];
    this.hintContainer = undefined;
    this.hits = 0;
    this.errors = 0;
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
    this.timerGlow = undefined;
  }

  create() {
    this.createWorld();
    this.createHud();
    this.createSequenceArea();
    this.createCardTray();
    this.createTestButton();
    this.setupDrag();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();

    this.time.delayedCall(120, () => this.showStartScreen());
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;

    const remaining = this.timerEvent.getRemaining();
    const total = this.levelConfig.timeLimit * 1000;
    const pct = Math.max(0, remaining / total);

    this.timerBar.setSize(TIMER_W * pct, 14);
    this.timerGlow?.setSize(Math.max(0, TIMER_W * pct - 16), 4);

    if (pct > 0.5) this.timerBar.setFillStyle(0x22c55e);
    else if (pct > 0.25) this.timerBar.setFillStyle(0xf59e0b);
    else this.timerBar.setFillStyle(0xef4444);
  }

  shutdown() {
    this.timerEvent?.destroy();
    this.hintContainer?.destroy();
    this.unsubscribePlatformCommands?.();
    this.unsubscribePlatformCommands = undefined;
  }

  // ─────────────────────────────────────────────
  // CENÁRIO DO JOGO — MESMA LINGUAGEM DAS TELAS
  // ─────────────────────────────────────────────

  private createWorld() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x9ee7ff, 0xffd6ef, 0xd7ffe6, 0xfff2c2, 1);
    bg.fillRect(0, 0, GAME_W, GAME_H);

    this.createSoftGrid();
    this.createWorkshopScenery();

    this.add.circle(142, 122, 98, 0xffffff, 0.3).setDepth(0);
    this.add.circle(1120, 125, 130, 0xffffff, 0.22).setDepth(0);
    this.add.circle(1050, 620, 170, 0xffffff, 0.18).setDepth(0);
    this.add.circle(220, 635, 135, 0xffffff, 0.16).setDepth(0);

    this.createFloatingDecorations();

    // Card principal translúcido do jogo inteiro
    this.addRoundedPanel(646, 404, 1130, 500, 34, 0x2b2447, 0.1, 0xffffff, 0, 1);
    this.addRoundedPanel(640, 398, 1130, 500, 34, 0xffffff, 0.64, 0xffffff, 0.88, 1);

    // Glow sutil por trás da área principal
    this.add.ellipse(640, 390, 850, 360, 0xffffff, 0.24).setDepth(0);
  }

  private createSoftGrid() {
    for (let x = 0; x <= 1280; x += 48) {
      this.add.rectangle(x, 360, 1, 720, 0xffffff, 0.14).setDepth(0);
    }

    for (let y = 0; y <= 720; y += 48) {
      this.add.rectangle(640, y, 1280, 1, 0xffffff, 0.14).setDepth(0);
    }
  }

  private createWorkshopScenery() {
    const floor = this.add.graphics().setDepth(0);
    floor.fillStyle(this.getLevelFloorColor(), 0.28);
    floor.fillRoundedRect(-40, 604, 1360, 155, 44);
    floor.fillStyle(0xffffff, 0.28);
    floor.fillRoundedRect(90, 632, 250, 18, 10);
    floor.fillRoundedRect(930, 642, 270, 18, 10);

    if (this.levelConfig.level === 1) {
      this.createSandwichScenery();
      return;
    }

    if (this.levelConfig.level === 2) {
      this.createToothbrushScenery();
      return;
    }

    this.createGardenScenery();
  }

  private getLevelFloorColor() {
    if (this.levelConfig.level === 1) return 0xffd166;
    if (this.levelConfig.level === 2) return 0x90dbf4;
    return 0x86efac;
  }

  private createSandwichScenery() {
    const plate = this.add.ellipse(164, 522, 230, 80, 0xffffff, 0.36).setDepth(0);
    this.add.ellipse(164, 522, 178, 48, 0xfff7ed, 0.38).setDepth(0);
    const sandwich = this.add.container(164, 484).setDepth(1);
    const shadow = this.add.ellipse(8, 45, 170, 26, 0x000000, 0.08);
    const breadTop = this.addRoundedGraphic(0, -22, 150, 48, 22, 0xf6c177, 0.8, 0xffffff, 0.35, 3);
    const lettuce = this.addRoundedGraphic(0, 3, 138, 14, 8, 0x86efac, 0.85, 0xffffff, 0);
    const cheese = this.addRoundedGraphic(0, 18, 128, 16, 7, 0xffd166, 0.86, 0xffffff, 0);
    const breadBottom = this.addRoundedGraphic(0, 35, 146, 32, 15, 0xd99a4e, 0.78, 0xffffff, 0.22, 2);
    sandwich.add([shadow, breadTop, lettuce, cheese, breadBottom]);

    this.createIngredientTile(1050, 472, 0xf6c177, "pão");
    this.createIngredientTile(1146, 520, 0xffd166, "queijo");
    this.createIngredientTile(1012, 578, 0x86efac, "folha");
    this.createIngredientTile(1162, 392, 0xef4444, "tomate");
    this.add.ellipse(1078, 600, 255, 42, 0xffffff, 0.24).setDepth(0);

    this.tweens.add({
      targets: sandwich,
      y: 492,
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createIngredientTile(x: number, y: number, color: number, kind: "pão" | "queijo" | "folha" | "tomate") {
    const tile = this.add.container(x, y).setDepth(1);
    tile.add(this.addRoundedGraphic(6, 8, 92, 76, 22, 0x000000, 0.08, 0xffffff, 0));
    tile.add(this.addRoundedGraphic(0, 0, 92, 76, 22, 0xffffff, 0.58, 0xffffff, 0.55, 3));

    const icon = this.add.graphics();
    icon.fillStyle(color, 0.86);
    if (kind === "pão") {
      icon.fillRoundedRect(-28, -13, 56, 30, 14);
      icon.fillStyle(0xffffff, 0.28);
      icon.fillRoundedRect(-17, -6, 34, 13, 7);
    } else if (kind === "queijo") {
      icon.fillTriangle(-27, -18, 26, -4, -14, 22);
      icon.fillStyle(0xffffff, 0.42);
      icon.fillCircle(-8, -4, 4);
      icon.fillCircle(6, 5, 3);
    } else if (kind === "folha") {
      icon.fillEllipse(0, 0, 58, 30);
      icon.lineStyle(3, 0xffffff, 0.38);
      icon.lineBetween(-22, 0, 22, 0);
    } else {
      icon.fillCircle(0, 0, 22);
      icon.fillStyle(0xffffff, 0.28);
      icon.fillCircle(-8, -7, 7);
    }
    tile.add(icon);
    return tile;
  }

  private createToothbrushScenery() {
    const sink = this.add.container(150, 515).setDepth(1);
    sink.add(this.add.ellipse(0, 42, 220, 58, 0xffffff, 0.42));
    sink.add(this.addRoundedGraphic(0, 0, 188, 86, 32, 0xffffff, 0.48, 0x7dd3fc, 0.45, 4));
    sink.add(this.addRoundedGraphic(0, -10, 118, 32, 16, 0xe0f2fe, 0.7, 0xffffff, 0));
    sink.add(this.addRoundedGraphic(0, -52, 58, 12, 6, 0x94a3b8, 0.6, 0xffffff, 0));
    sink.add(this.add.circle(35, -40, 7, 0x38bdf8, 0.5));

    this.createBrushShape(1070, 488, -14);
    this.createToothpasteShape(1162, 540);
    this.createBubbleCluster(1016, 386);
    this.createBubbleCluster(1180, 430);

    const smile = this.add.container(150, 408).setDepth(1);
    smile.add(this.addRoundedGraphic(0, 0, 128, 82, 34, 0xffffff, 0.48, 0x7dd3fc, 0.35, 3));
    smile.add(this.add.circle(-28, -4, 5, 0x1e293b, 0.7));
    smile.add(this.add.circle(28, -4, 5, 0x1e293b, 0.7));
    const mouth = this.add.graphics();
    mouth.lineStyle(5, 0x38bdf8, 0.72);
    mouth.beginPath();
    mouth.arc(0, 0, 32, 0.1, Math.PI - 0.1, false);
    mouth.strokePath();
    smile.add(mouth);
  }

  private createBrushShape(x: number, y: number, angle: number) {
    const brush = this.add.container(x, y).setDepth(1).setAngle(angle);
    brush.add(this.addRoundedGraphic(0, 0, 148, 26, 13, 0x38bdf8, 0.72, 0xffffff, 0.38, 3));
    brush.add(this.addRoundedGraphic(64, -18, 38, 44, 10, 0xffffff, 0.76, 0x38bdf8, 0.36, 3));
    for (let i = 0; i < 4; i++) {
      brush.add(this.addRoundedGraphic(52 + i * 8, -36, 5, 20, 3, 0xbae6fd, 0.82, 0xffffff, 0));
    }
    this.tweens.add({ targets: brush, y: y + 12, duration: 2100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private createToothpasteShape(x: number, y: number) {
    const tube = this.add.container(x, y).setDepth(1).setAngle(8);
    tube.add(this.addRoundedGraphic(0, 0, 70, 126, 20, 0xffffff, 0.62, 0x60a5fa, 0.5, 4));
    tube.add(this.addRoundedGraphic(0, -4, 44, 52, 14, 0x60a5fa, 0.32, 0xffffff, 0));
    tube.add(this.addRoundedGraphic(0, -72, 54, 18, 8, 0x2563eb, 0.6, 0xffffff, 0.28, 2));
  }

  private createBubbleCluster(x: number, y: number) {
    [0, 1, 2, 3, 4].forEach((index) => {
      const bubble = this.add.circle(x + Phaser.Math.Between(-28, 28), y + index * 22, Phaser.Math.Between(7, 14), 0xffffff, 0.36).setDepth(1);
      this.tweens.add({
        targets: bubble,
        y: bubble.y - Phaser.Math.Between(24, 52),
        alpha: 0.08,
        duration: 1800 + index * 180,
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    });
  }

  private createGardenScenery() {
    const soil = this.add.graphics().setDepth(1);
    soil.fillStyle(0x8b5e34, 0.36);
    soil.fillRoundedRect(48, 535, 250, 66, 28);
    soil.fillRoundedRect(966, 548, 245, 62, 28);

    this.createPlantShape(145, 494, 1.1);
    this.createPlantShape(1068, 500, 0.95);
    this.createWateringCan(1162, 438);
    this.createSunShape(108, 138);
    this.createSeedPacket(1010, 438);
  }

  private createPlantShape(x: number, y: number, scale: number) {
    const plant = this.add.container(x, y).setDepth(1).setScale(scale);
    plant.add(this.addRoundedGraphic(0, 52, 76, 54, 18, 0xc2410c, 0.52, 0xffffff, 0.22, 3));
    plant.add(this.addRoundedGraphic(0, 27, 90, 18, 8, 0xfb923c, 0.58, 0xffffff, 0.18, 2));
    const stem = this.add.graphics();
    stem.lineStyle(7, 0x22c55e, 0.78);
    stem.lineBetween(0, 26, 0, -40);
    stem.fillStyle(0x86efac, 0.82);
    stem.fillEllipse(-22, -12, 38, 18);
    stem.fillEllipse(22, -28, 38, 18);
    stem.fillStyle(0xf472b6, 0.82);
    stem.fillCircle(0, -52, 18);
    stem.fillStyle(0xfff7ad, 0.88);
    stem.fillCircle(0, -52, 7);
    plant.add(stem);
    this.tweens.add({ targets: plant, y: y + 8, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private createWateringCan(x: number, y: number) {
    const can = this.add.container(x, y).setDepth(1).setAngle(-8);
    can.add(this.addRoundedGraphic(0, 18, 100, 66, 24, 0x38bdf8, 0.52, 0xffffff, 0.36, 4));
    can.add(this.add.circle(47, 8, 30, 0x38bdf8, 0.2));
    can.add(this.add.circle(47, 8, 18, 0xffffff, 0.38));
    can.add(this.addRoundedGraphic(-64, 3, 70, 16, 8, 0x38bdf8, 0.52, 0xffffff, 0.26, 3));
    can.add(this.addRoundedGraphic(-12, -28, 46, 18, 8, 0x38bdf8, 0.62, 0xffffff, 0.25, 3));
  }

  private createSunShape(x: number, y: number) {
    const sun = this.add.container(x, y).setDepth(0);
    const rays = this.add.graphics();
    rays.lineStyle(5, 0xffc857, 0.35);
    for (let i = 0; i < 10; i++) {
      const angle = Phaser.Math.DegToRad(i * 36);
      rays.lineBetween(Math.cos(angle) * 42, Math.sin(angle) * 42, Math.cos(angle) * 62, Math.sin(angle) * 62);
    }
    sun.add(rays);
    sun.add(this.add.circle(0, 0, 36, 0xffc857, 0.36));
    sun.add(this.add.circle(-10, -10, 12, 0xffffff, 0.24));
    this.tweens.add({ targets: sun, angle: 360, duration: 22000, repeat: -1, ease: "Linear" });
  }

  private createSeedPacket(x: number, y: number) {
    const packet = this.add.container(x, y).setDepth(1).setAngle(7);
    packet.add(this.addRoundedGraphic(0, 0, 82, 104, 16, 0xffffff, 0.55, 0x22c55e, 0.42, 4));
    packet.add(this.addRoundedGraphic(0, -26, 62, 20, 8, 0x22c55e, 0.4, 0xffffff, 0));
    packet.add(this.add.circle(0, 20, 17, 0x8b5e34, 0.55));
    packet.add(this.add.circle(-16, 18, 8, 0x8b5e34, 0.38));
    packet.add(this.add.circle(16, 18, 8, 0x8b5e34, 0.38));
  }

  private createFloatingDecorations() {
    const decorations = this.getLevelDecorations();

    const positions = [
      { x: 98, y: 205, size: 42, delay: 0, angle: -7 },
      { x: 170, y: 612, size: 38, delay: 200, angle: 5 },
      { x: 1130, y: 218, size: 44, delay: 400, angle: 6 },
      { x: 1056, y: 622, size: 40, delay: 600, angle: -4 },
      { x: 315, y: 112, size: 34, delay: 800, angle: 5 },
      { x: 950, y: 122, size: 36, delay: 1000, angle: -5 },
      { x: 420, y: 650, size: 30, delay: 1200, angle: 4 },
      { x: 835, y: 635, size: 32, delay: 1400, angle: -3 },
    ];

    positions.forEach((pos, index) => {
      const emoji = decorations[index % decorations.length];

      const tileShadow = this.addRoundedGraphic(pos.x + 7, pos.y + 9, 72, 72, 22, 0x000000, 0.06, 0xffffff, 0)
        .setDepth(0)
        .setAngle(pos.angle);

      const tile = this.addRoundedGraphic(pos.x, pos.y, 72, 72, 22, 0xffffff, 0.5, 0xffffff, 0.5, 3)
        .setDepth(0)
        .setAngle(pos.angle);

      const item = this.add.text(pos.x, pos.y, emoji, {
        fontSize: `${pos.size}px`,
        fontFamily: this.getEmojiFontFamily(),
        padding: { top: 8, bottom: 8, left: 8, right: 8 },
      })
        .setOrigin(0.5)
        .setAlpha(0.54)
        .setDepth(0)
        .setAngle(pos.angle);

      this.tweens.add({
        targets: [tileShadow, tile, item],
        y: pos.y + Phaser.Math.Between(-12, 12),
        duration: Phaser.Math.Between(2200, 3800),
        delay: pos.delay,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private getLevelDecorations(): string[] {
    if (this.levelConfig.level === 1) return ["🍞", "🧀", "🥪", "🥬", "🍅", "🧺"];
    if (this.levelConfig.level === 2) return ["🪥", "🧴", "💧", "😁", "🫧", "✨"];
    return ["🌱", "🌸", "💧", "🏺", "☀️", "🟤"];
  }

  private createHud() {
    this.addRoundedPanel(640, 70, TIMER_W + 58, 42, 22, 0x2b2447, 0.1, 0xffffff, 0, 19);
    this.addRoundedPanel(640, 70, TIMER_W + 42, 34, 18, 0xffffff, 0.86, 0xffffff, 0.98, 20);
    this.addRoundedPanel(640, 70, TIMER_W + 18, 18, 9, 0xe0f2fe, 1, 0xffffff, 0, 20);

    this.timerBar = this.add.rectangle(640 - TIMER_W / 2, 70, TIMER_W, 14, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(21);

    this.timerGlow = this.add.rectangle(640 - TIMER_W / 2 + 8, 66, TIMER_W - 16, 4, 0xffffff, 0.35)
      .setOrigin(0, 0.5)
      .setDepth(22);

    this.addRoundedPanel(140, 70, 178, 48, 22, 0xffffff, 0.82, 0xffffff, 0.92, 18);
    this.add.text(140, 70, `${this.levelConfig.themeEmoji} Nível ${this.levelConfig.level}`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#4f46e5",
    }).setOrigin(0.5).setDepth(23);

    this.add.text(640, 124, this.levelConfig.title, {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#3730a3",
      stroke: "#ffffff",
      strokeThickness: 8,
      align: "center",
    }).setOrigin(0.5).setDepth(10);
  }

  private createSequenceArea() {
    const total = this.levelConfig.correctOrder.length;
    const slotW = total > 5 ? 116 : 150;
    const slotH = total > 5 ? 96 : 112;
    const gap = total > 5 ? 12 : 18;
    const totalWidth = total * slotW + (total - 1) * gap;
    const startX = 640 - totalWidth / 2 + slotW / 2;

    this.placedCards = Array(total).fill(null);

    this.addRoundedPanel(646, 334, totalWidth + 145, slotH + 118, 32, 0x2b2447, 0.09, 0xffffff, 0, 3);
    this.addRoundedPanel(640, 326, totalWidth + 135, slotH + 108, 30, 0xffffff, 0.88, 0xffffff, 0.96, 4);
    this.addRoundedPanel(640, 394, totalWidth + 70, 14, 8, 0xc4b5fd, 0.22, 0xffffff, 0, 5);

    this.add.text(640, 252, "Sequência do algoritmo", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#4f46e5",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(8);

    for (let i = 0; i < total; i++) {
      const x = startX + i * (slotW + gap);
      const y = 336;
      const color = this.getSlotColor(i);

      this.addRoundedPanel(x + 5, y + 7, slotW, slotH, 24, 0x000000, 0.08, 0xffffff, 0, 5);
      this.addRoundedPanel(x, y, slotW, slotH, 24, 0xffffff, 0.98, color, 0.72, 6);
      this.add.circle(x - slotW / 2 + 19, y - slotH / 2 + 19, 10, color, 0.22).setDepth(7);

      const slot = this.add.rectangle(x, y, slotW, slotH, 0xffffff, 0.98)
        .setStrokeStyle(5, color)
        .setDepth(6)
        .setFillStyle(0xffffff, 0.08);

      this.add.text(x, y, `${i + 1}`, {
        fontSize: "42px",
        fontFamily: "Arial Black, Arial",
        color: this.colorToCss(color),
        stroke: "#ffffff",
        strokeThickness: 5,
      }).setOrigin(0.5).setAlpha(0.74).setDepth(7);

      slot.setData("slotIndex", i);
      this.slots.push(slot);
    }
  }

  private createCardTray() {
    const cards = Phaser.Utils.Array.Shuffle([
      ...this.levelConfig.cards,
      ...(this.levelConfig.distractors ?? []),
    ]);

    this.addRoundedPanel(646, 593, 1110, 142, 34, 0x2b2447, 0.09, 0xffffff, 0, 3);
    this.addRoundedPanel(640, 585, 1110, 142, 34, 0xffffff, 0.9, 0xffffff, 0.96, 4);
    this.addRoundedPanel(640, 522, 1040, 12, 8, 0x6c63ff, 0.2, 0xffffff, 0, 5);

    const cardW = cards.length > 6 ? 116 : 148;
    const gap = cards.length > 6 ? 12 : 18;
    const totalWidth = cards.length * cardW + (cards.length - 1) * gap;
    const startX = 640 - totalWidth / 2 + cardW / 2;

    cards.forEach((card, index) => {
      const x = startX + index * (cardW + gap);
      const y = 585;
      const sprite = this.createCard(card, x, y, cards.length > 6 ? 0.88 : 1);
      this.cardSprites.push(sprite);
    });
  }

  private createCard(card: AlgorithmCard, x: number, y: number, scale = 1): CardSprite {
    const cardColor = this.getCardColor(card.type);
    const shadow = this.addRoundedGraphic(7, 10, 148, 112, 24, 0x000000, 0.15, 0xffffff, 0);
    const bg = this.addRoundedGraphic(0, 0, 148, 112, 24, 0xffffff, 1, cardColor, 1, 5);
    const colorWash = this.addRoundedGraphic(0, -28, 126, 42, 20, cardColor, 0.12, 0xffffff, 0);
    const topGlow = this.addRoundedGraphic(0, -43, 112, 10, 8, 0xffffff, 0.48, 0xffffff, 0);
    const typeDot = this.add.circle(-55, -41, 9, cardColor, 0.9);

    const visual = card.id === "pegar-escova" && !this.isMobileDevice()
      ? this.createToothbrushCardVisual()
      : this.add.text(0, -22, card.emoji, {
        fontSize: "36px",
        fontFamily: this.getEmojiFontFamily(),
        padding: { top: 8, bottom: 8, left: 8, right: 8 },
      }).setOrigin(0.5);

    const label = this.add.text(0, 28, card.label, {
      fontSize: "13px",
      fontFamily: "Arial Black, Arial",
      color: "#1e293b",
      align: "center",
      wordWrap: { width: 110 },
      lineSpacing: -3,
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [shadow, bg, colorWash, topGlow, typeDot, visual, label]) as CardSprite;
    container.cardData = card;
    container.originX_ = x;
    container.originY_ = y;
    container.baseScale_ = scale;
    container.currentSlotIndex = null;
    container.setSize(148, 124);
    container.setScale(scale);
    container.setDepth(12);
    container.setInteractive({ draggable: true, useHandCursor: true });

    container.on("pointerover", () => {
      if (!this.levelStarted || this.gameLocked) return;
      this.tweens.add({ targets: container, scaleX: container.baseScale_ * 1.06, scaleY: container.baseScale_ * 1.06, duration: 120 });
    });

    container.on("pointerout", () => {
      if (!this.levelStarted || this.gameLocked) return;
      this.tweens.add({ targets: container, scaleX: container.baseScale_, scaleY: container.baseScale_, duration: 120 });
    });

    this.input.setDraggable(container);
    return container;
  }

  private createToothbrushCardVisual() {
    const brush = this.add.container(0, -22).setAngle(-14);
    const handle = this.addRoundedGraphic(-2, 4, 58, 11, 6, 0x38bdf8, 1, 0xffffff, 0.55, 2);
    const neck = this.addRoundedGraphic(25, -3, 22, 9, 5, 0x0ea5e9, 1, 0xffffff, 0.35, 2);
    const head = this.addRoundedGraphic(37, -11, 18, 24, 6, 0xffffff, 1, 0x38bdf8, 0.45, 2);

    const bristles = this.add.graphics();
    bristles.fillStyle(0xbae6fd, 1);
    for (let i = 0; i < 4; i++) {
      bristles.fillRoundedRect(31 + i * 4, -27, 3, 15, 2);
    }

    brush.add([handle, neck, head, bristles]);
    return brush;
  }

  private createTestButton() {
    const shadow = this.addRoundedPanel(648, 480, 348, 74, 26, 0x000000, 0.14, 0xffffff, 0, 14);
    const bg = this.addRoundedPanel(640, 470, 334, 68, 26, 0xff6b35, 1, 0xffffff, 0.88, 15)
      .setInteractive(new Phaser.Geom.Rectangle(475, 437, 330, 66), Phaser.Geom.Rectangle.Contains);
    this.addRoundedPanel(640, 449, 268, 10, 8, 0xffffff, 0.24, 0xffffff, 0, 16);

    const text = this.add.text(640, 470, "🧪 Testar algoritmo", {
      fontSize: "23px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#c2410c",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(16);

    const run = () => {
      if (!this.levelStarted || this.gameLocked) return;
      this.playClick();
      this.startTimerOnce();
      this.testAlgorithm();
    };

    bg.on("pointerdown", run);
    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", run);

    bg.on("pointerover", () => this.tweens.add({ targets: [bg, text, shadow], scaleX: 1.04, scaleY: 1.04, duration: 120 }));
    bg.on("pointerout", () => this.tweens.add({ targets: [bg, text, shadow], scaleX: 1, scaleY: 1, duration: 120 }));
  }

  // ─────────────────────────────────────────────
  // TELAS MODERNAS: NÍVEL E INSTRUÇÕES
  // ─────────────────────────────────────────────

  private showStartScreen() {
    this.clearOverlay();
    this.levelStarted = false;
    this.gameLocked = true;

    this.createLevelIntroBackground();

    const cardShadow = this.addRoundedPanel(650, 366, 760, 326, 32, 0x000000, 0.1, 0xffffff, 0, 306);
    this.addOverlayObject(cardShadow);

    const card = this.addRoundedPanel(640, 356, 760, 326, 32, 0xffffff, 0.96, 0xffffff, 0.95, 307);
    this.addOverlayObject(card);

    const badge = this.addRoundedPanel(640, 252, 238, 42, 21, 0xe0e7ff, 1, 0xffffff, 0.75, 308);
    this.addOverlayObject(badge);

    const badgeText = this.add.text(640, 255, `${this.levelConfig.themeEmoji} Nível ${this.levelConfig.level}`, {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#4f46e5",
    }).setOrigin(0.5).setDepth(309);
    this.addOverlayObject(badgeText);

    const title = this.add.text(640, 340, this.levelConfig.title, {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
      color: "#4f46e5",
      align: "center",
      wordWrap: { width: 620 },
    }).setOrigin(0.5).setDepth(309);
    this.addOverlayObject(title);

    const subtitle = this.add.text(640, 410, "Monte a sequência correta e teste seu algoritmo.", {
      fontSize: "20px",
      fontFamily: "Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(309);
    this.addOverlayObject(subtitle);

    const buttonShadow = this.addRoundedPanel(646, 518, 310, 68, 26, 0x000000, 0.14, 0xffffff, 0, 308);
    this.addOverlayObject(buttonShadow);

    const button = this.addRoundedPanel(640, 510, 310, 68, 26, 0x7c3aed, 1, 0xffffff, 0.88, 309);
    this.addOverlayObject(button);

    const buttonHit = this.add.zone(640, 510, 336, 86).setInteractive({ useHandCursor: true }).setDepth(311);
    this.addOverlayObject(buttonHit);

    const buttonText = this.add.text(640, 510, "Iniciar nível", {
      fontSize: "23px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(310);
    this.addOverlayObject(buttonText);

    this.tweens.add({
      targets: [button, buttonText],
      scaleX: 1.035,
      scaleY: 1.035,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const start = () => {
      this.playClick();
      this.clearOverlay();

      if (this.levelConfig.level === 1) {
        this.showTutorialStep(0);
        return;
      }

      this.waitForHintBeforeStarting();
    };

    buttonHit.on("pointerdown", start);
    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on("pointerdown", start);
  }

  private createLevelIntroBackground() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0xf8fbff, 0.82)
      .setDepth(300)
      .setInteractive();
    this.addOverlayObject(overlay);

    this.addOverlayObject(this.add.circle(160, 120, 90, 0xffffff, 0.18).setDepth(301));
    this.addOverlayObject(this.add.circle(1120, 110, 120, 0xffffff, 0.14).setDepth(301));
    this.addOverlayObject(this.add.circle(1050, 620, 145, 0xffffff, 0.12).setDepth(301));
  }

  private showTutorialStep(stepIndex: number) {
    this.clearOverlay();

    const steps = [
      { emoji: "👆", title: "Arraste os cartões", description: "Escolha um cartão e arraste para a trilha de passos." },
      { emoji: "🧠", title: "Pense na ordem", description: "Um algoritmo funciona quando os passos estão na sequência certa." },
      { emoji: "🧪", title: "Teste o algoritmo", description: "Clique em testar para ver a animação passo a passo." },
    ];

    const step = steps[stepIndex];
    const isLast = stepIndex === steps.length - 1;

    this.createLevelIntroBackground();

    const cardShadow = this.addRoundedPanel(648, 350, 780, 310, 34, 0x000000, 0.1, 0xffffff, 0, 409);
    this.addOverlayObject(cardShadow);

    const card = this.addRoundedPanel(640, 340, 780, 310, 34, 0xffffff, 0.96, 0xffffff, 0.95, 410);
    this.addOverlayObject(card);

    this.addOverlayObject(this.add.text(640, 235, step.emoji, {
      fontSize: "74px",
      fontFamily: this.getEmojiFontFamily(),
      padding: { top: 14, bottom: 14, left: 14, right: 14 },
    }).setOrigin(0.5).setDepth(411));

    this.addOverlayObject(this.add.text(640, 330, step.title, {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
      color: "#4f46e5",
      align: "center",
    }).setOrigin(0.5).setDepth(411));

    this.addOverlayObject(this.add.text(640, 405, step.description, {
      fontSize: "24px",
      fontFamily: "Arial",
      color: "#475569",
      wordWrap: { width: 610 },
      align: "center",
    }).setOrigin(0.5).setDepth(411));

    this.addOverlayObject(this.addRoundedPanel(960, 340, 82, 82, 30, 0x7c3aed, 1, 0xffffff, 0.95, 412));
    const buttonHit = this.addOverlayObject(this.add.zone(960, 340, 82, 82).setInteractive({ useHandCursor: true }).setDepth(414));

    const text = this.addOverlayObject(this.add.text(960, 340, isLast ? "▶" : "→", {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(413));

    const next = () => {
      this.playClick();
      if (isLast) {
        this.clearOverlay();
        this.waitForHintBeforeStarting();
        return;
      }
      this.showTutorialStep(stepIndex + 1);
    };

    buttonHit.on("pointerdown", next);
    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", next);
  }

  private waitForHintBeforeStarting() {
    this.levelStarted = false;
    this.gameLocked = true;
    this.showLevelHint(() => {
      this.levelStarted = true;
      this.gameLocked = false;
    });
  }

  private showLevelHint(onClose?: () => void) {
    if (this.levelConfig.level === 1) {
      this.showFloatingHint("Organize os passos", "Arraste os cartões para a ordem correta antes de testar.", onClose);
      return;
    }
    if (this.levelConfig.level === 2) {
      this.showFloatingHint("Pense na lógica", "Alguns cartões parecem corretos, mas a ordem muda tudo.", onClose);
      return;
    }
    this.showFloatingHint("Monte sozinho", "Agora você precisa descobrir toda a sequência do algoritmo.", onClose);
  }

  private showFloatingHint(title: string, description: string, onClose?: () => void) {
    this.hintContainer?.destroy();

    const container = this.add.container(980, 178).setDepth(500);

    const shadow = this.addRoundedGraphic(8, 10, 370, 178, 26, 0x000000, 0.16, 0xffffff, 0);
    const bg = this.addRoundedGraphic(0, 0, 370, 178, 26, 0xffffff, 0.97, 0xffffff, 0.95, 4);
    const accent = this.addRoundedGraphic(0, -76, 330, 13, 9, 0x4f46e5, 1, 0xffffff, 0);
    const badge = this.addRoundedGraphic(-92, -54, 126, 34, 16, 0x4f46e5, 1, 0xffffff, 0);

    const badgeText = this.add.text(-92, -54, "💡 Dica", {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    }).setOrigin(0.5);

    const titleText = this.add.text(0, -18, title, {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#1e293b",
      align: "center",
      wordWrap: { width: 300 },
    }).setOrigin(0.5);

    const descText = this.add.text(0, 38, description, {
      fontSize: "18px",
      fontFamily: "Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 300 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    const closeBg = this.add.circle(150, -58, 18, 0xef4444).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(150, -58, "✕", {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    }).setOrigin(0.5);

    const closeHint = () => {
      this.playClick();
      closeBg.disableInteractive();
      closeText.disableInteractive();
      this.tweens.killTweensOf([closeBg, closeText]);
      this.tweens.add({
        targets: container,
        alpha: 0,
        y: container.y - 18,
        duration: 180,
        onComplete: () => {
          container.destroy();
          if (this.hintContainer === container) this.hintContainer = undefined;
          onClose?.();
        },
      });
    };

    closeBg.on("pointerdown", closeHint);
    closeText.setInteractive({ useHandCursor: true });
    closeText.on("pointerdown", closeHint);

    container.add([shadow, bg, accent, badge, badgeText, titleText, descText, closeBg, closeText]);
    container.setAlpha(0);
    container.y -= 22;

    this.tweens.add({ targets: container, alpha: 1, y: container.y + 22, duration: 260, ease: "Back.Out" });
    this.tweens.add({ targets: [closeBg, closeText], scaleX: 1.18, scaleY: 1.18, duration: 560, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.hintContainer = container;
  }

  private setupDrag() {
    this.input.on("dragstart", (_: Phaser.Input.Pointer, obj: CardSprite) => {
      if (!this.levelStarted || this.gameLocked) return;
      this.startTimerOnce();
      obj.setDepth(60);
      this.playClick();
      this.tweens.add({ targets: obj, scaleX: obj.scaleX * 1.08, scaleY: obj.scaleY * 1.08, duration: 100 });
    });

    this.input.on("drag", (_: Phaser.Input.Pointer, obj: CardSprite, dragX: number, dragY: number) => {
      if (!this.levelStarted || this.gameLocked) return;
      obj.setPosition(dragX, dragY);
    });

    this.input.on("dragend", (_: Phaser.Input.Pointer, obj: CardSprite) => {
      if (!this.levelStarted || this.gameLocked) return;
      obj.setDepth(12);
      const slotIndex = this.findNearestSlotIndex(obj.x, obj.y);
      if (slotIndex === null) {
        this.returnCard(obj);
        return;
      }
      this.placeCardInSlot(obj, slotIndex);
    });
  }

  private findNearestSlotIndex(x: number, y: number): number | null {
    for (const slot of this.slots) {
      if (Phaser.Geom.Rectangle.Contains(slot.getBounds(), x, y)) {
        return slot.getData("slotIndex") as number;
      }
    }
    return null;
  }

  private placeCardInSlot(card: CardSprite, slotIndex: number) {
    const previousSlot = this.placedCards.findIndex((item) => item === card);
    if (previousSlot >= 0) this.placedCards[previousSlot] = null;

    const currentCard = this.placedCards[slotIndex];
    if (currentCard && currentCard !== card) this.returnCard(currentCard);

    const slot = this.slots[slotIndex];
    this.placedCards[slotIndex] = card;
    card.currentSlotIndex = slotIndex;

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      scaleX: this.levelConfig.correctOrder.length > 5 ? 0.78 : 0.86,
      scaleY: this.levelConfig.correctOrder.length > 5 ? 0.78 : 0.86,
      duration: 220,
      ease: "Back.Out",
      onComplete: () => this.emitProgress(),
    });
  }

  private returnCard(card: CardSprite) {
    const previousSlot = this.placedCards.findIndex((item) => item === card);
    if (previousSlot >= 0) this.placedCards[previousSlot] = null;
    card.currentSlotIndex = null;

    this.tweens.add({
      targets: card,
      x: card.originX_,
      y: card.originY_,
      scaleX: card.baseScale_,
      scaleY: card.baseScale_,
      duration: 240,
      ease: "Back.Out",
      onComplete: () => this.emitProgress(),
    });
  }

  private testAlgorithm() {
    const selectedOrder = this.placedCards.map((card) => card?.cardData.id ?? null);
    if (selectedOrder.some((id) => id === null)) {
      this.playWrong();
      this.showFloatingMessage("Complete todos os passos primeiro", 0xf59e0b);
      return;
    }
    this.gameLocked = true;
    this.runExecutionAnimation(selectedOrder as string[]);
  }

  private runExecutionAnimation(selectedOrder: string[]) {
    this.clearExecutionMarkers();

    let firstWrongIndex = -1;
    for (let i = 0; i < selectedOrder.length; i++) {
      if (selectedOrder[i] !== this.levelConfig.correctOrder[i]) {
        firstWrongIndex = i;
        break;
      }
    }

    selectedOrder.forEach((_id, index) => {
      this.time.delayedCall(index * 520, () => {
        const card = this.placedCards[index];
        const slot = this.slots[index];
        if (!card || !slot) return;

        const isWrongStep = firstWrongIndex === index;
        const isAfterWrong = firstWrongIndex >= 0 && index > firstWrongIndex;
        if (isAfterWrong) return;

        slot.setStrokeStyle(6, isWrongStep ? 0xef4444 : 0x22c55e);
        this.tweens.add({ targets: card, scaleX: card.scaleX * 1.08, scaleY: card.scaleY * 1.08, duration: 120, yoyo: true });

        const mark = this.add.text(slot.x, slot.y - 70, isWrongStep ? "!" : "✓", {
          fontSize: "42px",
          fontFamily: "Arial Black, Arial",
          color: isWrongStep ? "#ef4444" : "#22c55e",
          stroke: "#ffffff",
          strokeThickness: 5,
        }).setOrigin(0.5).setDepth(90);
        this.executionMarkers.push(mark);

        if (isWrongStep) this.playWrong();
        else this.playCorrect();
      });
    });

    const wait = (firstWrongIndex >= 0 ? firstWrongIndex + 1 : selectedOrder.length) * 520 + 400;

    this.time.delayedCall(wait, () => {
      if (firstWrongIndex >= 0) this.handleWrongSequence(firstWrongIndex);
      else this.handleSuccess();
    });
  }

  private handleWrongSequence(wrongIndex: number) {
    this.errors += 1;
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.showFloatingMessage(`Ops! O passo ${wrongIndex + 1} não encaixou.`, 0xef4444);
    this.emitProgress();

    this.time.delayedCall(900, () => {
      this.clearExecutionMarkers();
      this.slots.forEach((slot, index) => slot.setStrokeStyle(5, this.getSlotColor(index)));
      this.gameLocked = false;
    });
  }

  private handleSuccess() {
    this.hits += 1;
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 5 });

    this.playWin();
    this.showSuccessAnimation();
    this.emitProgress();
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.hasStartedTimer = false;

    const nextLevel = this.levelConfig.level + 1;
    if (nextLevel <= 3) {
      this.time.delayedCall(1900, () => this.scene.restart({ level: nextLevel }));
      return;
    }

    this.time.delayedCall(1900, () => runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level }));
  }

  private clearExecutionMarkers() {
    this.executionMarkers.forEach((item) => item.destroy());
    this.executionMarkers = [];
  }

  private startTimerOnce() {
    if (this.hasStartedTimer) return;
    this.hasStartedTimer = true;
    this.timerEvent?.destroy();
    this.timerEvent = this.time.addEvent({ delay: this.levelConfig.timeLimit * 1000, callback: this.onTimeUp, callbackScope: this });
  }

  private onTimeUp() {
    this.gameLocked = true;
    this.playWrong();
    runtimeGameBridge.emit({ type: "GAME_OVER", gameId: GAME_ID, stage: this.levelConfig.level });
  }

  private emitProgress() {
    const total = this.levelConfig.correctOrder.length;
    const filled = this.placedCards.filter(Boolean).length;
    const progress = Math.round((filled / total) * 100);

    EventBus.emit("algorithm-progress", { progress, hits: this.hits, errors: this.errors });
    runtimeGameBridge.emit({ type: "CHECKPOINT", gameId: GAME_ID, progress, score: this.hits * 5 - this.errors * 5, stage: this.levelConfig.level, hits: this.hits, errors: this.errors });
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((command: PlatformCommand) => {
      if (command.type !== "START_GAME") return;
      if (command.gameId !== GAME_ID) return;
      if (command.stage === this.levelConfig.level) return;
      this.time.delayedCall(100, () => this.scene.restart({ level: command.stage as 1 | 2 | 3 }));
    });
  }

  private showFloatingMessage(message: string, color: number) {
    const container = this.add.container(640, 215).setDepth(120);
    const shadow = this.addRoundedGraphic(8, 10, 680, 66, 24, 0x000000, 0.14, 0xffffff, 0);
    const bg = this.addRoundedGraphic(0, 0, 680, 66, 24, color, 0.96, 0xffffff, 0.9, 4);
    const shine = this.addRoundedGraphic(0, -20, 590, 9, 8, 0xffffff, 0.22, 0xffffff, 0);
    const text = this.add.text(0, 0, message, {
      fontSize: "30px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 620 },
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([shadow, bg, shine, text]);
    this.tweens.add({ targets: container, y: 190, alpha: 0, delay: 950, duration: 450, onComplete: () => container.destroy() });
  }

  private showSuccessAnimation() {
    this.showFloatingMessage(this.levelConfig.successMessage, 0x22c55e);

    const seal = this.add.text(640, 390, "🏅 Algoritmo completo!", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      stroke: "#ffffff",
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(130).setScale(0.4).setAlpha(0);

    this.tweens.add({ targets: seal, scaleX: 1, scaleY: 1, alpha: 1, duration: 350, ease: "Back.Out" });
    this.tweens.add({ targets: seal, alpha: 0, delay: 1250, duration: 350, onComplete: () => seal.destroy() });

    const emojis = ["⭐", "✨", "🌟", "🎉", "💫"];
    for (let i = 0; i < 24; i++) {
      const star = this.add.text(640, 340, emojis[i % emojis.length], {
        fontSize: `${Phaser.Math.Between(22, 42)}px`,
      }).setOrigin(0.5).setDepth(125);

      this.tweens.add({
        targets: star,
        x: 640 + Phaser.Math.Between(-420, 420),
        y: 340 + Phaser.Math.Between(-190, 190),
        alpha: 0,
        angle: Phaser.Math.Between(-120, 120),
        duration: Phaser.Math.Between(700, 1300),
        onComplete: () => star.destroy(),
      });
    }
  }

  private addRoundedPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor: number,
    strokeAlpha: number,
    depth: number
  ) {
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    if (strokeAlpha > 0) {
      g.lineStyle(4, strokeColor, strokeAlpha);
      g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
    return g;
  }

  private addRoundedGraphic(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor: number,
    strokeAlpha: number,
    strokeWidth = 4
  ) {
    const g = this.add.graphics();
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    if (strokeAlpha > 0) {
      g.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
    g.setPosition(x, y);
    return g;
  }

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.overlayObjects.push(object);
    return object;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((item) => {
      this.tweens.killTweensOf(item);
      item.destroy();
    });
    this.overlayObjects = [];
  }

  private getCardColor(type: string): number {
    const map: Record<string, number> = { start: 0x22c55e, prepare: 0x38bdf8, build: 0xfacc15, test: 0xfb923c, finish: 0xa855f7 };
    return map[type] ?? 0x0ea5e9;
  }

  private getSlotColor(index: number): number {
    const colors = [0x38bdf8, 0x22c55e, 0xf59e0b, 0xa855f7, 0xec4899, 0x14b8a6];
    return colors[index % colors.length];
  }

  private colorToCss(color: number) {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  private getEmojiFontFamily() {
    return "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Arial";
  }

  private isMobileDevice() {
    const os = this.sys.game.device.os;
    return os.android || os.iOS;
  }

  private getAudioContext(): AudioContext | null {
    if (!("context" in this.sound)) return null;
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.22, delaySeconds = 0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delaySeconds);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delaySeconds);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySeconds + duration);
    osc.start(ctx.currentTime + delaySeconds);
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01);
  }

  private playClick() {
    this.playTone(520, 0.05, "sine", 0.12);
  }

  private playCorrect() {
    this.playTone(523, 0.1, "sine", 0.22, 0);
    this.playTone(659, 0.1, "sine", 0.22, 0.1);
  }

  private playWrong() {
    this.playTone(220, 0.12, "square", 0.15, 0);
    this.playTone(180, 0.14, "square", 0.1, 0.12);
  }

  private playWin() {
    [262, 330, 392, 523].forEach((freq, index) => this.playTone(freq, 0.18, "sine", 0.24, index * 0.11));
  }
}
