import Phaser from 'phaser';
import { LEVELS } from '../data/levels';
import { EventBus } from '../../../shared/EventBus';

const GAME_ID = 'EF01CO02';
const TIMER_PANEL_X = 625;
const TIMER_PANEL_Y = 74;
const TIMER_BAR_Y = 86;
const TIMER_BAR_W = 368;

const COLORS = {
    green: 0x2dd4bf,
    pink: 0xff6fb1,
    lemon: 0xffd166,
    purple: 0x6d5cff,
    ink: '#2c3563',
    shadow: 0x3d3a78,
};

type PlatformEventType =
    | 'WRONG_ANSWER'
    | 'GAME_OVER'
    | 'FINISH_GAME'
    | 'CHECKPOINT'
    | 'GAME_READY';

interface PartVisual {
    container: Phaser.GameObjects.Container;
    handle: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.DOMElement;
    homeX: number;
    homeY: number;
    stepId: number;
}

interface SlotVisual {
    frame: Phaser.GameObjects.Image;
    zone: Phaser.GameObjects.Rectangle;
    badge: Phaser.GameObjects.DOMElement;
    label: Phaser.GameObjects.DOMElement;
    stepId: number;
}

export class GameScene extends Phaser.Scene {
    private currentLevelIdx = 0;
    private nextStepRequired = 1;

    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;
    private placedCount = 0;
    private wrongCount = 0;
    private isGameStarted = false;
    private domNodes: Phaser.GameObjects.DOMElement[] = [];
    private partVisuals = new Map<Phaser.GameObjects.Rectangle, PartVisual>();

    constructor() {
        super('GameScene');
    }

    init(data: { levelIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.nextStepRequired = 1;
        this.placedCount = 0;
        this.wrongCount = 0;
        this.isGameStarted = false;
        this.domNodes = [];
        this.partVisuals.clear();
    }

    create() {
        const { width, height } = this.scale;

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupDomNodes());

        this.createBackground(width, height);
        this.showStartScreen();
        this.emitPlatformEvent('GAME_READY');
    }

    update() {
        if (!this.isGameStarted || !this.timerEvent || !this.timerBar) return;

        const remaining = this.timerEvent.getRemaining();
        const total = LEVELS[this.currentLevelIdx].timeLimit * 1000;
        const pct = Math.max(0, remaining / total);

        this.timerBar.setSize(TIMER_BAR_W * pct, 15);

        if (pct > 0.5) this.timerBar.setFillStyle(COLORS.green);
        else if (pct > 0.25) this.timerBar.setFillStyle(COLORS.lemon);
        else this.timerBar.setFillStyle(COLORS.pink);
    }

    private emitPlatformEvent(type: PlatformEventType) {
        const levelNumber = this.currentLevelIdx + 1;

        if (window.runtimeGameBridge) {
            const payload: any = {
                type,
                gameId: GAME_ID,
                stage: levelNumber,
            };

            if (type === 'CHECKPOINT') {
                const steps = LEVELS[this.currentLevelIdx].steps;
                payload.progress = Math.round((this.placedCount / steps.length) * 100);
            }

            window.runtimeGameBridge.emit(payload);
        }
    }

    private updateUIMetrics() {
        const steps = LEVELS[this.currentLevelIdx].steps;
        EventBus.emit('game-metrics', {
            pct: this.placedCount / steps.length,
            hits: this.placedCount,
            errors: this.wrongCount,
            currentStep: this.placedCount,
            totalSteps: steps.length,
        });
    }

    private createBackground(width: number, height: number) {
        const bg = this.add.image(width / 2, height / 2, 'medabot_background_scene').setDepth(0);
        bg.setScale(width / bg.width, height / bg.height);
    }

    private showStartScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(2000);

        const bg = this.add.image(width / 2, height / 2, 'start_screen_ef01co02');
        const bgScale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(bgScale);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x061326, 0.16);
        const titleShadow = this.add.text(width / 2 + 4, height * 0.17 + 5, 'Trilha do Passo a Passo', {
            fontSize: '58px',
            fontFamily: 'Arial Black, Arial',
            color: '#1f2937',
            stroke: '#1f2937',
            strokeThickness: 8,
        }).setOrigin(0.5).setAlpha(0.45);
        const title = this.add.text(width / 2, height * 0.17, 'Trilha do Passo a Passo', {
            fontSize: '58px',
            fontFamily: 'Arial Black, Arial',
            color: '#fff7c2',
            stroke: '#334155',
            strokeThickness: 8,
        }).setOrigin(0.5);

        const startButton = this.createStartButton(width / 2 - 125, height * 0.84, 'Iniciar', 0x22c55e);
        const instructionsButton = this.createStartButton(width / 2 + 125, height * 0.84, 'Instrucoes', 0x38bdf8);

        container.add([bg, overlay, titleShadow, title, startButton, instructionsButton]);
        this.tweens.add({
            targets: [title, titleShadow],
            y: '-=10',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        this.tweens.add({
            targets: startButton,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        startButton.getData('hit').on('pointerdown', () => {
            this.playClick();
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    container.destroy();
                    this.startGameLogic();
                },
            });
        });

        instructionsButton.getData('hit').on('pointerdown', () => {
            this.playClick();
            this.showInstructionsModal(container, width, height);
        });
    }

    private createStartButton(x: number, y: number, label: string, color: number) {
        const button = this.add.container(x, y);
        const shadow = this.add.graphics();
        shadow.fillStyle(0x111827, 0.28);
        shadow.fillRoundedRect(-98, -20, 196, 54, 18);
        const bg = this.add.graphics();
        bg.fillStyle(color, 0.96);
        bg.lineStyle(4, 0xffffff, 0.95);
        bg.fillRoundedRect(-98, -27, 196, 54, 18);
        bg.strokeRoundedRect(-98, -27, 196, 54, 18);
        const hit = this.add.rectangle(0, 0, 196, 54, 0xffffff, 0.01).setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontSize: '20px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
        }).setOrigin(0.5);
        button.add([shadow, bg, hit, text]);
        button.setData('hit', hit);
        return button;
    }

    private showInstructionsModal(parent: Phaser.GameObjects.Container, width: number, height: number) {
        const modal = this.add.container(0, 0).setDepth(2100);
        const blocker = this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.48).setInteractive();
        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.96);
        panel.lineStyle(5, 0x38bdf8, 1);
        panel.fillRoundedRect(width / 2 - 360, height / 2 - 170, 720, 340, 24);
        panel.strokeRoundedRect(width / 2 - 360, height / 2 - 170, 720, 340, 24);
        const title = this.add.text(width / 2, height / 2 - 105, 'Instrucoes', {
            fontSize: '34px',
            fontFamily: 'Arial Black, Arial',
            color: '#2563eb',
        }).setOrigin(0.5);
        const body = this.add.text(
            width / 2,
            height / 2,
            'Observe a trilha e monte o Medabot na ordem correta.\nArraste cada peca para o lugar indicado, seguindo o passo a passo ate completar a montagem.',
            {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                color: '#334155',
                align: 'center',
                lineSpacing: 10,
                wordWrap: { width: 610 },
            },
        ).setOrigin(0.5);
        const closeButton = this.createStartButton(width / 2, height / 2 + 118, 'Entendi', 0x22c55e);
        modal.add([blocker, panel, title, body, closeButton]);
        parent.add(modal);
        closeButton.getData('hit').on('pointerdown', () => {
            this.playClick();
            modal.destroy();
        });
    }

    private startGameLogic() {
        const { width, height } = this.scale;
        this.isGameStarted = true;

        EventBus.emit('level-started', LEVELS[this.currentLevelIdx]);

        this.createBoardPanels();
        this.createTimerBar(width);
        this.setupBoard(width);
        this.startTimer();
    }

    private createBoardPanels() {
        this.add.image(390, 424, 'medabot_left_panel')
            .setDisplaySize(484, 431)
            .setDepth(1);
        this.add.image(887, 424, 'medabot_right_panel')
            .setDisplaySize(493, 431)
            .setDepth(1);
    }

    private createTimerBar(_width: number) {
        this.add.image(TIMER_PANEL_X, TIMER_PANEL_Y, 'medabot_top_timer_panel')
            .setDisplaySize(1065, 89)
            .setDepth(12);

        this.timerBar = this.add.rectangle(366, TIMER_BAR_Y, TIMER_BAR_W, 22, COLORS.green)
            .setOrigin(0, 0.5)
            .setDepth(14);
    }

    private setupBoard(width: number) {
        const level = LEVELS[this.currentLevelIdx];

        const isCompact = level.steps.length === 6;
        const cardW = isCompact ? 344 : 383;
        const cardH = isCompact ? 72 : 95;
        const startY = isCompact ? 342 : 342;
        const spacingY = isCompact ? 72 : 112;
        const leftX = 395;
        const rightX = 892;

        level.steps.forEach((step, index) => {
            const y = startY + (index * spacingY);
            this.createSlotVisual(rightX, y, cardW, cardH, index + 1, step.label, isCompact, step.id);
        });

        const shuffledParts = [...level.steps].sort(() => Math.random() - 0.5);

        shuffledParts.forEach((part, index) => {
            const y = startY + (index * spacingY);
            this.createPartVisual(leftX, y, cardW, cardH, part.label, part.assetKey, part.id, isCompact, index);
        });
    }

    private createSlotVisual(
        x: number,
        y: number,
        width: number,
        height: number,
        step: number,
        label: string,
        compact: boolean,
        stepId: number,
    ) {
        const frame = this.add.image(x, y, 'medabot_assembly_slot')
            .setDisplaySize(width, height)
            .setDepth(4);
        const zone = this.add.rectangle(x, y, width, height, 0xffffff, 0.01)
            .setDepth(6)
            .setInteractive();
        zone.input.dropZone = true;
        zone.setData('stepId', stepId);

        const badgeClass = compact ? 'medabot-slot-badge is-compact' : 'medabot-slot-badge';
        const labelClass = compact ? 'medabot-slot-copy is-compact' : 'medabot-slot-copy';

        const badge = this.createDomNode(x - 136, y, 'div', badgeClass, `${step}`);
        const copy = document.createElement('div');
        copy.className = labelClass;
        copy.innerHTML = `<span class="medabot-slot-prefix">Lugar da</span><span class="medabot-slot-label">${label.trim().toUpperCase()}</span>`;
        const labelNode = this.registerDom(this.add.dom(x + 28, y, copy));

        badge.setDepth(8);
        labelNode.setDepth(8);

        const slotVisual: SlotVisual = { frame, zone, badge, label: labelNode, stepId };
        zone.setData('slotVisual', slotVisual);
    }

    private createPartVisual(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        assetKey: string,
        stepId: number,
        compact: boolean,
        index: number,
    ) {
        const container = this.add.container(x, y).setDepth(5);
        const card = this.add.image(0, 0, 'medabot_card_part').setDisplaySize(width, height);
        const sprite = this.add.sprite(-112, 0, assetKey).setDisplaySize(compact ? 56 : 74, compact ? 56 : 74);
        const glow = this.add.circle(-112, 0, compact ? 27 : 34, 0xffffff, 0.16);
        const handle = this.add.rectangle(0, 0, width, height, 0xffffff, 0.01)
            .setInteractive({ draggable: true, useHandCursor: true });

        container.add([card, glow, sprite, handle]);

        const className = compact ? 'medabot-part-copy is-compact' : 'medabot-part-copy';
        const labelNode = this.createDomNode(x + 42, y, 'div', className, label.trim());
        labelNode.setDepth(9);

        this.tweens.add({
            targets: sprite,
            angle: 3,
            duration: 950 + (index * 120),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const visual: PartVisual = {
            container,
            handle,
            label: labelNode,
            homeX: x,
            homeY: y,
            stepId,
        };

        this.partVisuals.set(handle, visual);
        container.setData('stepId', stepId);
        this.setupDrag(visual);
    }

    private setupDrag(visual: PartVisual) {
        const { handle } = visual;
        this.input.setDraggable(handle);

        handle.on('dragstart', () => {
            visual.homeX = visual.container.x;
            visual.homeY = visual.container.y;
            visual.container.setDepth(40);
            visual.label.setDepth(41);
        });

        handle.on('drag', (pointer: Phaser.Input.Pointer) => {
            this.setPartPosition(visual, pointer.x, pointer.y);
        });

        handle.on('dragend', (_pointer: Phaser.Input.Pointer, dropped: boolean) => {
            visual.container.setDepth(5);
            visual.label.setDepth(9);

            if (!dropped) {
                this.tweenPartTo(visual, visual.homeX, visual.homeY);
            }
        });

        this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dropZone: Phaser.GameObjects.GameObject) => {
            if (gameObject !== handle) return;

            const targetZone = dropZone as Phaser.GameObjects.Rectangle;
            const targetStepId = targetZone.getData('stepId') as number;
            const partStepId = visual.stepId;
            const slotVisual = targetZone.getData('slotVisual') as SlotVisual;

            if (targetStepId === this.nextStepRequired && partStepId === this.nextStepRequired) {
                this.setPartPosition(visual, targetZone.x, targetZone.y);
                handle.disableInteractive();
                slotVisual.frame.setTint(0xeafff3);
                this.createDomNode(targetZone.x + 136, targetZone.y - 18, 'div', 'medabot-status-ok', 'OK').setDepth(42);
                this.tweens.add({
                    targets: visual.container,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 130,
                    yoyo: true,
                    ease: 'Back.easeOut',
                });

                this.playCorrect();
                this.nextStepRequired++;
                this.placedCount++;

                this.updateUIMetrics();
                this.emitPlatformEvent('CHECKPOINT');

                if (this.placedCount === LEVELS[this.currentLevelIdx].steps.length) {
                    this.handleLevelWin();
                }
            } else {
                this.wrongCount++;
                this.updateUIMetrics();
                this.cameras.main.shake(150, 0.01);
                this.playWrong();
                this.emitPlatformEvent('WRONG_ANSWER');
                this.tweenPartTo(visual, visual.homeX, visual.homeY);
            }
        });
    }

    private setPartPosition(visual: PartVisual, x: number, y: number) {
        visual.container.setPosition(x, y);
        visual.label.setPosition(x + 42, y);
    }

    private tweenPartTo(visual: PartVisual, x: number, y: number) {
        this.tweens.add({
            targets: visual.container,
            x,
            y,
            duration: 250,
            ease: 'Power2',
            onUpdate: () => {
                visual.label.setPosition(visual.container.x + 42, visual.container.y);
            },
        });
    }

    private handleLevelWin() {
        if (this.timerEvent) this.timerEvent.remove();
        this.time.delayedCall(400, () => this.showTransitionScreen());
    }

    private showTransitionScreen() {
        const { width, height } = this.scale;
        const isLastLevel = (this.currentLevelIdx + 1) >= LEVELS.length;
        const container = this.add.container(0, 0).setDepth(4000);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x7dd3fc, 0.92);
        const title = this.add.text(width / 2, height * 0.16, 'Trilha completa!', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#4f46e5',
            stroke: '#ffffff',
            strokeThickness: 8,
        }).setOrigin(0.5);
        this.addCelebrationRobots(container, width, height);

        const finalImage = this.add.image(width / 2, height * 0.45, 'robot_kbt_full_v2').setDisplaySize(350, 500);
        this.tweens.add({
            targets: finalImage,
            y: '-=12',
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const glow = this.add.circle(width / 2, height * 0.48, 150, 0xffd166, 0.35).setDepth(-1);
        container.add(glow);

        const btnColor = isLastLevel ? 0x10b981 : 0xff9f1c;
        const btnLabel = isLastLevel ? 'FINALIZAR AVENTURA' : 'PROXIMA TRILHA';
        const button = this.add.rectangle(width / 2, height * 0.82, 550, 85, btnColor)
            .setStrokeStyle(5, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const buttonText = this.add.text(width / 2, height * 0.82, btnLabel, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([overlay, title, finalImage, button, buttonText]);

        button.on('pointerdown', () => {
            this.playClick();
            if (!isLastLevel) {
                this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            } else {
                this.emitPlatformEvent('FINISH_GAME');
                window.location.href = '/';
            }
        });
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: LEVELS[this.currentLevelIdx].timeLimit * 1000,
            callback: () => {
                this.emitPlatformEvent('GAME_OVER');
                this.showGameOverScreen();
            },
        });
    }

    private showGameOverScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(3000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x312e81, 0.86);
        const title = this.add.text(width / 2, height * 0.4, 'O tempo acabou!', {
            fontSize: '42px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#ff6fb1',
            strokeThickness: 7,
        }).setOrigin(0.5);
        this.addCelebrationRobots(container, width, height);

        const btnBg = this.add.rectangle(width / 2, height * 0.6, 460, 85, 0xff9f1c)
            .setStrokeStyle(5, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(width / 2, height * 0.6, 'TENTAR DE NOVO', {
            fontSize: '26px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([bg, title, btnBg, btnText]);

        btnBg.on('pointerdown', () => {
            this.playClick();
            this.scene.restart({ levelIndex: this.currentLevelIdx });
        });
    }

    private addCelebrationRobots(container: Phaser.GameObjects.Container, width: number, height: number) {
        const specs = [
            { x: 0.12, y: 0.2, s: 0.56, c: COLORS.lemon, a: -8 },
            { x: 0.88, y: 0.22, s: 0.54, c: COLORS.pink, a: 8 },
            { x: 0.18, y: 0.78, s: 0.48, c: COLORS.green, a: 5 },
            { x: 0.82, y: 0.77, s: 0.48, c: 0x38bdf8, a: -5 },
        ];

        specs.forEach((spec) => {
            const bot = this.drawRealMedabot(width * spec.x, height * spec.y, spec.s, spec.c, spec.a, 0.78);
            bot.removeFromDisplayList();
            container.add(bot);
        });
    }

    private drawRealMedabot(
        x: number,
        y: number,
        scale: number,
        accent: number,
        angle = 0,
        alpha = 1,
    ) {
        const bot = this.add.container(x, y);
        const shadow = this.add.ellipse(0, 60 * scale, 90 * scale, 24 * scale, COLORS.shadow, 0.16 * alpha);
        const glow = this.add.circle(0, -6 * scale, 62 * scale, accent, 0.16 * alpha);
        const sprite = this.add.image(0, -8 * scale, 'robot_kbt_full_v2')
            .setDisplaySize(98 * scale, 142 * scale)
            .setAlpha(alpha);

        bot.add([shadow, glow, sprite]);
        bot.setAngle(angle);
        this.tweens.add({
            targets: bot,
            y: y - (10 * scale),
            angle: angle * -0.65,
            duration: 1500 + (Math.abs(angle) * 95),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        return bot;
    }

    private createDomNode(x: number, y: number, tag: string, className: string, content: string) {
        const el = document.createElement(tag);
        el.className = className;
        el.innerHTML = content;
        return this.registerDom(this.add.dom(x, y, el));
    }

    private registerDom(node: Phaser.GameObjects.DOMElement) {
        this.domNodes.push(node);
        return node;
    }

    private cleanupDomNodes() {
        this.domNodes.forEach((node) => {
            if (node.scene) node.destroy();
        });
        this.domNodes = [];
        this.partVisuals.clear();
    }

    private getAudioContext(): AudioContext | null {
        if (!('context' in this.sound)) return null;
        return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
    }

    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.2, delay = 0) {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
        gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.01);
    }

    private playClick() { this.playTone(580, 0.06, 'sine', 0.12); }
    private playCorrect() { this.playTone(880, 0.12, 'triangle', 0.18); }
    private playWrong() { this.playTone(110, 0.35, 'sawtooth', 0.2); }
}
