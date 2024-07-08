import Room from '../entities/room.entity.js';
import { WsWithUser } from '../types/WsData.type.js';
import createUniqId from '../utils/createUniqId.js';

export interface IRoomsService {
  createRoom: (ws: WsWithUser) => Room | null;
  addUserToRoom: (roomId: string, ws: WsWithUser) => WsWithUser[];
  getRoomsList: () => Room[];
}

export default class RoomsService implements IRoomsService {
  private roomsList: Map<string, Room> = new Map();

  private removeRoom(roomId: string) {
    return this.roomsList.delete(roomId);
  }

  private checkUserHasRoom(ws: WsWithUser) {
    const roomList = this.getRoomsList();
    return roomList.find((room) => room.getRoomUsers()[0].user.id === ws.user.id);
  }

  createRoom(ws: WsWithUser) {
    let createdRoom: Room | null = null;
    if (!this.checkUserHasRoom(ws)) {
      const idRoom = createUniqId();
      const newRoom = new Room(idRoom, ws);

      this.roomsList.set(idRoom, newRoom);
      createdRoom = newRoom;
    }
    return createdRoom;
  }

  getRoomsList() {
    return Array.from(this.roomsList.values());
  }

  addUserToRoom(roomId: string, userWs: WsWithUser) {
    const foundRoom = this.roomsList.get(roomId)!;
    foundRoom.addUserToRoom(userWs);
    this.removeRoom(roomId);

    const foundUserRoom = this.checkUserHasRoom(userWs);
    if (foundUserRoom) {
      this.removeRoom(foundUserRoom.id);
    }

    return foundRoom.getRoomUsers();
  }
}
