import { RPSStrategy, RPSStrategyMove, RPSAction, RPSTurn } from '../typings';

export interface InvalidStrategyContext {
  isInvalid: true;
}

export class InvalidStrategy implements RPSStrategy {
  init() {}
  cleanup() {}
  decideMove(_turns: RPSTurn[]): RPSStrategyMove<InvalidStrategyContext> {
    return {action: RPSAction.Invalid, data: {isInvalid: true}};
  }
}
