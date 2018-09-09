import { RPSInput, RPSState } from '../typings';
import applescript from 'applescript';
import util from 'util';

export class MacOSVoiceInput extends RPSInput {
  startScript = `
  tell application "SpeechRecognitionServer"
  	listen for {"start", "yes", "sure"}
  end tell
  `;

  confirmScript = `
  tell application "SpeechRecognitionServer"
    return listen for {"yes", "sure", "of course", "no", "not right now", "not now"}
  end tell
  `

  yes: Record<string, true> = {yes: true, sure: true, "of course": true};

  onChangeState(state: RPSState) {
    if (state === RPSState.Idle) {
      util.promisify(applescript.execString)(this.startScript).then(() => {
        if (this.state === RPSState.Idle) {
          this.emit("start");
        }
      }).catch(console.log);
    } else if (state === RPSState.TryAgain) {
      util.promisify(applescript.execString)(this.confirmScript).then((ret) => {
        if (this.state === RPSState.TryAgain) {
          this.emit("confirmation", this.yes[ret]);
        }
      }).catch(console.log);
    }
  }

}
