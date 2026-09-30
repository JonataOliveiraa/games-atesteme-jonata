import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH, FINALE, H, SIGN, W } from '../data/layout'
import { A, C, CSS, FONT, SIZE, TRAIL } from '../data/theme'
import type { Audio } from './audio'
import { createIdCard, DATA } from './card'
import { createVault } from './vault'

export async function playFinale(scene: Phaser.Scene, audio: Audio, live: () => boolean) {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1).setDepth(DEPTH.veil).setAlpha(0)
    await FX.to(scene, veil, { alpha: A.veil }, { duration: 300 })
    if (!live()) return

    const vault = createVault(scene, W / 2, FINALE.vaultY, FINALE.vaultScale)
    vault.container.setDepth(DEPTH.card)
    const card = createIdCard(scene, CARD.x, FINALE.cardY, 0.9)
    card.container.setDepth(DEPTH.card + 1)
    await Promise.all([FX.popIn(scene, vault.container, { from: 0.4 }), FX.popIn(scene, card.container, { from: 0.4, delay: 120 })])
    if (!live()) return

    for (const kind of DATA) {
        const at = card.datumWorld(kind)
        audio.plim()
        void FX.impact(scene, card.datum(kind), 0.2)
        void FX.stars(scene, at.x, at.y, { color: C.gold, count: 6, rise: 60, depth: DEPTH.sign })
        await FX.wait(scene, 220)
        if (!live()) return
    }

    const sign = scene.add
        .text(SIGN.x, SIGN.y, 'DADOS PROTEGIDOS!', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.sign}px`,
            color: CSS.white,
            align: 'center',
            stroke: CSS.ink,
            strokeThickness: 12,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.sign)
    audio.win()
    void FX.confetti(scene, { colors: [...TRAIL, C.gold] })
    await FX.popIn(scene, sign, { from: 0.3, duration: 480 })
    void FX.to(scene, sign, { scale: 1.06 }, { duration: 500, yoyo: true, repeat: 1 })
    void vault.pulse()
}
