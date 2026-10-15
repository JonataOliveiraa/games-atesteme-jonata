import Phaser from 'phaser'
import { CLOCK, DEPTH, U } from '../data/layout'
import { C } from '../data/theme'
import { Pix, bakePanel, bakePix } from './pixelart'

/**
 * O cronômetro, em pixel art: um relógio de bolso cujo ponteiro anda um passo por segundo, e uma régua
 * de gomos que esvazia — cada gomo some de cima para baixo, um pixel por vez. Branco com tempo, laranja
 * quando aperta, vermelho no fim. Parado (abertura, ajuda, erro, troca de fase), ele fica apagado.
 * Ele só conta e avisa; o que o fim do tempo quer dizer é o jogo que decide.
 */
export interface Stopwatch {
    /** anda `ms`; ignorado enquanto parado */
    tick(ms: number): void
    /** cheio de novo, com o tempo da fase */
    reset(ms: number): void
    setRunning(on: boolean): void
    destroy(): void
}

export interface StopwatchOptions {
    /** entrou no fim (uma vez por `reset`) */
    onDanger?: () => void
    /** zerou (uma vez por `reset`) */
    onEmpty: () => void
}

type Tone = 'full' | 'warn' | 'danger'

const TONES: Record<Tone, { base: number; top: number }> = {
    full: { base: C.text, top: C.white },
    warn: { base: C.oops, top: 0xffb27a },
    danger: { base: C.red, top: 0xff9a9a },
}
const HANDS = 8
const SEG = CLOCK.seg

const segKey = (tone: Tone, rows: number) => `cronometro-gomo-${tone}-${rows}`
const EMPTY_KEY = 'cronometro-gomo-vazio'
const handKey = (i: number) => `cronometro-relogio-${i}`

/** um gomo com `rows` linhas de tinta, de baixo para cima; a de cima é mais clara */
function segment(tone: Tone, rows: number) {
    const p = new Pix(SEG, SEG)
    const t = TONES[tone]
    p.rect(0, SEG - rows, SEG, rows, t.base)
    p.rect(0, SEG - rows, SEG, 1, t.top)
    return p
}

/** o ponteiro, de 45 em 45 graus, a partir do pixel do meio (5, 7) */
const HAND_PIXELS: [number, number][][] = [
    [[5, 6], [5, 5]],
    [[6, 6], [7, 5]],
    [[6, 7], [7, 7]],
    [[6, 8], [7, 9]],
    [[5, 8], [5, 9]],
    [[4, 8], [3, 9]],
    [[4, 7], [3, 7]],
    [[4, 6], [3, 5]],
]

/** o relógio de bolso: botão em cima, aro lilás, mostrador claro, ponteiro escuro e o miolo rosa */
function watch(hand: number) {
    const p = new Pix(11, 13)
    p.rect(4, 1, 3, 1, C.rimLight)
    p.set(5, 2, C.rimLight)
    p.disc(5.5, 7.5, 4.3, C.rimLight)
    p.disc(5.5, 7.5, 3.3, C.caseLight)
    HAND_PIXELS[hand].forEach(([x, y]) => p.set(x, y, C.outline))
    p.set(5, 7, C.pink)
    p.outline(C.outline)
    return p
}

function bakeStopwatch(scene: Phaser.Scene) {
    ;(['full', 'warn', 'danger'] as Tone[]).forEach(tone => {
        for (let rows = 1; rows <= SEG; rows++) bakePix(scene, segKey(tone, rows), segment(tone, rows))
    })
    const empty = new Pix(SEG, SEG)
    empty.rect(0, 0, SEG, SEG, C.screen)
    bakePix(scene, EMPTY_KEY, empty)
    for (let i = 0; i < HANDS; i++) bakePix(scene, handKey(i), watch(i))
}

export function createStopwatch(scene: Phaser.Scene, opts: StopwatchOptions): Stopwatch {
    bakeStopwatch(scene)
    const n = CLOCK.segments
    const artW = CLOCK.pad * 2 + n * SEG + (n - 1) * CLOCK.gap
    const artH = CLOCK.pad * 2 + SEG
    const plate = scene.add.image(0, 0, bakePanel(scene, 'cronometro', artW, artH, { fill: C.panelDark, shade: C.outline })).setScale(U)
    const left = (-artW / 2 + CLOCK.pad) * U
    const segs = Array.from({ length: n }, (_, i) =>
        scene.add.image(left + (i * (SEG + CLOCK.gap) + SEG / 2) * U, 0, segKey('full', SEG)).setScale(U),
    )
    /** o mostrador fica 1 pixel abaixo do meio da arte (o botão em cima): sobe 1 pixel para alinhar com a régua */
    const iconX = (-artW / 2) * U - CLOCK.iconGap - (11 * U) / 2
    const icon = scene.add.image(iconX, -U, handKey(0)).setScale(U)
    const root = scene.add.container(CLOCK.x, CLOCK.y, [plate, ...segs, icon]).setDepth(DEPTH.order)

    let total = 1
    let spent = 0
    let running = true
    let warned = false
    let empty = false
    const shown: string[] = []

    const paint = () => {
        const left = Math.max(0, total - spent)
        const frac = left / total
        const tone: Tone = frac <= CLOCK.dangerAt ? 'danger' : frac <= CLOCK.warnAt ? 'warn' : 'full'
        /** quantos pixels de gomo ainda estão cheios (cada gomo tem SEG linhas) */
        const rows = Math.ceil(frac * n * SEG)
        segs.forEach((s, i) => {
            const mine = Phaser.Math.Clamp(rows - i * SEG, 0, SEG)
            const key = mine > 0 ? segKey(tone, mine) : EMPTY_KEY
            if (shown[i] === key) return
            shown[i] = key
            s.setTexture(key)
        })
        icon.setTexture(handKey(Math.floor(spent / 1000) % HANDS))
    }

    const setRunning = (on: boolean) => {
        if (on === running) return
        running = on
        root.setAlpha(on ? 1 : 0.5)
    }

    paint()
    setRunning(false)

    return {
        tick(ms) {
            if (!running || empty) return
            spent += ms
            paint()
            if (!warned && (total - spent) / total <= CLOCK.dangerAt) {
                warned = true
                opts.onDanger?.()
                /** o relógio sacode (de pixel em pixel, sem girar a arte) */
                scene.tweens.add({ targets: icon, x: iconX + U, duration: 60, yoyo: true, repeat: 3, onComplete: () => icon.setX(iconX) })
            }
            if (spent < total) return
            empty = true
            opts.onEmpty()
        },
        reset(ms) {
            total = Math.max(1, ms)
            spent = 0
            warned = false
            empty = false
            paint()
        },
        setRunning,
        destroy() {
            scene.tweens.killTweensOf(icon)
            root.destroy()
        },
    }
}
