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

/**
 * A casinha do gatinho.
 *
 * O telhado é feito de fileiras de telhas em vez de um triângulo chapado: o
 * `bg-vila.png` tem telhado assim, e um triângulo liso no meio da tela
 * denunciava que aquela casa era de outro desenho.
 */
function makeHouse(scene: Phaser.Scene) {
    const house = scene.add.container(0, 0)
    const g = scene.add.graphics()

    const left = 692
    const right = 908
    const wallTop = 372
    const wallBottom = 432
    const apexX = 800
    const apexY = 300
    const eaveL = 654
    const eaveR = 946
    const eaveY = 388

    g.fillStyle(C.ink, 0.16)
    g.fillEllipse(800, 434, 268, 22)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(left - 5, wallTop - 5, right - left + 10, wallBottom - wallTop + 10, 12)
    g.fillStyle(0xf7e6c8, 1)
    g.fillRoundedRect(left, wallTop, right - left, wallBottom - wallTop, 8)
    g.fillStyle(0xe6d0ad, 1)
    g.fillRect(left, wallBottom - 14, right - left, 14)
    for (let i = 0; i < 5; i++) {
        g.fillStyle(0xe0c8a2, 0.85)
        g.fillRoundedRect(left + 10 + i * 42, wallBottom - 12, 30, 9, 4)
    }

    g.fillStyle(C.ink, 1)
    g.fillTriangle(eaveL - 6, eaveY + 6, eaveR + 6, eaveY + 6, apexX, apexY - 12)
    g.fillStyle(C.roofDark, 1)
    g.fillTriangle(eaveL, eaveY, eaveR, eaveY, apexX, apexY)

    /* As telhas: quatro fileiras de meias-luas, encolhendo em direção ao topo. */
    const rows = 4
    for (let r = 0; r < rows; r++) {
        const t = r / rows
        const y = eaveY - 4 - r * 21
        const spread = (1 - t) * ((eaveR - eaveL) / 2) * 0.94
        const count = Math.max(3, Math.round(11 - r * 2))
        const step = (spread * 2) / count
        g.fillStyle(r % 2 === 0 ? C.roofRed : 0xe25c5c, 1)
        for (let i = 0; i <= count; i++) {
            g.fillCircle(apexX - spread + i * step, y, step * 0.62)
        }
    }
    g.fillStyle(C.white, 0.14)
    g.fillTriangle(eaveL + 30, eaveY - 10, apexX - 6, apexY + 14, apexX - 6, eaveY - 10)

    /* A chaminé fica no caimento da esquerda: no topo, o gatinho a esconde. */
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(758, 262, 36, 58, 8)
    g.fillStyle(0xc98d6b, 1)
    g.fillRoundedRect(762, 266, 28, 52, 6)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(752, 258, 48, 18, 8)
    g.fillStyle(0xdba884, 1)
    g.fillRoundedRect(756, 262, 40, 12, 6)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(768, 384, 64, 52, 10)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(772, 388, 56, 48, 8)
    g.fillStyle(C.woodDark, 0.6)
    g.fillRect(798, 390, 4, 44)
    g.fillStyle(C.ovenLight, 1)
    g.fillCircle(790, 412, 4)

    for (const wx of [724, 876]) {
        g.fillStyle(C.ink, 1)
        g.fillCircle(wx, 398, 20)
        g.fillStyle(0x9fd7ef, 1)
        g.fillCircle(wx, 398, 15)
        g.fillStyle(C.white, 0.5)
        g.fillCircle(wx - 4, 394, 6)
        g.fillStyle(C.ink, 1)
        g.fillRect(wx - 16, 396, 32, 4)
        g.fillRect(wx - 2, 383, 4, 30)
    }

    house.add(g)
    return house
}

/**
 * A fumacinha da chaminé: três baforadas subindo em laço.
 *
 * Cinza-azulada, e não branca: o céu do `bg-vila.png` tem nuvens brancas
 * exatamente ali, e a fumaça branca sumia dentro delas.
 */
function makeSmoke(scene: Phaser.Scene, at: Point) {
    const puffs: Phaser.GameObjects.Arc[] = []
    for (let i = 0; i < 3; i++) {
        const puff = scene.add.circle(at.x, at.y, 11, 0xccdae5, 0.9).setDepth(DEPTH.problem)
        puff.setStrokeStyle(3, 0x9fb2c2, 0.55)
        puff.setScale(0.5).setAlpha(0)
        puffs.push(puff)
        scene.tweens.add({
            targets: puff,
            y: at.y - 62,
            x: at.x + 20,
            scale: 1.25,
            alpha: { from: 0.85, to: 0 },
            duration: FX.ms(scene, 2600),
            delay: FX.ms(scene, i * 860),
            repeat: -1,
            ease: 'Sine.easeOut',
        })
    }
    return puffs
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
    solve: () => Promise<void>
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

        async solve() {
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

function createRoofCat(scene: Phaser.Scene): ProblemHandle {
    const root = scene.add.container(0, 0).setDepth(DEPTH.problem)

    root.add(makeHouse(scene))
    const smoke = makeSmoke(scene, { x: 776, y: 250 })

    const catHome = 306
    const cat = makeCat(scene, 104)
    cat.setPosition(832, catHome)
    root.add(cat)
    const breathe = FX.breathe(scene, cat, { grow: 1.04, duration: 2200 })

    const { wish, grant } = makeWish(scene)
    wish.setPosition(676, 258)
    root.add(wish)
    const bob = FX.float(scene, wish, { amount: 6, duration: 2400 })

    const box = makeBox(scene, 78)
    const parcel = box.root
    parcel.setPosition(496, 399)
    root.add(parcel)

    const parcelLand = { x: 894, y: 342 }

    return {
        root,
        parcel,
        parcelLand,
        hover: { x: 880, y: 256 },
        anchors: {
            machine: { x: 500, y: crewStageY },
            strip: { x: 500, y: 286 },
            focus: { x: 800, y: 320 },
        },
        shot: { at: { x: 686, y: 344 }, zoom: 1.42 },
        /*
         * Mais aberto que os outros dois de propósito: aqui o quadro precisa
         * caber o drone lá em cima, o gatinho no telhado, o balão do desejo e
         * as plaquinhas — fechar mais deixaria alguma dessas coisas de fora.
         */
        detail: { at: { x: 706, y: 306 }, zoom: 1.5 },

        async solve() {
            breathe.remove()
            await box.open()
            void FX.sparks(scene, parcelLand.x, parcelLand.y, { color: C.ovenLight, count: 14, spread: 110 })

            await FX.to(scene, cat, { x: 866 }, { duration: 420, ease: Ease.smooth })
            await FX.to(scene, cat, { y: catHome - 30 }, { duration: 220, yoyo: true, repeat: 1, ease: Ease.back(2.2) })
            cat.setPosition(866, catHome)

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
            smoke.forEach(puff => {
                scene.tweens.killTweensOf(puff)
                puff.destroy()
            })
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
