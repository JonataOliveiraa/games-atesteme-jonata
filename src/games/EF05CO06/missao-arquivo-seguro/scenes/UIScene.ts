import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, CSS, A } from '../data/theme'
import { UI_BAR_H, W } from '../data/layout'

export interface MissionUpdatePayload {
    level: number
    phaseIndex: number
    totalPhases: number
    instruction: string
    sub: string
}

export class UIScene extends Phaser.Scene {
    private instructionText!: Phaser.GameObjects.Text
    private subText!: Phaser.GameObjects.Text
    private levelText!: Phaser.GameObjects.Text
    private dotsG!: Phaser.GameObjects.Graphics
    private helpBtn!: Phaser.GameObjects.Container

    private timerG!: Phaser.GameObjects.Graphics
    private timerTween?: Phaser.Tweens.Tween
    private timerState = { p: 1 }

    private total = 4
    private current = 0

    constructor() {
        super({ key: 'UIScene' })
    }

    create() {
        EventBus.off('mission-update')

        this.buildBar()
        this.registerListeners()

        const cleanup = () => {
            this.stopTimer()
            EventBus.off('mission-update', undefined, this)
            EventBus.off('timer-start', undefined, this)
            EventBus.off('timer-stop', undefined, this)
        }
        this.events.once('shutdown', cleanup)
        this.events.once('destroy', cleanup)
    }

    update() {
        if (this.timerTween) this.paintTimer(this.timerState.p)
    }

    private buildBar() {
        const bar = this.add.graphics().setDepth(0)
        bar.fillStyle(C.preto, A.sombra)
        bar.fillRect(0, UI_BAR_H, W, 8)
        bar.fillStyle(C.fundo, 1)
        bar.fillRect(0, 0, W, UI_BAR_H)

        this.add.image(46, 46, 'icone-app')
            .setDisplaySize(54, 54)
            .setDepth(1)

        this.levelText = this.add.text(84, 46, 'NÍVEL 1', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: CSS.ouro,
            stroke: CSS.preto,
            strokeThickness: 5,
        }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

        this.instructionText = this.add.text(W / 2, 34, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: CSS.creme,
            stroke: CSS.preto,
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 700 },
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        this.subText = this.add.text(W / 2, 66, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: CSS.ouro,
            stroke: CSS.preto,
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 760 },
        }).setOrigin(0.5).setDepth(1).setResolution(2)

        this.dotsG = this.add.graphics().setDepth(1)
        this.paintDots()

        this.timerG = this.add.graphics().setDepth(2)

        this.helpBtn = this.buildIconButton(1226, 46, '?', () => EventBus.emit('show-tutorial'))
        this.helpBtn.setVisible(false)
    }

    private paintDots() {
        const g = this.dotsG
        const y = 46
        const gap = 30
        const startX = 1128 - ((this.total - 1) * gap) / 2

        g.clear()
        for (let i = 0; i < this.total; i++) {
            const x = startX + i * gap
            const done = i < this.current
            const now = i === this.current

            g.fillStyle(C.preto, A.sombra)
            g.fillCircle(x, y + 3, now ? 12 : 9)
            g.fillStyle(C.creme, now || done ? 1 : A.apagado)
            g.fillCircle(x, y, now ? 11 : 9)

            if (now) {
                g.fillStyle(C.ouro, 1)
                g.fillCircle(x, y, 7)
            }
        }
    }

    private buildIconButton(x: number, y: number, label: string, onClick: () => void) {
        const s = 56
        const box = this.add.container(0, 0).setDepth(1)
        const g = this.add.graphics()

        const paint = (hover: boolean) => {
            g.clear()
            g.fillStyle(C.preto, A.sombra)
            g.fillRoundedRect(x - s / 2, y - s / 2 + 6, s, s, 17)
            g.fillStyle(hover ? C.ouro : C.fundo, 1)
            g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 17)
            g.lineStyle(4, C.ouro, 1)
            g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 17)
        }
        paint(false)

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '26px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const zone = this.add.zone(x, y, s + 10, s + 10)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => paint(true))
        zone.on('pointerout', () => paint(false))
        zone.on('pointerdown', () => {
            paint(true)
            this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
            onClick()
        })
        zone.on('pointerup', () => paint(false))

        box.add([g, text, zone])
        return box
    }

    private startTimer(seconds: number) {
        this.stopTimer()
        this.timerState.p = 1
        this.paintTimer(1)

        this.timerTween = this.tweens.add({
            targets: this.timerState,
            p: 0,
            duration: seconds * 1000,
            ease: 'Linear',
            onComplete: () => {
                this.paintTimer(0)
                this.timerTween = undefined
                EventBus.emit('timer-end')
            },
        })
    }

    private stopTimer() {
        this.timerTween?.stop()
        this.timerTween = undefined
        this.timerG?.clear()
    }

    private paintTimer(p: number) {
        const g = this.timerG
        const t = Phaser.Math.Clamp(p, 0, 1)
        const h = 10
        const y = UI_BAR_H - h

        g.clear()
        g.fillStyle(C.preto, A.trilho)
        g.fillRect(0, y, W, h)
        if (t <= 0) return
        g.fillStyle(C.ouro, t > 0.25 ? 1 : 0.55)
        g.fillRect(0, y, W * t, h)
    }

    private registerListeners() {
        EventBus.on('mission-update', (data: MissionUpdatePayload) => {
            if (!this.scene.isActive()) return
            if (!this.instructionText?.active) return

            this.instructionText.setText(data.instruction)
            this.subText.setText(data.sub)
            this.levelText.setText(`NÍVEL ${data.level}`)
            this.total = data.totalPhases
            this.current = data.phaseIndex
            this.paintDots()
        }, this)

        EventBus.on('timer-start', (seconds: number) => this.startTimer(seconds), this)
        EventBus.on('timer-stop', () => this.stopTimer(), this)

        EventBus.on('tutorial-ready', () => {
            if (this.helpBtn.visible) return
            this.helpBtn.setVisible(true).setAlpha(0)
            this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 260 })
        }, this)
    }
}