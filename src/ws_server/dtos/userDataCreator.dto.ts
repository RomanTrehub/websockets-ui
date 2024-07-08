import type { User } from '../entities/user.entity.js';
import { RegisterOutputData } from '../types/user.types.js';

export default class UserDataCreator implements RegisterOutputData {
  readonly error = false;
  readonly errorText = '';
  readonly name: string;
  readonly index: string;

  constructor(user: UserInfo) {
    this.name = user.name;
    this.index = user.id;
  }
}

export class UserInfo {
  readonly id: string;
  readonly wins: number;
  readonly name: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.wins = user.wins;
  }
}
