export type Phases = string;
export type Board = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;
export type Refinements = Record<string, Partial<Board>>;

export type Spec = {
  board: { phase: string } & Board;
  actions: Actions;
  options: Options;
};

export type CreateSpec<
  I extends {
    phases: string;
    board: { phase?: never } & Board;
    actions: Actions;
    options?: Options;
  }
> = {
  board: CreateBoards<I["phases"], I["board"]>;
  actions: I["actions"];
  options: Fill<I["options"], null>;
};

// Utils
type CreateBoards<
  Phase extends string,
  BaseBoard extends Board
> = Phase extends string ? { phase: Phase } & BaseBoard : never;
type Fill<Desired, Fallback> = undefined extends Desired ? Fallback : Desired;
