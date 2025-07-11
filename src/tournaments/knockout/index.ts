import { playBestOf, type bestOfResults } from "../../bestOf/index.js";
import {
  BotProcess,
  type identifier,
} from "../../turnHandlers/botHandler/index.js";
import type { gameTitle } from "../../games/index.js";
import { getBorderCharacters, table as printTable } from "table";
import v8 from "v8";
import { botsFromBotDetail } from "../index.js";
import { continueMethodHandler } from "../../helpers/continueMethod.js";
import { saveOut, type tournamentOutState } from "../saveOut.js";
export type botDetail = {
  dockerId: string;
  identifier: identifier;
};

type table = Record<identifier, record>;
type record = {
  rWins: number;
  rDraws: number;
  rLosses: number;
  rounds: number;
  games: number;
  gWins: number;
  gDraws: number;
  gLosses: number;
  points: number;
};
export async function knockout(
  botDetails: botDetail[],
  gameTitle: gameTitle,
  tournamentName: string,
  seeding: identifier[],
  bestOf: number,
  continueMethod: "enter" | number,
  save: boolean,
  moveTimeout = 100,
  alternatePlayer1 = true,
  log = false,
  tableLog = false,
) {
  let maxHeapUsage = 0;
  // previous: 77.7 % 100 x 50
  // failed at 100 x 100 around round 60
  const outState: tournamentOutState = {
    results: [],
    rounds: [],
    matchups: [],
  };
  let [bots, identifiers] = botsFromBotDetail(
    botDetails,
    gameTitle,
    moveTimeout,
  );
  let table = generateTable(identifiers);
  let sortedSeeding = sortRound(seeding);
  let matchups = knockoutMatchups(sortedSeeding);
  let nRounds = powerOfTwo(matchups.length);
  let roundResults = [];
  for (let i = nRounds; i >= 0; i--) {
    console.log(`----- Round ${i + 1} -----`);
    let games: Promise<[identifier, number, identifier, number]>[] = [];
    for (let j = 0; j < matchups.length; j++) {
      let [botAIdentifier, botBIdentifier] = matchups[j] as [
        identifier,
        identifier,
      ];

      let botA = bots[botAIdentifier] as BotProcess;
      let botB = bots[botBIdentifier] as BotProcess;
      outState.matchups.push({});
      outState.rounds.push([]);
      let roundName = "";
      if (i == 0) {
        roundName = "Final";
      } else if (i == 1) {
        roundName = "Semi-finals";
      } else if (i === 2) {
        roundName = "Quarter-finals";
      } else if (i === 3) {
        roundName = "Round of 16";
      } else if (i === 4) {
        roundName = "Round of 32";
      } else {
        roundName = `Round ${i}`;
      }
      games.push(
        getNewMatchup(
          botAIdentifier,
          botBIdentifier,
          playBestOf(
            botA,
            botB,
            i * nRounds + j,
            gameTitle,
            bestOf,
            roundName,
            alternatePlayer1,
            log,
          ),
          outState,
          i,
          save,
          table,
          tableLog,
        ),
      );
    }
    const results = await Promise.all(games);
    roundResults.push(results);
    const newSeeding = getSeedingFromResults(results);
    let heapUsage =
      (100 * process.memoryUsage().heapUsed) /
      v8.getHeapStatistics().heap_size_limit;
    if (heapUsage > maxHeapUsage) {
      maxHeapUsage = heapUsage;
    }
    if (newSeeding.length > 1) {
      matchups = knockoutMatchups(newSeeding);
    }
    await continueMethodHandler(continueMethod);
  }
  outState.results =
    roundResults[roundResults.length - 1]?.map((round) => {
      let defaultRecord = {
        rWins: 0,
        rDraws: 0,
        rLosses: 0,
        rounds: 0,
        games: 0,
        gWins: 0,
        gDraws: 0,
        gLosses: 0,
        points: 0,
        timeouts: 0,
        scoreFor: 0,
        scoreAgainst: 0,
      };
      if (round[1] > round[3]) {
        return { identifier: round[0], record: defaultRecord, rank: 1 };
      } else if (round[1] < round[3]) {
        return { identifier: round[2], record: defaultRecord, rank: 1 };
      }
      return { identifier: round[2], record: defaultRecord, rank: 1 };
    }) ?? [];

  if (save) {
    await saveOut(tournamentName, gameTitle, outState);
  } else {
  }
  showSymmetricalTable(roundResults, 5);
  console.log("Max heap usage", maxHeapUsage);
  return;
}

function getSeedingFromResults(
  results: [identifier, number, identifier, number][],
) {
  let seeding = [];
  for (let result of results) {
    const [a, aScore, b, bScore] = result;
    if (aScore > bScore) {
      seeding.push(a);
    } else if (bScore > aScore) {
      seeding.push(b);
    } else {
      seeding.push(Math.random() > 0.5 ? a : b);
    }
  }
  return seeding;
}

function generateTable(identifiers: identifier[]) {
  let table: Record<identifier, record> = {};
  for (let identifier of identifiers) {
    table[identifier] = {
      rWins: 0,
      rDraws: 0,
      rLosses: 0,
      games: 0,
      gWins: 0,
      gDraws: 0,
      gLosses: 0,
      rounds: 0,
      points: 0,
    };
  }
  return table;
}

async function getNewMatchup(
  botAIdentifier: identifier,
  botBIdentifier: identifier,
  match: Promise<bestOfResults>,
  tournamentState: tournamentOutState,
  roundNumber: number,
  save: boolean,
  table: table,
  log = false,
): Promise<[identifier, number, identifier, number]> {
  let bestOfResults = await match;
  let { results, timeouts, scores } = bestOfResults;
  if (save) {
    tournamentState.rounds[roundNumber]?.push([botAIdentifier, botBIdentifier]);
    const roundMatchups = tournamentState.matchups[roundNumber];
    if (roundMatchups === undefined) {
      throw new Error("round matchups undefined");
    }
    roundMatchups[botAIdentifier] = bestOfResults;
  }
  let aResults = results[botAIdentifier] as unknown as number;
  let bResults = results[botBIdentifier] as unknown as number;
  let draws = results.draws as number;
  log &&
    console.log(
      `${botAIdentifier} ${aResults} - (draws ${draws}) - ${bResults} ${botBIdentifier}`,
    );
  return [botAIdentifier, aResults, botBIdentifier, bResults];
}

function powerOfTwo(n: number) {
  let nextPower = 1;
  while (2 ** nextPower < n) {
    nextPower += 1;
  }
  return nextPower;
}

function knockoutMatchups(seeding: identifier[]) {
  const matchups: [identifier, identifier][] = [];
  for (let i = 0; i < seeding.length; i += 2) {
    const first = seeding[i];
    const second = seeding[i + 1];
    if (first == undefined || second == undefined) {
      throw new Error();
    }
    matchups.push([first, second]);
  }
  return matchups;
}

function showSymmetricalTable(
  roundResults: [identifier, number, identifier, number][][],
  roundsToShow = 4,
) {
  if (roundResults.length === 1) {
    printTable(roundResults[0] as any);
  }
  const startRound = roundResults.length - roundsToShow;
  const startIndex = startRound > 0 ? startRound : 0;
  const roundResultsShortened = roundResults.slice(startIndex);
  const rounds = roundResultsShortened.length;
  let rows = [];
  let startDistace = 1;
  let distanceBetween = 2;
  for (let i = 0; i < rounds - 1; i++) {
    startDistace *= 2;
    distanceBetween *= 2;
    let round = roundResultsShortened[i];
    if (round == undefined) {
      throw new Error();
    }
    for (let j = 0; j < round.length / 2; j++) {
      let firstHalfResults = round[j];
      let secondHalfResults = round[round.length - 1 - j];
      if (firstHalfResults == undefined || secondHalfResults == undefined) {
        throw new Error();
      }
      if (i === 0) {
        let newRow1 = [];
        let newRow2 = [];
        let newRow3 = [];
        let newRow4 = [];
        for (let k = 0; k < 2 * rounds + 3; k++) {
          newRow1.push("");
          newRow2.push("");
          newRow3.push("");
          newRow4.push("");
        }
        // newRow2[0] = `${firstHalfResults[0]}: ${firstHalfResults[1]}`;
        // newRow3[0] = `${firstHalfResults[2]}: ${firstHalfResults[3]}`;
        // newRow2[2 * rounds + 2] =
        //   `${secondHalfResults[0]}: ${secondHalfResults[1]}`;
        // newRow3[2 * rounds + 2] =
        //   `${secondHalfResults[2]}: ${secondHalfResults[3]}`;
        let firstHalfVictor: boolean | "draw" =
          firstHalfResults[1] > firstHalfResults[3];
        if (firstHalfResults[1] === firstHalfResults[3])
          firstHalfVictor = "draw";
        newRow2[0] = `${firstHalfResults[0]}: ${firstHalfResults[1]} ${
          firstHalfVictor !== "draw" && firstHalfVictor ? "<--" : "   "
        }`;
        newRow3[0] = `${firstHalfResults[2]}: ${firstHalfResults[3]} ${
          firstHalfVictor !== "draw" && !firstHalfVictor ? "<--" : "   "
        }`;
        let secondHalfVictor: boolean | "draw" =
          secondHalfResults[1] > secondHalfResults[3];
        if (secondHalfResults[1] === secondHalfResults[3])
          secondHalfVictor = "draw";
        newRow2[2 * rounds + 2 - i] = `${
          secondHalfVictor !== "draw" && secondHalfVictor ? "-->" : "   "
        } ${secondHalfResults[0]}: ${secondHalfResults[1]}`;
        newRow3[2 * rounds + 2 - i] = `${
          secondHalfVictor !== "draw" && !secondHalfVictor ? "-->" : "   "
        } ${secondHalfResults[2]}: ${secondHalfResults[3]}`;
        rows.push(newRow1);
        rows.push(newRow2);
        rows.push(newRow3);
        rows.push(newRow4);
        continue;
      }
      let row1 = rows[startDistace + j * distanceBetween - 1];
      let row2 = rows[startDistace + j * distanceBetween];
      if (row1 == undefined || row2 == undefined) {
        throw new Error();
      }
      let firstHalfVictor: boolean | "draw" =
        firstHalfResults[1] > firstHalfResults[3];
      if (firstHalfResults[1] === firstHalfResults[3]) firstHalfVictor = "draw";
      row1[i] = `${firstHalfResults[0]}: ${firstHalfResults[1]} ${
        firstHalfVictor !== "draw" && firstHalfVictor ? "<--" : "   "
      }`;
      row2[i] = `${firstHalfResults[2]}: ${firstHalfResults[3]} ${
        firstHalfVictor !== "draw" && !firstHalfVictor ? "<--" : "   "
      }`;
      let secondHalfVictor: boolean | "draw" =
        secondHalfResults[1] > secondHalfResults[3];
      if (secondHalfResults[1] === secondHalfResults[3])
        secondHalfVictor = "draw";
      row1[2 * rounds + 2 - i] = `${
        secondHalfVictor !== "draw" && secondHalfVictor ? "-->" : "   "
      } ${secondHalfResults[0]}: ${secondHalfResults[1]}`;
      row2[2 * rounds + 2 - i] = `${
        secondHalfVictor !== "draw" && !secondHalfVictor ? "-->" : "   "
      } ${secondHalfResults[2]}: ${secondHalfResults[3]}`;
    }
  }
  const finalRound = roundResults[roundResults.length - 1]?.[0];
  const row1 = rows[rows.length / 2 - 1];
  const row2 = rows[rows.length / 2];
  if (row1 == undefined || row2 == undefined || finalRound == undefined) {
    throw new Error();
  }
  row1[rounds + 1] = `${finalRound[0]}: ${finalRound[1]}`;
  row2[rounds + 1] = `${finalRound[2]}: ${finalRound[3]}`;
  let victor: boolean | "draw" = finalRound[1] > finalRound[3];
  if (finalRound[1] === finalRound[3]) victor = "draw";
  row1[rounds + 1] = `${victor !== "draw" && victor ? "-->" : "   "} ${
    finalRound[0]
  }: ${finalRound[1]} ${victor !== "draw" && victor ? "<--" : "   "}`;
  row2[rounds + 1] = `${victor !== "draw" && !victor ? "-->" : "   "} ${
    finalRound[2]
  }: ${finalRound[3]} ${victor !== "draw" && !victor ? "<--" : "   "}`;
  let headers = [];
  for (let i = rounds; i > 0; i--) {
    if (i == 1) {
      headers.push("", "");
    } else if (i == 2) {
      headers.push("Semi-finals");
    } else if (i === 3) {
      headers.push("Quarter-finals");
    } else if (i === 4) {
      headers.push("Round of 16");
    } else {
      headers.push(`Round ${i}`);
    }
  }
  let reversedHeaders = [...headers].reverse();
  headers.push("Final");
  headers.push(...reversedHeaders);
  let finalTable = [headers];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row == undefined) {
      return;
    }
    finalTable.push(row);
  }
  console.log(
    printTable(finalTable, {
      columnDefault: {
        paddingLeft: 1,
        paddingRight: 1,
        alignment: "center",
      },
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount;
      },
      drawVerticalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === rowCount;
      },
    }),
  );
}

function showTable(
  roundResults: [identifier, number, identifier, number][][],
  roundsToShow = 4,
) {
  const startRound = roundResults.length - roundsToShow;
  const startIndex = startRound > 0 ? startRound : 0;
  const roundResultsShortened = roundResults.slice(startIndex);
  const rounds = roundResultsShortened.length;
  let rows = [];
  let startDistance = 1;
  let distanceBetween = 2;
  for (let i = 0; i < rounds; i++) {
    startDistance *= 2;
    distanceBetween *= 2;
    let round = roundResultsShortened[i];
    if (round == undefined) {
      throw new Error();
    }
    let sortedRound = round; //sortRound(round);
    for (let j = 0; j < round.length; j++) {
      let results = sortedRound[j];
      if (results == undefined) {
        throw new Error();
      }
      if (i === 0) {
        let newRow1 = [];
        let newRow2 = [];
        let newRow3 = [];
        let newRow4 = [];
        for (let k = 0; k < rounds; k++) {
          newRow1.push("");
          newRow2.push("");
          newRow3.push("");
          newRow4.push("");
        }
        newRow2[0] = `${results[0]}: ${results[1]}`;
        newRow3[0] = `${results[2]}: ${results[3]}`;
        rows.push(newRow1);
        rows.push(newRow2);
        rows.push(newRow3);
        rows.push(newRow4);
        continue;
      }
      let row1 = rows[startDistance + j * distanceBetween - 1];
      let row2 = rows[startDistance + j * distanceBetween];
      if (row1 == undefined || row2 == undefined) {
        throw new Error();
      }
      row1[i] = `${results[0]}: ${results[1]}`;
      row2[i] = `${results[2]}: ${results[3]}`;
    }
  }
  let headers = [];
  for (let i = roundsToShow; i > 0; i--) {
    if (i == 1) {
      headers.push("Final");
    } else if (i == 2) {
      headers.push("Semi-finals");
    } else if (i === 3) {
      headers.push("Quarter-finals");
    } else if (i === 4) {
      headers.push("Round of 16");
    } else {
      headers.push(`Round ${i}`);
    }
  }
  let finalTable = [headers];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row == undefined) {
      return;
    }
    finalTable.push(row);
  }
  console.log(
    printTable(finalTable, {
      header: { alignment: "center", content: "Final Table" },
      border: getBorderCharacters("void"),
      columnDefault: {
        paddingLeft: 0,
        paddingRight: 1,
      },
      drawHorizontalLine: () => false,
    }),
  );
}

function sortRound(round: any[]): any[] {
  if (round.length === 1) {
    return round;
  }
  const firstHalf = round.filter((_, index) => index % 2 === 0);
  const secondHalf = round.filter((_, index) => index % 2 === 1);
  return [...sortRound(firstHalf), ...sortRound(secondHalf).reverse()];
}
