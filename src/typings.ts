import { EventEmitter } from 'events';

export enum RPSState {
  Idle,
  Starting,
  InGame,
  Shoot,
  Ending,
  TryAgain,
  Stopping
}

export enum RPSCountdownState {
  Rock,
  Paper,
  Scissors,
  Says,
  Shoot
}

export enum RPSAction {
  // Bit 2: Rock, Bit 1: Paper, Bit 0: Scissors
  Rock = 1,
  Paper = 2,
  Scissors = 3,
  Invalid = 0
}

export enum RPSOutcome {
  RobotWin,
  HumanWin,
  Tie
}

export interface RPSTurn {
  robot: RPSAction;
  human: RPSAction;
  outcome: RPSOutcome;
}

export class PromiseEmitter extends EventEmitter {
  promise(event: string): Promise<any> {
    return new Promise((res, rej) => {
      this.once(event, res);
    });
  }
}

export class RPSInput extends PromiseEmitter {
  init() {}
  cleanup() {}

  state: RPSState;

  onChangeState(state: RPSState) {}

  getAction(): Promise<RPSAction> | null {
    return null;
  }
}

export interface RPSOutput {
  init(): void;
  cleanup(): void;

  idle(): void;

  gameStart(): Promise<void>;
  gameStop(): Promise<void>;

  countdown(state: RPSCountdownState): void;
  shoot(action: RPSAction): Promise<void>;

  robotWin(robot: RPSAction, human: RPSAction): Promise<void>;
  humanWin(robot: RPSAction, human: RPSAction): Promise<void>;
  tie(action: RPSAction): Promise<void>;

  score(robot: number, human: number): Promise<void>;

  tryAgain(): Promise<void>;

  log?(message: string): void;
}

export interface RPSStrategy {
  decideMove(pastTurns: RPSTurn[]): RPSAction;
}
