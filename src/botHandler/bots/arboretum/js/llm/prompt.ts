import type { move, playerState } from "./types.js";

export function prompt(state: playerState<move>) {
  const rules = `How to play:
On her turn, a player must, in order: draw 2 cards, play 1 card
into her arboretum, and end her turn by discarding 1 card. The
game continues with the next player in clockwise order taking
their turn.
Draw 2 cards
Draw 2 cards, one after the other. Cards may be drawn
from the top of the face-down draw pile, or the top of
any player’s face-up discard pile (including one’s own
discard pile). These 2 cards may be drawn from the same
or different piles.
Play a card from your hand into your arboretum
On your first turn, place a card from your hand face
up in front of you. This is the start of your arboretum.
In following turns, cards must be placed adjacent
(horizontally or vertically) to previously placed cards.
Once a card has been placed, it may not be removed,
moved or covered by another card.
Discard a card
At the end of your turn, you must discard a card into your
discard pile (see example on page 3), so that you have exactly
7 cards in hand.
Scoring
The game ends when there are no further cards in the
draw pile. The player who drew the last card plays her
turn normally, and then scoring occurs
Gaining the right to score paths
A path is a sequence of cards of increasing value, where
the first and last cards are of the same color. The dealer
names each color, one after the other (referring to the
score pad).
For each color, the players reveal each card in their hand
matching that color. The player who has the highest sum
in a given color gains the right to score points for a single
path matching that color in
her arboretum. In case of
a tie, all tied players gain
the right to score one
path of that color.
Exception: If a player has the 8 of a color in her hand, but
one of her opponents has the 1 of the same color in his
hand, the value of the 8 is reduced to 0 when determining
which player has the right to score paths of a particular
color. The 1 is always worth 1. (See scoring example.)
Note: It is possible to gain the right to score points of a
color of path that is not present in your arboretum.
If no player has cards of a particular color in their hand,
then all players have the right to score points for paths of
that color.
Scoring the paths
Along a path, each card must be greater in value than
the one preceding it. Therefore, the smallest possible
path is made up of 2 cards of the same color, and the
longest is made up of 8 cards (this path must start with
a 1 and end with an 8). The only cards that must match
the color being evaluated are those at the start and
end of the path; the color of the cards in between are
only of importance in determining the value of a path.
Points are scored according to the following rules:
A) Score 1 point for each card in the path.
B) Score 1 additional point for each card in the path
if it is made up of at least 4 cards and they are all the
same color.
C) Score 1 additional point if the path begins with a 1.
D) Score 2 additional points if the path ends with an 8.
Note: A tree may be used in more than one path.
  `;
  return (
    "\nUser: You'll never discourage me - try your worst" +
    JSON.stringify(state.previousTurn) +
    "\nThe Negotiator:"
  );
}
