import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type { EthicLevel, EthicLevelNumber, EthicSituation, EthicScenario, EthicDilemma, DilemmaQuestion } from "../types";

const GAME_ID = "missao-etica-digital";

// ── Layout ────────────────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

// Ethics bar sits just inside the panel top
const ETHICS_BAR_X = 88;
const ETHICS_BAR_Y = PANEL_Y + 10;
const ETHICS_BAR_W = 900;
const ETHICS_BAR_H = 28;

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  darkBg:    0x011810,
  darkPanel: 0x052e16,
  emerald:   0x10b981,
  green:     0x065f46,
  lightGreen:0x6ee7b7,
  red:       0xdc2626,
  amber:     0xd97706,
  white:     0xffffff,
  gray:      0x64748b,
  slate:     0x334155,
  ink:       0x011810,
  cream:     0xf0fdf4,
  teal:      0x0d9488,
  orange:    0xf97316,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: EthicLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  // Timer
  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Ethics bar state (0–100)
  private ethicsValue = 50;
  private ethicsBarFill?: Phaser.GameObjects.Graphics;
  private ethicsLabel?: Phaser.GameObjects.Text;

  // Object buckets
  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1SituationIndex = 0;

  // N2 state
  private n2ScenarioIndex = 0;
  private n2DecisionIndex = 0;

  // N3 state
  private n3DilemmaIndex = 0;
  private n3Phase: "q1" | "q2" = "q1";

  constructor() {
    super({ key: "GameScene" });
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  init(data?: { level?: number; hits?: number; errors?: number; ethicsValue?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as EthicLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.ethicsValue = data?.ethicsValue ?? 50;
    this.n1SituationIndex = 0;
    this.n2ScenarioIndex = 0;
    this.n2DecisionIndex = 0;
    this.n3DilemmaIndex = 0;
    this.n3Phase = "q1";
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.contentObjects = [];
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  create() {
    this.createBackground();
    this.createTimerBar();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
    this.showStartScreen();
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(0, this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? C.emerald : pct > 0.25 ? C.amber : C.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
    EventBus.removeAllListeners();
  }

  // ── Background ─────────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-ethics-office"
      : this.levelConfig.level === 2 ? "bg-ethics-classroom"
      : "bg-ethics-dilemma";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / Math.max(bg.width, 1), 720 / Math.max(bg.height, 1));
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, C.ink, 0.60).setDepth(-89);
  }

  // ── Timer Bar ──────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(C.slate, 0.22);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, C.emerald);
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

  // ── Ethics Bar ─────────────────────────────────────────────────────────────

  private createEthicsBar() {
    // Track
    const track = this.add.graphics().setDepth(8);
    track.fillStyle(C.slate, 0.55);
    track.fillRoundedRect(ETHICS_BAR_X, ETHICS_BAR_Y, ETHICS_BAR_W, ETHICS_BAR_H, ETHICS_BAR_H / 2);

    // Fill
    this.ethicsBarFill = this.add.graphics().setDepth(9);
    this.renderEthicsBarFill();

    // Label
    this.ethicsLabel = this.addSharpText(
      ETHICS_BAR_X + ETHICS_BAR_W + 16,
      ETHICS_BAR_Y + ETHICS_BAR_H / 2,
      `⭐ ${Math.round(this.ethicsValue)}%`,
      { fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#6ee7b7" },
    ).setOrigin(0, 0.5).setDepth(10);

    this.addSharpText(
      ETHICS_BAR_X - 4,
      ETHICS_BAR_Y - 22,
      "Reputação Digital",
      { fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#10b981" },
    ).setOrigin(0, 1).setDepth(10);
  }

  private renderEthicsBarFill() {
    if (!this.ethicsBarFill) return;
    this.ethicsBarFill.clear();
    const fillW = Math.max(0, (this.ethicsValue / 100) * ETHICS_BAR_W);
    // colour: green above 50%, amber 25–50%, red below 25%
    const col = this.ethicsValue > 50 ? C.emerald : this.ethicsValue > 25 ? C.amber : C.red;
    if (fillW > 0) {
      this.ethicsBarFill.fillStyle(col, 1);
      this.ethicsBarFill.fillRoundedRect(ETHICS_BAR_X, ETHICS_BAR_Y, fillW, ETHICS_BAR_H, ETHICS_BAR_H / 2);
    }
  }

  private changeEthics(delta: number) {
    this.ethicsValue = Phaser.Math.Clamp(this.ethicsValue + delta, 0, 100);
    this.renderEthicsBarFill();
    if (this.ethicsLabel) {
      this.ethicsLabel.setText(`⭐ ${Math.round(this.ethicsValue)}%`);
    }
  }

  // ── Start Screen ───────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, C.ink, 0.70).setDepth(60);
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
    bg.lineStyle(6, C.emerald, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.green, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#f0fdf4",
      stroke: "#065f46", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#065f46",
      stroke: "#f0fdf4", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#475569",
      align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(C.amber, 0.16);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#92400e",
      align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(C.emerald, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, C.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#065f46", strokeThickness: 3,
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

  // ── Level UI Dispatcher ────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    this.createEthicsBar();
    if (this.levelConfig.level === 1) {
      this.showN1Situation();
    } else if (this.levelConfig.level === 2) {
      this.showN2Decision();
    } else {
      this.showN3Dilemma();
    }
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#6ee7b7",
      stroke: "#065f46", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(C.white, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(C.emerald, 0.12);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, C.emerald, 0.7);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1e293b",
      backgroundColor: "rgba(240,253,244,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ── Panel Background ───────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(C.ink, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(C.darkPanel, 0.62);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(C.white, 0.06);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(5, C.emerald, 0.55);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ── Content Helpers ────────────────────────────────────────────────────────

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
  }

  // ══════════════════════════════════════════════════════════════════════════
  // N1 — Ação Correta
  // ══════════════════════════════════════════════════════════════════════════

  private showN1Situation() {
    this.clearContent();
    const situations = this.levelConfig.n1Situations ?? [];
    if (this.n1SituationIndex >= situations.length) {
      this.completeLevel();
      return;
    }

    const sit: EthicSituation = situations[this.n1SituationIndex];

    // Progress dots
    this.drawProgressDots(situations.length, this.n1SituationIndex, 640, PANEL_Y + 52);

    // Card area — centre panel
    const cardX = PANEL_X + 80;
    const cardY = PANEL_Y + 76;
    const cardW = PANEL_W - 160;
    const cardH = 168;

    const cardBg = this.addContent(this.add.graphics().setDepth(10));
    cardBg.fillStyle(C.darkBg, 0.85);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 20);
    cardBg.lineStyle(3, C.emerald, 0.6);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 20);

    // Emoji + file label
    this.addContent(this.addSharpText(cardX + 64, cardY + cardH / 2, sit.emoji, {
      fontSize: "56px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5).setDepth(12));

    this.addContent(this.addSharpText(cardX + 64, cardY + cardH - 24, sit.file, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#6ee7b7",
    }).setOrigin(0.5).setDepth(12));

    // Divider
    const divG = this.addContent(this.add.graphics().setDepth(11));
    divG.lineStyle(2, C.emerald, 0.3);
    divG.lineBetween(cardX + 108, cardY + 12, cardX + 108, cardY + cardH - 12);

    // Situation text
    this.addContent(this.addSharpText(cardX + 130, cardY + cardH / 2, sit.situation, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0fdf4",
      wordWrap: { width: cardW - 150 },
    }).setOrigin(0, 0.5).setDepth(12));

    // Action buttons (3)
    const btnW = 340;
    const btnH = 72;
    const btnGap = 18;
    const totalW = btnW * sit.actions.length + btnGap * (sit.actions.length - 1);
    const startX = 640 - totalW / 2;
    const btnY = cardY + cardH + 36;

    sit.actions.forEach((action, i) => {
      const bx = startX + i * (btnW + btnGap);
      this.buildActionButton(bx, btnY, btnW, btnH, action.label, action.isEthical, sit);
    });
  }

  private buildActionButton(
    bx: number, by: number, bw: number, bh: number,
    label: string, isEthical: boolean,
    sit: EthicSituation,
  ) {
    const bg = this.addContent(this.add.graphics().setDepth(12));
    bg.fillStyle(0x1e3a2f, 0.92);
    bg.fillRoundedRect(bx, by, bw, bh, 16);
    bg.lineStyle(3, C.gray, 0.6);
    bg.strokeRoundedRect(bx, by, bw, bh, 16);

    this.addContent(this.addSharpText(bx + bw / 2, by + bh / 2, label, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      align: "center", wordWrap: { width: bw - 24 },
    }).setOrigin(0.5).setDepth(13));

    const zone = this.addContent(this.add.zone(bx + bw / 2, by + bh / 2, bw, bh).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      bg.clear();
      bg.fillStyle(0x065f46, 0.95);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.emerald, 0.9);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      bg.clear();
      bg.fillStyle(0x1e3a2f, 0.92);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.gray, 0.6);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.onN1ActionChosen(isEthical, bx, by, bw, bh, bg, sit);
    });
  }

  private onN1ActionChosen(
    isEthical: boolean,
    bx: number, by: number, bw: number, bh: number,
    bg: Phaser.GameObjects.Graphics,
    _sit: EthicSituation,
  ) {
    this.playClick();
    if (isEthical) {
      this.hits += 1;
      this.changeEthics(15);
      this.playSuccess();
      bg.clear();
      bg.fillStyle(C.emerald, 0.95);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.white, 1);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.showToast("✅ Ação ética! Sua reputação digital cresceu!", C.emerald, 1400);
      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n1SituationIndex += 1;
        this.showN1Situation();
      });
    } else {
      this.errors += 1;
      this.changeEthics(-20);
      this.playWrong();
      bg.clear();
      bg.fillStyle(C.red, 0.9);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.white, 1);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
      this.playDataSpreadAnimation();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.showToast("❌ Ação não ética! Pense na privacidade dos outros.", C.red, 2000);
      // reset button colour after 700ms
      this.time.delayedCall(700, () => {
        if (!bg.active) return;
        bg.clear();
        bg.fillStyle(0x1e3a2f, 0.92);
        bg.fillRoundedRect(bx, by, bw, bh, 16);
        bg.lineStyle(3, C.gray, 0.6);
        bg.strokeRoundedRect(bx, by, bw, bh, 16);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // N2 — Sequência de Decisões
  // ══════════════════════════════════════════════════════════════════════════

  private showN2Decision() {
    this.clearContent();
    const scenarios = this.levelConfig.n2Scenarios ?? [];
    if (this.n2ScenarioIndex >= scenarios.length) {
      this.completeLevel();
      return;
    }

    const scenario: EthicScenario = scenarios[this.n2ScenarioIndex];
    if (this.n2DecisionIndex >= scenario.decisions.length) {
      this.n2ScenarioIndex += 1;
      this.n2DecisionIndex = 0;
      this.showN2Decision();
      return;
    }

    const decision = scenario.decisions[this.n2DecisionIndex];

    // Scenario progress (outer)
    this.drawProgressDots(scenarios.length, this.n2ScenarioIndex, 580, PANEL_Y + 48, "Cenário");
    // Decision progress (inner)
    this.drawProgressDots(scenario.decisions.length, this.n2DecisionIndex, 820, PANEL_Y + 48, "Passo");

    // Header area for situation
    const cardX = PANEL_X + 60;
    const cardY = PANEL_Y + 72;
    const cardW = PANEL_W - 120;
    const cardH = 120;

    const cardBg = this.addContent(this.add.graphics().setDepth(10));
    cardBg.fillStyle(C.darkBg, 0.85);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 20);
    cardBg.lineStyle(3, C.emerald, 0.55);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 20);

    this.addContent(this.addSharpText(cardX + cardW / 2, cardY + cardH / 2, decision.situation, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#f0fdf4",
      align: "center", wordWrap: { width: cardW - 48 },
    }).setOrigin(0.5).setDepth(12));

    // 3 action buttons
    const btnW = 340;
    const btnH = 72;
    const btnGap = 18;
    const totalW = btnW * decision.actions.length + btnGap * (decision.actions.length - 1);
    const startX = 640 - totalW / 2;
    const btnY = cardY + cardH + 36;

    decision.actions.forEach((action, i) => {
      const bx = startX + i * (btnW + btnGap);
      this.buildDecisionButton(bx, btnY, btnW, btnH, action.label, action.isEthical);
    });
  }

  private buildDecisionButton(
    bx: number, by: number, bw: number, bh: number,
    label: string, isEthical: boolean,
  ) {
    const bg = this.addContent(this.add.graphics().setDepth(12));
    bg.fillStyle(0x1e3a2f, 0.92);
    bg.fillRoundedRect(bx, by, bw, bh, 16);
    bg.lineStyle(3, C.gray, 0.6);
    bg.strokeRoundedRect(bx, by, bw, bh, 16);

    this.addContent(this.addSharpText(bx + bw / 2, by + bh / 2, label, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      align: "center", wordWrap: { width: bw - 24 },
    }).setOrigin(0.5).setDepth(13));

    const zone = this.addContent(this.add.zone(bx + bw / 2, by + bh / 2, bw, bh).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      bg.clear();
      bg.fillStyle(0x065f46, 0.95);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.emerald, 0.9);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      bg.clear();
      bg.fillStyle(0x1e3a2f, 0.92);
      bg.fillRoundedRect(bx, by, bw, bh, 16);
      bg.lineStyle(3, C.gray, 0.6);
      bg.strokeRoundedRect(bx, by, bw, bh, 16);
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.playClick();
      if (isEthical) {
        this.hits += 1;
        this.changeEthics(15);
        this.playSuccess();
        bg.clear();
        bg.fillStyle(C.emerald, 0.95);
        bg.fillRoundedRect(bx, by, bw, bh, 16);
        bg.lineStyle(3, C.white, 1);
        bg.strokeRoundedRect(bx, by, bw, bh, 16);
        runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
        this.showToast("✅ Decisão ética! Avançando...", C.emerald, 1200);
        this.time.delayedCall(1300, () => {
          if (this.gameEnded) return;
          this.n2DecisionIndex += 1;
          this.showN2Decision();
        });
      } else {
        this.errors += 1;
        this.changeEthics(-20);
        this.playWrong();
        bg.clear();
        bg.fillStyle(C.red, 0.9);
        bg.fillRoundedRect(bx, by, bw, bh, 16);
        bg.lineStyle(3, C.white, 1);
        bg.strokeRoundedRect(bx, by, bw, bh, 16);
        this.playDataSpreadAnimation();
        runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
        this.showToast("❌ Essa decisão não foi ética. Tente outra opção.", C.red, 2000);
        this.time.delayedCall(700, () => {
          if (!bg.active) return;
          bg.clear();
          bg.fillStyle(0x1e3a2f, 0.92);
          bg.fillRoundedRect(bx, by, bw, bh, 16);
          bg.lineStyle(3, C.gray, 0.6);
          bg.strokeRoundedRect(bx, by, bw, bh, 16);
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // N3 — Dilema Ético
  // ══════════════════════════════════════════════════════════════════════════

  private showN3Dilemma() {
    this.clearContent();
    const dilemmas = this.levelConfig.n3Dilemmas ?? [];
    if (this.n3DilemmaIndex >= dilemmas.length) {
      this.completeFinalLevel();
      return;
    }

    const dilemma: EthicDilemma = dilemmas[this.n3DilemmaIndex];
    const question: DilemmaQuestion = this.n3Phase === "q1" ? dilemma.q1 : dilemma.q2;

    // Progress
    this.drawProgressDots(dilemmas.length, this.n3DilemmaIndex, 580, PANEL_Y + 48, "Dilema");

    // Phase indicator
    const phaseLabel = this.n3Phase === "q1" ? "🔍 Parte 1 de 2" : "💡 Parte 2 de 2";
    this.addContent(this.addSharpText(820, PANEL_Y + 48, phaseLabel, {
      fontSize: "16px", fontFamily: "Arial Black, Arial",
      color: this.n3Phase === "q1" ? "#6ee7b7" : "#fbbf24",
    }).setOrigin(0, 0.5).setDepth(12));

    // Context box (shown only on q1)
    let contextBottomY = PANEL_Y + 72;
    if (this.n3Phase === "q1") {
      const ctxX = PANEL_X + 60;
      const ctxY = PANEL_Y + 72;
      const ctxW = PANEL_W - 120;
      const ctxH = 90;

      const ctxBg = this.addContent(this.add.graphics().setDepth(10));
      ctxBg.fillStyle(0x022c22, 0.9);
      ctxBg.fillRoundedRect(ctxX, ctxY, ctxW, ctxH, 16);
      ctxBg.lineStyle(3, C.teal, 0.6);
      ctxBg.strokeRoundedRect(ctxX, ctxY, ctxW, ctxH, 16);

      this.addContent(this.addSharpText(ctxX + 24, ctxY + 14, "📋 Contexto:", {
        fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#6ee7b7",
      }).setOrigin(0, 0).setDepth(12));

      this.addContent(this.addSharpText(ctxX + ctxW / 2, ctxY + ctxH / 2 + 8, dilemma.context, {
        fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
        align: "center", wordWrap: { width: ctxW - 48 },
      }).setOrigin(0.5).setDepth(12));

      contextBottomY = ctxY + ctxH + 20;
    }

    // Question box
    const qX = PANEL_X + 60;
    const qY = contextBottomY;
    const qW = PANEL_W - 120;
    const qH = 76;

    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(0x064e3b, 0.88);
    qBg.fillRoundedRect(qX, qY, qW, qH, 16);
    qBg.lineStyle(3, C.emerald, 0.7);
    qBg.strokeRoundedRect(qX, qY, qW, qH, 16);

    this.addContent(this.addSharpText(qX + qW / 2, qY + qH / 2, `❓ ${question.q}`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#f0fdf4",
      align: "center", wordWrap: { width: qW - 48 },
    }).setOrigin(0.5).setDepth(12));

    // Options (2–3)
    const optW = 1040;
    const optH = 64;
    const optGap = 14;
    const optStartX = 640 - optW / 2;
    const optStartY = qY + qH + 24;

    question.options.forEach((optLabel, i) => {
      const oy = optStartY + i * (optH + optGap);
      this.buildOptionButton(optStartX, oy, optW, optH, optLabel, optLabel === question.correct, dilemma, question);
    });
  }

  private buildOptionButton(
    bx: number, by: number, bw: number, bh: number,
    label: string, isCorrect: boolean,
    dilemma: EthicDilemma,
    _question: DilemmaQuestion,
  ) {
    const bg = this.addContent(this.add.graphics().setDepth(12));
    bg.fillStyle(0x1e3a2f, 0.92);
    bg.fillRoundedRect(bx, by, bw, bh, 14);
    bg.lineStyle(3, C.gray, 0.5);
    bg.strokeRoundedRect(bx, by, bw, bh, 14);

    this.addContent(this.addSharpText(bx + bw / 2, by + bh / 2, label, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      align: "center", wordWrap: { width: bw - 32 },
    }).setOrigin(0.5).setDepth(13));

    const zone = this.addContent(this.add.zone(bx + bw / 2, by + bh / 2, bw, bh).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      bg.clear();
      bg.fillStyle(0x065f46, 0.95);
      bg.fillRoundedRect(bx, by, bw, bh, 14);
      bg.lineStyle(3, C.emerald, 0.9);
      bg.strokeRoundedRect(bx, by, bw, bh, 14);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      bg.clear();
      bg.fillStyle(0x1e3a2f, 0.92);
      bg.fillRoundedRect(bx, by, bw, bh, 14);
      bg.lineStyle(3, C.gray, 0.5);
      bg.strokeRoundedRect(bx, by, bw, bh, 14);
    });
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.playClick();
      this.onN3OptionChosen(isCorrect, bx, by, bw, bh, bg, dilemma);
    });
  }

  private onN3OptionChosen(
    isCorrect: boolean,
    bx: number, by: number, bw: number, bh: number,
    bg: Phaser.GameObjects.Graphics,
    dilemma: EthicDilemma,
  ) {
    if (isCorrect) {
      this.hits += 1;
      this.changeEthics(15);
      this.playSuccess();
      bg.clear();
      bg.fillStyle(C.emerald, 0.95);
      bg.fillRoundedRect(bx, by, bw, bh, 14);
      bg.lineStyle(3, C.white, 1);
      bg.strokeRoundedRect(bx, by, bw, bh, 14);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });

      if (this.n3Phase === "q1") {
        this.showToast("✅ Correto! Agora responda a segunda pergunta.", C.emerald, 1400);
        this.time.delayedCall(1500, () => {
          if (this.gameEnded) return;
          this.n3Phase = "q2";
          this.showN3Dilemma();
        });
      } else {
        // Both parts done → celebrate then next dilemma or final
        this.showStarCelebration();
        this.showToast("⭐ Dilema resolvido com sabedoria ética!", C.emerald, 1800);
        this.time.delayedCall(1900, () => {
          if (this.gameEnded) return;
          this.n3DilemmaIndex += 1;
          this.n3Phase = "q1";
          this.showN3Dilemma();
        });
      }
    } else {
      this.errors += 1;
      this.changeEthics(-20);
      this.playWrong();
      bg.clear();
      bg.fillStyle(C.red, 0.9);
      bg.fillRoundedRect(bx, by, bw, bh, 14);
      bg.lineStyle(3, C.white, 1);
      bg.strokeRoundedRect(bx, by, bw, bh, 14);
      this.playDataSpreadAnimation();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      const hint = this.n3Phase === "q1" ? dilemma.q1.correct : dilemma.q2.correct;
      void hint;
      this.showToast("❌ Não é a melhor escolha ética. Tente novamente.", C.red, 2200);
      this.time.delayedCall(700, () => {
        if (!bg.active) return;
        bg.clear();
        bg.fillStyle(0x1e3a2f, 0.92);
        bg.fillRoundedRect(bx, by, bw, bh, 14);
        bg.lineStyle(3, C.gray, 0.5);
        bg.strokeRoundedRect(bx, by, bw, bh, 14);
      });
    }
  }

  // ── Animations ─────────────────────────────────────────────────────────────

  private playDataSpreadAnimation() {
    for (let i = 0; i < 16; i++) {
      const startX = Phaser.Math.Between(300, 980);
      const startY = Phaser.Math.Between(200, 520);
      const p = this.add.graphics().setDepth(150);
      p.fillStyle(C.red, 0.85);
      p.fillCircle(0, 0, Phaser.Math.Between(4, 8));
      p.setPosition(startX, startY);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(60, 220);
      this.tweens.add({
        targets: p,
        x: startX + Math.cos(angle) * dist,
        y: startY + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 700 + i * 30,
        delay: i * 30,
        ease: "Cubic.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  }

  private showStarCelebration() {
    const cx = 640;
    const cy = 360;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const s = this.add.text(
        cx + Math.cos(angle) * 40,
        cy + Math.sin(angle) * 40,
        "⭐",
        { fontSize: "28px" },
      ).setOrigin(0.5).setDepth(151);
      this.tweens.add({
        targets: s,
        x: cx + Math.cos(angle) * 180,
        y: cy + Math.sin(angle) * 180,
        alpha: 0,
        scale: 0.4,
        duration: 900,
        delay: i * 50,
        ease: "Cubic.easeOut",
        onComplete: () => s.destroy(),
      });
    }
  }

  // ── Progress Dots ──────────────────────────────────────────────────────────

  private drawProgressDots(total: number, current: number, cx: number, cy: number, label = "") {
    if (label) {
      this.addContent(this.addSharpText(cx - total * 16 - 60, cy, label + ":", {
        fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#6ee7b7",
      }).setOrigin(0, 0.5).setDepth(12));
    }
    for (let i = 0; i < total; i++) {
      const dx = cx - (total - 1) * 16 + i * 32;
      const dot = this.addContent(this.add.graphics().setDepth(12));
      dot.fillStyle(i < current ? C.emerald : i === current ? C.amber : C.gray, 1);
      dot.fillCircle(dx, cy, 8);
      dot.lineStyle(2, C.white, 0.7);
      dot.strokeCircle(dx, cy, 8);
    }
  }

  // ── Level Completion ───────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as EthicLevelNumber;
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

  // ── Flow Screens ───────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: EthicLevelNumber) {
    this.clearOverlay();
    const bgRect = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.64).setDepth(60));
    bgRect.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, C.emerald, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(C.green, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -70, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#065f46",
      stroke: "#f0fdf4", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -14, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#065f46", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      const col = num <= this.levelConfig.level ? C.emerald : num === nextLevel ? C.amber : 0xd1d5db;
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
      const px = Phaser.Math.Between(300, 980);
      const py = Phaser.Math.Between(120, 600);
      const c = [C.emerald, C.amber, C.teal, 0xf59e0b, C.lightGreen][i % 5];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(c, 0.85);
      conf.fillRoundedRect(px - 8, py - 4, 16, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: py + 56, duration: 1600, delay: i * 90 });
    }

    this.time.delayedCall(1800, () =>
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors, ethicsValue: this.ethicsValue }),
    );
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bgRect = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.68).setDepth(60));
    bgRect.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(C.cream, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, C.emerald, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(C.green, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Missão Concluída!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#065f46",
      stroke: "#f0fdf4", strokeThickness: 7,
    }).setOrigin(0.5);

    const sub = this.addSharpText(0, -30, "Você completou todos os níveis da\nMissão Ética Digital!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#1e293b", align: "center",
    }).setOrigin(0.5);

    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);

    const ethicsNote = this.addSharpText(0, 76, `Reputação Digital final: ${Math.round(this.ethicsValue)}%`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#065f46", align: "center",
    }).setOrigin(0.5);

    // Sparkles
    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([C.emerald, C.amber, C.teal, C.lightGreen, 0xfbbf24][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.emerald, 1);
    exitBg.fillRoundedRect(-130, 114, 260, 52, 26);
    exitBg.lineStyle(4, C.white, 1);
    exitBg.strokeRoundedRect(-130, 114, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 140, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#065f46", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, panelBg, ribbon, ...sparkles, stars, title, sub, desc, ethicsNote, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(this.add.zone(640, 360 + 140 * MODAL_SCALE, 278 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();

    const bgRect = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, C.ink, 0.72).setDepth(60));
    bgRect.setInteractive();

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
      stroke: "#f0fdf4", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -22, "⏰ O tempo esgotou!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 28, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(C.emerald, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, C.white, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "🔄 Tentar Novamente", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#065f46", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(C.amber, 1);
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
      this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0, ethicsValue: 50 });
    });

    const ez = this.addOverlay(
      this.add.zone(640 + 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ── Overlay Helpers ────────────────────────────────────────────────────────

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

  // ── Utilities ──────────────────────────────────────────────────────────────

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
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      align: "center", wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({
      targets: container, y: 600, alpha: 0, duration: 300,
      delay: duration, onComplete: () => container.destroy(),
    });
  }

  // ── Audio ──────────────────────────────────────────────────────────────────

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
