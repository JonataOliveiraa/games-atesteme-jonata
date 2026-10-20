type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    jump(): void
    land(): void
    yes(): void
    no(): void
    flip(): void
    join(): void
    glub(): void
    splash(): void
    step(): void
    ding(): void
    good(): void
    lose(): void
    win(): void
    pop(): void
    whoosh(): void
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

    const noise = (ms: number, gainValue: number, delay = 0, high = 1800) => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = high
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
        jump() {
            tone(260, 220, { wave: 'sine', gain: 0.1, to: 620 })
        },
        land() {
            tone(180, 120, { wave: 'triangle', gain: 0.14, to: 120 })
            noise(60, 0.08, 0, 700)
        },
        yes() {
            tone(880, 90, { wave: 'triangle', gain: 0.12 })
            tone(1175, 160, { wave: 'triangle', gain: 0.1, delay: 80 })
        },
        no() {
            tone(300, 180, { wave: 'triangle', gain: 0.1, to: 240 })
        },
        flip() {
            tone(440, 160, { wave: 'sine', gain: 0.1, to: 880 })
            tone(880, 120, { wave: 'sine', gain: 0.06, delay: 120, to: 660 })
        },
        join() {
            tone(520, 140, { wave: 'triangle', gain: 0.09, to: 660 })
            tone(830, 140, { wave: 'triangle', gain: 0.09, to: 660 })
        },
        glub() {
            tone(220, 160, { wave: 'sine', gain: 0.14, to: 110 })
            tone(180, 160, { wave: 'sine', gain: 0.1, delay: 200, to: 90 })
            tone(150, 200, { wave: 'sine', gain: 0.08, delay: 420, to: 70 })
        },
        splash() {
            noise(260, 0.22, 0, 500)
            tone(160, 260, { wave: 'sine', gain: 0.12, to: 70 })
        },
        step() {
            noise(36, 0.05, 0, 2600)
        },
        ding() {
            tone(988, 120, { wave: 'sine', gain: 0.12 })
            tone(1319, 220, { wave: 'sine', gain: 0.1, delay: 110 })
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
        pop() {
            tone(700, 80, { wave: 'sine', gain: 0.1, to: 1000 })
        },
        whoosh() {
            tone(300, 260, { wave: 'sine', gain: 0.08, to: 900 })
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
