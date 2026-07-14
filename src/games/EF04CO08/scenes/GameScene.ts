import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, CRITERIA } from "../data/levels";
import type { SourceLevel, SourceLevelNumber, SimulatedPage, CriteriaResults } from "../types";

const GAME_ID = "caca-fonte-confiavel";

// ── Layout ────────────────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y  = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.10;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:    0x1e3a8a,
  blue:    0x1d4ed8,
  skyBg:   0x0a1628,
  panel:   0x0f2344,
  amber:   0xfbbf24,
  amberDk: 0xd97706,
  green:   0x16a34a,
  greenLt: 0x4ade80,
  red:     0xdc2626,
  redLt:   0xfca5a5,
  white:   0xffffff,
  gray:    0x64748b,
  slate:   0x334155,
  ink:     0x060f1e,
  steel:   0x1e293b,
  sky:     0x93c5fd,
  cream:   0xf0f9ff,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: SourceLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1PageIndex = 0;
  private n1UserChecks: Partial<CriteriaResults> = {};
  private n1CheckGraphics: Map<keyof CriteriaResults, Phaser.GameObjects.Graphics> = new Map();
  private n1Attempted = false;

  // N2 state
  private n2CompIndex = 0;

  // N3 state
  private n3RankIndex = 0;
  private n3SelectionOrder: string[] = [];
  private n3CardGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private n3OrderLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as SourceLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1PageIndex = 0;
    this.n1UserChecks = {};
    this.n1CheckGraphics = new Map();
    this.n1Attempted = false;
    this.n2CompIndex = 0;
    this.n3RankIndex = 0;
    this.n3SelectionOrder = [];
    this.n3CardGraphics = new Map();
    this.n3OrderLabels = new Map();
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
    const color = pct > 0.5 ? C.green : pct > 0.25 ? C.amber : C.red;
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
      this.levelConfig.level === 1 ? "bg-research-desk"
      : this.levelConfig.level === 2 ? "bg-comparison-room"
      : "bg-ranking-board";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / (bg.width || 1), 720 / (bg.height || 1));
    bg.setScale(Math.max(scale, 0.5));
    this.add.rectangle(640, 360, 1280, 720, C.ink, 0.72).setDepth(-89);
  }

  // ─── Timer Bar ────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(C.slate, 0.22);
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
    const overlay = this.add.rectangle(640, 360, 1280, 720, C.ink, 0.74).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(C.cream, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, C.navy, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.navy, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "36px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      stroke: "#f0f9ff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#475569",
      align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(C.amber, 0.18);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#78350f",
      align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(C.navy, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, C.amber, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, lvlLabel, title, obj, detail, tipBg, tip, btnBg, btnText]);
    panel.setAlpha(0);
    panel.setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 149 * MODAL_SCALE, 256 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);

    hz.on("pointerover", () => { this.input.setDefaultCursor("pointer"); });
    hz.on("pointerout", () => { this.input.setDefaultCursor("default"); });
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
      this.showN1Page();
    } else if (this.levelConfig.level === 2) {
      this.showN2Comparison();
    } else {
      this.showN3Ranking();
    }
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(C.white, 0.82);
    card.fillRoundedRect(180, 96, 920, 44, 22);
    card.lineStyle(4, C.navy, 0.7);
    card.strokeRoundedRect(180, 96, 920, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 880 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      backgroundColor: "rgba(240,249,255,0.90)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(C.ink, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(C.panel, 0.52);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(C.white, 0.07);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(5, C.navy, 0.7);
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
    this.n1CheckGraphics = new Map();
    this.n3CardGraphics = new Map();
    this.n3OrderLabels = new Map();
  }

  // ─── Page Card ────────────────────────────────────────────────────────────

  private createPageCard(
    x: number, y: number, w: number, h: number,
    page: SimulatedPage, depth = 10,
  ) {
    const g = this.addContent(this.add.graphics().setDepth(depth));
    g.fillStyle(C.steel, 0.9);
    g.fillRoundedRect(x, y, w, h, 18);
    g.lineStyle(3, C.navy, 0.8);
    g.strokeRoundedRect(x, y, w, h, 18);

    // Top accent bar
    g.fillStyle(C.navy, 1);
    g.fillRoundedRect(x, y, w, 36, 18);
    g.fillRect(x, y + 18, w, 18);

    // Title
    const titleObj = this.addContent(this.addSharpText(x + 12, y + 8, page.title, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      wordWrap: { width: w - 24 },
    }).setDepth(depth + 1));
    void titleObj;

    // URL
    const urlY = y + 42;
    this.addContent(this.addSharpText(x + 12, urlY, `🔗 ${page.url}`, {
      fontSize: "13px", fontFamily: "Arial, Arial", color: "#93c5fd",
      wordWrap: { width: w - 24 },
    }).setDepth(depth + 1));

    let contentY = urlY + 22;

    // Author
    const authorText = page.author ?? "❌ Sem autor identificado";
    const authorColor = page.author ? "#4ade80" : "#fca5a5";
    this.addContent(this.addSharpText(x + 12, contentY, `✍️ ${authorText}`, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: authorColor,
      wordWrap: { width: w - 24 },
    }).setDepth(depth + 1));
    contentY += 22;

    // Date
    const year = parseInt(page.date.split("-")[0]);
    const isRecent = year >= 2020;
    const dateColor = isRecent ? "#4ade80" : "#fca5a5";
    this.addContent(this.addSharpText(x + 12, contentY, `📅 ${page.date}${isRecent ? "" : " (antiga)"}`, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: dateColor,
      wordWrap: { width: w - 24 },
    }).setDepth(depth + 1));
    contentY += 22;

    // Site type
    const siteLabels: Record<string, string> = {
      official: "🏛️ Site oficial",
      educational: "🎓 Site educativo",
      blog: "📝 Blog pessoal",
      unknown: "❓ Site desconhecido",
    };
    const siteColor = (page.siteType === "official" || page.siteType === "educational") ? "#4ade80" : "#fca5a5";
    this.addContent(this.addSharpText(x + 12, contentY, siteLabels[page.siteType] ?? page.siteType, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: siteColor,
    }).setDepth(depth + 1));
    contentY += 22;

    // Snippet (if fits)
    if (page.snippet && h > 180) {
      const snippetBg = this.addContent(this.add.graphics().setDepth(depth));
      snippetBg.fillStyle(C.ink, 0.38);
      snippetBg.fillRoundedRect(x + 8, contentY + 2, w - 16, Math.min(h - contentY - y - 16, 72), 8);

      this.addContent(this.addSharpText(x + 14, contentY + 6, page.snippet, {
        fontSize: "12px", fontFamily: "Arial, Arial", color: "#cbd5e1",
        wordWrap: { width: w - 28 },
      }).setDepth(depth + 1));
    }

    return g;
  }

  // ─── Criteria Checklist ───────────────────────────────────────────────────

  /**
   * Renders a 5-criterion checklist.
   * @param interactive — if true, renders checkboxes the user can toggle
   * @param readOnlyResults — if provided, shows fixed ✓/✗ icons (N2 read-only)
   */
  private createCriteriaChecklist(
    x: number, y: number, w: number,
    interactive: boolean,
    readOnlyResults?: CriteriaResults,
  ) {
    const ROW_H = 52;

    // Label
    const labelBg = this.addContent(this.add.graphics().setDepth(10));
    labelBg.fillStyle(C.navy, 0.9);
    labelBg.fillRoundedRect(x, y - 2, w, 30, 10);
    this.addContent(this.addSharpText(x + w / 2, y + 13, "📋 Critérios de Confiabilidade", {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
    }).setOrigin(0.5).setDepth(12));

    CRITERIA.forEach((crit, i) => {
      const rowY = y + 34 + i * ROW_H;
      const isChecked = interactive ? !!this.n1UserChecks[crit.id] : readOnlyResults?.[crit.id] ?? false;

      const rowBg = this.addContent(this.add.graphics().setDepth(10));
      this.drawCriteriaRow(rowBg, x, rowY, w, ROW_H - 4, isChecked, interactive);

      if (interactive) {
        this.n1CheckGraphics.set(crit.id, rowBg);

        const zone = this.addContent(this.add.zone(x + w / 2, rowY + (ROW_H - 4) / 2, w, ROW_H - 4).setDepth(55));
        zone.setInteractive({ useHandCursor: true });
        const id = crit.id;
        zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
        zone.on("pointerout", () => this.input.setDefaultCursor("default"));
        zone.on("pointerdown", () => {
          if (this.gameEnded) return;
          this.n1UserChecks[id] = !this.n1UserChecks[id];
          const g = this.n1CheckGraphics.get(id);
          if (g) this.drawCriteriaRow(g, x, rowY, w, ROW_H - 4, !!this.n1UserChecks[id], true);
          this.playClick();
        });
      }

      // Check/cross icon
      const icon = isChecked ? "✓" : (interactive ? "□" : "✗");
      const iconColor = isChecked ? "#4ade80" : (interactive ? "#64748b" : "#fca5a5");
      this.addContent(this.addSharpText(x + 22, rowY + (ROW_H - 4) / 2, icon, {
        fontSize: "20px", fontFamily: "Arial Black, Arial", color: iconColor,
      }).setOrigin(0.5).setDepth(12));

      // Label text
      this.addContent(this.addSharpText(x + 44, rowY + (ROW_H - 4) / 2, crit.label, {
        fontSize: "13px", fontFamily: "Arial Black, Arial", color: isChecked ? "#f0f9ff" : "#94a3b8",
        wordWrap: { width: w - 54 },
      }).setOrigin(0, 0.5).setDepth(12));
    });
  }

  private drawCriteriaRow(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    checked: boolean, interactive: boolean,
  ) {
    g.clear();
    if (checked) {
      g.fillStyle(C.green, 0.22);
      g.fillRoundedRect(x + 2, y, w - 4, h, 8);
      g.lineStyle(2, C.green, 0.7);
      g.strokeRoundedRect(x + 2, y, w - 4, h, 8);
    } else {
      g.fillStyle(interactive ? C.steel : C.ink, 0.5);
      g.fillRoundedRect(x + 2, y, w - 4, h, 8);
      g.lineStyle(1, C.slate, 0.4);
      g.strokeRoundedRect(x + 2, y, w - 4, h, 8);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N1 — Avalie Critério por Critério
  // ═══════════════════════════════════════════════════════════════════════════

  private showN1Page() {
    this.clearContent();
    this.n1UserChecks = {};
    this.n1CheckGraphics = new Map();
    this.n1Attempted = false;

    const pages = this.levelConfig.n1Pages ?? [];
    if (this.n1PageIndex >= pages.length) {
      this.completeLevel();
      return;
    }

    const page = pages[this.n1PageIndex];

    // Progress dots
    const progCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    pages.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n1PageIndex ? C.green
        : i === this.n1PageIndex ? C.amber
        : C.gray, 1,
      );
      dot.fillCircle(-20 + i * 20, 0, 7);
      dot.lineStyle(2, C.white, 0.6);
      dot.strokeCircle(-20 + i * 20, 0, 7);
      (progCont as Phaser.GameObjects.Container).add(dot);
    });

    // Page card (left side)
    const cardX = PANEL_X + 16;
    const cardY = PANEL_Y + 46;
    const cardW = 630;
    const cardH = PANEL_H - 56;
    this.createPageCard(cardX, cardY, cardW, cardH, page, 10);

    // Divider
    const divG = this.addContent(this.add.graphics().setDepth(10));
    divG.lineStyle(2, C.navy, 0.35);
    divG.lineBetween(PANEL_X + 660, PANEL_Y + 50, PANEL_X + 660, PANEL_Y + PANEL_H - 50);

    // Checklist (right side) - interactive
    const checkX = PANEL_X + 668;
    const checkY = PANEL_Y + 48;
    const checkW = PANEL_X + PANEL_W - checkX - 16;
    this.createCriteriaChecklist(checkX, checkY, checkW, true);

    // Confirm button
    const confirmY = PANEL_Y + PANEL_H - 60;
    const confirmBg = this.addContent(this.add.graphics().setDepth(14));
    confirmBg.fillStyle(C.green, 1);
    confirmBg.fillRoundedRect(checkX, confirmY, checkW, 50, 25);
    confirmBg.lineStyle(4, C.white, 1);
    confirmBg.strokeRoundedRect(checkX, confirmY, checkW, 50, 25);

    this.addContent(this.addSharpText(checkX + checkW / 2, confirmY + 25, "✓ Confirmar Avaliação", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15));

    const confirmZone = this.addContent(
      this.add.zone(checkX + checkW / 2, confirmY + 25, checkW, 50).setDepth(55),
    );
    confirmZone.setInteractive({ useHandCursor: true });
    confirmZone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN1Answer(page, checkX, checkY, checkW);
    });
  }

  private checkN1Answer(page: SimulatedPage, checkX: number, checkY: number, checkW: number) {
    const correct = page.criteriaResults;
    const ROW_H = 52;
    let allCorrect = true;
    const wrongIds: Array<keyof CriteriaResults> = [];

    CRITERIA.forEach((crit) => {
      const userVal = !!this.n1UserChecks[crit.id];
      const correctVal = correct[crit.id];
      if (userVal !== correctVal) {
        allCorrect = false;
        wrongIds.push(crit.id);
      }
    });

    if (allCorrect) {
      this.hits += 1;
      this.playSuccess();
      const score = page.credibilityScore;
      const label = score >= 4 ? "confiável" : score >= 2 ? "parcialmente confiável" : "pouco confiável";
      this.showToast(`✅ Correto! Esta fonte é ${label} (${score}/5 critérios). Ótimo trabalho!`, C.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n1PageIndex += 1;
        this.showN1Page();
      });
    } else {
      this.errors += 1;
      this.n1Attempted = true;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      // Flash wrong criteria red
      wrongIds.forEach((id, wi) => {
        const g = this.n1CheckGraphics.get(id);
        if (!g) return;
        const rowY = checkY + 34 + CRITERIA.findIndex((c) => c.id === id) * ROW_H;
        g.clear();
        g.fillStyle(C.red, 0.28);
        g.fillRoundedRect(checkX + 2, rowY, checkW - 4, ROW_H - 4, 8);
        g.lineStyle(3, C.red, 0.9);
        g.strokeRoundedRect(checkX + 2, rowY, checkW - 4, ROW_H - 4, 8);
        this.time.delayedCall(900 + wi * 50, () => {
          if (!g.active) return;
          const checked = !!this.n1UserChecks[id];
          this.drawCriteriaRow(g, checkX, rowY, checkW, ROW_H - 4, checked, true);
        });
      });

      const wrongCount = wrongIds.length;
      this.showToast(`❌ ${wrongCount} critério(s) incorreto(s)! Verifique e tente novamente.`, C.red, 2400);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N2 — Compare Duas Fontes
  // ═══════════════════════════════════════════════════════════════════════════

  private showN2Comparison() {
    this.clearContent();

    const comps = this.levelConfig.n2Comparisons ?? [];
    if (this.n2CompIndex >= comps.length) {
      this.completeLevel();
      return;
    }

    const comp = comps[this.n2CompIndex];

    // Progress dots
    const progCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    comps.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n2CompIndex ? C.green
        : i === this.n2CompIndex ? C.amber
        : C.gray, 1,
      );
      dot.fillCircle(-20 + i * 20, 0, 7);
      dot.lineStyle(2, C.white, 0.6);
      dot.strokeCircle(-20 + i * 20, 0, 7);
      (progCont as Phaser.GameObjects.Container).add(dot);
    });

    // Question label
    this.addContent(this.addSharpText(640, PANEL_Y + 36, "Qual fonte é mais confiável para sua pesquisa?", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 4, align: "center",
    }).setOrigin(0.5).setDepth(12));

    const CARD_W = 510;
    const CARD_H = 200;
    const CARD_Y = PANEL_Y + 56;
    const CHECKLIST_H = 220;
    const CHECKLIST_Y = CARD_Y + CARD_H + 14;

    // Page A (left)
    const aX = PANEL_X + 12;
    const aCheckW = CARD_W;
    this.buildN2PageBlock("A", aX, CARD_Y, CARD_W, CARD_H, CHECKLIST_Y, aCheckW, comp.pageA, comp.correct);

    // Divider
    const divG = this.addContent(this.add.graphics().setDepth(10));
    divG.lineStyle(2, C.navy, 0.3);
    divG.lineBetween(PANEL_X + 540, PANEL_Y + 56, PANEL_X + 540, PANEL_Y + PANEL_H - 20);

    // Page B (right)
    const bX = PANEL_X + 556;
    const bCheckW = PANEL_X + PANEL_W - bX - 12;
    this.buildN2PageBlock("B", bX, CARD_Y, bCheckW, CARD_H, CHECKLIST_Y, bCheckW, comp.pageB, comp.correct);

    void CHECKLIST_H;
  }

  private buildN2PageBlock(
    label: "A" | "B",
    x: number, y: number, w: number, cardH: number,
    checklistY: number, checklistW: number,
    page: SimulatedPage,
    correct: "A" | "B",
  ) {
    // Page card
    this.createPageCard(x, y, w, cardH, page, 10);

    // Label badge
    const badgeBg = this.addContent(this.add.graphics().setDepth(15));
    badgeBg.fillStyle(C.navy, 1);
    badgeBg.fillCircle(x + 24, y + 24, 18);
    badgeBg.lineStyle(3, C.amber, 1);
    badgeBg.strokeCircle(x + 24, y + 24, 18);
    this.addContent(this.addSharpText(x + 24, y + 24, label, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
    }).setOrigin(0.5).setDepth(16));

    // Read-only checklist using page.criteriaResults or summary
    this.createCriteriaChecklist(x, checklistY, checklistW, false, page.criteriaResults);

    // Confidence score bar
    const scoreY = checklistY + 5 * 52 + 44;
    const score = page.credibilityScore;
    const scoreW = checklistW - 16;
    const scoreBg = this.addContent(this.add.graphics().setDepth(10));
    scoreBg.fillStyle(C.steel, 0.7);
    scoreBg.fillRoundedRect(x + 8, scoreY, scoreW, 28, 14);
    const fillFrac = score / 5;
    const fillColor = score >= 4 ? C.green : score >= 2 ? C.amber : C.red;
    scoreBg.fillStyle(fillColor, 0.9);
    scoreBg.fillRoundedRect(x + 8, scoreY, scoreW * fillFrac, 28, 14);
    this.addContent(this.addSharpText(x + 8 + scoreW / 2, scoreY + 14, `Confiabilidade: ${score}/5`, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#ffffff",
    }).setOrigin(0.5).setDepth(12));

    // Click zone
    const clickH = checklistY + 5 * 52 + 44 + 28 - y + 14;
    const zone = this.addContent(this.add.zone(x + w / 2, y + clickH / 2, w, clickH).setDepth(56));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    zone.on("pointerout", () => this.input.setDefaultCursor("default"));
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN2Answer(label, correct, x, y, w, clickH);
    });
  }

  private checkN2Answer(
    chosen: "A" | "B",
    correct: "A" | "B",
    cardX: number, cardY: number, cardW: number, cardH: number,
  ) {
    if (chosen === correct) {
      this.hits += 1;
      this.playSuccess();

      // Green highlight on chosen card
      const highlight = this.addContent(this.add.graphics().setDepth(58));
      highlight.lineStyle(6, C.greenLt, 1);
      highlight.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);
      this.tweens.add({ targets: highlight, alpha: 0, duration: 800, delay: 800 });

      this.showToast(`✅ Correto! A fonte ${correct} é mais confiável!`, C.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n2CompIndex += 1;
        this.showN2Comparison();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      // Shake chosen card
      const origX = cardX + cardW / 2;
      this.tweens.add({
        targets: { x: origX },
        x: origX + 12,
        duration: 60,
        yoyo: true,
        repeat: 4,
        ease: "Sine.easeInOut",
        onUpdate: (tween) => {
          const shake = this.addContent(this.add.graphics().setDepth(58));
          shake.lineStyle(5, C.red, 0.8);
          shake.strokeRoundedRect(cardX + (tween.getValue() - origX), cardY, cardW, cardH, 18);
          this.time.delayedCall(40, () => shake.destroy());
        },
      });

      this.showToast(`❌ Não é essa! Analise os critérios com atenção.`, C.red, 2000);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // N3 — Classifique por Confiabilidade
  // ═══════════════════════════════════════════════════════════════════════════

  private showN3Ranking() {
    this.clearContent();
    this.n3SelectionOrder = [];
    this.n3CardGraphics = new Map();
    this.n3OrderLabels = new Map();

    const rankings = this.levelConfig.n3Rankings ?? [];
    if (this.n3RankIndex >= rankings.length) {
      this.completeFinalLevel();
      return;
    }

    const ranking = rankings[this.n3RankIndex];

    // Progress dots
    const progCont = this.addContent(this.add.container(640, PANEL_Y + 26).setDepth(12));
    rankings.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n3RankIndex ? C.green
        : i === this.n3RankIndex ? C.amber
        : C.gray, 1,
      );
      dot.fillCircle(-10 + i * 20, 0, 7);
      dot.lineStyle(2, C.white, 0.6);
      dot.strokeCircle(-10 + i * 20, 0, 7);
      (progCont as Phaser.GameObjects.Container).add(dot);
    });

    // Instruction
    this.addContent(this.addSharpText(640, PANEL_Y + 40, "Toque nas páginas em ordem: 1ª (mais confiável), 2ª, 3ª", {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 4, align: "center",
    }).setOrigin(0.5).setDepth(12));

    const CARD_W = 340;
    const CARD_H = 290;
    const CARD_Y = PANEL_Y + 62;
    const GAP = 28;
    const totalW = ranking.pages.length * CARD_W + (ranking.pages.length - 1) * GAP;
    const startX = 640 - totalW / 2;

    ranking.pages.forEach((page, i) => {
      const cardX = startX + i * (CARD_W + GAP);

      // Page card
      this.createPageCard(cardX, CARD_Y, CARD_W, CARD_H, page, 10);

      // Label badge (A/B/C)
      const badgeBg = this.addContent(this.add.graphics().setDepth(14));
      badgeBg.fillStyle(C.navy, 1);
      badgeBg.fillCircle(cardX + CARD_W - 24, CARD_Y + 24, 18);
      badgeBg.lineStyle(3, C.amber, 1);
      badgeBg.strokeCircle(cardX + CARD_W - 24, CARD_Y + 24, 18);
      this.addContent(this.addSharpText(cardX + CARD_W - 24, CARD_Y + 24, page.label ?? String(i + 1), {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      }).setOrigin(0.5).setDepth(16));

      // Score bar below card
      const barY = CARD_Y + CARD_H + 10;
      const barH = 22;
      const scoreFill = this.addContent(this.add.graphics().setDepth(10));
      scoreFill.fillStyle(C.steel, 0.7);
      scoreFill.fillRoundedRect(cardX, barY, CARD_W, barH, 11);
      const fc = page.credibilityScore >= 4 ? C.green : page.credibilityScore >= 2 ? C.amber : C.red;
      scoreFill.fillStyle(fc, 0.9);
      scoreFill.fillRoundedRect(cardX, barY, CARD_W * page.credibilityScore / 5, barH, 11);
      this.addContent(this.addSharpText(cardX + CARD_W / 2, barY + 11, `${page.credibilityScore}/5 critérios`, {
        fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      }).setOrigin(0.5).setDepth(12));

      // Selection order overlay (shows 1, 2, 3 as user picks)
      const selG = this.addContent(this.add.graphics().setDepth(20));
      this.n3CardGraphics.set(page.label ?? String(i), selG);

      const selLabel = this.addContent(this.addSharpText(cardX + CARD_W / 2, CARD_Y + CARD_H / 2, "", {
        fontSize: "64px", fontFamily: "Arial Black, Arial", color: "#ffffff",
        stroke: "#1e3a8a", strokeThickness: 8,
      }).setOrigin(0.5).setDepth(22).setAlpha(0.9));
      this.n3OrderLabels.set(page.label ?? String(i), selLabel);

      // Click zone
      const zone = this.addContent(
        this.add.zone(cardX + CARD_W / 2, CARD_Y + CARD_H / 2, CARD_W, CARD_H).setDepth(56),
      );
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
      zone.on("pointerout", () => this.input.setDefaultCursor("default"));
      const pageLabel = page.label ?? String(i);
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.n3SelectPage(pageLabel, cardX, CARD_Y, CARD_W, CARD_H);
      });
    });

    // Confirm button
    const confirmY = PANEL_Y + PANEL_H - 52;
    const confirmBg = this.addContent(this.add.graphics().setDepth(14));
    confirmBg.fillStyle(C.green, 1);
    confirmBg.fillRoundedRect(PANEL_X + 16, confirmY, PANEL_W - 32, 46, 23);
    confirmBg.lineStyle(4, C.white, 1);
    confirmBg.strokeRoundedRect(PANEL_X + 16, confirmY, PANEL_W - 32, 46, 23);

    this.addContent(this.addSharpText(640, confirmY + 23, "✓ Confirmar Ordenação", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15));

    const confirmZone = this.addContent(
      this.add.zone(640, confirmY + 23, PANEL_W - 32, 46).setDepth(57),
    );
    confirmZone.setInteractive({ useHandCursor: true });
    confirmZone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.checkN3Order(this.levelConfig.n3Rankings?.[this.n3RankIndex]?.correctOrder ?? []);
    });
  }

  private n3SelectPage(label: string, cardX: number, cardY: number, cardW: number, cardH: number) {
    // Already selected?
    const existing = this.n3SelectionOrder.indexOf(label);
    if (existing >= 0) {
      // Deselect — remove and rebuild
      this.n3SelectionOrder.splice(existing, 1);
      // Update numbers for all remaining
      this.playClick();
      this.rebuildN3Labels();
      const g = this.n3CardGraphics.get(label);
      if (g) { g.clear(); }
      const lbl = this.n3OrderLabels.get(label);
      if (lbl) lbl.setText("");
      return;
    }

    if (this.n3SelectionOrder.length >= 3) return;

    this.n3SelectionOrder.push(label);
    const num = this.n3SelectionOrder.length;
    this.playClick();

    const g = this.n3CardGraphics.get(label);
    if (g) {
      g.clear();
      const alpha = num === 1 ? 0.38 : num === 2 ? 0.26 : 0.20;
      g.fillStyle(C.amber, alpha);
      g.fillRoundedRect(cardX, cardY, cardW, cardH, 18);
      g.lineStyle(5, C.amber, 0.95);
      g.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);
    }

    const lbl = this.n3OrderLabels.get(label);
    if (lbl) lbl.setText(String(num));
  }

  private rebuildN3Labels() {
    const rankings = this.levelConfig.n3Rankings ?? [];
    const ranking = rankings[this.n3RankIndex];
    ranking.pages.forEach((page) => {
      const pageLabel = page.label ?? "";
      const idx = this.n3SelectionOrder.indexOf(pageLabel);
      const lbl = this.n3OrderLabels.get(pageLabel);
      const g = this.n3CardGraphics.get(pageLabel);
      if (lbl) lbl.setText(idx >= 0 ? String(idx + 1) : "");
      if (g) {
        g.clear();
        // We can't easily get cardX/Y here without re-computing — just clear
      }
    });
  }

  private checkN3Order(correctOrder: string[]) {
    if (this.n3SelectionOrder.length < 3) {
      this.showToast("⚠️ Toque nas 3 páginas para ordenar antes de confirmar!", C.amber, 2000);
      return;
    }

    const isCorrect = this.n3SelectionOrder.every((label, i) => label === correctOrder[i]);

    if (isCorrect) {
      this.hits += 1;
      this.playSuccess();
      this.showToast(`✅ Ordenação correta! ${correctOrder.join(" > ")} `, C.green, 1600);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 25 });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n3RankIndex += 1;
        this.showN3Ranking();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      // Show correct answer hint
      const hint = `Ordem correta: ${correctOrder.join(" > ")} (compare os critérios ✓)`;
      this.showToast(`❌ Ordenação errada. ${hint}`, C.red, 2800);

      // Reset selection
      this.n3SelectionOrder = [];
      this.n3CardGraphics.forEach((g) => g.clear());
      this.n3OrderLabels.forEach((lbl) => lbl.setText(""));
    }
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as SourceLevelNumber;
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

  private showLevelCompleteScreen(nextLevel: SourceLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.66).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, C.navy, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.navy, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -72, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      stroke: "#f0f9ff", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -16, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      const col = num <= this.levelConfig.level ? C.navy : num === nextLevel ? C.amber : 0xd1d5db;
      d.fillStyle(col, 1);
      d.fillCircle(-28 + i * 28, 88, 9);
      d.lineStyle(2, C.white, 0.8);
      d.strokeCircle(-28 + i * 28, 88, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let i = 0; i < 14; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const col = [C.navy, C.amber, C.green, C.sky, 0xf59e0b][i % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(col, 0.85);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 56, duration: 1600, delay: i * 90 });
    }

    this.time.delayedCall(1800, () =>
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors }),
    );
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.70).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, C.navy, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(C.navy, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -162, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#1e3a8a",
      stroke: "#f0f9ff", strokeThickness: 7,
    }).setOrigin(0.5);

    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nCaça à Fonte Confiável!", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#1e293b", align: "center",
    }).setOrigin(0.5);

    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([C.navy, C.amber, C.green, C.sky, 0xfbbf24][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({
        targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 },
        duration: 640 + i * 40, yoyo: true, repeat: -1,
      });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.navy, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, C.amber, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#fbbf24",
      stroke: "#1e3a8a", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, ribbon, ...sparkles, stars, title, sub, desc, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(
      this.add.zone(640, 360 + 108 * MODAL_SCALE, 278 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
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
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, C.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -144, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -78, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626",
      stroke: "#f0f9ff", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -22, "⏰ O tempo esgotou!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 28, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(C.green, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, C.white, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "🔄 Tentar Novamente", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.amberDk, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, C.white, 1);
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
    return Math.max(0, this.hits * 20 - this.errors * 5);
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
    bg.lineStyle(4, C.white, 0.9);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#ffffff",
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
    this.playTone(660, 0.10, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.10, "triangle", 0.06));
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
