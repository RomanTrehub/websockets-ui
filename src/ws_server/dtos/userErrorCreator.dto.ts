import { RegisterOutputData } from '../types/user.types.js';

export class UserErrorCreator implements RegisterOutputData {
  readonly name: string = '';
  readonly index = '';
  readonly error = true;
  readonly errorText: string;

  constructor({ errorMessage, username }: UserRegisterError) {
    this.errorText = errorMessage;
    this.name = username;
  }
}

export type UserRegisterError = {
  username: string;
  errorMessage: string;
};
