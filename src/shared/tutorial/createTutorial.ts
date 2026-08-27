import Phaser from 'phaser'

// Tamanho de PROJETO. O canvas real vem do `scene.scale` la embaixo — o
// tutorial aponta para objetos do JOGO, entao ele tem que morar nas
// coordenadas do jogo, e nao numa tela de 1280x720 imaginaria.
const DESIGN_W = 1280
const DESIGN_H = 720
const SEEN_KEY = '__tutorialsSeen'

function getSeenSet(scene: Phaser.Scene): Set<string> {
    let seen = scene.registry.get(SEEN_KEY) as Set<string> | undefined
    if (!seen) {
        seen = new Set<string>()
        scene.registry.set(SEEN_KEY, seen)
    }
    return seen
}

const MASK_CIRCLE = '__tut_mask_circle'
const MASK_RECT = '__tut_mask_rect'


export type SpotlightShape = 'circle' | 'rect' | 'none'

export interface TutorialPointer {
    fromX: number
    fromY: number
    toX: number
    toY: number
    textureKey?: string
    /**
     * TOQUE, e não trajeto.
     *
     * O ponteiro padrão viaja de `from` para `to` num traço contínuo — que é o
     * desenho universal de ARRASTAR. Num jogo que só aceita toques, isso ensina
     * o gesto errado com muita clareza, e a criança fica tentando arrastar uma
     * peça que não se arrasta.
     *
     * Com `tap`, o ponteiro fica parado em `to` e bate ali, com uma onda saindo
     * do ponto. `from` é ignorado. Use `tap` sempre que o alvo for um só; deixe
     * o trajeto para quando o gesto REALMENTE for levar uma coisa até outra.
     */
    tap?: boolean
}

export interface TutorialStep {
    text: string
    shape?: SpotlightShape
    x?: number
    y?: number
    w?: number
    h?: number
    balloonX?: number
    balloonY?: number
    buttonLabel?: string
    pointer?: TutorialPointer
}

export interface TutorialOptions {
    key: string
    steps: TutorialStep[]
    accent?: number
    once?: boolean
    safeTop?: number
    onFinish: () => void
}
function ensureMasks(scene: Phaser.Scene) {
    if (!scene.textures.exists(MASK_CIRCLE)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0xffffff, 1)
        g.fillCircle(100, 100, 100)
        g.generateTexture(MASK_CIRCLE, 200, 200)
        g.destroy()
    }
    if (!scene.textures.exists(MASK_RECT)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0xffffff, 1)
        g.fillRoundedRect(0, 0, 200, 200, 36)
        g.generateTexture(MASK_RECT, 200, 200)
        g.destroy()
    }
}

export function createTutorial(scene: Phaser.Scene, options: TutorialOptions) {
    // O CANVAS DESTE JOGO (a EF01CO03 roda em 960x540).
    const W = scene.scale.width || DESIGN_W
    const H = scene.scale.height || DESIGN_H
    const once = options.once ?? true
    const seen = getSeenSet(scene)

    if (once && seen.has(options.key)) {
        options.onFinish()
        return
    }
    ensureMasks(scene)

    const accent = options.accent ?? 0x8b5cf6
    const objects: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        objects.push(o)
        return o
    }

    keep(
        scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.001)
            .setDepth(9000)
            .setInteractive()
    )

    const spot = keep(
        scene.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(9001)
    )

    const balloon = keep(scene.add.container(W / 2, 0).setDepth(9010))
    const balloonBg = scene.add.graphics()
    const balloonTxt = scene.add.text(0, 0, '', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '21px',
        color: '#0f172a',
        align: 'center',
        wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonBg, balloonTxt])

    const button = keep(scene.add.container(W / 2, 0).setDepth(9011))
    const buttonBg = scene.add.graphics()
    buttonBg.fillStyle(accent, 1)
    buttonBg.fillRoundedRect(-140, -27, 280, 54, 27)
    buttonBg.fillStyle(0xffffff, 0.18)
    buttonBg.fillRoundedRect(-134, -21, 268, 20, 10)
    const buttonTxt = scene.add.text(0, 0, 'Próximo', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '19px',
        color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonBg, buttonTxt])
    button.setSize(280, 58)
    button.setInteractive({ useHandCursor: true })

    let pointer: Phaser.GameObjects.GameObject | undefined
    /** A ondinha que sai do ponto tocado. Só existe no modo `tap`. */
    let ripple: Phaser.GameObjects.Graphics | undefined

    const clearPointer = () => {
        if (ripple) {
            scene.tweens.killTweensOf(ripple)
            ripple.destroy()
            ripple = undefined
        }
        if (!pointer) return
        scene.tweens.killTweensOf(pointer)
        pointer.destroy()
        pointer = undefined
    }

    const drawSpotlight = (step: TutorialStep) => {
        spot.clear()
        spot.fill(0x0b1220, 0.8)

        if (!step.shape || step.shape === 'none') return

        const w = step.w ?? 260
        const h = step.h ?? 260

        const maskGraphics = scene.add.graphics()
        maskGraphics.fillStyle(0xffffff, 1)

        if (step.shape === 'circle') {
            const radius = Math.min(w, h) / 2
            maskGraphics.fillCircle(w / 2, h / 2, radius)
        } else {
            const radius = Math.min(w, h) * 0.18 // 18% da menor dimensão (como 36 em 200)
            maskGraphics.fillRoundedRect(0, 0, w, h, radius)
        }

        const maskKey = `__tut_mask_${Date.now()}`
        maskGraphics.generateTexture(maskKey, w, h)
        maskGraphics.destroy()

        const cut = scene.make.image({ key: maskKey }, false)
        cut.setDisplaySize(w, h)
        spot.erase(cut, step.x ?? W / 2, step.y ?? H / 2)
        cut.destroy()

        scene.textures.remove(maskKey)
    }

    const placeBalloon = (step: TutorialStep) => {
        balloonTxt.setText(step.text)

        const bw = 580
        const bh = Math.max(84, balloonTxt.height + 46)

        balloonBg.clear()
        balloonBg.fillStyle(0x000000, 0.2)
        balloonBg.fillRoundedRect(-bw / 2 + 5, -bh / 2 + 6, bw, bh, 20)
        balloonBg.fillStyle(0xffffff, 0.98)
        balloonBg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 20)

        let bx = step.balloonX ?? W / 2
        let by = step.balloonY ?? 0
        const safeTop = options.safeTop ?? 0

        if (step.balloonY === undefined) {
            const sy = step.y ?? H / 2
            const sh = step.h ?? 0
            const below = sy + sh / 2 + 40 + bh / 2
            const above = sy - sh / 2 - 40 - bh / 2

            const belowFits = below + bh / 2 + 90 < H
            const aboveFits = above - bh / 2 >= safeTop + 12

            by = belowFits ? below : aboveFits ? above : H - bh / 2 - 110
            by = Phaser.Math.Clamp(by, safeTop + bh / 2 + 16, H - bh / 2 - 110)
        }

        if (step.balloonX === undefined && step.shape && step.shape !== 'none') {
            const sx = step.x ?? W / 2
            const overlapsY = Math.abs(by - (step.y ?? H / 2)) < (step.h ?? 0) / 2 + bh / 2
            if (overlapsY) bx = sx < W / 2 ? W / 2 + 220 : W / 2 - 220
        }

        /*
         * O GRAMPO VALE SEMPRE, inclusive quando o passo dá `balloonX`/`balloonY`.
         *
         * Antes ele morava dentro do `if (step.balloonY === undefined)`, então
         * quem fixava a posição à mão saía sem rede — e o botão "Próximo", que
         * nasce 46px ABAIXO do balão, ia parar fora da tela. O tutorial travava:
         * o passo não avança sem esse toque, e ele não estava clicável em lugar
         * nenhum.
         *
         * Os 110px reservados embaixo são a altura do botão mais o respiro.
         */
        const minY = safeTop + bh / 2 + 16
        const maxY = H - bh / 2 - 110
        by = maxY >= minY ? Phaser.Math.Clamp(by, minY, maxY) : minY
        bx = Phaser.Math.Clamp(bx, bw / 2 + 20, W - bw / 2 - 20)

        balloon.setPosition(bx, by).setAlpha(0)
        button.setPosition(bx, by + bh / 2 + 46).setAlpha(0)

        scene.tweens.add({ targets: [balloon, button], alpha: 1, duration: 200 })
    }

    const buildPointer = (step: TutorialStep) => {
        clearPointer()
        if (!step.pointer) return

        const p = step.pointer

        if (p.textureKey && scene.textures.exists(p.textureKey)) {
            const src = scene.textures.get(p.textureKey).getSourceImage() as {
                width: number
                height: number
            }
            pointer = scene.add.image(p.fromX, p.fromY, p.textureKey)
                .setDisplaySize(58, (src.height / src.width) * 58)
                .setDepth(9005)
        } else {
            const g = scene.add.graphics().setDepth(9005)
            g.fillStyle(0xffffff, 0.32)
            g.fillCircle(0, 0, 24)
            g.lineStyle(4, 0xffffff, 0.95)
            g.strokeCircle(0, 0, 24)
            g.fillStyle(0xffffff, 0.95)
            g.fillCircle(0, 0, 7)
            g.setPosition(p.fromX, p.fromY)
            pointer = g
        }

        if (p.tap) {
            /*
             * ── O TOQUE ──────────────────────────────────────────────────
             *
             * O dedo não sai do lugar: ele afunda um pouco e volta, e do ponto
             * sai um anel que se abre e some. Os dois ciclos duram 1080ms de
             * propósito — em tempos diferentes eles se desencontram e o que era
             * um toque vira dois eventos separados piscando fora de compasso.
             */
            const obj = pointer as Phaser.GameObjects.Image
            obj.setPosition(p.toX, p.toY)
            /*
             * O afundar é RELATIVO à escala que o ponteiro já tem.
             *
             * Com textura, `setDisplaySize` acima já deixou a imagem numa escala
             * qualquer para caber em 58px; tweenar para 0,74 absoluto encolheria
             * o dedo a um ponto. O desenho de emergência nasce em 1, e para ele
             * dá no mesmo.
             */
            const base = obj.scaleX || 1

            ripple = scene.add.graphics().setDepth(9004)
            ripple.lineStyle(4, 0xffffff, 0.95)
            ripple.strokeCircle(0, 0, 26)
            ripple.setPosition(p.toX, p.toY).setAlpha(0)

            scene.tweens.add({
                targets: pointer,
                scale: base * 0.74,
                duration: 180,
                hold: 90,
                yoyo: true,
                ease: 'Sine.easeInOut',
                repeat: -1,
                repeatDelay: 630,
            })
            scene.tweens.add({
                targets: ripple,
                scale: { from: 0.45, to: 1.8 },
                alpha: { from: 0.85, to: 0 },
                duration: 620,
                ease: 'Sine.easeOut',
                repeat: -1,
                repeatDelay: 460,
            })
            return
        }

        scene.tweens.add({
            targets: pointer,
            x: p.toX,
            y: p.toY,
            duration: 1100,
            ease: 'Sine.easeInOut',
            repeat: -1,
            repeatDelay: 550,
            hold: 380,
            onRepeat: () => {
                const obj = pointer as Phaser.GameObjects.Image
                obj.setPosition(p.fromX, p.fromY)
            },
        })
    }

    let index = 0

    const finish = () => {
        scene.tweens.add({
            targets: objects,
            alpha: 0,
            duration: 240,
            onComplete: () => {
                clearPointer()
                objects.forEach(o => o.destroy())
                seen.add(options.key)
                options.onFinish()
            },
        })
    }

    const showStep = (i: number) => {
        const step = options.steps[i]
        const isLast = i === options.steps.length - 1

        drawSpotlight(step)
        placeBalloon(step)
        buildPointer(step)

        buttonTxt.setText(step.buttonLabel ?? (isLast ? 'Vamos começar!' : 'Próximo'))
    }

    button.on('pointerdown', () => {
        scene.tweens.add({ targets: button, scale: 0.95, duration: 70, yoyo: true })
        index++
        if (index >= options.steps.length) finish()
        else showStep(index)
    })

    scene.events.once('shutdown', () => {
        clearPointer()
        objects.forEach(o => o.destroy())
    })

    showStep(0)
}