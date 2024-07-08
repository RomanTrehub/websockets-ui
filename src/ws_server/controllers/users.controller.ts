import { WebSocket } from 'ws';
import { IUsersService } from '../services/users.service.js';
import { OutputEvents } from '../constants/wsEvents.constants.js';
import { WsWithUser } from '../types/WsData.type.js';
import { UpdateWinnersOutputData } from '../types/user.types.js';
import { UserErrorCreator } from '../dtos/userErrorCreator.dto.js';
import UserDataCreator, { UserInfo } from '../dtos/userDataCreator.dto.js';
import createWsResponse from '../utils/createWsResponse.js';

export default class UsersController {
  registerUser(data: unknown, ws: WebSocket) {
    const returnedData = this.usersService.createUser(data);
    if (returnedData instanceof UserInfo) {
      (ws as WsWithUser).user = returnedData;
      return ws.send(createWsResponse({ resType: OutputEvents.REG, data: new UserDataCreator(returnedData) }));
    }
    ws.send(createWsResponse({ resType: OutputEvents.REG, data: new UserErrorCreator(returnedData) }));
  }

  getWinnersList(): UpdateWinnersOutputData {
    const users = this.usersService.getAllUsers();
    return !users.length ? [] : users.map((user) => ({ name: user.name, wins: user.wins }));
  }

  constructor(private usersService: IUsersService) {}
}
