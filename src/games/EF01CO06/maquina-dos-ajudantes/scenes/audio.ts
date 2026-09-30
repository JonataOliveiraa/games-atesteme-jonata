type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    coin(): void
    whirr(): void
    toc(): void
    pof(): void
    ring(): void
    lullaby(): void
    dance(): void
    phoneRing(): void
    boing(): void
    fiu(): void
    plim(): void
    bell(): void
    fomfom(): void
    snore(): void
    cry(): void
    nod(): void
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
        coin() {
            tone(1319, 0.12, { wave: 'triangle', gain: 0.08, attack: 0.004 })
            tone(1976, 0.26, { wave: 'sine', gain: 0.06, delay: 0.06 })
        },
        whirr() {
            for (let i = 0; i < 12; i++) noise(0.035, 700 + (i % 2) * 180, 0.045, i * 0.04, 2.5)
            tone(110, 0.5, { wave: 'triangle', gain: 0.04, to: 160 })
        },
        toc() {
            tone(520, 0.08, { wave: 'sine', gain: 0.12, to: 300, attack: 0.003 })
            tone(470, 0.08, { wave: 'sine', gain: 0.09, to: 280, attack: 0.003, delay: 0.14 })
            noise(0.04, 1800, 0.03, 0, 2)
        },
        pof() {
            noise(0.18, 2200, 0.14, 0, 0.8, 'lowpass', 400)
            tone(240, 0.14, { wave: 'sine', gain: 0.12, to: 90, attack: 0.003 })
            ;[0.08, 0.13, 0.19].forEach((d, i) => tone(1200 + i * 300, 0.05, { wave: 'sine', gain: 0.03, delay: d }))
        },
        ring() {
            for (let i = 0; i < 22; i++) {
                tone(i % 2 ? 1760 : 1568, 0.04, { wave: 'triangle', gain: 0.045, delay: i * 0.045, attack: 0.003 })
            }
            noise(1, 3000, 0.012, 0, 4)
        },
        lullaby() {
            ;[659, 587, 523, 392].forEach((f, i) => {
                tone(f, 0.7, { wave: 'sine', gain: 0.07, delay: i * 0.5, attack: 0.08 })
                tone(f / 2, 0.7, { wave: 'sine', gain: 0.025, delay: i * 0.5, attack: 0.1 })
            })
        },
        dance() {
            const notes = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 1047, 784]
            notes.forEach((f, i) => fat(f, 0.14, { wave: 'triangle', gain: 0.06, delay: i * 0.16 }))
            for (let i = 0; i < 6; i++) tone(130, 0.12, { wave: 'sine', gain: 0.1, to: 60, attack: 0.004, delay: i * 0.32 })
        },
        phoneRing() {
            ;[0, 0.65].forEach(start => {
                for (let i = 0; i < 10; i++) {
                    tone(i % 2 ? 1320 : 1100, 0.035, { wave: 'triangle', gain: 0.04, delay: start + i * 0.04, attack: 0.003 })
                }
            })
        },
        boing() {
            tone(220, 0.32, { wave: 'sine', gain: 0.12, to: 660, attack: 0.005 })
            tone(330, 0.2, { wave: 'triangle', gain: 0.04, to: 880, delay: 0.04 })
        },
        fiu() {
            tone(500, 0.42, { wave: 'sine', gain: 0.05, to: 1300 })
            noise(0.4, 900, 0.03, 0, 1.6, 'bandpass', 2600)
        },
        plim() {
            fat(1047, 0.22, { wave: 'triangle', gain: 0.08 })
            tone(1568, 0.3, { wave: 'sine', gain: 0.05, delay: 0.07 })
        },
        bell() {
            ;[1568, 2093].forEach((f, i) => {
                tone(f, 0.7, { wave: 'sine', gain: 0.07, delay: i * 0.12, attack: 0.004 })
                tone(f * 2.76, 0.3, { wave: 'sine', gain: 0.015, delay: i * 0.12, attack: 0.004 })
            })
        },
        fomfom() {
            tone(233, 0.28, { wave: 'triangle', gain: 0.1, to: 220, attack: 0.03 })
            tone(175, 0.5, { wave: 'triangle', gain: 0.1, delay: 0.3, to: 156, attack: 0.03 })
            tone(117, 0.5, { wave: 'sine', gain: 0.05, delay: 0.3, to: 104, attack: 0.03 })
        },
        snore() {
            noise(0.55, 220, 0.09, 0, 3, 'bandpass', 160)
            tone(90, 0.55, { wave: 'triangle', gain: 0.04, to: 70, attack: 0.15 })
            tone(700, 0.35, { wave: 'sine', gain: 0.025, to: 1100, delay: 0.62 })
        },
        cry() {
            ;[0, 0.36].forEach((d, i) => tone(740 - i * 60, 0.3, { wave: 'triangle', gain: 0.05, to: 560 - i * 40, delay: d, attack: 0.04 }))
            tone(620, 0.4, { wave: 'sine', gain: 0.04, to: 440, delay: 0.72, attack: 0.05 })
        },
        nod() {
            tone(380, 0.07, { wave: 'sine', gain: 0.08, to: 300, attack: 0.004 })
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
