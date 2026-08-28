import Phaser from 'phaser'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { HUD } from '../data/layout'
import { C, SEAL_COLOR, hex } from '../data/theme'

export interface HudInfo {
    instruction: string
    sub: string
    level: number
    phase: number
    totalPhases: number
}

export interface TallyData {
    verde: number
    amarelo: number
    vermelho: number
    total: number
}

export interface HudOptions {
    onHelpTap: () => void
    /** Em segundos. Sem isto o nível não tem barra de tempo nenhuma. */
    timeLimit?: number
    /** A barra zerou. O que isso significa é decisão da cena. */
    onTimeUp?: () => void
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setInfo(data: HudInfo): void
    setTally(data: TallyData): void
    pulseTally(): void
    showHelp(): void
    /** Anda o relógio. `running` desliga a contagem sem esconder a barra. */
    tick(delta: number, running: boolean): void
    /** Enche a barra de novo — a mesma mídia recomeçando. */
    resetTimer(): void
    /** Congela de vez: a fase acabou e o tempo não conta mais. */
    stopTimer(): void
    destroy(): void
}

const SEALS: Array<'verde' | 'amarelo' | 'vermelho'> = ['verde', 'amarelo', 'vermelho']

/*
 * O HUD morava numa UIScene por cima do jogo, e cena por cima de cena não
 * conhece depth: o `?` e a placa de nível ficavam acima de qualquer painel.
 * Agora ele é um container da própria GameScene, num depth baixo, e todo
 * overlay (folha, veredito, intro, lightbox) passa por cima dele.
 */
export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const container = scene.add.container(0, 0).setDepth(HUD.depth)

    const plate = scene.add.graphics()
    plate.fillStyle(C.easelDark, 1)
    plate.fillRoundedRect(HUD.plate.x, HUD.plate.y + 4, HUD.plate.w, HUD.plate.h, { tl: 16, tr: 26, bl: 16, br: 26 })
    plate.fillStyle(C.easel, 1)
    plate.fillRoundedRect(HUD.plate.x, HUD.plate.y, HUD.plate.w, HUD.plate.h, { tl: 16, tr: 26, bl: 16, br: 26 })
    plate.fillStyle(C.white, 0.16)
    plate.fillRoundedRect(HUD.plate.x + 8, HUD.plate.y + 6, HUD.plate.w - 16, 18, 9)
    plate.fillStyle(C.paper, 0.9)
    plate.fillCircle(HUD.plate.x + 14, HUD.plate.y + 29, 5)

    const levelText = scene.add.text(HUD.labelX, HUD.levelY, '', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '17px',
        color: hex(C.paper),
    }).setOrigin(0, 0.5).setResolution(2)

    const phaseText = scene.add.text(HUD.labelX, HUD.phaseY, '', {
        fontFamily: 'DynaPuff, Arial, sans-serif',
        fontStyle: 'bold',
        fontSize: '15px',
        color: hex(C.paper),
    }).setOrigin(0, 0.5).setResolution(2)

    const instructionText = scene.add.text(HUD.instructionX, HUD.instructionY, '', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '28px',
        color: hex(C.blueDark),
        stroke: '#ffffff',
        strokeThickness: 7,
        align: 'center',
        wordWrap: { width: 660 },
    }).setOrigin(0.5).setResolution(2)

    const subText = scene.add.text(HUD.subX, HUD.subY, '', {
        fontFamily: 'DynaPuff, Arial, sans-serif',
        fontStyle: 'bold',
        fontSize: '22px',
        color: hex(C.inkSoft),
        stroke: '#ffffff',
        strokeThickness: 5,
        align: 'center',
        wordWrap: { width: 640 },
    }).setOrigin(0.5).setResolution(2)

    const tallyLayer = scene.add.graphics()
    const tallyTexts = SEALS.map((_id, i) =>
        scene.add.text(HUD.tally.firstX + i * HUD.tally.gapX + 16, 45, '0', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2))

    let tally: TallyData = { verde: 0, amarelo: 0, vermelho: 0, total: 0 }

    const paintTally = () => {
        tallyLayer.clear()
        tallyLayer.fillStyle(C.white, 0.9)
        tallyLayer.fillRoundedRect(HUD.tally.x, HUD.tally.y, HUD.tally.w, HUD.tally.h, 20)
        tallyLayer.lineStyle(3, C.border, 1)
        tallyLayer.strokeRoundedRect(HUD.tally.x, HUD.tally.y, HUD.tally.w, HUD.tally.h, 20)

        SEALS.forEach((id, i) => {
            const x = HUD.tally.firstX + i * HUD.tally.gapX
            const count = tally[id]
            const on = count > 0
            tallyLayer.fillStyle(on ? SEAL_COLOR[id] : C.greySoft, 1)
            tallyLayer.fillCircle(x, HUD.tally.cy, HUD.tally.r)
            tallyLayer.lineStyle(3, on ? SEAL_COLOR[id] : C.border, 1)
            tallyLayer.strokeCircle(x, HUD.tally.cy, HUD.tally.r)
            if (on) {
                tallyLayer.fillStyle(C.white, 0.35)
                tallyLayer.fillEllipse(x, HUD.tally.cy - 5, 16, 7)
            }
            tallyTexts[i].setText(String(count))
            tallyTexts[i].setColor(hex(on ? C.ink : C.grey))
        })
    }

    paintTally()

    const helpBtn = scene.add.container(HUD.help.cx, HUD.help.cy)
    const helpG = scene.add.graphics()
    helpG.fillStyle(C.shadow, 0.2)
    helpG.fillCircle(0, 5, HUD.help.r)
    helpG.fillStyle(C.blue, 1)
    helpG.fillCircle(0, 0, HUD.help.r)
    helpG.fillStyle(C.white, 0.24)
    helpG.fillEllipse(0, -9, 30, 14)
    const helpLabel = scene.add.text(0, 0, '?', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '25px',
        color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    helpBtn.add([helpG, helpLabel])
    helpBtn.setSize(HUD.help.touch, HUD.help.touch)
    helpBtn.setInteractive({ useHandCursor: true })
    helpBtn.on('pointerdown', () => {
        scene.tweens.add({ targets: helpBtn, scale: 0.9, duration: 80, yoyo: true })
        opts.onHelpTap()
    })
    helpBtn.setVisible(false)

    /*
     * O barbante virou a barra de tempo compartilhada, e ela desceu para
     * debaixo da caixa de selos: no alto do meio ela cruzava a instrução.
     *
     * As cores saem do CROMO do jogo — creme de papel sobre sulco de madeira —
     * e não da paleta dos selos, onde verde, amarelo e vermelho SIGNIFICAM
     * veredito. Aviso e alarme ainda puxam para âmbar e vermelho, porque tempo
     * acabando precisa gritar, mas isso acontece a um passo do placar e com a
     * barra pulsando, que é o que separa uma coisa da outra.
     */
    let bar: TimeBar | undefined
    if (opts.timeLimit) {
        bar = createTimeBar(scene, {
            cx: HUD.timer.cx,
            cy: HUD.timer.cy,
            w: HUD.timer.w,
            h: HUD.timer.h,
            duration: opts.timeLimit * 1000,
            theme: {
                // sulco de papel, tinta de madeira: cheia, a barra é o mesmo
                // marrom da placa de NÍVEL do outro canto, e o que sobra dela
                // aparece como papel vazio — não como uma barra clara sumindo
                // num fundo claro
                track: C.paperEdge,
                trackAlpha: 0.95,
                shadow: C.shadow,
                shadowAlpha: 0.2,
                border: C.easelDark,
                borderAlpha: 0.8,
                fill: C.easel,
                warn: C.amber,
                danger: C.red,
                idle: C.grey,
                icon: C.easelDark,
                gloss: C.white,
                glossAlpha: 0.3,
            },
            onEmpty: opts.onTimeUp,
        })
        // nasce parada: entre a intro e o fim do tutorial ninguém está jogando
        bar.setRunning(false)
    }

    container.add([
        plate,
        levelText,
        phaseText,
        instructionText,
        subText,
        tallyLayer,
        ...tallyTexts,
        helpBtn,
    ])
    if (bar) container.add(bar.container)

    let parada = false

    return {
        container,
        setInfo(data) {
            instructionText.setText(data.instruction)
            subText.setText(data.sub)
            levelText.setText(`NÍVEL ${data.level}`)
            phaseText.setText(`Mídia ${data.phase} de ${data.totalPhases}`)
        },
        setTally(data) {
            tally = data
            paintTally()
        },
        pulseTally() {
            scene.tweens.add({
                targets: tallyTexts,
                scale: 1.35,
                duration: 130,
                yoyo: true,
                ease: 'Quad.easeOut',
            })
        },
        showHelp() {
            helpBtn.setVisible(true)
        },
        tick(delta, running) {
            if (!bar || parada) return
            bar.setRunning(running)
            bar.tick(delta)
        },
        resetTimer() {
            // o caso recomeça: quem tinha congelado a barra ao zerar precisa
            // soltá-la aqui, senão a segunda tentativa nasce com o relógio morto
            parada = false
            bar?.reset()
        },
        stopTimer() {
            parada = true
            bar?.setRunning(false)
        },
        destroy() {
            bar?.destroy()
            container.destroy(true)
        },
    }
}
