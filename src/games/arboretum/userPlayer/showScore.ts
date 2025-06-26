import type { identifier } from "../../../botHandler/index.js";
import type { gameState, pathScore, winMetaData, path } from "../types.js";
import type { winner } from "../../types.js";
import { extractFromPlayArea, niceDeck, nicePlayArea } from "../helpers/ui.js";

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
  console.log("    Final Hand:", niceDeck(state.handA));
  console.log("    Final Score:", winner.metaData.aScore);
  const scoringAPaths = aPaths.filter((path) => path.score);
  scoringAPaths
    ? console.log("    Paths:")
    : console.log("    No scoring paths");
  for (let path of scoringAPaths) {
    console.log("        " + path.species + ":", path.score);
    console.log(
      nicePlayArea(extractFromPlayArea(state.playAreaA, path.path), ""),
    );
  }
  console.log("    Arboretum:");
  console.log(nicePlayArea(state.playAreaA, "", true));
  console.log();
  console.log(botBIdentifier + ":");
  console.log("    Final Hand:", niceDeck(state.handB));
  console.log("    Final Score:", winner.metaData.bScore);
  console.log();
  const scoringBPaths = bPaths.filter((path) => path.score > 0);
  scoringBPaths
    ? console.log("    Paths:")
    : console.log("    No scoring paths");
  for (let path of scoringBPaths) {
    console.log("        " + path.species + ":", path.score);
    console.log(
      nicePlayArea(extractFromPlayArea(state.playAreaB, path.path), ""),
    );
  }
  console.log("    Arboretum:");
  console.log(nicePlayArea(state.playAreaB, "", true));
}
