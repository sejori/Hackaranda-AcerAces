import { spawn } from "child_process";
import type { UUID } from "node:crypto";
import readline from "node:readline";

export type identifier = string;
type resolver = (value: unknown) => void;

export class BotProcess {
  private proc;
  private rl;
  private messageMap = new Map<UUID, resolver>();

  constructor(
    public imageName: string,
    public identifier: string,
    private timeout: number,
    private variables?: string[],
  ) {
    // TODO: Have a 'ready' message
    const envVariables = [];
    if (variables !== undefined && variables.length > 0) {
      for (let variable of variables) {
        envVariables.push("-e");
        envVariables.push(variable);
      }
    }
    const dockerVars = ["run", ...envVariables, "--rm", "-i", imageName];
    this.proc = spawn("docker", dockerVars);

    this.rl = readline.createInterface({
      input: this.proc.stdout,
    });

    this.rl.on("line", this.dataHandler);

    this.proc.stderr.on("data", errorHandler(identifier));

    this.proc.on("close", closeHandler(imageName));

    this.identifier = identifier;
  }

  send(gameState: any) {
    return new Promise((resolve: resolver) => {
      const message = wrapState(gameState);
      // console.log(message);
      this.messageMap.set(message.messageID, resolve);
      this.timeOutMessage(message.messageID, this.timeout);
      this.proc.stdin.write(JSON.stringify(message) + "\n");
    });
  }

  kill() {
    this.proc.kill();
  }

  resolvePromise = (data: any) => {
    const messageID = data.messageID;
    if (messageID == undefined) {
      throw new Error("Invalid MessageID");
    }
    const resolver = this.messageMap.get(messageID);
    if (resolver == undefined) {
      return;
    }
    this.messageMap.delete(messageID);
    resolver(data.move);
  };

  timeOutMessage = (messageID: UUID, delay: number) => {
    setTimeout(() => {
      const messageResolver = this.messageMap.get(messageID);
      if (messageResolver == undefined) {
        return;
      }
      messageResolver("sendTimeout");
      this.messageMap.delete(messageID);
    }, delay);
  };

  dataHandler = (line: string) => {
    try {
      const parsed = JSON.parse(line.trim());
      // console.log("received from", this.identifier, parsed);
      this.resolvePromise(parsed);
    } catch (error) {
      console.error(error, line);
    }
  };
}

function errorHandler(imageName: string) {
  return (err: Error) => {
    console.error(`${imageName}:`, err.toString());
  };
}

function closeHandler(imageName: string) {
  return (code: number) => {
    if (code !== 0) {
      console.error(`Bot container ${imageName} exited with code ${code}`);
    }
  };
}

function wrapState(gameState: any) {
  return { state: gameState, messageID: crypto.randomUUID() };
}
