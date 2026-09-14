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

    function note(o: { freq: number; dur: number; type?: OscillatorType; gain?: number; to?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'sine'
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

        slide() {
            noise({ dur: 0.22, freq: 2200, q: 0.6, gain: 0.035 })
        },

        tap() {
            note({ freq: 560, dur: 0.06, type: 'triangle', gain: 0.045 })
        },



        bounce() {
            note({ freq: 240, to: 150, dur: 0.24, type: 'square', gain: 0.045 })
        },


        /** O arremesso. */
        release() {
            noise({ dur: 0.26, freq: 1500, q: 0.5, gain: 0.05 })
            note({ freq: 640, to: 320, dur: 0.22, type: 'triangle', gain: 0.035 })
        },

        /** A placa batendo no chão: madeira grave, sem estrondo. */
        crash() {
            note({ freq: 150, to: 66, dur: 0.3, type: 'sine', gain: 0.095 })
            note({ freq: 240, to: 110, dur: 0.2, type: 'triangle', gain: 0.05 })
            noise({ dur: 0.2, freq: 520, q: 0.7, gain: 0.06 })
        },

        /** O quique depois da queda. */
        thump() {
            note({ freq: 180, to: 96, dur: 0.14, type: 'sine', gain: 0.055 })
            noise({ dur: 0.07, freq: 640, gain: 0.03 })
        },

        /** O dado voltando para o avatar. */
        save() {
            ;[660, 880, 1170].forEach((freq, i) =>
                note({ freq, dur: 0.16, type: 'triangle', gain: 0.045, at: i * 0.085 }),
            )
        },

        deliver() {
            ;[523, 698].forEach((freq, i) => note({ freq, dur: 0.16, type: 'sine', gain: 0.05, at: i * 0.1 }))
        },

        wave() {
            ;[523, 659, 784].forEach((freq, i) => note({ freq, dur: 0.18, type: 'triangle', gain: 0.06, at: i * 0.09 }))
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, at: i * 0.11 }),
            )
            for (let i = 0; i < 20; i++) {
                noise({ dur: 0.1, freq: 1400 + Math.random() * 1200, q: 0.6, gain: 0.025, at: 0.4 + Math.random() * 1.2 })
            }
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
