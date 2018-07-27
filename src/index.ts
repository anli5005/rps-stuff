import fs from 'fs';
import path from 'path';
import { RPSController } from './rps';

import { CLIInput } from './input/cli';
import { MacOSVoiceInput } from './input/macvoice';
import { LeapMotionInput } from './input/leap';
import { CLIOutput } from './output/cli';
import { LogOutput } from './output/log';
import { ArduinoOutput } from './output/arduino';
import { GoogleTTSOutput } from './output/gvoice';
import { RandomStrategy } from './strategy/random';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
let rps = new RPSController();

rps.addInput(new CLIInput(process.stdin, process.stdout));
rps.addInput(new MacOSVoiceInput());
rps.addInput(new LeapMotionInput());

rps.addOutput(new CLIOutput());
rps.addOutput(new GoogleTTSOutput("en-US-Wavenet-D"));
rps.addOutput(new LogOutput());
rps.addOutput(new ArduinoOutput(config.serial.port, config.serial.baudRate));

rps.strategy = new RandomStrategy();

rps.sayScore = true;

rps.start();
