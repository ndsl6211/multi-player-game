export interface Point {
  row: number;
  col: number;
}

export interface MapPlayer {
  name: string;
  position: Point;
}

export interface MapState {
  name: string;
  width: number;
  height: number;
  players: MapPlayer[];
  obstacles: any[];
}

export type WsEventType = "MAP_STATE" | "MOVE" | "ERROR"

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}

export interface MoveEventPayload {
  user: string;
  direction: Direction;
}

export interface MapStateEventPayload {
  mapState: MapState;
}

interface ErrorEventPayload {
  code: number
  message: string
}

export type EventData = MoveEventPayload | MapStateEventPayload | ErrorEventPayload

export interface WsEvent<T extends WsEventType> {
  type: T
  data:
    T extends "MAP_STATE" ? MapStateEventPayload :
    T extends "MOVE" ? MoveEventPayload :
    T extends "ERROR" ? ErrorEventPayload :
    never
}

export class WsEventBuilder {
  static mapState(mapState: MapState): WsEvent<"MAP_STATE"> {
    return {
      type: "MAP_STATE",
      data: { mapState }
    }
  }

  static move(user: string, direction: Direction): WsEvent<"MOVE"> {
    return {
      type: "MOVE",
      data: { user, direction }
    }
  }

  static error(code: number, message: string): WsEvent<"ERROR"> {
    return {
      type: "ERROR",
      data: { code, message }
    }
  }
}
