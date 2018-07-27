import { RPSInput, RPSState } from '../typings';
import applescript from 'applescript';
import util from 'util';

export class MacOSVoiceInput extends RPSInput {
  startScript = `
  tell application "SpeechRecognitionServer"
  	listen for "start"
  end tell
  `;

  confirmScript = `
  tell application "SpeechRecognitionServer"
    return listen for {"yes", "no"}
  end tell
  `

  onChangeState(state: RPSState) {
    if (state === RPSState.Idle) {
      util.promisify(applescript.execString)(this.startScript).then(() => {
        if (this.state === RPSState.Idle) {
          this.emit("start");
        }
      });
    } else if (state === RPSState.TryAgain) {
      util.promisify(applescript.execString)(this.confirmScript).then((ret) => {
        if (this.state === RPSState.TryAgain) {
          this.emit("confirmation", ret == "yes");
        }
      });
    }
  }

}
