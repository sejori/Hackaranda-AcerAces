import { discardMove } from "./discard.js";
import { playMove } from "./play.js";
import { prompt } from "./prompt.js";
import type { move, playerState } from "./types.js";

export async function handleMove(state: playerState<move>) {
  const body = {
    n: 1,
    max_context_length: 8192,
    max_length: 512,
    rep_pen: 1.07,
    temperature: 0.75,
    top_p: 0.92,
    top_k: 100,
    top_a: 0,
    typical: 1,
    tfs: 1,
    rep_pen_range: 360,
    rep_pen_slope: 0.7,
    sampler_order: [6, 0, 1, 3, 4, 2, 5],
    memory:
      "[Character: The negotiator; species: Human; age: 24; gender: unknown; physical appearance: unknown; personality: scary, manipulative; likes: negotiating; description: The Negotiator is the best at playing games. You are in the middle of playing a game now. Every time a mood is made The Negotiator comments on how well you're doing and if you want to stop playing.]\n[The following is a chat message log between The Negotiator and you.]\n\nThe Negotiator: Do you still want to keep playing?\nUser: I played a good move!\n",
    trim_stop: true,
    genkey: "KCPP3860",
    min_p: 0,
    dynatemp_range: 0,
    dynatemp_exponent: 1,
    smoothing_factor: 0,
    nsigma: 0,
    prompt: prompt(state),
    banned_tokens: [],
    render_special: false,
    logprobs: false,
    replace_instruct_placeholders: true,
    presence_penalty: 0,
    logit_bias: {},
    quiet: true,
    stop_sequence: ["User:", "\nUser ", "\nThe Negotiator: "],
    use_default_badwordsids: false,
    bypass_eos: false,
  };
  const response = await fetch(
    "http://host.docker.internal:5001/api/v1/generate",
    {
      method: "POST",
      headers: {
        "User-Agent": "undici-stream-example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await response.json();
  console.error((data as any).results?.[0]?.text);
  switch (state.subTurn) {
    case 0:
    case 1:
      return randomDrawMove(state);
    case 2:
      return playMove(state);
    case 3:
      return discardMove(state);
  }
}

function randomDrawMove(state: playerState<move>) {
  const options: (0 | 1 | 2)[] = [];
  if (state.deck > 0) {
    options.push(0);
  }
  if (state.discard.length > 0) {
    options.push(1);
  }
  if (state.opponentDiscard.length > 0) {
    options.push(2);
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
