type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    pop(): void
    paper(): void
    snap(): void
    wobble(): void
    tumble(): void
    roll(ms: number): void
    drop(): void
    bell(): void
    open(): void
    good(): void
    lose(): void
    win(): void
    whoosh(): void
    tick(n: number): void
    meow(): void
    purr(): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
}

const MASTER = 0.5

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            bus = ctx.createGain()
            bus.gain.value = MASTER
            bus.connect(ctx.destination)
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (freq: number, ms: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const t0 = audio.currentTime + (o.delay ?? 0) / 1000
        const t1 = t0 + ms / 1000
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t1)
        const peak = o.gain ?? 0.14
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, t1)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t0)
        osc.stop(t1 + 0.02)
    }

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1800, type: BiquadFilterType = 'highpass') => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.max(1, Math.floor((audio.sampleRate * ms) / 1000))
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = type
        filter.frequency.value = freq
        const gain = audio.createGain()
        gain.gain.value = gainValue
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(audio.currentTime + delay / 1000)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.5, { ...o, delay: (o.delay ?? 0) + i * step }))

    return {
        pop() {
            tone(700, 80, { wave: 'sine', gain: 0.1, to: 1000 })
        },
        paper() {
            noise(90, 0.08, 0, 2600)
            tone(520, 70, { wave: 'triangle', gain: 0.05, to: 760 })
        },
        snap() {
            tone(420, 60, { wave: 'square', gain: 0.05, to: 300 })
            noise(40, 0.12, 0, 900, 'bandpass')
            tone(220, 90, { wave: 'triangle', gain: 0.1, delay: 20, to: 160 })
        },
        wobble() {
            tone(300, 90, { wave: 'triangle', gain: 0.07, to: 260 })
            tone(280, 90, { wave: 'triangle', gain: 0.07, delay: 150, to: 240 })
        },
        tumble() {
            noise(70, 0.16, 0, 700, 'lowpass')
            tone(180, 110, { wave: 'triangle', gain: 0.14, to: 110 })
            noise(60, 0.12, 260, 700, 'lowpass')
            tone(160, 100, { wave: 'triangle', gain: 0.1, delay: 260, to: 100 })
            noise(50, 0.08, 430, 700, 'lowpass')
        },
        roll(ms) {
            const audio = get()
            if (!audio) return
            for (let t = 0; t < ms; t += 70) noise(80, 0.035, t, 380, 'lowpass')
        },
        drop() {
            tone(900, 50, { wave: 'sine', gain: 0.08, to: 600 })
            noise(30, 0.06, 0, 2000)
        },
        bell() {
            tone(1318, 1100, { wave: 'sine', gain: 0.14 })
            tone(1976, 900, { wave: 'sine', gain: 0.06 })
            tone(2637, 600, { wave: 'sine', gain: 0.04 })
            tone(1318, 900, { wave: 'sine', gain: 0.08, delay: 320 })
        },
        open() {
            tone(330, 140, { wave: 'triangle', gain: 0.09, to: 520 })
            noise(80, 0.06, 40, 1400)
        },
        good() {
            notes([523, 659, 784, 1047], 110, { wave: 'triangle', gain: 0.12 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 120, { wave: 'triangle', gain: 0.12 })
        },
        whoosh() {
            tone(300, 260, { wave: 'sine', gain: 0.08, to: 900 })
        },
        tick(n) {
            tone(620 + n * 90, 90, { wave: 'triangle', gain: 0.1, to: 760 + n * 90 })
        },
        meow() {
            tone(620, 160, { wave: 'sawtooth', gain: 0.05, to: 980 })
            tone(980, 260, { wave: 'triangle', gain: 0.09, delay: 140, to: 520 })
        },
        purr() {
            for (let t = 0; t < 600; t += 90) noise(70, 0.03, t, 180, 'lowpass')
        },
        setMuted(on) {
            muted = on
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
