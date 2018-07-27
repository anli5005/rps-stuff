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

  getAction(): Promise<RPSAction> {
    return null;
  }
}

export interface RPSOutput {
  init(): Promise<void> | void;
  cleanup(): Promise<void> | void;

  idle(): void;

  gameStart(): Promise<void> | void;
  gameStop(): Promise<void> | void;

  countdown(state: RPSCountdownState): void;
  shoot(action: RPSAction): Promise<void> | void;

  robotWin(robot: RPSAction, human: RPSAction): Promise<void> | void;
  humanWin(robot: RPSAction, human: RPSAction): Promise<void> | void;
  tie(action: RPSAction): Promise<void> | void;

  score(robot: number, human: number): Promise<void> | void;

  tryAgain(): Promise<void> | void;

  log?(message: string): void;
}

export interface RPSStrategy {
  init(): void;
  cleanup(): void;
  decideMove(pastTurns: RPSTurn[]): RPSAction;
}
