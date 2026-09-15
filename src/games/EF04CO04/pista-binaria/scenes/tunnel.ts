import Phaser from 'phaser'
import { SHEET } from '../data/art'
import { DEPTH, H, LANE, W } from '../data/layout'
import { C } from '../data/theme'

interface Mote {
    x: number
    y: number
    size: number
    speed: number
    tone: number
    spin: number
}

/**
 * O fundo é PARADO.
 *
 * A sensação de velocidade vem dos papeizinhos soltos que atravessam a tela —
 * uma lista de posições que recicla. Um PNG rolando (`tileSprite`) descola do
 * mundo assim que a velocidade muda ou o jogo congela na trava.
 *
 * O véu e a faixa da pista existem por contraste: o bloco é de papel creme e
 * o fundo tem uma clareira creme no meio da direita. Sem escurecer aquela
 * faixa, o bloco some justamente enquanto vem vindo.
 */
export function createTunnel(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0)

    if (scene.textures.exists(SHEET.tunnel)) {
        const bg = scene.add.image(W / 2, H / 2, SHEET.tunnel).setDepth(DEPTH.bg)
        bg.setDisplaySize(W, H)
        root.add(bg)
    } else {
        const fallback = scene.add.graphics().setDepth(DEPTH.bg)
        fallback.fillStyle(C.navyDeep, 1)
        fallback.fillRect(0, 0, W, H)
        for (let i = 4; i >= 1; i--) {
            fallback.fillStyle(i % 2 ? C.navy : C.blue, 1)
            fallback.fillEllipse(900, 330, 300 + i * 190, 240 + i * 150)
        }
        fallback.fillStyle(C.cream, 1)
        fallback.fillEllipse(900, 330, 250, 210)
        root.add(fallback)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    veil.fillStyle(C.navyDeep, 0.22)
    veil.fillRect(0, 0, W, H)
    root.add(veil)

    const lane = scene.add.graphics().setDepth(DEPTH.lane)
    lane.fillStyle(C.navyDeep, 0.14)
    lane.fillRect(0, LANE.top - 26, W, LANE.bottom - LANE.top + 52)
    lane.fillStyle(C.navyDeep, 0.2)
    lane.fillRect(0, LANE.top, W, LANE.bottom - LANE.top)
    root.add(lane)

    const motes: Mote[] = []
    const tones = [C.cream, C.yellow, C.coral, C.blueSoft]
    for (let i = 0; i < 22; i++) {
        motes.push({
            x: Phaser.Math.Between(0, W),
            y: Phaser.Math.Between(120, H - 60),
            size: Phaser.Math.Between(7, 16),
            speed: Phaser.Math.Between(50, 130),
            tone: tones[i % tones.length],
            spin: Phaser.Math.FloatBetween(-1.4, 1.4),
        })
    }

    const dust = scene.add.graphics().setDepth(DEPTH.motes)

    const paint = () => {
        dust.clear()
        motes.forEach(mote => {
            dust.fillStyle(mote.tone, 0.22)
            dust.fillRoundedRect(mote.x, mote.y, mote.size, mote.size * 0.8, 3)
        })
    }
    paint()

    return {
        container: root,

        update(dt: number, running: boolean) {
            if (!running) return
            motes.forEach(mote => {
                mote.x -= mote.speed * dt
                mote.y += mote.spin * dt * 6
                if (mote.x < -20) {
                    mote.x = W + Phaser.Math.Between(10, 200)
                    mote.y = Phaser.Math.Between(120, H - 60)
                }
            })
            paint()
        },

        destroy() {
            dust.destroy()
            root.destroy(true)
        },
    }
}

export type Tunnel = ReturnType<typeof createTunnel>
