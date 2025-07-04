import json
import sys
from handleMove import handleMove


def eprint(*args, **kwargs):
    """Prints to stderr."""
    print(*args, file=sys.stderr, **kwargs)


def sendMove(move, messageID):
    """Sends the move to the game server."""
    output = {"move": move, "messageID": messageID}
    print(json.dumps(output))


def handleNewGame(gameNumber, messageID):
    response = {"result": "accepted", "gameNumber": gameNumber}
    sendMove(response, messageID)


def beginReadLine():
    while True:
        console_input = input()
        try:
            ## if the input is empty, continue to the next iteration
            if not console_input.strip():
                continue

            ## parse the input as JSON
            data = json.loads(console_input)
            state, messageID = data.get("state"), data.get("messageID")

            ## handle new game and end game state
            if state.message == "NEWGAME":
                handleNewGame(state)
                continue

            ## handle not active turn
            if not state.activeTurn:
                eprint(f"Not active turn: {state.activeTurn} != {state.playerID}")
                sendMove(0, messageID)
                continue

            ## handle active turn
            move = handleMove(state)
            sendMove(move, messageID)

        except:
            eprint(f"Error: {sys.exc_info()[0]}")
