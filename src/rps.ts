import { RPSInput, RPSOutput, RPSState, RPSCountdownState, RPSAction, RPSTurn, RPSOutcome, RPSStrategy, RPSStrategyMove } from './typings';
import { InvalidStrategy } from './strategy/invalid';

export function wait(ms: number) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  });
}

export class RPSController {
  inputs: RPSInput[] = [];
  outputs: RPSOutput[] = [];
  state: RPSState = RPSState.Idle;
  countdown: RPSCountdownState = null;
  robotAction: RPSAction = null;
  humanAction: RPSAction = null;

  robotScore: number = null;
  humanScore: number = null;
  pastTurns: RPSTurn[] = [];
  sayScore = false;
  strategy: RPSStrategy = new InvalidStrategy();

  doesSays = false;

  idleInterval = 60000;
  countdownInterval = 700;
  extraCountdownDelay = 225;
  shootDelay = 100;
  shootTime = 1000;
  playAgainTimeout = 10000;
  moveTimeout = 10000;

  private stopping = false;

  decideWinner(robot: RPSAction, human: RPSAction): RPSOutcome {
    if (robot === human) {
      return RPSOutcome.Tie;
    }

    switch (human) {
      case RPSAction.Invalid:
        return RPSOutcome.RobotWin;
      case RPSAction.Rock:
        return robot === RPSAction.Paper ? RPSOutcome.RobotWin : RPSOutcome.HumanWin;
      case RPSAction.Paper:
        return robot === RPSAction.Scissors ? RPSOutcome.RobotWin : RPSOutcome.HumanWin;
      case RPSAction.Scissors:
        return robot === RPSAction.Rock ? RPSOutcome.RobotWin : RPSOutcome.HumanWin;
    }
  }

  addInput(input: RPSInput) {
    this.inputs.push(input);
  }

  addOutput(output: RPSOutput) {
    this.outputs.push(output);
  }

  log(message: string) {
    this.outputs.forEach((output) => {
      if (output.log) {
        output.log(message);
      }
    });
  }

  setState(state: RPSState) {
    this.state = state;
    this.inputs.forEach((input) => {
      input.state = this.state;
      input.onChangeState(state);
    });
  }

  async doCountdown() {
    this.countdown = RPSCountdownState.Rock;
    let endState = this.doesSays ? RPSCountdownState.Shoot : RPSCountdownState.Says;
    await new Promise((res, rej) => {
      let interval: any;
      interval = setInterval(() => {
        if (this.countdown === endState) {
          clearInterval(interval);
          res();
        } else {
          this.outputs.forEach(output => output.countdown(this.countdown));
          this.countdown++;
        }
      }, this.countdownInterval);
    });
    await wait(this.extraCountdownDelay);
    await Promise.all(this.outputs.map(output => output.countdown(RPSCountdownState.Shoot)));
  }

  async start() {
    this.inputs.forEach(input => input.init(this));
    await Promise.all(this.outputs.map(output => output.init(this)));
    this.strategy.init();

    this.log("Starting game...");

    while (!this.stopping) {
      this.setState(RPSState.Idle);
      this.humanScore = 0;
      this.robotScore = 0;
      this.pastTurns = [];
      let interval: NodeJS.Timer;
      if (this.idleInterval) {
        interval = setInterval(() => {
          this.outputs.forEach(output => output.idle());
        }, this.idleInterval);
      }
      this.outputs.forEach(output => output.idle());
      await Promise.race(this.inputs.map(input => input.promise("start")));

      if (interval) {
        clearInterval(interval);
      }
      this.setState(RPSState.Starting);
      await Promise.all(this.outputs.map(output => output.gameStart()));

      while (this.state !== RPSState.Stopping) {
        this.setState(RPSState.InGame);
        await this.doCountdown();

        this.setState(RPSState.Shoot);
        let robotMove: RPSStrategyMove = {action: RPSAction.Invalid};
        this.robotAction = robotMove.action;
        this.humanAction = null;
        this.humanAction = (await Promise.all([
          Promise.race(
            this.inputs.map(input => {
              return input.getAction();
            }).filter(p => {
              return p;
            }).concat([(async (): Promise<RPSAction> => {
              await wait(this.moveTimeout);
              return RPSAction.Invalid;
            })()])
          ),
          (async () => {
            robotMove = (await Promise.all([
              this.strategy.decideMove(this.pastTurns),
              wait(this.shootDelay)
            ]))[0];
            await Promise.all(this.outputs.map(output => output.shoot(this.robotAction)));
          })()
        ]))[0] as RPSAction;
        this.robotAction = robotMove.action;
        this.setState(RPSState.Ending);

        await wait(this.shootTime);

        let outcome = this.decideWinner(this.robotAction, this.humanAction);
        this.pastTurns.push({robot: robotMove, human: this.humanAction, outcome});
        switch (outcome) {
          case RPSOutcome.RobotWin:
            this.robotScore++;
            await Promise.all(this.outputs.map(output => output.robotWin(this.robotAction, this.humanAction, robotMove.data)));
            break;
          case RPSOutcome.HumanWin:
            this.humanScore++;
            await Promise.all(this.outputs.map(output => output.humanWin(this.robotAction, this.humanAction, robotMove.data)));
            break;
          case RPSOutcome.Tie:
            await Promise.all(this.outputs.map(output => output.tie(this.robotAction, robotMove.data)));
            break;
        }
        if (this.sayScore) {
          await Promise.all(this.outputs.map(output => output.score(this.robotScore, this.humanScore)));
        }

        this.setState(RPSState.TryAgain);
        this.outputs.forEach(output => output.tryAgain());
        let tryAgain = await Promise.race([wait(this.playAgainTimeout), Promise.race(this.inputs.map(input => input.promise("confirmation")))]);
        if (!tryAgain) {
          this.setState(RPSState.Stopping);
          await Promise.all(this.outputs.map(output => output.gameStop()));
        }
      }
    }
  }

  cleanup() {
    this.inputs.forEach(input => input.cleanup());
    this.outputs.filter(output => output.cleanup).forEach(output => output.cleanup());
    this.strategy.cleanup();
  }
}
