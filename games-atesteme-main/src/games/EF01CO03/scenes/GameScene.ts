import * as Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { AlgorithmCard, AlgorithmLevel } from "../types";

interface CardSprite extends Phaser.GameObjects.Container {
  cardData: AlgorithmCard;
  originX_: number;
  originY_: number;
}

const GAME_ID = "oficina-dos-algoritmos";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;

export class GameScene extends Phaser.Scene {
  private levelConfig!: AlgorithmLevel;
  private cardSprites: CardSprite[] = [];
  private slots: Phaser.GameObjects.Rectangle[] = [];
  private placedCards: Array<CardSprite | null> = [];

  private hits = 0;
  private errors = 0;
  private scoredCorrectCards = new Set<string>();

  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;

  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === lvl) ?? LEVELS[0];

    this.cardSprites = [];
    this.slots = [];
    this.placedCards = [];
    this.hits = 0;
    this.errors = 0;
    this.scoredCorrectCards = new Set<string>();
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createTimerBar();
    this.createSlots();
    this.createCards();
    this.createTestButton();
    this.setupDrag();
    this.registerPlatformCommands();
    this.startTimer();

    EventBus.emit("algorithm-level-ready", {
      levelConfig: this.levelConfig,
    });

    runtimeGameBridge.emit({
      type: "GAME_READY",
      gameId: GAME_ID,
    });

    this.emitProgress();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;

    const remaining = this.timerEvent.getRemaining();
    const total = (this.levelConfig.timeLimit ?? 60) * 1000;
    const pct = Math.max(0, remaining / total);

    this.timerBar.setSize(TIMER_BAR_W * pct, 20);

    if (pct > 0.5) this.timerBar.setFillStyle(0x22c55e);
    else if (pct > 0.25) this.timerBar.setFillStyle(0xf59e0b);
    else this.timerBar.setFillStyle(0xef4444);
  }

  shutdown() {
    this.timerEvent?.destroy();

    if (this.unsubscribePlatformCommands) {
      this.unsubscribePlatformCommands();
      this.unsubscribePlatformCommands = undefined;
    }
  }

  private createBackground() {
    this.add.rectangle(640, 360, 1280, 720, 0xf3e8ff);
    this.add.rectangle(640, 180, 1280, 360, 0xdbeafe, 0.55);
    this.add.rectangle(640, 520, 1280, 380, 0xfef3c7, 0.55);

    const colors = [0xc4b5fd, 0x93c5fd, 0xf9a8d4, 0xfcd34d, 0x86efac];

    for (let i = 0; i < 14; i++) {
      const circle = this.add.circle(
        Phaser.Math.Between(40, 1240),
        Phaser.Math.Between(85, 680),
        Phaser.Math.Between(20, 56),
        Phaser.Utils.Array.GetRandom(colors),
        0.22
      );

      this.tweens.add({
        targets: circle,
        y: circle.y + Phaser.Math.Between(-16, 16),
        x: circle.x + Phaser.Math.Between(-10, 10),
        duration: 2200 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    this.add
      .rectangle(640, 385, 1110, 465, 0xffffff, 0.42)
      .setStrokeStyle(3, 0xffffff, 0.6);
  }

  private createTitle() {
    this.add
      .text(640, 130, this.levelConfig.title, {
        fontSize: "42px",
        fontFamily: "Arial Black, Arial",
        color: "#5b21b6",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 175, "Arraste os cartões na ordem correta e teste seu algoritmo.", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#334155",
      })
      .setOrigin(0.5);
  }

  private createTimerBar() {
    this.add
      .rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 28, 0x334155, 0.4)
      .setStrokeStyle(2, 0x64748b)
      .setDepth(5);

    this.timerBar = this.add
      .rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 20, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(6);

    this.add
      .text(640, TIMER_BAR_Y - 25, "Tempo", {
        fontSize: "16px",
        fontFamily: "Arial Black, Arial",
        color: "#334155",
        stroke: "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(7);
  }

  private startTimer() {
    this.timerEvent?.destroy();

    this.timerEvent = this.time.addEvent({
      delay: (this.levelConfig.timeLimit ?? 60) * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
    });
  }

  private onTimeUp() {
    this.input.enabled = false;
    this.timerEvent?.destroy();

    this.playWrong();
    this.showFloatingMessage("Tempo esgotado!", 0xef4444);

    runtimeGameBridge.emit({
      type: "GAME_OVER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    });
  }

  private createSlots() {
    const total = this.levelConfig.correctOrder.length;

    const slotW = total > 5 ? 120 : 150;
    const gap = total > 5 ? 10 : 18;
    const slotH = 110;

    const totalWidth = total * slotW + (total - 1) * gap;
    const startX = 640 - totalWidth / 2 + slotW / 2;

    this.placedCards = Array(total).fill(null);

    this.add
      .rectangle(640, 345, totalWidth + 95, 185, 0xffffff, 0.7)
      .setStrokeStyle(3, 0xc4b5fd);

    this.add
      .text(640, 260, "Sequência", {
        fontSize: "21px",
        fontFamily: "Arial Black, Arial",
        color: "#7c3aed",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    for (let i = 0; i < total; i++) {
      const x = startX + i * (slotW + gap);
      const y = 355;

      const slot = this.add
        .rectangle(x, y, slotW, slotH, 0xffffff, 0.96)
        .setStrokeStyle(5, 0x8b5cf6);

      this.add
        .text(x, y - 68, `${i + 1}`, {
          fontSize: "18px",
          fontFamily: "Arial Black, Arial",
          backgroundColor: "#8b5cf6",
          color: "#ffffff",
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(20);

      slot.setData("slotIndex", i);
      this.slots.push(slot);
    }
  }

  private createCards() {
    const cards = Phaser.Utils.Array.Shuffle([
      ...this.levelConfig.cards,
      ...(this.levelConfig.distractors ?? []),
    ]);

    this.add
      .rectangle(640, 565, 1100, 150, 0xfef3c7, 0.95)
      .setStrokeStyle(4, 0xf59e0b);

    const cardW = cards.length > 6 ? 120 : 150;
    const gap = cards.length > 6 ? 10 : 18;

    const totalWidth = cards.length * cardW + (cards.length - 1) * gap;
    const startX = 640 - totalWidth / 2 + cardW / 2;

    cards.forEach((card, index) => {
      const x = startX + index * (cardW + gap);
      const y = 565;

      const sprite = this.createCard(card, x, y);

      if (cards.length > 6) {
        sprite.setScale(0.9);
      }

      this.cardSprites.push(sprite);
    });
  }

  private createCard(card: AlgorithmCard, x: number, y: number): CardSprite {
    const shadow = this.add.rectangle(4, 5, 150, 110, 0x000000, 0.12);

    const bg = this.add
      .rectangle(0, 0, 150, 110, 0xffffff, 1)
      .setStrokeStyle(4, this.getCardColor(card.type));

    const emoji = this.add
      .text(0, -22, card.emoji, {
        fontSize: "32px",
      })
      .setOrigin(0.5);

    const label = this.add
      .text(0, 26, card.label, {
        fontSize: "14px",
        fontFamily: "Arial Black, Arial",
        color: "#1e293b",
        align: "center",
        wordWrap: { width: 120 },
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [shadow, bg, emoji, label]) as CardSprite;

    container.cardData = card;
    container.originX_ = x;
    container.originY_ = y;
    container.setSize(150, 110);
    container.setInteractive({ draggable: true, useHandCursor: true });

    this.input.setDraggable(container);

    return container;
  }

  private createTestButton() {
    const button = this.add
      .rectangle(640, 470, 320, 58, 0x7b2ff7, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(640, 470, "Testar algoritmo", {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => {
      this.playClick();
      this.testAlgorithm();
    });

    button.on("pointerover", () => button.setFillStyle(0x9d4edd));
    button.on("pointerout", () => button.setFillStyle(0x7b2ff7));

    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", () => {
      this.playClick();
      this.testAlgorithm();
    });
  }

  private setupDrag() {
    this.input.on("dragstart", (_: Phaser.Input.Pointer, obj: CardSprite) => {
      obj.setDepth(30);
      this.playClick();

      this.tweens.add({
        targets: obj,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 120,
      });
    });

    this.input.on(
      "drag",
      (_: Phaser.Input.Pointer, obj: CardSprite, dragX: number, dragY: number) => {
        obj.setPosition(dragX, dragY);
      }
    );

    this.input.on("dragend", (_: Phaser.Input.Pointer, obj: CardSprite) => {
      obj.setDepth(0);

      const slotIndex = this.findNearestSlotIndex(obj.x, obj.y);

      if (slotIndex === null) {
        this.returnCard(obj);
        return;
      }

      this.placeCardInSlot(obj, slotIndex);
    });
  }

  private findNearestSlotIndex(x: number, y: number): number | null {
    for (const slot of this.slots) {
      if (Phaser.Geom.Rectangle.Contains(slot.getBounds(), x, y)) {
        return slot.getData("slotIndex") as number;
      }
    }

    return null;
  }

  private placeCardInSlot(card: CardSprite, slotIndex: number) {
    const oldSlotIndex = this.placedCards.findIndex((item) => item === card);

    if (oldSlotIndex >= 0) {
      this.placedCards[oldSlotIndex] = null;
    }

    const currentCard = this.placedCards[slotIndex];

    if (currentCard && currentCard !== card) {
      this.returnCard(currentCard);
    }

    const slot = this.slots[slotIndex];

    this.placedCards[slotIndex] = card;

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 220,
      ease: "Back.Out",
      onComplete: () => {
        this.emitProgress();
      },
    });
  }

  private returnCard(card: CardSprite) {
    const oldSlotIndex = this.placedCards.findIndex((item) => item === card);

    if (oldSlotIndex >= 0) {
      this.placedCards[oldSlotIndex] = null;
    }

    this.tweens.add({
      targets: card,
      x: card.originX_,
      y: card.originY_,
      scaleX: 1,
      scaleY: 1,
      duration: 260,
      ease: "Back.Out",
    });

    this.emitProgress();
  }

  private testAlgorithm() {
    const selectedOrder = this.placedCards.map(
      (card) => card?.cardData.id ?? null
    );

    if (selectedOrder.some((id) => id === null)) {
      this.playWrong();
      this.showFloatingMessage("Complete todos os passos primeiro", 0xf59e0b);
      return;
    }

    const isCorrect = selectedOrder.every(
      (id, index) => id === this.levelConfig.correctOrder[index]
    );

    if (isCorrect) {
      this.hits += 1;
      this.playCorrect();

      runtimeGameBridge.emit({
        type: "CORRECT_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: 5,
      });

      this.handleSuccess();
      return;
    }

    this.errors += 1;
    this.playWrong();

    runtimeGameBridge.emit({
      type: "WRONG_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: -5,
    });

    this.showFloatingMessage("Sequência incorreta! Você perdeu uma vida.", 0xef4444);
    this.emitProgress();
  }

  private handleSuccess() {
    this.playWin();
    this.showSuccessAnimation();
    this.emitProgress();
    this.timerEvent?.remove(false);

    const nextLevel = this.levelConfig.level + 1;

    if (nextLevel <= 3) {
      runtimeGameBridge.emit({
        type: "CHECKPOINT",
        gameId: GAME_ID,
        stage: nextLevel,
        progress: 0,
        score: this.hits * 5 - this.errors * 5,
        hits: this.hits,
        errors: this.errors,
      });

      this.time.delayedCall(1500, () => {
        this.scene.restart({ level: nextLevel });
      });

      return;
    }

    this.time.delayedCall(1500, () => {
      runtimeGameBridge.emit({
        type: "GAME_COMPLETED",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      });

      this.input.enabled = false;
    });
  }

  private handleFailure(wrongIndex: number) {
    const slot = this.slots[wrongIndex];

    this.playWrong();
    slot.setStrokeStyle(7, 0xef4444);

    this.time.delayedCall(700, () => {
      slot.setStrokeStyle(5, 0x8b5cf6);
    });

    this.showFloatingMessage(`Revise o passo ${wrongIndex + 1}`, 0xef4444);
    this.emitProgress();
  }

  private showSlotCorrect(slot: Phaser.GameObjects.Rectangle) {
    slot.setStrokeStyle(6, 0x22c55e);

    const check = this.add
      .text(slot.x, slot.y - 5, "✓", {
        fontSize: "48px",
        fontFamily: "Arial Black, Arial",
        color: "#22c55e",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: check,
      y: check.y - 35,
      alpha: 0,
      duration: 650,
      ease: "Power2",
      onComplete: () => check.destroy(),
    });

    this.time.delayedCall(500, () => {
      slot.setStrokeStyle(5, 0x8b5cf6);
    });
  }

  private showSlotWrong(slot: Phaser.GameObjects.Rectangle) {
    const originalX = slot.x;

    slot.setStrokeStyle(6, 0xef4444);

    const wrong = this.add
      .text(slot.x, slot.y - 5, "!", {
        fontSize: "44px",
        fontFamily: "Arial Black, Arial",
        color: "#ef4444",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: slot,
      x: { from: originalX - 8, to: originalX + 8 },
      duration: 60,
      yoyo: true,
      repeat: 4,
      onComplete: () => slot.setX(originalX),
    });

    this.tweens.add({
      targets: wrong,
      y: wrong.y - 30,
      alpha: 0,
      duration: 650,
      ease: "Power2",
      onComplete: () => wrong.destroy(),
    });

    this.time.delayedCall(600, () => {
      slot.setStrokeStyle(5, 0x8b5cf6);
    });
  }

  private showSuccessAnimation() {
    this.showFloatingMessage("Algoritmo completo!", 0x22c55e);

    const emojis = ["⭐", "✨", "🌟"];

    for (let i = 0; i < 18; i++) {
      const star = this.add
        .text(640, 330, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(24, 42)}px`,
        })
        .setOrigin(0.5)
        .setDepth(90);

      this.tweens.add({
        targets: star,
        x: 640 + Phaser.Math.Between(-360, 360),
        y: 330 + Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(700, 1200),
        onComplete: () => star.destroy(),
      });
    }
  }

  private showFloatingMessage(message: string, color: number) {
    const bgColor = Phaser.Display.Color.IntegerToColor(color).rgba;

    const text = this.add
      .text(640, 225, message, {
        fontSize: "32px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        backgroundColor: bgColor,
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: text,
      y: 200,
      alpha: 0,
      delay: 900,
      duration: 450,
      onComplete: () => text.destroy(),
    });
  }

  private emitProgress() {
    const total = this.levelConfig.correctOrder.length;
    const filled = this.placedCards.filter(Boolean).length;
    const progress = Math.round((filled / total) * 100);

    EventBus.emit("algorithm-progress", {
      progress,
      hits: this.hits,
      errors: this.errors,
    });

    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      progress,
      score: this.hits * 5 - this.errors * 5,
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    });
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand(
      (command: PlatformCommand) => {
        if (command.type !== "START_GAME") return;
        if (command.gameId !== GAME_ID) return;
        if (command.stage === this.levelConfig.level) return;

        this.time.delayedCall(100, () => {
          this.scene.restart({
            level: command.stage as 1 | 2 | 3,
          });
        });
      }
    );
  }

  private getAudioContext(): AudioContext | null {
    if (!("context" in this.sound)) return null;
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.25,
    delaySeconds = 0
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

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + delaySeconds + duration
    );

    osc.start(ctx.currentTime + delaySeconds);
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01);
  }

  private playClick() {
    this.playTone(440, 0.05, "sine", 0.12);
  }

  private playCorrect() {
    this.playTone(523, 0.12, "sine", 0.28, 0);
    this.playTone(659, 0.12, "sine", 0.28, 0.1);
    this.playTone(784, 0.2, "sine", 0.32, 0.2);
  }

  private playWrong() {
    this.playTone(220, 0.1, "square", 0.18, 0);
    this.playTone(196, 0.1, "square", 0.14, 0.1);
    this.playTone(165, 0.18, "square", 0.1, 0.2);
  }

  private playWin() {
    [262, 330, 392, 523].forEach((freq, index) => {
      this.playTone(freq, 0.2, "sine", 0.3, index * 0.13);
    });
  }

  private getCardColor(type: string): number {
    const map: Record<string, number> = {
      start: 0x22c55e,
      prepare: 0x38bdf8,
      build: 0xfacc15,
      test: 0xfb923c,
      finish: 0xa855f7,
    };

    return map[type] ?? 0x8b5cf6;
  }
}
