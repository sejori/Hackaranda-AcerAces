from openai import OpenAI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pydantic import Field
from typing import Literal, Tuple
# Load environment variables from a .env file and override existing ones
load_dotenv(override=True)

client = OpenAI()

class DiscardMessage(BaseModel):
    card: str = Field(
        ...,
        pattern=r"^[JRCMOW][1-8]$"
    )

class PlayCardMessage(BaseModel):
    card: str = Field(
        ...,
        pattern=r"^[JRCMOW][1-8]$"
    )
    coord: list[int, int]

class DrawCardMessage(BaseModel):
    drawPile: int

def handleMove(state):
    """
    Handle move based on the current subTurn in the player state.
    
    Args:
        state: playerState object containing game state and subTurn
        
    Returns:
        The appropriate move based on the current subTurn
    """
    sub_turn = state.get('subTurn', 0)
    
    if sub_turn == 0 or sub_turn == 1:
        return drawMove(state)
    elif sub_turn == 2:
        return playMove(state)
    elif sub_turn == 3:
        return discardMove(state)
    else:
        # Default case if subTurn is unexpected
        return drawMove(state)

def drawMove(state):
    response = client.responses.parse(
        model="gpt-4o-2024-08-06",
        input=[
            {"role": "system", "content": "Decide which drawpile to draw from, respond with just an integer. 0, 1, or 2."},
            { "role": "user", "content": f"Current state: {state}" },
            
        ],
        text_format=DrawCardMessage,
    )
    parsed_response = response.output_parsed
    draw_pile = parsed_response.drawPile
    return draw_pile
    

def playMove(state):
    response = client.responses.parse(
        model="gpt-4o-2024-08-06",
        input=[
            {"role": "system", "content": "Decide which card to play and where to place it, card is a string with the format 'suit rank' (e.g., regex pattern ^[JRCMOW][1-8]$) and coord is a tuple of integers (x, y)"},
            { "role": "user", "content": f"Current state: {state}" },
            
        ],
        text_format=PlayCardMessage,
    )
    parsed_response = response.output_parsed
    played_card = parsed_response.card
    coord = parsed_response.coord
    return {
        "card": played_card,
        "coord": coord
    }

def discardMove(state):
    response = client.responses.parse(
        model="gpt-4o-2024-08-06",
        input=[
            {"role": "system", "content": "Decide which card to discard, respond with just a string in the format 'suit rank' (e.g., (e.g., regex pattern ^[JRCMOW][1-8]$))"},
            { "role": "user", "content": f"Current state: {state}" },
            
        ],
        text_format=DiscardMessage,
    )
    parsed_response = response.output_parsed
    discard = parsed_response.card
    return discard

