import Phaser from 'phaser'

export function createAudio(scene: Phaser.Scene) {
    let muted = false

    const ctx = (): AudioContext | null => {
        if (muted) return null
        try {
            return (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    function note(o: {
        freq: number
        dur: number
        type?: OscillatorType
        gain?: number
        to?: number
        delay?: number
        cutoff?: number
    }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()

        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)

        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        osc.connect(amp)
        if (o.cutoff) {
            const low = audio.createBiquadFilter()
            low.type = 'lowpass'
            low.frequency.setValueAtTime(o.cutoff, t0)
            amp.connect(low)
            low.connect(audio.destination)
        } else {
            amp.connect(audio.destination)
        }

        osc.start(t0)
        osc.stop(t0 + o.dur + 0.03)
    }

    function noise(o: { dur: number; from: number; to: number; gain?: number; delay?: number }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

        const source = audio.createBufferSource()
        source.buffer = buffer

        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = 1.4
        band.frequency.setValueAtTime(o.from, t0)
        band.frequency.exponentialRampToValueAtTime(Math.max(80, o.to), t0 + o.dur)

        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    let foot = 0

    return {
        setMuted(value: boolean) {
            muted = value
        },

        // ── o corte ────────────────────────────────────────────────
        tripIn(index: number) {
            note({ freq: 520 * Math.pow(2, index / 12), to: 880, dur: 0.14, type: 'triangle', gain: 0.07 })
        },

        tripOut() {
            note({ freq: 620, to: 380, dur: 0.12, type: 'triangle', gain: 0.05 })
        },

        select() {
            note({ freq: 440, dur: 0.08, type: 'sine', gain: 0.05 })
        },

        go() {
            [523, 784].forEach((freq, i) => {
                note({ freq, dur: 0.18, type: 'triangle', gain: 0.09, delay: i * 0.09 })
            })
        },

        // ── a corrida ──────────────────────────────────────────────
        step() {
            foot = 1 - foot
            noise({ dur: 0.05, from: 700 + foot * 240, to: 190, gain: 0.02 })
        },

        jump() {
            note({ freq: 420, to: 760, dur: 0.16, type: 'triangle', gain: 0.06 })
        },

        land() {
            noise({ dur: 0.08, from: 500, to: 140, gain: 0.03 })
        },

        pick(index: number) {
            const freq = 700 * Math.pow(2, index / 12)
            note({ freq, dur: 0.12, type: 'triangle', gain: 0.07 })
            note({ freq: freq * 1.5, dur: 0.14, type: 'sine', gain: 0.045, delay: 0.06 })
        },

        eca() {
            note({ freq: 300, to: 190, dur: 0.24, type: 'sawtooth', gain: 0.05, cutoff: 900 })
            noise({ dur: 0.2, from: 1200, to: 300, gain: 0.03, delay: 0.05 })
        },

        fall() {
            note({ freq: 380, to: 90, dur: 0.5, type: 'square', gain: 0.05, cutoff: 600 })
        },

        drop() {
            note({ freq: 520, to: 220, dur: 0.2, type: 'triangle', gain: 0.05 })
        },

        // ── acerto e erro ──────────────────────────────────────────
        wrong() {
            note({ freq: 320, to: 160, dur: 0.3, type: 'square', gain: 0.06, cutoff: 700 })
            noise({ dur: 0.24, from: 700, to: 160, gain: 0.04 })
        },

        unlock() {
            note({ freq: 420, to: 780, dur: 0.2, type: 'triangle', gain: 0.06 })
        },

        deliver(index: number) {
            noise({ dur: 0.1, from: 420, to: 130, gain: 0.05 })
            note({ freq: 523 * Math.pow(2, index / 12), dur: 0.2, type: 'triangle', gain: 0.08 })
        },

        reveal() {
            [523, 698, 880].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.07, delay: i * 0.07 })
            })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
