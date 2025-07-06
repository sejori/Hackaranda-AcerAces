import { allGameTitles } from "../games/index.js";

export function validateMatchData(data: any) {
  if (!allGameTitles.includes(data.game)) {
    return false;
  }
  if (data.initialState == undefined) {
    return false;
  }
  if (data.moves == undefined) {
    return false;
  }
  if (data.winner == undefined) {
    return false;
  }
  if (data.players == undefined) {
    return false;
  }

  return true;
}
