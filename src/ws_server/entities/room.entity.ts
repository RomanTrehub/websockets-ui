import { WsWithUser } from '../types/WsData.type.js';

export default class Room {
  private usersRoomList: WsWithUser[] = [];

  constructor(
    readonly id: string,
    readonly roomCreator: WsWithUser,
  ) {
    this.usersRoomList.push(roomCreator);
  }

  getRoomUsers() {
    return this.usersRoomList;
  }

  addUserToRoom(userWs: WsWithUser) {
    this.usersRoomList.push(userWs);
  }
}
