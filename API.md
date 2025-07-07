[General API](#general-api)
[TicTacToe API](#tictactoe)
[Arboretum API](#arboretum)

# General API

Bots will interact through the console.

## Server to Bot

The server will write game state to a bot's console (stdin) as JSON in the form:

``` json
{
  "state": "game specific state",
  "messageID": "a message specific ID"
}
```

The line will be followed by a new line character `\n` signalling the end of the message.

Every `state` will contain the following:
``` js
{
    // Signifies if it is the bot's turn - if it is not you MUST send back a random move
    activeTurn: boolean;

// The following are primarily for display but can be used by the bot:
    // The last played turn and any metaData
    previousTurn: { move: move | false; metaData?: any };
    // Whether the last played turn should be displayed
    showPreviousTurn: boolean;
    // The current opponent, used for display and will be empty for any normal bot
    opponent: string;
};

```

### NEWGAME and ENDGAME messages
At the start of a game, the server will send a `NEWGAME` message through state. It will be of the form:
```json
{
    "message": "NEWGAME",
    "gameNumber": "number",
    "round": "string"
}
```
At the end of a game, the server will send an `ENDGAME` message through state. It will be of the form:
```json
{
    "message": "ENDGAME",
    "result": "0 for win, 1 for loss, 2 for draw",
    "score": "your final score as number",
    "opponentScore": "opponent final score as number",
    "finalState": "final game State"
}
```
Both messages must be responded to as an inactive turn (see below).

### Language examples

#### Python

- `input()` waits for input from the Console until a new line character.

#### JS
- The function `readline` from `node:readline` can be used wait for input from the Console 


## Bot to Server

- The bot must respond with its chosen move via the console (stdout) as JSON in the form:

``` json
{
  "move": "chosen move",
  "messageID": "The corresponding messageID"
}
```

For example, a bot is playing `tictactoe` and wants to place the current token (`'O'` say) in the top 
left of the board (index `0`). If the incoming messageID was `'1234-5678-9101'`, the outgoing message will be:
``` json
{
    "move": 0,
    "messageID": '1234-5678-9101'
}
```

### Invalid moves
- Invalid moves will result in a random move being chosen.

# TicTacToe

## TicTacToe state
The tictactoe specific state is the following:
``` js
{
    // The current token to be placed
  token: tile;
    // The current board state
  gameState: board;
    // Display focussed items:
  activeTurn: boolean;
  opponent: '';
  previousTurn: { move: move | false };
  showPreviousTurn: boolean;
};
```

Where:
- `tile` is one of the characters `'-'`, `'O'` or `'X'`
- `board` is a 9 long array of `tile`s, e.g. `['-', 'O', 'X', 'X', '-', 'X', '-', 'O', '-']`
    - The board wraps so that indexes 0-2 are the first row, 3-5 the second, and 6-8 the final row.
- `move` is a tictactoe move as seen in the next section.

## TicTacToe Move

For tictactoe, the move is simply the index (integer 0 <= x <= 8) of where to place the current token.
- For example, to place the current token in the middle (index `5`), the move will be `5`.

# Arboretum

## Arboretum State
``` js
{
  /** Cards remaining in deck */
  deck: number;
  /** Player's hand */
  hand: Card[];
  /** Opponent's hand */
  opponentHand: (Card|null)[];
  /** Player's Discard Pile */
  discard: Card[];
  /** Opponent's Discard Pile*/
  opponentDiscard: Card[];
  /** play area */
  playArea: playArea;
  /** Opponent's play area */
  opponentPlayArea: playArea;
  /** Current turn */
  turn: turn;
  /** Current sub turn */
  subTurn: subTurn;

  /** Display focussed items:*/
  activeTurn: boolean;
  previousTurn: { move: move | false; metaData: Card | false };
  showPreviousTurn: boolean;
  opponent: '';
}
```
Where:
- `rank` is a number `1 <= x <= 8`.
- `species` is one of `["J", "R", "C", "M", "O", "W"]`.
- `Card` is an array/tuple of the form `[species, rank]` e.g. `["J", 3]`.
- `hand` is your hand. It's an array of cards: `Card[]`.
- `opponentHand` is your opponent's hand. It's an array of cards or null: `(Card | null)[]`.
    - Arboretum keeps track of which cards you know your opponent has in their. These will be shown
    as `Card`, the other will be `null`.
- `discard` is your discard pile. It's an array of cards: `Card[]` 
    - `discard` acts as a stack - last in first out
- `opponentDiscard` is your opponent's discard pile. It's an array of cards: `Card[]` 
    - `opponentDiscard` acts as a stack - last in first out
- `playArea` is an object/dict/hashmap that represents the coordinates of each card in a playArea/Arboretum.
    - The first layer is the `x` coordinate, the second layer is the `y` coordinate. The TS type is 
    `Record<number, Record<number, Card>>`
        - Note: to be valid, the coordinate must be adjacent to another card.
    - An example where `["J", 3]` is at coordinate `(-1, 0)`, `["C", 4]` is at `(-1, 1)` and `["J", 2]`
    is at `(0, 0)`:
``` json
{
  "-1": {
    "0": ["J", 3],
    "1": ["C", 4]
  },
  "0": {
    "0": ["J", 2]
  }
}
```
- `opponentPlayArea` is your opponent's playArea/Arboretum and has the same type as `playArea`.
- `turn` is the current turn number 
- `subTurn` is the current sub turn: 
    - `0` for the first draw move
    - `1` for the second draw move
    - `2` for the play move
    - `3` for the discard move

## Arboretum Move

For arboretum, there are three types of move:
### Draw move:
- `0` to draw from the deck
- `1` to draw the top card from your discard pile
- `2` to draw the top card from your opponent's discard pile
### Play move:
- For a play move, you are expected to select a card from your hand and a coordinate representing
the location in your play area that it should be placed    
- It should be an object of the following form:
```json
{
    "card": "Card",
    "coord": ["number", "number"]
}
```
- For example, to place the card `["J", 3]` at `(0, 0)` the move will be the following:
```json
{
    "card": ["J", 3],
    "coord": [0, 0]
}
```
- The first play move MUST be at the coordinate: `(0,0)`.
### Discard move
- The discard move is the card from your hand you wish to discard
- For example, to discard the card `["J", 3]`, the move is `["J", 3]`

## Example turn

Our bot is playing a game against `EthanBot`. 

### Out of turn
It is `EthanBot`'s turn at the moment so each message has the `activeTurn: false`. We simply respond
with a default move (say `0`) to maintain activity. E.g.
IN => `{"messageID": "1234", "state": {"deck": 32, "hand": [["J", 3], ...] ..., "activeTurn": false }}`
OUT => `{"move": 0, "messageID": "1234"}`

### First draw
It's now our turn, we must choose where to draw from. We can look in `"state"` to view the cards in 
both discards (`state.discard` and `state.opponentDiscard`) and decide whether to draw from our 
discard, `EthanBot`'s discard, or the deck. Let's draw from `EthanBot`'s discard which is `2`.
IN => `{"messageID": "asdf", "state": {"deck": 30, "hand": [["J", 3], ...], "subTurn": 0, ..., "activeTurn": true }}`
OUT => `{"move": 2, "messageID": "asdf"}`

### Second draw
Like the first draw, we must choose where to draw from. This time let's draw from the deck.
IN => `{"messageID": "9392", "state": {"deck": 29, "hand": [["C", 4], ...], "subTurn": 1, .., "activeTurn": true }}`
OUT => `{"move": 0, "messageID": "9392"}`

### Play move
We can now decide to play a card from our hand. Looking at `state.hand` we get `[["C", 4], ["J", 3],...]`, 
and looking at `state.playArea` we can see the cards we have already played:
```json
{
    0: {
        0: ["J", 4],
    }
    1: {
        0: ["J", 5],
        1: ["A", 2]
    }
}
```
Looking at this, it makes sense to extend our `"J"` path by placing our card `["J", 3]` to the left 
of `["J", 4]`. To do this we must choose `["J", 3]` from our hand and the chosen coordinate: `[-1, 0]`.
IN => `{"messageID": "5123", "state": {"deck": 28, "hand": [["C", 4], ["J", 3], ...], "subTurn": 2 ..., "activeTurn": true }}`
OUT => `{"move": {"card": ["J", 3], "coord": [-1, 0]}, "messageID": "5123"}`

### Discard move
Now that we've played a card, we must discard a card from our hand. We are not using any `"O"` cards
so we can safely discard the card `["O", 3]`.
IN => `{"messageID": "8124", "state": {"deck": 28, "hand": [["C", 4], ["J", 3], ...], "subTurn": 2 ..., "activeTurn": true }}`
OUT => `{"move": ["O", 3], "messageID": "8124"}`


