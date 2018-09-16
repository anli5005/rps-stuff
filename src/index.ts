import fs from 'fs';
import { Server } from 'http';
import path from 'path';
import express from 'express';
import { json } from 'body-parser';
import { RPSController } from './rps';

import { CLIInput } from './input/cli';
import { MacOSVoiceInput } from './input/macvoice';
import { RESTInput } from './input/rest';
import { GUIInput } from './input/gui';
import { LeapMotionInput } from './input/leap';
import { RandomInput } from './input/random';
import { CLIOutput } from './output/cli';
import { LogOutput } from './output/log';
import { ArduinoOutput } from './output/arduino';
import { GoogleTTSOutput } from './output/gvoice';
import { SayOutput } from './output/say';
import { GUIOutput } from './output/gui';
import { ShootHTTPOutput, ShootHTTPOutputURLs } from './output/shoothttp';
import { CheatStrategy } from './strategy/cheat';

interface RPSInputConfig {
  cli?: boolean;
  rest?: {log: boolean} | false;
  gui?: boolean;
  macvoice?: boolean;
  leap?: boolean;
  random?: boolean;
}

interface RPSOutputConfig {
  arduino?: {port: string, baudRate: number} | false;
  cli?: boolean;
  gui?: boolean;
  gvoice?: {voice: string, cache: string} | false;
  say?: boolean;
  shoothttp?: ShootHTTPOutputURLs | false;
}

interface RPSRESTConfig {
  port: number;
}

interface RPSConfig {
  inputs: RPSInputConfig;
  outputs: RPSOutputConfig;
  rest?: RPSRESTConfig | false;
  sayScore: boolean;
  idleInterval: number;
  turnLimit: number;
  askToTryAgain: boolean;
  quitAfterFirstInvalid: boolean;
}

const config: RPSConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
let rps = new RPSController();
rps.addOutput(new LogOutput());

if (config.inputs.cli) {
  rps.addInput(new CLIInput(process.stdin, process.stdout));
}

if (config.inputs.macvoice) {
  rps.addInput(new MacOSVoiceInput());
}

if (config.inputs.leap) {
  rps.addInput(new LeapMotionInput());
}

if (config.inputs.random) {
  rps.addInput(new RandomInput());
}

if (config.outputs.cli) {
  rps.addOutput(new CLIOutput());
}

if (config.outputs.arduino) {
  rps.addOutput(new ArduinoOutput(config.outputs.arduino.port, config.outputs.arduino.baudRate));
}

if (config.outputs.gvoice) {
  rps.addOutput(new GoogleTTSOutput(config.outputs.gvoice.voice, config.outputs.gvoice.cache));
}

if (config.outputs.say) {
  rps.addOutput(new SayOutput());
}

if (config.outputs.shoothttp) {
  rps.addOutput(new ShootHTTPOutput(config.outputs.shoothttp));
}

if (config.rest) {
  let app = express();
  app.use(json());

  let server = new Server(app);

  if (config.inputs.gui) {
    rps.addInput(new GUIInput(app));
  }

  if (config.outputs.gui) {
    rps.addOutput(new GUIOutput(server));
  }

  if (config.inputs.rest) {
    let rest = new RESTInput(app);
    rest.log = config.inputs.rest.log;
    rps.addInput(rest);
    GUIInput.strategies.cheat = {shootDelay: 0, strategy: new CheatStrategy(rest)};
  }

  server.listen(config.rest.port);
}

rps.sayScore = config.sayScore;
rps.idleInterval = config.idleInterval;
rps.turnLimit = config.turnLimit;
rps.askToTryAgain = config.askToTryAgain;
rps.quitAfterFirstInvalid = config.quitAfterFirstInvalid;

rps.start();
