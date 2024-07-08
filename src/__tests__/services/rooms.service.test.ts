import Room from '../../ws_server/entities/room.entity.js';
import RoomsServices from '../../ws_server/services/rooms.service.js';
import { WsWithUser } from '../../ws_server/types/WsData.type.js';

describe('Rooms service', () => {
  const roomsService = new RoomsServices();
  let createdRoom: Room | null = null;
  const ws = { user: { id: '1' } } as WsWithUser;
  const anotherWs = { user: { id: '2' } } as WsWithUser;

  it('should create new room and return rooms list with created room', () => {
    createdRoom = roomsService.createRoom(ws);
    expect(createdRoom).toBeInstanceOf(Room);
    expect(roomsService.getRoomsList()[0]).toBeInstanceOf(Room);
  });

  it('should return null instead new room', () => {
    const createdRoom = roomsService.createRoom(ws);
    expect(createdRoom).toBe(null);
    expect(roomsService.getRoomsList().length).toBe(1);
  });

  it('should add new user to room and return updated users list list', () => {
    roomsService.createRoom(anotherWs);
    const returnedUsers = roomsService.addUserToRoom(createdRoom!.id, anotherWs);
    expect(returnedUsers.length).toBe(2);

    const availableRooms = roomsService.getRoomsList();
    expect(availableRooms).toMatchObject([]);
  });
});
