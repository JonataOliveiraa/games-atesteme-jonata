import Phaser from 'phaser';
import { LEVELS } from '../data/levels';
import { ROBOT_PARTS } from '../data/parts';
import type { RobotPartId } from '../types';

const GAME_ID = 'EF01CO02';
const MAX_MISTAKES = 2;
const VISIBLE_SLOTS = 3;
const ROBOT_W = 420;
const ROBOT_H = 600;

const COLORS = {
    green: 0x2dd4bf,
    pink: 0xff6fb1,
    lemon: 0xffd166,
    panelBg: 0x0f1c3f,
    cardBg: 0xffffff,
};

type PlatformEventType =
    | 'GAME_READY' | 'CHECKPOINT' | 'CORRECT_ANSWER'
    | 'WRONG_ANSWER' | 'GAME_OVER' | 'FINISH_GAME';

interface TrayCard {
    container: Phaser.GameObjects.Container;
    handle: Phaser.GameObjects.Rectangle;
    partId: RobotPartId;
    homeX: number;
    homeY: number;
    placed: boolean;
    slotIndex: number;
}

export class GameScene extends Phaser.Scene {
    private currentLevelIdx = 0;
    private missingParts: RobotPartId[] = [];
    private nextStepIndex = 0;
    private mistakes = 0;
    private placedCount = 0;

    private isGameStarted = false;
    private gameEnded = false;

    private robotContainer!: Phaser.GameObjects.Container;
    private glowAnchors: Partial<Record<RobotPartId, Phaser.GameObjects.Image>> = {};
    private robotBounds = new Phaser.Geom.Rectangle();

    private trayPool: RobotPartId[] = [];
    private traySlots: (TrayCard | null)[] = [];
    private traySlotPositions: { x: number; y: number }[] = [];
    private orderIcons
    private orderRings

    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;
    private heartIcons: Phaser.GameObjects.Text[] = [];

    constructor() {
        super('GameScene');
    }

    init(data: { levelIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.missingParts = [...LEVELS[this.currentLevelIdx].missingParts];
        this.nextStepIndex = 0;
        this.mistakes = 0;
        this.placedCount = 0;
        this.isGameStarted = false;
        this.gameEnded = false;
        this.glowAnchors = {};
        this.trayPool = [];
        this.traySlots = [];
        this.traySlotPositions = [];
        this.orderIcons = [];
        this.orderRings = [];
        this.heartIcons = [];
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'menu_screen');
        bg.setScale(Math.max(width / bg.width, height / bg.height));
        this.showStartScreen();
        this.emitPlatformEvent('GAME_READY');
    }

    update() {
        if (!this.isGameStarted || !this.timerEvent || !this.timerBar) return;
        const remaining = this.timerEvent.getRemaining();
        const total = LEVELS[this.currentLevelIdx].timeLimit * 1000;
        const pct = Math.max(0, remaining / total);
        this.timerBar.setSize(360 * pct, 20);
        this.timerBar.setFillStyle(pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.lemon : COLORS.pink);
    }

    private emitPlatformEvent(type: PlatformEventType, extra: Record<string, any> = {}) {
        if (!window.runtimeGameBridge) return;
        window.runtimeGameBridge.emit({ type, gameId: GAME_ID, stage: this.currentLevelIdx + 1, ...extra });
    }

    private showStartScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(500);

        const bg = this.add.image(width / 2, height / 2, 'menu_screen');
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        const thinkingBot = this.add.image(width / 2, height * 0.53, 'robot_thinking')
            .setDisplaySize(260, 340);
        this.tweens.add({
            targets: thinkingBot, y: '-=14', duration: 1600,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        const title = this.add.text(width / 2, height * 0.18, LEVELS[this.currentLevelIdx].name, {
            fontSize: '46px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 7,
        }).setOrigin(0.5);

        const sub = this.add.text(width / 2, height * 0.27, 'Monte o robô na ordem certa!', {
            fontSize: '24px', fontFamily: 'Arial Black, Arial', color: '#fff7c2',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0.5);

        const startBtn = this.createButton(width / 2, height * 0.84, 260, 68, '▶  Montar!', COLORS.green, () => {
            this.playClick();
            this.tweens.add({
                targets: container, alpha: 0, duration: 300,
                onComplete: () => { container.destroy(); this.startGameLogic(); },
            });
        });

        container.add([bg, thinkingBot, title, sub, startBtn]);
    }

    // DEPOIS
    private startGameLogic() {
        const { width, height } = this.scale;
        this.isGameStarted = true;

        this.createRobot(width * 0.68, height * 0.56);
        this.createTray(width * 0.20, height * 0.5);
        this.createOrderPanel(width);
        this.createTimerBar(width);
        this.createHearts(width);
        this.startTimer();
    }

    private createOrderPanel(width: number) {
        const y = 140;

        this.add.text(width / 2, y - 40, '📋  Monte nesta ordem:', {
            fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);

        const ICON = 52, GAP = 44;
        const n = this.missingParts.length;
        const totalW = n * ICON + (n - 1) * GAP;
        const startX = width / 2 - totalW / 2 + ICON / 2;

        this.missingParts.forEach((partId, i) => {
            const x = startX + i * (ICON + GAP);
            const def = ROBOT_PARTS[partId];

            const ring = this.add.circle(x, y, ICON / 2 + 8, 0xffffff, 0.12).setDepth(19);
            const icon = this.add.image(x, y, def.cardAssetKey).setDisplaySize(ICON, ICON).setDepth(20);
            this.add.text(x, y + ICON / 2 + 14, `${i + 1}`, {
                fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff',
                stroke: '#1f2937', strokeThickness: 3,
            }).setOrigin(0.5).setDepth(20);

            this.orderRings.push(ring);
            this.orderIcons.push(icon);

            if (i < n - 1) {
                this.add.text(x + ICON / 2 + GAP / 2, y, '→', {
                    fontSize: '22px', color: '#ffffff', fontFamily: 'Arial Black',
                }).setOrigin(0.5).setDepth(20);
            }
        });

        this.highlightCurrentOrderStep();
    }

    private highlightCurrentOrderStep() {
        this.orderIcons.forEach((icon, i) => {
            const ring = this.orderRings[i];
            this.tweens.killTweensOf(ring);
            if (i < this.nextStepIndex) {
                icon.setAlpha(0.35);
                ring.setStrokeStyle(3, COLORS.green, 1);
            } else if (i === this.nextStepIndex) {
                icon.setAlpha(1);
                ring.setStrokeStyle(3, COLORS.lemon, 1);
                this.tweens.add({ targets: ring, scale: 1.15, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            } else {
                icon.setAlpha(0.5);
                ring.setStrokeStyle(0);
            }
        });
    }

    private createRobot(cx: number, cy: number) {
        this.robotContainer = this.add.container(cx, cy).setDepth(3);

        const silhouette = this.add.image(0, 0, 'full_robot_silhouette').setDisplaySize(ROBOT_W, ROBOT_H);
        this.robotContainer.add(silhouette);

        // Peças que o robô JÁ tem desde o início (não fazem parte do desafio)
        (Object.keys(ROBOT_PARTS) as RobotPartId[]).forEach((partId) => {
            if (this.missingParts.includes(partId)) return;
            const anchor = this.add.image(0, 0, ROBOT_PARTS[partId].anchorAssetKey).setDisplaySize(ROBOT_W, ROBOT_H);
            this.robotContainer.add(anchor);
        });

        // Overlays de "brilho" — só para as peças que faltam
        this.missingParts.forEach((partId) => {
            const glow = this.add.image(0, 0, ROBOT_PARTS[partId].anchorGlowAssetKey)
                .setDisplaySize(ROBOT_W, ROBOT_H).setAlpha(0);
            this.robotContainer.add(glow);
            this.glowAnchors[partId] = glow;
        });

        this.robotBounds.setTo(cx - ROBOT_W / 2, cy - ROBOT_H / 2, ROBOT_W, ROBOT_H);

        this.tweens.add({
            targets: this.robotContainer, y: cy - 8, duration: 1800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
    }

    // DEPOIS
    private createTray(cx: number, cyStart: number) {
        const slotsCount = Math.min(VISIBLE_SLOTS, this.missingParts.length);
        const CARD_H = 130, GAP = 22;
        const totalH = slotsCount * CARD_H + (slotsCount - 1) * GAP;
        const startY = cyStart - totalH / 2 + CARD_H / 2;

        this.traySlotPositions = [];
        for (let i = 0; i < slotsCount; i++) {
            this.traySlotPositions.push({ x: cx, y: startY + i * (CARD_H + GAP) });
        }

        this.traySlots = new Array(slotsCount).fill(null);
        this.trayPool = Phaser.Utils.Array.Shuffle([...this.missingParts]);

        for (let i = 0; i < slotsCount; i++) {
            this.fillTraySlot(i, false);
        }
    }

    /**
     * Preenche um slot vazio. Prioriza SEMPRE a peça que o jogador precisa
     * colocar agora — garantindo que ela nunca fique escondida na fila.
     */
    private fillTraySlot(slotIndex: number, animateIn: boolean) {
        const expected = this.missingParts[this.nextStepIndex];
        const alreadyVisible = this.traySlots.some(c => c && c.partId === expected);

        let partId: RobotPartId | undefined;
        if (!alreadyVisible && this.trayPool.includes(expected)) {
            partId = expected;
            this.trayPool.splice(this.trayPool.indexOf(expected), 1);
        } else if (this.trayPool.length > 0) {
            partId = this.trayPool.shift();
        }

        if (!partId) return;

        const pos = this.traySlotPositions[slotIndex];
        this.traySlots[slotIndex] = this.createTrayCard(pos.x, pos.y, partId, slotIndex, animateIn);
    }

    // DEPOIS
    private createTrayCard(x: number, y: number, partId: RobotPartId, slotIndex: number, animateIn: boolean): TrayCard {
        const def = ROBOT_PARTS[partId];
        const W = 170, H = 130;

        const container = this.add.container(x, animateIn ? y + 70 : y).setDepth(10);
        if (animateIn) container.setAlpha(0);

        const icon = this.add.image(0, -20, def.cardAssetKey).setDisplaySize(104, 104);
        const label = this.add.text(0, 52, def.label, {
            fontSize: '17px', fontFamily: 'Arial Black, Arial', color: '#1a73e8',
            align: 'center', wordWrap: { width: 168 },
            stroke: '#ffffff', strokeThickness: 5,
        }).setOrigin(0.5);

        const handle = this.add.rectangle(0, 0, W, H, 0xffffff, 0.01)
            .setInteractive({ draggable: true, useHandCursor: true });

        container.add([icon, label, handle]);

        this.tweens.add({
            targets: icon, y: -28, duration: 1300 + Math.random() * 400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        if (animateIn) {
            this.tweens.add({ targets: container, y, alpha: 1, duration: 280, ease: 'Back.Out' });
        }

        const card: TrayCard = { container, handle, partId, homeX: x, homeY: y, placed: false, slotIndex };
        this.setupDrag(card);
        return card;
    }

    // ── Arrastar e soltar ──────────────────────────────────────────
    private setupDrag(card: TrayCard) {
        this.input.setDraggable(card.handle);

        card.handle.on('dragstart', () => card.container.setDepth(60));

        card.handle.on('drag', (pointer: Phaser.Input.Pointer) => {
            card.container.setPosition(pointer.x, pointer.y);
            const isNext = this.missingParts[this.nextStepIndex] === card.partId;
            const overRobot = this.robotBounds.contains(pointer.x, pointer.y);
            this.glowAnchors[card.partId]?.setAlpha(overRobot && isNext ? 1 : 0);
        });

        card.handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
            card.container.setDepth(10);
            this.glowAnchors[card.partId]?.setAlpha(0);

            if (card.placed || this.gameEnded) return;

            if (!this.robotBounds.contains(pointer.x, pointer.y)) {
                this.tweenCardHome(card);
                return;
            }
            this.handleDrop(card);
        });
    }

    private handleDrop(card: TrayCard) {
        const expected = this.missingParts[this.nextStepIndex];

        // DEPOIS
        if (card.partId === expected) {
            card.placed = true;
            card.handle.disableInteractive();
            const freedSlot = card.slotIndex;

            this.tweens.add({
                targets: card.container, alpha: 0, scaleX: 0.6, scaleY: 0.6, duration: 220,
                onComplete: () => {
                    card.container.destroy();
                    this.fillTraySlot(freedSlot, true);
                },
            });

            const anchor = this.add.image(0, 0, ROBOT_PARTS[card.partId].anchorAssetKey)
                .setDisplaySize(ROBOT_W, ROBOT_H).setAlpha(0);
            this.robotContainer.add(anchor);
            this.tweens.add({ targets: anchor, alpha: 1, duration: 260 });

            this.playCorrect();
            this.nextStepIndex++;
            this.placedCount++;
            this.highlightCurrentOrderStep();

            this.emitPlatformEvent('CORRECT_ANSWER', { pointsEarned: 5 });
            this.emitPlatformEvent('CHECKPOINT', {
                progress: Math.round((this.placedCount / this.missingParts.length) * 100),
            });

            if (this.placedCount === this.missingParts.length) this.handleLevelWin();
        } else {
            this.mistakes++;
            this.cameras.main.shake(150, 0.01);
            this.playWrong();
            this.emitPlatformEvent('WRONG_ANSWER', { pointsEarned: -5 });
            this.tweenCardHome(card);
            this.updateHearts();

            if (this.mistakes >= MAX_MISTAKES) this.handleGameOver();
        }
    }

    private tweenCardHome(card: TrayCard) {
        this.tweens.add({ targets: card.container, x: card.homeX, y: card.homeY, duration: 260, ease: 'Back.Out' });
    }

    // ── Timer ────────────────────────────────────────────────────
    private createTimerBar(width: number) {
        const x = width / 2 - 180, y = 40;
        const bg = this.add.graphics();
        bg.fillStyle(COLORS.panelBg, 0.85);
        bg.fillRoundedRect(x - 10, y - 10, 380, 40, 16);
        bg.setDepth(20);
        this.timerBar = this.add.rectangle(x, y + 10, 360, 20, COLORS.green).setOrigin(0, 0.5).setDepth(21);
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: LEVELS[this.currentLevelIdx].timeLimit * 1000,
            callback: () => this.handleGameOver(),
        });
    }

    private createHearts(width: number) {
        for (let i = 0; i < MAX_MISTAKES; i++) {
            this.heartIcons.push(
                this.add.text(width - 60 - i * 46, 62, '❤️', { fontSize: '32px' }).setOrigin(0.5).setDepth(20),
            );
        }
    }

    private updateHearts() {
        const heart = this.heartIcons[this.mistakes - 1];
        if (!heart) return;
        this.tweens.add({
            targets: heart, scale: 0, duration: 200, ease: 'Back.In',
            onComplete: () => heart.setText('🖤').setScale(1),
        });
    }

    // ── Fim de jogo ──────────────────────────────────────────────
    private handleLevelWin() {
        this.gameEnded = true;
        this.timerEvent?.remove();
        this.time.delayedCall(400, () => this.showEndScreen(true));
    }

    private handleGameOver() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.input.enabled = false;
        this.timerEvent?.remove();

        if (window.runtimeGameBridge) {
            window.runtimeGameBridge.emit({
                type: 'GAME_OVER',
                gameId: GAME_ID,
                stage: this.currentLevelIdx + 1,
                pointsEarned: -5
            });
        }
    }

    private showEndScreen(won: boolean) {
        const { width, height } = this.scale;
        const isLastLevel = (this.currentLevelIdx + 1) >= LEVELS.length;
        const container = this.add.container(0, 0).setDepth(1000);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height,
            won ? 0x7dd3fc : 0x312e81, won ? 0.92 : 0.88);

        const title = this.add.text(width / 2, height * 0.20, won ? 'Robô montado!' : 'Ops, tente de novo!', {
            fontSize: '44px', fontFamily: 'Arial Black', color: '#ffffff',
            stroke: won ? '#4f46e5' : '#ff6fb1', strokeThickness: 7,
        }).setOrigin(0.5);

        const robotImg = this.add.image(width / 2, height * 0.55, 'full_robot').setDisplaySize(280, 400);

        const btnLabel = won ? (isLastLevel ? 'FINALIZAR' : 'PRÓXIMO ROBÔ') : 'TENTAR DE NOVO';
        const btn = this.createButton(width / 2, height * 0.86, 320, 70, btnLabel, won ? COLORS.green : COLORS.lemon, () => {
            this.playClick();
            if (!won) this.scene.restart({ levelIndex: this.currentLevelIdx });
            else if (!isLastLevel) this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            else this.emitPlatformEvent('FINISH_GAME');
        });

        container.add([overlay, title, robotImg, btn]);
    }

    // ── Botão reutilizável ─────────────────────────────────────────
    private createButton(x: number, y: number, w: number, h: number, label: string, color: number, onDown: () => void) {
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x111827, 0.28);
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 20);
        bg.fillStyle(color, 0.96);
        bg.lineStyle(4, 0xffffff, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);

        const text = this.add.text(0, 0, label, {
            fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
        }).setOrigin(0.5);

        const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0.01).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            this.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
            onDown();
        });

        container.add([bg, text, hit]);
        return container;
    }

    // ── Áudio sintético ─────────────────────────────────────────────
    private getAudioContext(): AudioContext | null {
        if (!('context' in this.sound)) return null;
        return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, delay = 0) {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.01);
    }

    private playClick() { this.playTone(580, 0.06, 'sine', 0.12); }
    private playCorrect() { this.playTone(880, 0.12, 'triangle', 0.18); this.playTone(1180, 0.14, 'triangle', 0.14, 0.08); }
    private playWrong() { this.playTone(110, 0.35, 'sawtooth', 0.2); }
}