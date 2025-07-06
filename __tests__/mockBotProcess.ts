import { vi } from "vitest";
import { BotProcess } from "../src/turnHandlers/botHandler";

export function getBotProcessMock(imageName: string, identifier: string) {
  return {
    imageName,
    identifier,
    send: vi.fn(async (gameState: any) => "move from " + identifier),
  } as unknown as BotProcess;
}
