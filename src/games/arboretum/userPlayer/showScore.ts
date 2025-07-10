import type { identifier } from "../../../turnHandlers/botHandler/index.js";
import { species, type gameState, type winMetaData } from "../types.js";
import type { winner } from "../../types.js";
import {
  assignColour,
  colorForSpecies,
  extractFromPlayArea,
  fancyDeck,
  niceDeck,
  nicePlayArea,
  sortDeck,
} from "../helpers/ui.js";
import cliui from "cliui";
import figlet from "figlet";
import { table } from "table";

export function showScore(
  state: gameState,
  winner: winner<winMetaData>,
  botAIdentifier: identifier,
  botBIdentifier: identifier,
) {
  console.clear();

  const ui = cliui();
  const { aScore, bScore, aPaths, bPaths } = winner.metaData;

  ui.div({
    text: figlet.textSync("ARBORETUM", { font: "AMC Tubes" }),
    align: "center",
  });

  const headers = [
    "Trees",
    "",
    botAIdentifier + "\n",
    "",
    "",
    "",
    botBIdentifier + "\n",
    "",
    "",
  ];

  const subHeading = [
    "",
    "",
    "Score",
    "Hand",
    "Path",
    "",
    "Score",
    "Hand",
    "Path",
  ];
  const tableRows: any[] = [headers, subHeading];
  const treeNames: Record<species, string> = {
    J: "Jacaranda",
    R: "Royal Poinciana",
    C: "Cassia",
    M: "Maple",
    O: "Oak",
    W: "Willow",
  };
  for (let aSpecies of species) {
    const name = treeNames[aSpecies];
    const aPath = aPaths.filter((path) => path.species === aSpecies)[0];
    const bPath = bPaths.filter((path) => path.species === aSpecies)[0];

    const row = [
      colorForSpecies(aSpecies)(name),
      "",
      aPath?.score ?? "-",
      niceDeck(sortDeck(state.handA.filter((card) => card[0] === aSpecies))),
      (aPath?.path.length ?? 0) > 1
        ? nicePlayArea(
            extractFromPlayArea(state.playAreaA, aPath?.path || []),
            "",
          )
        : "",
      "",
      bPath?.score ?? "-",
      niceDeck(sortDeck(state.handB.filter((card) => card[0] === aSpecies))),
      (bPath?.path.length ?? 0) > 1
        ? nicePlayArea(
            extractFromPlayArea(state.playAreaB, bPath?.path || []),
            "",
          )
        : "",
    ];

    tableRows.push(row);
  }

  const finalStateRows = [
    ["Player", "Final Hand", "Final Arboretum", "Final Score"],
    [
      botAIdentifier,
      niceDeck(sortDeck(state.handA)),
      nicePlayArea(state.playAreaA),
      aScore,
    ],
    [
      botBIdentifier,
      niceDeck(sortDeck(state.handB)),
      nicePlayArea(state.playAreaB),
      bScore,
    ],
  ];

  ui.div(
    {
      text: table(finalStateRows, {
        header: {
          content: "RESULTS\n",
        },
        drawHorizontalLine: (lineIndex, rowCount) => {
          return lineIndex !== 1;
        },
      }),
      align: "center",
    },
    {
      text: table(tableRows, {
        columns: {
          1: {
            paddingLeft: 0,
            paddingRight: 0,
          },
          5: {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
        spanningCells: [
          { col: 0, row: 0, rowSpan: 2, verticalAlignment: "bottom" },
          { col: 2, row: 0, colSpan: 3, alignment: "center" },
          { col: 6, row: 0, colSpan: 3, alignment: "center" },
        ],
        drawHorizontalLine: (lineIndex, rowCount) => {
          return lineIndex !== 1 && lineIndex !== 2;
        },
        header: {
          content: "SCORECARD\n",
        },
      }),
      align: "center",
    },
  );

  console.log(ui.toString());
}
