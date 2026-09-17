import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, MACHINE, REQUEST, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { MACHINE_SHEET } from '../data/parts'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Request {
    say(text: string): Promise<void>
    /** Um pulso no balão para pedir releitura. Nunca reescreve a frase. */
    nudge(): void
    setLamps(on: number): void
    powerOn(): Promise<void>
    arrive(): Promise<void>
    leave(): Promise<void>
    machinePoint(): { x: number; y: number }
    balloonPoint(): { x: number; y: number }
    destroy(): void
}

export function createRequest(scene: Phaser.Scene, lamps: number): Request {
    const root = scene.add.container(0, 0).setDepth(DEPTH.request)

    const bubble = scene.add.graphics()
    const tailX = REQUEST.x + REQUEST.w
    bubble.fillStyle(C.shadow, 0.3)
    bubble.fillRoundedRect(REQUEST.x + 4, REQUEST.y + 8, REQUEST.w, REQUEST.h, 26)
    bubble.fillStyle(C.cream, 1)
    bubble.fillRoundedRect(REQUEST.x, REQUEST.y, REQUEST.w, REQUEST.h, 26)
    bubble.fillTriangle(
        tailX - 4, REQUEST.cy - 22,
        tailX - 4, REQUEST.cy + 22,
        tailX + REQUEST.tailW, REQUEST.cy,
    )
    root.add(bubble)

    const line = scene.add
        .text(REQUEST.cx, REQUEST.cy, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.request}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: REQUEST.wrap },
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(line)

    const machine = scene.add
        .image(MACHINE.cx, MACHINE.cy, MACHINE_SHEET.key, 0)
        .setOrigin(0.5)
        .setScale(MACHINE.scale)
        .setDepth(DEPTH.request)

    const glow = scene.add.graphics().setDepth(DEPTH.request - 1).setAlpha(0)

    let lit = 0

    const lampX = (i: number) => MACHINE.cx + (i - (lamps - 1) / 2) * MACHINE.lampGap

    function paintGlow() {
        glow.clear()
        for (let i = 0; i < lit; i++) {
            glow.fillStyle(C.gold, 0.55)
            glow.fillCircle(lampX(i), MACHINE.cy + MACHINE.lampDy, MACHINE.lampR + 7)
        }
        glow.setAlpha(lit ? 1 : 0)
    }

    function fit(text: string) {
        line.setFontSize(SIZE.request)
        line.setText(text)
        let size = SIZE.request
        while (size > SIZE.requestMin && (line.width > REQUEST.wrap || line.height > REQUEST.h - 26)) {
            size -= 2
            line.setFontSize(size)
        }
    }

    let typer: { skip(): void } | undefined

    return {
        say: async text => {
            typer?.skip()
            fit(text)
            line.setText('')
            line.setAlpha(1)
            const run = FX.type(scene, line, text, { delay: 18 })
            typer = run
            await run
        },

        nudge: () => {
            void FX.to(scene, fx(line), { scale: 1.06 }, { duration: 260, yoyo: true, repeat: 1 })
        },

        setLamps: on => {
            lit = on
            paintGlow()
        },

        powerOn: async () => {
            machine.setFrame(1)
            lit = lamps
            paintGlow()
            await FX.to(scene, machine, { scale: MACHINE.scale * 1.14 }, { duration: 220, ease: Ease.back(2) })
            await FX.to(scene, machine, { scale: MACHINE.scale }, { duration: 220 })
        },

        arrive: async () => {
            machine.setFrame(0)
            lit = 0
            paintGlow()
            machine.setX(W + 160).setAlpha(1)
            line.setText('')
            root.setAlpha(1)
            await FX.to(scene, machine, { x: MACHINE.cx }, { duration: 460, ease: Ease.back(1.2) })
        },

        leave: async () => {
            typer?.skip()
            line.setText('')
            await FX.all(
                FX.to(scene, machine, { x: W + 200, alpha: 0 }, { duration: 460, ease: Ease.smooth }),
                FX.to(scene, root, { alpha: 0 }, { duration: 300 }),
            )
            glow.clear().setAlpha(0)
        },

        machinePoint: () => ({ x: MACHINE.cx, y: MACHINE.cy }),

        balloonPoint: () => ({ x: REQUEST.cx, y: REQUEST.cy }),

        destroy: () => {
            typer?.skip()
            FX.kill(scene, root)
            FX.kill(scene, machine)
            FX.kill(scene, fx(line))
            machine.destroy()
            glow.destroy()
            root.destroy(true)
        },
    }
}
