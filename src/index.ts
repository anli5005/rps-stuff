import fs from 'fs';
import path from 'path';
import { RPSController } from './rps';

/*import { CLIInput } from './input/cli';
import { CLIOutput } from './output/cli';
import { LogOutput } from './output.log';
import { RandomStrategy } from './strategy/random';*/

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
let rps = new RPSController();
/*rps.addInput(new CLIInput(process.stdin, process.stdout));
rps.addOutput(new CLIOutput());
rps.addOutput(new LogOutput());
rps.strategy = new RandomStrategy();

rps.start();*/
