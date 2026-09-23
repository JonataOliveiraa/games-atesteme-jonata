import Phaser from 'phaser'
import { Ease, FX, type FxTarget, type Typewriter } from '../../../../shared/effects/FX'
import { HAPPY_TEXTURE } from '../data/routines'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, DRUM, GUIDE, H, PANEL, PATH, REFUSE, W } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

export interface SayOptions {
    /** Sem botão, a fala termina quando acaba de ser escrita — é legenda de gesto. */
    button?: string
    /** O botão só acende quando isto resolver: a demonstração tem de acabar antes. */
    ready?: Promise<unknown>
}

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O MENINO DA ROTINA
 * ══════════════════════════════════════════════════════════════════════
 *
 * O tutorial é ele falando: a frase sai letra a letra e espera o botão, e
 * enquanto ele fala o jogo de verdade acontece à vista — a figura anda, o
 * dedo bate, a peça voa para cima. O resto da tela fica sob o véu
 * (`createSpotlight`), para o olho não ter onde se perder.
 *
 * Um toque no balão completa a frase para quem lê rápido. O botão só aparece
 * depois que a frase terminou E a demonstração acabou.
 */
export function createGuide(scene: Phaser.Scene) {
    const root = scene.add.container(GUIDE.x, GUIDE.bottom).setDepth(DEPTH.balloon).setAlpha(0)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: GUIDE.text,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: GUIDE.w - 56 },
        lineSpacing: 4,
    }).setOrigin(0.5, 0).setResolution(2)

    const button = scene.add.container(0, 0).setAlpha(0)
    const buttonBg = scene.add.graphics()
    const buttonText = scene.add.text(0, -2, '', {
        fontFamily: FONT.black, fontSize: '26px', color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    buttonText.setStroke(CSS.ink, 4)
    button.add([buttonBg, buttonText])

    const avatar = scene.add.container(0, 0)
    const avatarBg = scene.add.graphics()
    const r = GUIDE.avatar / 2
    avatarBg.fillStyle(C.ink, 1)
    avatarBg.fillCircle(0, 4, r + 4)
    avatarBg.fillStyle(C.coral, 1)
    avatarBg.fillCircle(0, 0, r + 2)
    avatarBg.fillStyle(C.cream, 1)
    avatarBg.fillCircle(0, 0, r - 4)
    avatar.add(avatarBg)
    if (scene.textures.exists(HAPPY_TEXTURE)) {
        avatar.add(scene.add.image(0, 2, HAPPY_TEXTURE).setDisplaySize(GUIDE.avatar * 0.92, GUIDE.avatar * 0.92))
    }

    root.add([bg, text, button, avatar])

    const skipZone = scene.add.zone(0, 0, 10, 10).setOrigin(0.5).setDepth(DEPTH.balloon + 5)
    const buttonZone = scene.add.zone(0, 0, 10, 10).setOrigin(0.5).setDepth(DEPTH.balloon + 6)

    const BTN = { w: 250, h: 62 }
    const PAD = 24
    const AVATAR_CLEAR = 22

    let writer: Typewriter | null = null
    let release: (() => void) | null = null
    let token = 0

    function paint(withButton: boolean) {
        // o rosto fica no canto de cima: a primeira linha desce para não passar por baixo dele
        const textH = text.height
        const h = PAD + AVATAR_CLEAR + textH + PAD + (withButton ? BTN.h + 14 : 0)
        const top = -h

        bg.clear()
        bg.fillStyle(C.ink, 0.22)
        bg.fillRoundedRect(-GUIDE.w / 2 + 4, top + 8, GUIDE.w, h, 30)
        bg.fillStyle(C.ink, 1)
        bg.fillRoundedRect(-GUIDE.w / 2, top, GUIDE.w, h, 30)
        bg.fillStyle(C.creamEdge, 1)
        bg.fillRoundedRect(-GUIDE.w / 2 + 5, top + 5, GUIDE.w - 10, h - 10, 26)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-GUIDE.w / 2 + 5, top + 5, GUIDE.w - 10, h - 16, 26)

        text.setPosition(0, top + PAD + AVATAR_CLEAR)
        avatar.setPosition(-GUIDE.w / 2 + 10, top - 6)
        button.setPosition(0, -PAD - BTN.h / 2 + 4)

        skipZone.setPosition(GUIDE.x, GUIDE.bottom - h / 2).setSize(GUIDE.w, h)
        buttonZone.setPosition(GUIDE.x, GUIDE.bottom + button.y).setSize(BTN.w + 20, BTN.h + 16)
    }

    function paintButton(label: string) {
        buttonText.setText(label)
        buttonBg.clear()
        buttonBg.fillStyle(C.ink, 1)
        buttonBg.fillRoundedRect(-BTN.w / 2, -BTN.h / 2 + 5, BTN.w, BTN.h, BTN.h / 2)
        buttonBg.fillStyle(C.okDark, 1)
        buttonBg.fillRoundedRect(-BTN.w / 2, -BTN.h / 2, BTN.w, BTN.h, BTN.h / 2)
        buttonBg.fillStyle(C.ok, 1)
        buttonBg.fillRoundedRect(-BTN.w / 2 + 4, -BTN.h / 2 + 4, BTN.w - 8, BTN.h - 12, (BTN.h - 12) / 2)
        buttonBg.fillStyle(C.white, 0.28)
        buttonBg.fillRoundedRect(-BTN.w / 2 + 20, -BTN.h / 2 + 9, BTN.w - 40, 10, 5)
    }

    skipZone.on('pointerdown', () => writer?.skip())
    buttonZone.on('pointerdown', () => {
        const done = release
        if (!done) return
        release = null
        buttonZone.disableInteractive()
        FX.kill(scene, fx(button))
        button.setAlpha(1)
        void FX.seq(
            () => FX.to(scene, fx(button), { scale: 0.92 }, { duration: 70 }),
            () => FX.to(scene, fx(button), { scale: 1 }, { duration: 160, ease: Ease.back(3) }),
        )
        done()
    })

    return {
        async say(line: string, opts: SayOptions = {}) {
            const mine = ++token
            release?.()
            release = null
            buttonZone.disableInteractive()

            text.setText(line)
            paint(!!opts.button)
            text.setText('')
            // o clique pode cair no meio da entrada do botão anterior: sem matar o
            // tween, ele termina depois e devolve o botão velho à fala nova
            FX.kill(scene, fx(button))
            button.setAlpha(0).setScale(1)

            if (root.alpha < 1) {
                root.setScale(0.9)
                void FX.to(scene, fx(root), { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
            } else {
                void FX.impact(scene, fx(avatar), 0.12)
            }

            skipZone.setInteractive()
            writer = FX.type(scene, text, line, { delay: 30 })
            await writer
            writer = null
            skipZone.disableInteractive()
            if (mine !== token) return

            if (opts.ready) await opts.ready
            if (mine !== token || !opts.button) return

            paintButton(opts.button)
            button.setScale(0.6)
            void FX.to(scene, fx(button), { alpha: 1, scale: 1 }, { duration: 260, ease: Ease.back(2.4) })

            await new Promise<void>(resolve => {
                release = resolve
                buttonZone.setInteractive({ useHandCursor: true })
            })
        },

        async hide() {
            token++
            writer?.skip()
            release?.()
            release = null
            skipZone.disableInteractive()
            buttonZone.disableInteractive()
            await FX.to(scene, fx(root), { alpha: 0, scale: 0.92 }, { duration: 200 })
        },

        destroy() {
            token++
            release?.()
            release = null
            FX.kill(scene, [fx(root), fx(button), fx(avatar)])
            skipZone.destroy()
            buttonZone.destroy()
            root.destroy(true)
        },
    }
}

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O DEDO DA DEMONSTRAÇÃO
 * ══════════════════════════════════════════════════════════════════════
 *
 * Um dedo de mentira que chega até o botão e BATE nele — o botão afunda, o
 * som toca e a figura reage de verdade. Toque, não trajeto: ele nunca arrasta.
 */
export function createFinger(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.fx).setAlpha(0)
    const ripple = scene.add.graphics().setAlpha(0)
    const tip = scene.add.graphics()
    tip.fillStyle(C.ink, 0.3)
    tip.fillCircle(3, 6, 34)
    tip.fillStyle(C.white, 0.55)
    tip.fillCircle(0, 0, 34)
    tip.lineStyle(6, C.ink, 1)
    tip.strokeCircle(0, 0, 34)
    tip.lineStyle(4, C.white, 1)
    tip.strokeCircle(0, 0, 29)
    tip.fillStyle(C.ink, 1)
    tip.fillCircle(0, 0, 10)
    root.add([ripple, tip])

    let loop: Phaser.Time.TimerEvent | null = null

    // o dedo bate na parte de baixo do botão: no meio ele tapava a mãozinha
    // desenhada, e a criança via um círculo branco em vez do botão que importa
    const AIM = { dx: 26, dy: 48 }

    async function press(onHit?: () => void) {
        await FX.to(scene, fx(tip), { scale: 0.7 }, { duration: 160, ease: 'Sine.easeIn' })
        onHit?.()
        ripple.clear()
        ripple.lineStyle(6, C.white, 1)
        ripple.strokeCircle(0, 0, 36)
        ripple.setScale(0.6).setAlpha(1)
        void FX.to(scene, fx(ripple), { scale: 2.2, alpha: 0 }, { duration: 520 })
        await FX.to(scene, fx(tip), { scale: 1 }, { duration: 220, ease: Ease.back(2) })
    }

    async function arrive(bx: number, by: number) {
        const x = bx + AIM.dx
        const y = by + AIM.dy
        if (root.alpha < 0.5) {
            root.setPosition(x + 90, y + 110).setAlpha(0)
            await FX.to(scene, fx(root), { x, y, alpha: 1 }, { duration: 420, ease: 'Sine.easeOut' })
        } else {
            await FX.to(scene, fx(root), { x, y }, { duration: 320, ease: 'Sine.easeInOut' })
        }
    }

    function stopLoop() {
        loop?.remove()
        loop = null
    }

    return {
        /** Vai até o ponto e bate uma vez. `onHit` dispara no fundo do toque. */
        async tap(x: number, y: number, onHit?: () => void) {
            stopLoop()
            await arrive(x, y)
            await press(onHit)
        },

        /** Bate de novo e de novo no mesmo lugar, até a criança bater. */
        loop(x: number, y: number) {
            stopLoop()
            void arrive(x, y).then(() => press())
            loop = scene.time.addEvent({ delay: 1300, loop: true, callback: () => void press() })
        },

        hide() {
            stopLoop()
            void FX.to(scene, fx(root), { alpha: 0 }, { duration: 200 })
        },

        destroy() {
            stopLoop()
            FX.kill(scene, [fx(root), fx(tip), fx(ripple)])
            root.destroy(true)
        },
    }
}

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O VÉU
 * ══════════════════════════════════════════════════════════════════════
 *
 * Durante o tutorial a tela escurece, e só fica acesa a parte de que o
 * menino está falando — a partitura, o caminho, o tambor, a mãozinha. É o
 * mesmo recorte do `createTutorial`: a criança não precisa achar o botão,
 * ele é a única coisa clara além do balão.
 *
 * O véu fica ABAIXO do balão e do dedo, e acima de todo o resto. Ele não
 * pega toque: quem decide o que vale no tutorial é a cena.
 */
export type Focus = 'strip' | 'path' | 'drum' | 'hand'

type Hole =
    | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number }
    | { kind: 'ellipse'; x: number; y: number; w: number; h: number }

const HOLES: Record<Focus, Hole> = {
    strip: { kind: 'rect', x: PANEL.x - 6, y: PANEL.y - 6, w: PANEL.w + 12, h: PANEL.h + 20, r: PANEL.r + 6 },
    path: { kind: 'rect', x: -20, y: PATH.top - 10, w: W + 40, h: PATH.h + 22, r: PATH.r },
    drum: { kind: 'ellipse', x: DRUM.x, y: DRUM.y - 8, w: DRUM.size * 1.12, h: DRUM.size * 1.02 },
    hand: { kind: 'ellipse', x: REFUSE.x, y: REFUSE.y, w: REFUSE.r * 2.7, h: REFUSE.r * 2.7 },
}

export function createSpotlight(scene: Phaser.Scene) {
    const veil = scene.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(DEPTH.balloon - 2).setAlpha(0)
    const rim = scene.add.graphics().setDepth(DEPTH.balloon - 1).setAlpha(0)
    let current = ''

    function paint(focus: Focus[]) {
        const cut = scene.make.graphics({ x: 0, y: 0 }, false)
        cut.fillStyle(0xffffff, 1)
        rim.clear()
        rim.lineStyle(5, C.cream, 0.75)
        for (const hole of focus.map(f => HOLES[f])) {
            if (hole.kind === 'rect') {
                cut.fillRoundedRect(hole.x, hole.y, hole.w, hole.h, hole.r)
                rim.strokeRoundedRect(hole.x, hole.y, hole.w, hole.h, hole.r)
            } else {
                cut.fillEllipse(hole.x, hole.y, hole.w, hole.h)
                rim.strokeEllipse(hole.x, hole.y, hole.w, hole.h)
            }
        }
        veil.clear()
        veil.fill(0x0b1220, 0.78)
        veil.erase(cut, 0, 0)
        cut.destroy()
    }

    return {
        /** Acende só estas partes. Trocar de foco é um piscar curto, não um corte seco. */
        async show(...focus: Focus[]) {
            const key = focus.join(',')
            if (key === current && veil.alpha > 0.9) return
            current = key

            if (veil.alpha < 0.05) {
                paint(focus)
                await FX.all(
                    FX.to(scene, fx(veil), { alpha: 1 }, { duration: 280 }),
                    FX.to(scene, fx(rim), { alpha: 1 }, { duration: 280 }),
                )
                return
            }
            await FX.all(
                FX.to(scene, fx(veil), { alpha: 0.55 }, { duration: 110 }),
                FX.to(scene, fx(rim), { alpha: 0 }, { duration: 110 }),
            )
            paint(focus)
            await FX.all(
                FX.to(scene, fx(veil), { alpha: 1 }, { duration: 170 }),
                FX.to(scene, fx(rim), { alpha: 1 }, { duration: 170 }),
            )
        },

        async hide() {
            current = ''
            await FX.all(
                FX.to(scene, fx(veil), { alpha: 0 }, { duration: 260 }),
                FX.to(scene, fx(rim), { alpha: 0 }, { duration: 260 }),
            )
        },

        destroy() {
            FX.kill(scene, [fx(veil), fx(rim)])
            veil.destroy()
            rim.destroy()
        },
    }
}
