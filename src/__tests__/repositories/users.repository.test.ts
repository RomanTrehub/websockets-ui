import { User } from '../../ws_server/entities/user.entity.js';
import { UsersRepository } from '../../ws_server/repositories/users.repository.js';

const mappedUsers = new Map<string, User>();

const newUser = new User('testUser', 'pass');
mappedUsers.set('testUser', newUser);

describe('Users repository', () => {
  const userRepo = new UsersRepository();

  jest.replaceProperty(
    userRepo,
    // @ts-ignore
    'usersStore',
    mappedUsers,
  );

  it('should return allUsers', () => {
    const allUsers = userRepo.getAllUsers();

    expect(allUsers).toMatchObject([newUser]);
  });

  it('should return new user', () => {
    const inputData = { name: 'testUser3', password: 'pass' };
    const createdUser = userRepo.createUser(inputData);

    expect(createdUser).toMatchObject(inputData);
  });

  it('should return the same users length after crating user', () => {
    const dbLength = userRepo.getAllUsers().length;
    const inputData = { name: 'testUser', password: 'pass' };
    userRepo.createUser(inputData);

    expect(userRepo.getAllUsers().length).toBe(dbLength);
  });

  it('should update user wins field', () => {
    const username = 'testUser';
    const selectedUserWins = userRepo.getUser(username)!.wins;
    const updatedUserWins = userRepo.updateUserWins(username)?.wins;

    expect(selectedUserWins + 1).toBe(updatedUserWins);
  });
});
