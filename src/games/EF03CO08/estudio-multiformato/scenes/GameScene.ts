import Phaser from "phaser";
import { EventBus } from "../../../../shared/EventBus";
import { runtimeGameBridge } from "../../../../shared/bridge/runtimeGameBridge";
import { createTutorial, type TutorialStep } from "../../../../shared/tutorial/createTutorial";
import { showLevelComplete } from "../../../../shared/level/showLevelComplete";
import { LEVELS, FORMAT_OPTIONS } from "../data/levels";
import type {
  StudioLevel,
  StudioLevelNumber,
  FormatId,
  DrawingChallenge,
  TextChallenge,
} from "../types";

const GAME_ID = "estudio-multiformato";

// ── Layout constants ────────────────────────────────────────────────────────
// HUD de uma linha: identidade | progresso | tempo, tudo na mesma altura.
const HUD_CY = 56;
const HUD_PROGRESS_X = 736;   // centro do bloco 600 → 872
const HUD_DOTS_CY = 74;
const TIMER_BAR_X = 1040;
const TIMER_BAR_Y = HUD_CY;
const TIMER_BAR_W = 196;      // 942 → 1138, dentro do bloco da direita
const TIMER_BAR_H = 18;
const PANEL_X = 72;
const PANEL_Y = 116;  // logo abaixo do HUD, que agora termina em y 94
const PANEL_W = 1136; // x: 72 → 1208
const PANEL_H = 512;  // y: 116 → 628
const MODAL_SCALE = 1.12;

// Mural lives on the right 350 px of the panel (split at x = 858)
const SPLIT_X = 858;
const LEFT_CX = (PANEL_X + SPLIT_X) / 2;        // ≈ 465
const RIGHT_CX = (SPLIT_X + PANEL_X + PANEL_W) / 2; // ≈ 1033

// ── Shared vertical rhythm ──────────────────────────────────────────────────
// Uma única fonte de verdade para onde cada bloco senta dentro do painel.
// O tutorial lê estas constantes, então holofote e UI nunca saem de sincronia.
const CONFIRM_CY = PANEL_Y + PANEL_H - 42;        // 586 — botão Confirmar
const CARD_H = 196;                               // altura dos cartões de formato
const N1_TASK_CY = PANEL_Y + 128;                 // 244 — cartão da tarefa (N1)
const N1_CARDS_CY = PANEL_Y + 320;                // 436 — fileira de 4 formatos
const N3_GOAL_CY = PANEL_Y + 128;                 // 244 — cartão do objetivo (N3)
const N3_CARDS_CY = PANEL_Y + 320;                // 436 — fileira de 3 formatos

// Editor (N2 e criadores do N3): rótulo → instrução → tela → paleta → publicar
const EDITOR_LABEL_CY = PANEL_Y + 28;             // 144
const EDITOR_INSTRUCTION_CY = PANEL_Y + 70;       // 186
const EDITOR_CANVAS_TOP = PANEL_Y + 96;           // 212
const EDITOR_CANVAS_H = 296;                      // fundo 508 — cabe no painel
const EDITOR_CANVAS_CY = EDITOR_CANVAS_TOP + EDITOR_CANVAS_H / 2; // 360
const EDITOR_PALETTE_CY = EDITOR_CANVAS_TOP + EDITOR_CANVAS_H + 32; // 540
const EDITOR_PUBLISH_CY = EDITOR_CANVAS_TOP + EDITOR_CANVAS_H + 88; // 596
const EDITOR_CANVAS_LEFT = PANEL_X + 16;          // 88
const EDITOR_CANVAS_W = SPLIT_X - PANEL_X - 34;   // ≈ 752

// Editor de texto: banco de palavras → prévia → publicar
const TEXT_BANK_TOP = PANEL_Y + 96;               // 212 — 2 linhas de chips
const TEXT_PREVIEW_TOP = PANEL_Y + 300;           // 416 — prévia acima do Publicar

// Mural: dois encaixes de tamanho fixo, centrados na cortiça abaixo da faixa.
const MURAL_SLOT_H = 154;
const MURAL_SLOT_GAP = 178;
const MURAL_SLOT_TOP = PANEL_Y + 106;             // 222 — abaixo da faixa "Mural"

const COLORS = {
  purple: 0x7c3aed,
  violet: 0xa855f7,
  orange: 0xf59e0b,
  amber: 0xfbbf24,
  green: 0x22c55e,
  teal: 0x14b8a6,
  blue: 0x3b82f6,
  red: 0xef4444,
  pink: 0xe91e8c,
  yellow: 0xfacc15,
  ink: 0x1e1b4b,
};

export class GameScene extends Phaser.Scene {
  private levelConfig!: StudioLevel;
  private gameEnded = false;
  private hits = 0;
  private errors = 0;

  private timerTrack?: Phaser.GameObjects.Graphics;
  private timerBar?: Phaser.GameObjects.Graphics;
  private timerLabel?: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  private hudLayer?: Phaser.GameObjects.Container;
  private helpBtn?: Phaser.GameObjects.Container;
  private progressDots?: Phaser.GameObjects.Graphics;
  private progressLabel?: Phaser.GameObjects.Text;
  private tutorialOpen = false;
  private fallbackAudioContext?: AudioContext;

  private startScreenObjects: Phaser.GameObjects.GameObject[] = [];
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];

  // N1
  private n1TaskIndex = 0;
  private n1AnswerLocked = false;
  private taskObjects: Phaser.GameObjects.GameObject[] = [];
  /** Centro de cada cartão de formato, para ancorar o efeito de acerto. */
  private n1CardPositions = new Map<FormatId, { x: number; y: number }>();

  // N2
  private n2Phase = 0;
  private phaseObjects: Phaser.GameObjects.GameObject[] = [];
  private drawCanvas?: Phaser.GameObjects.Graphics;
  private drawPoints: Array<{ x: number; y: number; color: number }> = [];
  private activeColor = COLORS.green;
  private drawCount = 0;
  private publishLocked = false;
  private selectedWords: string[] = [];

  // N3
  private cycleIndex = 0;
  private n3AnswerLocked = false;
  private cycleObjects: Phaser.GameObjects.GameObject[] = [];

  private selectedFormatId: FormatId | null = null;

  // Mural (lives inside the panel, right section)
  private muralContainer?: Phaser.GameObjects.Container;
  private muralItems: Array<{ color: number; kind: FormatId }> = [];

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { level?: number; hits?: number; errors?: number }) {
    const level = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as StudioLevelNumber;
    this.levelConfig = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
    this.gameEnded = false;
    this.hits = data?.hits ?? 0;
    this.errors = data?.errors ?? 0;
    this.n1TaskIndex = 0;
    this.n1AnswerLocked = false;
    this.n2Phase = 0;
    this.drawPoints = [];
    this.drawCount = 0;
    this.publishLocked = false;
    this.selectedWords = [];
    this.muralItems = [];
    this.cycleIndex = 0;
    this.n3AnswerLocked = false;
    this.selectedFormatId = null;
    this.startScreenObjects = [];
    this.overlayObjects = [];
    this.taskObjects = [];
    this.phaseObjects = [];
    this.cycleObjects = [];
    this.n1CardPositions.clear();
    this.tutorialOpen = false;
  }

  create() {
    this.createBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
    this.showStartScreen();
  }

  update() {
    if (!this.timerEvent || !this.timerBar) return;
    const remainingMs = Math.max(0, this.timerEvent.getRemaining());
    const pct = Math.max(0, remainingMs / (this.levelConfig.timeLimit * 1000));
    const color = pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.orange : COLORS.red;
    this.drawTimerFill(TIMER_BAR_W * pct, color);
    if (this.timerLabel) this.timerLabel.setText(`${Math.ceil(remainingMs / 1000)}s`);
  }

  private onShutdown() {
    this.timerEvent?.destroy();
    this.timerEvent = undefined;
    if (this.fallbackAudioContext && this.fallbackAudioContext.state !== "closed") {
      void this.fallbackAudioContext.close();
    }
    this.fallbackAudioContext = undefined;
    this.input.setDefaultCursor("default");
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private createBackground() {
    const bgKey =
      this.levelConfig.level === 1 ? "bg-format-workshop"
      : this.levelConfig.level === 2 ? "bg-creative-studio"
      : "bg-mission-studio";
    const bg = this.add.image(640, 360, bgKey).setDepth(-100);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const scale = Math.max(1280 / bg.width, 720 / bg.height);
    bg.setScale(scale);
    this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.06).setDepth(-90);
    this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.22).setDepth(-89);
  }

  // ─── Timer Bar ────────────────────────────────────────────────────────────

  private createTimerBar() {
    const timerTrack = this.add.graphics();
    const timerBar = this.add.graphics();
    // Segundos à esquerda da barra, na mesma linha — sem rótulo "Tempo".
    const timerLabel = this.addSharpText(TIMER_BAR_X - TIMER_BAR_W / 2 - 14, TIMER_BAR_Y, `${this.levelConfig.timeLimit}s`, {
      fontSize: "22px",
      fontFamily: "Arial Black, Arial",
      color: "#1e1b4b",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(1, 0.5);

    this.timerTrack = timerTrack;
    this.timerBar = timerBar;
    this.timerLabel = timerLabel;
    this.hudLayer?.add([timerTrack, timerBar, timerLabel]);

    timerTrack.clear();
    timerTrack.fillStyle(0x1e1b4b, 0.18);
    timerTrack.fillRoundedRect(TIMER_BAR_X - TIMER_BAR_W / 2, TIMER_BAR_Y - TIMER_BAR_H / 2, TIMER_BAR_W, TIMER_BAR_H, TIMER_BAR_H / 2);
    timerTrack.lineStyle(2, 0x7c3aed, 0.45);
    timerTrack.strokeRoundedRect(TIMER_BAR_X - TIMER_BAR_W / 2, TIMER_BAR_Y - TIMER_BAR_H / 2, TIMER_BAR_W, TIMER_BAR_H, TIMER_BAR_H / 2);
    this.drawTimerFill(TIMER_BAR_W, COLORS.green);
  }

  private drawTimerFill(width: number, color: number) {
    if (!this.timerBar) return;
    this.timerBar.clear();
    const x = TIMER_BAR_X - TIMER_BAR_W / 2;
    const y = TIMER_BAR_Y - TIMER_BAR_H / 2;
    const fillW = Math.max(0, Math.min(TIMER_BAR_W, width));
    if (fillW <= 0) return;
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(x + 3, y + 3, Math.max(7, fillW - 6), TIMER_BAR_H - 6, (TIMER_BAR_H - 6) / 2);
    this.timerBar.fillStyle(0xffffff, 0.22);
    this.timerBar.fillRoundedRect(x + 8, y + 5, Math.max(0, fillW - 16), 4, 2);
  }

  private startTimer() {
    this.timerEvent?.remove(false);
    this.timerEvent = this.time.delayedCall(this.levelConfig.timeLimit * 1000, () => this.onTimeUp());
  }

  private onTimeUp() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.hideHud();
    this.input.enabled = false;
    this.errors += 1;
    this.playWrong();
    runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
    this.time.delayedCall(300, () => this.showGameOverScreen());
  }

  // ─── Start Screen ─────────────────────────────────────────────────────────

  private showStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.65).setDepth(60);
    overlay.setInteractive();
    this.startScreenObjects.push(overlay);

    const panel = this.add.container(640, 360).setDepth(62);
    this.startScreenObjects.push(panel);

    // Card mais enxuto: nível · título · uma frase · dica · botão.
    // O `detail` saiu — repetia o objetivo com outras palavras.
    const PW = 600;
    const PH = 340;
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-PW / 2 + 10, -PH / 2 + 12, PW, PH, 32);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.97);
    bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 32);
    bg.lineStyle(6, COLORS.purple, 0.9);
    bg.strokeRoundedRect(-PW / 2, -PH / 2, PW, PH, 32);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.purple, 1);
    topBar.fillRoundedRect(-110, -PH / 2 - 17, 220, 34, 17);
    const lvlLabel = this.addSharpText(0, -PH / 2, `Nível ${this.levelConfig.level} / 3`, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    const title = this.addSharpText(0, -104, this.levelConfig.title, {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#7c3aed", stroke: "#ffffff", strokeThickness: 6, align: "center",
    }).setOrigin(0.5);
    const obj = this.addSharpText(0, -38, this.levelConfig.objective, {
      fontSize: "23px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 508 },
    }).setOrigin(0.5);

    const parts: Phaser.GameObjects.GameObject[] = [shadow, bg, topBar, lvlLabel, title, obj];

    if (this.levelConfig.tip) {
      const tipBg = this.add.graphics();
      tipBg.fillStyle(COLORS.amber, 0.2);
      tipBg.fillRoundedRect(-244, 16, 488, 50, 16);
      const tip = this.addSharpText(0, 41, this.levelConfig.tip, {
        fontSize: "18px", fontFamily: "Arial Black, Arial", color: "#92400e", align: "center", wordWrap: { width: 456 },
      }).setOrigin(0.5);
      parts.push(tipBg, tip);
    }

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLORS.purple, 1);
    btnBg.fillRoundedRect(-120, 92, 240, 56, 28);
    btnBg.lineStyle(4, 0xffffff, 1);
    btnBg.strokeRoundedRect(-120, 92, 240, 56, 28);
    const btnText = this.addSharpText(0, 120, "Iniciar", {
      fontSize: "24px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    parts.push(btnBg, btnText);

    panel.add(parts);
    panel.setAlpha(0);
    panel.setScale(0.9);
    this.tweens.add({ targets: panel, alpha: 1, scale: MODAL_SCALE, duration: 280, ease: "Back.easeOut" });

    const hz = this.add.zone(640, 360 + 120 * MODAL_SCALE, 256 * MODAL_SCALE, 68 * MODAL_SCALE).setDepth(70);
    hz.setInteractive({ useHandCursor: true });
    this.startScreenObjects.push(hz);
    hz.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: panel, scale: MODAL_SCALE * 1.02, duration: 80 }); });
    hz.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: panel, scale: MODAL_SCALE, duration: 80 }); });
    hz.on("pointerdown", () => {
      this.playClick();
      this.startScreenObjects.forEach((o) => o.destroy());
      this.startScreenObjects = [];
      this.input.setDefaultCursor("default");
      runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID });
      this.buildLevelUI();
      this.runTutorial();
    });
  }

  // ─── Level UI ─────────────────────────────────────────────────────────────

  private buildLevelUI() {
    this.createHeader();
    this.drawPanelBg();
    if (this.levelConfig.level === 2) {
      this.createMuralSection();
      this.showN2DrawPhase();
    } else if (this.levelConfig.level === 3) {
      this.createMuralSection();
      this.showN3Cycle();
    } else {
      this.showN1Content();
    }
  }

  private runTutorial() {
    this.helpBtn?.setVisible(false);
    this.playTutorial(true, () => this.startTimer());
  }

  private replayTutorial() {
    if (this.gameEnded || this.tutorialOpen) return;
    const wasPaused = this.timerEvent?.paused ?? false;
    if (this.timerEvent) this.timerEvent.paused = true;
    this.playTutorial(false, () => {
      if (this.timerEvent) this.timerEvent.paused = wasPaused;
    });
  }

  private playTutorial(once: boolean, onDone: () => void) {
    if (this.tutorialOpen) return;
    this.tutorialOpen = true;
    this.helpBtn?.setVisible(false);
    createTutorial(this, {
      key: `estudio-multiformato-l${this.levelConfig.level}`,
      once,
      accent: COLORS.purple,
      safeTop: 100,
      steps: this.tutorialSteps(),
      onFinish: () => {
        this.tutorialOpen = false;
        this.revealHelpButton();
        onDone();
      },
    });
  }

  private tutorialSteps(): TutorialStep[] {
    // Os retângulos abaixo espelham a geometria real construída em
    // showN1Content / showN2DrawPhase / showN3Cycle. Se um desses layouts
    // mudar, ajuste aqui também — senão o holofote sai de lugar.
    const MURAL_STEP = {
      shape: "rect" as const,
      x: RIGHT_CX,
      y: PANEL_Y + PANEL_H / 2,
      w: 342,
      h: PANEL_H - 20,
      balloonX: 468,
      balloonY: 556,
    };

    // Uma frase curta por passo. Antes eram frases inteiras que a criança
    // pulava sem ler.
    if (this.levelConfig.level === 1) {
      return [
        {
          text: "Leia o pedido.",
          shape: "rect", x: 640, y: N1_TASK_CY, w: 890, h: 124, balloonY: 400,
        },
        {
          text: "Toque no formato que combina.",
          shape: "rect", x: 640, y: N1_CARDS_CY, w: 900, h: CARD_H + 30, balloonY: 196,
        },
        {
          text: "Depois, toque em Confirmar.",
          shape: "rect", x: 640, y: CONFIRM_CY, w: 292, h: 78, balloonY: 344,
        },
      ];
    }

    if (this.levelConfig.level === 2) {
      return [
        {
          text: "Crie aqui.",
          shape: "rect", x: LEFT_CX, y: EDITOR_CANVAS_CY, w: 782, h: EDITOR_CANVAS_H + 24, balloonY: 568,
        },
        {
          text: "Terminou? Toque em Publicar.",
          shape: "rect", x: LEFT_CX, y: EDITOR_PUBLISH_CY, w: 300, h: 78, balloonY: 392,
        },
        { ...MURAL_STEP, text: "Suas produções ficam no mural." },
      ];
    }

    return [
      {
        text: "Leia o objetivo da missão.",
        shape: "rect", x: LEFT_CX, y: N3_GOAL_CY, w: 780, h: 136, balloonY: 480,
      },
      {
        text: "Toque no cartão que combina.",
        shape: "rect", x: LEFT_CX, y: N3_CARDS_CY, w: 640, h: CARD_H + 30, balloonY: 196,
      },
      { ...MURAL_STEP, text: "Publique duas para terminar." },
    ];
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  private createHeader() {
    this.hudLayer?.destroy(true);
    this.hudLayer = this.add.container(0, 0).setDepth(44);

    // HUD de uma linha só. O objetivo saiu daqui: já foi lido na abertura e
    // continua a um toque no botão "?". Sobram três blocos alinhados na
    // mesma altura — identidade (esquerda), progresso (centro), tempo (direita).
    const shadow = this.add.graphics();
    shadow.fillStyle(0x0f172a, 0.2);
    shadow.fillRoundedRect(46, 26, 1190, 74, 22);

    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.94);
    bar.fillRoundedRect(44, 18, 1192, 76, 22);
    bar.lineStyle(4, COLORS.purple, 0.72);
    bar.strokeRoundedRect(44, 18, 1192, 76, 22);
    bar.lineStyle(2, 0xffffff, 0.92);
    bar.strokeRoundedRect(53, 27, 1174, 58, 15);
    // Separadores verticais entre os três blocos
    bar.lineStyle(2, COLORS.purple, 0.16);
    bar.lineBetween(600, 34, 600, 78);
    bar.lineBetween(872, 34, 872, 78);

    const badge = this.add.graphics();
    badge.fillStyle(COLORS.purple, 1);
    badge.fillRoundedRect(70, 38, 116, 36, 18);
    badge.fillStyle(0xffffff, 0.18);
    badge.fillRoundedRect(76, 42, 104, 12, 6);

    const badgeText = this.addSharpText(128, 56, `Nível ${this.levelConfig.level}/3`, {
      fontSize: "19px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#3b0764",
      strokeThickness: 3,
    }).setOrigin(0.5);

    const title = this.addSharpText(204, 56, this.levelConfig.title, {
      fontSize: "29px",
      fontFamily: "Arial Black, Arial",
      color: "#1e1b4b",
      stroke: "#ffffff",
      strokeThickness: 5,
    }).setOrigin(0, 0.5);

    const progressLabel = this.addSharpText(HUD_PROGRESS_X, 44, "", {
      fontSize: "18px",
      fontFamily: "Arial Black, Arial",
      color: "#7c3aed",
      align: "center",
    }).setOrigin(0.5);
    const progressDots = this.add.graphics();
    const helpBtn = this.buildHelpButton(1194, 56);
    helpBtn.setVisible(false);

    this.progressLabel = progressLabel;
    this.progressDots = progressDots;
    this.helpBtn = helpBtn;
    this.hudLayer.add([shadow, bar, badge, badgeText, title, progressLabel, progressDots, helpBtn]);
    this.createTimerBar();
    this.tweens.add({ targets: this.hudLayer, y: { from: -20, to: 0 }, alpha: { from: 0, to: 1 }, duration: 240, ease: "Cubic.easeOut" });
  }

  private buildHelpButton(x: number, y: number) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.16);
    bg.fillCircle(0, 6, 27);
    bg.fillStyle(COLORS.amber, 1);
    bg.fillCircle(0, 0, 27);
    bg.fillStyle(0xffffff, 0.22);
    bg.fillEllipse(0, -10, 30, 12);
    bg.lineStyle(3, 0xffffff, 0.86);
    bg.strokeCircle(0, 0, 27);

    const mark = this.addSharpText(0, -1, "?", {
      fontSize: "27px",
      fontFamily: "Arial Black, Arial",
      color: "#1e1b4b",
    }).setOrigin(0.5);

    btn.add([bg, mark]);
    btn.setSize(66, 66);
    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerover", () => {
      if (this.gameEnded || this.tutorialOpen) return;
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: btn, scale: 1.06, duration: 90 });
    });
    btn.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: btn, scale: 1, duration: 90 });
    });
    btn.on("pointerdown", () => {
      if (this.gameEnded || this.tutorialOpen) return;
      this.playClick();
      this.tweens.add({ targets: btn, scale: 0.9, duration: 70, yoyo: true });
      this.replayTutorial();
    });
    return btn;
  }

  private revealHelpButton() {
    if (!this.helpBtn || this.gameEnded) return;
    if (this.helpBtn.visible) {
      this.helpBtn.setInteractive({ useHandCursor: true });
      return;
    }
    this.helpBtn.setVisible(true).setAlpha(0);
    this.helpBtn.setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 220 });
  }

  private hideHud() {
    this.hudLayer?.setVisible(false);
    this.helpBtn?.disableInteractive();
  }

  private updateHeaderProgress(label: string, current: number, total: number) {
    this.progressLabel?.setText(label);
    if (!this.progressDots) return;
    this.progressDots.clear();
    const gap = total > 4 ? 22 : 28;
    const startX = HUD_PROGRESS_X - ((total - 1) * gap) / 2;
    for (let i = 0; i < total; i++) {
      const x = startX + i * gap;
      const done = i + 1 < current;
      const now = i + 1 === current;
      this.progressDots.fillStyle(done ? COLORS.green : now ? COLORS.purple : 0xcbd5e1, done || now ? 1 : 0.7);
      if (now) this.progressDots.fillRoundedRect(x - 14, HUD_DOTS_CY - 7, 28, 14, 7);
      else this.progressDots.fillCircle(x, HUD_DOTS_CY, 7);
      this.progressDots.lineStyle(2, 0xffffff, 0.9);
      if (now) this.progressDots.strokeRoundedRect(x - 14, HUD_DOTS_CY - 7, 28, 14, 7);
      else this.progressDots.strokeCircle(x, HUD_DOTS_CY, 7);
    }
  }

  // ─── Panel Background (mirrors EF03CO07 drawPanel) ────────────────────────

  private drawPanelBg() {
    const shadow = this.add.graphics().setDepth(1);
    shadow.fillStyle(0x1e1b4b, 0.18);
    shadow.fillRoundedRect(PANEL_X + 9, PANEL_Y + 12, PANEL_W, PANEL_H, 30);
    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(0xffffff, 0.32);
    panel.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
    panel.fillStyle(0xfde8ff, 0.15);
    panel.fillRoundedRect(PANEL_X + 12, PANEL_Y + 12, PANEL_W - 24, PANEL_H - 24, 24);
    panel.fillStyle(0xffffff, 0.18);
    panel.fillRoundedRect(PANEL_X + 20, PANEL_Y + 16, PANEL_W - 40, 44, 20);
    panel.lineStyle(7, 0xffffff, 0.9);
    panel.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 30);
  }

  // ─── Mural Section (right zone of panel, x=858–1208) ─────────────────────

  private createMuralSection() {
    // Mural board drawn with Graphics (school cork board in a wooden frame).
    const MURAL_W = PANEL_X + PANEL_W - SPLIT_X - 12;
    const MURAL_H = PANEL_H - 24;
    const left = RIGHT_CX - MURAL_W / 2;
    const top = PANEL_Y + 12;

    const board = this.add.graphics().setDepth(3);

    // Drop shadow
    board.fillStyle(0x1e1b4b, 0.16);
    board.fillRoundedRect(left + 5, top + 7, MURAL_W, MURAL_H, 20);

    // Wooden frame
    board.fillStyle(0x8b5e3c, 1);
    board.fillRoundedRect(left, top, MURAL_W, MURAL_H, 20);
    board.fillStyle(0xa9714b, 1);
    board.fillRoundedRect(left + 4, top + 4, MURAL_W - 8, MURAL_H - 8, 17);
    board.fillStyle(0x6d4526, 0.55);
    board.fillRoundedRect(left + 10, top + 10, MURAL_W - 20, 6, 3);

    // Cork surface
    const ix = left + 14;
    const iy = top + 14;
    const iw = MURAL_W - 28;
    const ih = MURAL_H - 28;
    board.fillStyle(0xd9a86c, 1);
    board.fillRoundedRect(ix, iy, iw, ih, 12);
    board.fillStyle(0xc79256, 0.55);
    board.fillRoundedRect(ix, iy + ih * 0.55, iw, ih * 0.45, 12);

    // Cork speckles — deterministic so it never flickers between rebuilds
    board.fillStyle(0x8f6234, 0.28);
    for (let i = 0; i < 90; i++) {
      const sx = ix + 8 + ((i * 97) % Math.max(1, Math.floor(iw - 16)));
      const sy = iy + 8 + ((i * 233) % Math.max(1, Math.floor(ih - 16)));
      board.fillCircle(sx, sy, 1 + (i % 3));
    }

    // Inner shading so the cork reads as recessed
    board.lineStyle(4, 0x6d4526, 0.35);
    board.strokeRoundedRect(ix, iy, iw, ih, 12);
    board.lineStyle(2, 0xffffff, 0.28);
    board.strokeRoundedRect(ix + 4, iy + 4, iw - 8, ih - 8, 10);

    // Header ribbon on the board
    const ribbonW = iw - 24;
    board.fillStyle(COLORS.purple, 0.95);
    board.fillRoundedRect(ix + 12, iy + 10, ribbonW, 44, 14);
    board.fillStyle(0xffffff, 0.18);
    board.fillRoundedRect(ix + 18, iy + 15, ribbonW - 12, 16, 8);

    // Pins holding the ribbon
    [ix + 30, ix + iw - 30].forEach((px) => {
      board.fillStyle(0xffffff, 0.9);
      board.fillCircle(px, iy + 32, 6);
      board.fillStyle(COLORS.amber, 1);
      board.fillCircle(px, iy + 32, 4);
    });

    // Divider between editor and mural
    const div = this.add.graphics().setDepth(9);
    div.lineStyle(3, 0xffffff, 0.35);
    div.lineBetween(SPLIT_X - 6, PANEL_Y + 24, SPLIT_X - 6, PANEL_Y + PANEL_H - 24);

    this.addSharpText(RIGHT_CX, iy + 32, "Mural", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    this.muralContainer = this.add.container(0, 0).setDepth(10);
    this.refreshMural();
  }

  private refreshMural() {
    if (!this.muralContainer) return;
    this.muralContainer.removeAll(true);

    if (this.muralItems.length === 0) {
      // Duas molduras vazias já comunicam "cabem duas produções aqui".
      // Não precisa de frase.
      const slots = this.add.graphics();
      for (let i = 0; i < 2; i++) {
        const sy = MURAL_SLOT_TOP + i * MURAL_SLOT_GAP;
        slots.lineStyle(4, 0xffffff, 0.42);
        slots.strokeRoundedRect(RIGHT_CX - 140, sy, 280, MURAL_SLOT_H, 18);
        slots.fillStyle(0xffffff, 0.12);
        slots.fillCircle(RIGHT_CX, sy + MURAL_SLOT_H / 2, 26);
      }
      this.muralContainer.add(slots);
      return;
    }

    this.muralItems.forEach((item, index) => {
      const cy = MURAL_SLOT_TOP + index * MURAL_SLOT_GAP;
      const card = this.add.graphics();
      card.fillStyle(0x0f172a, 0.18);
      card.fillRoundedRect(RIGHT_CX - 136, cy + 6, 280, MURAL_SLOT_H, 18);
      card.fillStyle(item.color, 0.94);
      card.fillRoundedRect(RIGHT_CX - 140, cy, 280, MURAL_SLOT_H, 18);
      card.fillStyle(0xffffff, 0.16);
      card.fillRoundedRect(RIGHT_CX - 130, cy + 8, 260, 24, 12);
      card.lineStyle(4, 0xffffff, 0.95);
      card.strokeRoundedRect(RIGHT_CX - 140, cy, 280, MURAL_SLOT_H, 18);
      // Alfinete
      card.fillStyle(0x0f172a, 0.22);
      card.fillCircle(RIGHT_CX + 1, cy + 1, 9);
      card.fillStyle(0xffffff, 0.95);
      card.fillCircle(RIGHT_CX, cy, 9);
      card.fillStyle(COLORS.amber, 1);
      card.fillCircle(RIGHT_CX, cy, 5);

      // Só o ícone — a etiqueta "Publicado" era redundante: estar no mural
      // já significa publicado.
      const icon = this.createFormatIcon(item.kind, 0xffffff, 72);
      icon.setPosition(RIGHT_CX, cy + MURAL_SLOT_H / 2 + 6);
      this.muralContainer!.add([card, icon]);
    });
  }

  private addToMural(color: number, kind: FormatId) {
    this.muralItems.push({ color, kind });
    this.refreshMural();
  }

  // ─── N1 — Format Matching (full panel width) ──────────────────────────────

  private showN1Content() {
    this.taskObjects.forEach((o) => o.destroy());
    this.taskObjects = [];
    this.n1AnswerLocked = false;

    const tasks = this.levelConfig.formatMatchTasks!;
    if (this.n1TaskIndex >= tasks.length) { this.completeLevel(); return; }
    const task = tasks[this.n1TaskIndex];
    this.updateHeaderProgress(`Tarefa ${this.n1TaskIndex + 1} de ${tasks.length}`, this.n1TaskIndex + 1, tasks.length);


    // Cartão do pedido — texto único, centralizado, sem ícone competindo
    const taskCard = this.addTask(this.add.container(640, N1_TASK_CY).setDepth(12));
    const tcBg = this.add.graphics();
    tcBg.fillStyle(0xffffff, 0.94);
    tcBg.fillRoundedRect(-430, -52, 860, 104, 22);
    tcBg.lineStyle(4, COLORS.purple, 0.7);
    tcBg.strokeRoundedRect(-430, -52, 860, 104, 22);
    const tcIcon = this.createTargetIcon(-378, 0, 42, COLORS.purple);
    const tcText = this.addSharpText(26, 0, task.goal, {
      fontSize: "27px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 720 },
    }).setOrigin(0.5);
    taskCard.add([tcBg, tcIcon, tcText]);
    taskCard.setAlpha(0);
    this.tweens.add({ targets: taskCard, alpha: 1, duration: 200, ease: "Sine.easeOut" });

    // Format buttons — 4 in a row, centrados no painel
    const btnY = N1_CARDS_CY;
    const btnW = 188;
    const btnH = CARD_H;
    const gap = 40;
    const totalW = 4 * btnW + 3 * gap;
    const startX = 640 - totalW / 2 + btnW / 2;
    this.selectedFormatId = null;
    this.n1CardPositions.clear();
    const n1Rings: Phaser.GameObjects.Graphics[] = [];
    FORMAT_OPTIONS.forEach((fmt, i) => {
      const bx = startX + i * (btnW + gap);
      this.n1CardPositions.set(fmt.id, { x: bx, y: btnY });
      const { ring } = this.createFormatBtn(bx, btnY, btnW, btnH, fmt.id, fmt.label, fmt.color, (id) => {
        this.selectedFormatId = id;
        n1Rings.forEach((r) => r.setVisible(false));
        ring.setVisible(true);
        const cb = this.children.getByName("confirmBtn") as Phaser.GameObjects.Container | null;
        if (cb) this.tweens.add({ targets: cb, alpha: 1, duration: 150 });
      });
      n1Rings.push(ring);
    });
    // Confirm button — activates after a format card is selected
    const confirmY = CONFIRM_CY;
    const confirmBtn = this.addTask(this.add.container(640, confirmY).setDepth(30));
    const cBg = this.add.graphics();
    cBg.fillStyle(COLORS.purple, 1);
    cBg.fillRoundedRect(-134, -29, 268, 58, 29);
    cBg.lineStyle(4, 0xffffff, 1);
    cBg.strokeRoundedRect(-134, -29, 268, 58, 29);
    const cTxt = this.addSharpText(0, 0, "Confirmar", {
      fontSize: "23px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    confirmBtn.add([cBg, cTxt]);
    confirmBtn.setAlpha(0.35);
    confirmBtn.setName("confirmBtn");
    const confirmZone = this.addTask(this.add.zone(640, confirmY, 282, 70).setDepth(56));
    confirmZone.setInteractive({ useHandCursor: true });
    confirmZone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    confirmZone.on("pointerout", () => this.input.setDefaultCursor("default"));
    confirmZone.on("pointerdown", () => {
      const id = this.selectedFormatId;
      if (!id || this.gameEnded || this.n1AnswerLocked) return;
      this.playClick();
      this.onN1FormatSelected(id, task.correctFormat, task.hint);
    });
  }

  private onN1FormatSelected(selected: FormatId, correct: FormatId, hint: string) {
    if (this.gameEnded || this.n1AnswerLocked) return;
    this.n1AnswerLocked = true;
    if (selected === correct) {
      // Sem popup: o acerto é celebrado NO cartão escolhido — anel verde,
      // check e faíscas. A criança olha para onde tocou, não para o rodapé.
      this.hits += 1;
      this.playSuccess();
      const card = this.n1CardPositions.get(selected);
      if (card) this.burstSuccess(card.x, card.y);
      runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
      this.time.delayedCall(900, () => {
        if (this.gameEnded) return;
        this.n1TaskIndex += 1;
        this.showN1Content();
      });
    } else {
      this.errors += 1;
      this.playWrong();
      this.showToast(`Ainda não. ${hint}`, COLORS.red, 2200);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.time.delayedCall(350, () => {
        if (!this.gameEnded) this.n1AnswerLocked = false;
      });
    }
  }

  private createFormatBtn(
    x: number, y: number, w: number, h: number,
    formatId: FormatId, label: string, color: number,
    onSelect: (id: FormatId) => void,
  ): { btn: Phaser.GameObjects.Container; ring: Phaser.GameObjects.Graphics } {
    const btn = this.addTask(this.add.container(x, y).setDepth(20));
    const textureKey = `format-card-${formatId}`;
    let hitW = w;
    let hitH = h;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    shadow.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 24);
    btn.add(shadow);

    if (this.textures.exists(textureKey) && this.textures.get(textureKey).getSourceImage().width > 4) {
      const cardImg = this.add.image(0, 0, textureKey);
      cardImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.fitImage(cardImg, w, h);
      hitW = cardImg.displayWidth;
      hitH = cardImg.displayHeight;
      btn.add(cardImg);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.92);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
      bg.fillStyle(color, 0.16);
      bg.fillRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h * 0.42, 12);
      bg.lineStyle(4, color, 0.85);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
      const iconShape = this.createFormatIcon(formatId, color, 58);
      btn.add([bg, iconShape]);
    }

    const lblPill = this.add.graphics();
    lblPill.fillStyle(color, 0.96);
    lblPill.fillRoundedRect(-hitW / 2 + 10, hitH / 2 - 52, hitW - 20, 42, 21);
    lblPill.lineStyle(2, 0xffffff, 0.9);
    lblPill.strokeRoundedRect(-hitW / 2 + 10, hitH / 2 - 52, hitW - 20, 42, 21);
    const lblTxt = this.addSharpText(0, hitH / 2 - 31, label, {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#1e1b4b", strokeThickness: 3,
    }).setOrigin(0.5);

    const ring = this.add.graphics();
    ring.lineStyle(7, 0xfacc15, 1);
    ring.strokeRoundedRect(-hitW / 2 - 6, -hitH / 2 - 6, hitW + 12, hitH + 12, 24);
    ring.setVisible(false);
    btn.add([lblPill, lblTxt, ring]);

    const zone = this.addTask(this.add.zone(x, y, hitW, hitH).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: btn, scale: 1.045, y: y - 4, duration: 110 }); });
    zone.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: btn, scale: 1, y, duration: 110 }); });
    zone.on("pointerdown", () => {
      if (this.gameEnded) return;
      this.playClick();
      this.tweens.add({ targets: btn, scale: 0.96, duration: 70, yoyo: true });
      onSelect(formatId);
    });
    return { btn, ring };
  }

  private addTask<T extends Phaser.GameObjects.GameObject>(o: T) { this.taskObjects.push(o); return o; }

  /**
   * Efeito de acerto do N1, ancorado no cartão que a criança tocou:
   * anel verde que se expande, check desenhado e faíscas saindo do centro.
   * Substitui o antigo toast — celebra sem tapar a tela nem exigir leitura.
   */
  private burstSuccess(x: number, y: number) {
    // Anel que expande e desaparece
    for (let i = 0; i < 2; i++) {
      const ring = this.add.graphics().setDepth(70);
      ring.lineStyle(7 - i * 2, COLORS.green, 1);
      ring.strokeCircle(0, 0, 54);
      ring.setPosition(x, y);
      ring.setScale(0.55);
      this.tweens.add({
        targets: ring,
        scale: 2.1 + i * 0.4,
        alpha: 0,
        duration: 620 + i * 160,
        delay: i * 90,
        ease: "Cubic.easeOut",
        onComplete: () => ring.destroy(),
      });
    }

    // Selo com check no centro do cartão
    const badge = this.add.container(x, y).setDepth(72);
    const disc = this.add.graphics();
    disc.fillStyle(0x0f172a, 0.2);
    disc.fillCircle(2, 4, 42);
    disc.fillStyle(COLORS.green, 1);
    disc.fillCircle(0, 0, 42);
    disc.lineStyle(5, 0xffffff, 0.95);
    disc.strokeCircle(0, 0, 42);
    const check = this.add.graphics();
    check.lineStyle(9, 0xffffff, 1);
    check.beginPath();
    check.moveTo(-18, 2);
    check.lineTo(-5, 16);
    check.lineTo(20, -14);
    check.strokePath();
    badge.add([disc, check]);
    badge.setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: badge, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" });
    this.tweens.add({
      targets: badge,
      scale: 1.25, alpha: 0,
      delay: 520, duration: 300, ease: "Cubic.easeIn",
      onComplete: () => badge.destroy(),
    });

    // Faíscas radiais
    const SPARKS = 10;
    for (let i = 0; i < SPARKS; i++) {
      const angle = (Math.PI * 2 * i) / SPARKS - Math.PI / 2;
      const dist = 92 + (i % 3) * 20;
      const spark = this.add.graphics().setDepth(71);
      spark.fillStyle(i % 2 === 0 ? COLORS.green : COLORS.amber, 1);
      spark.fillCircle(0, 0, 7 - (i % 3));
      spark.setPosition(x, y);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 560,
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  // ─── N2 — Drawing Phase (left zone) ──────────────────────────────────────

  private showN2DrawPhase() {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.drawPoints = [];
    this.drawCount = 0;
    this.publishLocked = false;

    const ch = this.levelConfig.drawChallenge!;
    this.updateHeaderProgress("Criação 1 de 2", 1, 2);

    // "Fase 1 de 2" saiu: o HUD já mostra o progresso com pontinhos.
    this.showEditorLabel(`Desenho · ${ch.theme}`, COLORS.pink);
    this.addPhase(this.addSharpText(LEFT_CX, EDITOR_INSTRUCTION_CY, ch.instruction, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#5b21b6", stroke: "#ffffff", strokeThickness: 4, align: "center",
      wordWrap: { width: 720 },
    }).setOrigin(0.5).setDepth(15));

    // Canvas background
    const CANVAS_LEFT = EDITOR_CANVAS_LEFT;
    const CANVAS_TOP = EDITOR_CANVAS_TOP;
    const CANVAS_W = EDITOR_CANVAS_W;
    const CANVAS_H = EDITOR_CANVAS_H;
    this.addPhase(this.buildCanvasSurface(CANVAS_LEFT, CANVAS_TOP, CANVAS_W, CANVAS_H));

    this.drawCanvas = this.addPhase(this.add.graphics().setDepth(11)) as Phaser.GameObjects.Graphics;

    // Color palette
    this.activeColor = ch.colors[0];
    this.buildPalette(ch.colors, EDITOR_PALETTE_CY);

    // Counter
    this.addPhase(this.addSharpText(EDITOR_CANVAS_LEFT + EDITOR_CANVAS_W - 20, EDITOR_PALETTE_CY, `0/${ch.minStrokes}`, {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 5,
    }).setOrigin(1, 0.5).setDepth(20)).setName("drawCounter");

    // Publish button (dimmed until threshold)
    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, EDITOR_PUBLISH_CY, () => {
      if (this.gameEnded || this.publishLocked || this.drawCount < ch.minStrokes) return;
      this.onPublishDraw();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");

    // Draw zone
    const drawZone = this.addPhase(this.add.zone(
      CANVAS_LEFT + CANVAS_W / 2,
      CANVAS_TOP + CANVAS_H / 2,
      CANVAS_W, CANVAS_H,
    ).setDepth(50));
    drawZone.setInteractive();

    const onPaint = (pointer: Phaser.Input.Pointer) => {
      if (this.gameEnded || !pointer.isDown) return;
      const px = pointer.x; const py = pointer.y;
      if (px < CANVAS_LEFT || px > CANVAS_LEFT + CANVAS_W || py < CANVAS_TOP || py > CANVAS_TOP + CANVAS_H) return;
      this.drawPoints.push({ x: px, y: py, color: this.activeColor });
      this.drawCount += 1;
      this.redrawCanvas();
      const counter = this.children.getByName("drawCounter") as Phaser.GameObjects.Text | null;
      if (counter) counter.setText(`${Math.min(this.drawCount, ch.minStrokes)}/${ch.minStrokes}`);
      if (this.drawCount >= ch.minStrokes) {
        const btn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (btn && btn.alpha < 1) this.tweens.add({ targets: btn, alpha: 1, duration: 200 });
      }
    };
    drawZone.on("pointermove", onPaint);
    drawZone.on("pointerdown", onPaint);
  }

  /**
   * Superfície de pintura. Usa o PNG studio-canvas quando ele existe e cai
   * para Graphics quando não — mesma proteção aplicada aos cartões de formato,
   * para que apagar um asset não derrube mais o jogo.
   */
  private buildCanvasSurface(left: number, top: number, w: number, h: number) {
    if (this.textures.exists("studio-canvas") && this.textures.get("studio-canvas").getSourceImage().width > 4) {
      const img = this.add.image(left + w / 2, top + h / 2, "studio-canvas").setDepth(10);
      img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.fitImage(img, w, h);
      return img;
    }

    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1e1b4b, 0.14);
    g.fillRoundedRect(left + 5, top + 6, w, h, 16);
    g.fillStyle(0xffffff, 0.97);
    g.fillRoundedRect(left, top, w, h, 16);
    g.lineStyle(5, COLORS.purple, 0.55);
    g.strokeRoundedRect(left, top, w, h, 16);
    // Grade leve, para a criança perceber a área de pintura
    g.lineStyle(1, COLORS.purple, 0.1);
    for (let x = left + 40; x < left + w; x += 40) g.lineBetween(x, top + 8, x, top + h - 8);
    for (let y = top + 40; y < top + h; y += 40) g.lineBetween(left + 8, y, left + w - 8, y);
    return g;
  }

  private buildPalette(colors: number[], cy: number) {
    colors.forEach((color, i) => {
      const cx = PANEL_X + 44 + i * 66;
      const dot = this.addPhase(this.add.graphics().setDepth(20));
      dot.fillStyle(0x0f172a, 0.2);
      dot.fillCircle(cx + 1, cy + 3, 25);
      dot.fillStyle(color, 1);
      dot.fillCircle(cx, cy, 25);
      dot.lineStyle(4, 0xffffff, 1);
      dot.strokeCircle(cx, cy, 25);
      const zone = this.addPhase(this.add.zone(cx, cy, 60, 60).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => { if (this.gameEnded) return; this.activeColor = color; this.playClick(); });
    });
  }

  private redrawCanvas() {
    if (!this.drawCanvas) return;
    this.drawCanvas.clear();
    this.drawPoints.forEach((pt) => {
      this.drawCanvas!.fillStyle(pt.color, 0.85);
      this.drawCanvas!.fillCircle(pt.x, pt.y, 20);
    });
  }

  private onPublishDraw() {
    if (this.gameEnded || this.publishLocked) return;
    this.lockPublishButton();
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.pink, "drawing", () => {
      this.addToMural(COLORS.pink, "drawing");
      this.showN2TextPhase();
    });
  }

  // ─── N2 — Text Phase (left zone) ─────────────────────────────────────────

  private showN2TextPhase() {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];
    this.publishLocked = false;

    const ch = this.levelConfig.textChallenge!;
    this.updateHeaderProgress("Criação 2 de 2", 2, 2);
    this.showEditorLabel(`Texto · ${ch.theme}`, COLORS.blue);
    this.addPhase(this.addSharpText(LEFT_CX, EDITOR_INSTRUCTION_CY, ch.instruction, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 4, align: "center",
      wordWrap: { width: 720 },
    }).setOrigin(0.5).setDepth(15));

    this.buildWordBank(ch.wordBank, ch.minWords, LEFT_CX, TEXT_BANK_TOP);

    this.buildPostPreview(LEFT_CX, TEXT_PREVIEW_TOP);

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, EDITOR_PUBLISH_CY, () => {
      if (this.gameEnded || this.publishLocked || this.selectedWords.length < ch.minWords) return;
      this.onPublishText();
    }));
    pubBtn.setAlpha(this.selectedWords.length >= ch.minWords ? 1 : 0.35);
    pubBtn.setName("publishBtn");
  }

  private onPublishText() {
    if (this.gameEnded || this.publishLocked) return;
    const minWords = this.levelConfig.level === 2
      ? this.levelConfig.textChallenge!.minWords
      : (this.levelConfig.creationCycles![this.cycleIndex].challenge as TextChallenge).minWords;
    if (this.selectedWords.length < minWords) return;
    this.lockPublishButton();
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.blue, "text", () => {
      this.addToMural(COLORS.blue, "text");
      if (this.levelConfig.level === 2) {
        this.completeLevel();
      } else {
        this.cycleIndex += 1;
        this.selectedWords = [];
        this.phaseObjects.forEach((o) => o.destroy());
        this.phaseObjects = [];
        if (this.cycleIndex < this.levelConfig.creationCycles!.length) {
          this.showN3Cycle();
        } else {
          this.completeFinalLevel();
        }
      }
    });
  }

  // ─── N3 — Creative Cycle ──────────────────────────────────────────────────

  private showN3Cycle() {
    this.cycleObjects.forEach((o) => o.destroy());
    this.cycleObjects = [];
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];
    this.drawPoints = [];
    this.drawCount = 0;
    this.n3AnswerLocked = false;

    const cycles = this.levelConfig.creationCycles!;
    if (this.cycleIndex >= cycles.length) { this.completeFinalLevel(); return; }
    const cycle = cycles[this.cycleIndex];
    this.updateHeaderProgress(`Missão ${this.cycleIndex + 1} de ${cycles.length}`, this.cycleIndex + 1, cycles.length);

    this.showEditorLabel("Toque no cartão certo", COLORS.purple);
    const guideBg = this.add.graphics();
    const guideText = this.addSharpText(0, 0, "", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center",
    }).setOrigin(0.5);
    const guide = this.addCycle(this.add.container(LEFT_CX, N3_GOAL_CY + 80).setDepth(18));
    const paintGuide = (color: number, message: string) => {
      guideBg.clear();
      guideBg.fillStyle(0x0f172a, 0.14);
      guideBg.fillRoundedRect(-294, -17, 588, 40, 20);
      guideBg.fillStyle(color, 0.96);
      guideBg.fillRoundedRect(-300, -23, 600, 40, 20);
      guideBg.fillStyle(0xffffff, 0.2);
      guideBg.fillRoundedRect(-288, -17, 576, 12, 6);
      guideText.setText(message);
    };
    paintGuide(COLORS.amber, "Qual cartão combina com o pedido?");
    guide.add([guideBg, guideText]);

    const goalCard = this.addCycle(this.add.container(LEFT_CX, N3_GOAL_CY).setDepth(12));
    const gcBg = this.add.graphics();
    gcBg.fillStyle(0xffffff, 0.94);
    gcBg.fillRoundedRect(-376, -52, 752, 104, 22);
    gcBg.lineStyle(4, COLORS.purple, 0.7);
    gcBg.strokeRoundedRect(-376, -52, 752, 104, 22);
    const gcIcon = this.createTargetIcon(-326, 0, 42, COLORS.purple);
    const gcText = this.addSharpText(30, 0, cycle.goal, {
      fontSize: "25px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", align: "center", wordWrap: { width: 616 },
    }).setOrigin(0.5);
    goalCard.add([gcBg, gcIcon, gcText]);
    goalCard.setAlpha(0);
    this.tweens.add({ targets: goalCard, alpha: 1, duration: 220 });

    const btnW = 178;
    const btnH = 186;
    const gap = 30;
    const totalW = cycle.formatOptions.length * btnW + (cycle.formatOptions.length - 1) * gap;
    const startX = LEFT_CX - totalW / 2 + btnW / 2;
    const btnY = N3_CARDS_CY;
    this.selectedFormatId = null;
    const n3Rings: Phaser.GameObjects.Graphics[] = [];
    const cardGuides: Phaser.GameObjects.Graphics[] = [];
    cycle.formatOptions.forEach((fmtId, i) => {
      const fmt = FORMAT_OPTIONS.find((f) => f.id === fmtId)!;
      const bx = startX + i * (btnW + gap);
      const btn = this.addCycle(this.add.container(bx, btnY).setDepth(20));
      const textureKey = `format-card-${fmtId}`;
      let hitW = btnW;
      let hitH = btnH;
      if (this.textures.exists(textureKey) && this.textures.get(textureKey).getSourceImage().width > 4) {
        const cardImg = this.add.image(0, 0, textureKey);
        cardImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.fitImage(cardImg, btnW, btnH);
        hitW = cardImg.displayWidth;
        hitH = cardImg.displayHeight;
        btn.add(cardImg);
      } else {
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.88);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        bg.fillStyle(fmt.color, 0.14);
        bg.fillRoundedRect(-btnW / 2 + 10, -btnH / 2 + 10, btnW - 20, btnH * 0.38, 12);
        bg.lineStyle(4, fmt.color, 0.85);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        const iconShape = this.createFormatIcon(fmtId, fmt.color, 54);
        btn.add([bg, iconShape]);
      }
      const lblPill = this.add.graphics();
      lblPill.fillStyle(fmt.color, 0.96);
      lblPill.fillRoundedRect(-btnW / 2 + 10, btnH / 2 - 50, btnW - 20, 40, 20);
      lblPill.lineStyle(2, 0xffffff, 0.9);
      lblPill.strokeRoundedRect(-btnW / 2 + 10, btnH / 2 - 50, btnW - 20, 40, 20);
      const lblTxt = this.addSharpText(0, btnH / 2 - 30, fmt.label, {
        fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#1e1b4b", strokeThickness: 3,
      }).setOrigin(0.5);
      btn.add(lblPill);
      const ring = this.add.graphics();
      ring.lineStyle(6, 0xfacc15, 1);
      ring.strokeRoundedRect(-btnW / 2 - 5, -btnH / 2 - 5, btnW + 10, btnH + 10, 26);
      ring.setVisible(false);
      btn.add([lblTxt, ring]);
      n3Rings.push(ring);
      const cardGuide = this.addCycle(this.add.graphics().setDepth(18));
      cardGuide.lineStyle(4, COLORS.amber, 0.72);
      cardGuide.strokeRoundedRect(bx - hitW / 2 - 8, btnY - hitH / 2 - 8, hitW + 16, hitH + 16, 28);
      cardGuides.push(cardGuide);
      this.tweens.add({ targets: cardGuide, alpha: { from: 0.32, to: 0.92 }, y: { from: 0, to: 7 }, duration: 620, yoyo: true, repeat: -1, delay: i * 90 });
      const zone = this.addCycle(this.add.zone(bx, btnY, hitW, hitH).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.tweens.add({ targets: btn, scale: 1.06, duration: 80 }); });
      zone.on("pointerout", () => { this.input.setDefaultCursor("default"); this.tweens.add({ targets: btn, scale: 1, duration: 80 }); });
      zone.on("pointerdown", () => {
        if (this.gameEnded || this.n3AnswerLocked) return;
        this.playClick();
        const isCorrect = fmtId === cycle.correctFormat;
        if (isCorrect) {
          this.selectedFormatId = fmtId;
          n3Rings.forEach((r) => r.setVisible(false));
          ring.setVisible(true);
          cardGuides.forEach((g) => {
            this.tweens.killTweensOf(g);
            this.tweens.add({ targets: g, alpha: 0.14, y: 0, duration: 140 });
          });
          paintGuide(COLORS.green, "Certo. Agora vamos criar.");
        } else {
          paintGuide(COLORS.red, "Tente outro cartão.");
          const flash = this.addCycle(this.add.graphics().setDepth(58));
          flash.lineStyle(7, COLORS.red, 1);
          flash.strokeRoundedRect(bx - hitW / 2 - 8, btnY - hitH / 2 - 8, hitW + 16, hitH + 16, 28);
          this.tweens.add({ targets: flash, alpha: 0, duration: 520, onComplete: () => flash.destroy() });
          this.tweens.add({ targets: btn, x: { from: bx - 7, to: bx + 7 }, duration: 48, yoyo: true, repeat: 3, onComplete: () => btn.setX(bx) });
          this.time.delayedCall(650, () => {
            if (!this.gameEnded && !this.n3AnswerLocked) paintGuide(COLORS.amber, "Qual cartão combina com o pedido?");
          });
        }
        this.onN3FormatSelected(fmtId, cycle.correctFormat);
      });
    });
  }

  private onN3FormatSelected(selected: FormatId, correct: FormatId) {
    if (this.gameEnded || this.n3AnswerLocked) return;
    this.n3AnswerLocked = true;
    if (selected !== correct) {
      this.errors += 1;
      this.playWrong();
      const hint = FORMAT_OPTIONS.find((f) => f.id === correct)!;
      this.showToast(`Dica: use ${hint.label} para esta missão.`, COLORS.red, 2200);
      runtimeGameBridge.emit({ type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: -5 });
      this.time.delayedCall(350, () => {
        if (!this.gameEnded) this.n3AnswerLocked = false;
      });
      return;
    }
    this.hits += 1;
    this.playSuccess();
    this.showToast("Formato certo. Agora crie sua produção.", COLORS.green, 1400);
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 10 });
    const cycle = this.levelConfig.creationCycles![this.cycleIndex];
    this.time.delayedCall(1500, () => {
      if (this.gameEnded) return;
      this.cycleObjects.forEach((o) => o.destroy());
      this.cycleObjects = [];
      if (cycle.challenge.type === "drawing") {
        this.showN3DrawCreator(cycle.challenge);
      } else {
        this.showN3TextCreator(cycle.challenge);
      }
    });
  }

  private showN3DrawCreator(ch: DrawingChallenge) {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.drawPoints = [];
    this.drawCount = 0;
    this.publishLocked = false;
    this.updateHeaderProgress(`Produção ${this.cycleIndex + 1} de ${this.levelConfig.creationCycles!.length}`, this.cycleIndex + 1, this.levelConfig.creationCycles!.length);

    this.showEditorLabel(`Crie: ${ch.theme}`, COLORS.pink);
    this.addPhase(this.addSharpText(LEFT_CX, EDITOR_INSTRUCTION_CY, ch.instruction, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#5b21b6", stroke: "#ffffff", strokeThickness: 4, align: "center",
      wordWrap: { width: 720 },
    }).setOrigin(0.5).setDepth(15));

    const CANVAS_LEFT = EDITOR_CANVAS_LEFT;
    const CANVAS_TOP = EDITOR_CANVAS_TOP;
    const CANVAS_W = EDITOR_CANVAS_W;
    const CANVAS_H = EDITOR_CANVAS_H;

    this.addPhase(this.buildCanvasSurface(CANVAS_LEFT, CANVAS_TOP, CANVAS_W, CANVAS_H));
    this.drawCanvas = this.addPhase(this.add.graphics().setDepth(11)) as Phaser.GameObjects.Graphics;

    this.activeColor = ch.colors[0];
    this.buildPalette(ch.colors, EDITOR_PALETTE_CY);

    this.addPhase(this.addSharpText(EDITOR_CANVAS_LEFT + EDITOR_CANVAS_W - 20, EDITOR_PALETTE_CY, `0/${ch.minStrokes}`, {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 5,
    }).setOrigin(1, 0.5).setDepth(20)).setName("drawCounter");

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, EDITOR_PUBLISH_CY, () => {
      if (this.gameEnded || this.publishLocked || this.drawCount < ch.minStrokes) return;
      this.onN3PublishDraw();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");

    const drawZone = this.addPhase(this.add.zone(CANVAS_LEFT + CANVAS_W / 2, CANVAS_TOP + CANVAS_H / 2, CANVAS_W, CANVAS_H).setDepth(50));
    drawZone.setInteractive();
    const onPaint = (p: Phaser.Input.Pointer) => {
      if (this.gameEnded || !p.isDown) return;
      if (p.x < CANVAS_LEFT || p.x > CANVAS_LEFT + CANVAS_W || p.y < CANVAS_TOP || p.y > CANVAS_TOP + CANVAS_H) return;
      this.drawPoints.push({ x: p.x, y: p.y, color: this.activeColor });
      this.drawCount += 1;
      this.redrawCanvas();
      const counter = this.children.getByName("drawCounter") as Phaser.GameObjects.Text | null;
      if (counter) counter.setText(`${Math.min(this.drawCount, ch.minStrokes)}/${ch.minStrokes}`);
      if (this.drawCount >= ch.minStrokes) {
        const btn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (btn && btn.alpha < 1) this.tweens.add({ targets: btn, alpha: 1, duration: 200 });
      }
    };
    drawZone.on("pointermove", onPaint);
    drawZone.on("pointerdown", onPaint);
  }

  private onN3PublishDraw() {
    if (this.gameEnded || this.publishLocked) return;
    this.lockPublishButton();
    this.hits += 1;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.levelConfig.level, pointsEarned: 20 });
    this.flyToMural(CANVAS_FLY_X(), CANVAS_FLY_Y(), COLORS.pink, "drawing", () => {
      this.addToMural(COLORS.pink, "drawing");
      this.cycleIndex += 1;
      this.selectedWords = [];
      this.phaseObjects.forEach((o) => o.destroy());
      this.phaseObjects = [];
      if (this.cycleIndex < this.levelConfig.creationCycles!.length) {
        this.showN3Cycle();
      } else {
        this.completeFinalLevel();
      }
    });
  }

  private showN3TextCreator(ch: TextChallenge) {
    this.phaseObjects.forEach((o) => o.destroy());
    this.phaseObjects = [];
    this.selectedWords = [];
    this.publishLocked = false;
    this.updateHeaderProgress(`Produção ${this.cycleIndex + 1} de ${this.levelConfig.creationCycles!.length}`, this.cycleIndex + 1, this.levelConfig.creationCycles!.length);

    this.showEditorLabel(`Crie: ${ch.theme}`, COLORS.blue);
    this.addPhase(this.addSharpText(LEFT_CX, EDITOR_INSTRUCTION_CY, ch.instruction, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#1e3a8a", stroke: "#ffffff", strokeThickness: 4, align: "center",
      wordWrap: { width: 720 },
    }).setOrigin(0.5).setDepth(15));

    this.buildWordBank(ch.wordBank, ch.minWords, LEFT_CX, TEXT_BANK_TOP);
    this.buildPostPreview(LEFT_CX, TEXT_PREVIEW_TOP);

    const pubBtn = this.addPhase(this.createPublishButton(LEFT_CX, EDITOR_PUBLISH_CY, () => {
      if (this.gameEnded || this.publishLocked || this.selectedWords.length < ch.minWords) return;
      this.onPublishText();
    }));
    pubBtn.setAlpha(0.35);
    pubBtn.setName("publishBtn");
  }

  private addCycle<T extends Phaser.GameObjects.GameObject>(o: T) { this.cycleObjects.push(o); return o; }

  // ─── Word Bank ────────────────────────────────────────────────────────────

  private buildWordBank(words: string[], minWords: number, cx: number, topY: number) {
    const cols = 4;
    const chipW = 172;
    const chipH = 58;
    const gapX = 10;
    const gapY = 12;
    const startX = cx - ((cols * chipW + (cols - 1) * gapX) / 2) + chipW / 2;

    words.forEach((word, i) => {
      const bx = startX + (i % cols) * (chipW + gapX);
      const by = topY + Math.floor(i / cols) * (chipH + gapY) + chipH / 2;
      const isSelected = this.selectedWords.includes(word);
      const chip = this.addPhase(this.add.container(bx, by).setDepth(20));
      chip.setName(`chip-${word}`);
      const chipBg = this.add.graphics();
      chipBg.fillStyle(isSelected ? COLORS.blue : 0xffffff, isSelected ? 1 : 0.9);
      chipBg.fillRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      chipBg.lineStyle(3, COLORS.blue, 0.8);
      chipBg.strokeRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      const chipText = this.addSharpText(0, 0, word, {
        fontSize: "22px", fontFamily: "Arial Black, Arial",
        color: isSelected ? "#ffffff" : "#1e3a8a",
        stroke: "#ffffff", strokeThickness: isSelected ? 0 : 3,
      }).setOrigin(0.5);
      chip.add([chipBg, chipText]);

      const zone = this.addPhase(this.add.zone(bx, by, chipW + 12, chipH + 12).setDepth(55));
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
      zone.on("pointerout", () => this.input.setDefaultCursor("default"));
      zone.on("pointerdown", () => {
        if (this.gameEnded) return;
        this.playClick();
        if (this.selectedWords.includes(word)) {
          this.selectedWords = this.selectedWords.filter((w) => w !== word);
        } else {
          this.selectedWords.push(word);
        }
        // Update chip visual in-place
        const nowSelected = this.selectedWords.includes(word);
        const chipContainer = this.children.getByName(`chip-${word}`) as Phaser.GameObjects.Container | null;
        if (chipContainer) {
          chipContainer.removeAll(true);
          const newBg = this.add.graphics();
          newBg.fillStyle(nowSelected ? COLORS.blue : 0xffffff, nowSelected ? 1 : 0.9);
          newBg.fillRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
          newBg.lineStyle(3, COLORS.blue, 0.8);
          newBg.strokeRoundedRect(-chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
          const newText = this.addSharpText(0, 0, word, {
            fontSize: "22px", fontFamily: "Arial Black, Arial",
            color: nowSelected ? "#ffffff" : "#1e3a8a",
            stroke: "#ffffff", strokeThickness: nowSelected ? 0 : 3,
          }).setOrigin(0.5);
          chipContainer.add([newBg, newText]);
        }
        const preview = this.children.getByName("postPreview") as Phaser.GameObjects.Text | null;
        if (preview) preview.setText(this.selectedWords.join(" · ") || "...");
        const pubBtn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
        if (pubBtn) this.tweens.add({ targets: pubBtn, alpha: this.selectedWords.length >= minWords ? 1 : 0.35, duration: 150 });
      });
    });
  }

  private buildPostPreview(cx: number, y: number) {
    const postBg = this.addPhase(this.add.graphics().setDepth(10));
    postBg.fillStyle(0x0f172a, 0.14);
    postBg.fillRoundedRect(cx - 356, y + 5, 720, 88, 18);
    postBg.fillStyle(0xffffff, 0.94);
    postBg.fillRoundedRect(cx - 360, y, 720, 88, 18);
    postBg.lineStyle(4, COLORS.blue, 0.55);
    postBg.strokeRoundedRect(cx - 360, y, 720, 88, 18);
    // Sem rótulo "Mensagem": o campo com as palavras dentro já se explica.
    const preview = this.addPhase(this.addSharpText(cx, y + 44, "...", {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#1e1b4b", stroke: "#ffffff", strokeThickness: 3,
      align: "center", wordWrap: { width: 660 },
    }).setOrigin(0.5).setDepth(14));
    preview.setName("postPreview");
  }

  private addPhase<T extends Phaser.GameObjects.GameObject>(o: T) { this.phaseObjects.push(o); return o; }

  // ─── Editor Phase Label (inside panel, top-left of editor zone) ───────────

  private showEditorLabel(title: string, color: number) {
    // Pílula do tamanho do texto, não da largura toda do editor —
    // uma faixa de 648 px com 3 palavras dentro parecia desalinhada.
    const label = this.addSharpText(0, EDITOR_LABEL_CY, title, {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0, 0.5).setDepth(12);
    const pillW = Math.min(label.width + 44, EDITOR_CANVAS_W);
    label.setX(EDITOR_CANVAS_LEFT + 22);

    const g = this.addPhase(this.add.graphics().setDepth(9));
    g.fillStyle(color, 0.94);
    g.fillRoundedRect(EDITOR_CANVAS_LEFT, EDITOR_LABEL_CY - 21, pillW, 42, 21);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(EDITOR_CANVAS_LEFT + 8, EDITOR_LABEL_CY - 15, pillW - 16, 13, 7);
    this.addPhase(label);
  }

  // ─── Publish Button ───────────────────────────────────────────────────────

  private lockPublishButton() {
    this.publishLocked = true;
    const btn = this.children.getByName("publishBtn") as Phaser.GameObjects.Container | null;
    if (btn) this.tweens.add({ targets: btn, alpha: 0.5, scale: 0.98, duration: 120 });
  }

  private createPublishButton(x: number, y: number, onClick: () => void) {
    const btn = this.addPhase(this.add.container(x, y).setDepth(30));
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.purple, 1);
    bg.fillRoundedRect(-134, -29, 268, 58, 29);
    bg.lineStyle(4, 0xffffff, 1);
    bg.strokeRoundedRect(-134, -29, 268, 58, 29);
    const txt = this.addSharpText(0, 0, "Publicar", {
      fontSize: "23px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#3b0764", strokeThickness: 3,
    }).setOrigin(0.5);
    btn.add([bg, txt]);
    const zone = this.addPhase(this.add.zone(x, y, 282, 70).setDepth(55));
    zone.setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    zone.on("pointerout", () => this.input.setDefaultCursor("default"));
    zone.on("pointerdown", onClick);
    return btn;
  }

  // ─── Fly to Mural Animation ───────────────────────────────────────────────

  private flyToMural(fromX: number, fromY: number, color: number, kind: FormatId, onDone: () => void) {
    const muralIndex = this.muralItems.length;
    const targetY = MURAL_SLOT_TOP + muralIndex * MURAL_SLOT_GAP + MURAL_SLOT_H / 2;

    const card = this.add.container(fromX, fromY).setDepth(80);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.92);
    bg.fillRoundedRect(-42, -32, 84, 64, 12);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-42, -32, 84, 64, 12);
    const icon = this.createFormatIcon(kind, 0xffffff, 36);
    card.add([bg, icon]);

    for (let i = 0; i < 5; i++) {
      const trail = this.add.graphics().setDepth(78);
      trail.fillStyle(color, 0.45);
      trail.fillCircle(fromX, fromY, 5 + i);
      this.tweens.add({
        targets: trail,
        x: RIGHT_CX - fromX - i * 18,
        y: targetY - fromY + i * 8,
        alpha: 0,
        duration: 520 + i * 80,
        ease: "Sine.easeOut",
        onComplete: () => trail.destroy(),
      });
    }

    this.tweens.add({
      targets: card,
      x: RIGHT_CX,
      y: targetY,
      angle: 8,
      scaleX: 0.62,
      scaleY: 0.62,
      duration: 680,
      ease: "Cubic.easeOut",
      onComplete: () => { card.destroy(); onDone(); },
    });
  }

  // ─── Level Completion ─────────────────────────────────────────────────────

  private completeLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.hideHud();
    this.input.enabled = false;
    this.playSuccess();
    const nextLevel = (this.levelConfig.level + 1) as StudioLevelNumber;
    runtimeGameBridge.emit({
      type: "CHECKPOINT",
      gameId: GAME_ID,
      stage: nextLevel,
      progress: this.levelConfig.level / 3,
      score: this.getScore(),
      hits: this.hits,
      errors: this.errors,
    });
    this.time.delayedCall(400, () => this.showLevelCompleteScreen(nextLevel));
  }

  private completeFinalLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent?.remove(false);
    this.hideHud();
    this.input.enabled = false;
    this.playSuccess();
    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: 3 });
    this.time.delayedCall(400, () => this.showFinalCompleteScreen());
  }

  // ─── Flow Screens ─────────────────────────────────────────────────────────

  private showLevelCompleteScreen(nextLevel: StudioLevelNumber) {
    this.clearOverlay();
    showLevelComplete(this, {
      subtitle: `Nível ${this.levelConfig.level} concluído`,
      message: `Abrindo nível ${nextLevel}...`,
      accent: COLORS.green,
      overlayColor: COLORS.ink,
      titleColor: "#1e1b4b",
      subtitleColor: "#15803d",
      progress: { total: 3, current: this.levelConfig.level },
      autoAdvance: {
        delay: 1800,
        label: `Abrindo nível ${nextLevel}...`,
        onComplete: () => this.scene.restart({ level: nextLevel, hits: this.hits, errors: this.errors }),
      },
    });
  }

  private showFinalCompleteScreen() {
    this.clearOverlay();
    this.input.enabled = true;
    showLevelComplete(this, {
      title: "Estúdio completo!",
      subtitle: `${this.getScore()} pontos`,
      message: `${this.hits} acertos · ${this.errors} erros`,
      accent: COLORS.purple,
      overlayColor: COLORS.ink,
      titleColor: "#1e1b4b",
      subtitleColor: "#7c3aed",
      progress: { total: 3, current: 3 },
      buttons: [
        { label: "Reiniciar", color: COLORS.green, onClick: () => { this.playClick(); this.scene.restart({ level: 1, hits: 0, errors: 0 }); } },
        { label: "Voltar", color: COLORS.purple, onClick: () => { this.playClick(); EventBus.emit("exit-game"); } },
      ],
    });
  }

  private showGameOverScreen() {
    this.input.enabled = true;
    this.clearOverlay();
    const bg = this.addOverlay(this.add.rectangle(640, 360, 1280, 720, 0x1e1b4b, 0.7).setDepth(60));
    bg.setInteractive();
    const panel = this.addOverlay(this.add.container(640, 360).setDepth(62));
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-298, -196, 596, 392, 30);
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.97);
    panelBg.fillRoundedRect(-310, -208, 620, 396, 30);
    panelBg.lineStyle(5, COLORS.red, 0.8);
    panelBg.strokeRoundedRect(-310, -208, 620, 396, 30);
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.red, 1);
    topBar.fillRoundedRect(-210, -224, 420, 28, 14);
    const icon = this.createClockIcon(0, -138, 58);
    const title = this.addSharpText(0, -62, "Tempo esgotado!", {
      fontSize: "40px", fontFamily: "Arial Black, Arial", color: "#dc2626", stroke: "#ffffff", strokeThickness: 6,
      align: "center", wordWrap: { width: 540 },
    }).setOrigin(0.5);
    const reason = this.addSharpText(0, 2, `${this.getScore()} pontos`, {
      fontSize: "26px", fontFamily: "Arial Black, Arial", color: "#334155", align: "center",
    }).setOrigin(0.5);
    const stats = this.addSharpText(0, 40, `${this.hits} acertos · ${this.errors} erros`, {
      fontSize: "19px", fontFamily: "Arial Black, Arial", color: "#64748b",
    }).setOrigin(0.5);
    const retryBg = this.add.graphics();
    retryBg.fillStyle(COLORS.green, 1);
    retryBg.fillRoundedRect(-262, 68, 240, 52, 26);
    retryBg.lineStyle(4, 0xffffff, 1);
    retryBg.strokeRoundedRect(-262, 68, 240, 52, 26);
    const retryTxt = this.addSharpText(-142, 94, "Jogar de novo", {
      fontSize: "21px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#14532d", strokeThickness: 3,
    }).setOrigin(0.5);
    const exitBg = this.add.graphics();
    exitBg.fillStyle(COLORS.orange, 1);
    exitBg.fillRoundedRect(22, 68, 240, 52, 26);
    exitBg.lineStyle(4, 0xffffff, 1);
    exitBg.strokeRoundedRect(22, 68, 240, 52, 26);
    const exitTxt = this.addSharpText(142, 94, "Sair", {
      fontSize: "20px", fontFamily: "Arial Black, Arial", color: "#ffffff", stroke: "#78350f", strokeThickness: 3,
    }).setOrigin(0.5);
    panel.add([shadow, panelBg, topBar, icon, title, reason, stats, retryBg, retryTxt, exitBg, exitTxt]);
    this.animateModal(panel);

    const rz = this.addOverlay(this.add.zone(640 - 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    rz.setInteractive({ useHandCursor: true });
    rz.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    rz.on("pointerout", () => this.input.setDefaultCursor("default"));
    rz.on("pointerdown", () => { this.playClick(); this.scene.restart({ level: this.levelConfig.level, hits: 0, errors: 0 }); });

    const ez = this.addOverlay(this.add.zone(640 + 142 * MODAL_SCALE, 360 + 94 * MODAL_SCALE, 258 * MODAL_SCALE, 64 * MODAL_SCALE).setDepth(70));
    ez.setInteractive({ useHandCursor: true });
    ez.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    ez.on("pointerout", () => this.input.setDefaultCursor("default"));
    ez.on("pointerdown", () => { this.playClick(); EventBus.emit("exit-game"); });
  }

  // ─── Overlay Helpers ──────────────────────────────────────────────────────

  private addOverlay<T extends Phaser.GameObjects.GameObject>(o: T) { this.overlayObjects.push(o); return o; }
  private clearOverlay() { this.overlayObjects.forEach((o) => o.destroy()); this.overlayObjects = []; this.input.setDefaultCursor("default"); }
  private animateModal(m: Phaser.GameObjects.Container) {
    m.setAlpha(0); m.setScale(0.88);
    this.tweens.add({ targets: m, alpha: 1, scale: MODAL_SCALE, duration: 260, ease: "Back.easeOut" });
  }

  // ─── Graphics Icons ───────────────────────────────────────────────────────

  private createFormatIcon(formatId: FormatId, color: number, size: number) {
    const g = this.add.graphics();
    const s = size;
    g.lineStyle(Math.max(3, s * 0.07), color, 1);
    g.fillStyle(color, 1);

    if (formatId === "drawing") {
      g.fillCircle(-s * 0.18, -s * 0.16, s * 0.14);
      g.fillCircle(s * 0.04, -s * 0.2, s * 0.11);
      g.fillCircle(s * 0.2, 0, s * 0.12);
      g.lineBetween(-s * 0.18, s * 0.2, s * 0.22, s * 0.32);
      g.fillTriangle(s * 0.24, s * 0.34, s * 0.34, s * 0.22, s * 0.39, s * 0.39);
    } else if (formatId === "text") {
      g.strokeRoundedRect(-s * 0.34, -s * 0.32, s * 0.68, s * 0.64, s * 0.08);
      g.lineBetween(-s * 0.2, -s * 0.12, s * 0.22, -s * 0.12);
      g.lineBetween(-s * 0.2, s * 0.04, s * 0.18, s * 0.04);
      g.lineBetween(-s * 0.2, s * 0.2, s * 0.12, s * 0.2);
    } else if (formatId === "audio") {
      g.fillTriangle(-s * 0.34, -s * 0.12, -s * 0.1, -s * 0.3, -s * 0.1, s * 0.3);
      g.fillRect(-s * 0.38, -s * 0.14, s * 0.18, s * 0.28);
      g.lineBetween(s * 0.02, -s * 0.18, s * 0.18, -s * 0.3);
      g.lineBetween(s * 0.02, s * 0.18, s * 0.18, s * 0.3);
      g.lineBetween(s * 0.16, -s * 0.28, s * 0.34, -s * 0.38);
      g.lineBetween(s * 0.16, s * 0.28, s * 0.34, s * 0.38);
    } else {
      g.strokeRoundedRect(-s * 0.38, -s * 0.26, s * 0.76, s * 0.56, s * 0.08);
      g.fillRoundedRect(-s * 0.2, -s * 0.38, s * 0.28, s * 0.14, s * 0.04);
      g.strokeCircle(0, s * 0.02, s * 0.16);
      g.fillCircle(s * 0.24, -s * 0.14, s * 0.05);
    }

    return g;
  }

  private createTargetIcon(x: number, y: number, size: number, color: number) {
    const g = this.add.graphics();
    g.setPosition(x, y);
    g.lineStyle(4, color, 1);
    g.strokeCircle(0, 0, size * 0.42);
    g.strokeCircle(0, 0, size * 0.24);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, size * 0.08);
    return g;
  }

  private createStarRow(x: number, y: number, count: number) {
    const c = this.add.container(x, y);
    for (let i = 0; i < count; i++) {
      const g = this.add.graphics();
      const ox = (i - (count - 1) / 2) * 54;
      g.setPosition(ox, 0);
      g.fillStyle(COLORS.amber, 1);
      g.lineStyle(3, 0xffffff, 1);
      const pts = [];
      for (let p = 0; p < 10; p++) {
        const r = p % 2 === 0 ? 22 : 10;
        const a = -Math.PI / 2 + p * Math.PI / 5;
        pts.push(new Phaser.Geom.Point(Math.cos(a) * r, Math.sin(a) * r));
      }
      g.fillPoints(pts, true);
      g.strokePoints(pts, true);
      c.add(g);
    }
    return c;
  }

  private createClockIcon(x: number, y: number, size: number) {
    const g = this.add.graphics();
    g.setPosition(x, y);
    g.lineStyle(5, COLORS.red, 1);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(0, 0, size * 0.42);
    g.strokeCircle(0, 0, size * 0.42);
    g.lineStyle(4, COLORS.red, 1);
    g.lineBetween(0, 0, 0, -size * 0.22);
    g.lineBetween(0, 0, size * 0.18, size * 0.08);
    return g;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private getScore() { return Math.max(0, this.hits * 20 - this.errors * 5); }

  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const scale = Math.min(maxW / image.width, maxH / image.height);
    image.setScale(scale);
    return image;
  }

  private addSharpText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
    const obj = this.add.text(x, y, text, style);
    obj.setResolution(2);
    return obj;
  }

  private showToast(message: string, color: number, duration = 2200) {
    const container = this.add.container(640, 618).setDepth(200);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.96);
    bg.fillRoundedRect(-500, -44, 1000, 88, 24);
    bg.lineStyle(4, 0xffffff, 0.9);
    bg.strokeRoundedRect(-500, -44, 1000, 88, 24);
    const txt = this.addSharpText(0, 0, message, {
      fontSize: "23px", fontFamily: "Arial Black, Arial", color: "#ffffff",
      stroke: "#0f172a", strokeThickness: 3, align: "center", wordWrap: { width: 900 },
    }).setOrigin(0.5);
    container.add([bg, txt]);
    this.tweens.add({ targets: container, y: 600, alpha: 0, duration: 300, delay: duration, onComplete: () => container.destroy() });
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  private playClick() {
    this.playTone(760, 0.045, "triangle", 0.045, -120);
    this.time.delayedCall(34, () => this.playTone(1040, 0.035, "sine", 0.028, -80));
  }

  private playSuccess() {
    this.playTone(660, 0.1, "triangle", 0.06);
    this.time.delayedCall(100, () => this.playTone(880, 0.1, "triangle", 0.06));
    this.time.delayedCall(200, () => this.playTone(1100, 0.14, "triangle", 0.07));
  }

  private playWrong() {
    this.playTone(200, 0.14, "sawtooth", 0.05, -60);
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number, sweep = 0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (sweep !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + sweep), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private getAudioContext(): AudioContext | null {
    if ("context" in this.sound) {
      return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
    }
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!this.fallbackAudioContext) this.fallbackAudioContext = new AC();
    return this.fallbackAudioContext;
  }

}

// Helper: approximate center of the drawing canvas for fly animation origin
function CANVAS_FLY_X() { return LEFT_CX; }
function CANVAS_FLY_Y() { return PANEL_Y + PANEL_H / 2; }
