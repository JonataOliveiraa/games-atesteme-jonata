import Phaser from 'phaser'
import type { MachineId } from '../types'

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
            note({ freq: 460, dur: 0.06, type: 'sine', gain: 0.07 })
        },

        ask() {
            note({ freq: 880, dur: 0.1, type: 'triangle', gain: 0.07 })
            note({ freq: 1174, dur: 0.14, type: 'triangle', gain: 0.05, delay: 0.09 })
        },

        lift() {
            note({ freq: 320, to: 620, dur: 0.2, type: 'triangle', gain: 0.06 })
        },

        command(index: number) {
            note({ freq: 720 + index * 180, to: 1180 + index * 200, dur: 0.14, type: 'triangle', gain: 0.08 })
        },

        machine(id: MachineId) {
            if (id === 'sweeper') {
                noise({ dur: 0.5, from: 900, to: 2400, gain: 0.045 })
                note({ freq: 140, to: 190, dur: 0.5, type: 'sawtooth', gain: 0.035, cutoff: 480 })
                return
            }
            if (id === 'drone') {
                note({ freq: 210, to: 260, dur: 0.6, type: 'sawtooth', gain: 0.04, cutoff: 900 })
                note({ freq: 218, to: 252, dur: 0.6, type: 'square', gain: 0.02, cutoff: 700 })
                return
            }
            note({ freq: 120, to: 165, dur: 0.7, type: 'sine', gain: 0.06, cutoff: 400 })
            noise({ dur: 0.6, from: 260, to: 140, gain: 0.03 })
        },

        drop() {
            note({ freq: 980, to: 1560, dur: 0.14, type: 'triangle', gain: 0.08 })
        },

        beep() {
            note({ freq: 1320, dur: 0.09, type: 'square', gain: 0.05 })
            note({ freq: 1320, dur: 0.09, type: 'square', gain: 0.05, delay: 0.15 })
        },

        wrong() {
            note({ freq: 280, to: 110, dur: 0.36, type: 'square', gain: 0.05, cutoff: 600 })
            note({ freq: 180, to: 90, dur: 0.3, type: 'sine', gain: 0.05, delay: 0.1 })
        },

        missionDone() {
            [659, 880, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.24, type: 'triangle', gain: 0.09, delay: i * 0.1 })
            })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.24, type: 'triangle', gain: 0.1, delay: i * 0.12 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.48 })
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
