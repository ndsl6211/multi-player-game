import { IGameMap } from "@/model/game-map";
import { GameMapRepository } from "@/repository/gamemap-repository";

export class MemGameMapRepository implements GameMapRepository {
  private maps: Map<string, IGameMap> = new Map();

  public async save(gameMap: IGameMap): Promise<void> {
    this.maps.set(gameMap.id, gameMap);
  }

  public async getById(id: string): Promise<IGameMap | undefined> {
    return this.maps.get(id);
  }
}
