export type RegisterInputData = {
  name: string;
  password: string;
};

export type RegisterOutputData = {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
};

export type UpdateWinnersOutputData = {
  name: string;
  wins: number;
}[];
