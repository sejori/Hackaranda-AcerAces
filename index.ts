import { playBestOf } from "./bestOf/index.js";
import { roundRobin, type botDetail } from "./tournaments/roundRobin/index.js";

let resolvers: Promise<unknown>[] = [];

console.log(process.argv[3]);
let bestof = Number(process.argv[2]) || 1;
let bots = typeof process.argv[3] !== "number" ? Number(process.argv[3]) : 10;
let messageTimeout = Number(process.argv[4]) || 100;
let log = process.argv[5] == "true" || false;
let botDetails: botDetail[] = [];

botDetails.push({
  dockerId: "player",
  identifier: "Player",
});

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-perfect-bot",
    identifier: "Perfect" + (i > 1 ? " " + i : ""),
  });
}

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-firstmovecorner-bot",
    identifier: "FirstMoveCorner" + (i > 1 ? i : ""),
  });
}

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-firstmovemiddle-bot",
    identifier: "FirstMoveMiddle" + (i > 1 ? i : ""),
  });
}
for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-firstmoveside-bot",
    identifier: "FirstMoveSide" + (i > 1 ? i : ""),
  });
}

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-randomunlesswinnable-bot",
    identifier: "Takes Win" + (i > 1 ? i : ""),
  });
}

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-randomunlesslosable-bot",
    identifier: "Avoids Loss" + (i > 1 ? i : ""),
  });
}

for (let i = 1; i < 2; i++) {
  botDetails.push({
    dockerId: "tictactoe-randomunlesswinorloss-bot",
    identifier: "Takes Ws Avoids Ls" + (i > 1 ? i : ""),
  });
}

for (let i = 0; i < bots; i++) {
  botDetails.push({
    dockerId: "tictactoe-random-bot",
    identifier: "Random bot " + (i + 1),
  });
}

async function boot() {
  console.log({ bestof, log });
  // for (let i = 0; i < matches; i++) {
  //   console.log("Beginning match", i + 1);
  //   resolvers.push(roundRobin(botDetails, "tictactoe", bestof));
  // }
  // await Promise.all(resolvers);
  await roundRobin(botDetails, "tictactoe", bestof, messageTimeout);
  process.exit();
}

boot();
