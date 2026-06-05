import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../shared/contracts/platformCommands";
import { COMMANDS, LEVELS, MACHINES, getCommand, getMachine } from "../data/levels";
import type { CommandDefinition, CommandId, FactoryLevel, MachineDefinition, MachineId, ProgramStep } from "../types";

const GAME_ID = "fabrica-de-maquinas";
const TIMER_BAR_W = 820;
const TIMER_BAR_Y = 48;
const MODAL_SCALE = 1.14;
const MAX_PROGRAM_STEPS = 8;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  panel: 0x102a43,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: FactoryLevel;
  private selectedMachine?: MachineId;
  private program: ProgramStep[] = [];
  private machineObjects: Phaser.GameObjects.GameObject[] = [];
  private commandObjects: Phaser.GameObjects.GameObject[] = [];
  private programObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private productObjects: Phaser.GameObjects.GameObject[] = [];
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
    this.selectedMachine = this.levelConfig.availableMachines.length === 1 ? this.levelConfig.availableMachines[0] : undefined;
    this.program = [];
    this.machineObjects = [];
    this.commandObjects = [];
    this.programObjects = [];
    this.overlayObjects = [];
    this.productObjects = [];
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
    this.createTimerBar();
    this.createHeader();
    this.createFactoryFloor();
    this.createMachinePanel();
    this.createCommandPanel();
    this.createProgramPanel();
    this.createActionButtons();
    this.createProductPreview();
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
    else this.timerBar.setFillStyle(COLORS.red);
  }

  shutdown() {
    this.timerEvent?.destroy();
    this.unsubscribePlatformCommands?.();
  }

  private createBackground() {
    const bgKey = this.getBackgroundKey();
    if (this.textures.exists(bgKey)) {
      this.add.image(640, 360, bgKey)
        .setDisplaySize(1280, 720)
        .setDepth(-100);
      this.add.rectangle(640, 360, 1280, 720, 0x0f172a, 0.14).setDepth(-99);
      return;
    }

    this.add.rectangle(640, 360, 1280, 720, 0x9ee8ff).setDepth(-100);

    const bg = this.add.graphics().setDepth(-99);
    bg.fillStyle(0xc7f6ff, 1);
    bg.fillRoundedRect(0, 0, 1280, 720, 0);
    bg.fillStyle(0x7dd3fc, 0.7);
    bg.fillRoundedRect(0, 226, 1280, 494, 0);
    bg.fillStyle(0x22c55e, 0.88);
    bg.fillRoundedRect(0, 616, 1280, 104, 0);

    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 154;
      bg.fillStyle(i % 2 ? 0x8b5cf6 : 0xf59e0b, 0.28);
      bg.fillRoundedRect(x, 126 + (i % 3) * 20, 98, 72, 18);
    }

    bg.lineStyle(4, 0xffffff, 0.25);
    for (let y = 268; y < 620; y += 52) {
      bg.lineBetween(0, y, 1280, y - 42);
    }
  }

  private getBackgroundKey() {
    return {
      1: "level-1-math-bg",
      2: "level-2-paper-bg",
      3: "level-3-fruit-bg",
    }[this.levelConfig.level];
  }

  private createTimerBar() {
    this.add.rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 28, 0x0f172a, 0.32)
      .setStrokeStyle(3, 0xffffff, 0.85);
    this.timerBar = this.add.rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 18, COLORS.green)
      .setOrigin(0, 0.5);
  }

  private createHeader() {
    this.addSharpText(640, 94, this.levelConfig.title, {
      fontSize: "36px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.addSharpText(640, 132, this.levelConfig.objective, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#0f172a",
      stroke: "#ffffff",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 860 },
    }).setOrigin(0.5);

    this.addSharpText(1082, 105, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.75)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createFactoryFloor() {
    this.drawPanel(70, 158, 1140, 96, COLORS.cyan, 1);
    this.addSharpText(640, 210, this.levelConfig.prompt, {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 5,
      align: "center",
      wordWrap: { width: 1040 },
    }).setOrigin(0.5).setDepth(4);
  }

  private createMachinePanel() {
    this.machineObjects.forEach((object) => object.destroy());
    this.machineObjects = [];

    this.drawPanel(56, 282, 520, 252, COLORS.purple, 1);
    this.drawPanelHeader(316, 282, 340, "1. Escolha a máquina", COLORS.purple);

    const machines = this.levelConfig.availableMachines
      .map((id) => getMachine(id))
      .filter(Boolean) as MachineDefinition[];

    machines.forEach((machine, index) => {
      const x = machines.length === 1 ? 316 : 186 + (index % 2) * 260;
      const y = 388 + Math.floor(index / 2) * 104;
      this.machineObjects.push(...this.createMachineCard(x, y, machine));
    });
  }

  private createMachineCard(x: number, y: number, machine: MachineDefinition) {
    const selected = this.selectedMachine === machine.id;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const width = 232;
    const height = 82;
    const card = this.add.container(x, y).setDepth(12);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.24);
    shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 7, width, height, 20);

    const bg = this.add.graphics();
    bg.fillStyle(machine.color, selected ? 1 : 0.82);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    bg.fillStyle(0xffffff, 0.17);
    bg.fillRoundedRect(-width / 2 + 10, -height / 2 + 9, 66, height - 18, 16);
    bg.lineStyle(selected ? 5 : 3, selected ? 0xfde68a : 0xffffff, selected ? 1 : 0.86);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    const assetKey = this.getMachineAssetKey(machine.id);
    const icon = this.textures.exists(assetKey)
      ? this.fitImage(this.add.image(-76, -2, assetKey), 62, 62)
      : this.addSharpText(-76, -2, machine.icon, {
          fontSize: "32px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#0f172a",
          strokeThickness: 4,
        }).setOrigin(0.5);

    const text = this.addSharpText(32, 0, machine.shortName, {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 126 },
    }).setOrigin(0.5);

    card.add([shadow, bg, icon, text]);
    card.setSize(width, height);
    const hitZone = this.createTapZone(x, y, width, height, 40, () => {
      if (this.commandLocked) return;
      this.playClick();
      this.startTimerOnce();
      this.selectedMachine = machine.id;
      this.createMachinePanel();
      this.createCommandPanel();
    });

    objects.push(card, hitZone);
    return objects;
  }

  private getMachineAssetKey(machineId: MachineId) {
    return `machine-${machineId === "calculator" ? "calculator" : machineId === "folder" ? "folder" : machineId}`;
  }

  private createCommandPanel() {
    this.commandObjects.forEach((object) => object.destroy());
    this.commandObjects = [];

    this.drawPanel(612, 282, 610, 252, COLORS.blue, 1);
    this.drawPanelHeader(917, 282, 330, "2. Escolha comandos", COLORS.blue);

    const selected = getMachine(this.selectedMachine ?? "");
    if (!selected) {
      this.commandObjects.push(this.addSharpText(917, 406, "Toque em uma máquina para ver os comandos que ela entende.", {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 450 },
      }).setOrigin(0.5).setDepth(12));
      return;
    }

    this.commandObjects.push(this.addSharpText(917, 328, `${selected.shortName} entende:`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(12));

    const commands = this.levelConfig.availableCommands
      .map((id) => getCommand(id))
      .filter((command): command is CommandDefinition => Boolean(command) && command.machine === selected.id)
      .sort(() => Phaser.Math.FloatBetween(-1, 1));

    commands.forEach((command, index) => {
      const x = 780 + (index % 2) * 274;
      const y = 414 + Math.floor(index / 2) * 88;
      this.commandObjects.push(...this.createCommandButton(x, y, command));
    });
  }

  private createCommandButton(x: number, y: number, command: CommandDefinition) {
    const width = 236;
    const height = 72;
    const machine = getMachine(command.machine);
    const color = machine?.color ?? COLORS.blue;
    const button = this.add.container(x, y).setDepth(12);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    bg.lineStyle(3, 0xffffff, 0.92);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);

    const commandAssetKey = this.getCommandAssetKey(command.id);
    const icon = this.textures.exists(commandAssetKey)
      ? this.fitImage(this.add.image(-82, -1, commandAssetKey), 58, 58)
      : this.addSharpText(-82, -1, command.icon, {
          fontSize: command.icon.length > 1 ? "24px" : "30px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#0f172a",
          strokeThickness: 4,
        }).setOrigin(0.5);

    const label = this.addSharpText(34, 0, command.label, {
      fontSize: command.label.length > 13 ? "15px" : "17px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 136 },
    }).setOrigin(0.5);

    button.add([bg, icon, label]);
    button.setSize(width, height);
    const hitZone = this.createTapZone(x, y, width, height, 40, () => this.addProgramStep(command));
    return [button, hitZone];
  }

  private createProgramPanel() {
    this.drawPanel(56, 574, 690, 104, COLORS.cyan, 1);
    this.drawPanelHeader(401, 574, 310, "3. Linha de produção", COLORS.cyan);
    this.renderProgram();
  }

  private createActionButtons() {
    this.createUiButton(846, 688, 150, 58, "Executar", COLORS.green, () => this.executeProgram());
    this.createUiButton(1008, 688, 150, 58, "Desfazer", COLORS.orange, () => this.undoCommand());
    this.createUiButton(1162, 688, 126, 58, "Limpar", COLORS.red, () => this.clearProgram());
  }

  private createProductPreview() {
    this.drawPanel(780, 548, 440, 126, COLORS.green, 1);
    this.drawPanelHeader(1000, 548, 260, "Produto final", COLORS.green);
    this.drawProductPlaceholder(false);
  }

  private drawProductPlaceholder(success: boolean) {
    this.productObjects.forEach((object) => object.destroy());
    this.productObjects = [];

    const icon = success ? "*" : "?";
    const title = success ? this.levelConfig.successProduct : "Aguardando execução";
    const color = success ? COLORS.green : 0x64748b;

    const badge = this.add.graphics().setDepth(12);
    badge.fillStyle(color, 0.95);
    badge.fillRoundedRect(804, 594, 86, 58, 16);
    badge.lineStyle(3, 0xffffff, 0.92);
    badge.strokeRoundedRect(804, 594, 86, 58, 16);
    this.productObjects.push(badge);

    const productKey = success ? this.getProductAssetKey() : "";
    if (success && this.textures.exists(productKey)) {
      this.productObjects.push(this.fitImage(this.add.image(847, 623, productKey), 78, 78).setDepth(13));
    } else {
      this.productObjects.push(this.addSharpText(847, 623, icon, {
        fontSize: "33px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(13));
    }

    this.productObjects.push(this.addSharpText(1048, 623, title, {
      fontSize: success ? "20px" : "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 300 },
    }).setOrigin(0.5).setDepth(13));
  }

  private getProductAssetKey() {
    return {
      1: "product-number-10",
      2: "product-folded-paper",
      3: "product-fruit-drink-star",
    }[this.levelConfig.level];
  }

  private getCommandAssetKey(commandId: CommandId) {
    return {
      add2: "command-add2",
      double: "command-double",
      fold: "command-fold",
      crease: "command-crease",
      stampStar: "command-stamp-star",
      stampOk: "command-stamp-ok",
      addFruit: "command-add-fruit",
      blend: "command-blend",
    }[commandId];
  }

  private addProgramStep(command: CommandDefinition) {
    if (this.commandLocked) return;
    this.startTimerOnce();

    if (!this.selectedMachine) return;
    const selected = getMachine(this.selectedMachine);
    if (!selected?.acceptedCommands.includes(command.id)) {
      this.errors += 1;
      this.playWrong();
      this.showToast(`${selected?.shortName ?? "Esta máquina"} não entende "${command.label}".`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }

    if (this.program.length >= MAX_PROGRAM_STEPS) {
      this.showToast("A linha está cheia. Apague um comando para tentar outro caminho.", COLORS.orange);
      return;
    }

    this.playClick();
    this.program.push({ machine: this.selectedMachine, command: command.id });
    this.renderProgram();
    this.emitProgress();
  }

  private undoCommand() {
    if (this.commandLocked || !this.program.length) return;
    this.playClick();
    this.program.pop();
    this.renderProgram();
    this.emitProgress();
  }

  private clearProgram() {
    if (this.commandLocked) return;
    this.playClick();
    this.program = [];
    this.drawProductPlaceholder(false);
    this.renderProgram();
    this.emitProgress();
  }

  private renderProgram() {
    this.programObjects.forEach((object) => object.destroy());
    this.programObjects = [];
    const hasStart = Boolean(this.levelConfig.startLabel);
    const startX = hasStart ? 102 : 104;
    const firstCommandX = hasStart ? 194 : 112;
    const stepGap = 78;
    const y = 632;

    if (hasStart) {
      this.drawProgramStartBlock(startX, y, this.levelConfig.startLabel ?? "");
    }

    if (!this.program.length) {
      this.programObjects.push(this.addSharpText(hasStart ? 420 : 398, 632, "Os comandos escolhidos aparecem aqui, na ordem em que serão executados.", {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: hasStart ? 450 : 560 },
      }).setOrigin(0.5).setDepth(13));
      return;
    }

    if (hasStart) {
      this.drawProgramArrow(150, y);
    }

    this.program.forEach((step, index) => {
      const machine = getMachine(step.machine);
      const command = getCommand(step.command);
      const x = firstCommandX + index * stepGap;

      const block = this.add.graphics().setDepth(12);
      block.fillStyle(machine?.color ?? COLORS.blue, 0.96);
      block.fillRoundedRect(x - 32, y - 25, 64, 50, 14);
      block.lineStyle(3, 0xffffff, 0.9);
      block.strokeRoundedRect(x - 32, y - 25, 64, 50, 14);
      this.programObjects.push(block);

      if (index > 0) {
        this.drawProgramArrow(x - 40, y);
      }

      this.programObjects.push(this.addSharpText(x, y - 10, machine?.icon ?? "?", {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(13));

      const commandAssetKey = command ? this.getCommandAssetKey(command.id) : "";
      if (command && this.textures.exists(commandAssetKey)) {
        this.programObjects.push(this.fitImage(this.add.image(x, y + 13, commandAssetKey), 32, 24).setDepth(13));
      } else {
        this.programObjects.push(this.addSharpText(x, y + 12, command?.icon ?? "?", {
          fontSize: "14px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
          stroke: "#0f172a",
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(13));
      }
    });
  }

  private drawProgramStartBlock(x: number, y: number, label: string) {
    const block = this.add.graphics().setDepth(12);
    block.fillStyle(0x0f172a, 0.78);
    block.fillRoundedRect(x - 34, y - 25, 68, 50, 15);
    block.lineStyle(3, 0xfde68a, 0.95);
    block.strokeRoundedRect(x - 34, y - 25, 68, 50, 15);
    this.programObjects.push(block);

    this.programObjects.push(this.addSharpText(x, y - 12, "início", {
      fontSize: "10px",
      fontFamily: "Arial Black, Arial",
      color: "#fde68a",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(13));

    this.programObjects.push(this.addSharpText(x, y + 9, label, {
      fontSize: label.length > 2 ? "14px" : "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(13));
  }

  private drawProgramArrow(x: number, y: number) {
    this.programObjects.push(this.addSharpText(x, y, "→", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(13));
  }

  private async executeProgram() {
    if (this.commandLocked || !this.program.length) return;
    this.playClick();
    this.startTimerOnce();
    this.commandLocked = true;
    this.drawProductPlaceholder(false);

    for (let i = 0; i < this.program.length; i++) {
      await this.flashProgramStep(i);
    }

    if (this.isProgramCorrect()) {
      this.hits += 1;
      this.playCorrect();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
      this.drawProductPlaceholder(true);
      this.emitProgress();
      this.time.delayedCall(800, () => this.handleLevelSuccess());
      return;
    }

    this.errors += 1;
    this.commandLocked = false;
    this.playWrong();
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.showToast(this.levelConfig.hint, COLORS.red);
    this.emitProgress();
  }

  private flashProgramStep(index: number) {
    return new Promise<void>((resolve) => {
      const x = (this.levelConfig.startLabel ? 194 : 112) + index * 78;
      const glow = this.add.graphics().setDepth(14);
      glow.lineStyle(5, 0xfde68a, 1);
      glow.strokeRoundedRect(x - 36, 632 - 29, 72, 58, 16);
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 260,
        delay: 120,
        onComplete: () => {
          glow.destroy();
          resolve();
        },
      });
    });
  }

  private isProgramCorrect() {
    if (this.program.length !== this.levelConfig.solution.length) return false;
    return this.levelConfig.solution.every((expected, index) => {
      const actual = this.program[index];
      return actual?.machine === expected.machine && actual?.command === expected.command;
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

    const title = this.addSharpText(0, -58, "Parabéns!", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const score = this.addSharpText(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 48, this.levelConfig.successProduct, {
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

    const waitText = this.addSharpText(0, 132, "Preparando a próxima estação...", {
      fontSize: "15px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
    }).setOrigin(0.5);

    modal.add([shadow, bg, topBar, badgeIcon, title, score, detail, ...dots, waitText]);
    modal.setScale(MODAL_SCALE * 0.9);
    modal.setAlpha(0);
    this.tweens.add({ targets: modal, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });

    this.time.delayedCall(1800, () => this.showNextLevelStartTransition(nextLevel));
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

    const title = this.addSharpText(0, -102, `Nível ${nextLevel}`, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const objective = this.addSharpText(0, -42, nextConfig?.title ?? "Nova estação", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);

    const detail = this.addSharpText(0, 12, nextConfig?.objective ?? "Use a máquina certa.", {
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
    const buttonText = this.addSharpText(0, 0, "Iniciar nível", {
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
    this.tweens.add({ targets: modal, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
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

    const title = this.addSharpText(0, -128, "Fábrica concluída!", {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.addSharpText(0, -76, `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
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

    const badge = this.addSharpText(0, -26, "Cada máquina entende seu próprio conjunto de instruções.", {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
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
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });
  }

  private createFinalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const width = 264;
    const height = 52;
    const button = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 26);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 26);
    const text = this.addSharpText(0, 0, label, {
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

  private createUiButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y).setDepth(12);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.98);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    bg.lineStyle(3, 0xffffff, 0.92);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);
    const text = this.addSharpText(0, 0, label, {
      fontSize: width < 120 ? "13px" : width < 140 ? "14px" : "16px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5);
    button.add([bg, text]);
    button.setSize(width, height);
    this.createTapZone(x, y, width, height, 40, onClick);
    return button;
  }

  private createTapZone(x: number, y: number, width: number, height: number, depth: number, onClick: () => void) {
    const zone = this.add.zone(x, y, width, height).setDepth(depth);
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerdown", onClick);
    return zone;
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const texture = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = texture.width || maxWidth;
    const sourceHeight = texture.height || maxHeight;
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
    return image;
  }

  private addSharpText(
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    const textObject = this.add.text(x, y, text, style);
    textObject.setResolution(2);
    return textObject;
  }

  private drawPanel(x: number, y: number, width: number, height: number, accentColor: number, depth: number) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.22);
    shadow.fillRoundedRect(x + 10, y + 12, width, height, 26);
    shadow.setDepth(depth);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.34);
    panel.fillRoundedRect(x, y, width, height, 26);
    panel.fillStyle(0xffffff, 0.12);
    panel.fillRoundedRect(x + 10, y + 10, width - 20, 32, 16);
    panel.lineStyle(4, 0xffffff, 0.92);
    panel.strokeRoundedRect(x, y, width, height, 26);
    panel.lineStyle(2, accentColor, 0.48);
    panel.strokeRoundedRect(x + 5, y + 5, width - 10, height - 10, 22);
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
    const text = this.addSharpText(0, 0, label, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);
    container.add([shadow, bg, text]);
    return container;
  }

  private showToast(message: string, color: number) {
    const container = this.add.container(640, 640).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-410, -34, 820, 68, 22);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-410, -34, 820, 68, 22);
    const text = this.addSharpText(0, 0, message, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 750 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.tweens.add({
      targets: container,
      y: 620,
      alpha: 0,
      delay: 1550,
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
        this.showToast("Tempo esgotado. Tente montar uma linha mais direta.", COLORS.red);
      },
    });
  }

  private emitProgress() {
    const progress = this.program.length ? Math.min(95, Math.round((this.program.length / MAX_PROGRAM_STEPS) * 100)) : 0;
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

