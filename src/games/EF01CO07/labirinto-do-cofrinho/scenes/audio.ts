type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    step(): void
    hum(on: boolean): void
    pull(): void
    plim(): void
    bell(): void
    hug(): void
    show(): void
    whoosh(): void
    clac(): void
    fanfare(): void
    fail(): void
    yawn(): void
    win(): void
    tap(): void
    nope(): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
    attack?: number
    detune?: number
}

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let humming: { osc: OscillatorNode; vol: GainNode } | null = null

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            const master = ctx.createGain()
            master.gain.value = 0.85
            master.connect(ctx.destination)
            bus = master
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const noiseBuffer = (audio: AudioContext, seconds: number) => {
        const frames = Math.max(1, Math.floor(audio.sampleRate * seconds))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        return buffer
    }

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.detune) osc.detune.setValueAtTime(o.detune, at)
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
        const src = audio.createBufferSource()
        src.buffer = noiseBuffer(audio, dur)
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

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    const stopHum = () => {
        if (!humming || !ctx) return
        const at = ctx.currentTime
        humming.vol.gain.cancelScheduledValues(at)
        humming.vol.gain.setValueAtTime(Math.max(0.0001, humming.vol.gain.value), at)
        humming.vol.gain.exponentialRampToValueAtTime(0.0001, at + 0.12)
        humming.osc.stop(at + 0.15)
        humming = null
    }

    return {
        step() {
            noise(0.05, 2400 + Math.random() * 800, 0.035, 0, 1.2, 'bandpass')
        },
        hum(on) {
            if (!on) return stopHum()
            const audio = get()
            if (!audio || !bus || humming) return
            const at = audio.currentTime
            const osc = audio.createOscillator()
            const vol = audio.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(110, at)
            osc.frequency.linearRampToValueAtTime(220, at + 0.6)
            vol.gain.setValueAtTime(0.0001, at)
            vol.gain.exponentialRampToValueAtTime(0.06, at + 0.1)
            osc.connect(vol).connect(bus)
            osc.start(at)
            humming = { osc, vol }
        },
        pull() {
            tone(160, 0.5, { wave: 'sine', gain: 0.14, to: 520, attack: 0.02 })
            noise(0.4, 500, 0.05, 0, 1, 'lowpass', 2400)
        },
        plim() {
            fat(1047, 0.2, { wave: 'triangle', gain: 0.07 })
            tone(1568, 0.26, { wave: 'sine', gain: 0.04, delay: 0.06 })
        },
        bell() {
            ;[1319, 1760].forEach((f, i) => tone(f, 0.5, { wave: 'sine', gain: 0.06, delay: i * 0.14 }))
        },
        hug() {
            tone(523, 0.3, { wave: 'sine', gain: 0.07 })
            tone(659, 0.35, { wave: 'sine', gain: 0.06, delay: 0.12 })
        },
        show() {
            ;[784, 988, 1175].forEach((f, i) => tone(f, 0.18, { wave: 'triangle', gain: 0.05, delay: i * 0.08 }))
        },
        whoosh() {
            noise(0.3, 700, 0.06, 0, 2, 'bandpass', 2600)
        },
        clac() {
            tone(220, 0.12, { wave: 'square', gain: 0.05, to: 110, attack: 0.003 })
            noise(0.08, 1800, 0.1, 0, 2)
        },
        fanfare() {
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.09, delay: i * 0.11 }))
        },
        fail() {
            tone(392, 0.26, { wave: 'triangle', gain: 0.08, to: 350 })
            tone(294, 0.4, { wave: 'triangle', gain: 0.07, delay: 0.24, to: 262 })
        },
        yawn() {
            tone(330, 0.7, { wave: 'sine', gain: 0.06, to: 180, attack: 0.15 })
        },
        win() {
            ;[523, 659, 784].forEach(f => fat(f, 0.9, { wave: 'triangle', gain: 0.06 }))
            fat(1047, 0.9, { wave: 'triangle', gain: 0.05, delay: 0.1 })
        },
        nope() {
            tone(392, 0.12, { wave: 'triangle', gain: 0.06 })
            tone(330, 0.16, { wave: 'triangle', gain: 0.06, delay: 0.14 })
        },
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        setMuted(on) {
            muted = on
            if (on) stopHum()
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            stopHum()
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
