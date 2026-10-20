type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    engine(speed: number): void
    brake(): void
    click(): void
    beam(): void
    wiper(): void
    horn(): void
    send(): void
    bark(): void
    speaker(): void
    radio(): void
    moo(): void
    gps(): void
    paper(): void
    stuck(): void
    tow(): void
    door(): void
    good(): void
    oops(): void
    lose(): void
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

type Clip = 'clique' | 'voo'

const CLIPS: Clip[] = ['clique', 'voo']

const FILES = Object.fromEntries(
    Object.entries(
        import.meta.glob('../../../../assets/games/EF05CO11/rota-da-madrugada/sons/*.mp3', { eager: true, import: 'default' }) as Record<string, string>,
    ).map(([path, url]) => [path.split('/').pop()?.replace(/.mp3$/i, '') ?? '', url]),
)

const LEVEL: Record<Clip, number> = { clique: 0.7, voo: 0.45 }

const FLIGHT_MS = 900

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let hum: { osc: OscillatorNode; gain: GainNode } | undefined
    let muted = false
    let loading = false
    const buffers: Partial<Record<Clip, AudioBuffer>> = {}

    const load = (audio: AudioContext) => {
        if (loading) return
        loading = true
        CLIPS.forEach(async clip => {
            const url = FILES[clip]
            if (!url) return
            try {
                const res = await fetch(url)
                buffers[clip] = await audio.decodeAudioData(await res.arrayBuffer())
            } catch {
                delete buffers[clip]
            }
        })
    }

    const play = (clip: Clip, ms?: number) => {
        const audio = get()
        const buffer = buffers[clip]
        if (!audio || !bus || !buffer) return false
        const src = audio.createBufferSource()
        src.buffer = buffer
        const gain = audio.createGain()
        gain.gain.value = LEVEL[clip]
        src.connect(gain).connect(bus)
        src.start()
        if (ms) {
            const end = audio.currentTime + ms / 1000
            gain.gain.setTargetAtTime(0, end - 0.15, 0.06)
            src.stop(end + 0.2)
        }
        return true
    }

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
            load(ctx)
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

    const stopHum = () => {
        if (!hum) return
        try {
            hum.osc.stop()
        } catch {
            hum.gain.disconnect()
        }
        hum = undefined
    }

    return {
        engine(speed) {
            const audio = get()
            if (!audio || !bus) {
                stopHum()
                return
            }
            if (!hum) {
                const osc = audio.createOscillator()
                const gain = audio.createGain()
                osc.type = 'triangle'
                gain.gain.value = 0
                osc.connect(gain)
                gain.connect(bus)
                osc.start()
                hum = { osc, gain }
            }
            const t = audio.currentTime
            hum.osc.frequency.setTargetAtTime(48 + speed * 60, t, 0.12)
            hum.gain.gain.setTargetAtTime(0.012 + speed * 0.022, t, 0.15)
        },
        brake() {
            noise(420, 0.05, 0, 1200, 'bandpass')
        },
        click() {
            if (!play('clique')) tone(900, 50, { wave: 'square', gain: 0.04, to: 700 })
        },
        beam() {
            tone(220, 260, { wave: 'sine', gain: 0.08, to: 660 })
            notes([784, 988], 70, { wave: 'triangle', gain: 0.06, delay: 120 })
        },
        wiper() {
            noise(260, 0.06, 0, 900, 'bandpass')
            noise(260, 0.05, 280, 700, 'bandpass')
        },
        horn() {
            tone(415, 360, { wave: 'square', gain: 0.07 })
            tone(523, 360, { wave: 'square', gain: 0.05 })
        },
        send() {
            notes([660, 880, 1175], 60, { wave: 'sine', gain: 0.06 })
            if (!play('voo', FLIGHT_MS)) noise(200, 0.03, 120, 2400, 'highpass')
        },
        bark() {
            tone(520, 110, { wave: 'sawtooth', gain: 0.05, to: 300 })
            tone(560, 110, { wave: 'sawtooth', gain: 0.05, to: 320, delay: 180 })
        },
        speaker() {
            notes([392, 523, 659], 140, { wave: 'square', gain: 0.07 })
            tone(196, 700, { wave: 'sawtooth', gain: 0.04 })
        },
        radio() {
            noise(260, 0.04, 0, 1600, 'bandpass')
            notes([1200, 1500], 80, { wave: 'square', gain: 0.04, delay: 280 })
        },
        moo() {
            tone(150, 620, { wave: 'sawtooth', gain: 0.06, to: 110 })
        },
        gps() {
            notes([880, 1320], 90, { wave: 'sine', gain: 0.07 })
        },
        paper() {
            noise(180, 0.05, 0, 3000, 'highpass')
            noise(140, 0.04, 200, 2600, 'highpass')
        },
        stuck() {
            tone(90, 900, { wave: 'sawtooth', gain: 0.05, to: 160 })
            noise(700, 0.04, 100, 500, 'lowpass')
        },
        tow() {
            tone(70, 1200, { wave: 'sawtooth', gain: 0.05, to: 110 })
        },
        door() {
            tone(180, 160, { wave: 'triangle', gain: 0.08, to: 120 })
            notes([660, 830], 90, { wave: 'sine', gain: 0.06, delay: 160 })
        },
        good() {
            notes([523, 659, 784], 90, { wave: 'triangle', gain: 0.1 })
        },
        oops() {
            tone(330, 260, { wave: 'triangle', gain: 0.09, to: 220 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        setMuted(on) {
            muted = on
            if (on) stopHum()
        },
        destroy() {
            stopHum()
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
