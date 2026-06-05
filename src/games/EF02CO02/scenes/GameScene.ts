import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { LEVELS } from "../data/levels";
import type { Direction, GridPoint, RepeatLevel, RobotCommand } from "../types";

const GAME_ID = "desfile-do-robo-repetidor";
const TIMER_BAR_W = 820;
const TIMER_BAR_Y = 48;
const MODAL_SCALE = 1.18;
const MAX_PROGRAM_BLOCKS = 14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  pink: 0xec4899,
  ink: "#1e293b",
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: RepeatLevel;
  private program: RobotCommand[] = [];
  private robot!: Phaser.GameObjects.Container;
  private robotState!: { x: number; y: number; direction: Direction };
  private pathMarks: Phaser.GameObjects.GameObject[] = [];
  private programObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private directionHitAreas: Array<{ bounds: Phaser.Geom.Rectangle; onClick: () => void }> = [];
  private actionHitAreas: Array<{ bounds: Phaser.Geom.Rectangle; onClick: () => void }> = [];
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private hasStartedTimer = false;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Rectangle;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((level) => level.level === lvl) ?? LEVELS[0];
    this.program = [];
    this.robotState = {
      x: this.levelConfig.start.x,
      y: this.levelConfig.start.y,
      direction: this.levelConfig.direction,
    };
    this.pathMarks = [];
    this.programObjects = [];
    this.overlayObjects = [];
    this.directionHitAreas = [];
    this.actionHitAreas = [];
    this.commandLocked = false;
    this.hits = 0;
    this.errors = 0;
    this.hasStartedTimer = false;
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
  }

  create() {
    this.createBackground();
    this.createRobotCutoutTexture();
    this.createTimerBar();
    this.createHeader();
    this.createBoard();
    this.createCommandPanel();
    this.createProgramPanel();
    this.createActionButtons();
    this.createRobot();
    this.renderProgram();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;

    const remaining = this.timerEvent.getRemaining();
    const total = this.levelConfig.timeLimit * 1000;
    const pct = Math.max(0, remaining / total);
    this.timerBar.setSize(TIMER_BAR_W * pct, 18);

    if (pct > 0.5) this.timerBar.setFillStyle(COLORS.green);
    else if (pct > 0.25) this.timerBar.setFillStyle(COLORS.orange);
    else this.timerBar.setFillStyle(0xef4444);
  }

  shutdown() {
    this.timerEvent?.destroy();
    this.input.off("pointerdown", this.handleDirectionPointerDown, this);
    this.input.off("pointermove", this.handleDirectionPointerMove, this);
    this.input.setDefaultCursor("default");
    this.unsubscribePlatformCommands?.();
  }

  private createBackground() {
  this.add.image(640, 360, "wallpaper")
    .setDisplaySize(1280, 720)
    .setDepth(-100);

}

  private createRobotCutoutTexture() {
    if (this.textures.exists("robot-cutout")) return;

    const source = this.textures.get("robot").getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width;
    const height = source.height;
    if (!width || !height) return;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(source, 0, 0);
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const isBackgroundPixel = (index: number) => {
      const offset = index * 4;
      return data[offset + 3] > 0 && data[offset] > 238 && data[offset + 1] > 238 && data[offset + 2] > 238;
    };

    const enqueue = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const index = y * width + x;
      if (visited[index] || !isBackgroundPixel(index)) return;
      visited[index] = 1;
      queue.push(index);
    };

    for (let x = 0; x < width; x++) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }

    for (let y = 0; y < height; y++) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    for (let cursor = 0; cursor < queue.length; cursor++) {
      const index = queue[cursor];
      const x = index % width;
      const y = Math.floor(index / width);
      const offset = index * 4;
      data[offset + 3] = 0;
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }

    context.putImageData(imageData, 0, 0);
    this.textures.addCanvas("robot-cutout", canvas);
  }

  private createTimerBar() {
    this.add.rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 28, 0x0f172a, 0.32)
      .setStrokeStyle(3, 0xffffff, 0.85);
    this.timerBar = this.add.rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 18, COLORS.green)
      .setOrigin(0, 0.5);
  }

  private createHeader() {
    this.add.text(640, 94, this.levelConfig.title, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(640, 132, this.levelConfig.objective, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#0f172a",
      stroke: "#ffffff",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 820 },
    }).setOrigin(0.5);

    this.add.text(1080, 105, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.75)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createBoard() {
    const { cols, rows } = this.levelConfig.gridSize;
    const cell = this.getCellSize();
    const startX = 86;
    const startY = 190;
    const boardW = cols * cell;
    const boardH = rows * cell;

    this.drawGamePanel(startX + boardW / 2, startY + boardH / 2, boardW + 38, boardH + 38, COLORS.cyan, -2);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = startX + x * cell + cell / 2;
        const py = startY + y * cell + cell / 2;
        const isObstacle = this.isObstacle(x, y);
        const isGoal = this.levelConfig.goal.x === x && this.levelConfig.goal.y === y;
        

        this.add.image(px, py, "grid-tile")
          .setDisplaySize(cell - 5, cell - 5)
          .setAlpha(isObstacle ? 0.76 : 0.92)
          .setDepth(2);

if (isGoal) {
  this.add.image(
    px,
    py,
    "goal-stage"
  )
  .setDisplaySize(
    cell - 10,
    cell - 10
  )
  .setDepth(4);
}

if (isObstacle) {
  this.add.image(
    px,
    py,
    "obstacle-cone"
  )
  .setDisplaySize(
    cell - 10,
    cell - 10
  )
  .setDepth(4);
}
      }
    }
  }

  private createCommandPanel() {
    this.directionHitAreas = [];
    this.input.off("pointerdown", this.handleDirectionPointerDown, this);
    this.input.off("pointermove", this.handleDirectionPointerMove, this);
    this.drawGamePanel(910, 350, 604, 320, COLORS.purple, 1);
    this.drawPanelHeader(910, 178, 410, "Escolha a direção", COLORS.purple);

    this.add.text(910, 224, "Cada toque na seta move o robô 1 casa.", {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(12);

    const directions: Array<{ x: number; y: number; label: string; arrow: string; direction: Direction; color: number }> = [
      { x: 910, y: 270, label: "Cima", arrow: "↑", direction: "up", color: COLORS.blue },
      { x: 910, y: 332, label: "Direita", arrow: "→", direction: "right", color: COLORS.purple },
      { x: 910, y: 394, label: "Baixo", arrow: "↓", direction: "down", color: COLORS.blue },
      { x: 910, y: 456, label: "Esquerda", arrow: "←", direction: "left", color: COLORS.purple },
    ];

    directions.forEach((button) => {
      this.createDirectionButton(
        button.x,
        button.y,
        button.arrow,
        button.label,
        button.color,
        () => this.addCommand({ type: "move", direction: button.direction })
      );
    });

    this.input.on("pointerdown", this.handleDirectionPointerDown, this);
    this.input.on("pointermove", this.handleDirectionPointerMove, this);
  }

  private handleDirectionPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.commandLocked || this.overlayObjects.length) return;

    const hit =
      this.directionHitAreas.find((area) => area.bounds.contains(pointer.x, pointer.y)) ??
      this.actionHitAreas.find((area) => area.bounds.contains(pointer.x, pointer.y));
    if (!hit) return;

    hit.onClick();
  }

  private handleDirectionPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.commandLocked || this.overlayObjects.length) {
      this.input.setDefaultCursor("default");
      return;
    }

    const isOverDirection = this.directionHitAreas.some((area) => area.bounds.contains(pointer.x, pointer.y));
    const isOverAction = this.actionHitAreas.some((area) => area.bounds.contains(pointer.x, pointer.y));
    this.input.setDefaultCursor(isOverDirection || isOverAction ? "pointer" : "default");
  }

  private createProgramPanel() {
    this.drawGamePanel(910, 566, 604, 108, COLORS.blue, 1);
    this.drawPanelHeader(910, 512, 320, "Programa do robô", COLORS.blue);
  }

  private createActionButtons() {
    this.actionHitAreas = [];
    this.createUiButton(690, 668, 205, 76, "Executar", COLORS.green, () => this.executeProgram());
    this.createUiButton(910, 668, 195, 76, "Desfazer", COLORS.orange, () => this.undoCommand());
    this.createUiButton(1130, 668, 185, 76, "Limpar", 0xef4444, () => this.clearProgram());
  }
  private createRobot() {
  const pos = this.gridToWorld(
    this.robotState.x,
    this.robotState.y
  );

  const shadow = this.add.ellipse(
    0,
    34,
    42,
    16,
    0x000000,
    0.2
  );

  const sprite = this.add.image(
    0,
    0,
    this.textures.exists("robot-cutout") ? "robot-cutout" : "robot"
  );

  sprite.setDisplaySize(50, 82);

  this.robot = this.add.container(
    pos.x,
    pos.y,
    [shadow, sprite]
  );

  this.robot.setDepth(20);

  this.updateRobotRotation();
}

  private addCommand(command: RobotCommand) {
    if (this.commandLocked) return;
    if (this.program.length >= MAX_PROGRAM_BLOCKS) {
      this.showToast("Seu programa está cheio. Apague uma seta para tentar outro caminho.", 0xf59e0b);
      return;
    }
    this.playClick();
    this.startTimerOnce();
    this.program.push(command);
    this.renderProgram();
    this.emitProgress();
  }

  private undoCommand() {
    if (this.commandLocked || !this.program.length) return;
    this.playClick();
    this.program.pop();
    this.renderProgram();
  }

  private clearProgram() {
    if (this.commandLocked) return;
    this.playClick();
    this.program = [];
    this.renderProgram();
  }

  private renderProgram() {
    this.programObjects.forEach((object) => object.destroy());
    this.programObjects = [];

    if (!this.program.length) {
      this.programObjects.push(this.add.text(910, 568, "Toque nas setas para montar o caminho do robô, uma casa por vez.", {
        fontSize: "17px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 430 },
      }).setOrigin(0.5).setDepth(13));
      return;
    }

    this.program.forEach((command, index) => {
      const col = index % 7;
      const row = Math.floor(index / 7);
      const x = 648 + col * 84;
      const y = 548 + row * 46;
      const label = this.getCommandLabel(command);
      const block = this.add.graphics().setDepth(12);
      block.fillStyle(this.getCommandColor(command), 0.98);
      block.fillRoundedRect(x - 25, y - 18, 50, 36, 12);
      block.fillStyle(0xffffff, 0.14);
      block.fillRoundedRect(x - 18, y - 13, 36, 12, 6);
      block.lineStyle(3, 0xffffff, 0.9);
      block.strokeRoundedRect(x - 25, y - 18, 50, 36, 12);
      this.programObjects.push(block);
      this.programObjects.push(this.add.text(x, y, label, {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 70 },
      }).setOrigin(0.5).setDepth(13));
    });
  }

  private async executeProgram() {
    if (this.commandLocked || !this.program.length) return;
    this.playClick();
    this.startTimerOnce();
    this.commandLocked = true;
    this.clearPathMarks();
    this.resetRobot();

    for (const command of this.program) {
      const result = await this.runCommand(command);
      if (!result.ok) {
        this.errors += 1;
        this.playWrong();
        runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
        this.restartCurrentLevelAfterError(result.message);
        this.emitProgress();
        return;
      }
    }

    if (this.robotState.x === this.levelConfig.goal.x && this.robotState.y === this.levelConfig.goal.y) {
      this.hits += 1;
      this.playCorrect();
      const bonus = this.program.length <= this.levelConfig.minBlocks ? 5 : 0;
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 5 + bonus });
      this.emitProgress();
      this.time.delayedCall(650, () => this.handleLevelSuccess());
      return;
    }

    this.errors += 1;
    this.playWrong();
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.restartCurrentLevelAfterError("O robô parou fora da estrela. O nível vai recomeçar.");
    this.emitProgress();
  }

  private restartCurrentLevelAfterError(message: string) {
    this.commandLocked = true;
    this.timerEvent?.remove(false);
    this.showToast(message, 0xef4444);
    this.time.delayedCall(1000, () => {
      this.scene.restart({ level: this.levelConfig.level });
    });
  }

  private runCommand(command: RobotCommand) {
    return new Promise<{ ok: boolean; message: string }>((resolve) => {
      this.robotState.direction = command.direction;
      this.updateRobotRotation();

      const next = this.getNextPoint(command.direction);

      if (!this.isInside(next.x, next.y)) {
        resolve({
          ok: false,
          message: "O robô saiu da pista. Revise a direção da seta.",
        });
        return;
      }

      if (this.isObstacle(next.x, next.y)) {
        resolve({
          ok: false,
          message: "O robô encontrou um cone. Tente outra seta.",
        });
        return;
      }

      this.robotState.x = next.x;
      this.robotState.y = next.y;

      const pos = this.gridToWorld(next.x, next.y);
      this.markPath(pos.x, pos.y);

      this.tweens.add({
        targets: this.robot,
        x: pos.x,
        y: pos.y - 12,
        duration: 120,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: () => {
          this.robot.setPosition(pos.x, pos.y);
          resolve({ ok: true, message: "" });
        },
      });
    });
  }

  private handleLevelSuccess() {
    this.timerEvent?.remove(false);
    this.commandLocked = true;
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

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -166, 540, 330, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -178, 556, 330, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -178, 556, 330, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.orange, 1);
    topBar.fillRoundedRect(-196, -194, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14);

    const badgeIcon = this.add.image(0, -114, "success-badge");
    this.fitImage(badgeIcon, 82, 82);

    const title = this.add.text(0, -58, "Parabéns!", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const score = this.add.text(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
    }).setOrigin(0.5);

    const detail = this.add.text(0, 48, `Você usou ${this.program.length} seta(s). Meta: ${this.levelConfig.minBlocks}.`, {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);

    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics();
      dot.fillStyle(level <= this.levelConfig.level ? COLORS.green : level === nextLevel ? COLORS.orange : 0xd8dde8, 1);
      dot.fillCircle(-28 + index * 28, 94, 8);
      dot.lineStyle(2, 0xffffff, 0.9);
      dot.strokeCircle(-28 + index * 28, 94, 8);
      return dot;
    });

    const waitText = this.add.text(0, 132, "Preparando o próximo nível...", {
      fontSize: "15px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
    }).setOrigin(0.5);

    modal.add([shadow, bg, topBar, badgeIcon, title, score, detail, ...dots, waitText]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);

    this.tweens.add({
      targets: modal,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 260,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(1800, () => {
      this.showNextLevelStartTransition(nextLevel);
    });
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -154, 540, 312, 28);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -166, 556, 312, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -166, 556, 312, 28);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.green, 1);
    topBar.fillRoundedRect(-196, -182, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14);

    const title = this.add.text(0, -102, `Nível ${nextLevel}`, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const objective = this.add.text(0, -42, nextConfig?.title ?? "Novo desafio", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);

    const detail = this.add.text(0, 12, nextConfig?.objective ?? "Leve o robô até a estrela.", {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5);

    const button = this.add.container(0, 104);
    const buttonShadow = this.add.graphics();
    buttonShadow.fillStyle(0x000000, 0.16);
    buttonShadow.fillRoundedRect(-136, -20, 272, 48, 24);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.orange, 1);
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26);
    buttonBg.lineStyle(4, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26);
    const buttonText = this.add.text(0, 0, "Iniciar nível", {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#9a3f00",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([buttonShadow, buttonBg, buttonText]);

    const buttonHitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
    buttonHitbox.setInteractive({ useHandCursor: true });
    buttonHitbox.on("pointerover", () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerout", () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    buttonHitbox.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: nextLevel });
    });

    modal.add([shadow, bg, topBar, title, objective, detail, button]);
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

    const title = this.add.text(0, -128, "Desfile completo!", {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -74, `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5);

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 42);
      const badge = this.add.graphics();
      badge.fillStyle(index === 0 ? COLORS.orange : index === 1 ? COLORS.cyan : COLORS.green, 1);
      badge.fillRoundedRect(-54, -42, 108, 84, 18);
      badge.lineStyle(4, 0xffffff, 0.95);
      badge.strokeRoundedRect(-54, -42, 108, 84, 18);
      const number = this.add.text(0, -13, String(level), {
        fontSize: "30px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#25327a",
        strokeThickness: 4,
      }).setOrigin(0.5);
      const label = this.add.text(0, 23, "concluído", {
        fontSize: "12px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      }).setOrigin(0.5);
      item.add([badge, number, label]);
      return item;
    });

    const badge = this.add.text(0, -24, "Você criou um caminho usando uma seta para cada casa.", {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 480 },
    }).setOrigin(0.5);

    const playAgain = this.createFinalButton(-142, 138, "Jogar novamente", COLORS.green, () => this.scene.restart({ level: 1 }));
    const exit = this.createFinalButton(142, 138, "Voltar aos jogos", COLORS.orange, () => EventBus.emit("exit-game"));

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

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, badge, ...levelLabels, playAgain, exit]);
    panel.setScale(MODAL_SCALE * 0.9);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      scale: MODAL_SCALE,
      duration: 280,
      ease: "Back.easeOut",
    });
  }

  private createFinalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-132, -26, 264, 52, 26);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-132, -26, 264, 52, 26);
    const text = this.add.text(0, 0, label, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([bg, text]);
    button.setSize(292, 76);
    button.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-146, -38, 292, 76),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    button.on("pointerover", () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    button.on("pointerout", () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    button.on("pointerdown", () => {
      this.playClick();
      onClick();
    });
    return button;
  }

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.overlayObjects.push(object);
    return object;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((object) => object.destroy());
    this.overlayObjects = [];
  }

  private getNextPoint(direction: Direction): GridPoint {
    const delta = {
      up: { x: 0, y: -1 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
    }[direction];
    return { x: this.robotState.x + delta.x, y: this.robotState.y + delta.y };
  }

  private resetRobot() {
    this.robotState = { x: this.levelConfig.start.x, y: this.levelConfig.start.y, direction: this.levelConfig.direction };
    const pos = this.gridToWorld(this.robotState.x, this.robotState.y);
    this.robot.setPosition(pos.x, pos.y);
    this.updateRobotRotation();
  }

  private updateRobotRotation() {
    this.robot.setAngle(0);
  }

  private markPath(x: number, y: number) {
    const mark = this.add.image(x, y, "path-mark")
      .setDisplaySize(30, 30)
      .setAlpha(0.82)
      .setDepth(5);
    this.pathMarks.push(mark);
  }

  private clearPathMarks() {
    this.pathMarks.forEach((mark) => mark.destroy());
    this.pathMarks = [];
  }

  private gridToWorld(x: number, y: number) {
    const cell = this.getCellSize();
    return { x: 86 + x * cell + cell / 2, y: 190 + y * cell + cell / 2 };
  }

  private getCellSize() {
    const { cols, rows } = this.levelConfig.gridSize;
    return Math.min(475 / cols, 408 / rows);
  }

  private isInside(x: number, y: number) {
    return x >= 0 && x < this.levelConfig.gridSize.cols && y >= 0 && y < this.levelConfig.gridSize.rows;
  }

  private isObstacle(x: number, y: number) {
    return this.levelConfig.obstacles.some((point) => point.x === x && point.y === y);
  }

  private getCommandLabel(command: RobotCommand) {
    const arrow = {
      up: "↑",
      right: "→",
      down: "↓",
      left: "←",
    }[command.direction];
    return arrow;
  }

  private getCommandColor(command: RobotCommand) {
    if (command.direction === "left" || command.direction === "right") return COLORS.purple;
    return COLORS.blue;
  }

  private createUiButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y).setDepth(12);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.24);
    shadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 6, width, height, 16);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.lineStyle(3, 0xffffff, 0.92);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    const text = this.add.text(0, 0, label, {
      fontSize: width < 120 ? "15px" : "17px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width - 12 },
    }).setOrigin(0.5);

    button.add([shadow, bg, text]);
    this.actionHitAreas.push({
      bounds: new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      onClick,
    });
  }

  private createDirectionButton(
    x: number,
    y: number,
    arrow: string,
    label: string,
    color: number,
    onClick: () => void
  ) {
    const width = 410;
    const height = 54;
    const button = this.add.container(x, y).setDepth(12);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.26);
    shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 6, width, height, 18);

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    bg.fillStyle(0xffffff, 0.16);
    bg.fillRoundedRect(-width / 2 + 10, -height / 2 + 8, 64, height - 16, 14);
    bg.lineStyle(3, 0xffffff, 0.92);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);

    const icon = this.add.text(-160, 0, arrow, {
      fontSize: "36px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
    }).setOrigin(0.5);

    const text = this.add.text(34, 0, label, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5);

    button.add([shadow, bg, icon, text]);
    this.directionHitAreas.push({
      bounds: new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      onClick,
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

  private drawGamePanel(
    x: number,
    y: number,
    width: number,
    height: number,
    accentColor: number,
    depth: number
  ) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.32);
    shadow.fillRoundedRect(x - width / 2 + 10, y - height / 2 + 12, width, height, 26);
    shadow.setDepth(depth);

    const panel = this.add.graphics();
    panel.fillStyle(0x102a43, 0.76);
    panel.fillRoundedRect(x - width / 2, y - height / 2, width, height, 26);
    panel.fillStyle(0xffffff, 0.12);
    panel.fillRoundedRect(x - width / 2 + 10, y - height / 2 + 10, width - 20, 34, 18);
    panel.lineStyle(3, accentColor, 0.9);
    panel.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 26);
    panel.lineStyle(2, 0xffffff, 0.36);
    panel.strokeRoundedRect(x - width / 2 + 5, y - height / 2 + 5, width - 10, height - 10, 22);
    panel.setDepth(depth + 0.1);

    return panel;
  }

  private drawPanelHeader(x: number, y: number, width: number, label: string, color: number) {
    const container = this.add.container(x, y).setDepth(11);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.28);
    shadow.fillRoundedRect(-width / 2 + 4, -21 + 5, width, 42, 21);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -21, width, 42, 21);
    bg.lineStyle(3, 0xffffff, 0.88);
    bg.strokeRoundedRect(-width / 2, -21, width, 42, 21);

    const text = this.add.text(0, 0, label, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    container.add([shadow, bg, text]);
    return container;
  }

  private drawRoundedBox(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor: number,
    strokeAlpha: number,
    radius: number,
    depth: number,
    strokeWidth = 4
  ) {
    const box = this.add.graphics();
    box.fillStyle(fillColor, fillAlpha);
    box.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    box.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    box.setDepth(depth);
    return box;
  }

  private showToast(message: string, color: number) {
    const container = this.add.container(640, 640).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-390, -34, 780, 68, 22);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-390, -34, 780, 68, 22);
    const text = this.add.text(0, 0, message, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 700 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.tweens.add({
      targets: container,
      y: 620,
      alpha: 0,
      delay: 1300,
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
        this.showToast("Tempo esgotado. Tente montar um caminho mais direto.", 0xef4444);
      },
    });
  }

  private emitProgress() {
    const progress = this.program.length ? Math.min(95, Math.round((this.program.length / MAX_PROGRAM_BLOCKS) * 100)) : 0;
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
