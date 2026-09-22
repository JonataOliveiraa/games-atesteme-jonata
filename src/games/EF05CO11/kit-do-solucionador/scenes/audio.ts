import type Phaser from 'phaser'

type Ctx = AudioContext & { __kit?: boolean }

/**
 * Tudo sintetizado, sem arquivo. O que separa um bip de um som de jogo é o
 * envelope e o filtro — ataque curto, queda exponencial, e ruído passa-banda
 * para o que é ar, madeira e metal.
 */
export interface Audio {
    tec(): void
    casa(indice: number): void
    resolveu(): void
    trava(): void
    motor(on: boolean): void
    pedal(): void
    passo(): void
    drone(on: boolean): void
    planta(): void
    sino(): void
    sol(): void
    moedas(): void
    fanfarra(): void
    setMuted(m: boolean): void
    destroy(): void
}

export function createAudio(scene: Phaser.Scene): Audio {
    let ctx: Ctx | null = null
    let muted = false
    let loopOsc: OscillatorNode | null = null
    let loopGain: GainNode | null = null

    const ac = (): Ctx | null => {
        if (muted) return null
        if (!ctx) {
            const Klass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            if (!Klass) return null
            ctx = new Klass() as Ctx
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (
        freq: number,
        dur: number,
        type: OscillatorType = 'sine',
        vol = 0.18,
        delay = 0,
    ) => {
        const a = ac()
        if (!a) return
        const t = a.currentTime + delay
        const osc = a.createOscillator()
        const gain = a.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
        osc.connect(gain).connect(a.destination)
        osc.start(t)
        osc.stop(t + dur + 0.05)
    }

    const noise = (freq: number, dur: number, vol = 0.14, q = 6, delay = 0) => {
        const a = ac()
        if (!a) return
        const t = a.currentTime + delay
        const frames = Math.floor(a.sampleRate * dur)
        const buffer = a.createBuffer(1, Math.max(1, frames), a.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = a.createBufferSource()
        src.buffer = buffer
        const filter = a.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(freq, t)
        filter.Q.value = q
        const gain = a.createGain()
        gain.gain.setValueAtTime(vol, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
        src.connect(filter).connect(gain).connect(a.destination)
        src.start(t)
    }

    const pararLoop = () => {
        if (!loopOsc) return
        try {
            loopGain?.gain.setTargetAtTime(0.0001, (ctx?.currentTime ?? 0), 0.05)
            loopOsc.stop((ctx?.currentTime ?? 0) + 0.2)
        } catch {
            /* o contexto já pode ter ido embora */
        }
        loopOsc = null
        loopGain = null
    }

    const loop = (type: OscillatorType, freq: number, vol: number, vibrato = 0) => {
        const a = ac()
        if (!a) return
        pararLoop()
        const osc = a.createOscillator()
        const gain = a.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, a.currentTime)
        gain.gain.setValueAtTime(0.0001, a.currentTime)
        gain.gain.exponentialRampToValueAtTime(vol, a.currentTime + 0.12)
        if (vibrato) {
            const lfo = a.createOscillator()
            const depth = a.createGain()
            lfo.frequency.setValueAtTime(vibrato, a.currentTime)
            depth.gain.setValueAtTime(freq * 0.06, a.currentTime)
            lfo.connect(depth).connect(osc.frequency)
            lfo.start()
        }
        const filter = a.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1400, a.currentTime)
        osc.connect(filter).connect(gain).connect(a.destination)
        osc.start()
        loopOsc = osc
        loopGain = gain
    }

    const api: Audio = {
        tec: () => noise(1800, 0.05, 0.16, 8),
        /** Cada casa da sequência sobe um semitom: a corrida vira melodia. */
        casa: indice => {
            const freq = 523.25 * Math.pow(2, (indice % 12) / 12)
            tone(freq, 0.16, 'triangle', 0.2)
            tone(freq * 2, 0.08, 'sine', 0.07)
        },
        resolveu: () => {
            ;[523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.18, i * 0.06))
        },
        trava: () => {
            const a = ac()
            if (!a) return
            const t = a.currentTime
            const osc = a.createOscillator()
            const gain = a.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(220, t)
            osc.frequency.exponentialRampToValueAtTime(180, t + 0.18)
            gain.gain.setValueAtTime(0.2, t)
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
            osc.connect(gain).connect(a.destination)
            osc.start(t)
            osc.stop(t + 0.3)
        },
        motor: on => (on ? loop('square', 90, 0.05) : pararLoop()),
        drone: on => (on ? loop('sawtooth', 220, 0.045, 7) : pararLoop()),
        pedal: () => noise(2400, 0.04, 0.1, 12),
        passo: () => noise(900, 0.05, 0.09, 4),
        planta: () => {
            const a = ac()
            if (!a) return
            const t = a.currentTime
            const osc = a.createOscillator()
            const gain = a.createGain()
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(70, t)
            osc.frequency.exponentialRampToValueAtTime(190, t + 0.42)
            gain.gain.setValueAtTime(0.16, t)
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
            osc.connect(gain).connect(a.destination)
            osc.start(t)
            osc.stop(t + 0.55)
            noise(160, 0.12, 0.14, 2, 0.42)
        },
        sino: () => {
            tone(660, 1.3, 'sine', 0.16)
            tone(990, 1.1, 'sine', 0.09)
        },
        sol: () => tone(84, 0.05, 'sine', 0.1),
        moedas: () => {
            for (let i = 0; i < 8; i++) {
                tone(1200 + Math.random() * 800, 0.05, 'sine', 0.09, i * 0.08)
            }
            tone(120, 0.3, 'triangle', 0.14, 0.72)
        },
        fanfarra: () => {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.2, i * 0.12))
        },
        setMuted: m => {
            muted = m
            if (m) pararLoop()
        },
        destroy: () => {
            pararLoop()
            try {
                void ctx?.close()
            } catch {
                /* fechar duas vezes não é problema de ninguém */
            }
            ctx = null
        },
    }

    scene.events.once('shutdown', () => api.destroy())
    return api
}
