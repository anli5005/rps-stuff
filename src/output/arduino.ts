import { RPSOutput, RPSCountdownState, RPSAction } from '../typings';
import SerialPort from 'serialport';
import util from 'util';

enum ArduinoCommand {
  TurnWrist = 4
}

function delay(ms: number) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  });
}

export class ArduinoOutput implements RPSOutput {
  serial: SerialPort;

  constructor(
    public port: string,
    public baudRate: number
  ) {}

  send(command: number) {
    console.log(`Sending ${command}`);
    let commandArray = new Int8Array(1);
    commandArray[0] = command;
    this.serial.write(Buffer.from(commandArray.buffer));
  }

  async init() {
    this.serial = new SerialPort(this.port, {baudRate: this.baudRate});
    await delay(1000);
    this.send(RPSAction.Paper);
  }

  async cleanup() {
    await this.send(RPSAction.Paper);
    await util.promisify(this.serial.close)();
    this.serial = null;
  }

  idle() {
    this.send(ArduinoCommand.TurnWrist);
  }

  countdown(state: RPSCountdownState) {
    this.send(ArduinoCommand.TurnWrist);
  }

  shoot(action: RPSAction) {
    this.send(action);
  }

  gameStart() {
    this.send(RPSAction.Rock);
  }
  tryAgain() {
    this.send(RPSAction.Rock);
  }

  robotWin(robot: RPSAction, human: RPSAction) {}
  humanWin(robot: RPSAction, human: RPSAction) {}
  tie(action: RPSAction) {}
  score(robot: number, human: number) {}

  gameStop() {
    this.send(RPSAction.Paper);
  }
}
