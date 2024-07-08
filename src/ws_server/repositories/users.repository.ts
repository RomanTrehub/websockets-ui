import { User } from '../entities/user.entity.js';

export interface IUsersRepository {
  getAllUsers: () => User[];
  createUser: (data: { name: string; password: string }) => User;
  getUser: (username: string) => User;
  updateUserWins: (username: string) => User;
}

export class UsersRepository implements IUsersRepository {
  private usersStore = new Map<string, User>();

  getAllUsers() {
    return Array.from(this.usersStore.values());
  }

  getUser(username: string) {
    return this.usersStore.get(username)!;
  }

  createUser(data: { name: string; password: string }) {
    const foundUser = this.getUser(data.name);
    if (foundUser) {
      return foundUser;
    }
    const newUser = new User(data.name, data.password);
    this.usersStore.set(data.name, newUser);
    return newUser;
  }

  updateUserWins(username: string) {
    const foundUser = this.getUser(username);
    if (foundUser) {
      foundUser.wins += 1;
    }
    return foundUser;
  }
}
