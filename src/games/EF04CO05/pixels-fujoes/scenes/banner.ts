import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, DEPTH, H, U } from '../data/layout'
import { C } from '../data/theme'
import { ptext } from './art'
import { bakePanel } from './pixelart'

/** a faixa grande do erro, numa placa de pixel com aro laranja */
export function showBanner(scene: Phaser.Scene, text: string) {
    const label = ptext(scene, 0, 0, text, BANNER.text, 'white').setMaxWidth(BANNER.w - 80).setCenterAlign()
    const rows = Math.ceil((label.height + 40) / U)
    const h = rows * U
    const key = bakePanel(scene, `banner-${rows}`, BANNER.w / U, rows, { fill: C.panel, inner: C.oops, light: C.panelLight, shade: C.panelDark })
    const plate = scene.add.image(0, 0, key).setScale(U)
    label.setY(U)
    const y = Math.min(BANNER.y, H - h / 2 - 12)
    const box = scene.add.container(BANNER.x, y, [plate, label]).setDepth(DEPTH.banner)
    void FX.popIn(scene, box, { from: 0.6, duration: 320 })
    return box
}
