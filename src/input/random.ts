import { RPSInput, RPSAction } from '../typings';

export class RandomInput extends RPSInput {
  getAction(): Promise<RPSAction> {
    return Promise.resolve(Math.floor(Math.random() * 3) + 1);
  }
}
