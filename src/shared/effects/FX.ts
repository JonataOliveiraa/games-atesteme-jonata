import Phaser from 'phaser'

const W = 1280
const H = 720

const FX_SETTINGS = '__fxSettings'
const TEX_DOT = '__fx_dot'
const TEX_STAR = '__fx_star'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A ANIMAÇÃO QUE ACONTECIA EM 3 MILÉSIMOS EM ALGUNS PCs
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── O QUE ACONTECIA ──────────────────────────────────────────────────────
 *
 * `getTimeScale` lia `prefers-reduced-motion: reduce` e, se estivesse ligado,
 * devolvia **zero**. Zero é multiplicador: `duration * 0` é `0`. Então TODA
 * animação do kit — estrelinhas do Tribunal, o "Testar plano" do Chef, o
 * `popText`, o `flash`, a máquina de escrever — terminava no primeiro frame. E
 * `FX.wait` devolvia `Promise.resolve()` na hora, o que derrubava junto a PAUSA
 * de leitura: o `await FX.wait(this, 2600)` que existe para a criança ler a
 * frase de acerto passava a durar um microtask.
 *
 * O jogo não parecia travado porque `float`/`breathe`/`wiggle` (laços infinitos)
 * nunca foram escalados — o cenário continuava respirando enquanto só o
 * FEEDBACK sumia. Foi por isso que o bug parecia aleatório.
 *
 * ── POR QUE SÓ EM ALGUNS PCs ─────────────────────────────────────────────
 *
 * `prefers-reduced-motion: reduce` não é um ajuste do jogo nem do navegador: é
 * uma configuração do SISTEMA. No Windows ele liga sozinho em situações muito
 * comuns no público desta plataforma:
 *
 *   · Configurações → Acessibilidade → Efeitos visuais → **Efeitos de animação**
 *     desligado (é o padrão em muita máquina de escola e de laboratório)
 *   · "Ajustar para melhor desempenho" nas Opções de Desempenho do Windows
 *   · sessões de Área de Trabalho Remota e várias máquinas virtuais
 *   · políticas de economia de energia em notebooks corporativos
 *
 * Ou seja: a maioria das crianças que caíam nisso NUNCA pediu menos movimento.
 * Elas só estavam num PC configurado para desempenho.
 *
 * ── A REGRA NOVA ─────────────────────────────────────────────────────────
 *
 * **`prefers-reduced-motion` não mexe mais em DURAÇÃO NENHUMA.** A duração de
 * cada animação é idêntica em todo computador — é isso que faz o bug ser
 * impossível de voltar.
 *
 * E isso também é o certo do ponto de vista de acessibilidade: a preferência é
 * por menos MOVIMENTO, não por menos tempo. Encurtar a duração deixa a mesma
 * coisa atravessar a tela mais rápido, que é exatamente o oposto do pedido.
 * Quem sofre com movimento não quer que a estrela voe em 100ms em vez de 700 —
 * quer menos estrelas voando. Então o que a preferência faz agora é reduzir
 * QUANTIDADE e AMPLITUDE: menos partículas, tremida menor, sem zoom de câmera.
 *
 * `setTimeScale` continua existindo para um futuro botão "pular animações" — e
 * ali `0` continua valendo corte seco, porque aí é uma escolha explícita de
 * quem está jogando, e não um palpite do sistema operacional.
 */

/**
 * O PISO de qualquer animação escalada.
 *
 * Rede de segurança: mesmo que alguém volte a mexer na escala de tempo, uma
 * animação nunca fica curta a ponto de sumir. Uma tremida de 55ms continua com
 * 55ms (o piso é o menor entre a duração original e este valor); uma explosão
 * de 700ms nunca cai abaixo de 150ms.
 */
const MIN_MS = 150

const sceneTimers = new WeakMap<Phaser.Scene, Set<Phaser.Time.TimerEvent>>()
const sceneCleanup = new WeakMap<Phaser.Scene, Set<() => void>>()

// ───────────────────────────────────────────────────────────── tipos

export type FxTarget = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform &
    Phaser.GameObjects.Components.AlphaSingle &
    Phaser.GameObjects.Components.Depth

export type FxTintable = FxTarget & Partial<Phaser.GameObjects.Components.Tint>

export interface TweenOpts {
    duration?: number
    delay?: number
    ease?: string | ((t: number) => number)
    yoyo?: boolean
    repeat?: number
}

export interface Typewriter extends PromiseLike<void> {
    /** Completa o texto imediatamente. Ligue no toque da tela. */
    skip(): void
}

// ───────────────────────────────────────────────────────────── easings

export const Ease = {
    /** Smootherstep: aceleração sem "quina". Melhor que Cubic em percursos longos. */
    smooth: (t: number) => t * t * t * (t * (t * 6 - 15) + 10),

    /** Oscilação amortecida — passa do alvo e assenta. Dá peso físico. */
    settle: (t: number) =>
        t === 0 || t === 1 ? t : 1 - Math.pow(2, -9 * t) * Math.cos(t * 14),

    /** Back.easeOut com overshoot ajustável (o do Phaser é fixo em 1.70158). */
    back: (overshoot = 1.7) => (t: number) => {
        const u = t - 1
        return u * u * ((overshoot + 1) * u + overshoot) + 1
    },

    /** Recua antes de ir. Dá intenção a saídas e ataques. */
    anticipate: (pull = 1.9) => (t: number) => t * t * ((pull + 1) * t - pull),

    /** Mola: mais quiques = mais brincalhão; mais damping = para antes. */
    spring: (bounces = 3, damping = 8) => (t: number) =>
        t === 0 || t === 1
            ? t
            : 1 - Math.pow(2, -damping * t) * Math.cos(t * bounces * Math.PI * 2),

    /** Stop-motion. Robôs, engrenagens, máquinas. */
    steps: (count: number) => (t: number) => Math.floor(t * count) / (count - 1),
}

// ───────────────────────────────────────────────────────────── internos

function track(scene: Phaser.Scene) {
    if (sceneTimers.has(scene)) return

    const timers = new Set<Phaser.Time.TimerEvent>()
    const hooks = new Set<() => void>()
    sceneTimers.set(scene, timers)
    sceneCleanup.set(scene, hooks)

    scene.events.once('shutdown', () => {
        timers.forEach(t => t.remove())
        timers.clear()
        hooks.forEach(fn => fn())
        hooks.clear()
        sceneTimers.delete(scene)
        sceneCleanup.delete(scene)
    })
}

function addTimer(scene: Phaser.Scene, timer: Phaser.Time.TimerEvent) {
    track(scene)
    sceneTimers.get(scene)!.add(timer)
    return timer
}

/** Registra um desfazer que roda no shutdown da cena (listeners globais). */
function addCleanup(scene: Phaser.Scene, fn: () => void) {
    track(scene)
    sceneCleanup.get(scene)!.add(fn)
    return () => {
        sceneCleanup.get(scene).delete(fn)
        fn()
    }
}

function ensureTextures(scene: Phaser.Scene) {
    if (!scene.textures.exists(TEX_DOT)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0xffffff, 1)
        g.fillCircle(16, 16, 16)
        g.generateTexture(TEX_DOT, 32, 32)
        g.destroy()
    }
    if (!scene.textures.exists(TEX_STAR)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0xffffff, 1)
        const pts: Phaser.Geom.Point[] = []
        for (let k = 0; k < 10; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            const r = k % 2 === 0 ? 16 : 7
            pts.push(new Phaser.Geom.Point(16 + Math.cos(a) * r, 16 + Math.sin(a) * r))
        }
        g.fillPoints(pts, true)
        g.generateTexture(TEX_STAR, 32, 32)
        g.destroy()
    }
}

function alive(t: unknown): t is FxTarget {
    const o = t as Phaser.GameObjects.GameObject | undefined
    return !!o && o.active !== false && !!o.scene
}

// ═════════════════════════════════════════════════════════════════════
// FX
// ═════════════════════════════════════════════════════════════════════

export class FX {

    // ───────────────────────────────────────────────── núcleo

    /**
     * Escala global de tempo. 1 = normal, 0.25 = 4x mais rápido, 0 = corte seco.
     *
     * **Só chame isto a partir de uma ESCOLHA da pessoa** (um botão "pular
     * animações"). Nada automático pode mexer aqui — foi um palpite automático
     * (`prefers-reduced-motion` virando `0`) que fez o feedback dos jogos sumir
     * em máquina configurada para desempenho. Ver o bloco no topo do arquivo.
     */
    static setTimeScale(scene: Phaser.Scene, value: number) {
        scene.registry.set(FX_SETTINGS, { timeScale: Math.max(0, value) })
    }

    /**
     * A escala de tempo em vigor. **Sempre 1**, a não ser que alguém tenha
     * chamado `setTimeScale` de propósito.
     */
    static getTimeScale(scene: Phaser.Scene): number {
        const s = scene.registry.get(FX_SETTINGS) as { timeScale: number } | undefined
        return s ? s.timeScale : 1
    }

    /**
     * O sistema pediu menos movimento?
     *
     * Note o que esta função NÃO faz: ela não encurta nada. Quem a consulta são
     * os efeitos que jogam coisa pela tela, e o que eles cortam é QUANTIDADE e
     * AMPLITUDE — menos partículas, tremida menor, sem zoom de câmera.
     *
     * O `try` não é decoração: `matchMedia` não existe em ambiente sem DOM
     * (teste, render de servidor) e alguns navegadores antigos jogam exceção com
     * uma media query que não conhecem. Uma preferência de conforto não pode
     * derrubar o jogo.
     */
    static reducedMotion(scene?: Phaser.Scene): boolean {
        void scene
        try {
            return typeof window !== 'undefined'
                && typeof window.matchMedia === 'function'
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches === true
        } catch {
            return false
        }
    }

    /**
     * Aplica a escala de tempo a uma duração, COM PISO.
     *
     * Toda duração do kit passa por aqui. `0` só sai daqui quando alguém pediu
     * corte seco de propósito (`setTimeScale(0)`) ou quando a duração já era
     * zero — nunca por acidente de multiplicação.
     */
    static ms(scene: Phaser.Scene, duration: number): number {
        const ts = FX.getTimeScale(scene)
        if (ts <= 0 || duration <= 0) return 0
        if (ts >= 1) return duration
        return Math.max(Math.min(duration, MIN_MS), duration * ts)
    }

    /**
     * O que o kit está fazendo nesta máquina, para conferir no console:
     * `FX.debug(scene)` — ou, sem cena à mão, direto no console do jogo:
     * `matchMedia('(prefers-reduced-motion: reduce)').matches`.
     */
    static debug(scene: Phaser.Scene) {
        return {
            timeScale: FX.getTimeScale(scene),
            reducedMotion: FX.reducedMotion(),
            exemploDuracao700: FX.ms(scene, 700),
        }
    }

    /** Tween que devolve Promise. Base de tudo abaixo. */
    static to(
        scene: Phaser.Scene,
        target: FxTarget | FxTarget[],
        props: Record<string, unknown>,
        o: TweenOpts = {},
    ): Promise<void> {
        const list = (Array.isArray(target) ? target : [target]).filter(alive)
        if (!list.length) return Promise.resolve()

        list.forEach(t => FX.own(scene, t))

        return new Promise(resolve => {
            scene.tweens.add({
                targets: list,
                ...props,
                duration: FX.ms(scene, o.duration ?? 300),
                delay: FX.ms(scene, o.delay ?? 0),
                ease: o.ease ?? Ease.smooth,
                yoyo: o.yoyo,
                repeat: o.repeat,
                onComplete: () => resolve(),
            })
        })
    }

    /** Roda em sequência. Substitui pirâmide de onComplete. */
    static async seq(...steps: Array<() => unknown | Promise<unknown>>) {
        for (const step of steps) await step()
    }

    /** Roda junto e espera todos. */
    static all(...jobs: Array<Promise<unknown>>): Promise<void> {
        return Promise.all(jobs).then(() => undefined)
    }

    /**
     * A pausa.
     *
     * Esta é a função que mais doeu no bug: metade dos `FX.wait` do projeto não
     * é animação, é TEMPO DE LEITURA — `await FX.wait(this, 2600)` existe para a
     * criança ler a frase de acerto antes de a tela seguir. Com a escala em
     * zero ela virava um microtask, e a frase era substituída antes de aparecer.
     */
    static wait(scene: Phaser.Scene, ms: number): Promise<void> {
        const espera = FX.ms(scene, ms)
        if (espera <= 0) return Promise.resolve()
        return new Promise(resolve => {
            const t = addTimer(scene, scene.time.delayedCall(espera, () => {
                sceneTimers.get(scene).delete(t)
                resolve()
            }))
        })
    }

    /** Aplica `fn` a cada alvo com atraso crescente. Espera o último terminar. */
    static stagger<T extends FxTarget>(
        scene: Phaser.Scene,
        targets: T[],
        fn: (t: T, i: number) => Promise<void>,
        gap = 70,
    ): Promise<void> {
        return Promise.all(
            targets.map((t, i) => FX.wait(scene, gap * i).then(() => fn(t, i))),
        ).then(() => undefined)
    }

    /** Amarra os tweens ao objeto — morrem juntos. Evita tween em objeto destruído. */
    static own<T extends FxTarget>(scene: Phaser.Scene, target: T): T {
        if (target.getData('__fxOwned')) return target
        target.setData('__fxOwned', true)
        target.once('destroy', () => scene.tweens.killTweensOf(target))
        return target
    }

    static kill(scene: Phaser.Scene, target: FxTarget | FxTarget[]) {
        (Array.isArray(target) ? target : [target]).forEach(t => scene.tweens.killTweensOf(t))
    }

    // ───────────────────────────────────────────────── entradas

    /** Surge crescendo. `from` < 1 nasce pequeno; > 1 nasce grande. */
    static popIn(scene: Phaser.Scene, t: FxTarget, { from = 0.82, delay = 0, duration = 380 } = {}) {
        if (!alive(t)) return Promise.resolve()
        const base = t.scale
        t.setAlpha(0)
        t.setScale(base * from)
        return FX.to(scene, t, { alpha: 1, scale: base }, { duration, delay, ease: Ease.back(1.9) })
    }

    /** Entra deslizando. Informe só o eixo que importa. */
    static slideIn(scene: Phaser.Scene, t: FxTarget, { dx = 0, dy = 40, delay = 0, duration = 420 } = {}) {
        if (!alive(t)) return Promise.resolve()
        const x = t.x, y = t.y
        t.setAlpha(0)
        t.setPosition(x - dx, y - dy)
        return FX.to(scene, t, { alpha: 1, x, y }, { duration, delay, ease: Ease.back(1.4) })
    }

    /** Cai de cima e assenta com quique. */
    static dropIn(scene: Phaser.Scene, t: FxTarget, { height = 160, delay = 0, duration = 620 } = {}) {
        if (!alive(t)) return Promise.resolve()
        const y = t.y
        t.setAlpha(0)
        t.setPosition(t.x, y - height)
        return FX.to(scene, t, { alpha: 1, y }, { duration, delay, ease: 'Bounce.easeOut' })
    }

    static fadeIn(scene: Phaser.Scene, t: FxTarget, duration = 300, delay = 0) {
        if (!alive(t)) return Promise.resolve()
        t.setAlpha(0)
        return FX.to(scene, t, { alpha: 1 }, { duration, delay })
    }

    /** Some e (por padrão) destrói. Evita o vazamento de objeto invisível vivo. */
    static async fadeOut(
        scene: Phaser.Scene,
        t: FxTarget,
        { duration = 260, destroy = true, drift = 0 } = {},
    ) {
        if (!alive(t)) return
        await FX.to(scene, t, { alpha: 0, y: t.y + drift }, { duration, ease: Ease.anticipate(1.2) })
        if (destroy) t.destroy()
    }

    /** Encolhe girando e some. Saída com energia. */
    static async burstOut(scene: Phaser.Scene, t: FxTarget, { destroy = true, duration = 320 } = {}) {
        if (!alive(t)) return
        await FX.to(scene, t, { scale: 0, angle: t.angle + 180, alpha: 0 }, { duration, ease: Ease.anticipate(2) })
        if (destroy) t.destroy()
    }

    // ───────────────────────────────────────────────── feedback

    /** Afunda no toque. Chame dentro do pointerdown. */
    static press(scene: Phaser.Scene, t: FxTarget, depth = 0.92) {
        if (!alive(t)) return Promise.resolve()
        return FX.to(scene, t, { scale: t.scale * depth }, { duration: 80, yoyo: true, ease: 'Sine.easeOut' })
    }

    /** Instala hover. Devolve função para desinstalar. Limpo no shutdown. */
    static hover(scene: Phaser.Scene, t: FxTarget, grow = 1.07) {
        const base = t.scale
        const over = () => FX.to(scene, t, { scale: base * grow }, { duration: 130 })
        const out = () => FX.to(scene, t, { scale: base }, { duration: 130 })
        t.on('pointerover', over)
        t.on('pointerout', out)
        return addCleanup(scene, () => { t.off('pointerover', over); t.off('pointerout', out) })
    }

    /** Tremida de erro. Volta exatamente à posição original. */
    static async shake(
        scene: Phaser.Scene,
        t: FxTarget,
        { amount = 10, times = 3, axis = 'x' as 'x' | 'y' } = {},
    ) {
        if (!alive(t)) return
        const bx = t.x, by = t.y
        const base = axis === 'x' ? bx : by
        // tremida menor quando o sistema pede menos movimento; mesmo número de
        // idas e vindas, para o "não" continuar legível
        const amp = FX.reducedMotion() ? amount * 0.45 : amount
        await FX.to(scene, t, { [axis]: base + amp }, { duration: 55, yoyo: true, repeat: times })
        if (alive(t)) t.setPosition(bx, by)
    }

    /** Erro completo: pisca vermelho, treme e volta. */
    static async nope(
        scene: Phaser.Scene,
        t: FxTarget & { setTint?: (c: number) => void; clearTint?: () => void },
    ) {
        t.setTint(0xff8a8a)
        await FX.shake(scene, t)
        t.clearTint()
    }

    /** Impacto elástico — o objeto "recebe" algo. Squash & stretch. */
    static async impact(scene: Phaser.Scene, t: FxTarget, force = 0.14) {
        if (!alive(t)) return
        const sx = t.scaleX, sy = t.scaleY
        await FX.to(scene, t, { scaleX: sx * (1 + force), scaleY: sy * (1 - force) }, { duration: 90 })
        await FX.to(scene, t, { scaleX: sx, scaleY: sy }, { duration: 440, ease: Ease.spring(2, 7) })
    }

    /** Respiração infinita. Devolve o tween para você parar depois. */
    static breathe(scene: Phaser.Scene, t: FxTarget, { grow = 1.05, duration = 900 } = {}) {
        FX.own(scene, t)
        return scene.tweens.add({
            targets: t, scale: t.scale * grow,
            duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    /** Flutuação infinita — vida em objetos parados. Use `delay` diferente por item. */
    static float(scene: Phaser.Scene, t: FxTarget, { amount = 8, duration = 1600, delay = 0 } = {}) {
        FX.own(scene, t)
        return scene.tweens.add({
            targets: t, y: t.y - amount,
            duration, delay, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    /** Balança de leve, infinito. Bom para item "pegável". */
    static wiggle(scene: Phaser.Scene, t: FxTarget, { deg = 3, duration = 1200 } = {}) {
        FX.own(scene, t)
        t.setAngle(-deg)
        return scene.tweens.add({
            targets: t, angle: deg,
            duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    /** Chama atenção: cresce, brilha e volta. Use quando o jogador trava. */
    static async highlight(scene: Phaser.Scene, t: FxTarget, color = 0xffd166) {
        if (!alive(t)) return
        await FX.all(
            FX.ping(scene, t.x, t.y, color, { radius: 70 }),
            FX.impact(scene, t, 0.18),
        )
    }

    // ───────────────────────────────────────────────── movimento

    /** Voa em arco. Muito mais vivo que linha reta — use em toda carta que viaja. */
    static arcTo(
        scene: Phaser.Scene,
        t: FxTarget,
        to: { x: number; y: number },
        { height = 90, duration = 560, ease = Ease.smooth } = {},
    ): Promise<void> {
        if (!alive(t)) return Promise.resolve()
        FX.own(scene, t)
        const from = { x: t.x, y: t.y }
        const s = { v: 0 }
        // o arco é o movimento mais longo do kit (uma carta atravessando a
        // mesa): com menos movimento pedido, ele achata em direção à linha reta
        if (FX.reducedMotion()) height = height * 0.35

        return new Promise(resolve => {
            scene.tweens.add({
                targets: s, v: 1,
                duration: FX.ms(scene, duration),
                ease,
                onUpdate: () => {
                    if (!alive(t)) return
                    const lift = Math.sin(s.v * Math.PI) * height
                    t.setPosition(
                        Phaser.Math.Linear(from.x, to.x, s.v),
                        Phaser.Math.Linear(from.y, to.y, s.v) - lift,
                    )
                },
                onComplete: () => resolve(),
            })
        })
    }

    /** Voa reto encolhendo um pouco no meio — "sugado" para o destino. */
    static async flyTo(
        scene: Phaser.Scene,
        t: FxTarget,
        to: { x: number; y: number },
        { duration = 480, endScale = 0.75 } = {},
    ) {
        if (!alive(t)) return
        await FX.to(scene, t, { scale: t.scale * 1.1 }, { duration: 110, ease: Ease.back(2) })
        await FX.to(scene, t, { x: to.x, y: to.y, scale: t.scale * endScale }, { duration, ease: Ease.smooth })
    }

    /** Gira em torno de um ponto. Bom para satélites, ícones de carregamento. */
    static orbit(
        scene: Phaser.Scene,
        t: FxTarget,
        center: { x: number; y: number },
        { radius = 60, duration = 3000, clockwise = true } = {},
    ) {
        FX.own(scene, t)
        const s = { a: 0 }
        return scene.tweens.add({
            targets: s, a: clockwise ? Math.PI * 2 : -Math.PI * 2,
            duration, repeat: -1, ease: 'Linear',
            onUpdate: () => {
                if (!alive(t)) return
                t.setPosition(center.x + Math.cos(s.a) * radius, center.y + Math.sin(s.a) * radius)
            },
        })
    }

    // ───────────────────────────────────────────────── pseudo-3D

    /** Vira como carta. `onHalf` troca o conteúdo no ponto cego.
     *  Não é 3D real — o ganho de scaleY no meio é o que vende a rotação. */
    static async flip(scene: Phaser.Scene, t: FxTarget, onHalf?: () => void, duration = 420) {
        if (!alive(t)) return
        const sx = t.scaleX, sy = t.scaleY
        await FX.to(scene, t, { scaleX: 0, scaleY: sy * 1.08 }, { duration: duration / 2, ease: 'Sine.easeIn' })
        onHalf()
        await FX.to(scene, t, { scaleX: sx, scaleY: sy }, { duration: duration / 2, ease: Ease.back(1.4) })
    }

    /** Inclina seguindo o ponteiro. `shadow` desloca ao contrário, criando profundidade.
     *  Devolve `{ reset, stop }`. O listener some no shutdown. */
    static tilt(
        scene: Phaser.Scene,
        t: FxTarget,
        { maxDeg = 6, lift = 1.03, range = 240, shadow }:
            { maxDeg?: number; lift?: number; range?: number; shadow?: FxTarget } = {},
    ) {
        const baseScale = t.scale
        const cx = t.x, cy = t.y
        const sy0 = shadow ? shadow.y : 0

        const move = (p: Phaser.Input.Pointer) => {
            if (!alive(t)) return
            const nx = Phaser.Math.Clamp((p.worldX - cx) / range, -1, 1)
            const ny = Phaser.Math.Clamp((p.worldY - cy) / range, -1, 1)
            t.setAngle(nx * maxDeg)
            t.setScale(baseScale * (1 + (1 - Math.abs(ny)) * (lift - 1)))
            shadow.setPosition(cx - nx * 14, sy0 - ny * 6)
        }

        scene.input.on('pointermove', move)
        const stop = addCleanup(scene, () => scene.input.off('pointermove', move))
        t.once('destroy', stop)

        return {
            stop,
            reset: () => {
                FX.to(scene, t, { angle: 0, scale: baseScale }, { duration: 260, ease: Ease.settle })
                if (shadow) FX.to(scene, shadow, { x: cx, y: sy0 }, { duration: 260 })
            },
        }
    }

    /** Camadas que se deslocam em velocidades diferentes. `depth` 0 = parada, 1 = total. */
    static parallax(
        scene: Phaser.Scene,
        layers: Array<{ target: FxTarget; depth: number }>,
        strength = 26,
    ) {
        const bases = layers.map(l => ({ x: l.target.x, y: l.target.y }))
        const move = (p: Phaser.Input.Pointer) => {
            const nx = (p.worldX / W - 0.5) * 2
            const ny = (p.worldY / H - 0.5) * 2
            layers.forEach((l, i) => {
                if (!alive(l.target)) return
                l.target.setPosition(
                    bases[i].x + nx * strength * l.depth,
                    bases[i].y + ny * strength * l.depth * 0.6,
                )
            })
        }
        scene.input.on('pointermove', move)
        return addCleanup(scene, () => scene.input.off('pointermove', move))
    }

    /** Eleva com a sombra crescendo junto. Profundidade convincente e barata. */
    static lift(
        scene: Phaser.Scene,
        t: FxTarget,
        shadow: FxTarget,
        { height = 14, duration = 220 } = {},
    ) {
        return FX.all(
            FX.to(scene, t, { y: t.y - height, scale: t.scale * 1.05 }, { duration, ease: Ease.back(1.3) }),
            FX.to(scene, shadow, { alpha: 0.5, scale: shadow.scale * 1.18 }, { duration }),
        )
    }

    /** Brilho diagonal atravessando o objeto. Marca "novo", "premium", "desbloqueado". */
    static shine(
        scene: Phaser.Scene,
        t: FxTarget,
        { w = 200, h = 90, duration = 700, radius = 20 } = {},
    ): Promise<void> {
        if (!alive(t)) return Promise.resolve()

        const maskG = scene.make.graphics({ x: 0, y: 0 }, false)
        maskG.fillStyle(0xffffff, 1)
        maskG.fillRoundedRect(t.x - w / 2, t.y - h / 2, w, h, radius)

        const beam = scene.add.rectangle(t.x - w / 2 - 60, t.y, 46, h * 2.2, 0xffffff, 0.5)
            .setAngle(22)
            .setDepth((t as unknown as { depth: number }).depth + 1)
        beam.setMask(maskG.createGeometryMask())

        return FX.to(scene, beam as unknown as FxTarget, { x: t.x + w / 2 + 60 }, { duration, ease: Ease.smooth })
            .then(() => { beam.clearMask(true); beam.destroy() })
    }

    // ───────────────────────────────────────────────── texto

    /** Máquina de escrever cancelável. `await` espera; `.skip()` completa na hora.
     *  Cancela sozinha se o Text morrer ou a cena fechar. */
    static type(
        scene: Phaser.Scene,
        label: Phaser.GameObjects.Text,
        text: string,
        { delay = 22, onChar }: { delay?: number; onChar?: (i: number) => void } = {},
    ): Typewriter {
        let done = false
        let timer: Phaser.Time.TimerEvent | undefined
        let finish: () => void = () => { }
        const promise = new Promise<void>(resolve => { finish = resolve })

        const skip = () => {
            if (done) return
            done = true
            if (timer) { timer.remove(); sceneTimers.get(scene).delete(timer) }
            if (label.active) label.setText(text)
            finish()
        }

        label.setText('')
        const passo = FX.ms(scene, delay)

        if (passo <= 0 || !text.length) {
            skip()
        } else {
            let i = 0
            timer = addTimer(scene, scene.time.addEvent({
                delay: passo,
                repeat: text.length - 1,
                callback: () => {
                    if (!label.active) { skip(); return }
                    label.setText(text.slice(0, ++i))
                    onChar?.(i)
                    if (i >= text.length) skip()
                },
            }))
            label.once('destroy', skip)
        }

        return { skip, then: (a, b) => promise.then(a, b) }
    }

    static count(
        scene: Phaser.Scene,
        label: Phaser.GameObjects.Text,
        to: number,
        { from = 0, duration = 620, delay = 0, format = (v: number) => `${v}` } = {},
    ): Promise<void> {
        const s = { v: from }
        return new Promise(resolve => {
            scene.tweens.add({
                targets: s, v: to,
                duration: FX.ms(scene, duration),
                delay: FX.ms(scene, delay),
                ease: Ease.smooth,
                onUpdate: () => { if (label.active) label.setText(format(Math.round(s.v))) },
                onComplete: () => { if (label.active) label.setText(format(to)); resolve() },
            })
        })
    }

    static popText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        { color = '#ffd166', size = '30px', rise = 70, duration = 900 } = {},
    ): Promise<void> {
        const label = scene.add.text(x, y, text, {
            fontFamily: 'Arial Black, Arial',
            fontSize: size,
            color,
            stroke: '#071827',
            strokeThickness: 6,
        }).setOrigin(0.5).setResolution(2).setDepth(9500).setScale(0.4)

        return FX.seq(
            () => FX.to(scene, label as unknown as FxTarget, { scale: 1 }, { duration: 220, ease: Ease.back(2.4) }),
            () => FX.to(scene, label as unknown as FxTarget, { y: y - rise, alpha: 0 }, { duration, ease: Ease.smooth }),
        ).then(() => label.destroy())
    }

    // ───────────────────────────────────────────────── brilho e partículas

    /** Halo que expande e some. Marca "algo aconteceu aqui". */
    static ping(
        scene: Phaser.Scene,
        x: number, y: number, color: number,
        { radius = 90, duration = 520, depth = 9400 } = {},
    ): Promise<void> {
        const g = scene.add.graphics({ x, y }).setDepth(depth)
        g.fillStyle(color, 0.32)
        g.fillCircle(0, 0, radius)
        g.lineStyle(5, color, 0.8)
        g.strokeCircle(0, 0, radius)
        g.setScale(0.15)
        return FX.to(scene, g as unknown as FxTarget, { scale: 1, alpha: 0 }, { duration, ease: Ease.smooth })
            .then(() => g.destroy())
    }

    /** Explosão de pontinhos. Acerto, energia, impacto. */
    static sparks(
        scene: Phaser.Scene,
        x: number, y: number,
        { color = 0xffd166, count = 22, spread = 190, duration = 700, size = 10, depth = 9400 } = {},
    ): Promise<void> {
        ensureTextures(scene)
        const jobs: Array<Promise<void>> = []

        /*
         * AQUI é onde `prefers-reduced-motion` pega — e só aqui.
         *
         * Menos pontinhos e voando menos longe. A explosão continua durando os
         * mesmos 700ms, continua sendo vista e continua dizendo "acertou". O
         * que ela deixa de ser é uma nuvem de vinte e dois objetos cruzando a
         * tela, que é a parte que incomoda quem pediu menos movimento.
         */
        if (FX.reducedMotion()) {
            count = Math.max(6, Math.round(count * 0.45))
            spread = spread * 0.55
        }

        for (let i = 0; i < count; i++) {
            const a = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.25, 0.25)
            const dist = spread * Phaser.Math.FloatBetween(0.45, 1)
            const dot = scene.add.image(x, y, TEX_DOT)
                .setDisplaySize(size, size)
                .setTint(color)
                .setDepth(depth)

            jobs.push(FX.to(scene, dot as unknown as FxTarget, {
                x: x + Math.cos(a) * dist,
                y: y + Math.sin(a) * dist,
                alpha: 0,
                scale: 0.2,
            }, {
                duration: duration * Phaser.Math.FloatBetween(0.7, 1),
                ease: Ease.anticipate(0.4),
            }).then(() => dot.destroy()))
        }

        return Promise.all(jobs).then(() => undefined)
    }

    static confetti(
        scene: Phaser.Scene,
        { colors = [0xf9ce5d, 0x85b47e, 0xea6f67, 0x5882ac], count = 60, duration = 2200, depth = 9400 } = {},
    ): Promise<void> {
        const jobs: Array<Promise<void>> = []

        // menos papelzinho caindo, mesma festa e mesma duração
        if (FX.reducedMotion()) count = Math.max(16, Math.round(count * 0.4))

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, W)
            const piece = scene.add.rectangle(
                x, -30,
                Phaser.Math.Between(8, 15),
                Phaser.Math.Between(12, 22),
                Phaser.Utils.Array.GetRandom(colors),   
            ).setDepth(depth).setAngle(Phaser.Math.Between(0, 360))

            const drift = Phaser.Math.Between(-120, 120)
            const dur = duration * Phaser.Math.FloatBetween(0.65, 1)

            scene.tweens.add({
                targets: piece,
                angle: piece.angle + Phaser.Math.Between(360, 900),
                scaleX: { from: 1, to: -1 },
                // piso próprio: `repeat: -1` com duração zero é um tween que
                // reinicia todo frame sem nunca mostrar nada
                duration: Math.max(120, FX.ms(scene, dur * 0.4)),
                repeat: -1, yoyo: true,
            })

            jobs.push(FX.to(scene, piece as unknown as FxTarget, {
                y: H + 40,
                x: x + drift,
            }, { duration: dur, delay: Phaser.Math.Between(0, 600), ease: 'Quad.easeIn' })
                .then(() => piece.destroy()))
        }

        return Promise.all(jobs).then(() => undefined)
    }

    /** Estrelas que sobem de um ponto. Mais suave que sparks — celebração calma. */
    static stars(
        scene: Phaser.Scene,
        x: number, y: number,
        { color = 0xffd166, count = 10, rise = 130, duration = 1000, depth = 9400 } = {},
    ): Promise<void> {
        ensureTextures(scene)
        const jobs: Array<Promise<void>> = []

        // menos estrelas, subindo menos alto — mesma duração
        if (FX.reducedMotion()) {
            count = Math.max(4, Math.round(count * 0.5))
            rise = rise * 0.6
        }

        for (let i = 0; i < count; i++) {
            const star = scene.add.image(x + Phaser.Math.Between(-40, 40), y, TEX_STAR)
                .setDisplaySize(24, 24).setTint(color).setDepth(depth).setAlpha(0)

            jobs.push(FX.seq(
                () => FX.wait(scene, i * 70),
                () => FX.to(scene, star as unknown as FxTarget, { alpha: 1, scale: star.scale * 1.3 }, { duration: 180 }),
                () => FX.to(scene, star as unknown as FxTarget, {
                    y: y - rise - Phaser.Math.Between(0, 50),
                    x: star.x + Phaser.Math.Between(-30, 30),
                    alpha: 0, angle: Phaser.Math.Between(-90, 90),
                }, { duration, ease: Ease.smooth }),
            ).then(() => star.destroy()))
        }

        return Promise.all(jobs).then(() => undefined)
    }

    // ───────────────────────────────────────────────── cena

    /** Flash de tela cheia. */
    static flash(scene: Phaser.Scene, color = 0xffffff, { duration = 320, peak = 0.55 } = {}): Promise<void> {
        const r = scene.add.rectangle(W / 2, H / 2, W, H, color, peak).setDepth(9998)
        return FX.to(scene, r as unknown as FxTarget, { alpha: 0 }, { duration }).then(() => r.destroy())
    }

    /** Cortina: fecha, roda `onMid`, abre. Esconde troca de cena ou remonte de tela. */
    static async curtain(scene: Phaser.Scene, onMid: () => void | Promise<void>, color = 0x0b1220) {
        const r = scene.add.rectangle(W / 2, H / 2, W, H, color, 0).setDepth(9999).setInteractive()
        await FX.to(scene, r as unknown as FxTarget, { alpha: 1 }, { duration: 300 })
        await onMid()
        await FX.to(scene, r as unknown as FxTarget, { alpha: 0 }, { duration: 340 })
        r.destroy()
    }

    /** Escurece as bordas, focando o centro. Devolve função para remover. */
    static vignette(scene: Phaser.Scene, { color = 0x000000, strength = 0.5, depth = 8900 } = {}) {
        const g = scene.add.graphics().setDepth(depth).setAlpha(0)
        for (let i = 0; i < 14; i++) {
            g.fillStyle(color, (strength / 14))
            g.fillRect(0, 0, W, 22 * (i + 1))
            g.fillRect(0, H - 22 * (i + 1), W, 22 * (i + 1))
            g.fillRect(0, 0, 30 * (i + 1), H)
            g.fillRect(W - 30 * (i + 1), 0, 30 * (i + 1), H)
        }
        FX.to(scene, g as unknown as FxTarget, { alpha: 1 }, { duration: 400 })
        return () => FX.fadeOut(scene, g as unknown as FxTarget, { duration: 300 })
    }

    /** Zoom da câmera num ponto e volta. Dramatiza um acerto ou uma revelação. */
    static async punchZoom(
        scene: Phaser.Scene,
        { x = W / 2, y = H / 2, zoom = 1.15, hold = 400, duration = 320 } = {},
    ) {
        const cam = scene.cameras.main
        // o zoom aproxima a tela inteira; com menos movimento pedido ele quase
        // não sai do lugar, mas a PAUSA (`hold`) continua a mesma — é ela que
        // dá o peso do momento
        if (FX.reducedMotion()) zoom = 1 + (zoom - 1) * 0.3
        cam.pan(x, y, duration, 'Sine.easeInOut')
        cam.zoomTo(zoom, duration, 'Sine.easeInOut')
        await FX.wait(scene, duration + hold)
        cam.pan(W / 2, H / 2, duration, 'Sine.easeInOut')
        cam.zoomTo(1, duration, 'Sine.easeInOut')
        await FX.wait(scene, duration)
    }

    /** Câmera treme. Atalho com valores que funcionam bem em 1280x720. */
    static shakeCam(scene: Phaser.Scene, force: 'leve' | 'medio' | 'forte' = 'medio') {
        const map = { leve: [110, 0.0015], medio: [160, 0.004], forte: [260, 0.009] } as const
        const [dur, amp] = map[force]
        // a tela inteira tremendo é o efeito mais hostil da lista para quem
        // pediu menos movimento: fica, mas de leve
        scene.cameras.main.shake(dur, FX.reducedMotion() ? amp * 0.3 : amp)
    }

    /** Câmera-lenta temporária. Bom para o momento do acerto decisivo. */
    static async slowMo(scene: Phaser.Scene, { factor = 0.35, duration = 700 } = {}) {
        const antesTime = scene.time.timeScale
        const antesTweens = scene.tweens.timeScale
        scene.time.timeScale = factor
        scene.tweens.timeScale = factor
        await new Promise<void>(r => setTimeout(r, duration))
        // restaura os DOIS para o que estavam. Antes o de tweens voltava fixo
        // para 1: duas chamadas encavaladas deixavam o relógio de tempo lento e
        // o de tweens normal, e a cena ficava fora de compasso consigo mesma
        scene.time.timeScale = antesTime
        scene.tweens.timeScale = antesTweens
    }
}