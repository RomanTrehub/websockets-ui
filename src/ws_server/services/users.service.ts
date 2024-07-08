import { IUsersRepository } from '../repositories/users.repository.js';
import { RegisterInputData } from '../types/user.types.js';
import { UserInfo } from '../dtos/userDataCreator.dto.js';
import { UserRegisterError } from '../dtos/userErrorCreator.dto.js';

export interface IUsersService {
  createUser: (userData: unknown) => UserInfo | UserRegisterError;
  updateUserWins: (username: string) => void;
  getAllUsers: () => UserInfo[];
}

export class UsersService implements IUsersService {
  private validateUser(userData: unknown) {
    const userErrorMessages: string[] = [];

    if (typeof userData === 'object' && userData !== null) {
      if (!('name' in userData) || typeof userData.name !== 'string' || userData.name.length < 5) {
        userErrorMessages.push('invalid user`s name');
      }

      if (!('password' in userData) || typeof userData.password !== 'string' || userData.password.length < 5) {
        userErrorMessages.push('invalid user`s password');
      }

      return userErrorMessages.join(', ') || null;
    }

    return 'invalid user`s register data';
  }

  constructor(private usersRepo: IUsersRepository) {}

  createUser(userData: unknown) {
    const userErrorMessage = this.validateUser(userData);

    if (userErrorMessage) {
      const registerErrorMessage: UserRegisterError = {
        username: '',
        errorMessage: userErrorMessage,
      };

      if (typeof userData === 'object' && userData) {
        registerErrorMessage.username = (userData as Record<string, any>).name.toString();
      }
      return registerErrorMessage;
    }

    const newUser = this.usersRepo.createUser(userData as RegisterInputData);
    return new UserInfo(newUser);
  }

  getAllUsers() {
    const usersList = this.usersRepo.getAllUsers();
    if (!usersList.length) {
      return usersList;
    }
    return usersList.map((user) => new UserInfo(user));
  }

  updateUserWins(username: string) {
    this.usersRepo.updateUserWins(username);
  }
}
