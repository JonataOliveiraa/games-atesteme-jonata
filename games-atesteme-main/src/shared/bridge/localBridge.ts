import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands"

const GAME_EVENT_NAME = "platform-game-event";
const PLATFORM_COMMAND_NAME = "platform-command";

export function emitGameEvent(event: PlatformEvent) {
  window.dispatchEvent(
    new CustomEvent<PlatformEvent>(GAME_EVENT_NAME, {
      detail: event,
    })
  );
}

export function subscribeToGameEvents(
  handler: (event: PlatformEvent) => void
) {
  const listener = (raw: Event) => {
    const customEvent = raw as CustomEvent<PlatformEvent>;
    handler(customEvent.detail);
  };

  window.addEventListener(GAME_EVENT_NAME, listener);

  return () => {
    window.removeEventListener(GAME_EVENT_NAME, listener);
  };
}

export function sendPlatformCommand(command: PlatformCommand) {
  window.dispatchEvent(
    new CustomEvent<PlatformCommand>(PLATFORM_COMMAND_NAME, {
      detail: command,
    })
  );
}

export function subscribeToPlatformCommands(
  handler: (command: PlatformCommand) => void
) {
  const listener = (raw: Event) => {
    const customEvent = raw as CustomEvent<PlatformCommand>;
    handler(customEvent.detail);
  };

  window.addEventListener(PLATFORM_COMMAND_NAME, listener);

  return () => {
    window.removeEventListener(PLATFORM_COMMAND_NAME, listener);
  };
}