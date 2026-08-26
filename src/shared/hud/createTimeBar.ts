import Phaser from 'phaser'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A BARRA DE TEMPO — nasce cheia e vai baixando
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── POR QUE UMA BARRA, E NÃO UM NÚMERO ───────────────────────────────────
 *
 * "2:14" é um dado que precisa ser LIDO, convertido e comparado com um limite
 * que a criança não conhece. Uma barra que baixa é uma quantidade que se vê de
 * relance, com o canto do olho, sem tirar a atenção do jogo — e quem tem nove
 * ou dez anos entende "está acabando" muito antes de entender "faltam 40
 * segundos". É também um bloco de texto a menos na tela, que é a briga
 * constante destes jogos.
 *
 * ── QUEM DECIDE O QUE ACONTECE AO ZERAR É O JOGO ─────────────────────────
 *
 * A barra não sabe perder. Ela conta, pinta e avisa; o que zerar SIGNIFICA é
 * decisão de quem a usa, e chega pelo callback `onEmpty` — que dispara uma
 * única vez, no frame em que ela chega ao fim.
 *
 * A plataforma tem um evento `GAME_OVER` no contrato (`platformEvents`), mas
 * ele só NOTIFICA: nada do lado de fora reinicia fase, desconta vida ou fecha
 * o jogo. Quem faz a derrota acontecer é a cena — emitir `GAME_OVER` é o
 * aviso, não o mecanismo.
 *
 * Em jogo de fundamental 1 a derrota razoável é **perder o CASO**, com uma
 * tela de "tentar de novo" que remonta o mesmo caso com a barra cheia. Perder
 * o nível inteiro, ou o jogo, transforma um erro de ritmo em castigo — e é
 * incompatível com "errar trava até entender, sem empurrar para a frente".
 *
 * ── COMO USAR ────────────────────────────────────────────────────────────
 *
 *   const tempo = createTimeBar(this, { cx: 1064, cy: 42, w: 210, h: 20,
 *                                       duration: 60_000 })
 *   hudContainer.add(tempo.container)
 *
 *   update(_t, delta) {
 *       const correndo = state === 'jogando' && !locked && !ended
 *       tempo.setRunning(correndo)      // só repinta quando muda
 *       tempo.tick(delta)               // ignorado enquanto parada
 *   }
 *
 *   // caso novo
 *   tempo.reset(90_000)
 *   // relatório
 *   total += tempo.elapsed()
 *
 * `tick` é chamado todo frame e a barra decide sozinha se conta: assim é
 * impossível o cronômetro andar durante tutorial, animação ou tela de fim de
 * nível, que é onde ele mais mente.
 */

/** `m:ss`. Passou de uma hora não acontece, e se acontecer conta os minutos. */
export function formatTime(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000))
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
}

/**
 * ── AS CORES ─────────────────────────────────────────────────────────────
 *
 * TUDO que a barra pinta é configurável, e o padrão daqui é neutro de
 * propósito: cada jogo tem paleta própria e a barra tem que caber no header
 * dele, não impor um visual.
 *
 * O conselho que vale para todos: use as cores do CROMO do jogo (a moldura, o
 * metal, o papel) e nunca as cores de SIGNIFICADO. Uma barra verde no header
 * sugere que o tempo é uma resposta certa; uma barra amarela num jogo onde
 * amarelo quer dizer "encaixe aqui" manda a criança tocar no header.
 *
 * Passe só o que quiser trocar — o resto cai no padrão:
 *
 *   theme: { fill: C.creme, warn: C.latao, danger: C.alerta, border: C.latao }
 */
export interface TimeBarTheme {
    /** O sulco por baixo, e a sombra dele. */
    track?: number
    trackAlpha?: number
    shadow?: number
    shadowAlpha?: number
    /** O aro em volta do sulco. */
    border?: number
    borderAlpha?: number
    /** Cheia, e nas duas faixas de aviso. */
    fill?: number
    /** Abaixo de `warnAt`. */
    warn?: number
    /** Abaixo de `dangerAt`. */
    danger?: number
    /** Zerada, e o relógio quando a barra está parada. */
    idle?: number
    icon?: number
    /** O brilho de cima, que faz a barra parecer tubo e não risco. */
    gloss?: number
    glossAlpha?: number
    /** Quão fraca a barra fica no vale do pulso, em `dangerAt`. */
    pulseTo?: number
    /** A cor do `m:ss`, quando `label` estiver ligado. */
    ink?: string
}

/** O padrão, exportado para dar para partir dele: `{ ...TIME_BAR_THEME, fill }`. */
export const TIME_BAR_THEME: Required<TimeBarTheme> = {
    track: 0x101a14,
    trackAlpha: 0.6,
    shadow: 0x000000,
    shadowAlpha: 0.28,
    border: 0xffffff,
    borderAlpha: 0.32,
    fill: 0xf4f7f2,
    warn: 0xd9a441,
    danger: 0xfb7185,
    idle: 0x8fae9b,
    icon: 0xf4f7f2,
    gloss: 0xffffff,
    glossAlpha: 0.26,
    pulseTo: 0.5,
    ink: '#f4f7f2',
}

export interface TimeBarOptions {
    /** O centro da BARRA (o ícone fica fora dela, à esquerda). */
    cx: number
    cy: number
    w: number
    h: number
    /** Quanto tempo ela leva para esvaziar, em ms. */
    duration: number

    theme?: TimeBarTheme
    /** Frações em que a barra troca de cor. */
    warnAt?: number
    dangerAt?: number

    /** O relógio desenhado à esquerda da barra. */
    icon?: boolean
    iconDX?: number
    iconR?: number

    /**
     * O `m:ss` restante escrito dentro da barra.
     *
     * Desligado por padrão de propósito: a barra JÁ é o mostrador, e o número
     * em cima dela é o bloco de texto que ela veio eliminar. Ligue só quando
     * alguém de fora do jogo (professor, relatório) precisar do valor exato.
     */
    label?: boolean
    labelSize?: string
    fontFamily?: string

    depth?: number

    /**
     * A barra entrou na faixa crítica (`dangerAt`).
     *
     * Dispara uma vez por `reset`. É o lugar do "tic-tac": um tom curto, e só.
     * A barra já pulsa sozinha — som aqui é reforço, não alarme.
     */
    onDanger?: () => void

    /**
     * A barra ZEROU. Dispara uma vez por `reset`.
     *
     * É AQUI que mora a derrota, se o jogo tiver uma: mostrar a tela de tempo
     * esgotado, emitir `GAME_OVER` para a plataforma e remontar o caso. A barra
     * não faz nada disso sozinha — ela só avisa.
     */
    onEmpty?: () => void
}

export interface TimeBar {
    container: Phaser.GameObjects.Container
    /** Anda `delta` ms. Ignorado enquanto `setRunning(false)`. */
    tick(delta: number): void
    /** Volta a ficar cheia. Sem argumento, mantém a duração atual. */
    reset(duration?: number): void
    /** Congela e apaga a barra — tutorial, animação, fim de nível. */
    setRunning(on: boolean): void
    /** Quanto sobra, de 1 (cheia) a 0 (vazia). */
    fraction(): number
    /** Quanto sobra, em ms. */
    remaining(): number
    /** Quanto já se passou, em ms. CONTINUA crescendo depois de zerar. */
    elapsed(): number
    destroy(): void
}

/** O mostrador: um ponteiro parado em "dez para as duas". */
export function paintClockFace(
    g: Phaser.GameObjects.Graphics,
    r: number,
    tom: number,
) {
    g.clear()
    g.fillStyle(tom, 0.2)
    g.fillCircle(0, 0, r)
    g.lineStyle(3, tom, 1)
    g.strokeCircle(0, 0, r)
    g.lineBetween(0, 0, 0, -r * 0.58)
    g.lineBetween(0, 0, r * 0.44, r * 0.16)
}

export function createTimeBar(
    scene: Phaser.Scene,
    opts: TimeBarOptions,
): TimeBar {
    const {
        cx, cy, w, h, duration,
        warnAt = 0.34, dangerAt = 0.15,
        icon = true, iconDX = -(w / 2 + 22), iconR = 13,
        label = false, labelSize = '17px',
        fontFamily = '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        depth = 0,
    } = opts
    const T = { ...TIME_BAR_THEME, ...(opts.theme ?? {}) }

    const container = scene.add.container(cx, cy).setDepth(depth)
    const hw = w / 2
    const hh = h / 2

    /* ── o sulco, que nunca muda ───────────────────────────────────── */
    const track = scene.add.graphics()
    track.fillStyle(T.shadow, T.shadowAlpha)
    track.fillRoundedRect(-hw, -hh + 3, w, h, hh)
    track.fillStyle(T.track, T.trackAlpha)
    track.fillRoundedRect(-hw, -hh, w, h, hh)
    container.add(track)

    const fill = scene.add.graphics()
    container.add(fill)

    const borda = scene.add.graphics()
    borda.lineStyle(2, T.border, T.borderAlpha)
    borda.strokeRoundedRect(-hw, -hh, w, h, hh)
    container.add(borda)

    let relogio: Phaser.GameObjects.Graphics | undefined
    if (icon) {
        relogio = scene.add.graphics().setPosition(iconDX, 0)
        paintClockFace(relogio, iconR, T.icon)
        container.add(relogio)
    }

    let texto: Phaser.GameObjects.Text | undefined
    if (label) {
        texto = scene.add.text(0, -1, '', {
            fontFamily, fontSize: labelSize, color: T.ink,
        }).setOrigin(0.5).setResolution(2)
        container.add(texto)
    }

    /* ── estado ────────────────────────────────────────────────────── */
    let total = Math.max(1, duration)
    let gasto = 0
    let correndo = true
    let vazia = false
    let avisou = false
    /** Só repinta quando a barra muda de pixel ou de faixa de cor. */
    let ultimaLargura = -1
    let ultimoTom = -1
    let pulso: Phaser.Tweens.Tween | null = null

    const restante = () => Math.max(0, total - gasto)
    const fracao = () => restante() / total

    const tomDa = (f: number) => {
        if (!correndo && f <= 0) return T.idle
        if (f <= 0) return T.idle
        if (f <= dangerAt) return T.danger
        if (f <= warnAt) return T.warn
        return T.fill
    }

    const pararPulso = () => {
        pulso?.remove()
        pulso = null
        fill.setAlpha(1)
    }

    /**
     * O pulso é o ÚNICO alarme.
     *
     * Sem som, sem susto e sem número piscando: a barra respira quando está
     * acabando. É o mesmo princípio da fenda de encaixe — numa tela parada, a
     * coisa que se mexe é para onde o olho vai.
     */
    const cuidarDoPulso = (f: number) => {
        const deve = correndo && f > 0 && f <= dangerAt
        if (deve === !!pulso) return
        if (!deve) { pararPulso(); return }
        pulso = scene.tweens.add({
            targets: fill, alpha: T.pulseTo,
            duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    const pintar = (forcar = false) => {
        const f = fracao()
        const largura = Math.round(w * f)
        const tom = tomDa(f)

        if (!forcar && largura === ultimaLargura && tom === ultimoTom) {
            if (texto) texto.setText(formatTime(restante()))
            return
        }
        ultimaLargura = largura
        ultimoTom = tom

        fill.clear()
        if (largura > 0) {
            // o raio acompanha a largura: `fillRoundedRect` com raio maior que
            // metade da largura desenha uma gota torta no fim da barra
            const r = Math.min(hh, largura / 2)
            fill.fillStyle(tom, 1)
            fill.fillRoundedRect(-hw, -hh, largura, h, r)
            // o brilho de cima, que faz a barra parecer um tubo e não um risco
            if (largura > h) {
                fill.fillStyle(T.gloss, T.glossAlpha)
                fill.fillRoundedRect(-hw + 4, -hh + 3, largura - 8, h * 0.34, h * 0.17)
            }
        }

        if (relogio) paintClockFace(relogio, iconR, correndo ? T.icon : T.idle)
        if (texto) {
            texto.setText(formatTime(restante()))
            texto.setColor(T.ink)
        }
        cuidarDoPulso(f)
    }

    pintar(true)

    return {
        container,

        tick: delta => {
            if (!correndo || vazia) {
                // zerada ela para de repintar, mas o tempo continua sendo
                // contado: `elapsed()` é o dado do relatório, e ele não pode
                // travar só porque a barra chegou ao fim
                if (correndo) gasto += delta
                return
            }
            gasto += delta
            pintar()

            if (!avisou && fracao() <= dangerAt) {
                avisou = true
                opts.onDanger?.()
            }
            if (restante() > 0) return
            vazia = true
            pararPulso()
            pintar(true)
            opts.onEmpty?.()
        },

        reset: nova => {
            total = Math.max(1, nova ?? total)
            gasto = 0
            vazia = false
            avisou = false
            pararPulso()
            pintar(true)
        },

        setRunning: on => {
            if (on === correndo) return
            correndo = on
            // parada, a barra inteira esmaece: dá para ver que ela não está
            // andando, o que importa quando o jogo trava por animação
            container.setAlpha(on ? 1 : 0.45)
            if (!on) pararPulso()
            pintar(true)
        },

        fraction: fracao,
        remaining: restante,
        elapsed: () => gasto,

        destroy: () => {
            pararPulso()
            container.destroy()
        },
    }
}
