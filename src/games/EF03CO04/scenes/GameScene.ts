import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS, shufflePieces } from "../data/levels";
import type { FieldId, InfoLevel, InfoPiece, InfoPieceId } from "../types";

const GAME_ID = "montador-de-informacoes";
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 42;
const CARD_W = 180;
const CARD_H = 136;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const MODAL_SCALE = 1.14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  ink: 0x102a43,
};

type CardRecord = {
  id: InfoPieceId;
  card: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
  homeX: number;
  homeY: number;
  slotId: FieldId | null;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: InfoLevel;
  private pieces: InfoPiece[] = [];
  private cards = new Map<InfoPieceId, CardRecord>();
  private slots = new Map<FieldId, InfoPieceId | null>();
  private slotRects = new Map<FieldId, Phaser.Geom.Rectangle>();
  private slotCenters = new Map<FieldId, { x: number; y: number }>();
  private resultObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Graphics;
  private hasStartedTimer = false;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((level) => level.level === lvl) ?? LEVELS[0];
    this.pieces = shufflePieces(this.levelConfig.pieces);
    this.cards = new Map();
    this.slots = new Map(this.levelConfig.fields.map((field) => [field.id, null]));
    this.slotRects = new Map();
    this.slotCenters = new Map();
    this.resultObjects = [];
    this.overlayObjects = [];
    this.commandLocked = false;
    this.hits = 0;
    this.errors = 0;
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
    this.hasStartedTimer = false;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createFieldPanel();
    this.createPiecesPanel();
    this.createResultPanel();
    this.createActionButton();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();
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
    const bg = this.add.graphics().setDepth(-100);
    bg.fillGradientStyle(0x67e8f9, 0xa78bfa, 0xffd166, 0xf9a8d4, 1);
    bg.fillRect(0, 0, 1280, 720);

    const desk = this.add.graphics().setDepth(-99);
    desk.fillStyle(0xffffff, 0.22);
    desk.fillRoundedRect(66, 86, 1148, 560, 44);
    desk.lineStyle(5, 0xffffff, 0.35);
    desk.strokeRoundedRect(66, 86, 1148, 560, 44);

    const screen = this.add.graphics().setDepth(-98);
    screen.fillStyle(0x0f172a, 0.12);
    screen.fillRoundedRect(188, 122, 904, 474, 38);
    screen.fillStyle(0xffffff, 0.12);
    screen.fillRoundedRect(218, 146, 844, 58, 28);

    const accents = [
      { x: 116, y: 166, w: 82, h: 82, c: COLORS.orange },
      { x: 1058, y: 128, w: 96, h: 96, c: COLORS.green },
      { x: 112, y: 548, w: 118, h: 62, c: COLORS.purple },
      { x: 1054, y: 558, w: 132, h: 58, c: COLORS.cyan },
    ];
    accents.forEach((item) => {
      const shape = this.add.graphics().setDepth(-97);
      shape.fillStyle(item.c, 0.34);
      shape.fillRoundedRect(item.x, item.y, item.w, item.h, 24);
      shape.lineStyle(3, 0xffffff, 0.32);
      shape.strokeRoundedRect(item.x, item.y, item.w, item.h, 24);
    });

    for (let i = 0; i < 22; i++) {
      const shape = this.add.graphics().setDepth(-96);
      const color = Phaser.Utils.Array.GetRandom([COLORS.blue, COLORS.cyan, COLORS.green, COLORS.orange, COLORS.purple]);
      const x = Phaser.Math.Between(96, 1168);
      const y = Phaser.Math.Between(116, 616);
      shape.fillStyle(color, 0.18);
      shape.fillCircle(x, y, Phaser.Math.Between(6, 14));
    }
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.12).setDepth(-95);
  }

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(0x334155, 0.18);
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
    this.addSharpText(640, 104, this.levelConfig.title, {
      fontSize: "42px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.addSharpText(640, 150, this.levelConfig.instruction, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    this.addSharpText(1086, 104, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.76)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createFieldPanel() {
    this.drawPanel(52, 184, 1176, 204, COLORS.blue, 1);
    this.drawPanelHeader(640, 194, 420, this.getFieldPanelTitle(), COLORS.blue);

    const count = this.levelConfig.fields.length;
    const startX = count <= 3 ? 322 : 166;
    const gap = count <= 3 ? 318 : 224;

    this.levelConfig.fields.forEach((field, index) => {
      const x = startX + index * gap;
      const y = 306;
      this.slotCenters.set(field.id, { x, y });
      this.slotRects.set(field.id, new Phaser.Geom.Rectangle(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H));

      const slot = this.add.graphics().setDepth(4);
      slot.fillStyle(0xffffff, 0.58);
      slot.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
      slot.fillStyle(0xffffff, 0.22);
      slot.fillRoundedRect(x - SLOT_W / 2 + 12, y - SLOT_H / 2 + 12, SLOT_W - 24, 30, 15);
      slot.lineStyle(5, this.getFieldColor(index), 0.92);
      slot.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
      slot.lineStyle(2, 0xffffff, 0.88);
      slot.strokeRoundedRect(x - SLOT_W / 2 + 6, y - SLOT_H / 2 + 6, SLOT_W - 12, SLOT_H - 12, 18);

      this.addSharpText(x, y - 30, field.label, {
        fontSize: count > 5 ? "15px" : "17px",
        fontFamily: "Arial Black, Arial",
        color: "#1e3a8a",
        stroke: "#ffffff",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: 138 },
      }).setOrigin(0.5).setDepth(5);
    });
  }

  private createPiecesPanel() {
    this.drawPanel(52, 410, 1176, 204, COLORS.purple, 1);
    this.drawPanelHeader(640, 420, 420, "Dados recebidos", COLORS.purple);

    const count = this.pieces.length;
    const startX = count <= 5 ? 170 : 110;
    const gap = count <= 5 ? 235 : 206;

    this.pieces.forEach((piece, index) => {
      const x = startX + index * gap;
      const y = 528;
      const { card, hitbox } = this.createDataCard(piece, x, y);
      this.cards.set(piece.id, { id: piece.id, card, hitbox, homeX: x, homeY: y, slotId: null });
    });
  }

  private createResultPanel() {
    this.drawPanel(52, 628, 748, 76, COLORS.green, 1);
    this.drawPanelHeader(426, 630, 260, "Resultado", COLORS.green);
    this.drawResult(false);
  }

  private createActionButton() {
    this.createUiButton(1032, 666, 360, 70, "Validar informação", COLORS.green, () => this.validateInformation());
  }

  private createDataCard(piece: InfoPiece, x: number, y: number) {
    const card = this.add.container(x, y).setDepth(20);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(-CARD_W / 2 + 8, -CARD_H / 2 + 10, CARD_W, CARD_H, 22);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 22);
    bg.fillStyle(piece.color, 0.1);
    bg.fillRoundedRect(-CARD_W / 2 + 10, -CARD_H / 2 + 10, CARD_W - 20, CARD_H - 20, 18);
    bg.lineStyle(4, piece.color, 0.88);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 22);

    const chip = this.add.graphics();
    chip.fillStyle(piece.color, 1);
    chip.fillRoundedRect(-44, -54, 88, 48, 22);
    chip.fillStyle(0xffffff, 0.2);
    chip.fillRoundedRect(-34, -46, 68, 16, 8);
    chip.lineStyle(4, 0xffffff, 0.95);
    chip.strokeRoundedRect(-44, -54, 88, 48, 22);

    const icon = this.addSharpText(0, -31, this.getPieceSymbol(piece), {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);

    const label = this.addSharpText(0, 34, piece.shortLabel, {
      fontSize: piece.shortLabel.length > 12 ? "15px" : "19px",
      fontFamily: "Arial Black, Arial",
      color: "#1f2937",
      stroke: "#ffffff",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 158 },
    }).setOrigin(0.5);
    card.add([shadow, bg, chip, icon, label]);

    const hitbox = this.add.zone(x, y, CARD_W + 28, CARD_H + 24).setDepth(80);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(hitbox);
    hitbox.on("pointerdown", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      this.highlightCard(piece.id);
    });
    hitbox.on("dragstart", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      this.removeFromSlot(piece.id);
      card.setDepth(60);
      hitbox.setDepth(90);
      this.highlightCard(piece.id);
    });
    hitbox.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.commandLocked) return;
      card.setPosition(dragX, dragY);
      hitbox.setPosition(dragX, dragY);
    });
    hitbox.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (this.commandLocked) return;
      this.dropCard(piece.id, pointer.x, pointer.y);
      card.setDepth(20);
      hitbox.setDepth(80);
    });

    return { card, hitbox };
  }

  private dropCard(id: InfoPieceId, pointerX: number, pointerY: number) {
    const target = [...this.slotRects.entries()].find(([, rect]) => rect.contains(pointerX, pointerY));
    if (!target) {
      this.returnCardHome(id);
      return;
    }
    this.placeCardInSlot(id, target[0]);
  }

  private placeCardInSlot(id: InfoPieceId, slotId: FieldId) {
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

  private removeFromSlot(id: InfoPieceId) {
    const record = this.cards.get(id);
    if (record?.slotId) {
      this.slots.set(record.slotId, null);
      record.slotId = null;
    }
  }

  private returnCardHome(id: InfoPieceId) {
    const record = this.cards.get(id);
    if (!record) return;
    this.removeFromSlot(id);
    record.card.setScale(1);
    this.tweens.add({ targets: record.card, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.tweens.add({ targets: record.hitbox, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.emitProgress();
  }

  private highlightCard(id: InfoPieceId) {
    this.cards.forEach((record) => record.card.setAlpha(record.id === id ? 1 : 0.9));
  }

  private getPieceSymbol(piece: InfoPiece) {
    if (piece.id.includes("day") || piece.id.includes("month") || piece.id.includes("year")) return "D";
    if (piece.id.includes("street") || piece.id.includes("city") || piece.id.includes("zip") || piece.id.includes("neighborhood")) return "L";
    if (piece.id.includes("number")) return "#";
    if (piece.id.includes("name")) return "N";
    if (piece.id.includes("age")) return "8";
    if (piece.id.includes("color")) return "C";
    if (piece.id.includes("pet")) return "P";
    return "?";
  }

  private async validateInformation() {
    if (this.commandLocked) return;
    this.playClick();
    this.startTimerOnce();
    if ([...this.slots.values()].some((slot) => !slot)) {
      this.playWrong();
      this.showToast("Preencha todos os campos antes de validar.", COLORS.orange);
      return;
    }

    const wrongField = this.levelConfig.fields.find((field) => this.slots.get(field.id) !== field.accepts);
    if (wrongField) {
      this.errors += 1;
      this.playWrong();
      this.showToast(`Esse dado não completa o campo ${wrongField.label}. ${this.levelConfig.hint}`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }

    this.commandLocked = true;
    this.hits += 1;
    this.playCorrect();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
    this.drawResult(true);
    await this.showInformationReveal();
    this.handleLevelSuccess();
  }

  private drawResult(isComplete: boolean) {
    this.resultObjects.forEach((object) => object.destroy());
    this.resultObjects = [];
    const icon = this.createResultIcon(isComplete).setDepth(12);
    const label = this.addSharpText(462, 672, isComplete ? this.levelConfig.resultText : "Dados aguardando combinação", {
      fontSize: isComplete ? "17px" : "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(12);
    this.resultObjects.push(icon, label);
  }

  private createResultIcon(isComplete: boolean) {
    const container = this.add.container(166, 666);
    const bg = this.add.graphics();
    bg.fillStyle(isComplete ? COLORS.green : 0x64748b, 1);
    bg.fillRoundedRect(-34, -28, 68, 56, 16);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-34, -28, 68, 56, 16);
    const text = this.addSharpText(0, 0, isComplete ? this.getResultSymbol() : "?", {
      fontSize: isComplete ? "25px" : "28px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(text);
    container.addAt(bg, 0);
    return container;
  }

  private showInformationReveal() {
    return new Promise<void>((resolve) => {
      const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.34).setDepth(300);
      const panel = this.add.graphics().setDepth(301);
      panel.fillStyle(0xffffff, 0.94);
      panel.fillRoundedRect(390, 212, 500, 296, 34);
      panel.lineStyle(6, 0xffffff, 0.98);
      panel.strokeRoundedRect(390, 212, 500, 296, 34);
      const title = this.addSharpText(640, 280, this.levelConfig.resultTitle, {
        fontSize: "30px",
        fontFamily: "Arial Black, Arial",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(302);
      const text = this.addSharpText(640, 366, this.levelConfig.resultText, {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      }).setOrigin(0.5).setDepth(302);
      const hint = this.addSharpText(640, 452, "Dados juntos viraram informação.", {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#7c3aed",
        align: "center",
      }).setOrigin(0.5).setDepth(302);
      const targets = [overlay, panel, title, text, hint];
      targets.forEach((target) => target.setAlpha(0));
      this.tweens.add({
        targets,
        alpha: 1,
        duration: 220,
        onComplete: () => {
          this.time.delayedCall(1050, () => {
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
      this.showNextLevelStartTransition(nextLevel as 1 | 2 | 3);
      return;
    }
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level });
    this.showGameCompleteScreen();
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.green);
    const title = this.addSharpText(0, -102, `Nível ${nextLevel}`, this.modalTitleStyle()).setOrigin(0.5);
    const objective = this.addSharpText(0, -42, nextConfig?.title ?? "Nova informação", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const detail = this.addSharpText(0, 14, nextConfig?.instruction ?? "Combine os dados.", {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);
    const buttonHitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
    buttonHitbox.setInteractive({ useHandCursor: true });
    buttonHitbox.on("pointerover", () => this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" }));
    buttonHitbox.on("pointerout", () => this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" }));
    buttonHitbox.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: nextLevel });
    });
    modal.add([title, objective, detail, button]);
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
    const title = this.addSharpText(0, -128, "Informações montadas!", {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.addSharpText(0, -78, `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5);
    const message = this.addSharpText(0, -28, "Você descobriu que dados juntos podem formar uma informação útil.", {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 470 },
    }).setOrigin(0.5);
    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 54);
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
    panel.add([shadow, bg, ribbon, title, subtitle, message, ...levelLabels, playAgain, exit]);
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
    hitbox.on("pointerover", () => this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" }));
    hitbox.on("pointerout", () => this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" }));
    hitbox.on("pointerdown", () => {
      this.playClick();
      onClick();
    });
    return button;
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
    shadow.fillStyle(0x0f172a, 0.18);
    shadow.fillRoundedRect(x + 10, y + 12, width, height, 32);
    shadow.setDepth(depth);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.46);
    panel.fillRoundedRect(x, y, width, height, 32);
    panel.fillStyle(0xffffff, 0.24);
    panel.fillRoundedRect(x + 10, y + 10, width - 20, height - 20, 24);
    panel.fillStyle(_accentColor, 0.08);
    panel.fillRoundedRect(x + 18, y + 18, width - 36, height - 36, 20);
    panel.lineStyle(5, 0xffffff, 0.94);
    panel.strokeRoundedRect(x, y, width, height, 32);
    panel.lineStyle(2, 0xffffff, 0.54);
    panel.strokeRoundedRect(x + 7, y + 7, width - 14, height - 14, 26);
    panel.setDepth(depth + 0.1);
    return panel;
  }

  private drawPanelHeader(x: number, y: number, _width: number, label: string, _color: number) {
    const header = this.add.graphics().setDepth(10);
    header.fillStyle(_color, 0.96);
    header.fillRoundedRect(x - _width / 2, y + 2, _width, 44, 22);
    header.fillStyle(0xffffff, 0.16);
    header.fillRoundedRect(x - _width / 2 + 16, y + 8, _width - 32, 12, 6);
    header.lineStyle(4, 0xffffff, 0.92);
    header.strokeRoundedRect(x - _width / 2, y + 2, _width, 44, 22);
    const text = this.addSharpText(x, y + 20, label, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(11);
    return text;
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

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.overlayObjects.push(object);
    return object;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((object) => object.destroy());
    this.overlayObjects = [];
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
        this.showToast("Tempo esgotado. Tente combinar os dados de novo.", COLORS.red);
      },
    });
  }

  private emitProgress() {
    const filled = [...this.slots.values()].filter(Boolean).length;
    const progress = filled ? Math.min(95, Math.round((filled / this.levelConfig.fields.length) * 100)) : 0;
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      progress,
      score: this.getScore(),
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    });
  }

  private getScore() {
    return this.hits * 10 - this.errors * 5;
  }

  private getFieldColor(index: number) {
    return [COLORS.cyan, COLORS.orange, COLORS.purple, COLORS.green, COLORS.red, COLORS.blue][index] ?? COLORS.blue;
  }

  private getFieldPanelTitle() {
    return {
      invite: "Campos do convite",
      address: "Campos do envelope",
      character: "Campos da ficha",
    }[this.levelConfig.mode];
  }

  private getResultSymbol() {
    return {
      invite: "✓",
      address: "✓",
      character: "✓",
    }[this.levelConfig.mode];
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((command: PlatformCommand) => {
      if (command.type !== "START_GAME") return;
      if (command.gameId !== GAME_ID) return;
      if (command.stage === this.levelConfig.level) return;
      this.scene.restart({ level: command.stage as 1 | 2 | 3 });
    });
  }

  private addSharpText(x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) {
    const textObject = this.add.text(x, y, text, { fontStyle: "bold", ...style });
    textObject.setResolution(2);
    return textObject;
  }

  private getAudioContext(): AudioContext | null {
    if (!("context" in this.sound)) return null;
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.2, delaySeconds = 0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delaySeconds);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delaySeconds);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySeconds + duration);
    osc.start(ctx.currentTime + delaySeconds);
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01);
  }

  private playClick() {
    this.playTone(440, 0.05, "sine", 0.12);
  }

  private playCorrect() {
    this.playTone(523, 0.12, "sine", 0.26, 0);
    this.playTone(659, 0.12, "sine", 0.26, 0.1);
    this.playTone(784, 0.18, "sine", 0.3, 0.2);
  }

  private playWrong() {
    this.playTone(220, 0.1, "square", 0.16, 0);
    this.playTone(165, 0.16, "square", 0.1, 0.12);
  }
}
