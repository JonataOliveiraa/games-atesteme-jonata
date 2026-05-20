import Phaser from 'phaser';

type AssetKey = 'bread' | 'cheese' | 'sandwich';

type SandwichStep = {
  id: number;
  title: string;
  assetKey: AssetKey;
  correctOrder: number;
};

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

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
  private placedOrder: Array<number | null> = [null, null, null];

  private timeBarFill?: Phaser.GameObjects.Graphics;
  private timerTween?: Phaser.Tweens.Tween;
  private timerState = { progress: 1 };
  private hasStartedTimer = false;
  private readonly timerDuration = 30000;

  private steps: SandwichStep[] = [
    { id: 1, title: 'Pegar o pão', assetKey: 'bread', correctOrder: 1 },
    { id: 2, title: 'Colocar recheio', assetKey: 'cheese', correctOrder: 2 },
    { id: 3, title: 'Fechar sanduíche', assetKey: 'sandwich', correctOrder: 3 },
  ];

  constructor() {
    super('GameScene');
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
  }

  private createBackground() {
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-03');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0xffffff, 0.05);
    overlay.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 28);
    overlay.setDepth(1);
  }

  private createTimeBar() {
    const x = 210;
    const y = 22;
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
        this.showFeedback('Tempo esgotado!', false);
      },
    });
  }

  private createTitle() {
    this.add
      .text(480, 80, 'Fazer um sanduíche', {
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
      .text(480, 112, 'Arraste os cartões na ordem correta e teste seu algoritmo.', {
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

  // aumentada levemente pra baixo
  shadow.fillRoundedRect(226, 138, 508, 150, 22);

  shadow.setDepth(6);

  const panel = this.add.graphics();

  panel.fillStyle(0xffffff, 0.48);

  // aumentada levemente pra baixo
  panel.fillRoundedRect(220, 130, 520, 150, 22);

  panel.lineStyle(3, 0xffffff, 0.75);

  panel.strokeRoundedRect(220, 130, 520, 150, 22);

  panel.setDepth(7);

  this.add
    .text(480, 145, 'Sequência', {
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
    this.sequenceSlots.push(this.createSlot(350, 214, COLORS.blue, '1'));
    this.sequenceSlots.push(this.createSlot(480, 214, COLORS.green, '2'));
    this.sequenceSlots.push(this.createSlot(610, 214, COLORS.softOrange, '3'));
  }

  private createSlot(x: number, y: number, color: number, label: string) {
    const container = this.add.container(x, y);
    container.setDepth(9);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-56, -58, 112, 116, 20);
    bg.lineStyle(5, color, 1);
    bg.strokeRoundedRect(-56, -58, 112, 116, 20);

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

  // maior pra cima e pra baixo
  shadow.fillRoundedRect(276, 320, 408, 132, 24);

  shadow.setDepth(7);

  const bg = this.add.graphics();

  // div amarela principal maior
  bg.fillStyle(0xffd54f, 0.68);
  bg.fillRoundedRect(270, 312, 420, 132, 24);

  // borda branca fina
  bg.lineStyle(2, 0xffffff, 0.95);
  bg.strokeRoundedRect(270, 312, 420, 132, 24);

  bg.setDepth(8);
}

  private createCards() {
    const shuffled = Phaser.Utils.Array.Shuffle([...this.steps]);

    const positions = [
      { x: 350, y: 378 },
      { x: 480, y: 378 },
      { x: 610, y: 378 },
    ];

    shuffled.forEach((step, index) => {
      this.createCard(positions[index].x, positions[index].y, step);
    });
  }

  private createCard(x: number, y: number, step: SandwichStep) {
    const container = this.add.container(x, y);
    container.setSize(112, 116);
    container.setDepth(12);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.13);
    shadow.fillRoundedRect(-54, -48, 108, 112, 20);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-56, -58, 112, 116, 20);

    const image = this.add.image(0, -20, step.assetKey);
    image.setDisplaySize(58, 58);

    const text = this.add
      .text(0, 35, step.title, {
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

    const hitbox = this.add.zone(x, y, 128, 132);
    hitbox.setDepth(200);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });

    hitbox.setData('card', container);
    hitbox.setData('step', step);
    container.setData('hitbox', hitbox);

    container.setData('step', step);
    container.setData('startX', x);
    container.setData('startY', y);
    container.setData('currentSlotIndex', null);

    return container;
  }

  private createButton() {
    const button = this.add.container(480, 478);
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

    const hitArea = new Phaser.Geom.Rectangle(-140, -30, 280, 60);

    button.setInteractive({
      hitArea,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    button.on('pointerdown', () => this.testAlgorithm());
  }

  private registerDragEvents() {
    this.input.on('dragstart', (_pointer, gameObject) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      this.startTimer();

      const currentSlot = card.getData('currentSlotIndex') as number | null;
      if (currentSlot !== null) {
        this.placedOrder[currentSlot] = null;
        card.setData('currentSlotIndex', null);
      }

      hitbox.setDepth(300);
      card.setDepth(100);
      this.tweens.killTweensOf(card);
      this.tweens.killTweensOf(hitbox);
      card.setScale(1.04);
    });

    this.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      hitbox.x = dragX;
      hitbox.y = dragY;
      card.x = dragX;
      card.y = dragY;
    });

    this.input.on('dragend', (_pointer, gameObject) => {
      const hitbox = gameObject as Phaser.GameObjects.Zone;
      const card = hitbox.getData('card') as Phaser.GameObjects.Container;

      if (!card) return;

      this.handleCardDrop(card);
    });
  }

  private handleCardDrop(card: Phaser.GameObjects.Container) {
    const step = card.getData('step') as SandwichStep;
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
    this.placedOrder[slotIndex] = step.correctOrder;
    card.setData('currentSlotIndex', slotIndex);

    this.tweens.killTweensOf(card);
    this.tweens.killTweensOf(hitbox);

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      scale: 1,
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

    this.tweens.killTweensOf(card);
    this.tweens.killTweensOf(hitbox);

    this.tweens.add({
      targets: card,
      x: card.getData('startX'),
      y: card.getData('startY'),
      scale: 1,
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
    const correct = [1, 2, 3];
    const isComplete = this.placedOrder.every((value) => value !== null);

    if (!isComplete) {
      this.showFeedback('Complete a sequência!', false);
      return;
    }

    const isCorrect = this.placedOrder.every((value, index) => value === correct[index]);

    if (isCorrect) this.timerTween?.stop();

    this.showFeedback(isCorrect ? 'Muito bem! 🎉' : 'Tente novamente!', isCorrect);
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
