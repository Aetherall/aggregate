import { Projection } from "../../event-sourcing/projection";
import { Deposited, Withdrawn } from "../domain/account";

export class TotalProjection {
  total = 0;

  @Projection.on(Deposited)
  async onDeposit(event: Deposited) {
    this.total += event.amount.serialize();
  }

  @Projection.on(Withdrawn)
  async onWithdrawn(event: Withdrawn) {
    this.total -= event.amount.serialize();
  }

  getTotal() {
    return this.total;
  }
}
