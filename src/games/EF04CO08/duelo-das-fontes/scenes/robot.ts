import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, ROBOT } from '../data/layout'
import { C } from '../data/theme'
import { TEX } from './BootScene'

export const FACE = { offers: 0, insists: 1, laughs: 2, deflated: 3 } as const
export type Face = keyof typeof FACE

export interface Robot {
    setFace(face: Face): void
    blow(): Promise<void>
    /** Enquanto ele fala, o corpo balança. Desligue quando a frase terminar. */
    talk(on: boolean): void
    /** Conseguiu gritar: ele comemora. Não muda de tamanho. */
    cheer(): Promise<void>
    /** Não conseguiu gritar: cara de emburrado, sem encolher. */
    sulk(): Promise<void>
    /** Foi pego trazendo boato: solta ar e encolhe um degrau. */
    deflate(): Promise<void>
    /** O boato passou: o megafone acende e ele infla. */
    inflate(): Promise<void>
    idle(): void
    destroy(): void
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE A CARA DELE DIZ, E O QUE O TAMANHO DELE DIZ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * São duas coisas diferentes, e misturá-las deixava o jogo mentindo:
 *
 *   A CARA reage ao que ele queria: ele quer GRITAR. Deixou espalhar? Ele
 *   comemora — e comemora com razão, porque a notícia era verdade. Barrou? Ele
 *   fica emburrado. Antes ele ficava triste até quando a criança mandava
 *   espalhar uma notícia boa, o que não fazia sentido nenhum.
 *
 *   O TAMANHO é o placar, e ele só muda quando alguém foi PEGO: ele encolhe
 *   quando a criança barra um boato dele, e infla quando um boato passa.
 *
 * Ele escala pela BASE — origem (0.5, 1) — para os pés ficarem no chão enquanto
 * a cabeça sobe e desce. A animação de FALA mora num container à parte, senão
 * ela brigaria com a escala do placar.
 */
export function createRobot(scene: Phaser.Scene): Robot {
    const root = scene.add.container(ROBOT.cx, ROBOT.baseY).setDepth(DEPTH.robot)
    const talkBox = scene.add.container(0, 0)
    root.add(talkBox)

    let body: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container
    let base = 1

    if (scene.textures.exists(TEX.robot)) {
        const sprite = scene.add.sprite(0, 0, TEX.robot, FACE.insists).setOrigin(0.5, 1)
        base = ROBOT.h / sprite.height
        sprite.setScale(base)
        body = sprite
    } else {
        const fake = scene.add.container(0, 0)
        const g = scene.add.graphics()
        g.fillStyle(C.slate, 1)
        g.fillRoundedRect(-70, -ROBOT.h, 140, ROBOT.h, 42)
        g.fillStyle(C.ink, 1)
        g.fillCircle(-26, -ROBOT.h + 70, 18)
        g.fillCircle(26, -ROBOT.h + 70, 18)
        g.fillStyle(C.band, 1)
        g.fillCircle(0, -ROBOT.h - 16, 14)
        fake.add(g)
        body = fake
    }
    talkBox.add(body)

    const flash = scene.add.graphics().setAlpha(0)
    root.add(flash)

    let level = 0
    const scaleOf = () =>
        Phaser.Math.Clamp(base * (1 + level * ROBOT.step), base * ROBOT.minScale, base * ROBOT.maxScale)

    const setFace = (face: Face) => {
        if (body instanceof Phaser.GameObjects.Sprite) body.setFrame(FACE[face])
    }

    const settle = (duration = 460) =>
        FX.to(scene, body, { scaleX: scaleOf(), scaleY: scaleOf() }, { duration, ease: 'Back.easeOut' })

    let chatter: Phaser.Tweens.Tween | undefined

    const talk = (on: boolean) => {
        chatter?.remove()
        chatter = undefined
        if (!on) {
            talkBox.setScale(1).setAngle(0)
            return
        }
        chatter = scene.tweens.add({
            targets: talkBox,
            scaleY: 1.035,
            scaleX: 0.988,
            angle: 1.2,
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    return {
        setFace,
        talk,

        blow: async () => {
            setFace('offers')
            await FX.to(scene, body, { scaleY: scaleOf() * 0.94 }, { duration: 140 })
            await FX.to(scene, body, { scaleY: scaleOf() }, { duration: 260, ease: 'Back.easeOut' })
            setFace('insists')
        },

        cheer: async () => {
            talk(false)
            setFace('laughs')
            await FX.to(scene, talkBox, { y: -26, angle: -4 }, { duration: 200, ease: 'Sine.easeOut' })
            await FX.to(scene, talkBox, { y: 0, angle: 0 }, { duration: 320, ease: 'Bounce.easeOut' })
        },

        sulk: async () => {
            talk(false)
            setFace('deflated')
            await FX.to(scene, talkBox, { y: 10 }, { duration: 260, ease: 'Sine.easeOut' })
            await FX.to(scene, talkBox, { y: 0 }, { duration: 360 })
        },

        deflate: async () => {
            talk(false)
            level -= 1
            setFace('deflated')
            await FX.to(scene, body, { scaleX: scaleOf() * 1.06, scaleY: scaleOf() * 0.86 }, { duration: 300 })
            await settle(520)
        },

        inflate: async () => {
            talk(false)
            level += 1
            setFace('laughs')
            flash.clear()
            flash.fillStyle(C.amber, 0.5)
            flash.fillCircle(-40, -ROBOT.h * 0.45, 120)
            flash.setAlpha(0)
            void FX.to(scene, flash, { alpha: 1 }, { duration: 120 })
                .then(() => FX.to(scene, flash, { alpha: 0 }, { duration: 620 }))
            await FX.to(scene, body, { scaleX: scaleOf() * 1.1, scaleY: scaleOf() * 1.12 }, { duration: 260 })
            await settle(420)
        },

        idle: () => setFace('insists'),

        destroy: () => {
            chatter?.remove()
            root.destroy(true)
        },
    }
}
