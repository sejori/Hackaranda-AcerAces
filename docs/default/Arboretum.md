# Arboretum Default Bots
The default Arboretum bots are as follows:

## Random
A bot that performs a random move for each subTurn:
- DrawingMove:
    - It first checks where it can draw from, i.e. if there are cards in the deck, discard, and 
    opponent's discard.
    - Of those it can draw from, it selects a random card.
- PlayMove:
    - It first selects a random card from its hand.
    - It then selects a random valid coordinate to place it:
        - It iterates through the `playArea` (starting from `(0,0)`) and records every empty space 
        adjacent to a played card.
        - Of these it selects one at random.
- DiscardMove:
    - It selects a random card from its hand

## Random Message
A bot that is random and instead of calculating valid moves, just sends `RANDOM` as its move. The 
server interpets this as a request for a `RANDOM` move and calculates it on the bot's behalf.

## Random (python) and Random (csharp)
The equivalents of Random Message but using `python` and `csharp` respectively.

## Draw Deck
A bot that is random except it will always draw from the deck when possible.

## Draw Discard
A bot that is random except it will always draw from its discard pile when possible.

## Draw Opponent
A bot that is random except it will always draw from its opponent's discard pile when possible.

## Draw Most Common
A bot that is random except it will try and draw a card of the same species as is most common in its
hand.
- It looks in its hand and calculates which species it has the most cards of.
- It then looks at `discard` and `opponentDiscard`, and will draw the correct species if possible.

## Discard Lowest
A bot that is random except that it will discard the lowest ranked card in its hand.

## Discard Rarest
A bot that is random except that it will discard the rarest (`species`) card in its hand.

## Discard Priority
A bot that is random except that it uses the `priority` environment variable to prioritise discards.

## Busy
A bot originally designed to test the server with a bot that is 'busy' or thinks considerably more than
a simpler bot.

This bot is random except for when playing a card:
- It iterates through every card in its hand, and places it in every valid space in the playArea.
- It calculates the path score of each card/coord combination and plays the one that increases the total
score by the most.

## Busy Lowest
This bot is the busy and Discard Lowest bots combined.

## Busy Rarest
This bot is the busy and Discard Rarest bots combined.

## Random Spare Cards
This bot is the first that considers the right to play/score requirement. Before each play or discard,
it calculates which cards can be considered 'spare' or not vital to keep in hand. It then plays or 
discards from this selection of spare cards only. Everything else is random.

### Spare cards
To calculate which cards are spare, the bot calculates the following for each species:
- `handScore`: The sum of ranks of cards of the target species in its hand.
- `opponentHandScore`: The sum of ranks of known cards of the target species in the opponent's hand.
- `remainingScore`: The sum of ranks that are not known to be in either hand.
- `score`: The current score for the best path of the target species in the bot's play area.
- `opponentScore`: The current score for the best path of the target species in the opponent's play area.

The bot then loops through every card in hand and calculates 
`handScore - opponentHandScore - remainingScore - rank` where `rank` is the rank of the current card.
If this is positive then the card can is considered spare and is given priority `1`. If the card is 
a `7` it is given priority `0.5`.

Otherwise, if `opponentScore` is currently `0`, the card is not currently risky and is given priority
`0.6`.

Similarly, if `score - opponentScore > 0`, then the card is not currently risky and is given priority
`0.6`.

Of these, the cards with highest priority are returned as `spare` cards.

Note: there are many more opportunities here for improvement, for example: 
- Compensating for the `1` and `8` rules.
- Calculating which of the remaining cards are locked into a playArea or buried too far in a discard 
and hence shouldn't be included in `remainingScore`.
- Calculating how each card could affect each player's playArea score.
- An alternate priority system based in the mechanics of the game.
- Some sort of min-max algorithm.
- AI?

## Decent

This bot uses the spare cards functionality as above, but also creates a 'rainbow staircase' in the 
play Area:
- For the first few turns it will try to create a route from `1-8`, top left to bottom right.
- After it has done so, it will use the busy method of playing cards.
- Both of these use the spare cards.




















