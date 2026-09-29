type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    burner(on: boolean): void
    wind(on: boolean): void
    ring(index: number): void
    blow(): void
    unlock(): void
    deliver(): void
    stamp(): void
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

interface Loop {
    src: AudioBufferSourceNode
    vol: GainNode
}

const SCALE = [523, 587, 659, 784, 880, 1047]

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let burnerLoop: Loop | undefined
    let windLoop: Loop | undefined
    let windWanted = false

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
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + delay
        const src = audio.createBufferSource()
        src.buffer = noiseBuffer(audio, dur)
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.setValueAtTime(freq, at)
        band.Q.value = q
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

    const startLoop = (freq: number, q: number, gain: number, rise: number): Loop | undefined => {
        const audio = get()
        if (!audio || !bus) return undefined
        const src = audio.createBufferSource()
        src.buffer = noiseBuffer(audio, 2)
        src.loop = true
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = freq
        band.Q.value = q
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, audio.currentTime)
        vol.gain.setTargetAtTime(gain, audio.currentTime, rise)
        src.connect(band).connect(vol).connect(bus)
        src.start()
        return { src, vol }
    }

    const stopLoop = (loop: Loop | undefined, fall: number) => {
        if (!loop || !ctx) return
        const at = ctx.currentTime
        loop.vol.gain.cancelScheduledValues(at)
        loop.vol.gain.setTargetAtTime(0.0001, at, fall)
        loop.src.stop(at + fall * 6)
    }

    return {
        burner(on) {
            if (on) {
                if (burnerLoop) return
                burnerLoop = startLoop(1600, 0.8, 0.07, 0.03)
                return
            }
            stopLoop(burnerLoop, 0.05)
            burnerLoop = undefined
        },
        wind(on) {
            windWanted = on
            if (on) {
                if (windLoop) return
                windLoop = startLoop(420, 0.6, 0.025, 0.4)
                return
            }
            stopLoop(windLoop, 0.3)
            windLoop = undefined
        },
        ring(index) {
            const f = SCALE[Math.min(SCALE.length - 1, index)]
            noise(0.25, 1200, 0.05)
            fat(f, 0.22, { wave: 'triangle', gain: 0.09, delay: 0.04 })
            tone(f * 2, 0.16, { wave: 'sine', gain: 0.04, delay: 0.1 })
        },
        blow() {
            tone(300, 0.14, { wave: 'sine', gain: 0.08, to: 220 })
            noise(0.9, 700, 0.1, 0.08, 0.7)
        },
        unlock() {
            noise(0.05, 2400, 0.08)
            tone(1047, 0.2, { wave: 'triangle', gain: 0.07, delay: 0.06 })
        },
        deliver() {
            ;[659, 784, 1047].forEach((f, i) => fat(f, 0.2, { wave: 'triangle', gain: 0.09, delay: i * 0.1 }))
        },
        stamp() {
            tone(140, 0.16, { wave: 'sine', gain: 0.14, to: 90 })
            noise(0.08, 500, 0.08)
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
            if (on) {
                stopLoop(burnerLoop, 0.02)
                burnerLoop = undefined
                stopLoop(windLoop, 0.02)
                windLoop = undefined
            } else if (windWanted) {
                windLoop = startLoop(420, 0.6, 0.025, 0.4)
            }
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            stopLoop(burnerLoop, 0.02)
            stopLoop(windLoop, 0.02)
            burnerLoop = undefined
            windLoop = undefined
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
