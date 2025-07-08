import { playBestOf, type bestOfResults } from "../../bestOf/index.js";
import {
  BotProcess,
  type identifier,
} from "../../turnHandlers/botHandler/index.js";
import type { gameTitle } from "../../games/index.js";
import { table as printTable } from "table";
import { botsFromBotDetail } from "../index.js";
import { writeFile } from "fs/promises";
import cliui from "cliui";
import readline from "readline";
import type { botDetail } from "../types.js";
import path from "path";
import filenamify from "filenamify";
const ui = cliui();

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
  timeouts: number;
  scoreFor: number;
  scoreAgainst: number;
};
export async function roundRobin(
  botDetails: botDetail[],
  gameTitle: gameTitle,
  tournamentName: string,
  bestOf: number,
  moveTimeout = 100,
  alternatePlayer1 = true,
  log = false,
  tableLog = false,
) {
  let maxHeapUsage = 0;
  let [bots, identifiers] = botsFromBotDetail(
    botDetails,
    gameTitle,
    moveTimeout,
  );
  let table = generateTable(identifiers);
  let rounds = roundRobinMatchups(identifiers.length);
  for (let i = 0; i < rounds.length; i++) {
    ui.resetOutput();
    ui.div({ text: `----- Round ${i + 1} -----` });
    ui.div(
      {
        text:
          showTable(table, identifiers, false, "Interim Table", 10) ??
          "table failed",
        options: {},
      },
      { text: "Other stuff" },
    );
    // tableLog && console.log(ui.toString());
    // Clear previous line(s) and overwrite
    if (tableLog) {
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
      process.stdout.write(ui.toString());
    }
    let round = rounds[i] as number[][];
    let resolvers: Promise<unknown>[] = [];
    for (let j = 0; j < round.length; j++) {
      let pair = round[j] as [number, number];

      if (pair.includes(-1)) {
        continue;
      }
      let botAIdentifier = identifiers[pair[0] as unknown as any] as identifier;
      let botBIdentifier = identifiers[pair[1] as unknown as any] as identifier;
      let botA = bots[botAIdentifier] as BotProcess;
      let botB = bots[botBIdentifier] as BotProcess;
      resolvers.push(
        updateTable(
          botAIdentifier,
          botBIdentifier,
          playBestOf(
            botA,
            botB,
            i * round.length + j,
            gameTitle,
            bestOf,
            `Round ${i + 1}`,
            alternatePlayer1,
            log,
          ),
          table,
          tableLog,
        ),
      );
    }
    await Promise.all(resolvers);
  }
  console.clear();
  console.log(showTable(table, identifiers));
  await saveResults(table, identifiers, tournamentName, gameTitle);
  console.log("Max heap usage", maxHeapUsage);
  return;
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
      timeouts: 0,
      scoreFor: 0,
      scoreAgainst: 0,
    };
  }
  return table;
}

async function updateTable(
  botAIdentifier: identifier,
  botBIdentifier: identifier,
  match: Promise<bestOfResults>,
  table: table,
  log = false,
) {
  let { results, timeouts, scores } = await match;
  let aResults = results[botAIdentifier] as unknown as number;
  let bResults = results[botBIdentifier] as unknown as number;
  let draws = results.draws as number;
  const games = aResults + bResults + draws;
  let aTable = table[botAIdentifier] as unknown as record;
  let bTable = table[botBIdentifier] as unknown as record;
  false &&
    console.log(
      `${botAIdentifier} ${aResults} (${scores[botAIdentifier]}) - (draws ${draws}) - (${scores[botBIdentifier]}) ${bResults} ${botBIdentifier}`,
    );
  aTable.timeouts += timeouts[botAIdentifier] ?? 0;
  bTable.timeouts += timeouts[botBIdentifier] ?? 0;
  aTable.scoreFor += scores[botAIdentifier] ?? 0;
  bTable.scoreFor += scores[botBIdentifier] ?? 0;
  aTable.scoreAgainst += scores[botBIdentifier] ?? 0;
  bTable.scoreAgainst += scores[botAIdentifier] ?? 0;
  if (aResults > bResults) {
    aTable.rWins++;
    bTable.rLosses++;
    aTable.points += 3;
  } else if (bResults > aResults) {
    bTable.rWins++;
    aTable.rLosses++;
    bTable.points += 3;
  } else {
    aTable.rDraws++;
    bTable.rDraws++;
    aTable.points += 1;
    bTable.points += 1;
  }
  aTable.rounds++;
  bTable.rounds++;
  aTable.games += games;
  bTable.games += games;
  aTable.gWins += aResults;
  aTable.gDraws += draws;
  aTable.gLosses += bResults;
  bTable.gWins += bResults;
  bTable.gDraws += draws;
  bTable.gLosses += aResults;
}

function roundRobinMatchups(matchups: number) {
  let players = [];
  let rounds = [];
  for (let i = 0; i < matchups; i++) {
    players.push(i);
  }
  if (players.length % 2) {
    players.push(-1);
  }
  for (let i = 0; i < players.length - 1; i++) {
    rounds.push(getPairs(players));
    rotateArray(players);
  }

  return rounds;
}

function getPairs(list: number[]) {
  let pairs: number[][] = [];
  for (let i = 0; i < list.length / 2; i++) {
    pairs.push([list[i] as number, list[list.length - 1 - i] as number]);
  }
  return pairs;
}
function rotateArray(list: number[]) {
  let first = list.shift() as number;
  list.push(list[0] as number);
  list.shift();
  list.unshift(first);
}

function showTable(
  table: table,
  identifiers: identifier[],
  full = true,
  title = "Final Table",
  limit: false | number = false,
) {
  let rows = [];
  for (let identifier of identifiers) {
    let record = table[identifier];
    if (record == undefined) {
      return;
    }
    rows.push({ identifier, record });
  }
  rows.sort((rowa, rowb) => {
    const pointsDifference = rowb.record.points - rowa.record.points;
    if (pointsDifference !== 0) return pointsDifference;
    const recordDifference =
      rowb.record.gWins -
      rowb.record.gLosses -
      rowa.record.gWins +
      rowa.record.gLosses;
    return recordDifference;
  });

  let headers = [
    "Player",
    "Rounds",
    "Rounds Wins",
    "Round Draws",
    "Round Losses",
  ];
  full &&
    headers.push(
      "Sets",
      "Set Wins",
      "Set Draws",
      "Set Losses",
      "Set Diff",
      "Timeouts",
      "Avg. Score For",
      "Avg. Score Against",
    );
  headers.push("Points");
  let finalTable = [headers];
  let rowCount = limit === false ? rows.length : Math.min(limit, rows.length);
  for (let i = 0; i < rowCount; i++) {
    const row = rows[i];
    if (row == undefined) {
      return;
    }
    let newRow = [
      `${i + 1}. ${row.identifier}`,
      `${row.record.rounds}`,
      `${row.record.rWins}`,
      `${row.record.rDraws}`,
      `${row.record.rLosses}`,
    ];
    full &&
      newRow.push(
        `${row.record.games}`,
        `${row.record.gWins}`,
        `${row.record.gDraws}`,
        `${row.record.gLosses}`,
        `${row.record.gWins - row.record.gLosses}`,
        `${row.record.timeouts}`,
        `${(row.record.scoreFor / row.record.games).toFixed(1)}`,
        `${(row.record.scoreAgainst / row.record.games).toFixed(1)}`,
      );
    newRow.push(`${row.record.points}`);
    finalTable.push(newRow);
  }
  return printTable(finalTable, {
    header: { alignment: "center", content: title },
  });
}

async function saveResults(
  table: table,
  identifiers: identifier[],
  tournamentName: string,
  gameTitle: gameTitle,
) {
  let rows = [];
  for (let identifier of identifiers) {
    let record = table[identifier];
    if (record == undefined) {
      return;
    }
    rows.push({ identifier, record, rank: 0 });
  }
  rows.sort((rowa, rowb) => {
    const pointsDifference = rowb.record.points - rowa.record.points;
    if (pointsDifference !== 0) return pointsDifference;
    const recordDifference =
      rowb.record.gWins -
      rowb.record.gLosses -
      rowa.record.gWins +
      rowa.record.gLosses;
    return recordDifference;
  });
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    if (row === undefined) {
      continue;
    }
    row.rank = i + 1;
  }
  const jsonRows = JSON.stringify(rows);
  const tournamentResultsFile = path.join(
    import.meta.dirname,
    "../../../tournamentResults",
    gameTitle,
    filenamify(tournamentName) + ".json",
  );
  await writeFile(tournamentResultsFile, jsonRows);
}
