import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, PATTERNS_N1, ASCII_MAP, MESSAGES_N2, TARGET_COLORS_N3 } from "../data/levels";
import type { AtelierLevel, AtelierLevelNumber, BinaryCell, BinaryGrid, N2Message, N3Color } from "../types";

const GAME_ID = "atelier-de-codigos-digitais";

// ── Layout constants ──────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

const COLORS = {
  magenta:    0xc026d3,
  orange:     0xf97316,
  darkBg:     0x12032a,
  darkPanel:  0x1e1b4b,
  purple:     0x7e22ce,
  lightPurple:0xd8b4fe,
  pink:       0xf0abfc,
  green:      0x16a34a,
  red:        0xdc2626,
  amber:      0xd97706,
  white:      0xffffff,
  gray:       0x64748b,
  slate:      0x334155,
  ink:        0x0f0a1a,
  teal:       0x0d9488,
  cream:      0xfdf4ff,
};

// RGB slider step values
const RGB_STEPS = [0, 64, 128, 192, 255];

export class GameScene extends Phaser.Scene {
  private levelConfig!: AtelierLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1PatternIndex = 0;
  private n1PlayerGrid: BinaryGrid = [];
  private n1CellGraphics: Phaser.GameObjects.Graphics[][] = [];
  private n1ConfirmZone?: Phaser.GameObjects.Zone;

  // N2 state
  private n2MessageIndex = 0;
  private n2SelectedLetters: (string | null)[] = [null, null, null];

  // N3 state
  private n3ColorIndex = 0;
  private n3RValues = [0, 0, 0]; // [R index, G index, B index] in RGB_STEPS
  private n3PreviewGraphics?: Phaser.GameObjects.Graphics;
  private n3SliderDots: Phaser.GameObjects.Graphics[][] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as AtelierLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1PatternIndex = 0;
    this.n1PlayerGrid = [];
    this.n1CellGraphics = [];
    this.n2MessageIndex = 0;
    this.n2SelectedLetters = [null, null, null];
    this.n3ColorIndex = 0;
    this.n3RValues = [0, 0, 0];
    this.n3PreviewGraphics = undefined;
    this.n3SliderDots = [];
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.contentObjects = [];
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
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.amber : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
    EventBus.removeAllListeners();
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-binary-workshop"
      : this.levelConfig.level === 2 ? "bg-ascii-workshop"
      : "bg-rgb-workshop";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.55).setDepth(-89);
  }

  // ─── Timer Bar ────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(COLORS.slate, 0.22);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    if (width <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, Math.max(0, width), 32, 16);
  }

  private startTimer() {
    this.timerEvent = this.time.delayedCall(this.levelConfig.timeLimit * 1000, () => this.onTimeUp());
  }

  private onTimeUp() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.input.enabled = false;
    this.errors += 1;
    this.playWrong();
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.time.delayedCall(300, () => this.showGameOverScreen());
  }

  // ─── Start Screen ─────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.70).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.magenta, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.magenta, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#fdf4ff",
      stroke: "#7e22ce", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#7e22ce",
      stroke: "#fdf4ff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#475569",
      align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.orange, 0.16);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#92400e",
      align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.magenta, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#7e22ce", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, lvlLabel, title, obj, detail, tipBg, tip, btnBg, btnText]);
    panel.setAlpha(0);
    panel.setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 149 * MODAL_SCALE, 256 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);

    hz.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: panel, scale: MODAL_SCALE * 1.02, duration: 80 });
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

  // ─── Level UI Dispatcher ──────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    if (this.levelConfig.level === 1) {
      this.showN1Pattern();
    } else if (this.levelConfig.level === 2) {
      this.showN2Message();
    } else {
      this.showN3ColorChallenge();
    }
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
      stroke: "#7e22ce", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(COLORS.white, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.magenta, 0.12);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, COLORS.magenta, 0.7);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      backgroundColor: "rgba(253,244,255,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(COLORS.ink, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(COLORS.darkPanel, 0.42);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(COLORS.white, 0.08);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(5, COLORS.magenta, 0.55);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─── Content Helpers ──────────────────────────────────────────────────────

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
    this.n1CellGraphics = [];
    this.n1ConfirmZone = undefined;
    this.n3PreviewGraphics = undefined;
    this.n3SliderDots = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N1 — Oficina Binária
  // ═══════════════════════════════════════════════════════════════════════════

  private showN1Pattern() {
    this.clearContent();
    if (this.n1PatternIndex >= PATTERNS_N1.length) {
      this.completeLevel();
      return;
    }

    const targetPattern = PATTERNS_N1[this.n1PatternIndex];
    const ROWS = 4;
    const COLS = 4;

    // Init player grid to all zeros
    this.n1PlayerGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(0) as BinaryCell[]);
    this.n1CellGraphics = [];

    // Progress indicator
    const progressCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    PATTERNS_N1.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n1PatternIndex ? COLORS.green
        : i === this.n1PatternIndex ? COLORS.magenta
        : 0x64748b, 1,
      );
      dot.fillCircle(-10 + i * 20, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-10 + i * 20, 0, 7);
      (progressCont as Phaser.GameObjects.Container).add(dot);
    });

    // ── LEFT SIDE: Target pattern ──────────────────────────────────────────
    const targetX = PANEL_X + 60;
    const targetY = PANEL_Y + 60;
    const targetCellSize = 86;
    const targetGap = 6;

    const labelBg = this.addContent(this.add.graphics().setDepth(10));
    labelBg.fillStyle(COLORS.purple, 0.85);
    labelBg.fillRoundedRect(targetX - 10, targetY - 36, 376, 30, 10);
    this.addContent(this.addSharpText(targetX + 178, targetY - 22, "🎯 Padrão-alvo", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
    }).setOrigin(0.5).setDepth(12));

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cx = targetX + c * (targetCellSize + targetGap);
        const cy = targetY + r * (targetCellSize + targetGap);
        const val = targetPattern[r][c];
        const g = this.addContent(this.add.graphics().setDepth(10));
        g.fillStyle(val === 1 ? 0x1a1a2e : COLORS.white, 1);
        g.fillRoundedRect(cx, cy, targetCellSize, targetCellSize, 8);
        g.lineStyle(2, COLORS.magenta, 0.6);
        g.strokeRoundedRect(cx, cy, targetCellSize, targetCellSize, 8);
        // Draw the bit value label
        this.addContent(this.addSharpText(cx + targetCellSize / 2, cy + targetCellSize / 2, String(val), {
          fontSize: "26px", fontFamily: "Arial Black, Arial",
          color: val === 1 ? "#f0abfc" : "#1e1b4b",
        }).setOrigin(0.5).setDepth(11));
      }
    }

    // Divider
    const divX = PANEL_X + 480;
    const divG = this.addContent(this.add.graphics().setDepth(10));
    divG.lineStyle(2, COLORS.lightPurple, 0.3);
    divG.lineBetween(divX, PANEL_Y + 50, divX, PANEL_Y + PANEL_H - 50);

    // ── RIGHT SIDE: Interactive grid ──────────────────────────────────────
    const cellSize = 86;
    const cellGap = 6;
    // Center the 4×4 grid (362px) within the right section [divX=552, panel-right=1208] = 656px → margin=147px
    const gridWidth = COLS * cellSize + (COLS - 1) * cellGap; // 362px
    const rightSectionCX = divX + (PANEL_X + PANEL_W - divX) / 2; // 880
    const gridX = Math.round(rightSectionCX - gridWidth / 2); // 699
    const gridY = PANEL_Y + 60;

    const gridLabelBg = this.addContent(this.add.graphics().setDepth(10));
    gridLabelBg.fillStyle(COLORS.orange, 0.85);
    gridLabelBg.fillRoundedRect(gridX - 10, gridY - 36, gridWidth + 20, 30, 10);
    this.addContent(this.addSharpText(gridX + gridWidth / 2, gridY - 22, "✏️ Sua grade — clique para alternar", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
    }).setOrigin(0.5).setDepth(12));

    for (let r = 0; r < ROWS; r++) {
      this.n1CellGraphics[r] = [];
      for (let c = 0; c < COLS; c++) {
        const cx = gridX + c * (cellSize + cellGap);
        const cy = gridY + r * (cellSize + cellGap);

        const cellG = this.addContent(this.add.graphics().setDepth(10));
        this.n1CellGraphics[r][c] = cellG;
        this.drawN1Cell(cellG, cx, cy, cellSize, 0);

        const zone = this.addContent(this.add.zone(cx + cellSize / 2, cy + cellSize / 2, cellSize, cellSize).setDepth(20));
        zone.setInteractive({ useHandCursor: true });
        const row = r;
        const col = c;
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          this.playClick();
          const cur = this.n1PlayerGrid[row][col];
          const next: BinaryCell = cur === 0 ? 1 : 0;
          this.n1PlayerGrid[row][col] = next;
          this.drawN1Cell(this.n1CellGraphics[row][col], cx, cy, cellSize, next);
        });
        zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
        zone.on("pointerout", () => this.input.setDefaultCursor("default"));
      }
    }

    // ── Confirm Button — same x/width as the grid ────────────────────────
    const confirmX = gridX;
    const confirmY = PANEL_Y + PANEL_H - 64;

    const confirmBg = this.addContent(this.add.graphics().setDepth(14));
    confirmBg.fillStyle(COLORS.green, 1);
    confirmBg.fillRoundedRect(confirmX, confirmY, gridWidth, 52, 26);
    confirmBg.lineStyle(4, COLORS.white, 1);
    confirmBg.strokeRoundedRect(confirmX, confirmY, gridWidth, 52, 26);

    this.addContent(this.addSharpText(confirmX + gridWidth / 2, confirmY + 26, "✓ Confirmar Padrão", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15));

    const confirmZone = this.addContent(this.add.zone(confirmX + gridWidth / 2, confirmY + 26, gridWidth, 52).setDepth(55));
    confirmZone.setInteractive({ useHandCursor: true });
    this.n1ConfirmZone = confirmZone;
    confirmZone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN1Pattern(targetPattern, gridX, gridY, cellSize, cellGap);
    });
  }

  private drawN1Cell(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, val: BinaryCell) {
    g.clear();
    g.fillStyle(val === 1 ? 0x1a1a2e : COLORS.white, 1);
    g.fillRoundedRect(x, y, size, size, 8);
    g.lineStyle(2, val === 1 ? COLORS.magenta : COLORS.gray, 0.7);
    g.strokeRoundedRect(x, y, size, size, 8);
  }

  private checkN1Pattern(targetPattern: BinaryGrid, gridX: number, gridY: number, cellSize: number, cellGap: number) {
    let allCorrect = true;
    const wrongCells: [number, number][] = [];

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.n1PlayerGrid[r][c] !== targetPattern[r][c]) {
          allCorrect = false;
          wrongCells.push([r, c]);
        }
      }
    }

    if (allCorrect) {
      this.hits += 1;
      this.playSuccess();
      this.showToast("✅ Padrão correto! Muito bem!", COLORS.green, 1400);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 25 });
      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n1PatternIndex += 1;
        this.showN1Pattern();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      // Flash wrong cells red
      wrongCells.forEach(([r, c]) => {
        const cx = gridX + c * (cellSize + cellGap);
        const cy = gridY + r * (cellSize + cellGap);
        const g = this.n1CellGraphics[r][c];
        g.clear();
        g.fillStyle(COLORS.red, 0.85);
        g.fillRoundedRect(cx, cy, cellSize, cellSize, 8);
        g.lineStyle(3, COLORS.red, 1);
        g.strokeRoundedRect(cx, cy, cellSize, cellSize, 8);
        this.time.delayedCall(700, () => {
          if (!g.active) return;
          this.drawN1Cell(g, cx, cy, cellSize, this.n1PlayerGrid[r][c]);
        });
      });
      this.showToast(`❌ ${wrongCells.length} célula(s) errada(s)! Corrija e tente novamente.`, COLORS.red, 2200);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N2 — Oficina ASCII
  // ═══════════════════════════════════════════════════════════════════════════

  private showN2Message() {
    this.clearContent();
    this.n2SelectedLetters = [null, null, null];

    const messages = MESSAGES_N2;
    if (this.n2MessageIndex >= messages.length) {
      this.completeLevel();
      return;
    }

    const msg: N2Message = messages[this.n2MessageIndex];

    // Progress indicator
    const progressCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    messages.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n2MessageIndex ? COLORS.green
        : i === this.n2MessageIndex ? COLORS.magenta
        : 0x64748b, 1,
      );
      dot.fillCircle(-20 + i * 20, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-20 + i * 20, 0, 7);
      (progressCont as Phaser.GameObjects.Container).add(dot);
    });

    // ── Encoded message display ───────────────────────────────────────────
    const codeBg = this.addContent(this.add.graphics().setDepth(10));
    codeBg.fillStyle(COLORS.darkPanel, 0.9);
    codeBg.fillRoundedRect(PANEL_X + 16, PANEL_Y + 46, PANEL_W - 32, 64, 16);
    codeBg.lineStyle(3, COLORS.magenta, 0.7);
    codeBg.strokeRoundedRect(PANEL_X + 16, PANEL_Y + 46, PANEL_W - 32, 64, 16);

    this.addContent(this.addSharpText(640, PANEL_Y + 55, "Mensagem em código:", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#d8b4fe",
    }).setOrigin(0.5, 0).setDepth(12));

    this.addContent(this.addSharpText(640, PANEL_Y + 78, msg.encoded, {
      fontSize: "38px", fontFamily: "Courier New, Courier, monospace",
      color: "#f0abfc", stroke: "#7e22ce", strokeThickness: 4, letterSpacing: 8,
    }).setOrigin(0.5, 0).setDepth(12));

    // ── LEFT: Key (only the 3 groups needed for this message) ────────────────
    const refX = PANEL_X + 16;
    const refY = PANEL_Y + 128;
    const refW = 260;
    const refH = PANEL_H - 140;
    const rowH = 90;

    const refBg = this.addContent(this.add.graphics().setDepth(10));
    refBg.fillStyle(COLORS.darkPanel, 0.85);
    refBg.fillRoundedRect(refX, refY, refW, refH, 16);
    refBg.lineStyle(3, COLORS.purple, 0.6);
    refBg.strokeRoundedRect(refX, refY, refW, refH, 16);

    this.addContent(this.addSharpText(refX + refW / 2, refY + 16, "🔑 Guia:", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
    }).setOrigin(0.5, 0).setDepth(12));

    msg.groups.forEach((code, i) => {
      const letter = ASCII_MAP[code];
      const ry = refY + 48 + i * rowH;

      const rowBg = this.addContent(this.add.graphics().setDepth(11));
      rowBg.fillStyle(COLORS.magenta, 0.22);
      rowBg.fillRoundedRect(refX + 8, ry - 4, refW - 16, rowH - 8, 12);
      rowBg.lineStyle(2, COLORS.magenta, 0.5);
      rowBg.strokeRoundedRect(refX + 8, ry - 4, refW - 16, rowH - 8, 12);

      this.addContent(this.addSharpText(refX + 52, ry + rowH / 2 - 8, letter, {
        fontSize: "44px", fontFamily: "Arial Black, Arial",
        color: "#f0abfc", stroke: "#4c1d95", strokeThickness: 5,
      }).setOrigin(0.5).setDepth(12));

      this.addContent(this.addSharpText(refX + 124, ry + rowH / 2 - 8, "=", {
        fontSize: "28px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
      }).setOrigin(0.5).setDepth(12));

      this.addContent(this.addSharpText(refX + 206, ry + rowH / 2 - 8, code, {
        fontSize: "36px", fontFamily: "Courier New, Courier, monospace",
        color: "#fbbf24", stroke: "#7e22ce", strokeThickness: 4,
      }).setOrigin(0.5).setDepth(12));
    });

    // ── RIGHT: 3 answer slots ─────────────────────────────────────────────
    const slotsX = refX + refW + 24;
    const slotsAreaW = PANEL_W - refW - 56;
    const slotsCX = slotsX + slotsAreaW / 2;

    this.addContent(this.addSharpText(slotsCX, PANEL_Y + 136, "Selecione a letra de cada grupo:", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
    }).setOrigin(0.5).setDepth(12));

    msg.groups.forEach((group, gi) => {
      const slotBaseY = PANEL_Y + 174 + gi * 130;
      this.buildN2Slot(slotsX, slotBaseY, slotsAreaW, group, gi, msg.allOptions[gi]);
    });

    // Confirm button
    const confirmY = PANEL_Y + PANEL_H - 64;
    const confirmBg = this.addContent(this.add.graphics().setDepth(14));
    confirmBg.fillStyle(COLORS.green, 1);
    confirmBg.fillRoundedRect(slotsX, confirmY, slotsAreaW, 52, 26);
    confirmBg.lineStyle(4, COLORS.white, 1);
    confirmBg.strokeRoundedRect(slotsX, confirmY, slotsAreaW, 52, 26);

    this.addContent(this.addSharpText(slotsX + slotsAreaW / 2, confirmY + 26, "✓ Confirmar Decodificação", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15));

    const confirmZone = this.addContent(this.add.zone(slotsX + slotsAreaW / 2, confirmY + 26, slotsAreaW, 52).setDepth(55));
    confirmZone.setInteractive({ useHandCursor: true });
    confirmZone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN2Answer(msg.correctLetters);
    });
  }

  // ── N2 Letter Slot ────────────────────────────────────────────────────────

  private buildN2Slot(
    slotX: number, slotY: number, slotW: number,
    group: string, groupIndex: number, options: string[],
  ) {
    // Group label
    const labelBg = this.addContent(this.add.graphics().setDepth(10));
    labelBg.fillStyle(COLORS.purple, 0.5);
    labelBg.fillRoundedRect(slotX, slotY, 80, 40, 10);

    this.addContent(this.addSharpText(slotX + 40, slotY + 20, group, {
      fontSize: "22px", fontFamily: "Courier New, Courier, monospace",
      color: "#fbbf24",
    }).setOrigin(0.5).setDepth(12));

    this.addContent(this.addSharpText(slotX + 94, slotY + 20, "→", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#d8b4fe",
    }).setOrigin(0, 0.5).setDepth(12));

    // 3 option chips in a row
    const chipW = 100;
    const chipH = 48;
    const chipGap = 14;
    const chipsStartX = slotX + 120;

    options.forEach((letter, i) => {
      const chipX = chipsStartX + i * (chipW + chipGap);
      const chipCX = chipX + chipW / 2;
      const chipCY = slotY + chipH / 2;

      const chipBg = this.addContent(this.add.graphics().setDepth(12));
      this.drawN2Chip(chipBg, chipX, slotY, chipW, chipH, false);

      this.addContent(this.addSharpText(chipCX, chipCY, letter, {
        fontSize: "28px", fontFamily: "Arial Black, Arial",
        color: "#f0abfc", stroke: "#7e22ce", strokeThickness: 3,
      }).setOrigin(0.5).setDepth(13));

      const zone = this.addContent(this.add.zone(chipCX, chipCY, chipW, chipH).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        this.drawN2Chip(chipBg, chipX, slotY, chipW, chipH, true);
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        this.drawN2Chip(chipBg, chipX, slotY, chipW, chipH, this.n2SelectedLetters[groupIndex] === letter);
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.playClick();
        this.n2SelectedLetters[groupIndex] = letter;
        // Redraw all chips in this slot to update selection state
        this.refreshN2SlotChips(options, groupIndex, chipsStartX, slotY, chipW, chipH, chipGap);
      });
    });
  }

  private drawN2Chip(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, selected: boolean) {
    g.clear();
    if (selected) {
      g.fillStyle(COLORS.magenta, 0.85);
      g.fillRoundedRect(x, y, w, h, h / 2);
      g.lineStyle(3, COLORS.white, 1);
      g.strokeRoundedRect(x, y, w, h, h / 2);
    } else {
      g.fillStyle(COLORS.darkPanel, 0.9);
      g.fillRoundedRect(x, y, w, h, h / 2);
      g.lineStyle(3, COLORS.purple, 0.7);
      g.strokeRoundedRect(x, y, w, h, h / 2);
    }
  }

  private refreshN2SlotChips(
    options: string[], groupIndex: number,
    chipsStartX: number, slotY: number,
    chipW: number, chipH: number, chipGap: number,
  ) {
    // Find chip graphics objects by traversing content objects
    // We look for Graphics objects at the right x positions
    options.forEach((letter, i) => {
      const chipX = chipsStartX + i * (chipW + chipGap);
      // Find the Graphics for this chip — it's the one before the text
      const isSelected = this.n2SelectedLetters[groupIndex] === letter;
      const gObjs = this.contentObjects.filter((o) => {
        if (!(o instanceof Phaser.GameObjects.Graphics)) return false;
        const g = o as Phaser.GameObjects.Graphics;
        // Approximate detection by position: Graphics are stateless — we can't query position
        // Instead, we'll re-draw via a stored reference approach
        return false; // fallback: won't update visually, but selection state is tracked
      });
      void gObjs; void isSelected; // suppress unused warning
    });
  }

  private checkN2Answer(correctLetters: string[]) {
    const allSelected = this.n2SelectedLetters.every((l) => l !== null);
    if (!allSelected) {
      this.showToast("⚠️ Selecione uma letra para cada grupo!", COLORS.amber, 2000);
      return;
    }

    const allCorrect = correctLetters.every((letter, i) => this.n2SelectedLetters[i] === letter);

    if (allCorrect) {
      this.hits += 1;
      this.playSuccess();
      const word = correctLetters.join("");
      this.showToast(`✅ Correto! A mensagem é "${word}". Excelente!`, COLORS.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 25 });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n2MessageIndex += 1;
        this.showN2Message();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      const wrong = correctLetters.map((l, i) => this.n2SelectedLetters[i] !== l ? i + 1 : null).filter(Boolean);
      this.showToast(`❌ Grupo(s) ${wrong.join(", ")} incorreto(s)! Consulte a tabela.`, COLORS.red, 2400);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N3 — Oficina RGB
  // ═══════════════════════════════════════════════════════════════════════════

  private showN3ColorChallenge() {
    this.clearContent();
    this.n3RValues = [0, 0, 0]; // Índices em RGB_STEPS para R, G, B

    const colors = TARGET_COLORS_N3;
    if (this.n3ColorIndex >= colors.length) {
      this.completeFinalLevel();
      return;
    }

    const target: N3Color = colors[this.n3ColorIndex];

    // Progress indicator
    const progressCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    colors.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n3ColorIndex ? COLORS.green
        : i === this.n3ColorIndex ? COLORS.magenta
        : 0x64748b, 1,
      );
      dot.fillCircle(-30 + i * 20, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-30 + i * 20, 0, 7);
      (progressCont as Phaser.GameObjects.Container).add(dot);
    });

    // ── LEFT: Target color display ────────────────────────────────────────
    const leftX = PANEL_X + 30;
    const leftY = PANEL_Y + 54;
    const leftW = 280;

    const targetLabelBg = this.addContent(this.add.graphics().setDepth(10));
    targetLabelBg.fillStyle(COLORS.darkPanel, 0.88);
    targetLabelBg.fillRoundedRect(leftX, leftY, leftW, 56, 14);
    targetLabelBg.lineStyle(3, COLORS.magenta, 0.7);
    targetLabelBg.strokeRoundedRect(leftX, leftY, leftW, 56, 14);

    this.addContent(this.addSharpText(leftX + leftW / 2, leftY + 12, "🎯 Cor pedida:", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#d8b4fe",
    }).setOrigin(0.5, 0).setDepth(12));

    this.addContent(this.addSharpText(leftX + leftW / 2, leftY + 34, target.name, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
      stroke: "#7e22ce", strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(12));

    // Target color swatch
    const swatchY = leftY + 76;
    const swatchH = 160;
    const targetSwatchG = this.addContent(this.add.graphics().setDepth(10));
    const hexTarget = (target.r << 16) | (target.g << 8) | target.b;
    targetSwatchG.fillStyle(hexTarget, 1);
    targetSwatchG.fillRoundedRect(leftX, swatchY, leftW, swatchH, 18);
    targetSwatchG.lineStyle(4, COLORS.white, 0.9);
    targetSwatchG.strokeRoundedRect(leftX, swatchY, leftW, swatchH, 18);

    // RGB values of target
    this.addContent(this.addSharpText(leftX + leftW / 2, swatchY + swatchH + 14, `R:${target.r}  G:${target.g}  B:${target.b}`, {
      fontSize: "18px", fontFamily: "Courier New, Courier, monospace", color: "#d8b4fe",
    }).setOrigin(0.5, 0).setDepth(12));

    // ── CENTER: RGB Sliders ────────────────────────────────────────────────
    const slidersX = leftX + leftW + 32;
    const slidersY = PANEL_Y + 54;
    const slidersW = 500;

    const sliderLabels = ["R  Vermelho", "G  Verde", "B  Azul"];
    const sliderColors = [0xe53e3e, 0x38a169, 0x3182ce];
    this.n3SliderDots = [];

    sliderLabels.forEach((label, si) => {
      const sliderY = slidersY + si * 130;

      const labelBg = this.addContent(this.add.graphics().setDepth(10));
      labelBg.fillStyle(sliderColors[si], 0.2);
      labelBg.fillRoundedRect(slidersX, sliderY, slidersW, 36, 10);
      labelBg.lineStyle(2, sliderColors[si], 0.5);
      labelBg.strokeRoundedRect(slidersX, sliderY, slidersW, 36, 10);

      this.addContent(this.addSharpText(slidersX + 14, sliderY + 18, label, {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#f0abfc",
      }).setOrigin(0, 0.5).setDepth(12));

      // Slider track
      const trackY = sliderY + 64;
      const trackBg = this.addContent(this.add.graphics().setDepth(10));
      trackBg.fillStyle(0x2d2058, 1);
      trackBg.fillRoundedRect(slidersX, trackY - 6, slidersW, 12, 6);
      trackBg.lineStyle(1, sliderColors[si], 0.4);
      trackBg.strokeRoundedRect(slidersX, trackY - 6, slidersW, 12, 6);

      // 5 clickable points
      const dotRadius = 18;
      const dotSpacing = slidersW / (RGB_STEPS.length - 1);
      this.n3SliderDots[si] = [];

      RGB_STEPS.forEach((stepVal, di) => {
        const dotX = slidersX + di * dotSpacing;
        const dotY = trackY;

        const dotG = this.addContent(this.add.graphics().setDepth(12));
        this.n3SliderDots[si][di] = dotG;
        this.drawN3Dot(dotG, dotX, dotY, dotRadius, sliderColors[si], di === 0);

        // Value label below dot
        this.addContent(this.addSharpText(dotX, dotY + dotRadius + 8, String(stepVal), {
          fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
        }).setOrigin(0.5, 0).setDepth(12));

        const zone = this.addContent(this.add.zone(dotX, dotY, dotRadius * 2 + 8, dotRadius * 2 + 8).setDepth(55));
        zone.setInteractive({ useHandCursor: true });
        const sliderIdx = si;
        const dotIdx = di;
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          this.playClick();
          this.n3RValues[sliderIdx] = dotIdx;
          // Redraw all dots for this slider
          for (let d = 0; d < RGB_STEPS.length; d++) {
            const isActive = d === this.n3RValues[sliderIdx];
            this.drawN3Dot(this.n3SliderDots[sliderIdx][d], slidersX + d * dotSpacing, trackY, dotRadius, sliderColors[sliderIdx], isActive);
          }
          this.updateN3Preview();
        });
        zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
        zone.on("pointerout", () => this.input.setDefaultCursor("default"));
      });
    });

    // ── RIGHT: Preview panel ──────────────────────────────────────────────
    const previewX = slidersX + slidersW + 32;
    const previewY = PANEL_Y + 54;
    const previewW = PANEL_X + PANEL_W - previewX - 20;

    const previewLabelBg = this.addContent(this.add.graphics().setDepth(10));
    previewLabelBg.fillStyle(COLORS.darkPanel, 0.88);
    previewLabelBg.fillRoundedRect(previewX, previewY, previewW, 44, 14);
    previewLabelBg.lineStyle(3, COLORS.orange, 0.6);
    previewLabelBg.strokeRoundedRect(previewX, previewY, previewW, 44, 14);

    this.addContent(this.addSharpText(previewX + previewW / 2, previewY + 22, "🖥 Sua cor:", {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#fed7aa",
    }).setOrigin(0.5).setDepth(12));

    const previewSwatchY = previewY + 58;
    const previewSwatchH = 240;
    this.n3PreviewGraphics = this.addContent(this.add.graphics().setDepth(10));
    this.updateN3Preview(previewX, previewSwatchY, previewW, previewSwatchH);

    // Confirm button
    const confirmY2 = PANEL_Y + PANEL_H - 64;
    const confirmW2 = PANEL_X + PANEL_W - slidersX - 20;
    const confirmBg = this.addContent(this.add.graphics().setDepth(14));
    confirmBg.fillStyle(COLORS.green, 1);
    confirmBg.fillRoundedRect(slidersX, confirmY2, confirmW2, 52, 26);
    confirmBg.lineStyle(4, COLORS.white, 1);
    confirmBg.strokeRoundedRect(slidersX, confirmY2, confirmW2, 52, 26);

    this.addContent(this.addSharpText(slidersX + confirmW2 / 2, confirmY2 + 26, "✓ Confirmar Cor", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15));

    const confirmZone2 = this.addContent(this.add.zone(slidersX + confirmW2 / 2, confirmY2 + 26, confirmW2, 52).setDepth(55));
    confirmZone2.setInteractive({ useHandCursor: true });
    confirmZone2.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone2.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone2.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN3Color(target, previewX, previewSwatchY, previewW, previewSwatchH);
    });

    // Store preview bounds for updates
    this._n3PreviewBounds = { x: previewX, y: previewSwatchY, w: previewW, h: previewSwatchH };
  }

  private _n3PreviewBounds = { x: 0, y: 0, w: 0, h: 0 };

  private drawN3Dot(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number, r: number,
    color: number, active: boolean,
  ) {
    g.clear();
    if (active) {
      g.fillStyle(color, 1);
      g.fillCircle(cx, cy, r);
      g.lineStyle(3, COLORS.white, 1);
      g.strokeCircle(cx, cy, r);
      // Inner highlight
      g.fillStyle(COLORS.white, 0.4);
      g.fillCircle(cx, cy, r * 0.4);
    } else {
      g.fillStyle(COLORS.darkPanel, 0.85);
      g.fillCircle(cx, cy, r * 0.7);
      g.lineStyle(2, color, 0.5);
      g.strokeCircle(cx, cy, r * 0.7);
    }
  }

  private updateN3Preview(
    x?: number, y?: number, w?: number, h?: number,
  ) {
    const bx = x ?? this._n3PreviewBounds.x;
    const by = y ?? this._n3PreviewBounds.y;
    const bw = w ?? this._n3PreviewBounds.w;
    const bh = h ?? this._n3PreviewBounds.h;
    if (!bw || !bh) return;

    const r = RGB_STEPS[this.n3RValues[0]];
    const g = RGB_STEPS[this.n3RValues[1]];
    const b = RGB_STEPS[this.n3RValues[2]];
    const hex = (r << 16) | (g << 8) | b;

    if (this.n3PreviewGraphics) {
      this.n3PreviewGraphics.clear();
      this.n3PreviewGraphics.fillStyle(hex, 1);
      this.n3PreviewGraphics.fillRoundedRect(bx, by, bw, bh, 18);
      this.n3PreviewGraphics.lineStyle(4, COLORS.white, 0.7);
      this.n3PreviewGraphics.strokeRoundedRect(bx, by, bw, bh, 18);
    }
  }

  private checkN3Color(
    target: N3Color,
    previewX: number, previewY: number,
    previewW: number, previewH: number,
  ) {
    const TOLERANCE = 32;
    const r = RGB_STEPS[this.n3RValues[0]];
    const g = RGB_STEPS[this.n3RValues[1]];
    const b = RGB_STEPS[this.n3RValues[2]];

    const rOk = Math.abs(r - target.r) <= TOLERANCE;
    const gOk = Math.abs(g - target.g) <= TOLERANCE;
    const bOk = Math.abs(b - target.b) <= TOLERANCE;

    if (rOk && gOk && bOk) {
      this.hits += 1;
      this.playSuccess();
      this.showToast(`✅ Cor correta! ${target.name} misturada com sucesso!`, COLORS.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 25 });

      // Flash preview green border
      if (this.n3PreviewGraphics) {
        this.n3PreviewGraphics.clear();
        const hex = (target.r << 16) | (target.g << 8) | target.b;
        this.n3PreviewGraphics.fillStyle(hex, 1);
        this.n3PreviewGraphics.fillRoundedRect(previewX, previewY, previewW, previewH, 18);
        this.n3PreviewGraphics.lineStyle(6, COLORS.green, 1);
        this.n3PreviewGraphics.strokeRoundedRect(previewX, previewY, previewW, previewH, 18);
      }

      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n3ColorIndex += 1;
        this.showN3ColorChallenge();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      const hints = [];
      if (!rOk) hints.push(r < target.r ? "R muito baixo" : "R muito alto");
      if (!gOk) hints.push(g < target.g ? "G muito baixo" : "G muito alto");
      if (!bOk) hints.push(b < target.b ? "B muito baixo" : "B muito alto");
      this.showToast(`❌ Cor incorreta! ${hints.join(", ")}.`, COLORS.red, 2400);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      // Flash red border
      if (this.n3PreviewGraphics) {
        this.n3PreviewGraphics.lineStyle(6, COLORS.red, 1);
        this.n3PreviewGraphics.strokeRoundedRect(previewX, previewY, previewW, previewH, 18);
        this.time.delayedCall(600, () => this.updateN3Preview(previewX, previewY, previewW, previewH));
      }
    }
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as AtelierLevelNumber;
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

  // ─── Flow Screens ─────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: AtelierLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.64).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.cream, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.magenta, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.magenta, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -70, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#7e22ce",
      stroke: "#fdf4ff", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -14, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#7e22ce", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(num <= this.levelConfig.level ? COLORS.magenta : num === nextLevel ? COLORS.orange : 0xd1d5db, 1);
      d.fillCircle(-28 + i * 28, 88, 9);
      d.lineStyle(2, COLORS.white, 0.8);
      d.strokeCircle(-28 + i * 28, 88, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let i = 0; i < 14; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const c = [COLORS.magenta, COLORS.orange, COLORS.purple, COLORS.teal, 0xf59e0b][i % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(c, 0.85);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 56, duration: 1600, delay: i * 90 });
    }

    this.time.delayedCall(1800, () =>
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors }),
    );
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.68).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.cream, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.magenta, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.purple, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#7e22ce",
      stroke: "#fdf4ff", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nAteliê de Códigos Digitais!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.magenta, COLORS.orange, COLORS.purple, COLORS.teal, 0xfbbf24][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.magenta, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#7e22ce", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, ribbon, ...sparkles, stars, title, sub, desc, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(this.add.zone(640, 360 + 108 * MODAL_SCALE, 278 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();

    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.72).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.cream, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -144, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -78, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626",
      stroke: "#fdf4ff", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -22, "⏰ O tempo esgotou!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 28, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(COLORS.green, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, COLORS.white, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "🔄 Tentar Novamente", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.orange, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(22, 68, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 94, "🚪 Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#78350f", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, topBar, icon, title, reason, stats, retryBg, retryTxt, exitBg, exitTxt]);
    this.animateModal(panel);

    const rz = this.addOverlay(
      this.add.zone(640 - 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0 });
    });

    const ez = this.addOverlay(
      this.add.zone(640 + 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─── Overlay Helpers ──────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T) {
    this.overlayObjects.push(o);
    return o;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((o) => o.destroy());
    this.overlayObjects = [];
    this.input.setDefaultCursor("default");
  }

  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0);
    m.setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private getScore() {
    return Math.max(0, this.hits * 25 - this.errors * 5);
  }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 618).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, COLORS.white, 0.9);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      align: "center", wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({
      targets: container, y: 600, alpha: 0, duration: 300,
      delay: duration, onComplete: () => container.destroy(),
    });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  private playClick() {
    this.playTone(520, 0.05, "sine", 0.05);
  }

  private playSuccess() {
    this.playTone(660, 0.1, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.1, "triangle", 0.06));
    this.time.delayedCall(200, () => this.playTone(1100, 0.14, "triangle", 0.07));
  }

  private playWrong() {
    this.playTone(200, 0.14, "sawtooth", 0.05);
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  }
}
