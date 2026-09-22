import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import {
    BG_OFFSET_Y, COURSE, DEPTH, FRAME_NUDGE, GROUND, H,
    OBSTACLE_ART, PARK, SKATER, W, type ObstacleArt,
} from '../data/layout'
import { approachX, trickPath, type MoveFrame } from '../data/moves'
import type { FeatureKind, TrickKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/** Quadros da folha: 0 parado · 1 empurrando · 2 agachado · 3 no ar · 6 tombo · 7 comemora. */
const F = { parado: 0, empurra: 1, agacha: 2, ar: 3, tombo: 6, festa: 7 }

const footY = (ratio = SKATER.footRatio) => GROUND.y - ratio * SKATER.size

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  O PARQUE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tudo que a REGRA consulta é desenhado aqui em Graphics: a rampa e o
 * caixote existem como número antes de existirem como desenho, porque é o
 * código que precisa saber onde fica o lábio para animar a subida. Arte que
 * a física não conhece é arte que discorda do jogo.
 *
 * O CHÃO, porém, é o do `bg-parque.png`. O fundo veio limpo — só muro,
 * árvores e a laje de concreto —, então o jogo NÃO desenha pista nenhuma: os
 * marcos são plantados direto no deck pintado. Desenhar um segundo concreto
 * por cima do primeiro seria criar a emenda que o TEXTURAS.md manda evitar.
 */
export function createPark(scene: Phaser.Scene, marks: FeatureKind[]) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.scenery)

    /* O parque não invade as faixas da fita e da paleta, nem quando o foco
     * aproxima 12 %. Sem esta máscara o zoom vazaria por cima dos painéis. */
    const maskShape = scene.make.graphics({ x: 0, y: 0 }, false)
    maskShape.fillStyle(0xffffff, 1)
    maskShape.fillRect(0, PARK.top, W, PARK.bottom - PARK.top)
    root.setMask(maskShape.createGeometryMask())

    // ────────────────────────────────────────────────────────── cenário

    if (scene.textures.exists('bg-parque')) {
        const bg = scene.add.image(W / 2, H / 2 + BG_OFFSET_Y, 'bg-parque')
        bg.setDisplaySize(W, H)
        root.add(bg)

        /* Um véu claro empurra o cenário para trás: o skatista é a coisa
         * mais saturada da tela, e é nele que o olho tem de cair. */
        const veil = scene.add.graphics()
        veil.fillStyle(C.cream, 0.1)
        veil.fillRect(0, PARK.top, W, PARK.bottom - PARK.top)
        root.add(veil)
    }

    // ─────────────────────────────────────────────────────────── marcos

    const count = marks.length
    const span = COURSE.lastX - COURSE.firstX
    const xs = marks.map((_, i) => (count === 1 ? W / 2 : COURSE.firstX + (span * i) / (count - 1)))

    const marksG = scene.add.graphics().setDepth(DEPTH.mark - 1)
    const glow = scene.add.graphics().setDepth(DEPTH.mark - 2)
    root.add([marksG, glow])

    /**
     * O marco `plano` é o único que continua em `Graphics`: duas setas
     * pintadas no concreto. É de propósito — "não tem nada aqui" precisa
     * parecer não ter nada, e uma textura de "nada" seria uma contradição.
     */
    function paintFlat(g: Phaser.GameObjects.Graphics, x: number) {
        for (let k = 0; k < 2; k++) {
            const cx = x - 26 + k * 52
            g.fillStyle(C.ink, 0.3)
            g.fillTriangle(cx - 16, GROUND.y + 2, cx - 16, GROUND.y + 30, cx + 8, GROUND.y + 16)
            g.fillStyle(C.shirt, 0.55)
            g.fillTriangle(cx - 16, GROUND.y + 5, cx - 16, GROUND.y + 27, cx + 4, GROUND.y + 16)
        }
    }

    /**
     * PLANTAR UMA PEÇA NA PISTA.
     *
     * O sprite é posicionado pela CAIXA ALFA medida no PNG, não pelo quadro:
     * o desenho da rampa começa a 6,5 % da esquerda do arquivo e o corrimão
     * só ocupa a metade de baixo do seu. Ancorando pelo quadro, a rampa
     * ficaria deslocada do seu marco e o corrimão flutuaria meio corpo acima
     * da pista.
     *
     * A conta leva a base da caixa alfa até `GROUND.y` e o centro dela até o
     * `x` do marco — que é exatamente onde o `trickPath` acha que a peça está.
     */
    function plantar(art: ObstacleArt, x: number) {
        const larguraQuadro = art.w / (art.box.x1 - art.box.x0)
        const alturaQuadro = art.h / (art.box.y1 - art.box.y0)
        const centroX = (art.box.x0 + art.box.x1) / 2

        const peça = scene.add.sprite(0, 0, art.key, art.frame)
        peça.setDisplaySize(larguraQuadro, alturaQuadro)
        peça.x = x - (centroX - 0.5) * larguraQuadro
        peça.y = GROUND.y - (art.box.y1 - 0.5) * alturaQuadro
        peça.setDepth(DEPTH.mark)
        return peça
    }

    const peças: Phaser.GameObjects.Sprite[] = []

    function paintMarks() {
        marksG.clear()
        peças.forEach(p => p.destroy())
        peças.length = 0

        marks.forEach((kind, i) => {
            if (kind === 'plano') {
                paintFlat(marksG, xs[i])
                return
            }
            const art = OBSTACLE_ART[kind === 'rampa' ? 'rampa' : 'caixa']
            /* Sem a textura carregada o jogo não pode parar de funcionar: a
             * sombra em Graphics sozinha já marca onde a peça está. */
            if (!scene.textures.exists(art.key)) {
                marksG.fillStyle(C.ink, 0.25)
                marksG.fillRoundedRect(xs[i] - art.w / 2, GROUND.y - art.h, art.w, art.h, 10)
                return
            }
            const peça = plantar(art, xs[i])
            root.add(peça)
            peças.push(peça)
        })
    }
    paintMarks()

    // ───────────────────────────────────────────────────────── adereços

    if (scene.textures.exists('decor')) {
        const props: Array<[number, number, number]> = [[0, 58, 0.44], [3, 1204, 0.38]]
        props.forEach(([frame, x, ratio]) => {
            const prop = scene.add.sprite(x, GROUND.y - ratio * 96, 'decor', frame)
            prop.setDisplaySize(96, 96).setAlpha(0.9)
            root.add(prop)
        })
    }

    // ─────────────────────────────────────────────── skatista e fantasma

    const ghost = scene.add.sprite(SKATER.startX, footY(), 'skatista', F.parado)
    ghost.setDisplaySize(SKATER.size, SKATER.size)
    /* Azul forte e meio transparente. A 0,8 de alfa com tinta clara ele saía
     * igual ao skatista de verdade, e a criança via DOIS meninos iguais sem
     * saber qual era a demonstração. Fantasma tem de parecer fantasma. */
    ghost.setAlpha(0).setTint(0x7fb2ff).setDepth(DEPTH.ghost)
    root.add(ghost)

    const skater = scene.add.sprite(SKATER.startX, footY(), 'skatista', F.parado)
    skater.setDisplaySize(SKATER.size, SKATER.size).setDepth(DEPTH.skater)
    root.add(skater)

    const dust = scene.add.graphics().setDepth(DEPTH.featureFront)
    root.add(dust)

    let rolling: Phaser.Time.TimerEvent | null = null

    /** Troca 0 ↔ 1 enquanto anda: é o ciclo de empurrar, e ele dá vida. */
    function startRollCycle(sprite: Phaser.GameObjects.Sprite) {
        stopRollCycle()
        let on = false
        rolling = scene.time.addEvent({
            delay: 190,
            loop: true,
            callback: () => {
                on = !on
                sprite.setFrame(on ? F.empurra : F.parado)
            },
        })
    }

    function stopRollCycle() {
        rolling?.remove()
        rolling = null
    }

    function setFrame(sprite: Phaser.GameObjects.Sprite, frame: number) {
        sprite.setFrame(frame)
        const nudge = FRAME_NUDGE[frame]
        sprite.setDisplaySize(SKATER.size, SKATER.size)
        if (nudge) sprite.setDisplayOrigin(
            sprite.width / 2 - (nudge.dx * sprite.width) / SKATER.size,
            sprite.height / 2 - (nudge.dy * sprite.height) / SKATER.size,
        )
        else sprite.setDisplayOrigin(sprite.width / 2, sprite.height / 2)
    }

    function puff(x: number, y: number) {
        dust.fillStyle(C.deckEdge, 0.55)
        dust.fillCircle(x, y, 9)
        void FX.to(scene, fx(dust), { alpha: 0 }, { duration: 320 }).then(() => {
            dust.clear()
            dust.setAlpha(1)
        })
    }

    // ─────────────────────────────────────────────────────── movimentos

    async function rollTo(sprite: Phaser.GameObjects.Sprite, x: number, speed = 0.36) {
        /*
         * NUNCA PARA TRÁS. Um ollie termina 190 px depois do seu marco, e o
         * marco seguinte pode começar antes disso — pedir para "rolar até" um
         * ponto já ultrapassado faria o skatista andar de ré no meio do
         * percurso. Ele simplesmente já chegou.
         */
        if (x <= sprite.x + 1) return
        const distance = x - sprite.x
        startRollCycle(sprite)
        await FX.to(scene, fx(sprite), { x }, {
            duration: distance / speed,
            ease: 'Sine.easeInOut',
        })
        stopRollCycle()
        setFrame(sprite, F.parado)
    }

    const FRAME_OF: Record<MoveFrame, number> = {
        parado: F.parado, empurra: F.empurra, agacha: F.agacha, ar: F.ar,
    }

    /**
     * A manobra percorre os pontos de `data/moves.ts` — os MESMOS que o
     * `plan` desenha como linha pontilhada sobre o parque.
     *
     * Ter uma fonte só não é economia de código: é a garantia de que o
     * caminho que a criança viu ao montar é o caminho que ela vai ver rodar.
     * Duas contas separadas divergiriam no primeiro ajuste de altura, e o
     * jogo inteiro depende dessa promessa.
     */
    async function perform(sprite: Phaser.GameObjects.Sprite, kind: TrickKind, index: number) {
        const path = trickPath(kind, xs[index])
        if (kind === 'empurrar') puff(sprite.x - 30, GROUND.y + 10)

        for (const step of path) {
            setFrame(sprite, FRAME_OF[step.frame])
            if (step.frame === 'ar' && sprite.y > footY() - 20) puff(sprite.x, GROUND.y + 8)
            await FX.to(scene, fx(sprite), {
                x: step.x,
                y: step.y - SKATER.footRatio * SKATER.size,
            }, { duration: step.ms, ease: step.ease })
        }

        setFrame(sprite, F.parado)
        if (kind !== 'empurrar') puff(sprite.x, GROUND.y + 8)
    }

    return {
        root,
        marksX: xs,
        markX: (i: number) => xs[i],
        skaterPos: () => ({ x: skater.x, y: skater.y }),

        reset() {
            stopRollCycle()
            FX.kill(scene, fx(skater))
            skater.setPosition(SKATER.startX, footY())
            skater.setAlpha(1).setAngle(0)
            setFrame(skater, F.parado)
            paintMarks()
            glow.clear()
        },

        /** Acende o marco que está sendo executado agora. */
        highlight(index: number) {
            glow.clear()
            if (index < 0) return
            glow.fillStyle(C.warn, 0.28)
            glow.fillEllipse(xs[index], GROUND.y + 16, 190, 40)
            glow.fillStyle(C.warn, 0.55)
            glow.fillEllipse(xs[index], GROUND.y + 16, 120, 22)
        },

        /**
         * A ENTRADA. O skatista chega rolando de fora da tela em vez de
         * aparecer plantado no lugar — é o que transforma "existe um boneco
         * ali" em "alguém chegou". Só acontece na abertura do nível.
         */
        async enter() {
            stopRollCycle()
            skater.setAlpha(1).setAngle(0)
            setFrame(skater, F.parado)
            skater.setPosition(-90, footY())
            await rollTo(skater, SKATER.startX, 0.42)
        },

        /** O fantasma aparece ao lado, para a fala ter a quem se referir. */
        async summonGhost() {
            FX.kill(scene, fx(ghost))
            ghost.setPosition(SKATER.startX + 150, footY())
            setFrame(ghost, F.parado)
            ghost.setAlpha(0)
            await FX.to(scene, fx(ghost), { alpha: 0.6 }, { duration: 420 })
        },

        rollTo: (x: number) => rollTo(skater, x),
        approachX: (i: number, kind: TrickKind) => approachX(kind, xs[i]),
        act: (kind: TrickKind, index: number) => perform(skater, kind, index),

        /**
         * O FANTASMA — o "faz igual ele fez" do game of S.K.A.T.E. Ele é o
         * mesmo sprite com alpha e tinta fria: não existe folha de fantasma
         * a produzir, e a criança reconhece o skatista nele.
         */
        async ghostRun(line: TrickKind[]) {
            /* Se ele já foi chamado na abertura, continua de onde está: um
             * corte para o ponto de partida quebraria a apresentação. */
            const jaEmCena = ghost.alpha > 0.05
            if (!jaEmCena) {
                FX.kill(scene, fx(ghost))
                ghost.setPosition(SKATER.startX, footY()).setAlpha(0)
                setFrame(ghost, F.parado)
            }
            /* O skatista de verdade SOME durante a demonstração. Deixá-lo
             * a 25 % punha dois skatistas no mesmo ponto de partida, e a
             * criança não sabia qual dos dois era para olhar. */
            skater.setAlpha(0)

            if (!jaEmCena) await FX.to(scene, fx(ghost), { alpha: 0.6 }, { duration: 260 })
            for (let i = 0; i < line.length; i++) {
                this.highlight(i)
                await rollTo(ghost, approachX(line[i], xs[i]), 0.5)
                await perform(ghost, line[i], i)
            }
            this.highlight(-1)
            await rollTo(ghost, SKATER.exitX, 0.6)
            await FX.to(scene, fx(ghost), { alpha: 0 }, { duration: 200 })
            ghost.setPosition(SKATER.startX, footY())
            skater.setAlpha(1)
        },

        /** O tombo: cômico, sem dano, e no lugar exato onde a linha quebrou. */
        async fall(index: number) {
            stopRollCycle()
            setFrame(skater, F.tombo)
            skater.y = GROUND.y - SKATER.fallFootRatio * SKATER.size
            puff(skater.x + 20, GROUND.y + 8)
            await FX.to(scene, fx(skater), { x: skater.x + 46 }, {
                duration: 260, ease: 'Sine.easeOut',
            })
            void FX.ping(scene, xs[index], GROUND.y - 30, C.bad, { radius: 150, duration: 420 })
            await FX.wait(scene, 320)
        },

        async cheer() {
            stopRollCycle()
            setFrame(skater, F.festa)
            await FX.to(scene, fx(skater), { y: skater.y - 38 }, {
                duration: 220, ease: Ease.back(3), yoyo: true,
            })
        },

        destroy() {
            peças.forEach(p => p.destroy())
            stopRollCycle()
            FX.kill(scene, fx(skater))
            FX.kill(scene, fx(ghost))
            root.destroy(true)
            maskShape.destroy()
        },
    }
}
