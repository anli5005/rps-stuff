import { RPSOutput, RPSCountdownState, RPSAction } from '../typings';
import { TextToSpeechClient, SynthesizeSpeechResponse } from '@google-cloud/text-to-speech';
import player from 'play-sound';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import util from 'util';

export class GoogleTTSOutput implements RPSOutput {
  speechDir: string;
  speechCache: {[index: string]: string};
  client: TextToSpeechClient;
  player: any = null;

  constructor(public voiceName: string) {}

  async speakText(text: string) {
    if (!this.speechCache[text]) {
      let result = await this.client.synthesizeSpeech({
        input: {text},
        voice: {languageCode: "en-US", name: this.voiceName},
        audioConfig: {audioEncoding: "MP3"}
      }) as SynthesizeSpeechResponse[];
      let filename = (await util.promisify(crypto.randomBytes)(6)).toString("base64").replace("/", "-") + ".mp3";
      await fs.promises.writeFile(path.join(this.speechDir, filename), result[0].audioContent, "binary");
      this.speechCache[text] = filename;
    }

    await util.promisify(this.player.play).call(this.player, path.join(this.speechDir, this.speechCache[text]), {});
  }

  async init() {
    this.speechDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "rps-thing-google-tts"));
    this.speechCache = {};
    this.client = new TextToSpeechClient();
    this.player = player({player: "mplayer"});
  }

  async cleanup() {
    this.client = null;
    this.speechCache = null;
    let files = await fs.promises.readdir(this.speechDir);
    await Promise.all(files.map(file => fs.promises.unlink(path.join(this.speechDir, file))));
    await fs.promises.rmdir(this.speechDir);
    this.speechDir = null;
  }

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
    }
  }

  shoot(action: RPSAction) {
    return this.speakText("Shoot!");
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
    if (robot > human) {
      statement = "I'm winning.";
    } else if (robot < human) {
      statement = "You're winning";
    }
    return this.speakText(`SCORE: ${robot}-${human}. ${statement}`);
  }

  tryAgain() {
    return this.speakText("Would you like to try again?");
  }
}
