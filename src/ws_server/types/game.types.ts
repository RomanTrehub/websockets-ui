export type CreateGameOutputData = {
  idGame: string;
  idPlayer: string;
};

export type ShipData = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type AttackUserOutputData = {
  status: GameAttackOutputData['status'];
  aroundRemovedCells: [number, number][];
  isGameFinished: boolean;
};

export type AddShipsInputData = {
  gameId: string;
  ships: ShipData[];
  indexPlayer: string;
};

export type StartGameOutputData = {
  ships: ShipData[];
  currentPlayerIndex: string;
};

export type GameAttackInputData = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};

export type GameAttackOutputData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: string;
  status: 'miss' | 'killed' | 'shot';
};

export type GameRandomAttackInputData = {
  gameId: string;
  indexPlayer: string;
};

export type GameTurnOutputData = {
  currentPlayer: string;
};

export type FinishGameOutputData = {
  winPlayer: string;
};
