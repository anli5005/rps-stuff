import { RPSStrategy, RPSStrategyMove, RPSAction, RPSTurn } from '../typings';
import { wait } from '../rps';
import { RESTInput } from '../input/rest';
import { RandomStrategy } from './random';
import { EventEmitter } from 'events';

export interface CheatStrategyContext {
  isCheat: true;
  didGuess: boolean;
  guessedAction?: RPSAction;
}

export class NegativeStrategy extends EventEmitter implements RPSStrategy {
  constructor(public server: RESTInput) {
    super();
  }
  fallback = new RandomStrategy();
  timeout = 100;
  init() {
    this.fallback.init();
  }
  cleanup() {
    this.fallback.cleanup();
  }
  async decideMove(turns: RPSTurn[]): Promise<RPSStrategyMove<CheatStrategyContext>> {
    await wait(this.timeout);
    console.log("Deciding move now");
    switch (this.server.getBestGuess()) {
      case RPSAction.Rock:
        return {action: RPSAction.Scissors, data: {isCheat: true, didGuess: true, guessedAction: RPSAction.Rock}};
      case RPSAction.Paper:
        return {action: RPSAction.Rock, data: {isCheat: true, didGuess: true, guessedAction: RPSAction.Paper}};
      case RPSAction.Scissors:
        return {action: RPSAction.Paper, data: {isCheat: true, didGuess: true, guessedAction: RPSAction.Scissors}};
      default:
        return {action: this.fallback.decideMove(turns).action, data: {isCheat: true, didGuess: false}};
    }
  }
}
