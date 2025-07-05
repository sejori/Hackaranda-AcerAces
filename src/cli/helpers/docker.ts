import { confirm } from "@inquirer/prompts";
import { spawn } from "child_process";

export async function checkDockerActive() {
  return new Promise((res) => {
    console.log("Checking Docker Process");
    const docker = spawn("docker", ["ps"]);
    docker.stdout.on("data", (data) => {
      res(true);
    });
    docker.stderr.on("data", (data) => {
      res(false);
    });
  });
}

export async function dockerActiveChoice(
  message = "Docker may not be running, continue?",
) {
  const checkDocker = await checkDockerActive();
  let choice = true;
  if (!checkDocker) {
    choice = await confirm({
      message,
    });
  }
  return choice;
}
