# Bots

## Creating a Bot
To create a bot, you must create a Console Application that satisfies the [API](./API.md).
It is recommended to create the bot as a separate project, but feel free to reference, or even use, the
default bots (`/src/defaultBots/...`) as a starting point.

The bot must be a docker image, you can build individually using the following command:
`docker build -t {image name} --platform linux/arm64,linux/amd64 {bot directory}`
where: 
- `{image name}` is the name of the image (referencing your docker hub details if you have them)
    - If you have docker hub details (we recommend making them for ease of sharing bots), your image name should be of the form `{dockerUsername}/{repository}:{botName}`
    - `{repository}` should be used for all of your bots and can be any consistent name
    - `{botName}` can also be anything you choose.
    - E.g. `pillari3/hackaranda:arboretum-random`
- `{bot directory}` is the directory that contains the `DockerFile`

For the final tournament, we will collect all bots either through docker hub, or by github and we will
build them manually.
- You can push the images to docker hub with the following command: `docker push {image name}`
- E.g. `docker push pillari3/hackaranda:arboretum-random`

## Registering Bots
Bots for a particular `game` are registered under `/bots/{game}/`, using a JSON format:
```json
{
    "dockerId": "arboretum-random-priority-bot",
    "identifier": "Random Priority",
    "variables": ["priority=12345678"],
    "path": "./js/randomPriority"
},
```
Where:
- `"dockerId"` is the docker Id of the bot, this can be the local image or one you have put on 
dockerHub
- `"identifier"` is the unique name the bot will be referred to within a tournament
- `"variables"` are any environment variables the bot makes use of
    - For example, the `Random Priority` bot uses the `priority` variable to decide which cards
    to discard first
- `"path"` is for manually building the default bots and is not necessary for others if they are 
on dockerHub or already built

## Groups of bots

When selecting bots for tournaments, you can select them from a group. For example, the default groups 
for Arboretum are `defaultBots.json`, `128RandomMessageBots.json`, and `priorityBots.json`.

You can create new groups by adding `.json` files to the `/bots/{game}/` directory. They must consist 
of an array containing bots of the above form.

You can also add bots to existing groups by appending them to the json array.

Note: It may be useful to use a JSON checker to validate the json files if there are any issues.

## Default Bots
Default bots are located in `src/defaultBots/`  
- [Tictactoe Default Bots](/docs/default/Tictactoe.md)  
- [Arboretum Default Bots](/docs/default/Arboretum.md)  
