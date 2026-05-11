import Phaser from 'phaser';
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge';
import { LEVELS } from '../data/levels';

const GAME_ID = "EF01CO02";
const TIMER_BAR_Y = 55;
const TIMER_BAR_W = 900;

export class GameScene extends Phaser.Scene {
    private currentLevelIdx = 0;
    private nextStepRequired = 1;
    
    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;
    private placedCount = 0;
    private isGameStarted = false;

    constructor() {
        super('GameScene');
    }

    // --- MOTOR DE COMUNICAÇÃO CENTRALIZADO ---
    private emitPlatformEvent(type: "WRONG_ANSWER" | "GAME_OVER" | "FINISH_GAME" | "CHECKPOINT" | "GAME_READY") {
        const levelNumber = this.currentLevelIdx + 1;
        
        if (window.runtimeGameBridge) {
            const payload: any = {
                type: type,
                gameId: GAME_ID,
                stage: levelNumber,
            };

            // Se for checkpoint, adiciona o progresso
            if (type === "CHECKPOINT") {
                const steps = LEVELS[this.currentLevelIdx].steps;
                payload.progress = Math.round((this.placedCount / steps.length) * 100);
            }

            window.runtimeGameBridge.emit(payload);
            console.log(`[Bridge] Evento enviado: ${type}`, payload);
        } else {
            console.warn(`[Local] Evento simulado: ${type} para o nível ${levelNumber}`);
        }
    }

    init(data: { levelIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.nextStepRequired = 1;
        this.placedCount = 0;
        this.isGameStarted = false;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground(width, height);
        this.showStartScreen();

        // Avisa que o jogo carregou
        this.emitPlatformEvent("GAME_READY");
    }

    update() {
        if (!this.isGameStarted || !this.timerEvent || !this.timerBar) return;
        
        const remaining = this.timerEvent.getRemaining();
        const total = (LEVELS[this.currentLevelIdx].timeLimit) * 1000;
        const pct = Math.max(0, remaining / total);

        this.timerBar.setSize(TIMER_BAR_W * pct, 15);
        
        if (pct > 0.5) this.timerBar.setFillStyle(0x00ff00);
        else if (pct > 0.25) this.timerBar.setFillStyle(0xffcc00);
        else this.timerBar.setFillStyle(0xff0000);
    }

    private showStartScreen() {
        const { width, height } = this.scale;
        const level = LEVELS[this.currentLevelIdx];
        const container = this.add.container(0, 0).setDepth(2000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
        const title = this.add.text(width / 2, height * 0.25, level.name.toUpperCase(), {
            fontSize: '64px', fontFamily: 'Arial Black', color: '#ff0080', stroke: '#ffffff', strokeThickness: 8
        }).setOrigin(0.5);

        const starsContainer = this.add.container(width / 2, height * 0.38);
        for (let i = 0; i < 3; i++) {
            const color = i <= this.currentLevelIdx ? '#f1c40f' : '#444';
            starsContainer.add(this.add.text(-80 + (i * 80), 0, '★', { fontSize: '60px', color: color }).setOrigin(0.5));
        }

        const instructions = this.add.text(width / 2, height * 0.55, 
            "OBJETIVO:\nOrganize as etapas do origami na ordem correta.\n\nCONTROLES:\nClique e arraste as peças para as caixas numeradas.", {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', align: 'center', lineSpacing: 10
        }).setOrigin(0.5);

        const btnBg = this.add.rectangle(width / 2, height * 0.78, 400, 80, 0x00ff00).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(width / 2, height * 0.78, "INICIAR MISSÃO", { fontSize: '28px', fontFamily: 'Arial Black', color: '#000000' }).setOrigin(0.5);

        container.add([bg, title, starsContainer, instructions, btnBg, btnText]);

        btnBg.on('pointerdown', () => {
            this.playClick();
            this.tweens.add({ targets: container, alpha: 0, duration: 500, onComplete: () => { container.destroy(); this.startGameLogic(); } });
        });
    }

    private startGameLogic() {
        const width = this.scale.width;
        this.isGameStarted = true;
        this.createTitle(width);
        this.createTimerBar(width);
        this.setupBoard(width);
        this.startTimer();
    }

    private createBackground(width: number, height: number) {
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff0f6); 
        this.add.rectangle(width / 2, height * 0.25, width, height * 0.5, 0x00d2ff, 0.2); 
        this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0xffcc33, 0.3); 

        const origamiTextures = ['origami_base', 'origami_center', 'origami_tips', 'origami_boat'];
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const texture = Phaser.Utils.Array.GetRandom(origamiTextures);
            this.add.sprite(x, y, texture).setAlpha(0.12).setAngle(Phaser.Math.Between(-25, 25)).setDisplaySize(90, 90).setDepth(0);
        }
    }

    private createTitle(width: number) {
        const level = LEVELS[this.currentLevelIdx];
        this.add.text(width / 2, 105, (level.name).toUpperCase(), { fontSize: "38px", fontFamily: "Arial Black", color: "#ff0080", stroke: "#ffffff", strokeThickness: 6 }).setOrigin(0.5);
        this.add.text(width / 2, 150, "Organize os passos na ordem correta.", { fontSize: "20px", fontFamily: "Arial Black", color: "#1a1a1a" }).setOrigin(0.5);
    }

    private createTimerBar(width: number) {
        this.add.rectangle(width / 2, TIMER_BAR_Y, TIMER_BAR_W + 8, 26, 0x000000, 0.5).setDepth(5);
        this.timerBar = this.add.rectangle(width / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 15, 0x00ff00).setOrigin(0, 0.5).setDepth(6);
    }

    private setupBoard(width: number) {
        const level = LEVELS[this.currentLevelIdx];
        const cardW = 125;
        const cardH = 170;
        const spacing = cardW + 15;
        const startX = (width - (level.steps.length * spacing - 15)) / 2 + (cardW / 2);

        level.steps.forEach((step, index) => {
            const x = startX + (index * spacing);
            const y = 285;
            const slot = this.add.rectangle(x, y, cardW, cardH, 0xffffff, 1).setStrokeStyle(5, 0x7b2cbf);
            this.add.text(x, y - 30, `${step.id}`, { fontSize: '80px', color: '#7b2cbf', fontFamily: 'Arial Black' }).setOrigin(0.5);
            this.add.text(x, y + 45, step.label.toUpperCase(), { fontSize: '16px', color: '#3c096c', fontFamily: 'Arial Black', align: 'center', wordWrap: { width: cardW - 10 } }).setOrigin(0.5);
            slot.setData('stepId', step.id).setInteractive().input.dropZone = true;
        });

        const shuffled = [...level.steps].sort(() => Math.random() - 0.5);
        shuffled.forEach((step, index) => {
            const x = startX + (index * spacing);
            const container = this.add.container(x, 520);
            const bg = this.add.rectangle(0, 0, cardW, cardH, 0xffffff).setStrokeStyle(5, 0xff9100);
            const sprite = this.add.sprite(0, -20, step.assetKey!).setDisplaySize(85, 85);
            const txt = this.add.text(0, 50, step.label.toUpperCase(), { fontSize: '16px', color: '#d00000', fontFamily: 'Arial Black', align: 'center', wordWrap: { width: cardW - 15 } }).setOrigin(0.5); 
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
            if (!dropped) this.tweens.add({ targets: container, x: container.input?.dragStartX, y: container.input?.dragStartY, duration: 300, ease: 'Back.easeOut' });
        });

        this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
            if (gameObject !== handle) return;
            
            // VERIFICAÇÃO DE ACERTO
            if (dropZone.getData('stepId') === this.nextStepRequired && container.getData('stepId') === this.nextStepRequired) {
                container.setPosition(dropZone.x, dropZone.y);
                handle.disableInteractive();
                this.playCorrect();
                this.nextStepRequired++;
                this.placedCount++;
                
                // Envia checkpoint para a plataforma
                this.emitPlatformEvent("CHECKPOINT");

                if (this.placedCount === LEVELS[this.currentLevelIdx].steps.length) {
                    this.handleLevelWin();
                }
            } else {
                // ERRO DETECTADO
                this.handleError(container);
            }
        });
    }

    private handleLevelWin() {
        if (this.timerEvent) this.timerEvent.remove();
        this.showTransitionScreen();
    }

    private showTransitionScreen() {
        const { width, height } = this.scale;
        const level = LEVELS[this.currentLevelIdx];
        const isLastLevel = (this.currentLevelIdx + 1) >= LEVELS.length;
        const container = this.add.container(0, 0).setDepth(4000);

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        const title = this.add.text(width / 2, height * 0.15, "PARABÉNS!", { fontSize: '72px', fontFamily: 'Arial Black', color: '#fff' }).setOrigin(0.5);
        
        const finalAssetKey = level.steps[level.steps.length - 1].assetKey || 'origami_boat';
        const finalImage = this.add.sprite(width / 2, height * 0.45, finalAssetKey).setDisplaySize(220, 220);
        
        const btnColor = isLastLevel ? 0x27ae60 : 0x9333ea;
        const btnLabel = isLastLevel ? "FINALIZAR JOGO" : "PRÓXIMO NÍVEL";
        const button = this.add.rectangle(width / 2, height * 0.82, 600, 90, btnColor).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
        const buttonText = this.add.text(width / 2, height * 0.82, btnLabel, { fontSize: '26px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);

        container.add([overlay, title, finalImage, button, buttonText]);

        button.on('pointerdown', () => {
            this.playClick();
            if (!isLastLevel) {
                this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            } else {
                // AVISA QUE O JOGO TODO TERMINOU
                this.emitPlatformEvent("FINISH_GAME");
            }
        });
    }

    private handleError(container: Phaser.GameObjects.Container) {
        this.cameras.main.shake(250, 0.015);
        this.playWrong();
        
        // --- AÇÃO CRÍTICA PARA O BLOQUEIO ---
        // Avisa a plataforma que o aluno errou. 
        // Se ele não tiver mais vidas, a plataforma vai sobrepor a tela de bloqueio agora.
        this.emitPlatformEvent("WRONG_ANSWER");

        // Pausa o timer do jogo enquanto o aluno vê a mensagem de erro interna
        if (this.timerEvent) this.timerEvent.paused = true;
        this.showGameOverScreen();
    }

    private showGameOverScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(3000);
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        const title = this.add.text(width / 2, height * 0.4, "OPS! ORDEM INCORRETA", { fontSize: '52px', fontFamily: 'Arial Black', color: '#ff4d4d' }).setOrigin(0.5);
        const btnBg = this.add.rectangle(width / 2, height * 0.6, 450, 90, 0xff9100).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(width / 2, height * 0.6, "TENTAR NOVAMENTE", { fontSize: '28px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);
        
        container.add([bg, title, btnBg, btnText]);
        
        btnBg.on('pointerdown', () => { 
            this.playClick(); 
            this.scene.restart({ levelIndex: this.currentLevelIdx }); 
        });
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: LEVELS[this.currentLevelIdx].timeLimit * 1000,
            callback: () => { 
                // Avisa que o tempo acabou
                this.emitPlatformEvent("GAME_OVER"); 
            }
        });
    }

    // --- FUNÇÕES DE ÁUDIO ---
    private getAudioContext(): AudioContext | null {
        if (!("context" in this.sound)) return null;
        return (this.sound as Phaser.Sound.WebAudioSoundManager).context;
    }

    private playTone(f: number, d: number, t: OscillatorType = "sine", v = 0.2, dl = 0) {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = t;
        osc.frequency.setValueAtTime(f, ctx.currentTime + dl);
        gain.gain.setValueAtTime(v, ctx.currentTime + dl);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dl + d);
        osc.start(ctx.currentTime + dl);
        osc.stop(ctx.currentTime + dl + d + 0.01);
    }

    private playClick() { this.playTone(440, 0.05, "sine", 0.1); }
    private playCorrect() { this.playTone(523, 0.1, "sine", 0.2); }
    private playWrong() { this.playTone(150, 0.3, "sawtooth", 0.15); }
}