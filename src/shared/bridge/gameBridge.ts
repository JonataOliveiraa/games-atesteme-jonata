import type { PlatformEvent } from "../contracts/platformEvents";
import type { PlatformCommand } from "../contracts/platformCommands"
import {
  emitGameEvent,
  sendPlatformCommand,
  subscribeToGameEvents,
  subscribeToPlatformCommands,
} from "./localBridge";

export interface GameBridge {
  emit: (event: PlatformEvent) => void;
  send: (command: PlatformCommand) => void;
  onGameEvent: (handler: (event: PlatformEvent) => void) => () => void;
  onPlatformCommand: (
    handler: (command: PlatformCommand) => void 
  ) => () => void;
}

export const gameBridge: GameBridge = {
  emit: emitGameEvent,
  send: sendPlatformCommand,
  onGameEvent: subscribeToGameEvents,
  onPlatformCommand: subscribeToPlatformCommands,
};