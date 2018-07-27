import { RPSOutput, RPSCountdownState, RPSAction } from '../typings';

export class LogOutput implements RPSOutput {
  init() {};
  cleanup() {};

  idle() {};

  gameStart() {};
  gameStop() {};

  countdown(state: RPSCountdownState) {}
  shoot(action: RPSAction) {}

  robotWin(robot: RPSAction, human: RPSAction) {}
  humanWin(robot: RPSAction, human: RPSAction) {}
  tie(action: RPSAction) {}

  score(robot: number, human: number) {}

  tryAgain() {}

  log(message: string) {
    console.log(message);
  }
}
