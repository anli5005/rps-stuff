import { RPSStrategy, RPSStrategyMove, RPSTurn } from '../typings';

export class RandomStrategy implements RPSStrategy {
  init() {}
  cleanup() {}
  decideMove(turns: RPSTurn[]): RPSStrategyMove<void> {
    return {action: Math.floor(Math.random() * 3) + 1};
  }
}
