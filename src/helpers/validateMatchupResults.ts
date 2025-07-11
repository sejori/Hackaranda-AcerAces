export function validateMatchupResults(data: any) {
  if (data.gameResults == undefined) {
    return false;
  }
  if (data.gameResults.length === 0) {
    return false;
  }
  if (data.gameResults[0].players === undefined) {
    return false;
  }

  return true;
}
