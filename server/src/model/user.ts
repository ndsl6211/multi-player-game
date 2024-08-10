import { Direction } from "@multi-player-game/common";

import { getLogger } from "@/logger";
import { IGameMap } from "@/model/game-map";

export interface IUser {
  setCurrentMap(map: IGameMap): void;
  moveInMap(direction: Direction): void;

  get id(): string;
  get name(): string;
}

export class User implements IUser {
  private readonly _logger = getLogger('User');
  private currentMap: IGameMap | undefined;

  constructor(
    private readonly _id: string,
    private readonly _name: string
  ) {}

  public setCurrentMap(map: IGameMap): void {
    this.currentMap = map
  }

  public moveInMap(direction: Direction): void {
    if (!this.currentMap) {
      this._logger.error('User is not in any map');
      return;
    }

    this.currentMap.movePlayer(this._name, direction);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}
