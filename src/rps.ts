import { RPSInput, RPSOutput, RPSState, RPSCountdownState, RPSAction, RPSTurn, RPSOutcome, RPSStrategy } from './typings';

function wait(ms: number) {
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
  strategy: RPSStrategy = null;

  doesSays = false;

  idleInterval = 10000;
  countdownInterval = 1000;
  shootTime = 1000;
  playAgainTimeout = 10000;

  private stopping = false;

  decideWinner(robot: RPSAction, human: RPSAction): RPSOutcome {
    if (robot === human) {
      return RPSOutcome.Tie;
    }

    switch (human) {
      case RPSAction.Invalid:
        return RPSOutcome.RobotWin;
      case RPSAction.Rock:
        return robot === RPSAction.Paper ? RPSOutcome.RobotWin : RPSOutcome.HumanWin
      case RPSAction.Paper:
        return robot === RPSAction.Scissors ? RPSOutcome.RobotWin : RPSOutcome.HumanWin
      case RPSAction.Scissors:
        return robot === RPSAction.Rock ? RPSOutcome.RobotWin : RPSOutcome.HumanWin
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
      input.state = state;
      input.onChangeState(state);
    });
  }

  doCountdown() {
    this.countdown = RPSCountdownState.Rock;
    let endState = this.doesSays ? RPSCountdownState.Shoot : RPSCountdownState.Says;
    return new Promise((res, rej) => {
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
    })
  }

  async start() {
    this.inputs.forEach(input => input.init());
    this.outputs.forEach(output => output.init());

    this.log("Starting game...");

    while (!this.stopping) {
      this.setState(RPSState.Idle);
      this.humanScore = 0;
      this.robotScore = 0;
      this.pastTurns = [];
      let interval = setInterval(() => {
        this.outputs.forEach(output => output.idle());
      }, this.idleInterval);
      await Promise.race(this.inputs.map(input => input.promise("start")));

      clearInterval(interval);
      this.setState(RPSState.Starting);
      await Promise.all(this.outputs.map(output => output.gameStart()));

      while (this.state !== RPSState.Stopping) {
        this.setState(RPSState.InGame);
        await this.doCountdown();

        this.setState(RPSState.Shoot);
        this.robotAction = this.strategy.decideMove(this.pastTurns);
        await Promise.all([async () => {
          this.humanAction = await Promise.race(this.inputs.map(input => input.getAction()).filter(p => p));
        }, Promise.all(this.outputs.map(output => output.shoot(this.robotAction)))]);
        await wait(this.shootTime);

        this.setState(RPSState.Ending);
        let outcome = this.decideWinner(this.robotAction, this.humanAction);
        this.pastTurns.push({robot: this.robotAction, human: this.humanAction, outcome});
        switch (outcome) {
          case RPSOutcome.RobotWin:
            this.robotScore++;
            await Promise.all(this.outputs.map(output => output.robotWin(this.robotAction, this.humanAction)));
            break;
          case RPSOutcome.HumanWin:
            this.humanScore++;
            await Promise.all(this.outputs.map(output => output.humanWin(this.robotAction, this.humanAction)));
            break;
          case RPSOutcome.Tie:
            await Promise.all(this.outputs.map(output => output.tie(this.robotAction)));
            break;
        }
        if (this.sayScore) {
          await Promise.all(this.outputs.map(output => output.score(this.robotScore, this.humanScore)));
        }

        this.setState(RPSState.TryAgain);
        await Promise.all(this.outputs.map(output => output.tryAgain()));
        let tryAgain = await Promise.race([wait(this.playAgainTimeout), Promise.race(this.inputs.map(input => input.promise("confirmation")))]);
        if (!tryAgain) {
          this.setState(RPSState.Stopping);
          await this.outputs.map(output => output.gameStop());
        }
      }
    }
  }

  cleanup() {
    this.inputs.forEach(input => input.cleanup());
    this.outputs.forEach(output => output.cleanup());
  }
}
