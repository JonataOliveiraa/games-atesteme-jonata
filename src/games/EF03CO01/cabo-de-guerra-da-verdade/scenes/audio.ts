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
    let ticker: Phaser.Time.TimerEvent | null = null

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
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.06, t0 + 0.012)
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

    function noise(o: { dur: number; gain?: number; band?: number; cutoff?: number; delay?: number }) {
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

    const api = {
        tap() {
            note({ freq: 560, to: 780, dur: 0.08, type: 'triangle', gain: 0.05 })
        },

        pull() {
            noise({ dur: 0.26, band: 900, gain: 0.05 })
            note({ freq: 220, to: 150, dur: 0.24, type: 'sawtooth', gain: 0.035, cutoff: 800 })
        },

        cheer() {
            noise({ dur: 0.5, band: 1800, gain: 0.035 })
            note({ freq: 660, to: 990, dur: 0.28, type: 'triangle', gain: 0.05 })
            note({ freq: 880, to: 1320, dur: 0.24, type: 'sine', gain: 0.035, delay: 0.09 })
        },

        wrong() {
            note({ freq: 300, to: 190, dur: 0.3, type: 'triangle', gain: 0.05 })
        },

        robotPull() {
            note({ freq: 180, to: 120, dur: 0.26, type: 'square', gain: 0.04, cutoff: 620 })
        },

        startTicking() {
            api.stopTicking()
            ticker = scene.time.addEvent({
                delay: 900,
                loop: true,
                callback: () => note({ freq: 1200, dur: 0.04, type: 'square', gain: 0.02, cutoff: 2400 }),
            })
        },

        stopTicking() {
            ticker?.remove()
            ticker = null
        },

        win() {
            const song = [523, 659, 784, 1046]
            song.forEach((freq, i) =>
                note({ freq, dur: 0.34, type: 'triangle', gain: 0.06, delay: i * 0.12 }),
            )
        },

        setMuted(value: boolean) {
            muted = value
            if (value) api.stopTicking()
        },
    }

    return api
}

export type Audio = ReturnType<typeof createAudio>
