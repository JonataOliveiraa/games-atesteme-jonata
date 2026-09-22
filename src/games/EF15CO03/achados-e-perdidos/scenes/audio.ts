type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    /** O bichinho pousa no balcão. */
    arrive(): void
    /** A criança toca numa carta. */
    tap(): void
    /** O termo bate com o bichinho. */
    right(): void
    /** O termo não bate. Nunca agressivo — é uma pergunta, não um alarme. */
    wrong(): void
    /** A carta encaixa no campo do cartaz. */
    snap(): void
    /** O cartaz fica completo. */
    fanfare(): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
    attack?: number
    detune?: number
}

/** Tudo sintetizado, sem arquivo. Sem narração: balão e pictograma. */
export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor = window.AudioContext
                ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()

            const master = ctx.createGain()
            master.gain.value = 0.85

            const echo = ctx.createDelay(0.4)
            echo.delayTime.value = 0.1
            const echoGain = ctx.createGain()
            echoGain.gain.value = 0.14
            const echoCut = ctx.createBiquadFilter()
            echoCut.type = 'lowpass'
            echoCut.frequency.value = 2400

            master.connect(ctx.destination)
            master.connect(echo)
            echo.connect(echoCut).connect(echoGain).connect(ctx.destination)
            bus = master
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const out = () => bus ?? ctx?.destination

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        const dest = out()
        if (!audio || !dest) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.detune) osc.detune.setValueAtTime(o.detune, at)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), at + dur)
        const peak = o.gain ?? 0.1
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(peak, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(dest)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    return {
        arrive() {
            tone(392, 0.12, { wave: 'triangle', gain: 0.1 })
            tone(587, 0.16, { wave: 'triangle', gain: 0.09, delay: 0.09 })
        },
        tap() {
            tone(660, 0.07, { wave: 'triangle', gain: 0.07 })
        },
        right() {
            fat(880, 0.16, { wave: 'triangle', gain: 0.1 })
        },
        wrong() {
            tone(300, 0.2, { wave: 'sine', gain: 0.09, to: 232 })
        },
        snap() {
            tone(523, 0.1, { wave: 'triangle', gain: 0.1 })
            tone(784, 0.14, { wave: 'triangle', gain: 0.09, delay: 0.07 })
        },
        fanfare() {
            const notes = [523, 659, 784, 1047]
            notes.forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
