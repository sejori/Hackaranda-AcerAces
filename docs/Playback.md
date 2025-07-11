# Playback

You are able view `save`d matches using the `Begin Playback` menu option.  

See [Save directory structure](#save-directory-structure) for more info on save files.

There are 2 types of playback:

## Select Game
- Select a game file from a matchup (e.g. `tournamentResult/arboreum/atourney/Round1/Bot1-Bot2/games/00.json`) 

## Find Most Competitive 
- Select a `matchupResult.json` file and playback will choose the most competitve match that reflects the matchup result.
- Playback will select the game with the smallest difference between scores, and the highest scores simultaneously.
- E.g. `tournamentResult/arboreum/atourney/Round1/Bot1-Bot2/matchupResult.json`


## Save directory structure
You can find the files for a tournament in `tournamentResult`, under the game name (e.g. `tournamentResult/arboretum/`).

Within the tournament folder is the following:

```
TournamentName/
├─ Round0/
├─ Round1/
├─ Round2/
├─ Round3/
├─ results.json
```

- `results.json` is a file describing the final results and ranking of the contestants.
    - It can be used as a seeding file for knockout tournaments.
    - It contains information about the matchups in each round.
- `RoundX/` folders contain the information for a particular round, see below for more information.
    - In the case of knockout tournaments, `Round0` is the final round.
    - For round robin tournaments, `Round0` is the first round.

### Rounds

The round directories, contain every matchup that occured that round. 
```
Round1/
├─ Bot1-Bot2/
├─ Bot3-Bot4/
├─ Bot5-Bot6/
```

### Matchups

The matchup directories contain the game information:
```
Bot1-Bot2/
├─ games/
│  ├─ 00.json
│  ├─ 01.json
├─ matchupResults.json
```
- `matchupResults.json` describes the outcome of this particular matchup and each individual game.
- `games/` Contains the individual games files.
