import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands";
import {
  isIframePlatformCommandMessage,
  type IframePlatformEventMessage,
} from "../contracts/iframeMessages";

export function emitIframeGameEvent(event: PlatformEvent) {
  const message: IframePlatformEventMessage = {
    channel: "platform-event",
    payload: event,
  };

  window.parent.postMessage(message, "*");
}

export function subscribeToIframePlatformCommands(
  handler: (command: PlatformCommand) => void
) {
  const listener = (raw: MessageEvent) => {
    const data = raw.data;

    if (!isIframePlatformCommandMessage(data)) return;

    handler(data.payload);
  };

  window.addEventListener("message", listener);

  return () => {
    window.removeEventListener("message", listener);
  };
}