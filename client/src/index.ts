import process from 'process';
import readline from 'readline';

import WebSocket from "ws"
import { WsEvent, WsEventType, MapStateEventPayload, MoveEventPayload, Direction } from "@multi-player-game/common"

function printMap(playerName: string, payload: MapStateEventPayload): void {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  readline.cursorTo(process.stdout, 0, 0);

  const mapState = payload.mapState;
  const messageTitle = `Hi, ${playerName}\npress q to exit, or use W/A/S/D to move player`;
  const mapTitle = `====== ${mapState.name} ======`;
  const mapGrids: string[][] = Array.from(
    { length: mapState.height },
    () => Array.from(
      { length: mapState.width },
      () => '.'
    )
  )

  mapState.players.forEach(player => {
    if (player.name === playerName) {
      mapGrids[player.position.row][player.position.col] = 'X'
    } else {
      mapGrids[player.position.row][player.position.col] = 'O'
    }
  })

  const mapGridsString = mapGrids.map(row => row.join('')).join('\n')

  process.stdout.write(`${messageTitle}\n${mapTitle}\n${mapGridsString}`)
}

(async () => {
  const user = process.argv[2]
  const ws = new WebSocket(`ws://localhost:8080/ws?user=${user}`);

  ws.onopen = () => {
    console.log('Connected to server');
  }

  ws.onmessage = (message: WebSocket.MessageEvent) => {
    let rawMessage;
    try {
      rawMessage = JSON.parse(message.data.toString());
    } catch (err) {
      console.error('Invalid message format: %s', message.data);
      return;
    }

    const wsMessage = rawMessage as WsEvent<WsEventType>;
    switch (wsMessage.type) {
      case 'MAP_STATE':
        printMap(user, wsMessage.data as MapStateEventPayload)
        break;
      default:
        console.error('Unknown message type: %s', rawMessage.type);
    }
  }

  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on('keypress', (_, key) => {
    if (key && key.name == 'q') {
      process.exit();
    }

    const keyDirectionMap = {
      w: Direction.UP,
      s: Direction.DOWN,
      a: Direction.LEFT,
      d: Direction.RIGHT,
    }

    const direction = keyDirectionMap[key.name as keyof typeof keyDirectionMap];
    if (!direction) {
      return;
    }

    const moveEvent: MoveEventPayload = { user, direction }
    ws.send(JSON.stringify({ type: 'MOVE', data: moveEvent }))
  });
})()
