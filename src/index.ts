import fs from 'fs';
import path from 'path';
import { RPSController } from './rps';

import { CLIInput } from './input/cli';
import { MacOSVoiceInput } from './input/macvoice';
import { LeapMotionInput } from './input/leap';
import { RESTInput } from './input/rest';
import { CLIOutput } from './output/cli';
import { LogOutput } from './output/log';
import { ArduinoOutput } from './output/arduino';
import { GoogleTTSOutput } from './output/gvoice';
import { SayOutput } from './output/say';
import { RandomStrategy } from './strategy/random';
import { CheatStrategy } from './strategy/cheat';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
let rps = new RPSController();

rps.addInput(new CLIInput(process.stdin, process.stdout));
// rps.addInput(new MacOSVoiceInput());
// rps.addInput(new LeapMotionInput());
let rest = new RESTInput(config.rest.port);
rest.log = config.rest.log;
rps.addInput(rest);

rps.addOutput(new CLIOutput());
// rps.addOutput(new GoogleTTSOutput("en-US-Wavenet-D"));
rps.addOutput(new LogOutput());
// rps.addOutput(new ArduinoOutput(config.serial.port, config.serial.baudRate));
rps.addOutput(new SayOutput());

let strategy = new CheatStrategy(rest);
rps.strategy = strategy;
rps.shootDelay = Math.max(0, rps.shootDelay - strategy.timeout);

rps.sayScore = true;
rps.idleInterval = 0;

rps.start();
