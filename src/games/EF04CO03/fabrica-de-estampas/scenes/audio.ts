type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    /** o carimbo bate no tecido */
    tum(): void
    /** o carimbo molha na almofada */
    plic(): void
    /** a esteira anda um quadradinho */
    belt(): void
    /** a agulha costura a emenda */
    zip(): void
    /** um botão costurado na aba */
    plim(): void
    /** os botões de dentro saltando fora */
    pops(): void
    /** o tecido enrolando ou desenrolando */
    roll(): void
    bell(): void
    /** a contagem no varal: uma nota subindo por figura */
    note(i: number): void
    paper(): void
    tap(): void
    cheer(): void
    blom(): void
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

const SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319]

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
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = audio.createBufferSource()
        src.buffer = buffer
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
        tum() {
            noise(0.08, 320, 0.2, 0, 1, 'lowpass')
            tone(150, 0.16, { wave: 'sine', gain: 0.16, to: 90 })
            noise(0.06, 2400, 0.04, 0.03, 2)
        },
        plic() {
            tone(900, 0.07, { wave: 'sine', gain: 0.05, to: 1500 })
        },
        belt() {
            noise(0.3, 260, 0.05, 0, 0.8, 'lowpass', 180)
            ;[0, 0.1, 0.2].forEach(d => tone(110, 0.05, { wave: 'triangle', gain: 0.03, delay: d }))
        },
        zip() {
            noise(0.28, 2600, 0.05, 0, 3, 'bandpass', 4200)
        },
        plim() {
            tone(1319, 0.18, { wave: 'triangle', gain: 0.07 })
            tone(1760, 0.24, { wave: 'triangle', gain: 0.05, delay: 0.07 })
        },
        pops() {
            ;[0, 0.07, 0.14].forEach((d, i) => tone(700 + i * 120, 0.08, { wave: 'triangle', gain: 0.05, delay: d }))
        },
        roll() {
            noise(0.5, 600, 0.07, 0, 0.9, 'bandpass', 1800)
        },
        bell() {
            tone(1568, 0.6, { wave: 'sine', gain: 0.07 })
            tone(2093, 0.5, { wave: 'sine', gain: 0.04, delay: 0.02 })
        },
        note(i) {
            tone(SCALE[i % SCALE.length], 0.16, { wave: 'triangle', gain: 0.08 })
        },
        paper() {
            noise(0.18, 1600, 0.05, 0, 1.2, 'bandpass', 900)
        },
        tap() {
            tone(660, 0.06, { wave: 'triangle', gain: 0.05 })
        },
        cheer() {
            ;[659, 784, 1047].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.07, delay: i * 0.09 }))
        },
        blom() {
            tone(130, 0.32, { wave: 'sine', gain: 0.12, to: 90 })
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
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
