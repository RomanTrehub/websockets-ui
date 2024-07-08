import createUniqId from '../utils/createUniqId.js';

export class User {
  wins: number;
  readonly id = createUniqId();

  constructor(
    readonly name: string,
    readonly password: string,
  ) {
    this.wins = 0;
  }
}
