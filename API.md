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

### Language examples

#### Python

- `input()` waits for input from the Console until a new line character.

#### JS
- 


## Bot to Server

- The bot must respond with its chosen move via the console (stdout) with JSON in the form:

``` json
{
  "move": "chosen move",
  "messageID": "The corresponding messageID"
}
```
