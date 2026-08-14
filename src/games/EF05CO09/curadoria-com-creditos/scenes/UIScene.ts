import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, SEAL_COLOR, hex } from '../data/theme'

const W = 1280

interface HudData {
    instruction: string
    sub: string
    level: number
    phase: number
    totalPhases: number
}

interface TallyData {
    verde: number
    amarelo: number
    vermelho: number
    total: number
}

export class UIScene extends Phaser.Scene {
    private plate!: Phaser.GameObjects.Graphics
    private instructionText!: Phaser.GameObjects.Text
    private subText!: Phaser.GameObjects.Text
    private levelText!: Phaser.GameObjects.Text
    private phaseText!: Phaser.GameObjects.Text

    private tallyLayer!: Phaser.GameObjects.Graphics
    private tallyTexts: Phaser.GameObjects.Text[] = []
    private tally: TallyData = { verde: 0, amarelo: 0, vermelho: 0, total: 0 }

    private spoolTrack!: Phaser.GameObjects.Graphics
    private spoolThread!: Phaser.GameObjects.Graphics
    private spoolTween?: Phaser.Tweens.Tween
    private spoolState = { p: 1 }

    private helpBtn!: Phaser.GameObjects.Container

    constructor() {
        super({ key: 'UIScene' })
    }

    create() {
        this.plate = this.add.graphics()
        this.drawPlate()

        this.levelText = this.add.text(56, 34, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.paper),
        }).setOrigin(0, 0.5).setResolution(2)

        this.phaseText = this.add.text(56, 60, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '15px',
            color: hex(C.paper),
        }).setOrigin(0, 0.5).setResolution(2)

        this.instructionText = this.add.text(W / 2 - 120, 44, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: hex(C.blueDark),
            stroke: '#ffffff',
            strokeThickness: 7,
            align: 'center',
            wordWrap: { width: 660 },
        }).setOrigin(0.5).setResolution(2)

        this.subText = this.add.text(W / 2 - 70, 88, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '22px',
            color: hex(C.inkSoft),
            stroke: '#ffffff',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: 640 },
        }).setOrigin(0.5).setResolution(2)

        this.tallyLayer = this.add.graphics()
        this.buildTally()

        this.spoolTrack = this.add.graphics()
        this.spoolThread = this.add.graphics()

        this.helpBtn = this.buildHelpButton()
        this.helpBtn.setVisible(false)

        this.registry.events.on('setdata-hud', (_p: unknown, data: HudData) => this.applyHud(data))
        this.registry.events.on('changedata-hud', (_p: unknown, data: HudData) => this.applyHud(data))
        this.registry.events.on('setdata-tally', (_p: unknown, data: TallyData) => this.applyTally(data))
        this.registry.events.on('changedata-tally', (_p: unknown, data: TallyData) => this.applyTally(data))

        EventBus.on('spool-start', this.startSpool, this)
        EventBus.on('spool-stop', this.stopSpool, this)
        EventBus.on('tutorial-ready', this.revealHelp, this)
        EventBus.on('seal-pulse', this.pulseTally, this)

        this.syncFromRegistry()
        this.time.delayedCall(0, () => this.syncFromRegistry())
        EventBus.emit('ui-ready')
    }

    private syncFromRegistry() {
        const hud = this.registry.get('hud') as HudData | undefined
        if (hud) this.applyHud(hud)
        const tally = this.registry.get('tally') as TallyData | undefined
        if (tally) this.applyTally(tally)
    }

    shutdown() {
        this.stopSpool()
        this.registry.events.off('setdata-hud')
        this.registry.events.off('changedata-hud')
        this.registry.events.off('setdata-tally')
        this.registry.events.off('changedata-tally')
        EventBus.off('spool-start', this.startSpool, this)
        EventBus.off('spool-stop', this.stopSpool, this)
        EventBus.off('tutorial-ready', this.revealHelp, this)
        EventBus.off('seal-pulse', this.pulseTally, this)
    }

    update() {
        if (this.spoolTween) this.drawSpool(this.spoolState.p)
    }

    private drawPlate() {
        const g = this.plate
        g.fillStyle(C.easelDark, 1)
        g.fillRoundedRect(26, 20, 212, 58, { tl: 16, tr: 26, bl: 16, br: 26 })
        g.fillStyle(C.easel, 1)
        g.fillRoundedRect(26, 16, 212, 58, { tl: 16, tr: 26, bl: 16, br: 26 })
        g.fillStyle(C.white, 0.16)
        g.fillRoundedRect(34, 22, 196, 18, 9)
        g.fillStyle(C.paper, 0.9)
        g.fillCircle(40, 45, 5)
    }

    private buildTally() {
        const labels: Array<'verde' | 'amarelo' | 'vermelho'> = ['verde', 'amarelo', 'vermelho']
        const startX = 1004

        labels.forEach((id, i) => {
            const x = startX + i * 74
            const t = this.add.text(x + 16, 45, '0', {
                fontFamily: 'Arial Black, Arial',
                fontSize: '20px',
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)
            this.tallyTexts.push(t)
        })

        this.paintTally()
    }

    private paintTally() {
        const g = this.tallyLayer
        const labels: Array<'verde' | 'amarelo' | 'vermelho'> = ['verde', 'amarelo', 'vermelho']
        const startX = 1004

        g.clear()
        g.fillStyle(C.white, 0.9)
        g.fillRoundedRect(984, 20, 244, 52, 20)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(984, 20, 244, 52, 20)

        labels.forEach((id, i) => {
            const x = startX + i * 74
            const count = this.tally[id]
            const on = count > 0
            g.fillStyle(on ? SEAL_COLOR[id] : C.greySoft, 1)
            g.fillCircle(x, 46, 13)
            g.lineStyle(3, on ? SEAL_COLOR[id] : C.border, 1)
            g.strokeCircle(x, 46, 13)
            if (on) {
                g.fillStyle(C.white, 0.35)
                g.fillEllipse(x, 41, 16, 7)
            }
            this.tallyTexts[i].setText(String(count))
            this.tallyTexts[i].setColor(hex(on ? C.ink : C.grey))
        })
    }

    private applyTally = (data: TallyData) => {
        this.tally = data
        this.paintTally()
    }

    private pulseTally = () => {
        this.tweens.add({
            targets: this.tallyTexts,
            scale: 1.35,
            duration: 130,
            yoyo: true,
            ease: 'Quad.easeOut',
        })
    }

    private buildHelpButton() {
        const btn = this.add.container(948, 46)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(0, 5, 23)
        g.fillStyle(C.blue, 1)
        g.fillCircle(0, 0, 23)
        g.fillStyle(C.white, 0.24)
        g.fillEllipse(0, -9, 30, 14)
        const t = this.add.text(0, 0, '?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)
        btn.add([g, t])
        btn.setSize(54, 54)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
            EventBus.emit('show-tutorial')
        })
        return btn
    }

    private revealHelp = () => {
        this.helpBtn.setVisible(true)
    }

    private applyHud(data: HudData) {
        this.instructionText.setText(data.instruction)
        this.subText.setText(data.sub)
        this.levelText.setText(`NÍVEL ${data.level}`)
        this.phaseText.setText(`Mídia ${data.phase} de ${data.totalPhases}`)
    }

    private startSpool = (seconds: number) => {
        this.stopSpool()
        this.spoolState.p = 1

        this.spoolTrack.clear()
        this.spoolTrack.fillStyle(C.white, 0.9)
        this.spoolTrack.fillRoundedRect(258, 30, 300, 34, 17)
        this.spoolTrack.lineStyle(3, C.border, 1)
        this.spoolTrack.strokeRoundedRect(258, 30, 300, 34, 17)
        this.spoolTrack.fillStyle(C.easel, 1)
        this.spoolTrack.fillCircle(274, 47, 11)
        this.spoolTrack.lineStyle(3, C.easelDark, 1)
        this.spoolTrack.strokeCircle(274, 47, 11)

        this.drawSpool(1)

        this.spoolTween = this.tweens.add({
            targets: this.spoolState,
            p: 0,
            duration: seconds * 1000,
            ease: 'Linear',
            onComplete: () => {
                this.drawSpool(0)
                this.spoolTween = undefined
                EventBus.emit('spool-end')
            },
        })
    }

    private stopSpool = () => {
        this.spoolTween?.stop()
        this.spoolTween = undefined
        this.spoolTrack.clear()
        this.spoolThread.clear()
    }

    private drawSpool(p: number) {
        const clamped = Phaser.Math.Clamp(p, 0, 1)
        const len = 262 * clamped
        const color = clamped > 0.5 ? C.green : clamped > 0.25 ? C.amber : C.red

        this.spoolThread.clear()
        if (len <= 0) return

        this.spoolThread.lineStyle(7, color, 1)
        this.spoolThread.beginPath()
        this.spoolThread.moveTo(288, 47)
        for (let x = 0; x <= len; x += 6) {
            const wave = Math.sin((x / 26) + clamped * 8) * 4
            this.spoolThread.lineTo(288 + x, 47 + wave)
        }
        this.spoolThread.strokePath()

        this.spoolThread.fillStyle(color, 1)
        this.spoolThread.fillCircle(288 + len, 47, 7)
    }
}