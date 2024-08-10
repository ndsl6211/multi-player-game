import { Direction } from "@multi-player-game/common"

import { getLogger } from "@/logger";
import { Cell, CellType } from "@/model/cell";
import { GameMapSize } from "@/model/game-map-size";
import { MapPlayer, MapState } from "@/model/map-state";

export interface IGameMap {
  setCell(row: number, col: number, type: CellType): void;
  getCell(row: number, col: number): Cell;

  addPlayer(user: string): void;
  movePlayer(user: string, moveDirection: Direction): void;

  get id(): string;
  get name(): string;

  get state(): MapState;
  get players(): MapPlayer[];
}

export class GameMap implements IGameMap {
  private readonly _logger = getLogger('GameMap');
  private readonly _id: string;
  private readonly _name: string;
  private _cells: Cell[][];
  private _players: Map<string, MapPlayer> = new Map<string, MapPlayer>();

  constructor(id: string, name: string, size: GameMapSize) {
    this._id = id;
    this._name = name;
    this._cells = [];

    this._initializeMap(size);
  }

  private _initializeMap({ width, height }: GameMapSize): void {
    this._cells = Array.from(
      { length: height },
      () => Array.from(
        { length: width },
        () => new Cell(CellType.Empty)
      )
    );
  }

  public setCell(row: number, col: number, type: CellType): void {
    this._cells[row][col] = new Cell(type);
  }

  public getCell(row: number, col: number): Cell {
    return this._cells[row][col];
  }

  public addPlayer(user: string): void {
    this._players.set(user, {
      name: user,
      position: { row: 0, col: 0 }
    });
  }

  public movePlayer(user: string, moveDirection: Direction): void {
    const player = this._players.get(user);
    if (!player) {
      this._logger.error('Player %s not found', user);
      return;
    }

    const { row, col } = player.position;
    let newRow = row;
    let newCol = col;
    switch (moveDirection) {
      case Direction.UP:
        newRow = Math.max(0, row - 1);
        break;
      case Direction.DOWN:
        newRow = Math.min(this._cells.length - 1, row + 1);
        break;
      case Direction.LEFT:
        newCol = Math.max(0, col - 1);
        break;
      case Direction.RIGHT:
        newCol = Math.min(this._cells[0].length - 1, col + 1);
        break;
    }

    player.position = { row: newRow, col: newCol };
    this._logger.info('Player %s moved to (%d, %d)', user, newRow, newCol);
  }

  get players(): MapPlayer[] {
    return Array.from(this._players.values());
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get state(): MapState {
    return {
      name: this._name,
      width: this._cells[0].length,
      height: this._cells.length,
      players: Array.from(this._players.values()),
      obstacles: [],
      //obstacles: this._cells.flatMap(
        //(row, rowIndex) => row.map(
          //(cell, colIndex) => ({
            //id: `${rowIndex}-${colIndex}`,
            //row: rowIndex,
            //col: colIndex,
          //})
        //)
      //)
    };
  }
}
