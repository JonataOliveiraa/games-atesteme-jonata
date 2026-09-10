import Phaser from 'phaser'
import { FX, Ease, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W, stampX } from '../data/layout'
import { C, CSS, FONT, SIZE, hex } from '../data/theme'

type StampState = 'empty' | 'current' | 'done'

interface Stamp {
    ring: Phaser.GameObjects.Graphics
    done?: boolean
}

function paintStamp(g: Phaser.GameObjects.Graphics, size: number, state: StampState) {
    const r = size / 2
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillCircle(0, 4, r)

    if (state === 'done') {
        g.fillStyle(C.ok, 1)
        g.fillCircle(0, 0, r)
        g.lineStyle(5, C.white, 1)
        g.strokeCircle(0, 0, r - 2)
        return
    }

    g.fillStyle(C.cream, state === 'current' ? 1 : 0.72)
    g.fillCircle(0, 0, r)
    g.lineStyle(5, state === 'current' ? C.oven : C.creamEdge, 1)
    g.strokeCircle(0, 0, r - 2)
    if (state === 'current') {
        g.fillStyle(C.oven, 0.32)
        g.fillCircle(0, 0, r - 11)
    }
}

export interface HudOptions {
    level: number
    totalLevels: number
    missions: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T) => {
        parts.push(o)
        return o
    }

    const pill = keep(scene.add.graphics().setDepth(DEPTH.hud))
    pill.fillStyle(C.ink, 0.24)
    pill.fillRoundedRect(HUD.levelX, HUD.cy - HUD.levelH / 2 + 5, HUD.levelW, HUD.levelH, 24)
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.levelX, HUD.cy - HUD.levelH / 2, HUD.levelW, HUD.levelH, 24)
    pill.fillStyle(C.oven, 1)
    pill.fillRoundedRect(HUD.levelX + 5, HUD.cy - HUD.levelH / 2 + 5, HUD.levelW - 10, HUD.levelH - 10, 19)
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(HUD.levelX + 14, HUD.cy - HUD.levelH / 2 + 10, HUD.levelW - 28, 12, 6)

    keep(scene.add.text(
        HUD.levelX + HUD.levelW / 2,
        HUD.cy,
        `NÍVEL ${options.level}`,
        { fontFamily: FONT.black, fontSize: SIZE.level, color: hex(C.ink) },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2))

    const stamps: Stamp[] = []
    for (let i = 0; i < options.missions; i++) {
        const ring = keep(
            scene.add.graphics().setPosition(stampX(i), HUD.cy).setDepth(DEPTH.hud + 1),
        )
        paintStamp(ring, HUD.stampSize, 'empty')
        stamps.push({ ring })
    }

    const help = keep(scene.add.graphics().setDepth(DEPTH.hud + 1))
    help.fillStyle(C.ink, 0.24)
    help.fillCircle(HUD.helpX, HUD.cy + 5, HUD.helpR)
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    help.fillStyle(C.cream, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR - 5)

    const helpLabel = keep(scene.add.text(HUD.helpX, HUD.cy - 1, '?', {
        fontFamily: FONT.black, fontSize: '32px', color: CSS.ink,
    }).setOrigin(0.5).setDepth(DEPTH.hud + 2).setResolution(2))

    const helpZone = keep(
        scene.add.zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
            .setDepth(DEPTH.hud + 3)
            .setInteractive({ useHandCursor: true }),
    )

    let enabled = true
    helpZone.on('pointerup', () => {
        if (!enabled) return
        void FX.press(scene, helpLabel)
        options.onHelp()
    })

    let pulse: Phaser.Tweens.Tween | null = null
    let toast: Phaser.GameObjects.Container | null = null

    return {
        setCurrent(index: number) {
            pulse?.remove()
            pulse = null
            stamps.forEach((stamp, i) => {
                if (stamp.done) return
                FX.kill(scene, stamp.ring)
                stamp.ring.setScale(1)
                paintStamp(stamp.ring, HUD.stampSize, i === index ? 'current' : 'empty')
                if (i === index) {
                    pulse = FX.breathe(scene, stamp.ring, { grow: 1.12, duration: 1000 })
                }
            })
        },

        /** O selo acende verde, e é só isso: a máquina não fica morando nele. */
        fill(index: number) {
            const stamp = stamps[index]
            if (!stamp || stamp.done) return

            pulse?.remove()
            pulse = null
            FX.kill(scene, stamp.ring)
            stamp.ring.setScale(1)
            paintStamp(stamp.ring, HUD.stampSize, 'done')
            stamp.done = true

            void FX.impact(scene, stamp.ring, 0.3)
        },

        stampPoint(index: number) {
            return { x: stampX(index), y: HUD.cy }
        },

        stampsBounds() {
            const last = stampX(options.missions - 1)
            const first = stampX(0)
            return {
                x: (first + last) / 2,
                y: HUD.cy,
                w: last - first + HUD.stampSize + 26,
                h: HUD.stampSize + 26,
            }
        },

        /** A frase curta do erro. Some sozinha. */
        async say(text: string) {
            toast?.destroy()

            const box = scene.add.container(W / 2, 232).setDepth(DEPTH.toast)
            const label = scene.add.text(0, 0, text, {
                fontFamily: FONT.black, fontSize: SIZE.toast, color: CSS.white,
            }).setOrigin(0.5).setResolution(2)

            const w = label.width + 62
            const h = 62
            const bg = scene.add.graphics()
            bg.fillStyle(C.ink, 0.3)
            bg.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 22)
            bg.fillStyle(C.badDark, 1)
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
            bg.fillStyle(C.bad, 1)
            bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 14, 18)

            box.add([bg, label])
            toast = box

            box.setAlpha(0).setScale(0.86)
            await FX.to(scene, box, { alpha: 1, scale: 1, y: 244 }, { duration: 260, ease: Ease.back(2) })
            await FX.wait(scene, 1300)
            await FX.to(scene, box, { alpha: 0, y: 220 }, { duration: 240 })
            box.destroy()
            if (toast === box) toast = null
        },

        /** O modo cena apaga a faixa inteira. */
        fade(alpha: number, ms: number) {
            return FX.to(scene, parts as FxTarget[], { alpha }, { duration: ms })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpZone.input!.enabled = value
        },

        destroy() {
            pulse?.remove()
            toast?.destroy()
            parts.forEach(part => part.destroy())
        },
    }
}

export type Hud = ReturnType<typeof createHud>
