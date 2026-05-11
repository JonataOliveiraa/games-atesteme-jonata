import type { PlatformEvent } from "./platformEvents";
import type { PlatformCommand } from "./platformCommands";

export type IframePlatformEventMessage = {
  channel: "platform-event";
  payload: PlatformEvent;
};

export type IframePlatformCommandMessage = {
  channel: "platform-command";
  payload: PlatformCommand;
};

export type IframeMessage =
  | IframePlatformEventMessage
  | IframePlatformCommandMessage;

export function isIframePlatformEventMessage(
  value: unknown
): value is IframePlatformEventMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as Partial<IframePlatformEventMessage>;

  return maybe.channel === "platform-event" && !!maybe.payload;
}

export function isIframePlatformCommandMessage(
  value: unknown
): value is IframePlatformCommandMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as Partial<IframePlatformCommandMessage>;

  return maybe.channel === "platform-command" && !!maybe.payload;
}