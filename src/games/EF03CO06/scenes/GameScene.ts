import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import type { DeviceId, InterfaceLevel, SlotId } from "../types";
import { DEVICES, LEVELS, shuffleDevices } from "../data/levels";

const GAME_ID = "central-de-entrada-e-saida";
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const CARD_W = 150;
const CARD_H = 150;
const SLOT_W = 390;
const SLOT_H = CARD_H;
const MODAL_SCALE = 1.14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  cream: 0xfff6e8,
  ink: 0x102a43,
};

const LEVEL_CATEGORIES: Record<number, { icon: string; label: string; color: number }> = {
  1: { icon: "🎵", label: "Áudio", color: COLORS.blue },
  2: { icon: "🎥", label: "Vídeo", color: COLORS.purple },
  3: { icon: "⌨", label: "Periféricos", color: COLORS.green },
};

const LEVEL_ICON_KEYS: Record<number, string> = {
  1: "icon-audio",
  2: "icon-video",
  3: "icon-periferico",
};

const DEVICE_TEXTURES: Partial<Record<DeviceId, string>> = {
  camera: "device-camera",
  controller: "device-controller",
  keyboard: "device-keyboard",
  microphone: "device-microphone",
  monitor: "device-monitor",
  mouse: "device-mouse",
  printer: "device-printer",
  speaker: "device-speaker",
};

type CardRecord = {
  id: DeviceId;
  card: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
  homeX: number;
  homeY: number;
  slotId: SlotId | null;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: InterfaceLevel;
  private devices: DeviceId[] = [];
  private cards = new Map<DeviceId, CardRecord>();
  private slotRects = new Map<SlotId, Phaser.Geom.Rectangle>();
  private slotContents = new Map<SlotId, DeviceId[]>();
  private slotLabels = new Map<SlotId, Phaser.GameObjects.Text>();
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private hasStartedTimer = false;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((item) => item.level === level) ?? LEVELS[0];
    this.devices = shuffleDevices(this.levelConfig.devices);
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.commandLocked = false;
    this.hasStartedTimer = false;
    this.cards.clear();
    this.slotRects.clear();
    this.slotContents.clear();
    this.slotLabels.clear();
    this.overlayObjects = [];
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createInfoButton();
    this.createComputerPanel();
    this.createSlotsPanel();
    this.createDevicesPanel();
    this.createActionButton();
    this.emitProgress();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(0, this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.orange : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  shutdown() {
    this.timerEvent?.destroy();
    this.input.setDefaultCursor("default");
  }

  private createBackground() {
    const key = this.levelConfig.level === 2 ? "bg-input-output-lab" : "bg-interface-central";
    const bg = this.add.image(640, 360, key).setDepth(-100);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.1).setDepth(-98);
    this.add.rectangle(640, 360, 1280, 720, 0x102a43, 0.18).setDepth(-97);
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
    if (width <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, Math.max(0, width), 32, 16);
  }

  private createHeader() {
    this.addSharpText(640, 68, this.levelConfig.title, {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const headerCat = LEVEL_CATEGORIES[this.levelConfig.level];
    this.addSharpText(1084, 96, `${headerCat.icon}  Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.78)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createInfoButton() {
    const x = 198;
    const y = 76;
    const button = this.add.container(x, y).setDepth(120);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.blue, 0.96);
    bg.fillCircle(0, 0, 24);
    bg.lineStyle(4, 0xffffff, 0.96);
    bg.strokeCircle(0, 0, 24);
    const label = this.addSharpText(0, -1, "i", {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([bg, label]);

    const hitbox = this.add.zone(x, y, 64, 64).setDepth(121);
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: button, scale: 1.08, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerdown", () => {
      this.playClick();
      this.showInfoModal();
    });
  }

  private showInfoModal() {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-286, -152, 572, 304, 30);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-298, -164, 596, 312, 30);
    bg.lineStyle(6, 0xffffff, 0.96);
    bg.strokeRoundedRect(-298, -164, 596, 312, 30);
    const title = this.addSharpText(0, -102, "Como jogar", {
      fontSize: "34px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);
    const text = this.addSharpText(0, -18, this.getInfoText(), {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5);
    const close = this.createModalButton(0, 104, "Entendi", COLORS.orange);
    const closeHitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
    closeHitbox.setInteractive({ useHandCursor: true });
    closeHitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: close, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    closeHitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: close, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    closeHitbox.on("pointerdown", () => {
      this.playClick();
      this.clearOverlay();
    });

    modal.add([shadow, bg, title, text, close]);
    this.animateModal(modal);
  }

  private getInfoText() {
    if (this.levelConfig.level === 1) {
      return "Arraste cada dispositivo para Entrada ou Saída.";
    }
    if (this.levelConfig.level === 2) {
      return "Na videochamada, separe os dispositivos pelo caminho da informação: o que entra no computador e o que sai dele.";
    }
    return "Monte a central para escrever um bilhete no computador e entregar no papel.";
  }

  private createComputerPanel() {
    const PX = 300, PY = 116, PW = 680, PH = 100;
    const panelCX = PX + PW / 2;  // 640
    const panelCY = PY + PH / 2;  // 166

    this.drawPanel(PX, PY, PW, PH, COLORS.blue, 1);

    const ctr = this.add.container(panelCX, panelCY).setDepth(7);

    // Title: 20px below panel top
    const titleY = -PH / 2 + 20;  // container: -30, world: 136

    // Arrow row: 32px below title, centred in the remaining space
    const arrowY = titleY + 32;   // container: 2, world: 168

    // Monitor icon — centred on arrow row, well within panel bounds
    const monitor = this.add.graphics();
    const mW = 60, mH = 34;
    monitor.fillStyle(0x1e293b, 0.95);
    monitor.fillRoundedRect(-mW / 2, arrowY - mH / 2, mW, mH, 7);
    monitor.fillStyle(0x7dd3fc, 0.9);
    monitor.fillRoundedRect(-mW / 2 + 5, arrowY - mH / 2 + 5, mW - 10, mH - 10, 5);

    const titleText = this.addSharpText(0, titleY, "Computador", {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
    }).setOrigin(0.5);

    const textOffsetX = PW / 4;  // 170

    const enterText = this.addSharpText(-textOffsetX, arrowY, "ENTRA →", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#2563eb",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const exitText = this.addSharpText(textOffsetX, arrowY, "→ SAI", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#f59e0b",
      strokeThickness: 5,
    }).setOrigin(0.5);

    ctr.add([monitor, titleText, enterText, exitText]);
  }

  private createSlotsPanel() {
    this.drawPanel(72, 230, 1136, 206, COLORS.purple, 1);
    const spacing = this.levelConfig.slots.length === 1 ? 0 : 430;
    const startX = 640 - ((this.levelConfig.slots.length - 1) * spacing) / 2;
    this.levelConfig.slots.forEach((slot, index) => {
      const x = startX + index * spacing;
      const y = 338;
      this.slotRects.set(slot.id, new Phaser.Geom.Rectangle(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H));
      this.slotContents.set(slot.id, []);
      this.drawSlot(slot.id, x, y, slot.label, index);
    });
  }

  private drawSlot(slotId: SlotId, x: number, y: number, label: string, index: number) {
    const colors = [COLORS.blue, COLORS.orange, COLORS.green];
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(COLORS.cream, 0.78);
    g.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(x - SLOT_W / 2 + 16, y - SLOT_H / 2 + 12, SLOT_W - 32, 34, 16);
    g.lineStyle(6, colors[index % colors.length], 0.9);
    g.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
    // Centered in the white header strip (strip top = y - SLOT_H/2 + 12, height 34)
    this.addSharpText(x, y - SLOT_H / 2 + 29, label, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 330 },
    }).setOrigin(0.5).setDepth(6);
    const countText = this.addSharpText(x, y + 52, "", {
      fontSize: "15px",
      fontFamily: "Arial Black, Arial",
      color: "#475569",
    }).setOrigin(0.5).setDepth(6);
    this.slotLabels.set(slotId, countText);
  }

  private createDevicesPanel() {
    this.drawPanel(72, 454, 1136, 180, COLORS.orange, 1);
    const spacing = this.devices.length <= 5 ? 198 : 168;
    const startX = 640 - ((this.devices.length - 1) * spacing) / 2;
    this.devices.forEach((id, index) => {
      const x = startX + index * spacing;
      const y = 538;
      const { card, hitbox } = this.createDeviceCard(id, x, y);
      this.cards.set(id, { id, card, hitbox, homeX: x, homeY: y, slotId: null });
    });
  }

  private createDeviceCard(id: DeviceId, x: number, y: number) {
    const device = DEVICES[id];
    const card = this.add.container(x, y).setDepth(20);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.13);
    shadow.fillRoundedRect(-CARD_W / 2 + 3, -CARD_H / 2 + 10, CARD_W - 6, CARD_H - 4, 20);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.fillStyle(0xffffff, 0.25);
    bg.fillRoundedRect(-CARD_W / 2 + 14, -CARD_H / 2 + 12, CARD_W - 28, 34, 16);
    bg.lineStyle(4, device.color, 0.88);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    const textureKey = DEVICE_TEXTURES[id];
    const icon = textureKey && this.textures.exists(textureKey)
      ? this.fitImage(this.add.image(0, -28, textureKey), 112, 88)
      : this.addSharpText(0, -24, device.icon, {
          fontSize: "48px",
          fontFamily: "Arial Black, Arial",
          color: this.toCssColor(device.color),
          stroke: "#ffffff",
          strokeThickness: 5,
        }).setOrigin(0.5);
    const label = this.addSharpText(0, 54, device.name, {
      fontSize: device.name.length > 11 ? "13px" : "15px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 128 },
    }).setOrigin(0.5);
    card.add([shadow, bg, icon, label]);

    const hitbox = this.add.zone(x, y, CARD_W + 28, CARD_H + 24).setDepth(80);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });
    hitbox.on("pointerdown", () => this.startTimerOnce());
    this.input.setDraggable(hitbox);
    hitbox.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.commandLocked) return;
      card.setPosition(dragX, dragY);
      hitbox.setPosition(dragX, dragY);
    });
    hitbox.on("dragend", (_pointer: Phaser.Input.Pointer) => this.dropCard(id, card.x, card.y));
    return { card, hitbox };
  }

  private createActionButton() {
    this.createUiButton(640, 682, 360, 46, "Testar conexão", COLORS.green, () => this.validateConnections());
  }

  private dropCard(id: DeviceId, x: number, y: number) {
    if (this.commandLocked) return;
    const targetSlot = [...this.slotRects.entries()].find(([, rect]) => rect.contains(x, y))?.[0] ?? null;
    if (!targetSlot) {
      this.returnCardHome(id);
      return;
    }
    this.placeCardInSlot(id, targetSlot);
  }

  private placeCardInSlot(id: DeviceId, slotId: SlotId) {
    const slot = this.levelConfig.slots.find((item) => item.id === slotId);
    if (!slot) return;
    if (!slot.accepts.includes(id)) {
      this.errors += 1;
      this.playWrong();
      this.showToast(this.levelConfig.hint, COLORS.red);
      this.returnCardHome(id);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }

    const current = this.slotContents.get(slotId) ?? [];
    if (current.includes(id)) return;
    if (current.length >= slot.accepts.length) {
      this.returnCardHome(id);
      return;
    }

    this.removeFromPreviousSlot(id);
    current.push(id);
    this.slotContents.set(slotId, current);

    const record = this.cards.get(id);
    const rect = this.slotRects.get(slotId);
    if (!record || !rect) return;
    record.slotId = slotId;
    const index = current.length - 1;
    const slotCapacity = slot.accepts.length;
    const centerX = slotCapacity > 1 ? rect.centerX - ((slotCapacity - 1) * 168) / 2 + index * 168 : rect.centerX;
    const centerY = rect.centerY;
    this.tweens.add({ targets: [record.card, record.hitbox], x: centerX, y: centerY, duration: 160, ease: "Back.easeOut" });
    record.card.setScale(1);
    this.updateSlotLabel(slotId);
    this.playClick();
    this.emitProgress();
  }

  private removeFromPreviousSlot(id: DeviceId) {
    const record = this.cards.get(id);
    if (!record?.slotId) return;
    const content = this.slotContents.get(record.slotId) ?? [];
    this.slotContents.set(record.slotId, content.filter((item) => item !== id));
    this.updateSlotLabel(record.slotId);
    record.slotId = null;
  }

  private returnCardHome(id: DeviceId) {
    const record = this.cards.get(id);
    if (!record) return;
    this.removeFromPreviousSlot(id);
    record.card.setScale(1);
    this.tweens.add({ targets: [record.card, record.hitbox], x: record.homeX, y: record.homeY, duration: 180, ease: "Sine.easeOut" });
  }

  private updateSlotLabel(slotId: SlotId) {
    const label = this.slotLabels.get(slotId);
    const slot = this.levelConfig.slots.find((item) => item.id === slotId);
    if (!label || !slot) return;
    const count = this.slotContents.get(slotId)?.length ?? 0;
    label.setText("");
    label.setVisible(count === 0);
  }

  private validateConnections() {
    if (this.commandLocked) return;
    this.startTimerOnce();
    const complete = this.levelConfig.slots.every((slot) => {
      const content = this.slotContents.get(slot.id) ?? [];
      return slot.accepts.every((id) => content.includes(id));
    });
    if (!complete) {
      this.errors += 1;
      this.playWrong();
      this.showToast("Ainda falta conectar o dispositivo certo.", COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.emitProgress();
      return;
    }
    this.completeLevel();
  }

  private completeLevel() {
    if (this.commandLocked) return;
    this.commandLocked = true;
    this.timerEvent?.remove(false);
    this.hits += 1;
    this.playSuccess();
    this.animateSignal();
    this.showToast(this.levelConfig.successMessage, COLORS.green, 2500);
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.emitProgress();
    this.time.delayedCall(1700, () => {
      const nextLevel = this.levelConfig.level + 1;
      if (nextLevel <= 3) {
        runtimeGameBridge.emit({ type: "CHECKPOINT", gameId: GAME_ID, stage: nextLevel, progress: 0, score: this.getScore(), hits: this.hits, errors: this.errors });
        this.showLevelCompleteTransition(nextLevel as 1 | 2 | 3);
      } else {
        runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level });
        this.showGameCompleteScreen();
      }
    });
  }

  private animateSignal() {
    const line = this.add.graphics().setDepth(60);
    line.lineStyle(8, COLORS.green, 0.9);
    line.beginPath();
    line.moveTo(240, 438);
    line.lineTo(640, 242);
    line.lineTo(1040, 438);
    line.strokePath();
    this.tweens.add({ targets: line, alpha: 0, duration: 900, delay: 450, onComplete: () => line.destroy() });
  }

  private startTimerOnce() {
    if (this.hasStartedTimer) return;
    this.hasStartedTimer = true;
    this.timerEvent = this.time.delayedCall(this.levelConfig.timeLimit * 1000, () => {
      if (this.commandLocked) return;
      this.commandLocked = true;
      this.errors += 1;
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.showGameOverScreen();
    });
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-292, -178, 584, 370, 30);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-304, -190, 608, 376, 30);
    bg.lineStyle(6, 0xffffff, 0.96);
    bg.strokeRoundedRect(-304, -190, 608, 376, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.orange, 1);
    topBar.fillRoundedRect(-214, -207, 428, 30, 15);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-214, -207, 428, 30, 15);

    const lvl = this.levelConfig.level;
    const cat = LEVEL_CATEGORIES[lvl];
    const title = this.addSharpText(0, -138, "⭐  Parabéns!", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);
    const subtitleIcon = this.fitImage(this.add.image(-130, -82, LEVEL_ICON_KEYS[lvl]), 26, 26).setOrigin(0.5);
    const subtitle = this.addSharpText(-102, -82, `Nível ${lvl} concluído  —  ${cat.label}`, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: this.toCssColor(cat.color),
    }).setOrigin(0, 0.5);
    const learnedTexts: Record<number, string> = {
      1: "Microfone → entra  •  Alto-falante → sai",
      2: "Câmera → entra  •  Monitor → sai",
      3: "Teclado + Mouse → entram  •  Monitor + Impressora → saem",
    };
    const learned = this.addSharpText(0, -36, learnedTexts[lvl] ?? "", {
      fontSize: "16px",
      fontFamily: "Arial Black, Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 520 },
    }).setOrigin(0.5);

    const chipPositions = [-190, 0, 190] as const;
    const chips = ([1, 2, 3] as const).map((level, index) => {
      const chip = this.add.container(chipPositions[index], 30);
      const catDef = LEVEL_CATEGORIES[level];
      const isDone = level <= lvl;
      const isNext = level === nextLevel;
      const chipBg = this.add.graphics();
      chipBg.fillStyle(isDone ? COLORS.green : isNext ? COLORS.orange : 0xd8dde8, isDone || isNext ? 1 : 0.7);
      chipBg.fillRoundedRect(-84, -28, 168, 56, 16);
      chipBg.lineStyle(3, 0xffffff, isDone || isNext ? 1 : 0.5);
      chipBg.strokeRoundedRect(-84, -28, 168, 56, 16);
      const chipIcon = this.fitImage(this.add.image(-30, 0, LEVEL_ICON_KEYS[level]), 26, 26).setOrigin(0.5);
      const chipLabel = this.addSharpText(16, -5, catDef.label, {
        fontSize: "14px",
        fontFamily: "Arial Black, Arial",
        color: isDone || isNext ? "#ffffff" : "#64748b",
      }).setOrigin(0, 0.5);
      if (isDone) {
        const check = this.addSharpText(70, -12, "✓", {
          fontSize: "15px",
          fontFamily: "Arial Black, Arial",
          color: "#ffffff",
        }).setOrigin(0.5);
        chip.add([chipBg, chipIcon, chipLabel, check]);
      } else {
        chip.add([chipBg, chipIcon, chipLabel]);
      }
      return chip;
    });

    const waitText = this.addSharpText(0, 102, "Preparando o próximo nível...", {
      fontSize: "15px",
      fontFamily: "Arial Black, Arial",
      color: "#94a3b8",
    }).setOrigin(0.5);

    modal.add([shadow, bg, topBar, title, subtitleIcon, subtitle, learned, ...chips, waitText]);
    this.animateModal(modal);
    this.time.delayedCall(3500, () => this.showNextLevelStartTransition(nextLevel));
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const cat = LEVEL_CATEGORIES[nextLevel];

    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, cat.color);

    const catIcon = this.fitImage(this.add.image(0, -118, LEVEL_ICON_KEYS[nextLevel]), 64, 64).setOrigin(0.5);
    const nextLabel = this.addSharpText(0, -64, `Próximo:  ${cat.label}`, {
      fontSize: "28px",
      fontFamily: "Arial Black, Arial",
      color: this.toCssColor(cat.color),
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -18, nextConfig?.title ?? "Nova conexão", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const deviceCount = nextConfig?.devices.length ?? 2;
    const deviceHint = this.addSharpText(0, 26, `${deviceCount} dispositivo${deviceCount > 1 ? "s" : ""} para classificar`, {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#94a3b8",
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar ▶", COLORS.orange);

    let hasStartedNextLevel = false;
    const startNextLevel = () => {
      if (hasStartedNextLevel) return;
      hasStartedNextLevel = true;
      this.input.setDefaultCursor("default");
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors });
    };

    const hitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
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
      startNextLevel();
    });
    modal.add([catIcon, nextLabel, title, deviceHint, button]);
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
    const title = this.addSharpText(0, -128, "Central conectada!", {
      fontSize: "38px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.addSharpText(0, -74, "Você dominou os 3 padrões de entrada e saída!", {
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
      const catDef = LEVEL_CATEGORIES[level];
      const badge = this.add.graphics();
      badge.fillStyle(catDef.color, 1);
      badge.fillRoundedRect(-54, -42, 108, 84, 18);
      badge.lineStyle(4, 0xffffff, 0.95);
      badge.strokeRoundedRect(-54, -42, 108, 84, 18);
      const iconKey = LEVEL_ICON_KEYS[level];
      const catIconImg = this.fitImage(this.add.image(0, -16, iconKey), 52, 38).setOrigin(0.5);
      const catLabelText = this.addSharpText(0, 16, catDef.label, {
        fontSize: "13px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
      }).setOrigin(0.5);
      const checkText = this.addSharpText(0, 34, "✓ ok", {
        fontSize: "11px",
        fontFamily: "Arial Black, Arial",
        color: "rgba(255,255,255,0.85)",
      }).setOrigin(0.5);
      item.add([badge, catIconImg, catLabelText, checkText]);
      return item;
    });
    const playAgain = this.createFinalButton(-158, 138, "Jogar novamente", COLORS.green, () => this.scene.restart({ level: 1 }));
    const exit = this.createFinalButton(158, 138, "Voltar aos jogos", COLORS.orange, () => EventBus.emit("exit-game"));
    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, ...levelLabels, playAgain, exit]);
    this.animateModal(panel);
  }

  private showGameOverScreen() {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.60).setDepth(450));
    overlay.setInteractive();

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-270, -152, 540, 316, 28);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-278, -164, 556, 320, 28);
    bg.lineStyle(5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-278, -164, 556, 320, 28);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-196, -180, 392, 28, 14);
    topBar.lineStyle(3, 0xffffff, 0.82);
    topBar.strokeRoundedRect(-196, -180, 392, 28, 14);

    const cat = LEVEL_CATEGORIES[this.levelConfig.level];
    const icon = this.addSharpText(0, -104, "⏱", { fontSize: "52px" }).setOrigin(0.5);
    const title = this.addSharpText(0, -46, "Tempo esgotado!", this.modalTitleStyle()).setOrigin(0.5);
    const levelLine = this.addSharpText(0, 4, `${cat.icon}  Nível ${this.levelConfig.level}  —  ${cat.label}`, {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: this.toCssColor(cat.color),
    }).setOrigin(0.5);
    const hint = this.addSharpText(0, 44, "Tente conectar os dispositivos mais rápido!", {
      fontSize: "17px",
      fontFamily: "Arial Black, Arial",
      color: "#475569",
      align: "center",
      wordWrap: { width: 460 },
    }).setOrigin(0.5);

    const retryBtn = this.createModalButton(-132, 108, "🔄 Tentar novamente", COLORS.green);
    const exitBtn = this.createModalButton(132, 108, "Sair", COLORS.orange);

    const retryHitbox = this.addOverlayObject(this.add.zone(640 - 132 * MODAL_SCALE, 360 + 108 * MODAL_SCALE, 268 * MODAL_SCALE, 70 * MODAL_SCALE).setDepth(452));
    retryHitbox.setInteractive({ useHandCursor: true });
    retryHitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: retryBtn, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    retryHitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: retryBtn, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    retryHitbox.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: this.levelConfig.level, hits: this.hits, errors: this.errors });
    });

    const exitHitbox = this.addOverlayObject(this.add.zone(640 + 132 * MODAL_SCALE, 360 + 108 * MODAL_SCALE, 268 * MODAL_SCALE, 70 * MODAL_SCALE).setDepth(452));
    exitHitbox.setInteractive({ useHandCursor: true });
    exitHitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: exitBtn, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    exitHitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: exitBtn, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    exitHitbox.on("pointerdown", () => {
      this.playClick();
      EventBus.emit("exit-game");
    });

    modal.add([shadow, bg, topBar, icon, title, levelLine, hint, retryBtn, exitBtn]);
    this.animateModal(modal);
    this.playWrong();
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

  private createUiButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y).setDepth(35);
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
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    button.add([shadow, bg, text]);
    const zone = this.add.zone(x, y, width + 14, height + 14).setDepth(90);
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    zone.on("pointerout", () => this.input.setDefaultCursor("default"));
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

  private showToast(message: string, color: number, duration = 2300) {
    const container = this.add.container(640, 616).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -52, 1000, 104, 28);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-500, -52, 1000, 104, 28);
    const text = this.addSharpText(0, 0, message, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      lineSpacing: 5,
      wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.tweens.add({ targets: container, y: 596, alpha: 0, duration: 320, delay: duration, onComplete: () => container.destroy() });
  }

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(object: T) {
    this.overlayObjects.push(object);
    return object;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((object) => object.destroy());
    this.overlayObjects = [];
    this.input.setDefaultCursor("default");
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

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.min(maxW / image.width, maxH / image.height);
    image.setScale(scale);
    return image;
  }

  private toCssColor(color: number) {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  private getScore() {
    return Math.max(0, this.hits * 20 - this.errors * 5);
  }

  private emitProgress() {
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      progress: Math.round((this.levelConfig.level / 3) * 100),
      score: this.getScore(),
      hits: this.hits,
      errors: this.errors,
    });
  }

  private playClick() {
    this.playTone(520, 0.05, "sine", 0.05);
  }

  private playSuccess() {
    this.playTone(740, 0.12, "triangle", 0.06);
    this.time.delayedCall(90, () => this.playTone(980, 0.12, "triangle", 0.05));
  }

  private playWrong() {
    this.playTone(190, 0.16, "sawtooth", 0.04);
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  }
}
