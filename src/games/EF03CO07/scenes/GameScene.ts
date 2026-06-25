import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge";
import { LEVELS, scoreResult } from "../data/levels";
import type { FilterId, ResultId, SearchLevel, SearchLevelNumber } from "../types";

const GAME_ID = "detetives-da-busca";
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
  cream: 0xfff6e8,
  ink: 0x102a43,
};

type Selectable = {
  id: string;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  hitbox: Phaser.GameObjects.Zone;
  kind: "keyword" | "filter" | "result";
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: SearchLevel;
  private selectedKeywordId = "";
  private selectedFilterId: FilterId = "all";
  private selectedResultId: ResultId | null = null;
  private hasClickedFilter = false;
  private selectables: Selectable[] = [];
  private resultAreaObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private timerBar?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;
  private hasStartedTimer = false;
  private commandLocked = false;
  private hits = 0;
  private errors = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as SearchLevelNumber;
    this.levelConfig = LEVELS.find((item) => item.level === level) ?? LEVELS[0];
    this.selectedKeywordId = "";
    this.selectedFilterId = this.levelConfig.filters[0]?.id ?? "all";
    this.selectedResultId = null;
    this.hasClickedFilter = false;
    this.selectables = [];
    this.resultAreaObjects = [];
    this.overlayObjects = [];
    this.hasStartedTimer = false;
    this.commandLocked = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
  }

  create() {
    this.createBackground();
    this.createTimerBar();
    this.createHeader();
    this.createInfoButton();
    this.createBrowserPanel();
    this.createActionButton();
    this.renderResults();
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
        ? "bg-search-lab"
        : this.levelConfig.level === 2
          ? "bg-image-search"
          : "bg-research-desk";
    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    bg.setDisplaySize(1280, 720);
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.08).setDepth(-90);
    this.add.rectangle(640, 360, 1280, 720, 0x0f172a, 0.12).setDepth(-89);
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
    missionCard.fillStyle(0xffffff, 0.82);
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

    this.addSharpText(1146, 100, `Nível ${this.levelConfig.level}/3`, {
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

  private createBrowserPanel() {
    this.drawPanel(72, 142, 1136, 486, COLORS.blue, 1);
    this.createBrowserTopBar();
    this.createSearchControls();
  }

  private createBrowserTopBar() {
    const browser = this.add.graphics().setDepth(5);
    browser.fillStyle(0xffffff, 0.64);
    browser.fillRoundedRect(112, 168, 1056, 76, 28);
    browser.fillStyle(0xffffff, 0.9);
    browser.fillRoundedRect(220, 188, 650, 38, 19);
    browser.lineStyle(4, 0x38bdf8, 0.85);
    browser.strokeRoundedRect(220, 188, 650, 38, 19);
    browser.fillStyle(COLORS.red, 0.95);
    browser.fillCircle(146, 206, 10);
    browser.fillStyle(COLORS.orange, 0.95);
    browser.fillCircle(176, 206, 10);
    browser.fillStyle(COLORS.green, 0.95);
    browser.fillCircle(206, 206, 10);

    this.addSharpText(244, 207, this.getSelectedKeywordLabel() || "Escolha uma palavra-chave", {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
    }).setOrigin(0, 0.5).setDepth(6).setName("queryText");

    this.addSharpText(978, 207, "Busca segura", {
      fontSize: "20px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(6);

  }

  private createSearchControls() {
    this.drawChoicePanel(120, 256, 600, 100, COLORS.blue);
    this.drawChoicePanel(760, 256, 400, 100, COLORS.purple);

    this.drawSectionHeader(420, 276, "1. Palavra-chave");
    this.levelConfig.keywords.forEach((keyword, index) => {
      const x = 218 + index * 202;
      const item = this.createChip(x, 324, 176, 62, keyword.label, keyword.id, "keyword", COLORS.blue);
      this.selectables.push(item);
    });

    this.drawSectionHeader(960, 276, "2. Filtro");
    this.levelConfig.filters.forEach((filter, index) => {
      const x = this.levelConfig.filters.length === 1 ? 960 : 812 + index * 148;
      const item = this.createChip(x, 324, 126, 62, filter.label, filter.id, "filter", COLORS.purple);
      this.selectables.push(item);
    });

    this.updateSelectableStyles();
  }

  private drawChoicePanel(x: number, y: number, width: number, height: number, color: number) {
    const panel = this.add.graphics().setDepth(8);
    panel.fillStyle(0xffffff, 0.32);
    panel.fillRoundedRect(x, y, width, height, 24);
    panel.fillStyle(color, 0.12);
    panel.fillRoundedRect(x + 10, y + 10, width - 20, height - 20, 18);
    panel.lineStyle(4, color, 0.72);
    panel.strokeRoundedRect(x, y, width, height, 24);
    panel.lineStyle(3, 0xffffff, 0.86);
    panel.strokeRoundedRect(x + 4, y + 4, width - 8, height - 8, 20);
    return panel;
  }

  private renderResults() {
    this.resultAreaObjects.forEach((object) => object.destroy());
    this.resultAreaObjects = [];

    const title = this.addResultObject(this.drawSectionHeader(640, 382, "3. Veja as pistas e escolha a resposta"));
    title.setDepth(18);

    if (!this.selectedKeywordId) {
      this.createSearchMessage("Toque em uma palavra-chave para abrir as pistas da busca.", "🔎");
      return;
    }

    if (this.selectedKeywordId !== this.levelConfig.correctKeywordId) {
      const keyword = this.levelConfig.keywords.find((item) => item.id === this.selectedKeywordId);
      const message = keyword?.quality === "weak"
        ? "Essa palavra levou a pistas que não respondem à pergunta. Tente uma palavra melhor."
        : "Você chegou perto, mas a busca ainda ficou aberta demais. Tente uma palavra mais específica.";
      this.createSearchMessage(message, "?");
      return;
    }

    if (!this.hasClickedFilter) {
      this.createSearchMessage("Boa palavra-chave. Agora toque em um filtro para liberar as pistas.", "2");
      return;
    }

    if (this.selectedFilterId !== this.levelConfig.correctFilterId) {
      this.createSearchMessage("A palavra está boa. Agora escolha o filtro que combina com a pergunta.", "⚙");
      return;
    }

    const sorted = [...this.levelConfig.results].sort((a, b) => {
      return scoreResult(this.levelConfig, b.id, this.selectedKeywordId, this.selectedFilterId) -
        scoreResult(this.levelConfig, a.id, this.selectedKeywordId, this.selectedFilterId);
    });

    sorted.forEach((result, index) => {
      const y = 430 + index * 76;
      const score = scoreResult(this.levelConfig, result.id, this.selectedKeywordId, this.selectedFilterId);
      const card = this.addResultObject(this.add.container(640, y).setDepth(20));
      const bg = this.add.graphics();
      const selected = this.selectedResultId === result.id;
      bg.fillStyle(selected ? 0xecfdf5 : 0xffffff, selected ? 0.98 : 0.84);
      bg.fillRoundedRect(-510, -34, 1020, 68, 20);
      bg.lineStyle(selected ? 5 : 3, selected ? COLORS.green : 0xffffff, 0.96);
      bg.strokeRoundedRect(-510, -34, 1020, 68, 20);

      const rankColor = score > 115 ? COLORS.green : score > 80 ? COLORS.orange : COLORS.purple;
      const rank = this.addSharpText(-478, 0, `${index + 1}`, {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial",
        color: this.toCssColor(rankColor),
        stroke: "#ffffff",
        strokeThickness: 4,
      }).setOrigin(0.5);
      const titleText = this.addSharpText(-360, -12, result.title, {
        fontSize: "19px",
        fontFamily: "Arial Black, Arial",
        color: "#1e3a8a",
        wordWrap: { width: 660 },
      }).setOrigin(0, 0.5);

      const snippet = this.addSharpText(-410, 13, `${result.source} • ${result.snippet}`, {
        fontSize: "13px",
        fontFamily: "Arial Black, Arial",
        color: "#475569",
        wordWrap: { width: 780 },
      }).setOrigin(0, 0.5);

      const selectedLabel = selected ? this.addSharpText(270, 0, "Selecionado", {
        fontSize: "13px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#166534",
        strokeThickness: 3,
      }).setOrigin(0.5) : null;
      const selectedBg = selected ? this.add.graphics() : null;
      if (selectedBg) {
        selectedBg.fillStyle(COLORS.green, 0.96);
        selectedBg.fillRoundedRect(164, -18, 160, 36, 18);
        selectedBg.lineStyle(3, 0xffffff, 0.95);
        selectedBg.strokeRoundedRect(164, -18, 160, 36, 18);
      }

      const why = this.addSharpText(452, 0, "?", {
        fontSize: "24px",
        fontFamily: "Arial Black, Arial",
        color: "#ffffff",
        stroke: "#1e3a8a",
        strokeThickness: 3,
      }).setOrigin(0.5);
      const whyBg = this.add.graphics();
      whyBg.fillStyle(COLORS.cyan, 0.95);
      whyBg.fillRoundedRect(426, -22, 52, 44, 22);
      whyBg.lineStyle(3, 0xffffff, 0.95);
      whyBg.strokeRoundedRect(426, -22, 52, 44, 22);

      card.add([bg, rank, titleText, snippet, ...(selectedBg && selectedLabel ? [selectedBg, selectedLabel] : []), whyBg, why]);
      const hitbox = this.addResultObject(this.add.zone(640, y, 1040, 76).setDepth(80));
      hitbox.setInteractive({ useHandCursor: true });
      hitbox.on("pointerover", () => this.input.setDefaultCursor("pointer"));
      hitbox.on("pointerout", () => this.input.setDefaultCursor("default"));
      hitbox.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.startTimerOnce();
        if (pointer.x > 1060) {
          this.showToast(result.explanation, COLORS.cyan, 2500);
          return;
        }
        this.selectedResultId = result.id;
        this.playClick();
        this.renderResults();
        this.updateSelectableStyles();
      });
    });
  }

  private createActionButton() {
    this.createUiButton(640, 676, 360, 50, "Validar resposta", COLORS.green, () => this.validateSearch());
  }

  private createSearchMessage(message: string, iconLabel: string) {
    const emptyCard = this.addResultObject(this.add.container(640, 486).setDepth(20));
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.78);
    bg.fillRoundedRect(-460, -58, 920, 116, 24);
    bg.lineStyle(4, 0xffffff, 0.96);
    bg.strokeRoundedRect(-460, -58, 920, 116, 24);
    const messageTexture = this.getMessageTexture(iconLabel);
    const icon = messageTexture && this.textures.exists(messageTexture)
      ? this.fitImage(this.add.image(-360, 0, messageTexture), 76, 76)
      : this.addSharpText(-360, 0, iconLabel, {
          fontSize: "46px",
          fontFamily: "Arial Black, Arial",
          color: "#1e3a8a",
          stroke: "#ffffff",
          strokeThickness: 4,
        }).setOrigin(0.5);
    const text = this.addSharpText(20, 0, message, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#1e3a8a",
      stroke: "#ffffff",
      strokeThickness: 4,
      align: "center",
      wordWrap: { width: 680 },
    }).setOrigin(0.5);
    emptyCard.add([bg, icon, text]);
  }

  private getMessageTexture(iconLabel: string) {
    if (iconLabel === "2") return "search-filter-card";
    if (iconLabel === "?") return "search-result-card";
    if (iconLabel === "âš™") return "filter-sites";
    return "search-magnifier";
  }

  private createChip(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    id: string,
    kind: Selectable["kind"],
    color: number,
  ) {
    const container = this.add.container(x, y).setDepth(25);
    const bg = this.add.graphics();
    const text = this.addSharpText(0, 0, label, {
      fontSize: label.length > 16 ? "15px" : "17px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1e3a8a",
      strokeThickness: 3,
      align: "center",
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);
    container.add([bg, text]);
    const hitbox = this.add.zone(x, y, width + 18, height + 18).setDepth(90);
    hitbox.setInteractive({ useHandCursor: true });
    hitbox.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    hitbox.on("pointerout", () => this.input.setDefaultCursor("default"));
    hitbox.on("pointerdown", () => {
      this.startTimerOnce();
      this.playClick();
      if (kind === "keyword") {
        this.selectedKeywordId = id;
        this.selectedResultId = null;
        this.hasClickedFilter = false;
      } else if (kind === "filter") {
        if (!this.selectedKeywordId || this.selectedKeywordId !== this.levelConfig.correctKeywordId) {
          this.showToast("Primeiro escolha uma boa palavra-chave.", COLORS.orange, 2100);
          return;
        }
        this.selectedFilterId = id as FilterId;
        this.selectedResultId = null;
        this.hasClickedFilter = true;
      }
      this.updateSearchBarText();
      this.updateSelectableStyles();
      this.renderResults();
    });
    const item = { id, container, bg, hitbox, kind };
    this.drawChipBackground(item, color, false);
    return item;
  }

  private updateSelectableStyles() {
    this.selectables.forEach((item) => {
      const active =
        (item.kind === "keyword" && item.id === this.selectedKeywordId) ||
        (item.kind === "filter" && item.id === this.selectedFilterId);
      const color = item.kind === "filter" ? COLORS.purple : COLORS.blue;
      this.drawChipBackground(item, color, active);
    });
  }

  private drawChipBackground(item: Selectable, color: number, active: boolean) {
    const hit = item.hitbox.input?.hitArea as Phaser.Geom.Rectangle | undefined;
    const width = hit?.width ? hit.width - 18 : 160;
    const height = hit?.height ? hit.height - 18 : 52;
    item.bg.clear();
    item.bg.fillStyle(active ? color : 0xffffff, active ? 1 : 0.34);
    item.bg.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    item.bg.fillStyle(0xffffff, active ? 0.18 : 0.28);
    item.bg.fillRoundedRect(-width / 2 + 12, -height / 2 + 8, width - 24, Math.max(12, height * 0.35), 14);
    item.bg.lineStyle(active ? 4 : 3, active ? 0xffffff : color, 0.95);
    item.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);
  }

  private validateSearch() {
    if (this.commandLocked) return;
    this.startTimerOnce();
    if (!this.selectedKeywordId || !this.selectedResultId) {
      this.playWrong();
      if (!this.selectedKeywordId) {
        this.showToast("Primeiro escolha uma palavra-chave.", COLORS.orange, 2200);
      } else if (this.selectedKeywordId !== this.levelConfig.correctKeywordId) {
        this.showToast("Essa palavra-chave não trouxe uma boa resposta. Tente outra.", COLORS.orange, 2400);
      } else if (!this.hasClickedFilter) {
        this.showToast("Agora clique em um filtro para liberar as pistas.", COLORS.orange, 2400);
      } else if (this.selectedFilterId !== this.levelConfig.correctFilterId) {
        this.showToast("Agora escolha o filtro certo para a pergunta.", COLORS.orange, 2400);
      } else {
        this.showToast("Toque na resposta antes de validar.", COLORS.orange, 2200);
      }
      return;
    }
    const correct =
      this.selectedKeywordId === this.levelConfig.correctKeywordId &&
      this.selectedFilterId === this.levelConfig.correctFilterId &&
      this.selectedResultId === this.levelConfig.correctResultId;

    if (!correct) {
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
    this.showToast(this.levelConfig.successMessage, COLORS.green, 2500);
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.emitProgress();
    this.time.delayedCall(2600, () => {
      const nextLevel = this.levelConfig.level + 1;
      if (nextLevel <= 3) {
        runtimeGameBridge.emit({ type: "CHECKPOINT", gameId: GAME_ID, stage: nextLevel, progress: 0, score: this.getScore(), hits: this.hits, errors: this.errors });
        this.showLevelCompleteTransition(nextLevel as SearchLevelNumber);
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
      this.showToast("O tempo acabou. Tente esta busca de novo.", COLORS.red, 2100);
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
    const title = this.addSharpText(0, -110, "Como jogar", {
      fontSize: "34px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0.5);
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
      return "Escolha uma palavra-chave. Depois toque na pista que responde à pergunta.";
    }
    if (this.levelConfig.level === 2) {
      return "Escolha uma palavra mais específica, use o filtro certo e toque no resultado que responde à missão.";
    }
    return "Compare as pistas, toque na mais útil e valide a resposta.";
  }

  private showLevelCompleteTransition(nextLevel: SearchLevelNumber) {
    this.clearOverlay();
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.orange);
    const badgeIcon = this.add.image(0, -114, "success-badge");
    this.fitImage(badgeIcon, 82, 82);
    const title = this.addSharpText(0, -58, "Boa investigação!", this.modalTitleStyle()).setOrigin(0.5);
    const score = this.addSharpText(0, -5, `Nível ${this.levelConfig.level} concluído`, {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
    }).setOrigin(0.5);
    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics();
      dot.fillStyle(level <= this.levelConfig.level ? COLORS.green : level === nextLevel ? COLORS.orange : 0xd8dde8, 1);
      dot.fillCircle(-28 + index * 28, 58, 8);
      dot.lineStyle(2, 0xffffff, 0.9);
      dot.strokeCircle(-28 + index * 28, 58, 8);
      return dot;
    });
    modal.add([badgeIcon, title, score, ...dots]);
    this.animateModal(modal);
    this.time.delayedCall(2200, () => this.showNextLevelStartTransition(nextLevel));
  }

  private showNextLevelStartTransition(nextLevel: SearchLevelNumber) {
    this.clearOverlay();
    const nextConfig = LEVELS.find((item) => item.level === nextLevel);
    const overlay = this.addOverlayObject(this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58).setDepth(450));
    overlay.setInteractive();
    const modal = this.createModalBase(640, 360, COLORS.green);
    const title = this.addSharpText(0, -102, `Nível ${nextLevel} liberado!`, this.modalTitleStyle()).setOrigin(0.5);
    const objective = this.addSharpText(0, -24, nextConfig?.title ?? "Nova busca", {
      fontSize: "24px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
    const button = this.createModalButton(0, 104, "Iniciar nível", COLORS.orange);

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
    const title = this.addSharpText(0, -128, "Busca concluída!", {
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
    const sparkles = Array.from({ length: 14 }, (_, index) => {
      const sparkle = this.add.graphics();
      const x = Phaser.Math.Between(-278, 278);
      const y = Phaser.Math.Between(-168, 158);
      sparkle.fillStyle(index % 3 === 0 ? COLORS.cyan : index % 3 === 1 ? COLORS.orange : COLORS.green, 0.9);
      sparkle.fillCircle(x, y, Phaser.Math.Between(4, 8));
      this.tweens.add({ targets: sparkle, alpha: { from: 0.35, to: 1 }, scale: { from: 0.8, to: 1.35 }, duration: 720 + index * 35, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      return sparkle;
    });
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
    const zone = this.add.zone(x, y, width + 18, height + 18).setDepth(90);
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

  private addResultObject<T extends Phaser.GameObjects.GameObject>(object: T) {
    this.resultAreaObjects.push(object);
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

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private updateSearchBarText() {
    const query = this.getSelectedKeywordLabel() || "Escolha uma palavra-chave";
    this.children.getAll("queryText").forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) child.setText(query);
    });
  }

  private getSelectedKeywordLabel() {
    return this.levelConfig.keywords.find((item) => item.id === this.selectedKeywordId)?.label ?? "";
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
      type: "LEVEL_PROGRESS",
      gameId: GAME_ID,
      stage: this.levelConfig.level,
      progress: this.levelConfig.level / 3,
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
