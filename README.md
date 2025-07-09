# Hackaranda

## Table of Contents
### Setup and basic functionality
- [Setup](#setup)
- [Start](#start)
- [Quit](#quit)
- [Begin Best Of](#begin-best-of)
- [Tournaments](#tournaments)  
### [API](docs/API.md)
- [General API](docs/API.md#general-api)
- [TicTacToe API](docs/API.md#tictactoe)
- [Arboretum API](docs/API.md#arboretum)
### [Bots](docs/Bots.md)
- [Creating a Bot](docs/Bots.md#creating-a-bot)
- [Registering Bots](docs/Bots.md#registering-bots)
- [Groups of Bots](docs/Bots.md#groups-of-bots)
- [Default Bots](docs/Bots.md#default-bots)
    - [Tictactoe](docs/default/Tictactoe.md)
    - [Arboretum](docs/default/Arboretum.md)

## Setup

Install node: [https://nodejs.org/en/download/current]


Install Docker: [https://www.docker.com/]

Ensure Docker is running.

Download or `git clone` this repository. Open a terminal at its location and run the following:


1. Install dependencies with the following command:
```
npm i
```

2. Build with the following command:
```
npm run build
```

## Start

Note: On first start, select the `Build Default Bots` option. Once built, you will need to start again.

To start the CLI, enter the following command: 
```
npm start
```

## Quit
To quit at any point, hold `ctrl+c`


## Begin Best Of
Note: In 'Begin Best Of', only the first 2 selected players will play

1. Choose type of game:
    - Select which game you want to play (i.e. tictactoe or arboretum)
    - Press `enter` to select
2. Enter a unique tournament name:
    - Type a unique tournament name or leave the default and press `enter`.
3. Choose best of:
    - Choose number of games to play and press `enter`.
4. Which players? 
    - Random:
        - Use only default random bots
    - fromFile:
        1. Select a file (`enter`)
        2. Choose bots from file:
            - Press `tab` to select/deselect, `ctrl + a` to toggle all, `enter` to proceed
  
5. Message timeout (ms):
    - The maximum time a bot can spend before it reaches a timeout and the server will play a random move on its behalf.
    - Enter a value or use default and `enter`.
6. User plays?
    - play: 
        - Enter a name/user identifier
    - don't play

## Tournaments
Play a tournament by selecting 'Begin Tournament'.

The menu options are similar to 'Begin Best Of' but with some changes.

- Choose type of tournament:
    - Round robin
        - A league style tournament where every bot plays every other bot once
    - Knockout
        - A single chance tournament where bots are knocked out until one remains
- Number of players:
    - Tournaments will fill up with the default random bots to reach the number of players required.
    - Knockout tournaments will use the next largest power of 2
- Choose Seeding (Knockout tournament only):
    - Random
        - Use a randomly generated seeding
    - Choose File
        - Tournament results can be used as seeding, they are stored in `./tournamentResults`

# API

See the API documentation here: [API](/docs/API.md)


# Bots

See the Bots documentation here: [Bots](/docs/Bots.md)
