import json
import sys

def eprint(*args, **kwargs):
    """Prints to stderr."""
    print(*args, file=sys.stderr, **kwargs)

def beginReadLine():
    while True:
        console_input = input()
        try:
            data = json.loads(console_input)
            output = {
                'move': 'RANDOM',
                'messageID': data['messageID']
            }
            print(json.dumps(output))
        except json.JSONDecodeError as e:
            eprint(f"Invalid JSON: {e}")

