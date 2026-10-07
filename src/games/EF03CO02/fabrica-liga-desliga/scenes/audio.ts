type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    click(on: boolean): void
    hum(on: boolean): void
    spark(): void
    whistle(): void
    swap(): void
    ignite(): void
    douse(): void
    plop(): void
    bake(): void
    stopOk(): void
    jam(): void
    fail(): void
    lose(): void
    pop(i: number): void
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
    detune?: number
}

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let drone: { osc: OscillatorNode; vol: GainNode } | undefined

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

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    const stopDrone = () => {
        if (!drone || !ctx) return
        const at = ctx.currentTime
        drone.vol.gain.cancelScheduledValues(at)
        drone.vol.gain.setTargetAtTime(0.0001, at, 0.05)
        drone.osc.stop(at + 0.3)
        drone = undefined
    }

    return {
        click(on) {
            noise(0.04, on ? 2600 : 1800, 0.12, 0, 4)
            tone(on ? 660 : 440, 0.07, { wave: 'square', gain: 0.03 })
        },
        hum(on) {
            if (!on) {
                stopDrone()
                return
            }
            const audio = get()
            if (!audio || !bus || drone) return
            const osc = audio.createOscillator()
            const vol = audio.createGain()
            const lp = audio.createBiquadFilter()
            osc.type = 'sawtooth'
            osc.frequency.value = 62
            lp.type = 'lowpass'
            lp.frequency.value = 260
            vol.gain.setValueAtTime(0.0001, audio.currentTime)
            vol.gain.setTargetAtTime(0.028, audio.currentTime, 0.08)
            osc.connect(lp).connect(vol).connect(bus)
            osc.start()
            drone = { osc, vol }
        },
        spark() {
            noise(0.25, 5200, 0.05, 0, 2, 'highpass')
            tone(1760, 0.12, { wave: 'triangle', gain: 0.04, delay: 0.05 })
        },
        whistle() {
            fat(2350, 0.5, { wave: 'square', gain: 0.025, detune: 40 })
            noise(0.5, 3200, 0.04, 0, 3)
        },
        swap() {
            ;[0, 0.12].forEach((d, i) => tone(i ? 880 : 660, 0.1, { wave: 'triangle', gain: 0.06, delay: d }))
        },
        ignite() {
            noise(0.45, 400, 0.12, 0, 0.8, 'lowpass', 1400)
        },
        douse() {
            noise(0.4, 1600, 0.07, 0, 0.8, 'lowpass', 300)
        },
        plop() {
            tone(220, 0.12, { wave: 'sine', gain: 0.1, to: 120, attack: 0.004 })
        },
        bake() {
            tone(1047, 0.12, { wave: 'triangle', gain: 0.05 })
        },
        stopOk() {
            fat(784, 0.14, { wave: 'triangle', gain: 0.07 })
            fat(1175, 0.2, { wave: 'triangle', gain: 0.06, delay: 0.1 })
        },
        jam() {
            stopDrone()
            ;[0, 0.16].forEach(d => tone(110, 0.12, { wave: 'square', gain: 0.05, delay: d, to: 80 }))
        },
        fail() {
            tone(392, 0.2, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(294, 0.35, { wave: 'triangle', gain: 0.07, delay: 0.2, to: 262 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
        },
        pop(i) {
            tone(660 + (i % 6) * 90, 0.1, { wave: 'triangle', gain: 0.06 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        setMuted(on) {
            muted = on
            if (on) stopDrone()
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            stopDrone()
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
