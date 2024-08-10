import { MoveEventPayload,WsEvent, WsEventBuilder, WsEventType } from "@multi-player-game/common";
import { IncomingMessage } from "http";
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import { RawData, WebSocket } from "ws";

import { getLogger } from "@/logger";
import { WsRepository } from "@/repository/ws-repository";
import { GameMapService } from "@/service/map-service";
import { UserService } from "@/service/user-service";

export class WsMessageHandler {
  private readonly _logger = getLogger('WsMessageHandler');

  constructor(
    private readonly _userService: UserService,
    private readonly _gameMapService: GameMapService,
    private readonly _wsRepository: WsRepository,
  ) {
  }

  public onConnect = async (ws: WebSocket, message: IncomingMessage) => {
    this._logger.info(`${message.socket.remoteAddress} connected`);

    const query = qs.parse(message.url?.split('?')[1] ?? '');
    if (!query.user) {
      ws.send(JSON.stringify(WsEventBuilder.error(4400, 'User is required')));
      ws.close(4400, 'User is required');
      return;
    }

    const connection = this._wsRepository.getConnection(query.user as string);
    if (connection && connection.readyState === WebSocket.OPEN) {
      this._logger.error('User %s already connected', query.user);
      return ws.close(4429, `User ${query.user} already connected`);
    }

    const user = await this._userService.registerOrLoginUser(uuidv4(), query.user as string);
    this._wsRepository.saveConnection(user.name, ws);

    // add user to the default map
    await this._gameMapService.addPlayerToDefaultMap(user)

    // get and send default map state to the client
    const defaultMapState = await this._gameMapService.getDefaultMapState()
    ws.send(JSON.stringify(WsEventBuilder.mapState(defaultMapState)))

    ws.on('error', this.onError);
    ws.on('message', this.onMessage);
  }

  private onMessage = (message: RawData) => {
    let rawMessage;
    try {
      rawMessage = JSON.parse(message.toString());
    } catch (err) {
      this._logger.error('Invalid message format for %s. %s', message, err);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValidMessage = (m: any) => typeof m === 'object' && m.type && m.data;
    if (!isValidMessage(rawMessage)) {
      this._logger.error('Invalid message format: %s', rawMessage);
      return;
    }

    const wsMessage = rawMessage as WsEvent<WsEventType>;
    switch (wsMessage.type) {
      case 'MOVE':
        this.handleMoveMessage(wsMessage.data as MoveEventPayload);
        break;
      default:
        this._logger.error('Unknown message type: %s', rawMessage.type);
    }
  }

  private onError = (error: Error) => {
    console.error(error);
  }

  private handleMoveMessage = async (payload: MoveEventPayload) => {
    const ws = this._wsRepository.getConnection(payload.user);
    if (!ws) {
      this._logger.error('Connection not found for user %s', payload.user);
      return;
    }

    const user = await this._userService.getUserByName(payload.user)
    if (!user) {
      this._logger.error('User not found: %s', payload.user);
      return;
    }
    user.moveInMap(payload.direction)

    const mapState = await this._gameMapService.getDefaultMapState()
    const players = await this._gameMapService.getPlayersFromDefaultMap()
    this._wsRepository
      .getConnections(players.map(p => p.name))
      .forEach(ws => {
        ws.send(JSON.stringify(WsEventBuilder.mapState(mapState)))
      })
    this._logger.info("Move message sent to all players in map %s", mapState?.name)
  }
}
