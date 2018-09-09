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
    this.io.close();
  };

  idle() {
    this.io.emit("idle");
  };

  gameStart() {
    this.io.emit("start");
  };
  gameStop() {
    this.io.emit("stop");
  };

  countdown(state: RPSCountdownState) {
    this.io.emit("countdown", state);
  }
  shoot(_action: RPSAction) {}

  robotWin(robot: RPSAction, human: RPSAction) {
    this.io.emit("score", {
      robot: {score: this.rps.robotScore, action: robot},
      human: {score: this.rps.humanScore, action: human},
      outcome: RPSOutcome.RobotWin
    });
  }
  humanWin(robot: RPSAction, human: RPSAction) {
    this.io.emit("score", {
      robot: {score: this.rps.robotScore, action: robot},
      human: {score: this.rps.humanScore, action: human},
      outcome: RPSOutcome.HumanWin
    });
  }
  tie(action: RPSAction) {
    this.io.emit("score", {
      robot: {score: this.rps.robotScore, action},
      human: {score: this.rps.humanScore, action},
      outcome: RPSOutcome.Tie
    });
  }

  score(_robot: number, _human: number) {}

  tryAgain() {
    this.io.emit("tryAgain");
  }
}
