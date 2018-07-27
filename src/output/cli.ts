import { RPSOutput, RPSCountdownState, RPSAction } from '../typings';

export class CLIOutput implements RPSOutput {
  init() {
    console.log("Initializing CLI output...");
  }

  cleanup() {
    console.log("Cleaning up CLI output...");
  }

  idle() {
    console.log("Would you like to play Rock Paper Scissors? [press RETURN]");
  }

  gameStart() {
    console.log("Let's start!");
  }

  gameStop() {
    console.log("Thanks for playing!");
  }

  countdown(state: RPSCountdownState) {
    switch (state) {
      case RPSCountdownState.Rock:
        console.log("Rock...");
        break;
      case RPSCountdownState.Paper:
        console.log("Paper...");
        break;
      case RPSCountdownState.Scissors:
        console.log("Scissors...");
        break;
      case RPSCountdownState.Says:
        console.log("Says...");
        break;
    }
  }

  shoot(action: RPSAction) {
    console.log("Shoot!");
  }

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
    console.log(`I chose ${this.actionToString(robot)}. You chose ${this.actionToString(human)}. I win.`);
  }
  humanWin(robot: RPSAction, human: RPSAction) {
    console.log(`I chose ${this.actionToString(robot)}. You chose ${this.actionToString(human)}. I lost.`);
  }
  tie(action: RPSAction) {
    let str = this.actionToString(action);
    console.log(`I chose ${str}. You also chose ${str}. It's a tie.`);
  }

  score(robot: number, human: number) {
    let statement = "It's a tie.";
    if (robot > human) {
      statement = "I'm winning.";
    } else if (robot < human) {
      statement = "You're winning";
    }
    console.log(`SCORE: ${robot}-${human}. ${statement}`);
  }

  tryAgain() {
    console.log("Would you like to try again? [yes/no]");
  }
}
