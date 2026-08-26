import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, CSS } from '../data/theme'
import { UI_BAR_H, W } from '../data/layout'

export interface MissionUpdatePayload {
    level: number
    challengeIndex: number
    totalChallenges: number
    instruction: string
}

export class UIScene extends Phaser.Scene {
    private instructionText!: Phaser.GameObjects.Text
    private levelText!: Phaser.GameObjects.Text
    private dotsG!: Phaser.GameObjects.Graphics
    private total = 4
    private current = 0

    constructor() {
        super({ key: 'UIScene' })
    }

    create() {
        EventBus.off('mission-update')

        this.buildBar()
        this.registerListeners()

        const cleanup = () => EventBus.off('mission-update', undefined, this)
        this.events.once('shutdown', cleanup)
        this.events.once('destroy', cleanup)
    }

    private buildBar() {
        const mid = UI_BAR_H / 2

        const bar = this.add.graphics().setDepth(0)
        bar.fillStyle(C.preto, 0.6)
        bar.fillRect(0, UI_BAR_H, W, 8)
        bar.fillStyle(C.escuro, 1)
        bar.fillRect(0, 0, W, UI_BAR_H)
        bar.fillStyle(C.medio, 0.6)
        bar.fillRect(0, 0, W, 6)
        bar.fillStyle(C.ouro, 0.95)
        bar.fillRect(0, UI_BAR_H - 4, W, 4)

        this.add.image(42, mid, 'icone-gabinete')
            .setDisplaySize(46, 46)
            .setDepth(1)

        this.add.text(78, mid, 'Monte seu Computador', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '23px',
            color: CSS.creme,
            stroke: CSS.preto,
            strokeThickness: 5,
        }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

        this.instructionText = this.add.text(W / 2, mid, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '19px',
            color: CSS.ouro,
            stroke: CSS.preto,
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 520 },
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        this.levelText = this.add.text(1116, mid - 13, 'Nível 1 de 3', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '17px',
            color: CSS.claro,
            stroke: CSS.preto,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        this.dotsG = this.add.graphics().setDepth(1)
        this.paintDots()

        this.buildIconButton(1240, mid, '?', () => EventBus.emit('show-tutorial'))
    }

    private paintDots() {
        const g = this.dotsG
        const y = UI_BAR_H / 2 + 16
        const gap = 24
        const startX = 1116 - ((this.total - 1) * gap) / 2

        g.clear()
        for (let i = 0; i < this.total; i++) {
            const x = startX + i * gap
            const done = i < this.current
            const now = i === this.current

            g.fillStyle(C.preto, 0.7)
            g.fillCircle(x, y + 2, now ? 9 : 7)
            g.fillStyle(now ? C.ouro : done ? C.verde : C.apagado, 1)
            g.fillCircle(x, y, now ? 8 : 6)
            g.fillStyle(0xffffff, 0.4)
            g.fillCircle(x - 2, y - 2, now ? 3 : 2)
        }
    }

    private buildIconButton(x: number, y: number, label: string, onClick: () => void) {
        const s = 48
        const g = this.add.graphics().setDepth(1)

        const paint = (hover: boolean) => {
            g.clear()
            g.fillStyle(C.preto, 0.7)
            g.fillRoundedRect(x - s / 2, y - s / 2 + 5, s, s, 15)
            g.fillStyle(hover ? C.claro : C.medio, 1)
            g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 15)
            g.fillStyle(0xffffff, 0.16)
            g.fillRoundedRect(x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.34, 9)
            g.lineStyle(3, C.ouro, 0.9)
            g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 15)
        }
        paint(false)

        const text = this.add.text(x, y, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '26px',
            color: CSS.creme,
            stroke: CSS.preto,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(2).setResolution(2)

        const zone = this.add.zone(x, y, s + 8, s + 8)
            .setDepth(3)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => paint(true))
        zone.on('pointerout', () => paint(false))
        zone.on('pointerdown', () => {
            paint(true)
            this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
            onClick()
        })
        zone.on('pointerup', () => paint(false))
    }

    private registerListeners() {
        EventBus.on('mission-update', (data: MissionUpdatePayload) => {
            if (!this.scene.isActive()) return
            if (!this.instructionText?.active || !this.levelText?.active) return

            this.instructionText.setText(data.instruction)
            this.levelText.setText(`Nível ${data.level} de 3`)
            this.total = data.totalChallenges
            this.current = data.challengeIndex
            this.paintDots()
        }, this)
    }
}