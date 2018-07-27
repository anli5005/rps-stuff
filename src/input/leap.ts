import { RPSInput, RPSState, RPSAction } from '../typings';
import Leap from 'leapjs';

export class LeapMotionInput extends RPSInput {
  threshold = 60;
  invalidThreshold = 180;

  rockCount = 0;
  paperCount = 0;
  scissorsCount = 0;
  invalidCount = 0;
  didEmitEvent = false;

  init() {
    Leap.loop({background: true, loopWhileDisconnected: false}, (frame) => {
      if (this.state === RPSState.Shoot) {
        if (frame.hands.length === 1) {
          console.log(frame.fingers.map(finger => finger.touchZone));
          let minState = "none";
          if (frame.fingers.find(finger => finger.touchZone === "touching")) {
            minState = "hovering";
          }
          console.log(minState);
          let fingers = frame.fingers.filter(finger => finger.touchZone !== minState && finger.touchZone !== "none");
          if (fingers.length < 2) {
            this.rockCount++;
          } else if (fingers.length === 5) {
            this.paperCount++;
          } else {
            this.scissorsCount++;
          }
        } else {
          this.invalidCount++;
        }

        if (!this.didEmitEvent) {
          if (this.invalidCount > this.invalidThreshold) {
            this.emit("move", RPSAction.Invalid);
          } else if (this.rockCount > this.threshold) {
            this.emit("move", RPSAction.Rock);
          } else if (this.paperCount > this.threshold) {
            this.emit("move", RPSAction.Paper);
          } else if (this.scissorsCount > this.threshold) {
            this.emit("move", RPSAction.Scissors);
          }
        }
      }
    });
  }

  onChangeState(state: RPSState) {
    if (this.state !== RPSState.Shoot) {
      this.rockCount = 0;
      this.paperCount = 0;
      this.scissorsCount = 0;
      this.invalidCount = 0;
      this.didEmitEvent = false;
    }
  }

  async getAction() {
    let action = await this.promise("move");
    this.didEmitEvent = true;
    return action;
  }
}
