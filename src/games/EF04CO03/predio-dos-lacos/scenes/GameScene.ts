import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type { BuildingLevel, LoopLevelNumber, N1Round, N2Round, N3Round } from "../types";

const GAME_ID = "predio-dos-lacos";

// ── Layout constants ──────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

// Building grid split: left ~60%, right ~40%
const GRID_AREA_W = 680;
const EDITOR_X = PANEL_X + GRID_AREA_W + 20;
const EDITOR_W = PANEL_W - GRID_AREA_W - 30;

const WINDOW_W = 90;
const WINDOW_H = 70;
const WINDOW_GAP = 10;

const COLORS = {
  blue:      0x1e40af,
  blueMid:   0x2563eb,
  blueLight: 0xbfdbfe,
  green:     0x16a34a,
  greenMid:  0x22c55e,
  greenLight:0xbbf7d0,
  amber:     0xd97706,
  amberLight:0xfef3c7,
  red:       0xdc2626,
  orange:    0xf59e0b,
  white:     0xffffff,
  slate:     0x334155,
  gray:      0x64748b,
  dark:      0x0f172a,
  ink:       0x1e293b,
  dirty:     0x78450a,
  dirtyAlt:  0x92400e,
  clean:     0x7dd3fc,
  gold:      0xfbbf24,
  panelBg:   0x1e3a5f,
  panelBd:   0x3b82f6,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: BuildingLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // Window grid state
  private windowRects: Phaser.GameObjects.Rectangle[][] = [];
  private cleanerText?: Phaser.GameObjects.Text;
  private cleanerRunning = false;

  // N1 state
  private n1RoundIndex = 0;
  private n1SelectedChip: number | null = null;
  private n1ExecuteBtnBg?: Phaser.GameObjects.Graphics;
  private n1ExecuteBtnZone?: Phaser.GameObjects.Zone;

  // N2 state
  private n2RoundIndex = 0;
  private n2OuterValue = 1;
  private n2InnerValue = 1;
  private n2OuterLabel?: Phaser.GameObjects.Text;
  private n2InnerLabel?: Phaser.GameObjects.Text;

  // N3 state
  private n3RoundIndex = 0;
  private n3OuterValue = 1;
  private n3InnerValue = 1;
  private n3OuterLabel?: Phaser.GameObjects.Text;
  private n3InnerLabel?: Phaser.GameObjects.Text;
  private n3SelectedCount: number | null = null;
  private n3ExecuteBtnBg?: Phaser.GameObjects.Graphics;
  private n3ExecuteBtnZone?: Phaser.GameObjects.Zone;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as LoopLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1RoundIndex = 0;
    this.n1SelectedChip = null;
    this.n2RoundIndex = 0;
    this.n2OuterValue = 1;
    this.n2InnerValue = 1;
    this.n3RoundIndex = 0;
    this.n3OuterValue = 1;
    this.n3InnerValue = 1;
    this.n3SelectedCount = null;
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.contentObjects = [];
    this.windowRects = [];
    this.cleanerRunning = false;
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
      this.levelConfig.level === 1 ? "bg-building-day"
      : this.levelConfig.level === 2 ? "bg-building-sunset"
      : "bg-building-night";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, COLORS.dark, 0.55).setDepth(-89);
  }

  // ─── Timer Bar ────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(COLORS.slate, 0.18);
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

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
      stroke: "#1e40af", strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(COLORS.white, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.blueLight, 0.3);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, COLORS.blue, 0.9);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      backgroundColor: "rgba(191,219,254,0.9)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(6);
  }

  // ─── Panel Background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(COLORS.dark, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(COLORS.panelBg, 0.72);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(COLORS.white, 0.05);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(4, COLORS.panelBd, 0.7);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);

    // Vertical divider between grid and editor
    const divX = PANEL_X + GRID_AREA_W + 10;
    panel.lineStyle(2, COLORS.blueLight, 0.25);
    panel.lineBetween(divX, PANEL_Y + 20, divX, PANEL_Y + PANEL_H - 20);
  }

  // ─── Content Helpers ──────────────────────────────────────────────────────

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
    this.windowRects = [];
    this.cleanerText = undefined;
    this.n1ExecuteBtnBg = undefined;
    this.n1ExecuteBtnZone = undefined;
    this.n2OuterLabel = undefined;
    this.n2InnerLabel = undefined;
    this.n3OuterLabel = undefined;
    this.n3InnerLabel = undefined;
    this.n3ExecuteBtnBg = undefined;
    this.n3ExecuteBtnZone = undefined;
    this.cleanerRunning = false;
  }

  // ─── Start Screen ─────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.dark, 0.7).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(0x1e3a5f, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.blue, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.blue, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#bfdbfe", stroke: "#1e40af", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#bfdbfe", stroke: "#1e40af", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.green, 0.18);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);
    tipBg.lineStyle(2, COLORS.green, 0.4);
    tipBg.strokeRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#86efac", align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.green, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#16a34a", strokeThickness: 3,
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
      this.showN1Round();
    } else if (this.levelConfig.level === 2) {
      this.showN2Round();
    } else {
      this.showN3Round();
    }
  }

  // ─── Building Grid ────────────────────────────────────────────────────────

  private createBuildingGrid(
    floors: number,
    windows: number,
    alreadyClean?: [number, number][],
  ): Phaser.GameObjects.Rectangle[][] {
    const gridW = windows * (WINDOW_W + WINDOW_GAP) - WINDOW_GAP;
    const gridH = floors * (WINDOW_H + WINDOW_GAP) - WINDOW_GAP;
    const gridX = PANEL_X + 10 + (GRID_AREA_W - gridW) / 2;
    const gridY = PANEL_Y + (PANEL_H - gridH) / 2;

    const grid: Phaser.GameObjects.Rectangle[][] = [];

    // Building facade
    const buildingBg = this.addContent(this.add.graphics().setDepth(8));
    buildingBg.fillStyle(COLORS.ink, 0.7);
    buildingBg.fillRoundedRect(gridX - 16, gridY - 16, gridW + 32, gridH + 32, 12);
    buildingBg.lineStyle(3, COLORS.panelBd, 0.5);
    buildingBg.strokeRoundedRect(gridX - 16, gridY - 16, gridW + 32, gridH + 32, 12);

    for (let row = 0; row < floors; row++) {
      grid[row] = [];
      for (let col = 0; col < windows; col++) {
        const wx = gridX + col * (WINDOW_W + WINDOW_GAP);
        const wy = gridY + row * (WINDOW_H + WINDOW_GAP);

        const isClean = alreadyClean
          ? alreadyClean.some(([r, c]) => r === row && c === col)
          : false;

        const rect = this.addContent(
          this.add.rectangle(wx + WINDOW_W / 2, wy + WINDOW_H / 2, WINDOW_W, WINDOW_H,
            isClean ? COLORS.gold : COLORS.dirty),
        );
        rect.setStrokeStyle(3, isClean ? COLORS.gold : COLORS.dirtyAlt);
        rect.setDepth(10);

        // Dirt/grime overlay on dirty windows
        if (!isClean) {
          const grime = this.addContent(this.add.graphics().setDepth(11));
          grime.fillStyle(0x000000, 0.25);
          grime.fillRoundedRect(wx + 4, wy + 4, WINDOW_W - 8, WINDOW_H - 8, 4);
        }

        // Gold checkmark on already-clean windows
        if (isClean) {
          this.addContent(this.addSharpText(wx + WINDOW_W / 2, wy + WINDOW_H / 2, "✓", {
            fontSize: "28px", fontFamily: "Arial Black, Arial", color: "#1e293b",
          }).setOrigin(0.5).setDepth(12));
        }

        grid[row][col] = rect;
      }
    }

    return grid;
  }

  // ─── Cleaner Sprite ───────────────────────────────────────────────────────

  private createCleaner(startX: number, startY: number): Phaser.GameObjects.Text {
    const cleaner = this.addContent(
      this.addSharpText(startX, startY, "🧹", {
        fontSize: "40px", fontFamily: "Arial Black, Arial",
      }).setOrigin(0.5).setDepth(15),
    );
    return cleaner;
  }

  // ─── Cleaner Animation ────────────────────────────────────────────────────

  private animateCleaner(
    grid: Phaser.GameObjects.Rectangle[][],
    floors: number,
    windows: number,
    onComplete: () => void,
    alreadyClean?: [number, number][],
  ) {
    if (!this.cleanerText) return;
    const cleaner = this.cleanerText;
    const sequence: Array<{ x: number; y: number; row: number; col: number }> = [];

    for (let row = 0; row < floors; row++) {
      for (let col = 0; col < windows; col++) {
        const rect = grid[row]?.[col];
        if (rect) {
          sequence.push({ x: rect.x, y: rect.y, row, col });
        }
      }
    }

    let step = 0;
    const processNext = () => {
      if (step >= sequence.length) {
        this.playSuccess();
        onComplete();
        return;
      }
      const { x, y, row, col } = sequence[step];
      step++;

      this.tweens.add({
        targets: cleaner,
        x, y,
        duration: Math.max(80, 400 - sequence.length * 8),
        ease: "Linear",
        onComplete: () => {
          const rect = grid[row]?.[col];
          if (rect) {
            const isAlreadyClean = alreadyClean?.some(([r, c]) => r === row && c === col) ?? false;
            if (!isAlreadyClean) {
              // Clean animation — dirty to clean
              this.tweens.add({
                targets: rect,
                alpha: { from: 0.5, to: 1 },
                duration: 120,
                onStart: () => {
                  rect.setFillStyle(COLORS.clean);
                  rect.setStrokeStyle(3, COLORS.blueMid);
                },
              });
              this.playTone(660 + row * 40 + col * 20, 0.06, "sine", 0.05);
            } else {
              // Already clean — just pulse gold
              this.tweens.add({ targets: rect, alpha: { from: 0.6, to: 1 }, duration: 100 });
              this.playTone(880, 0.04, "triangle", 0.03);
            }
          }
          this.time.delayedCall(40, processNext);
        },
      });
    };

    processNext();
  }

  // ─── N1 — Laço Simples ────────────────────────────────────────────────────

  private showN1Round() {
    this.clearContent();
    this.n1SelectedChip = null;
    const rounds = this.levelConfig.n1Rounds!;
    if (this.n1RoundIndex >= rounds.length) {
      this.completeLevel();
      return;
    }
    const round: N1Round = rounds[this.n1RoundIndex];

    // Progress dots
    this.buildProgressDots(rounds.length, this.n1RoundIndex);

    // Building grid (1 floor)
    this.windowRects = this.createBuildingGrid(round.floors, round.windows);

    // Place cleaner to the left of first window
    const firstRect = this.windowRects[0]?.[0];
    if (firstRect) {
      this.cleanerText = this.createCleaner(firstRect.x - WINDOW_W - 10, firstRect.y);
    }

    // Editor panel
    this.buildN1Editor(round);
  }

  private buildN1Editor(round: N1Round) {
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;

    // Editor bg
    const edBg = this.addContent(this.add.graphics().setDepth(8));
    edBg.fillStyle(COLORS.dark, 0.5);
    edBg.fillRoundedRect(ex, ey, ew, 380, 16);
    edBg.lineStyle(2, COLORS.blueLight, 0.2);
    edBg.strokeRoundedRect(ex, ey, ew, 380, 16);

    // Loop block label
    this.addContent(this.addSharpText(ex + ew / 2, ey + 24, "🔁 Bloco do Laço", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(10));

    // Outer loop block (blue)
    const blockX = ex + 10;
    const blockY = ey + 50;
    const blockW = ew - 20;

    const outerBg = this.addContent(this.add.graphics().setDepth(9));
    outerBg.fillStyle(COLORS.blue, 0.8);
    outerBg.fillRoundedRect(blockX, blockY, blockW, 90, 12);
    outerBg.lineStyle(3, COLORS.blueLight, 0.7);
    outerBg.strokeRoundedRect(blockX, blockY, blockW, 90, 12);

    this.addContent(this.addSharpText(blockX + 12, blockY + 12, "REPETIR", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0).setDepth(10));

    this.addContent(this.addSharpText(blockX + 12, blockY + 36, "[  ?  ]", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#1e40af", strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(10));

    this.addContent(this.addSharpText(blockX + 80, blockY + 36, "VEZES  {", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0.5).setDepth(10));

    // Inner action block (green inside)
    const innerBg = this.addContent(this.add.graphics().setDepth(9));
    innerBg.fillStyle(COLORS.green, 0.7);
    innerBg.fillRoundedRect(blockX + 20, blockY + 52, blockW - 40, 32, 8);

    this.addContent(this.addSharpText(blockX + 20 + (blockW - 40) / 2, blockY + 68, "🧹 LIMPAR", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#ffffff",
    }).setOrigin(0.5).setDepth(10));

    this.addContent(this.addSharpText(blockX + blockW - 12, blockY + 86, "}", {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(1, 1).setDepth(10));

    // Chip instructions
    this.addContent(this.addSharpText(ex + ew / 2, blockY + 108, "Escolha o número correto:", {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center",
    }).setOrigin(0.5).setDepth(10));

    // MCQ chips
    const chipW = (ew - 40) / 3;
    const chipH = 48;
    const chipY = blockY + 126;
    round.options.forEach((opt, i) => {
      const cx = blockX + i * (chipW + 10);
      this.buildN1Chip(cx, chipY, chipW, chipH, opt, round);
    });

    // Execute button (initially hidden)
    this.buildN1ExecuteButton(round);
  }

  private buildN1Chip(cx: number, cy: number, cw: number, ch: number, value: number, round: N1Round) {
    const chipBg = this.addContent(this.add.graphics().setDepth(11));
    const drawChip = (selected: boolean) => {
      chipBg.clear();
      chipBg.fillStyle(selected ? COLORS.green : COLORS.dark, selected ? 0.9 : 0.7);
      chipBg.fillRoundedRect(cx, cy, cw, ch, ch / 2);
      chipBg.lineStyle(3, selected ? COLORS.greenMid : COLORS.blueLight, selected ? 1 : 0.5);
      chipBg.strokeRoundedRect(cx, cy, cw, ch, ch / 2);
    };
    drawChip(false);

    const chipTxt = this.addContent(this.addSharpText(cx + cw / 2, cy + ch / 2, String(value), {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    const zone = this.addContent(this.add.zone(cx + cw / 2, cy + ch / 2, cw, ch).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      if (this.gameEnded) return;
      this.input.setDefaultCursor("pointer");
      if (this.n1SelectedChip !== value) {
        chipBg.clear();
        chipBg.fillStyle(COLORS.blueMid, 0.5);
        chipBg.fillRoundedRect(cx, cy, cw, ch, ch / 2);
        chipBg.lineStyle(3, COLORS.blueLight, 0.9);
        chipBg.strokeRoundedRect(cx, cy, cw, ch, ch / 2);
      }
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      drawChip(this.n1SelectedChip === value);
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.n1SelectedChip = value;
      // Redraw all chips (done by re-reading contentObjects is complex — just update this chip)
      drawChip(true);
      chipTxt.setColor("#ffffff");
      this.showN1ExecuteButton(round);
    });
  }

  private buildN1ExecuteButton(round: N1Round) {
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;
    const btnY = ey + 210;

    this.n1ExecuteBtnBg = this.addContent(this.add.graphics().setDepth(11));
    this.n1ExecuteBtnBg.setAlpha(0);

    this.addContent(this.addSharpText(ex + ew / 2, btnY + 24, "▶ EXECUTAR", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#16a34a", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12)).setAlpha(0);

    const zone = this.addContent(this.add.zone(ex + ew / 2, btnY + 24, ew - 20, 48).setDepth(56));
    zone.setInteractive({ useHandCursor: true });
    this.n1ExecuteBtnZone = zone;

    zone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning || this.n1SelectedChip === null) return;
      this.onN1Execute(round);
    });
  }

  private showN1ExecuteButton(round: N1Round) {
    if (!this.n1ExecuteBtnBg) return;
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;
    const btnY = ey + 210;
    const btnBg = this.n1ExecuteBtnBg;

    btnBg.clear();
    btnBg.fillStyle(COLORS.green, 1);
    btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    btnBg.setAlpha(1);

    // Find execute text and make it visible
    this.contentObjects.forEach((o) => {
      if (o instanceof Phaser.GameObjects.Text && o.text === "▶ EXECUTAR") {
        o.setAlpha(1);
      }
    });

    this.n1ExecuteBtnZone?.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      btnBg.clear();
      btnBg.fillStyle(COLORS.greenMid, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    });
    this.n1ExecuteBtnZone?.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      btnBg.clear();
      btnBg.fillStyle(COLORS.green, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    });

    // Hint label
    this.addContent(this.addSharpText(ex + ew / 2, btnY + 64, `Laço: REPETIR ${round.correct} VEZES`, {
      fontSize: "14px", fontFamily: "Arial Black, Arial",
      color: this.n1SelectedChip === round.correct ? "#86efac" : "#fca5a5",
      align: "center",
    }).setOrigin(0.5).setDepth(10));
  }

  private onN1Execute(round: N1Round) {
    if (this.gameEnded) return;
    this.cleanerRunning = true;

    if (this.n1SelectedChip !== round.correct) {
      // Wrong answer
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.showToast(`❌ Não é ${this.n1SelectedChip}! Conte as janelas novamente.`, COLORS.red, 2000);
      this.shakeCamera();
      this.n1SelectedChip = null;
      this.cleanerRunning = false;
      // Reset execute button
      if (this.n1ExecuteBtnBg) {
        this.n1ExecuteBtnBg.clear();
        this.n1ExecuteBtnBg.setAlpha(0);
      }
      this.contentObjects.forEach((o) => {
        if (o instanceof Phaser.GameObjects.Text && o.text === "▶ EXECUTAR") {
          o.setAlpha(0);
        }
      });
      return;
    }

    // Correct — animate cleaner
    this.animateCleaner(this.windowRects, round.floors, round.windows, () => {
      this.cleanerRunning = false;
      if (this.gameEnded) return;
      this.hits += 1;
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.showToast(`✅ Correto! REPETIR ${round.correct} VEZES limpou todas as janelas!`, COLORS.green, 1400);
      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n1RoundIndex += 1;
        this.showN1Round();
      });
    });
  }

  // ─── N2 — Laço Aninhado ───────────────────────────────────────────────────

  private showN2Round() {
    this.clearContent();
    this.n2OuterValue = 1;
    this.n2InnerValue = 1;
    const rounds = this.levelConfig.n2Rounds!;
    if (this.n2RoundIndex >= rounds.length) {
      this.completeLevel();
      return;
    }
    const round: N2Round = rounds[this.n2RoundIndex];

    this.buildProgressDots(rounds.length, this.n2RoundIndex);
    this.windowRects = this.createBuildingGrid(round.floors, round.windows);

    const firstRect = this.windowRects[0]?.[0];
    if (firstRect) {
      this.cleanerText = this.createCleaner(firstRect.x - WINDOW_W - 10, firstRect.y);
    }

    this.buildN2Editor(round);
  }

  private buildN2Editor(round: N2Round) {
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;

    const edBg = this.addContent(this.add.graphics().setDepth(8));
    edBg.fillStyle(COLORS.dark, 0.5);
    edBg.fillRoundedRect(ex, ey, ew, 440, 16);
    edBg.lineStyle(2, COLORS.blueLight, 0.2);
    edBg.strokeRoundedRect(ex, ey, ew, 440, 16);

    this.addContent(this.addSharpText(ex + ew / 2, ey + 24, "🔁 Laços Aninhados", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(10));

    // Outer loop (blue)
    const outerX = ex + 10;
    const outerY = ey + 46;
    const outerW = ew - 20;

    const outerBg = this.addContent(this.add.graphics().setDepth(9));
    outerBg.fillStyle(COLORS.blue, 0.75);
    outerBg.fillRoundedRect(outerX, outerY, outerW, 200, 12);
    outerBg.lineStyle(3, COLORS.blueLight, 0.7);
    outerBg.strokeRoundedRect(outerX, outerY, outerW, 200, 12);

    this.addContent(this.addSharpText(outerX + 10, outerY + 10, "REPETIR", {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0).setDepth(10));

    // Outer counter
    this.buildCounter(outerX + 10, outerY + 30, outerW - 20, "andares", "outer", round.floors);

    this.addContent(this.addSharpText(outerX + 10, outerY + 90, "VEZES  {", {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0).setDepth(10));

    // Inner loop (green)
    const innerX = outerX + 16;
    const innerY = outerY + 110;
    const innerW = outerW - 32;

    const innerBg = this.addContent(this.add.graphics().setDepth(9));
    innerBg.fillStyle(COLORS.green, 0.7);
    innerBg.fillRoundedRect(innerX, innerY, innerW, 76, 10);
    innerBg.lineStyle(3, COLORS.greenLight, 0.6);
    innerBg.strokeRoundedRect(innerX, innerY, innerW, 76, 10);

    this.addContent(this.addSharpText(innerX + 8, innerY + 8, "REPETIR", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bbf7d0",
    }).setOrigin(0, 0).setDepth(10));

    // Inner counter
    this.buildCounter(innerX + 8, innerY + 24, innerW - 16, "janelas", "inner", round.windows);

    this.addContent(this.addSharpText(innerX + 8, innerY + 56, "VEZES  { 🧹 LIMPAR }", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bbf7d0",
    }).setOrigin(0, 0).setDepth(10));

    this.addContent(this.addSharpText(outerX + outerW - 10, outerY + 198, "}", {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(1, 1).setDepth(10));

    // Execute button
    const btnY = ey + 260;
    this.buildExecuteButton(ex, ew, btnY, () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.onN2Execute(round);
    });

    // Hint
    this.addContent(this.addSharpText(ex + ew / 2, btnY + 64, `Meta: ${round.floors} andares × ${round.windows} janelas`, {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center",
    }).setOrigin(0.5).setDepth(10));
  }

  private buildCounter(
    x: number,
    y: number,
    w: number,
    label: string,
    type: "outer" | "inner",
    _target: number,
  ) {
    const btnSize = 36;
    const gap = 8;

    // Minus button
    const minusBg = this.addContent(this.add.graphics().setDepth(11));
    minusBg.fillStyle(COLORS.dark, 0.7);
    minusBg.fillRoundedRect(x, y, btnSize, btnSize, btnSize / 2);
    minusBg.lineStyle(2, COLORS.blueLight, 0.6);
    minusBg.strokeRoundedRect(x, y, btnSize, btnSize, btnSize / 2);
    const minusTxt = this.addContent(this.addSharpText(x + btnSize / 2, y + btnSize / 2, "▼", {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(12));

    // Value display
    const valX = x + btnSize + gap;
    const valW = w - 2 * (btnSize + gap);
    const valBg = this.addContent(this.add.graphics().setDepth(11));
    valBg.fillStyle(COLORS.white, 0.15);
    valBg.fillRoundedRect(valX, y, valW, btnSize, 8);

    const initialVal = type === "outer" ? this.n2OuterValue : (
      type === "inner" ? this.n2InnerValue : this.n3OuterValue
    );
    const valLabel = this.addContent(this.addSharpText(valX + valW / 2, y + btnSize / 2, String(initialVal), {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12));

    if (this.levelConfig.level === 2) {
      if (type === "outer") this.n2OuterLabel = valLabel;
      else this.n2InnerLabel = valLabel;
    } else {
      if (type === "outer") this.n3OuterLabel = valLabel;
      else this.n3InnerLabel = valLabel;
    }

    // Plus button
    const plusX = x + w - btnSize;
    const plusBg = this.addContent(this.add.graphics().setDepth(11));
    plusBg.fillStyle(COLORS.dark, 0.7);
    plusBg.fillRoundedRect(plusX, y, btnSize, btnSize, btnSize / 2);
    plusBg.lineStyle(2, COLORS.blueLight, 0.6);
    plusBg.strokeRoundedRect(plusX, y, btnSize, btnSize, btnSize / 2);
    const plusTxt = this.addContent(this.addSharpText(plusX + btnSize / 2, y + btnSize / 2, "▲", {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(12));

    // Label
    this.addContent(this.addSharpText(valX + valW / 2, y + btnSize + 4, label, {
      fontSize: "11px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
    }).setOrigin(0.5, 0).setDepth(10));

    // Minus zone
    const minusZone = this.addContent(this.add.zone(x + btnSize / 2, y + btnSize / 2, btnSize + 8, btnSize + 8).setDepth(55));
    minusZone.setInteractive({ useHandCursor: true });
    minusZone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); minusTxt.setColor("#ffffff"); });
    minusZone.on("pointerout", () => { this.input.setDefaultCursor("default"); minusTxt.setColor("#bfdbfe"); });
    minusZone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.adjustCounter(type, -1, valLabel);
    });

    // Plus zone
    const plusZone = this.addContent(this.add.zone(plusX + btnSize / 2, y + btnSize / 2, btnSize + 8, btnSize + 8).setDepth(55));
    plusZone.setInteractive({ useHandCursor: true });
    plusZone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); plusTxt.setColor("#ffffff"); });
    plusZone.on("pointerout", () => { this.input.setDefaultCursor("default"); plusTxt.setColor("#bfdbfe"); });
    plusZone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.adjustCounter(type, +1, valLabel);
    });
  }

  private adjustCounter(type: "outer" | "inner", delta: number, label: Phaser.GameObjects.Text) {
    if (this.levelConfig.level === 2) {
      if (type === "outer") {
        this.n2OuterValue = Phaser.Math.Clamp(this.n2OuterValue + delta, 1, 6);
        label.setText(String(this.n2OuterValue));
      } else {
        this.n2InnerValue = Phaser.Math.Clamp(this.n2InnerValue + delta, 1, 6);
        label.setText(String(this.n2InnerValue));
      }
    } else {
      if (type === "outer") {
        this.n3OuterValue = Phaser.Math.Clamp(this.n3OuterValue + delta, 1, 6);
        label.setText(String(this.n3OuterValue));
      } else {
        this.n3InnerValue = Phaser.Math.Clamp(this.n3InnerValue + delta, 1, 6);
        label.setText(String(this.n3InnerValue));
      }
    }
  }

  private buildExecuteButton(ex: number, ew: number, btnY: number, callback: () => void) {
    const btnBg = this.addContent(this.add.graphics().setDepth(11));
    btnBg.fillStyle(COLORS.green, 1);
    btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);

    this.addContent(this.addSharpText(ex + ew / 2, btnY + 24, "▶ EXECUTAR", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#16a34a", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12));

    const zone = this.addContent(this.add.zone(ex + ew / 2, btnY + 24, ew - 20, 48).setDepth(56));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      btnBg.clear();
      btnBg.fillStyle(COLORS.greenMid, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      btnBg.clear();
      btnBg.fillStyle(COLORS.green, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 48, 24);
    });
    zone.on("pointerdown", callback);
  }

  private onN2Execute(round: N2Round) {
    if (this.gameEnded) return;
    const outerCorrect = this.n2OuterValue === round.floors;
    const innerCorrect = this.n2InnerValue === round.windows;

    this.cleanerRunning = true;

    if (!outerCorrect || !innerCorrect) {
      // Animate with wrong values, then show error
      this.animateCleaner(this.windowRects, this.n2OuterValue, this.n2InnerValue, () => {
        this.cleanerRunning = false;
        if (this.gameEnded) return;
        this.errors += 1;
        this.playWrong();
        runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
        const msg = !outerCorrect && !innerCorrect
          ? `❌ Andares e janelas incorretos! Eram ${round.floors} andares × ${round.windows} janelas.`
          : !outerCorrect
          ? `❌ Número de andares errado! O prédio tem ${round.floors} andares.`
          : `❌ Janelas por andar erradas! Cada andar tem ${round.windows} janelas.`;
        this.showToast(msg, COLORS.red, 2500);
        this.shakeCamera();
        // Reset grid and counters
        this.n2OuterValue = 1;
        this.n2InnerValue = 1;
        this.n2OuterLabel?.setText("1");
        this.n2InnerLabel?.setText("1");
        // Redraw dirty windows
        this.windowRects.forEach((row) => {
          row.forEach((rect) => {
            rect.setFillStyle(COLORS.dirty);
            rect.setStrokeStyle(3, COLORS.dirtyAlt);
            rect.setAlpha(1);
          });
        });
        // Reset cleaner position
        const firstRect = this.windowRects[0]?.[0];
        if (firstRect && this.cleanerText) {
          this.cleanerText.setPosition(firstRect.x - WINDOW_W - 10, firstRect.y);
        }
      });
      return;
    }

    // Correct
    this.animateCleaner(this.windowRects, round.floors, round.windows, () => {
      this.cleanerRunning = false;
      if (this.gameEnded) return;
      this.hits += 1;
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.showToast(`✅ Correto! ${round.floors} andares × ${round.windows} janelas = todas limpas!`, COLORS.green, 1800);
      this.time.delayedCall(1900, () => {
        if (this.gameEnded) return;
        this.n2RoundIndex += 1;
        this.showN2Round();
      });
    });
  }

  // ─── N3 — Eficiência dos Laços ────────────────────────────────────────────

  private showN3Round() {
    this.clearContent();
    this.n3OuterValue = 1;
    this.n3InnerValue = 1;
    this.n3SelectedCount = null;
    const rounds = this.levelConfig.n3Rounds!;
    if (this.n3RoundIndex >= rounds.length) {
      this.completeFinalLevel();
      return;
    }
    const round: N3Round = rounds[this.n3RoundIndex];

    this.buildProgressDots(rounds.length, this.n3RoundIndex);
    this.windowRects = this.createBuildingGrid(round.floors, round.windows, round.alreadyClean);

    const firstRect = this.windowRects[0]?.[0];
    if (firstRect) {
      this.cleanerText = this.createCleaner(firstRect.x - WINDOW_W - 10, firstRect.y);
    }

    this.buildN3Editor(round);
  }

  private buildN3Editor(round: N3Round) {
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;

    const edBg = this.addContent(this.add.graphics().setDepth(8));
    edBg.fillStyle(COLORS.dark, 0.5);
    edBg.fillRoundedRect(ex, ey, ew, PANEL_H - 30, 16);
    edBg.lineStyle(2, COLORS.blueLight, 0.2);
    edBg.strokeRoundedRect(ex, ey, ew, PANEL_H - 30, 16);

    this.addContent(this.addSharpText(ex + ew / 2, ey + 20, "🔁 Laços + Previsão", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(10));

    // Outer loop (blue)
    const outerX = ex + 10;
    const outerY = ey + 44;
    const outerW = ew - 20;

    const outerBg = this.addContent(this.add.graphics().setDepth(9));
    outerBg.fillStyle(COLORS.blue, 0.75);
    outerBg.fillRoundedRect(outerX, outerY, outerW, 190, 12);
    outerBg.lineStyle(3, COLORS.blueLight, 0.7);
    outerBg.strokeRoundedRect(outerX, outerY, outerW, 190, 12);

    this.addContent(this.addSharpText(outerX + 10, outerY + 8, "REPETIR", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0).setDepth(10));

    this.buildCounterN3(outerX + 10, outerY + 26, outerW - 20, "andares", "outer", round.floors);

    this.addContent(this.addSharpText(outerX + 10, outerY + 84, "VEZES  {", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0, 0).setDepth(10));

    const innerX = outerX + 14;
    const innerY = outerY + 102;
    const innerW = outerW - 28;

    const innerBg = this.addContent(this.add.graphics().setDepth(9));
    innerBg.fillStyle(COLORS.green, 0.7);
    innerBg.fillRoundedRect(innerX, innerY, innerW, 70, 10);
    innerBg.lineStyle(3, COLORS.greenLight, 0.6);
    innerBg.strokeRoundedRect(innerX, innerY, innerW, 70, 10);

    this.addContent(this.addSharpText(innerX + 6, innerY + 6, "REPETIR", {
      fontSize: "11px", fontFamily: "Arial Black, Arial", color: "#bbf7d0",
    }).setOrigin(0, 0).setDepth(10));

    this.buildCounterN3(innerX + 6, innerY + 22, innerW - 12, "janelas", "inner", round.windows);

    this.addContent(this.addSharpText(innerX + 6, innerY + 54, "VEZES  { 🧹 LIMPAR }", {
      fontSize: "11px", fontFamily: "Arial Black, Arial", color: "#bbf7d0",
    }).setOrigin(0, 0).setDepth(10));

    this.addContent(this.addSharpText(outerX + outerW - 8, outerY + 188, "}", {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(1, 1).setDepth(10));

    // Prediction question
    const qY = ey + 248;
    const qBg = this.addContent(this.add.graphics().setDepth(9));
    qBg.fillStyle(COLORS.amber, 0.25);
    qBg.fillRoundedRect(ex + 8, qY, ew - 16, 40, 10);
    qBg.lineStyle(2, COLORS.amber, 0.5);
    qBg.strokeRoundedRect(ex + 8, qY, ew - 16, 40, 10);
    this.addContent(this.addSharpText(ex + ew / 2, qY + 20, "Quantas janelas serão limpas?", {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#fef3c7", align: "center",
    }).setOrigin(0.5).setDepth(10));

    // MCQ chips in 2×2 grid
    const chipW = (ew - 30) / 2;
    const chipH = 40;
    const chipGapX = 10;
    const chipGapY = 8;
    const chipsStartY = qY + 48;
    round.options.forEach((opt, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = ex + 8 + col * (chipW + chipGapX);
      const cy = chipsStartY + row * (chipH + chipGapY);
      this.buildN3Chip(cx, cy, chipW, chipH, opt, round);
    });

    // Execute button
    const btnY = ey + PANEL_H - 76;
    const n3BtnBg = this.addContent(this.add.graphics().setDepth(11));
    n3BtnBg.setAlpha(0);
    this.n3ExecuteBtnBg = n3BtnBg;

    this.addContent(this.addSharpText(ex + ew / 2, btnY + 22, "▶ EXECUTAR", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#16a34a", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12)).setAlpha(0);

    const zone = this.addContent(this.add.zone(ex + ew / 2, btnY + 22, ew - 20, 44).setDepth(56));
    zone.setInteractive({ useHandCursor: true });
    this.n3ExecuteBtnZone = zone;
    zone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning || this.n3SelectedCount === null) return;
      this.onN3Execute(round);
    });
  }

  private buildCounterN3(x: number, y: number, w: number, label: string, type: "outer" | "inner", _target: number) {
    const btnSize = 32;
    const gap = 6;

    const minusBg = this.addContent(this.add.graphics().setDepth(11));
    minusBg.fillStyle(COLORS.dark, 0.7);
    minusBg.fillRoundedRect(x, y, btnSize, btnSize, btnSize / 2);
    minusBg.lineStyle(2, COLORS.blueLight, 0.6);
    minusBg.strokeRoundedRect(x, y, btnSize, btnSize, btnSize / 2);
    const minusTxt = this.addContent(this.addSharpText(x + btnSize / 2, y + btnSize / 2, "▼", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(12));

    const valX = x + btnSize + gap;
    const valW = w - 2 * (btnSize + gap);
    this.addContent(this.add.graphics().setDepth(11))
      .fillStyle(COLORS.white, 0.12)
      .fillRoundedRect(valX, y, valW, btnSize, 6);

    const initialVal = type === "outer" ? this.n3OuterValue : this.n3InnerValue;
    const valLabel = this.addContent(this.addSharpText(valX + valW / 2, y + btnSize / 2, String(initialVal), {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    if (type === "outer") this.n3OuterLabel = valLabel;
    else this.n3InnerLabel = valLabel;

    const plusX = x + w - btnSize;
    const plusBg = this.addContent(this.add.graphics().setDepth(11));
    plusBg.fillStyle(COLORS.dark, 0.7);
    plusBg.fillRoundedRect(plusX, y, btnSize, btnSize, btnSize / 2);
    plusBg.lineStyle(2, COLORS.blueLight, 0.6);
    plusBg.strokeRoundedRect(plusX, y, btnSize, btnSize, btnSize / 2);
    const plusTxt = this.addContent(this.addSharpText(plusX + btnSize / 2, y + btnSize / 2, "▲", {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#bfdbfe",
    }).setOrigin(0.5).setDepth(12));

    this.addContent(this.addSharpText(valX + valW / 2, y + btnSize + 2, label, {
      fontSize: "10px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
    }).setOrigin(0.5, 0).setDepth(10));

    const minusZone = this.addContent(this.add.zone(x + btnSize / 2, y + btnSize / 2, btnSize + 8, btnSize + 8).setDepth(55));
    minusZone.setInteractive({ useHandCursor: true });
    minusZone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); minusTxt.setColor("#ffffff"); });
    minusZone.on("pointerout", () => { this.input.setDefaultCursor("default"); minusTxt.setColor("#bfdbfe"); });
    minusZone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.adjustCounterN3(type, -1, valLabel);
    });

    const plusZone = this.addContent(this.add.zone(plusX + btnSize / 2, y + btnSize / 2, btnSize + 8, btnSize + 8).setDepth(55));
    plusZone.setInteractive({ useHandCursor: true });
    plusZone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); plusTxt.setColor("#ffffff"); });
    plusZone.on("pointerout", () => { this.input.setDefaultCursor("default"); plusTxt.setColor("#bfdbfe"); });
    plusZone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.adjustCounterN3(type, +1, valLabel);
    });
  }

  private adjustCounterN3(type: "outer" | "inner", delta: number, label: Phaser.GameObjects.Text) {
    if (type === "outer") {
      this.n3OuterValue = Phaser.Math.Clamp(this.n3OuterValue + delta, 1, 6);
      label.setText(String(this.n3OuterValue));
    } else {
      this.n3InnerValue = Phaser.Math.Clamp(this.n3InnerValue + delta, 1, 6);
      label.setText(String(this.n3InnerValue));
    }
    // If both loops and prediction chip selected — check if execute should appear
    this.tryShowN3Execute();
  }

  private buildN3Chip(cx: number, cy: number, cw: number, ch: number, value: number, round: N3Round) {
    const chipBg = this.addContent(this.add.graphics().setDepth(11));
    const drawChip = (selected: boolean) => {
      chipBg.clear();
      chipBg.fillStyle(selected ? COLORS.amber : COLORS.dark, selected ? 0.9 : 0.7);
      chipBg.fillRoundedRect(cx, cy, cw, ch, ch / 2);
      chipBg.lineStyle(2, selected ? COLORS.gold : COLORS.blueLight, selected ? 1 : 0.5);
      chipBg.strokeRoundedRect(cx, cy, cw, ch, ch / 2);
    };
    drawChip(false);

    this.addContent(this.addSharpText(cx + cw / 2, cy + ch / 2, String(value), {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    const zone = this.addContent(this.add.zone(cx + cw / 2, cy + ch / 2, cw, ch).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      if (this.gameEnded) return;
      this.input.setDefaultCursor("pointer");
      if (this.n3SelectedCount !== value) {
        chipBg.clear();
        chipBg.fillStyle(COLORS.blueMid, 0.5);
        chipBg.fillRoundedRect(cx, cy, cw, ch, ch / 2);
        chipBg.lineStyle(2, COLORS.blueLight, 0.8);
        chipBg.strokeRoundedRect(cx, cy, cw, ch, ch / 2);
      }
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      drawChip(this.n3SelectedCount === value);
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded || this.cleanerRunning) return;
      this.playClick();
      this.n3SelectedCount = value;
      drawChip(true);
      this.tryShowN3Execute();
    });
  }

  private tryShowN3Execute() {
    if (this.n3SelectedCount === null) return;
    if (!this.n3ExecuteBtnBg) return;
    const ex = EDITOR_X;
    const ew = EDITOR_W - 10;
    const ey = PANEL_Y + 20;
    const btnY = ey + PANEL_H - 76;
    const btnBg = this.n3ExecuteBtnBg;

    btnBg.clear();
    btnBg.fillStyle(COLORS.green, 1);
    btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
    btnBg.setAlpha(1);

    this.contentObjects.forEach((o) => {
      if (o instanceof Phaser.GameObjects.Text && o.text === "▶ EXECUTAR") {
        o.setAlpha(1);
      }
    });

    this.n3ExecuteBtnZone?.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      btnBg.clear();
      btnBg.fillStyle(COLORS.greenMid, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
    });
    this.n3ExecuteBtnZone?.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      btnBg.clear();
      btnBg.fillStyle(COLORS.green, 1);
      btnBg.fillRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
      btnBg.lineStyle(4, COLORS.white, 1);
      btnBg.strokeRoundedRect(ex + 10, btnY, ew - 20, 44, 22);
    });
  }

  private onN3Execute(round: N3Round) {
    if (this.gameEnded) return;
    const outerCorrect = this.n3OuterValue === round.floors;
    const innerCorrect = this.n3InnerValue === round.windows;
    const countCorrect = this.n3SelectedCount === round.correct;

    this.cleanerRunning = true;

    const handleAfterAnim = () => {
      this.cleanerRunning = false;
      if (this.gameEnded) return;

      if (!outerCorrect || !innerCorrect || !countCorrect) {
        this.errors += 1;
        this.playWrong();
        runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
        let msg = "";
        if (!outerCorrect || !innerCorrect) {
          msg = `❌ Os laços estavam errados! Use ${round.floors} andares × ${round.windows} janelas.`;
        } else {
          msg = `❌ Previsão errada! O algoritmo limpa ${round.correct} janelas (${round.floors * round.windows} total − ${round.alreadyClean.length} já limpas).`;
        }
        this.showToast(msg, COLORS.red, 2800);
        this.shakeCamera();
        // Reset
        this.n3OuterValue = 1;
        this.n3InnerValue = 1;
        this.n3SelectedCount = null;
        this.n3OuterLabel?.setText("1");
        this.n3InnerLabel?.setText("1");
        // Redraw windows
        this.windowRects.forEach((row, ri) => {
          row.forEach((rect, ci) => {
            const isClean = round.alreadyClean.some(([r, c]) => r === ri && c === ci);
            rect.setFillStyle(isClean ? COLORS.gold : COLORS.dirty);
            rect.setStrokeStyle(3, isClean ? COLORS.gold : COLORS.dirtyAlt);
            rect.setAlpha(1);
          });
        });
        const firstRect = this.windowRects[0]?.[0];
        if (firstRect && this.cleanerText) {
          this.cleanerText.setPosition(firstRect.x - WINDOW_W - 10, firstRect.y);
        }
        return;
      }

      this.hits += 1;
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.showToast(`✅ Correto! ${round.correct} janelas limpas de ${round.floors * round.windows} totais!`, COLORS.green, 2000);
      this.time.delayedCall(2100, () => {
        if (this.gameEnded) return;
        this.n3RoundIndex += 1;
        this.showN3Round();
      });
    };

    this.animateCleaner(this.windowRects, round.floors, round.windows, handleAfterAnim, round.alreadyClean);
  }

  // ─── Progress Dots ────────────────────────────────────────────────────────

  private buildProgressDots(total: number, current: number) {
    const dotsCont = this.addContent(this.add.container(640, PANEL_Y + 22).setDepth(12));
    const spacing = 18;
    const startX = -(spacing * (total - 1)) / 2;
    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics();
      const col = i < current ? COLORS.green : i === current ? COLORS.blueMid : 0x334155;
      dot.fillStyle(col, 1);
      dot.fillCircle(startX + i * spacing, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.7);
      dot.strokeCircle(startX + i * spacing, 0, 7);
      dotsCont.add(dot);
    }
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as LoopLevelNumber;
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

  private showLevelCompleteScreen(nextLevel: LoopLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.dark, 0.65).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e3a5f, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.green, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.green, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -132, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -68, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#86efac", stroke: "#14532d", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -12, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 40, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#bfdbfe", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(num <= this.levelConfig.level ? COLORS.green : num === nextLevel ? COLORS.amber : 0x334155, 1);
      d.fillCircle(-28 + i * 28, 92, 9);
      d.lineStyle(2, COLORS.white, 0.8);
      d.strokeCircle(-28 + i * 28, 92, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let i = 0; i < 14; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const c = [COLORS.green, COLORS.blue, COLORS.amber, COLORS.greenMid, COLORS.blueLight][i % 5];
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
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.dark, 0.7).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e3a5f, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.green, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.green, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#86efac", stroke: "#14532d", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nPrédio dos Laços!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.green, COLORS.amber, COLORS.blue, COLORS.greenMid, COLORS.blueLight][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.green, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#16a34a", strokeThickness: 3,
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

    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.dark, 0.72).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e3a5f, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -144, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -78, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#f87171", stroke: "#0f172a", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -22, "⏰ Tempo esgotado!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center",
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
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.orange, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
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
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─── Overlay Helpers ──────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T) { this.overlayObjects.push(o); return o; }
  private clearOverlay() {
    this.overlayObjects.forEach((o) => o.destroy());
    this.overlayObjects = [];
    this.input.setDefaultCursor("default");
  }
  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0); m.setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private getScore() { return Math.max(0, this.hits * 20 - this.errors * 5); }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private shakeCamera() {
    this.cameras.main.shake(280, 0.006);
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 618).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, COLORS.white, 0.9);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", align: "center", wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({ targets: container, y: 600, alpha: 0, duration: 300, delay: duration, onComplete: () => container.destroy() });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  private playClick() { this.playTone(520, 0.05, "sine", 0.05); }
  private playSuccess() {
    this.playTone(660, 0.1, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.1, "triangle", 0.06));
    this.time.delayedCall(200, () => this.playTone(1100, 0.14, "triangle", 0.07));
  }
  private playWrong() { this.playTone(200, 0.14, "sawtooth", 0.05); }
  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency; gain.gain.value = volume;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  }
}
