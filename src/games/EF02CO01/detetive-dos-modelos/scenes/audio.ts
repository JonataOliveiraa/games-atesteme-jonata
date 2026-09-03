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
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.01)
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
        band.Q.value = 1.1
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

    return {
        setMuted(value: boolean) {
            muted = value
        },

        tap() {
            note({ freq: 520, to: 380, dur: 0.07, type: 'triangle', gain: 0.06 })
        },

        pick() {
            note({ freq: 420, to: 760, dur: 0.14, type: 'sine', gain: 0.07 })
            note({ freq: 640, to: 980, dur: 0.1, type: 'triangle', gain: 0.04, delay: 0.05 })
        },

        send() {
            noise({ dur: 0.22, from: 800, to: 2200, gain: 0.04 })
        },

        air() {
            noise({ dur: 0.6, from: 500, to: 1800, gain: 0.05 })
            note({ freq: 520, to: 880, dur: 0.5, type: 'sine', gain: 0.05 })
        },

        land() {
            note({ freq: 130, to: 90, dur: 0.42, type: 'square', gain: 0.06, cutoff: 520 })
            noise({ dur: 0.3, from: 300, to: 140, gain: 0.04, delay: 0.05 })
        },

        water() {
            noise({ dur: 0.34, from: 1600, to: 400, gain: 0.06 })
            note({ freq: 300, to: 180, dur: 0.22, type: 'sine', gain: 0.05, delay: 0.04 })
        },

        still() {
            note({ freq: 700, dur: 0.11, type: 'triangle', gain: 0.07 })
            note({ freq: 1050, dur: 0.14, type: 'sine', gain: 0.05, delay: 0.08 })
        },

        wrong() {
            note({ freq: 300, to: 170, dur: 0.18, type: 'square', gain: 0.07, cutoff: 900 })
            note({ freq: 210, to: 130, dur: 0.22, type: 'square', gain: 0.05, cutoff: 700, delay: 0.15 })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.8, type: 'sine', gain: 0.05, delay: 0.5 })
        },
    }
}
