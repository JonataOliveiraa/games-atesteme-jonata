import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { FORMAT_OPTIONS, LEVELS, shufflePieces } from "../data/levels";
import type { DataPiece, DataPieceId, FormatId, FormatLevel, SlotId } from "../types";

const GAME_ID = "formato-certo";
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 36;
const CARD_W = 150;
const CARD_H = 155;
const DATA_CARD_SCALE = 1;
const DRAG_CARD_SCALE = 1;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const MODAL_SCALE = 1.14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  softOrange: 0xff8a2a,
  cream: 0xfff6e8,
  purple: 0x8b5cf6,
  red: 0xef4444,
  ink: 0x102a43,
};

const BACKGROUND_BY_MODE: Record<FormatLevel["mode"], string> = {
  date: "bg-date-format",
  pixels: "bg-pixel-format",
  text: "bg-text-format",
};

const FORMAT_ASSET_BY_ID: Record<FormatId, string> = {
  date: "format-date-box",
  pixels: "format-pixel-grid",
  text: "format-text-sequence",
};

const PIECE_ASSET_BY_ID: Partial<Record<DataPieceId, string>> = {
  "day-18": "data-day-18",
  "month-june": "data-month-june",
  "year-2026": "data-year-2026",
  "color-red": "data-color-red",
  "color-blue": "data-color-blue",
  "color-yellow": "data-color-yellow",
  "letter-a": "data-letter-a",
  dash: "data-dash",
  "number-1": "data-number-1",
  "number-2": "data-number-2",
  "extra-place": "data-room-4",
  "extra-street": "data-street-sign",
  "extra-star": "data-star-extra",
};

type CardRecord = {
  id: DataPieceId;
  card: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
  homeX: number;
  homeY: number;
  slotId: SlotId | null;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: FormatLevel;
  private pieces: DataPiece[] = [];
  private selectedFormat: FormatId | null = null;
  private formatCards = new Map<FormatId, Phaser.GameObjects.Container>();
  private cards = new Map<DataPieceId, CardRecord>();
  private slots = new Map<SlotId, DataPieceId | null>();
  private slotRects = new Map<SlotId, Phaser.Geom.Rectangle>();
  private slotCenters = new Map<SlotId, { x: number; y: number }>();
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Graphics;
  private hasStartedTimer = false;
  private unsubscribePlatformCommands?: () => void;
  private structurePiecesRevealed = false;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((level) => level.level === lvl) ?? LEVELS[0];
    this.pieces = shufflePieces(this.levelConfig.pieces);
    this.selectedFormat = null;
    this.formatCards = new Map();
    this.cards = new Map();
    this.slots = new Map(this.levelConfig.slots.map((slot) => [slot.id, null]));
    this.slotRects = new Map();
    this.slotCenters = new Map();
    this.overlayObjects = [];
    this.commandLocked = false;
    this.hits = 0;
    this.errors = 0;
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
    this.hasStartedTimer = false;
    this.structurePiecesRevealed = false;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createFormatPanel();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();
  }

  private revealStructurePieces() {
    if (this.structurePiecesRevealed) return;
    this.structurePiecesRevealed = true;

    const before = new Set(this.children.list.slice());

    this.createStructurePanel();
    this.createPiecesPanel();
    this.createActionButton();

    const newObjs = this.children.list.filter(o => !before.has(o));
    newObjs.forEach(o => { (o as any).setAlpha?.(0); });

    this.tweens.add({
      targets: newObjs as unknown as Phaser.GameObjects.GameObject[],
      alpha: 1,
      duration: 380,
      ease: "Power1.easeOut",
    });
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(0, this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.orange : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  shutdown() {
    this.timerEvent?.destroy();
    this.unsubscribePlatformCommands?.();
    this.input.setDefaultCursor("default");
  }

  private createBackground() {
    const theme = this.getTheme();
    const bg = this.add.graphics().setDepth(-100);
    bg.fillGradientStyle(theme.a, theme.b, theme.c, theme.d, 1);
    bg.fillRect(0, 0, 1280, 720);
    const backgroundKey = BACKGROUND_BY_MODE[this.levelConfig.mode];
    if (this.textures.exists(backgroundKey)) {
      const background = this.add.image(640, 360, backgroundKey).setDepth(-99);
      background.setDisplaySize(1280, 720);
    }
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.18).setDepth(-96);

    const bench = this.add.graphics().setDepth(-95);
    bench.fillStyle(0xffffff, 0.14);
    bench.fillRoundedRect(52, 106, 1176, 560, 42);
    bench.lineStyle(4, 0xffffff, 0.28);
    bench.strokeRoundedRect(52, 106, 1176, 560, 42);

    if (!this.textures.exists(backgroundKey)) this.drawBackgroundShapes();
  }

  private getTheme() {
    if (this.levelConfig.mode === "pixels") {
      return { a: 0x67e8f9, b: 0xfde047, c: 0xfb7185, d: 0x8b5cf6 };
    }
    if (this.levelConfig.mode === "text") {
      return { a: 0xc084fc, b: 0x93c5fd, c: 0xfde68a, d: 0x34d399 };
    }
    return { a: 0x7dd3fc, b: 0xf0abfc, c: 0xfbbf24, d: 0x86efac };
  }

  private drawBackgroundShapes() {
    const g = this.add.graphics().setDepth(-94);
    for (let i = 0; i < 16; i += 1) {
      const x = Phaser.Math.Between(84, 1196);
      const y = Phaser.Math.Between(128, 626);
      const color = Phaser.Utils.Array.GetRandom([COLORS.blue, COLORS.cyan, COLORS.green, COLORS.orange, COLORS.purple]);
      g.fillStyle(color, 0.12);
      g.fillRoundedRect(x, y, Phaser.Math.Between(34, 78), Phaser.Math.Between(24, 54), 12);
    }
  }

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
    const fillWidth = Math.max(0, width);
    if (fillWidth <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, fillWidth, 32, 16);
  }

  private createHeader() {
    this.addSharpText(640, 72, this.levelConfig.title, {
      fontSize: "36px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const scenarioBg = this.add.graphics().setDepth(20);
    scenarioBg.fillStyle(0xffffff, 0.2);
    scenarioBg.fillRoundedRect(160, 94, 960, 40, 14);

    this.addSharpText(640, 114, `📋  ${this.levelConfig.scenario}`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#fef9c3",
      stroke: "#78350f",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 920 },
    }).setOrigin(0.5).setDepth(21);

    this.addSharpText(1086, 72, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.78)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createFormatPanel() {
    this.drawPanel(72, 143, 1136, 130, COLORS.blue, 1);

    const shuffledOptions = Phaser.Utils.Array.Shuffle([...FORMAT_OPTIONS]);
    shuffledOptions.forEach((option, index) => {
      const x = 294 + index * 346;
      const card = this.createFormatCard(option.id, x, 208, option.title, option.subtitle, option.color);
      this.formatCards.set(option.id, card);
    });
  }

  private createFormatCard(id: FormatId, x: number, y: number, title: string, subtitle: string, color: number) {
    const card = this.add.container(x, y).setDepth(15);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.14);
    shadow.fillRoundedRect(-124, -42, 248, 86, 22);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-128, -48, 256, 86, 22);
    bg.lineStyle(4, color, 0.9);
    bg.strokeRoundedRect(-128, -48, 256, 86, 22);
    const assetKey = FORMAT_ASSET_BY_ID[id];
    const icon = this.textures.exists(assetKey)
      ? this.fitImage(this.add.image(-88, -5, assetKey), 72, 58)
      : this.addSharpText(-88, -5, this.getFormatIcon(id), {
          fontSize: "34px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#25327a",
          strokeThickness: 4,
        }).setOrigin(0.5);
    const titleText = this.addSharpText(24, -14, title, {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      align: "center",
      wordWrap: { width: 160 },
    }).setOrigin(0.5);
    const subtitleText = this.addSharpText(24, 16, subtitle, {
      fontSize: "12px",
      fontFamily: "Arial Black, Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 160 },
    }).setOrigin(0.5);
    card.add([shadow, bg, icon, titleText, subtitleText]);
    const hitbox = this.add.zone(x, y, 280, 110).setDepth(50);
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerdown", () => this.selectFormat(id));
    return card;
  }

  private selectFormat(id: FormatId) {
    if (this.commandLocked) return;
    this.startTimerOnce();
    this.playClick();
    if (id !== this.levelConfig.requiredFormat) {
      this.errors += 1;
      this.playWrong();
      const wrongCard = this.formatCards.get(id);
      if (wrongCard) {
        this.tweens.add({ targets: wrongCard, x: wrongCard.x + 10, yoyo: true, repeat: 3, duration: 50 });
      }
      this.showToast(`Essa caixa não serve para esta missão. ${this.levelConfig.hint}`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }

    this.selectedFormat = id;
    this.formatCards.forEach((card, formatId) => {
      this.tweens.add({ targets: card, scale: formatId === id ? 1.08 : 0.96, alpha: formatId === id ? 1 : 0.82, duration: 140 });
    });
    this.showToast("Caixa certa! Agora encaixe os dados.", COLORS.green);
    this.time.delayedCall(200, () => this.revealStructurePieces());
    this.emitProgress();
  }

  private createStructurePanel() {
    this.drawPanel(72, 274, 1136, 204, COLORS.purple, 1);

    const spacing = this.levelConfig.slots.length <= 3 ? 250 : 190;
    const startX = 640 - ((this.levelConfig.slots.length - 1) * spacing) / 2;
    this.levelConfig.slots.forEach((slot, index) => {
      const x = startX + index * spacing;
      const y = 392;
      this.slotCenters.set(slot.id, { x, y });
      this.slotRects.set(slot.id, new Phaser.Geom.Rectangle(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H));
      this.drawSlot(x, y, slot.label, index);
    });
  }

  private drawSlot(x: number, y: number, label: string, index: number) {
    const colors = [COLORS.blue, COLORS.orange, COLORS.purple, COLORS.green];
    const slot = this.add.graphics().setDepth(4);
    slot.fillStyle(COLORS.cream, 0.8);
    slot.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
    slot.fillStyle(0xffffff, 0.26);
    slot.fillRoundedRect(x - SLOT_W / 2 + 12, y - SLOT_H / 2 + 12, SLOT_W - 24, 34, 16);
    slot.lineStyle(6, colors[index % colors.length], 0.9);
    slot.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
    this.addSharpText(x, y - 34, label, {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
  }

  private createPiecesPanel() {
    this.drawPanel(72, 478, 1136, 196, COLORS.orange, 1);
    const spacing = this.pieces.length <= 5 ? 210 : 170;
    const startX = 640 - ((this.pieces.length - 1) * spacing) / 2;
    this.pieces.forEach((piece, index) => {
      const x = startX + index * spacing;
      const y = 587;
      const { card, hitbox } = this.createDataCard(piece, x, y);
      this.cards.set(piece.id, { id: piece.id, card, hitbox, homeX: x, homeY: y, slotId: null });
    });
  }

  private createDataCard(piece: DataPiece, x: number, y: number) {
    const card = this.add.container(x, y).setDepth(20).setScale(DATA_CARD_SCALE);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.13);
    shadow.fillRoundedRect(-CARD_W / 2 + 3, -CARD_H / 2 + 10, CARD_W - 6, CARD_H - 4, 20);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.fillStyle(0xffffff, 0.22);
    bg.fillRoundedRect(-CARD_W / 2 + 14, -CARD_H / 2 + 12, CARD_W - 28, 34, 16);
    bg.lineStyle(4, piece.color, 0.84);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    const pieceAssetKey = PIECE_ASSET_BY_ID[piece.id];
    const icon = pieceAssetKey && this.textures.exists(pieceAssetKey)
      ? this.fitImage(this.add.image(0, -28, pieceAssetKey), 112, 92)
      : this.addSharpText(0, -30, this.getPieceIconLabel(piece), {
          fontSize: "42px",
          fontFamily: "Arial Black, Arial",
          color: this.toCssColor(piece.color),
          stroke: "#ffffff",
          strokeThickness: 5,
        }).setOrigin(0.5);
    const label = this.addSharpText(0, 54, piece.shortLabel, {
      fontSize: piece.shortLabel.length > 12 ? "13px" : "16px",
      fontFamily: "Arial, sans-serif",
      color: "#3b3b3b",
      stroke: "#ffffff",
      strokeThickness: 2,
      align: "center",
      wordWrap: { width: 132 },
    }).setOrigin(0.5);
    card.add([shadow, bg, icon, label]);

    const hitbox = this.add.zone(x, y, CARD_W * DATA_CARD_SCALE + 28, CARD_H * DATA_CARD_SCALE + 24).setDepth(80);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(hitbox);
    hitbox.on("pointerdown", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      if (!this.selectedFormat) {
        this.showToast("Primeiro escolha a caixa certa lá em cima.", COLORS.orange);
        return;
      }
      this.highlightCard(piece.id);
    });
    hitbox.on("dragstart", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      if (!this.selectedFormat) {
        this.showToast("Primeiro escolha a caixa certa lá em cima.", COLORS.orange);
        return;
      }
      this.removeFromSlot(piece.id);
      card.setScale(DRAG_CARD_SCALE);
      card.setDepth(60);
      hitbox.setDepth(90);
      this.highlightCard(piece.id);
    });
    hitbox.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.commandLocked) return;
      if (!this.selectedFormat) return;
      card.setPosition(dragX, dragY);
      hitbox.setPosition(dragX, dragY);
    });
    hitbox.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (this.commandLocked) return;
      if (!this.selectedFormat) {
        this.returnCardHome(piece.id);
        return;
      }
      this.dropCard(piece.id, pointer.x, pointer.y);
      card.setDepth(20);
      hitbox.setDepth(80);
    });
    return { card, hitbox };
  }

  private dropCard(id: DataPieceId, pointerX: number, pointerY: number) {
    const target = [...this.slotRects.entries()].find(([, rect]) => rect.contains(pointerX, pointerY));
    if (!target) {
      this.returnCardHome(id);
      return;
    }
    this.placeCardInSlot(id, target[0]);
  }

  private placeCardInSlot(id: DataPieceId, slotId: SlotId) {
    const record = this.cards.get(id);
    if (!record) return;
    const previous = this.slots.get(slotId);
    if (previous && previous !== id) this.returnCardHome(previous);
    this.removeFromSlot(id);
    this.slots.set(slotId, id);
    record.slotId = slotId;
    const center = this.slotCenters.get(slotId);
    if (!center) return;
    record.card.setScale(1);
    this.tweens.add({ targets: record.card, x: center.x, y: center.y, duration: 140, ease: "Sine.easeOut" });
    this.tweens.add({ targets: record.hitbox, x: center.x, y: center.y, duration: 140, ease: "Sine.easeOut" });
    this.playClick();
    this.emitProgress();
  }

  private removeFromSlot(id: DataPieceId) {
    const record = this.cards.get(id);
    if (record?.slotId) {
      this.slots.set(record.slotId, null);
      record.slotId = null;
    }
  }

  private returnCardHome(id: DataPieceId) {
    const record = this.cards.get(id);
    if (!record) return;
    this.removeFromSlot(id);
    record.card.setScale(DATA_CARD_SCALE);
    this.tweens.add({ targets: record.card, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.tweens.add({ targets: record.hitbox, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.emitProgress();
  }

  private highlightCard(id: DataPieceId) {
    this.cards.forEach((record) => record.card.setAlpha(record.id === id ? 1 : 0.9));
  }

  private createActionButton() {
    this.createUiButton(640, 691, 360, 34, "Verificar formato", COLORS.green, () => this.validateFormat());
  }

  private async validateFormat() {
    if (this.commandLocked) return;
    this.playClick();
    this.startTimerOnce();
    if (!this.selectedFormat) {
      this.playWrong();
      this.showToast("Escolha uma caixa de formato primeiro.", COLORS.orange);
      return;
    }
    if (this.selectedFormat !== this.levelConfig.requiredFormat) {
      this.errors += 1;
      this.playWrong();
      this.showToast(`Esse formato não consegue ler esta informação. ${this.levelConfig.hint}`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }
    if ([...this.slots.values()].some((slot) => !slot)) {
      this.playWrong();
      this.showToast("Preencha todos os espaços do formato.", COLORS.orange);
      return;
    }
    const wrongSlot = this.levelConfig.slots.find((slot) => this.slots.get(slot.id) !== slot.accepts);
    if (wrongSlot) {
      this.errors += 1;
      this.playWrong();
      this.showToast(`A leitura falhou no campo ${wrongSlot.label}. ${this.levelConfig.hint}`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }

    this.commandLocked = true;
    this.hits += 1;
    this.playCorrect();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
    await this.showFormatReveal();
    this.handleLevelSuccess();
  }

  private showFormatReveal() {
    return new Promise<void>((resolve) => {
      const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.34).setDepth(300);
      const panel = this.add.graphics().setDepth(301);
      panel.fillStyle(0xffffff, 0.95);
      panel.fillRoundedRect(376, 206, 528, 312, 34);
      panel.lineStyle(6, 0xffffff, 0.98);
      panel.strokeRoundedRect(376, 206, 528, 312, 34);
      const title = this.addSharpText(640, 272, this.levelConfig.resultTitle, {
        fontSize: "30px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(302);
      const previewObjects = this.drawRecoveredPreview(640, 360, 302);
      const text = this.addSharpText(640, 452, this.levelConfig.resultText, {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      }).setOrigin(0.5).setDepth(302);
      const targets: Phaser.GameObjects.GameObject[] = [overlay, panel, title, text, ...previewObjects];
      targets.forEach((target) => target.setAlpha(0));
      this.tweens.add({
        targets,
        alpha: 1,
        duration: 220,
        onComplete: () => {
          this.time.delayedCall(1100, () => {
            this.tweens.add({
              targets,
              alpha: 0,
              duration: 220,
              onComplete: () => {
                targets.forEach((target) => target.destroy());
                resolve();
              },
            });
          });
        },
      });
    });
  }

  private drawRecoveredPreview(x: number, y: number, depth: number) {
    if (this.levelConfig.mode === "pixels") {
      const colors = [0xef4444, 0x38bdf8, 0xfacc15];
      return colors.map((color, index) => {
        const pixel = this.add.rectangle(x - 76 + index * 76, y, 64, 64, color, 1).setDepth(depth);
        pixel.setStrokeStyle(5, 0xffffff, 1);
        return pixel;
      });
    }
    const result = this.addSharpText(x, y, this.levelConfig.resultText, {
      fontSize: this.levelConfig.mode === "text" ? "52px" : "32px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(depth);
    return [result];
  }

  private handleLevelSuccess() {
    this.timerEvent?.remove(false);
    const nextLevel = this.levelConfig.level + 1;
    if (nextLevel <= 3) {
      runtimeGameBridge.emit({
        type: "CHECKPOINT",
        gameId: GAME_ID,
        stage: nextLevel,
        progress: 0,
        score: this.getScore(),
        hits: this.hits,
        errors: this.errors,
      });
      this.showLevelCompleteTransition(nextLevel as 1 | 2 | 3);
      return;
    }
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level });
    this.showGameCompleteScreen();
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.orange);
    const badgeIcon = this.add.image(0, -114, "success-badge");
    this.fitImage(badgeIcon, 82, 82);
    const title = this.addSharpText(0, -58, "Parabéns!", this.modalTitleStyle()).setOrigin(0.5);
    const score = this.addSharpText(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
    }).setOrigin(0.5);
    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics();
      dot.fillStyle(level <= this.levelConfig.level ? COLORS.green : level === nextLevel ? COLORS.orange : 0xd8dde8, 1);
      dot.fillCircle(-28 + index * 28, 58, 8);
      dot.lineStyle(2, 0xffffff, 0.9);
      dot.strokeCircle(-28 + index * 28, 58, 8);
      return dot;
    });
    modal.add([badgeIcon, title, score, ...dots]);
    this.animateModal(modal);
    this.time.delayedCall(3000, () => this.showNextLevelStartTransition(nextLevel));
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.green);
    const title = this.addSharpText(0, -102, `Nível ${nextLevel} liberado!`, this.modalTitleStyle()).setOrigin(0.5);
    const objective = this.addSharpText(0, -24, nextConfig?.title ?? "Novo formato", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);

    let hasStartedNextLevel = false;
    const startNextLevel = () => {
      if (hasStartedNextLevel) return;
      hasStartedNextLevel = true;
      this.input.setDefaultCursor("default");
      this.scene.restart({ level: nextLevel });
    };

    const buttonHitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
    buttonHitbox.setInteractive({ useHandCursor: true });
    buttonHitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerdown", () => {
      this.playClick();
      startNextLevel();
    });
    modal.add([title, objective, button]);
    this.animateModal(modal);
  }

  private showGameCompleteScreen() {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.62).setDepth(450));
    overlay.setInteractive();
    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-292, -178, 584, 366, 34);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-304, -190, 608, 370, 34);
    bg.lineStyle(6, 0xffffff, 0.96);
    bg.strokeRoundedRect(-304, -190, 608, 370, 34);
    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.green, 1);
    ribbon.fillRoundedRect(-214, -208, 428, 34, 17);
    ribbon.lineStyle(4, 0xffffff, 0.9);
    ribbon.strokeRoundedRect(-214, -208, 428, 34, 17);
    const title = this.addSharpText(0, -128, "Formatos dominados!", {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.addSharpText(0, -74, `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5);
    const sparkles = Array.from({ length: 14 }, (_, index) => {
      const sparkle = this.add.graphics();
      const x = Phaser.Math.Between(-278, 278);
      const y = Phaser.Math.Between(-168, 158);
      sparkle.fillStyle(index % 3 === 0 ? COLORS.cyan : index % 3 === 1 ? COLORS.orange : COLORS.green, 0.9);
      sparkle.fillCircle(x, y, Phaser.Math.Between(4, 8));
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.35, to: 1 },
        scale: { from: 0.8, to: 1.35 },
        duration: 720 + index * 35,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      return sparkle;
    });
    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 42);
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(index === 0 ? COLORS.orange : index === 1 ? COLORS.cyan : COLORS.green, 1);
      badgeBg.fillRoundedRect(-54, -42, 108, 84, 18);
      badgeBg.lineStyle(4, 0xffffff, 0.95);
      badgeBg.strokeRoundedRect(-54, -42, 108, 84, 18);
      const number = this.addSharpText(0, -13, String(level), {
        fontSize: "30px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#25327a",
        strokeThickness: 4,
      }).setOrigin(0.5);
      const label = this.addSharpText(0, 23, "concluído", {
        fontSize: "12px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      }).setOrigin(0.5);
      item.add([badgeBg, number, label]);
      return item;
    });
    const playAgain = this.createFinalButton(-158, 138, "Jogar novamente", COLORS.green, () => this.scene.restart({ level: 1 }));
    const exit = this.createFinalButton(158, 138, "Voltar aos jogos", COLORS.orange, () => EventBus.emit("exit-game"));
    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, ...levelLabels, playAgain, exit]);
    this.animateModal(panel);
  }

  private createModalBase(x: number, y: number, color: number) {
    const modal = this.addOverlayObject(this.add.container(x, y).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -166, 540, 330, 28);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -178, 556, 330, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -178, 556, 330, 28);
    const topBar = this.add.graphics();
    topBar.fillStyle(color, 1);
    topBar.fillRoundedRect(-196, -194, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14);
    modal.add([shadow, bg, topBar]);
    return modal;
  }

  private createModalButton(x: number, y: number, label: string, color: number) {
    const button = this.add.container(x, y);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(-136, -20, 272, 48, 24);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-140, -26, 280, 52, 26);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-140, -26, 280, 52, 26);
    const text = this.addSharpText(0, 0, label, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#9a3f00",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([shadow, bg, text]);
    return button;
  }

  private createFinalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-132, -26, 264, 52, 26);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-132, -26, 264, 52, 26);
    const text = this.addSharpText(0, 0, label, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([bg, text]);
    const hitbox = this.addOverlayObject(this.add.zone(640 + x * MODAL_SCALE, 360 + y * MODAL_SCALE, 310 * MODAL_SCALE, 86 * MODAL_SCALE).setDepth(452));
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerdown", () => {
      this.playClick();
      onClick();
    });
    return button;
  }

  private animateModal(modal: Phaser.GameObjects.Container) {
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);
    this.tweens.add({ targets: modal, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  private modalTitleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    };
  }

  private createUiButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y).setDepth(12);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.22);
    shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 7, width, height, height / 2);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    bg.fillStyle(0xffffff, 0.16);
    bg.fillRoundedRect(-width / 2 + 16, -height / 2 + 10, width - 32, 18, 9);
    bg.lineStyle(3, 0xffffff, 0.92);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    const text = this.addSharpText(0, 0, label, {
      fontSize: width > 260 ? "22px" : "16px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5);
    button.add([shadow, bg, text]);
    const zone = this.add.zone(x, y, width + 12, height + 12).setDepth(40);
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerdown", onClick);
    return button;
  }

  private drawPanel(x: number, y: number, width: number, height: number, _accentColor: number, depth: number) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x5b3410, 0.16);
    shadow.fillRoundedRect(x + 9, y + 12, width, height, 30);
    shadow.setDepth(depth);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.34);
    panel.fillRoundedRect(x, y, width, height, 30);
    panel.fillStyle(0xfff1d6, 0.18);
    panel.fillRoundedRect(x + 12, y + 12, width - 24, height - 24, 24);
    panel.fillStyle(0xffffff, 0.2);
    panel.fillRoundedRect(x + 20, y + 16, width - 40, Math.min(42, height - 28), 18);
    panel.lineStyle(7, 0xffffff, 0.95);
    panel.strokeRoundedRect(x, y, width, height, 30);
    panel.setDepth(depth + 0.1);
    return panel;
  }

  private drawPanelHeader(x: number, y: number, label: string) {
    return this.addSharpText(x, y + 16, label, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11);
  }

  private showToast(message: string, color: number) {
    const container = this.add.container(640, 640).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-420, -36, 840, 72, 22);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-420, -36, 840, 72, 22);
    const text = this.addSharpText(0, 0, message, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 760 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.tweens.add({
      targets: container,
      y: 620,
      alpha: 0,
      delay: 1850,
      duration: 420,
      onComplete: () => container.destroy(),
    });
  }

  private startTimerOnce() {
    if (this.hasStartedTimer) return;
    this.hasStartedTimer = true;
    this.timerEvent = this.time.addEvent({
      delay: this.levelConfig.timeLimit * 1000,
      callback: () => {
        this.errors += 1;
        this.playWrong();
        runtimeGameBridge.emit({ type: "GAME_OVER", gameId: GAME_ID, stage: this.levelConfig.level });
        this.showToast("Tempo esgotado. Tente escolher o formato de novo.", COLORS.red);
      },
    });
  }

  private emitProgress() {
    const filled = [...this.slots.values()].filter(Boolean).length;
    const formatProgress = this.selectedFormat ? 20 : 0;
    const fillProgress = filled ? Math.round((filled / this.levelConfig.slots.length) * 75) : 0;
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      progress: Math.min(95, formatProgress + fillProgress),
      score: this.getScore(),
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    });
  }

  private getScore() {
    return Math.max(0, this.hits * 10 - this.errors * 5);
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands?.();
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((command: PlatformCommand) => {
      if (command.type === "RESET") this.scene.restart({ level: this.levelConfig.level });
      if (command.type === "GOTO_LEVEL") {
        if (command.stage === this.levelConfig.level) return;
        this.scene.restart({ level: command.stage });
      }
      if (command.type === "PAUSE") this.scene.pause();
      if (command.type === "RESUME") this.scene.resume();
    });
  }

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.overlayObjects.push(object);
    return object;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((object) => object.destroy());
    this.overlayObjects = [];
  }

  private getFormatIcon(id: FormatId) {
    return { date: "D", pixels: "#", text: "A" }[id];
  }

  private getPieceIconLabel(piece: DataPiece) {
    const icons: Partial<Record<DataPieceId, string>> = {
      "day-18": "18",
      "month-june": "JUN",
      "year-2026": "2026",
      "color-red": "COR",
      "color-blue": "COR",
      "color-yellow": "COR",
      "letter-a": "A",
      dash: "-",
      "number-1": "1",
      "number-2": "2",
      "extra-place": "SALA",
      "extra-street": "RUA",
      "extra-star": "*",
    };
    return icons[piece.id] ?? piece.shortLabel;
  }

  private getPieceIcon(piece: DataPiece) {
    if (piece.visual === "paint") return "●";
    if (piece.visual === "letter") return piece.shortLabel;
    if (piece.visual === "place") return "⌂";
    if (piece.visual === "star") return "★";
    return "□";
  }

  private toCssColor(color: number) {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const source = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width || maxWidth;
    const height = source.height || maxHeight;
    const scale = Math.min(maxWidth / width, maxHeight / height);
    image.setDisplaySize(width * scale, height * scale);
    image.setOrigin(0.5);
    return image;
  }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    return this.add.text(x, y, text, style).setResolution(2);
  }

  private playClick() {
    this.playTone(520, 0.05, 0.04);
  }

  private playCorrect() {
    this.playTone(740, 0.1, 0.06);
  }

  private playWrong() {
    this.playTone(190, 0.12, 0.05);
  }

  private playTone(frequency: number, duration: number, volume: number) {
    const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
    const context = manager.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}
