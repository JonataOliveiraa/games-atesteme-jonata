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
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.07, t0 + 0.012)
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

    function noise(o: { dur: number; gain?: number; cutoff?: number; band?: number; delay?: number }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

        const src = audio.createBufferSource()
        src.buffer = buffer

        const filter = audio.createBiquadFilter()
        filter.type = o.band ? 'bandpass' : 'lowpass'
        filter.frequency.setValueAtTime(o.band ?? o.cutoff ?? 1200, t0)

        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        src.connect(filter)
        filter.connect(amp)
        amp.connect(audio.destination)
        src.start(t0)
    }

    return {
        tap() {
            note({ freq: 620, to: 900, dur: 0.09, type: 'triangle', gain: 0.05 })
        },

        bubble() {
            note({ freq: 380, to: 1050, dur: 0.3, type: 'sine', gain: 0.07 })
            noise({ dur: 0.22, band: 2400, gain: 0.03, delay: 0.02 })
        },

        combo() {
            note({ freq: 700, to: 1400, dur: 0.26, type: 'triangle', gain: 0.06 })
            note({ freq: 1050, to: 1700, dur: 0.22, type: 'sine', gain: 0.04, delay: 0.07 })
        },

        pop() {
            noise({ dur: 0.12, cutoff: 1600, gain: 0.06 })
            note({ freq: 300, to: 150, dur: 0.12, type: 'sine', gain: 0.04 })
        },

        seal() {
            note({ freq: 880, to: 660, dur: 0.16, type: 'triangle', gain: 0.05 })
        },

        lock() {
            note({ freq: 190, to: 120, dur: 0.28, type: 'square', gain: 0.045, cutoff: 700 })
        },

        unlock() {
            note({ freq: 420, to: 780, dur: 0.2, type: 'triangle', gain: 0.05 })
        },

        leave() {
            note({ freq: 520, to: 420, dur: 0.14, type: 'sine', gain: 0.035 })
        },

        win() {
            const song = [523, 659, 784, 1046]
            song.forEach((freq, i) =>
                note({ freq, dur: 0.34, type: 'triangle', gain: 0.06, delay: i * 0.12 }),
            )
        },

        setMuted(value: boolean) {
            muted = value
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
