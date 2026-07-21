import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, LETTER_CODE } from "../data/levels";
import type { TranslatorLevel, TranslatorLevelNumber, TranslatorLetter } from "../types";

const GAME_ID = "tradutor-da-maquina";

// ── Layout ────────────────────────────────────────────────────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

// Zone x-boundaries within the panel
const ZONE_DICT_X1 = PANEL_X + 16;          // Dictionary zone left edge
const ZONE_DICT_X2 = PANEL_X + 620;         // Dictionary zone right edge (~604px wide)
const ZONE_VIS_X1  = PANEL_X + 640;         // Visor/MCQ zone left edge
const ZONE_VIS_X2  = PANEL_X + PANEL_W - 16; // Visor/MCQ zone right edge

const COLORS = {
  purple:  0x4c1d95,
  cyan:    0x06b6d4,
  lime:    0x84cc16,
  dark:    0x0d0528,
  darker:  0x060316,
  white:   0xffffff,
  green:   0x16a34a,
  red:     0xdc2626,
  amber:   0xd97706,
  gray:    0x64748b,
  slate:   0x334155,
  ink:     0x0a0a1a,
  violet:  0x7c3aed,
  teal:    0x0d9488,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: TranslatorLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // N1 state
  private n1RoundIndex = 0;

  // N2 state
  private n2WordIndex = 0;
  private n2LetterIndex = 0;
  private n2AccumulatedCode: string[] = [];

  // N3 state
  private n3WordIndex = 0;
  private n3GroupIndex = 0;
  private n3DecodedLetters: string[] = [];

  // Keyboard key graphics for highlight updates
  private keyGraphics: Map<TranslatorLetter, Phaser.GameObjects.Graphics> = new Map();
  // Reference table row graphics for highlight updates
  private refRowGraphics: Map<TranslatorLetter, Phaser.GameObjects.Graphics> = new Map();
  // Visor display text
  private visorText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as TranslatorLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1RoundIndex = 0;
    this.n2WordIndex = 0;
    this.n2LetterIndex = 0;
    this.n2AccumulatedCode = [];
    this.n3WordIndex = 0;
    this.n3GroupIndex = 0;
    this.n3DecodedLetters = [];
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.contentObjects = [];
    this.keyGraphics = new Map();
    this.refRowGraphics = new Map();
    this.visorText = undefined;
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
    const color = pct > 0.5 ? COLORS.lime : pct > 0.25 ? COLORS.amber : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
    EventBus.removeAllListeners();
  }

  // ─── Background ──────────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-circuit-lab"
      : this.levelConfig.level === 2 ? "bg-encoder-room"
      : "bg-decoder-room";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, COLORS.darker, 0.72).setDepth(-89);
  }

  // ─── Timer Bar ───────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(COLORS.slate, 0.2);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.lime);
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

  // ─── Start Screen ─────────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.68).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -208, 616, 416, 34);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.dark, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.cyan, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.purple, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#4c1d95", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d0528", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      align: "center", wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 0, this.levelConfig.detail, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
      align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.cyan, 0.12);
    tipBg.fillRoundedRect(-250, 56, 500, 48, 14);

    const tip = this.addSharpText(0, 80, `💡 ${this.levelConfig.tip}`, {
      fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.cyan, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#0d0528",
      stroke: "#06b6d4", strokeThickness: 3,
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

  // ─── Level UI dispatcher ─────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    this.createDictionary();
    if (this.levelConfig.level === 1) {
      this.showN1Round();
    } else if (this.levelConfig.level === 2) {
      this.showN2Word();
    } else {
      this.showN3Word();
    }
  }

  // ─── Header ──────────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d0528", strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(COLORS.dark, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.cyan, 0.12);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(3, COLORS.cyan, 0.6);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      stroke: "#0d0528", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      backgroundColor: "rgba(13,5,40,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(6);
  }

  // ─── Panel Background ────────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(COLORS.ink, 0.22);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(COLORS.dark, 0.78);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(COLORS.cyan, 0.06);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(4, COLORS.cyan, 0.5);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);

    // Zone divider
    panel.lineStyle(2, COLORS.cyan, 0.2);
    panel.lineBetween(ZONE_DICT_X2 + 10, PANEL_Y + 20, ZONE_DICT_X2 + 10, PANEL_Y + PANEL_H - 20);

    // Zone labels
    this.addSharpText((ZONE_DICT_X1 + ZONE_DICT_X2) / 2, PANEL_Y + 22, "DICIONÁRIO", {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5).setDepth(4);
    this.addSharpText((ZONE_VIS_X1 + ZONE_VIS_X2) / 2, PANEL_Y + 22, "TRADUÇÃO", {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5).setDepth(4);
  }

  // ─── Dictionary Zone (merged keyboard + reference table) ────────────────────

  private createDictionary() {
    const letters: TranslatorLetter[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const dictX = ZONE_DICT_X1;
    const dictW = ZONE_DICT_X2 - ZONE_DICT_X1;
    const rowH = 48;
    const startY = PANEL_Y + 46;

    const hdrBg = this.add.graphics().setDepth(10);
    hdrBg.fillStyle(COLORS.cyan, 0.18);
    hdrBg.fillRoundedRect(dictX, startY - 4, dictW, 34, 10);
    this.addSharpText(dictX + dictW / 2, startY + 13, "LETRA  =  CÓDIGO BINÁRIO", {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5).setDepth(12);

    letters.forEach((letter, idx) => {
      const ry = startY + 38 + idx * rowH;

      const rowBg = this.add.graphics().setDepth(10);
      rowBg.fillStyle(COLORS.dark, 0.5);
      rowBg.fillRoundedRect(dictX, ry, dictW, rowH - 4, 8);
      rowBg.lineStyle(1, COLORS.cyan, 0.18);
      rowBg.strokeRoundedRect(dictX, ry, dictW, rowH - 4, 8);
      this.keyGraphics.set(letter, rowBg);
      this.refRowGraphics.set(letter, rowBg);

      // Key chip (letter)
      const chipBg = this.add.graphics().setDepth(11);
      chipBg.fillStyle(COLORS.purple, 0.82);
      chipBg.fillRoundedRect(dictX + 8, ry + 4, 52, rowH - 12, 8);
      chipBg.lineStyle(2, COLORS.violet, 0.7);
      chipBg.strokeRoundedRect(dictX + 8, ry + 4, 52, rowH - 12, 8);

      this.addSharpText(dictX + 34, ry + (rowH - 4) / 2, letter, {
        fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
        stroke: "#4c1d95", strokeThickness: 4,
      }).setOrigin(0.5).setDepth(12);

      this.addSharpText(dictX + 84, ry + (rowH - 4) / 2, "=", {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
      }).setOrigin(0.5).setDepth(12);

      this.addSharpText(dictX + 240, ry + (rowH - 4) / 2, LETTER_CODE[letter], {
        fontSize: "26px", fontFamily: "Courier New, monospace", color: "#84cc16",
        stroke: "#0d0528", strokeThickness: 3,
      }).setOrigin(0.5).setDepth(12);
    });
  }

  private highlightKey(letter: TranslatorLetter | null) {
    const letters: TranslatorLetter[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const dictX = ZONE_DICT_X1;
    const dictW = ZONE_DICT_X2 - ZONE_DICT_X1;
    const rowH = 48;
    const startY = PANEL_Y + 46;

    letters.forEach((l, idx) => {
      const ry = startY + 38 + idx * rowH;
      const g = this.keyGraphics.get(l);
      if (!g) return;
      g.clear();
      const isActive = l === letter;
      if (isActive) {
        g.fillStyle(COLORS.cyan, 0.22);
        g.fillRoundedRect(dictX, ry, dictW, rowH - 4, 8);
        g.lineStyle(2, COLORS.cyan, 0.9);
        g.strokeRoundedRect(dictX, ry, dictW, rowH - 4, 8);
        g.lineStyle(1, COLORS.cyan, 0.35);
        g.strokeRoundedRect(dictX - 3, ry - 3, dictW + 6, rowH + 2, 11);
      } else {
        g.fillStyle(COLORS.dark, 0.5);
        g.fillRoundedRect(dictX, ry, dictW, rowH - 4, 8);
        g.lineStyle(1, COLORS.cyan, 0.18);
        g.strokeRoundedRect(dictX, ry, dictW, rowH - 4, 8);
      }
    });
  }

  private highlightRefRow(letter: TranslatorLetter | null) {
    this.highlightKey(letter);
  }

  // ─── Visor Zone ──────────────────────────────────────────────────────────────

  private createVisorDisplay(text: string): Phaser.GameObjects.Text {
    const vx = ZONE_VIS_X1;
    const vw = ZONE_VIS_X2 - ZONE_VIS_X1;
    const visorTop = PANEL_Y + 46;
    const visorH = 100;

    const visorBg = this.addContent(this.add.graphics().setDepth(10));
    visorBg.fillStyle(COLORS.darker, 1);
    visorBg.fillRoundedRect(vx, visorTop, vw, visorH, 12);
    visorBg.lineStyle(3, COLORS.lime, 0.8);
    visorBg.strokeRoundedRect(vx, visorTop, vw, visorH, 12);
    // LED corner accents
    visorBg.fillStyle(COLORS.lime, 0.7);
    visorBg.fillCircle(vx + 14, visorTop + 14, 5);
    visorBg.fillCircle(vx + vw - 14, visorTop + 14, 5);
    visorBg.fillCircle(vx + 14, visorTop + visorH - 14, 5);
    visorBg.fillCircle(vx + vw - 14, visorTop + visorH - 14, 5);

    const visorTxt = this.addContent(this.addSharpText(vx + vw / 2, visorTop + visorH / 2, text, {
      fontSize: "36px", fontFamily: "Courier New, monospace", color: "#84cc16",
      stroke: "#060316", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(12));

    this.visorText = visorTxt;
    return visorTxt;
  }

  // ─── N1 — Letra → Binário ────────────────────────────────────────────────────

  private showN1Round() {
    this.clearContent();
    const rounds = this.levelConfig.n1Rounds!;
    if (this.n1RoundIndex >= rounds.length) {
      this.completeLevel();
      return;
    }
    const round = rounds[this.n1RoundIndex];

    // Progress dots
    this.drawProgressDots(rounds.length, this.n1RoundIndex);

    // Highlight active key & ref row
    this.highlightKey(round.letter);
    this.highlightRefRow(round.letter);

    // Visor shows empty placeholder
    this.createVisorDisplay("_ _ _");

    // Question label
    const vx = ZONE_VIS_X1;
    const vw = ZONE_VIS_X2 - ZONE_VIS_X1;
    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(COLORS.purple, 0.7);
    qBg.fillRoundedRect(vx, PANEL_Y + 162, vw, 46, 12);
    this.addContent(this.addSharpText(vx + vw / 2, PANEL_Y + 186, `Qual é o código de "${round.letter}"?`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      stroke: "#0d0528", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(12));

    // MCQ chips (3 options)
    const chipH = 68;
    const chipGap = 14;
    const chipsStartY = PANEL_Y + 224;
    round.options.forEach((opt, i) => {
      const cy = chipsStartY + i * (chipH + chipGap);
      this.buildMCQChip(vx, cy, vw, chipH, opt, () => {
        if (this.gameEnded) return;
        this.onN1OptionSelected(opt, round.correct, round.letter);
      });
    });
  }

  private onN1OptionSelected(selected: string, correct: string, letter: TranslatorLetter) {
    if (this.gameEnded) return;
    this.playClick();
    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: 1, pointsEarned: 20 });
      // Update visor with correct code
      if (this.visorText) this.visorText.setText(correct);
      this.showCircuitAnimation(letter);
      this.showToast(`✅ Correto! ${letter} = ${correct}`, COLORS.lime, 1600);
      this.time.delayedCall(1700, () => {
        if (this.gameEnded) return;
        this.n1RoundIndex += 1;
        this.showN1Round();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: 1, pointsEarned: -5 });
      this.showToast("❌ Código errado! Consulte a tabela.", COLORS.red, 2000);
    }
  }

  // ─── Circuit Animation ───────────────────────────────────────────────────────

  private showCircuitAnimation(letter: TranslatorLetter) {
    const letters: TranslatorLetter[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rowH = 48;
    const startY = PANEL_Y + 46;

    const idx = letters.indexOf(letter);
    const ry = startY + 38 + idx * rowH;
    const fromX = ZONE_DICT_X2;
    const fromY = ry + (rowH - 4) / 2;

    const toX = ZONE_VIS_X1 + 8;
    const toY = PANEL_Y + 46 + 50;

    // Draw a wire line
    const wire = this.add.graphics().setDepth(50);
    wire.lineStyle(4, COLORS.lime, 0);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 600, ease: "Sine.easeIn",
      onUpdate: (tween) => {
        const t = tween.getValue();
        wire.clear();
        wire.lineStyle(4, COLORS.lime, t);
        wire.beginPath();
        wire.moveTo(fromX, fromY);
        const mx = (fromX + toX) / 2;
        wire.lineTo(mx, fromY);
        wire.lineTo(mx, toY);
        wire.lineTo(toX * t + fromX * (1 - t) + (toX - fromX) * t, toY);
        wire.strokePath();
      },
      onComplete: () => {
        this.tweens.add({ targets: wire, alpha: 0, duration: 400, delay: 200, onComplete: () => wire.destroy() });
      },
    });
  }

  // ─── N2 — Palavra → Binário ─────────────────────────────────────────────────

  private showN2Word() {
    this.clearContent();
    const words = this.levelConfig.n2Words!;
    if (this.n2WordIndex >= words.length) {
      this.completeLevel();
      return;
    }
    this.n2LetterIndex = 0;
    this.n2AccumulatedCode = [];
    this.renderN2State();
  }

  private renderN2State() {
    this.clearContent();
    const words = this.levelConfig.n2Words!;
    const wordDef = words[this.n2WordIndex];
    const currentLetter = wordDef.letters[this.n2LetterIndex];

    // Progress dots (words)
    this.drawProgressDots(words.length, this.n2WordIndex);

    // Highlight active key & ref row
    this.highlightKey(currentLetter);
    this.highlightRefRow(currentLetter);

    const vx = ZONE_VIS_X1;
    const vw = ZONE_VIS_X2 - ZONE_VIS_X1;

    // Word display at top of visor zone
    const wordBg = this.addContent(this.add.graphics().setDepth(10));
    wordBg.fillStyle(COLORS.purple, 0.6);
    wordBg.fillRoundedRect(vx, PANEL_Y + 46, vw, 56, 12);

    wordDef.word.split("").forEach((ch, i) => {
      const isActive = i === this.n2LetterIndex;
      const isDone = i < this.n2LetterIndex;
      this.addContent(this.addSharpText(vx + 60 + i * 80, PANEL_Y + 75, ch, {
        fontSize: "30px", fontFamily: "Arial Black, Arial",
        color: isDone ? "#84cc16" : isActive ? "#06b6d4" : "#94a3b8",
        stroke: "#0d0528", strokeThickness: 4,
      }).setOrigin(0.5).setDepth(12));
    });

    // Accumulated binary in visor
    const accumulated = this.n2AccumulatedCode.join(" ");
    const visorLabel = accumulated + (accumulated.length ? " " : "") + "___";
    this.createVisorDisplay(visorLabel.trim());

    // Question label
    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(COLORS.purple, 0.7);
    qBg.fillRoundedRect(vx, PANEL_Y + 162, vw, 46, 12);
    this.addContent(this.addSharpText(vx + vw / 2, PANEL_Y + 186, `Código de "${currentLetter}"?`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      stroke: "#0d0528", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    // Build MCQ options for this letter
    const correctCode = wordDef.codes[this.n2LetterIndex];
    const wrongOptions = this.getN2WrongOptions(correctCode);
    const options = Phaser.Utils.Array.Shuffle([correctCode, ...wrongOptions]) as string[];

    const chipH = 68;
    const chipGap = 14;
    const chipsStartY = PANEL_Y + 224;
    options.forEach((opt, i) => {
      const cy = chipsStartY + i * (chipH + chipGap);
      this.buildMCQChip(vx, cy, vw, chipH, opt, () => {
        if (this.gameEnded) return;
        this.onN2OptionSelected(opt, correctCode, currentLetter);
      });
    });
  }

  private getN2WrongOptions(correct: string): string[] {
    const all = ["000", "001", "010", "011", "100", "101", "110", "111"];
    const wrong = all.filter((c) => c !== correct);
    Phaser.Utils.Array.Shuffle(wrong);
    return wrong.slice(0, 2);
  }

  private onN2OptionSelected(selected: string, correct: string, letter: TranslatorLetter) {
    if (this.gameEnded) return;
    this.playClick();
    const words = this.levelConfig.n2Words!;
    const wordDef = words[this.n2WordIndex];

    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: 2, pointsEarned: 20 });
      this.n2AccumulatedCode.push(correct);
      this.showToast(`✅ ${letter} = ${correct}`, COLORS.lime, 1200);

      if (this.n2LetterIndex >= wordDef.letters.length - 1) {
        // Word complete — show full code in visor then advance
        const fullCode = wordDef.codes.join(" ");
        this.time.delayedCall(400, () => {
          if (this.gameEnded) return;
          if (this.visorText) this.visorText.setText(fullCode);
          this.showWordCompleteAnimation(fullCode);
          this.time.delayedCall(1400, () => {
            if (this.gameEnded) return;
            this.n2WordIndex += 1;
            this.showN2Word();
          });
        });
      } else {
        this.time.delayedCall(1300, () => {
          if (this.gameEnded) return;
          this.n2LetterIndex += 1;
          this.renderN2State();
        });
      }
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: 2, pointsEarned: -5 });
      this.showToast("❌ Código errado! Consulte a tabela.", COLORS.red, 2000);
    }
  }

  private showWordCompleteAnimation(fullCode: string) {
    const vx = ZONE_VIS_X1;
    const vw = ZONE_VIS_X2 - ZONE_VIS_X1;
    const animText = this.addContent(this.addSharpText(vx + vw / 2, PANEL_Y + 96, "✓ " + fullCode, {
      fontSize: "30px", fontFamily: "Courier New, monospace", color: "#84cc16",
      stroke: "#060316", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60));
    animText.setAlpha(0);
    this.tweens.add({ targets: animText, alpha: 1, scale: { from: 0.8, to: 1.1 }, duration: 400, yoyo: true, hold: 600 });
  }

  // ─── N3 — Binário → Letra ────────────────────────────────────────────────────

  private showN3Word() {
    this.clearContent();
    const words = this.levelConfig.n3Words!;
    if (this.n3WordIndex >= words.length) {
      this.completeFinalLevel();
      return;
    }
    this.n3GroupIndex = 0;
    this.n3DecodedLetters = [];
    this.renderN3State();
  }

  private renderN3State() {
    this.clearContent();
    const words = this.levelConfig.n3Words!;
    const wordDef = words[this.n3WordIndex];
    const currentGroup = wordDef.groups[this.n3GroupIndex];

    // Highlight the letter that this group decodes to (for learning, keep ref highlighted)
    const targetLetter = wordDef.letters[this.n3GroupIndex];
    this.highlightKey(targetLetter);
    this.highlightRefRow(targetLetter);

    // Progress dots (words)
    this.drawProgressDots(words.length, this.n3WordIndex);

    const vx = ZONE_VIS_X1;
    const vw = ZONE_VIS_X2 - ZONE_VIS_X1;

    // Full code in visor with current group highlighted
    const groups = wordDef.groups;
    const displayParts = groups.map((g, i) => {
      if (i < this.n3GroupIndex) return g;
      if (i === this.n3GroupIndex) return `[${g}]`;
      return g;
    });
    this.createVisorDisplay(displayParts.join(" "));

    // Decoded so far
    const decodedSoFar = this.n3DecodedLetters.join("_") + (this.n3DecodedLetters.length < wordDef.letters.length ? "_" : "");
    const decodedBg = this.addContent(this.add.graphics().setDepth(10));
    decodedBg.fillStyle(COLORS.purple, 0.5);
    decodedBg.fillRoundedRect(vx, PANEL_Y + 162, vw, 40, 10);
    this.addContent(this.addSharpText(vx + vw / 2, PANEL_Y + 183, `Palavra: ${decodedSoFar}`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#84cc16",
      stroke: "#0d0528", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    // Question
    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(COLORS.cyan, 0.15);
    qBg.fillRoundedRect(vx, PANEL_Y + 210, vw, 44, 10);
    this.addContent(this.addSharpText(vx + vw / 2, PANEL_Y + 233, `"${currentGroup}" → qual letra?`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      stroke: "#0d0528", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12));

    // MCQ letter options
    const options = wordDef.options[this.n3GroupIndex];
    const chipH = 68;
    const chipGap = 14;
    const chipsStartY = PANEL_Y + 266;
    options.forEach((opt, i) => {
      const cy = chipsStartY + i * (chipH + chipGap);
      this.buildMCQChip(vx, cy, vw, chipH, opt, () => {
        if (this.gameEnded) return;
        this.onN3OptionSelected(opt, targetLetter, currentGroup);
      });
    });
  }

  private onN3OptionSelected(selected: string, correct: TranslatorLetter, group: string) {
    if (this.gameEnded) return;
    this.playClick();
    const words = this.levelConfig.n3Words!;
    const wordDef = words[this.n3WordIndex];

    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: 3, pointsEarned: 20 });
      this.n3DecodedLetters.push(correct);
      this.showToast(`✅ ${group} = ${correct}`, COLORS.lime, 1200);

      if (this.n3GroupIndex >= wordDef.groups.length - 1) {
        // Word decoded!
        const decodedWord = wordDef.letters.join("");
        this.time.delayedCall(400, () => {
          if (this.gameEnded) return;
          this.showToast(`🎉 Palavra: ${decodedWord}!`, COLORS.lime, 1800);
          this.time.delayedCall(1800, () => {
            if (this.gameEnded) return;
            this.n3WordIndex += 1;
            this.showN3Word();
          });
        });
      } else {
        this.time.delayedCall(1300, () => {
          if (this.gameEnded) return;
          this.n3GroupIndex += 1;
          this.renderN3State();
        });
      }
    } else {
      this.errors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: 3, pointsEarned: -5 });
      this.showToast("❌ Letra errada! Consulte a tabela.", COLORS.red, 2000);
    }
  }

  // ─── Level Completion ────────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as TranslatorLevelNumber;
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

  // ─── Flow Screens ─────────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: TranslatorLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.62).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.dark, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.cyan, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.purple, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -70, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d0528", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -14, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#84cc16", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(num <= this.levelConfig.level ? COLORS.cyan : num === nextLevel ? COLORS.amber : COLORS.gray, 1);
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
      const c = [COLORS.cyan, COLORS.purple, COLORS.lime, COLORS.violet, COLORS.teal][i % 5];
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
    panelBg.fillStyle(COLORS.dark, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.lime, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.purple, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d0528", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nTradutor da Máquina!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#94a3b8", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.cyan, COLORS.lime, COLORS.violet, COLORS.purple, COLORS.teal][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.cyan, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#0d0528",
      stroke: "#06b6d4", strokeThickness: 3,
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
    panelBg.fillStyle(COLORS.dark, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -144, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -78, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626",
      stroke: "#0d0528", strokeThickness: 6,
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
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.amber, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(22, 68, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 94, "🚪 Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#0d0528",
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

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private drawProgressDots(total: number, current: number) {
    const dotsCont = this.addContent(this.add.container(640, PANEL_Y + 22).setDepth(12));
    const offset = -((total - 1) * 18) / 2;
    for (let i = 0; i < total; i++) {
      const d = this.add.graphics();
      d.fillStyle(i < current ? COLORS.lime : i === current ? COLORS.cyan : COLORS.gray, 1);
      d.fillCircle(offset + i * 18, 0, 7);
      d.lineStyle(2, COLORS.white, 0.8);
      d.strokeCircle(offset + i * 18, 0, 7);
      dotsCont.add(d);
    }
  }

  private buildMCQChip(x: number, y: number, w: number, h: number, label: string, onClick: () => void) {
    const chipBg = this.addContent(this.add.graphics().setDepth(12));
    chipBg.fillStyle(COLORS.dark, 0.9);
    chipBg.fillRoundedRect(x, y, w, h, h / 2);
    chipBg.lineStyle(3, COLORS.violet, 0.7);
    chipBg.strokeRoundedRect(x, y, w, h, h / 2);

    this.addContent(this.addSharpText(x + w / 2, y + h / 2, label, {
      fontSize: "26px", fontFamily: "Courier New, monospace", color: "#84cc16",
      stroke: "#0d0528", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(14));

    const zone = this.addContent(this.add.zone(x + w / 2, y + h / 2, w, h).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      chipBg.clear();
      chipBg.fillStyle(COLORS.cyan, 0.18);
      chipBg.fillRoundedRect(x, y, w, h, h / 2);
      chipBg.lineStyle(3, COLORS.cyan, 0.9);
      chipBg.strokeRoundedRect(x, y, w, h, h / 2);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      chipBg.clear();
      chipBg.fillStyle(COLORS.dark, 0.9);
      chipBg.fillRoundedRect(x, y, w, h, h / 2);
      chipBg.lineStyle(3, COLORS.violet, 0.7);
      chipBg.strokeRoundedRect(x, y, w, h, h / 2);
    });
    zone.on("pointerdown", onClick);
  }

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
    this.visorText = undefined;
  }

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

  private getScore() { return Math.max(0, this.hits * 20 - this.errors * 5); }

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
    this.tweens.add({ targets: container, y: 600, alpha: 0, duration: 300, delay: duration, onComplete: () => container.destroy() });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────────

  private playClick() { this.playTone(520, 0.05, "sine", 0.05); }
  private playSuccess() {
    this.playTone(660, 0.08, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.08, "triangle", 0.06));
    this.time.delayedCall(200, () => this.playTone(1100, 0.12, "triangle", 0.07));
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
