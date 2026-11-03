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

/*
 * TUDO AQUI E FIXO NA TELA (`setScrollFactor(0)`).
 *
 * O tutorial e uma camada de INTERFACE: as coordenadas dos passos sao as da
 * tela, nao as do mundo. Sem isso, num jogo com camera rolada a vinheta, o
 * balao e o recorte saem deslocados pelo `scrollX` — a vinheta deixa uma
 * faixa clara na borda e o recorte ilumina o lugar errado. Nos jogos de tela
 * parada o `scrollX` e zero e nada muda.
 */
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
    /**
     * Corpo do texto do balão. O padrão 21 é o histórico dos 49 jogos — e é
     * pequeno: numa grade de 1280 ele dá ~6px reais num celular de 390. Jogo
     * novo passa 32–38 aqui. Fica como opção, e não como troca do padrão, para
     * não mexer no balão dos 48 outros sem os ver acontecendo.
     */
    textSize?: number
    /** Largura do balão. Cresce junto com `textSize`. */
    balloonWidth?: number
    /** Mostra o botão "Pular". Padrão: sim. */
    skippable?: boolean
    /**
     * O jogo chama `tutorialDone` ao devolver o controle à criança. Com isso o
     * pulo não acaba por silêncio — só pelo jogo, pelo último balão ou pelo teto.
     */
    explicitEnd?: boolean
    onFinish: () => void
}

/*
 * ── PULAR É AVANÇAR RÁPIDO, NÃO CORTAR ─────────────────────────────────────
 *
 * Quase todo jogo intercala balões e uma demonstração que mexe no jogo de
 * verdade (a peça vai para o lugar e fica lá). Fechar só o balão deixaria a
 * demonstração rodando e o próximo balão chegando. Então o "Pular":
 *
 *  - fecha o balão da vez e qualquer outro que esta cena pedir em seguida;
 *  - roda a cena acelerada, muda e atrás de um véu, até a demonstração
 *    terminar sozinha — o jogo para onde pararia sem o pulo.
 *
 * ACELERAR = o passo inteiro da cena (`sys.step`) 20 vezes por quadro. Assim
 * anda junto tudo o que a cena move: relógio, sprites, física, o `update()`
 * e quem escuta `events.on('update')`. Multiplicar o `delta` não servia:
 * quase todo jogo corta o `delta` em 50 ms, e o carro seguia devagar. Só os
 * tweens ficam de fora — eles medem o tempo pelo relógio da parede — e por
 * isso andam pelo `tweens.timeScale`.
 *
 * O FIM vem do rótulo do último botão de cada chamada: "Ver", "Próximo" e
 * "Ok" querem dizer que ainda vem mais coisa; qualquer outro ("Vamos!",
 * "Continuar", o padrão "Vamos começar!") é o último balão. Se o jogo não
 * chamar mais nenhum, um silêncio encerra; e o jogo pode encerrar à mão com
 * `tutorialDone(scene)` — no ponto em que devolve o controle à criança.
 *
 * Depois do "Pular", todo balão com a MESMA chave daquele tutorial também é
 * pulado, até a cena acabar — inclusive os que vêm depois de um toque guiado.
 * Esse só fecha, sem acelerar nada: ele pode chegar no meio da jogada.
 * A ajuda do "?" usa outra chave (`-help`) e continua abrindo.
 *
 * Há jogos que fecham uma chamada com "Vamos lá!" e emendam outra. Por isso,
 * logo depois de um pulo (GRACE_MS), um balão novo também é pulado: a
 * criança acabou de dizer que não quer o tutorial, e o jogo ainda nem andou.
 *
 * O silêncio e o teto se medem em tempo de JOGO, não pelo relógio da parede:
 * num aparelho lento o quadro demora e a cena anda menos por segundo. Como os
 * passos (`delta`) e os tweens (parede) podem andar em ritmos diferentes sob
 * carga, conta o mais lento dos dois — assim o silêncio nunca corta uma
 * animação que ainda não terminou.
 */
const FAST = 20
const QUIET_MS = 40000
const MAX_MS = 240000
const HARD_MS = 30000
const GRACE_MS = 2500
const MORE_LABELS = new Set(['ver', 'proximo', 'ok'])

interface Skip {
    tweensScale: number
    muted: boolean
    step: Phaser.Scenes.Systems['step']
    cover: Phaser.GameObjects.GameObject[]
    explicit: boolean
    quiet: number
    total: number
    started: number
}

const skipping = new WeakMap<Phaser.Scene, Skip>()
const recent = new WeakMap<Phaser.Scene, number>()
const skippedKeys = new WeakMap<Phaser.Scene, Set<string>>()

function markSkipped(scene: Phaser.Scene, key: string) {
    let keys = skippedKeys.get(scene)
    if (!keys) {
        keys = new Set()
        skippedKeys.set(scene, keys)
        scene.events.once('shutdown', () => skippedKeys.delete(scene))
    }
    keys.add(key)
}

function markRecent(scene: Phaser.Scene) {
    if (!recent.has(scene)) scene.events.once('shutdown', () => recent.delete(scene))
    recent.set(scene, performance.now())
}

function endsTutorial(steps: TutorialStep[]): boolean {
    const label = steps[steps.length - 1]?.buttonLabel
    if (!label) return true
    const plain = label.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase()
    return !MORE_LABELS.has(plain)
}

function startSkip(scene: Phaser.Scene, explicit = false) {
    if (skipping.has(scene)) return
    const W = scene.scale.width || DESIGN_W
    const H = scene.scale.height || DESIGN_H

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, 0x0b1220, 0.86)
        .setDepth(9500).setScrollFactor(0).setInteractive()
    const label = scene.add.text(W / 2, H / 2, 'Pulando…', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
    }).setOrigin(0.5).setDepth(9501).setScrollFactor(0).setResolution(2)

    let wall = performance.now()
    const watch = (delta: number) => {
        const s = skipping.get(scene)
        if (!s) return
        const now = performance.now()
        const advanced = Math.min(delta * FAST, (now - wall) * FAST)
        wall = now
        s.quiet += advanced
        s.total += advanced
        if (s.total > MAX_MS || now - s.started > HARD_MS) tutorialDone(scene, 'max')
        else if (!s.explicit && s.quiet > QUIET_MS) tutorialDone(scene, 'quiet')
    }

    const step = scene.sys.step
    skipping.set(scene, {
        tweensScale: scene.tweens.timeScale,
        muted: scene.sound.mute,
        step,
        cover: [veil, label],
        explicit,
        quiet: 0,
        total: 0,
        started: performance.now(),
    })
    scene.tweens.timeScale = FAST
    scene.sound.mute = true
    scene.sys.step = (time: number, delta: number) => {
        step.call(scene.sys, time, delta)
        for (let i = 1; i < FAST && skipping.has(scene); i++) step.call(scene.sys, time, delta)
        watch(delta)
    }
    scene.events.once('shutdown', () => tutorialDone(scene, 'shutdown'))
}

/**
 * O jogo devolveu o controle à criança: encerra o avanço rápido do "Pular"
 * (se houver) e a carência depois dele. Fora de um pulo, não faz nada.
 */
export function tutorialDone(scene: Phaser.Scene, reason = 'game') {
    if (reason === 'game') recent.delete(scene)
    const s = skipping.get(scene)
    if (!s) return
    skipping.delete(scene)
    scene.registry.set('__tutorialSkipEnd', reason)
    if (reason !== 'shutdown' && reason !== 'game') markRecent(scene)
    scene.tweens.timeScale = s.tweensScale
    scene.sound.mute = s.muted
    scene.sys.step = s.step
    s.cover.forEach(o => o.destroy())
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

    const skip = skipping.get(scene)
    if (skip) {
        skip.quiet = 0
        seen.add(options.key)
        if (endsTutorial(options.steps)) tutorialDone(scene, 'label')
        options.onFinish()
        return
    }

    const since = recent.get(scene)
    const graced = since !== undefined && performance.now() - since < GRACE_MS
    if (graced || skippedKeys.get(scene)?.has(options.key)) {
        seen.add(options.key)
        if (graced && endsTutorial(options.steps)) markRecent(scene)
        else if (graced) startSkip(scene, options.explicitEnd)
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
            .setScrollFactor(0)
            .setInteractive()
    )

    const spot = keep(
        scene.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(9001).setScrollFactor(0)
    )

    const textSize = options.textSize ?? 21
    const bw = options.balloonWidth ?? (textSize > 21 ? Math.min(920, 580 + (textSize - 21) * 12) : 580)
    const btnW = Math.max(280, Math.round(textSize * 9))
    const btnH = Math.max(54, Math.round(textSize * 1.9))

    const balloon = keep(scene.add.container(W / 2, 0).setDepth(9010).setScrollFactor(0))
    const balloonBg = scene.add.graphics()
    const balloonTxt = scene.add.text(0, 0, '', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: `${textSize}px`,
        color: '#0f172a',
        align: 'center',
        wordWrap: { width: bw - 60 },
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonBg, balloonTxt])

    const button = keep(scene.add.container(W / 2, 0).setDepth(9011).setScrollFactor(0))
    const buttonBg = scene.add.graphics()
    buttonBg.fillStyle(accent, 1)
    buttonBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, btnH / 2)
    buttonBg.fillStyle(0xffffff, 0.18)
    buttonBg.fillRoundedRect(-btnW / 2 + 6, -btnH / 2 + 6, btnW - 12, Math.round(btnH * 0.36), 10)
    const buttonTxt = scene.add.text(0, 0, 'Próximo', {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: `${Math.round(textSize * 0.86)}px`,
        color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonBg, buttonTxt])
    button.setSize(btnW, btnH + 4)
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
                .setScrollFactor(0)
        } else {
            const g = scene.add.graphics().setDepth(9005).setScrollFactor(0)
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

            ripple = scene.add.graphics().setDepth(9004).setScrollFactor(0)
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
    let done = false

    if (options.skippable ?? true) {
        const skipBtn = keep(scene.add.container(W - 104, H - 46).setDepth(9012).setScrollFactor(0))
        const skipBg = scene.add.graphics()
        skipBg.fillStyle(0xffffff, 0.9)
        skipBg.fillRoundedRect(-82, -24, 164, 48, 24)
        const skipTxt = scene.add.text(-16, 0, 'Pular', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '24px',
            color: '#0f172a',
        }).setOrigin(0.5).setResolution(2)
        const chevrons = scene.add.graphics()
        chevrons.fillStyle(0x0f172a, 1)
        chevrons.fillTriangle(34, -10, 34, 10, 46, 0)
        chevrons.fillTriangle(46, -10, 46, 10, 58, 0)
        skipBtn.add([skipBg, skipTxt, chevrons])
        skipBtn.setSize(180, 60)
        skipBtn.setInteractive({ useHandCursor: true })
        skipBtn.on('pointerdown', () => {
            if (done) return
            done = true
            clearPointer()
            objects.forEach(o => o.destroy())
            seen.add(options.key)
            markSkipped(scene, options.key)
            if (endsTutorial(options.steps)) {
                scene.registry.set('__tutorialSkipEnd', 'direct')
                markRecent(scene)
            } else startSkip(scene, options.explicitEnd)
            options.onFinish()
        })
    }

    const finish = () => {
        if (done) return
        done = true
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
        if (done) return
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