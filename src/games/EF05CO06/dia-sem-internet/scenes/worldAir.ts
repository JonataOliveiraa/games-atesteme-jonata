import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import {
    CLOUD_AIR,
    DEPTH,
    FAN_AIR,
    GROUND_AIR,
    LINK_AIR,
    PC_AIR,
    PHONE_AIR,
    VIEW_AIR,
    WORLD_AIR,
} from '../data/layout'
import { C } from '../data/theme'
import type { Place } from '../types'
import { createDeck } from './cards'
import { paintSky } from './sky'
import type { World } from './worldTypes'

const fx = (o: unknown) => o as unknown as FxTarget

type Device = 'pc' | 'phone'
const DEVICES: Device[] = ['pc', 'phone']

/** Quantos pontinhos desenham cada onda. */
const DOTS = 18

/**
 * O MUNDO DEITADO — nível 3.
 *
 * O computador à esquerda, o celular à direita, e **a nuvem por cima dos dois**,
 * alcançando cada um por onda. Não há cabo em lugar nenhum, e é essa ausência
 * que o nível inteiro discute.
 *
 * Duas decisões de desenho carregam a aula:
 *
 * - **a ligação é feita de pontinhos**, nunca de um traço cheio. Pontinho é o
 *   desenho de "sem fio"; uma linha contínua seria dizer exatamente a coisa
 *   errada num nível que existe para tirar o cabo da história;
 * - **quando um aparelho perde o sinal, a nuvem NÃO apaga.** Só a onda daquele
 *   aparelho apaga, e um X pousa em cima do leque de sinal dele. No nível 2 quem
 *   apagava era a nuvem, porque ali o que quebrava era o caminho de todo mundo;
 *   aqui é de um só, e a criança tem de ver essa diferença na tela.
 */
export function createWorldAir(scene: Phaser.Scene): World {
    const root = scene.add.container(VIEW_AIR.pc, 0).setDepth(DEPTH.sky)

    /* ───────────────────────────── o cenário ──────────────────────────── */

    root.add(paintSky(scene, 0, 0, WORLD_AIR.w, GROUND_AIR.y + 40))

    const ground = scene.add.graphics()
    ground.fillStyle(0xe6c98f, 1)
    ground.fillRect(0, GROUND_AIR.y, WORLD_AIR.w, WORLD_AIR.h - GROUND_AIR.y)
    ground.fillStyle(0xd8a45f, 1)
    ground.fillRect(0, GROUND_AIR.y, WORLD_AIR.w, 12)
    root.add(ground)

    /* ─────────────────────────────── a nuvem ──────────────────────────── */

    const cloudArt = scene.textures.exists('nuvem')
        ? scene.add
              .image(CLOUD_AIR.cx, CLOUD_AIR.top, 'nuvem')
              .setOrigin(0.5, 0)
              .setDisplaySize(CLOUD_AIR.w, CLOUD_AIR.h)
        : undefined

    if (cloudArt) {
        root.add(cloudArt)
    } else {
        const g = scene.add.graphics()
        const x = CLOUD_AIR.cx - CLOUD_AIR.w / 2
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(x, CLOUD_AIR.top, CLOUD_AIR.w, CLOUD_AIR.h, 62)
        g.fillStyle(C.sky, 1)
        g.fillRoundedRect(x + 8, CLOUD_AIR.top + 8, CLOUD_AIR.w - 16, CLOUD_AIR.h - 16, 55)
        root.add(g)
    }

    /* ────────────────────────── os dois aparelhos ─────────────────────── */

    if (scene.textures.exists('computador')) {
        root.add(
            scene.add
                .image(PC_AIR.cx, PC_AIR.top, 'computador')
                .setOrigin(0.5, 0)
                .setDisplaySize(PC_AIR.w, PC_AIR.h),
        )
    } else {
        const g = scene.add.graphics()
        const x = PC_AIR.cx - PC_AIR.w / 2
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(x, PC_AIR.top, PC_AIR.w, PC_AIR.h - 40, 22)
        g.fillStyle(0xdbe7f0, 1)
        g.fillRoundedRect(x + 16, PC_AIR.top + 16, PC_AIR.w - 32, PC_AIR.h - 72, 13)
        g.fillStyle(C.navy, 1)
        g.fillRoundedRect(PC_AIR.cx - 52, PC_AIR.top + PC_AIR.h - 40, 104, 24, 8)
        g.fillRoundedRect(PC_AIR.cx - 96, PC_AIR.top + PC_AIR.h - 20, 192, 18, 9)
        root.add(g)
    }

    /**
     * O CELULAR ainda é `Graphics`.
     *
     * Ele é o único objeto do jogo sem folha própria, e por isso nasce aqui em
     * retângulos: corpo escuro, tela clara, a listra do alto-falante e o botão
     * de baixo. Quando `celular.png` chegar, é só trocar este bloco — o contrato
     * está no TEXTURAS.md §7.
     */
    const phoneBody = scene.add.graphics()
    const { cx: px, cy: py, w: pw, h: ph } = PHONE_AIR
    if (scene.textures.exists('celular')) {
        root.add(scene.add.image(px, py, 'celular').setDisplaySize(pw, ph))
    } else {
        phoneBody.fillStyle(C.shadow, 0.16)
        phoneBody.fillRoundedRect(-pw / 2 + 4, -ph / 2 + 8, pw, ph, 28)
        phoneBody.fillStyle(C.navy, 1)
        phoneBody.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 28)
        phoneBody.fillStyle(0xdbe7f0, 1)
        phoneBody.fillRoundedRect(-pw / 2 + 14, -ph / 2 + 42, pw - 28, ph - 82, 12)
        phoneBody.fillStyle(C.navySoft, 1)
        phoneBody.fillRoundedRect(-26, -ph / 2 + 20, 52, 8, 4)
        phoneBody.lineStyle(5, C.navySoft, 1)
        phoneBody.strokeCircle(0, ph / 2 - 21, 13)
        phoneBody.setPosition(px, py)
        root.add(phoneBody)
    }

    /* ─────────────────────── as ondas, e o sinal de cada um ───────────── */

    const link: Record<Device, Phaser.GameObjects.Graphics> = {
        pc: scene.add.graphics(),
        phone: scene.add.graphics(),
    }
    const fan: Record<Device, Phaser.GameObjects.Graphics> = {
        pc: scene.add.graphics(),
        phone: scene.add.graphics(),
    }
    DEVICES.forEach(d => {
        root.add(link[d])
        root.add(fan[d])
    })

    const reach: Record<Device, boolean> = { pc: true, phone: true }

    /** Um ponto da curva de Bézier quadrática que liga a nuvem ao aparelho. */
    const curve = (d: Device, t: number) => {
        const c = LINK_AIR[d]
        const u = 1 - t
        return {
            x: u * u * c.x0 + 2 * u * t * c.cx + t * t * c.x1,
            y: u * u * c.y0 + 2 * u * t * c.cy + t * t * c.y1,
        }
    }

    const paintLink = (d: Device) => {
        const g = link[d]
        g.clear()
        const on = reach[d]
        for (let i = 0; i <= DOTS; i++) {
            const p = curve(d, i / DOTS)
            g.fillStyle(on ? C.creamSoft : C.grey, on ? 0.75 : 0.35)
            g.fillCircle(p.x, p.y, on ? 8 : 6)
            g.fillStyle(on ? C.orange : C.greyDeep, on ? 1 : 0.4)
            g.fillCircle(p.x, p.y, on ? 4.5 : 3)
        }
    }

    /**
     * O LEQUE DE SINAL, encostado em cada aparelho.
     *
     * Três arcos abertos na direção da nuvem — o desenho universal de "tem
     * sinal". É a peça que apaga e ganha um X quando o aparelho perde o alcance,
     * e ela fica GRUDADA no aparelho de propósito: o que caiu foi ele.
     */
    const fanAt = (d: Device) => FAN_AIR[d]

    const paintFan = (d: Device) => {
        const g = fan[d]
        const a = fanAt(d)
        g.clear()
        const base = -Math.PI / 2
        for (let i = 0; i < 3; i++) {
            const r = 20 + i * 16
            g.lineStyle(9, C.creamSoft, reach[d] ? 0.9 : 0.25)
            g.beginPath()
            g.arc(a.x, a.y, r, base - 0.62, base + 0.62, false)
            g.strokePath()
            g.lineStyle(5, reach[d] ? C.orange : C.grey, reach[d] ? 1 : 0.5)
            g.beginPath()
            g.arc(a.x, a.y, r, base - 0.62, base + 0.62, false)
            g.strokePath()
        }
        if (reach[d]) return

        // o X: ele não substitui o leque apagado, ele se soma
        g.lineStyle(13, C.creamSoft, 0.95)
        g.lineBetween(a.x - 24, a.y - 62, a.x + 24, a.y - 14)
        g.lineBetween(a.x + 24, a.y - 62, a.x - 24, a.y - 14)
        g.lineStyle(7, C.red, 1)
        g.lineBetween(a.x - 24, a.y - 62, a.x + 24, a.y - 14)
        g.lineBetween(a.x + 24, a.y - 62, a.x - 24, a.y - 14)
    }

    /* ────────────────────────────── o pulso ───────────────────────────── */

    const pulse = scene.add.graphics()
    root.add(pulse)
    const loops: Partial<Record<Device, Phaser.Tweens.Tween>> = {}
    const heads: Partial<Record<Device, number>> = {}

    const paintPulse = () => {
        pulse.clear()
        DEVICES.forEach(d => {
            const t = heads[d]
            if (t === undefined || !reach[d]) return
            const p = curve(d, t)
            pulse.fillStyle(C.creamSoft, 0.5)
            pulse.fillCircle(p.x, p.y, 15)
            pulse.fillStyle(C.orange, 1)
            pulse.fillCircle(p.x, p.y, 9)
        })
    }

    const runPulse = (d: Device, ms: number, loop: boolean) => {
        loops[d]?.remove()
        loops[d] = scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: FX.ms(scene, ms),
            repeat: loop ? -1 : 0,
            repeatDelay: FX.ms(scene, 700),
            ease: 'Sine.easeInOut',
            onUpdate: tw => {
                heads[d] = tw.getValue() ?? 0
                paintPulse()
            },
            onComplete: () => {
                if (!loop) runPulse(d, 1700, true)
            },
        })
    }

    const stopPulse = (d: Device) => {
        loops[d]?.remove()
        loops[d] = undefined
        heads[d] = undefined
        paintPulse()
    }

    /* ────────────────────── os arquivos, em vitrine ───────────────────── */

    const anchorOf = (place: Place): { cx: number; cy: number } =>
        place === 'cloud'
            ? { cx: CLOUD_AIR.cx, cy: CLOUD_AIR.cardCy }
            : place === 'phone'
              ? { cx: PHONE_AIR.cx, cy: PHONE_AIR.cardCy }
              : { cx: PC_AIR.cx, cy: PC_AIR.cardCy }

    const onScreen = (x: number, y: number) => ({ x: x + root.x, y })

    const deck = createDeck(scene, root, {
        anchor: anchorOf,
        onScreen,
        drift: place => (place === 'cloud' ? 7 : 3),
    })

    const bodyOf = (d: Device) => (d === 'pc' ? { x: PC_AIR.cx, y: PC_AIR.cardCy } : { x: PHONE_AIR.cx, y: PHONE_AIR.cy })

    DEVICES.forEach(d => {
        paintLink(d)
        paintFan(d)
    })

    return {
        mount: async slots => {
            DEVICES.forEach(d => {
                reach[d] = true
                paintLink(d)
                paintFan(d)
                runPulse(d, 1700, true)
            })
            await deck.mount(slots)
        },

        stage: () => root,

        cardPoint: where => (deck.at(where).length ? deck.point(where) : bodyOf(where as Device)),

        lightLink: () => DEVICES.forEach(d => runPulse(d, 1500, false)),

        /**
         * QUEM CAI É UM APARELHO, e a nuvem fica onde estava.
         *
         * A onda dele se apaga de uma ponta à outra — da nuvem para baixo, no
         * sentido em que os dados vinham —, a tela treme, e o X pousa no leque.
         * Nenhum cadeado em cartão nenhum: o que está guardado dentro do
         * aparelho continua abrindo, e é isso que o pedido seguinte cobra.
         */
        breakLink: async who => {
            const d = who as Device
            stopPulse(d)

            const at = fanAt(d)
            const spark = onScreen(at.x, at.y - 40)
            void FX.sparks(scene, spark.x, spark.y, { color: C.red, count: 20 })
            FX.shakeCam(scene, 'medio')

            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, 520),
                    onUpdate: tw => {
                        const t = tw.getValue() ?? 0
                        const g = link[d]
                        g.clear()
                        for (let i = 0; i <= DOTS; i++) {
                            const k = i / DOTS
                            const dead = k <= t
                            const p = curve(d, k)
                            g.fillStyle(dead ? C.grey : C.creamSoft, dead ? 0.35 : 0.75)
                            g.fillCircle(p.x, p.y, dead ? 6 : 8)
                            g.fillStyle(dead ? C.greyDeep : C.orange, dead ? 0.4 : 1)
                            g.fillCircle(p.x, p.y, dead ? 3 : 4.5)
                        }
                    },
                    onComplete: () => resolve(),
                })
            })

            reach[d] = false
            paintLink(d)

            fan[d].setAlpha(0)
            paintFan(d)
            await FX.to(scene, fx(fan[d]), { alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, 240)
        },

        /**
         * O cartão acende ONDE O ARQUIVO ESTÁ.
         *
         * Se ele estava na nuvem e a criança pediu por um aparelho, é o cartão
         * LÁ EM CIMA que acende, e um pulso desce a onda até o aparelho. É o
         * desenho da frase que o nível ensina: o arquivo não está no celular,
         * ele chegou até ele.
         */
        openAt: async (where, fileId, via) => {
            await deck.open(where, fileId)
            if (where !== 'cloud' || via === 'cloud') return
            runPulse(via as Device, 620, false)
            await FX.wait(scene, 620)
        },

        denyAt: async target => {
            if (deck.at(target).length) {
                await deck.deny(target)
                return
            }
            // aparelho sem nada guardado: quem treme é o leque de sinal dele
            await FX.shake(scene, fx(fan[target as Device]), { amount: 13 })
        },

        destroy: () => {
            DEVICES.forEach(stopPulse)
            deck.clear()
            root.destroy()
        },
    }
}
