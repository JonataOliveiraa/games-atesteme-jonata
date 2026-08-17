import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import { RECORDS, LEVELS } from "../data/levels";
import type { ArchiveLevel, ArchiveLevelNumber, PersonRecord } from "../types";

const GAME_ID = "arquivo-dos-registros";

// ── Layout constants (matches EF03CO07/EF03CO08 exactly) ──────────────────────
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const PANEL_X = 72;
const PANEL_Y = 142;
const PANEL_W = 1136;
const PANEL_H = 486;
const MODAL_SCALE = 1.12;

const COLORS = {
  brown:  0x92400e,
  teal:   0x0d9488,
  amber:  0xd97706,
  cream:  0xfef3c7,
  green:  0x16a34a,
  red:    0xdc2626,
  orange: 0xf59e0b,
  blue:   0x2563eb,
  ink:    0x1c1008,
  white:  0xffffff,
  gray:   0x64748b,
  slate:  0x334155,
};


export class GameScene extends Phaser.Scene {
  private levelConfig!: ArchiveLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private contentObjects: Phaser.GameObjects.GameObject[] = [];

  // N1
  private n1QuestionIndex = 0;

  // N2
  private n2QuestionIndex = 0;

  // N3
  private n3QuestionIndex = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as ArchiveLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1QuestionIndex = 0;
    this.n2QuestionIndex = 0;
    this.n3QuestionIndex = 0;
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
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-archive-room"
      : this.levelConfig.level === 2 ? "bg-filing-cabinet"
      : "bg-detective-desk";

    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.38).setDepth(-89);
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
    bg.fillStyle(COLORS.cream, 0.97);
    bg.fillRoundedRect(-320, -220, 640, 420, 34);
    bg.lineStyle(6, COLORS.brown, 0.9);
    bg.strokeRoundedRect(-320, -220, 640, 420, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.brown, 1);
    topBar.fillRoundedRect(-240, -238, 480, 34, 17);

    const lvlLabel = this.addSharpText(0, -221, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#fef3c7", stroke: "#92400e", strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(0, -148, this.levelConfig.title, {
      fontSize: "38px", fontFamily: "Arial Black, Arial", color: "#92400e", stroke: "#fef3c7", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);

    const obj = this.addSharpText(0, -76, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1c1008", align: "center", wordWrap: { width: 560 },
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
    btnBg.fillStyle(COLORS.teal, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);

    const btnText = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0d9488", strokeThickness: 3,
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

  // ─── Level UI dispatcher ──────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    if (this.levelConfig.level === 1) {
      this.showN1Question();
    } else if (this.levelConfig.level === 2) {
      this.showN2Question();
    } else {
      this.showN3Question();
    }
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#fef3c7", stroke: "#92400e", strokeThickness: 6,
    }).setOrigin(0.5);

    const card = this.add.graphics().setDepth(5);
    card.fillStyle(COLORS.white, 0.82);
    card.fillRoundedRect(230, 96, 820, 44, 22);
    card.fillStyle(COLORS.amber, 0.18);
    card.fillRoundedRect(242, 104, 796, 20, 10);
    card.lineStyle(4, COLORS.brown, 0.9);
    card.strokeRoundedRect(230, 96, 820, 44, 22);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1c1008",
      stroke: "#ffffff", strokeThickness: 3, align: "center", wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#1c1008",
      backgroundColor: "rgba(254,243,199,0.82)", padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  // ─── Panel Background ─────────────────────────────────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(COLORS.ink, 0.18);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);

    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(COLORS.cream, 0.38);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(COLORS.white, 0.12);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(6, COLORS.brown, 0.7);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─── Content helpers ──────────────────────────────────────────────────────

  private addContent<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.contentObjects.push(o);
    return o;
  }

  private clearContent() {
    this.contentObjects.forEach((o) => o.destroy());
    this.contentObjects = [];
  }

  // ─── N1 — Encontre o Registro ─────────────────────────────────────────────

  private showN1Question() {
    this.clearContent();
    const questions = this.levelConfig.n1Questions!;
    if (this.n1QuestionIndex >= questions.length) {
      this.completeLevel();
      return;
    }
    const q = questions[this.n1QuestionIndex];
    const records = RECORDS.filter((r) => q.recordIds.includes(r.id));

    // Progress dots
    const dotsCont = this.addContent(this.add.container(640, PANEL_Y + 28).setDepth(12));
    questions.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(i < this.n1QuestionIndex ? COLORS.green : i === this.n1QuestionIndex ? COLORS.teal : 0xd1d5db, 1);
      dot.fillCircle(-24 + i * 18, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-24 + i * 18, 0, 7);
      dotsCont.add(dot);
    });

    // Question banner
    const questionText = `Quem tem ${q.field} = "${q.value}"?`;
    const qBannerBg = this.addContent(this.add.graphics().setDepth(10));
    qBannerBg.fillStyle(COLORS.teal, 0.9);
    qBannerBg.fillRoundedRect(PANEL_X + 16, PANEL_Y + 46, PANEL_W - 32, 54, 18);
    qBannerBg.lineStyle(3, COLORS.white, 0.8);
    qBannerBg.strokeRoundedRect(PANEL_X + 16, PANEL_Y + 46, PANEL_W - 32, 54, 18);
    this.addContent(this.addSharpText(640, PANEL_Y + 74, questionText, {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#0d9488", strokeThickness: 4, align: "center",
    }).setOrigin(0.5).setDepth(12));

    // 4 record cards — cardH=88 so all 4 fit within PANEL_H (startCardY+4*(88+8)=250+384=634>628 → use 108 offset)
    // startCardY=250, cardH=88, cardGap=8: card[3] bottom = 250+3*96+88 = 250+376 = 626 < 628 ✓
    const cardH = 88;
    const cardGap = 8;
    const startCardY = PANEL_Y + 108;

    records.forEach((rec, idx) => {
      const cy = startCardY + idx * (cardH + cardGap);
      this.buildN1RecordCard(rec, q.field, cy, cardH, () => {
        if (this.gameEnded) return;
        this.onN1CardTapped(rec.id, q.correctId);
      });
    });
  }

  private buildN1RecordCard(
    rec: PersonRecord,
    highlightField: keyof Omit<PersonRecord, "id" | "emoji">,
    topY: number,
    cardH: number,
    onClick: () => void,
  ) {
    const HOBBY_ICON: Record<string, string> = { Futebol: "⚽", Dança: "💃", Xadrez: "♟️", Leitura: "📚", Desenho: "🎨" };
    const ANIMAL_ICON: Record<string, string> = { Cachorro: "🐕", Gato: "🐱", Peixe: "🐠", Pássaro: "🦜" };

    const cardX = PANEL_X + 16;
    const cardW = PANEL_W - 32;
    const cx = cardX + cardW / 2;
    const cy = topY + cardH / 2;
    const headerH = 34;
    const colW = cardW / 4; // 276px per column

    // Card background
    const cardBg = this.addContent(this.add.graphics().setDepth(12));
    cardBg.fillStyle(COLORS.white, 0.92);
    cardBg.fillRoundedRect(cardX, topY, cardW, cardH, 16);
    cardBg.lineStyle(4, COLORS.brown, 0.5);
    cardBg.strokeRoundedRect(cardX, topY, cardW, cardH, 16);

    // Header strip (emoji + name)
    const headerBg = this.addContent(this.add.graphics().setDepth(12));
    headerBg.fillStyle(COLORS.brown, 0.1);
    headerBg.fillRoundedRect(cardX + 4, topY + 4, cardW - 8, headerH - 4, 10);

    this.addContent(this.addSharpText(cardX + 24, topY + headerH / 2, rec.emoji, {
      fontSize: "20px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5).setDepth(14));
    this.addContent(this.addSharpText(cardX + 48, topY + headerH / 2, rec.Nome, {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#92400e", stroke: "#fef3c7", strokeThickness: 3,
    }).setOrigin(0, 0.5).setDepth(14));

    // Thin divider between header and fields
    const divGfx = this.addContent(this.add.graphics().setDepth(12));
    divGfx.lineStyle(1, COLORS.brown, 0.2);
    divGfx.lineBetween(cardX + 8, topY + headerH, cardX + cardW - 8, topY + headerH);

    // 4 field columns: Cidade | Hobby | Idade | Animal
    const FIELDS: Array<keyof Omit<PersonRecord, "id" | "emoji">> = ["Cidade", "Hobby", "Idade", "Animal"];
    FIELDS.forEach((field, i) => {
      const colStart = cardX + i * colW;
      const colCenter = colStart + colW / 2;
      const isHighlight = field === highlightField;
      const value = rec[field];

      const icon =
        field === "Hobby"   ? (HOBBY_ICON[value] ?? "🎯")
        : field === "Animal" ? (ANIMAL_ICON[value] ?? "🐾")
        : field === "Cidade" ? "🏙"
        : "🎂"; // Idade

      // Highlighted field gets colored background
      if (isHighlight) {
        const hlBg = this.addContent(this.add.graphics().setDepth(13));
        hlBg.fillStyle(COLORS.teal, 0.16);
        hlBg.fillRoundedRect(colStart + 4, topY + headerH, colW - 8, cardH - headerH, 8);
        hlBg.lineStyle(2, COLORS.teal, 0.5);
        hlBg.strokeRoundedRect(colStart + 4, topY + headerH, colW - 8, cardH - headerH, 8);
      }

      // Field label (small)
      this.addContent(this.addSharpText(colCenter, topY + headerH + 6, field, {
        fontSize: "11px", fontFamily: "Arial Black, Arial",
        color: isHighlight ? "#0d9488" : "#92400e",
      }).setOrigin(0.5, 0).setDepth(14));

      // Field icon + value
      this.addContent(this.addSharpText(colCenter, topY + headerH + 24, `${icon} ${value}`, {
        fontSize: "14px", fontFamily: "Arial Black, Arial",
        color: isHighlight ? "#0d9488" : "#1c1008",
        stroke: "#fef3c7", strokeThickness: 2,
        align: "center",
        wordWrap: { width: colW - 16 },
      }).setOrigin(0.5, 0).setDepth(14));

      // Column divider (not after last column)
      if (i < 3) {
        const colDiv = this.addContent(this.add.graphics().setDepth(12));
        colDiv.lineStyle(1, COLORS.brown, 0.15);
        colDiv.lineBetween(colStart + colW, topY + headerH + 4, colStart + colW, topY + cardH - 4);
      }
    });

    // Interactive zone
    const zone = this.addContent(this.add.zone(cx, cy, cardW, cardH).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      cardBg.clear();
      cardBg.fillStyle(COLORS.cream, 0.98);
      cardBg.fillRoundedRect(cardX, topY, cardW, cardH, 16);
      cardBg.lineStyle(4, COLORS.teal, 0.9);
      cardBg.strokeRoundedRect(cardX, topY, cardW, cardH, 16);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      cardBg.clear();
      cardBg.fillStyle(COLORS.white, 0.92);
      cardBg.fillRoundedRect(cardX, topY, cardW, cardH, 16);
      cardBg.lineStyle(4, COLORS.brown, 0.5);
      cardBg.strokeRoundedRect(cardX, topY, cardW, cardH, 16);
    });
    zone.on("pointerdown", onClick);
  }

  private onN1CardTapped(selectedId: string, correctId: string) {
    if (this.gameEnded) return;
    this.playClick();
    if (selectedId === correctId) {
      this.hits += 1;
      this.playSuccess();
      this.showToast("✅ Correto! Registro encontrado.", COLORS.green, 1400);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n1QuestionIndex += 1;
        this.showN1Question();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast("❌ Não é esse! Verifique o campo pedido.", COLORS.red, 2000);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    }
  }

  // ─── N2 — Qual é o Valor do Campo? ────────────────────────────────────────

  private showN2Question() {
    this.clearContent();
    const questions = this.levelConfig.n2Questions!;
    if (this.n2QuestionIndex >= questions.length) {
      this.completeLevel();
      return;
    }
    const q = questions[this.n2QuestionIndex];
    const rec = RECORDS.find((r) => r.id === q.recordId)!;

    // Progress dots
    const dotsCont = this.addContent(this.add.container(640, PANEL_Y + 28).setDepth(12));
    questions.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(i < this.n2QuestionIndex ? COLORS.green : i === this.n2QuestionIndex ? COLORS.teal : 0xd1d5db, 1);
      dot.fillCircle(-40 + i * 20, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-40 + i * 20, 0, 7);
      dotsCont.add(dot);
    });

    // Full record card on the left (~680px wide)
    const cardX = PANEL_X + 16;
    const cardY = PANEL_Y + 54;
    const cardW = 680;
    const cardH = PANEL_H - 66;
    this.buildN2RecordCard(rec, cardX, cardY, cardW, cardH, q.field);

    // Question + MCQ on the right
    const mcqX = cardX + cardW + 16;
    const mcqW = PANEL_W - cardW - 48;
    const mcqCX = mcqX + mcqW / 2;

    // Question text
    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(COLORS.teal, 0.88);
    qBg.fillRoundedRect(mcqX, PANEL_Y + 54, mcqW, 90, 18);
    this.addContent(this.addSharpText(mcqCX, PANEL_Y + 100, q.question, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#0d9488", strokeThickness: 3, align: "center", wordWrap: { width: mcqW - 24 },
    }).setOrigin(0.5).setDepth(12));

    // 4 option chips
    const chipH = 60;
    const chipGap = 14;
    const optStartY = PANEL_Y + 164;
    q.options.forEach((opt, i) => {
      const chipY = optStartY + i * (chipH + chipGap);
      this.buildMCQChip(mcqX, chipY, mcqW, chipH, opt, () => {
        if (this.gameEnded) return;
        this.onN2OptionSelected(opt, q.correct);
      });
    });
  }

  private buildN2RecordCard(
    rec: PersonRecord,
    cardX: number, cardY: number,
    cardW: number, cardH: number,
    highlightField: keyof Omit<PersonRecord, "id" | "emoji">,
  ) {
    // Card bg
    const cardBg = this.addContent(this.add.graphics().setDepth(10));
    cardBg.fillStyle(COLORS.white, 0.94);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 22);
    cardBg.lineStyle(5, COLORS.brown, 0.7);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 22);

    // Header strip
    cardBg.fillStyle(COLORS.brown, 0.12);
    cardBg.fillRoundedRect(cardX + 8, cardY + 8, cardW - 16, 64, 16);

    // Emoji + Nome header
    this.addContent(this.addSharpText(cardX + 44, cardY + 40, rec.emoji, {
      fontSize: "42px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5).setDepth(12));
    this.addContent(this.addSharpText(cardX + 100, cardY + 40, rec.Nome, {
      fontSize: "30px", fontFamily: "Arial Black, Arial", color: "#92400e", stroke: "#fef3c7", strokeThickness: 5,
    }).setOrigin(0, 0.5).setDepth(12));

    // Divider
    const div = this.addContent(this.add.graphics().setDepth(11));
    div.lineStyle(2, COLORS.brown, 0.22);
    div.lineBetween(cardX + 16, cardY + 82, cardX + cardW - 16, cardY + 82);

    // Fields list
    const fieldsToShow: Array<keyof Omit<PersonRecord, "id" | "emoji">> = ["Cidade", "Hobby", "Idade", "Animal"];
    fieldsToShow.forEach((field, i) => {
      const fy = cardY + 100 + i * 82;
      const isHighlight = field === highlightField;

      const rowBg = this.addContent(this.add.graphics().setDepth(11));
      if (isHighlight) {
        rowBg.fillStyle(COLORS.teal, 0.14);
        rowBg.fillRoundedRect(cardX + 12, fy, cardW - 24, 70, 12);
        rowBg.lineStyle(2, COLORS.teal, 0.5);
        rowBg.strokeRoundedRect(cardX + 12, fy, cardW - 24, 70, 12);
      }

      const HOBBY_ICON_N2: Record<string, string> = { Futebol: "⚽", Dança: "💃", Xadrez: "♟️", Leitura: "📚", Desenho: "🎨" };
      const ANIMAL_ICON_N2: Record<string, string> = { Cachorro: "🐕", Gato: "🐱", Peixe: "🐠", Pássaro: "🦜" };
      const fieldIcon =
        field === "Hobby"   ? (HOBBY_ICON_N2[rec.Hobby] ?? "⚽")
        : field === "Animal" ? (ANIMAL_ICON_N2[rec.Animal] ?? "🐾")
        : field === "Cidade" ? "🏙"
        : "🎂"; // Idade
      this.addContent(this.addSharpText(cardX + 36, fy + 35, fieldIcon, {
        fontSize: "28px", fontFamily: "Arial Black, Arial",
      }).setOrigin(0.5).setDepth(13));

      this.addContent(this.addSharpText(cardX + 68, fy + 22, field, {
        fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#92400e",
      }).setOrigin(0, 0).setDepth(13));

      this.addContent(this.addSharpText(cardX + 68, fy + 42, rec[field], {
        fontSize: "22px", fontFamily: "Arial Black, Arial", color: isHighlight ? "#0d9488" : "#1c1008",
        stroke: isHighlight ? "#fef3c7" : "#fef3c7", strokeThickness: 3,
      }).setOrigin(0, 0.5).setDepth(13));
    });
  }

  private buildMCQChip(x: number, y: number, w: number, h: number, label: string, onClick: () => void) {
    const chipBg = this.addContent(this.add.graphics().setDepth(12));
    chipBg.fillStyle(COLORS.white, 0.9);
    chipBg.fillRoundedRect(x, y, w, h, h / 2);
    chipBg.lineStyle(3, COLORS.brown, 0.6);
    chipBg.strokeRoundedRect(x, y, w, h, h / 2);

    this.addContent(this.addSharpText(x + w / 2, y + h / 2, label, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#1c1008",
      stroke: "#fef3c7", strokeThickness: 3, align: "center", wordWrap: { width: w - 24 },
    }).setOrigin(0.5).setDepth(14));

    const zone = this.addContent(this.add.zone(x + w / 2, y + h / 2, w, h).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      chipBg.clear();
      chipBg.fillStyle(COLORS.teal, 0.14);
      chipBg.fillRoundedRect(x, y, w, h, h / 2);
      chipBg.lineStyle(3, COLORS.teal, 0.8);
      chipBg.strokeRoundedRect(x, y, w, h, h / 2);
    });
    zone.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      chipBg.clear();
      chipBg.fillStyle(COLORS.white, 0.9);
      chipBg.fillRoundedRect(x, y, w, h, h / 2);
      chipBg.lineStyle(3, COLORS.brown, 0.6);
      chipBg.strokeRoundedRect(x, y, w, h, h / 2);
    });
    zone.on("pointerdown", onClick);
  }

  private onN2OptionSelected(selected: string, correct: string) {
    if (this.gameEnded) return;
    this.playClick();
    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      this.showToast(`✅ Correto! O valor é "${correct}".`, COLORS.green, 1400);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(1500, () => {
        if (this.gameEnded) return;
        this.n2QuestionIndex += 1;
        this.showN2Question();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast(`❌ Não é esse! Leia o campo na ficha.`, COLORS.red, 2000);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    }
  }

  // ─── N3 — Filtro de Registros ─────────────────────────────────────────────

  private showN3Question() {
    this.clearContent();
    const questions = this.levelConfig.n3Questions!;
    if (this.n3QuestionIndex >= questions.length) {
      this.completeFinalLevel();
      return;
    }
    const q = questions[this.n3QuestionIndex];

    // Progress dots
    const dotsCont = this.addContent(this.add.container(640, PANEL_Y + 22).setDepth(12));
    questions.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(i < this.n3QuestionIndex ? COLORS.green : i === this.n3QuestionIndex ? COLORS.teal : 0xd1d5db, 1);
      dot.fillCircle(-18 + i * 18, 0, 7);
      dot.lineStyle(2, COLORS.white, 0.8);
      dot.strokeCircle(-18 + i * 18, 0, 7);
      dotsCont.add(dot);
    });

    // 8 mini-cards in 4×2 grid
    const miniW = 262;
    const miniH = 96;
    const miniGapX = 14;
    const miniGapY = 12;
    const gridStartX = PANEL_X + 16;
    const gridStartY = PANEL_Y + 44;

    RECORDS.forEach((rec, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const mx = gridStartX + col * (miniW + miniGapX);
      const my = gridStartY + row * (miniH + miniGapY);
      this.buildMiniCard(rec, mx, my, miniW, miniH);
    });

    // Question area at bottom
    const qAreaY = gridStartY + 2 * (miniH + miniGapY) + 18;

    const qBg = this.addContent(this.add.graphics().setDepth(10));
    qBg.fillStyle(COLORS.teal, 0.9);
    qBg.fillRoundedRect(PANEL_X + 16, qAreaY, PANEL_W - 32, 54, 16);
    this.addContent(this.addSharpText(640, qAreaY + 28, q.question, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#0d9488", strokeThickness: 3, align: "center",
    }).setOrigin(0.5).setDepth(12));

    // MCQ option chips (2 per row)
    const chipW = (PANEL_W - 64) / 2 - 8;
    const chipH = 52;
    const optionsStartY = qAreaY + 68;
    q.options.forEach((opt, i) => {
      const col = i % 2;
      const row2 = Math.floor(i / 2);
      const ox = PANEL_X + 16 + col * (chipW + 16);
      const oy = optionsStartY + row2 * (chipH + 10);
      this.buildMCQChip(ox, oy, chipW, chipH, opt, () => {
        if (this.gameEnded) return;
        this.onN3OptionSelected(opt, q.correct, q.explanation);
      });
    });
  }

  private buildMiniCard(rec: PersonRecord, x: number, y: number, w: number, h: number) {
    const cardBg = this.addContent(this.add.graphics().setDepth(10));
    cardBg.fillStyle(COLORS.white, 0.9);
    cardBg.fillRoundedRect(x, y, w, h, 14);
    cardBg.lineStyle(3, COLORS.brown, 0.4);
    cardBg.strokeRoundedRect(x, y, w, h, 14);

    // Emoji + Name
    this.addContent(this.addSharpText(x + 28, y + h / 2, rec.emoji, {
      fontSize: "28px", fontFamily: "Arial Black, Arial",
    }).setOrigin(0.5).setDepth(12));

    this.addContent(this.addSharpText(x + 52, y + 14, rec.Nome, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#92400e", stroke: "#fef3c7", strokeThickness: 3,
    }).setOrigin(0, 0).setDepth(12));

    // Two compact field rows with thematic emojis
    const HOBBY_ICON_M: Record<string, string> = { Futebol: "⚽", Dança: "💃", Xadrez: "♟️", Leitura: "📚", Desenho: "🎨" };
    const ANIMAL_ICON_M: Record<string, string> = { Cachorro: "🐕", Gato: "🐱", Peixe: "🐠", Pássaro: "🦜" };
    const fieldPairs: Array<[string, string]> = [
      [rec.Cidade, "🏙"],
      [rec.Hobby, HOBBY_ICON_M[rec.Hobby] ?? "⚽"],
    ];
    fieldPairs.forEach(([val, icon], i) => {
      this.addContent(this.addSharpText(x + 52, y + 32 + i * 24, `${icon} ${val}`, {
        fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#334155",
      }).setOrigin(0, 0).setDepth(12));
    });

    // Age + Animal (thematic emoji)
    const animalEmoji = ANIMAL_ICON_M[rec.Animal] ?? "🐾";
    this.addContent(this.addSharpText(x + w - 10, y + 14, `${rec.Idade}a · ${animalEmoji}`, {
      fontSize: "12px", fontFamily: "Arial Black, Arial", color: "#0d9488",
    }).setOrigin(1, 0).setDepth(12));
  }

  private onN3OptionSelected(selected: string, correct: string, explanation: string) {
    if (this.gameEnded) return;
    this.playClick();
    if (selected === correct) {
      this.hits += 1;
      this.playSuccess();
      this.showToast(`✅ Correto! ${explanation}`, COLORS.green, 2000);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(2100, () => {
        if (this.gameEnded) return;
        this.n3QuestionIndex += 1;
        this.showN3Question();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast("❌ Não é essa! Releia os registros.", COLORS.red, 2200);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    }
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as ArchiveLevelNumber;
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

  private showLevelCompleteScreen(nextLevel: ArchiveLevelNumber) {
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.62).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.cream, 0.97);
    panelBg.fillRoundedRect(-290, -190, 580, 360, 30);
    panelBg.lineStyle(5, COLORS.teal, 0.9);
    panelBg.strokeRoundedRect(-290, -190, 580, 360, 30);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.teal, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -134, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -70, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#0d9488", stroke: "#fef3c7", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -14, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const next = this.addSharpText(0, 38, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#92400e", align: "center",
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((num, i) => {
      const d = this.add.graphics();
      d.fillStyle(num <= this.levelConfig.level ? COLORS.teal : num === nextLevel ? COLORS.amber : 0xd1d5db, 1);
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
      const c = [COLORS.teal, COLORS.brown, COLORS.amber, COLORS.green, COLORS.blue][i % 5];
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
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.66).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.cream, 0.97);
    panelBg.fillRoundedRect(-320, -222, 640, 424, 34);
    panelBg.lineStyle(6, COLORS.brown, 0.9);
    panelBg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.brown, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -164, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#92400e", stroke: "#fef3c7", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -30, "Você completou todos os níveis do\nArquivo dos Registros!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#1c1008", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#475569", align: "center",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 16 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.teal, COLORS.amber, COLORS.green, COLORS.brown, COLORS.blue][i % 5], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.teal, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0d9488", strokeThickness: 3,
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

    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.7).setDepth(60));
    bg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
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
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626", stroke: "#fef3c7", strokeThickness: 6,
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
