import Phaser from 'phaser';
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge';
import { LEVELS } from '../data/levels';

const GAME_ID = "EF01CO02";
const TIMER_BAR_Y = 45;
const TIMER_BAR_W = 700;

export class GameScene extends Phaser.Scene {
    private currentLevelIdx = 0;
    private nextStepRequired = 1;
    private hasExtraLife = true;
    
    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;
    private placedCount = 0;

    constructor() {
        super('GameScene');
    }

    // 1. O método init recebe os dados do restart. 
    // É fundamental que a variável local mude aqui.
    init(data: { levelIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.nextStepRequired = 1;
        this.hasExtraLife = true;
        this.placedCount = 0;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground(width, height);
        this.createTitle(width);
        this.createTimerBar(width);
        this.setupBoard(width);
        this.startTimer();

        // 2. CORREÇÃO DA BARRA: Enviamos o stage atualizado para a plataforma
        // O stage é sempre o índice + 1 (Nível 1, 2 ou 3)
        runtimeGameBridge.emit({ 
            type: "GAME_READY", 
            gameId: GAME_ID, 
            stage: this.currentLevelIdx + 1 
        });
    }

    update() {
        if (!this.timerEvent || !this.timerBar) return;
        const remaining = this.timerEvent.getRemaining();
        const total = (LEVELS[this.currentLevelIdx].timeLimit) * 1000;
        const pct = Math.max(0, remaining / total);

        this.timerBar.setSize(TIMER_BAR_W * pct, 15);
        
        if (pct > 0.5) this.timerBar.setFillStyle(0x22c55e);
        else if (pct > 0.25) this.timerBar.setFillStyle(0xf59e0b);
        else this.timerBar.setFillStyle(0xef4444);
    }

    private createBackground(width: number, height: number) {
        this.add.rectangle(width / 2, height / 2, width, height, 0xf3e8ff); 
        this.add.rectangle(width / 2, height * 0.25, width, height * 0.5, 0xdbeafe, 0.7); 
        this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0xfef3c7, 0.6); 

        const colors = [0xc4b5fd, 0x93c5fd, 0xf9a8d4, 0xfcd34d, 0x86efac];
        for (let i = 0; i < 8; i++) {
            this.add.circle(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(50, height - 50),
                Phaser.Math.Between(30, 60),
                Phaser.Utils.Array.GetRandom(colors),
                0.25
            );
        }
    }

    private createTitle(width: number) {
        const level = LEVELS[this.currentLevelIdx];
        this.add.text(width / 2, 105, (level.title || level.name).toUpperCase(), {
            fontSize: "34px", fontFamily: "Arial Black", color: "#5b21b6",
            stroke: "#ffffff", strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, 150, level.objective || "Organize os passos na ordem correta.", {
            fontSize: "18px", fontFamily: "Arial", color: "#334155", fontWeight: 'bold'
        }).setOrigin(0.5);
    }

    private createTimerBar(width: number) {
        this.add.rectangle(width / 2, TIMER_BAR_Y, TIMER_BAR_W + 8, 26, 0x334155, 0.3).setDepth(5);
        this.timerBar = this.add.rectangle(width / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 15, 0x22c55e)
            .setOrigin(0, 0.5).setDepth(6);
    }

    private setupBoard(width: number) {
        const level = LEVELS[this.currentLevelIdx];
        const cardW = 110;
        const cardH = 135;
        const spacing = level.steps.length > 4 ? 125 : 145;
        const totalWidth = (level.steps.length - 1) * spacing;
        const startX = (width - totalWidth) / 2;

        level.steps.forEach((step, index) => {
            const x = startX + (index * spacing);
            const y = 285;
            const slot = this.add.rectangle(x, y, cardW, cardH, 0xffffff, 0.95).setStrokeStyle(4, 0x8b5cf6);
            this.add.text(x, y - 20, `${step.id}`, { fontSize: '42px', color: '#8b5cf6', fontFamily: 'Arial Black' }).setOrigin(0.5);
            this.add.text(x, y + 35, step.label.toUpperCase(), { fontSize: '11px', color: '#5b21b6', align: 'center', wordWrap: { width: 100 }, fontWeight: 'bold' }).setOrigin(0.5);
            slot.setData('stepId', step.id).setInteractive().input.dropZone = true;
        });

        const shuffled = [...level.steps].sort(() => Math.random() - 0.5);
        shuffled.forEach((step, index) => {
            const x = startX + (index * spacing);
            const container = this.add.container(x, 520);
            const bg = this.add.rectangle(0, 0, cardW, cardH, 0xffffff).setStrokeStyle(4, 0xf59e0b);
            const sprite = this.add.sprite(0, -15, step.assetKey).setDisplaySize(80, 80);
            const txt = this.add.text(0, 40, step.label, { fontSize: '11px', color: '#334155', fontWeight: 'bold' }).setOrigin(0.5);
            container.add([bg, sprite, txt]);
            container.setData('stepId', step.id);
            bg.setInteractive({ draggable: true, useHandCursor: true });
            this.setupDrag(bg, container);
        });
    }

    private setupDrag(handle: Phaser.GameObjects.Rectangle, container: Phaser.GameObjects.Container) {
        this.input.setDraggable(handle);
        handle.on('drag', (p: any) => { container.setPosition(p.x, p.y); });
        handle.on('dragend', (p: any, dropped: boolean) => {
            if (!dropped) this.tweens.add({ targets: container, x: container.input?.dragStartX, y: container.input?.dragStartY, duration: 300 });
        });

        this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
            if (gameObject !== handle) return;
            const pieceId = container.getData('stepId');
            const slotId = dropZone.getData('stepId');

            if (slotId === this.nextStepRequired && pieceId === this.nextStepRequired) {
                container.setPosition(dropZone.x, dropZone.y);
                handle.disableInteractive();
                this.nextStepRequired++;
                this.placedCount++;
                this.emitProgress(); // Atualiza a barra de progresso superior
                if (this.placedCount === LEVELS[this.currentLevelIdx].steps.length) this.handleLevelWin();
            } else {
                this.handleError(container);
            }
        });
    }

    private handleLevelWin() {
        if (this.timerEvent) this.timerEvent.remove();
        this.showFloatingMessage("SEQUÊNCIA COMPLETA!", 0x22c55e);

        this.time.delayedCall(1500, () => {
            if (this.currentLevelIdx + 1 < LEVELS.length) {
                // 3. Reinicia passando o novo index. 
                // Isso disparará o init() e consequentemente o create() com GAME_READY
                this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            } else {
                runtimeGameBridge.emit({ 
                    type: "GAME_COMPLETED", 
                    gameId: GAME_ID, 
                    stage: this.currentLevelIdx + 1 
                });
            }
        });
    }

    private handleError(container: Phaser.GameObjects.Container) {
        this.cameras.main.shake(200, 0.01);
        if (this.hasExtraLife) {
            this.hasExtraLife = false;
            this.showFloatingMessage("! ATENÇÃO", 0xf59e0b);
            this.tweens.add({ targets: container, x: container.input?.dragStartX, y: container.input?.dragStartY, duration: 300 });
        } else {
            runtimeGameBridge.emit({ type: "GAME_OVER", gameId: GAME_ID, stage: this.currentLevelIdx + 1 });
        }
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: LEVELS[this.currentLevelIdx].timeLimit * 1000,
            callback: () => {
                runtimeGameBridge.emit({ type: "GAME_OVER", gameId: GAME_ID, stage: this.currentLevelIdx + 1 });
            }
        });
    }

    private showFloatingMessage(msg: string, color: number) {
        const txt = this.add.text(this.scale.width / 2, this.scale.height / 2, msg, {
            fontSize: '42px', fontFamily: 'Arial Black', color: '#fff',
            backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: txt, alpha: 0, delay: 1000, duration: 500, onComplete: () => txt.destroy() });
    }

    private emitProgress() {
        const steps = LEVELS[this.currentLevelIdx].steps;
        const progress = Math.round((this.placedCount / steps.length) * 100);
        
        // 4. CHECKPOINT também precisa do stage atualizado para manter a barra sincronizada
        runtimeGameBridge.emit({ 
            type: "CHECKPOINT", 
            gameId: GAME_ID, 
            progress, 
            stage: this.currentLevelIdx + 1 
        });
    }
}