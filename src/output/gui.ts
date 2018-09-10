import { RPSOutput, RPSCountdownState, RPSAction, RPSOutcome } from '../typings';
import { RPSController } from '../rps';
import { Server } from 'http';
import io from 'socket.io';

export class GUIOutput implements RPSOutput {
  rps: RPSController;
  io: io.Server;
  guiNamespace: io.Namespace;

  constructor(public server: Server) {}

  init(rps: RPSController) {
    this.rps = rps;
    this.io = io(this.server);
    this.guiNamespace = this.io.of("/gui");
  };
  cleanup() {
    console.log("Closing");
    this.io.close();
  };

  idle() {
    this.guiNamespace.emit("idle");
  };

  gameStart() {
    this.guiNamespace.emit("start");
  };
  gameStop() {
    this.guiNamespace.emit("stop");
  };

  countdown(state: RPSCountdownState) {
    this.guiNamespace.emit("countdown", state);
  }
  shoot(_action: RPSAction) {}

  robotWin(robot: RPSAction, human: RPSAction, context: any) {
    this.guiNamespace.emit("score", {
      robot: {score: this.rps.robotScore, action: robot},
      human: {score: this.rps.humanScore, action: human},
      outcome: RPSOutcome.RobotWin,
      context
    });
  }
  humanWin(robot: RPSAction, human: RPSAction, context: any) {
    this.guiNamespace.emit("score", {
      robot: {score: this.rps.robotScore, action: robot},
      human: {score: this.rps.humanScore, action: human},
      outcome: RPSOutcome.HumanWin,
      context
    });
  }
  tie(action: RPSAction, context: any) {
    this.guiNamespace.emit("score", {
      robot: {score: this.rps.robotScore, action},
      human: {score: this.rps.humanScore, action},
      outcome: RPSOutcome.Tie,
      context
    });
  }

  score(_robot: number, _human: number) {}

  tryAgain() {
    this.guiNamespace.emit("tryAgain");
  }
}
