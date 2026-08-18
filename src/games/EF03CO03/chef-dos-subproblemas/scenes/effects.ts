import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, hex } from '../data/theme'
import { W, H, CHEF, DIALOG } from '../data/layout'

/* ────────────────────────────────────────────────── desenho de superfícies */

export type PlateState = 'normal' | 'hover' | 'complete' | 'warning'

const PLATE_FILL: Record<PlateState, number> = {
    normal: C.cream,
    hover: C.goldSoft,
    complete: C.greenSoft,
    warning: C.redSoft,
}

const PLATE_STROKE: Record<PlateState, number> = {
    normal: C.lavender,
    hover: C.gold,
    complete: C.green,
    warning: C.red,
}

/** Prato de louça visto de cima: sombra, borda dupla e brilho elíptico. */
export function paintPlate(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    state: PlateState,
) {
    const fill = PLATE_FILL[state]
    const stroke = PLATE_STROKE[state]
    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, r)

    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)

    // aba interna do prato
    g.lineStyle(3, stroke, 0.35)
    g.strokeRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, r - 10)

    g.lineStyle(state === 'hover' ? 7 : 5, stroke, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

    g.fillStyle(C.white, state === 'hover' ? 0.4 : 0.22)
    g.fillEllipse(0, -h * 0.22, w * 0.62, h * 0.2)
}

/** Cartão de ícone arrastável. */
export function paintCard(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    { placed = false, lifted = false } = {},
) {
    g.clear()
    g.fillStyle(C.shadow, lifted ? 0.3 : 0.18)
    g.fillRoundedRect(-w / 2 + (lifted ? 8 : 4), -h / 2 + (lifted ? 14 : 7), w, h, r)

    g.fillStyle(placed ? C.goldSoft : C.cream, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)

    // faixa de brilho no topo, dá volume sem textura
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, 16, 8)

    g.lineStyle(4, placed ? C.green : C.goldDark, placed ? 0.9 : 0.7)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

/** Painel da bancada, com nichos para pedido, pratos e prateleira. */
export function paintBoard(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.26)
    g.fillRoundedRect(x + 8, y + 12, w, h, r)

    g.fillStyle(C.ink, 0.55)
    g.fillRoundedRect(x, y, w, h, r)

    // faixa de título
    g.fillStyle(C.cream, 0.1)
    g.fillRoundedRect(x + 16, y + 14, w - 32, 56, 20)

    // nicho da prateleira (começa abaixo dos pratos, em y+380)
    g.fillStyle(C.ink, 0.34)
    g.fillRoundedRect(x + 18, y + 386, w - 36, h - 404, 24)

    g.lineStyle(3, C.gold, 0.45)
    g.strokeRoundedRect(x, y, w, h, r)
    g.lineStyle(2, C.gold, 0.22)
    g.lineBetween(x + 30, y + 376, x + w - 30, y + 376)
}

/** Ampulheta grande girando — marca a subreceita que espera. */
export function waitBadge(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size = 46,
): Phaser.GameObjects.Container {
    const badge = scene.add.container(x, y)
    const disc = scene.add.graphics()
    disc.fillStyle(C.shadow, 0.22)
    disc.fillCircle(2, 3, size / 2 + 4)
    disc.fillStyle(C.gold, 1)
    disc.fillCircle(0, 0, size / 2 + 4)
    disc.lineStyle(3, C.white, 0.9)
    disc.strokeCircle(0, 0, size / 2 + 4)
    badge.add(disc)

    if (scene.textures.exists('icon-ampulheta')) {
        const img = scene.add.image(0, 0, 'icon-ampulheta')
        img.setScale(Math.min(size / img.width, size / img.height))
        badge.add(img)
        scene.tweens.add({
            targets: img,
            angle: 180,
            duration: 2400,
            repeat: -1,
            ease: 'Cubic.easeInOut',
            repeatDelay: 900,
        })
    }
    return badge
}

/* ─────────────────────────────────────────────────────── fala da chef */

export interface ChefDialog {
    /**
     * Fala longa. Escurece a cena, aproxima a cozinheira e avança linha a
     * linha no "Próximo". Resolve quando a criança termina de ler tudo.
     */
    speak: (lines: string[]) => Promise<void>
    /** Comentário curto durante o jogo: balão de canto, não bloqueia. */
    react: (line: string) => void
    isBusy: () => boolean
    destroy: () => void
}

/**
 * A cozinheira tem dois registros:
 *
 * - `speak` é aula. A bancada escurece, ela cresce, o balão vira painel no
 *   meio da tela e o texto sai devagar. Só sai dali no botão.
 * - `react` é reação. Balão pequeno no canto dela, rápido, sem travar o jogo.
 *
 * Antes existia um só, rápido, e cada frase nova cancelava a anterior — a
 * criança via o texto piscar e sumir antes de conseguir ler.
 */
export function createChefDialog(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    chef: Phaser.GameObjects.Image,
    baseDepth: number,
): ChefDialog {
    // ── véu que escurece tudo que não é a cozinheira ──────────────────────
    const veil = scene.add.graphics()
    veil.fillStyle(C.ink, 0.74)
    veil.fillRect(0, 0, W, H)
    veil.setAlpha(0).setVisible(false)

    // ── halo quente atrás dela, para destacá-la do fundo escuro ───────────
    const glow = scene.add.graphics()
    for (let i = 6; i >= 1; i -= 1) {
        glow.fillStyle(C.gold, 0.05)
        glow.fillCircle(CHEF.cx, CHEF.y - 20, 90 + i * 26)
    }
    glow.setAlpha(0)

    const bubble = scene.add.container(CHEF.cx, CHEF.bubbleY)
    const bg = scene.add.graphics()
    const label = scene.add.text(0, 0, '', {
        fontFamily: FONT.body,
        fontStyle: 'bold',
        fontSize: SIZE.bubble,
        color: hex(C.ink),
        align: 'center',
        wordWrap: { width: CHEF.bubbleW - 46 },
        lineSpacing: 6,
    }).setOrigin(0.5).setResolution(2)
    bubble.add([bg, label])

    // ── botão "Próximo", só existe no modo foco ───────────────────────────
    const next = scene.add.container(DIALOG.x, 0).setVisible(false)
    const nextBg = scene.add.graphics()
    const nextTxt = scene.add.text(0, -1, 'Próximo', {
        fontFamily: FONT.black, fontSize: '23px', color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2)
    const paintNext = () => {
        const { btnW: bw, btnH: bh } = DIALOG
        nextBg.clear()
        nextBg.fillStyle(C.shadow, 0.3)
        nextBg.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 8, bw, bh, bh / 2)
        nextBg.fillStyle(C.gold, 1)
        nextBg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
        nextBg.fillStyle(C.white, 0.3)
        nextBg.fillRoundedRect(-bw / 2 + 14, -bh / 2 + 9, bw - 28, 16, 8)
        nextBg.lineStyle(4, C.goldDark, 0.9)
        nextBg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
    }
    paintNext()
    next.add([nextBg, nextTxt])

    const nextHit = scene.add.zone(DIALOG.x, 0, DIALOG.btnW + 26, DIALOG.btnH + 22)
        .setOrigin(0.5)
        .setVisible(false)

    // Ordem dentro da camada: véu e halo atrás da cozinheira; balão e botão
    // na frente. `chef` já está no índice 0 quando chegamos aqui.
    layer.addAt(veil, 0)
    layer.addAt(glow, 1)
    layer.add([bubble, next, nextHit])

    let typing: { skip: () => void } | null = null
    let busy = false
    const chefScale = chef.scale

    /* ── pintura do balão nos dois modos ──────────────────────────────── */

    const paintQuick = () => {
        const bw = CHEF.bubbleW
        const bh = Phaser.Math.Clamp(label.height + 46, CHEF.bubbleMinH, CHEF.bubbleMaxH)
        bg.clear()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-bw / 2 + 5, -bh / 2 + 8, bw, bh, 24)
        bg.fillStyle(C.cream, 0.99)
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        bg.fillStyle(C.gold, 0.18)
        bg.fillRoundedRect(-bw / 2 + 14, -bh / 2 + 12, bw - 28, 16, 8)
        bg.lineStyle(4, C.gold, 0.85)
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        // rabicho para baixo, apontando a cozinheira
        bg.fillStyle(C.cream, 0.99)
        bg.fillTriangle(-18, bh / 2 - 6, 22, bh / 2 - 6, 0, bh / 2 + 26)
        bg.lineStyle(4, C.gold, 0.85)
        bg.lineBetween(-18, bh / 2 - 4, 0, bh / 2 + 26)
        bg.lineBetween(22, bh / 2 - 4, 0, bh / 2 + 26)
        return bh
    }

    const paintFocus = () => {
        const bw = DIALOG.w
        const bh = Phaser.Math.Clamp(label.height + 74, DIALOG.minH, DIALOG.maxH)
        bg.clear()
        bg.fillStyle(C.shadow, 0.36)
        bg.fillRoundedRect(-bw / 2 + 7, -bh / 2 + 12, bw, bh, DIALOG.r)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, DIALOG.r)
        bg.fillStyle(C.gold, 0.2)
        bg.fillRoundedRect(-bw / 2 + 18, -bh / 2 + 14, bw - 36, 20, 10)
        bg.lineStyle(6, C.gold, 0.95)
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, DIALOG.r)
        // rabicho para a direita, apontando a cozinheira
        bg.fillStyle(C.cream, 1)
        bg.fillTriangle(bw / 2 - 6, -26, bw / 2 - 6, 22, bw / 2 + 40, -2)
        bg.lineStyle(6, C.gold, 0.95)
        bg.lineBetween(bw / 2 - 4, -26, bw / 2 + 40, -2)
        bg.lineBetween(bw / 2 - 4, 22, bw / 2 + 40, -2)
        return bh
    }

    /** Mede com o texto completo para o balão não crescer letra a letra. */
    const layoutFor = (text: string, focus: boolean) => {
        // setFontSize/setWordWrapWidth em vez de setStyle: `setStyle` troca o
        // objeto de estilo inteiro e apagaria fonte, cor e lineSpacing.
        label.setFontSize(focus ? SIZE.dialog : SIZE.bubble)
        label.setWordWrapWidth(focus ? DIALOG.wrap : CHEF.bubbleW - 46)
        label.setText(text)
        bubble.setPosition(focus ? DIALOG.x : CHEF.cx, focus ? DIALOG.y : CHEF.bubbleY)
        const bh = focus ? paintFocus() : paintQuick()
        label.setText('')
        return bh
    }

    /* ── entrada e saída do modo foco ─────────────────────────────────── */

    const enterFocus = () => {
        layer.setDepth(300)
        veil.setVisible(true)
        veil.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains)
        return FX.all(
            FX.to(scene, veil, { alpha: 1 }, { duration: 260 }),
            FX.to(scene, glow, { alpha: 1 }, { duration: 300 }),
            // só a escala muda: o balanço idle continua rodando no y
            FX.to(scene, chef, { scale: chefScale * DIALOG.chefGrow }, { duration: 340, ease: Ease.back(1.2) }),
        )
    }

    const exitFocus = async () => {
        next.setVisible(false)
        nextHit.setVisible(false).disableInteractive()
        await FX.all(
            FX.to(scene, veil, { alpha: 0 }, { duration: 240 }),
            FX.to(scene, glow, { alpha: 0 }, { duration: 240 }),
            FX.to(scene, chef, { scale: chefScale }, { duration: 280 }),
            // O painel some junto: senão ele ficava parado no meio da bancada
            // com a última frase depois de a aula acabar.
            FX.to(scene, bubble, { alpha: 0 }, { duration: 200 }),
        )
        bg.clear()
        label.setText('')
        bubble.setAlpha(1).setScale(1)
        veil.setVisible(false).disableInteractive()
        layer.setDepth(baseDepth)
    }

    /** Espera o toque no "Próximo". O primeiro toque completa a frase. */
    const waitForNext = (tw: { skip: () => void }, done: () => boolean, isLast: boolean, bh: number) =>
        new Promise<void>(resolve => {
            nextTxt.setText(isLast ? 'Vamos lá!' : 'Próximo')
            const by = DIALOG.y + bh / 2 + DIALOG.btnGap
            next.setPosition(DIALOG.x, by).setVisible(true).setAlpha(0).setScale(0.9)
            nextHit.setPosition(DIALOG.x, by).setVisible(true)
            nextHit.setInteractive({ useHandCursor: true })
            FX.to(scene, next, { alpha: 1, scale: 1 }, { duration: 220, ease: Ease.back(2) })

            const onTap = () => {
                // ainda escrevendo? o primeiro toque só completa a frase
                if (!done()) { tw.skip(); return }
                nextHit.off('pointerup', onTap)
                FX.press(scene, next, 0.94)
                resolve()
            }
            nextHit.on('pointerup', onTap)
        })

    /* ── API ──────────────────────────────────────────────────────────── */

    const speak = async (lines: string[]) => {
        const list = lines.filter(l => !!l && l.trim().length > 0)
        if (!list.length) return

        busy = true
        typing?.skip()
        await enterFocus()

        for (let i = 0; i < list.length; i += 1) {
            const bh = layoutFor(list[i], true)
            FX.kill(scene, bubble)
            bubble.setScale(0.96)
            FX.to(scene, bubble, { scale: 1 }, { duration: 200, ease: Ease.back(1.8) })

            const full = list[i]
            const tw = FX.type(scene, label, full, { delay: TYPE_MS.dialog })
            typing = tw

            // Checagem síncrona pelo próprio texto: usar uma flag setada no
            // `.then` falharia se a criança tocasse duas vezes no mesmo frame,
            // porque o callback do Promise só roda no microtask seguinte.
            await waitForNext(tw, () => label.text.length >= full.length, i === list.length - 1, bh)
            next.setVisible(false)
            nextHit.setVisible(false).disableInteractive()
        }

        typing = null
        await exitFocus()
        busy = false
    }

    const react = (line: string) => {
        // Não atropela uma aula em andamento.
        if (busy || !line) return
        typing?.skip()
        layoutFor(line, false)
        FX.kill(scene, bubble)
        bubble.setScale(0.94).setAlpha(0.92)
        FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 200, ease: Ease.back(1.8) })
        typing = FX.type(scene, label, line, { delay: TYPE_MS.aside })
    }

    return {
        speak,
        react,
        isBusy: () => busy,
        destroy: () => {
            typing?.skip()
            veil.destroy()
            glow.destroy()
            bubble.destroy()
            next.destroy()
            nextHit.destroy()
        },
    }
}

/* ──────────────────────────────────────────────────────── botão grande */

export interface BigButton {
    container: Phaser.GameObjects.Container
    setEnabled: (on: boolean) => void
    isEnabled: () => boolean
    setLabel: (text: string) => void
    destroy: () => void
}

export function createBigButton(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
): BigButton {
    const container = scene.add.container(x, y).setDepth(56)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -1, label, {
        fontFamily: FONT.black,
        fontSize: SIZE.button,
        color: hex(C.ink),
        align: 'center',
    }).setOrigin(0.5).setResolution(2)

    let enabled = false
    let pulse: Phaser.Tweens.Tween | undefined

    const paint = () => {
        bg.clear()
        bg.fillStyle(C.shadow, 0.26)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, h / 2)
        bg.fillStyle(enabled ? C.gold : 0x8d867a, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.3 : 0.12)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 10, w - 28, 18, 9)
        bg.lineStyle(4, enabled ? C.goldDark : 0x6f6a61, 0.9)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    container.add([bg, text])
    layer.add(container)
    paint()
    container.setAlpha(0.5)

    /*
     * O input mora numa Zone separada, NÃO no container.
     *
     * O container respira (breathe), cresce no hover e afunda no clique. Se a
     * área de toque fosse ele, a borda mudava de tamanho no meio do gesto: bastava
     * o cursor estar perto da margem para o `pointerup` cair fora do objeto e o
     * clique sumir. A Zone fica parada, um pouco maior que o desenho, e cobre
     * também a sombra — que é desenhada 5px à direita e 9px abaixo e parecia
     * clicável sem ser.
     */
    const hit = scene.add.zone(x, y, w + 26, h + 22).setOrigin(0.5)
    hit.setInteractive({ useHandCursor: true })
    layer.add(hit)

    const setCursor = (on: boolean) => {
        if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
    }
    setCursor(false)

    hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.05 }, { duration: 120 }) })
    hit.on('pointerout', () => { if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 }) })
    hit.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, container, 0.94)
    })
    hit.on('pointerup', () => {
        if (!enabled) return
        onClick()
    })

    const setEnabled = (on: boolean) => {
        const changed = on !== enabled
        // O estado é aplicado SEMPRE, mesmo sem mudança: se o visual e a
        // flag saírem de sincronia uma única vez, o botão fica morto para
        // sempre — foi o que acontecia ao trocar de fase.
        enabled = on
        paint()
        container.setAlpha(on ? 1 : 0.5)
        setCursor(on)
        if (!changed) return

        pulse?.remove()
        pulse = undefined
        FX.kill(scene, container)
        container.setScale(1)
        if (on) {
            // o botão só respira quando de fato dá para tocar nele
            FX.to(scene, container, { scale: 1.08 }, { duration: 180, yoyo: true, ease: Ease.back(2) })
            pulse = FX.breathe(scene, container, { grow: 1.035, duration: 1100 })
        }
    }

    return {
        container,
        setEnabled,
        isEnabled: () => enabled,
        setLabel: (t: string) => text.setText(t),
        destroy: () => {
            pulse?.remove()
            hit.destroy()
            container.destroy()
        },
    }
}

/** Botão redondo do HUD (ajuda). */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    r: number,
    label: string,
    onClick: () => void,
) {
    const btn = scene.add.container(x, y)
    const bg = scene.add.graphics()
    bg.fillStyle(C.cream, 0.14)
    bg.fillCircle(0, 0, r)
    bg.lineStyle(3, C.gold, 0.9)
    bg.strokeCircle(0, 0, r)
    const txt = scene.add.text(0, -1, label, {
        fontFamily: FONT.black,
        fontSize: '26px',
        color: hex(C.cream),
    }).setOrigin(0.5).setResolution(2)

    btn.add([bg, txt])
    btn.setSize(r * 2, r * 2)
    btn.setInteractive(new Phaser.Geom.Circle(0, 0, r + 6), Phaser.Geom.Circle.Contains)
    if (btn.input) btn.input.cursor = 'pointer'
    btn.on('pointerover', () => FX.to(scene, btn, { scale: 1.12 }, { duration: 120 }))
    btn.on('pointerout', () => FX.to(scene, btn, { scale: 1 }, { duration: 120 }))
    btn.on('pointerup', () => { FX.press(scene, btn); onClick() })
    return btn
}

/* ─────────────────────────────────────────────────────────── movimento */

/**
 * Cartão voa em arco até o prato, encolhendo no caminho.
 *
 * O scale é tweenado em paralelo (não setado no fim) — era isso que fazia o
 * cartão "pular" de tamanho ao aterrissar. O `arcTo` só mexe em posição, então
 * os dois tweens convivem no mesmo objeto sem brigar.
 */
export function flyToPlate(
    scene: Phaser.Scene,
    node: Phaser.GameObjects.Container,
    to: { x: number; y: number },
    endScale: number,
    duration = 320,
) {
    FX.to(scene, node, { scale: endScale, angle: 0 }, { duration, ease: Ease.smooth })
    return FX.arcTo(scene, node, to, { height: 74, duration })
}

/** Prato aceita a ficha: pulso + halo. */
export function plateAccept(scene: Phaser.Scene, box: Phaser.GameObjects.Container, x: number, y: number) {
    FX.impact(scene, box, 0.12)
    FX.ping(scene, x, y, C.gold, { radius: 76, duration: 460 })
}

/**
 * Prato fecha. Só brilho e um pulso — o selo de check saiu: a borda verde
 * do próprio prato já diz "completo", e o carimbo tapava as fichas.
 */
export function plateComplete(
    scene: Phaser.Scene,
    box: Phaser.GameObjects.Container,
    w: number,
    h: number,
) {
    FX.shine(scene, box, { w, h, duration: 620, radius: 28 })
    return FX.to(scene, box, { scale: 1.05 }, { duration: 170, yoyo: true, ease: Ease.back(1.6) })
}

/** Cascata de entrada da prateleira. */
export function dealIn(scene: Phaser.Scene, cards: Phaser.GameObjects.Container[]) {
    return FX.stagger(scene, cards, (card) => FX.popIn(scene, card, { from: 0.7, duration: 340 }), 60)
}

/* ──────────────────────────────────────────────────────────── toast */

export function showToast(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    message: string,
    tone: number,
    life = 1900,
) {
    const box = scene.add.container(W / 2, H + 60).setDepth(200)
    const bg = scene.add.graphics()
    const w = 720
    const h = 74
    bg.fillStyle(C.shadow, 0.28)
    bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22)
    bg.fillStyle(tone, 0.98)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    bg.fillStyle(C.white, 0.2)
    bg.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 16, 8)
    bg.lineStyle(4, C.white, 0.85)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)

    const text = scene.add.text(0, 0, message, {
        fontFamily: FONT.black,
        fontSize: '21px',
        color: hex(C.cream),
        align: 'center',
        wordWrap: { width: w - 60 },
    }).setOrigin(0.5).setResolution(2)

    box.add([bg, text])
    layer.add(box)

    FX.seq(
        () => FX.to(scene, box, { y: 640 }, { duration: 320, ease: Ease.back(1.6) }),
        () => FX.wait(scene, life),
        () => FX.to(scene, box, { y: H + 60, alpha: 0 }, { duration: 280 }),
    ).then(() => box.destroy())

    return box
}

/* ────────────────────────────────────────────── comparação de planos N3 */

/**
 * Mostra duas barras: plano lento (partes em fila) x plano do jogador
 * (parte que espera cede espaço para outra). Sem números pequenos —
 * a diferença é o comprimento da barra.
 */
export async function comparePlans(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    slowUnits: number,
    fastUnits: number,
) {
    const panel = scene.add.container(W / 2, 362).setDepth(120)
    const pw = 760
    const ph = 250
    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.3)
    bg.fillRoundedRect(-pw / 2 + 6, -ph / 2 + 10, pw, ph, 28)
    bg.fillStyle(C.cream, 0.99)
    bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 28)
    bg.lineStyle(5, C.gold, 0.9)
    bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 28)
    panel.add(bg)

    panel.add(scene.add.text(0, -ph / 2 + 34, 'Seu plano ficou mais rápido', {
        fontFamily: FONT.black, fontSize: '24px', color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2))

    const unit = 46
    const rows: Array<[string, number, number]> = [
        ['Um de cada vez', slowUnits, C.lavender],
        ['Usando a espera', fastUnits, C.green],
    ]

    rows.forEach(([label, units, tone], i) => {
        const y = -12 + i * 78
        panel.add(scene.add.text(-pw / 2 + 34, y, label, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: '19px', color: hex(C.inkMid),
        }).setOrigin(0, 0.5).setResolution(2))

        const barBg = scene.add.graphics()
        barBg.fillStyle(C.creamEdge, 1)
        barBg.fillRoundedRect(-pw / 2 + 240, y - 22, slowUnits * unit, 44, 22)
        panel.add(barBg)

        const bar = scene.add.graphics()
        bar.fillStyle(tone, 1)
        bar.fillRoundedRect(0, 0, units * unit, 44, 22)
        bar.fillStyle(C.white, 0.24)
        bar.fillRoundedRect(8, 6, Math.max(10, units * unit - 16), 12, 6)
        bar.setPosition(-pw / 2 + 240, y - 22)
        bar.setScale(0, 1)
        panel.add(bar)

        FX.to(scene, bar, { scaleX: 1 }, { duration: 620, delay: 320 + i * 380, ease: Ease.smooth })
    })

    layer.add(panel)
    panel.setScale(0.86).setAlpha(0)
    await FX.to(scene, panel, { scale: 1, alpha: 1 }, { duration: 320, ease: Ease.back(1.8) })
    await FX.wait(scene, 2100)
    await FX.to(scene, panel, { alpha: 0, scale: 0.94 }, { duration: 260 })
    panel.destroy()
}
