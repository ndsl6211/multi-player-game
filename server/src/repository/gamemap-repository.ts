import { IGameMap } from "@/model/game-map";

export interface GameMapRepository {
  save(gameMap: IGameMap): Promise<void>;
  getById(id: string): Promise<IGameMap | undefined>;
}
