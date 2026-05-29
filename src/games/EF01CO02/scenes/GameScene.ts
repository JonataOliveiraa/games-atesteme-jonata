import Phaser from 'phaser';
import { LEVELS } from '../data/levels';
import { EventBus } from '../../../shared/EventBus';

const GAME_ID = "EF01CO02";
const TIMER_BAR_Y = 115;
const TIMER_BAR_W = 500;

const PALETTE = {
    skyTop: 0x7bdff2,
    skyBottom: 0xfff3b0,
    grass: 0x64d98b,
    labFloor: 0xb8f2e6,
    labWall: 0xdff7ff,
    boltBlue: 0x38bdf8,
    boltYellow: 0xffd166,
    boltRed: 0xff6b6b,
    panel: 0xffffff,
    panelBlue: 0xe6f7ff,
    panelYellow: 0xfff0a8,
    ink: "#2c3563",
    purple: 0x8b5cf6,
    orange: 0xff9f1c,
    green: 0x2dd4bf,
    pink: 0xff6fb1,
    shadow: 0x3d3a78
};

export class GameScene extends Phaser.Scene {
    private currentLevelIdx = 0;
    private nextStepRequired = 1;
    
    private timerBar?: Phaser.GameObjects.Rectangle;
    private timerEvent?: Phaser.Time.TimerEvent;
    private placedCount = 0;
    private wrongCount = 0;
    private isGameStarted = false;

    constructor() {
        super('GameScene');
    }

    private emitPlatformEvent(type: "WRONG_ANSWER" | "GAME_OVER" | "FINISH_GAME" | "CHECKPOINT" | "GAME_READY") {
        const levelNumber = this.currentLevelIdx + 1;
        
        if (window.runtimeGameBridge) {
            const payload: any = {
                type: type,
                gameId: GAME_ID,
                stage: levelNumber,
            };

            if (type === "CHECKPOINT") {
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
            totalSteps: steps.length
        });
    }

    init(data: { levelIndex?: number }) {
        this.currentLevelIdx = data.levelIndex ?? 0;
        this.nextStepRequired = 1;
        this.placedCount = 0;
        this.wrongCount = 0;
        this.isGameStarted = false;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground(width, height);
        this.showStartScreen();

        this.emitPlatformEvent("GAME_READY");
    }

    update() {
        if (!this.isGameStarted || !this.timerEvent || !this.timerBar) return;
        
        const remaining = this.timerEvent.getRemaining();
        const total = LEVELS[this.currentLevelIdx].timeLimit * 1000;
        const pct = Math.max(0, remaining / total);

        this.timerBar.setSize(TIMER_BAR_W * pct, 15);
        
        if (pct > 0.5) this.timerBar.setFillStyle(PALETTE.green); 
        else if (pct > 0.25) this.timerBar.setFillStyle(0xffd166); 
        else this.timerBar.setFillStyle(PALETTE.pink); 
    }

    private showStartScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(2000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xf5f7ff, 1);
        const gridBg = this.add.graphics();
        gridBg.fillGradientStyle(0xdedcff, 0xfbe2f3, 0xd7f4ff, 0xebfff8, 1);
        gridBg.fillRoundedRect(18, 20, width - 36, height - 40, 30);
        gridBg.lineStyle(2, 0xffffff, 0.16);
        for (let x = 42; x < width - 24; x += 44) {
            gridBg.lineBetween(x, 22, x, height - 22);
        }
        for (let y = 64; y < height - 24; y += 44) {
            gridBg.lineBetween(20, y, width - 20, y);
        }

        const startRobots = this.addStartRobotCrew(width, height);
        const panelShadow = this.add.graphics();
        panelShadow.fillStyle(0x8b5cf6, 0.16);
        panelShadow.fillRoundedRect(width / 2 - 492, height * 0.24 + 20, 984, 398, 28);
        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.94);
        panel.lineStyle(4, 0xffffff, 0.95);
        panel.fillRoundedRect(width / 2 - 492, height * 0.24, 984, 398, 28);
        panel.strokeRoundedRect(width / 2 - 492, height * 0.24, 984, 398, 28);

        const topBotGlow = this.add.circle(width / 2, height * 0.16, 64, 0xffffff, 0.58);
        const topBot = this.add.image(width / 2, height * 0.16, 'robot_kbt_full_v2').setDisplaySize(64, 92).setAngle(-4);
        this.tweens.add({ targets: [topBotGlow, topBot], y: "-=9", duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        const badge = this.drawPill(width / 2, height * 0.34, 310, 48, 0xdfe5ff, 0xdfe5ff, 0).setDepth(2001);
        const badgeText = this.add.text(width / 2, height * 0.34, "Oficina de montagem", {
            fontSize: '16px', fontFamily: 'Arial Black, Arial', color: '#4338ca'
        }).setOrigin(0.5);

        const title = this.add.text(width / 2, height * 0.44, "Trilha do Passo a Passo", {
            fontSize: '58px', fontFamily: 'Arial Black, Arial', color: '#4f46e5'
        }).setOrigin(0.5);

        const starsContainer = this.add.container(width / 2, height * 0.52);
        for (let i = 0; i < 3; i++) {
            const color = i <= this.currentLevelIdx ? '#ffb703' : '#c7d2fe';
            starsContainer.add(this.add.text(-54 + (i * 54), 0, '*', { fontSize: '38px', color, fontFamily: 'Arial Black' }).setOrigin(0.5));
        }

        const instructions = this.add.text(width / 2, height * 0.6, 
            "Monte o Medabot amigo na ordem certa.\nArraste cada peca para o lugar indicado na trilha.", {
            fontSize: '22px', fontFamily: 'Arial, sans-serif', color: '#475569', align: 'center', lineSpacing: 8,
            wordWrap: { width: 670 }
        }).setOrigin(0.5);

        const btnShadow = this.add.graphics();
        btnShadow.fillStyle(0x7c3aed, 0.18);
        btnShadow.fillRoundedRect(width / 2 - 110, height * 0.73 - 25 + 8, 220, 58, 18);
        const button = this.add.container(width / 2, height * 0.73);
        const btnBg = this.add.graphics();
        btnBg.fillGradientStyle(0x6d5dfc, 0xd9469f, 0x6d5dfc, 0xd9469f, 1);
        btnBg.fillRoundedRect(-110, -29, 220, 58, 18);
        const btnHit = this.add.rectangle(0, 0, 220, 58, 0xffffff, 0.01).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, 0, "Iniciar jogo", { fontSize: '19px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);
        button.add([btnBg, btnHit, btnText]);

        this.addFloatingDecorations(container, width, height);
        container.add([bg, gridBg, ...startRobots, panelShadow, panel, topBotGlow, topBot, badge, badgeText, title, starsContainer, instructions, btnShadow, button]);
        this.tweens.add({ targets: button, scaleX: 1.04, scaleY: 1.04, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        btnHit.on('pointerdown', () => {
            this.playClick();
            this.tweens.add({ targets: container, alpha: 0, duration: 400, onComplete: () => { container.destroy(); this.startGameLogic(); } });
        });
    }

    private startGameLogic() {
        const width = this.scale.width;
        this.isGameStarted = true;
        
        EventBus.emit('level-started', LEVELS[this.currentLevelIdx]);
        
        this.createTitle(width);
        this.createTimerBar(width);
        this.setupBoard(width);
        this.startTimer();
    }

    private createBackground(width: number, height: number) {
        this.drawMedabotLab(width, height);

        this.drawRoundedPanel(width * 0.28, height * 0.61, width * 0.43, height * 0.6, PALETTE.panelYellow, PALETTE.orange);
        this.add.text(width * 0.28, 215, "Pecas Medabot", { 
            fontSize: "21px", fontFamily: "Arial Black", color: "#8a3ffc", stroke: "#ffffff", strokeThickness: 5
        }).setOrigin(0.5).setDepth(3);

        this.drawRoundedPanel(width * 0.72, height * 0.61, width * 0.43, height * 0.6, PALETTE.panelBlue, PALETTE.green);
        this.add.text(width * 0.72, 215, "Base de montagem", { 
            fontSize: "21px", fontFamily: "Arial Black", color: "#0f766e", stroke: "#ffffff", strokeThickness: 5
        }).setOrigin(0.5).setDepth(3);
    }

    private createTitle(width: number) {
        this.drawPill(width / 2, 160, 720, 44, 0xffffff, 0x7dd3fc, 4).setDepth(7);
        this.add.text(width / 2, 160, "Arraste cada parte do Medabot seguindo a ordem da trilha.", { 
            fontSize: "17px", fontFamily: "Arial Black", color: PALETTE.ink, align: "center", wordWrap: { width: 660 }
        }).setOrigin(0.5).setDepth(8);
    }

    private createTimerBar(width: number) {
        this.drawPill(width / 2, TIMER_BAR_Y, TIMER_BAR_W + 22, 30, 0xffffff, 0x6c63ff, 5).setDepth(5);
        this.timerBar = this.add.rectangle(width / 2 - TIMER_BAR_W / 2, TIMER_BAR_Y, TIMER_BAR_W, 15, PALETTE.green).setOrigin(0, 0.5).setDepth(6);
        this.add.text(width / 2, TIMER_BAR_Y - 28, "Tempo da aventura", { fontSize: "14px", fontFamily: "Arial Black", color: "#4f46e5" }).setOrigin(0.5).setDepth(6);
    }

    private setupBoard(width: number) {
        const level = LEVELS[this.currentLevelIdx];
        
        const isLevel2 = level.steps.length === 6;
        const cardW = 320;
        const cardH = isLevel2 ? 65 : 100;
        const startY = isLevel2 ? 292 : 335;
        const spacingY = isLevel2 ? 70 : 115;

        const posX_Pecas = width * 0.28;
        const posX_Chassi = width * 0.72;

        level.steps.forEach((step, index) => {
            const y = startY + (index * spacingY);
            this.drawCard(posX_Chassi, y, cardW, cardH, 0xf8fbff, PALETTE.purple);
            const slotBox = this.add.rectangle(posX_Chassi, y, cardW, cardH, 0xffffff, 0.02).setStrokeStyle(3, PALETTE.purple);
            
            this.add.circle(posX_Chassi - 112, y, isLevel2 ? 20 : 26, 0xffd166, 1).setStrokeStyle(3, 0xffffff);
            this.add.text(posX_Chassi - 112, y, `${index + 1}`, { fontSize: isLevel2 ? '20px' : '25px', color: '#ffffff', fontFamily: 'Arial Black', stroke: '#b45309', strokeThickness: 3 }).setOrigin(0.5);
            this.add.text(posX_Chassi + 32, y, `Lugar da\n${step.label.toUpperCase()}`, { 
                fontSize: isLevel2 ? '11px' : '13px', color: '#415174', fontFamily: 'Arial Black', align: 'left' 
            }).setOrigin(0.5);

            slotBox.setData('stepId', step.id).setInteractive().input.dropZone = true;
        });

        const shuffledParts = [...level.steps].sort(() => Math.random() - 0.5);
        
        shuffledParts.forEach((part, index) => {
            const y = startY + (index * spacingY);
            const container = this.add.container(posX_Pecas, y);
            const itemShadow = this.add.graphics();
            itemShadow.fillStyle(0x9a7b3f, 0.2);
            itemShadow.fillRoundedRect(-cardW / 2 + 7, -cardH / 2 + 8, cardW, cardH, 22);
            const itemCard = this.add.graphics();
            itemCard.fillStyle(0xffffff, 1);
            itemCard.lineStyle(4, PALETTE.orange, 1);
            itemCard.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
            itemCard.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
            const itemBg = this.add.rectangle(0, 0, cardW, cardH, 0xffffff, 0.02).setStrokeStyle(4, PALETTE.orange);
            
            const sprite = this.add.sprite(-90, 0, part.assetKey).setDisplaySize(isLevel2 ? 55 : 80, isLevel2 ? 55 : 80);
            this.tweens.add({ targets: sprite, angle: 3, duration: 950 + index * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

            const txt = this.add.text(35, 0, part.label, { 
                fontSize: isLevel2 ? '13px' : '15px', color: PALETTE.ink, fontFamily: 'Arial Black', align: 'center', wordWrap: { width: cardW - 130 } 
            }).setOrigin(0.5); 

            container.add([itemShadow, itemCard, itemBg, sprite, txt]);
            container.setData('stepId', part.id);
            
            itemBg.setInteractive({ draggable: true, useHandCursor: true });
            this.setupDrag(itemBg, container);
        });
    }

    private setupDrag(handle: Phaser.GameObjects.Rectangle, container: Phaser.GameObjects.Container) {
        this.input.setDraggable(handle);
        
        handle.on('drag', (pointer: any) => { 
            container.setPosition(pointer.x, pointer.y); 
        });

        handle.on('dragend', (pointer: any, dropped: boolean) => {
            if (!dropped) {
                this.tweens.add({ 
                    targets: container, 
                    x: container.input?.dragStartX || 0, 
                    y: container.input?.dragStartY || 0, 
                    duration: 250, 
                    ease: 'Power2' 
                });
            }
        });

        this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
            if (gameObject !== handle) return;
            
            const targetStepId = dropZone.getData('stepId');
            const partStepId = container.getData('stepId');

            if (targetStepId === this.nextStepRequired && partStepId === this.nextStepRequired) {
                container.setPosition(dropZone.x, dropZone.y);
                handle.disableInteractive();
                dropZone.setStrokeStyle(5, 0x22c55e); 
                this.add.circle(dropZone.x + 130, dropZone.y - 22, 18, 0x22c55e).setDepth(20);
                this.add.text(dropZone.x + 130, dropZone.y - 22, "OK", { fontSize: '13px', color: '#ffffff', fontFamily: 'Arial Black' }).setOrigin(0.5).setDepth(21);
                this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 130, yoyo: true, ease: 'Back.easeOut' });
                
                this.playCorrect();
                this.nextStepRequired++;
                this.placedCount++;
                
                this.updateUIMetrics();
                this.emitPlatformEvent("CHECKPOINT");

                if (this.placedCount === LEVELS[this.currentLevelIdx].steps.length) {
                    this.handleLevelWin();
                }
            } else {
                this.wrongCount++;
                this.updateUIMetrics();
                this.cameras.main.shake(150, 0.01);
                this.playWrong();
                this.emitPlatformEvent("WRONG_ANSWER");

                this.tweens.add({ 
                    targets: container, 
                    x: container.input?.dragStartX || 0, 
                    y: container.input?.dragStartY || 0, 
                    duration: 250, 
                    ease: 'Power2' 
                });
            }
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
        const title = this.add.text(width / 2, height * 0.16, "Trilha completa!", { fontSize: '48px', fontFamily: 'Arial Black', color: '#4f46e5', stroke: '#ffffff', strokeThickness: 8 }).setOrigin(0.5);
        
        const finalImage = this.add.image(width / 2, height * 0.45, 'robot_kbt_full_v2').setDisplaySize(350, 500);
        this.tweens.add({ targets: finalImage, y: "-=12", duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        
        const glow = this.add.circle(width / 2, height * 0.48, 150, 0xffd166, 0.35).setDepth(-1);
        container.add(glow);

        const btnColor = isLastLevel ? 0x10b981 : PALETTE.orange;
        const btnLabel = isLastLevel ? "FINALIZAR AVENTURA" : "PROXIMA TRILHA";
        const button = this.add.rectangle(width / 2, height * 0.82, 550, 85, btnColor).setStrokeStyle(5, 0xffffff).setInteractive({ useHandCursor: true });
        const buttonText = this.add.text(width / 2, height * 0.82, btnLabel, { fontSize: '24px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);

        container.add([overlay, title, finalImage, button, buttonText]);

        button.on('pointerdown', () => {
            this.playClick();
            if (!isLastLevel) {
                this.scene.restart({ levelIndex: this.currentLevelIdx + 1 });
            } else {
                this.emitPlatformEvent("FINISH_GAME");
                window.location.href = '/';
            }
        });
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: LEVELS[this.currentLevelIdx].timeLimit * 1000,
            callback: () => { 
                this.emitPlatformEvent("GAME_OVER"); 
                this.showGameOverScreen();
            }
        });
    }

    private showGameOverScreen() {
        const { width, height } = this.scale;
        const container = this.add.container(0, 0).setDepth(3000);
        
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x312e81, 0.86);
        const title = this.add.text(width / 2, height * 0.4, "O tempo acabou!", { fontSize: '42px', fontFamily: 'Arial Black', color: '#ffffff', stroke: '#ff6fb1', strokeThickness: 7 }).setOrigin(0.5);
        
        const btnBg = this.add.rectangle(width / 2, height * 0.6, 460, 85, PALETTE.orange).setStrokeStyle(5, 0xffffff).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(width / 2, height * 0.6, "TENTAR DE NOVO", { fontSize: '26px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);
        
        container.add([bg, title, btnBg, btnText]);
        
        btnBg.on('pointerdown', () => { 
            this.playClick(); 
            this.scene.restart({ levelIndex: this.currentLevelIdx }); 
        });
    }

    private drawRoundedPanel(x: number, y: number, w: number, h: number, fill: number, stroke: number) {
        const shadow = this.add.graphics();
        shadow.fillStyle(PALETTE.shadow, 0.16);
        shadow.fillRoundedRect(x - w / 2 + 10, y - h / 2 + 12, w, h, 30);
        const panel = this.add.graphics();
        panel.fillStyle(fill, 0.96);
        panel.lineStyle(5, stroke, 0.8);
        panel.fillRoundedRect(x - w / 2, y - h / 2, w, h, 30);
        panel.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 30);
        return panel;
    }

    private drawCard(x: number, y: number, w: number, h: number, fill: number, stroke: number) {
        const shadow = this.add.graphics();
        shadow.fillStyle(PALETTE.shadow, 0.14);
        shadow.fillRoundedRect(x - w / 2 + 6, y - h / 2 + 7, w, h, 22);
        const card = this.add.graphics();
        card.fillStyle(fill, 1);
        card.lineStyle(4, stroke, 0.75);
        card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 22);
        card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 22);
        return card;
    }

    private drawPill(x: number, y: number, w: number, h: number, fill: number, stroke: number, lineWidth = 3) {
        const pill = this.add.graphics();
        pill.fillStyle(fill, 1);
        pill.lineStyle(lineWidth, stroke, 1);
        pill.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        pill.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        return pill;
    }

    private drawMedabotLab(width: number, height: number) {
        this.add.rectangle(width / 2, height / 2, width, height, PALETTE.labWall);
        this.add.rectangle(width / 2, height * 0.64, width, height * 0.72, PALETTE.skyBottom, 0.45);

        for (let x = 60; x < width; x += 120) {
            this.add.line(x, height * 0.76, 0, 0, 70, 58, 0xffffff, 0.35).setLineWidth(4);
            this.add.line(x + 70, height * 0.76, 0, 58, 70, 0, 0xffffff, 0.25).setLineWidth(4);
        }

        const topRail = this.add.graphics();
        topRail.fillStyle(0xffffff, 0.82);
        topRail.lineStyle(4, 0x7dd3fc, 0.9);
        topRail.fillRoundedRect(48, 82, width - 96, 54, 24);
        topRail.strokeRoundedRect(48, 82, width - 96, 54, 24);

        [0.18, 0.34, 0.66, 0.82].forEach((pct, index) => {
            const lamp = this.add.circle(width * pct, 110, 15, index % 2 === 0 ? PALETTE.boltYellow : PALETTE.boltBlue, 0.95);
            this.tweens.add({ targets: lamp, alpha: 0.42, duration: 750 + index * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        this.add.rectangle(width / 2, height * 0.88, width, 150, PALETTE.labFloor, 1);
        this.add.rectangle(width / 2, height * 0.77, width, 32, 0x7dd3fc, 0.55);
        this.addLabRobotCrew(width, height);
        this.drawGear(width * 0.49, height * 0.25, 32, PALETTE.purple, 0.22);
        this.drawGear(width * 0.54, height * 0.28, 22, PALETTE.orange, 0.22);
        this.addFloatingDecorations(undefined, width, height);
    }

    private addStartRobotCrew(width: number, height: number) {
        return [
            this.drawFloatingMedabotTile(width * 0.1, height * 0.2, 0.36, PALETTE.purple, -5),
            this.drawFloatingMedabotTile(width * 0.87, height * 0.23, 0.34, PALETTE.boltBlue, 5),
            this.drawFloatingMedabotTile(width * 0.14, height * 0.78, 0.38, PALETTE.pink, 4),
            this.drawFloatingMedabotTile(width * 0.35, height * 0.84, 0.34, PALETTE.orange, -2),
            this.drawFloatingMedabotTile(width * 0.61, height * 0.85, 0.34, PALETTE.green, 2),
            this.drawFloatingMedabotTile(width * 0.82, height * 0.77, 0.38, PALETTE.boltYellow, -4)
        ];
    }

    private drawFloatingMedabotTile(x: number, y: number, scale: number, accent: number, angle: number) {
        const tile = this.add.container(x, y);
        const shadow = this.add.graphics();
        shadow.fillStyle(PALETTE.purple, 0.12);
        shadow.fillRoundedRect(-54 * scale + 8, -54 * scale + 10, 108 * scale, 108 * scale, 22 * scale);
        const card = this.add.graphics();
        card.fillStyle(0xffffff, 0.84);
        card.lineStyle(3 * scale, 0xffffff, 0.96);
        card.fillRoundedRect(-54 * scale, -54 * scale, 108 * scale, 108 * scale, 22 * scale);
        card.strokeRoundedRect(-54 * scale, -54 * scale, 108 * scale, 108 * scale, 22 * scale);
        const bot = this.drawMedabotBuddy(0, 10 * scale, scale * 0.7, accent);
        bot.removeFromDisplayList();
        tile.add([shadow, card, bot]);
        tile.setAngle(angle);
        this.tweens.add({ targets: tile, y: y - 12, angle: angle * -1, duration: 1800 + Math.abs(angle) * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        return tile;
    }

    private addLabRobotCrew(width: number, height: number) {
        const specs = [
            { x: 0.08, y: 0.49, s: 0.6, c: PALETTE.boltYellow, capsule: true },
            { x: 0.92, y: 0.49, s: 0.6, c: PALETTE.boltRed, capsule: true },
            { x: 0.16, y: 0.71, s: 0.38, c: PALETTE.orange },
            { x: 0.84, y: 0.71, s: 0.38, c: PALETTE.green },
            { x: 0.06, y: 0.28, s: 0.34, c: PALETTE.boltBlue },
            { x: 0.94, y: 0.28, s: 0.34, c: PALETTE.pink }
        ];

        specs.forEach((spec) => {
            if (spec.capsule) {
                this.drawMedabotCapsule(width * spec.x, height * 0.48, 0.72);
            }

            this.drawMedabotBuddy(width * spec.x, height * spec.y, spec.s, spec.c);
        });
    }

    private drawMedabotCapsule(x: number, y: number, scale: number) {
        const capsule = this.add.container(x, y);
        const glow = this.add.ellipse(0, 0, 110 * scale, 190 * scale, 0xffffff, 0.34);
        const glass = this.add.graphics();
        glass.fillStyle(0xbff4ff, 0.4);
        glass.lineStyle(5 * scale, 0xffffff, 0.75);
        glass.fillRoundedRect(-52 * scale, -90 * scale, 104 * scale, 180 * scale, 42 * scale);
        glass.strokeRoundedRect(-52 * scale, -90 * scale, 104 * scale, 180 * scale, 42 * scale);
        const base = this.add.rectangle(0, 94 * scale, 130 * scale, 28 * scale, PALETTE.purple, 0.85).setStrokeStyle(3 * scale, 0xffffff, 0.8);
        capsule.add([glow, glass, base]);
        this.tweens.add({ targets: glow, alpha: 0.18, duration: 980, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        return capsule;
    }

    private drawMedabotBuddy(x: number, y: number, scale: number, accent: number) {
        const bot = this.add.container(x, y);
        const shadow = this.add.ellipse(0, 82 * scale, 92 * scale, 22 * scale, PALETTE.shadow, 0.16);
        const head = this.add.circle(0, -42 * scale, 40 * scale, PALETTE.boltYellow, 1).setStrokeStyle(5 * scale, 0xffffff, 0.95);
        const crest = this.add.triangle(0, -91 * scale, 0, 0, 28 * scale, 40 * scale, -28 * scale, 40 * scale, accent, 1).setStrokeStyle(3 * scale, 0xffffff, 0.9);
        const eyeL = this.add.circle(-14 * scale, -46 * scale, 6 * scale, 0x1f2a5c, 1);
        const eyeR = this.add.circle(14 * scale, -46 * scale, 6 * scale, 0x1f2a5c, 1);
        const smile = this.add.arc(0, -33 * scale, 13 * scale, 0, 180, false, 0x1f2a5c, 1).setAngle(180).setStrokeStyle(3 * scale, 0x1f2a5c, 1);
        const body = this.add.rectangle(0, 24 * scale, 70 * scale, 74 * scale, accent, 1).setStrokeStyle(5 * scale, 0xffffff, 0.95);
        const core = this.add.circle(0, 18 * scale, 16 * scale, 0xffffff, 0.95).setStrokeStyle(3 * scale, PALETTE.boltBlue, 1);
        const armL = this.add.rectangle(-50 * scale, 18 * scale, 22 * scale, 58 * scale, 0xffffff, 1).setStrokeStyle(4 * scale, accent, 0.9);
        const armR = this.add.rectangle(50 * scale, 18 * scale, 22 * scale, 58 * scale, 0xffffff, 1).setStrokeStyle(4 * scale, accent, 0.9);
        const footL = this.add.ellipse(-22 * scale, 68 * scale, 42 * scale, 18 * scale, PALETTE.boltBlue, 1);
        const footR = this.add.ellipse(22 * scale, 68 * scale, 42 * scale, 18 * scale, PALETTE.boltBlue, 1);
        bot.add([shadow, crest, head, eyeL, eyeR, smile, armL, armR, body, core, footL, footR]);
        this.tweens.add({ targets: bot, y: y - 8 * scale, duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        return bot;
    }

    private drawGear(x: number, y: number, radius: number, color: number, alpha: number) {
        const gear = this.add.container(x, y);
        for (let i = 0; i < 8; i++) {
            const tooth = this.add.rectangle(0, -radius, radius * 0.38, radius * 0.6, color, alpha);
            tooth.setRotation((Math.PI / 4) * i);
            gear.add(tooth);
        }
        gear.add(this.add.circle(0, 0, radius, color, alpha));
        gear.add(this.add.circle(0, 0, radius * 0.42, PALETTE.labWall, 0.55));
        this.tweens.add({ targets: gear, angle: 360, duration: 9000, repeat: -1 });
        return gear;
    }

    private addCloud(x: number, y: number, scale: number) {
        const cloud = this.add.container(x, y);
        const parts = [
            this.add.circle(-48 * scale, 8 * scale, 28 * scale, 0xffffff, 0.9),
            this.add.circle(-18 * scale, -10 * scale, 38 * scale, 0xffffff, 0.95),
            this.add.circle(24 * scale, 0, 32 * scale, 0xffffff, 0.92),
            this.add.ellipse(0, 18 * scale, 130 * scale, 42 * scale, 0xffffff, 0.9)
        ];
        cloud.add(parts);
        this.tweens.add({ targets: cloud, x: x + 22 * scale, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    private addFloatingDecorations(container: Phaser.GameObjects.Container | undefined, width: number, height: number) {
        const specs = [
            { x: width * 0.08, y: height * 0.28, c: PALETTE.pink, s: 18 },
            { x: width * 0.92, y: height * 0.34, c: PALETTE.orange, s: 22 },
            { x: width * 0.18, y: height * 0.84, c: PALETTE.purple, s: 16 },
            { x: width * 0.82, y: height * 0.78, c: PALETTE.green, s: 20 }
        ];
        specs.forEach((spec, index) => {
            const shape = this.add.star(spec.x, spec.y, 5, spec.s * 0.45, spec.s, spec.c, 0.75);
            container?.add(shape);
            this.tweens.add({ targets: shape, y: spec.y - 16, angle: 18, duration: 1300 + index * 220, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });
    }

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

    private playClick() { this.playTone(580, 0.06, "sine", 0.12); }
    private playCorrect() { this.playTone(880, 0.12, "triangle", 0.18); } 
    private playWrong() { this.playTone(110, 0.35, "sawtooth", 0.2); } 
}
