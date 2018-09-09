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
import { CLIOutput } from './output/cli';
import { LogOutput } from './output/log';
import { ArduinoOutput } from './output/arduino';
import { GoogleTTSOutput } from './output/gvoice';
import { SayOutput } from './output/say';
import { GUIOutput } from './output/gui';
import { CheatStrategy } from './strategy/cheat';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
let rps = new RPSController();

let app = express();
app.use(json());

let server = new Server(app);

rps.addInput(new CLIInput(process.stdin, process.stdout));
rps.addInput(new MacOSVoiceInput());
let rest = new RESTInput(app);
rest.log = config.rest.log;
rps.addInput(rest);
rps.addInput(new GUIInput(app));

rps.addOutput(new CLIOutput());
// rps.addOutput(new GoogleTTSOutput("en-US-Wavenet-D"));
rps.addOutput(new LogOutput());
// rps.addOutput(new ArduinoOutput(config.serial.port, config.serial.baudRate));
rps.addOutput(new SayOutput());
rps.addOutput(new GUIOutput(server));

GUIInput.strategies.cheat = {shootDelay: 0, strategy: new CheatStrategy(rest)};

rps.sayScore = true;

server.listen(config.rest.port);
rps.start();
