import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, H, W, type RailDef } from '../data/layout'
import { C } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A ROLAGEM — e ela é o que faz a distância existir para a criança.
 *
 * O mundo é sempre maior que a tela. No quarto ele tem 1440 px de altura e a
 * nuvem fica a mais de oitocentos pixels acima do computador; no ar ele tem
 * 2100 px de largura e o celular fica a oitocentos do computador. Nos dois
 * casos, as duas pontas **nunca aparecem juntas**.
 *
 * Enquanto o jogo escolhia sozinho para onde olhar, a criança só via a outra
 * ponta quando ERRAVA ou ACERTAVA nela — depois de decidir. O que ela precisa é
 * do contrário: olhar ANTES, e decidir por ter visto.
 *
 * Então ela arrasta, e o trajeto é CONTÍNUO: no quarto passa o cabo inteiro, no
 * ar passa o vão entre os dois aparelhos. É esse trajeto feito com o próprio
 * dedo que diz que as duas coisas pertencem ao mesmo lugar. Um corte de câmera
 * não diria: cortar é o desenho de duas coisas separadas.
 *
 * **O eixo vem de fora.** Este módulo não sabe se o mundo é alto ou largo — ele
 * recebe `rail.axis` e trata tudo como "ao longo" e "atravessado". É o que
 * permitiu o nível 3 deitar o mundo sem um segundo módulo de rolagem.
 */
export interface Scroll {
    /** Quem manda no dedo. */
    setEnabled(on: boolean): void
    /**
     * Começar a arrastar a partir de um toque que caiu em OUTRO objeto.
     *
     * Os botões ocupam a faixa de baixo da tela, e ali o `topOnly` entrega o
     * toque a eles — a área de arrasto nem fica sabendo. Sem isso, a tira mais
     * natural para o polegar seria a única parte da tela que não rola.
     */
    begin(pointer: Phaser.Input.Pointer): void
    /**
     * Quem manda no trilho — e é OUTRA COISA.
     *
     * Durante o tutorial a criança não pode arrastar (o balão bloqueia a tela),
     * mas o passo que ensina o gesto aponta para o trilho: escondê-lo ali seria
     * apontar para o nada.
     */
    setShown(on: boolean): void
    /** Onde o mundo está, de 0 (o fim do eixo) a 1 (o começo dele). */
    at(): number
    destroy(): void
}

export interface ScrollOptions {
    stage(): Phaser.GameObjects.Container
    rail: RailDef
    range: { min: number; max: number }
    /**
     * A criança começou a percorrer o mundo — SAIA DA FRENTE.
     *
     * Enquanto ela arrasta, o cabeçalho, o pedido e os botões saem de cena: o
     * gesto é de olhar, e olhar com três tarjas na tela é olhar pelas frestas.
     * Voltam sozinhos quando o dedo sobe.
     */
    onFocus(on: boolean): void
}

/** Quanto o dedo precisa andar para virar rolagem, e não um toque atrapalhado. */
const START = 12

/** Quanto a roda do mouse espera parada antes de devolver a interface. */
const WHEEL_REST = 700

export function createScroll(scene: Phaser.Scene, options: ScrollOptions): Scroll {
    const rail = options.rail
    const axis = rail.axis
    const { min, max } = options.range

    let enabled = false
    let pressed = false
    let dragging = false
    let focused = false
    let fromPointer = 0
    let fromStage = 0
    let rest: Phaser.Time.TimerEvent | undefined

    const pos = () => (axis === 'y' ? options.stage().y : options.stage().x)
    const setPos = (v: number) => {
        const stage = options.stage()
        if (axis === 'y') stage.setY(v)
        else stage.setX(v)
    }

    const clamp = (v: number) => Phaser.Math.Clamp(v, min, max)
    const progress = () => (pos() - min) / (max - min)

    /**
     * Uma porta só, e com memória.
     *
     * Sem o `focused`, um arrasto interrompido no meio — a vez da criança
     * acabando, a cena trocando de fase — deixava a interface escondida para
     * sempre, porque o `pointerup` que a traria de volta nunca chegava.
     */
    const setFocus = (on: boolean) => {
        rest?.remove()
        rest = undefined
        if (focused === on) return
        focused = on
        options.onFocus(on)
    }

    /* ────────────────────────────── o arrasto ─────────────────────────── */

    /**
     * A área de arrasto cobre a tela inteira, mas fica em `DEPTH.grab` — abaixo
     * dos botões, do pedido e do cabeçalho. Com `input.topOnly`, quem estiver
     * por cima ganha o toque, e um dedo no botão NUVEM nunca vira rolagem.
     */
    const grab = scene.add
        .zone(W / 2, H / 2, W, H)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.grab)
        .setInteractive()

    const along = (pointer: Phaser.Input.Pointer) => (axis === 'y' ? pointer.y : pointer.x)

    const begin = (pointer: Phaser.Input.Pointer) => {
        if (!enabled) return
        pressed = true
        dragging = false
        fromPointer = along(pointer)
        fromStage = pos()
        // o dedo manda: qualquer sobra de viagem morre aqui
        FX.kill(scene, fx(options.stage()))
    }

    grab.on('pointerdown', begin)

    const onUp = () => {
        pressed = false
        dragging = false
        setFocus(false)
    }

    const onMove = (pointer: Phaser.Input.Pointer) => {
        if (!pressed) return
        if (!pointer.isDown) {
            onUp()
            return
        }

        const walked = along(pointer) - fromPointer

        // só vira rolagem depois de andar: um toque tremido não apaga a tela
        if (!dragging) {
            if (Math.abs(walked) < START) return
            dragging = true
            setFocus(true)
        }

        setPos(clamp(fromStage + walked))
    }

    /**
     * A roda do mouse, e o mundo deitado.
     *
     * Quase todo mouse só tem `deltaY`. Num mundo que rola de lado, exigir uma
     * roda horizontal seria deixar o nível 3 sem rolagem para metade das mesas —
     * então o `deltaY` vale para os dois eixos, e o `deltaX` entra quando existe.
     */
    const onWheel = (_p: Phaser.Input.Pointer, _o: unknown[], dx: number, dy: number) => {
        if (!enabled || pressed) return
        const step = axis === 'y' ? dy : dx || dy
        FX.kill(scene, fx(options.stage()))
        setPos(clamp(pos() - step))

        /**
         * A roda não tem "soltar".
         *
         * Ela chega em rajadas de eventos soltos, e devolver a interface a cada
         * um piscaria a tela inteira. Então o descanso é que manda: a interface
         * volta quando a roda fica parada.
         */
        setFocus(true)
        rest = scene.time.delayedCall(WHEEL_REST, () => setFocus(false))
    }

    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)
    scene.input.on('wheel', onWheel)

    /* ───────────────────────────── o trilho ───────────────────────────── */

    /**
     * O trilho não é enfeite: é o único aviso de que HÁ MAIS TELA.
     *
     * Uma criança não procura o que não sabe que existe. A seta de um lado acesa
     * significa "ainda dá para ir por aqui", e ela apaga sozinha quando o mundo
     * chega no fim.
     */
    const bar = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.rail)

    /** Ao longo do eixo e atravessado nele — o resto é conta de desenhar. */
    const pt = (main: number, cross: number) =>
        axis === 'y' ? { x: rail.at + cross, y: main } : { x: main, y: rail.at + cross }

    const box = (main: number, len: number, thick: number) =>
        axis === 'y'
            ? { x: rail.at - thick / 2, y: main, w: thick, h: len }
            : { x: main, y: rail.at - thick / 2, w: len, h: thick }

    /**
     * O traço claro por baixo do escuro.
     *
     * O trilho passa por cima do céu, de uma parede clara e de uma cortina
     * escura, e uma seta de uma cor só some em algum desses três. Duas passadas —
     * creme grossa embaixo, laranja fina em cima — leem em qualquer fundo.
     */
    const chevron = (main: number, toStart: boolean, on: boolean) => {
        const d = toStart ? 1 : -1
        const a = pt(main + d * 7, -13)
        const b = pt(main - d * 7, 0)
        const c = pt(main + d * 7, 13)
        const draw = (width: number, color: number, alpha: number) => {
            bar.lineStyle(width, color, alpha)
            bar.beginPath()
            bar.moveTo(a.x, a.y)
            bar.lineTo(b.x, b.y)
            bar.lineTo(c.x, c.y)
            bar.strokePath()
        }
        draw(13, C.creamSoft, on ? 0.95 : 0.3)
        draw(6, on ? C.orange : C.grey, on ? 1 : 0.5)
    }

    const paintRail = () => {
        const t = Phaser.Math.Clamp(progress(), 0, 1)
        bar.clear()

        const edge = box(rail.from - 4, rail.len + 8, rail.w + 8)
        bar.fillStyle(C.navy, 0.9)
        bar.fillRoundedRect(edge.x, edge.y, edge.w, edge.h, (rail.w + 8) / 2)

        const track = box(rail.from, rail.len, rail.w)
        bar.fillStyle(C.creamSoft, 1)
        bar.fillRoundedRect(track.x, track.y, track.w, track.h, rail.w / 2)

        /**
         * `t = 1` é o COMEÇO do eixo — o topo do mundo em pé, a ponta esquerda
         * do mundo deitado —, e o polegar vai para o começo do trilho. A mesma
         * conta serve aos dois porque os dois eixos crescem no mesmo sentido em
         * que a tela cresce.
         */
        const thumb = box(rail.from + (rail.len - rail.thumb) * (1 - t), rail.thumb, rail.w)
        bar.fillStyle(C.orange, 1)
        bar.fillRoundedRect(thumb.x, thumb.y, thumb.w, thumb.h, rail.w / 2)

        chevron(rail.from - 30, true, t < 0.99)
        chevron(rail.from + rail.len + 30, false, t > 0.01)
    }

    paintRail()
    scene.events.on(Phaser.Scenes.Events.UPDATE, paintRail)

    return {
        setEnabled: on => {
            enabled = on
            if (!on) {
                pressed = false
                dragging = false
                setFocus(false)
            }
            if (grab.input) grab.input.enabled = on
        },

        begin,

        setShown: on => {
            FX.kill(scene, fx(bar))
            scene.tweens.add({ targets: bar, alpha: on ? 1 : 0, duration: 240 })
        },

        at: progress,

        destroy: () => {
            enabled = false
            rest?.remove()
            scene.events.off(Phaser.Scenes.Events.UPDATE, paintRail)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            scene.input.off('wheel', onWheel)
            grab.destroy()
            bar.destroy()
        },
    }
}
