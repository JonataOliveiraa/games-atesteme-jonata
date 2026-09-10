import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TRASH } from '../data/layout'
import { C } from '../data/theme'
import type { Spot } from '../types'

interface Hazard {
    x: number
    y: number
    art: Phaser.GameObjects.Container
}

/**
 * O LIXO DO CAMINHO — meia fedida, barata, peixe morto.
 *
 * Ele entrou no lugar dos itens da outra metade, que antes ocupavam essas vagas
 * e travavam o jogo quando apanhados. Trocar um pelo outro tira o erro de
 * cabeça do meio da corrida: a divisão é decidida no corte e conferida na fase
 * final, e a viagem passou a ser execução pura. O lixo não custa vida — ele
 * custa um objeto derrubado, que é o preço certo para um erro de dedo.
 */
export function createHazards(scene: Phaser.Scene) {
    let list: Hazard[] = []

    const clear = () => {
        list.forEach(hazard => {
            scene.tweens.killTweensOf(hazard.art)
            hazard.art.destroy(true)
        })
        list = []
    }

    /** Sem `lixo.png`: a meia cinza com três ondinhas verdes subindo. */
    const drawReserve = (container: Phaser.GameObjects.Container) => {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 0.2)
        g.fillEllipse(4, 26, 100, 20)
        g.fillStyle(C.sock, 1)
        g.fillRoundedRect(-48, -18, 64, 40, 14)
        g.fillRoundedRect(4, -4, 46, 26, 12)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(-48, -18, 64, 40, 14)
        g.strokeRoundedRect(4, -4, 46, 26, 12)
        container.add(g)

        for (let i = 0; i < 3; i++) {
            const wave = scene.add.graphics()
            wave.lineStyle(5, C.stink, 0.85)
            wave.beginPath()
            wave.moveTo(-10 + i * 12, 0)
            wave.lineTo(-4 + i * 12, -12)
            wave.lineTo(-12 + i * 12, -24)
            wave.lineTo(-6 + i * 12, -36)
            wave.strokePath()
            wave.setPosition(0, -24)
            container.add(wave)
            scene.tweens.add({
                targets: wave,
                y: -54,
                alpha: 0,
                duration: FX.ms(scene, 1400),
                delay: FX.ms(scene, i * 380),
                repeat: -1,
            })
        }
    }

    return {
        spawn(spots: Spot[]) {
            clear()
            const art = scene.textures.exists('lixo')
            list = spots.map((spot, index) => {
                const container = scene.add.container(spot.x, spot.y).setDepth(DEPTH.hazard)
                if (art) {
                    container.add(
                        scene.add
                            .image(0, 0, 'lixo', index % TRASH.frames)
                            .setDisplaySize(TRASH.size, TRASH.size),
                    )
                } else {
                    drawReserve(container)
                }
                return { x: spot.x, y: spot.y, art: container }
            })
        },

        touching(heroX: number, heroY: number) {
            const centerY = heroY - 74
            return (
                list.find(
                    hazard =>
                        Math.abs(hazard.x - heroX) < TRASH.halfX &&
                        Math.abs(hazard.y - centerY) < TRASH.halfY,
                ) ?? null
            )
        },

        puff(x: number, y: number) {
            void FX.sparks(scene, x, y, { color: C.stink, count: 16, spread: 150, size: 14 })
        },

        setVisible(value: boolean) {
            list.forEach(hazard => hazard.art.setVisible(value))
        },

        clear,

        destroy() {
            clear()
        },
    }
}

export type Hazards = ReturnType<typeof createHazards>
