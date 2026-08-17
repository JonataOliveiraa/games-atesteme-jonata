import { useCallback, useEffect, useRef } from "react";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";
import type { PlatformCommand } from "../../shared/contracts/platformCommands";
import {
  isIframePlatformEventMessage,
  type IframePlatformCommandMessage,
} from "../../shared/contracts/iframeMessages";
import { resolveGameId } from "../../data/gameIndex";

interface IframeGameFrameProps {
  gameId: string;
  level: 1 | 2 | 3;
  points: number;
  lives: number;
  src: string;
  onPlatformEvent: (event: PlatformEvent) => void;
}

export default function IframeGameFrame({
  gameId,
  level,
  points,
  lives,
  src,
  onPlatformEvent,
}: IframeGameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendStartCommand = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    const command: PlatformCommand = {
      type: "START_GAME",
      gameId,
      stage: level,
      points,
      lives,
    };

    const message: IframePlatformCommandMessage = {
      channel: "platform-command",
      payload: command,
    };

    win.postMessage(message, "*");
  }, [gameId, level, points, lives]);

  useEffect(() => {
    const handleMessage = (raw: MessageEvent) => {
      const data = raw.data;

      if (!isIframePlatformEventMessage(data)) return;

      const event = data.payload;
      const normalizedEventGameId = resolveGameId(event.gameId) ?? event.gameId;
      const normalizedCurrentGameId = resolveGameId(gameId) ?? gameId;

      if (normalizedEventGameId !== normalizedCurrentGameId) return;
      onPlatformEvent({ ...event, gameId: normalizedEventGameId });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [gameId, onPlatformEvent]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setTimeout(() => {
        sendStartCommand();
      }, 100);
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [sendStartCommand]);

  useEffect(() => {
  const win = iframeRef.current?.contentWindow;
  if (!win) return;

  const id = window.setTimeout(() => {
    sendStartCommand();
  }, 150);

  return () => window.clearTimeout(id);
}, [level, points, lives, sendStartCommand]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={`game-${gameId}`}
      className="game-iframe"
      allow="autoplay"
    />
  );
}