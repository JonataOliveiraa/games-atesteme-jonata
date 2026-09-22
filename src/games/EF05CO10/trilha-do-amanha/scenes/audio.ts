import Phaser from 'phaser'

interface NoteOptions {
    freq: number
    dur: number
    type?: OscillatorType
    gain?: number
    to?: number
    delay?: number
    cutoff?: number
}

interface NoiseOptions {
    dur: number
    from: number
    to: number
    gain?: number
    delay?: number
}

export function createAudio(scene: Phaser.Scene) {
    let muted = false
    let foot = 0

    const ctx = (): AudioContext | null => {
        if (muted) return null
        try {
            return (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    function note(o: NoteOptions) {
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

    function noise(o: NoiseOptions) {
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

    return {
        setMuted(value: boolean) {
            muted = value
        },

        wind() {
            noise({ dur: 1.1, from: 420, to: 190, gain: 0.018 })
        },

        shout() {
            note({ freq: 430, to: 250, dur: 0.72, type: 'triangle', gain: 0.075, cutoff: 1400 })
        },

        puzzled() {
            note({ freq: 330, to: 420, dur: 0.22, type: 'sine', gain: 0.05 })
        },

        step() {
            foot = 1 - foot
            noise({ dur: 0.05, from: 640 + foot * 220, to: 180, gain: 0.018 })
        },

        jump() {
            note({ freq: 400, to: 720, dur: 0.15, type: 'triangle', gain: 0.055 })
        },

        land() {
            noise({ dur: 0.09, from: 460, to: 130, gain: 0.028 })
        },

        splash() {
            noise({ dur: 0.22, from: 1500, to: 400, gain: 0.035 })
            note({ freq: 700, to: 320, dur: 0.16, type: 'sine', gain: 0.035 })
        },

        shopOpen() {
            [494, 622, 784].forEach((freq, i) => {
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.07, delay: i * 0.09 })
            })
        },

        take() {
            note({ freq: 880, dur: 0.1, type: 'triangle', gain: 0.07 })
            note({ freq: 1320, dur: 0.13, type: 'sine', gain: 0.045, delay: 0.06 })
        },

        tap() {
            note({ freq: 520, dur: 0.07, type: 'sine', gain: 0.045 })
        },

        send() {
            note({ freq: 300, to: 620, dur: 0.5, type: 'triangle', gain: 0.05, cutoff: 1800 })
        },

        arrived() {
            [523, 659, 880].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.08, delay: i * 0.08 })
            })
        },

        missed() {
            note({ freq: 300, to: 210, dur: 0.34, type: 'sine', gain: 0.06, cutoff: 800 })
        },

        right() {
            note({ freq: 784, dur: 0.12, type: 'triangle', gain: 0.07 })
            note({ freq: 1047, dur: 0.18, type: 'triangle', gain: 0.07, delay: 0.1 })
        },

        wrong() {
            noise({ dur: 0.2, from: 520, to: 200, gain: 0.03 })
        },

        phaseDone() {
            note({ freq: 660, to: 990, dur: 0.26, type: 'sine', gain: 0.07 })
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
