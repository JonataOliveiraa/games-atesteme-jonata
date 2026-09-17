type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tap(): void
    scan(): void
    stamp(): void
    right(): void
    wrong(): void
    hint(): void
    /** Uma nota da escala, para os desafios musicais. */
    note(step: number): void
    key(): void
    shutter(): void
    think(step: number): void
    whoosh(): void
    drop(): void
    forget(): void
    plug(): void
    powerOn(): void
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
 * ENVELOPE e o FILTRO: ataque curto, queda exponencial, e um eco curtinho que
 * dá corpo sem virar reverb.
 */
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
            master.gain.value = 0.9

            const echo = ctx.createDelay(0.4)
            echo.delayTime.value = 0.11
            const echoGain = ctx.createGain()
            echoGain.gain.value = 0.16
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
        osc.stop(at + dur + 0.03)
    }

    /** Duas vozes levemente desafinadas soam bem mais cheias que uma. */
    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.55, detune: 7 })
    }

    const noise = (
        dur: number,
        from: number,
        to: number,
        o: { gain?: number; delay?: number; type?: BiquadFilterType; q?: number } = {},
    ) => {
        const audio = get()
        const dest = out()
        if (!audio || !dest) return
        const at = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = o.type ?? 'bandpass'
        filter.Q.value = o.q ?? 1.3
        filter.frequency.setValueAtTime(from, at)
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), at + dur)
        const vol = audio.createGain()
        vol.gain.setValueAtTime(o.gain ?? 0.12, at)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(filter).connect(vol).connect(dest)
        src.start(at)
    }

    const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]

    return {
        tap: () => {
            tone(880, 0.055, { wave: 'triangle', gain: 0.07 })
            noise(0.03, 3200, 1600, { gain: 0.045 })
        },

        key: () => {
            noise(0.035, 2600, 900, { gain: 0.1, type: 'highpass', q: 0.8 })
            tone(320, 0.05, { wave: 'square', gain: 0.045 })
        },

        scan: () => {
            tone(140, 0.85, { wave: 'sawtooth', gain: 0.03, to: 1100 })
            noise(0.85, 400, 5200, { gain: 0.035, q: 0.6 })
        },

        stamp: () => {
            noise(0.07, 1400, 220, { gain: 0.16 })
            tone(120, 0.14, { wave: 'sine', gain: 0.13 })
            tone(240, 0.08, { wave: 'triangle', gain: 0.06, delay: 0.01 })
        },

        right: () => {
            fat(659.25, 0.16, { wave: 'triangle', gain: 0.1 })
            fat(987.77, 0.24, { wave: 'triangle', gain: 0.09, delay: 0.085 })
            noise(0.3, 6000, 2000, { gain: 0.03, delay: 0.06, type: 'highpass' })
        },

        wrong: () => {
            tone(233.08, 0.16, { wave: 'sine', gain: 0.1 })
            tone(185, 0.26, { wave: 'sine', gain: 0.1, delay: 0.12 })
        },

        hint: () => {
            tone(1318.51, 0.1, { wave: 'sine', gain: 0.05 })
            tone(1318.51, 0.1, { wave: 'sine', gain: 0.05, delay: 0.16 })
        },

        note: step => fat(SCALE[step % SCALE.length], 0.42, { wave: 'triangle', gain: 0.12 }),

        think: step => {
            tone(300 + step * 90, 0.09, { wave: 'square', gain: 0.055 })
            noise(0.05, 2000, 900, { gain: 0.05 })
        },

        shutter: () => {
            noise(0.045, 5000, 1200, { gain: 0.2, type: 'highpass' })
            noise(0.07, 1800, 500, { gain: 0.12, delay: 0.05 })
        },

        whoosh: () => noise(0.34, 500, 3600, { gain: 0.07, q: 0.5 }),

        drop: () => {
            tone(520, 0.18, { wave: 'triangle', gain: 0.09, to: 180 })
            noise(0.06, 900, 260, { gain: 0.1, delay: 0.14 })
        },

        forget: () => {
            tone(700, 0.5, { wave: 'sine', gain: 0.09, to: 90 })
            noise(0.4, 2400, 200, { gain: 0.05 })
        },

        plug: () => {
            noise(0.05, 1600, 400, { gain: 0.14 })
            tone(160, 0.12, { wave: 'square', gain: 0.09, delay: 0.03 })
            tone(880, 0.1, { wave: 'triangle', gain: 0.05, delay: 0.05 })
        },

        powerOn: () => {
            tone(90, 0.5, { wave: 'sawtooth', gain: 0.05, to: 240 })
            fat(392, 0.22, { wave: 'triangle', gain: 0.09, delay: 0.1 })
            fat(523.25, 0.22, { wave: 'triangle', gain: 0.09, delay: 0.2 })
            fat(659.25, 0.34, { wave: 'triangle', gain: 0.1, delay: 0.3 })
        },

        fanfare: () => {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
                fat(f, 0.32, { wave: 'triangle', gain: 0.12, delay: i * 0.12 }),
            )
            noise(0.6, 7000, 1800, { gain: 0.035, delay: 0.4, type: 'highpass' })
        },

        setMuted: on => {
            muted = on
        },

        destroy: () => {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
