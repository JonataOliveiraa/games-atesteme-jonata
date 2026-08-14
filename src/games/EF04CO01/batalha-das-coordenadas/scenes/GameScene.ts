import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type { BattleLevel, BattleLevelNumber, CellState } from "../types";

const GAME_ID = "batalha-das-coordenadas";

// ── Layout constants ─────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

// Row labels A–E, Col labels 1–5
const ROW_LABELS = ["A", "B", "C", "D", "E"];
const COL_LABELS = ["1", "2", "3", "4", "5"];

const COLORS = {
  navy: 0x1e3a8a,
  gold: 0xf59e0b,
  amber: 0xfbbf24,
  green: 0x22c55e,
  red: 0xef4444,
  orange: 0xf97316,
  blue: 0x3b82f6,
  lightBlue: 0x93c5fd,
  darkBlue: 0x1e40af,
  teal: 0x0d9488,
  white: 0xffffff,
  ink: 0x0c1445,
  slate: 0x475569,
  hit: 0xf59e0b,   // golden hit
  miss: 0x1e40af,  // deep ocean blue miss
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: BattleLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private gameplayObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1Index = 0;
  private n1CoordText?: Phaser.GameObjects.Text;

  // N2 state
  private n2Index = 0;
  private n2ObjectEmoji?: Phaser.GameObjects.Text;
  private n2ChipObjects: Phaser.GameObjects.GameObject[] = [];

  // N3 state
  private n3ShipsFound = 0;
  private n3CellStates: CellState[][] = [];

  // Grid rendering
  private cellContainers: Phaser.GameObjects.Container[][] = [];
  private cellZones: Phaser.GameObjects.Zone[][] = [];
  private storedGridLayout = { cellSize: 0, startX: 0, startY: 0 };

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as BattleLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1Index = 0;
    this.n2Index = 0;
    this.n3ShipsFound = 0;
    this.n3CellStates = [];
    this.cellContainers = [];
    this.cellZones = [];
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.gameplayObjects = [];
    this.n2ChipObjects = [];
    this.storedGridLayout = { cellSize: 0, startX: 0, startY: 0 };
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
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.gold : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-battle-grid"
      : this.levelConfig.level === 2 ? "bg-ocean-grid"
      : "bg-treasure-map";

    // Try PNG; if placeholder (1×1), draw a gradient fallback
    const bgImg = this.add.image(640, 360, bgKey).setDepth(-100);
    bgImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    if (bgImg.width > 4) {
      const scale = Math.max(1280 / bgImg.width, 720 / bgImg.height);
      bgImg.setScale(scale);
    } else {
      bgImg.setVisible(false);
      // Draw procedural ocean/map background
      const bg = this.add.graphics().setDepth(-100);
      bg.fillGradientStyle(COLORS.ink, COLORS.ink, COLORS.navy, COLORS.navy, 1);
      bg.fillRect(0, 0, 1280, 720);
      // Grid pattern overlay
      const grid = this.add.graphics().setDepth(-99);
      grid.lineStyle(1, COLORS.lightBlue, 0.08);
      for (let x = 0; x <= 1280; x += 64) grid.lineBetween(x, 0, x, 720);
      for (let y = 0; y <= 720; y += 64) grid.lineBetween(0, y, 1280, y);
    }
    this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.28).setDepth(-89);
  }

  // ─── Timer Bar ────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(0x334155, 0.16);
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
    const overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.65).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.navy, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.navy, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0c1445", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "36px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#0c1445", align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.amber, 0.18);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#92400e", align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.navy, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, 0xffffff, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0c1445", strokeThickness: 3,
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

  // ─── Level UI ─────────────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();

    if (this.levelConfig.level === 1) {
      this.buildN1UI();
    } else if (this.levelConfig.level === 2) {
      this.buildN2UI();
    } else {
      this.buildN3UI();
    }
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0c1445", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(0xffffff, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.amber, 0.18);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, COLORS.gold, 0.9);
    card.strokeRoundedRect(230, 96, 820, 44, 22);
    card.lineStyle(3, 0xffffff, 0.95);
    card.strokeRoundedRect(234, 100, 812, 36, 18);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(COLORS.ink, 0.18);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(0xffffff, 0.12);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(0xdbeafe, 0.12);
    panel.fillRoundedRect(PANEL_X + 12, PANEL_Y + 12, PANEL_W - 24, PANEL_H - 24, 24);
    panel.fillStyle(0xffffff, 0.14);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(5, COLORS.gold, 0.7);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.lineStyle(2, 0xffffff, 0.3);
    panel.strokeRoundedRect(PANEL_X + 6, PANEL_Y + 6, PANEL_W - 12, PANEL_H - 12, 26);
  }

  // ─── Grid Helpers ─────────────────────────────────────────────────────────

  /**
   * Returns grid layout metrics centered inside the main panel.
   * cellSize is chosen to fill the panel well.
   */
  private getGridLayout(gridSize: number, topReserve = 0, bottomReserve = 0) {
    const labelW = 42;
    const labelH = 36;
    const maxW = PANEL_W - 80;
    let cellSize: number;
    let startY: number;
    if (topReserve > 0 || bottomReserve > 0) {
      // Fit grid in the space between reserved areas, top-aligned
      const availH = PANEL_H - topReserve - bottomReserve;
      cellSize = Math.floor(Math.min((maxW - labelW) / gridSize, (availH - labelH) / gridSize));
      startY = PANEL_Y + topReserve + labelH;
    } else {
      // Default: center vertically in full panel
      const maxH = PANEL_H - 100;
      cellSize = Math.floor(Math.min((maxW - labelW) / gridSize, (maxH - labelH) / gridSize));
      startY = PANEL_Y + (PANEL_H - labelH - cellSize * gridSize) / 2 + labelH + 10;
    }
    const gridW = cellSize * gridSize;
    const gridH = cellSize * gridSize;
    const startX = PANEL_X + (PANEL_W - labelW - gridW) / 2 + labelW;
    return { cellSize, gridW, gridH, startX, startY, labelW, labelH };
  }

  /**
   * Draws the coordinate grid with row (A–D/E) and column (1–4/5) labels.
   * Returns arrays of cell containers and zones for interaction.
   */
  private drawGrid(
    gridSize: number,
    onCellClick: (row: number, col: number) => void,
    getCellVisual?: (row: number, col: number) => { fillColor: number; alpha: number; label?: string },
    topReserve = 0,
    bottomReserve = 0,
  ) {
    const { cellSize, startX, startY, labelW, labelH } = this.getGridLayout(gridSize, topReserve, bottomReserve);
    this.storedGridLayout = { cellSize, startX, startY };

    this.cellContainers = [];
    this.cellZones = [];

    // Column labels (1, 2, 3, ...)
    for (let c = 0; c < gridSize; c++) {
      const lx = startX + c * cellSize + cellSize / 2;
      const ly = startY - labelH / 2;
      const lbl = this.addSharpText(lx, ly, COL_LABELS[c], {
        fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
        stroke: "#0c1445", strokeThickness: 4,
      }).setOrigin(0.5).setDepth(12);
      this.gameplayObjects.push(lbl);
    }

    // Row labels (A, B, C, ...)
    for (let r = 0; r < gridSize; r++) {
      const lx = startX - labelW / 2;
      const ly = startY + r * cellSize + cellSize / 2;
      const lbl = this.addSharpText(lx, ly, ROW_LABELS[r], {
        fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
        stroke: "#0c1445", strokeThickness: 4,
      }).setOrigin(0.5).setDepth(12);
      this.gameplayObjects.push(lbl);
    }

    // Cells
    for (let r = 0; r < gridSize; r++) {
      this.cellContainers.push([]);
      this.cellZones.push([]);

      for (let c = 0; c < gridSize; c++) {
        const cx = startX + c * cellSize + cellSize / 2;
        const cy = startY + r * cellSize + cellSize / 2;

        const visual = getCellVisual?.(r, c);
        const fillColor = visual?.fillColor ?? 0xffffff;
        const alpha = visual?.alpha ?? 0.92;
        const label = visual?.label ?? "";

        const cellGfx = this.add.graphics().setDepth(15);
        cellGfx.fillStyle(fillColor, alpha);
        cellGfx.fillRoundedRect(-cellSize / 2 + 3, -cellSize / 2 + 3, cellSize - 6, cellSize - 6, 8);
        cellGfx.lineStyle(2, COLORS.gold, 0.5);
        cellGfx.strokeRoundedRect(-cellSize / 2 + 3, -cellSize / 2 + 3, cellSize - 6, cellSize - 6, 8);

        const container = this.add.container(cx, cy).setDepth(15);
        container.add(cellGfx);

        if (label) {
          const emojiTxt = this.addSharpText(0, 0, label, {
            fontSize: `${Math.floor(cellSize * 0.42)}px`, fontFamily: "Arial Black, Arial",
          }).setOrigin(0.5);
          container.add(emojiTxt);
        }

        this.cellContainers[r].push(container);
        this.gameplayObjects.push(container);

        const zone = this.add.zone(cx, cy, cellSize - 4, cellSize - 4).setDepth(20);
        zone.setInteractive({ useHandCursor: true });
        zone.on("pointerover", () => {
          this.input.setDefaultCursor("pointer");
          this.tweens.add({ targets: container, scale: 1.06, duration: 60 });
        });
        zone.on("pointerout", () => {
          this.input.setDefaultCursor("default");
          this.tweens.add({ targets: container, scale: 1, duration: 60 });
        });
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          onCellClick(r, c);
        });

        this.cellZones[r].push(zone);
        this.gameplayObjects.push(zone);
      }
    }
  }

  /**
   * Redraws a single cell's visual state (used to update after hit/miss).
   */
  private updateCellVisual(
    row: number,
    col: number,
    fillColor: number,
    alpha: number,
    label: string,
  ) {
    const container = this.cellContainers[row]?.[col];
    if (!container) return;

    const { cellSize } = this.storedGridLayout.cellSize > 0
      ? this.storedGridLayout
      : this.getGridLayout(this.levelConfig.gridSize);
    container.removeAll(true);

    const gfx = this.add.graphics().setDepth(15);
    gfx.fillStyle(fillColor, alpha);
    gfx.fillRoundedRect(-cellSize / 2 + 3, -cellSize / 2 + 3, cellSize - 6, cellSize - 6, 8);
    gfx.lineStyle(3, fillColor === COLORS.hit ? COLORS.amber : COLORS.darkBlue, 0.8);
    gfx.strokeRoundedRect(-cellSize / 2 + 3, -cellSize / 2 + 3, cellSize - 6, cellSize - 6, 8);
    container.add(gfx);

    if (label) {
      const txt = this.addSharpText(0, 0, label, {
        fontSize: `${Math.floor(cellSize * 0.44)}px`, fontFamily: "Arial Black, Arial",
      }).setOrigin(0.5);
      container.add(txt);
    }
  }

  // ─── N1 — Find the Cell ───────────────────────────────────────────────────

  private buildN1UI() {
    const targets = this.levelConfig.n1Targets!;
    const currentTarget = targets[this.n1Index];

    // Progress dots
    const dotsY = PANEL_Y + 12;
    for (let i = 0; i < targets.length; i++) {
      const dotGfx = this.add.graphics().setDepth(12);
      const color = i < this.n1Index ? COLORS.green : i === this.n1Index ? COLORS.gold : 0xd1d5db;
      dotGfx.fillStyle(color, 1);
      dotGfx.fillCircle(PANEL_X + PANEL_W / 2 - (targets.length - 1) * 16 + i * 32, dotsY, 9);
      dotGfx.lineStyle(2, 0xffffff, 0.8);
      dotGfx.strokeCircle(PANEL_X + PANEL_W / 2 - (targets.length - 1) * 16 + i * 32, dotsY, 9);
      this.gameplayObjects.push(dotGfx);
    }

    // Target coordinate display — kept above grid column labels (labels at startY-18 ≈ 221)
    const promptY = PANEL_Y + 44;
    const promptBg = this.add.graphics().setDepth(11);
    promptBg.fillStyle(COLORS.navy, 0.9);
    promptBg.fillRoundedRect(640 - 260, promptY - 22, 520, 44, 22);
    promptBg.lineStyle(4, COLORS.gold, 1);
    promptBg.strokeRoundedRect(640 - 260, promptY - 22, 520, 44, 22);
    this.gameplayObjects.push(promptBg);

    this.n1CoordText = this.addSharpText(640, promptY + 2, `→ Toque em ${currentTarget} ←`, {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
      stroke: "#0c1445", strokeThickness: 5, align: "center",
    }).setOrigin(0.5).setDepth(12);
    this.gameplayObjects.push(this.n1CoordText);

    this.tweens.add({
      targets: this.n1CoordText,
      scale: { from: 0.95, to: 1.05 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Parse expected cell
    const parseCoord = (s: string) => {
      const [letter, num] = s.split("-");
      return { row: ROW_LABELS.indexOf(letter), col: parseInt(num, 10) - 1 };
    };

    this.drawGrid(
      this.levelConfig.gridSize,
      (row, col) => {
        if (this.gameEnded) return;
        this.onN1CellClick(row, col, parseCoord(currentTarget));
      },
    );
  }

  private onN1CellClick(row: number, col: number, target: { row: number; col: number }) {
    if (this.gameEnded) return;
    this.playClick();
    const isCorrect = row === target.row && col === target.col;

    if (isCorrect) {
      this.hits += 1;
      this.playSuccess();
      // Flash the cell gold
      this.updateCellVisual(row, col, COLORS.hit, 1, "⭐");
      // Disable all zones briefly
      this.cellZones.flat().forEach((z) => z.disableInteractive());
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 15 });
      this.showToast(`✅ Correto! ${ROW_LABELS[row]}-${col + 1}`, COLORS.green, 1400);

      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n1Index += 1;
        if (this.n1Index >= this.levelConfig.n1Targets!.length) {
          this.completeLevel(2 as BattleLevelNumber);
        } else {
          this.clearGameplay();
          this.buildN1UI();
        }
      });
    } else {
      this.errors += 1;
      this.playWrong();
      // Flash red on wrong cell; player must keep trying to find the correct one
      this.updateCellVisual(row, col, COLORS.red, 0.9, "❌");
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.showToast(`❌ Não é essa! Continue tentando.`, COLORS.red, 1200);
      this.cellZones.flat().forEach((z) => z.disableInteractive());
      this.time.delayedCall(650, () => {
        if (this.gameEnded) return;
        // Reset wrong cell back to normal and re-enable all zones
        this.updateCellVisual(row, col, 0xffffff, 0.88, "");
        this.cellZones.flat().forEach((z) => z.setInteractive({ useHandCursor: true }));
      });
    }
  }

  // ─── N2 — What's the Coordinate? ─────────────────────────────────────────

  private buildN2UI() {
    const n2Objects = this.levelConfig.n2Objects!;
    const current = n2Objects[this.n2Index];

    // Progress dots
    const dotsY = PANEL_Y + 12;
    for (let i = 0; i < n2Objects.length; i++) {
      const dotGfx = this.add.graphics().setDepth(12);
      const color = i < this.n2Index ? COLORS.green : i === this.n2Index ? COLORS.gold : 0xd1d5db;
      dotGfx.fillStyle(color, 1);
      dotGfx.fillCircle(PANEL_X + PANEL_W / 2 - (n2Objects.length - 1) * 16 + i * 32, dotsY, 9);
      dotGfx.lineStyle(2, 0xffffff, 0.8);
      dotGfx.strokeCircle(PANEL_X + PANEL_W / 2 - (n2Objects.length - 1) * 16 + i * 32, dotsY, 9);
      this.gameplayObjects.push(dotGfx);
    }

    // Question prompt — kept above grid column labels
    const promptY = PANEL_Y + 44;
    const promptBg = this.add.graphics().setDepth(11);
    promptBg.fillStyle(COLORS.navy, 0.9);
    promptBg.fillRoundedRect(640 - 300, promptY - 22, 600, 44, 22);
    promptBg.lineStyle(4, COLORS.gold, 1);
    promptBg.strokeRoundedRect(640 - 300, promptY - 22, 600, 44, 22);
    this.gameplayObjects.push(promptBg);

    const promptTxt = this.addSharpText(640, promptY + 2, `Onde está o ${current.emoji}?`, {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
      stroke: "#0c1445", strokeThickness: 5, align: "center",
    }).setOrigin(0.5).setDepth(12);
    this.gameplayObjects.push(promptTxt);

    // Draw grid with reserved space: 72px top (prompt area) + 102px bottom (chips area)
    // This keeps grid col-labels below the prompt and grid bottom above the chips
    this.drawGrid(
      this.levelConfig.gridSize,
      () => { /* no direct cell click in N2 */ },
      (r, c) => {
        if (r === current.pos.row && c === current.pos.col) {
          return { fillColor: 0xfef3c7, alpha: 0.95, label: current.emoji };
        }
        return { fillColor: 0xffffff, alpha: 0.88 };
      },
      72,
      102,
    );

    // MCQ option chips below the grid
    this.buildN2Chips(current.options, current.correct, current.pos);
  }

  private buildN2Chips(
    options: string[],
    correct: string,
    objPos: { row: number; col: number },
  ) {
    const chipY = PANEL_Y + PANEL_H - 52;
    const chipW = 210;
    const chipH = 50;
    const gap = 20;
    const totalW = options.length * chipW + (options.length - 1) * gap;
    const startX = 640 - totalW / 2 + chipW / 2;

    this.n2ChipObjects.forEach((o) => o.destroy());
    this.n2ChipObjects = [];

    options.forEach((option, i) => {
      const bx = startX + i * (chipW + gap);
      const btn = this.add.container(bx, chipY).setDepth(22);
      this.n2ChipObjects.push(btn);
      this.gameplayObjects.push(btn);

      const bg = this.add.graphics();
      bg.fillStyle(COLORS.navy, 0.92);
      bg.fillRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      bg.lineStyle(3, COLORS.gold, 0.85);
      bg.strokeRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);

      const txt = this.addSharpText(0, 0, option, {
        fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
        stroke: "#0c1445", strokeThickness: 4,
      }).setOrigin(0.5);

      btn.add([bg, txt]);

      const zone = this.add.zone(bx, chipY, chipW + 10, chipH + 10).setDepth(55);
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        this.tweens.add({ targets: btn, scale: 1.06, duration: 60 });
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        this.tweens.add({ targets: btn, scale: 1, duration: 60 });
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.onN2ChipClick(option, correct, objPos, btn, bg);
      });
      this.n2ChipObjects.push(zone);
      this.gameplayObjects.push(zone);
    });
  }

  private onN2ChipClick(
    selected: string,
    correct: string,
    objPos: { row: number; col: number },
    btn: Phaser.GameObjects.Container,
    bg: Phaser.GameObjects.Graphics,
  ) {
    if (this.gameEnded) return;
    this.playClick();

    // Disable all chips
    this.n2ChipObjects.forEach((o) => {
      if (o instanceof Phaser.GameObjects.Zone) o.disableInteractive();
    });

    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      // Highlight the chip green
      bg.clear();
      bg.fillStyle(COLORS.green, 1);
      bg.fillRoundedRect(-105, -25, 210, 50, 25);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-105, -25, 210, 50, 25);

      // Highlight row and column of the object
      this.highlightRowCol(objPos.row, objPos.col);

      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 15 });
      this.showToast(`✅ Correto! Era ${correct}`, COLORS.green, 1400);

      this.time.delayedCall(1600, () => {
        if (this.gameEnded) return;
        this.n2Index += 1;
        if (this.n2Index >= this.levelConfig.n2Objects!.length) {
          this.completeLevel(3 as BattleLevelNumber);
        } else {
          this.clearGameplay();
          this.buildN2UI();
        }
      });
    } else {
      this.errors += 1;
      this.playWrong();
      // Flash the clicked chip red
      this.tweens.add({
        targets: btn,
        alpha: { from: 1, to: 0.3 },
        duration: 120,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          // Re-enable chips
          this.n2ChipObjects.forEach((o) => {
            if (o instanceof Phaser.GameObjects.Zone) o.setInteractive({ useHandCursor: true });
          });
        },
      });
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.showToast(`❌ Tente outra opção!`, COLORS.red, 1200);
    }
  }

  /**
   * Briefly highlights the row and column of the correctly-identified object.
   */
  private highlightRowCol(row: number, col: number) {
    const { cellSize, startX, startY } = this.storedGridLayout.cellSize > 0
      ? this.storedGridLayout
      : this.getGridLayout(this.levelConfig.gridSize);
    const gfx = this.add.graphics().setDepth(14);
    // Row highlight
    gfx.fillStyle(COLORS.gold, 0.2);
    gfx.fillRect(startX, startY + row * cellSize + 3, cellSize * this.levelConfig.gridSize, cellSize - 6);
    // Col highlight
    gfx.fillRect(startX + col * cellSize + 3, startY, cellSize - 6, cellSize * this.levelConfig.gridSize);
    this.gameplayObjects.push(gfx);
    // Fade out
    this.tweens.add({ targets: gfx, alpha: 0, duration: 900, delay: 600, onComplete: () => gfx.destroy() });
  }

  // ─── N3 — Battle / Hunt Ships ─────────────────────────────────────────────

  private buildN3UI() {
    const ships = this.levelConfig.ships!;
    const gridSize = this.levelConfig.gridSize;

    // Init cell states
    this.n3CellStates = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => "untouched" as CellState),
    );

    // Ships found counter
    const counterBg = this.add.graphics().setDepth(12);
    counterBg.fillStyle(COLORS.navy, 0.88);
    counterBg.fillRoundedRect(640 - 220, PANEL_Y + 20, 440, 52, 26);
    counterBg.lineStyle(3, COLORS.gold, 0.9);
    counterBg.strokeRoundedRect(640 - 220, PANEL_Y + 20, 440, 52, 26);
    this.gameplayObjects.push(counterBg);

    const counterTxt = this.addSharpText(640, PANEL_Y + 46, `🚢 Navios: 0 / ${ships.length}`, {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#f59e0b",
      stroke: "#0c1445", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(13);
    counterTxt.setName("n3Counter");
    this.gameplayObjects.push(counterTxt);

    // Draw the grid
    this.drawGrid(
      gridSize,
      (row, col) => {
        if (this.gameEnded) return;
        this.onN3CellAttack(row, col, ships);
      },
    );
  }

  private onN3CellAttack(row: number, col: number, ships: Array<{ row: number; col: number }>) {
    if (this.gameEnded) return;
    if (this.n3CellStates[row][col] !== "untouched") {
      this.showToast("Já atacaste aqui!", COLORS.slate, 800);
      return;
    }

    this.playClick();

    const isHit = ships.some((s) => s.row === row && s.col === col);

    if (isHit) {
      this.n3CellStates[row][col] = "hit";
      this.n3ShipsFound += 1;
      this.updateCellVisual(row, col, COLORS.hit, 1, "💥");
      this.cellZones[row][col].disableInteractive();
      this.playExplosion();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 15 });
      this.hits += 1;

      // Update counter
      const counter = this.children.getByName("n3Counter") as Phaser.GameObjects.Text | null;
      if (counter) counter.setText(`🚢 Navios: ${this.n3ShipsFound} / ${ships.length}`);

      this.showToast(`💥 Acertou um navio! (${this.n3ShipsFound}/${ships.length})`, COLORS.gold, 1200);

      if (this.n3ShipsFound >= ships.length) {
        this.time.delayedCall(800, () => this.completeFinalLevel());
      }
    } else {
      this.n3CellStates[row][col] = "miss";
      this.updateCellVisual(row, col, COLORS.miss, 0.85, "🌊");
      this.cellZones[row][col].disableInteractive();
      this.playWaterSplash();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.errors += 1;
      this.showToast("🌊 Água! Tente outra célula.", COLORS.darkBlue, 1000);
    }
  }

  // ─── Clear Gameplay Objects ────────────────────────────────────────────────

  private clearGameplay() {
    this.gameplayObjects.forEach((o) => o.destroy());
    this.gameplayObjects = [];
    this.cellContainers = [];
    this.cellZones = [];
    this.n2ChipObjects = [];
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel(nextLevel: BattleLevelNumber) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      stage: nextLevel,
      progress: (this.levelConfig.level) / 3,
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

  private showLevelCompleteScreen(nextLevel: BattleLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.62).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.green, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.green, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -70, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#15803d", stroke: "#ffffff", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -14, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(
        num <= this.levelConfig.level ? COLORS.green : num === nextLevel ? COLORS.amber : 0xd1d5db,
        1,
      );
      d.fillCircle(-28 + i * 28, 88, 9);
      d.lineStyle(2, 0xffffff, 0.8);
      d.strokeCircle(-28 + i * 28, 88, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let i = 0; i < 14; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const c = [COLORS.navy, COLORS.green, COLORS.amber, COLORS.blue, COLORS.gold][i % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(c, 0.85);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 56, duration: 1600, delay: i * 90 });
    }

    this.time.delayedCall(1800, () => {
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors });
    });
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.66).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.navy, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.navy, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 7,
    }).setOrigin(0.5);

    const sub = this.addSharpText(0, -30, "Você completou todos os níveis da\nBatalha das Coordenadas!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#0c1445", align: "center",
    }).setOrigin(0.5);

    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);

    // Sparkles
    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle(
        [COLORS.navy, COLORS.amber, COLORS.green, COLORS.blue, COLORS.gold][i % 5],
        0.9,
      );
      sp.fillCircle(
        Phaser.Math.Between(-290, 290),
        Phaser.Math.Between(-200, 190),
        Phaser.Math.Between(4, 9),
      );
      this.tweens.add({
        targets: sp,
        alpha: { from: 0.3, to: 1 },
        scale: { from: 0.7, to: 1.4 },
        duration: 640 + i * 40,
        yoyo: true,
        repeat: -1,
      });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.navy, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, 0xffffff, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);

    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0c1445", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, ribbon, ...sparkles, stars, title, sub, desc, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(
      this.add.zone(640, 360 + 108 * MODAL_SCALE, 278 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => {
      this.playClick();
      EventBus.emit("exit-game");
    });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.7).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -144, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -78, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626", stroke: "#ffffff", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -22, "⏰ Tempo esgotado!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(
      0, 28,
      `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`,
      { fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b" },
    ).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(COLORS.green, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, 0xffffff, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "🔄 Tentar Novamente", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.orange, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, 0xffffff, 1);
    exitBg.strokeRoundedRect(22, 68, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 94, "🚪 Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#78350f", strokeThickness: 3,
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
    ez.on("pointerdown", () => {
      this.playClick();
      EventBus.emit("exit-game");
    });
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
    return Math.max(0, this.hits * 15 - this.errors * 5);
  }

  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const scale = Math.min(maxW / image.width, maxH / image.height);
    image.setScale(scale);
    return image;
  }

  private addSharpText(
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 618).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, 0xffffff, 0.9);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", align: "center", wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({
      targets: container,
      y: 600,
      alpha: 0,
      duration: 300,
      delay: duration,
      onComplete: () => container.destroy(),
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

  private playExplosion() {
    // Boom: low thud + descending noise
    this.playTone(80, 0.15, "square", 0.08);
    this.time.delayedCall(60, () => this.playTone(220, 0.1, "sawtooth", 0.06));
    this.time.delayedCall(140, () => this.playTone(440, 0.08, "triangle", 0.05));
  }

  private playWaterSplash() {
    // Soft descending "splash"
    this.playTone(600, 0.07, "sine", 0.04);
    this.time.delayedCall(60, () => this.playTone(400, 0.07, "sine", 0.04));
    this.time.delayedCall(130, () => this.playTone(250, 0.06, "sine", 0.03));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AC =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
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
    } catch {
      // audio not available
    }
  }
}
