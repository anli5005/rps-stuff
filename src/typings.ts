import { EventEmitter } from 'events';
import { RPSController } from './rps';

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
  Rock = 0,
  Paper = 1,
  Scissors = 2,
  Says = 3,
  Shoot = 4
}

export enum RPSAction {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
  Invalid = 0
}

export enum RPSOutcome {
  RobotWin = 1,
  HumanWin = 2,
  Tie = 0
}

export interface RPSTurn {
  robot: RPSStrategyMove;
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
  init(rps?: RPSController) {}
  cleanup() {}

  state: RPSState;

  onChangeState(state: RPSState) {}

  getAction(): Promise<RPSAction> {
    return null;
  }
}

export interface RPSOutput {
  init(rps?: RPSController): Promise<void> | void;
  cleanup(): Promise<void> | void;

  idle(): void;

  gameStart(): Promise<void> | void;
  gameStop(): Promise<void> | void;

  countdown(state: RPSCountdownState): Promise<void> | void;
  shoot(action: RPSAction): Promise<void> | void;

  robotWin(robot: RPSAction, human: RPSAction, strategyData?: any): Promise<void> | void;
  humanWin(robot: RPSAction, human: RPSAction, strategyData?: any): Promise<void> | void;
  tie(action: RPSAction, strategyData?: any): Promise<void> | void;

  score(robot: number, human: number): Promise<void> | void;

  tryAgain(): Promise<void> | void;

  log?(message: string): void;
}

export interface RPSStrategyMove<T = any> {
  action: RPSAction;
  data?: T;
}

export interface RPSStrategy {
  init(): void;
  cleanup(): void;
  decideMove(pastTurns: RPSTurn[]): RPSStrategyMove | Promise<RPSStrategyMove>;
}
