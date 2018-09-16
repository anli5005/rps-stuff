import { RPSInput, RPSState, RPSStrategy } from '../typings';
import { Express } from 'express';
import { RPSController } from '../rps';
import { InvalidStrategy } from '../strategy/invalid';
import { RandomStrategy } from '../strategy/random';

export class GUIInput extends RPSInput {
  static strategies: Record<string, {shootDelay: number, strategy: RPSStrategy}> = {
    invalid: {strategy: new InvalidStrategy(), shootDelay: 200},
    random: {strategy: new RandomStrategy(), shootDelay: 0}
  };

  constructor(public app: Express) {
    super();
  }

  init(rps: RPSController) {
    this.app.post("/start", (req, res) => {
      if (this.state === RPSState.Idle) {
        if (req.body.strategy && !GUIInput.strategies[req.body.strategy]) {
          res.status(400).json({ok: false, error: "invalid_strategy"});
        } else {
          if (req.body.strategy) {
            let strategy = GUIInput.strategies[req.body.strategy];
            rps.shootDelay = strategy.shootDelay;
            rps.strategy = strategy.strategy;
          }
          this.emit("start");
          res.status(200).json({ok: true});
        }
      } else {
        res.status(400).json({ok: false, error: "not_ready"});
      }
    });

    this.app.post("/confirm", (req, res) => {
      this.emit("confirmation", !!req.body.result);
      res.status(200).json({ok: true});
    });

    this.app.post("/says", (req, res) => {
      rps.doesSays = !!req.body.doesSays;
      res.status(200).json({ok: true});
    });

    this.app.post("/stop", (_, res) => {
      if (this.state !== RPSState.Idle) {
        rps.stopCurrentGame();
        res.status(200).json({ok: true});
      } else {
        res.status(400).json({ok: false, error: "not_ready"});
      }
    });
  }
}
