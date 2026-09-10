import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Item } from '../types'

interface Pickup {
    item: Item
    x: number
    y: number
    art: Phaser.GameObjects.Container
    taken: boolean
}

const SIZE = 110

export function createPickups(scene: Phaser.Scene) {
    let list: Pickup[] = []

    const clear = () => {
        list.forEach(pickup => {
            scene.tweens.killTweensOf(pickup.art)
            pickup.art.destroy(true)
        })
        list = []
    }

    const makeArt = (item: Item, x: number, y: number, sheet: string) => {
        const container = scene.add.container(x, y).setDepth(DEPTH.item)
        const ring = scene.add.graphics()
        ring.fillStyle(C.white, 0.32)
        ring.fillCircle(0, 0, SIZE * 0.62)
        ring.lineStyle(5, C.gold, 0.8)
        ring.strokeCircle(0, 0, SIZE * 0.62)
        container.add(ring)

        if (scene.textures.exists(sheet)) {
            container.add(
                scene.add.image(0, 0, sheet, item.frame).setDisplaySize(SIZE, SIZE),
            )
        } else {
            const label = scene.add
                .text(0, 0, item.name, {
                    fontFamily: FONT.black,
                    fontSize: '18px',
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: SIZE },
                })
                .setOrigin(0.5)
                .setResolution(2)
            container.add(label)
        }

        scene.tweens.add({
            targets: container,
            y: y - 14,
            duration: FX.ms(scene, 1100),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
        return container
    }

    return {
        spawn(entries: { item: Item; x: number; y: number }[], sheet: string) {
            clear()
            list = entries.map(entry => ({
                item: entry.item,
                x: entry.x,
                y: entry.y,
                art: makeArt(entry.item, entry.x, entry.y, sheet),
                taken: false,
            }))
        },

        /** O que o herói está encostando agora, se algo. */
        touching(heroX: number, heroY: number) {
            const centerY = heroY - 74
            return (
                list.find(
                    pickup =>
                        !pickup.taken &&
                        Math.abs(pickup.art.x - heroX) < 62 &&
                        Math.abs(pickup.art.y - centerY) < 86,
                ) ?? null
            )
        },

        position(itemId: string) {
            const pickup = list.find(item => item.item.id === itemId)
            return pickup ? { x: pickup.art.x, y: pickup.art.y } : { x: 0, y: 0 }
        },

        async take(itemId: string, to: { x: number; y: number }) {
            const pickup = list.find(item => item.item.id === itemId)
            if (!pickup) return
            pickup.taken = true
            scene.tweens.killTweensOf(pickup.art)
            void FX.sparks(scene, pickup.art.x, pickup.art.y, { color: C.gold, count: 14 })
            await FX.to(
                scene,
                pickup.art,
                { x: to.x + scene.cameras.main.scrollX, y: to.y, scale: 0.4, alpha: 0 },
                { duration: 380, ease: 'Cubic.easeIn' },
            )
            pickup.art.setVisible(false)
        },

        /** O item errado: pula, faz que não e volta para o lugar. */
        async refuse(itemId: string) {
            const pickup = list.find(item => item.item.id === itemId)
            if (!pickup) return
            scene.tweens.killTweensOf(pickup.art)
            await FX.to(scene, pickup.art, { y: pickup.y - 60 }, { duration: 180 })
            await FX.shake(scene, pickup.art, { amount: 14 })
            await FX.to(scene, pickup.art, { y: pickup.y }, { duration: 220, ease: 'Bounce.easeOut' })
            scene.tweens.add({
                targets: pickup.art,
                y: pickup.y - 14,
                duration: FX.ms(scene, 1100),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        /** Derrubou: o item volta para a vaga dele. */
        restore(itemId: string) {
            const pickup = list.find(item => item.item.id === itemId)
            if (!pickup) return
            pickup.taken = false
            pickup.art.setVisible(true).setAlpha(1).setScale(1).setPosition(pickup.x, pickup.y)
            scene.tweens.add({
                targets: pickup.art,
                y: pickup.y - 14,
                duration: FX.ms(scene, 1100),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        setVisible(value: boolean) {
            list.forEach(pickup => pickup.art.setVisible(value && !pickup.taken))
        },

        clear,

        destroy() {
            clear()
        },
    }
}

export type Pickups = ReturnType<typeof createPickups>
