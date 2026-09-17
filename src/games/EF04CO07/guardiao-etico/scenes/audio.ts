import Phaser from 'phaser'

/**
 * Tudo em WebAudio, sem arquivo. O erro é um "hm?" grave e curto — nunca
 * alarme: aqui errar é ter deixado passar, não infração.
 */
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
        at?: number
    }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'triangle'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.06, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        osc.connect(amp)
        amp.connect(audio.destination)
        osc.start(t0)
        osc.stop(t0 + o.dur + 0.05)
    }

    function noise(o: { dur: number; freq: number; q?: number; gain?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const source = audio.createBufferSource()
        source.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = o.q ?? 1.1
        band.frequency.value = o.freq
        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.12, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur + 0.02)
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** O papel caindo na mesa. */
        drop() {
            noise({ dur: 0.16, freq: 1700, q: 0.7, gain: 0.1 })
            note({ freq: 180, dur: 0.1, type: 'sine', gain: 0.04 })
        },

        /** Achou. Claro e curto, para dar vontade de achar de novo. */
        find() {
            note({ freq: 880, dur: 0.1, gain: 0.05 })
            note({ freq: 1320, dur: 0.12, gain: 0.04, at: 0.06 })
        },

        cover(on: boolean) {
            noise({ dur: 0.1, freq: on ? 900 : 620, q: 0.9, gain: 0.14 })
        },

        stamp() {
            noise({ dur: 0.08, freq: 520, q: 0.8, gain: 0.16 })
            note({ freq: 150, dur: 0.14, type: 'sine', gain: 0.07 })
        },

        approve() {
            const melody = [523, 659, 784, 1047]
            melody.forEach((freq, i) => note({ freq, dur: 0.16, gain: 0.05, at: i * 0.11 }))
        },

        hmm() {
            note({ freq: 300, dur: 0.16, to: 190, type: 'sine', gain: 0.06 })
        },

        lock() {
            noise({ dur: 0.12, freq: 340, q: 1.4, gain: 0.1 })
        },

        ghost() {
            note({ freq: 420, dur: 0.5, to: 620, type: 'sine', gain: 0.03 })
        },

        fanfare() {
            const melody = [523, 659, 784, 1047, 1319]
            melody.forEach((freq, i) => note({ freq, dur: 0.24, gain: 0.05, at: i * 0.12 }))
        },

        destroy() {
            muted = true
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
