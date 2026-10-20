type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    click(): void
    throw(): void
    splash(): void
    plop(): void
    bite(): void
    ping(): void
    catchFish(): void
    cheer(): void
    forward(): void
    backward(): void
    tick(): void
    wake(): void
    miss(): void
    lose(): void
    win(): void
    horn(): void
    voice(): void
    ring(): void
    send(): void
    grow(): void
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
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, t1)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t0)
        osc.stop(t1 + 0.02)
    }

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1200, type: BiquadFilterType = 'lowpass') => {
        const audio = get()
        if (!audio || !bus) return
        const len = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, len, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = type
        filter.frequency.value = freq
        const gain = audio.createGain()
        const t0 = audio.currentTime + delay / 1000
        gain.gain.setValueAtTime(gainValue, t0)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000)
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(t0)
    }

    return {
        click: () => tone(660, 70, { wave: 'triangle', gain: 0.1 }),
        throw: () => noise(220, 0.1, 0, 2400, 'highpass'),
        splash: () => {
            noise(420, 0.22, 0, 900)
            tone(320, 160, { to: 140, gain: 0.08 })
        },
        plop: () => tone(520, 120, { to: 260, gain: 0.12 }),
        bite: () => {
            tone(300, 80, { wave: 'square', gain: 0.06 })
            tone(300, 80, { wave: 'square', gain: 0.06, delay: 140 })
        },
        ping: () => tone(1320, 260, { gain: 0.08, to: 1100 }),
        catchFish: () => {
            noise(300, 0.16, 0, 1400)
            ;[523, 659, 784].forEach((f, i) => tone(f, 160, { wave: 'triangle', gain: 0.12, delay: 120 + i * 100 }))
        },
        cheer: () => [784, 988, 1175].forEach((f, i) => tone(f, 120, { wave: 'triangle', gain: 0.08, delay: i * 80 })),
        forward: () => {
            tone(220, 1600, { to: 880, gain: 0.08, wave: 'triangle' })
            noise(1600, 0.05, 0, 600)
        },
        backward: () => {
            tone(880, 1600, { to: 220, gain: 0.08, wave: 'triangle' })
            noise(1600, 0.05, 0, 600)
        },
        tick: () => tone(1046, 50, { gain: 0.05 }),
        wake: () => tone(440, 220, { to: 660, gain: 0.08 }),
        miss: () => tone(330, 380, { to: 180, gain: 0.1, wave: 'triangle' }),
        lose: () => {
            tone(392, 220, { wave: 'triangle', gain: 0.12 })
            tone(311, 420, { wave: 'triangle', gain: 0.12, delay: 220 })
        },
        win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 200, { wave: 'triangle', gain: 0.13, delay: i * 110 })),
        horn: () => {
            tone(196, 700, { wave: 'sawtooth', gain: 0.05, to: 220 })
            tone(392, 700, { wave: 'triangle', gain: 0.06, to: 440 })
        },
        voice: () => [440, 523, 440].forEach((f, i) => tone(f, 160, { wave: 'triangle', gain: 0.08, delay: i * 150 })),
        ring: () => {
            ;[0, 90, 180].forEach(d => tone(1480, 70, { wave: 'square', gain: 0.035, delay: d }))
        },
        send: () => tone(660, 220, { to: 1320, gain: 0.08 }),
        grow: () => tone(392, 420, { to: 784, gain: 0.08, wave: 'triangle' }),
        setMuted(on) {
            muted = on
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
        },
    }
}
