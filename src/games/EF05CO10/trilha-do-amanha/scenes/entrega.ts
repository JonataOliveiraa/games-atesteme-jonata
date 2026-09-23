import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W, WORLD, leitura } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { cutSheet, fitFrame } from './sheet'
import type { Encomenda, Entrega, Item, MotivoFalha } from '../types'

interface Ponto {
    x: number
    y: number
}

/** Avisa a cena para onde a mensagem vai, e em quanto tempo, para a câmera ir junto. */
export type OnTravel = (x: number, ms: number) => void

export function createEntrega(scene: Phaser.Scene) {
    let alive: Phaser.GameObjects.GameObject[] = []

    const keep = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
        alive.push(object)
        return object
    }

    const clear = () => {
        alive.forEach(object => {
            scene.tweens.killTweensOf(object)
            object.destroy()
        })
        alive = []
    }

    const soundWave = (from: Ponto, to: Ponto, tone: number, count: number, travel: number) => {
        const dir = Math.sign(to.x - from.x) || -1
        const span = Math.abs(to.x - from.x)

        for (let i = 0; i < count; i++) {
            const arc = keep(scene.add.graphics().setDepth(DEPTH.wave))
            arc.lineStyle(11, tone, 0.95)
            arc.beginPath()
            arc.arc(0, 0, 40, Phaser.Math.DegToRad(-56), Phaser.Math.DegToRad(56))
            arc.strokePath()
            arc.lineStyle(5, C.white, 0.6)
            arc.beginPath()
            arc.arc(0, 0, 40, Phaser.Math.DegToRad(-52), Phaser.Math.DegToRad(52))
            arc.strokePath()
            arc.setPosition(from.x, from.y)
            arc.setScale(dir, 1)
            arc.setAlpha(0)

            scene.tweens.add({
                targets: arc,
                x: from.x + dir * span,
                y: to.y,
                scaleY: 2.2,
                alpha: { from: 0.95, to: 0 },
                delay: FX.ms(scene, i * 170),
                duration: FX.ms(scene, travel),
                ease: 'Sine.easeOut',
                onComplete: () => arc.destroy(),
            })
        }
    }

    const deadMark = (from: Ponto, to: Ponto) => {
        const mark = keep(scene.add.graphics().setDepth(DEPTH.wave - 1))
        mark.lineStyle(7, C.warn, 0.85)
        const step = 26
        const dir = Math.sign(to.x - from.x) || -1
        for (let x = from.x; dir < 0 ? x > to.x : x < to.x; x += dir * step * 2) {
            mark.lineBetween(x, WORLD.groundY - 10, x + dir * step, WORLD.groundY - 10)
        }
        mark.setAlpha(0)
        scene.tweens.add({ targets: mark, alpha: 1, duration: FX.ms(scene, 320) })
    }

    /** Uma peça de folha posta num ponto, medida pela caixa alfa. */
    const peca = (
        sheet: Item['sheet'] | 'encomendas',
        coluna: number,
        at: Ponto,
        alvo: number,
        cor: number,
        linha = 0,
        cols = 3,
        rows = 2,
    ) => {
        const folha = cutSheet(scene, sheet, cols, rows)
        if (!folha) {
            const g = keep(scene.add.graphics().setDepth(DEPTH.wave))
            g.fillStyle(cor, 1)
            g.fillRoundedRect(-alvo / 2, -alvo / 3, alvo, (alvo * 2) / 3, 10)
            g.setPosition(at.x, at.y)
            return g as Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
        }
        const frame = linha * cols + coluna
        const fit = fitFrame(folha, frame, alvo, alvo)
        return keep(
            scene.add
                .image(at.x + fit.offsetX, at.y + fit.offsetY, sheet, String(frame))
                .setOrigin(0.5)
                .setDisplaySize(fit.width, fit.height)
                .setDepth(DEPTH.wave),
        ) as Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    }

    const badge = async (at: Ponto, text: string, tone: number) => {
        const mark = keep(
            scene.add
                .text(at.x, at.y - 60, text, {
                    fontFamily: FONT.black,
                    fontSize: '64px',
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.wave + 1),
        )
        mark.setStroke('#' + tone.toString(16).padStart(6, '0'), 12)
        mark.setScale(0.3).setAlpha(0)
        await FX.to(scene, mark, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
        await FX.wait(scene, 520)
    }

    /**
     * A chegada. O que veio some NA pessoa, e é por isso que o quadro dela
     * segurando a coisa, logo depois, lê como "recebi".
     */
    const entregue = async (
        flier: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null,
        to: Ponto,
    ) => {
        const anel = keep(scene.add.graphics().setDepth(DEPTH.wave - 1))
        anel.lineStyle(10, C.ok, 0.95)
        anel.strokeCircle(0, 0, 44)
        anel.setPosition(to.x, to.y).setScale(0.4)
        scene.tweens.add({
            targets: anel,
            scale: 2.4,
            alpha: 0,
            duration: FX.ms(scene, 620),
            ease: 'Cubic.easeOut',
        })

        if (flier) {
            await FX.to(scene, flier, { y: flier.y - 26, angle: 0 }, { duration: 200, ease: 'Sine.easeOut' })
            await FX.to(
                scene,
                flier,
                { x: to.x, y: to.y, scale: flier.scale * 0.42, alpha: 0 },
                { duration: 380, ease: 'Back.easeIn' },
            )
            flier.destroy()
        }

        void FX.stars(scene, to.x, to.y - 20, {
            color: 0x9ef0c0,
            count: 9,
            rise: 120,
            depth: DEPTH.wave + 2,
        })
        await FX.wait(scene, 320)
    }

    // ── megafone: a onda que atravessa, ou morre no meio ───────────────

    const megafone = async (from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const morre = motivo === 'longe'
        const stopX = morre ? from.x + (to.x - from.x) * 0.5 : to.x
        const travel = 1300

        onTravel?.(stopX, travel)
        soundWave(from, { x: stopX, y: to.y }, C.megafone, 6, travel)
        await FX.wait(scene, travel + 120)

        if (morre) {
            deadMark({ x: stopX, y: WORLD.groundY }, to)
            await badge({ x: stopX, y: to.y }, '…', C.warn)
            return
        }
        await entregue(null, to)
    }

    // ── telefone: ondas pelo ar, sem fio ───────────────────────────────

    /** Anéis que se abrem num ponto: o sinal saindo, ou o sinal chegando. */
    const signalRings = (at: Ponto, count: number) => {
        for (let i = 0; i < count; i++) {
            const ring = keep(scene.add.graphics().setDepth(DEPTH.wave - 1))
            ring.lineStyle(8, C.telefone, 0.9)
            ring.strokeCircle(0, 0, 30)
            ring.setPosition(at.x, at.y).setScale(0.5).setAlpha(0)
            scene.tweens.add({
                targets: ring,
                scale: 2.2,
                alpha: { from: 0.95, to: 0 },
                delay: FX.ms(scene, i * 150),
                duration: FX.ms(scene, 560),
                ease: 'Sine.easeOut',
                onComplete: () => ring.destroy(),
            })
        }
    }

    /**
     * Um trecho de onda senoidal que viaja de quem liga até quem atende. A
     * onda é o desenho do "sem fio": o megafone manda arcos de som que
     * perdem força; o telefone manda ondas que chegam inteiras e na hora.
     */
    const radioWave = (from: Ponto, to: Ponto, delay: number, travel: number) => {
        const wave = keep(scene.add.graphics().setDepth(DEPTH.wave))
        const length = 150
        const amp = 15
        const drawSine = (width: number, color: number, alpha: number) => {
            wave.lineStyle(width, color, alpha)
            wave.beginPath()
            for (let x = -length / 2; x <= length / 2; x += 4) {
                const y = Math.sin((x / length) * Math.PI * 6) * amp
                if (x === -length / 2) wave.moveTo(x, y)
                else wave.lineTo(x, y)
            }
            wave.strokePath()
        }
        drawSine(15, C.ink, 0.2)
        drawSine(9, C.telefone, 1)
        drawSine(3, C.white, 0.75)

        wave.setPosition(from.x, from.y)
        wave.setRotation(Math.atan2(to.y - from.y, to.x - from.x))
        wave.setAlpha(0)

        scene.tweens.add({
            targets: wave,
            x: to.x,
            y: to.y,
            delay: FX.ms(scene, delay),
            duration: FX.ms(scene, travel),
            ease: 'Linear',
            onUpdate: tween => wave.setAlpha(Math.min(1, Math.sin(tween.progress * Math.PI) * 2.4)),
            onComplete: () => wave.destroy(),
        })
    }

    const telefone = async (from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const travel = 900
        const packets = 3
        const gap = 170
        onTravel?.(to.x, travel + gap * (packets - 1))

        signalRings(from, 3)
        for (let i = 0; i < packets; i++) radioWave(from, to, 120 + i * gap, travel)
        await FX.wait(scene, 120 + travel + gap * (packets - 1))

        if (motivo !== 'semTelefone') signalRings(to, 2)
        await FX.wait(scene, 260)

        if (motivo === 'semTelefone') return badge(to, '✕', C.coral)
        if (motivo === 'naoEscuta') return badge(to, '…', C.warn)
        await entregue(null, to)
    }

    // ── carta: decola, a noite passa por cima dela, e ela pousa ────────

    const nightSweep = async () => {
        const night = keep(
            scene.add
                .rectangle(W / 2, H / 2, W * 3, H * 3, 0x1b2a63, 0)
                .setDepth(DEPTH.wave - 3)
                .setScrollFactor(0),
        )
        const moon = keep(
            scene.add
                .circle(W + 120, 210, 42, 0xfff3c4, 1)
                .setDepth(DEPTH.wave - 2)
                .setScrollFactor(0)
                .setAlpha(0),
        )

        const stars = keep(scene.add.graphics().setDepth(DEPTH.wave - 2).setScrollFactor(0).setAlpha(0))
        stars.fillStyle(0xffffff, 0.9)
        for (let i = 0; i < 16; i++) {
            stars.fillCircle(Phaser.Math.Between(40, W - 40), Phaser.Math.Between(60, 340), Phaser.Math.Between(2, 4))
        }

        scene.tweens.add({ targets: night, fillAlpha: 0.55, duration: FX.ms(scene, 520) })
        scene.tweens.add({ targets: [moon, stars], alpha: 1, duration: FX.ms(scene, 520) })
        await FX.to(scene, moon, { x: -120, y: 170 }, { duration: 1500, ease: 'Linear' })
        scene.tweens.add({ targets: night, fillAlpha: 0, duration: FX.ms(scene, 520) })
        await FX.to(scene, [moon, stars], { alpha: 0 }, { duration: 420 })
        moon.destroy()
        stars.destroy()
    }

    const carta = async (item: Item, from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const flier = peca(item.sheet, item.coluna, from, 84, item.cor)

        const meio = { x: from.x + (to.x - from.x) * 0.5, y: to.y - 150 }
        const leg = 900

        onTravel?.(meio.x, leg)
        await FX.to(scene, flier, { x: meio.x, y: meio.y, angle: -14 }, { duration: leg, ease: 'Linear' })

        const bob = scene.tweens.add({
            targets: flier,
            y: meio.y - 18,
            duration: FX.ms(scene, 900),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
        await nightSweep()
        bob.stop()

        onTravel?.(to.x, leg)
        await FX.to(scene, flier, { x: to.x + 70, y: to.y - 30, angle: 6 }, { duration: leg, ease: 'Linear' })

        if (motivo === 'longe') {
            deadMark(from, to)
            return
        }
        if (motivo === 'tarde') return badge(to, '✕', C.coral)
        await entregue(flier, to)
    }

    // ── nível 2: o veículo atravessando o terreno ─────────────────────

    const VEICULO_ALTURA = 150

    const poeira = (x: number, y: number) => {
        const puff = keep(scene.add.graphics().setDepth(DEPTH.wave - 1))
        puff.fillStyle(0xd9c3a0, 0.8)
        puff.fillCircle(0, 0, Phaser.Math.Between(9, 16))
        puff.setPosition(x, y)
        scene.tweens.add({
            targets: puff,
            y: y - 30,
            scale: 1.8,
            alpha: 0,
            duration: FX.ms(scene, 620),
            onComplete: () => puff.destroy(),
        })
    }

    const rastro = (alvo: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics, ms: number, dy: number) => {
        const timer = scene.time.addEvent({
            delay: 110,
            repeat: Math.floor(ms / 110),
            callback: () => poeira(alvo.x + 40, WORLD.groundY + dy),
        })
        return () => timer.remove()
    }

    const carroca = async (item: Item, from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const falha = motivo !== null
        const stopX = falha ? from.x + (to.x - from.x) * 0.5 : to.x
        const travel = falha ? 1200 : 1600
        const carro = peca(item.sheet, item.coluna, { x: from.x, y: WORLD.groundY - VEICULO_ALTURA * 0.42 }, VEICULO_ALTURA, item.cor, 1)

        onTravel?.(stopX, travel)
        const parar = rastro(carro, travel, -6)
        await FX.to(scene, carro, { x: stopX }, { duration: travel, ease: 'Linear' })
        parar()

        if (!falha) return entregue(carro, to)
        await FX.to(scene, carro, { y: carro.y + 16, angle: -7 }, { duration: 420, ease: 'Bounce.easeOut' })
        deadMark({ x: stopX, y: WORLD.groundY }, to)
        await badge({ x: stopX, y: WORLD.groundY - 120 }, '✕', C.coral)
    }

    const barco = async (item: Item, from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const falha = motivo !== null
        const stopX = falha ? from.x + (to.x - from.x) * 0.5 : to.x
        const travel = falha ? 1200 : 1600
        const nau = peca(item.sheet, item.coluna, { x: from.x, y: WORLD.groundY - VEICULO_ALTURA * 0.4 }, VEICULO_ALTURA, item.cor, 1)

        const balanco = scene.tweens.add({
            targets: nau,
            angle: 4,
            duration: FX.ms(scene, 700),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        onTravel?.(stopX, travel)
        await FX.to(scene, nau, { x: stopX }, { duration: travel, ease: 'Linear' })
        balanco.stop()

        if (!falha) return entregue(nau, to)
        await FX.to(scene, nau, { angle: -12, y: nau.y + 12 }, { duration: 420 })
        deadMark({ x: stopX, y: WORLD.groundY }, to)
        await badge({ x: stopX, y: WORLD.groundY - 120 }, '✕', C.coral)
    }

    const aviao = async (item: Item, from: Ponto, to: Ponto, motivo: MotivoFalha | null, onTravel?: OnTravel) => {
        const pesado = motivo === 'pesado'
        const chao = WORLD.groundY - VEICULO_ALTURA * 0.4
        const plano = peca(item.sheet, item.coluna, { x: from.x, y: chao }, VEICULO_ALTURA, item.cor, 1)

        if (pesado) {
            const stopX = from.x + (to.x - from.x) * 0.22
            onTravel?.(stopX, 900)
            await FX.to(scene, plano, { x: stopX, y: chao - 70, angle: -9 }, { duration: 620, ease: 'Sine.easeOut' })
            await FX.to(scene, plano, { y: chao, angle: 0 }, { duration: 460, ease: 'Quad.easeIn' })
            poeira(plano.x + 30, WORLD.groundY - 6)
            deadMark({ x: stopX, y: WORLD.groundY }, to)
            await badge({ x: stopX, y: WORLD.groundY - 120 }, '✕', C.coral)
            return
        }

        const travel = 1500
        onTravel?.(to.x, travel)
        await FX.to(scene, plano, { x: from.x - 120, y: chao - 40, angle: -12 }, { duration: 420, ease: 'Sine.easeIn' })
        await FX.to(scene, plano, { x: to.x + 60, y: to.y - 190, angle: -4 }, { duration: travel - 700, ease: 'Linear' })
        await FX.to(scene, plano, { x: to.x + 80, y: to.y - 40, angle: 4 }, { duration: 420, ease: 'Sine.easeOut' })
        await entregue(plano, to)
    }

    return {
        /** O grito da abertura: sai da boca dele, voa e cai no meio do caminho. */
        async shout(from: Ponto, to: Ponto, text: string) {
            const root = keep(scene.add.container(from.x, from.y).setDepth(DEPTH.balloon))
            const label = scene.add
                .text(0, 0, text, {
                    fontFamily: FONT.black,
                    fontSize: '28px',
                    color: CSS.ink,
                    align: 'center',
                })
                .setOrigin(0.5)
                .setResolution(2)

            const w = label.width + 44
            const h = label.height + 30
            const bubble = scene.add.graphics()
            bubble.fillStyle(C.ink, 0.25)
            bubble.fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, 18)
            bubble.fillStyle(C.ink, 1)
            bubble.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
            bubble.fillStyle(C.card, 1)
            bubble.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 15)
            root.add([bubble, label])

            const mid = from.x + (to.x - from.x) * 0.55
            soundWave(from, { x: mid, y: from.y }, C.warn, 6, 1900)

            root.setScale(0.4).setAlpha(0)
            await FX.to(scene, root, { scale: 1.12, alpha: 1 }, { duration: 340, ease: 'Back.easeOut' })
            await FX.to(scene, root, { scale: 1 }, { duration: 200 })
            await FX.wait(scene, 420)
            await FX.to(
                scene,
                root,
                { x: mid + 40, y: from.y - 74, angle: -7 },
                { duration: 1100, ease: 'Sine.easeOut' },
            )
            await FX.to(
                scene,
                root,
                { y: WORLD.groundY - 14, angle: -26, alpha: 0.25, scale: 0.7 },
                { duration: 760, ease: 'Quad.easeIn' },
            )
            await FX.wait(scene, 420)
            await FX.to(scene, root, { alpha: 0 }, { duration: 320 })
            root.destroy(true)
        },

        /** A abertura do N3: ele aperta os olhos, e a queixa fica no ar. */
        async grito(atX: number, text: string) {
            const label = keep(
                scene.add
                    .text(atX - 40, WORLD.groundY - 210, text, {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.ink,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.balloon),
            )
            label.setStroke(CSS.white, 9)
            label.setAlpha(0).setScale(0.6)
            await FX.to(scene, label, { alpha: 1, scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
            await FX.wait(scene, leitura(text))
            await FX.to(scene, label, { alpha: 0 }, { duration: 320 })
            label.destroy()
        },

        /** A abertura do N2: ele atira a encomenda por cima do rio, e ela cai na água. */
        async toss(from: Ponto, encomenda: Encomenda, text: string) {
            const caixa = peca('encomendas', encomenda.coluna, from, 76, C.areia, 0, 3, 1)
            const agua = WORLD.riverX + WORLD.riverW / 2

            await FX.to(scene, caixa, { scale: caixa.scale * 1.15 }, { duration: 220, yoyo: true })
            await FX.arcTo(scene, caixa, { x: agua, y: WORLD.groundY + 26 }, { height: 210, duration: 900 })

            const splash = keep(scene.add.graphics().setDepth(DEPTH.wave))
            splash.fillStyle(C.agua, 0.95)
            for (let i = 0; i < 8; i++) {
                splash.fillCircle(Phaser.Math.Between(-60, 60), Phaser.Math.Between(-18, 8), Phaser.Math.Between(6, 13))
            }
            splash.setPosition(agua, WORLD.groundY + 12)
            scene.tweens.add({
                targets: splash,
                y: WORLD.groundY - 44,
                alpha: 0,
                duration: FX.ms(scene, 620),
                ease: 'Cubic.easeOut',
            })
            await FX.to(scene, caixa, { y: WORLD.groundY + 54, alpha: 0.2 }, { duration: 420 })

            const label = keep(
                scene.add
                    .text(from.x - 40, from.y - 70, text, {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.ink,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.balloon),
            )
            label.setStroke(CSS.white, 9)
            label.setAlpha(0).setScale(0.6)
            await FX.to(scene, label, { alpha: 1, scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
            await FX.wait(scene, leitura(text))
            await FX.to(scene, label, { alpha: 0 }, { duration: 320 })
        },

        async play(
            item: Item,
            from: Ponto,
            to: Ponto,
            resultado: Entrega,
            onTravel?: OnTravel,
        ) {
            clear()
            const motivo = resultado.kind === 'naoChegou' ? resultado.motivo : null

            switch (item.id) {
                case 'carta':
                    return carta(item, from, to, motivo, onTravel)
                case 'telefone':
                    return telefone(from, to, motivo, onTravel)
                case 'carroca':
                    return carroca(item, from, to, motivo, onTravel)
                case 'barco':
                    return barco(item, from, to, motivo, onTravel)
                case 'aviao':
                    return aviao(item, from, to, motivo, onTravel)
                default:
                    return megafone(from, to, motivo, onTravel)
            }
        },

        clear,

        destroy() {
            clear()
        },
    }
}

export type EntregaView = ReturnType<typeof createEntrega>
