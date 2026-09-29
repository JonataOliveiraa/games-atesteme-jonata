type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    drum(): void
    cast(): void
    plop(): void
    blup(): void
    reel(): void
    splash(): void
    plim(): void
    fail(): void
    win(): void
    lose(): void
    tap(): void
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

type Filter = 'bandpass' | 'lowpass' | 'highpass'

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

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

    return {
        drum() {
            tone(150, 0.32, { wave: 'sine', gain: 0.32, to: 55, attack: 0.004 })
            tone(75, 0.22, { wave: 'triangle', gain: 0.1, to: 45, attack: 0.004 })
            noise(0.05, 900, 0.07, 0, 0.9, 'lowpass')
        },
        cast() {
            noise(0.28, 900, 0.06, 0, 2.2, 'bandpass', 3200)
            tone(700, 0.22, { wave: 'sine', gain: 0.03, to: 1400 })
        },
        plop() {
            tone(420, 0.14, { wave: 'sine', gain: 0.12, to: 140, attack: 0.004 })
            noise(0.1, 600, 0.04, 0.02, 1)
        },
        blup() {
            ;[0, 0.09, 0.2].forEach((d, i) => tone(260 + i * 90, 0.08, { wave: 'sine', gain: 0.07, to: 520 + i * 160, delay: d, attack: 0.005 }))
        },
        reel() {
            for (let i = 0; i < 14; i++) noise(0.025, 2600 + (i % 2) * 400, 0.05, i * 0.042, 3)
            tone(180, 0.6, { wave: 'triangle', gain: 0.02, to: 240 })
        },
        splash() {
            noise(0.45, 1400, 0.12, 0, 0.6, 'lowpass', 300)
            tone(300, 0.16, { wave: 'sine', gain: 0.08, to: 120, attack: 0.004 })
            ;[0.12, 0.2].forEach((d) => tone(700, 0.06, { wave: 'sine', gain: 0.04, to: 1100, delay: d }))
        },
        plim() {
            fat(1047, 0.22, { wave: 'triangle', gain: 0.08 })
            tone(1568, 0.3, { wave: 'sine', gain: 0.05, delay: 0.07 })
        },
        fail() {
            tone(392, 0.2, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(294, 0.35, { wave: 'triangle', gain: 0.07, delay: 0.2, to: 262 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        lose() {
            tone(440, 0.22, { wave: 'triangle', gain: 0.08, to: 392 })
            tone(349, 0.26, { wave: 'triangle', gain: 0.08, delay: 0.2, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.07, delay: 0.42, to: 233 })
        },
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
