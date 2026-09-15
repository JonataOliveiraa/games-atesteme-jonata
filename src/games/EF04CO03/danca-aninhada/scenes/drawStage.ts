import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { moveIcon, type MoveIcon } from './pictogram'
import { CUTS, SHEET as ART, dancerScale, originOf, type PoseKey } from '../data/art'
import { DANCER, DEPTH, FOCUS, H, LAMP, STAGE, W } from '../data/layout'
import { C, CSS, FONT, MOVE_NAME } from '../data/theme'
import type { Move } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PALCO E O DANÇARINO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O fundo é o único PNG de cenário, e ele não sabe nada sobre o algoritmo:
 * não tem pegadas no piso, marcas de grade nem holofote apontando para nada.
 * Quem diz o que está acontecendo é o código.
 *
 * ── O JOGO PRECISA RODAR SEM PNG ─────────────────────────────────────────
 *
 * O §13 do planejamento exige isso, e não é zelo: o jogo foi escrito antes de
 * a folha existir. Se nenhuma textura estiver carregada, o
 * palco vira `Graphics` e o dançarino vira boneco de círculos e linhas com o
 * rótulo DANÇARINO — nas MESMAS caixas de layout, para o teste com criança
 * medir a mesma tela.
 */

/**
 * A CENA AINDA EXISTE?
 *
 * Sair da página no meio de um ensaio destrói o jogo inteiro, e o `displayList`
 * vira `null`. O contador `gen` da `GameScene` já barra o FLUXO, mas entre a
 * promessa que resolve e a próxima guarda cabem algumas linhas — e uma delas
 * cria objeto. Sem isto, fechar a aba no meio da dança deixa um TypeError no
 * console de quem já foi embora.
 */
const vivo = (scene: Phaser.Scene) => Boolean(scene.sys?.displayList)

const POSE_OF: Record<Move, PoseKey> = { step: 'step', clap: 'clap', spin: 'spin' }

export function createStage(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bg)
    const hasArt = scene.textures.exists(ART.dancer)

    if (scene.textures.exists(ART.stage)) {
        const bg = scene.add.image(W / 2, H / 2, ART.stage)
        const k = Math.max(W / bg.width, H / bg.height)
        bg.setScale(k)
        root.add(bg)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.curtain, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 210, W, 160)
        g.fillStyle(C.floor, 1)
        g.fillRect(0, 370, W, H - 370)
        g.fillStyle(C.ink, 0.18)
        g.fillRect(0, 366, W, 8)
        root.add(g)
    }

    /*
     * O CONE DE LUZ É DO CÓDIGO, NÃO DO FUNDO.
     *
     * Ele acende quando o ensaio começa e apaga quando termina, e é o sinal
     * visual de "agora o algoritmo está rodando" — o mesmo instante em que os
     * contadores da ficha aparecem.
     */
    const spot = scene.add.graphics().setDepth(DEPTH.floor).setAlpha(0)
    const paintSpot = (x: number, spread: number) => {
        spot.clear()
        spot.fillStyle(C.warm, 0.24)
        spot.beginPath()
        spot.moveTo(x - 52, STAGE.y - 40)
        spot.lineTo(x + 52, STAGE.y - 40)
        spot.lineTo(x + spread, DANCER.footY + 12)
        spot.lineTo(x - spread, DANCER.footY + 12)
        spot.closePath()
        spot.fillPath()
    }
    paintSpot(DANCER.x, 138)

    /*
     * A sombra e o cone seguem o dançarino.
     *
     * Os dois eram desenhados na posição de montar, e no ensaio ele saía de
     * dentro da própria sombra — que ficava para trás, no canto esquerdo,
     * como se pertencesse a outra pessoa.
     */
    const shadow = scene.add.graphics().setDepth(DEPTH.floor + 1)
    const paintShadow = (squash: number) => {
        const x = focusedX()
        const width = focusedWide() ? 190 : 128
        shadow.clear()
        shadow.fillStyle(C.ink, 0.26)
        shadow.fillEllipse(x, DANCER.footY + 6, width * squash, focusedWide() ? 34 : 26)
    }

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  A LÂMPADA NÃO É INTERFACE
     * ══════════════════════════════════════════════════════════════════════
     *
     * Ela é do cenário, e por isso continua em cena quando todo o resto sai
     * no ensaio: o laço do nível 3 para por causa dela, e esconder o sinal
     * durante a execução tornaria a parada inexplicável.
     *
     * Estado escrito, não só desenhado. ACESA e APAGADA embaixo do bulbo são
     * as duas palavras que o §7 exige — quem não separa amarelo de cinza
     * continua lendo o que aconteceu.
     */
    const lamp = scene.add.container(LAMP.x, LAMP.y).setDepth(DEPTH.lamp).setVisible(false)
    const lampArt = scene.add.graphics()
    lamp.add(lampArt)
    const lampWord = scene.add
        .text(0, LAMP.r + 34, '', { fontFamily: FONT.black, fontSize: '20px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    lamp.add(lampWord)

    const paintLamp = (on: boolean) => {
        const g = lampArt
        const r = LAMP.r
        g.clear()

        // o fio, que vem da grelha lá em cima e explica por que ela flutua
        g.lineStyle(6, C.ink, 1)
        g.lineBetween(0, STAGE.y - LAMP.y - 10, 0, -r - 16)
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-17, -r - 20, 34, 20, 7)

        g.fillStyle(C.ink, 1)
        g.fillCircle(0, 0, r + 5)
        g.fillStyle(on ? C.lampOn : C.lampOff, 1)
        g.fillCircle(0, 0, r)
        g.fillStyle(C.white, on ? 0.5 : 0.14)
        g.fillEllipse(-r * 0.3, -r * 0.34, r * 0.62, r * 0.4)

        if (on) {
            g.lineStyle(7, C.ink, 1)
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 + Math.PI / 8
                g.lineBetween(Math.cos(a) * (r + 14), Math.sin(a) * (r + 14), Math.cos(a) * (r + 30), Math.sin(a) * (r + 30))
            }
            g.lineStyle(4, C.lampOn, 1)
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 + Math.PI / 8
                g.lineBetween(Math.cos(a) * (r + 14), Math.sin(a) * (r + 14), Math.cos(a) * (r + 30), Math.sin(a) * (r + 30))
            }
        }

        const w = on ? 88 : 116
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2, r + 20, w, 30, 15)
        g.fillStyle(on ? C.lampOn : C.lampOff, 1)
        g.fillRoundedRect(-w / 2 + 3, r + 23, w - 6, 24, 12)
        lampWord.setText(on ? 'ACESA' : 'APAGADA')
        lampWord.setColor(on ? CSS.ink : CSS.white)
    }

    let focusOn = false
    const focusedX = () => (focusOn ? FOCUS.x : DANCER.x)
    const focusedWide = () => focusOn

    let sprite: Phaser.GameObjects.Sprite | null = null
    let doll: Phaser.GameObjects.Container | null = null
    let dollArt: Phaser.GameObjects.Graphics | null = null
    const baseScale = dancerScale(DANCER.height)

    if (hasArt) {
        sprite = scene.add.sprite(DANCER.x, DANCER.footY, ART.dancer, 'idle').setDepth(DEPTH.dancer)
        const cut = CUTS[0]
        const o = originOf(cut)
        sprite.setOrigin(o.x, o.y).setScale(baseScale)
    } else {
        doll = scene.add.container(DANCER.x, DANCER.footY).setDepth(DEPTH.dancer)
        dollArt = scene.add.graphics()
        doll.add(dollArt)
        const name = scene.add
            .text(0, -DANCER.height - 26, 'DANÇARINO', {
                fontFamily: FONT.black,
                fontSize: '22px',
                color: CSS.white,
            })
            .setOrigin(0.5)
            .setResolution(2)
        name.setStroke(CSS.ink, 5)
        doll.add(name)
    }

    /** O boneco de reserva: mesma caixa, mesma linha do pé. */
    const paintDoll = (pose: PoseKey) => {
        if (!dollArt) return
        const g = dollArt
        const h = DANCER.height
        const legs = pose === 'step' ? 34 : 14
        const arms = pose === 'clap' ? 16 : pose === 'spin' ? 52 : 30
        const armY = pose === 'clap' ? -h * 0.52 : -h * 0.46
        g.clear()
        g.lineStyle(13, C.ink, 1)
        g.lineBetween(0, -h * 0.72, 0, -h * 0.34)
        g.lineBetween(0, -h * 0.34, -legs, 0)
        g.lineBetween(0, -h * 0.34, legs, 0)
        g.lineBetween(0, -h * 0.6, -arms, armY)
        g.lineBetween(0, -h * 0.6, arms, armY)
        g.lineStyle(9, 0xe6784c, 1)
        g.lineBetween(0, -h * 0.72, 0, -h * 0.4)
        g.fillStyle(C.ink, 1)
        g.fillCircle(0, -h * 0.82, 26)
        g.fillStyle(0x9b6347, 1)
        g.fillCircle(0, -h * 0.82, 21)
    }

    paintShadow(1)

    const setPose = (pose: PoseKey) => {
        if (sprite) sprite.setFrame(pose)
        else paintDoll(pose)
    }
    setPose('idle')

    const target = (): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container => (sprite ?? doll)!
    let facing = 1

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  O ENSAIO ESVAZIA A TELA
     * ══════════════════════════════════════════════════════════════════════
     *
     * Quando a criança toca DANÇAR, painéis, ficha e bandeja saem de cena e
     * só o palco fica. O véu escurece o resto do cenário, o dançarino vem
     * para o meio e cresce.
     *
     * O que NÃO sai é a leitura do algoritmo: o nome e o pictograma do
     * movimento aparecem ao lado dele e o refrão vira uma fileira de pontos.
     * Sem isso, o ensaio provaria que o dançarino dança, e não que a ficha da
     * criança produz aquela dança — que é a evidência da habilidade.
     */
    const veil = scene.add.graphics().setDepth(DEPTH.veil).setAlpha(0)
    veil.fillStyle(C.ink, 0.62)
    veil.fillRect(0, 0, W, H)

    /*
     * A LEGENDA É UM CARTÃO, NÃO UM ÍCONE SOLTO.
     *
     * A folha de pictogramas vem no azul escuro do jogo, e tint não clareia
     * nada — então sobre o palco escurecido o desenho sumia. Em vez de pedir
     * uma segunda folha clara, o FUNDO é que muda: o movimento que está
     * saindo aparece no mesmo cartão creme dos outros lugares do jogo.
     */
    const caption = scene.add.container(0, 0).setDepth(DEPTH.lamp).setAlpha(0)
    let captionIcon: MoveIcon | null = null

    const CAP = { w: 214, h: 214 }
    const captionCard = scene.add.graphics()
    captionCard.fillStyle(C.ink, 1)
    captionCard.fillRoundedRect(-CAP.w / 2 - 5, -CAP.h / 2 - 5, CAP.w + 10, CAP.h + 10, 28)
    captionCard.fillStyle(C.sheetDeep, 1)
    captionCard.fillRoundedRect(-CAP.w / 2, -CAP.h / 2, CAP.w, CAP.h, 24)
    captionCard.fillStyle(C.sheet, 1)
    captionCard.fillRoundedRect(-CAP.w / 2, -CAP.h / 2, CAP.w, CAP.h - 9, 24)
    caption.add(captionCard)

    const captionText = scene.add
        .text(0, CAP.h / 2 - 34, '', { fontFamily: FONT.black, fontSize: '38px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    caption.add(captionText)

    /*
     * DUAS FILEIRAS DE PONTOS, UMA POR LAÇO.
     *
     * A de baixo, grande e quente, conta os REFRÕES fechados — o laço de
     * fora. A de cima, menor e âmbar, conta as voltas do laço de DENTRO e
     * zera a cada refrão. Sem ela, o §11 do planejamento perderia a única
     * evidência que o nível 2 existe para dar: a de que o contador interno
     * reinicia, em vez de continuar somando.
     *
     * As duas usam as cores das molduras da ficha — quente para FORA, âmbar
     * para DENTRO — para o palco e a ficha falarem a mesma língua.
     */
    const row = (g: Phaser.GameObjects.Graphics, y: number, current: number, total: number, r: number, face: number) => {
        const gap = r * 2.4
        const left = FOCUS.x - ((total - 1) * gap) / 2
        for (let i = 0; i < total; i++) {
            const x = left + i * gap
            // o que falta é um contorno vazio; o que fechou, cheio de luz.
            // Dois tons de cinza sobre o palco escuro não se separavam
            g.fillStyle(C.ink, 0.75)
            g.fillCircle(x, y, r + 4)
            if (i < current) {
                g.fillStyle(face, 1)
                g.fillCircle(x, y, r)
            } else {
                g.fillStyle(C.white, 0.22)
                g.fillCircle(x, y, r)
                g.fillStyle(C.ink, 0.75)
                g.fillCircle(x, y, r * 0.64)
            }
        }
    }

    const beads = scene.add.graphics().setDepth(DEPTH.lamp).setAlpha(0)
    const paintBeads = (current: number, total: number) => {
        beads.clear()
        if (total <= 0) return
        row(beads, FOCUS.footY + 70, current, total, 14, C.warm)
    }

    const inner = scene.add.graphics().setDepth(DEPTH.lamp).setAlpha(0)
    const paintInner = (current: number, total: number) => {
        inner.clear()
        if (total <= 0) return
        row(inner, FOCUS.footY + 30, current, total, 10, C.inner)
    }

    return {
        /**
         * Um movimento, do começo ao fim do tempo do compasso.
         *
         * A pose vem da folha; o DESLOCAMENTO vem daqui, porque é ele que
         * separa três desenhos parados de uma dança. O passo alterna de lado
         * a cada vez, senão o dançarino sairia andando para fora do palco.
         */
        async pose(move: Move, ms: number) {
            const t = target()
            const home = focusOn ? FOCUS.x : DANCER.x
            const base = sprite ? (focusOn ? dancerScale(FOCUS.height) : baseScale) : focusOn ? 1.5 : 1
            setPose(POSE_OF[move])

            if (move === 'step') {
                facing *= -1
                if (sprite) sprite.setFlipX(facing < 0)
                paintShadow(0.86)
                await FX.to(scene, t, { x: home + facing * 30 }, { duration: ms * 0.42, ease: 'Sine.easeOut' })
                await FX.to(scene, t, { x: home }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
            } else if (move === 'clap') {
                paintShadow(1)
                await FX.to(scene, t, { y: DANCER.footY - 14 }, { duration: ms * 0.3, ease: 'Sine.easeOut' })
                await FX.to(scene, t, { y: DANCER.footY }, { duration: ms * 0.34, ease: 'Sine.easeIn' })
            } else {
                // a volta inteira: o corpo vira e volta, em vez de girar a
                // imagem, que numa figura frontal pareceria tombo
                paintShadow(0.8)
                await FX.to(scene, t, { scaleX: -base }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
                await FX.to(scene, t, { scaleX: base }, { duration: ms * 0.38, ease: 'Sine.easeInOut' })
            }

            paintShadow(1)
            setPose('idle')
        },

        rest() {
            const t = target()
            scene.tweens.killTweensOf(t)
            t.setPosition(focusOn ? FOCUS.x : DANCER.x, DANCER.footY)
            const scale = focusOn ? dancerScale(FOCUS.height) : baseScale
            if (sprite) sprite.setScale(scale).setFlipX(false)
            else t.setScale(focusOn ? 1.5 : 1)
            facing = 1
            paintShadow(1)
            setPose('idle')
        },

        /** A pose de fim de nível: uma só, e parada. */
        async finish() {
            const t = target()
            setPose('spin')
            await FX.to(scene, t, { y: DANCER.footY - 26 }, { duration: 240, ease: 'Sine.easeOut' })
            await FX.to(scene, t, { y: DANCER.footY }, { duration: 260, ease: 'Bounce.easeOut' })
            setPose('clap')
        },

        /** A troca entre a tela de montar e a tela do ensaio. */
        async focus(on: boolean) {
            focusOn = on
            paintSpot(focusedX(), on ? 210 : 138)
            paintShadow(1)
            const t = target()
            const scale = on ? dancerScale(FOCUS.height) : baseScale
            scene.tweens.killTweensOf([veil, caption, beads])
            void FX.to(scene, veil, { alpha: on ? 1 : 0 }, { duration: 320 })
            if (!on) {
                caption.setAlpha(0)
                void FX.to(scene, [beads, inner], { alpha: 0 }, { duration: 200 })
            }
            await FX.to(
                scene,
                t,
                { x: on ? FOCUS.x : DANCER.x, scaleX: sprite ? scale : (on ? 1.5 : 1), scaleY: sprite ? scale : (on ? 1.5 : 1) },
                { duration: 420, ease: 'Sine.easeInOut' },
            )
            paintShadow(1)
        },

        /** O nome e o desenho do movimento que está saindo agora. */
        async say(move: Move) {
            if (!vivo(scene)) return
            captionIcon?.destroy()
            captionIcon = moveIcon(scene, move, 116, C.ink, C.inkSoft)
            captionIcon.setPosition(0, -26)
            caption.add(captionIcon)
            captionText.setText(MOVE_NAME[move])
            caption.setPosition(FOCUS.x + 296, FOCUS.footY - FOCUS.height * 0.5)
            scene.tweens.killTweensOf(caption)
            caption.setAlpha(0).setScale(0.8)
            await FX.to(scene, caption, { alpha: 1, scale: 1 }, { duration: 160, ease: 'Back.easeOut' })
        },

        /** Os refrões já fechados, em pontos — sem número e sem painel. */
        beads(current: number, total: number) {
            paintBeads(current, total)
            if (beads.alpha < 1) void FX.to(scene, beads, { alpha: 1 }, { duration: 200 })
        },

        /** As voltas do laço de dentro. `total` 0 esconde a fileira. */
        innerBeads(current: number, total: number) {
            paintInner(current, total)
            void FX.to(scene, inner, { alpha: total > 0 ? 1 : 0 }, { duration: 160 })
        },

        /** `null` tira a lâmpada de cena: ela só existe no nível 3. */
        setLamp(state: 'on' | 'off' | null) {
            if (state === null) {
                lamp.setVisible(false)
                return
            }
            paintLamp(state === 'on')
            if (lamp.visible) return
            lamp.setVisible(true).setAlpha(0).setScale(0.8)
            void FX.to(scene, lamp, { alpha: 1, scale: 1 }, { duration: 280, ease: 'Back.easeOut' })
        },

        /** O instante em que o sinal muda: o §11 quer isso visível e sonoro. */
        async blinkLamp() {
            paintLamp(false)
            scene.tweens.killTweensOf(lamp)
            lamp.setScale(1)
            await FX.to(scene, lamp, { scale: 1.16 }, { duration: 150, yoyo: true, ease: 'Sine.easeOut' })
        },

        lampBounds() {
            return { x: LAMP.x, y: LAMP.y + 10, w: LAMP.r * 2 + 80, h: LAMP.r * 2 + 108 }
        },

        spotlight(on: boolean) {
            scene.tweens.killTweensOf(spot)
            return FX.to(scene, spot, { alpha: on ? 1 : 0 }, { duration: 320 })
        },

        bounds() {
            return {
                x: DANCER.x,
                y: DANCER.footY - DANCER.height / 2,
                w: 268,
                h: DANCER.height + 60,
            }
        },

        destroy() {
            scene.tweens.killTweensOf([root, spot, veil, caption, beads, inner, lamp, sprite ?? root, doll ?? root])
            lamp.destroy(true)
            inner.destroy()
            captionIcon?.destroy()
            caption.destroy(true)
            beads.destroy()
            veil.destroy()
            spot.destroy()
            shadow.destroy()
            sprite?.destroy()
            doll?.destroy(true)
            root.destroy(true)
        },
    }
}

export type Stage = ReturnType<typeof createStage>
