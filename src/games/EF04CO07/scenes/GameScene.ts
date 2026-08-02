import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS } from "../data/levels";
import type { TriageLevel, TriageLevelNumber, ZoneType, DataCard } from "../types";

const GAME_ID = "missao-etica-digital";
const MODAL_SCALE = 1.1;

const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 28;

const CARD_ORIGIN_X = 640;
const CARD_ORIGIN_Y = 306;

// Zone strip layout
const ZONE_TOP = 558;
const ZONE_H = 125;
const ZONE_BOTTOM = ZONE_TOP + ZONE_H;
const ZONE_CY = ZONE_TOP + ZONE_H / 2;
const ZONE_MARGIN = 60;
const ZONE_GAP = 48;

const COLORS = {
  teal:   0x0d9488,
  cyan:   0x06b6d4,
  lime:   0x84cc16,
  green:  0x16a34a,
  red:    0xdc2626,
  amber:  0xd97706,
  dark:   0x0d1b2a,
  darker: 0x060d14,
  ink:    0x020a0e,
  white:  0xffffff,
  gray:   0x64748b,
  slate:  0x334155,
};

const ZONE_META: Record<ZoneType, { color: number; label: string; assetKey: string; emoji: string }> = {
  coletar:  { color: 0x16a34a, label: "Pode Coletar",  assetKey: "zone-coletar",   emoji: "✅" },
  descartar:{ color: 0xd97706, label: "Descartar",      assetKey: "zone-descartar", emoji: "🗑" },
  bloquear: { color: 0xdc2626, label: "Não Coletar",    assetKey: "zone-bloqueado", emoji: "🚫" },
};

interface ZoneDef {
  type: ZoneType;
  left: number; right: number;
  top: number; bottom: number;
  cx: number; cy: number;
  highlightGraphics: Phaser.GameObjects.Graphics;
  color: number;
}

export class GameScene extends Phaser.Scene {
  private levelConfig!: TriageLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;
  private cardIndex = 0;
  private cardErrors = 0;

  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private permanentObjects: Phaser.GameObjects.GameObject[] = [];

  private cardContainer?: Phaser.GameObjects.Container;
  private progressDotsContainer?: Phaser.GameObjects.Container;
  private zoneBounds: ZoneDef[] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as TriageLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.cardIndex = 0;
    this.cardErrors = 0;
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.permanentObjects = [];
    this.zoneBounds = [];
    this.cardContainer = undefined;
    this.progressDotsContainer = undefined;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
    this.showStartScreen();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const pct = Math.max(0, this.timerEvent.getRemaining() / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? COLORS.lime : pct > 0.25 ? COLORS.amber : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.input.off("drag").off("dragend").off("dragstart");
    this.input.setDefaultCursor("default");
    EventBus.removeAllListeners();
  }

  // ─── Background ──────────────────────────────────────────────────────────────

  private createBackground() {
    const bg = this.add.image(640, 360, "bg-data-center").setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, COLORS.darker, 0.78).setDepth(-89);
  }

  // ─── Timer Bar ───────────────────────────────────────────────────────────────

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(COLORS.slate, 0.2);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 14, TIMER_BAR_W, 28, 14);
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.lime);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    if (width <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 14, Math.max(0, width), 28, 14);
  }

  private startTimer() {
    this.timerEvent = this.time.delayedCall(this.levelConfig.timeLimit * 1000, () => this.onTimeUp());
  }

  private onTimeUp() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.input.enabled = false;
    this.errors += 1;
    this.playWrong();
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.time.delayedCall(300, () => this.showGameOverScreen());
  }

  // ─── Start Screen ─────────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.72).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.dark, 0.97);
    bg.fillRoundedRect(-320, -222, 640, 424, 34);
    bg.lineStyle(6, COLORS.teal, 0.9);
    bg.strokeRoundedRect(-320, -222, 640, 424, 34);

    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.teal, 1);
    topBar.fillRoundedRect(-240, -238, 480, 32, 16);

    const lvlTxt = this.addSharpText(0, -222, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -150, this.levelConfig.title, {
      fontSize: "36px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d1b2a", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);
    const obj = this.addSharpText(0, -78, this.levelConfig.objective, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      align: "center", wordWrap: { width: 570 },
    }).setOrigin(0.5);
    const detail = this.addSharpText(0, 2, this.levelConfig.detail, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
      align: "center", wordWrap: { width: 550 },
    }).setOrigin(0.5);

    const tipBg = this.add.graphics();
    tipBg.fillStyle(COLORS.teal, 0.1);
    tipBg.fillRoundedRect(-250, 56, 500, 50, 14);
    const tip = this.addSharpText(0, 82, `💡 ${this.levelConfig.tip}`, {
      fontSize: "14px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      align: "center", wordWrap: { width: 470 },
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.teal, 1);
    btnBg.fillRoundedRect(-120, 122, 240, 54, 27);
    btnBg.lineStyle(4, COLORS.white, 1);
    btnBg.strokeRoundedRect(-120, 122, 240, 54, 27);
    const btnTxt = this.addSharpText(0, 149, "▶ Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#0d1b2a",
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, lvlTxt, title, obj, detail, tipBg, tip, btnBg, btnTxt]);
    panel.setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 149 * MODAL_SCALE, 256 * MODAL_SCALE, 66 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);

    hz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    hz.on("pointerout", () => this.input.setDefaultCursor("default"));
    hz.on("pointerdown", () => {
      this.playClick();
      this.startScreenObjects.forEach((o) => o.destroy());
      this.startScreenObjects = [];
      this.input.setDefaultCursor("default");
      runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
      this.startTimer();
      this.buildLevelUI();
    });
  }

  // ─── Level UI ────────────────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.buildZones();
    this.setupDragHandlers();
    this.showCard();
  }

  private createHeader() {
    const bg = this.add.graphics().setDepth(5);
    bg.fillStyle(COLORS.dark, 0.82);
    bg.fillRoundedRect(200, 42, 880, 40, 20);
    bg.lineStyle(2, COLORS.teal, 0.45);
    bg.strokeRoundedRect(200, 42, 880, 40, 20);
    this.permanentObjects.push(bg);
    this.permanentObjects.push(
      this.addSharpText(640, 63, this.levelConfig.objective, {
        fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
        align: "center", wordWrap: { width: 820 },
      }).setOrigin(0.5).setDepth(6),
    );
  }

  // ─── Zone Strip ──────────────────────────────────────────────────────────────

  private buildZones() {
    const activeZones = this.levelConfig.activeZones;
    const nZones = activeZones.length;
    const totalW = 1280 - 2 * ZONE_MARGIN;
    const zoneW = (totalW - (nZones - 1) * ZONE_GAP) / nZones;

    activeZones.forEach((zoneType, i) => {
      const meta = ZONE_META[zoneType];
      const left = ZONE_MARGIN + i * (zoneW + ZONE_GAP);
      const right = left + zoneW;
      const cx = (left + right) / 2;

      // Background rect
      const zoneBg = this.add.graphics().setDepth(5);
      zoneBg.fillStyle(COLORS.dark, 0.92);
      zoneBg.fillRoundedRect(left, ZONE_TOP, zoneW, ZONE_H, 16);
      zoneBg.lineStyle(3, meta.color, 0.7);
      zoneBg.strokeRoundedRect(left, ZONE_TOP, zoneW, ZONE_H, 16);

      // Zone image icon
      const img = this.add.image(cx, ZONE_CY - 14, meta.assetKey).setDepth(6);
      const scaleH = 60 / img.height;
      const scaleW = (zoneW - 24) / img.width;
      img.setScale(Math.min(scaleH, scaleW));

      // Label
      this.addSharpText(cx, ZONE_BOTTOM - 18, `${meta.emoji} ${meta.label}`, {
        fontSize: "15px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
      }).setOrigin(0.5).setDepth(7);

      // Highlight overlay (blank by default, redrawn on hover/drop)
      const highlight = this.add.graphics().setDepth(8);

      this.zoneBounds.push({
        type: zoneType,
        left, right,
        top: ZONE_TOP, bottom: ZONE_BOTTOM,
        cx, cy: ZONE_CY,
        highlightGraphics: highlight,
        color: meta.color,
      });
    });
  }

  // ─── Drag System ─────────────────────────────────────────────────────────────

  private setupDragHandlers() {
    this.input.dragDistanceThreshold = 12;

    this.input.on("dragstart", (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj !== this.cardContainer) return;
      (obj as Phaser.GameObjects.Container).setDepth(30);
    });

    this.input.on("drag", (
      _p: Phaser.Input.Pointer,
      obj: Phaser.GameObjects.GameObject,
      dragX: number, dragY: number,
    ) => {
      if (obj !== this.cardContainer) return;
      (obj as Phaser.GameObjects.Container).setPosition(dragX, dragY);
      this.updateZoneHighlights(dragX, dragY);
    });

    this.input.on("dragend", (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj !== this.cardContainer) return;
      const container = obj as Phaser.GameObjects.Container;
      this.clearZoneHighlights();
      const hit = this.getZoneAt(container.x, container.y);
      if (hit) {
        this.onCardDropped(hit, container);
      } else {
        this.snapCardToOrigin(container);
      }
    });
  }

  private updateZoneHighlights(cardX: number, cardY: number) {
    this.zoneBounds.forEach((z) => {
      const inside = cardY > ZONE_TOP - 40 && cardX >= z.left && cardX <= z.right;
      z.highlightGraphics.clear();
      if (inside) {
        z.highlightGraphics.fillStyle(0xffffff, 0.15);
        z.highlightGraphics.fillRoundedRect(z.left, z.top, z.right - z.left, z.bottom - z.top, 16);
      }
    });
  }

  private clearZoneHighlights() {
    this.zoneBounds.forEach((z) => z.highlightGraphics.clear());
  }

  private getZoneAt(x: number, y: number): ZoneDef | undefined {
    if (y < ZONE_TOP - 40) return undefined;
    return this.zoneBounds.find((z) => x >= z.left && x <= z.right);
  }

  // ─── Card Display ─────────────────────────────────────────────────────────────

  private showCard() {
    this.cardContainer?.destroy();
    this.cardContainer = undefined;
    this.progressDotsContainer?.destroy();
    this.progressDotsContainer = undefined;

    const cards = this.levelConfig.cards;
    if (this.cardIndex >= cards.length) {
      if (this.levelConfig.level === 3) this.completeFinalLevel();
      else this.completeLevel();
      return;
    }

    this.cardErrors = 0;
    const card = cards[this.cardIndex];
    this.drawProgressDots(cards.length, this.cardIndex);
    this.buildCardContainer(card);
  }

  private drawProgressDots(total: number, current: number) {
    this.progressDotsContainer = this.add.container(640, 100).setDepth(12);
    const offset = -((total - 1) * 20) / 2;
    for (let i = 0; i < total; i++) {
      const d = this.add.graphics();
      d.fillStyle(i < current ? COLORS.lime : i === current ? COLORS.teal : COLORS.gray, 1);
      d.fillCircle(offset + i * 20, 0, 7);
      d.lineStyle(2, COLORS.white, 0.5);
      d.strokeCircle(offset + i * 20, 0, 7);
      this.progressDotsContainer.add(d);
    }
    // Card counter label
    const lbl = this.addSharpText(0, 22, `${current + 1} / ${total}`, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5).setDepth(12);
    this.progressDotsContainer.add(lbl);
  }

  private buildCardContainer(card: DataCard) {
    const container = this.add.container(CARD_ORIGIN_X, CARD_ORIGIN_Y).setDepth(20);

    // Panel
    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.dark, 0.97);
    panelBg.fillRoundedRect(-118, -152, 236, 304, 22);
    panelBg.lineStyle(3, COLORS.teal, 0.7);
    panelBg.strokeRoundedRect(-118, -152, 236, 304, 22);

    // Top label strip
    const strip = this.add.graphics();
    strip.fillStyle(COLORS.teal, 0.18);
    strip.fillRoundedRect(-98, -142, 196, 28, 10);

    const labelTxt = this.addSharpText(0, -128, card.label, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5);

    // Card image
    const img = this.add.image(0, -18, card.assetKey);
    const maxW = 185, maxH = 140;
    img.setScale(Math.min(maxW / img.width, maxH / img.height));

    // Context text
    const ctxTxt = this.addSharpText(0, 92, card.context, {
      fontSize: "13px", fontFamily: "Arial Black, Arial", color: "#cbd5e1",
      align: "center", wordWrap: { width: 206 },
    }).setOrigin(0.5);

    // Drag hint
    const hintTxt = this.addSharpText(0, 138, "↓ arraste para uma zona", {
      fontSize: "11px", fontFamily: "Arial, sans-serif", color: "#475569",
    }).setOrigin(0.5);

    container.add([panelBg, strip, labelTxt, img, ctxTxt, hintTxt]);

    // Make draggable via Container hit area
    container.setInteractive(
      new Phaser.Geom.Rectangle(-118, -152, 236, 304),
      Phaser.Geom.Rectangle.Contains,
    );
    this.input.setDraggable(container);

    // Entrance tween
    container.setAlpha(0).setScale(0.8);
    this.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 240, ease: "Back.easeOut" });

    this.cardContainer = container;
  }

  // ─── Drop Logic ──────────────────────────────────────────────────────────────

  private onCardDropped(zone: ZoneDef, container: Phaser.GameObjects.Container) {
    if (this.gameEnded) return;
    const card = this.levelConfig.cards[this.cardIndex];

    this.input.setDraggable(container, false);

    if (zone.type === card.correctZone) {
      // ── Correct ──
      this.hits += 1;
      this.cardErrors = 0;
      this.playSuccess();
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });

      // Flash zone green
      zone.highlightGraphics.fillStyle(COLORS.green, 0.42);
      zone.highlightGraphics.fillRoundedRect(zone.left, zone.top, zone.right - zone.left, zone.bottom - zone.top, 16);

      // Card flies into zone
      this.tweens.add({
        targets: container,
        x: zone.cx, y: zone.cy,
        scaleX: 0.45, scaleY: 0.45, alpha: 0,
        duration: 380, ease: "Power2",
      });

      this.showToast(`✅ ${card.explanation}`, COLORS.green, 2400);

      this.time.delayedCall(1900, () => {
        if (this.gameEnded) return;
        zone.highlightGraphics.clear();
        this.cardIndex += 1;
        this.showCard();
      });
    } else {
      // ── Wrong ──
      this.errors += 1;
      this.cardErrors += 1;
      this.playWrong();
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });

      // Flash wrong zone red briefly
      zone.highlightGraphics.fillStyle(COLORS.red, 0.35);
      zone.highlightGraphics.fillRoundedRect(zone.left, zone.top, zone.right - zone.left, zone.bottom - zone.top, 16);

      const wrongLabel = ZONE_META[zone.type].label;
      this.showToast(`❌ "${wrongLabel}" não está certo! Releia o contexto.`, COLORS.red, 2200);

      // Shake card and snap back
      this.tweens.add({
        targets: container,
        x: { from: container.x - 18, to: CARD_ORIGIN_X },
        y: CARD_ORIGIN_Y,
        duration: 65, repeat: 4, yoyo: true,
        onComplete: () => {
          container.setPosition(CARD_ORIGIN_X, CARD_ORIGIN_Y);
          if (!this.gameEnded) this.input.setDraggable(container, true);
        },
      });

      this.time.delayedCall(650, () => zone.highlightGraphics.clear());

      // After 2 errors on same card: pulse the correct zone as a hint
      if (this.cardErrors === 2) {
        const correctZone = this.zoneBounds.find((z) => z.type === card.correctZone);
        if (correctZone) {
          let tick = 0;
          const pulser = this.time.addEvent({
            delay: 320, repeat: 6,
            callback: () => {
              correctZone.highlightGraphics.clear();
              if (tick % 2 === 0) {
                correctZone.highlightGraphics.lineStyle(4, correctZone.color, 1);
                correctZone.highlightGraphics.strokeRoundedRect(
                  correctZone.left, correctZone.top,
                  correctZone.right - correctZone.left, correctZone.bottom - correctZone.top, 16,
                );
              }
              tick++;
              if (tick > 6) { correctZone.highlightGraphics.clear(); pulser.destroy(); }
            },
          });
        }
      }
    }
  }

  private snapCardToOrigin(container: Phaser.GameObjects.Container) {
    this.clearZoneHighlights();
    this.tweens.add({
      targets: container,
      x: CARD_ORIGIN_X, y: CARD_ORIGIN_Y,
      duration: 280, ease: "Back.easeOut",
    });
  }

  // ─── Level Completion ────────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as TriageLevelNumber;
    runtimeGameBridge.emit({
      type: "CHECKPOINT", gameId: GAME_ID,
      stage: nextLevel, progress: this.levelConfig.level / 3,
      score: this.getScore(), hits: this.hits, errors: this.errors,
    });
    this.time.delayedCall(400, () => this.showLevelCompleteScreen(nextLevel));
  }

  private completeFinalLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.input.enabled = false;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: 3 });
    this.time.delayedCall(400, () => this.showFinalCompleteScreen());
  }

  // ─── Flow Screens ─────────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: TriageLevelNumber) {
    this.clearOverlay();
    const ovBg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.65).setDepth(60));
    ovBg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-278, -178, 556, 356, 30);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.dark, 0.97);
    bg.fillRoundedRect(-290, -190, 580, 360, 30);
    bg.lineStyle(5, COLORS.teal, 0.9);
    bg.strokeRoundedRect(-290, -190, 580, 360, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.teal, 1);
    topBar.fillRoundedRect(-200, -206, 400, 28, 14);

    const stars = this.addSharpText(0, -130, "⭐⭐", { fontSize: "52px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -68, "Parabéns!", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d1b2a", strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -12, `Nível ${this.levelConfig.level} concluído!`, {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#e2e8f0",
    }).setOrigin(0.5);
    const nxt = this.addSharpText(0, 40, `Preparando nível ${nextLevel}...`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#84cc16",
    }).setOrigin(0.5);
    const score = this.addSharpText(0, 82, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, stars, title, sub, nxt, score]);
    this.animateModal(panel);

    for (let i = 0; i < 12; i++) {
      const cx = Phaser.Math.Between(300, 980);
      const cy = Phaser.Math.Between(120, 600);
      const conf = this.addOverlay(this.add.graphics().setDepth(63));
      conf.fillStyle([COLORS.teal, COLORS.cyan, COLORS.lime][i % 3], 0.85);
      conf.fillRoundedRect(cx - 7, cy - 4, 14, 8, 4);
      this.tweens.add({ targets: conf, alpha: 0, y: cy + 60, duration: 1600, delay: i * 100 });
    }

    this.time.delayedCall(1800, () =>
      this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors }),
    );
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    const ovBg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.7).setDepth(60));
    ovBg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-308, -210, 616, 420, 34);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.dark, 0.97);
    bg.fillRoundedRect(-320, -222, 640, 424, 34);
    bg.lineStyle(6, COLORS.lime, 0.9);
    bg.strokeRoundedRect(-320, -222, 640, 424, 34);
    const ribbon = this.add.graphics();
    ribbon.fillStyle(COLORS.teal, 1);
    ribbon.fillRoundedRect(-220, -238, 440, 28, 14);

    const stars = this.addSharpText(0, -160, "⭐⭐⭐", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    this.tweens.add({ targets: stars, scale: { from: 0.9, to: 1.08 }, duration: 700, yoyo: true, repeat: -1 });

    const title = this.addSharpText(0, -90, "Parabéns!", {
      fontSize: "44px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
      stroke: "#0d1b2a", strokeThickness: 7,
    }).setOrigin(0.5);
    const sub = this.addSharpText(0, -32, "Você completou a Triagem Digital!\nSeus dados estão protegidos! 🔒", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#e2e8f0", align: "center",
    }).setOrigin(0.5);
    const desc = this.addSharpText(0, 38, `Pontuação: ${this.getScore()} · Acertos: ${this.hits} · Erros: ${this.errors}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
    }).setOrigin(0.5);

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics();
      sp.fillStyle([COLORS.teal, COLORS.lime, COLORS.cyan][i % 3], 0.9);
      sp.fillCircle(Phaser.Math.Between(-290, 290), Phaser.Math.Between(-200, 190), Phaser.Math.Between(4, 9));
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 640 + i * 40, yoyo: true, repeat: -1 });
      return sp;
    });

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.teal, 1);
    exitBg.fillRoundedRect(-130, 82, 260, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(-130, 82, 260, 52, 26);
    const exitTxt = this.addSharpText(0, 108, "Voltar aos Jogos", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#0d1b2a",
    }).setOrigin(0.5);

    panel.add([shadow, bg, ribbon, ...sparkles, stars, title, sub, desc, exitBg, exitTxt]);
    this.animateModal(panel);

    const ez = this.addOverlay(this.add.zone(640, 360 + 108 * MODAL_SCALE, 278 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();

    const ovBg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, COLORS.ink, 0.75).setDepth(60));
    ovBg.setInteractive();

    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.dark, 0.97);
    bg.fillRoundedRect(-310, -208, 620, 396, 30);
    bg.lineStyle(5, COLORS.red, 0.8);
    bg.strokeRoundedRect(-310, -208, 620, 396, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);

    const icon = this.addSharpText(0, -142, "⏰", { fontSize: "54px", fontFamily: "Arial Black, Arial" }).setOrigin(0.5);
    const title = this.addSharpText(0, -76, "GAME OVER", {
      fontSize: "42px", fontFamily: "Arial Black, Arial", color: "#dc2626",
      stroke: "#0d1b2a", strokeThickness: 6,
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, -20, "⏰ Tempo esgotado!", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#94a3b8",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 30, `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.getScore()}`, {
      fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);

    const retryBg = this.add.graphics();
    retryBg.fillStyle(COLORS.green, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, COLORS.white, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "🔄 Tentar Novamente", {
      fontSize: "17px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);

    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.amber, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, COLORS.white, 1);
    exitBg.strokeRoundedRect(22, 68, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 94, "🚪 Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#0d1b2a",
      stroke: "#78350f", strokeThickness: 3,
    }).setOrigin(0.5);

    panel.add([shadow, bg, topBar, icon, title, reason, stats, retryBg, retryTxt, exitBg, exitTxt]);
    this.animateModal(panel);

    const rz = this.addOverlay(
      this.add.zone(640 - 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0 });
    });

    const ez = this.addOverlay(
      this.add.zone(640 + 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70),
    );
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.overlayObjects.push(o);
    return o;
  }

  private clearOverlay() {
    this.overlayObjects.forEach((o) => o.destroy());
    this.overlayObjects = [];
    this.input.setDefaultCursor("default");
  }

  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0).setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  private getScore() { return Math.max(0, this.hits * 20 - this.errors * 5); }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    return this.add.text(x, y, text, style).setResolution(2);
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 520).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-480, -36, 960, 72, 18);
    bg.lineStyle(3, COLORS.white, 0.85);
    bg.strokeRoundedRect(-480, -36, 960, 72, 18);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "16px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      align: "center", wordWrap: { width: 880 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 140 });
    this.tweens.add({
      targets: container, alpha: 0, duration: 250, delay: duration,
      onComplete: () => container.destroy(),
    });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────────

  private playClick() { this.playTone(520, 0.05, "sine", 0.05); }
  private playSuccess() {
    this.playTone(660, 0.08, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.08, "triangle", 0.06));
    this.time.delayedCall(220, () => this.playTone(1100, 0.12, "triangle", 0.07));
  }
  private playWrong() { this.playTone(200, 0.14, "sawtooth", 0.05); }
  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency; gain.gain.value = volume;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  }
}
