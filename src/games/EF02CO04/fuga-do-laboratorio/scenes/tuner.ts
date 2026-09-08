import Phaser from 'phaser'
import { MACHINE } from '../data/layout'
import type { Machine } from './machine'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O AJUSTE DAS PEÇAS DO CHASSI (tecla P, só no dev server)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O `chassi.png` é arte gerada: os três vãos caem onde o desenho quis, não
 * onde o `MACHINE` diz. Acertar isso editando número, salvando e recarregando
 * é um ciclo de dez segundos para um passo de UM pixel — e são cinco peças.
 *
 * Aqui a tecla P abre o modo: Tab troca a peça, as setas movem, + e - mudam o
 * tamanho, e ao sair sai o bloco pronto para colar em `data/layout.ts`, no
 * console e na área de transferência.
 *
 * Enquanto o modo está aberto o jogo fica surdo ao toque, porque as áreas de
 * toque NÃO acompanham o arrasto: elas nascem de `machinePoint()` na criação
 * da cena. É por isso que o ajuste termina no arquivo e não na tela — colado
 * o bloco, desenho e toque voltam a sair do mesmo número.
 *
 * Nada disto vai para produção: a chamada mora atrás de `import.meta.env.DEV`
 * e o módulo não tem efeito nenhum fora dela.
 */

type Movable =
    | Phaser.GameObjects.Container
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Graphics

interface Part {
    label: string
    obj: Movable
    /** A máquina inteira anda em coordenada de tela; o resto, dentro dela. */
    absolute: boolean
    canScale: boolean
    w: number
    h: number
    scale0: number
    x0: number
    y0: number
    line: (x: number, y: number, k: number) => string
}

const R = Math.round

const HELP = 'Tab=peça · setas/WASD=1px · Shift=10px · +/-=tamanho · R=zerar · C=copiar · P=sair'

export function createTuner(
    scene: Phaser.Scene,
    machine: Machine,
    setPlay: (on: boolean) => void,
): () => void {
    const keyboard = scene.input.keyboard
    if (!keyboard) return () => {}

    const root = machine.container
    const piece = machine.parts()

    const make = (
        label: string,
        obj: Movable,
        absolute: boolean,
        canScale: boolean,
        w: number,
        h: number,
        line: Part['line'],
    ): Part => ({
        label, obj, absolute, canScale, w, h, line,
        scale0: obj.scaleX,
        x0: obj.x,
        y0: obj.y,
    })

    const parts: Part[] = [
        make('máquina na tela', root, true, false, MACHINE.s, MACHINE.s,
            (x, y) => `cx: ${x}, cy: ${y},`),

        make('chassi (a arte)', piece.body, false, true, MACHINE.s, MACHINE.s,
            (x, y, k) => `bodyDX: ${x}, bodyDY: ${y}, s: ${R(MACHINE.s * k)},`),

        make('visor', piece.display, false, true, MACHINE.displayW, MACHINE.displayH,
            (x, y, k) => `displayDX: ${x}, displayDY: ${y}, `
                + `displayW: ${R(MACHINE.displayW * k)}, displayH: ${R(MACHINE.displayH * k)},`),

        make('bandeja azul', piece.tray, false, true, MACHINE.trayW, MACHINE.trayH,
            (x, y, k) => `trayDX: ${x}, trayDY: ${y}, `
                + `trayW: ${R(MACHINE.trayW * k)}, trayH: ${R(MACHINE.trayH * k)},`),

        make('leitor roxo', piece.reader, false, true, MACHINE.readerW, MACHINE.readerH,
            (x, y, k) => `readerDX: ${x}, readerDY: ${y}, `
                + `readerW: ${R(MACHINE.readerW * k)}, readerH: ${R(MACHINE.readerH * k)},`),

        make('botão TESTAR', piece.button, false, true, MACHINE.buttonD, MACHINE.buttonD,
            (x, y, k) => `buttonDX: ${x}, buttonDY: ${y}, buttonD: ${R(MACHINE.buttonD * k)},`),
    ]

    let open = false
    let index = 0
    let frame: Phaser.GameObjects.Graphics | undefined
    let legend: Phaser.GameObjects.Text | undefined

    const factor = (part: Part) => part.obj.scaleX / part.scale0

    const box = (part: Part) => {
        const k = factor(part)
        return {
            x: part.absolute ? part.obj.x : root.x + part.obj.x,
            y: part.absolute ? part.obj.y : root.y + part.obj.y,
            w: part.w * k,
            h: part.h * k,
        }
    }

    /** O bloco que se cola no arquivo. É a saída inteira deste modo. */
    const block = () =>
        ['// data/layout.ts → MACHINE']
            .concat(parts.map(part => part.line(R(part.obj.x), R(part.obj.y), factor(part))))
            .join('\n')

    const paint = () => {
        if (!frame || !legend) return
        const g = frame

        g.clear()
        parts.forEach((part, i) => {
            const box2 = box(part)
            const on = i === index
            g.lineStyle(on ? 3 : 1, on ? 0x00ff88 : 0xffffff, on ? 1 : 0.35)
            g.strokeRect(box2.x - box2.w / 2, box2.y - box2.h / 2, box2.w, box2.h)
            if (!on) return
            g.lineStyle(1, 0x00ff88, 0.7)
            g.lineBetween(box2.x - box2.w / 2 - 14, box2.y, box2.x + box2.w / 2 + 14, box2.y)
            g.lineBetween(box2.x, box2.y - box2.h / 2 - 14, box2.x, box2.y + box2.h / 2 + 14)
        })

        const part = parts[index]
        legend.setText([
            `[${index + 1}/${parts.length}] ${part.label}`,
            part.line(R(part.obj.x), R(part.obj.y), factor(part)),
            HELP,
        ].join('\n'))
    }

    const copy = () => {
        const text = block()
        console.log(`[chassi]\n${text}`)
        void navigator.clipboard?.writeText(text).catch(() => {})
    }

    const setOpen = (on: boolean) => {
        open = on
        setPlay(!on)

        if (!on) {
            copy()
            frame?.destroy()
            legend?.destroy()
            frame = undefined
            legend = undefined
            return
        }

        frame = scene.add.graphics().setDepth(9998)
        legend = scene.add
            .text(16, 84, '', {
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#00ff88',
                backgroundColor: '#0b1220cc',
                padding: { x: 8, y: 6 },
                lineSpacing: 4,
            })
            .setDepth(9999)
        paint()
    }

    const STEP: Record<string, [number, number]> = {
        a: [-1, 0], arrowleft: [-1, 0],
        d: [1, 0], arrowright: [1, 0],
        w: [0, -1], arrowup: [0, -1],
        s: [0, 1], arrowdown: [0, 1],
    }

    const onKey = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase()

        // Segurar a tecla repete o evento. Nas de mover isso é bom — anda
        // sozinho; nas discretas pula peça, e o Tab passa direto pela que
        // se queria pegar.
        if (event.repeat && (key === 'tab' || key === 'p' || key === 'c' || key === 'r')) return

        if (key === 'p') {
            event.preventDefault()
            setOpen(!open)
            return
        }
        if (!open) return

        if (key === 'tab') {
            event.preventDefault()
            index = (index + (event.shiftKey ? parts.length - 1 : 1)) % parts.length
            paint()
            return
        }

        const part = parts[index]

        if (key === 'r') {
            event.preventDefault()
            part.obj.setPosition(part.x0, part.y0).setScale(part.scale0)
            paint()
            return
        }

        if (key === 'c') {
            event.preventDefault()
            copy()
            return
        }

        if (key === '+' || key === '=' || key === '-' || key === '_') {
            event.preventDefault()
            if (!part.canScale) return
            const up = key === '+' || key === '='
            const amount = (event.shiftKey ? 0.05 : 0.01) * (up ? 1 : -1)
            part.obj.setScale(Math.max(0.1, part.obj.scaleX * (1 + amount)))
            paint()
            return
        }

        const move = STEP[key]
        if (!move) return
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        part.obj.setPosition(part.obj.x + move[0] * step, part.obj.y + move[1] * step)
        paint()
    }

    keyboard.on('keydown', onKey)

    return () => {
        keyboard.off('keydown', onKey)
        frame?.destroy()
        legend?.destroy()
    }
}
