import Phaser from 'phaser'
import type { Content, InputId } from '../types'

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
        vibrato?: number
    }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)
        if (o.vibrato) {
            const lfo = audio.createOscillator()
            const depth = audio.createGain()
            lfo.frequency.value = 6
            depth.gain.value = o.vibrato
            lfo.connect(depth)
            depth.connect(osc.frequency)
            lfo.start(t0)
            lfo.stop(t0 + o.dur + 0.05)
        }
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.07, t0 + 0.015)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        osc.connect(amp)
        amp.connect(audio.destination)
        osc.start(t0)
        osc.stop(t0 + o.dur + 0.05)
    }

    function noise(o: { dur: number; freq: number; gain?: number; delay?: number }) {
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
        band.frequency.value = o.freq
        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.06, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    const voice = (gain: number) =>
        [392, 494, 440, 523].forEach((freq, i) =>
            note({ freq, dur: 0.2, type: 'triangle', gain, delay: i * 0.16, vibrato: 7 }),
        )

    return {
        setMuted(value: boolean) {
            muted = value
        },

        tap() {
            note({ freq: 560, dur: 0.07, type: 'triangle', gain: 0.05 })
        },

        dock() {
            note({ freq: 300, dur: 0.06, type: 'square', gain: 0.035 })
            note({ freq: 620, dur: 0.08, type: 'triangle', gain: 0.05, delay: 0.06 })
        },

        source(content: Content) {
            if (content === 'voice') voice(0.045)
            else note({ freq: 700, to: 1000, dur: 0.14, type: 'sine', gain: 0.05 })
        },

        capture(input: InputId) {
            if (input === 'camera') {
                noise({ dur: 0.09, freq: 3200, gain: 0.08 })
                note({ freq: 1400, dur: 0.05, type: 'square', gain: 0.02, delay: 0.02 })
            }
            if (input === 'keyboard') {
                ;[0, 0.12, 0.24].forEach(delay => noise({ dur: 0.04, freq: 2400, gain: 0.07, delay }))
            }
            if (input === 'mouse') noise({ dur: 0.035, freq: 1800, gain: 0.08 })
            if (input === 'microphone') note({ freq: 880, dur: 0.18, type: 'sine', gain: 0.03 })
        },

        empty() {
            note({ freq: 520, to: 260, dur: 0.28, type: 'sine', gain: 0.05 })
        },

        travel() {
            note({ freq: 420, to: 760, dur: 0.3, type: 'sine', gain: 0.035 })
        },

        process() {
            ;[660, 880, 740].forEach((freq, i) =>
                note({ freq, dur: 0.07, type: 'square', gain: 0.025, delay: i * 0.1 }),
            )
        },

        play(content: Content) {
            if (content === 'voice') voice(0.08)
            else [784, 988, 1175].forEach((freq, i) => note({ freq, dur: 0.12, type: 'sine', gain: 0.05, delay: i * 0.07 }))
        },

        print() {
            ;[0, 0.14, 0.28, 0.42].forEach(delay => noise({ dur: 0.12, freq: 900, gain: 0.05, delay }))
            note({ freq: 330, to: 360, dur: 0.56, type: 'square', gain: 0.015 })
        },

        stall() {
            note({ freq: 240, to: 150, dur: 0.26, type: 'square', gain: 0.045 })
        },

        success() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.075, delay: i * 0.08 }),
            )
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 }),
            )
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
