import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type {
  InvestigationLevel,
  InvestigationLevelNumber,
  SafetyInfo,
  ConsequenceScenario,
  IncidentCase,
} from "../types";

const GAME_ID = "investigacao-dados-risco";

// ── Layout constants (identical to EF03CO07/08) ───────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

const COLORS = {
  red: 0xdc2626,
  darkRed: 0x991b1b,
  amber: 0xf59e0b,
  amberDark: 0x92400e,
  green: 0x16a34a,
  greenDark: 0x14532d,
  orange: 0xf97316,
  blue: 0x3b82f6,
  white: 0xffffff,
  ink: 0x1a0505,
  slate: 0x334155,
  safe: 0x16a34a,
  danger: 0xdc2626,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: InvestigationLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private cardObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1Index = 0;

  // N2 state
  private n2Index = 0;

  // N3 state
  private n3IncidentIndex = 0;
  private n3Step = 0; // 0 = step1, 1 = step2

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(
      data?.level ?? 1,
      1,
      3,
    ) as InvestigationLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1Index = 0;
    this.n2Index = 0;
    this.n3IncidentIndex = 0;
    this.n3Step = 0;
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.cardObjects = [];
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
    this.showStartScreen();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(
      0,
      this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000),
    );
    const color =
      pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.amber : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
  }

  // ─── Background ────────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1
        ? "bg-investigation"
        : this.levelConfig.level === 2
          ? "bg-crime-scene"
          : "bg-evidence-board";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / Math.max(bg.width, 1), 720 / Math.max(bg.height, 1));
    bg.setScale(scale);

    // Investigation-themed overlay: dark red + amber vignette
    this.add.rectangle(640, 360, 1280, 720, 0x1a0505, 0.55).setDepth(-90);
    // Subtle amber grid lines for investigator feel
    const grid = this.add.graphics().setDepth(-85);
    grid.lineStyle(1, 0xf59e0b, 0.07);
    for (let x = 0; x <= 1280; x += 80) grid.lineBetween(x, 0, x, 720);
    for (let y = 0; y <= 720; y += 80) grid.lineBetween(0, y, 1280, y);
  }

  // ─── Timer Bar ─────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(0x334155, 0.18);
    track.fillRoundedRect(
      640 - TIMER_BAR_W / 2,
      TIMER_BAR_Y - 16,
      TIMER_BAR_W,
      32,
      16,
    );
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    if (width <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(
      640 - TIMER_BAR_W / 2,
      TIMER_BAR_Y - 16,
      Math.max(0, width),
      32,
      16,
    );
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

  // ─── Start Screen ──────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add
      .rectangle(640, 360, 1280, 720, 0x1a0505, 0.72)
      .setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(0x1c0a0a, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.amber, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(
      0,
      -221,
      `Nível ${this.levelConfig.level} / 3`,
      {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#7f1d1d",
        strokeThickness: 3,
      },
    ).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "36px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      stroke: "#1a0505",
      strokeThickness: 6,
      align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -72, this.levelConfig.objective, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#f1f5f9",
      align: "center",
      wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 6, this.levelConfig.detail, {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#94a3b8",
      align: "center",
      wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.amber, 0.16);
    tipBg.fillRoundedRect(-250, 56, 500, 52, 14);
    tipBg.lineStyle(2, COLORS.amber, 0.5);
    tipBg.strokeRoundedRect(-250, 56, 500, 52, 14);

    const tip = this.addSharpText(0, 82, `💡 ${this.levelConfig.tip}`, {
      fontSize: "14px",
      fontFamily: "Arial Black, Arial",
      color: "#fbbf24",
      align: "center",
      wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.red, 1);
    btnBg.fillRoundedRect(-120, 126, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.amber, 1);
    btnBg.strokeRoundedRect(-120, 126, 240, 54, 27);

    const btnText = this.addSharpText(0, 153, "🔍 Investigar", {
      fontSize: "23px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#7f1d1d",
      strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([
      shadow, bg, topBar, lvlLabel, title, obj, detail, tipBg, tip, btnBg,
      btnText,
    ]);
    panel.setAlpha(0);
    panel.setScale(0.9);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 280,
      ease: "Back.easeOut",
    });

    const hz = this.add
      .zone(640, 360 + 153 * MODAL_SCALE, 256 * MODAL_SCALE, 66 * MODAL_SCALE)
      .setDepth(70);
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

  // ─── Level UI dispatcher ───────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    if (this.levelConfig.level === 1) {
      this.showN1Card();
    } else if (this.levelConfig.level === 2) {
      this.showN2Scenario();
    } else {
      this.showN3Incident();
    }
  }

  // ─── Header ────────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 62, this.levelConfig.title, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      stroke: "#1a0505",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(0x1c0a0a, 0.82);
    card.fillRoundedRect(230, 90, 820, 56, 22);
    card.fillStyle(COLORS.amber, 0.14);
    card.fillRoundedRect(242, 98, 796, 20, 10);
    card.lineStyle(4, COLORS.amber, 0.8);
    card.strokeRoundedRect(230, 90, 820, 56, 22);

    this.addSharpText(640, 118, this.levelConfig.objective, {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#fef3c7",
      stroke: "#1a0505",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 840 },
    })
      .setOrigin(0.5)
      .setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      backgroundColor: "rgba(26,5,5,0.82)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background ───────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(0x1c0a0a, 0.72);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(0xf59e0b, 0.04);
    panel.fillRoundedRect(PANEL_X + 12, PANEL_Y + 12, PANEL_W - 24, PANEL_H - 24, 24);
    panel.lineStyle(5, COLORS.amber, 0.75);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─── Card Objects helper ────────────────────────────────────────────────────

  private addCard<T extends Phaser.GameObjects.GameObject>(o: T) {
    this.cardObjects.push(o);
    return o;
  }

  private clearCards() {
    this.cardObjects.forEach((o) => o.destroy());
    this.cardObjects = [];
  }

  // ─── N1: Seguro ou Perigoso? ────────────────────────────────────────────────

  private showN1Card() {
    this.clearCards();

    const infos = this.levelConfig.safetyInfos!;
    if (this.n1Index >= infos.length) {
      this.completeLevel();
      return;
    }

    const info: SafetyInfo = infos[this.n1Index];
    const panelCX = PANEL_X + PANEL_W / 2;
    const panelCY = PANEL_Y + PANEL_H / 2;

    // Progress dots
    const dotContainer = this.addCard(
      this.add.container(panelCX, PANEL_Y + 26).setDepth(12),
    );
    infos.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(
        i < this.n1Index
          ? COLORS.green
          : i === this.n1Index
            ? COLORS.amber
            : 0x374151,
        1,
      );
      dot.fillCircle(-50 + i * 20, 0, 7);
      dot.lineStyle(2, COLORS.amber, 0.5);
      dot.strokeCircle(-50 + i * 20, 0, 7);
      dotContainer.add(dot);
    });

    this.addCard(
      this.addSharpText(
        panelCX,
        PANEL_Y + 50,
        `Informação ${this.n1Index + 1} de ${infos.length}`,
        {
          fontSize: "18px",
          fontFamily: "Arial Black, Arial",
          color: "#f59e0b",
          stroke: "#1a0505",
          strokeThickness: 3,
        },
      )
        .setOrigin(0.5)
        .setDepth(12),
    );

    // Evidence card (main info display)
    const cardContainer = this.addCard(
      this.add.container(panelCX, panelCY - 50).setDepth(15),
    );
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x111827, 0.95);
    cardBg.fillRoundedRect(-300, -90, 600, 180, 24);
    cardBg.lineStyle(5, COLORS.amber, 0.9);
    cardBg.strokeRoundedRect(-300, -90, 600, 180, 24);

    // Tape decoration (investigator card feel)
    const tape = this.add.graphics();
    tape.fillStyle(COLORS.amber, 0.55);
    tape.fillRoundedRect(-40, -98, 80, 20, 6);

    const iconText = this.addSharpText(0, -36, info.icon, {
      fontSize: "52px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);

    const infoText = this.addSharpText(0, 46, `"${info.text}"`, {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: "#f1f5f9",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 540 },
    }).setOrigin(0.5);

    cardContainer.add([cardBg, tape, iconText, infoText]);
    cardContainer.setAlpha(0);
    cardContainer.setScale(0.85);
    this.tweens.add({
      targets: cardContainer,
      alpha: 1,
      scale: 1,
      duration: 240,
      ease: "Back.easeOut",
    });

    // Action buttons
    const BTN_Y = PANEL_Y + PANEL_H - 90;
    const BTN_W = 280;
    const BTN_H = 88;

    this.createActionBtn(
      panelCX - 160,
      BTN_Y,
      BTN_W,
      BTN_H,
      "🔒 Seguro",
      COLORS.safe,
      0xffffff,
      () => {
        if (this.gameEnded) return;
        this.onN1Answer(true, info);
      },
    );

    this.createActionBtn(
      panelCX + 160,
      BTN_Y,
      BTN_W,
      BTN_H,
      "⚠️ Perigoso",
      COLORS.danger,
      0xffffff,
      () => {
        if (this.gameEnded) return;
        this.onN1Answer(false, info);
      },
    );
  }

  private onN1Answer(selectedSafe: boolean, info: SafetyInfo) {
    if (this.gameEnded) return;
    this.playClick();

    if (selectedSafe === info.isSafe) {
      this.hits += 1;
      this.playSuccess();
      const label = info.isSafe ? "✅ Correto! Seguro." : "✅ Correto! Perigoso.";
      this.showToast(`${label} ${info.explanation}`, COLORS.green, 1600);
      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: 20,
      });
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n1Index += 1;
        this.showN1Card();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      const correct = info.isSafe ? "Seguro" : "Perigoso";
      this.showToast(
        `❌ Errado! Era ${correct}. ${info.explanation}`,
        COLORS.danger,
        2400,
      );
      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });
      // Shake the card
      const cardC = this.cardObjects.find(
        (o) => o instanceof Phaser.GameObjects.Container,
      ) as Phaser.GameObjects.Container | undefined;
      if (cardC) {
        this.tweens.add({
          targets: cardC,
          x: { from: cardC.x - 10, to: cardC.x + 10 },
          duration: 60,
          yoyo: true,
          repeat: 3,
        });
      }
    }
  }

  // ─── N2: Qual a Consequência? ───────────────────────────────────────────────

  private showN2Scenario() {
    this.clearCards();

    const scenarios = this.levelConfig.scenarios!;
    if (this.n2Index >= scenarios.length) {
      this.completeLevel();
      return;
    }

    const scenario: ConsequenceScenario = scenarios[this.n2Index];
    const panelCX = PANEL_X + PANEL_W / 2;

    // Progress
    this.addCard(
      this.addSharpText(
        panelCX,
        PANEL_Y + 26,
        `Caso ${this.n2Index + 1} de ${scenarios.length}`,
        {
          fontSize: "18px",
          fontFamily: "Arial Black, Arial",
          color: "#f59e0b",
          stroke: "#1a0505",
          strokeThickness: 3,
        },
      )
        .setOrigin(0.5)
        .setDepth(12),
    );

    // Scenario card
    const scenarioCard = this.addCard(
      this.add.container(panelCX, PANEL_Y + 130).setDepth(15),
    );
    const scBg = this.add.graphics();
    scBg.fillStyle(0x111827, 0.95);
    scBg.fillRoundedRect(-500, -54, 1000, 108, 24);
    scBg.lineStyle(4, COLORS.amber, 0.85);
    scBg.strokeRoundedRect(-500, -54, 1000, 108, 24);
    const scIcon = this.addSharpText(-460, 0, scenario.personEmoji, {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    const scText = this.addSharpText(30, 0, scenario.scenario, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#f1f5f9",
      align: "center",
      wordWrap: { width: 860 },
    }).setOrigin(0.5);
    scenarioCard.add([scBg, scIcon, scText]);
    scenarioCard.setAlpha(0);
    this.tweens.add({ targets: scenarioCard, alpha: 1, duration: 220 });

    // "Qual a consequência?" label
    this.addCard(
      this.addSharpText(panelCX, PANEL_Y + 224, "⚠️ Qual foi a consequência?", {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#fbbf24",
        stroke: "#1a0505",
        strokeThickness: 4,
      })
        .setOrigin(0.5)
        .setDepth(12),
    );

    // Build shuffled options
    const options = this.shuffle([
      { text: scenario.correct, isCorrect: true },
      { text: scenario.wrong[0], isCorrect: false },
      { text: scenario.wrong[1], isCorrect: false },
    ]);

    const OPT_W = 330;
    const OPT_H = 90;
    const OPT_GAP = 18;
    const totalW = options.length * OPT_W + (options.length - 1) * OPT_GAP;
    const startX = panelCX - totalW / 2 + OPT_W / 2;
    const OPT_Y = PANEL_Y + PANEL_H - 138;

    options.forEach((opt, i) => {
      const ox = startX + i * (OPT_W + OPT_GAP);
      const btn = this.addCard(this.add.container(ox, OPT_Y).setDepth(20));

      const optBg = this.add.graphics();
      optBg.fillStyle(0x111827, 0.9);
      optBg.fillRoundedRect(-OPT_W / 2, -OPT_H / 2, OPT_W, OPT_H, 18);
      optBg.lineStyle(3, COLORS.amber, 0.6);
      optBg.strokeRoundedRect(-OPT_W / 2, -OPT_H / 2, OPT_W, OPT_H, 18);

      const optText = this.addSharpText(0, 0, opt.text, {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#f1f5f9",
        align: "center",
        wordWrap: { width: OPT_W - 24 },
      }).setOrigin(0.5);

      btn.add([optBg, optText]);

      const zone = this.addCard(
        this.add.zone(ox, OPT_Y, OPT_W + 12, OPT_H + 12).setDepth(55),
      );
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        this.tweens.add({ targets: btn, scale: 1.05, duration: 80 });
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        this.tweens.add({ targets: btn, scale: 1, duration: 80 });
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.onN2Answer(opt.isCorrect, btn);
      });
    });
  }

  private onN2Answer(
    isCorrect: boolean,
    btn: Phaser.GameObjects.Container,
  ) {
    if (this.gameEnded) return;
    this.playClick();

    if (isCorrect) {
      this.hits += 1;
      this.playSuccess();
      this.showToast("✅ Correto! Essa é a consequência real.", COLORS.green, 1500);
      // Flash green
      this.tweens.add({ targets: btn, alpha: 0.4, duration: 100, yoyo: true, repeat: 2 });
      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: 20,
      });
      this.time.delayedCall(1600, () => {
        if (this.gameEnded) return;
        this.n2Index += 1;
        this.showN2Scenario();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast(
        "❌ Não é essa. Pense nas consequências reais!",
        COLORS.danger,
        2000,
      );
      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });
    }
  }

  // ─── N3: Investigação Completa ──────────────────────────────────────────────

  private showN3Incident() {
    this.clearCards();

    const incidents = this.levelConfig.incidents!;
    if (this.n3IncidentIndex >= incidents.length) {
      this.completeFinalLevel();
      return;
    }

    const incident: IncidentCase = incidents[this.n3IncidentIndex];
    const panelCX = PANEL_X + PANEL_W / 2;

    // Progress: total steps = incidents × 2
    const totalSteps = incidents.length * 2;
    const currentStep = this.n3IncidentIndex * 2 + this.n3Step;
    this.addCard(
      this.addSharpText(
        panelCX,
        PANEL_Y + 24,
        `Passo ${currentStep + 1} de ${totalSteps}`,
        {
          fontSize: "18px",
          fontFamily: "Arial Black, Arial",
          color: "#f59e0b",
          stroke: "#1a0505",
          strokeThickness: 3,
        },
      )
        .setOrigin(0.5)
        .setDepth(12),
    );

    // Incident card
    const incidentCard = this.addCard(
      this.add.container(panelCX, PANEL_Y + 110).setDepth(15),
    );
    const incBg = this.add.graphics();
    incBg.fillStyle(0x111827, 0.95);
    incBg.fillRoundedRect(-490, -50, 980, 100, 22);
    incBg.lineStyle(4, COLORS.red, 0.75);
    incBg.strokeRoundedRect(-490, -50, 980, 100, 22);
    // incident tape label
    const tapeLabel = this.add.graphics();
    tapeLabel.fillStyle(COLORS.red, 0.9);
    tapeLabel.fillRoundedRect(-80, -60, 160, 22, 8);
    const tapeTxt = this.addSharpText(0, -49, "⚠ INCIDENTE", {
      fontSize: "12px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#7f1d1d",
      strokeThickness: 2,
    }).setOrigin(0.5);
    const incIcon = this.addSharpText(-450, 0, incident.personEmoji, {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    const incText = this.addSharpText(20, 0, incident.incident, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#f1f5f9",
      align: "center",
      wordWrap: { width: 840 },
    }).setOrigin(0.5);
    incidentCard.add([incBg, tapeLabel, tapeTxt, incIcon, incText]);
    incidentCard.setAlpha(0);
    this.tweens.add({ targets: incidentCard, alpha: 1, duration: 200 });

    // Step question
    const step =
      this.n3Step === 0 ? incident.step1 : incident.step2;
    const stepLabel = this.n3Step === 0 ? "🔎 Passo 1:" : "💡 Passo 2:";

    this.addCard(
      this.addSharpText(panelCX, PANEL_Y + 220, `${stepLabel} ${step.q}`, {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#fbbf24",
        stroke: "#1a0505",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 1000 },
      })
        .setOrigin(0.5)
        .setDepth(12),
    );

    // Options (3)
    const options = this.shuffle([
      { text: step.correct, isCorrect: true },
      { text: step.wrong[0], isCorrect: false },
      { text: step.wrong[1], isCorrect: false },
    ]);

    const OPT_W = 330;
    const OPT_H = 100;
    const OPT_GAP = 18;
    const totalW = options.length * OPT_W + (options.length - 1) * OPT_GAP;
    const startX = panelCX - totalW / 2 + OPT_W / 2;
    const OPT_Y = PANEL_Y + PANEL_H - 140;

    options.forEach((opt, i) => {
      const ox = startX + i * (OPT_W + OPT_GAP);
      const btn = this.addCard(this.add.container(ox, OPT_Y).setDepth(20));

      const optBg = this.add.graphics();
      optBg.fillStyle(0x111827, 0.9);
      optBg.fillRoundedRect(-OPT_W / 2, -OPT_H / 2, OPT_W, OPT_H, 18);
      optBg.lineStyle(3, COLORS.amber, 0.55);
      optBg.strokeRoundedRect(-OPT_W / 2, -OPT_H / 2, OPT_W, OPT_H, 18);

      const optText = this.addSharpText(0, 0, opt.text, {
        fontSize: "17px",
        fontFamily: "Arial Black, Arial",
        color: "#f1f5f9",
        align: "center",
        wordWrap: { width: OPT_W - 24 },
      }).setOrigin(0.5);

      btn.add([optBg, optText]);

      const zone = this.addCard(
        this.add.zone(ox, OPT_Y, OPT_W + 12, OPT_H + 12).setDepth(55),
      );
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
        this.tweens.add({ targets: btn, scale: 1.05, duration: 80 });
      });
      zone.on("pointerout", () => {
        this.input.setDefaultCursor("default");
        this.tweens.add({ targets: btn, scale: 1, duration: 80 });
      });
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.onN3Answer(opt.isCorrect, btn);
      });
    });
  }

  private onN3Answer(
    isCorrect: boolean,
    btn: Phaser.GameObjects.Container,
  ) {
    if (this.gameEnded) return;
    this.playClick();

    if (isCorrect) {
      this.hits += 1;
      this.playSuccess();
      const stepMsg =
        this.n3Step === 0
          ? "✅ Erro identificado! Agora descubra a solução."
          : "✅ Solução correta! Ótimo trabalho, detetive!";
      this.showToast(stepMsg, COLORS.green, 1500);
      this.tweens.add({
        targets: btn,
        alpha: 0.4,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });
      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: 20,
      });
      this.time.delayedCall(1600, () => {
        if (this.gameEnded) return;
        if (this.n3Step === 0) {
          this.n3Step = 1;
          this.showN3Incident();
        } else {
          this.n3Step = 0;
          this.n3IncidentIndex += 1;
          const incidents = this.levelConfig.incidents!;
          if (this.n3IncidentIndex >= incidents.length) {
            this.completeFinalLevel();
          } else {
            this.showN3Incident();
          }
        }
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast(
        "❌ Não é essa. Analise melhor o incidente!",
        COLORS.danger,
        2000,
      );
      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });
    }
  }

  // ─── Action Button Helper ───────────────────────────────────────────────────

  private createActionBtn(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    color: number,
    textColor: number,
    onClick: () => void,
  ) {
    const btn = this.addCard(this.add.container(x, y).setDepth(20));
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    bg.lineStyle(4, COLORS.amber, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    // inner highlight
    bg.fillStyle(0xffffff, 0.08);
    bg.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h / 2 - 8, 14);

    const txtColor = `#${textColor.toString(16).padStart(6, "0")}`;
    const txt = this.addSharpText(0, 0, label, {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: txtColor,
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    btn.add([bg, txt]);

    const zone = this.addCard(
      this.add.zone(x, y, w + 14, h + 14).setDepth(55),
    );
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: btn, scale: 1.06, duration: 80 });
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: btn, scale: 1, duration: 80 });
    });
    zone.on("pointerdown", onClick);
    return btn;
  }

  // ─── Level Completion ────────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as InvestigationLevelNumber;
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
    runtimeGameBridge.emit({
      type: "GAME_COMPLETED",
      gameId: GAME_ID,
      stage: 3,
    });
    this.time.delayedCall(400, () => this.showFinalCompleteScreen());
  }

  // ─── Flow Screens ────────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: InvestigationLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(
      this.add.rectangle(640, 360, 1280, 720, 0x1a0505, 0.7).setDepth(60),
    );
    bg.setInteractive();

    const panel = this.addOverlay(
      this.add.container(640, 360).setDepth(62),
    );
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x111827, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.green, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.green, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", {
      fontSize: "52px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -72, "Parabéns!", {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
      color: "#22c55e",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(
      0,
      -14,
      `Nível ${this.levelConfig.level} concluído!`,
      {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#f1f5f9",
        align: "center",
      },
    ).setOrigin(0.5);
    const next = this.addSharpText(0, 36, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(
        num <= this.levelConfig.level
          ? COLORS.green
          : num === nextLevel
            ? COLORS.amber
            : 0x374151,
        1,
      );
      d.fillCircle(-28 + i * 28, 88, 9);
      d.lineStyle(2, COLORS.amber, 0.5);
      d.strokeCircle(-28 + i * 28, 88, 9);
      return d;
    });

    panel.add([shadow, panelBg, topBar, stars, title, sub, next, ...dots]);
    this.animateModal(panel);

    // Confetti
    for (let i = 0; i < 14; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const c = [COLORS.green, COLORS.amber, COLORS.red, COLORS.blue, 0xfbbf24][
        i % 5
      ];
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle(c, 0.85);
      conf.fillRoundedRect(cx - 8, cy - 4, 16, 8, 4);
      this.tweens.add({
        targets: conf,
        alpha: 0,
        y: cy + 56,
        duration: 1600,
        delay: i * 90,
      });
    }

    this.time.delayedCall(1800, () =>
      this.scene.restart({
        level: nextLevel,
        hits: this.hits,
        errors: this.errors,
      }),
    );
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const bg = this.addOverlay(
      this.add.rectangle(640, 360, 1280, 720, 0x1a0505, 0.76).setDepth(60),
    );
    bg.setInteractive();

    const panel = this.addOverlay(
      this.add.container(640, 360).setDepth(62),
    );
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x111827, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.amber, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);
    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.red, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", {
      fontSize: "54px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    this.tweens.add({
      targets: stars,
      scale: { from: 0.9, to: 1.08 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const title = this.addSharpText(0, -92, "Parabéns, Detetive!", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#f59e0b",
      stroke: "#1a0505",
      strokeThickness: 7,
    }).setOrigin(0.5);

    const sub = this.addSharpText(
      0,
      -28,
      "Você concluiu a Investigação:\nDados em Risco!",
      {
        fontSize: "23px",
        fontFamily: "Arial Black, Arial",
        color: "#f1f5f9",
        align: "center",
      },
    ).setOrigin(0.5);

    const desc = this.addSharpText(
      0,
      40,
      `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`,
      {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#94a3b8",
        align: "center",
      },
    ).setOrigin(0.5);

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle(
        [COLORS.amber, COLORS.red, COLORS.green, COLORS.blue, 0xfbbf24][i % 5],
        0.88,
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
    exitBg.fillStyle(COLORS.red, 1);
    exitBg.fillRoundedRect(-130, 86, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.amber, 1);
    exitBg.strokeRoundedRect(-130, 86, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 112, "Voltar aos Jogos", {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#7f1d1d",
      strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([
      shadow, panelBg, ribbon, ...sparkles, stars, title, sub, desc, exitBg,
      exitTxt,
    ]);
    this.animateModal(panel);

    const ez = this.addOverlay(
      this.add
        .zone(
          640,
          360 + 112 * MODAL_SCALE,
          278 * MODAL_SCALE,
          64 * MODAL_SCALE,
        )
        .setDepth(70),
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
    const bg = this.addOverlay(
      this.add.rectangle(640, 360, 1280, 720, 0x1a0505, 1).setDepth(60),
    );
    bg.setInteractive();

    const panel = this.addOverlay(
      this.add.container(640, 360).setDepth(62),
    );
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.24);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x111827, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.85);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -146, "⏰", {
      fontSize: "54px",
      fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -80, "GAME OVER", {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#dc2626",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -24, "⏰ Tempo esgotado!", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#f1f5f9",
      align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(
      0,
      26,
      `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`,
      {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#94a3b8",
      },
    ).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(COLORS.green, 1);
    retryBg.fillRoundedRect(-262, 70, 240, 52, 26);
    retryBg.lineStyle(4, COLORS.amber, 1);
    retryBg.strokeRoundedRect(-262, 70, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 96, "🔄 Tentar Novamente", {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#14532d",
      strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.amber, 1);
    exitBg.fillRoundedRect(22, 70, 240, 52, 26);
    exitBg.lineStyle(4, 0xffffff, 1);
    exitBg.strokeRoundedRect(22, 70, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 96, "🚪 Sair", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#1a0505",
      stroke: "#92400e",
      strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([
      shadow, panelBg, topBar, icon, title, reason, stats, retryBg, retryTxt,
      exitBg, exitTxt,
    ]);
    this.animateModal(panel);

    const rz = this.addOverlay(
      this.add
        .zone(
          640 - 142 * MODAL_SCALE,
          360 + 96 * MODAL_SCALE,
          258 * MODAL_SCALE,
          64 * MODAL_SCALE,
        )
        .setDepth(70),
    );
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({
        level: this.levelConfig.level,
        hits: 0,
        errors: 0,
      });
    });

    const ez = this.addOverlay(
      this.add
        .zone(
          640 + 142 * MODAL_SCALE,
          360 + 96 * MODAL_SCALE,
          258 * MODAL_SCALE,
          64 * MODAL_SCALE,
        )
        .setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => {
      this.playClick();
      EventBus.emit("exit-game");
    });
  }

  // ─── Overlay Helpers ─────────────────────────────────────────────────────────

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
    this.tweens.add({
      targets: m,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  private getScore() {
    return Math.max(0, this.hits * 20 - this.errors * 5);
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private fitImage(
    image: Phaser.GameObjects.Image,
    maxW: number,
    maxH: number,
  ) {
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
    const container = this.add.container(640, 620).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, COLORS.amber, 0.8);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 900 },
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

  // ─── Audio ───────────────────────────────────────────────────────────────────

  private playClick() {
    this.playTone(520, 0.05, "sine", 0.05);
  }
  private playSuccess() {
    this.playTone(660, 0.1, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.1, "triangle", 0.06));
    this.time.delayedCall(200, () =>
      this.playTone(1100, 0.14, "triangle", 0.07),
    );
  }
  private playWrong() {
    this.playTone(200, 0.14, "sawtooth", 0.05);
  }
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) {
    const AC =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
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
