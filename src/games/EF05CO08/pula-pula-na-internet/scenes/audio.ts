type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    boing(): void
    bump(): void
    collect(): void
    open(): void
    tick(): void
    pick(): void
    good(): void
    save(): void
    block(): void
    oops(): void
    cloud(): void
    glitch(): void
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
    let lastBoing = 0

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
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.01)
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
        boing() {
            const now = performance.now()
            if (now - lastBoing < 120) return
            lastBoing = now
            tone(260 + Math.random() * 40, 140, { wave: 'sine', gain: 0.05, to: 560 })
        },
        bump() {
            tone(200, 120, { wave: 'triangle', gain: 0.07, to: 120 })
            noise(80, 0.05, 0, 600, 'lowpass')
        },
        collect() {
            notes([784, 988, 1319], 70, { wave: 'triangle', gain: 0.09 })
        },
        open() {
            noise(220, 0.06, 0, 1400, 'bandpass')
            tone(420, 220, { wave: 'sine', gain: 0.06, to: 840 })
        },
        tick() {
            tone(1100, 50, { wave: 'square', gain: 0.03, to: 900 })
        },
        pick() {
            tone(660, 70, { wave: 'sine', gain: 0.08, to: 880 })
        },
        good() {
            notes([523, 659, 784], 90, { wave: 'triangle', gain: 0.1 })
        },
        save() {
            notes([880, 1175, 1568], 60, { wave: 'sine', gain: 0.08, delay: 80 })
        },
        block() {
            tone(180, 160, { wave: 'triangle', gain: 0.12, to: 90 })
            noise(120, 0.1, 0, 500, 'lowpass')
        },
        oops() {
            tone(330, 260, { wave: 'triangle', gain: 0.09, to: 220 })
        },
        cloud() {
            noise(420, 0.05, 0, 900, 'bandpass')
            notes([392, 523, 659, 784], 80, { wave: 'sine', gain: 0.08, delay: 120 })
        },
        glitch() {
            for (let i = 0; i < 4; i++) tone(300 + Math.random() * 900, 40, { wave: 'square', gain: 0.035, delay: i * 50 })
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
