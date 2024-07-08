import {
  INVALID_USER_REG_DATA,
  USER_NAME_ERROR,
  USER_PASS_ERROR,
} from '../../ws_server/constants/errorMessages.constants.js';
import { UserInfo } from '../../ws_server/dtos/userDataCreator.dto.js';
import type { UserRegisterError } from '../../ws_server/dtos/userErrorCreator.dto.js';
import { User } from '../../ws_server/entities/user.entity.js';
import { IUsersRepository } from '../../ws_server/repositories/users.repository.js';
import { UsersService } from '../../ws_server/services/users.service.js';

describe('Users service', () => {
  const createUserMethod = jest.fn();
  const getUserMethod = jest.fn();
  const updateUserWinsMethod = jest.fn();
  const getAllUsersMethod = jest.fn();

  class MockRepoClass implements IUsersRepository {
    createUser = createUserMethod;
    getUser = getUserMethod;
    updateUserWins = updateUserWinsMethod;
    getAllUsers = getAllUsersMethod.mockReturnValue([]);
  }

  const newMockedUser = new User('testuser', 'pass');

  const usersService = new UsersService(new MockRepoClass());

  describe('User creation', () => {
    it('should create new user', () => {
      createUserMethod.mockResolvedValue(newMockedUser);

      const data = { name: 'testuser', password: 'passs' };
      const user = usersService.createUser(data);

      expect(createUserMethod).toHaveBeenCalledWith(data);
      expect(createUserMethod).toHaveBeenCalledTimes(1);
      expect(user).toBeInstanceOf(UserInfo);
    });

    describe('user validation errors', () => {
      beforeEach(() => {
        createUserMethod.mockClear();
      });

      it('should return name + pass error message', () => {
        const unavailableUserData: Record<string, any> = { name: 9090, password: '' };
        const returnedContent = usersService.createUser(unavailableUserData) as UserRegisterError;

        expect(createUserMethod).toHaveBeenCalledTimes(0);
        expect(returnedContent.username).toBe(unavailableUserData.name.toString());
        expect(returnedContent.errorMessage).toBe(`${USER_NAME_ERROR}, ${USER_PASS_ERROR}`);
      });

      it('should return pass error message', () => {
        const unavailableUserData = { name: 'username', password: '' };
        const returnedContent = usersService.createUser(unavailableUserData) as UserRegisterError;
        expect(createUserMethod).toHaveBeenCalledTimes(0);
        expect(returnedContent.username).toBe(unavailableUserData.name.toString());
        expect(returnedContent.errorMessage).toBe(USER_PASS_ERROR);
      });

      it('should return username error message', () => {
        const unavailableUserData = { name: 'asd', password: 'asdasdaa' };
        const returnedContent = usersService.createUser(unavailableUserData) as UserRegisterError;
        expect(createUserMethod).toHaveBeenCalledTimes(0);
        expect(returnedContent.username).toBe(unavailableUserData.name.toString());
        expect(returnedContent.errorMessage).toBe(USER_NAME_ERROR);
      });

      it('should return user`s data error message', () => {
        const unavailableUserData = 'error';
        const returnedContent = usersService.createUser(unavailableUserData) as UserRegisterError;
        expect(createUserMethod).toHaveBeenCalledTimes(0);
        expect(returnedContent.username).toBe('');
        expect(returnedContent.errorMessage).toBe(INVALID_USER_REG_DATA);
      });
    });
  });

  describe('Update user`s wins', () => {
    it('should return updated user', () => {
      usersService.updateUserWins('user');

      expect(updateUserWinsMethod).toHaveBeenCalledTimes(1);
    });

    it('should return All users', () => {
      usersService.getAllUsers();

      expect(getAllUsersMethod).toHaveBeenCalledTimes(1);
    });
  });
});
