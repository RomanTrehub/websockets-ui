export enum UsersEvents {
  REG = 'reg',
  UPDATE_WINNERS = 'update_winners',
}

export enum RoomEvents {
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  UPDATE_ROOM = 'update_room',
}

export enum GameEvents {
  ADD_SHIPS = 'add_ships',
  CREATE_GAME = 'create_game',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'random_attack',
  TURN = 'turn',
  FINNISH = 'finish',
}

export enum InputEvents {
  REG = UsersEvents.REG,
  CREATE_ROOM = RoomEvents.CREATE_ROOM,
  ADD_USER_TO_ROOM = RoomEvents.ADD_USER_TO_ROOM,
  ADD_SHIPS = GameEvents.ADD_SHIPS,
  ATTACK = GameEvents.ATTACK,
  RANDOM_ATTACK = GameEvents.RANDOM_ATTACK,
}

export enum OutputEvents {
  REG = UsersEvents.REG,
  UPDATE_WINNERS = UsersEvents.UPDATE_WINNERS,
  CREATE_GAME = GameEvents.CREATE_GAME,
  START_GAME = GameEvents.START_GAME,
  UPDATE_ROOM = RoomEvents.UPDATE_ROOM,
  ATTACK = GameEvents.ATTACK,
  TURN = GameEvents.TURN,
  FINNISH = GameEvents.FINNISH,
}
