import { RPSStrategy, RPSAction, RPSTurn } from '../typings';

export class RandomStrategy implements RPSStrategy {
  init() {}
  cleanup() {}
  decideMove(turns: RPSTurn[]): RPSAction {
    return Math.floor(Math.random() * 3) + 1;
  }
}
