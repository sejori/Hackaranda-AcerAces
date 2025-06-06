import { readFile } from "fs/promises";

export async function getPlayerDetails(fileDir: string) {
  try {
    let contents = await readFile(fileDir);
    let list = JSON.parse(contents.toString());
    return list.map((player: { identifier: string }) => {
      return { value: player, name: player.identifier };
    });
  } catch (e) {
    console.log(e);
    return false;
  }
}
