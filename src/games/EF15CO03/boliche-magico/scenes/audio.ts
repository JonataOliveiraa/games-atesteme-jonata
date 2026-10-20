type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    roll(ms: number): void
    knock(): void
    hop(): void
    land(): void
    yes(): void
    no(): void
    flip(): void
    pick(): void
    unpick(): void
    play(): void
    drop(): void
    pit(): void
    sweep(): void
    snore(): void
    dizzy(): void
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

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1800, type: BiquadFilterType = 'highpass') => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
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
        roll(ms) {
            const audio = get()
            if (!audio || !bus) return
            const length = Math.floor((audio.sampleRate * ms) / 1000)
            const buffer = audio.createBuffer(1, length, audio.sampleRate)
            const data = buffer.getChannelData(0)
            for (let i = 0; i < length; i++) {
                const env = Math.min(1, i / 2000, (length - i) / 2000)
                data[i] = (Math.random() * 2 - 1) * env
            }
            const src = audio.createBufferSource()
            src.buffer = buffer
            const filter = audio.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.value = 260
            const gain = audio.createGain()
            gain.gain.value = 0.32
            src.connect(filter)
            filter.connect(gain)
            gain.connect(bus)
            src.start()
        },
        knock() {
            noise(140, 0.22, 0, 900)
            tone(520, 90, { wave: 'triangle', gain: 0.1, to: 380 })
            tone(760, 80, { wave: 'triangle', gain: 0.07, delay: 60, to: 560 })
        },
        hop() {
            tone(300, 260, { wave: 'sine', gain: 0.1, to: 760 })
        },
        land() {
            tone(200, 110, { wave: 'triangle', gain: 0.12, to: 130 })
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
        pick() {
            tone(620, 90, { wave: 'sine', gain: 0.1, to: 900 })
        },
        unpick() {
            tone(700, 90, { wave: 'sine', gain: 0.08, to: 480 })
        },
        play() {
            notes([392, 523], 90, { wave: 'triangle', gain: 0.11 })
        },
        drop() {
            tone(500, 120, { wave: 'sine', gain: 0.07, to: 300 })
        },
        pit() {
            tone(180, 260, { wave: 'sine', gain: 0.12, to: 70 })
            noise(160, 0.1, 80, 400, 'lowpass')
        },
        sweep() {
            noise(700, 0.06, 0, 1200)
        },
        snore() {
            tone(140, 420, { wave: 'sawtooth', gain: 0.03, to: 110 })
        },
        dizzy() {
            tone(700, 140, { wave: 'sine', gain: 0.08, to: 500 })
            tone(600, 140, { wave: 'sine', gain: 0.08, delay: 150, to: 420 })
            tone(500, 160, { wave: 'sine', gain: 0.07, delay: 300, to: 340 })
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
