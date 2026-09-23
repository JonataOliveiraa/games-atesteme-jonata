import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, H, TABLET, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createCareRibbon(scene: Phaser.Scene, text: string) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.seal)

    const label = scene.add.text(0, 0, text, {
        fontFamily: FONT.black,
        fontSize: '20px',
        color: CSS.gold,
        align: 'center',
        wordWrap: { width: 300 },
    }).setOrigin(0.5).setResolution(2)

    const w = Math.min(360, label.width + 40)
    const h = label.height + 24

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.26)
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 15)
    g.fillStyle(C.goldDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 15)
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 10, 12)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 14, 12)

    root.add([g, label])
    return root
}

/**
 * O RECADO DO CUIDADO FICA PARADO.
 *
 * Antes ele nascia colado embaixo do perigo e subia junto com a bolha: a
 * criança tentava ler uma frase que andava e sumia em um segundo. Agora ele
 * aparece no lugar de onde o perigo saiu — é ali que o olho já está —, fica
 * parado o bastante para ser lido e só então se apaga. A bolha sobe sozinha.
 *
 * Mora ABAIXO dos perigos (`DEPTH.care`): o jogo não para, e um perigo da
 * mesma faixa que passar por ali tem de continuar à vista e tocável.
 */
export async function showCareRibbon(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    { hold = 2000, delay = 0 } = {},
) {
    // o perigo e a bolha saem do mesmo ponto: esperar um instante deixa os
    // dois começarem a subir antes, em vez de passarem por cima da frase
    if (delay) await FX.wait(scene, delay)
    const ribbon = createCareRibbon(scene, text).setDepth(DEPTH.care)
    // dentro do VIDRO do tablet: perigo preso na beirada fica em x 1150, e a
    // faixa centrada ali invadia a moldura
    const half = ribbon.getBounds().width / 2
    const glass = TABLET.w / 2 - TABLET.bezel - 12
    ribbon.setPosition(
        Phaser.Math.Clamp(x, TABLET.cx - glass + half, TABLET.cx + glass - half),
        y,
    )
    ribbon.setScale(0.6).setAlpha(0)

    await FX.to(scene, ribbon, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(2.4) })
    await FX.wait(scene, hold)
    await FX.to(scene, ribbon, { alpha: 0, y: y + 12 }, { duration: 320 })
    ribbon.destroy(true)
}

export async function showSafeSeal(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    hold: number,
) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.seal)

    const title = scene.add.text(0, -22, 'SEGURO!', {
        fontFamily: FONT.black,
        fontSize: '21px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    title.setStroke(CSS.ink, 5)

    const line = scene.add.text(0, 12, text, {
        fontFamily: FONT.black,
        fontSize: '20px',
        color: CSS.ok,
        align: 'center',
        wordWrap: { width: 320 },
    }).setOrigin(0.5).setResolution(2)

    const w = Math.min(400, Math.max(260, line.width + 48))
    const h = line.height + 62

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 20)
    g.fillStyle(C.okDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
    g.fillStyle(C.ok, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 14, 16)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 36, w - 10, h - 46, 16)

    const tail = scene.add.graphics()
    tail.fillStyle(C.okDark, 1)
    tail.fillTriangle(-16, h / 2 - 2, 16, h / 2 - 2, 0, h / 2 + 20)

    root.add([g, tail, title, line])

    const px = Phaser.Math.Clamp(x, w / 2 + 24, W - w / 2 - 24)
    const py = Phaser.Math.Clamp(y - 132, 150, H - 190)
    root.setPosition(px, py).setScale(0.6).setAlpha(0)

    await FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(2.4) })
    await FX.wait(scene, hold)
    await FX.to(scene, root, { alpha: 0, scale: 0.9 }, { duration: 200 })
    root.destroy(true)
}
