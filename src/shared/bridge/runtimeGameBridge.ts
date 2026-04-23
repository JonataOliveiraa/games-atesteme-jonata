import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands";
import {
  emitGameEvent,
  subscribeToPlatformCommands,
} from "./localBridge";
import {
  emitIframeGameEvent,
  subscribeToIframePlatformCommands,
} from "./iframeBridge";

export interface RuntimeGameBridge {
  emit: (event: PlatformEvent) => void;
  onCommand: (handler: (command: PlatformCommand) => void) => () => void;
}

function isInsideIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export const runtimeGameBridge: RuntimeGameBridge = isInsideIframe()
  ? {
      emit: emitIframeGameEvent,
      onCommand: subscribeToIframePlatformCommands,
    }
  : {
      emit: emitGameEvent,
      onCommand: subscribeToPlatformCommands,
    };