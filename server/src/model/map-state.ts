import { Direction } from '@multi-player-game/common'

import { Point } from "@/model/point";

export interface MapPlayer {
  name: string;
  position: Point;
}

export interface MapState {
  name: string;
  width: number;
  height: number;
  players: MapPlayer[];

  // TODO: Define the type of the obstacles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obstacles: any[];
}

export interface UpdateMapStateRequest {
  mapId: string;
  playerName: string;
  movingDirection: Direction;
}
