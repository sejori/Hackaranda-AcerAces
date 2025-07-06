import type { identifier } from "../turnHandlers/botHandler/index.js";
import type { gameTitle } from "../games/index.ts";
import type { ObjectValues } from "../helpers/objectValues.ts";
export type botDetail = {
  dockerId: string;
  identifier: identifier;
  variables?: string[];
};
export type tournamentSettings = {
  numberOfPlayers: number;
  gameType: gameTitle;
  tournamentType: tournamentType;
  bestOf: number;
  players: players;
  playersDir: string;
  messageTimeout: number;
  userPlayer: userplayer;
  userName: string;
  playerDetails: botDetail[];
  //displayType: displayType;
  // credentials: credentials;
  //credentialDir: string;
  tournamentName: string;
  seeding: seeding;
  seedingDir: string;
};

export const TOURNAMENT_TYPE = {
  roundRobin: "roundRobin",
  knockout: "knockout",
  // singleElimination: "singleElimination",
  // doubleElimination: "doubleElimination",
} as const;
export type tournamentType = ObjectValues<typeof TOURNAMENT_TYPE>;

export const DISPLAY_TYPE = {
  oneAtATime: "oneAtATime",
  simultaneousRounds: "simultaneousRounds",
  nonStop: "nonStop",
} as const;
export type displayType = ObjectValues<typeof DISPLAY_TYPE>;

export const CREDENTIALS = {
  acceptAnyApiKey: "acceptAnyApiKey",
  apiKeysFromFile: "apiKeysFromFile",
} as const;
export type credentials = ObjectValues<typeof CREDENTIALS>;

export const SEEDING = {
  random: "random",
  fromFile: "fromFile",
} as const;
export type seeding = ObjectValues<typeof SEEDING>;

export const PLAYERS = {
  random: "random",
  fromFile: "fromFile",
} as const;
export type players = ObjectValues<typeof PLAYERS>;

export const USERPLAYER = {
  play: "play",
  "don't play": "don't play",
};
export type userplayer = ObjectValues<typeof USERPLAYER>;

export type team = { name: string };
export type seed = { name: string; rank: number };
