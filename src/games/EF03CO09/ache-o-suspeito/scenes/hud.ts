import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, originOf, PHOTO_BOX, SHEET } from '../data/art'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const ORDER = 'Toque no compartilhamento suspeito.'

function paintDot(g: Phaser.GameObjects.Graphics, x: number, done: boolean) {
    const y = HUD.cy
    const r = HUD.dotR
    g.fillStyle(C.ink, done ? 1 : 0.4)
    g.fillCircle(x, y, r + 3)
    g.fillStyle(done ? C.green : C.paperDeep, 1)
    g.fillCircle(x, y, r)
    if (!done) return
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(x - 6, y)
    g.lineTo(x - 2, y + 5)
    g.lineTo(x + 7, y - 5)
    g.strokePath()
}

export interface HudOptions {
    /** O nível em jogo (1 a 3), escrito na pílula ao lado das bolinhas. */
    level: number
    waves: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.28)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.blueDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.blue, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.14)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.cyan, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    root.add(bar)

    const frame = scene.add.graphics()
    frame.fillStyle(C.ink, 1)
    frame.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR + 4)
    frame.fillStyle(C.paper, 1)
    frame.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR)
    root.add(frame)

    if (scene.textures.exists(SHEET.photo)) {
        const photo = scene.add.image(HUD.avatarX, HUD.cy, SHEET.photo)
        const origin = originOf(PHOTO_BOX, 500, 500)
        photo.setOrigin(origin.x, origin.y)
        photo.setScale(fitInside(PHOTO_BOX, HUD.avatarR * 2.1, HUD.avatarR * 2.1))
        const mask = scene.add.graphics().setVisible(false)
        mask.fillStyle(0xffffff, 1)
        mask.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR)
        photo.setMask(mask.createGeometryMask())
        root.add(photo)
    }

    const halo = scene.add.graphics().setPosition(HUD.avatarX, HUD.cy).setAlpha(0)
    halo.lineStyle(6, C.green, 1)
    halo.strokeCircle(0, 0, HUD.avatarR + 8)
    root.add(halo)

    const dots = scene.add.graphics()
    const dotX = (index: number) => HUD.dotX + index * HUD.dotGap
    const paintDots = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.waves; i++) paintDot(dots, dotX(i), i < done)
    }
    paintDots(0)
    root.add(dots)

    // O NÍVEL, logo depois das bolinhas: é o lado em que os outros jogos do
    // catálogo mostram "NÍVEL N". A pílula tem o mesmo acabamento do `?` —
    // anel escuro, miolo claro e sombra — para ler como parte do cabeçalho.
    const levelText = scene.add
        .text(0, HUD.cy, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    const levelW = Math.ceil(levelText.width) + HUD.levelPadX * 2
    const levelH = HUD.levelH
    const levelX = dotX(options.waves - 1) + HUD.dotR + HUD.levelGap + levelW / 2
    levelText.setX(levelX)

    const levelG = scene.add.graphics()
    const left = levelX - levelW / 2
    const top = HUD.cy - levelH / 2
    levelG.fillStyle(C.ink, 0.26)
    levelG.fillRoundedRect(left + 2, top + 5, levelW, levelH, levelH / 2)
    levelG.fillStyle(C.ink, 1)
    levelG.fillRoundedRect(left - 3, top - 3, levelW + 6, levelH + 6, (levelH + 6) / 2)
    levelG.fillStyle(C.paper, 1)
    levelG.fillRoundedRect(left, top, levelW, levelH, levelH / 2)
    root.add([levelG, levelText])

    const order = scene.add
        .text(HUD.orderX, HUD.cy, ORDER, {
            fontFamily: FONT.black,
            fontSize: '23px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: HUD.orderW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    order.setStroke(CSS.ink, 5)
    root.add(order)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.26)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.white, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.paperDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        void FX.press(scene, helpG)
        options.onHelp()
    })

    return {
        setDone(done: number) {
            paintDots(done)
        },

        /**
         * O avatar recebe de volta o dado que a placa derrubada levaria.
         *
         * Quem cresce é o anel, e não o `frame`: aquele Graphics desenha em
         * coordenadas de tela, e escalar um desses o manda para fora do
         * cabeçalho, porque a escala parte de (0, 0) e não do círculo.
         */
        async catchData() {
            scene.tweens.killTweensOf(halo)
            halo.setAlpha(1).setScale(0.5)
            await FX.to(scene, halo, { scale: 1.5, alpha: 0 }, { duration: 520 })
        },

        async celebrate(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.green, { radius: 32, depth: DEPTH.hud + 2 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        /**
         * O recorte do tutorial em volta da ordem. Mede o TEXTO, e não a
         * largura máxima reservada para ele: com os 620 px da reserva o
         * recorte começava no meio da pílula do nível e a cortava ao meio.
         */
        orderBounds() {
            return { x: HUD.orderX, y: HUD.cy, w: Math.ceil(order.width) + 40, h: 62 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
