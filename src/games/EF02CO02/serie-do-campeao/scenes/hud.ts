import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createTimeBar } from '../../../../shared/hud/createTimeBar'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    onHelp: () => void
    onTimeOut: () => void
    time: number
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.26)
    bar.fillRoundedRect(HUD.x, HUD.y + 9, HUD.w, HUD.h, HUD.r)
    bar.fillStyle(C.woodDark, 1)
    bar.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
    bar.fillStyle(C.cream, 1)
    bar.fillRoundedRect(HUD.x + 6, HUD.y + 6, HUD.w - 12, HUD.h - 16, HUD.r - 6)
    bar.fillStyle(C.white, 0.66)
    bar.fillRoundedRect(HUD.x + 24, HUD.y + 14, HUD.w - 48, 15, 8)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.tealDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.teal, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 14, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.34)
    pill.fillRoundedRect(HUD.pillX + 14, HUD.pillY + 9, HUD.pillW - 28, 10, 5)

    const level = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, '', {
        fontFamily: FONT.black,
        fontSize: '19px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    level.setStroke(CSS.ink, 5)

    const medals = scene.add.graphics()

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black,
        fontSize: '25px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body,
        fontStyle: 'bold',
        fontSize: '18px',
        color: CSS.inkSoft,
        align: 'center',
        wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.creamDeep, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    helpG.lineStyle(5, C.woodDark, 1)
    helpG.strokeCircle(0, 0, HUD.helpR)

    const helpText = scene.add.text(HUD.helpX, HUD.cy + 1, '?', {
        fontFamily: FONT.black,
        fontSize: '28px',
        color: CSS.ink,
    }).setOrigin(0.5).setResolution(2)

    const timer = createTimeBar(scene, {
        cx: HUD.timeCx,
        cy: HUD.cy,
        w: HUD.timeW,
        h: HUD.timeH,
        duration: options.time,
        iconR: 12,
        theme: {
            track: C.woodDark,
            trackAlpha: 0.3,
            shadow: C.ink,
            shadowAlpha: 0.2,
            border: C.woodDark,
            borderAlpha: 0.55,
            fill: C.teal,
            warn: C.amber,
            danger: C.bad,
            idle: C.creamEdge,
            icon: C.woodDark,
            gloss: C.white,
            glossAlpha: 0.42,
        },
        onEmpty: options.onTimeOut,
    })

    root.add([bar, pill, level, medals, title, hint, timer.container, helpG, helpText])

    const zone = scene.add.zone(HUD.helpX, HUD.cy, HUD.helpR * 2.4, HUD.helpR * 2.4)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, helpG)
        options.onHelp()
    })

    const edge = scene.add.graphics().setDepth(DEPTH.edge).setAlpha(0)

    let total = 3
    let done = 0
    let calm = ''

    const medalX = (i: number) => HUD.medalX + i * HUD.medalGap

    const star = (x: number, y: number, r: number, color: number) => {
        const points: Phaser.Geom.Point[] = []
        for (let i = 0; i < 10; i++) {
            const a = Phaser.Math.DegToRad(-90 + i * 36)
            const rad = i % 2 === 0 ? r : r * 0.45
            points.push(new Phaser.Geom.Point(x + Math.cos(a) * rad, y + Math.sin(a) * rad))
        }
        medals.fillStyle(color, 1)
        medals.fillPoints(points, true)
    }

    const paintMedals = () => {
        const r = HUD.medalR
        medals.clear()
        for (let i = 0; i < total; i++) {
            const x = medalX(i)
            medals.fillStyle(C.ink, 1)
            medals.fillCircle(x, HUD.cy, r + 3)
            if (i < done) {
                medals.fillStyle(C.goldDark, 1)
                medals.fillCircle(x, HUD.cy, r)
                medals.fillStyle(C.gold, 1)
                medals.fillCircle(x, HUD.cy - 2, r - 2)
                star(x, HUD.cy - 2, r * 0.62, C.woodDark)
            } else {
                medals.fillStyle(C.creamEdge, 1)
                medals.fillCircle(x, HUD.cy, r)
                medals.fillStyle(C.creamDeep, 1)
                medals.fillCircle(x, HUD.cy - 2, r - 2)
            }
        }
    }

    paintMedals()

    return {
        setLevel(value: number, levels: number) {
            level.setText(`NÍVEL ${value} de ${levels}`)
        },

        setTotal(count: number) {
            total = count
            done = 0
            paintMedals()
        },

        setTitle(text: string) {
            title.setText(text)
        },

        setHint(text: string) {
            calm = text
            hint.setColor(CSS.inkSoft).setText(text)
        },

        /** O recado de erro mora aqui: no meio da tela ele tapava o atleta. */
        alert(text: string) {
            hint.setColor(CSS.bad).setText(text)
            scene.tweens.add({
                targets: hint,
                scale: 1.12,
                duration: FX.ms(scene, 160),
                yoyo: true,
                ease: 'Sine.easeOut',
            })
            scene.time.delayedCall(FX.ms(scene, 1400), () => {
                if (hint.text !== text) return
                hint.setColor(CSS.inkSoft).setText(calm)
            })
        },

        async award(count: number) {
            done = Phaser.Math.Clamp(count, 0, total)
            paintMedals()
            await FX.ping(scene, medalX(done - 1), HUD.cy, C.gold, {
                radius: 30,
                duration: 460,
            })
        },

        tick(delta: number) {
            timer.tick(delta)
        },

        setRunning(on: boolean) {
            timer.setRunning(on)
        },

        resetTime(ms?: number) {
            timer.reset(ms)
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(22, color, 1)
            edge.strokeRoundedRect(11, 11, W - 22, H - 22, 30)
            edge.setAlpha(0.9)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            timer.destroy()
            root.destroy(true)
            zone.destroy()
            edge.destroy()
        },
    }
}
