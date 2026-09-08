import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { MACHINES, MACHINE_ORDER } from '../data/machines'
import { CATALOG, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { createPlaque } from './plaque'
import { machineImage } from './machineButton'

/** O catálogo do fim de nível: cada máquina com os dois comandos acesos. */
export async function showAlbum(scene: Phaser.Scene) {
    const overlay = scene.add
        .rectangle(W / 2, H / 2, W, H, C.ink, 0.62)
        .setDepth(340)
        .setInteractive()

    const cards = MACHINE_ORDER.map((id, index) => {
        const machine = MACHINES[id]
        const x = W / 2 + (index - 1) * (CATALOG.cardW + CATALOG.gap)
        const card = scene.add.container(x, CATALOG.cy).setDepth(341)

        const bg = scene.add.graphics()
        bg.fillStyle(C.ink, 0.3)
        bg.fillRoundedRect(-CATALOG.cardW / 2, -CATALOG.cardH / 2 + 8, CATALOG.cardW, CATALOG.cardH, CATALOG.r)
        bg.fillStyle(C.ink, 1)
        bg.fillRoundedRect(-CATALOG.cardW / 2, -CATALOG.cardH / 2, CATALOG.cardW, CATALOG.cardH, CATALOG.r)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-CATALOG.cardW / 2 + 7, -CATALOG.cardH / 2 + 7, CATALOG.cardW - 14, CATALOG.cardH - 14, CATALOG.r - 7)
        bg.fillStyle(machine.color, 0.28)
        bg.fillRoundedRect(-CATALOG.cardW / 2 + 20, -CATALOG.cardH / 2 + 22, CATALOG.cardW - 40, 132, 26)

        const art = machineImage(scene, machine, 118)
        art.setPosition(0, -66)

        const name = scene.add.text(0, 22, machine.name, {
            fontFamily: FONT.black, fontSize: SIZE.catalogName, color: CSS.ink,
        }).setOrigin(0.5).setResolution(2)

        card.add([bg, art, name])

        machine.commands.forEach((command, i) => {
            const plaque = createPlaque(scene, {
                command,
                x: i === 0 ? -62 : 62,
                y: 96,
                w: 116,
                h: 66,
                icon: 50,
            })
            plaque.setState('on')
            card.add(plaque.root)
        })

        return card
    })

    overlay.setAlpha(0)
    void FX.to(scene, overlay, { alpha: 1 }, { duration: 240 })
    await FX.stagger(scene, cards, card => FX.popIn(scene, card, { from: 0.6, duration: 420 }), 190)
    await FX.all(
        ...cards.map((card, i) =>
            FX.to(scene, card, { y: CATALOG.cy - 12 }, { duration: 420, delay: i * 90, yoyo: true, ease: Ease.back(1.6) }),
        ),
    )
    await FX.wait(scene, 1300)
    await Promise.all([
        FX.to(scene, overlay, { alpha: 0 }, { duration: 300 }),
        FX.to(scene, cards, { alpha: 0 }, { duration: 300 }),
    ])

    cards.forEach(card => card.destroy(true))
    overlay.destroy()
}
