import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, FORMAT_OPTIONS } from "../data/levels";
import type {
  StudioLevel,
  StudioLevelNumber,
  FormatId,
  DrawingChallenge,
  TextChallenge,
} from "../types";

const GAME_ID = "estudio-multiformato";

// ── Layout constants (mirrors EF03CO07 exactly) ──────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136; // x: 72 → 1208
const PANEL_H = 486;  // y: 142 → 628
const MODAL_SCALE = 1.12;

// Mural lives on the right 350 px of the panel (split at x = 858)
const SPLIT_X = 858;
const LEFT_CX = (PANEL_X + SPLIT_X) / 2;        // ≈ 465
const RIGHT_CX = (SPLIT_X + PANEL_X + PANEL_W) / 2; // ≈ 1033

const COLORS = {
  purple: 0x7c3aed,
  violet: 0xa855f7,
  orange: 0xf59e0b,
  amber: 0xfbbf24,
  green: 0x22c55e,
  teal: 0x14b8a6,
  blue: 0x3b82f6,
  red: 0xef4444,
  pink: 0xe91e8c,
  yellow: 0xfacc15,
  ink: 0x1e1b4b,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: StudioLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];

  // N1
  private n1TaskIndex = 0;
  private taskObjects: Phaser.GameObjects.GameObject[] = [];

  // N2
  private n2Phase = 0;
  private phaseObjects: Phaser.GameObjects.GameObject[] = [];
  private drawCanvas?: Phaser.GameObjects.Graphics;
  private drawPoints: Array<{ x: number; y: number; color: number }> = [];
  private activeColor = COLORS.green;
  private drawCount = 0;
  private selectedWords: string[] = [];

  // N3
  private cycleIndex = 0;
  private cycleObjects: Phaser.GameObjects.GameObject[] = [];

  // Mural (lives inside the panel, right section)
  private muralContainer?: Phaser.GameObjects.Container;
  private muralItems: Array<{ color: number; emoji: string }> = [];

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as StudioLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1TaskIndex = 0;
    this.n2Phase = 0;
    this.drawPoints = [];
    this.drawCount = 0;
    this.selectedWords = [];
    this.muralItems = [];
    this.cycleIndex = 0;
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.taskObjects = [];
    this.phaseObjects = [];
    this.cycleObjects = [];
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
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.orange : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-format-workshop"
      : this.levelConfig.level === 2 ? "bg-creative-studio"
      : "bg-mission-studio";
    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.06).setDepth(-90);
    this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.22).setDepth(-89);
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
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.65).setDepth(60);
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
    bg.lineStyle(6, COLORS.purple, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.purple, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);
    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);
    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 560 },
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
    btnBg.fillStyle(COLORS.purple, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, 0xffffff, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);
    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    panel.add([shadow, bg, topBar, lvlLabel, title, obj, detail, tipBg, tip, btnBg, btnText]);
    panel.setAlpha(0);
    panel.setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 149 * MODAL_SCALE, 256 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);
    hz.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: panel, scale: MODAL_SCALE * 1.02, duration: 80 }); });
    hz.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: panel, scale: MODAL_SCALE, duration: 80 }); });
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
    if (this.levelConfig.level === 2) {
      this.createMuralSection();
      this.showN2DrawPhase();
    } else if (this.levelConfig.level === 3) {
      this.createMuralSection();
      this.showN3Cycle();
    } else {
      this.showN1Content();
    }
  }

  // ─── Header (identical pattern to EF03CO07) ───────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(0xffffff, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.yellow, 0.18);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, COLORS.orange, 0.9);
    card.strokeRoundedRect(230, 96, 820, 44, 22);
    card.lineStyle(3, 0xffffff, 0.95);
    card.strokeRoundedRect(234, 100, 812, 36, 18);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e1b4b",
      backgroundColor: "rgba(255,255,255,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background (mirrors EF03CO07 drawPanel) ────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(0x1e1b4b, 0.18);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);
    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(0xffffff, 0.32);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(0xfde8ff, 0.15);
    panel.fillRoundedRect(PANEL_X + 12, PANEL_Y + 12, PANEL_W - 24, PANEL_H - 24, 24);
    panel.fillStyle(0xffffff, 0.18);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(7, 0xffffff, 0.9);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─── Mural Section (right zone of panel, x=858–1208) ─────────────────────

  private createMuralSection() {
    // Mural board PNG background
    const MURAL_W = PANEL_X + PANEL_W - SPLIT_X - 8;
    const muralBg = this.add.image(RIGHT_CX, PANEL_Y + PANEL_H / 2, "studio-mural-board").setDepth(3);
    muralBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.fitImage(muralBg, MURAL_W, PANEL_H - 12);
    muralBg.setAlpha(0.88);

    // Subtle divider line on top of bg
    const div = this.add.graphics().setDepth(9);
    div.lineStyle(2, COLORS.purple, 0.22);
    div.lineBetween(SPLIT_X, PANEL_Y + 24, SPLIT_X, PANEL_Y + PANEL_H - 24);

    this.addSharpText(RIGHT_CX, PANEL_Y + 30, "🖼 Mural da Turma", {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    this.muralContainer = this.add.container(0, 0).setDepth(10);
    this.refreshMural();
  }

  private refreshMural() {
    if (!this.muralContainer) return;
    this.muralContainer.removeAll(true);

    if (this.muralItems.length === 0) {
      const placeholder = this.addSharpText(RIGHT_CX, PANEL_Y + 180, "Publique suas\ncriações aqui!", {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#a78bfa", align: "center",
      }).setOrigin(0.5);
      this.muralContainer.add(placeholder);
      return;
    }

    this.muralItems.forEach((item, index) => {
      const cy = PANEL_Y + 100 + index * 170;
      const card = this.add.graphics();
      card.fillStyle(item.color, 0.88);
      card.fillRoundedRect(RIGHT_CX - 140, cy, 280, 140, 18);
      card.lineStyle(4, 0xffffff, 0.95);
      card.strokeRoundedRect(RIGHT_CX - 140, cy, 280, 140, 18);
      const emojiText = this.addSharpText(RIGHT_CX, cy + 52, item.emoji, { fontSize: "48px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
      const pubLabel = this.addSharpText(RIGHT_CX, cy + 110, "Publicado ✓", {
        fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
      }).setOrigin(0.5);
      this.muralContainer!.add([card, emojiText, pubLabel]);
    });
  }

  private addToMural(color: number, emoji: string) {
    this.muralItems.push({ color, emoji });
    this.refreshMural();
  }

  // ─── N1 — Format Matching (full panel width) ──────────────────────────────

  private showN1Content() {
    this.taskObjects.forEach((o) => o.destroy());
    this.taskObjects = [];

    const tasks = this.levelConfig.formatMatchTasks!;
    if (this.n1TaskIndex >= tasks.length) { this.completeLevel(); return; }
    const task = tasks[this.n1TaskIndex];

    // Progress bar dots
    const dotsContainer = this.addTask(this.add.container(640, PANEL_Y + 30).setDepth(12));
    tasks.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(i < this.n1TaskIndex ? COLORS.green : i === this.n1TaskIndex ? COLORS.purple : 0xd1d5db, 1);
      dot.fillCircle(-20 + i * 20, 0, 7);
      dot.lineStyle(2, 0xffffff, 0.8);
      dot.strokeCircle(-20 + i * 20, 0, 7);
      dotsContainer.add(dot);
    });
    this.addTask(this.addSharpText(640, PANEL_Y + 53, `Tarefa ${this.n1TaskIndex + 1} de ${tasks.length}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12));

    // Task card
    const taskCard = this.addTask(this.add.container(640, PANEL_Y + 160).setDepth(12));
    const tcBg = this.add.graphics();
    tcBg.fillStyle(0xffffff, 0.9);
    tcBg.fillRoundedRect(-460, -64, 920, 128, 24);
    tcBg.lineStyle(4, COLORS.purple, 0.7);
    tcBg.strokeRoundedRect(-460, -64, 920, 128, 24);
    const tcIcon = this.addSharpText(-420, 0, "🎯", { fontSize: "40px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const tcText = this.addSharpText(40, 0, task.goal, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 740 },
    }).setOrigin(0.5);
    taskCard.add([tcBg, tcIcon, tcText]);
    taskCard.setAlpha(0);
    this.tweens.add({ targets: taskCard, alpha: 1, duration: 200, ease: "Sine.easeOut" });

    // Format buttons — 4 in a row
    const btnY = PANEL_Y + 340;
    const btnW = 220;
    const btnH = 120;
    const gap = 14;
    const totalW = 4 * btnW + 3 * gap;
    const startX = 640 - totalW / 2 + btnW / 2;
    FORMAT_OPTIONS.forEach((fmt, i) => {
      const bx = startX + i * (btnW + gap);
      this.createFormatBtn(bx, btnY, btnW, btnH, fmt.id, fmt.icon, fmt.label, fmt.color, () => {
        if (this.gameEnded) return;
        this.onN1FormatSelected(fmt.id, task.correctFormat, task.hint);
      });
    });
  }

  private onN1FormatSelected(selected: FormatId, correct: FormatId, hint: string) {
    if (this.gameEnded) return;
    this.playClick();
    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      this.showToast(`✅ Correto! ${hint}`, COLORS.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n1TaskIndex += 1;
        this.showN1Content();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast(`❌ ${hint}`, COLORS.red, 2200);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    }
  }

  private createFormatBtn(x: number, y: number, w: number, h: number, formatId: FormatId, icon: string, label: string, color: number, onClick: () => void) {
    const btn = this.addTask(this.add.container(x, y).setDepth(20));
    const textureKey = `format-card-${formatId}`;
    if (this.textures.exists(textureKey) && this.textures.get(textureKey).getSourceImage().width > 4) {
      const cardImg = this.add.image(0, 0, textureKey);
      cardImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.fitImage(cardImg, w, h);
      btn.add(cardImg);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.88);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
      bg.fillStyle(color, 0.14);
      bg.fillRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h * 0.4, 12);
      bg.lineStyle(4, color, 0.85);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
      const iconTxt = this.addSharpText(0, -16, icon, { fontSize: "44px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
      btn.add([bg, iconTxt]);
    }
    const lblTxt = this.addSharpText(0, h / 2 - 20, label, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#1e1b4b", strokeThickness: 4,
    }).setOrigin(0.5);
    btn.add(lblTxt);
    const zone = this.addTask(this.add.zone(x, y, w + 14, h + 14).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: btn, scale: 1.06, duration: 80 }); });
    zone.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: btn, scale: 1, duration: 80 }); });
    zone.on("pointerdown", onClick);
    return btn;
  }

  private addTask<T extends Phaser.GameObjects.GameObject>(o: T) { this.taskObjects.push(o); return o; }

  // ─── N2 — Drawing Phase (left zone) ──────────────────────────────────────

  private showN2DrawPhase() {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.drawPoints = [];
    this.drawCount = 0;

    const ch = this.levelConfig.drawChallenge!;

    this.showEditorLabel(`🎨 Fase 1 de 2 — Desenho: ${ch.theme}`, COLORS.pink);
    this.addSharpText(LEFT_CX, PANEL_Y + 56, ch.instruction, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(15);

    // Canvas background
    const CANVAS_LEFT = PANEL_X + 16;
    const CANVAS_TOP = PANEL_Y + 80;
    const CANVAS_W = SPLIT_X - PANEL_X - 32;  // ≈ 770
    const CANVAS_H = 330;
    const CANVAS_CX = CANVAS_LEFT + CANVAS_W / 2;
    const CANVAS_CY = CANVAS_TOP + CANVAS_H / 2;
    const studioCanvas = this.addPhase(this.add.image(CANVAS_CX, CANVAS_CY, "studio-canvas").setDepth(10));
    studioCanvas.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.fitImage(studioCanvas, CANVAS_W, CANVAS_H);

    this.drawCanvas = this.addPhase(this.add.graphics().setDepth(11)) as Phaser.GameObjects.Graphics;

    // Color palette
    this.activeColor = ch.colors[0];
    ch.colors.forEach((color, i) => {
      const cx = PANEL_X + 40 + i * 60;
      const cy = CANVAS_TOP + CANVAS_H + 36;
      const dot = this.addPhase(this.add.graphics().setDepth(20));
      dot.fillStyle(color, 1);
      dot.fillCircle(cx, cy, 22);
      dot.lineStyle(4, 0xffffff, 1);
      dot.strokeCircle(cx, cy, 22);
      const zone = this.addPhase(this.add.zone(cx, cy, 54, 54).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => { if (this.gameEnded) return; this.activeColor = color; this.playClick(); });
    });

    // Counter
    this.addPhase(this.addSharpText(LEFT_CX, CANVAS_TOP + CANVAS_H + 36, `Manchas: 0 / ${ch.minStrokes}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20)).setName("drawCounter");

    // Publish button (dimmed until threshold)
    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, CANVAS_TOP + CANVAS_H + 80, () => {
      if (this.gameEnded || this.drawCount < ch.minStrokes) return;
      this.onPublishDraw();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");

    // Draw zone
    const drawZone = this.addPhase(this.add.zone(
      CANVAS_LEFT + CANVAS_W / 2,
      CANVAS_TOP + CANVAS_H / 2,
      CANVAS_W, CANVAS_H,
    ).setDepth(50));
    drawZone.setInteractive();

    const onPaint = (pointer: Phaser.Input.Pointer) => {
      if (this.gameEnded || !pointer.isDown) return;
      const px = pointer.x; const py = pointer.y;
      if (px < CANVAS_LEFT || px > CANVAS_LEFT + CANVAS_W || py < CANVAS_TOP || py > CANVAS_TOP + CANVAS_H) return;
      this.drawPoints.push({ x: px, y: py, color: this.activeColor });
      this.drawCount += 1;
      this.redrawCanvas();
      const counter = this.children.getByName("drawCounter") as Phaser.GameObjects.Text | null;
      if (counter) counter.setText(`Manchas: ${this.drawCount} / ${ch.minStrokes}`);
      if (this.drawCount >= ch.minStrokes) {
        const btn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (btn && btn.alpha < 1) this.tweens.add({ targets: btn, alpha: 1, duration: 200 });
      }
    };
    drawZone.on("pointermove", onPaint);
    drawZone.on("pointerdown", onPaint);
  }

  private redrawCanvas() {
    if (!this.drawCanvas) return;
    this.drawCanvas.clear();
    this.drawPoints.forEach((pt) => {
      this.drawCanvas!.fillStyle(pt.color, 0.85);
      this.drawCanvas!.fillCircle(pt.x, pt.y, 20);
    });
  }

  private onPublishDraw() {
    if (this.gameEnded) return;
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.pink, "🎨", () => {
      this.addToMural(COLORS.pink, "🎨");
      this.showN2TextPhase();
    });
  }

  // ─── N2 — Text Phase (left zone) ─────────────────────────────────────────

  private showN2TextPhase() {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];

    const ch = this.levelConfig.textChallenge!;
    this.showEditorLabel(`📝 Fase 2 de 2 — Texto: ${ch.theme}`, COLORS.blue);
    this.addPhase(this.addSharpText(LEFT_CX, PANEL_Y + 56, ch.instruction, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(15));

    this.buildWordBank(ch.wordBank, ch.minWords, LEFT_CX, PANEL_Y + 140, () => this.onPublishText());

    this.buildPostPreview(LEFT_CX, PANEL_Y + 358);

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, PANEL_Y + 448, () => {
      if (this.gameEnded || this.selectedWords.length < ch.minWords) return;
      this.onPublishText();
    }));
    pubBtn.setAlpha(this.selectedWords.length >= ch.minWords ? 1 : 0.35);
    pubBtn.setName("publishBtn");
  }

  private onPublishText() {
    if (this.gameEnded) return;
    const minWords = this.levelConfig.level === 2
      ? this.levelConfig.textChallenge!.minWords
      : (this.levelConfig.creationCycles![this.cycleIndex].challenge as TextChallenge).minWords;
    if (this.selectedWords.length < minWords) return;
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.blue, "📝", () => {
      this.addToMural(COLORS.blue, "📝");
      if (this.levelConfig.level === 2) {
        this.completeLevel();
      } else {
        this.cycleIndex += 1;
        this.selectedWords = [];
        this.phaseObjects.forEach((o) => o.destroy());
        this.phaseObjects = [];
        if (this.cycleIndex < this.levelConfig.creationCycles!.length) {
          this.showN3Cycle();
        } else {
          this.completeFinalLevel();
        }
      }
    });
  }

  // ─── N3 — Creative Cycle ──────────────────────────────────────────────────

  private showN3Cycle() {
    this.cycleObjects.forEach((o) => o.destroy());
    this.cycleObjects = [];
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];
    this.drawPoints = [];
    this.drawCount = 0;

    const cycles = this.levelConfig.creationCycles!;
    if (this.cycleIndex >= cycles.length) { this.completeFinalLevel(); return; }
    const cycle = cycles[this.cycleIndex];

    this.showEditorLabel(`Missão ${this.cycleIndex + 1} de ${cycles.length} — Escolha o formato`, COLORS.purple);

    // Goal card (left zone)
    const goalCard = this.addCycle(this.add.container(LEFT_CX, PANEL_Y + 148).setDepth(12));
    const gcBg = this.add.graphics();
    gcBg.fillStyle(0xffffff, 0.9);
    gcBg.fillRoundedRect(-370, -56, 740, 112, 22);
    gcBg.lineStyle(4, COLORS.purple, 0.7);
    gcBg.strokeRoundedRect(-370, -56, 740, 112, 22);
    const gcIcon = this.addSharpText(-330, 0, "🎯", { fontSize: "38px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const gcText = this.addSharpText(30, 0, cycle.goal, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 600 },
    }).setOrigin(0.5);
    goalCard.add([gcBg, gcIcon, gcText]);
    goalCard.setAlpha(0);
    this.tweens.add({ targets: goalCard, alpha: 1, duration: 220 });

    // Format buttons (3 in left zone) — PNG cards
    const btnW = 210;
    const btnH = 116;
    const gap = 14;
    const totalW = cycle.formatOptions.length * btnW + (cycle.formatOptions.length - 1) * gap;
    const startX = LEFT_CX - totalW / 2 + btnW / 2;
    const btnY = PANEL_Y + 340;
    cycle.formatOptions.forEach((fmtId, i) => {
      const fmt = FORMAT_OPTIONS.find((f) => f.id === fmtId)!;
      const bx = startX + i * (btnW + gap);
      const btn = this.addCycle(this.add.container(bx, btnY).setDepth(20));
      const textureKey = `format-card-${fmtId}`;
      if (this.textures.exists(textureKey) && this.textures.get(textureKey).getSourceImage().width > 4) {
        const cardImg = this.add.image(0, 0, textureKey);
        cardImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.fitImage(cardImg, btnW, btnH);
        btn.add(cardImg);
      } else {
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.88);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        bg.fillStyle(fmt.color, 0.14);
        bg.fillRoundedRect(-btnW / 2 + 10, -btnH / 2 + 10, btnW - 20, btnH * 0.38, 12);
        bg.lineStyle(4, fmt.color, 0.85);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        const iconTxt = this.addSharpText(0, -14, fmt.icon, { fontSize: "42px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
        btn.add([bg, iconTxt]);
      }
      const lblTxt = this.addSharpText(0, btnH / 2 - 20, fmt.label, {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#1e1b4b", strokeThickness: 4,
      }).setOrigin(0.5);
      btn.add(lblTxt);
      const zone = this.addCycle(this.add.zone(bx, btnY, btnW + 14, btnH + 14).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: btn, scale: 1.06, duration: 80 }); });
      zone.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: btn, scale: 1, duration: 80 }); });
      zone.on("pointerdown", () => { if (this.gameEnded) return; this.onN3FormatSelected(fmtId, cycle.correctFormat); });
    });
  }

  private onN3FormatSelected(selected: FormatId, correct: FormatId) {
    if (this.gameEnded) return;
    this.playClick();
    if (selected !== correct) {
      this.errors += 1;
      this.playWrong();
      const hint = FORMAT_OPTIONS.find((f) => f.id === correct)!;
      this.showToast(`❌ Dica: use ${hint.icon} ${hint.label} para esta missão!`, COLORS.red, 2200);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      return;
    }
    this.hits += 1;
    this.playSuccess();
    this.showToast("✅ Formato certo! Agora crie sua produção.", COLORS.green, 1400);
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
    const cycle = this.levelConfig.creationCycles![this.cycleIndex];
    this.time.delayedCall(1500, () => {
      if (this.gameEnded) return;
      this.cycleObjects.forEach((o) => o.destroy());
      this.cycleObjects = [];
      if (cycle.challenge.type === "drawing") {
        this.showN3DrawCreator(cycle.challenge);
      } else {
        this.showN3TextCreator(cycle.challenge);
      }
    });
  }

  private showN3DrawCreator(ch: DrawingChallenge) {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.drawPoints = [];
    this.drawCount = 0;

    this.showEditorLabel(`🎨 Crie: ${ch.theme}`, COLORS.pink);
    this.addPhase(this.addSharpText(LEFT_CX, PANEL_Y + 56, ch.instruction, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(15));

    const CANVAS_LEFT = PANEL_X + 16;
    const CANVAS_TOP = PANEL_Y + 80;
    const CANVAS_W = SPLIT_X - PANEL_X - 32;
    const CANVAS_H = 310;

    const studioCanvas = this.addPhase(this.add.image(CANVAS_LEFT + CANVAS_W / 2, CANVAS_TOP + CANVAS_H / 2, "studio-canvas").setDepth(10));
    studioCanvas.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.fitImage(studioCanvas, CANVAS_W, CANVAS_H);
    this.drawCanvas = this.addPhase(this.add.graphics().setDepth(11)) as Phaser.GameObjects.Graphics;

    this.activeColor = ch.colors[0];
    ch.colors.forEach((color, i) => {
      const cx = PANEL_X + 40 + i * 60;
      const cy = CANVAS_TOP + CANVAS_H + 32;
      const dot = this.addPhase(this.add.graphics().setDepth(20));
      dot.fillStyle(color, 1);
      dot.fillCircle(cx, cy, 20);
      dot.lineStyle(3, 0xffffff, 1);
      dot.strokeCircle(cx, cy, 20);
      const zone = this.addPhase(this.add.zone(cx, cy, 50, 50).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => { if (this.gameEnded) return; this.activeColor = color; this.playClick(); });
    });

    this.addPhase(this.addSharpText(LEFT_CX, CANVAS_TOP + CANVAS_H + 32, `Manchas: 0 / ${ch.minStrokes}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20)).setName("drawCounter");

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, CANVAS_TOP + CANVAS_H + 72, () => {
      if (this.gameEnded || this.drawCount < ch.minStrokes) return;
      this.onN3PublishDraw();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");

    const drawZone = this.addPhase(this.add.zone(CANVAS_LEFT + CANVAS_W / 2, CANVAS_TOP + CANVAS_H / 2, CANVAS_W, CANVAS_H).setDepth(50));
    drawZone.setInteractive();
    const onPaint = (p: Phaser.Input.Pointer) => {
      if (this.gameEnded || !p.isDown) return;
      if (p.x < CANVAS_LEFT || p.x > CANVAS_LEFT + CANVAS_W || p.y < CANVAS_TOP || p.y > CANVAS_TOP + CANVAS_H) return;
      this.drawPoints.push({ x: p.x, y: p.y, color: this.activeColor });
      this.drawCount += 1;
      this.redrawCanvas();
      const counter = this.children.getByName("drawCounter") as Phaser.GameObjects.Text | null;
      if (counter) counter.setText(`Manchas: ${this.drawCount} / ${ch.minStrokes}`);
      if (this.drawCount >= ch.minStrokes) {
        const btn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (btn && btn.alpha < 1) this.tweens.add({ targets: btn, alpha: 1, duration: 200 });
      }
    };
    drawZone.on("pointermove", onPaint);
    drawZone.on("pointerdown", onPaint);
  }

  private onN3PublishDraw() {
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.pink, "🎨", () => {
      this.addToMural(COLORS.pink, "🎨");
      this.cycleIndex += 1;
      this.selectedWords = [];
      this.phaseObjects.forEach((o) => o.destroy());
      this.phaseObjects = [];
      if (this.cycleIndex < this.levelConfig.creationCycles!.length) {
        this.showN3Cycle();
      } else {
        this.completeFinalLevel();
      }
    });
  }

  private showN3TextCreator(ch: TextChallenge) {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];

    this.showEditorLabel(`📝 Crie: ${ch.theme}`, COLORS.blue);
    this.addPhase(this.addSharpText(LEFT_CX, PANEL_Y + 56, ch.instruction, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(15));

    this.buildWordBank(ch.wordBank, ch.minWords, LEFT_CX, PANEL_Y + 140, () => this.onPublishText());
    this.buildPostPreview(LEFT_CX, PANEL_Y + 358);

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, PANEL_Y + 448, () => {
      if (this.gameEnded || this.selectedWords.length < ch.minWords) return;
      this.onPublishText();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");
  }

  private addCycle<T extends Phaser.GameObjects.GameObject>(o: T) { this.cycleObjects.push(o); return o; }

  // ─── Word Bank ────────────────────────────────────────────────────────────

  private buildWordBank(words: string[], minWords: number, cx: number, topY: number, onPublish: () => void) {
    const cols = 4;
    const chipW = 158;
    const chipH = 50;
    const gapX = 10;
    const gapY = 10;
    const startX = cx - ((cols * chipW + (cols - 1) * gapX) / 2) + chipW / 2;

    words.forEach((word, i) => {
      const bx = startX + (i % cols) * (chipW + gapX);
      const by = topY + Math.floor(i / cols) * (chipH + gapY) + chipH / 2;
      const isSelected = this.selectedWords.includes(word);
      const chip = this.addPhase(this.add.container(bx, by).setDepth(20));
      chip.setName(`chip-${word}`);
      const chipBg = this.add.graphics();
      chipBg.fillStyle(isSelected ? COLORS.blue : 0xffffff, isSelected ? 1 : 0.9);
      chipBg.fillRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      chipBg.lineStyle(3, COLORS.blue, 0.8);
      chipBg.strokeRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      const chipText = this.addSharpText(0, 0, word, {
        fontSize: "18px", fontFamily: "Arial Black, Arial",
        color: isSelected ? "#ffffff" : "#1e3a8a",
        stroke: "#ffffff", strokeThickness: isSelected ? 0 : 3,
      }).setOrigin(0.5);
      chip.add([chipBg, chipText]);

      const zone = this.addPhase(this.add.zone(bx, by, chipW + 12, chipH + 12).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
      zone.on("pointerout", () => this.input.setDefaultCursor("default"));
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.playClick();
        if (this.selectedWords.includes(word)) {
          this.selectedWords = this.selectedWords.filter((w) => w !== word);
        } else {
          this.selectedWords.push(word);
        }
        // Update chip visual in-place
        const nowSelected = this.selectedWords.includes(word);
        const chipContainer = this.children.getByName(`chip-${word}`) as Phaser.GameObjects.Container | null;
        if (chipContainer) {
          chipContainer.removeAll(true);
          const newBg = this.add.graphics();
          newBg.fillStyle(nowSelected ? COLORS.blue : 0xffffff, nowSelected ? 1 : 0.9);
          newBg.fillRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
          newBg.lineStyle(3, COLORS.blue, 0.8);
          newBg.strokeRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
          const newText = this.addSharpText(0, 0, word, {
            fontSize: "18px", fontFamily: "Arial Black, Arial",
            color: nowSelected ? "#ffffff" : "#1e3a8a",
            stroke: "#ffffff", strokeThickness: nowSelected ? 0 : 3,
          }).setOrigin(0.5);
          chipContainer.add([newBg, newText]);
        }
        const preview = this.children.getByName("postPreview") as Phaser.GameObjects.Text | null;
        if (preview) preview.setText(this.selectedWords.join(" · ") || "...");
        const pubBtn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (pubBtn) this.tweens.add({ targets: pubBtn, alpha: this.selectedWords.length >= minWords ? 1 : 0.35, duration: 150 });
      });
    });
  }

  private buildPostPreview(cx: number, y: number) {
    const postBg = this.addPhase(this.add.graphics().setDepth(10));
    postBg.fillStyle(0xffffff, 0.88);
    postBg.fillRoundedRect(cx - 360, y, 720, 76, 16);
    postBg.lineStyle(3, COLORS.blue, 0.5);
    postBg.strokeRoundedRect(cx - 360, y, 720, 76, 16);
    this.addPhase(this.addSharpText(cx, y + 16, "Mensagem:", {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
    }).setOrigin(0.5).setDepth(14));
    const preview = this.addPhase(this.addSharpText(cx, y + 44, "...", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(14));
    preview.setName("postPreview");
  }

  private addPhase<T extends Phaser.GameObjects.GameObject>(o: T) { this.phaseObjects.push(o); return o; }

  // ─── Editor Phase Label (inside panel, top-left of editor zone) ───────────

  private showEditorLabel(title: string, color: number) {
    this.addPhase(this.add.graphics().setDepth(9)).fillStyle(color, 0.85).fillRoundedRect(PANEL_X + 16, PANEL_Y + 10, 600, 34, 17);
    this.addPhase(this.addSharpText(PANEL_X + 26, PANEL_Y + 27, title, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0, 0.5).setDepth(12));
  }

  // ─── Publish Button ───────────────────────────────────────────────────────

  private createPublishButton(x: number, y: number, onClick: () => void) {
    const btn = this.addPhase(this.add.container(x, y).setDepth(30));
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.purple, 1);
    bg.fillRoundedRect(-140, -26, 280, 52, 26);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-140, -26, 280, 52, 26);
    const txt = this.addSharpText(0, 0, "📤 Publicar no Mural", {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    btn.add([bg, txt]);
    const zone = this.addPhase(this.add.zone(x, y, 294, 64).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    zone.on("pointerout", () => this.input.setDefaultCursor("default"));
    zone.on("pointerdown", onClick);
    return btn;
  }

  // ─── Fly to Mural Animation ───────────────────────────────────────────────

  private flyToMural(fromX: number, fromY: number, color: number, emoji: string, onDone: () => void) {
    const muralIndex = this.muralItems.length;
    const targetY = PANEL_Y + 100 + muralIndex * 170 + 70;

    const card = this.add.container(fromX, fromY).setDepth(80);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.9);
    bg.fillRoundedRect(-38, -28, 76, 56, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-38, -28, 76, 56, 10);
    const emo = this.addSharpText(0, 0, emoji, { fontSize: "28px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    card.add([bg, emo]);

    this.tweens.add({
      targets: card,
      x: RIGHT_CX,
      y: targetY,
      scaleX: 0.55,
      scaleY: 0.55,
      duration: 680,
      ease: "Cubic.easeOut",
      onComplete: () => { card.destroy(); onDone(); },
    });
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

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

  // ─── Flow Screens ─────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: StudioLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.62).setDepth(60));
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
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#7c3aed", align: "center",
    }).setOrigin(0.5);
    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(num <= this.levelConfig.level ? COLORS.green : num === nextLevel ? COLORS.amber : 0xd1d5db, 1);
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
      const c = [COLORS.purple, COLORS.green, COLORS.amber, COLORS.blue, COLORS.pink][i % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(c, 0.85);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 56, duration: 1600, delay: i * 90 });
    }
    this.time.delayedCall(1800, () => this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors }));
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.66).setDepth(60));
    bg.setInteractive();
    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.purple, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);
    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.purple, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);
    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });
    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nEstúdio Multiformato!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.purple, COLORS.amber, COLORS.green, COLORS.blue, COLORS.pink][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });
    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.purple, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, 0xffffff, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
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
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.7).setDepth(60));
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
    const reason = this.addSharpText(0, -22, "O tempo esgotou!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 28, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);
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

    const rz = this.addOverlay(this.add.zone(640 - 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => { this.playClick(); this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0 }); });

    const ez = this.addOverlay(this.add.zone(640 + 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─── Overlay Helpers ──────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T) { this.overlayObjects.push(o); return o; }
  private clearOverlay() { this.overlayObjects.forEach((o) => o.destroy()); this.overlayObjects = []; this.input.setDefaultCursor("default"); }
  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0); m.setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private getScore() { return Math.max(0, this.hits * 20 - this.errors * 5); }
  private toCssColor(c: number) { return `#${c.toString(16).padStart(6, "0")}`; }

  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const scale = Math.min(maxW / image.width, maxH / image.height);
    image.setScale(scale);
    return image;
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
    bg.lineStyle(4, 0xffffff, 0.9);
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

// Helper: approximate center of the drawing canvas for fly animation origin
function CANVAS_FLY_X() { return LEFT_CX; }
function CANVAS_FLY_Y() { return PANEL_Y + PANEL_H / 2; }
