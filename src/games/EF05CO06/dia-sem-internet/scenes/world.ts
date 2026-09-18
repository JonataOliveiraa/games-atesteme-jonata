import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLOUD, DEPTH, DRIVE, PC, ROOM, SKY, VIEW, WIRE } from '../data/layout'
import { C } from '../data/theme'
import type { Place } from '../types'
import { createDeck } from './cards'
import { paintSky } from './sky'
import type { World } from './worldTypes'

/**
 * O MUNDO EM PÉ — níveis 1 e 2.
 *
 * O céu lá em cima, o quarto embaixo, e **584 px de cabo** entre os dois. Tudo
 * vive dentro de UM container, o `stage`, e é ele que sobe e desce quando o jogo
 * viaja. A câmera nunca sai do lugar — ver o porquê em `data/layout.ts`.
 */
export function createWorld(scene: Phaser.Scene): World {
    const root = scene.add.container(0, VIEW.room).setDepth(DEPTH.sky)

    /* ───────────────────────────── o cenário ──────────────────────────── */

    root.add(paintSky(scene, 0, SKY.top, SKY.w, SKY.h))

    if (scene.textures.exists('quarto')) {
        root.add(scene.add.image(ROOM.cx, ROOM.top, 'quarto').setOrigin(0.5, 0).setDisplaySize(ROOM.w, ROOM.h))
    } else {
        const g = scene.add.graphics()
        g.fillStyle(0xf3ead6, 1)
        g.fillRect(0, ROOM.top, ROOM.w, ROOM.h)
        g.fillStyle(0xd8a45f, 1)
        g.fillRect(0, ROOM.top + ROOM.h - 160, ROOM.w, 160)
        root.add(g)
    }

    /* ──────────────────────────── o cabo longo ────────────────────────── */

    const wire = scene.add.graphics()
    root.add(wire)

    const paintWire = (cut: number) => {
        wire.clear()
        const { cx, y0, y1, cutAt } = WIRE

        wire.fillStyle(C.navy, 1)
        wire.fillRoundedRect(cx - 28, y0 - 10, 56, 20, 10)
        wire.fillRoundedRect(cx - 28, y1 - 10, 56, 20, 10)

        if (cut <= 0) {
            wire.lineStyle(20, C.navy, 1)
            wire.lineBetween(cx, y0, cx, y1)
            wire.lineStyle(9, C.orange, 1)
            wire.lineBetween(cx, y0 + 6, cx, y1 - 6)
            return
        }

        const gap = 14 + cut * 46
        wire.lineStyle(20, C.navy, 1)
        wire.lineBetween(cx, y0, cx - cut * 26, cutAt - gap / 2)
        wire.lineBetween(cx + cut * 26, cutAt + gap / 2, cx, y1)
        wire.lineStyle(9, C.orange, 1)
        wire.lineBetween(cx, y0 + 6, cx - cut * 26, cutAt - gap / 2)
        wire.lineBetween(cx + cut * 26, cutAt + gap / 2, cx, y1 - 6)
    }

    paintWire(0)

    /**
     * O PULSO DE DADOS.
     *
     * Uma bolinha que sobe o cabo inteiro, do computador até a nuvem. É o que
     * faz o cabo parecer vivo — e é o que dá sentido ao estalo: sem ele,
     * cortar um traço não diz nada.
     */
    const pulse = scene.add.graphics()
    root.add(pulse)
    let pulseLoop: Phaser.Tweens.Tween | undefined

    const paintPulse = (t: number) => {
        const y = WIRE.y1 - (WIRE.y1 - WIRE.y0) * t
        pulse.clear()
        pulse.fillStyle(C.creamSoft, 0.5)
        pulse.fillCircle(WIRE.cx, y, 14)
        pulse.fillStyle(C.orange, 1)
        pulse.fillCircle(WIRE.cx, y, 8)
    }

    const runPulse = (ms: number, loop: boolean) => {
        pulseLoop?.remove()
        pulse.setAlpha(1)
        pulseLoop = scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: FX.ms(scene, ms),
            repeat: loop ? -1 : 0,
            repeatDelay: FX.ms(scene, 900),
            ease: 'Sine.easeInOut',
            onUpdate: tw => paintPulse(tw.getValue() ?? 0),
            onComplete: () => {
                if (!loop) runPulse(1600, true)
            },
        })
    }

    const stopPulse = () => {
        pulseLoop?.remove()
        pulseLoop = undefined
        pulse.clear()
    }

    /* ──────────────────────── os três lugares ─────────────────────────── */

    const cloudArt = scene.textures.exists('nuvem')
        ? scene.add.image(CLOUD.cx, CLOUD.top, 'nuvem').setOrigin(0.5, 0).setDisplaySize(CLOUD.w, CLOUD.h)
        : undefined
    const cloudBox = scene.add.graphics()
    root.add(cloudBox)
    if (cloudArt) root.add(cloudArt)

    const paintCloud = (on: boolean) => {
        cloudBox.clear()
        if (cloudArt) {
            cloudArt.setTint(on ? 0xffffff : 0x7b8c9c)
            return
        }
        const x = CLOUD.cx - CLOUD.w / 2
        cloudBox.fillStyle(C.navy, 1)
        cloudBox.fillRoundedRect(x, CLOUD.top, CLOUD.w, CLOUD.h, 62)
        cloudBox.fillStyle(on ? C.sky : C.grey, 1)
        cloudBox.fillRoundedRect(x + 8, CLOUD.top + 8, CLOUD.w - 16, CLOUD.h - 16, 55)
    }

    if (scene.textures.exists('computador')) {
        root.add(scene.add.image(PC.cx, PC.top, 'computador').setOrigin(0.5, 0).setDisplaySize(PC.w, PC.h))
    } else {
        const g = scene.add.graphics()
        const x = PC.cx - PC.w / 2
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(x, PC.top, PC.w, PC.h - 46, 24)
        g.fillStyle(0xdbe7f0, 1)
        g.fillRoundedRect(x + 16, PC.top + 16, PC.w - 32, PC.h - 78, 14)
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(PC.cx - 58, PC.top + PC.h - 46, 116, 26, 8)
        g.fillRoundedRect(PC.cx - 108, PC.top + PC.h - 22, 216, 20, 10)
        root.add(g)
    }

    if (scene.textures.exists('pendrive')) {
        root.add(scene.add.image(DRIVE.cx, DRIVE.cy, 'pendrive').setDisplaySize(DRIVE.w, DRIVE.h))
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(DRIVE.cx - 62, DRIVE.cy - 24, 124, 48, 12)
        g.fillStyle(C.orange, 1)
        g.fillRoundedRect(DRIVE.cx - 56, DRIVE.cy - 18, 90, 36, 9)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(DRIVE.cx + 34, DRIVE.cy - 11, 26, 22, 4)
        root.add(g)
    }

    paintCloud(true)

    /* ────────────────────── os arquivos, em vitrine ───────────────────── */

    const anchorOf = (place: Place): { cx: number; cy: number } =>
        place === 'cloud'
            ? { cx: CLOUD.cx, cy: CLOUD.cardCy }
            : place === 'pc'
              ? { cx: PC.cx, cy: PC.cardCy }
              : { cx: DRIVE.cx, cy: DRIVE.cardCy }

    const onScreen = (x: number, y: number) => ({ x, y: y + root.y })

    const deck = createDeck(scene, root, {
        anchor: anchorOf,
        onScreen,
        drift: place => (place === 'cloud' ? 6 : 3),
    })

    return {
        mount: async slots => {
            paintCloud(true)
            paintWire(0)
            runPulse(1600, true)
            await deck.mount(slots)
        },

        stage: () => root,

        cardPoint: where => deck.point(where),

        lightLink: () => runPulse(1800, false),

        breakLink: async () => {
            stopPulse()

            const spark = onScreen(WIRE.cx, WIRE.cutAt)
            void FX.sparks(scene, spark.x, spark.y, { color: C.gold, count: 22 })
            FX.shakeCam(scene, 'medio')

            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, 460),
                    ease: 'Back.easeOut',
                    onUpdate: tw => paintWire(tw.getValue() ?? 0),
                    onComplete: () => resolve(),
                })
            })

            paintCloud(false)
            await deck.lock('cloud')
            await FX.wait(scene, 200)
        },

        openAt: async (where, fileId) => {
            await deck.open(where, fileId)
        },

        denyAt: async target => {
            await deck.deny(target)
        },

        destroy: () => {
            stopPulse()
            deck.clear()
            root.destroy()
        },
    }
}
