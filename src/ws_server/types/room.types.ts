export type AddUserInput = { indexRoom: string };
export type UpdateRoomOutput = { roomId: string; roomUsers: { name: string; index: string }[] }[];
