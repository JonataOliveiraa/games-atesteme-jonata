import Phaser from 'phaser';
import { LEVELS } from '../data/levels';
import { ROBOT_PARTS } from '../data/parts';
import type { RobotPartId } from '../types';
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge';
import type { PlatformEvent } from '../../../../shared/contracts/platformEvents';
import { EventBus } from '../../../../shared/EventBus';
import { createTutorial } from '../../../../shared/tutorial/createTutorial';
import { showLevelComplete } from '../../../../shared/level/showLevelComplete';

const GAME_ID = 'trilha-do-passo-a-passo';
const VISIBLE_SLOTS = 3;
const ROBOT_W = 436;
const ROBOT_H = 580;
const ROBOT_CENTER_Y_RATIO = 0.55;   // centro vertical do robô
const ORDER_PANEL_Y = 155;           // linha dos ícones de ordem
const TRAY_CENTER_Y_RATIO = 0.54;    // centro vertical da bandeja

const COLORS = {
    green: 0x2dd4bf,
    pink: 0xff6fb1,
    lemon: 0xffd166,
    panelBg: 0x0f1c3f,
    cardBg: 0xffffff,
};

/**
 * Os tipos que este jogo emite. Sai `FINISH_GAME`, que era invenção local e
 * não existe no contrato; entra `GAME_COMPLETED`, que é o nome que a
 * plataforma reconhece.
 */
type PlatformEventType =
    | 'GAME_READY' | 'CHECKPOINT' | 'CORRECT_ANSWER'
    | 'WRONG_ANSWER' | 'GAME_OVER' | 'GAME_COMPLETED';

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
    private currentPhaseIdx = 0;
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
    private orderIcons: Phaser.GameObjects.Image[] = [];
    private orderRings: Phaser.GameObjects.Arc[] = [];

    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;

    constructor() {
        super('GameScene');
    }
    
    private get level() { return LEVELS[this.currentLevelIdx]; }
    private get phase() { return this.level.phases[this.currentPhaseIdx]; }

    init(data: { levelIndex?: number; phaseIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.currentPhaseIdx = data.phaseIndex ?? 0;
        this.missingParts = [...this.phase.missingParts];
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
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'menu_screen');
        bg.setScale(Math.max(width / bg.width, height / bg.height));
        this.emitPlatformEvent('GAME_READY');
        if (this.currentPhaseIdx === 0) this.showLevelIntro();
        else this.startGameLogic();
    }

    update() {
        if (!this.isGameStarted || !this.timerEvent || !this.timerBar) return;
        const remaining = this.timerEvent.getRemaining();
        const total = this.phase.timeLimit * 1000;
        const pct = Math.max(0, remaining / total);
        this.timerBar.setSize(360 * pct, 20);
        this.timerBar.setFillStyle(pct > 0.5 ? COLORS.green : pct > 0.25 ? COLORS.lemon : COLORS.pink);
    }

    /**
     * O `as PlatformEvent` é deliberado.
     *
     * Este atalho monta o evento com um tipo dinâmico e um saco de extras, e
     * o TypeScript não tem como provar que a combinação fecha com a união
     * discriminada do contrato — ele acusava erro aqui desde antes. Quem
     * garante a forma é a lista `PlatformEventType` logo acima, que só tem
     * nomes que existem no contrato.
     */
    private emitPlatformEvent(type: PlatformEventType, extra: Record<string, unknown> = {}) {
        runtimeGameBridge.emit({
            type,
            gameId: GAME_ID,
            stage: this.currentLevelIdx + 1,
            ...extra,
        } as PlatformEvent);
    }

    /**
     * O JOGO ACABOU DE VERDADE.
     *
     * Este jogo emitia `FINISH_GAME`, que não existe no contrato da plataforma
     * (`shared/contracts/platformEvents.ts`) — o evento saía, ninguém do lado
     * de fora reconhecia, e era o único dos 45 que nunca reportava conclusão.
     * Quem depende disso é a aprovação do aluno.
     *
     * `isFinalStage` é dito aqui, e não deduzido lá fora, porque este jogo tem
     * NÍVEIS com FASES dentro: a última fase do último nível é o fim, e só ele
     * sabe disso.
     */
    private emitirConclusaoFinal() {
        this.emitPlatformEvent('GAME_COMPLETED', {
            totalStages: LEVELS.length,
            isFinalStage: true,
        });
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

        const sub = this.add.text(width / 2, height * 0.27, 'Monte o robô na ordem certa!', {
            fontSize: '24px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#fff7c2',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0.5);

        const startBtn = this.createButton(width / 2, height * 0.84, 260, 68, '▶  Montar!', COLORS.green, () => {
            this.playClick();
            this.tweens.add({
                targets: container, alpha: 0, duration: 300,
                onComplete: () => { container.destroy(); this.startGameLogic(); },
            });
        });

        container.add([bg, thinkingBot, sub, startBtn]);
    }

    private startGameLogic() {
        const { width, height } = this.scale;
        this.isGameStarted = true;

        this.createRobot(width * 0.80, height * ROBOT_CENTER_Y_RATIO);
        this.createTray(width * 0.20, height * TRAY_CENTER_Y_RATIO);
        this.createOrderPanel(width);
        this.createTimerBar(width);

        if (this.currentPhaseIdx === 0) this.runLevelTutorial(() => this.startTimer());
        else this.startTimer();
    }

    private setCardsInteractive(enabled: boolean) {
        this.traySlots.forEach(card => {
            if (!card) return;
            if (enabled) card.handle.setInteractive({ draggable: true, useHandCursor: true });
            else card.handle.disableInteractive();
        });
    }

    private runLevelTutorial(onDone: () => void) {
        const { width, height } = this.scale;
        const level = this.currentLevelIdx + 1;
        const n = this.missingParts.length;

        const panelW = n * 52 + (n - 1) * 44 + 90;
        const slotsCount = Math.min(VISIBLE_SLOTS, n);
        const trayH = slotsCount * 130 + (slotsCount - 1) * 22 + 55;
        const trayX = width * 0.20;
        const trayY = height * TRAY_CENTER_Y_RATIO;
        const robotX = width * 0.68;
        const robotY = height * ROBOT_CENTER_Y_RATIO;
        const firstSlot = this.traySlotPositions[0] ?? { x: trayX, y: trayY };

        this.setCardsInteractive(false);
        const finish = () => {
            this.setCardsInteractive(true);
            onDone();
        };

        if (level === 1) {
            createTutorial(this, {
                key: 'robo-l1',
                accent: COLORS.green,
                onFinish: finish,
                steps: [
                    {
                        text: 'Faltam peças no robô! Elas ficam aqui do lado.',
                        shape: 'rect', x: trayX, y: trayY, w: 210, h: trayH,
                    },
                    {
                        text: 'Esta fila mostra a ordem de montagem. A peça que está brilhando é a próxima.',
                        shape: 'rect', x: width / 2, y: ORDER_PANEL_Y, w: panelW, h: 150,
                    },
                    {
                        text: 'Arraste a peça até o robô. No lugar certo, ela acende.',
                        shape: 'rect', x: robotX, y: robotY, w: ROBOT_W + 50, h: ROBOT_H + 40,
                        pointer: { fromX: firstSlot.x, fromY: firstSlot.y, toX: robotX, toY: robotY },
                    },
                    {
                        text: 'Errar a ordem termina o jogo. O tempo começa agora!',
                        shape: 'rect', x: width / 2, y: 50, w: 420, h: 70,
                    },
                ],
            });
            return;
        }

        if (level === 2) {
            createTutorial(this, {
                key: 'robo-l2',
                accent: COLORS.green,
                onFinish: finish,
                steps: [
                    {
                        text: 'Agora faltam mais peças, mas só três aparecem por vez.',
                        shape: 'rect', x: trayX, y: trayY, w: 210, h: trayH,
                    },
                    {
                        text: 'Cada peça encaixada abre espaço para a próxima chegar. A que você precisa sempre está à vista.',
                        shape: 'rect', x: width / 2, y: ORDER_PANEL_Y, w: panelW, h: 150,
                    },
                ],
            });
            return;
        }

        if (level === 3) {
            createTutorial(this, {
                key: 'robo-l3',
                accent: COLORS.green,
                onFinish: finish,
                steps: [
                    {
                        text: 'O robô está todo desmontado: são seis peças.',
                        shape: 'rect', x: robotX + 130, y: robotY, w: ROBOT_W + 50, h: ROBOT_H + 40,
                    },
                    {
                        text: 'Atenção ao lado! Braço esquerdo e direito são peças diferentes. Confira o nome no card.',
                        shape: 'rect', x: trayX, y: trayY, w: 210, h: trayH,
                    },
                ],
            });
            return;
        }

        finish();
    }

    private createOrderPanel(width: number) {
        const y = ORDER_PANEL_Y;

        this.add.text(width / 2, y - 70, 'Monte nesta ordem:', {
            fontSize: '20px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);

        const ICON = 70, GAP = 44;
        const n = this.missingParts.length;
        const totalW = n * ICON + (n - 1) * GAP;
        const startX = width / 2 - totalW / 2 + ICON / 2;

        this.missingParts.forEach((partId, i) => {
            const x = startX + i * (ICON + GAP);
            const def = ROBOT_PARTS[partId];

            const ring = this.add.circle(x, y, ICON / 2 + 8, 0xffffff, 0.12).setDepth(19);
            const icon = this.add.image(x, y, def.cardAssetKey)
                .setDisplaySize(ICON, ICON).setDepth(20)
                .setFlipX(this.isMirroredPart(partId));
            this.add.text(x, y + ICON / 2 + 14, `${i + 1}`, {
                fontSize: '14px', fontFamily: '"DynaPuff Black", "Arial Black", sans-serif', color: '#ffffff',
                stroke: '#1f2937', strokeThickness: 3,
            }).setOrigin(0.5).setDepth(20);

            this.orderRings.push(ring);
            this.orderIcons.push(icon);

            if (i < n - 1) {
                this.add.text(x + ICON / 2 + GAP / 2, y, '→', {
                    fontSize: '22px', color: '#ffffff', fontFamily: '"DynaPuff Black", "Arial Black", sans-serif',
                }).setOrigin(0.5).setDepth(20);
            }
        });

        this.highlightCurrentOrderStep();
    }

    private showLevelIntro() {
        const { width, height } = this.scale;
        const level = this.level;
        const container = this.add.container(0, 0).setDepth(500);

        const bg = this.add.image(width / 2, height / 2, 'menu_screen');
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        const badge = this.add.text(width / 2, 78, `NÍVEL ${level.level} DE ${LEVELS.length}`, {
            fontSize: '22px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#fff7c2',
            stroke: '#1f2937', strokeThickness: 5,
        }).setOrigin(0.5);

        const title = this.add.text(width / 2, 130, level.title, {
            fontSize: '44px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 7,
        }).setOrigin(0.5);

        const objective = this.add.text(width / 2, 180, level.objective, {
            fontSize: '21px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#fff7c2',
            stroke: '#1f2937', strokeThickness: 4,
            align: 'center', wordWrap: { width: width - 260 },
        }).setOrigin(0.5);

        const thinkingBot = this.add.image(width / 2, 365, 'robot_thinking')
            .setDisplaySize(220, 290);
        this.tweens.add({
            targets: thinkingBot, y: '-=14', duration: 1600,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        const phaseLabel = this.add.text(width / 2, 538, `${level.phases.length} fases neste nível`, {
            fontSize: '16px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 3,
        }).setOrigin(0.5);

        const dots = this.add.graphics();
        const gap = 34;
        const startX = width / 2 - ((level.phases.length - 1) * gap) / 2;
        level.phases.forEach((_, i) => {
            const x = startX + i * gap;
            const done = i < this.currentPhaseIdx;
            dots.fillStyle(done ? COLORS.green : 0xffffff, done ? 1 : 0.35);
            dots.fillCircle(x, 573, 9);
            if (i === this.currentPhaseIdx) {
                dots.lineStyle(3, COLORS.lemon, 1);
                dots.strokeCircle(x, 573, 14);
            }
        });

        const startBtn = this.createButton(width / 2, 650, 300, 64, 'MONTAR!', COLORS.green, () => {
            this.playClick();
            this.tweens.add({
                targets: container, alpha: 0, duration: 300,
                onComplete: () => { container.destroy(); this.startGameLogic(); },
            });
        });

        container.add([bg, badge, title, objective, thinkingBot, phaseLabel, dots, startBtn]);
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

    private createTray(cx: number, cyStart: number) {
        const slotsCount = Math.min(VISIBLE_SLOTS, this.missingParts.length);
        const CARD_H = 160, GAP = 22;
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

    private createTrayCard(x: number, y: number, partId: RobotPartId, slotIndex: number, animateIn: boolean): TrayCard {
        const def = ROBOT_PARTS[partId];
        const W = 170, H = 130;

        const container = this.add.container(x, animateIn ? y + 70 : y).setDepth(10);
        if (animateIn) container.setAlpha(0);

        const icon = this.add.image(0, -20, def.cardAssetKey)
            .setDisplaySize(134, 134)
            .setFlipX(this.isMirroredPart(partId));
        const label = this.add.text(0, 52, def.label, {
            fontSize: '17px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#1a73e8',
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

            if (this.placedCount === this.missingParts.length) this.handlePhaseWin();
        } else {
            this.cameras.main.shake(150, 0.01);
            this.playWrong();
            this.emitPlatformEvent('WRONG_ANSWER', { pointsEarned: -5 });
            this.tweenCardHome(card);

            this.handleGameOver();
        }
    }

    private tweenCardHome(card: TrayCard) {
        this.tweens.add({ targets: card.container, x: card.homeX, y: card.homeY, duration: 260, ease: 'Back.Out' });
    }

    private createTimerBar(width: number) {
        const x = width / 2 - 180, y = 40;
        const bg = this.add.graphics();
        bg.fillStyle(COLORS.panelBg, 0.85);
        bg.fillRoundedRect(x - 10, y - 10, 380, 40, 16);
        bg.setDepth(20);
        this.timerBar = this.add.rectangle(x, y + 10, 360, 20, COLORS.green).setOrigin(0, 0.5).setDepth(21);

        this.add.text(width / 2 + 210, 50,
            `Fase ${this.currentPhaseIdx + 1} de ${this.level.phases.length}`, {
            fontSize: '17px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#ffffff',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0, 0.5).setDepth(21);
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: this.phase.timeLimit * 1000,
            callback: () => this.handleGameOver(),
        });
    }

    private isMirroredPart(partId: RobotPartId): boolean {
        return partId === 'right_arm' || partId === 'right_leg';
    }

    private handlePhaseWin() {
        this.gameEnded = true;
        this.timerEvent?.remove();

        const isLastPhase = this.currentPhaseIdx + 1 >= this.level.phases.length;
        const isLastLevel = this.currentLevelIdx + 1 >= LEVELS.length;

        this.time.delayedCall(400, () => {
            if (!isLastPhase) {
                showLevelComplete(this, {
                    title: 'Fase concluída!',
                    subtitle: this.phase.name,
                    subtitleColor: '#36479e',
                    accent: COLORS.green,
                    progress: { total: this.level.phases.length, current: this.currentPhaseIdx + 1 },
                    autoAdvance: {
                        delay: 1800,
                        label: 'Preparando a próxima fase...',
                        onComplete: () => this.scene.restart({
                            levelIndex: this.currentLevelIdx,
                            phaseIndex: this.currentPhaseIdx + 1,
                        }),
                    }
                });
                return;
            }

            if (!isLastLevel) {
                showLevelComplete(this, {
                    subtitle: `Nível ${this.level.level} concluído`,
                    message: 'Prepare-se: o próximo robô é mais difícil.',
                    accent: COLORS.green,
                    progress: { total: LEVELS.length, current: this.currentLevelIdx + 1 },
                    autoAdvance: {
                        delay: 2300,
                        onComplete: () => this.scene.restart({
                            levelIndex: this.currentLevelIdx + 1,
                            phaseIndex: 0,
                        }),
                    },
                });
                return;
            }

            this.emitirConclusaoFinal();
            showLevelComplete(this, {
                title: 'Você montou todos os robôs!',
                subtitle: 'Os três níveis estão completos',
                accent: COLORS.green,
                progress: { total: LEVELS.length, current: LEVELS.length },
                buttons: [
                    {
                        label: 'Jogar de novo',
                        color: COLORS.green,
                        onClick: () => this.scene.restart({ levelIndex: 0, phaseIndex: 0 }),
                    },
                    {
                        label: 'Outros jogos',
                        color: COLORS.lemon,
                        onClick: () => EventBus.emit('exit-game'),
                    },
                ],
            });
        });
    }

    private handleGameOver() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.timerEvent?.remove();

        this.emitPlatformEvent('GAME_OVER', { pointsEarned: -5 });

        this.time.delayedCall(300, () => this.showResultScreen({
            won: false,
            title: 'Ops, tente de novo!',
            subtitle: `Nível ${this.level.level} — Fase ${this.currentPhaseIdx + 1}`,
            buttonLabel: 'TENTAR DE NOVO',
            onButton: () => this.scene.restart({
                levelIndex: this.currentLevelIdx,
                phaseIndex: this.currentPhaseIdx,
            }),
        }));
    }

    private showResultScreen(opts: {
        won: boolean;
        title: string;
        subtitle: string;
        buttonLabel: string;
        onButton: () => void;
        exitButton?: boolean;
    }) {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(1000);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height,
            opts.won ? 0x7dd3fc : 0x312e81, opts.won ? 0.92 : 0.88);

        const title = this.add.text(width / 2, height * 0.18, opts.title, {
            fontSize: '42px', fontFamily: '"DynaPuff Black", "Arial Black", sans-serif', color: '#ffffff',
            stroke: opts.won ? '#4f46e5' : '#ff6fb1', strokeThickness: 7,
            align: 'center', wordWrap: { width: width - 160 },
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height * 0.27, opts.subtitle, {
            fontSize: '22px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#fff7c2',
            stroke: '#1f2937', strokeThickness: 4,
        }).setOrigin(0.5);

        const robotImg = this.add.image(width / 2, height * 0.52, 'full_robot')
            .setDisplaySize(230, 330);

        const mainBtn = this.createButton(width / 2, height * (opts.exitButton ? 0.79 : 0.86),
            340, 64, opts.buttonLabel, opts.won ? COLORS.green : COLORS.lemon, () => {
                this.playClick();
                opts.onButton();
            });

        container.add([overlay, title, subtitle, robotImg, mainBtn]);

        if (opts.exitButton) {
            container.add(this.createButton(width / 2, height * 0.91, 340, 64,
                'OUTROS JOGOS', COLORS.lemon, () => {
                    this.playClick();
                    EventBus.emit('exit-game');
                }));
        }
    }

    private showEndScreen(won: boolean) {
        const { width, height } = this.scale;
        const isLastLevel = (this.currentLevelIdx + 1) >= LEVELS.length;
        const container = this.add.container(0, 0).setDepth(1000);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height,
            won ? 0x7dd3fc : 0x312e81, won ? 0.92 : 0.88);

        const title = this.add.text(width / 2, height * 0.20, won ? 'Robô montado!' : 'Ops, tente de novo!', {
            fontSize: '44px', fontFamily: '"DynaPuff Black", "Arial Black", sans-serif', color: '#ffffff',
            stroke: won ? '#4f46e5' : '#ff6fb1', strokeThickness: 7,
        }).setOrigin(0.5);

        // DEPOIS
        const isFinished = won && isLastLevel;

        const robotImg = this.add.image(width / 2, height * (isFinished ? 0.47 : 0.55), 'full_robot')
            .setDisplaySize(isFinished ? 230 : 280, isFinished ? 330 : 400);

        if (isFinished) {
            this.emitirConclusaoFinal();

            const subtitle = this.add.text(width / 2, height * 0.30, 'Você montou todos os robôs!', {
                fontSize: '24px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#fff7c2',
                stroke: '#1f2937', strokeThickness: 4,
            }).setOrigin(0.5);

            const againBtn = this.createButton(width / 2, height * 0.79, 340, 64, 'JOGAR DE NOVO', COLORS.green, () => {
                this.playClick();
                this.scene.restart({ levelIndex: 0 });
            });

            const exitBtn = this.createButton(width / 2, height * 0.91, 340, 64, 'OUTROS JOGOS', COLORS.lemon, () => {
                this.playClick();
                EventBus.emit('exit-game');
            });

            container.add([overlay, title, subtitle, robotImg, againBtn, exitBtn]);
        } else {
            const btnLabel = won ? 'PRÓXIMO ROBÔ' : 'TENTAR DE NOVO';
            const btn = this.createButton(width / 2, height * 0.86, 320, 70, btnLabel, won ? COLORS.green : COLORS.lemon, () => {
                this.playClick();
                if (!won) this.scene.restart({ levelIndex: this.currentLevelIdx });
                else this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            });

            container.add([overlay, title, robotImg, btn]);
        }
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
            fontSize: '22px', fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', color: '#ffffff',
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