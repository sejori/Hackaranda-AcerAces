import type { identifier } from "../../../botHandler/index.js";
import type { gameState, pathScore, winMetaData, path } from "../types.js";
import type { winner } from "../../types.js";

export function showScore(
  state: gameState,
  winner: winner<winMetaData>,
  botAIdentifier: identifier,
  botBIdentifier: identifier,
) {
  console.clear();
  const { aScore, bScore, aPaths, bPaths } = winner.metaData;
  if (aScore < bScore) {
    console.log(botBIdentifier, "beats", botAIdentifier);
  } else if (aScore == bScore) {
    console.log("It is a draw");
  } else {
    console.log(botAIdentifier, "beats", botBIdentifier);
  }
  // console.log(state);
  console.log(botAIdentifier + ":");
  console.log("    Final Hand:", displayPath(state.handA));
  console.log("    Final Score:", winner.metaData.aScore);
  console.log("    Paths:");
  for (let path of winner.metaData.aPaths) {
    console.log("        Points:", path.score, displayPath(path.path));
  }
  console.log();
  console.log(botBIdentifier + ":");
  console.log("    Final Hand:", displayPath(state.handB));
  console.log("    Final Score:", winner.metaData.bScore);
  console.log();
  console.log("    Paths:");
  for (let path of winner.metaData.bPaths) {
    console.log("        Points:", path.score, displayPath(path.path));
  }
}

function displayPath(path: path) {
  return path.map((card) => card[0] + card[1]).join(" ");
}

function getBestPath(pathscores: pathScore[]) {
  pathscores.sort((a, b) => b.score - a.score);
  return pathscores[0]?.path;
}
