import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, areListsEqual } from "../data/levels";
import type { CardData, ListLevel, ListLevelNumber } from "../types";

const GAME_ID = "baralho-das-listas";
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 30;
const MODAL_SCALE = 1.14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  yellow: 0xfacc15,
  ink: 0x102a43,
  felt: 0x15803d,
};

type CardView = {
  id: string;
  container: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: ListLevel;
  private currentCards: CardData[] = [];
  private actionCards: CardData[] = [];
  private selectedActionId: string | null = null;
  private cardViews: CardView[] = [];
  private gapViews: Phaser.GameObjects.Zone[] = [];
  private dynamicObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;
  private hasStartedTimer = false;
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private actionCount = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as ListLevelNumber;
    this.levelConfig = LEVELS.find((item) => item.level === level) ?? LEVELS[0];
    this.currentCards = this.levelConfig.initialCards.map((card) => ({ ...card }));
    this.actionCards = this.levelConfig.actionCards.map((card) => ({ ...card }));
    this.selectedActionId = null;
    this.cardViews = [];
    this.gapViews = [];
    this.dynamicObjects = [];
    this.overlayObjects = [];
    this.hasStartedTimer = false;
    this.commandLocked = false;
    this.actionCount = 0;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createInfoButton();
    this.createStaticLayout();
    this.renderBoard();
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
    const bgKey =
      this.levelConfig.level === 1
        ? "bg-card-table-insert"
        : this.levelConfig.level === 2
          ? "bg-card-table-joker"
          : "bg-card-table-challenge";
    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    bg.setDisplaySize(1280, 720);
    const table = this.add.graphics().setDepth(-80);
    table.fillStyle(0x92400e, 0.28);
    table.fillRoundedRect(40, 166, 1200, 510, 34);
    table.fillStyle(COLORS.felt, 0.4);
    table.fillRoundedRect(70, 192, 1140, 454, 30);
    table.lineStyle(8, 0xffffff, 0.7);
    table.strokeRoundedRect(70, 192, 1140, 454, 30);
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.08).setDepth(-70);
    this.add.rectangle(640, 360, 1280, 720, 0x0f172a, 0.1).setDepth(-69);
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
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const missionCard = this.add.graphics().setDepth(5);
    missionCard.fillStyle(0xffffff, 0.84);
    missionCard.fillRoundedRect(230, 96, 820, 44, 22);
    missionCard.fillStyle(COLORS.yellow, 0.18);
    missionCard.fillRoundedRect(242, 104, 796, 20, 10);
    missionCard.lineStyle(4, COLORS.orange, 0.9);
    missionCard.strokeRoundedRect(230, 96, 820, 44, 22);
    missionCard.lineStyle(3, 0xffffff, 0.95);
    missionCard.strokeRoundedRect(234, 100, 812, 36, 18);

    this.addSharpText(640, 119, this.levelConfig.objective, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 760 },
    }).setOrigin(0.5).setDepth(6);

    this.addSharpText(1144, 100, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.78)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createInfoButton() {
    const x = 202;
    const y = 96;
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

  private createStaticLayout() {
    this.drawPanel(110, 174, 1060, 126, COLORS.blue, 1);
    this.drawSectionHeader(640, 164, "Lista ordenada");
    this.drawPanel(110, 318, 1060, 142, COLORS.purple, 1);
    this.drawSectionHeader(640, 334, "Cartas para usar");
    this.drawPanel(110, 480, 1060, 116, COLORS.cyan, 1);
    this.drawSectionHeader(640, 496, "Vizinhos da posição");
  }

  private renderBoard() {
    this.dynamicObjects.forEach((object) => object.destroy());
    this.dynamicObjects = [];
    this.cardViews = [];
    this.gapViews = [];

    this.renderList();
    this.renderActionCards();
    this.renderNeighborPanel();
  }

  private renderList() {
    const gapCount = this.currentCards.length + 1;
    const cardW = 88;
    const gapW = 34;
    const spacing = 14;
    const totalW = this.currentCards.length * cardW + gapCount * gapW + (this.currentCards.length + gapCount - 1) * spacing;
    let x = 640 - totalW / 2 + gapW / 2;
    const y = 250;

    for (let i = 0; i < gapCount; i += 1) {
      this.createGap(x, y, i);
      x += gapW / 2 + spacing + cardW / 2;
      if (i < this.currentCards.length) {
        this.createCard(this.currentCards[i], x, y, "list");
        x += cardW / 2 + spacing + gapW / 2;
      }
    }
  }

  private renderActionCards() {
    if (this.actionCards.length === 0) {
      const text = this.addDynamic(this.addSharpText(640, 397, "Toque nas cartas da lista para trocar por coringa.", {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#1e3a8a",
        strokeThickness: 4,
        align: "center",
      }).setOrigin(0.5).setDepth(12));
      return text;
    }

    const startX = 640 - ((this.actionCards.length - 1) * 120) / 2;
    this.actionCards.forEach((card, index) => {
      this.createCard(card, startX + index * 120, 398, "action");
    });
  }

  private renderNeighborPanel() {
    const text = this.getNeighborText();
    const marker = this.textures.exists("neighbor-marker")
      ? this.addDynamic(this.fitImage(this.add.image(226, 550, "neighbor-marker").setDepth(12), 72, 72))
      : null;
    this.addDynamic(this.addSharpText(marker ? 670 : 640, 550, text, {
      fontSize: "23px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: marker ? 800 : 920 },
    }).setOrigin(0.5).setDepth(12));
  }

  private getNeighborText() {
    if (this.levelConfig.mode === "replace") {
      const count = this.currentCards.filter((card) => card.value === this.levelConfig.targetValue && !card.joker).length;
      return count > 0 ? `Ainda faltam ${count} carta(s) de valor 7.` : "Todos os 7 foram substituídos.";
    }
    if (!this.selectedActionId) return this.levelConfig.instruction;
    const card = this.actionCards.find((item) => item.id === this.selectedActionId);
    if (!card) return this.levelConfig.instruction;
    const insertIndex = this.findSortedIndex(card.value);
    const left = this.currentCards[insertIndex - 1]?.label ?? "início";
    const right = this.currentCards[insertIndex]?.label ?? "fim";
    return `${card.label} deve ficar depois de ${left} e antes de ${right}.`;
  }

  private createGap(x: number, y: number, index: number) {
    const container = this.addDynamic(this.add.container(x, y).setDepth(20));
    const bg = this.add.graphics();
    const active = Boolean(this.selectedActionId);
    let slotImage: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists("slot-insert-card")) {
      slotImage = this.fitImage(this.add.image(0, 0, "slot-insert-card"), 48, 104);
      slotImage.setAlpha(active ? 1 : 0.58);
      container.add(slotImage);
    } else {
      bg.fillStyle(active ? COLORS.yellow : 0xffffff, active ? 0.86 : 0.5);
      bg.fillRoundedRect(-17, -48, 34, 96, 16);
      bg.lineStyle(3, active ? COLORS.orange : 0xffffff, 0.95);
      bg.strokeRoundedRect(-17, -48, 34, 96, 16);
      const plus = this.addSharpText(0, 0, "+", {
        fontSize: "28px",
        fontFamily: "Arial Black, Arial",
        color: active ? "#92400e" : "#64748b",
        stroke: "#ffffff",
        strokeThickness: 3,
      }).setOrigin(0.5);
      container.add([bg, plus]);
    }

    const hitbox = this.addDynamic(this.add.zone(x, y, 62, 126).setDepth(80));
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    hitbox.on("pointerout", () => this.input.setDefaultCursor("default"));
    hitbox.on("pointerdown", () => this.insertSelectedAt(index));
    this.gapViews.push(hitbox);
  }

  private createCard(card: CardData, x: number, y: number, area: "list" | "action") {
    const selected = area === "action" && this.selectedActionId === card.id;
    const container = this.addDynamic(this.add.container(x, y).setDepth(25));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.22);
    shadow.fillRoundedRect(-42, -52, 88, 106, 14);
    const border = selected ? COLORS.yellow : this.getSuitColor(card);
    const textureKey = this.getCardTexture(card);
    if (textureKey && this.textures.exists(textureKey)) {
      const image = this.fitImage(this.add.image(0, -2, textureKey), 88, 108);
      const outline = this.add.graphics();
      outline.lineStyle(selected ? 6 : 0, border, 1);
      if (selected) outline.strokeRoundedRect(-48, -60, 96, 116, 16);
      container.add(selected ? [shadow, image, outline] : [shadow, image]);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(card.joker ? 0xfef3c7 : 0xffffff, 0.98);
      bg.fillRoundedRect(-44, -56, 88, 106, 14);
      bg.fillStyle(card.joker ? 0xfacc15 : 0xffffff, 0.18);
      bg.fillRoundedRect(-34, -46, 68, 28, 12);
      bg.lineStyle(selected ? 6 : 4, border, 1);
      bg.strokeRoundedRect(-44, -56, 88, 106, 14);
      const label = this.addSharpText(0, -13, card.joker ? "★" : card.label, {
        fontSize: card.joker ? "38px" : "36px",
        fontFamily: "Arial Black, Arial",
        color: this.toCssColor(card.joker ? COLORS.orange : this.getSuitColor(card)),
        stroke: "#ffffff",
        strokeThickness: 4,
      }).setOrigin(0.5);
      const suit = this.addSharpText(0, 28, this.getSuitLabel(card), {
        fontSize: "18px",
        fontFamily: "Arial Black, Arial",
        color: this.toCssColor(this.getSuitColor(card)),
      }).setOrigin(0.5);
      container.add([shadow, bg, label, suit]);
    }

    const hitbox = this.addDynamic(this.add.zone(x, y, 112, 128).setDepth(90));
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: container, scale: 1.04, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: container, scale: 1, duration: 90, ease: "Sine.easeOut" });
    });
    hitbox.on("pointerdown", () => {
      if (area === "action") this.selectActionCard(card.id);
      else this.handleListCardTap(card.id);
    });
    this.cardViews.push({ id: card.id, container, hitbox });
  }

  private selectActionCard(id: string) {
    this.startTimerOnce();
    this.playClick();
    this.selectedActionId = this.selectedActionId === id ? null : id;
    this.renderBoard();
  }

  private handleListCardTap(id: string) {
    this.startTimerOnce();
    const card = this.currentCards.find((item) => item.id === id);
    if (!card) return;

    if (this.levelConfig.mode === "replace") {
      if (card.value !== this.levelConfig.targetValue || card.joker) {
        this.showToast("Essa carta não precisa ser trocada.", COLORS.orange, 1600);
        return;
      }
      card.joker = true;
      card.suit = "coringa";
      card.label = "Coringa";
      this.actionCount += 1;
      this.playClick();
      this.renderBoard();
      return;
    }

    if (this.levelConfig.mode === "mixed") {
      if (card.value !== 4) {
        this.showToast("Nesta missão, só o 4 deve sair da lista.", COLORS.orange, 1700);
        return;
      }
      this.currentCards = this.currentCards.filter((item) => item.id !== id);
      this.actionCount += 1;
      this.playClick();
      this.renderBoard();
    }
  }

  private insertSelectedAt(index: number) {
    this.startTimerOnce();
    if (!this.selectedActionId) {
      this.showToast("Escolha uma carta nova antes de tocar no espaço.", COLORS.orange, 1700);
      return;
    }
    const card = this.actionCards.find((item) => item.id === this.selectedActionId);
    if (!card) return;
    this.currentCards.splice(index, 0, { ...card });
    this.actionCards = this.actionCards.filter((item) => item.id !== card.id);
    this.selectedActionId = null;
    this.actionCount += 1;
    this.playClick();
    this.renderBoard();
  }

  private findSortedIndex(value: number) {
    const sortedCards = this.currentCards.filter((card) => !card.joker);
    return sortedCards.findIndex((card) => card.value > value) === -1
      ? this.currentCards.length
      : sortedCards.findIndex((card) => card.value > value);
  }

  private createActionButton() {
    this.createUiButton(640, 650, 360, 54, "Conferir lista", COLORS.green, () => this.validateList());
  }

  private validateList() {
    if (this.commandLocked) return;
    this.startTimerOnce();
    if (!areListsEqual(this.currentCards, this.levelConfig.expectedCards)) {
      this.errors += 1;
      this.playWrong();
      this.showToast(this.levelConfig.hint, COLORS.red, 2600);
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
    this.showToast(this.levelConfig.successMessage, COLORS.green, 2400);
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.emitProgress();
    this.time.delayedCall(2500, () => {
      const nextLevel = this.levelConfig.level + 1;
      if (nextLevel <= 3) {
        runtimeGameBridge.emit({ type: "CHECKPOINT", gameId: GAME_ID, stage: nextLevel, progress: 0, score: this.getScore(), hits: this.hits, errors: this.errors });
        this.showLevelCompleteTransition(nextLevel as ListLevelNumber);
      } else {
        runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level });
        this.showGameCompleteScreen();
      }
    });
  }

  private startTimerOnce() {
    if (this.hasStartedTimer) return;
    this.hasStartedTimer = true;
    this.timerEvent = this.time.delayedCall(this.levelConfig.timeLimit * 1000, () => {
      if (this.commandLocked) return;
      this.errors += 1;
      this.playWrong();
      this.showToast("O tempo acabou. Tente organizar a lista de novo.", COLORS.red, 2100);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.time.delayedCall(2200, () => this.scene.restart({ level: this.levelConfig.level, hits: this.hits, errors: this.errors }));
    });
  }

  private showInfoModal() {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();
    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-296, -164, 592, 328, 30);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.fillRoundedRect(-308, -176, 616, 332, 30);
    bg.lineStyle(6, 0xffffff, 0.96);
    bg.strokeRoundedRect(-308, -176, 616, 332, 30);
    const title = this.addSharpText(0, -110, "Como jogar", this.modalTitleStyle()).setOrigin(0.5);
    const text = this.addSharpText(0, -24, this.getInfoText(), {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
      lineSpacing: 8,
      wordWrap: { width: 520 },
    }).setOrigin(0.5);
    const close = this.createModalButton(0, 108, "Entendi", COLORS.orange);
    const closeHitbox = this.addOverlayObject(this.add.zone(640, 360 + 108 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
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
      return "Uma lista ordenada mantém os valores em sequência. Insira o 6 entre as cartas vizinhas corretas.";
    }
    if (this.levelConfig.level === 2) {
      return "Busque todas as cartas com o valor pedido. Toque nelas para trocar por coringa e preserve a ordem.";
    }
    return "Faça duas manipulações: remova a carta pedida e insira a nova carta sem quebrar a sequência.";
  }

  private showLevelCompleteTransition(nextLevel: ListLevelNumber) {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.orange);
    const badgeIcon = this.add.image(0, -114, "success-badge");
    this.fitImage(badgeIcon, 82, 82);
    const title = this.addSharpText(0, -58, "Lista correta!", this.modalTitleStyle()).setOrigin(0.5);
    const score = this.addSharpText(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
    }).setOrigin(0.5);
    const subtitle = this.addSharpText(0, 34, "A ordem da lista foi preservada.", {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      align: "center",
    }).setOrigin(0.5);
    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics();
      dot.fillStyle(level <= this.levelConfig.level ? COLORS.green : level === nextLevel ? COLORS.orange : 0xd8dde8, 1);
      dot.fillCircle(-28 + index * 28, 74, 8);
      dot.lineStyle(2, 0xffffff, 0.9);
      dot.strokeCircle(-28 + index * 28, 74, 8);
      return dot;
    });
    modal.add([badgeIcon, title, score, subtitle, ...dots]);
    this.animateModal(modal);
    this.time.delayedCall(2200, () => this.showNextLevelStartTransition(nextLevel));
  }

  private showNextLevelStartTransition(nextLevel: ListLevelNumber) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.green);
    const title = this.addSharpText(0, -102, `Nível ${nextLevel} liberado!`, this.modalTitleStyle()).setOrigin(0.5);
    const objective = this.addSharpText(0, -24, nextConfig?.title ?? "Nova lista", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);
    let hasStartedNextLevel = false;
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
      if (hasStartedNextLevel) return;
      hasStartedNextLevel = true;
      this.playClick();
      this.input.setDefaultCursor("default");
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors });
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
    const title = this.addSharpText(0, -128, "Baralho organizado!", {
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
    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 42);
      const badge = this.add.graphics();
      badge.fillStyle(index === 0 ? COLORS.orange : index === 1 ? COLORS.cyan : COLORS.green, 1);
      badge.fillRoundedRect(-54, -42, 108, 84, 18);
      badge.lineStyle(4, 0xffffff, 0.95);
      badge.strokeRoundedRect(-54, -42, 108, 84, 18);
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
      item.add([badge, number, label]);
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
    const zone = this.add.zone(x, y, width + 28, height + 24).setDepth(90);
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
    panel.fillStyle(0xffffff, 0.36);
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

  private drawSectionHeader(x: number, y: number, label: string) {
    return this.addSharpText(x, y, label, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11);
  }

  private showToast(message: string, color: number, duration = 2300) {
    const container = this.add.container(640, 620).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -52, 1000, 104, 28);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-500, -52, 1000, 104, 28);
    const text = this.addSharpText(0, 0, message, {
      fontSize: "21px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      align: "center",
      lineSpacing: 5,
      wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.tweens.add({ targets: container, y: 600, alpha: 0, duration: 320, delay: duration, onComplete: () => container.destroy() });
  }

  private addDynamic<T extends Phaser.GameObjects.GameObject>(object: T) {
    this.dynamicObjects.push(object);
    return object;
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
      fontSize: "34px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
      align: "center",
    };
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    image.setScale(scale);
    return image;
  }

  private getSuitColor(card: CardData) {
    if (card.joker) return COLORS.orange;
    if (card.suit === "copas" || card.suit === "ouros") return COLORS.red;
    return COLORS.ink;
  }

  private getSuitLabel(card: CardData) {
    if (card.joker) return "coringa";
    if (card.suit === "copas") return "♥";
    if (card.suit === "ouros") return "♦";
    if (card.suit === "paus") return "♣";
    return "♠";
  }

  private getCardTexture(card: CardData) {
    if (card.joker) return "card-joker";
    if (card.suit === "copas") {
      const key = `card-heart-${card.label.toLowerCase()}`;
      return this.textures.exists(key) ? key : null;
    }
    if (card.suit === "espadas") {
      const key = `card-spade-${card.label.toLowerCase()}`;
      return this.textures.exists(key) ? key : null;
    }
    return null;
  }

  private toCssColor(color: number) {
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  private getScore() {
    return Math.max(0, this.hits * 20 - this.errors * 5);
  }

  private emitProgress() {
    runtimeGameBridge.emit({
      type: "PROGRESS_UPDATE",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      progress: this.levelConfig.level / 3,
      score: this.getScore(),
      hits: this.hits,
      errors: this.errors,
      actions: this.actionCount,
    });
  }

  private playClick() {
    this.playTone(520, 0.05, "sine", 0.035);
  }

  private playSuccess() {
    this.playTone(760, 0.11, "triangle", 0.05);
  }

  private playWrong() {
    this.playTone(180, 0.14, "sawtooth", 0.035);
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }
}
