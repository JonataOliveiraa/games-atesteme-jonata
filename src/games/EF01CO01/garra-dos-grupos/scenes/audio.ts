type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    rail(on: boolean): void
    tap(): void
    clac(): void
    plim(step: number): void
    empty(): void
    whoosh(): void
    lose(): void
    fanfare(): void
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
    let hum: { osc: OscillatorNode; lfo: OscillatorNode; vol: GainNode } | undefined

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

    const stopHum = () => {
        if (!hum || !ctx) return
        const at = ctx.currentTime
        hum.vol.gain.cancelScheduledValues(at)
        hum.vol.gain.setTargetAtTime(0.0001, at, 0.08)
        hum.osc.stop(at + 0.4)
        hum.lfo.stop(at + 0.4)
        hum = undefined
    }

    return {
        rail(on) {
            if (!on) return stopHum()
            if (hum) return
            const audio = get()
            if (!audio || !bus) return
            const osc = audio.createOscillator()
            const lfo = audio.createOscillator()
            const depth = audio.createGain()
            const vol = audio.createGain()
            osc.type = 'triangle'
            osc.frequency.value = 92
            lfo.frequency.value = 5
            depth.gain.value = 6
            lfo.connect(depth).connect(osc.frequency)
            vol.gain.setValueAtTime(0.0001, audio.currentTime)
            vol.gain.setTargetAtTime(0.022, audio.currentTime, 0.15)
            osc.connect(vol).connect(bus)
            osc.start()
            lfo.start()
            hum = { osc, lfo, vol }
        },
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        clac() {
            noise(0.06, 2200, 0.09)
            tone(420, 0.08, { wave: 'square', gain: 0.04, to: 300 })
        },
        plim(step) {
            const f = 784 * Math.pow(2, (step * 2) / 12)
            fat(f, 0.22, { wave: 'triangle', gain: 0.09 })
            tone(f * 2, 0.16, { wave: 'sine', gain: 0.04, delay: 0.05 })
        },
        empty() {
            tone(330, 0.12, { wave: 'sine', gain: 0.05, to: 280 })
        },
        whoosh() {
            noise(0.5, 900, 0.07)
            noise(0.4, 1800, 0.04, 0.08)
            tone(300, 0.45, { wave: 'sine', gain: 0.04, to: 620 })
        },
        lose() {
            tone(440, 0.22, { wave: 'triangle', gain: 0.08, to: 392 })
            tone(349, 0.26, { wave: 'triangle', gain: 0.08, delay: 0.2, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.07, delay: 0.42, to: 233 })
        },
        fanfare() {
            ;[659, 784, 1047].forEach((f, i) => fat(f, 0.2, { wave: 'triangle', gain: 0.09, delay: i * 0.1 }))
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
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
