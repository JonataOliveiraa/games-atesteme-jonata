type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

/** Sons sintetizados na hora: nenhum arquivo de áudio, nenhuma narração. */
export interface Audio {
    grab(): void
    click(): void
    pop(): void
    zap(): void
    blip(): void
    think(): void
    type(): void
    shutter(): void
    voice(): void
    gulp(): void
    melody(): void
    wake(): void
    good(): void
    /** Uma nota por palavra do resumo, cada uma mais aguda. */
    step(index: number): void
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
        grab() {
            tone(420, 80, { wave: 'triangle', gain: 0.08, to: 560 })
        },
        click() {
            noise(40, 0.25, 0, 2500)
            tone(1200, 60, { wave: 'square', gain: 0.05, to: 700 })
        },
        pop() {
            tone(620, 90, { wave: 'sine', gain: 0.1, to: 980 })
        },
        zap() {
            noise(260, 0.12, 0, 3200)
            tone(220, 260, { wave: 'sawtooth', gain: 0.05, to: 90 })
        },
        blip() {
            tone(880, 60, { wave: 'sine', gain: 0.06, to: 1320 })
        },
        think() {
            notes([660, 880, 740, 990], 70, { wave: 'square', gain: 0.035 })
        },
        type() {
            for (let i = 0; i < 4; i++) noise(30, 0.18, i * 110, 3000)
        },
        shutter() {
            noise(70, 0.25, 0, 1500)
            noise(60, 0.2, 90, 2400)
        },
        voice() {
            tone(220, 500, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(330, 400, { wave: 'triangle', gain: 0.06, delay: 200, to: 260 })
        },
        gulp() {
            tone(300, 160, { wave: 'sine', gain: 0.16, to: 120 })
            tone(180, 120, { wave: 'sine', gain: 0.1, delay: 140, to: 90 })
        },
        melody() {
            notes([523, 659, 784, 659, 880, 784, 1047], 170, { wave: 'triangle', gain: 0.11 })
        },
        wake() {
            notes([392, 523, 784], 90, { wave: 'sine', gain: 0.1 })
        },
        good() {
            notes([523, 659, 784], 90, { wave: 'triangle', gain: 0.1 })
        },
        step(index) {
            const scale = [523, 659, 784, 1047, 1319]
            tone(scale[Math.min(index, scale.length - 1)], 160, { wave: 'triangle', gain: 0.1 })
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
