import { useCallback, useRef } from "react";

interface UseBeepSoundProps {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}

export const useBeepSound = ({
  frequency = 800,
  duration = 100,
  volume = 0.25,
  type = "sine",
}: UseBeepSoundProps = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as Window & {
            webkitAudioContext?: typeof AudioContext;
          }).webkitAudioContext;

        if (!AudioContextClass) return;

        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        void ctx.resume().then(() => {
          playBeepInternal(ctx, frequency, duration, volume, type);
        });
        return;
      }

      playBeepInternal(ctx, frequency, duration, volume, type);
    } catch (error) {
      console.error("Erro ao gerar som:", error);
    }
  }, [frequency, duration, volume, type]);

  return { playBeep };
};

function playBeepInternal(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + duration / 1000
  );

  oscillator.stop(ctx.currentTime + duration / 1000 + 0.05);
}