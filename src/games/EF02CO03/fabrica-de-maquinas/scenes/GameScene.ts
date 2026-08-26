import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../../shared/contracts/platformCommands";
import { LEVELS, shuffleStages } from "../data/levels";
import type { FactoryLevel, FactoryStage, FactoryStageId, ProductStage } from "../types";
import { createTutorial, TutorialStep } from "../../../../shared/tutorial/createTutorial";

const GAME_ID = "fabrica-de-maquinas";

const W = 1280;
const H = 720;

const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 42;
const MODAL_SCALE = 1.14;

/**
 * Card um pouco menor que o slot.
 * Isso dá respiro visual e evita a sensação de encaixe torto.
 */
const CARD_W = 200;
const CARD_H = 154;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  ink: 0x102a43,
  white: 0xffffff,
  cream: 0xfffbf1,
  card: 0xfff6e8,
  slate: 0x334155,
};

type CardRecord = {
  id: FactoryStageId;
  card: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
  homeX: number;
  homeY: number;
  slotIndex: number | null;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: FactoryLevel;
  private shuffledStages: FactoryStage[] = [];
  private cards = new Map<FactoryStageId, CardRecord>();
  private slots: Array<FactoryStageId | null> = [];
  private slotRects: Phaser.Geom.Rectangle[] = [];
  private slotCenters: Array<{ x: number; y: number }> = [];
  private productObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private selectedCard?: FactoryStageId;
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private hasStartedTimer = false;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Graphics;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;

    this.levelConfig = LEVELS.find((level) => level.level === lvl) ?? LEVELS[0];
    this.shuffledStages = shuffleStages(this.levelConfig.stages);

    this.cards = new Map();
    this.slots = Array.from({ length: this.levelConfig.solution.length }, () => null);
    this.slotRects = [];
    this.slotCenters = [];
    this.productObjects = [];
    this.overlayObjects = [];
    this.selectedCard = undefined;
    this.commandLocked = false;
    this.hits = 0;
    this.errors = 0;
    this.hasStartedTimer = false;

    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
  }

  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createInstructionBand();
    this.createConveyor();
    this.createStageCards();
    this.createProductPreview();
    this.createActionButtons();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();

    this.commandLocked = true;
    this.runTutorials(() => {
      this.commandLocked = false;
    });
  }

  private runTutorials(onDone: () => void) {
    const cardArea = { x: 640, y: 520, w: 1100, h: 180 };
    const slotArea = { x: 640, y: 290, w: 1100, h: 180 };
    const prodBtn = { x: 1032, y: 666, w: 380, h: 90 };

    const firstCard = this.shuffledStages[0];
    const cardRecord = this.cards.get(firstCard.id);
    const cardHomeX = cardRecord?.homeX ?? 170;
    const cardHomeY = cardRecord?.homeY ?? 528;
    const firstSlot = this.slotCenters[0] ?? { x: 166, y: 306 };

    const steps: TutorialStep[] = [
      {
        text: "Estas são as máquinas",
        shape: "rect",
        x: cardArea.x,
        y: cardArea.y,
        w: cardArea.w,
        h: cardArea.h,
        balloonY: 300,
      },
      {
        text: "A esteira mostra a sequência de produção. Coloque uma máquina em cada espaço.",
        shape: "rect",
        x: slotArea.x,
        y: slotArea.y,
        w: slotArea.w,
        h: slotArea.h,
        balloonY: 420,
        pointer: {
          fromX: cardHomeX,
          fromY: cardHomeY,
          toX: firstSlot.x,
          toY: firstSlot.y,
        },
      },
      {
        text: "Depois de preencher todos os espaços, toque aqui para iniciar a produção.",
        shape: "rect",
        x: prodBtn.x,
        y: prodBtn.y,
        w: prodBtn.w,
        h: prodBtn.h,
        balloonY: prodBtn.y - 90,
      },
    ];

    createTutorial(this, {
      key: "fabrica-de-maquinas-tutorial",
      steps,
      accent: COLORS.blue,
      safeTop: 120,
      once: true,
      onFinish: onDone,
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
    const bgKey = this.getBackgroundKey();

    if (this.textures.exists(bgKey)) {
      this.add.image(W / 2, H / 2, bgKey).setDisplaySize(W, H).setDepth(-100);
      this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0.2).setDepth(-99);
      this.add.rectangle(W / 2, H / 2, W, H, 0x0f172a, 0.08).setDepth(-98);
      return;
    }

    this.add.rectangle(W / 2, H / 2, W, H, 0xb8f1ff).setDepth(-100);
  }

  private getBackgroundKey() {
    return {
      1: "level-1-shirt-factory-bg",
      2: "level-2-plush-factory-bg",
      3: "level-3-backpack-factory-bg",
    }[this.levelConfig.level];
  }

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);

    track.fillStyle(COLORS.slate, 0.22);
    track.fillRoundedRect(W / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);

    track.lineStyle(3, COLORS.white, 0.86);
    track.strokeRoundedRect(W / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);

    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;

    const fillWidth = Math.max(0, width);

    this.timerBar.clear();

    if (fillWidth <= 0) return;

    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(W / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, fillWidth, 32, 16);

    this.timerBar.fillStyle(0xffffff, 0.22);
    this.timerBar.fillRoundedRect(W / 2 - TIMER_BAR_W / 2 + 10, TIMER_BAR_Y - 11, Math.max(0, fillWidth - 20), 8, 4);
  }

  private createHeader() {
    this.addSharpText(W / 2, 104, this.levelConfig.title, {
      fontSize: "42px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.addSharpText(W / 2, 150, this.getHeaderInstruction(), {
      fontSize: "21px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    const levelBadge = this.add.container(1086, 104).setDepth(30);
    const badgeBg = this.add.graphics();

    badgeBg.fillStyle(COLORS.white, 0.9);
    badgeBg.fillRoundedRect(-72, -23, 144, 46, 23);
    badgeBg.lineStyle(3, COLORS.blue, 0.82);
    badgeBg.strokeRoundedRect(-72, -23, 144, 46, 23);

    const badgeText = this.addSharpText(0, 0, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#1e3a8a",
    }).setOrigin(0.5);

    levelBadge.add([badgeBg, badgeText]);
  }

  private createInstructionBand() {
    // Mantido para compatibilidade.
  }

  private getHeaderInstruction() {
    return {
      1: "Organize as máquinas na ordem certa para fabricar uma camisa.",
      2: "Organize as máquinas na ordem certa para montar uma pelúcia.",
      3: "Organize as máquinas na ordem certa para fabricar uma mochila.",
    }[this.levelConfig.level];
  }

  private createConveyor() {
    this.drawPanel(52, 184, 1176, 204, COLORS.blue, 1);
    this.drawPanelHeader(640, 194, 420, "Sequência da produção", COLORS.blue);

    this.slotRects = [];
    this.slotCenters = [];

    const slotCount = this.levelConfig.solution.length;
    const slotStep = 224;
    const startX = 640 - ((slotCount - 1) * slotStep) / 2;
    const y = 306;

    this.levelConfig.solution.forEach((stageId, index) => {
      const x = startX + index * slotStep;
      const stageColor = this.levelConfig.stages.find((stage) => stage.id === stageId)?.color ?? COLORS.blue;

      this.slotCenters.push({ x, y });
      this.slotRects.push(new Phaser.Geom.Rectangle(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H));

      const slot = this.add.graphics().setDepth(4);
      slot.fillStyle(0xfffbf1, 0.46);
      slot.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
      slot.lineStyle(5, stageColor, 0.92);
      slot.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
      slot.lineStyle(2, 0xffffff, 0.88);
      slot.strokeRoundedRect(x - SLOT_W / 2 + 6, y - SLOT_H / 2 + 6, SLOT_W - 12, SLOT_H - 12, 18);

      this.addSharpText(x, y - 44, `${index + 1}`, {
        fontSize: "24px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(5);
    });

    for (let i = 0; i < slotCount - 1; i++) {
      const from = this.slotCenters[i];
      const to = this.slotCenters[i + 1];

      this.addSharpText((from.x + to.x) / 2, y, "→", {
        fontSize: "30px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(5);
    }
  }

  private drawSlot(x: number, y: number, index: number, color: number) {
    const shadow = this.add.graphics().setDepth(3);

    shadow.fillStyle(0x000000, 0.14);
    shadow.fillRoundedRect(x - SLOT_W / 2 + 6, y - SLOT_H / 2 + 9, SLOT_W, SLOT_H, 24);

    const slot = this.add.graphics().setDepth(4);

    slot.fillStyle(COLORS.white, 0.94);
    slot.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 24);

    slot.fillStyle(color, 0.12);
    slot.fillRoundedRect(x - SLOT_W / 2 + 10, y - SLOT_H / 2 + 10, SLOT_W - 20, SLOT_H - 20, 18);

    slot.lineStyle(5, color, 0.95);
    slot.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 24);

    slot.lineStyle(2, COLORS.white, 0.9);
    slot.strokeRoundedRect(x - SLOT_W / 2 + 7, y - SLOT_H / 2 + 7, SLOT_W - 14, SLOT_H - 14, 18);

    const disc = this.add.graphics().setDepth(6);
    disc.fillStyle(color, 1);
    disc.fillCircle(x, y - SLOT_H / 2 + 29, 22);
    disc.lineStyle(3, COLORS.white, 0.94);
    disc.strokeCircle(x, y - SLOT_H / 2 + 29, 22);

    this.addSharpText(x, y - SLOT_H / 2 + 29, `${index}`, {
      fontSize: "22px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(7);
  }

  private createStageCards() {
    this.drawPanel(52, 410, 1176, 204, COLORS.purple, 1);
    this.drawPanelHeader(640, 420, 420, "Máquinas embaralhadas", COLORS.purple);

    const cardCount = this.shuffledStages.length;
    const cardStep = 235;
    const startX = 640 - ((cardCount - 1) * cardStep) / 2;
    const y = 528;

    this.shuffledStages.forEach((stage, index) => {
      const x = startX + index * cardStep;
      const { card, hitbox } = this.createMachineCard(stage, x, y);

      this.cards.set(stage.id, {
        id: stage.id,
        card,
        hitbox,
        homeX: x,
        homeY: y,
        slotIndex: null,
      });
    });
  }

  private createProductPreview() {
    this.drawPanel(52, 628, 748, 76, COLORS.green, 1);
    this.drawProductStage(null);
  }

  private createActionButtons() {
    this.createUiButton(1032, 666, 360, 70, "Iniciar Produção", COLORS.green, () => this.executeProduction());
  }

  private createMachineCard(stage: FactoryStage, x: number, y: number) {
    const card = this.add.container(x, y).setDepth(20);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(-CARD_W / 2 + 6, -CARD_H / 2 + 8, CARD_W, CARD_H, 22);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.card, 1);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 22);

    bg.fillStyle(stage.color ?? COLORS.blue, 0.1);
    bg.fillRoundedRect(-CARD_W / 2 + 10, -CARD_H / 2 + 10, CARD_W - 20, CARD_H - 20, 16);

    bg.lineStyle(4, COLORS.white, 0.9);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 22);

    const stageAssetKey = this.getStageAssetKey(stage.id);

    const icon = this.textures.exists(stageAssetKey)
      ? this.fitImage(this.add.image(0, -14, stageAssetKey), 176, 106)
      : this.addSharpText(0, -14, stage.icon, {
        fontSize: "24px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
      }).setOrigin(0.5);

    const label = this.addSharpText(0, 53, stage.shortLabel, {
      fontSize: stage.shortLabel.length > 15 ? "13px" : "15px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#334155",
      stroke: "#ffffff",
      strokeThickness: 2,
      align: "center",
      wordWrap: { width: 170 },
    }).setOrigin(0.5);

    card.add([shadow, bg, icon, label]);
    card.setSize(CARD_W, CARD_H);

    const hitbox = this.add.zone(x, y, CARD_W + 24, CARD_H + 20).setDepth(80);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });

    hitbox.on("pointerdown", () => {
      if (this.commandLocked) return;

      this.selectedCard = stage.id;
      this.startTimerOnce();
      this.highlightSelectedCard(stage.id);
    });

    this.input.setDraggable(hitbox);

    hitbox.on("dragstart", () => {
      if (this.commandLocked) return;

      this.selectedCard = stage.id;
      this.startTimerOnce();
      this.removeFromSlot(stage.id);

      card.setDepth(60);
      hitbox.setDepth(90);

      this.tweens.killTweensOf([card, hitbox]);
      this.tweens.add({
        targets: card,
        scale: 1.06,
        angle: -2,
        duration: 120,
        ease: "Back.easeOut",
      });

      this.highlightSelectedCard(stage.id);
    });

    hitbox.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.commandLocked) return;

      const record = this.cards.get(stage.id);
      if (!record) return;

      this.moveCardRecord(record, dragX, dragY);
    });

    hitbox.on("dragend", () => {
      if (this.commandLocked) return;

      const record = this.cards.get(stage.id);
      if (!record) return;

      /**
       * Correção principal:
       * usa o centro real do card, não a posição do ponteiro.
       */
      this.dropCard(stage.id, record.card.x, record.card.y);

      card.setDepth(20);
      hitbox.setDepth(80);
    });

    return { card, hitbox };
  }

  private dropCard(id: FactoryStageId, cardX: number, cardY: number) {
    const targetIndex = this.slotRects.findIndex((rect) => rect.contains(cardX, cardY));

    if (targetIndex < 0) {
      this.returnCardHome(id);
      return;
    }

    this.placeCardInSlot(id, targetIndex);
  }

  private moveCardRecord(record: CardRecord, x: number, y: number) {
    record.card.setPosition(x, y);
    record.hitbox.setPosition(x, y);
  }

  private tweenCardRecord(record: CardRecord, x: number, y: number, duration = 150) {
    this.tweens.killTweensOf([record.card, record.hitbox]);

    this.tweens.add({
      targets: [record.card, record.hitbox],
      x,
      y,
      duration,
      ease: "Sine.easeOut",
    });
  }

  private placeCardInSlot(id: FactoryStageId, slotIndex: number) {
    const cardRecord = this.cards.get(id);
    if (!cardRecord) return;

    const previousInSlot = this.slots[slotIndex];

    if (previousInSlot && previousInSlot !== id) {
      this.returnCardHome(previousInSlot);
    }

    this.removeFromSlot(id);

    this.slots[slotIndex] = id;
    cardRecord.slotIndex = slotIndex;

    const center = this.slotCenters[slotIndex];

    cardRecord.card.setScale(1);
    cardRecord.card.setAngle(0);

    this.tweenCardRecord(cardRecord, center.x, center.y, 140);
    this.playClick();
    this.emitProgress();
  }

  private removeFromSlot(id: FactoryStageId) {
    const record = this.cards.get(id);

    if (record?.slotIndex !== null && record?.slotIndex !== undefined) {
      this.slots[record.slotIndex] = null;
      record.slotIndex = null;
    }
  }

  private returnCardHome(id: FactoryStageId) {
    const record = this.cards.get(id);
    if (!record) return;

    this.removeFromSlot(id);

    record.card.setScale(1);
    record.card.setAngle(0);

    this.tweenCardRecord(record, record.homeX, record.homeY, 160);
    this.emitProgress();
  }

  private highlightSelectedCard(id: FactoryStageId) {
    this.cards.forEach((record) => {
      record.card.setAlpha(record.id === id ? 1 : 0.88);
    });
  }

  private undoLast() {
    if (this.commandLocked) return;

    const lastIndex = [...this.slots].map(Boolean).lastIndexOf(true);
    if (lastIndex < 0) return;

    const id = this.slots[lastIndex];
    if (!id) return;

    this.playClick();
    this.returnCardHome(id);
  }

  private clearLine() {
    if (this.commandLocked) return;

    this.playClick();

    this.slots.forEach((id) => {
      if (id) this.returnCardHome(id);
    });

    this.drawProductStage(null);
  }

  private async executeProduction() {
    if (this.commandLocked) return;

    this.playClick();
    this.startTimerOnce();

    if (this.slots.some((slot) => !slot)) {
      this.playWrong();
      this.showToast("Preencha todos os espaços da esteira antes de iniciar.", COLORS.orange);
      return;
    }

    this.commandLocked = true;

    const wrongIndex = this.levelConfig.solution.findIndex((expected, index) => this.slots[index] !== expected);

    if (wrongIndex >= 0) {
      this.errors += 1;
      this.playWrong();

      await this.flashSlot(wrongIndex, COLORS.red);

      this.showToast(`A esteira parou na etapa ${wrongIndex + 1}. ${this.levelConfig.hint}`, COLORS.red);

      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });

      this.commandLocked = false;
      this.emitProgress();
      return;
    }

    for (let i = 0; i < this.levelConfig.solution.length; i++) {
      await this.animateProductThroughStep(i);
    }

    this.hits += 1;
    this.playCorrect();

    runtimeGameBridge.emit({
      type: "CORRECT_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: 10,
    });

    this.emitProgress();

    await this.showFinalProductReveal();
    this.handleLevelSuccess();
  }

  private animateProductThroughStep(index: number) {
    return new Promise<void>((resolve) => {
      const center = this.slotCenters[index];
      const stage = this.levelConfig.productStages[index];
      const product = this.createProductToken(stage, center.x, center.y - 80, 0.9).setDepth(70);

      this.drawProductStage(stage);
      this.flashSlot(index, COLORS.green);

      this.tweens.add({
        targets: product,
        y: center.y + 4,
        scale: 1,
        duration: 260,
        ease: "Back.easeOut",
        yoyo: true,
        hold: 160,
        onComplete: () => {
          product.destroy();
          resolve();
        },
      });
    });
  }

  private createProductToken(stage: ProductStage, x: number, y: number, scale = 1) {
    const container = this.add.container(x, y).setScale(scale);

    if (stage.assetKey && this.textures.exists(stage.assetKey)) {
      const glow = this.add.graphics();

      glow.fillStyle(0xffffff, 0.82);
      glow.fillRoundedRect(-42, -34, 84, 68, 18);
      glow.lineStyle(4, stage.color, 0.72);
      glow.strokeRoundedRect(-42, -34, 84, 68, 18);

      const image = this.fitImage(this.add.image(0, 0, stage.assetKey), 82, 66);

      container.add([glow, image]);
      return container;
    }

    const bg = this.add.graphics();

    bg.fillStyle(stage.color, 1);
    bg.fillRoundedRect(-34, -28, 68, 56, 16);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-34, -28, 68, 56, 16);

    const tokenText = stage.icon === "?" ? "?" : "✅";
    const text = this.addSharpText(0, 0, tokenText, {
      fontSize: tokenText === "?" ? "24px" : "28px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);

    container.add([bg, text]);
    return container;
  }

  private getStageAssetKey(stageId: FactoryStageId) {
    return {
      "shirt-separate": "machine-shirt-fabric",
      "shirt-cut": "machine-shirt-cut",
      "shirt-sew": "machine-shirt-sew",
      "shirt-buttons": "machine-shirt-buttons",
      "shirt-iron": "machine-shirt-iron",

      "plush-separate": "machine-plush-fabric",
      "plush-cut": "machine-plush-cut",
      "plush-sew": "machine-plush-sew",
      "plush-fill": "machine-plush-fill",
      "plush-details": "machine-plush-details",

      "backpack-separate": "machine-backpack-fabric",
      "backpack-cut": "machine-backpack-cut",
      "backpack-sew": "machine-backpack-sew",
      "backpack-straps": "machine-backpack-straps",
      "backpack-zipper": "machine-backpack-zipper",
    }[stageId];
  }

  private drawProductStage(stage: ProductStage | null) {
    this.productObjects.forEach((object) => object.destroy());
    this.productObjects = [];

    const current = stage ?? {
      label: "Aguardando produção",
      icon: "?",
      color: 0x64748b,
    };

    const token = this.createProductToken(current, 166, 666, 0.9).setDepth(12);

    const label = this.addSharpText(
      462,
      672,
      stage ? current.label : `${this.levelConfig.productName}: aguardando produção`,
      {
        fontSize: "19px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 560 },
      },
    ).setOrigin(0.5).setDepth(12);

    this.productObjects.push(token, label);
  }

  private flashSlot(index: number, color: number) {
    return new Promise<void>((resolve) => {
      const center = this.slotCenters[index];
      const glow = this.add.graphics().setDepth(80);

      glow.lineStyle(7, color, 1);
      glow.strokeRoundedRect(center.x - SLOT_W / 2, center.y - SLOT_H / 2, SLOT_W, SLOT_H, 24);

      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 420,
        onComplete: () => {
          glow.destroy();
          resolve();
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

      this.showLevelCompleteTransition(nextLevel as 1 | 2 | 3);
      return;
    }

    runtimeGameBridge.emit({
      type: "GAME_COMPLETED",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    });

    this.showGameCompleteScreen();
  }

  private showFinalProductReveal() {
    return new Promise<void>((resolve) => {
      const finalStage = this.levelConfig.productStages[this.levelConfig.productStages.length - 1];

      const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.34).setDepth(300);

      const glow = this.add.graphics().setDepth(301);
      glow.fillStyle(0xffffff, 0.84);
      glow.fillRoundedRect(440, 196, 400, 328, 34);
      glow.lineStyle(6, 0xffffff, 0.95);
      glow.strokeRoundedRect(440, 196, 400, 328, 34);

      const product = this.createProductToken(finalStage, 640, 326, 2.25).setDepth(302);

      const label = this.addSharpText(640, 470, finalStage.label, {
        fontSize: "26px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#1e3a8a",
        stroke: "#ffffff",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 340 },
      }).setOrigin(0.5).setDepth(302);

      const targets = [overlay, glow, product, label];

      targets.forEach((target) => target.setAlpha(0));

      this.tweens.add({
        targets,
        alpha: 1,
        duration: 220,
        ease: "Sine.easeOut",
        onComplete: () => {
          this.time.delayedCall(900, () => {
            this.tweens.add({
              targets,
              alpha: 0,
              duration: 220,
              ease: "Sine.easeIn",
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

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450),
    );
    overlay.setInteractive();

    const modal = this.createModalBase(640, 360, COLORS.orange);

    const badgeIcon = this.add.image(0, -114, "success-badge");
    this.fitImage(badgeIcon, 82, 82);

    const title = this.addSharpText(0, -58, "Parabéns!", this.modalTitleStyle()).setOrigin(0.5);

    const score = this.addSharpText(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#7c3aed",
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 48, this.levelConfig.successMessage, {
      fontSize: "20px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#334155",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);

    const waitText = this.addSharpText(0, 122, "Preparando a próxima produção...", {
      fontSize: "15px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#25327a",
    }).setOrigin(0.5);

    modal.add([badgeIcon, title, score, detail, waitText]);

    this.animateModal(modal);

    this.time.delayedCall(1800, () => this.showNextLevelStartTransition(nextLevel));
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();

    const nextConfig = LEVELS.find((item) => item.level === nextLevel);

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450),
    );
    overlay.setInteractive();

    const modal = this.createModalBase(640, 360, COLORS.green);

    const title = this.addSharpText(0, -102, `Nível ${nextLevel}`, this.modalTitleStyle()).setOrigin(0.5);

    const objective = this.addSharpText(0, -42, nextConfig?.title ?? "Nova produção", {
      fontSize: "24px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 14, nextConfig?.objective ?? "Organize as máquinas.", {
      fontSize: "16px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#334155",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5);

    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);

    const buttonHitbox = this.addOverlayObject(
      this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452),
    );

    buttonHitbox.setInteractive({ useHandCursor: true });

    buttonHitbox.on("pointerover", () => {
      this.tweens.add({
        targets: button,
        scale: 1.04,
        duration: 90,
        ease: "Sine.easeOut",
      });
    });

    buttonHitbox.on("pointerout", () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 90,
        ease: "Sine.easeOut",
      });
    });

    buttonHitbox.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: nextLevel });
    });

    modal.add([title, objective, detail, button]);

    this.animateModal(modal);
  }

  private showGameCompleteScreen() {
    this.clearOverlay();

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.62).setDepth(450),
    );
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

    const title = this.addSharpText(0, -128, "Fábrica organizada!", {
      fontSize: "38px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.addSharpText(
      0,
      -78,
      `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`,
      {
        fontSize: "18px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        align: "center",
        wordWrap: { width: 500 },
      },
    ).setOrigin(0.5);

    const message = this.addSharpText(0, -28, "Você organizou todas as máquinas da fábrica.", {
      fontSize: "20px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 460 },
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
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#25327a",
        strokeThickness: 4,
      }).setOrigin(0.5);

      const label = this.addSharpText(0, 23, "concluído", {
        fontSize: "12px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
      }).setOrigin(0.5);

      item.add([badgeBg, number, label]);

      return item;
    });

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

    const playAgain = this.createFinalButton(-158, 138, "Jogar novamente", COLORS.green, () => {
      this.scene.restart({ level: 1 });
    });

    const exit = this.createFinalButton(158, 138, "Voltar aos jogos", COLORS.orange, () => {
      EventBus.emit("exit-game");
    });

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, message, ...levelLabels, playAgain, exit]);

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
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
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

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });
  }

  private modalTitleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: "38px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
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
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);

    button.add([bg, text]);

    const hitbox = this.addOverlayObject(
      this.add.zone(640 + x * MODAL_SCALE, 360 + y * MODAL_SCALE, 310 * MODAL_SCALE, 86 * MODAL_SCALE).setDepth(452),
    );

    hitbox.setInteractive({ useHandCursor: true });

    hitbox.on("pointerover", () => {
      this.tweens.add({
        targets: button,
        scale: 1.04,
        duration: 90,
        ease: "Sine.easeOut",
      });
    });

    hitbox.on("pointerout", () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 90,
        ease: "Sine.easeOut",
      });
    });

    hitbox.on("pointerdown", () => {
      this.playClick();
      onClick();
    });

    return button;
  }

  private createUiButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void,
  ) {
    const button = this.add.container(x, y).setDepth(12);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 7, width, height, height / 2);

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    bg.lineStyle(4, COLORS.white, 0.95);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);

    bg.fillStyle(COLORS.white, 0.2);
    bg.fillRoundedRect(-width / 2 + 16, -height / 2 + 8, width - 32, 12, 6);

    const text = this.addSharpText(0, 0, label, {
      fontSize: width > 260 ? "22px" : "16px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5);

    button.add([shadow, bg, text]);

    const zone = this.add.zone(x, y, width + 12, height + 12).setDepth(40);
    zone.setInteractive({ useHandCursor: true });

    zone.on("pointerover", () => {
      if (this.commandLocked) return;
      this.tweens.add({
        targets: button,
        scale: 1.04,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    zone.on("pointerout", () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    zone.on("pointerdown", onClick);

    return button;
  }

  private drawPanel(x: number, y: number, width: number, height: number, accentColor: number, depth: number) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(x + 10, y + 12, width, height, 32);
    shadow.setDepth(depth);

    const panel = this.add.graphics();

    panel.fillStyle(0xffffff, 0.52);
    panel.fillRoundedRect(x, y, width, height, 32);

    panel.fillStyle(accentColor, 0.08);
    panel.fillRoundedRect(x + 12, y + 12, width - 24, height - 24, 24);

    panel.lineStyle(5, 0xffffff, 0.9);
    panel.strokeRoundedRect(x, y, width, height, 32);

    panel.lineStyle(2, 0xffffff, 0.54);
    panel.strokeRoundedRect(x + 7, y + 7, width - 14, height - 14, 26);

    panel.setDepth(depth + 0.1);

    return panel;
  }

  private drawPanelHeader(x: number, y: number, width: number, label: string, color: number) {
    const container = this.add.container(x, y).setDepth(11);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(-width / 2 + 4, -18 + 5, width, 36, 18);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -18, width, 36, 18);
    bg.lineStyle(3, 0xffffff, 0.9);
    bg.strokeRoundedRect(-width / 2, -18, width, 36, 18);

    const text = this.addSharpText(0, 0, label, {
      fontSize: "18px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);

    container.add([shadow, bg, text]);

    return container;
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
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
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

        runtimeGameBridge.emit({
          type: "GAME_OVER",
          gameId: GAME_ID,
          stage: this.levelConfig.level,
        });

        this.showToast("Tempo esgotado. Tente organizar a esteira de novo.", COLORS.red);
      },
    });
  }

  private emitProgress() {
    const filled = this.slots.filter(Boolean).length;
    const progress = filled ? Math.min(95, Math.round((filled / this.levelConfig.solution.length) * 100)) : 0;

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

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((command: PlatformCommand) => {
      if (command.type !== "START_GAME") return;
      if (command.gameId !== GAME_ID) return;
      if (command.stage === this.levelConfig.level) return;

      this.scene.restart({ level: command.stage as 1 | 2 | 3 });
    });
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const texture = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = texture.width || maxWidth;
    const sourceHeight = texture.height || maxHeight;
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);

    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);

    return image;
  }

  private addSharpText(x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) {
    const normalizedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontStyle: "bold",
      ...style,
    };

    const textObject = this.add.text(x, y, text, normalizedStyle);
    textObject.setResolution(2);

    return textObject;
  }

  private getAudioContext(): AudioContext | null {
    if (!("context" in this.sound)) return null;

    return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.2,
    delaySeconds = 0,
  ) {
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