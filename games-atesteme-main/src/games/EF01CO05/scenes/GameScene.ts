import * as Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { PixelCode, PixelLevel } from "../types";

const GAME_ID = "pixel-secreto";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;

type CellObject = Phaser.GameObjects.Rectangle & {
  row: number;
  col: number;
  code: PixelCode;
  filled: boolean;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: PixelLevel;
  private selectedCode: PixelCode = "A";
  private cells: CellObject[] = [];
  private hits = 0;
  private errors = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;
  private unsubscribePlatformCommands?: () => void;
  private tutorialStep = 0;
  private tutorialContainer?: Phaser.GameObjects.Container;
  private nextTutorialButton?: Phaser.GameObjects.Container;
  private hasStartedTimer = false;


  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === lvl) ?? LEVELS[0];
    this.selectedCode = this.levelConfig.palette[0]?.code ?? "A";
    this.cells = [];
    this.hits = 0;
    this.errors = 0;
  }

  private startTimerOnce() {
  if (this.hasStartedTimer) return;

  this.hasStartedTimer = true;
  this.startTimer();
}

  create() {
    this.createBackground();
    this.createTitle();
    this.createTimerBar();
    this.createPalette();
    this.createGrid();
    this.registerPlatformCommands();
  

    runtimeGameBridge.emit({
      type: "GAME_READY",
      gameId: GAME_ID,
    });

    this.emitProgress();

    if (this.levelConfig.level === 1) {
      this.time.delayedCall(800, () => {
        this.createTutorialAnimation();
      });
    }
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

private createTutorialAnimation() {
  this.tutorialStep = 0;

  this.showTutorialStep();
}

private showTutorialStep() {
  this.tutorialContainer?.destroy();
  this.nextTutorialButton?.destroy();

  const steps = [
    {
      text: "Clique na legenda A = ROSA",
      color: 0xff66b3,
      label: "A",
    },
    {
      text: "Depois clique nos espaços com a letra A",
      color: 0xffffff,
      label: "A",
    },
    {
      text: "Clique na legenda B = BRANCO",
      color: 0xffffff,
      label: "B",
    },
    {
      text: "Depois clique nos espaços com a letra B",
      color: 0xffffff,
      label: "B",
    },
    {
      text: "Complete o desenho para avançar de nível",
      color: 0x86efac,
      label: "✓",
    },
  ];

  const step = steps[this.tutorialStep];

  const panel = this.add
    .rectangle(640, 210, 760, 150, 0xffffff, 0.97)
    .setStrokeStyle(4, 0xa855f7)
    .setDepth(200);

  const numberBadge = this.add
    .circle(300, 160, 24, 0x2563eb, 1)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(201);

  const numberText = this.add
    .text(300, 160, String(this.tutorialStep + 1), {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setDepth(202);

  const text = this.add
    .text(640, 160, step.text, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7e22ce",
      align: "center",
      wordWrap: { width: 620 },
    })
    .setOrigin(0.5)
    .setDepth(202);

  const square = this.add
    .rectangle(640, 230, 70, 70, step.color, 1)
    .setStrokeStyle(4, 0x111827)
    .setDepth(202);

  const label = this.add
    .text(640, 230, step.label, {
      fontSize: "32px",
      fontFamily: "Arial Black, Arial",
      color: "#111827",
    })
    .setOrigin(0.5)
    .setDepth(203);

  this.tutorialContainer = this.add.container(0, 0, [
    panel,
    numberBadge,
    numberText,
    text,
    square,
    label,
  ]);

  this.createNextTutorialButton();
}

private createNextTutorialButton() {
  const buttonBg = this.add
    .rectangle(1035, 210, 64, 64, 0xa855f7, 1)
    .setStrokeStyle(4, 0xffffff)
    .setInteractive({ useHandCursor: true })
    .setDepth(210);

  const arrow = this.add
    .text(1035, 210, "➜", {
      fontSize: "34px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setDepth(211);

  const goNext = () => {
    this.playClick();

    this.tutorialStep++;

    if (this.tutorialStep >= 5) {
      this.tutorialContainer?.destroy();
      this.nextTutorialButton?.destroy();
      return;
    }

    this.showTutorialStep();
  };

  buttonBg.on("pointerdown", goNext);
  arrow.setInteractive({ useHandCursor: true });
  arrow.on("pointerdown", goNext);

  this.nextTutorialButton = this.add.container(0, 0, [buttonBg, arrow]);
}

  private createBackground() {
    this.add.rectangle(640, 360, 1280, 720, 0xfdf2f8);
    this.add.rectangle(640, 185, 1280, 370, 0xdbeafe, 0.45);
    this.add.rectangle(640, 545, 1280, 350, 0xfef3c7, 0.45);

    for (let i = 0; i < 18; i++) {
      const size = Phaser.Math.Between(12, 28);
      const square = this.add.rectangle(
        Phaser.Math.Between(35, 1245),
        Phaser.Math.Between(85, 675),
        size,
        size,
        Phaser.Utils.Array.GetRandom([0xf9a8d4, 0xc4b5fd, 0x93c5fd, 0xfacc15]),
        0.3
      );

      this.tweens.add({
        targets: square,
        angle: 360,
        duration: 5000 + i * 120,
        repeat: -1,
      });
    }
  }

  private createTitle() {
    this.add
      .text(640, 115, this.levelConfig.title, {
        fontSize: "42px",
        fontFamily: "Arial Black, Arial",
        color: "#86198f",
        stroke: "#ffffff",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 160, "Escolha a cor e pinte certo para revelar o desenho!", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#334155",
        align: "center",
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

  private createPalette() {
    this.add
      .rectangle(1035, 365, 330, 360, 0xffffff, 0.78)
      .setStrokeStyle(4, 0xc084fc);

    this.add
      .text(1035, 225, "Legenda", {
        fontSize: "28px",
        fontFamily: "Arial Black, Arial",
        color: "#7e22ce",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.levelConfig.palette.forEach((item, index) => {
      const y = 285 + index * 70;
      const isSelected = item.code === this.selectedCode;

      const button = this.add
        .rectangle(1035, y, 250, 52, isSelected ? 0xf3e8ff : 0xffffff, 1)
        .setStrokeStyle(isSelected ? 5 : 3, isSelected ? 0x9333ea : 0xc084fc)
        .setInteractive({ useHandCursor: true });

      this.add.rectangle(935, y, 36, 36, item.color).setStrokeStyle(2, 0x334155);

      this.add
        .text(985, y, `${item.code} = ${item.label}`, {
          fontSize: "22px",
          fontFamily: "Arial Black, Arial",
          color: "#334155",
        })
        .setOrigin(0, 0.5);

      button.on("pointerdown", () => {
        this.startTimerOnce();
        this.playClick();
        this.selectedCode = item.code;
        this.createPalette();
      });
    });
  }

  private createGrid() {
    const rows = this.levelConfig.grid.length;
    const cols = this.levelConfig.grid[0]?.length ?? 0;
    const cellSize = rows >= 8 ? 48 : 56;
    const gap = 4;
    const totalW = cols * cellSize + (cols - 1) * gap;
    const totalH = rows * cellSize + (rows - 1) * gap;
    const gridCenterY = rows >= 8 ? 420 : 395;
    const startX = 500 - totalW / 2 + cellSize / 2;
    const startY = gridCenterY - totalH / 2 + cellSize / 2;

    this.add
      .rectangle(500, gridCenterY, totalW + 80, totalH + 80, 0xffffff, 0.82)
      .setStrokeStyle(4, 0xf0abfc);

    this.levelConfig.grid.forEach((row, rowIndex) => {
      row.forEach((code, colIndex) => {
        const x = startX + colIndex * (cellSize + gap);
        const y = startY + rowIndex * (cellSize + gap);
        const isEmpty = code === "";
        const hint = this.levelConfig.hints?.some(
          (item) => item.row === rowIndex && item.col === colIndex
        );
        const color = hint ? this.getColorByCode(code) : 0xffffff;

        const cell = this.add
          .rectangle(x, y, cellSize, cellSize, isEmpty ? 0xf8fafc : color, 1)
          .setStrokeStyle(2, isEmpty ? 0xe2e8f0 : 0x94a3b8)
          .setInteractive({ useHandCursor: !isEmpty }) as CellObject;

        cell.row = rowIndex;
        cell.col = colIndex;
        cell.code = code;
        cell.filled = Boolean(hint || isEmpty);

        if (!hint && !isEmpty) {
          this.add
            .text(x, y, code, {
              fontSize: "22px",
              fontFamily: "Arial Black, Arial",
              color: "#7c2d12",
            })
            .setOrigin(0.5)
            .setName(`label-${rowIndex}-${colIndex}`);
        }

        if (!isEmpty) {
          cell.on("pointerdown", () => this.handleCellClick(cell));
        }

        this.cells.push(cell);
      });
    });
  }

  private handleCellClick(cell: CellObject) {
    this.startTimerOnce();
    if (cell.filled) return;

    if (this.selectedCode !== cell.code) {
      this.errors += 1;
      this.playWrong();

      runtimeGameBridge.emit({
        type: "WRONG_ANSWER",
        gameId: GAME_ID,
        stage: this.levelConfig.level,
        pointsEarned: -5,
      });

      this.showFloatingMessage("Código incorreto!", 0xef4444);
      this.emitProgress();
      return;
    }

    cell.filled = true;
    cell.setFillStyle(this.getColorByCode(cell.code));
    cell.setStrokeStyle(3, 0x22c55e);
    this.hideCellLabel(cell.row, cell.col);
    this.hits += 1;
    this.playCorrect();

    runtimeGameBridge.emit({
      type: "CORRECT_ANSWER",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      pointsEarned: 5,
    });

    this.showMiniCheck(cell.x, cell.y);
    this.emitProgress();

    if (this.isCompleted()) {
      this.time.delayedCall(600, () => this.handleSuccess());
    }
  }

  private hideCellLabel(row: number, col: number) {
    const label = this.children.getByName(`label-${row}-${col}`);
    label?.destroy();
  }

  private isCompleted() {
    return this.cells.every((cell) => cell.filled);
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

      this.time.delayedCall(1200, () => {
        this.showNextLevelButton(nextLevel as 1 | 2 | 3);
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

  private showNextLevelButton(nextLevel: 1 | 2 | 3) {
    const button = this.add
      .rectangle(500, 650, 420, 58, 0x9333ea, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(120);

    const text = this.add
      .text(500, 650, "Avançar para o próximo nível", {
        fontSize: "22px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(121);

    const goNext = () => {
      this.playClick();

      this.scene.restart({
        level: nextLevel,
      });
    };

    button.on("pointerdown", goNext);

    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", goNext);
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

  private emitProgress() {
    const playableCells = this.cells.filter((cell) => cell.code !== "");
    const filled = playableCells.filter((cell) => cell.filled).length;
    const progress = playableCells.length
      ? Math.round((filled / playableCells.length) * 100)
      : 0;

    EventBus.emit("pixel-progress", {
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

  private getColorByCode(code: PixelCode): number {
    return this.levelConfig.palette.find((item) => item.code === code)?.color ?? 0xffffff;
  }

  private showMiniCheck(x: number, y: number) {
    const check = this.add
      .text(x, y, "✓", {
        fontSize: "32px",
        fontFamily: "Arial Black, Arial",
        color: "#22c55e",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(80);

    this.tweens.add({
      targets: check,
      y: y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => check.destroy(),
    });
  }

  private showSuccessAnimation() {
    this.showFloatingMessage(`Imagem revelada: ${this.levelConfig.imageName}!`, 0x22c55e);

    const emojis = ["⭐", "✨", "🎨", "🌟"];

    for (let i = 0; i < 22; i++) {
      const star = this.add
        .text(500, 360, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(24, 44)}px`,
        })
        .setOrigin(0.5)
        .setDepth(90);

      this.tweens.add({
        targets: star,
        x: 500 + Phaser.Math.Between(-360, 360),
        y: 360 + Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(700, 1200),
        onComplete: () => star.destroy(),
      });
    }
  }

  private showFloatingMessage(message: string, color: number) {
    const bgColor = Phaser.Display.Color.IntegerToColor(color).rgba;

    const text = this.add
      .text(500, 210, message, {
        fontSize: "30px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        backgroundColor: bgColor,
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: text,
      y: 185,
      alpha: 0,
      delay: 900,
      duration: 450,
      onComplete: () => text.destroy(),
    });
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
}
