import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, CSS } from '../data/theme'
import { UI_BAR_H, W } from '../data/layout'

export interface MissionUpdatePayload {
    level: number
    challengeIndex: number
    totalChallenges: number
    /** Frase curta do que fazer agora — muda conforme o modo do desafio. */
    instruction: string
}

export class UIScene extends Phaser.Scene {
    private instructionText!: Phaser.GameObjects.Text
    private levelText!: Phaser.GameObjects.Text
    private dots: Phaser.GameObjects.Graphics[] = []

    constructor() {
        super({ key: 'UIScene' })
    }

    create() {
        this.buildBar()
        this.registerListeners()

        this.events.once('shutdown', () => {
            EventBus.off('mission-update', undefined, this)
            this.dots.forEach(d => d.destroy())
            this.dots = []
        })
    }

    private buildBar() {
        const mid = UI_BAR_H / 2

        const bar = this.add.graphics().setDepth(0)
        bar.fillStyle(C.borda, 0.96)
        bar.fillRect(0, 0, W, UI_BAR_H)
        bar.fillStyle(C.escuro, 0.5)
        bar.fillRect(0, 0, W, 6)
        bar.fillStyle(C.amarelo, 0.85)
        bar.fillRect(0, UI_BAR_H - 3, W, 3)

        // ── Identidade, à esquerda ──
        this.add.image(38, mid, 'robot')
            .setDisplaySize(40, 40)
            .setDepth(1)

        this.add.text(68, mid, 'Labirinto do Enquanto', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: CSS.creme,
            stroke: CSS.borda,
            strokeThickness: 4,
        }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

        // ── Instrução do momento, no centro ──
        this.instructionText = this.add.text(W / 2, mid - 10, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: CSS.amarelo,
            stroke: CSS.borda,
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        // ── Nível e ajuda, à direita ──
        this.levelText = this.add.text(1120, mid, 'Nível 1 de 3', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: CSS.claro,
            stroke: CSS.borda,
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        this.buildIconButton(1240, mid, '?', () => EventBus.emit('show-tutorial'))
    }

    private buildIconButton(x: number, y: number, label: string, onClick: () => void) {
        const g = this.add.graphics().setDepth(1)
        const paint = (hover: boolean) => {
            g.clear()
            g.fillStyle(hover ? C.normal : C.escuro, 1)
            g.fillRoundedRect(x - 26, y - 26, 52, 52, 14)
            g.lineStyle(3, C.claro, 0.9)
            g.strokeRoundedRect(x - 26, y - 26, 52, 52, 14)
        }
        paint(false)

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: CSS.creme,
        }).setOrigin(0.5).setDepth(2).setResolution(2)

        const zone = this.add.zone(x, y, 52, 52)
            .setDepth(3)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => paint(true))
        zone.on('pointerout', () => paint(false))
        zone.on('pointerdown', () => {
            this.tweens.add({ targets: text, scale: 0.9, duration: 70, yoyo: true })
            onClick()
        })

        return { g, text, zone }
    }

    private onMissionUpdate = (data: MissionUpdatePayload): void => {
        if (!this.scene.isActive()) return
        if (!this.instructionText?.active || !this.levelText?.active) return
        this.instructionText.setText(data.instruction)
        this.levelText.setText(`Nível ${data.level} de 3`)
    }

    private registerListeners(): void {
        EventBus.on('mission-update', this.onMissionUpdate, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off('mission-update', this.onMissionUpdate, this)
        })
    }
}   