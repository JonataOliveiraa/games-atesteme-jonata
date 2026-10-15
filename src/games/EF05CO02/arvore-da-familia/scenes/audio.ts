type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    pop(): void
    lift(): void
    put(): void
    snap(): void
    wind(ms: number): void
    fall(): void
    wave(): void
    flap(): void
    blom(): void
    cheer(): void
    lose(): void
    win(): void
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

    const noise = (ms: number, gainValue: number, delay = 0, from = 1800, to?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = 'bandpass'
        const t0 = audio.currentTime + delay / 1000
        filter.frequency.setValueAtTime(from, t0)
        if (to) filter.frequency.exponentialRampToValueAtTime(to, t0 + ms / 1000)
        const gain = audio.createGain()
        gain.gain.value = gainValue
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(t0)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.5, { ...o, delay: (o.delay ?? 0) + i * step }))

    return {
        pop() {
            tone(660, 90, { wave: 'sine', gain: 0.09, to: 990 })
        },
        lift() {
            tone(420, 110, { wave: 'triangle', gain: 0.1, to: 700 })
        },
        put() {
            tone(500, 90, { wave: 'triangle', gain: 0.08, to: 320 })
        },
        snap() {
            noise(60, 0.3, 0, 1400)
            tone(880, 160, { wave: 'triangle', gain: 0.1, delay: 40 })
            tone(1320, 220, { wave: 'sine', gain: 0.06, delay: 110 })
        },
        wind(ms) {
            noise(ms, 0.35, 0, 400, 1400)
            noise(ms * 0.7, 0.2, ms * 0.25, 900, 300)
        },
        fall() {
            noise(260, 0.12, 0, 2400, 900)
        },
        wave() {
            noise(1400, 0.32, 0, 300, 1200)
            noise(1100, 0.22, 1100, 1200, 300)
        },
        flap() {
            for (let i = 0; i < 4; i++) noise(70, 0.1, i * 140, 1600)
        },
        blom() {
            tone(330, 220, { wave: 'sine', gain: 0.16, to: 180 })
            tone(220, 260, { wave: 'triangle', gain: 0.1, delay: 160, to: 140 })
        },
        cheer() {
            notes([523, 659, 784, 1047], 110, { wave: 'triangle', gain: 0.12 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 120, { wave: 'triangle', gain: 0.12 })
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
