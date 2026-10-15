type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    /** o motor em loop; 0 parado … 1 embalado */
    engine(on: boolean): void
    engineSpeed(speed: number): void
    /** 1 agudo, 0 grave */
    bit(bit: '0' | '1'): void
    choose(): void
    brake(): void
    plug(): void
    tic(): void
    appear(): void
    cheer(): void
    whoosh(): void
    pop(i: number): void
    noise(): void
    blom(): void
    fail(): void
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
    attack?: number
}

const ENGINE_URL = Object.values(
    import.meta.glob('../../../../assets/games/EF04CO04/corrida-no-cabo/car1.mp3', { eager: true, import: 'default' }) as Record<string, string>,
)[0]
const ENGINE_LEVEL = 0.3
const MASTER = 0.85

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let buffer: AudioBuffer | undefined
    let loading: Promise<void> | undefined
    let voice: { src: AudioBufferSourceNode; gain: GainNode } | undefined
    let wanted = false
    let speed = 0

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            const master = ctx.createGain()
            master.gain.value = MASTER
            master.connect(ctx.destination)
            bus = master
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const applyVoice = (audio: AudioContext, smooth = 0.08) => {
        if (!voice) return
        voice.gain.gain.setTargetAtTime(ENGINE_LEVEL * (0.35 + 0.65 * speed), audio.currentTime, smooth)
        voice.src.playbackRate.setTargetAtTime(0.75 + 0.5 * speed, audio.currentTime, smooth)
    }

    const startVoice = (audio: AudioContext) => {
        if (!buffer || !bus || voice) return
        const src = audio.createBufferSource()
        src.buffer = buffer
        src.loop = true
        const gain = audio.createGain()
        gain.gain.value = 0
        src.connect(gain).connect(bus)
        src.start(audio.currentTime, Math.random() * buffer.duration)
        voice = { src, gain }
        applyVoice(audio, 0.15)
    }

    const stopVoice = (audio: AudioContext) => {
        if (!voice) return
        const { src, gain } = voice
        voice = undefined
        gain.gain.setTargetAtTime(0, audio.currentTime, 0.12)
        src.stop(audio.currentTime + 0.6)
    }

    const load = (audio: AudioContext) => {
        if (loading || !ENGINE_URL) return loading
        loading = fetch(ENGINE_URL)
            .then(res => res.arrayBuffer())
            .then(data => audio.decodeAudioData(data))
            .then(decoded => {
                buffer = decoded
                if (wanted && ctx) startVoice(ctx)
            })
            .catch(() => undefined)
        return loading
    }

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4, type: Filter = 'bandpass', to?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + delay
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buf = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = audio.createBufferSource()
        src.buffer = buf
        const band = audio.createBiquadFilter()
        band.type = type
        band.frequency.setValueAtTime(freq, at)
        if (to) band.frequency.exponentialRampToValueAtTime(to, at + dur)
        band.Q.value = q
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.008)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    return {
        engine(on) {
            wanted = on
            const audio = get()
            if (!audio) return
            if (!on) return stopVoice(audio)
            if (buffer) startVoice(audio)
            else void load(audio)
        },
        engineSpeed(v) {
            speed = clamp01(v)
            if (ctx) applyVoice(ctx)
        },
        bit(bit) {
            if (bit === '1') {
                tone(1047, 0.12, { wave: 'square', gain: 0.045 })
                tone(1568, 0.14, { wave: 'triangle', gain: 0.05, delay: 0.06 })
            } else {
                tone(262, 0.16, { wave: 'square', gain: 0.05 })
                tone(196, 0.18, { wave: 'triangle', gain: 0.07, delay: 0.06 })
            }
        },
        choose() {
            tone(880, 0.05, { wave: 'triangle', gain: 0.04 })
        },
        brake() {
            noise(0.22, 2600, 0.035, 0, 4, 'bandpass', 1800)
        },
        plug() {
            noise(0.08, 900, 0.14, 0, 1.2, 'lowpass')
            tone(520, 0.08, { wave: 'square', gain: 0.04, delay: 0.04 })
            tone(780, 0.1, { wave: 'square', gain: 0.035, delay: 0.1 })
        },
        tic() {
            tone(1400, 0.05, { wave: 'triangle', gain: 0.05 })
        },
        appear() {
            ;[784, 988, 1319].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.06, delay: i * 0.07 }))
        },
        cheer() {
            ;[659, 784, 1047].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.07, delay: i * 0.09 }))
        },
        whoosh() {
            noise(0.5, 2200, 0.06, 0, 0.9, 'bandpass', 500)
            tone(620, 0.4, { wave: 'triangle', gain: 0.03, to: 280 })
        },
        pop(i) {
            tone(660 + (i % 6) * 90, 0.1, { wave: 'triangle', gain: 0.06 })
        },
        noise() {
            noise(0.7, 3000, 0.06, 0, 0.5, 'highpass')
        },
        blom() {
            tone(130, 0.3, { wave: 'sine', gain: 0.12, to: 90 })
        },
        fail() {
            tone(392, 0.2, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(294, 0.35, { wave: 'triangle', gain: 0.07, delay: 0.2, to: 262 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            tone(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : MASTER
        },
        destroy() {
            if (ctx) stopVoice(ctx)
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
