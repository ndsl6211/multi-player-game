import { v4 as uuidv4 } from 'uuid';

import { getLogger } from "@/logger";
import { GameMap, IGameMap } from "@/model/game-map";
import { GameMapSize } from "@/model/game-map-size";
import { MapPlayer, MapState, UpdateMapStateRequest } from "@/model/map-state";
import { User } from "@/model/user";
import { GameMapRepository } from "@/repository/gamemap-repository";

export interface CreateMapRequest {
  name: string;
  size: GameMapSize;
}

export class GameMapService {
  private readonly _logger = getLogger('GameMapService');
  private _defaultMapId: string | undefined = undefined;

  constructor(private readonly _gameMapRepository: GameMapRepository) {
  }

  public async createDefaultMap(): Promise<IGameMap> {
    if (this._defaultMapId) {
      this._logger.warn('Default map already exists');
      const defaultMap = await this._gameMapRepository.getById(this._defaultMapId);
      return defaultMap as IGameMap;
    }

    const gameMap = new GameMap(uuidv4(), 'Default Map', GameMapSize.SMALL);
    await this._gameMapRepository.save(gameMap);
    this._defaultMapId = gameMap.id;

    this._logger.info('Default map created');
    return gameMap;
  }

  public async addPlayerToDefaultMap(user: User): Promise<void> {
    if (!this._defaultMapId) {
      this._logger.error('Default map not found');
      return
    }

    this.addPlayer(this._defaultMapId, user);
  }

  public async create({ name, size }: CreateMapRequest): Promise<IGameMap> {
    const gameMap = new GameMap(uuidv4(), name, size);
    await this._gameMapRepository.save(gameMap);

    this._logger.info(`Map ${name} created`);
    return gameMap;
  }

  public async addPlayer(mapId: string, user: User): Promise<void> {
    const map = await this._gameMapRepository.getById(mapId)
    if (!map) {
      this._logger.error(`Map with id ${mapId} not found`);
      return;
    }

    map.addPlayer(user.name);
    user.setCurrentMap(map);
    await this._gameMapRepository.save(map);

    this._logger.info(`User ${user.name} added to map ${map.name}`);
  }

  public async getDefaultMapState(): Promise<MapState> {
    if (!this._defaultMapId) {
      const errMessage = 'Default map not found';
      this._logger.error(errMessage);
      throw new Error(errMessage);
    }

    const defaultMap = await this.getGameMapState(this._defaultMapId);
    return defaultMap as MapState;
  }

  public async updateMapState(mapId: string, request: UpdateMapStateRequest): Promise<void> {
    const map = await this._gameMapRepository.getById(mapId)
    if (!map) {
      this._logger.error(`Map with id ${mapId} not found`);
      return;
    }

    const player = map.players.filter(mp => mp.name === request.playerName)
    if (player.length !== 1) {
      this._logger.error(`Player ${request.playerName} not found in map ${map.name}`);
      return;
    }

    map.movePlayer(request.playerName, request.movingDirection);
    await this._gameMapRepository.save(map);

    this._logger.info(`Map ${map.name} updated`);
  }

  public async getGameMapState(mapId: string): Promise<MapState | undefined> {
    const map = await this._gameMapRepository.getById(mapId)
    if (!map) {
      this._logger.error(`Map with id ${mapId} not found`);
      return;
    }

    return map.state;
  }

  public async getPlayersFromDefaultMap(): Promise<MapPlayer[]> {
    if (!this._defaultMapId) {
      this._logger.error('Default map not found');
      return [];
    }

    return this.getPlayersFromMap(this._defaultMapId);
  }

  public async getPlayersFromMap(madId: string): Promise<MapPlayer[]> {
    const map = await this._gameMapRepository.getById(madId)
    if (!map) {
      this._logger.error(`Map with id ${madId} not found`);
      return [];
    }

    return map.players;
  }
}
