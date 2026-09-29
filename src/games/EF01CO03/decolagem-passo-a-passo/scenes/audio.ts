type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tap(): void
    snap(slot: number): void
    boing(): void
    count(n: number): void
    whoosh(): void
    sfx(scene: string): void
    swap(): void
    fanfare(): void
    win(): void
    lose(): void
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

let current: Audio | undefined

export const sound = (): Audio | undefined => current

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

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.detune) osc.detune.setValueAtTime(o.detune, at)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + delay
        const frames = Math.floor(audio.sampleRate * dur)
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = audio.createBufferSource()
        src.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.setValueAtTime(freq, at)
        band.Q.value = 1.4
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.01)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    const audio: Audio = {
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        snap(slot) {
            noise(0.05, 1800, 0.08)
            fat(523 * Math.pow(2, (slot * 4) / 12), 0.2, { wave: 'triangle', gain: 0.09, delay: 0.03 })
        },
        boing() {
            tone(220, 0.32, { wave: 'sine', gain: 0.09, to: 520 })
            tone(520, 0.2, { wave: 'sine', gain: 0.05, delay: 0.18, to: 300 })
        },
        count(n) {
            if (n > 0) tone(660, 0.14, { wave: 'square', gain: 0.04 })
            else fat(988, 0.5, { wave: 'triangle', gain: 0.09 })
        },
        whoosh() {
            noise(1.2, 500, 0.08)
            noise(1, 1400, 0.05, 0.2)
            tone(160, 1.1, { wave: 'sawtooth', gain: 0.03, to: 640 })
        },
        sfx(scene) {
            if (scene === 'door-hose' || scene === 'kite-away') {
                noise(0.25, 2600, 0.07)
                tone(900, 0.2, { wave: 'sine', gain: 0.04, to: 1300 })
            } else if (scene === 'cough-empty' || scene === 'smoke-door') {
                noise(0.12, 400, 0.1)
                noise(0.14, 350, 0.09, 0.22)
            } else if (scene === 'bonk') {
                tone(700, 0.08, { wave: 'square', gain: 0.05 })
                tone(1200, 0.25, { wave: 'sine', gain: 0.04, delay: 0.06, to: 1600 })
            } else if (scene === 'kite-spin') {
                tone(500, 0.7, { wave: 'triangle', gain: 0.05, to: 180 })
            } else if (scene === 'fly-alone') {
                tone(400, 0.6, { wave: 'triangle', gain: 0.05, to: 800 })
            } else {
                tone(180, 0.14, { wave: 'triangle', gain: 0.1, to: 90 })
                noise(0.08, 300, 0.06, 0.02)
            }
        },
        swap() {
            tone(420, 0.3, { wave: 'sine', gain: 0.06, to: 840 })
            tone(840, 0.3, { wave: 'sine', gain: 0.05, delay: 0.25, to: 420 })
        },
        fanfare() {
            ;[659, 784, 1047].forEach((f, i) => fat(f, 0.2, { wave: 'triangle', gain: 0.09, delay: i * 0.1 }))
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
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            if (current === audio) current = undefined
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
    current = audio
    return audio
}
