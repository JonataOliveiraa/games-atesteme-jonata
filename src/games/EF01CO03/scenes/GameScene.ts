import Phaser from 'phaser';

import { gameBridge } from '../../../shared/bridge/gameBridge';
import type { PlatformCommand } from '../../../shared/contracts/platformCommands';
import { LEVELS } from '../data/levels';
import type { AlgorithmCard, AlgorithmLevel } from '../types';

type AlgorithmStep = AlgorithmCard & {
  correctOrder: number | null;
};

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const GAME_ID = 'oficina-dos-algoritmos';

const COLORS = {
  orange: 0xf57c00,
  blue: 0x45c6f0,
  green: 0x42d640,
  softOrange: 0xff8a2a,
  cream: 0xfff6e8,
  cyan: 0x35c5df,
};

export class GameScene extends Phaser.Scene {
  private sequenceSlots: Phaser.GameObjects.Container[] = [];
  private placedOrder: Array<number | null> = [];
  private testButton?: Phaser.GameObjects.Container;
  private testButtonBg?: Phaser.GameObjects.Graphics;
  private testButtonText?: Phaser.GameObjects.Text;
  private isTestButtonEnabled = false;
  private currentLevel: AlgorithmLevel = LEVELS[0];
  private steps: AlgorithmStep[] = [];
  private currentPoints = 0;
  private currentLives = 0;
  private hits = 0;
  private errors = 0;
  private hasCompletedLevel = false;
  private unsubscribePlatformCommands?: () => void;
  private audioContext?: AudioContext;

  private timeBarFill?: Phaser.GameObjects.Graphics;
  private timerTween?: Phaser.Tweens.Tween;
  private timerState = { progress: 1 };
  private hasStartedTimer = false;
  private timerDuration = 30000;

  constructor() {
    super('GameScene');
  }

  init(data?: { level?: number; points?: number; lives?: number }) {
    const requestedLevel = data?.level ?? 1;
    this.currentLevel = LEVELS.find((level) => level.level === requestedLevel) ?? LEVELS[0];
    this.currentPoints = data?.points ?? this.currentPoints;
    this.currentLives = data?.lives ?? this.currentLives;
    this.hits = 0;
    this.errors = 0;
    this.hasCompletedLevel = false;
    this.hasStartedTimer = false;
    this.timerDuration = this.currentLevel.timeLimit * 1000;

    const expectedOrder = new Map(
      this.currentLevel.correctOrder.map((id, index) => [id, index + 1])
    );
    this.steps = [
      ...this.currentLevel.cards,
      ...(this.currentLevel.distractors ?? []),
    ].map((card) => ({
      ...card,
      correctOrder: expectedOrder.get(card.id) ?? null,
    }));
    this.placedOrder = this.currentLevel.correctOrder.map(() => null);
    this.sequenceSlots = [];
  }

  create() {
    this.createBackground();
    this.createTimeBar();
    this.createTitle();
    this.createSequencePanel();
    this.createSequenceSlots();
    this.createCardsArea();
    this.createCards();
    this.createButton();
    this.registerDragEvents();
    this.registerPlatformCommands();
    this.emitReady();
    this.emitCheckpoint();
  }

  private createBackground() {
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-03');
    this.coverImage(bg, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0xffffff, 0.05);
    overlay.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 28);
    overlay.setDepth(1);
  }

  private createTimeBar() {
    const x = 210;
    const y = this.currentLevel.level === 1 ? 22 : 4;
    const width = 540;
    const height = 24;

    const bg = this.add.graphics();
    bg.fillStyle(0xdff2bc, 1);
    bg.fillRoundedRect(x, y, width, height, 12);
    bg.setDepth(6);

    this.timeBarFill = this.add.graphics();
    this.timeBarFill.setData('barX', x);
    this.timeBarFill.setData('barY', y);
    this.timeBarFill.setData('barWidth', width);
    this.timeBarFill.setData('barHeight', height);
    this.timeBarFill.setDepth(7);

    this.drawTimeBar(1);
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return;

    const x = this.timeBarFill.getData('barX') as number;
    const y = this.timeBarFill.getData('barY') as number;
    const barWidth = this.timeBarFill.getData('barWidth') as number;
    const barHeight = this.timeBarFill.getData('barHeight') as number;
    const width = barWidth * Phaser.Math.Clamp(progress, 0, 1);

    this.timeBarFill.clear();
    this.timeBarFill.fillStyle(0x7ed321, 1);
    this.timeBarFill.fillRoundedRect(x, y, width, barHeight, barHeight / 2);
  }

  private startTimer() {
    if (this.hasStartedTimer) return;

    this.hasStartedTimer = true;
    this.timerState.progress = 1;
    this.drawTimeBar(1);

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      progress: 0,
      duration: this.timerDuration,
      ease: 'Linear',
      onUpdate: () => this.drawTimeBar(this.timerState.progress),
      onComplete: () => {
        this.drawTimeBar(0);
        this.errors += 1;
        this.currentLives = Math.max(0, this.currentLives - 1);
        this.emitWrongAnswer();
        this.emitCheckpoint();
        this.showFeedback('Tempo esgotado!', false);
      },
    });
  }

  private createTitle() {
    const isLevelOne = this.currentLevel.level === 1;

    this.add
      .text(480, isLevelOne ? 80 : 42, this.currentLevel.title, {
        fontFamily: 'Arial',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1b2559',
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: '#2d2d7a',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(10);

    this.add
      .text(480, isLevelOne ? 112 : 68, this.currentLevel.objective, {
        fontFamily: 'Arial',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1b2559',
        strokeThickness: 3,
        shadow: {
          offsetX: 0,
          offsetY: 1,
          color: '#2d2d7a',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(10);
  }

 private createSequencePanel() {
  const shadow = this.add.graphics();
  shadow.fillStyle(0x000000, 0.14);

  const slotCount = this.currentLevel.correctOrder.length;
  const isLevelOne = this.currentLevel.level === 1;
  const panelWidth = isLevelOne ? 508 : slotCount === 5 ? 760 : 820;
  const panelX = isLevelOne ? 220 : 480 - panelWidth / 2;
  const panelY = isLevelOne ? 130 : 78;
  const shadowY = isLevelOne ? 138 : 86;
  const panelHeight = isLevelOne ? 150 : 132;
  const labelY = isLevelOne ? 145 : 94;

  shadow.fillRoundedRect(panelX + 6, shadowY, panelWidth, panelHeight, 22);

  shadow.setDepth(6);

  const panel = this.add.graphics();

  panel.fillStyle(0xffffff, 0.48);

  panel.fillRoundedRect(panelX, panelY, panelWidth + 12, panelHeight, 22);

  panel.lineStyle(3, 0xffffff, 0.75);

  panel.strokeRoundedRect(panelX, panelY, panelWidth + 12, panelHeight, 22);

  panel.setDepth(7);

  this.add
    .text(480, labelY, 'Sequência', {
      fontFamily: 'Arial',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#25327a',

      shadow: {
        offsetX: 0,
        offsetY: 1,
        color: '#ffffff',
        blur: 0,
        fill: true,
      },
    })
    .setOrigin(0.5)
    .setResolution(2)
    .setDepth(10);
}

  private createSequenceSlots() {
    const count = this.currentLevel.correctOrder.length;
    const isLevelOne = this.currentLevel.level === 1;
    const spacing = count <= 3 ? 130 : count === 5 ? 140 : 124;
    const startX = 480 - ((count - 1) * spacing) / 2;
    const colors = [COLORS.blue, COLORS.green, COLORS.softOrange, COLORS.cyan, COLORS.orange, 0xa78bfa];
    const y = isLevelOne ? 214 : 156;

    for (let index = 0; index < count; index += 1) {
      this.sequenceSlots.push(
        this.createSlot(startX + index * spacing, y, colors[index % colors.length], String(index + 1))
      );
    }
  }

  private createSlot(x: number, y: number, color: number, label: string) {
    const container = this.add.container(x, y);
    container.setDepth(9);

    const bg = this.add.image(0, 0, 'slot');
    bg.setCrop(175, 175, 674, 674);
    bg.setDisplaySize(148, 152);
    bg.setAlpha(0.98);

    const number = this.add
      .text(0, 0, label, {
        fontFamily: 'Arial',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1b2559',
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: '#3b3b8f',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2);

    container.add([bg, number]);
    return container;
  }

  private createCardsArea() {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.14);

    const totalCards = this.steps.length;
    const isLevelOne = this.currentLevel.level === 1;
    const areaWidth = totalCards <= 3 ? 408 : totalCards <= 6 ? 650 : 740;
    const areaX = 480 - areaWidth / 2;

    const areaY = isLevelOne ? 312 : 218;
    const areaHeight = totalCards > 3 ? 262 : 132;

    shadow.fillRoundedRect(areaX + 6, areaY + 8, areaWidth, areaHeight, 24);

  shadow.setDepth(7);

    const bg = this.add.graphics();

    bg.fillStyle(0xffd54f, 0.68);
    bg.fillRoundedRect(areaX, areaY, areaWidth + 12, areaHeight, 24);

    bg.lineStyle(2, 0xffffff, 0.95);
    bg.strokeRoundedRect(areaX, areaY, areaWidth + 12, areaHeight, 24);

  bg.setDepth(8);
}

  private createCards() {
    const shuffled = Phaser.Utils.Array.Shuffle([...this.steps]);
    const hasTwoRows = shuffled.length > 3;
    const isLevelOne = this.currentLevel.level === 1;
    const cardsPerRow = hasTwoRows ? (shuffled.length <= 6 ? 3 : 4) : shuffled.length;
    const spacing = hasTwoRows ? (shuffled.length <= 6 ? 180 : 160) : 130;
    const visualScale = 1;
    const rowY = hasTwoRows ? [286, 416] : [isLevelOne ? 378 : 352];
    const startX = 480 - ((cardsPerRow - 1) * spacing) / 2;

    shuffled.forEach((step, index) => {
      const row = Math.floor(index / cardsPerRow);
      const column = index % cardsPerRow;
      this.createCard(startX + column * spacing, rowY[row], step, visualScale);
    });
  }

  private createCard(x: number, y: number, step: AlgorithmStep, visualScale = 1) {
    const container = this.add.container(x, y);
    container.setSize(112, 116);
    container.setScale(visualScale);
    container.setDepth(12);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.13);
    shadow.fillRoundedRect(-54, -48, 108, 112, 20);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-56, -58, 112, 116, 20);

    const image = this.add.image(0, -20, step.assetKey);
    image.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.fitImage(image, 82, 68);

    const text = this.add
      .text(0, 35, step.label, {
        fontFamily: 'Arial',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#3b3b3b',
        align: 'center',
        wordWrap: { width: 84 },
      })
      .setOrigin(0.5)
      .setResolution(2);

    container.add([shadow, bg, image, text]);

    const hitbox = this.add.zone(x, y, 148 * visualScale, 148 * visualScale);
    hitbox.setDepth(200);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });

    hitbox.setData('card', container);
    hitbox.setData('step', step);
    container.setData('hitbox', hitbox);

    container.setData('step', step);
    container.setData('startX', x);
    container.setData('startY', y);
    container.setData('baseScale', visualScale);
    container.setData('currentSlotIndex', null);

    return container;
  }

  private createButton() {
    const buttonY = this.currentLevel.level === 1 ? 478 : 508;
    const button = this.add.container(480, buttonY);
    button.setDepth(40);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.16);
    shadow.fillRoundedRect(-128, -20, 256, 46, 23);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.orange, 1);
    bg.fillRoundedRect(-132, -25, 264, 50, 25);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-132, -25, 264, 50, 25);

    const text = this.add
      .text(0, 0, 'Testar algoritmo', {
        fontFamily: 'Arial',
        fontSize: '21px',
        fontStyle: 'bold',
        color: '#ffffff',
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: '#9a3f00',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2);

    button.add([shadow, bg, text]);

    const hitArea = new Phaser.Geom.Rectangle(-152, -36, 304, 72);

    button.setInteractive({
      hitArea,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    button.on('pointerdown', () => {
      this.playButtonSound();
      this.testAlgorithm();
    });
    button.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' });
    });
    button.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' });
    });

    this.testButton = button;
    this.testButtonBg = bg;
    this.testButtonText = text;
    this.updateTestButtonState();
  }

  private registerDragEvents() {
    this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      this.startTimer();

      const currentSlot = card.getData('currentSlotIndex') as number | null;
      if (currentSlot !== null) {
        this.placedOrder[currentSlot] = null;
        card.setData('currentSlotIndex', null);
        this.updateTestButtonState();
      }

      hitbox.setDepth(300);
      card.setDepth(100);
      this.tweens.killTweensOf(card);
      this.tweens.killTweensOf(hitbox);
      card.setScale((card.getData('baseScale') as number) * 1.04);
    });

    this.input.on('drag', (
      _pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.GameObject,
      dragX: number,
      dragY: number
    ) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      hitbox.x = dragX;
      hitbox.y = dragY;
      card.x = dragX;
      card.y = dragY;
    });

    this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      this.handleCardDrop(card);
    });
  }

  private handleCardDrop(card: Phaser.GameObjects.Container) {
    const step = card.getData('step') as AlgorithmStep;
    const hitbox = card.getData('hitbox') as Phaser.GameObjects.Zone;

    const slotIndex = this.sequenceSlots.findIndex((slot, index) => {
      const distance = Phaser.Math.Distance.Between(card.x, card.y, slot.x, slot.y);
      return distance < 86 && this.placedOrder[index] === null;
    });

    if (slotIndex === -1) {
      this.returnCard(card);
      return;
    }

    const slot = this.sequenceSlots[slotIndex];
    this.placedOrder[slotIndex] = step.correctOrder ?? -1;
    card.setData('currentSlotIndex', slotIndex);
    this.updateTestButtonState();
    this.playSlotSound();

    this.tweens.killTweensOf(card);
    this.tweens.killTweensOf(hitbox);

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      scale: card.getData('baseScale') as number,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => card.setDepth(20),
    });

    this.tweens.add({
      targets: hitbox,
      x: slot.x,
      y: slot.y,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => hitbox.setDepth(200),
    });
  }

  private returnCard(card: Phaser.GameObjects.Container) {
    const hitbox = card.getData('hitbox') as Phaser.GameObjects.Zone;

    card.setData('currentSlotIndex', null);
    this.updateTestButtonState();

    this.tweens.killTweensOf(card);
    this.tweens.killTweensOf(hitbox);

    this.tweens.add({
      targets: card,
      x: card.getData('startX'),
      y: card.getData('startY'),
      scale: card.getData('baseScale') as number,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => card.setDepth(12),
    });

    this.tweens.add({
      targets: hitbox,
      x: card.getData('startX'),
      y: card.getData('startY'),
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => hitbox.setDepth(200),
    });
  }

  private testAlgorithm() {
    if (!this.isTestButtonEnabled || this.hasCompletedLevel) return;

    const correct = this.currentLevel.correctOrder.map((_, index) => index + 1);
    const isComplete = this.placedOrder.every((value) => value !== null);

    if (!isComplete) {
      this.showFeedback('Complete a sequência!', false);
      return;
    }

    const isCorrect = this.placedOrder.every((value, index) => value === correct[index]);

    if (isCorrect) {
      this.hasCompletedLevel = true;
      this.timerTween?.stop();
      this.hits += 1;
      this.currentPoints += 5;
      this.emitCorrectAnswer();
      this.emitCheckpoint();
      this.showFeedback(this.currentLevel.successMessage, true);

      this.time.delayedCall(1400, () => {
        gameBridge.emit({
          type: 'GAME_COMPLETED',
          gameId: GAME_ID,
          stage: this.currentLevel.level,
        });

        if (this.currentLevel.level < 3) {
          this.scene.restart({
            level: this.currentLevel.level + 1,
            points: this.currentPoints,
            lives: this.currentLives,
          });
        }
      });
      return;
    }

    this.errors += 1;
    this.currentPoints = Math.max(0, this.currentPoints - 5);
    this.currentLives = Math.max(0, this.currentLives - 1);
    this.emitWrongAnswer();
    this.emitCheckpoint();
    this.showFeedback('Tente novamente!', false);
  }

  private updateTestButtonState() {
    const enabled = this.placedOrder.every((value) => value !== null);
    this.isTestButtonEnabled = enabled;

    if (!this.testButton || !this.testButtonBg || !this.testButtonText || !this.testButton.input) return;

    this.testButtonBg.clear();
    this.testButtonBg.fillStyle(enabled ? COLORS.orange : 0xb8c0cc, 1);
    this.testButtonBg.fillRoundedRect(-132, -25, 264, 50, 25);
    this.testButtonBg.lineStyle(4, 0xffffff, enabled ? 1 : 0.72);
    this.testButtonBg.strokeRoundedRect(-132, -25, 264, 50, 25);

    this.testButtonText.setAlpha(enabled ? 1 : 0.72);
    this.testButton.setAlpha(enabled ? 1 : 0.78);
    this.testButton.input.cursor = enabled ? 'pointer' : 'default';
  }

  private coverImage(image: Phaser.GameObjects.Image, width: number, height: number) {
    const scale = Math.max(width / image.width, height / image.height);
    image.setScale(scale);
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    image.setScale(scale);
  }

  private playButtonSound() {
    this.playTone(520, 0.045, 0.035);
    this.time.delayedCall(42, () => this.playTone(760, 0.055, 0.032));
  }

  private playSlotSound() {
    this.playTone(660, 0.05, 0.035);
    this.time.delayedCall(45, () => this.playTone(920, 0.07, 0.035));
  }

  private playTone(frequency: number, duration: number, volume: number) {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    this.audioContext ??= new AudioContextCtor();

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  private emitReady() {
    gameBridge.emit({
      type: 'GAME_READY',
      gameId: GAME_ID,
    });
  }

  private emitCorrectAnswer() {
    gameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      pointsEarned: 5,
      stage: this.currentLevel.level,
    });
  }

  private emitWrongAnswer() {
    gameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: -5,
      stage: this.currentLevel.level,
    });
  }

  private emitCheckpoint() {
    const placedCount = this.placedOrder.filter((value) => value !== null).length;
    const progress = Math.round((placedCount / this.currentLevel.correctOrder.length) * 100);

    gameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress,
      score: this.currentPoints,
      stage: this.currentLevel.level,
      hits: this.hits,
      errors: this.errors,
    });
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands?.();
    this.unsubscribePlatformCommands = gameBridge.onPlatformCommand((command: PlatformCommand) => {
      switch (command.type) {
        case 'START_GAME':
          if (command.gameId !== GAME_ID) return;
          this.scene.restart({
            level: command.stage,
            points: command.points,
            lives: command.lives,
          });
          return;

        case 'PAUSE_GAME':
          this.scene.pause();
          return;

        case 'RESUME_GAME':
          this.scene.resume();
          return;

        case 'UNLOCK_GAME':
          return;
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribePlatformCommands?.();
      this.unsubscribePlatformCommands = undefined;
      this.timerTween?.stop();
    });
  }

  private showFeedback(message: string, success: boolean) {
    const text = this.add
      .text(480, 310, message, {
        fontFamily: 'Arial',
        fontSize: '23px',
        fontStyle: 'bold',
        color: success ? '#22c55e' : '#ef4444',
        backgroundColor: '#ffffff',
        padding: { left: 16, right: 16, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(400);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: 290,
      delay: 1200,
      duration: 500,
      onComplete: () => text.destroy(),
    });
  }
}
