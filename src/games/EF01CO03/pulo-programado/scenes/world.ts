import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import {
    BG_OFFSET_Y, COURSE, DEPTH, GROUND, H, HOLE_GAP, OBSTACLE_SPEC,
    PALETTE, RABBIT, ROCK, W,
} from '../data/layout'
import { markPositions } from '../data/levels'
import type { ActionKind, ObstacleKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/** Os quadros da folha do coelho, na ordem em que ela foi desenhada. */
const POSE = { walk: 0, jump: 1, duck: 2, bump: 3, cheer: 4, idle: 5 }

/**
 * So o que tem textura. Buraco e pedra sao Graphics, e o marco livre nao tem
 * desenho nenhum — por isso a consulta e por chave, e nunca com um `?? 0` de
 * reserva: era esse padrao que estava desenhando o PNG do buraco POR CIMA do
 * poco desenhado.
 */
const OBSTACLE_FRAME: Record<string, number | undefined> = {
    tronco: 1, galho: 2, tunel: 3,
}

const BASE_Y = GROUND.y - RABBIT.size * RABBIT.footRatio
/** Até onde a terra aparece: dali para baixo quem manda é o painel da paleta. */
const PALETTE_TOP = PALETTE.y

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O PERCURSO
 * ══════════════════════════════════════════════════════════════════════
 *
 * O percurso inteiro cabe numa tela e NÃO rola. É regra, não economia: a
 * criança precisa ver todos os obstáculos ao mesmo tempo para poder planejar.
 * Câmera que segue o personagem esconde o que falta e transforma planejar em
 * adivinhar.
 *
 * O chão é desenhado em Graphics com a mesma grama e a mesma terra do sprite
 * do buraco, e ABRE um vão em cada buraco — é o sprite que fecha o desenho ali.
 */
export function createWorld(scene: Phaser.Scene, marks: ObstacleKind[]) {
    const parts: Phaser.GameObjects.GameObject[] = []
    const xs = markPositions(marks.length, COURSE.firstX, COURSE.lastX)

    // ───────────────────────────────────────────────────────── cenário

    const sky = scene.add.graphics().setDepth(DEPTH.scenery)
    sky.fillStyle(C.grass, 1)
    sky.fillRect(0, 0, W, H)
    parts.push(sky)

    if (scene.textures.exists('bg-campo')) {
        const bg = scene.add.image(W / 2, H / 2 + BG_OFFSET_Y, 'bg-campo').setDepth(DEPTH.scenery)
        bg.setDisplaySize(W, (W * bg.height) / bg.width)
        parts.push(bg)
    }

    // ───────────────────────────────────────────────────────── o chão

    const ground = scene.add.graphics().setDepth(DEPTH.ground)
    const holes = marks
        .map((mark, i) => (mark === 'buraco' ? xs[i] : null))
        .filter((x): x is number => x !== null)

    const segments: Array<[number, number]> = []
    let cursor = -40
    for (const x of holes) {
        segments.push([cursor, x - HOLE_GAP / 2])
        cursor = x + HOLE_GAP / 2
    }
    segments.push([cursor, W + 40])

    /*
     * ─────────────────────────────────────────────────────────────────
     *  O CHÃO E O POÇO, DESENHADOS JUNTOS
     * ─────────────────────────────────────────────────────────────────
     *
     * O buraco é um pedaço do chão que falta, não um objeto em cima dele.
     * Por isso ele nasce do MESMO traçado: a mesma terra, a mesma grama, e um
     * contorno só que desce por uma parede, contorna o fundo e sobe pela
     * outra. Um PNG ali dentro mostrava a emenda entre duas terras.
     */
    const PIT_DEPTH = 118
    const PIT_ROUND = 32
    const LINE = 7
    const DIRT_TOP = GROUND.y + GROUND.grass
    const PIT_FLOOR = GROUND.y + PIT_DEPTH
    const PEBBLE = 0xd08a52

    /** Duas paredes retas e um fundo em tigela. */
    function pitPath(x: number) {
        const left = x - HOLE_GAP / 2
        const right = x + HOLE_GAP / 2
        const lip = PIT_FLOOR - PIT_ROUND
        const pts: Array<[number, number]> = [[left, GROUND.y], [left, lip]]
        for (let s = 1; s < 14; s++) {
            const t = s / 14
            pts.push([left + (right - left) * t, lip + Math.sin(Math.PI * t) * PIT_ROUND])
        }
        pts.push([right, lip], [right, GROUND.y])
        return pts
    }

    const inHole = (x: number) => holes.some(h => Math.abs(x - h) < HOLE_GAP / 2 + 18)

    /*
     * A TERRA VAI ATÉ O FIM DA TELA, e o painel da paleta é que a cobre. Antes
     * ela parava exatamente onde o painel começa: bastava um pixel de folga
     * para aparecer uma faixa de céu entre o chão e a interface, e o mundo
     * ficava boiando.
     */
    ground.fillStyle(C.dirtDark, 1)
    ground.fillRect(-40, PIT_FLOOR, W + 80, H - PIT_FLOOR + 10)

    for (const [from, to] of segments) {
        if (to <= from) continue
        ground.fillStyle(C.dirtDark, 1)
        ground.fillRect(from, DIRT_TOP, to - from, PIT_FLOOR - DIRT_TOP)
        ground.fillStyle(C.dirt, 1)
        ground.fillRect(from, DIRT_TOP, to - from, 56)
    }

    /*
     * Pedrinhas. Elas são VARIAÇÃO DA TERRA, não objeto em cima dela: sem
     * contorno, sem sombra e só com tons da própria paleta do chão. Com borda
     * escura elas viravam pedras de verdade e roubavam o olho dos obstáculos,
     * que são a única coisa ali que a criança precisa ler.
     *
     * São achatadas de propósito — mancha no barro é elipse, não bolinha.
     *
     * E só existem na faixa que aparece (entre a grama e o painel): desenhar
     * no que está tapado é peso sem retorno.
     */
    for (let i = 0; i < 64; i++) {
        const x = -20 + Math.random() * (W + 40)
        if (inHole(x)) continue
        const y = DIRT_TOP + 10 + Math.random() * (PALETTE_TOP - DIRT_TOP - 16)
        const r = 3 + Math.random() * 6
        const light = Math.random() < 0.55
        ground.fillStyle(light ? PEBBLE : C.dirtDark, light ? 0.85 : 0.7)
        ground.fillEllipse(x, y, r * 2.2, r * 1.5)
    }

    // o poço, escavado por cima da terra já pintada
    for (const x of holes) {
        const path = pitPath(x)
        ground.fillStyle(0x6b3a1c, 1)
        ground.fillPoints(path.map(([px, py]) => ({ x: px, y: py })), true)
        ground.fillStyle(0x552c13, 1)
        ground.fillEllipse(x, PIT_FLOOR - 32, HOLE_GAP - 46, 46)
        ground.fillStyle(C.outline, 0.4)
        ground.fillRect(x - HOLE_GAP / 2, GROUND.y, HOLE_GAP, 18)
    }

    // a grama, e os tufinhos que caem dela para dentro da terra
    for (const [from, to] of segments) {
        if (to <= from) continue
        ground.fillStyle(C.grassDark, 1)
        ground.fillRect(from, GROUND.y, to - from, GROUND.grass)
        ground.fillStyle(C.grass, 1)
        ground.fillRect(from, GROUND.y, to - from, GROUND.grass - 7)
        ground.fillStyle(C.grassLight, 1)
        ground.fillRect(from, GROUND.y, to - from, 8)

        for (let x = from + 26; x < to - 20; x += 46 + Math.random() * 34) {
            const drop = 8 + Math.random() * 12
            ground.fillStyle(C.grassDark, 1)
            ground.fillTriangle(
                x - 9, DIRT_TOP - 2,
                x + 9, DIRT_TOP - 2,
                x, DIRT_TOP + drop,
            )
        }
    }

    // o contorno vem por último, por cima de tudo, como no traço da arte
    ground.lineStyle(LINE, C.outline, 1)
    for (const [from, to] of segments) {
        if (to <= from) continue
        ground.lineBetween(from, GROUND.y, to, GROUND.y)
    }
    for (const x of holes) {
        const path = pitPath(x)
        ground.beginPath()
        ground.moveTo(path[0][0], path[0][1])
        path.slice(1).forEach(([px, py]) => ground.lineTo(px, py))
        ground.strokePath()
    }
    parts.push(ground)

    // ───────────────────────────────────────────────── marcos e obstáculos

    const markG = scene.add.graphics().setDepth(DEPTH.mark)
    parts.push(markG)

    function paintMarks(active: number) {
        markG.clear()
        xs.forEach((x, i) => {
            const on = i === active
            const y = GROUND.y + 8
            markG.fillStyle(C.ink, on ? 0.3 : 0.16)
            markG.fillEllipse(x, y + 3, on ? 86 : 70, on ? 26 : 20)
            markG.fillStyle(on ? C.warn : C.cream, on ? 0.95 : 0.5)
            markG.fillEllipse(x, y, on ? 80 : 64, on ? 22 : 16)
        })
    }
    paintMarks(-1)

    /** A pedra: um pedregulho na grama, com a mesma tinta do contorno. */
    function paintRock(x: number) {
        const g = scene.add.graphics().setDepth(DEPTH.obstacleFront)
        const top = GROUND.y - ROCK.h
        const half = ROCK.w / 2

        g.fillStyle(C.ink, 0.18)
        g.fillEllipse(x + 6, GROUND.y - 4, ROCK.w * 1.06, 22)

        g.fillStyle(C.outline, 1)
        g.fillRoundedRect(x - half - 5, top - 5, ROCK.w + 10, ROCK.h + 8, { tl: 44, tr: 38, bl: 14, br: 14 })
        g.fillStyle(C.stoneDark, 1)
        g.fillRoundedRect(x - half, top, ROCK.w, ROCK.h + 2, { tl: 40, tr: 34, bl: 10, br: 10 })
        g.fillStyle(C.stone, 1)
        g.fillRoundedRect(x - half, top, ROCK.w, ROCK.h - 12, { tl: 40, tr: 34, bl: 10, br: 10 })
        g.fillStyle(C.white, 0.32)
        g.fillEllipse(x - ROCK.w * 0.2, top + ROCK.h * 0.28, ROCK.w * 0.42, ROCK.h * 0.26)

        // um pedregulho pequeno ao lado, para a pedra grande ter escala
        g.fillStyle(C.outline, 1)
        g.fillRoundedRect(x + half - 6, GROUND.y - 34, 44, 34, { tl: 16, tr: 14, bl: 6, br: 6 })
        g.fillStyle(C.stone, 1)
        g.fillRoundedRect(x + half - 2, GROUND.y - 30, 36, 30, { tl: 14, tr: 12, bl: 5, br: 5 })

        parts.push(g)
    }

    marks.forEach((mark, i) => {
        if (mark === 'livre' || mark === 'buraco') return

        const x = xs[i]

        if (mark === 'pedra') {
            paintRock(x)
            return
        }

        const spec = OBSTACLE_SPEC[mark]
        const frame = OBSTACLE_FRAME[mark]

        if (frame === undefined || !scene.textures.exists('obstaculos')) {
            const g = scene.add.graphics().setDepth(DEPTH.obstacleFront)
            g.fillStyle(C.dirtDark, 1)
            g.fillRoundedRect(x - 60, spec.cy - 46, 120, 92, 18)
            parts.push(g)
            return
        }

        if (mark === 'galho') {
            /*
             * SÓ GALHOS. Antes um tronco em Graphics segurava o galho lá em
             * cima; agora são dois galhos do mesmo desenho, inclinados, o de
             * trás entrando pela borda — o conjunto lê como ramagem descendo
             * de uma árvore fora da tela, e o de baixo fica na altura da
             * cabeça do coelho.
             */
            const back = scene.add
                .sprite(x + 104, spec.cy - 92, 'obstaculos', frame)
                .setDepth(DEPTH.obstacleBack)
            back.setDisplaySize(spec.size * 0.72, spec.size * 0.72)
            back.setAngle(-38).setAlpha(0.92)
            parts.push(back)
        }

        const sprite = scene.add
            .sprite(x, spec.cy, 'obstaculos', frame)
            .setDepth(DEPTH.obstacleFront)
        sprite.setDisplaySize(spec.size, spec.size)
        if (mark === 'galho') sprite.setAngle(-12)
        parts.push(sprite)
    })

    // ───────────────────────────────────────────────────────── o coelho

    const rabbit = scene.add.sprite(RABBIT.startX, BASE_Y, 'coelho', POSE.idle)
        .setDepth(DEPTH.rabbit)
    if (scene.textures.exists('coelho')) rabbit.setDisplaySize(RABBIT.size, RABBIT.size)
    else rabbit.setVisible(false)
    parts.push(rabbit)

    const shadow = scene.add.graphics().setDepth(DEPTH.rabbit - 1)
    parts.push(shadow)

    function drawShadow() {
        const lift = Math.max(0, BASE_Y - rabbit.y)
        const shrink = 1 - Math.min(0.55, lift / 260)
        shadow.clear()
        shadow.fillStyle(C.ink, 0.2 * shrink)
        shadow.fillEllipse(rabbit.x, GROUND.y + 10, 92 * shrink, 22 * shrink)
    }
    drawShadow()

    let bob: Phaser.Tweens.Tween | null = null

    function startBob() {
        stopBob()
        bob = scene.tweens.add({
            targets: rabbit,
            y: BASE_Y - 9,
            duration: 210,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }
    function stopBob() {
        bob?.remove()
        bob = null
    }

    const speed = 0.42

    return {
        markX: (i: number) => xs[i],

        update() {
            drawShadow()
        },

        highlight(i: number) {
            paintMarks(i)
        },

        reset() {
            stopBob()
            FX.kill(scene, fx(rabbit))
            rabbit.setPosition(RABBIT.startX, BASE_Y).setFrame(POSE.idle).setAngle(0)
            paintMarks(-1)
            drawShadow()
        },

        async walkTo(x: number) {
            const distance = Math.abs(x - rabbit.x)
            if (distance < 2) return
            rabbit.setFrame(POSE.walk)
            startBob()
            await FX.to(scene, fx(rabbit), { x }, { duration: distance / speed })
            stopBob()
            rabbit.setY(BASE_Y)
        },

        /** A ação acontece ATRAVESSANDO o marco, não parado em cima dele. */
        async act(kind: ActionKind, i: number) {
            const from = rabbit.x
            const to = xs[i] + 128
            const duration = Math.abs(to - from) / speed

            if (kind === 'pular') {
                rabbit.setFrame(POSE.jump)
                void FX.to(scene, fx(rabbit), { x: to }, { duration })
                await FX.seq(
                    () => FX.to(scene, fx(rabbit), { y: BASE_Y - RABBIT.jumpH },
                        { duration: duration * 0.45, ease: 'Quad.easeOut' }),
                    () => FX.to(scene, fx(rabbit), { y: BASE_Y },
                        { duration: duration * 0.55, ease: 'Quad.easeIn' }),
                )
            } else if (kind === 'abaixar') {
                // a pose de abaixar já ocupa só a metade de baixo do quadro:
                // o desenho abaixa o coelho, o código não precisa mexer no y
                rabbit.setFrame(POSE.duck)
                await FX.to(scene, fx(rabbit), { x: to }, { duration })
            } else {
                rabbit.setFrame(POSE.walk)
                startBob()
                await FX.to(scene, fx(rabbit), { x: to }, { duration })
                stopBob()
                rabbit.setY(BASE_Y)
            }

            rabbit.setFrame(POSE.idle)
        },

        /** Esbarrão cômico: sem queda, sem dano, sem vida perdida. */
        async bump() {
            stopBob()
            rabbit.setFrame(POSE.bump)
            await FX.all(
                FX.to(scene, fx(rabbit), { x: rabbit.x - 46 },
                    { duration: 220, ease: Ease.back(2) }),
                FX.shake(scene, fx(rabbit), { amount: 9, times: 3 }),
            )
            void FX.sparks(scene, rabbit.x + 40, rabbit.y - 40,
                { color: C.warn, count: 10, spread: 130, duration: 520 })
        },

        /**
         * A comemoração. O brilho é uma CÓPIA do próprio coelho, branca e
         * crescendo por trás dele — a silhueta dele mesmo virando luz. Um
         * círculo genérico daria destaque a um lugar; isto dá destaque a ELE.
         */
        async cheer() {
            stopBob()
            rabbit.setFrame(POSE.cheer)

            const rays = scene.add.graphics()
                .setDepth(DEPTH.rabbit - 1)
                .setPosition(rabbit.x, rabbit.y - 10)
                .setScale(0.2)
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2
                rays.fillStyle(C.warn, i % 2 ? 0.5 : 0.75)
                rays.fillTriangle(
                    Math.cos(a) * 46, Math.sin(a) * 46,
                    Math.cos(a + 0.14) * 176, Math.sin(a + 0.14) * 176,
                    Math.cos(a - 0.14) * 176, Math.sin(a - 0.14) * 176,
                )
            }
            parts.push(rays)

            const halos = [0, 1].map(i => {
                const halo = scene.add
                    .sprite(rabbit.x, rabbit.y, 'coelho', POSE.cheer)
                    .setDepth(DEPTH.rabbit - 1 + i)
                halo.setDisplaySize(RABBIT.size, RABBIT.size)
                halo.setTintFill(i ? C.warn : C.white)
                halo.setAlpha(0.85)
                parts.push(halo)
                return halo
            })

            void FX.to(scene, fx(rays), { scale: 1.25, alpha: 0 },
                { duration: 1000, ease: 'Quad.easeOut' })
            halos.forEach((halo, i) => {
                void FX.to(scene, fx(halo),
                    { scaleX: halo.scaleX * (1.9 + i * 0.6), scaleY: halo.scaleY * (1.9 + i * 0.6), alpha: 0 },
                    { duration: 760 + i * 240, ease: 'Quad.easeOut' })
            })
            void FX.sparks(scene, rabbit.x, rabbit.y - 20,
                { color: C.warn, count: 26, spread: 240, duration: 780 })

            await FX.seq(
                () => FX.to(scene, fx(rabbit), { y: BASE_Y - 64 },
                    { duration: 200, ease: 'Quad.easeOut' }),
                () => FX.to(scene, fx(rabbit), { y: BASE_Y },
                    { duration: 260, ease: Ease.back(3) }),
                () => FX.wait(scene, 420),
            )

            rays.destroy()
            halos.forEach(halo => halo.destroy())
        },

        at: () => ({ x: rabbit.x, y: rabbit.y }),

        destroy() {
            stopBob()
            FX.kill(scene, fx(rabbit))
            parts.forEach(p => p.destroy())
            shadow.destroy()
        },
    }
}
