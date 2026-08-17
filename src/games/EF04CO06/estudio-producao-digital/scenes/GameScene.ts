import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type { StudioProductionLevel, StudioLevelNumber, FormatType } from "../types";

const GAME_ID = "estudio-de-producao-digital";

// ── Layout constants ────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;

// Stage bar (inside panel, near top)
const STAGE_BAR_Y = PANEL_Y + 6;   // 148
const STAGE_BAR_H = 34;
const STAGE_COUNT = 4;
const STAGE_GAP = 10;
// 4 stages + 3 gaps = PANEL_W - 38; w = (1098 - 30) / 4 = 267
const STAGE_W = 267;
const STAGE_START_X = PANEL_X + 19; // 91

// Content starts below stage bar
const CONTENT_Y = STAGE_BAR_Y + STAGE_BAR_H + 10; // 192

const MODAL_SCALE = 1.12;

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
  purple:      0x7c3aed,
  lightPurple: 0xa78bfa,
  darkPurple:  0x4c1d95,
  deepPurple:  0x2e1065,
  amber:       0xfbbf24,
  darkAmber:   0xd97706,
  warmAmber:   0xf59e0b,
  green:       0x16a34a,
  darkGreen:   0x14532d,
  red:         0xdc2626,
  blue:        0x2563eb,
  darkBlue:    0x1e40af,
  darkRed:     0x991b1b,
  white:       0xffffff,
  gray:        0x64748b,
  lightGray:   0x94a3b8,
  slate:       0x334155,
  ink:         0x0f0820,
  darkPanel:   0x1a0a40,
  midPanel:    0x2d1b5e,
  cream:       0xfaf5ff,
  teal:        0x0d9488,
  orange:      0xf97316,
};

// ── Format card data ─────────────────────────────────────────────────────────
const FORMAT_DATA: Record<FormatType, { emoji: string; label: string; color: number; borderColor: number }> = {
  text:   { emoji: "📄", label: "Texto",          color: 0x4c1d95, borderColor: 0xa78bfa },
  slides: { emoji: "🎞️", label: "Apresentação",   color: 0x1e3a8a, borderColor: 0x60a5fa },
  video:  { emoji: "🎬", label: "Vídeo",          color: 0x7f1d1d, borderColor: 0xf87171 },
};

const FORMAT_ORDER: FormatType[] = ["text", "slides", "video"];

// ── Stage metadata ───────────────────────────────────────────────────────────
const STAGE_META = [
  { emoji: "📋", word: "Planejamento" },
  { emoji: "✏️", word: "Produção" },
  { emoji: "🔍", word: "Revisão" },
  { emoji: "🚀", word: "Publicação" },
];

export class GameScene extends Phaser.Scene {
  private levelConfig!: StudioProductionLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects:     Phaser.GameObjects.GameObject[] = [];
  private contentObjects:     Phaser.GameObjects.GameObject[] = [];
  private stageBarObjects:    Phaser.GameObjects.GameObject[] = [];

  // Stage completion state
  private completedStages: boolean[] = [false, false, false, false];

  // N1 state
  private n1BriefingIndex = 0;
  private n1CardBgGraphics: Phaser.GameObjects.Graphics[] = [];
  private n1CardBounds: Array<{ x: number; y: number; w: number; h: number }> = [];

  // N2 state
  private n2TaskIndex = 0;
  private n2NextExpectedIndex = 0;
  private n2SelectedSet = new Set<number>();
  private n2CardContainers: Phaser.GameObjects.Container[] = [];
  private n2CardBgGraphics: Phaser.GameObjects.Graphics[] = [];
  private n2CardBounds: Array<{ x: number; y: number; w: number; h: number }> = [];
  private n2OrderTexts: Phaser.GameObjects.Text[] = [];

  // N3 state
  private n3ProductionIndex = 0;
  private n3SelectedErrors = new Set<number>();
  private n3ItemContainers: Phaser.GameObjects.Container[] = [];
  private n3ItemBgGraphics: Phaser.GameObjects.Graphics[] = [];
  private n3PublishObjects: Phaser.GameObjects.GameObject[] = [];
  private n3ProductionCardContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "GameScene" });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as StudioLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits   = data?.hits   ?? 0;
    this.errors = data?.errors ?? 0;

    // Derive completed stages from current level
    this.completedStages = [false, false, false, false];
    if (level >= 2) this.completedStages[0] = true;
    if (level >= 3) this.completedStages[1] = true;

    // Reset all state arrays
    this.startScreenObjects = [];
    this.overlayObjects     = [];
    this.contentObjects     = [];
    this.stageBarObjects    = [];

    this.n1BriefingIndex  = 0;
    this.n1CardBgGraphics = [];
    this.n1CardBounds     = [];

    this.n2TaskIndex          = 0;
    this.n2NextExpectedIndex  = 0;
    this.n2SelectedSet        = new Set();
    this.n2CardContainers     = [];
    this.n2CardBgGraphics     = [];
    this.n2CardBounds         = [];
    this.n2OrderTexts         = [];

    this.n3ProductionIndex       = 0;
    this.n3SelectedErrors        = new Set();
    this.n3ItemContainers        = [];
    this.n3ItemBgGraphics        = [];
    this.n3PublishObjects        = [];
    this.n3ProductionCardContainer = undefined;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
    this.showStartScreen();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(0, this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? C.green : pct > 0.25 ? C.amber : C.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
    EventBus.removeAllListeners();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Background
  // ─────────────────────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-studio-planning"
      : this.levelConfig.level === 2 ? "bg-studio-production"
      : "bg-studio-review";

    // If the texture is valid (> 1×1), display it; otherwise skip (placeholder 1×1 PNGs are fine to display)
    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);

    // Dark overlay for readability
    this.add.rectangle(640, 360, 1280, 720, 0x0f0820, 0.72).setDepth(-89);

    // Gradient-like tint strips
    const tint = this.add.graphics().setDepth(-88);
    tint.fillStyle(C.purple, 0.08);
    tint.fillRect(0, 0, 1280, 360);
    tint.fillStyle(C.deepPurple, 0.06);
    tint.fillRect(0, 360, 1280, 360);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Timer Bar
  // ─────────────────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(C.slate, 0.25);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);

    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, C.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    if (width <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, Math.max(0, width), 32, 16);
  }

  private startTimer() {
    this.timerEvent = this.time.delayedCall(
      this.levelConfig.timeLimit * 1000,
      () => this.onTimeUp(),
    );
  }

  private onTimeUp() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.input.enabled = false;
    this.errors += 1;
    this.playWrong();
    runtimeGameBridge.emit({
      type: "WRONG_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: -5,
    });
    this.time.delayedCall(300, () => this.showGameOverScreen());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Start Screen
  // ─────────────────────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, C.ink, 0.72).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -218, 616, 436, 34);

    const bg = this.add.graphics();
    bg.fillStyle(C.cream, 0.97);
    bg.fillRoundedRect(-320, -230, 640, 440, 34);
    bg.lineStyle(6, C.purple, 0.9);
    bg.strokeRoundedRect(-320, -230, 640, 440, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.purple, 1);
    topBar.fillRoundedRect(-240, -248, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -231, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#faf5ff",
      stroke: "#4c1d95", strokeThickness: 3,
    }).setOrigin(0.5);

    const emojiMap: Record<StudioLevelNumber, string> = { 1: "📋", 2: "✏️", 3: "🔍" };
    const titleEmoji = emojiMap[this.levelConfig.level];

    const title = this.addSharpText(0, -158, `${titleEmoji} ${this.levelConfig.title}`, {
      fontSize: "36px", fontFamily: "Arial Black, Arial", color: "#7c3aed",
      stroke: "#faf5ff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -84, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      align: "center", wordWrap: { width: 564 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, -12, this.levelConfig.detail, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#475569",
      align: "center", wordWrap: { width: 548 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(C.amber, 0.18);
    tipBg.fillRoundedRect(-256, 48, 512, 52, 14);

    const tip = this.addSharpText(0, 74, `💡 ${this.levelConfig.tip}`, {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#78350f",
      align: "center", wordWrap: { width: 484 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(C.purple, 1);
    btnBg.fillRoundedRect(-128, 122, 256, 56, 28);
    btnBg.lineStyle(4, C.amber, 1);
    btnBg.strokeRoundedRect(-128, 122, 256, 56, 28);

    const btnText = this.addSharpText(0, 150, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#4c1d95", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, lvlLabel, title, obj, detail, tipBg, tip, btnBg, btnText]);
    panel.setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 150 * MODAL_SCALE, 272 * MODAL_SCALE, 68 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);

    hz.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: panel, scale: MODAL_SCALE * 1.03, duration: 80 });
    });
    hz.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: panel, scale: MODAL_SCALE, duration: 80 });
    });
    hz.on("pointerdown", () => {
      this.playClick();
      this.startScreenObjects.forEach((o) => o.destroy());
      this.startScreenObjects = [];
      this.input.setDefaultCursor("default");
      runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
      this.startTimer();
      this.buildLevelUI();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Level UI
  // ─────────────────────────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    this.createProductionStageBar();

    if (this.levelConfig.level === 1) {
      this.showN1Briefing();
    } else if (this.levelConfig.level === 2) {
      this.showN2Task();
    } else {
      this.showN3Production();
    }
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#c4b5fd",
      stroke: "#4c1d95", strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(C.white, 0.84);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(C.purple, 0.1);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, C.purple, 0.65);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      stroke: "#ffffff", strokeThickness: 3, align: "center",
      wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      backgroundColor: "rgba(250,245,255,0.88)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(6);
  }

  // ─── Panel background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(C.ink, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(C.midPanel, 0.45);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(C.white, 0.06);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 14, PANEL_W - 40, 48, 22);
    panel.lineStyle(5, C.purple, 0.5);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Production Stage Bar
  // ─────────────────────────────────────────────────────────────────────────

  private getStageStatus(i: number): "completed" | "active" | "inactive" {
    if (this.completedStages[i]) return "completed";
    const lv = this.levelConfig.level;
    if (lv === 1 && i === 0) return "active";
    if (lv === 2 && i === 1) return "active";
    if (lv === 3 && (i === 2 || i === 3)) return "active";
    return "inactive";
  }

  private createProductionStageBar() {
    this.stageBarObjects.forEach((o) => o.destroy());
    this.stageBarObjects = [];

    for (let i = 0; i < STAGE_COUNT; i++) {
      const stageX = STAGE_START_X + i * (STAGE_W + STAGE_GAP);
      const status = this.getStageStatus(i);

      const bg = this.add.graphics().setDepth(10);
      this.stageBarObjects.push(bg);

      if (status === "completed") {
        bg.fillStyle(C.amber, 1);
        bg.fillRoundedRect(stageX, STAGE_BAR_Y, STAGE_W, STAGE_BAR_H, 8);
        bg.lineStyle(3, C.darkAmber, 1);
        bg.strokeRoundedRect(stageX, STAGE_BAR_Y, STAGE_W, STAGE_BAR_H, 8);
      } else if (status === "active") {
        bg.fillStyle(C.purple, 0.85);
        bg.fillRoundedRect(stageX, STAGE_BAR_Y, STAGE_W, STAGE_BAR_H, 8);
        bg.lineStyle(3, C.lightPurple, 1);
        bg.strokeRoundedRect(stageX, STAGE_BAR_Y, STAGE_W, STAGE_BAR_H, 8);
      } else {
        bg.fillStyle(C.slate, 0.4);
        bg.fillRoundedRect(stageX, STAGE_BAR_Y, STAGE_W, STAGE_BAR_H, 8);
      }

      const textColor =
        status === "completed" ? "#1a0a00"
        : status === "active"  ? "#f0e6ff"
        : "#64748b";

      // Render emoji and word as SEPARATE objects so bounding-box differences between
      // emoji characters don't shift the vertical center of each pill independently.
      const textY = STAGE_BAR_Y + STAGE_BAR_H / 2;
      const stageEmoji = this.addSharpText(stageX + 14, textY, STAGE_META[i].emoji, {
        fontSize: "14px", fontFamily: "Arial Black, Arial",
      }).setOrigin(0, 0.5).setDepth(11);
      this.stageBarObjects.push(stageEmoji);

      const stageTxt = this.addSharpText(stageX + 38, textY, STAGE_META[i].word, {
        fontSize: "13px", fontFamily: "Arial Black, Arial", color: textColor,
      }).setOrigin(0, 0.5).setDepth(11);
      this.stageBarObjects.push(stageTxt);

      // Arrow connector (except last)
      if (i < STAGE_COUNT - 1) {
        const arrowX = stageX + STAGE_W + 1;
        const arrowG = this.add.graphics().setDepth(11);
        this.stageBarObjects.push(arrowG);
        const arrowColor = status === "completed" ? C.amber : C.slate;
        arrowG.fillStyle(arrowColor, 0.7);
        arrowG.fillTriangle(
          arrowX, STAGE_BAR_Y + 5,
          arrowX, STAGE_BAR_Y + STAGE_BAR_H - 5,
          arrowX + 9, STAGE_BAR_Y + STAGE_BAR_H / 2,
        );
      }
    }
  }

  private markStageComplete(stageIndex: number) {
    if (this.completedStages[stageIndex]) return;
    this.completedStages[stageIndex] = true;
    this.createProductionStageBar();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Content helpers
  // ─────────────────────────────────────────────────────────────────────────

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
    this.n1CardBgGraphics = [];
    this.n1CardBounds     = [];
    this.n2CardContainers = [];
    this.n2CardBgGraphics = [];
    this.n2CardBounds     = [];
    this.n2OrderTexts     = [];
    this.n3ItemContainers = [];
    this.n3ItemBgGraphics = [];
    this.n3PublishObjects = [];
    this.n3ProductionCardContainer = undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // N1 — Escolha o Formato
  // ─────────────────────────────────────────────────────────────────────────

  private showN1Briefing() {
    this.clearContent();
    this.n2SelectedSet = new Set();
    this.n2NextExpectedIndex = 0;

    const briefings = this.levelConfig.n1Briefings ?? [];
    if (this.n1BriefingIndex >= briefings.length) {
      this.completeLevel();
      return;
    }

    const briefing = briefings[this.n1BriefingIndex];

    // ── Progress dots ──────────────────────────────────────────────────────
    const dotCont = this.addContent(this.add.container(640, CONTENT_Y + 16).setDepth(12));
    const totalDots = briefings.length;
    const dotSpacing = 24;
    const dotsStartX = -(totalDots - 1) * dotSpacing / 2;
    briefings.forEach((_, i) => {
      const dot = this.add.graphics();
      const color = i < this.n1BriefingIndex ? C.green
        : i === this.n1BriefingIndex ? C.amber
        : C.gray;
      dot.fillStyle(color, 1);
      dot.fillCircle(dotsStartX + i * dotSpacing, 0, 7);
      dot.lineStyle(2, C.white, 0.6);
      dot.strokeCircle(dotsStartX + i * dotSpacing, 0, 7);
      dotCont.add(dot);
    });

    // ── Briefing card ──────────────────────────────────────────────────────
    const cardX = PANEL_X + 20;
    const cardY = CONTENT_Y + 36;
    const cardW = PANEL_W - 40;
    const cardH = 88;

    const briefBg = this.addContent(this.add.graphics().setDepth(12));
    briefBg.fillStyle(C.darkPurple, 0.95);
    briefBg.fillRoundedRect(cardX, cardY, cardW, cardH, 18);
    briefBg.lineStyle(4, C.amber, 0.9);
    briefBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);

    this.addContent(this.addSharpText(cardX + 14, cardY + 10, "📋 Projeto:", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
    }).setDepth(13));

    this.addContent(this.addSharpText(cardX + cardW / 2, cardY + 52, briefing.text, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0e6ff",
      align: "center", wordWrap: { width: cardW - 32 },
      stroke: "#2e1065", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(13));

    // ── Question label ─────────────────────────────────────────────────────
    this.addContent(this.addSharpText(640, cardY + cardH + 20, "Qual formato é mais adequado?", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#c4b5fd",
      stroke: "#2e1065", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    // ── Format cards ───────────────────────────────────────────────────────
    const CARD_W = 220;
    const CARD_H = 220;
    const CARD_GAP = 60;
    const totalCardsW = 3 * CARD_W + 2 * CARD_GAP;
    const cardsStartX = PANEL_X + (PANEL_W - totalCardsW) / 2;
    const cardsY = cardY + cardH + 56;

    FORMAT_ORDER.forEach((format, i) => {
      const meta = FORMAT_DATA[format];
      const cx = cardsStartX + i * (CARD_W + CARD_GAP);
      const cy = cardsY;

      const cardBg = this.addContent(this.add.graphics().setDepth(12));
      this.n1CardBgGraphics.push(cardBg);
      this.n1CardBounds.push({ x: cx, y: cy, w: CARD_W, h: CARD_H });
      this.drawN1FormatCard(cardBg, cx, cy, CARD_W, CARD_H, meta.color, meta.borderColor, false);

      this.addContent(this.addSharpText(cx + CARD_W / 2, cy + 62, meta.emoji, {
        fontSize: "56px", fontFamily: "Arial Black, Arial",
      }).setOrigin(0.5).setDepth(13));

      this.addContent(this.addSharpText(cx + CARD_W / 2, cy + CARD_H - 44, meta.label, {
        fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0e6ff",
        stroke: "#1e0b3e", strokeThickness: 3, align: "center",
      }).setOrigin(0.5).setDepth(13));

      const zone = this.addContent(
        this.add.zone(cx + CARD_W / 2, cy + CARD_H / 2, CARD_W, CARD_H).setDepth(55),
      );
      zone.setInteractive({ useHandCursor: true });

      const cardIndex = i;
      zone.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        if (!this.gameEnded) {
          this.drawN1FormatCard(this.n1CardBgGraphics[cardIndex], cx, cy, CARD_W, CARD_H, meta.color, meta.borderColor, true);
        }
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        this.drawN1FormatCard(this.n1CardBgGraphics[cardIndex], cx, cy, CARD_W, CARD_H, meta.color, meta.borderColor, false);
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.handleN1FormatPick(format, briefing.correct, cardIndex, cx, cy, CARD_W, CARD_H, meta.color, meta.borderColor);
      });
    });
  }

  private drawN1FormatCard(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    fillColor: number, borderColor: number, hovered: boolean,
  ) {
    g.clear();
    g.fillStyle(fillColor, hovered ? 0.95 : 0.8);
    g.fillRoundedRect(x, y, w, h, 18);
    g.lineStyle(hovered ? 5 : 3, borderColor, 1);
    g.strokeRoundedRect(x, y, w, h, 18);
    if (hovered) {
      g.fillStyle(C.white, 0.06);
      g.fillRoundedRect(x + 4, y + 4, w - 8, h / 3, 14);
    }
  }

  private handleN1FormatPick(
    chosen: FormatType, correct: FormatType,
    cardIndex: number, cx: number, cy: number, cw: number, ch: number,
    fillColor: number, borderColor: number,
  ) {
    this.playClick();
    if (chosen === correct) {
      this.hits += 1;
      this.playSuccess();
      // Flash card green
      const g = this.n1CardBgGraphics[cardIndex];
      g.clear();
      g.fillStyle(C.green, 0.9);
      g.fillRoundedRect(cx, cy, cw, ch, 18);
      g.lineStyle(5, 0x86efac, 1);
      g.strokeRoundedRect(cx, cy, cw, ch, 18);

      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: 1,
        pointsEarned: 20,
      });
      // Light "Planejamento" stage
      this.markStageComplete(0);

      this.showToast("✅ Formato correto! Muito bem!", C.green, 1200);
      this.time.delayedCall(1300, () => {
        if (this.gameEnded) return;
        this.n1BriefingIndex += 1;
        this.showN1Briefing();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      // Flash card red
      const g = this.n1CardBgGraphics[cardIndex];
      const originalFill = fillColor;
      g.clear();
      g.fillStyle(C.red, 0.85);
      g.fillRoundedRect(cx, cy, cw, ch, 18);
      g.lineStyle(5, 0xfca5a5, 1);
      g.strokeRoundedRect(cx, cy, cw, ch, 18);
      this.time.delayedCall(600, () => {
        if (!g.active) return;
        this.drawN1FormatCard(g, cx, cy, cw, ch, originalFill, borderColor, false);
      });

      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: 1,
        pointsEarned: -5,
      });
      this.showToast("❌ Formato errado! Pense: que tipo de produção é mais adequado?", C.red, 2000);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // N2 — Produza o Conteúdo
  // ─────────────────────────────────────────────────────────────────────────

  private showN2Task() {
    this.clearContent();
    this.n2SelectedSet        = new Set();
    this.n2NextExpectedIndex  = 0;
    this.n2CardContainers     = [];
    this.n2CardBgGraphics     = [];
    this.n2CardBounds         = [];
    this.n2OrderTexts         = [];

    const tasks = this.levelConfig.n2Tasks ?? [];
    if (this.n2TaskIndex >= tasks.length) {
      this.completeLevel();
      return;
    }

    const task = tasks[this.n2TaskIndex];
    const meta = FORMAT_DATA[task.format];

    // ── Task header ────────────────────────────────────────────────────────
    const headerBg = this.addContent(this.add.graphics().setDepth(12));
    headerBg.fillStyle(C.darkPurple, 0.88);
    headerBg.fillRoundedRect(PANEL_X + 20, CONTENT_Y, PANEL_W - 40, 50, 14);
    headerBg.lineStyle(3, C.lightPurple, 0.6);
    headerBg.strokeRoundedRect(PANEL_X + 20, CONTENT_Y, PANEL_W - 40, 50, 14);

    const taskLabel = this.getN2TaskLabel(task.format);
    this.addContent(this.addSharpText(640, CONTENT_Y + 26, `${meta.emoji} ${taskLabel}`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0e6ff",
      align: "center", stroke: "#2e1065", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(13));

    // Progress dots
    const dotCont = this.addContent(this.add.container(640, CONTENT_Y + 72).setDepth(12));
    tasks.forEach((_, i) => {
      const dot = this.add.graphics();
      const col = i < this.n2TaskIndex ? C.green : i === this.n2TaskIndex ? C.amber : C.gray;
      dot.fillStyle(col, 1);
      dot.fillCircle(-24 + i * 24, 0, 7);
      dot.lineStyle(2, C.white, 0.6);
      dot.strokeCircle(-24 + i * 24, 0, 7);
      dotCont.add(dot);
    });

    // Instruction
    this.addContent(this.addSharpText(640, CONTENT_Y + 96, "Toque nos itens na ordem correta (1 → 2 → 3):", {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#c4b5fd",
    }).setOrigin(0.5).setDepth(12));

    // ── Ordering cards ─────────────────────────────────────────────────────
    const CARD_W = 1060;
    const CARD_H = 92;
    const CARD_GAP = 12;
    const cardX = 640 - CARD_W / 2;
    const cardsStartY = CONTENT_Y + 122;

    task.items.forEach((itemText, i) => {
      const cy = cardsStartY + i * (CARD_H + CARD_GAP);
      const cx = cardX + CARD_W / 2;

      const container = this.addContent(
        this.add.container(cx, cy + CARD_H / 2).setDepth(12),
      ) as Phaser.GameObjects.Container;
      this.n2CardContainers.push(container);
      this.n2CardBounds.push({ x: cardX, y: cy, w: CARD_W, h: CARD_H });

      const bg = this.add.graphics();
      this.drawN2CardBg(bg, CARD_W, CARD_H, false, 0);
      this.n2CardBgGraphics.push(bg);

      const txt = this.addSharpText(20 - CARD_W / 2, 0, itemText, {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#e2d9f3",
        wordWrap: { width: CARD_W - 80 },
      }).setOrigin(0, 0.5).setDepth(1);

      const orderTxt = this.addSharpText(CARD_W / 2 - 28, 0, "", {
        fontSize: "28px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
        stroke: "#1a0a00", strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2).setVisible(false);
      this.n2OrderTexts.push(orderTxt);

      container.add([bg, txt, orderTxt]);

      const zone = this.addContent(
        this.add.zone(cx, cy + CARD_H / 2, CARD_W, CARD_H).setDepth(55),
      );
      zone.setInteractive({ useHandCursor: true });
      const cardIndex = i;
      zone.on("pointerover", () => {
        if (!this.gameEnded && !this.n2SelectedSet.has(cardIndex)) {
          this.input.setDefaultCursor("pointer");
          const bg2 = this.n2CardBgGraphics[cardIndex];
          bg2.clear();
          this.drawN2CardBg(bg2, CARD_W, CARD_H, false, 0, true);
        }
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        if (!this.n2SelectedSet.has(cardIndex)) {
          const bg2 = this.n2CardBgGraphics[cardIndex];
          bg2.clear();
          this.drawN2CardBg(bg2, CARD_W, CARD_H, false, 0, false);
        }
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        if (this.n2SelectedSet.has(cardIndex)) return;
        this.handleN2CardTap(cardIndex, task.correctOrder);
      });
    });
  }

  private getN2TaskLabel(format: FormatType): string {
    if (format === "text")   return "Ordene os parágrafos na sequência certa";
    if (format === "slides") return "Coloque os slides na ordem da apresentação";
    return "Ordene os clipes do roteiro";
  }

  private drawN2CardBg(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number,
    selected: boolean, orderNum: number,
    hovered = false,
  ) {
    g.clear();
    const hw = w / 2;
    const hh = h / 2;
    if (selected) {
      g.fillStyle(C.green, 0.9);
      g.fillRoundedRect(-hw, -hh, w, h, 14);
      g.lineStyle(4, 0x86efac, 1);
      g.strokeRoundedRect(-hw, -hh, w, h, 14);
      // Order badge circle
      g.fillStyle(C.amber, 1);
      g.fillCircle(hw - 28, 0, 22);
    } else if (hovered) {
      g.fillStyle(C.midPanel, 0.95);
      g.fillRoundedRect(-hw, -hh, w, h, 14);
      g.lineStyle(4, C.lightPurple, 0.9);
      g.strokeRoundedRect(-hw, -hh, w, h, 14);
    } else {
      g.fillStyle(C.darkPanel, 0.9);
      g.fillRoundedRect(-hw, -hh, w, h, 14);
      g.lineStyle(3, C.purple, 0.5);
      g.strokeRoundedRect(-hw, -hh, w, h, 14);
    }
    void orderNum; // used via n2OrderTexts
  }

  private handleN2CardTap(tappedIndex: number, correctOrder: number[]) {
    this.playClick();

    if (correctOrder[this.n2NextExpectedIndex] === tappedIndex) {
      // Correct tap
      this.n2SelectedSet.add(tappedIndex);
      const order = this.n2NextExpectedIndex;
      this.n2NextExpectedIndex += 1;

      // Update card visuals
      const bg = this.n2CardBgGraphics[tappedIndex];
      bg.clear();
      this.drawN2CardBg(bg, 1060, 92, true, order + 1);

      // Show order number
      const ot = this.n2OrderTexts[tappedIndex];
      ot.setText(String(order + 1)).setVisible(true);

      // Scale pop animation on container
      const cont = this.n2CardContainers[tappedIndex];
      this.tweens.add({ targets: cont, scaleX: 1.03, scaleY: 1.03, duration: 80, yoyo: true });

      this.playTone(660 + order * 110, 0.08, "triangle", 0.06);

      if (this.n2NextExpectedIndex >= correctOrder.length) {
        // Task complete
        this.playSuccess();
        runtimeGameBridge.emit({
          type: "CORRECT_ANSWER",
          gameId: GAME_ID,
          stage: 2,
          pointsEarned: 20,
        });
        this.showToast("✅ Sequência correta! Ótimo trabalho!", C.green, 1200);
        this.time.delayedCall(1300, () => {
          if (this.gameEnded) return;
          this.n2TaskIndex += 1;
          this.showN2Task();
        });
      }
    } else {
      // Wrong order — shake container
      const cont = this.n2CardContainers[tappedIndex];
      const origX = cont.x;
      this.tweens.add({
        targets: cont,
        x: [origX - 8, origX + 8, origX - 6, origX + 6, origX],
        duration: 300,
        ease: "Linear",
        onComplete: () => { cont.x = origX; },
      });
      this.playTone(220, 0.05, "sine", 0.04);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // N3 — Revisão e Publicação
  // ─────────────────────────────────────────────────────────────────────────

  private showN3Production() {
    this.clearContent();
    this.n3SelectedErrors = new Set();
    this.n3ItemContainers = [];
    this.n3ItemBgGraphics = [];
    this.n3PublishObjects = [];

    const productions = this.levelConfig.n3Productions ?? [];
    if (this.n3ProductionIndex >= productions.length) {
      this.completeFinalLevel();
      return;
    }

    const prod = productions[this.n3ProductionIndex];

    // ── Production header ──────────────────────────────────────────────────
    const hdrBg = this.addContent(this.add.graphics().setDepth(12));
    hdrBg.fillStyle(C.darkPurple, 0.92);
    hdrBg.fillRoundedRect(PANEL_X + 20, CONTENT_Y, PANEL_W - 40, 54, 14);
    hdrBg.lineStyle(3, C.amber, 0.7);
    hdrBg.strokeRoundedRect(PANEL_X + 20, CONTENT_Y, PANEL_W - 40, 54, 14);

    const prodMeta = FORMAT_DATA[prod.type];
    const prodNum = this.n3ProductionIndex + 1;
    this.addContent(this.addSharpText(640, CONTENT_Y + 28, `${prodMeta.emoji} Produção ${prodNum}/2 — ${prod.type === "text" ? "Texto" : "Slides"}`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      align: "center", stroke: "#1a0a00", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(13));

    // ── Instruction ─────────────────────────────────────────────────────────
    this.addContent(this.addSharpText(640, CONTENT_Y + 72, `🔍 Toque nos 2 itens marcados com ❌ para corrigi-los:`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#c4b5fd",
      stroke: "#0f0820", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(12));

    // ── Production items ───────────────────────────────────────────────────
    const ITEM_W = 1060;
    const ITEM_H = 68;
    const ITEM_GAP = 8;
    const itemX = 640 - ITEM_W / 2;
    const itemsStartY = CONTENT_Y + 100;

    prod.items.forEach((itemText, i) => {
      const iy = itemsStartY + i * (ITEM_H + ITEM_GAP);
      const icx = 640;
      const icy = iy + ITEM_H / 2;

      const isError = prod.errors.includes(i);

      const container = this.addContent(
        this.add.container(icx, icy).setDepth(12),
      ) as Phaser.GameObjects.Container;
      this.n3ItemContainers.push(container);

      const bg = this.add.graphics();
      this.drawN3ItemBg(bg, ITEM_W, ITEM_H, "normal", isError);
      this.n3ItemBgGraphics.push(bg);

      const txt = this.addSharpText(-ITEM_W / 2 + 16, 0, itemText, {
        fontSize: "17px", fontFamily: "Arial Black, Arial",
        color: isError ? "#fde68a" : "#e2d9f3",
        wordWrap: { width: ITEM_W - 40 },
      }).setOrigin(0, 0.5).setDepth(1);

      container.add([bg, txt]);

      if (isError) {
        // Make item interactive
        const zone = this.addContent(
          this.add.zone(icx, icy, ITEM_W, ITEM_H).setDepth(55),
        );
        zone.setInteractive({ useHandCursor: true });
        const idx = i;
        zone.on("pointerover", () => {
          if (!this.gameEnded && !this.n3SelectedErrors.has(idx)) {
            this.input.setDefaultCursor("pointer");
          }
        });
        zone.on("pointerout", () => { this.input.setDefaultCursor("default"); });
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          if (this.n3SelectedErrors.has(idx)) return;
          this.handleN3ItemTap(idx, prod.errors, ITEM_W, ITEM_H);
        });
      } else {
        // Non-error items: tappable but give shake feedback
        const zone = this.addContent(
          this.add.zone(icx, icy, ITEM_W, ITEM_H).setDepth(55),
        );
        zone.setInteractive({ useHandCursor: true });
        const idx = i;
        zone.on("pointerover", () => {
          if (!this.gameEnded) this.input.setDefaultCursor("pointer");
        });
        zone.on("pointerout", () => { this.input.setDefaultCursor("default"); });
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          // Wrong item — shake
          const cont = this.n3ItemContainers[idx];
          const origX = cont.x;
          this.tweens.add({
            targets: cont,
            x: [origX - 6, origX + 6, origX - 4, origX + 4, origX],
            duration: 280,
            ease: "Linear",
            onComplete: () => { cont.x = origX; },
          });
          this.playTone(200, 0.05, "square", 0.04);
          this.showToast("💡 Este item está correto! Procure os marcados com ❌", C.amber, 1400);
        });
      }
    });

    // Selection counter
    this.addContent(this.addSharpText(PANEL_X + 32, PANEL_Y + PANEL_H - 26, "", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#a78bfa",
    }).setDepth(12).setName("n3Counter"));
    this.updateN3Counter(prod.errors.length);
  }

  private drawN3ItemBg(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number,
    state: "normal" | "selected" | "correct",
    isError: boolean,
  ) {
    g.clear();
    const hw = w / 2;
    const hh = h / 2;
    if (state === "selected") {
      g.fillStyle(C.warmAmber, 0.85);
      g.fillRoundedRect(-hw, -hh, w, h, 12);
      g.lineStyle(4, C.amber, 1);
      g.strokeRoundedRect(-hw, -hh, w, h, 12);
    } else if (state === "correct") {
      g.fillStyle(C.green, 0.85);
      g.fillRoundedRect(-hw, -hh, w, h, 12);
      g.lineStyle(4, 0x86efac, 1);
      g.strokeRoundedRect(-hw, -hh, w, h, 12);
    } else {
      if (isError) {
        g.fillStyle(0x44101a, 0.92);
        g.fillRoundedRect(-hw, -hh, w, h, 12);
        g.lineStyle(3, 0xfca5a5, 0.6);
        g.strokeRoundedRect(-hw, -hh, w, h, 12);
      } else {
        g.fillStyle(C.darkPanel, 0.88);
        g.fillRoundedRect(-hw, -hh, w, h, 12);
        g.lineStyle(3, C.purple, 0.35);
        g.strokeRoundedRect(-hw, -hh, w, h, 12);
      }
    }
  }

  private updateN3Counter(totalErrors: number) {
    const counter = this.children.getByName("n3Counter") as Phaser.GameObjects.Text | null;
    if (counter) {
      counter.setText(`Erros encontrados: ${this.n3SelectedErrors.size} / ${totalErrors}`);
    }
  }

  private handleN3ItemTap(index: number, errorIndices: number[], itemW: number, itemH: number) {
    this.playClick();
    this.n3SelectedErrors.add(index);

    // Animate: amber selection flash then green
    const cont = this.n3ItemContainers[index];
    const bg = this.n3ItemBgGraphics[index];
    bg.clear();
    this.drawN3ItemBg(bg, itemW, itemH, "selected", true);
    this.tweens.add({
      targets: cont, scaleX: 1.04, scaleY: 1.04, duration: 80, yoyo: true,
      onComplete: () => {
        if (!bg.active) return;
        bg.clear();
        this.drawN3ItemBg(bg, itemW, itemH, "correct", true);
      },
    });
    this.playTone(550, 0.07, "triangle", 0.05);

    this.updateN3Counter(errorIndices.length);

    // Check if all errors found
    const allFound = errorIndices.every((ei) => this.n3SelectedErrors.has(ei));
    if (allFound) {
      this.time.delayedCall(400, () => {
        if (this.gameEnded) return;
        this.showN3PublishButton(errorIndices);
      });
    }
  }

  private showN3PublishButton(errorIndices: number[]) {
    const btnX = 640;
    const btnY = PANEL_Y + PANEL_H - 50;
    const btnW = 500;
    const btnH = 60;

    const btnBg = this.addContent(this.add.graphics().setDepth(14));
    this.n3PublishObjects.push(btnBg);
    btnBg.fillStyle(C.purple, 1);
    btnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 30);
    btnBg.lineStyle(5, C.amber, 1);
    btnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 30);

    const btnTxt = this.addContent(this.addSharpText(btnX, btnY, "✓ Corrigir e Publicar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#2e1065", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(15));
    this.n3PublishObjects.push(btnTxt);

    // Entrance animation
    btnBg.setAlpha(0);
    btnTxt.setAlpha(0);
    this.tweens.add({ targets: [btnBg, btnTxt], alpha: 1, duration: 300, ease: "Power2" });

    const zone = this.addContent(
      this.add.zone(btnX, btnY, btnW, btnH).setDepth(65),
    );
    this.n3PublishObjects.push(zone);
    zone.setInteractive({ useHandCursor: true });

    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.04, scaleY: 1.04, duration: 80 });
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 80 });
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.playSuccess();
      zone.destroy();

      // Publish animation: error items fly up
      const prod = (this.levelConfig.n3Productions ?? [])[this.n3ProductionIndex];
      prod.errors.forEach((ei) => {
        const cont = this.n3ItemContainers[ei];
        if (cont) {
          this.tweens.add({ targets: cont, y: cont.y - 200, alpha: 0, duration: 600, ease: "Power2" });
        }
      });

      // Confetti burst
      for (let p = 0; p < 12; p++) {
        const px = Phaser.Math.Between(300, 980);
        const py = Phaser.Math.Between(200, 500);
        const pc = [C.amber, C.purple, C.teal, C.green, 0xf9a8d4][p % 5];
        const conf = this.add.graphics().setDepth(100);
        conf.fillStyle(pc, 0.9);
        conf.fillRoundedRect(px - 8, py - 4, 16, 8, 4);
        this.tweens.add({ targets: conf, alpha: 0, y: py + 80, duration: 700, delay: p * 50, onComplete: () => conf.destroy() });
      }

      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: 3,
        pointsEarned: 25,
      });

      // Mark stages
      this.markStageComplete(2); // Revisão
      if (this.n3ProductionIndex === 1) {
        this.markStageComplete(3); // Publicação
      }

      runtimeGameBridge.emit({
        type: "CHECKPOINT",
        gameId: GAME_ID,
        stage: 3,
        progress: (this.n3ProductionIndex + 1) / 2,
        score: this.getScore(),
        hits: this.hits,
        errors: this.errors,
      });

      this.hits += 1;
      this.showToast("🚀 Publicado com sucesso! Excelente revisão!", C.purple, 1400);

      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n3ProductionIndex += 1;
        this.showN3Production();
      });
    });
    void errorIndices;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Level Completion
  // ─────────────────────────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();

    const nextLevel = (this.levelConfig.level + 1) as StudioLevelNumber;
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      stage: nextLevel,
      progress: this.levelConfig.level / 3,
      score: this.getScore(),
      hits: this.hits,
      errors: this.errors,
    });
    this.time.delayedCall(400, () => this.showLevelCompleteScreen(nextLevel));
  }

  private completeFinalLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: 3 });
    this.time.delayedCall(400, () => this.showFinalCompleteScreen());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flow Screens
  // ─────────────────────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: StudioLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.66).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-286, -186, 572, 372, 32);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-298, -198, 596, 376, 32);
    panelBg.lineStyle(6, C.purple, 0.9);
    panelBg.strokeRoundedRect(-298, -198, 596, 376, 32);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.purple, 1);
    topBar.fillRoundedRect(-210, -214, 420, 28, 14);

    const stars = this.addSharpText(0, -140, "⭐⭐", {
      fontSize: "52px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 600, yoyo: true, repeat: 2 });

    const title = this.addSharpText(0, -72, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#7c3aed",
      stroke: "#faf5ff", strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.addSharpText(0, -16, `Nível ${this.levelConfig.level} concluído! 🎉`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);

    const next = this.addSharpText(0, 38, `Preparando o nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#7c3aed", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      const col = num <= this.levelConfig.level ? C.amber : num === nextLevel ? C.purple : 0xd1d5db;
      d.fillStyle(col, 1);
      d.fillCircle(-28 + i * 28, 90, 9);
      d.lineStyle(2, C.white, 0.8);
      d.strokeCircle(-28 + i * 28, 90, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let k = 0; k < 16; k++) {
      const cx = Phaser.Math.Between(280, 1000);
      const cy = Phaser.Math.Between(100, 620);
      const col = [C.amber, C.purple, C.teal, C.green, C.orange][k % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(col, 0.88);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 64, duration: 1600, delay: k * 80 });
    }

    this.time.delayedCall(1800, () => {
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors });
    });
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.70).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-316, -220, 632, 440, 36);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-328, -232, 656, 448, 36);
    panelBg.lineStyle(7, C.purple, 0.9);
    panelBg.strokeRoundedRect(-328, -232, 656, 448, 36);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(C.amber, 1);
    ribbon.fillRoundedRect(-230, -248, 460, 28, 14);

    const ribbonTxt = this.addSharpText(0, -234, "🎬 Estúdio de Produção Digital", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#1a0a00",
    }).setOrigin(0.5);

    const stars = this.addSharpText(0, -168, "⭐⭐⭐", {
      fontSize: "56px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.1 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -94, "Parabéns!", {
      fontSize: "46px", fontFamily: "Arial Black, Arial", color: "#7c3aed",
      stroke: "#faf5ff", strokeThickness: 7,
    }).setOrigin(0.5);

    const sub = this.addSharpText(0, -34, "Você completou todos os níveis\ndo Estúdio de Produção Digital!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center",
    }).setOrigin(0.5);

    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([C.amber, C.purple, C.teal, 0xf9a8d4, 0x86efac][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-210, 200), Phaser.Math.Between(4, 10));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 600 + i * 50, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.purple, 1);
    exitBg.fillRoundedRect(-138, 86, 276, 54, 27);
    exitBg.lineStyle(4, C.amber, 1);
    exitBg.strokeRoundedRect(-138, 86, 276, 54, 27);

    const exitTxt = this.addSharpText(0, 113, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#2e1065", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, ribbon, ribbonTxt, ...sparkles, stars, title, sub, desc, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(
      this.add.zone(640, 360 + 113 * MODAL_SCALE, 292 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();

    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.74).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-306, -206, 612, 412, 32);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-318, -218, 636, 416, 32);
    panelBg.lineStyle(5, C.red, 0.8);
    panelBg.strokeRoundedRect(-318, -218, 636, 416, 32);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.red, 1);
    topBar.fillRoundedRect(-216, -234, 432, 28, 14);

    const icon  = this.addSharpText(0, -148, "⏰", { fontSize: "56px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -82, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626",
      stroke: "#faf5ff", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -24, "⏰ O tempo esgotou!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 30, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    // Retry button
    const retryBg = this.add.graphics();
    retryBg.fillStyle(C.green, 1);
    retryBg.fillRoundedRect(-268, 74, 244, 54, 27);
    retryBg.lineStyle(4, C.white, 1);
    retryBg.strokeRoundedRect(-268, 74, 244, 54, 27);
    const retryTxt = this.addSharpText(-146, 101, "🔄 Tentar Novamente", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    // Exit button
    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.orange, 1);
    exitBg.fillRoundedRect(24, 74, 244, 54, 27);
    exitBg.lineStyle(4, C.white, 1);
    exitBg.strokeRoundedRect(24, 74, 244, 54, 27);
    const exitTxt = this.addSharpText(146, 101, "🚪 Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#78350f", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, topBar, icon, title, reason, stats, retryBg, retryTxt, exitBg, exitTxt]);
    this.animateModal(panel);

    // Retry zone
    const rz = this.addOverlay(
      this.add.zone(640 - 146 * MODAL_SCALE, 360 + 101 * MODAL_SCALE, 260 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70),
    );
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0 });
    });

    // Exit zone
    const ez = this.addOverlay(
      this.add.zone(640 + 146 * MODAL_SCALE, 360 + 101 * MODAL_SCALE, 260 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Overlay helpers
  // ─────────────────────────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.overlayObjects.push(o);
    return o;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((o) => o.destroy());
    this.overlayObjects = [];
    this.input.setDefaultCursor("default");
  }

  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0).setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  private getScore() {
    return Math.max(0, this.hits * 20 - this.errors * 5);
  }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 624).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, C.white, 0.85);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      align: "center", wordWrap: { width: 920 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({
      targets: container, y: 608, alpha: 0, duration: 320,
      delay: duration, onComplete: () => container.destroy(),
    });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  private playClick()   { this.playTone(520, 0.05, "sine",     0.05); }
  private playSuccess() {
    this.playTone(660,  0.1,  "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880,  0.1,  "triangle", 0.07));
    this.time.delayedCall(200, () => this.playTone(1100, 0.14, "triangle", 0.07));
  }
  private playWrong()   { this.playTone(200, 0.14, "sawtooth", 0.05); }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AC = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
      const ctx  = new AC();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => ctx.close();
    } catch {
      // Audio context not available — ignore
    }
  }
}
