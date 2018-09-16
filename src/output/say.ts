import { RPSOutput, RPSCountdownState, RPSAction } from '../typings';
import { RPSController } from '../rps';
import say from 'say';
import util from 'util';

export class SayOutput implements RPSOutput {
  constructor(public voiceName?: string, public speed?: number) {}

  speakText(text: string) {
    return new Promise<void>((res, rej) => {
      say.speak(text, this.voiceName, this.speed, (err) => {
        err ? rej(err) : res();
      });
    });
  }

  private rps: RPSController;
  init(rps: RPSController) {
    this.rps = rps;
  }
  cleanup() {}

  idle() {
    return this.speakText("Want to play Rock Paper Scissors?");
  }

  gameStart() {
    return this.speakText("Let's start!");
  }

  gameStop() {
    return this.speakText("Thanks for playing!");
  }

  countdown(state: RPSCountdownState) {
    switch (state) {
      case RPSCountdownState.Rock:
        return this.speakText("Rock!");
      case RPSCountdownState.Paper:
        return this.speakText("Paper!");
      case RPSCountdownState.Scissors:
        return this.speakText("Scissors!");
      case RPSCountdownState.Says:
        return this.speakText("Says...");
      case RPSCountdownState.Shoot:
        return this.speakText("Shoot!");
    }
  }

  shoot(action: RPSAction) {}

  actionToString(action: RPSAction) {
    switch (action) {
      case RPSAction.Invalid:
        return "something invalid";
      case RPSAction.Rock:
        return "Rock";
      case RPSAction.Paper:
        return "Paper";
      case RPSAction.Scissors:
        return "Scissors";
    }
  }

  robotWin(robot: RPSAction, human: RPSAction) {
    return this.speakText(`I chose ${this.actionToString(robot)}. You chose ${this.actionToString(human)}. I win.`);
  }
  humanWin(robot: RPSAction, human: RPSAction) {
    return this.speakText(`I chose ${this.actionToString(robot)}. You chose ${this.actionToString(human)}. I lost.`);
  }
  tie(action: RPSAction) {
    let str = this.actionToString(action);
    return this.speakText(`I chose ${str}. You also chose ${str}. It's a tie.`);
  }

  score(robot: number, human: number) {
    let statement = "It's a tie.";
    let isFinalTurn = this.rps.turnLimit && this.rps.pastTurns.length >= this.rps.turnLimit;
    if (robot > human) {
      statement = isFinalTurn ? "I won." : "I'm winning.";
    } else if (robot < human) {
      statement = isFinalTurn ? "I lost." : "You're winning.";
    }
    return this.speakText(`SCORE: ${robot}-${human}. ${statement}`);
  }

  tryAgain() {
    return this.speakText("Would you like to try again?");
  }
}
