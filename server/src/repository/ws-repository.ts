import { WebSocket } from "ws"

import { getLogger } from "@/logger";

export interface IWsRepository {
  saveConnection(userId: string, connection: WebSocket): void
  getConnection(userId: string): WebSocket | undefined
  getConnections(userIds: string[]): WebSocket[]
}

export class WsRepository implements IWsRepository {
  private _logger = getLogger('WsRepository');
  private _connections: Map<string, WebSocket> = new Map<string, WebSocket>();

  constructor() {
    setInterval(() => this._deleteBrokenConnection(), 1000);
  }

  public saveConnection(userId: string, connection: WebSocket): void {
    this._connections.set(userId, connection);
  }

  public getConnection(userId: string): WebSocket | undefined {
    return this._connections.get(userId) ?? undefined;
  }

  public getConnections(userIds: string[]): WebSocket[] {
    return userIds.map(userId => this.getConnection(userId)).filter(Boolean) as WebSocket[];
  }

  private _deleteBrokenConnection(): void {
    this._logger.info('Checking broken connections');
    this._connections.forEach((connection, userId) => {
      if (connection.readyState !== WebSocket.OPEN) {
        this._connections.delete(userId);
      }
    });
  }
}
