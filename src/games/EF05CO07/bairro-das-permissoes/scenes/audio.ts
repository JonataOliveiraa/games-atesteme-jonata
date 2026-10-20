type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    step(): void
    skid(): void
    bump(): void
    call(): void
    arrive(): void
    click(): void
    stamp(): void
    gate(): void
    whoosh(): void
    shutter(): void
    melody(): void
    hum(): void
    wake(): void
    pop(): void
    zap(): void
    good(): void
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
    let lastSkid = 0

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
        step() {
            noise(28, 0.06, 0, 900, 'bandpass')
        },
        skid() {
            const now = performance.now()
            if (now - lastSkid < 380) return
            lastSkid = now
            noise(240, 0.07, 0, 2600, 'bandpass')
        },
        bump() {
            tone(300, 160, { wave: 'sine', gain: 0.16, to: 140 })
            tone(180, 140, { wave: 'triangle', gain: 0.08, delay: 90, to: 320 })
        },
        call() {
            notes([784, 988], 140, { wave: 'triangle', gain: 0.1 })
        },
        arrive() {
            notes([523, 784], 80, { wave: 'sine', gain: 0.1 })
        },
        click() {
            tone(900, 60, { wave: 'square', gain: 0.05, to: 600 })
        },
        stamp() {
            noise(120, 0.3, 0, 400, 'lowpass')
            tone(120, 180, { wave: 'sine', gain: 0.2, to: 60 })
        },
        gate() {
            for (let i = 0; i < 6; i++) noise(40, 0.12, i * 55, 1400, 'bandpass')
        },
        whoosh() {
            noise(520, 0.1, 0, 900, 'bandpass')
            tone(400, 520, { wave: 'sine', gain: 0.05, to: 900 })
        },
        shutter() {
            noise(70, 0.25, 0, 1500)
            noise(60, 0.2, 90, 2400)
        },
        melody() {
            notes([523, 659, 784, 659, 880, 784, 1047], 150, { wave: 'triangle', gain: 0.11 })
        },
        hum() {
            notes([440, 554, 659], 110, { wave: 'sine', gain: 0.09 })
        },
        wake() {
            notes([392, 523, 784], 90, { wave: 'sine', gain: 0.1 })
        },
        pop() {
            tone(620, 90, { wave: 'sine', gain: 0.1, to: 980 })
        },
        zap() {
            noise(260, 0.12, 0, 3200)
            tone(220, 260, { wave: 'sawtooth', gain: 0.05, to: 90 })
        },
        good() {
            notes([523, 659, 784], 90, { wave: 'triangle', gain: 0.1 })
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
