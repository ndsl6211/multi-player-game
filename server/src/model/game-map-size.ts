export class GameMapSize {
  public static readonly SMALL = new GameMapSize(10, 10);
  public static readonly MEDIUM = new GameMapSize(20, 20);
  public static readonly LARGE = new GameMapSize(30, 30);

  constructor(public readonly width: number, public readonly height: number) {}
}
