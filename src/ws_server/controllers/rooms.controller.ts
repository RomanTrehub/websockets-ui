import { WsWithUser } from '../types/WsData.type.js';
import { IRoomsService } from '../services/rooms.service.js';
import { AddUserInput, UpdateRoomOutput } from '../types/room.types.js';

export default class RoomsController {
  createRoom(ws: WsWithUser) {
    return this.roomsService.createRoom(ws);
  }

  addUserToRoom(data: AddUserInput, ws: WsWithUser) {
    const { indexRoom } = data;
    const returnedUsers = this.roomsService.addUserToRoom(indexRoom, ws);

    return returnedUsers;
  }

  getRoomList(): UpdateRoomOutput {
    const roomsList = this.roomsService.getRoomsList();
    return roomsList.map((room) => {
      const roomUsers = room.getRoomUsers().map((roomUser) => ({ index: roomUser.user.id, name: roomUser.user.name }));

      return {
        roomId: room.id,
        roomUsers,
      };
    });
  }

  constructor(private roomsService: IRoomsService) {}
}
