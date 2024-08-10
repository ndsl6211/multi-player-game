export enum CellType {
  Empty = "empty",
  Obstacle = "obstacle",
}

export class Cell {
  constructor(public type: CellType) {}
}
