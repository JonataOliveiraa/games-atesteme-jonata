import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, OWL, PATH } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { owlFrame } from '../data/cast'
import type { OwlDef } from '../types'
import { TEX } from './BootScene'

export interface Owl {
    /** A coruja vigia o pedaço do trajeto embaixo dela. */
    place(x: number, from: number, to: number): void
    tick(clock: number): void
    awakeAt(clock: number): boolean
    /** Quanto falta do estado de agora, de 1 a 0. O aviso da Mel sai daqui. */
    leftAt(clock: number): number
    /** A cena de acordar, para a câmera assistir. */
    wakeShow(): Promise<void>
    /** A cena de dormir de novo. */
    sleepShow(): Promise<void>
    point(): { x: number; y: number }
    laugh(): Promise<void>
    destroy(): void
}

export function createOwl(scene: Phaser.Scene, def: OwlDef, offset: number): Owl {
    const span = def.cycle.asleep + def.cycle.awake
    let x = 640
    let coneFrom = 200
    let coneTo = 1080
    let awake = false
    let baseScaleY = 1

    const art = scene.textures.exists(TEX.owl)
        ? scene.add.sprite(x, OWL.y, TEX.owl, owlFrame(def.column, false)).setDepth(DEPTH.owl)
        : undefined
    if (art) {
        art.setDisplaySize(OWL.h, OWL.h)
        baseScaleY = art.scaleY
    }

    const body = scene.add.graphics().setDepth(DEPTH.owl)
    const cone = scene.add.graphics().setDepth(DEPTH.cone).setAlpha(0)
    const ring = scene.add.graphics().setDepth(DEPTH.ring)

    const zzz = scene.add
        .text(x + 54, OWL.y - 54, 'zzz', { fontFamily: FONT.black, fontSize: '28px', color: CSS.white })
        .setOrigin(0.5)
        .setDepth(DEPTH.ring)
        .setResolution(2)
    zzz.setStroke(CSS.ink, 6)

    const paintBody = () => {
        body.clear()
        if (art) return
        body.fillStyle(C.ink, 1)
        body.fillCircle(x, OWL.y, 52)
        body.fillStyle(awake ? C.white : C.slate, 1)
        body.fillCircle(x, OWL.y, 46)
    }

    const paintCone = () => {
        cone.clear()
        cone.fillStyle(C.cone, A.cone)
        cone.fillTriangle(
            x, OWL.y + OWL.coneDy,
            coneFrom, PATH.y + 52,
            coneTo, PATH.y + 52,
        )
    }

    const paintRing = (left: number) => {
        const cx = x
        const cy = OWL.y + OWL.ringDy
        ring.clear()
        ring.fillStyle(C.ink, 0.55)
        ring.fillCircle(cx, cy, OWL.ringR + 5)
        ring.lineStyle(9, C.white, 0.35)
        ring.strokeCircle(cx, cy, OWL.ringR)
        ring.lineStyle(9, awake ? C.amber : C.ring, 1)
        ring.beginPath()
        ring.arc(cx, cy, OWL.ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left, false)
        ring.strokePath()
    }

    /*
     * DORMIR É UMA ANIMAÇÃO, NÃO UM QUADRO PARADO.
     *
     * O peito sobe e desce devagar e o `zzz` sobe e some, em laço. Acordada, a
     * respiração some e entra um balanço curto e atento — o corpo diz o estado
     * antes de a criança olhar os olhos.
     */
    const breathe = () => {
        if (!art) return
        FX.kill(scene, art)
        art.setScale(art.scaleX, baseScaleY)
        void FX.to(scene, art,
            { scaleY: baseScaleY * (awake ? 1.03 : 1.07) },
            { duration: awake ? 620 : 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }

    const snore = () => {
        FX.kill(scene, zzz)
        zzz.setPosition(x + 56, OWL.y - 50).setAlpha(0).setScale(0.8)
        void FX.to(scene, zzz,
            { y: OWL.y - 96, alpha: 1, scale: 1.1 },
            { duration: 1500, repeat: -1, ease: 'Sine.easeOut' })
    }

    const apply = (now: boolean, quiet: boolean) => {
        awake = now
        art?.setFrame(owlFrame(def.column, awake))
        paintBody()
        zzz.setVisible(!awake)
        breathe()
        if (awake) FX.kill(scene, zzz)
        else snore()

        FX.kill(scene, cone)
        if (quiet) {
            cone.setAlpha(awake ? 1 : 0)
        } else {
            void FX.to(scene, cone, { alpha: awake ? 1 : 0 }, { duration: 220 })
        }
    }

    return {
        place: (at, from, to) => {
            x = at
            coneFrom = from
            coneTo = to
            art?.setPosition(x, OWL.y)
            paintBody()
            paintCone()
            paintRing(1)
            apply(awake, true)
        },

        tick: clock => {
            const phase = (clock + offset) % span
            const now = phase >= def.cycle.asleep
            const left = now
                ? 1 - (phase - def.cycle.asleep) / def.cycle.awake
                : 1 - phase / def.cycle.asleep

            if (now !== awake) {
                apply(now, false)
                if (now) void FX.ping(scene, x, OWL.y, C.amber, { radius: 110, depth: DEPTH.cone })
            }

            paintRing(left)
            ring.setAlpha(left < 0.25 ? 0.5 + 0.5 * Math.abs(Math.sin(clock / 90)) : 1)
            if (awake) cone.setAlpha(0.8 + 0.2 * Math.abs(Math.sin(clock / 220)))
        },

        awakeAt: clock => ((clock + offset) % span) >= def.cycle.asleep,

        leftAt: clock => {
            const phase = (clock + offset) % span
            return phase >= def.cycle.asleep
                ? 1 - (phase - def.cycle.asleep) / def.cycle.awake
                : 1 - phase / def.cycle.asleep
        },

        wakeShow: async () => {
            if (!art) return
            FX.kill(scene, art)
            art.setAngle(0).setScale(art.scaleX, baseScaleY)
            // encolhe, estufa as penas, abre os olhos e varre o chão com a luz
            await FX.to(scene, art, { scaleY: baseScaleY * 0.86 }, { duration: 180, ease: 'Sine.easeIn' })
            art.setFrame(owlFrame(def.column, true))
            void FX.ping(scene, x, OWL.y - 10, C.amber, { radius: 150, depth: DEPTH.cone })
            await FX.to(scene, art, { scaleY: baseScaleY * 1.16 }, { duration: 200, ease: 'Back.easeOut' })
            await FX.to(scene, art, { angle: -7 }, { duration: 110, yoyo: true })
            await FX.to(scene, art, { angle: 7 }, { duration: 110, yoyo: true })
            await FX.to(scene, art, { scaleY: baseScaleY }, { duration: 160 })
            breathe()
        },

        sleepShow: async () => {
            if (!art) return
            FX.kill(scene, art)
            art.setAngle(0)
            art.setFrame(owlFrame(def.column, false))
            await FX.to(scene, art, { scaleY: baseScaleY * 0.9 }, { duration: 320, ease: 'Sine.easeInOut' })
            await FX.to(scene, art, { scaleY: baseScaleY }, { duration: 260 })
            breathe()
        },

        point: () => ({ x, y: OWL.y }),

        laugh: async () => {
            FX.kill(scene, cone)
            cone.setAlpha(1)
            if (art) {
                FX.kill(scene, art)
                await FX.to(scene, art, { angle: 10 }, { duration: 110, yoyo: true, repeat: 2 })
                art.setAngle(0)
                breathe()
            }
        },

        destroy: () => {
            FX.kill(scene, zzz)
            if (art) FX.kill(scene, art)
            zzz.destroy()
            ring.destroy()
            cone.destroy()
            body.destroy()
            art?.destroy()
        },
    }
}
