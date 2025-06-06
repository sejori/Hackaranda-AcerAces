import { playBestOf, type bestOfResults } from "../../bestOf/index.js";
import { BotProcess, type identifier } from "../../botHandler/index.js";
import type { gameTitle } from "../../games/index.js";
import { table as printTable } from "table";
import { PlayerProcess } from "../../playerHandler/index.js";
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
export async function roundRobin(
  botDetails: botDetail[],
  gameTitle: gameTitle,
  bestOf: number,
  moveTimeout = 100,
  alternatePlayer1 = true,
  log = false,
  tableLog = false,
) {
  let bots: Record<string, BotProcess> = {};
  let identifiers = [];
  for (let botDetail of botDetails) {
    identifiers.push(botDetail.identifier);
    if (botDetail.dockerId === "player") {
      bots[botDetail.identifier] = new PlayerProcess(
        botDetail.dockerId,
        botDetail.identifier,
        gameTitle,
      ) as unknown as BotProcess;
      continue;
    }
    bots[botDetail.identifier] = new BotProcess(
      botDetail.dockerId,
      botDetail.identifier,
      moveTimeout,
    );
  }
  let table = generateTable(identifiers);
  let rounds = roundRobinMatchups(identifiers.length);
  for (let i = 0; i < rounds.length; i++) {
    console.log(`----- Round ${i + 1} -----`);
    const roundStartTime = Date.now();
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
            alternatePlayer1,
            log,
          ),
          table,
          tableLog,
        ),
      );
    }
    await Promise.all(resolvers);
    const roundEndTime = Date.now();
    console.log((roundEndTime - roundStartTime) / 1000, "seconds");
  }
  showTable(table, identifiers);
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
  let results = await match;
  let aResults = results[botAIdentifier] as unknown as number;
  let bResults = results[botBIdentifier] as unknown as number;
  let draws = results.draws as number;
  const games = aResults + bResults + draws;
  let aTable = table[botAIdentifier] as unknown as record;
  let bTable = table[botBIdentifier] as unknown as record;
  log &&
    console.log(
      `${botAIdentifier} ${aResults} - (draws ${draws}) ${bResults} ${botBIdentifier}`,
    );
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

function showTable(table: table, identifiers: identifier[]) {
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

  console.log("----- Final Table -----");
  let finalTable = [
    [
      "Player",
      "Rounds",
      "Rounds Wins",
      "Round Draws",
      "Round Losses",
      "Sets",
      "Set Wins",
      "Set Draws",
      "Set Losses",
      "Set Diff",
      "Points",
    ],
  ];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row == undefined) {
      return;
    }
    finalTable.push([
      `${i + 1}. ${row.identifier}`,
      `${row.record.rounds}`,
      `${row.record.rWins}`,
      `${row.record.rDraws}`,
      `${row.record.rLosses}`,
      `${row.record.games}`,
      `${row.record.gWins}`,
      `${row.record.gDraws}`,
      `${row.record.gLosses}`,
      `${row.record.gWins - row.record.gLosses}`,
      `${row.record.points}`,
    ]);
  }
  console.log(
    printTable(finalTable, {
      header: { alignment: "center", content: "Final Table" },
    }),
  );
}
