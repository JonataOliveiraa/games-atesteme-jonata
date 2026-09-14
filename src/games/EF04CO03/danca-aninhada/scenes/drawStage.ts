import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CUTS, SHEET as ART, dancerScale, originOf, type PoseKey } from '../data/art'
import { DANCER, DEPTH, H, STAGE, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Move } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PALCO E O DANÇARINO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O fundo é o único PNG de cenário, e ele não sabe nada sobre o algoritmo:
 * não tem pegadas no piso, marcas de grade nem holofote apontando para nada.
 * Quem diz o que está acontecendo é o código.
 *
 * ── O JOGO PRECISA RODAR SEM PNG ─────────────────────────────────────────
 *
 * O §13 do planejamento exige isso, e não é zelo: o primeiro corte foi
 * escrito antes de a folha existir. Se nenhuma textura estiver carregada, o
 * palco vira `Graphics` e o dançarino vira boneco de círculos e linhas com o
 * rótulo DANÇARINO — nas MESMAS caixas de layout, para o teste com criança
 * medir a mesma tela.
 */

const POSE_OF: Record<Move, PoseKey> = { step: 'step', clap: 'clap', spin: 'spin' }

export function createStage(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bg)
    const hasArt = scene.textures.exists(ART.dancer)

    if (scene.textures.exists(ART.stage)) {
        const bg = scene.add.image(W / 2, H / 2, ART.stage)
        const k = Math.max(W / bg.width, H / bg.height)
        bg.setScale(k)
        root.add(bg)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.curtain, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 210, W, 160)
        g.fillStyle(C.floor, 1)
        g.fillRect(0, 370, W, H - 370)
        g.fillStyle(C.ink, 0.18)
        g.fillRect(0, 366, W, 8)
        root.add(g)
    }

    /*
     * O CONE DE LUZ É DO CÓDIGO, NÃO DO FUNDO.
     *
     * Ele acende quando o ensaio começa e apaga quando termina, e é o sinal
     * visual de "agora o algoritmo está rodando" — o mesmo instante em que os
     * contadores da ficha aparecem.
     */
    const spot = scene.add.graphics().setDepth(DEPTH.floor).setAlpha(0)
    spot.fillStyle(C.warm, 0.24)
    spot.beginPath()
    spot.moveTo(DANCER.x - 52, STAGE.y - 6)
    spot.lineTo(DANCER.x + 52, STAGE.y - 6)
    spot.lineTo(DANCER.x + 138, DANCER.footY + 12)
    spot.lineTo(DANCER.x - 138, DANCER.footY + 12)
    spot.closePath()
    spot.fillPath()

    const shadow = scene.add.graphics().setDepth(DEPTH.floor + 1)
    const paintShadow = (squash: number) => {
        shadow.clear()
        shadow.fillStyle(C.ink, 0.26)
        shadow.fillEllipse(DANCER.x, DANCER.footY + 6, 128 * squash, 26)
    }
    paintShadow(1)

    let sprite: Phaser.GameObjects.Sprite | null = null
    let doll: Phaser.GameObjects.Container | null = null
    let dollArt: Phaser.GameObjects.Graphics | null = null
    const baseScale = dancerScale(DANCER.height)

    if (hasArt) {
        sprite = scene.add.sprite(DANCER.x, DANCER.footY, ART.dancer, 'idle').setDepth(DEPTH.dancer)
        const cut = CUTS[0]
        const o = originOf(cut)
        sprite.setOrigin(o.x, o.y).setScale(baseScale)
    } else {
        doll = scene.add.container(DANCER.x, DANCER.footY).setDepth(DEPTH.dancer)
        dollArt = scene.add.graphics()
        doll.add(dollArt)
        const name = scene.add
            .text(0, -DANCER.height - 26, 'DANÇARINO', {
                fontFamily: FONT.black,
                fontSize: '22px',
                color: CSS.white,
            })
            .setOrigin(0.5)
            .setResolution(2)
        name.setStroke(CSS.ink, 5)
        doll.add(name)
    }

    /** O boneco de reserva: mesma caixa, mesma linha do pé. */
    const paintDoll = (pose: PoseKey) => {
        if (!dollArt) return
        const g = dollArt
        const h = DANCER.height
        const legs = pose === 'step' ? 34 : 14
        const arms = pose === 'clap' ? 16 : pose === 'spin' ? 52 : 30
        const armY = pose === 'clap' ? -h * 0.52 : -h * 0.46
        g.clear()
        g.lineStyle(13, C.ink, 1)
        g.lineBetween(0, -h * 0.72, 0, -h * 0.34)
        g.lineBetween(0, -h * 0.34, -legs, 0)
        g.lineBetween(0, -h * 0.34, legs, 0)
        g.lineBetween(0, -h * 0.6, -arms, armY)
        g.lineBetween(0, -h * 0.6, arms, armY)
        g.lineStyle(9, 0xe6784c, 1)
        g.lineBetween(0, -h * 0.72, 0, -h * 0.4)
        g.fillStyle(C.ink, 1)
        g.fillCircle(0, -h * 0.82, 26)
        g.fillStyle(0x9b6347, 1)
        g.fillCircle(0, -h * 0.82, 21)
    }

    const setPose = (pose: PoseKey) => {
        if (sprite) sprite.setFrame(pose)
        else paintDoll(pose)
    }
    setPose('idle')

    const target = (): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container => (sprite ?? doll)!
    let facing = 1

    return {
        /**
         * Um movimento, do começo ao fim do tempo do compasso.
         *
         * A pose vem da folha; o DESLOCAMENTO vem daqui, porque é ele que
         * separa três desenhos parados de uma dança. O passo alterna de lado
         * a cada vez, senão o dançarino sairia andando para fora do palco.
         */
        async pose(move: Move, ms: number) {
            const t = target()
            setPose(POSE_OF[move])

            if (move === 'step') {
                facing *= -1
                if (sprite) sprite.setFlipX(facing < 0)
                paintShadow(0.86)
                await FX.to(scene, t, { x: DANCER.x + facing * 26 }, { duration: ms * 0.42, ease: 'Sine.easeOut' })
                await FX.to(scene, t, { x: DANCER.x }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
            } else if (move === 'clap') {
                paintShadow(1)
                await FX.to(scene, t, { y: DANCER.footY - 14 }, { duration: ms * 0.3, ease: 'Sine.easeOut' })
                await FX.to(scene, t, { y: DANCER.footY }, { duration: ms * 0.34, ease: 'Sine.easeIn' })
            } else {
                // a volta inteira: o corpo vira e volta, em vez de girar a
                // imagem, que numa figura frontal pareceria tombo
                const base = sprite ? baseScale : 1
                paintShadow(0.8)
                await FX.to(scene, t, { scaleX: -base }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
                await FX.to(scene, t, { scaleX: base }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
            }

            paintShadow(1)
            setPose('idle')
        },

        rest() {
            const t = target()
            scene.tweens.killTweensOf(t)
            t.setPosition(DANCER.x, DANCER.footY)
            if (sprite) sprite.setScale(baseScale).setFlipX(false)
            else t.setScale(1)
            facing = 1
            paintShadow(1)
            setPose('idle')
        },

        /** A pose de fim de nível: uma só, e parada. */
        async finish() {
            const t = target()
            setPose('spin')
            await FX.to(scene, t, { y: DANCER.footY - 26 }, { duration: 240, ease: 'Sine.easeOut' })
            await FX.to(scene, t, { y: DANCER.footY }, { duration: 260, ease: 'Bounce.easeOut' })
            setPose('clap')
        },

        spotlight(on: boolean) {
            scene.tweens.killTweensOf(spot)
            return FX.to(scene, spot, { alpha: on ? 1 : 0 }, { duration: 320 })
        },

        bounds() {
            return {
                x: DANCER.x,
                y: DANCER.footY - DANCER.height / 2,
                w: 268,
                h: DANCER.height + 60,
            }
        },

        destroy() {
            scene.tweens.killTweensOf([root, spot, sprite ?? root, doll ?? root])
            spot.destroy()
            shadow.destroy()
            sprite?.destroy()
            doll?.destroy(true)
            root.destroy(true)
        },
    }
}

export type Stage = ReturnType<typeof createStage>
