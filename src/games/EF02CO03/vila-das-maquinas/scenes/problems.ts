import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { DEPTH, STAGE, crewStageY } from '../data/layout'
import { C } from '../data/theme'
import { ITEM, hasItems, itemBox, makeBox, makeBread, makeCat, makeFish, makeLeaf, makeLeafPile } from './items'
import type { Shot } from './cinema'
import type { Anchors, Point, ProblemId } from '../types'

/** O balão de desejo do gatinho: o petisco apagado que ganha cor ao chegar. */
function makeWish(scene: Phaser.Scene) {
    const wish = scene.add.container(0, 0)
    const bubble = scene.add.graphics()
    bubble.fillStyle(C.ink, 1)
    bubble.fillRoundedRect(-44, -36, 88, 72, 24)
    bubble.fillStyle(C.white, 1)
    bubble.fillRoundedRect(-39, -31, 78, 62, 19)
    bubble.fillStyle(C.ink, 1)
    bubble.fillCircle(36, 40, 10)
    bubble.fillStyle(C.white, 1)
    bubble.fillCircle(36, 39, 7)

    const fish = makeFish(scene, 62)
    wish.add([bubble, fish.root])
    return { wish, grant: fish.grant }
}

export interface ProblemHandle {
    root: Phaser.GameObjects.Container
    anchors: Anchors
    /** Enquadramento de abertura do modo cena. */
    shot: Shot
    /** O fechado, para o momento em que o problema muda de estado. */
    detail: Shot
    /** Para onde a máquina certa se desloca enquanto executa. Opcional. */
    workTo?: Point
    solve: (step: number) => Promise<void>
    nudge: () => Promise<void>
    hoist?: (to: Point) => Promise<void>
    settle?: () => Promise<void>
    parcel?: Phaser.GameObjects.Container
    parcelLand?: Point
    hover?: Point
    destroy: () => void
}

function createLeaves(scene: Phaser.Scene): ProblemHandle {
    const root = scene.add.container(0, 0).setDepth(DEPTH.problem)

    const walkX = STAGE.left + 26
    const walkW = STAGE.w - 52
    const walk = scene.add.graphics()
    walk.fillStyle(C.ink, 0.28)
    walk.fillRoundedRect(walkX, 418, walkW, 44, 14)
    walk.fillStyle(C.stoneDark, 1)
    walk.fillRoundedRect(walkX, 414, walkW, 44, 14)
    walk.fillStyle(C.stone, 1)
    walk.fillRoundedRect(walkX, 414, walkW, 34, 14)
    for (let x = walkX + 88; x < walkX + walkW - 20; x += 92) {
        walk.fillStyle(C.stoneDark, 0.55)
        walk.fillRect(x, 416, 6, 30)
    }
    root.add(walk)

    const pile = makeLeafPile(scene, 186)
    pile.setPosition(792, 402)
    root.add(pile)

    /**
     * O tinte é MULTIPLICADO no sprite, que já é laranja: qualquer cor forte
     * escurece a folha em vez de variá-la. Só tons quase brancos passam.
     */
    const loose: Array<[number, number, number, number, number]> = [
        [634, 422, 66, -22, 0xffffff],
        [676, 450, 58, 26, 0xffd98c],
        [712, 424, 54, 12, 0xffb894],
        [906, 424, 62, 14, 0xffffff],
        [878, 452, 54, -38, 0xffd98c],
        [750, 456, 60, 42, 0xffb894],
    ]
    const leaves = loose.map(([x, y, box, angle, tint]) => {
        const leaf = makeLeaf(scene, box, tint)
        leaf.setPosition(x, y).setAngle(angle)
        root.add(leaf)
        return leaf
    })

    const pieces = [pile, ...leaves]

    const shine = scene.add.graphics().setAlpha(0)
    shine.fillStyle(C.white, 0.85)
    shine.fillRoundedRect(walkX + 8, 418, walkW - 16, 12, 6)
    root.add(shine)

    return {
        root,
        anchors: {
            machine: { x: 476, y: crewStageY },
            strip: { x: 476, y: 286 },
            focus: { x: 786, y: 406 },
        },
        shot: { at: { x: 668, y: 390 }, zoom: 1.5 },
        detail: { at: { x: 800, y: 400 }, zoom: 1.85 },
        workTo: { x: 856, y: crewStageY },

        async solve() {
            await FX.stagger(scene, pieces, async piece => {
                void FX.to(scene, piece, { angle: piece.angle + 300 }, { duration: 620 })
                await FX.to(
                    scene,
                    piece,
                    {
                        x: piece.x + Phaser.Math.Between(60, 150),
                        y: piece.y - Phaser.Math.Between(70, 160),
                        alpha: 0,
                        scale: 0.5,
                    },
                    { duration: 620, ease: Ease.smooth },
                )
            }, 55)
            void FX.to(scene, shine, { alpha: 1 }, { duration: 200, yoyo: true })
            await FX.sparks(scene, 786, 416, { color: C.white, count: 16, spread: 150 })
        },

        async nudge() {
            await FX.all(
                ...pieces.map(piece =>
                    FX.to(scene, piece, { angle: piece.angle + 14 }, { duration: 140, yoyo: true, repeat: 2 }),
                ),
            )
        },

        destroy() {
            FX.kill(scene, pieces)
            root.destroy(true)
        },
    }
}

function createRawBread(scene: Phaser.Scene): ProblemHandle {
    const root = scene.add.container(0, 0).setDepth(DEPTH.problem)

    const table = scene.add.graphics()
    table.fillStyle(C.ink, 1)
    table.fillRoundedRect(668, 400, 26, 34, 8)
    table.fillRoundedRect(888, 400, 26, 34, 8)
    table.fillStyle(C.woodDark, 1)
    table.fillRoundedRect(672, 400, 18, 30, 6)
    table.fillRoundedRect(892, 400, 18, 30, 6)
    table.fillStyle(C.ink, 1)
    table.fillRoundedRect(636, 376, 310, 32, 12)
    table.fillStyle(C.wood, 1)
    table.fillRoundedRect(640, 380, 302, 24, 9)
    table.fillStyle(C.woodLight, 0.55)
    table.fillRoundedRect(648, 383, 286, 9, 5)
    root.add(table)

    const home = { x: 790, y: 341 }
    const bread = makeBread(scene, 168)
    const dough = bread.root
    dough.setPosition(home.x, home.y)
    root.add(dough)

    /* Na segunda etapa o próprio pão é a carga do drone. */
    const delivered = { x: 470, y: STAGE.ground - 34 }

    const steam = scene.add.graphics().setAlpha(0)
    steam.lineStyle(7, C.white, 0.9)
    for (let i = -1; i <= 1; i++) {
        steam.beginPath()
        steam.moveTo(i * 34, 0)
        steam.lineTo(i * 34 - 10, -22)
        steam.lineTo(i * 34 + 8, -44)
        steam.strokePath()
    }
    const steamBox = scene.add.container(790, 306, [steam])
    root.add(steamBox)

    return {
        root,
        anchors: {
            machine: { x: 528, y: crewStageY },
            strip: { x: 528, y: 286 },
            focus: { x: 790, y: 341 },
        },
        shot: { at: { x: 672, y: 372 }, zoom: 1.5 },
        /* Enquadra o forninho E o pão: é a luz dele que doura a massa. */
        detail: { at: { x: 722, y: 350 }, zoom: 1.8 },

        parcel: dough,
        parcelLand: delivered,
        hover: { x: 640, y: 248 },

        async solve(step: number) {
            if (step > 0) {
                void FX.to(scene, steamBox, { alpha: 0 }, { duration: 200 })
                void FX.ping(scene, delivered.x, delivered.y, C.ok, { radius: 104 })
                await FX.sparks(scene, delivered.x, delivered.y, { color: C.ok, count: 16, spread: 140 })
                return
            }

            await bread.bake()
            void FX.to(scene, steamBox, { alpha: 1, y: 282 }, { duration: 700 })
            void FX.ping(scene, home.x, home.y, C.ovenLight, { radius: 110 })
            await FX.sparks(scene, home.x, home.y, { color: C.ovenLight, count: 18, spread: 150 })
        },

        async nudge() {
            await FX.to(scene, dough, { angle: 6 }, { duration: 120, yoyo: true, repeat: 3 })
            dough.setAngle(0)
        },

        async hoist(to: Point) {
            await FX.arcTo(scene, dough, to, { height: 70, duration: 520 })
        },

        async settle() {
            await FX.arcTo(scene, dough, home, { height: 90, duration: 460 })
            await FX.to(scene, dough, { scaleY: 0.82 }, { duration: 110, yoyo: true })
        },

        destroy() {
            FX.kill(scene, dough)
            root.destroy(true)
        },
    }
}

/**
 * O gatinho espera no chão, e não em cima de uma casa.
 *
 * A casa era desenhada em código — parede, telhas, chaminé, porta e duas
 * janelas — e disputava com as casas pintadas do `bg-vila.png`, que estão
 * logo atrás. Estrutura desse tamanho é trabalho de textura, não de Graphics.
 *
 * O drone continua fazendo sentido: ele é quem LEVA a encomenda, e nenhuma das
 * outras duas sai do lugar carregando coisa.
 */
function createRoofCat(scene: Phaser.Scene): ProblemHandle {
    const root = scene.add.container(0, 0).setDepth(DEPTH.problem)

    const catHome = STAGE.ground - 52
    const cat = makeCat(scene, 104)
    cat.setPosition(820, catHome)
    root.add(cat)
    const breathe = FX.breathe(scene, cat, { grow: 1.04, duration: 2200 })

    const { wish, grant } = makeWish(scene)
    wish.setPosition(722, catHome - 98)
    root.add(wish)
    const bob = FX.float(scene, wish, { amount: 6, duration: 2400 })

    const box = makeBox(scene, 96)
    const parcel = box.root
    parcel.setPosition(496, STAGE.ground - 48)
    root.add(parcel)

    const parcelLand = { x: 892, y: STAGE.ground - 44 }

    return {
        root,
        parcel,
        parcelLand,
        hover: { x: 884, y: 250 },
        anchors: {
            machine: { x: 500, y: crewStageY },
            strip: { x: 500, y: 286 },
            focus: { x: 820, y: 352 },
        },
        shot: { at: { x: 700, y: 356 }, zoom: 1.42 },
        /*
         * Mais aberto que os outros dois de propósito: aqui o quadro precisa
         * caber o drone lá em cima, o gatinho no chão, o balão do desejo e as
         * plaquinhas — fechar mais deixaria alguma dessas coisas de fora.
         */
        detail: { at: { x: 744, y: 320 }, zoom: 1.44 },

        async solve() {
            breathe.remove()
            await box.open()
            void FX.sparks(scene, parcelLand.x, parcelLand.y, { color: C.ovenLight, count: 14, spread: 110 })

            await FX.to(scene, cat, { x: 848 }, { duration: 420, ease: Ease.smooth })
            await FX.to(scene, cat, { y: catHome - 30 }, { duration: 220, yoyo: true, repeat: 1, ease: Ease.back(2.2) })
            cat.setPosition(848, catHome)

            grant()
            void FX.to(scene, wish, { scale: 1.24 }, { duration: 220, yoyo: true, ease: Ease.back(2.4) })
            void FX.ping(scene, wish.x, wish.y, C.ok, { radius: 96 })
            await FX.stars(scene, cat.x, cat.y - 60, { color: C.ok, count: 12 })
        },

        async nudge() {
            await FX.to(scene, cat, { angle: 7 }, { duration: 150, yoyo: true, repeat: 2 })
            cat.setAngle(0)
        },

        destroy() {
            breathe.remove()
            bob.remove()
            FX.kill(scene, [cat, wish, parcel])
            root.destroy(true)
        },
    }
}

export function createProblem(scene: Phaser.Scene, id: ProblemId): ProblemHandle {
    if (id === 'leaves') return createLeaves(scene)
    if (id === 'rawBread') return createRawBread(scene)
    return createRoofCat(scene)
}

/**
 * A versão pequena do problema, para o balão do morador.
 *
 * O gatinho continua em `Graphics`: `itens.png` traz o lanchinho, e o lanchinho
 * é a SOLUÇÃO. O pictograma do pedido tem que mostrar quem está com fome.
 */
export function problemIcon(scene: Phaser.Scene, id: ProblemId, size: number) {
    if (id === 'roofCat') {
        const icon = scene.add.container(0, 0)
        icon.add(makeCat(scene, size * 1.16))
        return icon
    }

    const frame = id === 'leaves' ? ITEM.leafPile : ITEM.doughRaw
    if (hasItems(scene)) return itemBox(scene, frame, size * 1.2).root

    const icon = scene.add.container(0, 0)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillEllipse(0, 4, size * 0.94, size * 0.56)
    g.fillStyle(id === 'leaves' ? C.leafA : C.doughRaw, 1)
    g.fillEllipse(0, 4, size * 0.84, size * 0.46)
    icon.add(g)
    return icon
}
