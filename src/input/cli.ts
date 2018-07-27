import { RPSInput, RPSState, RPSAction } from '../typings';
import readline from 'readline';

export class CLIInput extends RPSInput {
  rl: readline.ReadLine;

  constructor(public input: NodeJS.ReadableStream, public output: NodeJS.WritableStream) {
    super();
  }

  handleLine(line: string) {
    if (this.state === RPSState.Idle) {
      this.emit("start");
    } else if (line === "yes") {
      this.emit("confirmation", true);
    } else if (line === "no") {
      this.emit("confirmation", false);
    } else if (this.state === RPSState.TryAgain) {
      console.log("Please say yes or no.");
    } else if (this.state === RPSState.Shoot) {
      switch (line.toLowerCase()) {
        case "rock":
          this.emit("move", RPSAction.Rock);
          break;
        case "paper":
          this.emit("move", RPSAction.Paper);
          break;
        case "scissors":
          this.emit("move", RPSAction.Scissors);
          break;
        default:
          this.emit("move", RPSAction.Invalid);
      }
    }
  }

  getAction(): Promise<RPSAction> {
    return this.promise("move");
  }

  init() {
    this.rl = readline.createInterface({input: this.input, output: this.output, terminal: false});
    this.rl.on("line", (line) => this.handleLine(line));
  }

}
