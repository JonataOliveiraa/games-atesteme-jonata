type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tap(): void
    open(): void
    wrong(): void
    hint(): void
    /** O estalo do fio: o som mais importante do jogo. */
    snap(): void
    lock(): void
    pop(): void
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

/**
 * Tudo sintetizado, sem arquivo. O que separa um bip de um som de jogo é o
 * ENVELOPE e o FILTRO: ataque curto, queda exponencial, e ruído passa-banda
 * para o que é faísca, plástico e papel.
 */
export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()

            const master = ctx.createGain()
            master.gain.value = 0.85

            const echo = ctx.createDelay(0.4)
            echo.delayTime.value = 0.1
            const echoGain = ctx.createGain()
            echoGain.gain.value = 0.11
            const echoCut = ctx.createBiquadFilter()
            echoCut.type = 'lowpass'
            echoCut.frequency.value = 2200

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
        osc.stop(at + dur + 0.05)
    }

    const noise = (
        dur: number,
        o: { freq?: number; q?: number; gain?: number; delay?: number; to?: number; type?: BiquadFilterType } = {},
    ) => {
        const audio = get()
        const dest = out()
        if (!audio || !dest) return
        const at = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1

        const src = audio.createBufferSource()
        src.buffer = buffer

        const filter = audio.createBiquadFilter()
        filter.type = o.type ?? 'bandpass'
        filter.frequency.setValueAtTime(o.freq ?? 1400, at)
        if (o.to) filter.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), at + dur)
        filter.Q.value = o.q ?? 1.2

        const vol = audio.createGain()
        const peak = o.gain ?? 0.12
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(peak, at + 0.008)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)

        src.connect(filter).connect(vol).connect(dest)
        src.start(at)
        src.stop(at + dur + 0.05)
    }

    return {
        tap: () => {
            tone(560, 0.06, { wave: 'square', gain: 0.045 })
            noise(0.04, { freq: 2400, gain: 0.04 })
        },

        open: () => {
            tone(659, 0.18, { wave: 'triangle', gain: 0.08 })
            tone(988, 0.24, { wave: 'sine', gain: 0.06, delay: 0.07 })
            noise(0.14, { freq: 2600, to: 1200, gain: 0.04, q: 0.7 })
        },

        wrong: () => {
            tone(196, 0.2, { wave: 'triangle', gain: 0.09, to: 150 })
            noise(0.09, { freq: 520, gain: 0.05, q: 2.6 })
        },

        hint: () => {
            noise(0.2, { freq: 700, to: 1500, gain: 0.045, q: 0.8 })
            tone(392, 0.2, { wave: 'sine', gain: 0.045 })
        },

        snap: () => {
            // o estalo: um crack seco, faísca e um grave que cai
            noise(0.07, { freq: 3400, gain: 0.17, q: 0.5 })
            noise(0.3, { freq: 1800, to: 240, gain: 0.1, q: 0.8, delay: 0.03 })
            tone(220, 0.44, { wave: 'sawtooth', gain: 0.08, to: 55, delay: 0.02 })
            tone(90, 0.5, { wave: 'sine', gain: 0.07, to: 42, delay: 0.05 })
        },

        lock: () => {
            tone(150, 0.1, { wave: 'square', gain: 0.06, to: 100 })
            noise(0.06, { freq: 1000, gain: 0.05, q: 2 })
        },

        pop: () => {
            tone(740, 0.09, { wave: 'sine', gain: 0.055, to: 980 })
        },

        fanfare: () => {
            const notes = [523, 659, 784, 1047]
            notes.forEach((f, i) => {
                tone(f, 0.42, { wave: 'triangle', gain: 0.09, delay: i * 0.11 })
                tone(f * 2, 0.3, { wave: 'sine', gain: 0.035, delay: i * 0.11 })
            })
        },

        setMuted: on => {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },

        destroy: () => {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
