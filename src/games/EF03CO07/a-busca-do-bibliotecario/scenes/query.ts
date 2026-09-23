import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, QUERY } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { ENGINES, TYPE_LABEL, type EngineId, type QueryState, type ResultType } from '../types'

interface Chip {
    /** A palavra, ou o nome do tipo quando a ficha é o filtro. */
    term: string
    /** A ficha do filtro é a única que não é palavra — e ela é só uma. */
    filter?: boolean
    root: Phaser.GameObjects.Container
    w: number
}

export function createQuery(scene: Phaser.Scene) {
    const root = scene.add.container(QUERY.x, QUERY.y).setDepth(DEPTH.query)

    const hw = QUERY.w / 2
    const hh = QUERY.h / 2

    /**
     * A MOLDURA DA BARRA É A CARA DO BUSCADOR.
     *
     * É a única coisa que a troca de ferramenta muda, e ela tem de mudar
     * MUITO: se a barra ficasse quase igual, a criança acharia que o toque
     * não funcionou em vez de ver que a ferramenta trocou e os resultados
     * não. Por isso a borda inteira muda de cor.
     */
    let engine: EngineId = 'grimorio'
    const bar = scene.add.graphics()
    const paintBar = () => {
        bar.clear()
        bar.fillStyle(C.ink, 0.22)
        bar.fillRoundedRect(-hw + 5, -hh + 8, QUERY.w, QUERY.h, 22)
        bar.fillStyle(ENGINES[engine].skin, 1)
        bar.fillRoundedRect(-hw, -hh, QUERY.w, QUERY.h, 22)
        bar.fillStyle(C.white, 1)
        bar.fillRoundedRect(-hw + 5, -hh + 5, QUERY.w - 10, QUERY.h - 10, 18)
    }
    paintBar()
    root.add(bar)

    const lens = scene.add.graphics()
    lens.lineStyle(6, C.woodDark, 1)
    lens.strokeCircle(-hw + 40, -3, 13)
    lens.lineBetween(-hw + 49, 6, -hw + 60, 17)
    root.add(lens)

    const shine = scene.add.graphics().setAlpha(0)
    shine.fillStyle(C.gold, 0.5)
    shine.fillRoundedRect(-hw + 5, -hh + 5, 90, QUERY.h - 10, 18)
    root.add(shine)

    let chips: Chip[] = []

    const chipWidth = (term: string) => term.length * 15 + 34

    const layout = () => {
        const total = chips.reduce((sum, chip) => sum + chip.w, 0) + QUERY.chipGap * (chips.length - 1)
        const room = QUERY.w - 90
        const scale = Math.min(1, room / Math.max(total, 1))
        let x = -hw + 74
        chips.forEach(chip => {
            chip.root.setScale(scale)
            chip.root.setX(x + (chip.w * scale) / 2)
            x += chip.w * scale + QUERY.chipGap * scale
        })
    }

    /**
     * A ficha do FILTRO é verde e tem o desenho do tipo dentro.
     *
     * Ela mora na mesma consulta que as palavras porque faz parte da mesma
     * pergunta — mas não pode PARECER uma palavra: filtro e palavra fazem
     * coisas diferentes com a estante, e duas fichas iguais diriam que são a
     * mesma coisa.
     */
    const makeChip = (term: string, filter = false): Chip => {
        const w = chipWidth(term) + (filter ? 26 : 0)
        const container = scene.add.container(0, 0)
        const g = scene.add.graphics()
        g.fillStyle(filter ? C.okDark : C.magicDeep, 1)
        g.fillRoundedRect(-w / 2, -QUERY.chipH / 2, w, QUERY.chipH, 12)
        g.fillStyle(filter ? C.ok : C.magic, 1)
        g.fillRoundedRect(-w / 2 + 3, -QUERY.chipH / 2 + 3, w - 6, QUERY.chipH - 8, 9)
        if (filter) {
            // o funil: o desenho do que um filtro faz
            g.fillStyle(C.white, 1)
            g.fillTriangle(-w / 2 + 14, -8, -w / 2 + 32, -8, -w / 2 + 23, 3)
            g.fillRect(-w / 2 + 21, 3, 4, 8)
        }
        container.add(g)
        container.add(
            scene.add
                .text(filter ? 11 : 0, -1, term, {
                    fontFamily: FONT.black, fontSize: '21px', color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2),
        )
        root.add(container)
        return { term, filter, root: container, w }
    }

    /** O filtro é sempre a ÚLTIMA ficha: ele se aplica à consulta inteira. */
    const reseat = () => {
        const f = chips.find(chip => chip.filter)
        if (!f) return
        chips = [...chips.filter(chip => chip !== f), f]
    }

    return {
        set(q: QueryState) {
            chips.forEach(chip => chip.root.destroy(true))
            chips = q.terms.map(term => makeChip(term))
            if (q.filter) chips.push(makeChip(TYPE_LABEL[q.filter], true))
            engine = q.engine
            paintBar()
            layout()
        },

        /** Põe (ou troca) a ficha do filtro, vinda do botão que foi tocado. */
        async setFilter(type: ResultType | undefined, from: { x: number; y: number }) {
            const old = chips.find(chip => chip.filter)
            if (old) {
                chips = chips.filter(chip => chip !== old)
                old.root.destroy(true)
            }
            if (!type) { layout(); return }

            const chip = makeChip(TYPE_LABEL[type], true)
            chips.push(chip)
            reseat()
            layout()

            const target = { x: chip.root.x, y: chip.root.y }
            const scale = chip.root.scaleX
            chip.root.setPosition(from.x - QUERY.x, from.y - QUERY.y).setScale(scale * 1.4)
            await FX.arcTo(scene, chip.root, target, { height: 70, duration: 380 })
            await FX.to(scene, chip.root, { scale }, { duration: 140, ease: 'Back.easeOut' })
        },

        /**
         * A TROCA DE FERRAMENTA.
         *
         * A barra pisca e muda de cor, e NENHUMA ficha se mexe — a consulta
         * é a mesma. É de propósito que o gesto seja grande e o efeito na
         * estante, nenhum.
         */
        async setEngine(next: EngineId) {
            engine = next
            await FX.to(scene, root, { scale: 1.04 }, { duration: 140 })
            paintBar()
            shine.setAlpha(1).setX(0)
            await FX.all(
                FX.to(scene, root, { scale: 1 }, { duration: 200, ease: 'Back.easeOut' }),
                FX.to(scene, shine, { x: QUERY.w - 100 }, { duration: 360 }),
            )
            await FX.to(scene, shine, { alpha: 0 }, { duration: 140 })
            shine.setX(0)
        },

        async add(term: string, from: { x: number; y: number }) {
            const chip = makeChip(term)
            chips.push(chip)
            reseat()
            layout()

            const target = { x: chip.root.x, y: chip.root.y }
            const scale = chip.root.scaleX
            chip.root.setPosition(from.x - QUERY.x, from.y - QUERY.y).setScale(scale * 1.4)
            await FX.arcTo(scene, chip.root, target, { height: 70, duration: 380 })
            await FX.to(scene, chip.root, { scale }, { duration: 140, ease: 'Back.easeOut' })
        },

        async remove(term: string, to?: { x: number; y: number }) {
            const chip = chips.find(item => !item.filter && item.term === term)
            if (!chip) return
            chips = chips.filter(item => item !== chip)
            if (to) {
                await FX.arcTo(scene, chip.root, { x: to.x - QUERY.x, y: to.y - QUERY.y }, { height: 60, duration: 360 })
                chip.root.destroy(true)
            } else {
                await FX.to(scene, chip.root, { y: -40, alpha: 0, scale: 0.6 }, { duration: 300 })
                chip.root.destroy(true)
            }
            layout()
        },

        async run() {
            shine.setAlpha(1).setX(0)
            await FX.to(scene, shine, { x: QUERY.w - 100 }, { duration: 420, ease: 'Sine.easeInOut' })
            await FX.to(scene, shine, { alpha: 0 }, { duration: 140 })
            shine.setX(0)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Query = ReturnType<typeof createQuery>
