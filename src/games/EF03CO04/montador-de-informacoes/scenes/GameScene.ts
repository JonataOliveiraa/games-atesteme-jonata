import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import type { PlatformCommand } from "../../../../shared/contracts/platformCommands";
import { LEVELS, shufflePieces } from "../data/levels";
import type { FieldId, InfoLevel, InfoPiece, InfoPieceId } from "../types";
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = "montador-de-informacoes";
const TIMER_BAR_W = 980;
const TIMER_BAR_Y = 42;
const CARD_W = 150;
const CARD_H = 155;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const MODAL_SCALE = 1.14;

const COLORS = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  softOrange: 0xff8a2a,
  cream: 0xfff6e8,
  purple: 0x8b5cf6,
  red: 0xef4444,
  ink: 0x102a43,
};

type CardRecord = {
  id: InfoPieceId;
  card: Phaser.GameObjects.Container;
  hitbox: Phaser.GameObjects.Zone;
  homeX: number;
  homeY: number;
  homeScale: number;
  slotId: FieldId | null;
};

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
  private levelConfig!: InfoLevel;
  private pieces: InfoPiece[] = [];
  private cards = new Map<InfoPieceId, CardRecord>();
  private slots = new Map<FieldId, InfoPieceId | null>();
  private slotRects = new Map<FieldId, Phaser.Geom.Rectangle>();
  private slotCenters = new Map<FieldId, { x: number; y: number }>();
  private resultObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private commandLocked = false;
  private hits = 0;
  private errors = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerBar?: Phaser.GameObjects.Graphics;
  private hasStartedTimer = false;
  private unsubscribePlatformCommands?: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { level?: number; lives?: number }) {
      this.livesTotal = vidasIniciais(this, 3)
      this.livesLeft = data?.lives ?? this.livesTotal
    const lvl = (data?.level ?? 1) as 1 | 2 | 3;
    this.levelConfig = LEVELS.find((level) => level.level === lvl) ?? LEVELS[0];
    this.pieces = shufflePieces(this.levelConfig.pieces);
    this.cards = new Map();
    this.slots = new Map(this.levelConfig.fields.map((field) => [field.id, null]));
    this.slotRects = new Map();
    this.slotCenters = new Map();
    this.resultObjects = [];
    this.overlayObjects = [];
    this.commandLocked = false;
    this.hits = 0;
    this.errors = 0;
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    this.timerBar = undefined;
    this.hasStartedTimer = false;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createFieldPanel();
    this.createPiecesPanel();
    this.createActionButton();
    this.registerPlatformCommands();

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
    this.emitProgress();

      /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
      this.lives = createLives(this, {
          total: this.livesTotal,
          remaining: this.livesLeft,
          gameId: GAME_ID,
          x: 40,
          y: 40,
          size: 30,
          stage: () => this.levelConfig.level,
      })
      this.events.once('shutdown', () => this.lives.destroy())
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
    const theme = this.getBackgroundTheme();
    const backgroundKey = this.getBackgroundAssetKey();
    const bg = this.add.graphics().setDepth(-100);
    bg.fillGradientStyle(theme.topLeft, theme.topRight, theme.bottomLeft, theme.bottomRight, 1);
    bg.fillRect(0, 0, 1280, 720);

    if (this.textures.exists(backgroundKey)) {
      this.coverImage(this.add.image(640, 360, backgroundKey), 1280, 720).setDepth(-99.9);
      this.add.rectangle(640, 360, 1280, 720, theme.panelTint, 0.08).setDepth(-99.7);
      this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.08).setDepth(-99.6);
    } else {
      this.drawThemedBackdrop();
    }

    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.06).setDepth(-95);
  }

  private getBackgroundTheme() {
    if (this.levelConfig.mode === "address") {
      return {
        topLeft: 0x67e8f9,
        topRight: 0x60a5fa,
        bottomLeft: 0xfef08a,
        bottomRight: 0x34d399,
        panelTint: 0x0f766e,
        dots: [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.orange],
        accents: [
          { x: 116, y: 166, w: 112, h: 70, c: COLORS.cyan },
          { x: 1044, y: 136, w: 112, h: 92, c: COLORS.green },
          { x: 112, y: 548, w: 142, h: 62, c: COLORS.orange },
          { x: 1036, y: 552, w: 148, h: 58, c: COLORS.blue },
        ],
      };
    }

    if (this.levelConfig.mode === "character") {
      return {
        topLeft: 0xf0abfc,
        topRight: 0x93c5fd,
        bottomLeft: 0xfde68a,
        bottomRight: 0x86efac,
        panelTint: 0x6d28d9,
        dots: [COLORS.purple, COLORS.pink, COLORS.cyan, COLORS.green, COLORS.orange],
        accents: [
          { x: 108, y: 160, w: 104, h: 104, c: COLORS.purple },
          { x: 1054, y: 132, w: 104, h: 104, c: COLORS.pink },
          { x: 120, y: 552, w: 134, h: 62, c: COLORS.green },
          { x: 1040, y: 556, w: 144, h: 56, c: COLORS.cyan },
        ],
      };
    }

    return {
      topLeft: 0x7dd3fc,
      topRight: 0xc084fc,
      bottomLeft: 0xfbbf24,
      bottomRight: 0xfb7185,
      panelTint: 0x1e3a8a,
      dots: [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.orange, COLORS.purple],
      accents: [
        { x: 116, y: 166, w: 82, h: 82, c: COLORS.orange },
        { x: 1058, y: 128, w: 96, h: 96, c: COLORS.green },
        { x: 112, y: 548, w: 118, h: 62, c: COLORS.purple },
        { x: 1054, y: 558, w: 132, h: 58, c: COLORS.cyan },
      ],
    };
  }

  private getBackgroundAssetKey() {
    return {
      invite: "bg-invite-party",
      address: "bg-address-delivery",
      character: "bg-character-profile",
    }[this.levelConfig.mode];
  }

  private drawThemedBackdrop() {
    if (this.levelConfig.mode === "address") {
      this.drawAddressBackdrop();
      return;
    }
    if (this.levelConfig.mode === "character") {
      this.drawCharacterBackdrop();
      return;
    }
    this.drawInviteBackdrop();
  }

  private drawInviteBackdrop() {
    const g = this.add.graphics().setDepth(-99.8);
    g.lineStyle(8, 0xffffff, 0.24);
    g.beginPath();
    g.moveTo(70, 122);
    g.lineTo(248, 176);
    g.lineTo(426, 132);
    g.lineTo(604, 182);
    g.lineTo(782, 136);
    g.lineTo(960, 178);
    g.lineTo(1170, 126);
    g.strokePath();

    const colors = [COLORS.orange, COLORS.purple, COLORS.green, COLORS.cyan, COLORS.red];
    for (let i = 0; i < 11; i++) {
      const x = 94 + i * 108;
      const y = i % 2 === 0 ? 150 : 178;
      g.fillStyle(colors[i % colors.length], 0.42);
      g.fillTriangle(x, y, x + 44, y + 8, x + 16, y + 58);
      g.lineStyle(2, 0xffffff, 0.32);
      g.strokeTriangle(x, y, x + 44, y + 8, x + 16, y + 58);
    }

    this.addDecorativeAsset("data-calendar-day", 188, 512, 190, 140, -11, 0.2);
    this.addDecorativeAsset("data-calendar-month", 1052, 502, 210, 150, 10, 0.2);
    this.addDecorativeAsset("data-calendar-year", 1042, 206, 180, 130, -8, 0.16);
  }

  private drawAddressBackdrop() {
    const road = this.add.graphics().setDepth(-99.8);
    road.fillStyle(0xffffff, 0.2);
    road.fillRoundedRect(118, 492, 1044, 90, 45);
    road.fillStyle(0x2563eb, 0.16);
    road.fillRoundedRect(160, 518, 960, 24, 12);
    for (let i = 0; i < 8; i++) {
      road.fillStyle(0xffffff, 0.36);
      road.fillRoundedRect(218 + i * 118, 528, 58, 8, 4);
    }

    const city = this.add.graphics().setDepth(-99.7);
    [156, 234, 324, 920, 1014, 1102].forEach((x, index) => {
      const h = [116, 84, 132, 104, 146, 92][index];
      city.fillStyle([COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple][index % 4], 0.22);
      city.fillRoundedRect(x, 294 - h, 58, h, 12);
      city.lineStyle(2, 0xffffff, 0.28);
      city.strokeRoundedRect(x, 294 - h, 58, h, 12);
    });

    this.addDecorativeAsset("data-zip-envelope", 194, 196, 210, 150, -12, 0.2);
    this.addDecorativeAsset("data-neighborhood-map", 1040, 210, 230, 160, 12, 0.18);
    this.addDecorativeAsset("data-city-buildings", 636, 564, 300, 190, 0, 0.12);
  }

  private drawCharacterBackdrop() {
    const profile = this.add.graphics().setDepth(-99.8);
    profile.fillStyle(0xffffff, 0.22);
    profile.fillRoundedRect(112, 154, 196, 248, 34);
    profile.fillStyle(COLORS.purple, 0.28);
    profile.fillCircle(210, 232, 52);
    profile.fillStyle(0xffffff, 0.28);
    profile.fillRoundedRect(152, 306, 116, 18, 9);
    profile.fillRoundedRect(140, 340, 140, 16, 8);

    const stars = this.add.graphics().setDepth(-99.7);
    for (let i = 0; i < 13; i++) {
      const x = Phaser.Math.Between(86, 1184);
      const y = Phaser.Math.Between(116, 612);
      stars.fillStyle(Phaser.Utils.Array.GetRandom([COLORS.orange, COLORS.green, COLORS.cyan, COLORS.pink]), 0.32);
      stars.fillPoints([
        new Phaser.Geom.Point(x, y - 16),
        new Phaser.Geom.Point(x + 6, y - 5),
        new Phaser.Geom.Point(x + 18, y - 4),
        new Phaser.Geom.Point(x + 9, y + 4),
        new Phaser.Geom.Point(x + 12, y + 16),
        new Phaser.Geom.Point(x, y + 9),
        new Phaser.Geom.Point(x - 12, y + 16),
        new Phaser.Geom.Point(x - 9, y + 4),
        new Phaser.Geom.Point(x - 18, y - 4),
        new Phaser.Geom.Point(x - 6, y - 5),
      ], true);
    }

    this.addDecorativeAsset("data-name-tag", 1040, 184, 220, 140, 8, 0.2);
    this.addDecorativeAsset("data-color-palette", 214, 548, 220, 150, -8, 0.18);
    this.addDecorativeAsset("data-pet-cat", 1058, 542, 220, 160, 12, 0.2);
  }

  private addDecorativeAsset(
    key: string,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
    angle: number,
    alpha: number,
  ) {
    if (!this.textures.exists(key)) return;
    const image = this.fitImage(this.add.image(x, y, key), maxWidth, maxHeight);
    image.setDepth(-99.6);
    image.setAngle(angle);
    image.setAlpha(alpha);
  }

  private coverImage(image: Phaser.GameObjects.Image, width: number, height: number) {
    const source = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = source.width || width;
    const sourceHeight = source.height || height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
    image.setOrigin(0.5);
    return image;
  }

  private createTimerBar() {
    const track = this.add.graphics().setDepth(45);
    track.fillStyle(0x334155, 0.18);
    track.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, TIMER_BAR_W, 32, 16);
    this.timerBar = this.add.graphics().setDepth(46);
    this.drawTimerFill(TIMER_BAR_W, COLORS.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    const fillWidth = Math.max(0, width);
    if (fillWidth <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(640 - TIMER_BAR_W / 2, TIMER_BAR_Y - 16, fillWidth, 32, 16);
  }

  private createHeader() {
    this.addSharpText(640, 104, this.levelConfig.title, {
      fontSize: "40px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.addSharpText(640, 150, this.levelConfig.instruction, {
      fontSize: "20px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    this.addSharpText(1086, 104, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "18px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#1e3a8a",
      backgroundColor: "rgba(255,255,255,0.76)",
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5);
  }

  private createFieldPanel() {
    this.drawPanel(58, 176, 1164, 220, COLORS.blue, 1);
    this.drawPanelHeader(640, 186, 420, this.getFieldPanelTitle(), COLORS.blue);

    const count = this.levelConfig.fields.length;
    const startX = count <= 3 ? 322 : 166;
    const gap = count <= 3 ? 318 : 224;

    this.levelConfig.fields.forEach((field, index) => {
      const x = startX + index * gap;
      const y = 306;
      this.slotCenters.set(field.id, { x, y });
      this.slotRects.set(field.id, new Phaser.Geom.Rectangle(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H));

      const slot = this.add.graphics().setDepth(4);
      slot.fillStyle(COLORS.cream, 0.78);
      slot.fillRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);
      slot.fillStyle(0xffffff, 0.28);
      slot.fillRoundedRect(x - SLOT_W / 2 + 12, y - SLOT_H / 2 + 12, SLOT_W - 24, 34, 16);
      slot.lineStyle(6, COLORS.softOrange, 0.95);
      slot.strokeRoundedRect(x - SLOT_W / 2, y - SLOT_H / 2, SLOT_W, SLOT_H, 22);

      this.addSharpText(x, y - 30, field.label, {
        fontSize: count > 5 ? "15px" : "17px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#1e3a8a",
        stroke: "#ffffff",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: 138 },
      }).setOrigin(0.5).setDepth(5);
    });
  }

  private createPiecesPanel() {
    this.drawPanel(58, 410, 1164, 208, COLORS.purple, 1);
    this.drawPanelHeader(640, 410, 420, "Dados recebidos", COLORS.purple);

    const positions = this.getPieceCardPositions();
    const cardScale = 1;

    this.pieces.forEach((piece, index) => {
      const { x, y } = positions[index];
      const { card, hitbox } = this.createDataCard(piece, x, y, cardScale);
      this.cards.set(piece.id, { id: piece.id, card, hitbox, homeX: x, homeY: y, homeScale: cardScale, slotId: null });
    });
  }

  private getPieceCardPositions() {
    const spacing = this.pieces.length <= 5 ? 235 : 165;
    const startX = 640 - ((this.pieces.length - 1) * spacing) / 2;
    return this.pieces.map((_, index) => ({ x: startX + index * spacing, y: 528 }));
  }

  private createActionButton() {
    this.createUiButton(640, 654, 360, 70, "Validar informação", COLORS.green, () => this.validateInformation());
  }

  private createDataCard(piece: InfoPiece, x: number, y: number, scale = 1) {
    const card = this.add.container(x, y).setDepth(20).setScale(scale);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.13);
    shadow.fillRoundedRect(-CARD_W / 2 + 3, -CARD_H / 2 + 10, CARD_W - 6, CARD_H - 4, 20);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.cream, 0.96);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.fillStyle(0xffffff, 0.22);
    bg.fillRoundedRect(-CARD_W / 2 + 14, -CARD_H / 2 + 12, CARD_W - 28, 34, 16);
    bg.lineStyle(4, piece.color, 0.82);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.lineStyle(2, 0xffffff, 0.76);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);

    const assetKey = this.getPieceAssetKey(piece);
    const icon = assetKey && this.textures.exists(assetKey)
      ? this.fitImage(this.add.image(0, -28, assetKey), 112, 92)
      : this.addSharpText(0, -28, this.getPieceSymbol(piece), {
          fontSize: "28px",
          fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
          color: "#ffffff",
          stroke: "#0f172a",
          strokeThickness: 3,
        }).setOrigin(0.5);

    const label = this.addSharpText(0, 54, piece.shortLabel, {
      fontSize: piece.shortLabel.length > 12 ? "13px" : "16px",
      fontFamily: "DynaPuff, Arial, sans-serif",
      color: "#3b3b3b",
      stroke: "#ffffff",
      strokeThickness: 2,
      align: "center",
      wordWrap: { width: 132 },
    }).setOrigin(0.5);
    card.add([shadow, bg, icon, label]);

    const hitbox = this.add.zone(x, y, CARD_W * scale + 28, CARD_H * scale + 24).setDepth(80);
    hitbox.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(hitbox);
    hitbox.on("pointerdown", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      this.highlightCard(piece.id);
    });
    hitbox.on("dragstart", () => {
      if (this.commandLocked) return;
      this.startTimerOnce();
      this.removeFromSlot(piece.id);
      card.setDepth(60);
      hitbox.setDepth(90);
      this.highlightCard(piece.id);
    });
    hitbox.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.commandLocked) return;
      card.setPosition(dragX, dragY);
      hitbox.setPosition(dragX, dragY);
    });
    hitbox.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (this.commandLocked) return;
      this.dropCard(piece.id, pointer.x, pointer.y);
      card.setDepth(20);
      hitbox.setDepth(80);
    });

    return { card, hitbox };
  }

  private dropCard(id: InfoPieceId, pointerX: number, pointerY: number) {
    const target = [...this.slotRects.entries()].find(([, rect]) => rect.contains(pointerX, pointerY));
    if (!target) {
      this.returnCardHome(id);
      return;
    }
    this.placeCardInSlot(id, target[0]);
  }

  private placeCardInSlot(id: InfoPieceId, slotId: FieldId) {
    const record = this.cards.get(id);
    if (!record) return;
    const previous = this.slots.get(slotId);
    if (previous && previous !== id) this.returnCardHome(previous);
    this.removeFromSlot(id);
    this.slots.set(slotId, id);
    record.slotId = slotId;
    const center = this.slotCenters.get(slotId);
    if (!center) return;
    record.card.setScale(1);
    this.tweens.add({ targets: record.card, x: center.x, y: center.y, duration: 140, ease: "Sine.easeOut" });
    this.tweens.add({ targets: record.hitbox, x: center.x, y: center.y, duration: 140, ease: "Sine.easeOut" });
    this.playClick();
    this.emitProgress();
  }

  private removeFromSlot(id: InfoPieceId) {
    const record = this.cards.get(id);
    if (record?.slotId) {
      this.slots.set(record.slotId, null);
      record.slotId = null;
    }
  }

  private returnCardHome(id: InfoPieceId) {
    const record = this.cards.get(id);
    if (!record) return;
    this.removeFromSlot(id);
    record.card.setScale(record.homeScale);
    this.tweens.add({ targets: record.card, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.tweens.add({ targets: record.hitbox, x: record.homeX, y: record.homeY, duration: 160, ease: "Sine.easeOut" });
    this.emitProgress();
  }

  private highlightCard(id: InfoPieceId) {
    this.cards.forEach((record) => record.card.setAlpha(record.id === id ? 1 : 0.9));
  }

  private getPieceSymbol(piece: InfoPiece) {
    if (piece.id.includes("day") || piece.id.includes("month") || piece.id.includes("year")) return "D";
    if (piece.id.includes("street") || piece.id.includes("city") || piece.id.includes("zip") || piece.id.includes("neighborhood")) return "L";
    if (piece.id.includes("number")) return "#";
    if (piece.id.includes("name")) return "N";
    if (piece.id.includes("age")) return "8";
    if (piece.id.includes("color")) return "C";
    if (piece.id.includes("pet")) return "P";
    return "?";
  }

  private getPieceAssetKey(piece: InfoPiece) {
    const assets: Partial<Record<InfoPieceId, string>> = {
      "date-day": "data-calendar-day",
      "date-month": "data-calendar-month",
      "date-year": "data-calendar-year",
      "date-place-extra": "data-street-sign",
      "date-color-extra": "data-color-palette",
      "address-street": "data-street-sign",
      "address-number": "data-house-number",
      "address-neighborhood": "data-neighborhood-map",
      "address-city": "data-city-buildings",
      "address-zip": "data-zip-envelope",
      "address-age-extra": "data-age-cake",
      "address-month-extra": "data-calendar-month",
      "character-name": "data-name-tag",
      "character-age": "data-age-cake",
      "character-city": "data-city-buildings",
      "character-color": "data-color-palette",
      "character-pet": "data-pet-cat",
      "character-street-extra": "data-street-sign",
    };
    return assets[piece.id];
  }

  private fitImage(image: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) {
    const source = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width || maxWidth;
    const height = source.height || maxHeight;
    const scale = Math.min(maxWidth / width, maxHeight / height);
    image.setDisplaySize(width * scale, height * scale);
    image.setOrigin(0.5);
    return image;
  }

  private async validateInformation() {
    if (this.commandLocked) return;
    this.playClick();
    this.startTimerOnce();
    if ([...this.slots.values()].some((slot) => !slot)) {
      this.playWrong();
      this.showToast("Preencha todos os campos antes de validar.", COLORS.orange);
      return;
    }

    const wrongField = this.levelConfig.fields.find((field) => this.slots.get(field.id) !== field.accepts);
    if (wrongField) {
      this.errors += 1;
      this.playWrong();
      this.showToast(`Esse dado não completa o campo ${wrongField.label}. ${this.levelConfig.hint}`, COLORS.red);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.lives.lose(); this.livesLeft = this.lives.remaining
      this.emitProgress();
      return;
    }

    this.commandLocked = true;
    this.hits += 1;
    this.playCorrect();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
    await this.showInformationReveal();
    this.handleLevelSuccess();
  }

  private drawResult(isComplete: boolean) {
    this.resultObjects.forEach((object) => object.destroy());
    this.resultObjects = [];
    const icon = this.createResultIcon(isComplete).setDepth(12);
    const label = this.addSharpText(468, 658, isComplete ? this.levelConfig.resultText : "Dados aguardando combinação", {
      fontSize: isComplete ? "17px" : "19px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(12);
    this.resultObjects.push(icon, label);
  }

  private createResultIcon(isComplete: boolean) {
    const container = this.add.container(166, 654);
    const bg = this.add.graphics();
    bg.fillStyle(isComplete ? COLORS.green : 0x64748b, 1);
    bg.fillRoundedRect(-34, -28, 68, 56, 16);
    bg.lineStyle(4, 0xffffff, 0.94);
    bg.strokeRoundedRect(-34, -28, 68, 56, 16);
    const text = this.addSharpText(0, 0, isComplete ? this.getResultSymbol() : "?", {
      fontSize: isComplete ? "25px" : "28px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#ffffff",
      stroke: "#0f172a",
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(text);
    container.addAt(bg, 0);
    return container;
  }

  private showInformationReveal() {
    return new Promise<void>((resolve) => {
      const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.34).setDepth(300);
      const panel = this.add.graphics().setDepth(301);
      panel.fillStyle(0xffffff, 0.94);
      panel.fillRoundedRect(390, 212, 500, 296, 34);
      panel.lineStyle(6, 0xffffff, 0.98);
      panel.strokeRoundedRect(390, 212, 500, 296, 34);
      const title = this.addSharpText(640, 280, this.levelConfig.resultTitle, {
        fontSize: "30px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(302);
      const text = this.addSharpText(640, 366, this.levelConfig.resultText, {
        fontSize: "22px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#334155",
        align: "center",
        wordWrap: { width: 430 },
      }).setOrigin(0.5).setDepth(302);
      const hint = this.addSharpText(640, 452, "Dados juntos viraram informação.", {
        fontSize: "18px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#7c3aed",
        align: "center",
      }).setOrigin(0.5).setDepth(302);
      const targets = [overlay, panel, title, text, hint];
      targets.forEach((target) => target.setAlpha(0));
      this.tweens.add({
        targets,
        alpha: 1,
        duration: 220,
        onComplete: () => {
          this.time.delayedCall(1050, () => {
            this.tweens.add({
              targets,
              alpha: 0,
              duration: 220,
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
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.levelConfig.level, totalStages: LEVELS.length });
    this.showGameCompleteScreen();
  }

  private showNextLevelStartTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.green);
    const title = this.addSharpText(0, -102, `Nível ${nextLevel}`, this.modalTitleStyle()).setOrigin(0.5);
    const objective = this.addSharpText(0, -42, nextConfig?.title ?? "Nova informação", {
      fontSize: "24px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const detail = this.addSharpText(0, 14, nextConfig?.instruction ?? "Combine os dados.", {
      fontSize: "16px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#334155",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);
    const buttonHitbox = this.addOverlayObject(this.add.zone(640, 360 + 104 * MODAL_SCALE, 300 * MODAL_SCALE, 76 * MODAL_SCALE).setDepth(452));
    buttonHitbox.setInteractive({ useHandCursor: true });
    buttonHitbox.on("pointerover", () => this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" }));
    buttonHitbox.on("pointerout", () => this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" }));
    buttonHitbox.on("pointerdown", () => {
      this.playClick();
      this.scene.restart({ lives: this.livesLeft, level: nextLevel });
    });
    modal.add([title, objective, detail, button]);
    this.animateModal(modal);
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3) {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
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
    const waitText = this.addSharpText(0, 122, "Preparando a próxima informação...", {
      fontSize: "15px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#25327a",
    }).setOrigin(0.5);

    modal.add([badgeIcon, title, score, detail, waitText]);
    this.animateModal(modal);
    this.time.delayedCall(1800, () => this.showNextLevelStartTransition(nextLevel));
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
    const title = this.addSharpText(0, -128, "Informações montadas!", {
      fontSize: "38px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.addSharpText(0, -78, `Pontuação final: ${this.getScore()} • Acertos: ${this.hits} • Erros: ${this.errors}`, {
      fontSize: "18px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#334155",
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5);
    const message = this.addSharpText(0, -28, "Você descobriu que dados juntos podem formar uma informação útil.", {
      fontSize: "19px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 470 },
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
    const playAgain = this.createFinalButton(-158, 138, "Jogar novamente", COLORS.green, () => this.scene.restart({ lives: this.livesTotal, level: 1 }));
    const exit = this.createFinalButton(158, 138, "Voltar aos jogos", COLORS.orange, () => EventBus.emit("exit-game"));
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
    this.tweens.add({ targets: modal, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
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
    const hitbox = this.addOverlayObject(this.add.zone(640 + x * MODAL_SCALE, 360 + y * MODAL_SCALE, 310 * MODAL_SCALE, 86 * MODAL_SCALE).setDepth(452));
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: "Sine.easeOut" }));
    hitbox.on("pointerout", () => this.tweens.add({ targets: button, scale: 1, duration: 90, ease: "Sine.easeOut" }));
    hitbox.on("pointerdown", () => {
      this.playClick();
      onClick();
    });
    return button;
  }

  private createUiButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y).setDepth(12);
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

  private drawPanelHeader(x: number, y: number, _width: number, label: string, _color: number) {
    const text = this.addSharpText(x, y + 16, label, {
      fontSize: "21px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11);
    return text;
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
        runtimeGameBridge.emit({ type: "GAME_OVER", gameId: GAME_ID, stage: this.levelConfig.level });
        this.showToast("Tempo esgotado. Tente combinar os dados de novo.", COLORS.red);
      },
    });
  }

  private emitProgress() {
    const filled = [...this.slots.values()].filter(Boolean).length;
    const progress = filled ? Math.min(95, Math.round((filled / this.levelConfig.fields.length) * 100)) : 0;
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

  private getFieldColor(index: number) {
    return [COLORS.cyan, COLORS.orange, COLORS.purple, COLORS.green, COLORS.red, COLORS.blue][index] ?? COLORS.blue;
  }

  private getFieldPanelTitle() {
    return {
      invite: "Campos do convite",
      address: "Campos do envelope",
      character: "Campos da ficha",
    }[this.levelConfig.mode];
  }

  private getResultSymbol() {
    return {
      invite: "✓",
      address: "✓",
      character: "✓",
    }[this.levelConfig.mode];
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((command: PlatformCommand) => {
      if (command.type !== "START_GAME") return;
      if (command.gameId !== GAME_ID) return;
      if (command.stage === this.levelConfig.level) return;
      this.scene.restart({ lives: this.livesLeft, level: command.stage as 1 | 2 | 3 });
    });
  }

  private addSharpText(x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) {
    const textObject = this.add.text(x, y, text, { fontStyle: "bold", ...style });
    textObject.setResolution(2);
    return textObject;
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
