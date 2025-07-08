# Tictactoe Default Bots
The default tictactoe bots are as follows:

## Random
A bot that performs a random move by selecting a random, empty square on the board.

## FirstMoveCorner
A bot that is random except that its first move (when it goes first) is always in a corner.

## FirstMoveMiddle
A bot that is random except that its first move (when it goes first) is always in the middle.

## FirstMoveSide
A bot that is random except that its first move (when it goes first) is always in the middle.

## Takes Win
Takes Win is random unless it can win on its next move, in which case it will play the winning move.

## Avoids Loss
Avoids Loss is random unless it can prevent a loss on its next move, in which case it will play the
move to prevent the loss.

## Takes Ws Avoids Ls
This bot combines both Takes Win and Avoids Loss. It will play random unless it can win with its next
move, or prevent a loss with its next move.

## Perfect
This bot uses a min-max algorithm to calculate the best possible move. It recusively plays every move 
and ranks the outcomes, minimising the opponent's chance of winning while maximising its chance of 
winning.
